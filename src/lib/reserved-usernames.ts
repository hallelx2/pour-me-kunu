/**
 * Usernames the platform reserves for routing, ops, or future product use.
 * Stored lowercase. Matched case-insensitively in validators.
 */
export const RESERVED_USERNAMES = new Set<string>([
  // Routes / platform
  "admin",
  "api",
  "app",
  "dashboard",
  "settings",
  "onboarding",
  "signin",
  "signup",
  "logout",
  "checkout",
  "u",
  "user",

  // Payments
  "paystack",
  "stripe",
  "payments",
  "payout",
  "payouts",
  "tips",
  "memberships",
  "subscriptions",

  // Brand
  "kunu",
  "buymekunu",
  "garri",
  "buymegarri",

  // Common
  "support",
  "help",
  "contact",
  "about",
  "blog",
  "docs",
  "terms",
  "privacy",
  "refunds",
  "guide",
  "creators",
  "roadmap",
  "feedback",
  "status",

  // Reserved single chars and short common
  "me",
  "i",
  "you",
  "we",
  "us",
  "team",

  // OAuth/auth provider words
  "google",
  "github",
  "twitter",
  "x",
  "facebook",
  "instagram",
  "discord",
]);

export const USERNAME_PATTERN = /^[a-z0-9_.]{3,30}$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

export interface UsernameCheck {
  ok: boolean;
  reason?: string;
}

export function validateUsernameFormat(raw: string): UsernameCheck {
  const u = raw.trim().toLowerCase();
  if (u.length === 0) return { ok: false, reason: "Username is required." };
  if (u.length < USERNAME_MIN)
    return { ok: false, reason: `Must be at least ${USERNAME_MIN} characters.` };
  if (u.length > USERNAME_MAX)
    return { ok: false, reason: `Max ${USERNAME_MAX} characters.` };
  if (!USERNAME_PATTERN.test(u))
    return {
      ok: false,
      reason: "Only lowercase letters, numbers, dots, and underscores.",
    };
  if (u.startsWith(".") || u.endsWith("."))
    return { ok: false, reason: "Can't start or end with a dot." };
  if (u.includes(".."))
    return { ok: false, reason: "Can't have consecutive dots." };
  if (RESERVED_USERNAMES.has(u))
    return { ok: false, reason: "That handle is reserved." };
  return { ok: true };
}
