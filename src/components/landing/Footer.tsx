import Link from "next/link";
import { landingCopy } from "@/lib/landing-copy";
import { KunuCupGlyph } from "./KunuCupGlyph";

export function Footer() {
  const c = landingCopy.footer;

  return (
    <footer className="relative bg-kunu-night text-kunu-cream-deep">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand block */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <KunuCupGlyph size={36} fillLevel={0.6} animate={false} withStraw />
              <span className="font-display text-2xl font-semibold tracking-tight text-kunu-cream">
                buymekunu
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-kunu-cream-deep/70 text-pretty">
              The simplest way for African creators to receive support — one kunu at a time.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {c.social.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-kunu-cream/15 text-kunu-cream-deep transition-colors hover:border-kunu-ochre hover:text-kunu-ochre"
                >
                  {s.icon === "x" ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {c.columns.map((col) => (
              <div key={col.title}>
                <div className="font-display text-sm font-semibold text-kunu-cream">
                  {col.title}
                </div>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-kunu-cream-deep/70 transition-colors hover:text-kunu-ochre"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-kunu-cream/10 pt-6 text-xs text-kunu-cream-deep/60">
          {c.legalLine}
        </div>
      </div>
    </footer>
  );
}
