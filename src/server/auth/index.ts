import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import {
  users,
  sessions,
  accounts,
  verifications,
} from "@/server/db/schema/users";

const hasGoogle =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: hasGoogle
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : {},
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: true,
      },
      isCreator: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
      avatarUrl: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
export type SessionData = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
