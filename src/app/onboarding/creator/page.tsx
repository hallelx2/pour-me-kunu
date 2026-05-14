"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";
import { formatNaira, cn } from "@/lib/utils";

const ACCENTS = [
  { id: "terracotta", label: "Terracotta", className: "bg-kunu-terracotta" },
  { id: "ochre", label: "Ochre", className: "bg-kunu-ochre" },
  { id: "green", label: "Green", className: "bg-kunu-green" },
  { id: "clay", label: "Clay", className: "bg-kunu-clay" },
] as const;

const PRESET_PRICES = [10000, 30000, 50000, 100000, 200000];

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Pre-fill display name from session
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState<typeof ACCENTS[number]["id"]>(
    "terracotta",
  );
  const [kunuPriceKobo, setKunuPriceKobo] = useState(50000);
  const [kunuLabel, setKunuLabel] = useState("kunu");
  const [kunuEmoji, setKunuEmoji] = useState("🥤");

  useEffect(() => {
    if (session?.user && !displayName) {
      setDisplayName(session.user.name ?? "");
    }
  }, [session, displayName]);

  const existing = trpc.creators.myProfile.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (existing.data) {
      router.replace("/dashboard");
    }
  }, [existing.data, router]);

  const upsert = trpc.creators.upsertProfile.useMutation();
  const publish = trpc.creators.publish.useMutation();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Pick a display name to continue.");
      return;
    }
    try {
      await upsert.mutateAsync({
        displayName: displayName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        accentColor: accent,
        kunuPriceKobo,
        kunuLabel: kunuLabel.trim() || "kunu",
        kunuEmoji: kunuEmoji.trim() || "🥤",
      });
      await publish.mutateAsync();
      toast.success("Your page is live 🥤");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save.");
    }
  };

  if (isPending || !session) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-kunu-clay">
        Loading…
      </main>
    );
  }

  const handle = session.user.username;
  const submitting = upsert.isPending || publish.isPending;

  return (
    <main className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-kunu-ochre/30 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-adinkra-pattern opacity-20" />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:px-12">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-kunu-terracotta/30 bg-kunu-cream px-3.5 py-1.5 text-xs font-semibold text-kunu-terracotta">
            <Sparkles className="h-3.5 w-3.5" />
            One more step
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
            Set up your{" "}
            <span className="text-kunu-terracotta">@{handle}</span> page.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-kunu-ink-soft">
            You can tweak any of this later — let's get something live first.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]"
        >
          {/* Left: form fields */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="The name your supporters know you by"
                required
                maxLength={60}
              />
            </div>

            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Illustrator · Lagos · vibes for sale"
                maxLength={120}
              />
              <p className="mt-1.5 text-xs text-kunu-clay">
                One short line. Shows up under your name on your public page.
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell supporters who you are and what their kunus help you do."
                maxLength={2000}
                rows={5}
                className="w-full rounded-xl border-2 border-kunu-ink/15 bg-kunu-cream px-4 py-3 font-sans text-base text-kunu-ink placeholder:text-kunu-clay/60 focus:border-kunu-terracotta focus:outline-none"
              />
            </div>

            <div>
              <Label>Accent color</Label>
              <div className="flex gap-3">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccent(a.id)}
                    aria-label={a.label}
                    className={cn(
                      "h-10 w-10 rounded-full border-2 transition-all",
                      a.className,
                      accent === a.id
                        ? "border-kunu-ink scale-110"
                        : "border-kunu-ink/10 hover:border-kunu-ink/30",
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Kunu price</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {PRESET_PRICES.map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => setKunuPriceKobo(price)}
                    className={cn(
                      "rounded-xl border-2 py-2.5 text-center font-display text-sm font-semibold transition-all",
                      kunuPriceKobo === price
                        ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream"
                        : "border-kunu-ink/10 bg-kunu-cream text-kunu-ink hover:border-kunu-terracotta/40",
                    )}
                  >
                    {formatNaira(price)}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-kunu-clay">
                The price of one {kunuLabel}. Change this anytime.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <div>
                <Label htmlFor="kunuLabel">Unit name</Label>
                <Input
                  id="kunuLabel"
                  value={kunuLabel}
                  onChange={(e) => setKunuLabel(e.target.value)}
                  placeholder="kunu"
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="kunuEmoji">Emoji</Label>
                <Input
                  id="kunuEmoji"
                  value={kunuEmoji}
                  onChange={(e) => setKunuEmoji(e.target.value)}
                  placeholder="🥤"
                  maxLength={8}
                />
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/40 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
                Live preview
              </p>
              <div className="mt-3 rounded-2xl border-2 border-kunu-ink/10 bg-kunu-cream p-5 shadow-[0_20px_60px_-30px_rgba(31,22,17,0.3)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-kunu-cream-deep text-2xl">
                    {kunuEmoji}
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold leading-tight">
                      {displayName || "Your name"}
                    </div>
                    <div className="text-xs text-kunu-clay">
                      @{handle} · {tagline || "your tagline"}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-display text-lg font-semibold">
                    Buy {displayName.split(" ")[0] || "me"} a {kunuLabel}
                  </div>
                  <div className="text-xs text-kunu-clay">
                    {formatNaira(kunuPriceKobo)} per {kunuLabel}
                  </div>
                </div>
                <div className="mt-3 flex justify-center">
                  <KunuCupGlyph size={48} fillLevel={0.6} withStraw />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  loading={submitting}
                  className="w-full"
                >
                  {submitting ? "Publishing…" : "Publish my page"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </Button>
                <Link
                  href="/dashboard"
                  className="block text-center text-xs text-kunu-clay hover:text-kunu-ink"
                >
                  Skip for now
                </Link>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
