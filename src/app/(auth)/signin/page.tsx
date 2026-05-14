"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are both required.");
      return;
    }
    setLoading(true);
    const { data, error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Couldn't sign in.");
      return;
    }
    if (data) {
      toast.success("Welcome back.");
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-3 text-base text-kunu-ink-soft">
          Sign in to your <span className="font-display font-semibold">buymekunu</span> page.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream/80 p-7 shadow-[0_20px_60px_-30px_rgba(31,22,17,0.3)] backdrop-blur sm:p-8"
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            minLength={8}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="mt-6 w-full"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kunu-ink-soft">
        New to Buy Me Kunu?{" "}
        <Link
          href="/signup"
          className="font-semibold text-kunu-terracotta hover:underline"
        >
          Claim your page →
        </Link>
      </p>
    </div>
  );
}
