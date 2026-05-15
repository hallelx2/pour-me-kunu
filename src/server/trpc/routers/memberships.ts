import { z } from "zod";
import { and, asc, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../init";
import { users } from "@/server/db/schema/users";
import { creatorProfiles } from "@/server/db/schema/creators";
import {
  membershipTiers,
  subscriptions,
} from "@/server/db/schema/memberships";
import {
  createPlan,
  disableSubscription,
  generatePaystackReference,
  initializeTransaction,
} from "@/server/paystack/client";
import { enforceRateLimit } from "@/server/rate-limit";

const tierInput = z.object({
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  priceKobo: z.number().int().min(50000).max(50_000_00), // ₦500 - ₦5,000,000
  interval: z.enum(["monthly", "annually"]),
  perks: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
});

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export const membershipsRouter = router({
  /**
   * Tiers for the currently signed-in creator (all states).
   */
  listMyTiers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.membershipTiers.findMany({
      where: eq(membershipTiers.creatorUserId, ctx.user.id),
      orderBy: [desc(membershipTiers.isActive), asc(membershipTiers.priceKobo)],
    });
  }),

  /**
   * Active tiers for a creator's public page.
   */
  listForCreator: publicProcedure
    .input(z.object({ username: z.string().trim().toLowerCase() }))
    .query(async ({ ctx, input }) => {
      const creator = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: { id: true },
      });
      if (!creator) return [];

      return ctx.db.query.membershipTiers.findMany({
        where: and(
          eq(membershipTiers.creatorUserId, creator.id),
          eq(membershipTiers.isActive, true),
        ),
        orderBy: asc(membershipTiers.priceKobo),
      });
    }),

  /**
   * Create a tier locally + provision a matching Paystack plan in one go.
   * Plan creation runs first; if Paystack rejects (e.g. no API key), nothing
   * lands in our DB.
   */
  createTier: protectedProcedure
    .input(tierInput)
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, ctx.user.id),
      });
      if (!profile) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Set up your creator profile before adding tiers.",
        });
      }

      // 1. Provision Paystack plan first
      let planCode: string;
      try {
        const plan = await createPlan({
          name: `${input.name} — @${ctx.user.username ?? ctx.user.id.slice(0, 8)}`,
          amountKobo: input.priceKobo,
          interval: input.interval,
          description: input.description?.trim() || undefined,
        });
        planCode = plan.plan_code;
      } catch (err) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? `Couldn't create Paystack plan: ${err.message}`
              : "Couldn't create Paystack plan.",
        });
      }

      // 2. Save the tier
      const [tier] = await ctx.db
        .insert(membershipTiers)
        .values({
          creatorUserId: ctx.user.id,
          name: input.name,
          description: input.description?.trim() || null,
          priceKobo: input.priceKobo,
          interval: input.interval,
          perks: input.perks?.filter(Boolean) ?? null,
          paystackPlanCode: planCode,
          isActive: true,
        })
        .returning();

      return tier;
    }),

  /**
   * Edit name/description/perks/active flag. Paystack plans are immutable for
   * price + interval — changing those means archive + create a new tier.
   */
  updateTier: protectedProcedure
    .input(
      z.object({
        tierId: z.string(),
        name: z.string().trim().min(1).max(60).optional(),
        description: z.string().trim().max(500).optional().or(z.literal("")),
        perks: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tier = await ctx.db.query.membershipTiers.findFirst({
        where: eq(membershipTiers.id, input.tierId),
      });
      if (!tier || tier.creatorUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [updated] = await ctx.db
        .update(membershipTiers)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined
            ? { description: input.description.trim() || null }
            : {}),
          ...(input.perks !== undefined ? { perks: input.perks.filter(Boolean) } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
          updatedAt: new Date(),
        })
        .where(eq(membershipTiers.id, input.tierId))
        .returning();
      return updated;
    }),

  archiveTier: protectedProcedure
    .input(z.object({ tierId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tier = await ctx.db.query.membershipTiers.findFirst({
        where: eq(membershipTiers.id, input.tierId),
      });
      if (!tier || tier.creatorUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [updated] = await ctx.db
        .update(membershipTiers)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(membershipTiers.id, input.tierId))
        .returning();
      return updated;
    }),

  /**
   * Supporter subscribes to a tier. Creates a pending subscription row +
   * initializes a Paystack transaction with the plan code. The first
   * `charge.success` + `subscription.create` webhook events finalize it.
   */
  subscribe: publicProcedure
    .input(
      z.object({
        tierId: z.string(),
        supporterEmail: z.string().email().max(254),
        supporterName: z.string().trim().max(60).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      enforceRateLimit(ctx.req, "memberships.subscribe");

      const tier = await ctx.db.query.membershipTiers.findFirst({
        where: eq(membershipTiers.id, input.tierId),
      });
      if (!tier || !tier.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tier unavailable." });
      }
      if (!tier.paystackPlanCode) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "This tier isn't ready to accept subscriptions yet. The creator needs to re-save it.",
        });
      }

      const supporterEmail = input.supporterEmail.toLowerCase().trim();
      const reference = generatePaystackReference();
      const supporterUserId = ctx.session?.user?.id ?? null;

      // Insert pending subscription. The webhook will fill paystack codes later.
      const [sub] = await ctx.db
        .insert(subscriptions)
        .values({
          creatorUserId: tier.creatorUserId,
          supporterUserId,
          supporterEmail,
          tierId: tier.id,
          // status defaults to 'active' but paystackSubscriptionCode stays
          // null until subscription.create fires. Queries gate on the code
          // being present, so this row is effectively pending until then.
        })
        .returning();

      try {
        const init = await initializeTransaction({
          email: supporterEmail,
          amountKobo: tier.priceKobo,
          reference,
          plan: tier.paystackPlanCode,
          callback_url: `${appUrl()}/checkout/callback?reference=${reference}`,
          metadata: {
            subscriptionId: sub.id,
            tierId: tier.id,
            creatorUserId: tier.creatorUserId,
            supporterName: input.supporterName?.trim() || null,
            kind: "subscription",
          },
        });
        return {
          authorization_url: init.authorization_url,
          reference,
        };
      } catch (err) {
        await ctx.db.delete(subscriptions).where(eq(subscriptions.id, sub.id));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Couldn't start the subscription transaction.",
        });
      }
    }),

  /**
   * Active subscriptions the signed-in user has across all creators.
   */
  myActiveSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        startedAt: subscriptions.startedAt,
        tier: {
          id: membershipTiers.id,
          name: membershipTiers.name,
          priceKobo: membershipTiers.priceKobo,
          interval: membershipTiers.interval,
        },
        creator: { id: users.id, username: users.username, name: users.name },
      })
      .from(subscriptions)
      .innerJoin(membershipTiers, eq(subscriptions.tierId, membershipTiers.id))
      .innerJoin(users, eq(subscriptions.creatorUserId, users.id))
      .where(
        and(
          eq(subscriptions.supporterUserId, ctx.user.id),
          isNotNull(subscriptions.paystackSubscriptionCode),
          inArray(subscriptions.status, ["active", "non-renewing", "attention"]),
        ),
      )
      .orderBy(desc(subscriptions.startedAt));
  }),

  /**
   * Cancel a subscription you own (supporter side). Requires the email token
   * that arrived on subscription.create. Without it, Paystack rejects cancel.
   */
  cancelSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await ctx.db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, input.subscriptionId),
      });
      if (!sub || sub.supporterUserId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!sub.paystackSubscriptionCode || !sub.paystackEmailToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Cancellation isn't available yet. Try again once the subscription is fully active.",
        });
      }

      await disableSubscription(sub.paystackSubscriptionCode, sub.paystackEmailToken);

      const [updated] = await ctx.db
        .update(subscriptions)
        .set({ status: "non-renewing", updatedAt: new Date() })
        .where(eq(subscriptions.id, sub.id))
        .returning();
      return updated;
    }),

  /**
   * Aggregate of active subscribers for the creator's dashboard.
   */
  summaryForMe: protectedProcedure.query(async ({ ctx }) => {
    const [row] = await ctx.db
      .select({
        activeSubscribers: sql<number>`count(*) filter (where ${subscriptions.status} = 'active' and ${subscriptions.paystackSubscriptionCode} is not null)`.mapWith(Number),
        totalSubscribers: sql<number>`count(distinct ${subscriptions.supporterEmail}) filter (where ${subscriptions.paystackSubscriptionCode} is not null)`.mapWith(Number),
      })
      .from(subscriptions)
      .where(eq(subscriptions.creatorUserId, ctx.user.id));
    return {
      activeSubscribers: row?.activeSubscribers ?? 0,
      totalSubscribers: row?.totalSubscribers ?? 0,
    };
  }),
});
