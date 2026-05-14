import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const creatorProfiles = pgTable("creator_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  tagline: text("tagline"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  accentColor: text("accent_color").notNull().default("terracotta"),

  // The tip unit
  kunuPriceKobo: integer("kunu_price_kobo").notNull().default(50000),
  kunuLabel: text("kunu_label").notNull().default("kunu"),
  kunuEmoji: text("kunu_emoji").notNull().default("🥤"),

  isPublished: boolean("is_published").notNull().default(false),

  // Payout (Paystack)
  payoutBankCode: text("payout_bank_code"),
  payoutAccountNumber: text("payout_account_number"),
  payoutAccountName: text("payout_account_name"),
  payoutRecipientCode: text("payout_recipient_code"),
  bankVerifiedAt: timestamp("bank_verified_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletBalances = pgTable("wallet_balance", {
  creatorUserId: text("creator_user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  availableKobo: integer("available_kobo").notNull().default(0),
  pendingKobo: integer("pending_kobo").notNull().default(0),
  lifetimeKobo: integer("lifetime_kobo").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type NewCreatorProfile = typeof creatorProfiles.$inferInsert;
export type WalletBalance = typeof walletBalances.$inferSelect;
