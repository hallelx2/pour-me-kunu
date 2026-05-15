import "server-only";
import { TRPCError } from "@trpc/server";

/**
 * In-memory token bucket — per Vercel function instance. Multi-instance
 * deployments share no state, so the effective limit is per-region. Good
 * enough for spam-shaped abuse; if we ever need cross-instance accuracy,
 * swap for Upstash Redis with the same API surface.
 */
interface Bucket {
  tokens: number;
  lastRefillMs: number;
}

const buckets = new Map<string, Bucket>();

interface BucketConfig {
  /** Maximum tokens in the bucket. */
  capacity: number;
  /** Tokens refilled per millisecond (rate). */
  refillPerMs: number;
}

function takeToken(key: string, cfg: BucketConfig): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  const bucket: Bucket = existing
    ? { ...existing }
    : { tokens: cfg.capacity, lastRefillMs: now };

  const elapsed = Math.max(0, now - bucket.lastRefillMs);
  bucket.tokens = Math.min(cfg.capacity, bucket.tokens + elapsed * cfg.refillPerMs);
  bucket.lastRefillMs = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff?.split(",")[0]?.trim() ?? "unknown";
  // Bucket by IPv4 /24 so a noisy office NAT doesn't blanket-ban everyone
  const parts = ip.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  }
  return ip;
}

const LIMITS: Record<string, BucketConfig> = {
  // 10 tip starts per minute per IP /24
  "tips.initiate": { capacity: 10, refillPerMs: 10 / 60_000 },
  // 5 subscribe starts per minute per IP /24 (subscriptions are heavier)
  "memberships.subscribe": { capacity: 5, refillPerMs: 5 / 60_000 },
};

export function enforceRateLimit(req: Request, bucketName: keyof typeof LIMITS): void {
  const cfg = LIMITS[bucketName];
  if (!cfg) return;
  const key = `${bucketName}:${clientKey(req)}`;
  if (!takeToken(key, cfg)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "You're going a bit fast. Try again in a minute.",
    });
  }
}
