import { z } from "zod";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../init";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
import { payouts } from "@/server/db/schema/payouts";
import {
  createTransferRecipient,
  generatePaystackReference,
  initiateTransfer,
  listBanks,
  resolveAccountNumber,
  type PaystackBank,
} from "@/server/paystack/client";

const BANKS_TTL_MS = 24 * 60 * 60 * 1000;
const MIN_PAYOUT_KOBO = 50000; // ₦500
const MAX_PAYOUT_KOBO = 500_000_00; // ₦5,000,000 per request

let banksCache: { data: PaystackBank[]; expiresAt: number } | null = null;

async function getCachedBanks() {
  const now = Date.now();
  if (banksCache && banksCache.expiresAt > now) return banksCache.data;
  const data = await listBanks("nigeria");
  banksCache = { data, expiresAt: now + BANKS_TTL_MS };
  return data;
}

export const payoutsRouter = router({
  /**
   * Cached for 24h since the bank list rarely changes.
   */
  listBanks: publicProcedure.query(async () => {
    try {
      const banks = await getCachedBanks();
      return banks.filter((b) => b.active).map((b) => ({
        code: b.code,
        name: b.name,
        type: b.type,
      }));
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          err instanceof Error
            ? err.message
            : "Couldn't fetch banks from Paystack.",
      });
    }
  }),

  /**
   * Name enquiry — confirms the account number belongs to the named holder.
   */
  resolveAccount: protectedProcedure
    .input(
      z.object({
        bankCode: z.string().min(1),
        accountNumber: z.string().regex(/^\d{10}$/, "10 digits exactly"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await resolveAccountNumber(
          input.accountNumber,
          input.bankCode,
        );
        return {
          accountName: result.account_name,
          accountNumber: result.account_number,
        };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't resolve the account. Double-check the number.",
        });
      }
    }),

  /**
   * Save the bank account on the creator profile. Also creates a Paystack
   * transfer_recipient so subsequent transfers can target it.
   */
  setBankAccount: protectedProcedure
    .input(
      z.object({
        bankCode: z.string().min(1),
        accountNumber: z.string().regex(/^\d{10}$/),
        accountName: z.string().min(1).max(120),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, ctx.user.id),
      });
      if (!profile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Set up your creator profile first.",
        });
      }

      let recipientCode: string;
      try {
        const recipient = await createTransferRecipient({
          name: input.accountName,
          accountNumber: input.accountNumber,
          bankCode: input.bankCode,
        });
        recipientCode = recipient.recipient_code;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Paystack rejected the transfer recipient.",
        });
      }

      const [updated] = await ctx.db
        .update(creatorProfiles)
        .set({
          payoutBankCode: input.bankCode,
          payoutAccountNumber: input.accountNumber,
          payoutAccountName: input.accountName,
          payoutRecipientCode: recipientCode,
          bankVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, ctx.user.id))
        .returning();
      return {
        bankCode: updated.payoutBankCode,
        accountNumber: updated.payoutAccountNumber,
        accountName: updated.payoutAccountName,
        verifiedAt: updated.bankVerifiedAt,
      };
    }),

  /**
   * Balance + bank account in one shot for the payouts page.
   */
  getOverview: protectedProcedure.query(async ({ ctx }) => {
    const wallet = await ctx.db.query.walletBalances.findFirst({
      where: eq(walletBalances.creatorUserId, ctx.user.id),
    });
    const profile = await ctx.db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, ctx.user.id),
      columns: {
        payoutBankCode: true,
        payoutAccountNumber: true,
        payoutAccountName: true,
        payoutRecipientCode: true,
        bankVerifiedAt: true,
      },
    });
    return {
      availableKobo: wallet?.availableKobo ?? 0,
      pendingKobo: wallet?.pendingKobo ?? 0,
      lifetimeKobo: wallet?.lifetimeKobo ?? 0,
      bank: profile?.payoutRecipientCode
        ? {
            code: profile.payoutBankCode!,
            accountNumber: profile.payoutAccountNumber!,
            accountName: profile.payoutAccountName!,
            verifiedAt: profile.bankVerifiedAt,
          }
        : null,
    };
  }),

  /**
   * Atomic request: decrement availableKobo IFF it's >= amount, insert a
   * payouts row, call Paystack initiateTransfer. If the Paystack call
   * fails, refund the balance immediately.
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amountKobo: z
          .number()
          .int()
          .min(MIN_PAYOUT_KOBO)
          .max(MAX_PAYOUT_KOBO),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, ctx.user.id),
        columns: {
          payoutRecipientCode: true,
          payoutAccountName: true,
        },
      });
      if (!profile?.payoutRecipientCode) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Add a bank account before requesting a payout.",
        });
      }

      // Atomic balance decrement — only succeeds if available >= amount
      const [decremented] = await ctx.db
        .update(walletBalances)
        .set({
          availableKobo: sql`${walletBalances.availableKobo} - ${input.amountKobo}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(walletBalances.creatorUserId, ctx.user.id),
            gte(walletBalances.availableKobo, input.amountKobo),
          ),
        )
        .returning();

      if (!decremented) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Insufficient available balance.",
        });
      }

      const reference = generatePaystackReference();

      const [payoutRow] = await ctx.db
        .insert(payouts)
        .values({
          creatorUserId: ctx.user.id,
          amountKobo: input.amountKobo,
          paystackReference: reference,
          status: "requested",
        })
        .returning();

      // Simulate mode — for demos + investor previews. When the real
      // Paystack Transfer API can't run (Paystack accounts without business
      // KYC return 403 here), this short-circuits to a success state with
      // an identifiable transfer code prefix so admins can still tell
      // simulated payouts apart in /admin/payouts.
      if (process.env.PAYOUTS_SIMULATE === "true") {
        const [simulated] = await ctx.db
          .update(payouts)
          .set({
            paystackTransferCode: `TRF_simulated_${reference}`,
            status: "success",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(payouts.id, payoutRow.id))
          .returning();
        return simulated;
      }

      try {
        const transfer = await initiateTransfer({
          amountKobo: input.amountKobo,
          recipientCode: profile.payoutRecipientCode,
          reference,
          reason: `Payout to ${profile.payoutAccountName ?? "creator"}`,
        });

        const [updated] = await ctx.db
          .update(payouts)
          .set({
            paystackTransferCode: transfer.transfer_code,
            status: "processing",
            updatedAt: new Date(),
          })
          .where(eq(payouts.id, payoutRow.id))
          .returning();

        return updated;
      } catch (err) {
        // Refund the balance + mark payout failed
        await ctx.db
          .update(walletBalances)
          .set({
            availableKobo: sql`${walletBalances.availableKobo} + ${input.amountKobo}`,
            updatedAt: new Date(),
          })
          .where(eq(walletBalances.creatorUserId, ctx.user.id));

        await ctx.db
          .update(payouts)
          .set({
            status: "failed",
            failureReason:
              err instanceof Error
                ? err.message
                : "Paystack rejected the transfer.",
            updatedAt: new Date(),
          })
          .where(eq(payouts.id, payoutRow.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Paystack rejected the transfer.",
        });
      }
    }),

  listPayouts: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          id: payouts.id,
          amountKobo: payouts.amountKobo,
          feeKobo: payouts.feeKobo,
          status: payouts.status,
          failureReason: payouts.failureReason,
          paystackTransferCode: payouts.paystackTransferCode,
          paystackReference: payouts.paystackReference,
          requestedAt: payouts.requestedAt,
          completedAt: payouts.completedAt,
        })
        .from(payouts)
        .where(eq(payouts.creatorUserId, ctx.user.id))
        .orderBy(desc(payouts.requestedAt))
        .limit(input?.limit ?? 50);
    }),
});
