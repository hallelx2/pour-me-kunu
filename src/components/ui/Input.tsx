"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-xl border-2 bg-kunu-cream px-4 font-sans text-base text-kunu-ink placeholder:text-kunu-clay/60 transition-all focus:outline-none disabled:opacity-60",
          error
            ? "border-red-500/60 focus:border-red-500"
            : "border-kunu-ink/15 focus:border-kunu-terracotta focus:bg-kunu-cream",
          className,
        )}
        {...rest}
      />
    );
  },
);
Input.displayName = "Input";
