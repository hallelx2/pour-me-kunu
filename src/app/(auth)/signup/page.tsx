"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { UsernameField } from "@/components/ui/UsernameField";
import { validateUsernameFormat } from "@/lib/reserved-usernames";

function SignUpForm() {
  const router = useRouter();
  const search = useSearchParams();
  const presetUsername = (search.get("username") ?? "").toLowerCase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(presetUsername);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const formOk =
    name.trim().length >= 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 8 &&
    validateUsernameFormat(username).ok &&
    usernameAvailable;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formOk) return;

    setLoading(true);
    const { data, error } = await signUp.email({
      email,
      password,
      name: name.trim(),
      // additional field
      username: username.toLowerCase(),
    } as Parameters<typeof signUp.email>[0]);
    setLoading(false);

    if (error) {
      if (error.message?.toLowerCase().includes("duplicate") || error.code === "USER_ALREADY_EXISTS") {
        toast.error("An account already exists with that email.");
      } else {
        toast.error(error.message ?? "Couldn't create your account.");
      }
      return;
    }

    if (data) {
      toast.success(`Welcome to Buy Me Kunu, @${username.toLowerCase()} 🥤`);
      router.push("/onboarding/creator");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
          Claim your @handle.
        </h1>
        <p className="mt-3 text-base text-kunu-ink-soft">
          Two minutes and your page is live.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-10 rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream/80 p-7 shadow-[0_20px_60px_-30px_rgba(31,22,17,0.3)] backdrop-blur sm:p-8"
      >
        <div>
          <Label htmlFor="username">Your handle</Label>
          <UsernameField
            value={username}
            onChange={setUsername}
            onAvailabilityChange={setUsernameAvailable}
            autoFocus={!presetUsername}
          />
        </div>

        <div className="mt-5">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          disabled={!formOk}
          className="mt-7 w-full"
        >
          {loading ? "Creating your page…" : "Create my page"}
        </Button>

        <p className="mt-3 text-center text-xs text-kunu-clay">
          By signing up you agree to the terms and privacy notice.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-kunu-ink-soft">
        Already on Buy Me Kunu?{" "}
        <Link
          href="/signin"
          className="font-semibold text-kunu-terracotta hover:underline"
        >
          Sign in →
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
