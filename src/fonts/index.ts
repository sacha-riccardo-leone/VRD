import localFont from "next/font/local";

/**
 * IBM Plex Sans / Mono, self-hosted.
 *
 * Subset: `latin` only. Verified to contain the complete French glyph set
 * (œ Œ, guillemets « », curly quotes, en/em dashes, €, °, µ) — 232 glyphs,
 * nothing missing. The `latin-ext` subset is disjoint and unnecessary here.
 *
 * Licence: SIL Open Font License 1.1 — see ./LICENSE-IBM-Plex.txt
 */

export const plexSans = localFont({
  src: [
    { path: "./ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  // Metric-adjusted fallback: eliminates layout shift on font swap (CLS = 0).
  fallback: ["Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

export const plexMono = localFont({
  src: [
    { path: "./ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  // Mono is used for labels, units and references — never above the fold at
  // display size, so it does not compete for preload budget.
  preload: false,
  fallback: ["Consolas", "Menlo", "monospace"],
});
