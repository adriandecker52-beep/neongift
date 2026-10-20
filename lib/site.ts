export const STORE_NAME = "Neon Gift";

export function supportEmail() {
  return process.env.SUPPORT_EMAIL || "support@neonvault.local";
}

export type SocialId = "x" | "instagram" | "discord" | "telegram";

export function socialLinks(): { id: SocialId; label: string; href: string; external: boolean }[] {
  const all: { id: SocialId; label: string; url: string | undefined }[] = [
    { id: "x", label: "X", url: process.env.SOCIAL_X },
    { id: "instagram", label: "Instagram", url: process.env.SOCIAL_INSTAGRAM },
    { id: "discord", label: "Discord", url: process.env.SOCIAL_DISCORD },
    { id: "telegram", label: "Telegram", url: process.env.SOCIAL_TELEGRAM },
  ];
  return all.map(({ id, label, url }) => ({ id, label, href: url || "/contact", external: Boolean(url) }));
}
