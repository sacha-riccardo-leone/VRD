#!/usr/bin/env node
/**
 * Reads the hex values out of src/styles/tokens.css and prints the WCAG 2.1
 * contrast matrix for every foreground/background pair we actually ship.
 *
 * Fails with exit code 1 if any pair drops below the level declared for it.
 * Run: npm run audit:contrast
 *
 * No dependencies. Deliberately duplicates the small formula in
 * src/lib/contrast.ts rather than importing TS through a build step.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TOKENS = join(ROOT, "src/styles/tokens.css");

const channel = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const h = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Bad hex: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Minimum ratio each pair must hold, per scope. `null` = decorative, not
 * asserted. `.technique` inverts the palette, so its overrides are checked
 * against the dark surface rather than the paper one.
 */
const CONTRACT = {
  ":root": [
    ["ink", "paper", 4.5, "corps de texte"],
    ["ink-muted", "paper", 4.5, "texte secondaire"],
    ["rule-strong", "paper", 3.0, "séparateurs porteurs de sens"],
    ["rule", "paper", null, "décoratif"],
    ["on-signal", "signal", 4.5, "texte SUR le remplissage jaune"],
    ["on-dark", "dark", 4.5, "corps de texte (fond sombre)"],
    ["on-dark-muted", "dark", 4.5, "texte secondaire (fond sombre)"],
    ["signal", "dark", 4.5, "accent en premier plan — fond sombre uniquement"],
    ["dark-rule", "dark", null, "décoratif"],
  ],
  ".technique": [["rule-strong", "dark", 3.0, "séparateurs porteurs de sens (fond sombre)"]],
};

/**
 * Pairs that must NEVER be used as foreground-on-background, printed with
 * their real ratio so the number stays in front of whoever is tempted.
 * Asserted as a ceiling: if one ever climbs past 3:1 a token has moved and
 * the prohibition needs re-deciding rather than silently outliving its reason.
 */
const FORBIDDEN = [
  ["signal", "paper", 3.0, "jaune en premier plan sur papier — remplissage uniquement"],
];

const css = await readFile(TOKENS, "utf8");

/**
 * Reads the declarations of one selector block. Scoping matters: `.technique`
 * redefines several root tokens, and a flat scan silently grades the dark
 * override against the light surface.
 */
function scope(selector) {
  const start = css.indexOf(selector + " {");
  if (start === -1) throw new Error(`Selector not found in tokens.css: ${selector}`);
  const open = css.indexOf("{", start);
  const end = css.indexOf("\n}", open);
  const body = css.slice(open, end);
  return Object.fromEntries(
    [...body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]),
  );
}

const root = scope(":root");
const scopes = { ":root": root, ".technique": { ...root, ...scope(".technique") } };

let failed = 0;

console.log("\n  scope        token pair                            ratio    min   verdict  usage");
console.log("  " + "-".repeat(98));

for (const [sel, pairs] of Object.entries(CONTRACT)) {
  const vars = scopes[sel];
  for (const [fg, bg, min, use] of pairs) {
    const [f, b] = [vars[fg], vars[bg]];
    if (!f || !b) {
      console.log(`  MISSING TOKEN in ${sel}: --${fg} or --${bg}`);
      failed++;
      continue;
    }
    const r = ratio(f, b);
    const ok = min === null || r >= min;
    if (!ok) failed++;
    const pair = `--${fg} on --${bg}`.padEnd(36);
    const verdict = min === null ? "  n/a  " : ok ? "  pass " : "  FAIL ";
    console.log(
      `  ${sel.padEnd(12)} ${pair} ${r.toFixed(2).padStart(5)}:1  ${String(min ?? "—").padStart(4)}  ${verdict}  ${use}`,
    );
  }
}

console.log("\n  INTERDIT — jamais en premier plan");
console.log("  " + "-".repeat(98));
for (const [fg, bg, ceiling, why] of FORBIDDEN) {
  const r = ratio(root[fg], root[bg]);
  const stale = r >= ceiling;
  if (stale) failed++;
  console.log(
    `  ${"—".padEnd(12)} ${`--${fg} on --${bg}`.padEnd(36)} ${r.toFixed(2).padStart(5)}:1  ${String("<" + ceiling).padStart(4)}  ${stale ? "  STALE" : "  n/a  "}  ${why}`,
  );
}

console.log("");
if (failed) {
  console.error(`  ${failed} pair(s) out of contract.\n`);
  process.exit(1);
}
console.log("  All asserted pairs meet contract.\n");
