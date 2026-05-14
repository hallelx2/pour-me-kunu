import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const intervalEnum = pgEnum("membership_interval", [
  "monthly",
  "annually",
]);
export const subStatusEnum = pgEnum("sub_status", [
  "active",
  "non-renewing",
  "attention",
  "completed",
  "cancelled",
]);

export const membershipTiers = pgTable(
  "membership_tier",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    priceKobo: integer("price_kobo").notNull(),
    interval: intervalEnum("interval").notNull().default("monthly"),
    perks: text("perks").array(),
    paystackPlanCode: text("paystack_plan_code").unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("membership_tiers_creator_idx").on(t.creatorUserId)],
);

export const subscriptions = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    supporterUserId: text("supporter_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    supporterEmail: text("supporter_email").notNull(),
    tierId: text("tier_id")
      .notNull()
      .references(() => membershipTiers.id, { onDelete: "restrict" }),

    paystackSubscriptionCode: text("paystack_subscription_code").unique(),
    paystackEmailToken: text("paystack_email_token"),
    paystackCustomerCode: text("paystack_customer_code"),

    status: subStatusEnum("status").notNull().default("active"),
    currentPeriodEnd: timestamp("current_period_end"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("subs_supporter_idx").on(t.supporterUserId),
    index("subs_creator_status_idx").on(t.creatorUserId, t.status),
  ],
);

export const subscriptionCharges = pgTable("subscription_charge", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  amountKobo: integer("amount_kobo").notNull(),
  paystackReference: text("paystack_reference").notNull().unique(),
  paidAt: timestamp("paid_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type MembershipTier = typeof membershipTiers.$inferSelect;
export type NewMembershipTier = typeof membershipTiers.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionCharge = typeof subscriptionCharges.$inferSelect;
