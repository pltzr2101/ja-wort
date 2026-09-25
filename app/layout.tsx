import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const displayAltFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-alt",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const bodySerifFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JaWort – Unsere Hochzeit",
  description: "Eine passwortgeschuetzte Hochzeits-Website.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Root-Layout: bindet die Google Fonts (Cormorant Garamond fuer Headlines,
 * Inter fuer Fliesstext) als self-hosted Fonts ein und setzt die Basis-Schriftart.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${displayFont.variable} ${displayAltFont.variable} ${bodyFont.variable} ${bodySerifFont.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
