import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../init";
import { users } from "@/server/db/schema/users";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
import { tips } from "@/server/db/schema/tips";
import {
  generatePaystackReference,
  initializeTransaction,
} from "@/server/paystack/client";
import { enforceRateLimit } from "@/server/rate-limit";

const PLATFORM_FEE_RATE = 0.05; // 5%

const initiateInput = z.object({
  username: z.string().trim().toLowerCase(),
  kunuCount: z.number().int().min(1).max(99),
  supporterEmail: z.string().email().max(254),
  supporterName: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().max(140).optional().or(z.literal("")),
  isPublic: z.boolean().default(true),
});

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export const tipsRouter = router({
  /**
   * Create a pending tip + initialize a Paystack transaction.
   * Returns the authorization_url so the browser can redirect to Paystack.
   */
  initiate: publicProcedure
    .input(initiateInput)
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.req, "tips.initiate");

      const creator = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: { id: true, username: true },
      });
      if (!creator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No such creator.",
        });
      }

      const profile = await ctx.db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, creator.id),
      });
      if (!profile || !profile.isPublished) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This creator hasn't published their page yet.",
        });
      }

      const amountKobo = input.kunuCount * profile.kunuPriceKobo;
      const feeKobo = Math.floor(amountKobo * PLATFORM_FEE_RATE);
      const netKobo = amountKobo - feeKobo;
      const reference = generatePaystackReference();
      const supporterUserId = ctx.session?.user?.id ?? null;
      const supporterEmail = input.supporterEmail.toLowerCase().trim();

      // Insert the pending tip first so we have a stable id to put in metadata.
      const [tip] = await ctx.db
        .insert(tips)
        .values({
          creatorUserId: creator.id,
          supporterUserId,
          supporterName: input.supporterName?.trim() || null,
          supporterEmail,
          kunuCount: input.kunuCount,
          amountKobo,
          feeKobo,
          netKobo,
          message: input.message?.trim() || null,
          isPublic: input.isPublic,
          paystackReference: reference,
          status: "pending",
        })
        .returning();

      try {
        const init = await initializeTransaction({
          email: supporterEmail,
          amountKobo,
          reference,
          callback_url: `${appUrl()}/checkout/callback?reference=${reference}`,
          metadata: {
            tipId: tip.id,
            creatorUsername: creator.username,
            creatorUserId: creator.id,
            kunuCount: input.kunuCount,
          },
        });
        return {
          authorization_url: init.authorization_url,
          reference,
        };
      } catch (err) {
        // Roll back the pending row so we don't litter the DB with orphans
        await ctx.db.delete(tips).where(eq(tips.id, tip.id));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't start the Paystack transaction.",
        });
      }
    }),

  /**
   * Paid + public tips for a creator's supporter wall, newest first.
   * Public — never returns supporter email.
   */
  listForCreator: publicProcedure
    .input(
      z.object({
        username: z.string().trim().toLowerCase(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const creator = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: { id: true },
      });
      if (!creator) return [];

      const rows = await ctx.db
        .select({
          id: tips.id,
          supporterName: tips.supporterName,
          kunuCount: tips.kunuCount,
          amountKobo: tips.amountKobo,
          message: tips.message,
          paidAt: tips.paidAt,
        })
        .from(tips)
        .where(
          and(
            eq(tips.creatorUserId, creator.id),
            eq(tips.status, "paid"),
            eq(tips.isPublic, true),
          ),
        )
        .orderBy(desc(tips.paidAt))
        .limit(input.limit);

      return rows;
    }),

  /**
   * Dashboard summary for the currently signed-in creator.
   */
  summaryForMe: protectedProcedure.query(async ({ ctx }) => {
    const wallet = await ctx.db.query.walletBalances.findFirst({
      where: eq(walletBalances.creatorUserId, ctx.user.id),
    });

    const [counts] = await ctx.db
      .select({
        totalKunus: sql<number>`coalesce(sum(${tips.kunuCount}), 0)`.mapWith(Number),
        supporters: sql<number>`count(distinct ${tips.supporterEmail})`.mapWith(Number),
        tipCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(tips)
      .where(and(eq(tips.creatorUserId, ctx.user.id), eq(tips.status, "paid")));

    return {
      availableKobo: wallet?.availableKobo ?? 0,
      pendingKobo: wallet?.pendingKobo ?? 0,
      lifetimeKobo: wallet?.lifetimeKobo ?? 0,
      totalKunus: counts?.totalKunus ?? 0,
      supporters: counts?.supporters ?? 0,
      tipCount: counts?.tipCount ?? 0,
    };
  }),

  /**
   * Toggle the public/private flag for a tip you received.
   */
  togglePublic: protectedProcedure
    .input(z.object({ tipId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tip = await ctx.db.query.tips.findFirst({
        where: eq(tips.id, input.tipId),
      });
      if (!tip || tip.creatorUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [updated] = await ctx.db
        .update(tips)
        .set({ isPublic: !tip.isPublic, updatedAt: new Date() })
        .where(eq(tips.id, input.tipId))
        .returning();
      return updated;
    }),
});
