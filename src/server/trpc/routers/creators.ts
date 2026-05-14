import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../init";
import { users } from "@/server/db/schema/users";
import {
  creatorProfiles,
  walletBalances,
} from "@/server/db/schema/creators";

const upsertInput = z.object({
  displayName: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
  coverUrl: z.string().url().max(500).optional().or(z.literal("")),
  accentColor: z.enum(["terracotta", "ochre", "green", "clay"]).optional(),
  kunuPriceKobo: z.number().int().min(10000).max(100_000_00).optional(),
  kunuLabel: z.string().trim().min(1).max(20).optional(),
  kunuEmoji: z.string().trim().min(1).max(8).optional(),
});

export const creatorsRouter = router({
  publicByUsername: publicProcedure
    .input(z.object({ username: z.string().trim().toLowerCase() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: {
          id: true,
          name: true,
          username: true,
          image: true,
          avatarUrl: true,
        },
      });
      if (!user) return null;

      const profile = await ctx.db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, user.id),
      });

      if (!profile || !profile.isPublished) {
        return { user, profile: null as null };
      }

      return { user, profile };
    }),

  myProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, ctx.user.id),
    });
    return profile ?? null;
  }),

  upsertProfile: protectedProcedure
    .input(upsertInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user.username) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Claim your handle before creating a creator profile.",
        });
      }

      // Normalize empty strings to null
      const norm = {
        ...input,
        tagline: input.tagline || null,
        bio: input.bio || null,
        avatarUrl: input.avatarUrl || null,
        coverUrl: input.coverUrl || null,
      };

      const [saved] = await ctx.db
        .insert(creatorProfiles)
        .values({
          userId: ctx.user.id,
          displayName: norm.displayName,
          tagline: norm.tagline ?? undefined,
          bio: norm.bio ?? undefined,
          avatarUrl: norm.avatarUrl ?? undefined,
          coverUrl: norm.coverUrl ?? undefined,
          accentColor: norm.accentColor ?? "terracotta",
          kunuPriceKobo: norm.kunuPriceKobo ?? 50000,
          kunuLabel: norm.kunuLabel ?? "kunu",
          kunuEmoji: norm.kunuEmoji ?? "🥤",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: creatorProfiles.userId,
          set: {
            displayName: norm.displayName,
            tagline: norm.tagline,
            bio: norm.bio,
            avatarUrl: norm.avatarUrl,
            coverUrl: norm.coverUrl,
            ...(norm.accentColor ? { accentColor: norm.accentColor } : {}),
            ...(norm.kunuPriceKobo
              ? { kunuPriceKobo: norm.kunuPriceKobo }
              : {}),
            ...(norm.kunuLabel ? { kunuLabel: norm.kunuLabel } : {}),
            ...(norm.kunuEmoji ? { kunuEmoji: norm.kunuEmoji } : {}),
            updatedAt: new Date(),
          },
        })
        .returning();

      // Ensure wallet balance row exists
      await ctx.db
        .insert(walletBalances)
        .values({ creatorUserId: ctx.user.id })
        .onConflictDoNothing();

      return saved;
    }),

  updateKunuPrice: protectedProcedure
    .input(
      z.object({
        kunuPriceKobo: z.number().int().min(10000).max(100_000_00),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(creatorProfiles)
        .set({
          kunuPriceKobo: input.kunuPriceKobo,
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.userId, ctx.user.id))
        .returning();
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Set up your creator profile first.",
        });
      }
      return updated;
    }),

  publish: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.username) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Claim your handle before publishing.",
      });
    }
    const profile = await ctx.db.query.creatorProfiles.findFirst({
      where: eq(creatorProfiles.userId, ctx.user.id),
    });
    if (!profile) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Set up your profile first.",
      });
    }
    const [published] = await ctx.db
      .update(creatorProfiles)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(creatorProfiles.userId, ctx.user.id))
      .returning();

    // Mark user as a creator so dashboard knows
    await ctx.db
      .update(users)
      .set({ isCreator: true, updatedAt: new Date() })
      .where(eq(users.id, ctx.user.id));

    return published;
  }),
});
