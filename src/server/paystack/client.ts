import "server-only";
import { customAlphabet } from "nanoid";

const BASE_URL = "https://api.paystack.co";
const REFERENCE_PREFIX = "bmk_";

const nano = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  20,
);

export function generatePaystackReference(): string {
  return `${REFERENCE_PREFIX}${nano()}`;
}

function getSecret(): string {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env.local and Vercel env vars before calling Paystack.",
    );
  }
  return secret;
}

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

async function paystackFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    // Paystack data changes rarely for static reads like banks. Caller can override.
    cache: "no-store",
  });

  const json = (await res.json()) as PaystackResponse<T> | { message: string };
  if (!res.ok || !("status" in json) || !json.status) {
    const msg =
      "message" in json ? json.message : `Paystack ${path} failed (${res.status})`;
    throw new Error(`Paystack ${path}: ${msg}`);
  }
  return json.data;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Transactions (one-off tips + subscription initial charge)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface InitializeTransactionInput {
  email: string;
  amountKobo: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  plan?: string;
}

export interface InitializeTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export function initializeTransaction(input: InitializeTransactionInput) {
  return paystackFetch<InitializeTransactionData>("/transaction/initialize", {
    method: "POST",
    body: {
      email: input.email,
      amount: input.amountKobo,
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
      plan: input.plan,
      currency: "NGN",
    },
  });
}

export interface VerifyTransactionData {
  id: number;
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  channel: string;
  currency: string;
  paid_at: string | null;
  customer: { email: string };
  metadata: Record<string, unknown> | null;
  plan?: { plan_code: string; name: string } | null;
}

export function verifyTransaction(reference: string) {
  return paystackFetch<VerifyTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Plans + subscriptions
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CreatePlanInput {
  name: string;
  amountKobo: number;
  interval: "monthly" | "annually";
  description?: string;
}

export interface PaystackPlan {
  id: number;
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
}

export function createPlan(input: CreatePlanInput) {
  return paystackFetch<PaystackPlan>("/plan", {
    method: "POST",
    body: {
      name: input.name,
      amount: input.amountKobo,
      interval: input.interval,
      description: input.description,
      currency: "NGN",
    },
  });
}

export function disableSubscription(code: string, emailToken: string) {
  return paystackFetch<{ status: string }>("/subscription/disable", {
    method: "POST",
    body: { code, token: emailToken },
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * Banks + account resolution (for payouts)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface PaystackBank {
  name: string;
  code: string;
  longcode: string;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export function listBanks(country: "nigeria" | "ghana" | "kenya" | "south africa" = "nigeria") {
  return paystackFetch<PaystackBank[]>(
    `/bank?country=${encodeURIComponent(country)}`,
  );
}

export interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export function resolveAccountNumber(accountNumber: string, bankCode: string) {
  return paystackFetch<ResolvedAccount>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Transfers (creator payouts)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CreateTransferRecipientInput {
  name: string;
  accountNumber: string;
  bankCode: string;
}

export interface TransferRecipient {
  recipient_code: string;
  type: string;
  name: string;
  details: { account_number: string; bank_code: string; account_name: string };
}

export function createTransferRecipient(input: CreateTransferRecipientInput) {
  return paystackFetch<TransferRecipient>("/transferrecipient", {
    method: "POST",
    body: {
      type: "nuban",
      name: input.name,
      account_number: input.accountNumber,
      bank_code: input.bankCode,
      currency: "NGN",
    },
  });
}

export interface InitiateTransferInput {
  amountKobo: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}

export interface TransferData {
  reference: string;
  amount: number;
  status: string;
  transfer_code: string;
  recipient: string;
}

export function initiateTransfer(input: InitiateTransferInput) {
  return paystackFetch<TransferData>("/transfer", {
    method: "POST",
    body: {
      source: "balance",
      amount: input.amountKobo,
      recipient: input.recipientCode,
      reference: input.reference,
      reason: input.reason,
    },
  });
}
