export const landingCopy = {
  brand: {
    name: "Buy Me Kunu",
    domain: "buymekunu.com",
    tagline: "Get paid in kunus.",
  },
  hero: {
    eyebrow: "Built for African creators",
    headlinePre: "Get paid in",
    headlineHighlight: "kunus.",
    subhead:
      "The simplest way for African creators to receive support — one kunu at a time. Powered by Paystack. Paid out in naira, into your Nigerian bank account.",
    primaryCta: "Claim my page",
    secondaryCta: "See an example",
    footnote: "Free to start. We take 5% per tip. No subscription.",
  },
  howItWorks: {
    eyebrow: "How it works",
    headline: "Three steps. Two minutes. One kunu at a time.",
    steps: [
      {
        n: "1",
        title: "Claim your @handle.",
        body: "Pick a username, set your kunu price, write a one-line bio. Takes 30 seconds.",
      },
      {
        n: "2",
        title: "Share your link.",
        body: "Drop buymekunu.com/@you in your Twitter bio, on WhatsApp status, anywhere your audience already lives.",
      },
      {
        n: "3",
        title: "Get paid in naira.",
        body: "Tips land in your wallet. Withdraw to your Nigerian bank account whenever you want. No FX, no waiting.",
      },
    ],
  },
  valueProps: {
    eyebrow: "Why Buy Me Kunu",
    headline: "Built around how Africa actually pays.",
    items: [
      {
        title: "Naira-native. No FX surprises.",
        body: "Supporters pay in ₦. You get paid in ₦. No dollar-conversion fees eating into your tips.",
        accent: "terracotta" as const,
      },
      {
        title: "No subscription. Ever.",
        body: "We make money when you do. 5% per tip — flat. No monthly fee for memberships either.",
        accent: "cream" as const,
      },
      {
        title: "Set your own kunu price.",
        body: "₦100 a kunu? ₦10,000? Your audience, your call. Update it anytime.",
        accent: "cream" as const,
      },
      {
        title: "Real messages from real fans.",
        body: "Every tip can come with a note from your supporter. Save them. Frame them.",
        accent: "cream" as const,
      },
    ],
  },
  pricing: {
    eyebrow: "Honest pricing",
    headline: "Free to start. 5% per tip.",
    subhead:
      "No subscriptions. No setup fees. No monthly minimums. We make money when you do.",
    comparison: [
      { name: "Buy Me a Coffee", fee: "5% + $5/mo for memberships" },
      { name: "Patreon", fee: "8–12% per transaction" },
      { name: "Buy Me Kunu", fee: "5% flat. Memberships included.", us: true },
    ],
    footnote:
      "Paystack's standard processing fees apply (1.5% + ₦100, capped at ₦2,000). We don't add anything on top.",
  },
  faq: {
    eyebrow: "FAQ",
    headline: "Frequently asked, freshly answered.",
    items: [
      {
        q: "When do I get paid?",
        a: "Tips land in your wallet instantly. Withdraw to your bank account anytime — payouts typically settle within one business day via Paystack.",
      },
      {
        q: "Do my supporters need an account?",
        a: "Nope. They just need an email and a payment method. They can sign up afterwards to track who they've supported, but it's completely optional.",
      },
      {
        q: "Can I sign up as an individual?",
        a: "Yes. Signup takes about two minutes. To withdraw funds, you'll need a verified Nigerian bank account. For v1 we route payouts through our verified business and forward to your bank.",
      },
      {
        q: "Can I migrate from Patreon or BMC?",
        a: "Bring your audience over with a simple link change — anywhere you currently link to Patreon, swap in your buymekunu.com/@handle. A one-click subscriber import is in beta.",
      },
      {
        q: "Which countries do you support?",
        a: "We launched in Nigeria first (NGN only). Ghana, Kenya, and South Africa are next on the roadmap — Paystack already supports all three.",
      },
      {
        q: "What's a kunu, anyway?",
        a: "A sweet, spiced millet drink from Northern Nigeria. Also: the universal unit of creator support on this site. Set your own price per kunu.",
      },
      {
        q: "How is this different from Patreon?",
        a: "Three things: (1) built around the Nigerian payment stack, not US/EU; (2) you set the kunu price per creator, not per tier; (3) one-off tips are first-class — supporters don't have to commit to monthly just to support you.",
      },
    ],
  },
  finalCta: {
    eyebrow: "Your turn",
    headline: "Claim your @handle. Pour your first kunu.",
    footnote: "It takes less time than making actual kunu.",
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "How it works", href: "#how-it-works" },
          { label: "Pricing", href: "#pricing" },
          { label: "FAQ", href: "#faq" },
          { label: "Roadmap", href: "/roadmap" },
        ],
      },
      {
        title: "Creators",
        links: [
          { label: "Example pages", href: "#demo-creators" },
          { label: "Creator guide", href: "/guide" },
          { label: "Sign in", href: "/signin" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        title: "Legal",
        links: [
          { label: "Terms", href: "/terms" },
          { label: "Privacy", href: "/privacy" },
          { label: "Refund policy", href: "/refunds" },
        ],
      },
    ],
    social: [
      { name: "X / Twitter", href: "https://x.com/buymekunu", icon: "x" },
      { name: "Instagram", href: "https://instagram.com/buymekunu", icon: "instagram" },
    ],
    legalLine: "Made with care in Lagos. © 2026 Buy Me Kunu.",
  },
} as const;
