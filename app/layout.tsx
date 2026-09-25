import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Die Schriften werden bewusst self-hosted (next/font/local statt
 * next/font/google), damit der Produktions-Build vollstaendig offline und
 * deterministisch ablaeuft. next/font/google laedt die Fonts erst beim Build
 * von fonts.googleapis.com herunter; in isolierten CI-/Docker-Builds ohne
 * Zugriff auf Google Fonts schlaegt genau das mit
 * "Cannot read properties of null (reading '1')" fehl.
 */

const displayFont = localFont({
  src: [
    { path: "../fonts/cormorant-garamond/400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond/500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond/600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorant-garamond/700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const displayAltFont = localFont({
  src: [
    { path: "../fonts/playfair-display/400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/playfair-display/500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/playfair-display/600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/playfair-display/700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display-alt",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    { path: "../fonts/inter/400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter/500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter/600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/inter/700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const bodySerifFont = localFont({
  src: [
    { path: "../fonts/lora/400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/lora/500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/lora/600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body-serif",
  display: "swap",
});

// Koreanische Schrift fuer die "ko"-Sprachvariante (Latin-Subset, damit
// lateinische Zeichen im koreanischen Layout dieselbe Anmutung behalten).
// preload: false vermeidet das Vorab-Laden auf deutschen Seiten.
const koreanFont = localFont({
  src: [
    { path: "../fonts/noto-sans-kr/400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/noto-sans-kr/500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/noto-sans-kr/700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ko",
  display: "swap",
  preload: false,
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
 * Root-Layout: bindet die self-hosted Fonts (Cormorant Garamond fuer Headlines,
 * Inter fuer Fliesstext) ein und setzt die Basis-Schriftart.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${displayFont.variable} ${displayAltFont.variable} ${bodyFont.variable} ${bodySerifFont.variable} ${koreanFont.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
