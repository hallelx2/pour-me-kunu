/**
 * Wipes all application data while keeping schema + drizzle migration history.
 *
 * Usage:
 *   CONFIRM=yes-truncate-everything bun scripts/reset-data.ts
 *
 * What it does: TRUNCATE TABLE "user", "verification" RESTART IDENTITY CASCADE
 *   - "user" cascades to session/account/creator_profile/wallet_balance/tip/
 *     membership_tier/subscription/subscription_charge/payout
 *   - "verification" has no FK references, gets truncated explicitly
 *   - "__drizzle_migrations" is left alone (migration history preserved)
 *
 * Anything created on Paystack's side (plans, customers, transfer recipients)
 * stays in Paystack's test dashboard — clear those manually if needed.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

if (process.env.CONFIRM !== "yes-truncate-everything") {
  console.error(
    "✗ Refusing to run without confirmation.\n" +
      "  Set CONFIRM=yes-truncate-everything to proceed.",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function counts(label: string) {
  const [u] = await sql`SELECT count(*)::int AS c FROM "user"`;
  const [t] = await sql`SELECT count(*)::int AS c FROM tip`;
  const [s] = await sql`SELECT count(*)::int AS c FROM subscription`;
  const [p] = await sql`SELECT count(*)::int AS c FROM payout`;
  console.log(
    `  ${label}: users=${u.c} tips=${t.c} subscriptions=${s.c} payouts=${p.c}`,
  );
}

console.log("Connecting to Neon...");
await counts("Before");

console.log("Truncating user + verification (CASCADE)...");
await sql`TRUNCATE TABLE "user", "verification" RESTART IDENTITY CASCADE`;

await counts("After");
console.log("✓ Done. Schema + drizzle migrations preserved.");
