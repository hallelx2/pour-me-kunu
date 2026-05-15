"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn, formatNaira } from "@/lib/utils";

export default function PayoutsPage() {
  const overview = trpc.payouts.getOverview.useQuery();
  const history = trpc.payouts.listPayouts.useQuery();
  const utils = trpc.useUtils();

  const [showBankForm, setShowBankForm] = useState(false);

  if (overview.isPending) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-kunu-clay">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </main>
    );
  }

  const bank = overview.data?.bank;
  const available = overview.data?.availableKobo ?? 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-kunu-clay hover:text-kunu-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
        Payouts
      </h1>
      <p className="mt-2 max-w-2xl text-base text-kunu-ink-soft">
        Withdraw your available balance to your verified Nigerian bank account.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <BalanceCard
          label="Available"
          value={formatNaira(overview.data?.availableKobo ?? 0)}
          accent
          hint="Ready to withdraw"
        />
        <BalanceCard
          label="Pending"
          value={formatNaira(overview.data?.pendingKobo ?? 0)}
          hint="Clearing soon"
        />
        <BalanceCard
          label="Lifetime"
          value={formatNaira(overview.data?.lifetimeKobo ?? 0)}
          hint="All time gross"
        />
      </section>

      {/* Bank account */}
      <section className="mt-10 rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
              <Building2 className="h-3.5 w-3.5" />
              Bank account
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold text-kunu-ink">
              {bank ? bank.accountName : "Add your bank account"}
            </h2>
            {bank ? (
              <p className="mt-1 text-sm text-kunu-ink-soft">
                {bank.accountNumber} ·{" "}
                <span className="text-kunu-clay">code {bank.code}</span>
                {bank.verifiedAt && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-kunu-green/10 px-2 py-0.5 text-[10px] font-semibold text-kunu-green">
                    <Check className="h-3 w-3" strokeWidth={3} /> Verified
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-kunu-ink-soft">
                You'll need a Nigerian bank account to withdraw your kunus.
              </p>
            )}
          </div>
          {bank ? (
            <button
              type="button"
              onClick={() => setShowBankForm(true)}
              className="rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 text-xs font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
            >
              Change
            </button>
          ) : (
            <Button onClick={() => setShowBankForm(true)}>Add bank</Button>
          )}
        </div>

        {showBankForm && (
          <BankAccountForm
            onClose={() => setShowBankForm(false)}
            onSaved={() => utils.payouts.getOverview.invalidate()}
          />
        )}
      </section>

      {/* Request payout */}
      <RequestPayoutSection
        available={available}
        canRequest={!!bank}
        onPayoutCreated={() => {
          utils.payouts.getOverview.invalidate();
          utils.payouts.listPayouts.invalidate();
        }}
      />

      {/* History */}
      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-kunu-ink">
          History
        </h2>
        {history.data && history.data.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {history.data.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display text-lg font-semibold text-kunu-ink">
                    {formatNaira(p.amountKobo)}
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-1 text-xs text-kunu-clay">
                  Requested {new Date(p.requestedAt).toLocaleString("en-NG")}
                  {p.completedAt && (
                    <>
                      {" · Completed "}
                      {new Date(p.completedAt).toLocaleString("en-NG")}
                    </>
                  )}
                </div>
                {p.failureReason && (
                  <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-red-600">
                    <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    {p.failureReason}
                  </p>
                )}
                {p.paystackTransferCode && (
                  <p className="mt-2 font-mono text-[10px] text-kunu-clay">
                    {p.paystackTransferCode}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-8 text-center text-sm text-kunu-clay">
            No payouts yet.
          </p>
        )}
      </section>
    </main>
  );
}

function BalanceCard({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent?: boolean;
  hint: string;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-3xl border-2 border-kunu-terracotta-deep/30 bg-kunu-terracotta p-6 text-kunu-cream"
          : "rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-6"
      }
    >
      <div
        className={`text-[10px] font-semibold uppercase tracking-wider ${accent ? "text-kunu-cream/80" : "text-kunu-clay"}`}
      >
        {label}
      </div>
      <div
        className={`mt-1.5 font-display text-3xl font-semibold tabular-nums ${accent ? "" : "text-kunu-ink"}`}
      >
        {value}
      </div>
      <div className={`mt-1 text-xs ${accent ? "text-kunu-cream/70" : "text-kunu-clay"}`}>
        {hint}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    requested: {
      className: "bg-kunu-clay/15 text-kunu-clay",
      label: "Requested",
    },
    processing: {
      className: "bg-kunu-ochre/20 text-kunu-terracotta-deep",
      label: "Processing",
    },
    success: { className: "bg-kunu-green/15 text-kunu-green", label: "Paid" },
    failed: { className: "bg-red-500/15 text-red-600", label: "Failed" },
    reversed: { className: "bg-red-500/15 text-red-600", label: "Reversed" },
  };
  const v = map[status] ?? { className: "bg-kunu-clay/15 text-kunu-clay", label: status };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${v.className}`}
    >
      {v.label}
    </span>
  );
}

function BankAccountForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const banks = trpc.payouts.listBanks.useQuery();
  const resolve = trpc.payouts.resolveAccount.useMutation();
  const save = trpc.payouts.setBankAccount.useMutation();

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);

  const handleResolve = async () => {
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) {
      toast.error("Pick a bank and enter a 10-digit account number.");
      return;
    }
    try {
      const result = await resolve.mutateAsync({ bankCode, accountNumber });
      setResolvedName(result.accountName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't resolve account.");
    }
  };

  const handleSave = async () => {
    if (!resolvedName) return;
    try {
      await save.mutateAsync({
        bankCode,
        accountNumber,
        accountName: resolvedName,
      });
      toast.success("Bank account saved.");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save bank account.");
    }
  };

  return (
    <div className="mt-6 space-y-4 border-t border-kunu-ink/10 pt-6">
      <div>
        <Label htmlFor="bankCode">Bank</Label>
        <select
          id="bankCode"
          value={bankCode}
          onChange={(e) => {
            setBankCode(e.target.value);
            setResolvedName(null);
          }}
          className="h-12 w-full rounded-xl border-2 border-kunu-ink/15 bg-kunu-cream px-3 font-sans text-base text-kunu-ink focus:border-kunu-terracotta focus:outline-none"
        >
          <option value="">Pick your bank…</option>
          {banks.data?.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
        {banks.isPending && (
          <p className="mt-1.5 text-xs text-kunu-clay">Loading banks…</p>
        )}
      </div>

      <div>
        <Label htmlFor="accountNumber">Account number</Label>
        <Input
          id="accountNumber"
          inputMode="numeric"
          pattern="\d{10}"
          maxLength={10}
          value={accountNumber}
          onChange={(e) => {
            setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10));
            setResolvedName(null);
          }}
          placeholder="0123456789"
        />
      </div>

      {!resolvedName ? (
        <Button
          onClick={handleResolve}
          loading={resolve.isPending}
          disabled={!bankCode || accountNumber.length !== 10}
          className="w-full"
        >
          Resolve account
        </Button>
      ) : (
        <div className="rounded-xl border-2 border-kunu-green/40 bg-kunu-green/10 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-kunu-green">
            Confirm name
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-kunu-ink">
            {resolvedName}
          </p>
          <p className="mt-2 text-xs text-kunu-ink-soft">
            We'll save this as your payout recipient. It must match your bank
            records exactly.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setResolvedName(null)}
              className="flex-1 rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 text-sm font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
            >
              Not me
            </button>
            <Button
              onClick={handleSave}
              loading={save.isPending}
              disabled={save.isPending}
              className="flex-1"
            >
              Save bank
            </Button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="block text-center text-xs text-kunu-clay hover:text-kunu-ink"
      >
        Cancel
      </button>
    </div>
  );
}

function RequestPayoutSection({
  available,
  canRequest,
  onPayoutCreated,
}: {
  available: number;
  canRequest: boolean;
  onPayoutCreated: () => void;
}) {
  const [amountNaira, setAmountNaira] = useState("");
  const request = trpc.payouts.requestPayout.useMutation();

  const amountKobo = amountNaira ? Math.round(Number(amountNaira) * 100) : 0;
  const canSubmit =
    canRequest &&
    amountKobo >= 50000 &&
    amountKobo <= available &&
    !request.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await request.mutateAsync({ amountKobo });
      toast.success(
        `Payout of ${formatNaira(amountKobo)} requested. We'll let you know when it lands.`,
      );
      setAmountNaira("");
      onPayoutCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't request payout.");
    }
  };

  return (
    <section className="mt-10 rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-6">
      <h2 className="font-display text-2xl font-semibold text-kunu-ink">
        Request payout
      </h2>
      <p className="mt-1 text-sm text-kunu-ink-soft">
        {canRequest
          ? `Up to ${formatNaira(available)} available. Minimum withdrawal: ${formatNaira(50000)}.`
          : "Add a bank account above before requesting your first payout."}
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={500}
              max={available / 100}
              step={50}
              value={amountNaira}
              onChange={(e) => setAmountNaira(e.target.value)}
              disabled={!canRequest}
              placeholder={`₦ amount (min ${formatNaira(50000)})`}
            />
          </div>
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={request.isPending}
          >
            Request
          </Button>
        </div>
      </form>
    </section>
  );
}
