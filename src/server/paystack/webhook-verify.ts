import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack signs webhook payloads using HMAC-SHA512 keyed on PAYSTACK_SECRET_KEY.
 * The hex digest is sent in the x-paystack-signature header. We must verify
 * with a constant-time comparison and using the raw request body bytes.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const computed = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
