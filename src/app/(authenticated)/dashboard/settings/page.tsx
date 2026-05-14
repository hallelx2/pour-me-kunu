"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatNaira, cn } from "@/lib/utils";

type Accent = "terracotta" | "ochre" | "green" | "clay";

const ACCENTS: { id: Accent; label: string; className: string }[] = [
  { id: "terracotta", label: "Terracotta", className: "bg-kunu-terracotta" },
  { id: "ochre", label: "Ochre", className: "bg-kunu-ochre" },
  { id: "green", label: "Green", className: "bg-kunu-green" },
  { id: "clay", label: "Clay", className: "bg-kunu-clay" },
];

const PRESET_PRICES = [10000, 30000, 50000, 100000, 200000, 500000];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const profileQuery = trpc.creators.myProfile.useQuery();
  const utils = trpc.useUtils();

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [accent, setAccent] = useState<Accent>("terracotta");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [kunuPriceKobo, setKunuPriceKobo] = useState(50000);
  const [kunuPriceCustom, setKunuPriceCustom] = useState("");
  const [kunuLabel, setKunuLabel] = useState("kunu");
  const [kunuEmoji, setKunuEmoji] = useState("🥤");
  const [signingOut, setSigningOut] = useState(false);

  // Hydrate from existing profile once loaded
  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setDisplayName(p.displayName);
    setTagline(p.tagline ?? "");
    setBio(p.bio ?? "");
    setAccent((p.accentColor as Accent) ?? "terracotta");
    setAvatarUrl(p.avatarUrl ?? "");
    setCoverUrl(p.coverUrl ?? "");
    setKunuPriceKobo(p.kunuPriceKobo);
    setKunuLabel(p.kunuLabel);
    setKunuEmoji(p.kunuEmoji);
  }, [profileQuery.data]);

  const upsert = trpc.creators.upsertProfile.useMutation({
    onSuccess: async () => {
      await utils.creators.myProfile.invalidate();
      toast.success("Saved.");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Pick a display name.");
      return;
    }
    const priceFromCustom = kunuPriceCustom
      ? Math.round(Number(kunuPriceCustom) * 100)
      : null;
    const finalPrice =
      priceFromCustom && priceFromCustom >= 10000 && priceFromCustom <= 10000000
        ? priceFromCustom
        : kunuPriceKobo;

    upsert.mutate({
      displayName: displayName.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      accentColor: accent,
      avatarUrl: avatarUrl.trim(),
      coverUrl: coverUrl.trim(),
      kunuPriceKobo: finalPrice,
      kunuLabel: kunuLabel.trim() || "kunu",
      kunuEmoji: kunuEmoji.trim() || "🥤",
    });
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  };

  const loading = profileQuery.isPending || !session;
  const handle = session?.user?.username;
  const email = session?.user?.email;

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-kunu-clay">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        <p className="mt-3 text-sm">Loading settings…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-kunu-clay hover:text-kunu-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
        Settings
      </h1>
      <p className="mt-2 text-base text-kunu-ink-soft">
        Tweak your page, change your kunu price, manage your account.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-12">
        {/* Profile */}
        <section>
          <SectionTitle title="Your page" subtitle="What supporters see at /@{handle}" handle={handle} />

          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                required
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
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Tell supporters who you are and what their kunus help you do."
                className="w-full rounded-xl border-2 border-kunu-ink/15 bg-kunu-cream px-4 py-3 font-sans text-base text-kunu-ink placeholder:text-kunu-clay/60 focus:border-kunu-terracotta focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-kunu-clay">
                Plain text. Line breaks preserved.
              </p>
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
                    aria-pressed={accent === a.id}
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
              <p className="mt-1.5 text-xs text-kunu-clay">
                Sets the cover gradient and accent ring on your page.
              </p>
            </div>
          </div>
        </section>

        {/* Visuals */}
        <section>
          <SectionTitle title="Visuals" subtitle="Square avatar + wide cover image (URLs for now)" />
          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…/your-avatar.jpg"
              />
            </div>
            <div>
              <Label htmlFor="coverUrl">Cover URL</Label>
              <Input
                id="coverUrl"
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…/your-cover.jpg"
              />
              <p className="mt-1.5 text-xs text-kunu-clay">
                Leave both blank and we use the accent gradient + kunu emoji.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <SectionTitle title="Kunu pricing" subtitle="How much one kunu costs supporters" />
          <div className="mt-6 space-y-5">
            <div>
              <Label>Preset price</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {PRESET_PRICES.map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => {
                      setKunuPriceKobo(price);
                      setKunuPriceCustom("");
                    }}
                    className={cn(
                      "rounded-xl border-2 py-2.5 text-center font-display text-sm font-semibold transition-all",
                      kunuPriceKobo === price && !kunuPriceCustom
                        ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream"
                        : "border-kunu-ink/10 bg-kunu-cream text-kunu-ink hover:border-kunu-terracotta/40",
                    )}
                  >
                    {formatNaira(price)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="customPrice">Or set a custom price (₦)</Label>
              <Input
                id="customPrice"
                type="number"
                min={100}
                max={100000}
                step={50}
                value={kunuPriceCustom}
                onChange={(e) => setKunuPriceCustom(e.target.value)}
                placeholder="e.g. 750"
              />
              <p className="mt-1.5 text-xs text-kunu-clay">
                Between ₦100 and ₦100,000. We do the kobo conversion.
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
        </section>

        {/* Account */}
        <section>
          <SectionTitle title="Account" subtitle="The bits we can't let you edit (yet)" />
          <div className="mt-6 space-y-3 rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream-deep/30 p-5 text-sm">
            <Row label="Handle" value={`@${handle ?? "—"}`} hint="One handle per account for now. Email us to change it." />
            <Row label="Email" value={email ?? "—"} hint="Used for receipts and account recovery." />
          </div>
        </section>

        {/* Submit + sign out */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-kunu-ink/10 pt-8">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-500/30 bg-transparent px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-500 hover:bg-red-50 disabled:opacity-60"
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign out
          </button>
          <Button
            type="submit"
            size="lg"
            loading={upsert.isPending}
            disabled={upsert.isPending}
          >
            {upsert.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </main>
  );
}

function SectionTitle({
  title,
  subtitle,
  handle,
}: {
  title: string;
  subtitle: string;
  handle?: string | null;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-kunu-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-kunu-ink-soft">
        {handle
          ? subtitle.replace("{handle}", handle)
          : subtitle.replace("/@{handle}", "your page")}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
          {label}
        </div>
        <div className="mt-0.5 font-display text-base font-semibold text-kunu-ink">
          {value}
        </div>
      </div>
      <p className="max-w-xs text-right text-xs text-kunu-clay">{hint}</p>
    </div>
  );
}
