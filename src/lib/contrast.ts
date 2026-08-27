/**
 * WCAG 2.1 relative luminance and contrast ratio.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * Used at build time by the token review page and by scripts/audit-contrast.mjs.
 * No runtime dependency — this ships nothing to the browser.
 */

export type Hex = `#${string}`;

function channel(srgb8: number): number {
  const c = srgb8 / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** @throws if `hex` is not a 6-digit hex colour. */
export function luminance(hex: Hex): number {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) {
    throw new Error(`luminance: expected 6-digit hex, received "${hex}"`);
  }
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio, 1–21. Order of arguments does not matter. */
export function contrastRatio(a: Hex, b: Hex): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type Grade = "AAA" | "AA" | "AA large" | "fail";

/**
 * Grades a ratio against WCAG 2.1.
 * "AA large" applies at >=24px regular or >=18.66px bold, and to the
 * non-text contrast requirement (1.4.11) for UI components.
 */
export function grade(ratio: number): Grade {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}
