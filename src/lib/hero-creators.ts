export interface HeroCreator {
  handle: string;
  displayName: string;
  role: string;
  city: string;
  kunuPriceKobo: number;
  accent: "terracotta" | "ochre" | "green";
  avatarSeed: string;
  recentMessage: string;
}

export const HERO_CREATORS: HeroCreator[] = [
  {
    handle: "ada",
    displayName: "Ada Okonkwo",
    role: "Illustrator",
    city: "Lagos",
    kunuPriceKobo: 50000,
    accent: "terracotta",
    avatarSeed: "Ada",
    recentMessage: "Your prints save my walls.",
  },
  {
    handle: "bolanle.codes",
    displayName: "Bolanle Adesina",
    role: "Dev educator",
    city: "Ibadan",
    kunuPriceKobo: 75000,
    accent: "ochre",
    avatarSeed: "Bolanle",
    recentMessage: "Got my first job thanks to your tutorials.",
  },
  {
    handle: "kofi.beats",
    displayName: "Kofi Asare",
    role: "Music producer",
    city: "Kumasi",
    kunuPriceKobo: 50000,
    accent: "green",
    avatarSeed: "Kofi",
    recentMessage: "Your EP is on repeat all week.",
  },
];

export const HERO_ACCENT_FRAMES: Record<HeroCreator["accent"], { back: string; mid: string; ring: string }> = {
  terracotta: {
    back: "bg-kunu-terracotta-deep/90",
    mid: "bg-kunu-ochre",
    ring: "ring-kunu-terracotta/30",
  },
  ochre: {
    back: "bg-kunu-ochre",
    mid: "bg-kunu-terracotta-soft",
    ring: "ring-kunu-ochre/40",
  },
  green: {
    back: "bg-kunu-green-deep",
    mid: "bg-kunu-green-soft",
    ring: "ring-kunu-green/40",
  },
};
