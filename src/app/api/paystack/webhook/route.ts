import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { tips } from "@/server/db/schema/tips";
import { walletBalances } from "@/server/db/schema/creators";
import {
  membershipTiers,
  subscriptions,
  subscriptionCharges,
} from "@/server/db/schema/memberships";
import { verifyPaystackSignature } from "@/server/paystack/webhook-verify";

const PLATFORM_FEE_RATE = 0.05;

// Paystack webhooks are signed against the raw request body — never parse
// before verifying or the signature won't match.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(raw, signature)) {
    return new Response("invalid signature", { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("invalid payload", { status: 400 });
  }

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(event.data);
        break;
      case "subscription.disable":
        await handleSubscriptionDisable(event.data);
        break;
      case "subscription.not_renew":
        await handleSubscriptionNotRenew(event.data);
        break;
      // TODO: invoice.payment_failed, transfer.success/failed/reversed (Phase 2)
      default:
        break;
    }
  } catch (err) {
    console.error("Paystack webhook handler error:", err);
    return new Response("internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

/* ────────────────────────────────────────────────────────────────────────────
 * charge.success — covers BOTH one-off tips and subscription invoices.
 * Subscription invoices carry a `plan` field; one-off tips don't.
 * ──────────────────────────────────────────────────────────────────────────── */

interface ChargeSuccessData {
  reference?: string;
  status?: string;
  channel?: string;
  paid_at?: string;
  amount?: number;
  plan?: { plan_code?: string } | null;
  customer?: { email?: string } | null;
}

async function handleChargeSuccess(data: Record<string, unknown>) {
  const d = data as unknown as ChargeSuccessData;
  if (!d.reference) return;

  if (d.plan?.plan_code) {
    await handleSubscriptionCharge(d);
    return;
  }

  await handleOneOffTipCharge(d);
}

async function handleOneOffTipCharge(d: ChargeSuccessData) {
  // Compare-and-set: only one of {webhook, callback} wins the pending→paid flip
  const [updated] = await db
    .update(tips)
    .set({
      status: "paid",
      paidAt: d.paid_at ? new Date(d.paid_at) : new Date(),
      paystackChannel: d.channel ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(tips.paystackReference, d.reference!), eq(tips.status, "pending")))
    .returning();

  if (!updated) return; // Already handled by callback or unknown reference

  await db
    .insert(walletBalances)
    .values({
      creatorUserId: updated.creatorUserId,
      availableKobo: updated.netKobo,
      lifetimeKobo: updated.amountKobo,
    })
    .onConflictDoUpdate({
      target: walletBalances.creatorUserId,
      set: {
        availableKobo: sql`${walletBalances.availableKobo} + ${updated.netKobo}`,
        lifetimeKobo: sql`${walletBalances.lifetimeKobo} + ${updated.amountKobo}`,
        updatedAt: new Date(),
      },
    });
}

async function handleSubscriptionCharge(d: ChargeSuccessData) {
  const planCode = d.plan?.plan_code;
  const supporterEmail = d.customer?.email?.toLowerCase();
  const amountKobo = d.amount;
  if (!planCode || !supporterEmail || !amountKobo) return;

  // Find the matching tier
  const tier = await db.query.membershipTiers.findFirst({
    where: eq(membershipTiers.paystackPlanCode, planCode),
  });
  if (!tier) return;

  // Find the most recent matching subscription (may be pending if this is the
  // initial charge, or active if this is a renewal)
  const [sub] = await db
    .select({
      id: subscriptions.id,
      creatorUserId: subscriptions.creatorUserId,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.tierId, tier.id),
        eq(subscriptions.supporterEmail, supporterEmail),
      ),
    )
    .orderBy(desc(subscriptions.startedAt))
    .limit(1);

  if (!sub) return;

  const feeKobo = Math.floor(amountKobo * PLATFORM_FEE_RATE);
  const netKobo = amountKobo - feeKobo;
  const paidAt = d.paid_at ? new Date(d.paid_at) : new Date();

  // Idempotent insert: paystackReference is unique on subscription_charge
  const inserted = await db
    .insert(subscriptionCharges)
    .values({
      subscriptionId: sub.id,
      amountKobo,
      paystackReference: d.reference!,
      paidAt,
    })
    .onConflictDoNothing({ target: subscriptionCharges.paystackReference })
    .returning();

  // Only bump the wallet if we actually inserted (idempotent)
  if (inserted.length === 0) return;

  await db
    .insert(walletBalances)
    .values({
      creatorUserId: sub.creatorUserId,
      availableKobo: netKobo,
      lifetimeKobo: amountKobo,
    })
    .onConflictDoUpdate({
      target: walletBalances.creatorUserId,
      set: {
        availableKobo: sql`${walletBalances.availableKobo} + ${netKobo}`,
        lifetimeKobo: sql`${walletBalances.lifetimeKobo} + ${amountKobo}`,
        updatedAt: new Date(),
      },
    });
}

/* ────────────────────────────────────────────────────────────────────────────
 * subscription.create — finalize a pending subscription row
 * ──────────────────────────────────────────────────────────────────────────── */

interface SubscriptionCreateData {
  subscription_code?: string;
  email_token?: string;
  status?: string;
  next_payment_date?: string;
  plan?: { plan_code?: string } | null;
  customer?: { email?: string; customer_code?: string } | null;
}

async function handleSubscriptionCreate(data: Record<string, unknown>) {
  const d = data as unknown as SubscriptionCreateData;
  const planCode = d.plan?.plan_code;
  const supporterEmail = d.customer?.email?.toLowerCase();
  if (!planCode || !supporterEmail || !d.subscription_code) return;

  // Find the tier from the plan code
  const tier = await db.query.membershipTiers.findFirst({
    where: eq(membershipTiers.paystackPlanCode, planCode),
  });
  if (!tier) return;

  // Find the most recent pending sub for (tier, email)
  const [sub] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.tierId, tier.id),
        eq(subscriptions.supporterEmail, supporterEmail),
        isNull(subscriptions.paystackSubscriptionCode),
      ),
    )
    .orderBy(desc(subscriptions.startedAt))
    .limit(1);

  if (!sub) return;

  await db
    .update(subscriptions)
    .set({
      paystackSubscriptionCode: d.subscription_code,
      paystackEmailToken: d.email_token ?? null,
      paystackCustomerCode: d.customer?.customer_code ?? null,
      status: d.status === "active" ? "active" : "attention",
      currentPeriodEnd: d.next_payment_date
        ? new Date(d.next_payment_date)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));
}

async function handleSubscriptionDisable(data: Record<string, unknown>) {
  const d = data as unknown as { subscription_code?: string };
  if (!d.subscription_code) return;
  await db
    .update(subscriptions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(subscriptions.paystackSubscriptionCode, d.subscription_code));
}

async function handleSubscriptionNotRenew(data: Record<string, unknown>) {
  const d = data as unknown as { subscription_code?: string };
  if (!d.subscription_code) return;
  await db
    .update(subscriptions)
    .set({ status: "non-renewing", updatedAt: new Date() })
    .where(eq(subscriptions.paystackSubscriptionCode, d.subscription_code));
}
