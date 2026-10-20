export const BRANDS = [
  {
    slug: "playstation", name: "PlayStation", from: "#00246b", to: "#0a7cff", platform: true,
    word: "PlayStation Store", label: "Gift Card",
    blurb: "Store credit for PS5 and PS4.",
    redeem: "Redeem on PlayStation Store for games, add-ons, and PlayStation Plus on PS5 and PS4.",
  },
  {
    slug: "xbox", name: "Xbox", from: "#0b5e0b", to: "#3fae2a", platform: true,
    word: "XBOX", label: "Gift Card",
    blurb: "Credit for games, add-ons, and Game Pass.",
    redeem: "Redeem on Xbox consoles, Windows PCs, and the Microsoft Store for games, add-ons, and Game Pass.",
  },
  {
    slug: "nintendo", name: "Nintendo", from: "#b4000e", to: "#ff2a3a", platform: true,
    word: "eShop", label: "Gift Card",
    blurb: "eShop cards for Nintendo Switch.",
    redeem: "Redeem in Nintendo eShop on Nintendo Switch for games and downloadable content.",
  },
  {
    slug: "steam", name: "Steam", from: "#0e141b", to: "#2a475e", platform: true,
    word: "STEAM", label: "Wallet Card",
    blurb: "Wallet cards for PC gaming.",
    redeem: "Adds funds to your Steam Wallet for games, software, and in-game items on Steam.",
  },
  {
    slug: "roblox", name: "Roblox", from: "#16171a", to: "#3b3e45", platform: false,
    word: "ROBLOX", label: "Gift Card",
    blurb: "Robux and Premium cards.",
    redeem: "Redeem on roblox.com for Robux or a Roblox Premium subscription.",
  },
  {
    slug: "fortnite", name: "Fortnite", from: "#1c0b52", to: "#5a1fd1", platform: false,
    word: "FORTNITE", label: "V-Bucks Card",
    blurb: "V-Bucks for skins and the Battle Pass.",
    redeem: "Redeem for V-Bucks in Fortnite on any platform that supports V-Bucks card redemption.",
  },
  {
    slug: "valorant", name: "VALORANT", from: "#0f1923", to: "#ff4655", platform: false,
    word: "VALORANT", label: "Gift Card",
    blurb: "Riot Points for VALORANT and League.",
    redeem: "Redeem in your Riot account for VALORANT Points.",
  },
  {
    slug: "apple", name: "Apple", from: "#e9ebf1", to: "#ffffff", platform: false,
    word: "Apple", label: "Gift Card",
    blurb: "For the App Store, apps, games, and more.",
    redeem: "Redeem in the App Store or Apple Account for apps, games, subscriptions, and more.",
  },
  {
    slug: "google-play", name: "Google Play", from: "#eef1f5", to: "#ffffff", platform: false,
    word: "Google Play", label: "Gift Card",
    blurb: "Credit for Android games and apps.",
    redeem: "Redeem in the Google Play Store for Android apps, games, and in-app purchases.",
  },
] as const;

export type BrandSlug = (typeof BRANDS)[number]["slug"];

export function isBrand(value: string): value is BrandSlug {
  return BRANDS.some((brand) => brand.slug === value);
}

export function brandOf(slug: string) {
  return BRANDS.find((brand) => brand.slug === slug) ?? BRANDS[0];
}

export const SHIPPING = [
  { id: "standard", name: "Standard mail", eta: "5–10 business days", price: 4.99 },
  { id: "tracked", name: "Tracked courier", eta: "2–5 business days", price: 12.99 },
] as const;

export type ShippingId = (typeof SHIPPING)[number]["id"];

export const FREE_STANDARD_OVER = 100;

export function shippingQuote(id: string, subtotal: number) {
  const method = SHIPPING.find((entry) => entry.id === id);
  if (!method) return null;
  const price = method.id === "standard" && subtotal >= FREE_STANDARD_OVER ? 0 : method.price;
  return { ...method, price };
}
