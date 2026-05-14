export interface DemoCreator {
  handle: string;
  displayName: string;
  tagline: string;
  city: string;
  kunuPriceKobo: number;
  accent: "terracotta" | "ochre" | "green" | "clay";
  avatarSeed: string;
  recentMessage: string;
  totalKunus: number;
  supporters: number;
}

export const demoCreators: DemoCreator[] = [
  {
    handle: "chioma.eats",
    displayName: "Chioma Okafor",
    tagline: "Lagos food writer · home cooking, jollof debates",
    city: "Lagos, NG",
    kunuPriceKobo: 50000,
    accent: "terracotta",
    avatarSeed: "Chioma",
    recentMessage: "Your egusi recipe saved my Sunday 🙏",
    totalKunus: 1247,
    supporters: 318,
  },
  {
    handle: "kwame.draws",
    displayName: "Kwame Mensah",
    tagline: "Illustrator · West African folklore, daily sketches",
    city: "Accra, GH",
    kunuPriceKobo: 100000,
    accent: "ochre",
    avatarSeed: "Kwame",
    recentMessage: "Bought print of the Anansi piece. Framed it.",
    totalKunus: 892,
    supporters: 201,
  },
  {
    handle: "adaobi.writes",
    displayName: "Adaobi Eze",
    tagline: "Poet · diaspora, language, longing",
    city: "Abuja, NG",
    kunuPriceKobo: 30000,
    accent: "green",
    avatarSeed: "Adaobi",
    recentMessage: "Read your collection three times. Each one different.",
    totalKunus: 2104,
    supporters: 542,
  },
  {
    handle: "bolanle.codes",
    displayName: "Bolanle Adesina",
    tagline: "Dev educator · TypeScript, Next.js for beginners",
    city: "Ibadan, NG",
    kunuPriceKobo: 75000,
    accent: "clay",
    avatarSeed: "Bolanle",
    recentMessage: "Your YouTube channel got me my first dev job ❤️",
    totalKunus: 1583,
    supporters: 412,
  },
  {
    handle: "kofi.beats",
    displayName: "Kofi Asare",
    tagline: "Music producer · highlife meets lo-fi",
    city: "Kumasi, GH",
    kunuPriceKobo: 50000,
    accent: "terracotta",
    avatarSeed: "Kofi",
    recentMessage: "The new EP is fire. On repeat.",
    totalKunus: 671,
    supporters: 154,
  },
  {
    handle: "temi.fashion",
    displayName: "Temi Olutayo",
    tagline: "Stylist · ankara meets streetwear",
    city: "Lagos, NG",
    kunuPriceKobo: 100000,
    accent: "ochre",
    avatarSeed: "Temi",
    recentMessage: "Got compliments on the fit all day. Thank you.",
    totalKunus: 950,
    supporters: 246,
  },
];

export function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(
    seed,
  )}&backgroundType=gradientLinear&backgroundColor=fbf5ec,f4ebd9,f4d7a3`;
}
