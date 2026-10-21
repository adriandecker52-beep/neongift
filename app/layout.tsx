import type { Metadata } from "next";
import { Manrope, Orbitron, Unbounded } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-display" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-logo" });

export const metadata: Metadata = {
  title: { default: "Neon Gift — Physical gift cards", template: "%s · Neon Gift" },
  description: "Physical PlayStation, Xbox, Nintendo, Steam, and Roblox gift cards. Shipped sealed. Pay with crypto through Trybit.",
  other: { "trybit-verification": "3wiczr643a8pzn29masqwfkz9xbzwj5h" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${unbounded.variable} ${orbitron.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
