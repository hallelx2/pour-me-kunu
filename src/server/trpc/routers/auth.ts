import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../init";
import { users } from "@/server/db/schema/users";
import {
  validateUsernameFormat,
  USERNAME_MIN,
  USERNAME_MAX,
} from "@/lib/reserved-usernames";

const usernameInputSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN)
    .max(USERNAME_MAX)
    .transform((v) => v.trim().toLowerCase()),
});

export const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.session.user;
  }),

  checkUsername: publicProcedure
    .input(usernameInputSchema)
    .query(async ({ ctx, input }) => {
      const format = validateUsernameFormat(input.username);
      if (!format.ok) {
        return { available: false, reason: format.reason };
      }

      const existing = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: { id: true },
      });

      if (existing) {
        return { available: false, reason: "Already taken." };
      }
      return { available: true };
    }),

  claimUsername: protectedProcedure
    .input(usernameInputSchema)
    .mutation(async ({ ctx, input }) => {
      const format = validateUsernameFormat(input.username);
      if (!format.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: format.reason ?? "Invalid username.",
        });
      }

      const existing = await ctx.db.query.users.findFirst({
        where: eq(sql`lower(${users.username})`, input.username),
        columns: { id: true },
      });

      if (existing && existing.id !== ctx.user.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That handle was just taken.",
        });
      }

      const [updated] = await ctx.db
        .update(users)
        .set({ username: input.username, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updated;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        bio: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning();
      return updated;
    }),
});
