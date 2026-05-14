import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://buymekunu.com"),
  title: {
    default: "Buy Me Kunu — Get paid in kunus. Built for African creators.",
    template: "%s · Buy Me Kunu",
  },
  description:
    "The simplest way for African creators to receive support. One-off tips and memberships, in naira. Powered by Paystack.",
  keywords: [
    "buy me a coffee",
    "buy me kunu",
    "tip jar",
    "creator support",
    "Nigerian creators",
    "Paystack",
    "naira tips",
    "Patreon alternative",
    "African creators",
  ],
  authors: [{ name: "Buy Me Kunu" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    title: "Buy Me Kunu — Get paid in kunus.",
    description:
      "Tips and memberships for African creators. In naira. Powered by Paystack.",
    siteName: "Buy Me Kunu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Me Kunu — Get paid in kunus.",
    description:
      "Tips and memberships for African creators. In naira. Powered by Paystack.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF5EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen bg-kunu-cream text-kunu-ink">
        {children}
        <Toaster
          position="bottom-center"
          theme="light"
          toastOptions={{
            classNames: {
              toast:
                "!bg-kunu-cream !text-kunu-ink !border-kunu-clay/30 !font-sans",
            },
          }}
        />
      </body>
    </html>
  );
}
