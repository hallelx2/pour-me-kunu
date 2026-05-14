"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-kunu-terracotta text-kunu-cream hover:bg-kunu-terracotta-deep focus-visible:ring-kunu-terracotta shadow-[0_8px_20px_-8px_rgba(200,81,44,0.6)]",
  secondary:
    "bg-kunu-ink text-kunu-cream hover:bg-kunu-night focus-visible:ring-kunu-ink",
  outline:
    "border-2 border-kunu-ink/15 bg-kunu-cream text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta focus-visible:ring-kunu-terracotta",
  ghost:
    "bg-transparent text-kunu-ink-soft hover:bg-kunu-cream-deep hover:text-kunu-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-full",
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-12 px-6 text-base rounded-full",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, disabled, className, children, type = "button", ...rest },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-display font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-kunu-cream",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
