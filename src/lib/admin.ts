import "server-only";

/**
 * Admin access is gated by an env-var allowlist: comma-separated lower-case
 * emails. Set ADMIN_EMAILS=you@example.com,co@example.com in Vercel env vars
 * (Production + Development). The list is read at function start, so editing
 * the env requires a redeploy.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = (process.env.ADMIN_EMAILS ?? "").toLowerCase();
  if (!raw) return false;
  const allowed = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase().trim());
}
