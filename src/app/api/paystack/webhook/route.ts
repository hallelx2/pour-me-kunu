import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { tips } from "@/server/db/schema/tips";
import { walletBalances } from "@/server/db/schema/creators";
import { verifyPaystackSignature } from "@/server/paystack/webhook-verify";

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
      case "charge.success": {
        await handleChargeSuccess(event.data);
        break;
      }
      // TODO: subscription.create, subscription.disable, invoice.payment_failed,
      // transfer.success, transfer.failed, transfer.reversed
      default:
        break;
    }
  } catch (err) {
    console.error("Paystack webhook handler error:", err);
    return new Response("internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}

interface ChargeSuccessData {
  reference?: string;
  status?: string;
  channel?: string;
  paid_at?: string;
  amount?: number;
  plan?: { plan_code: string } | null;
}

async function handleChargeSuccess(data: Record<string, unknown>) {
  const d = data as unknown as ChargeSuccessData;
  if (!d.reference) return;

  // Subscription renewal charges arrive with a `plan` object. Those are
  // handled separately via the subscription tables once we ship memberships.
  // For now we route only one-off tip charges here.
  if (d.plan) {
    // TODO: insert into subscription_charge + bump wallet
    return;
  }

  // Compare-and-set: only one of {webhook, callback} wins the pending→paid flip
  const [updated] = await db
    .update(tips)
    .set({
      status: "paid",
      paidAt: d.paid_at ? new Date(d.paid_at) : new Date(),
      paystackChannel: d.channel ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(tips.paystackReference, d.reference), eq(tips.status, "pending")))
    .returning();

  if (!updated) {
    // Either already marked by the callback, or unknown reference. Idempotent no-op.
    return;
  }

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
