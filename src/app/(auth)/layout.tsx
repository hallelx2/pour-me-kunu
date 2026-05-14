import Link from "next/link";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {/* Background atmosphere — mirrors hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-kunu-ochre/35 via-kunu-terracotta/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-kunu-green/15 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-adinkra-pattern opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-kunu-ink"
        >
          <KunuCupGlyph size={28} fillLevel={0.65} animate={false} />
          <span className="transition-colors group-hover:text-kunu-terracotta">
            buymekunu
          </span>
        </Link>
      </header>

      <main className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-4 sm:px-0 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
