import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const payoutStatusEnum = pgEnum("payout_status", [
  "requested",
  "processing",
  "success",
  "failed",
  "reversed",
]);

export const payouts = pgTable(
  "payout",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountKobo: integer("amount_kobo").notNull(),
    feeKobo: integer("fee_kobo").notNull().default(0),
    paystackTransferCode: text("paystack_transfer_code").unique(),
    paystackReference: text("paystack_reference").notNull().unique(),
    status: payoutStatusEnum("status").notNull().default("requested"),
    failureReason: text("failure_reason"),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("payouts_creator_created_idx").on(t.creatorUserId, t.createdAt)],
);

export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
