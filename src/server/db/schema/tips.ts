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

export const tipStatusEnum = pgEnum("tip_status", [
  "pending",
  "paid",
  "failed",
  "abandoned",
]);

export const tips = pgTable(
  "tip",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    creatorUserId: text("creator_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Supporter can be anonymous (no account)
    supporterUserId: text("supporter_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    supporterName: text("supporter_name"),
    supporterEmail: text("supporter_email").notNull(),

    kunuCount: integer("kunu_count").notNull(),
    amountKobo: integer("amount_kobo").notNull(),
    feeKobo: integer("fee_kobo").notNull().default(0),
    netKobo: integer("net_kobo").notNull(),

    message: text("message"),
    isPublic: boolean("is_public").notNull().default(true),

    paystackReference: text("paystack_reference").notNull().unique(),
    paystackChannel: text("paystack_channel"),
    status: tipStatusEnum("status").notNull().default("pending"),

    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("tips_creator_created_idx").on(t.creatorUserId, t.createdAt),
    index("tips_status_idx").on(t.status),
  ],
);

export type Tip = typeof tips.$inferSelect;
export type NewTip = typeof tips.$inferInsert;
