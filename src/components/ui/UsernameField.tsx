"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { validateUsernameFormat } from "@/lib/reserved-usernames";
import { cn } from "@/lib/utils";

interface UsernameFieldProps {
  value: string;
  onChange: (v: string) => void;
  onAvailabilityChange?: (available: boolean) => void;
  autoFocus?: boolean;
  className?: string;
  variant?: "default" | "ghost";
}

export function UsernameField({
  value,
  onChange,
  onAvailabilityChange,
  autoFocus,
  className,
  variant = "default",
}: UsernameFieldProps) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), 350);
    return () => clearTimeout(t);
  }, [value]);

  const formatCheck = validateUsernameFormat(value);
  const shouldQuery =
    debounced.length >= 3 && validateUsernameFormat(debounced).ok;

  const check = trpc.auth.checkUsername.useQuery(
    { username: debounced.toLowerCase() },
    {
      enabled: shouldQuery,
      staleTime: 30_000,
    },
  );

  const status: "idle" | "checking" | "format-error" | "available" | "taken" =
    value.length === 0
      ? "idle"
      : !formatCheck.ok
        ? "format-error"
        : check.isFetching || value !== debounced
          ? "checking"
          : check.data?.available
            ? "available"
            : "taken";

  useEffect(() => {
    onAvailabilityChange?.(status === "available");
  }, [status, onAvailabilityChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\s/g, "").toLowerCase();
    onChange(next);
  };

  const errorMessage =
    status === "format-error"
      ? formatCheck.reason
      : status === "taken"
        ? check.data?.reason ?? "Already taken."
        : null;

  return (
    <div className={className}>
      <div
        className={cn(
          "group flex h-12 items-stretch overflow-hidden rounded-xl border-2 bg-kunu-cream transition-all focus-within:bg-kunu-cream",
          variant === "ghost" && "h-14 rounded-full",
          status === "format-error" || status === "taken"
            ? "border-red-500/50 focus-within:border-red-500"
            : status === "available"
              ? "border-kunu-green/60 focus-within:border-kunu-green"
              : "border-kunu-ink/15 focus-within:border-kunu-terracotta",
        )}
      >
        <span className="flex shrink-0 items-center pl-4 pr-1 font-sans text-sm font-medium text-kunu-clay select-none">
          buymekunu.com/@
        </span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          maxLength={30}
          placeholder="yourname"
          className="min-w-0 flex-1 bg-transparent font-sans text-base font-semibold text-kunu-ink placeholder:font-normal placeholder:text-kunu-clay/50 focus:outline-none"
          aria-invalid={status === "format-error" || status === "taken"}
        />
        <div className="flex shrink-0 items-center pr-3.5">
          {status === "checking" && (
            <Loader2 className="h-4 w-4 animate-spin text-kunu-clay" />
          )}
          {status === "available" && (
            <Check className="h-5 w-5 text-kunu-green" strokeWidth={3} />
          )}
          {(status === "taken" || status === "format-error") && (
            <X className="h-5 w-5 text-red-500" strokeWidth={3} />
          )}
        </div>
      </div>
      {errorMessage && (
        <p className="mt-1.5 pl-1 text-xs font-medium text-red-600">
          {errorMessage}
        </p>
      )}
      {status === "available" && (
        <p className="mt-1.5 pl-1 text-xs font-medium text-kunu-green">
          @{value} is available — claim it before someone else does.
        </p>
      )}
    </div>
  );
}
