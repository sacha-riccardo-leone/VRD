/**
 * Sonde du hero — instrumentation, jamais du décor.
 *
 * Active uniquement si l'URL porte `?debug=hero`. Sans ce drapeau, `mesure`
 * est un simple appel de fonction : aucun chronomètre, aucune allocation,
 * aucun coût. Le but est de trancher deux questions par la mesure et non par
 * l'hypothèse, sur l'appareil réel :
 *
 *   1. D'où vient le contenu visible trop tôt sur iPhone — couverture,
 *      empilement, ou hauteur de flux ?
 *   2. Qui consomme le temps par image : le portail ou le champ thermique ?
 *      Si c'est le champ, réécrire le portail ne réglera rien.
 */

export const SONDE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("debug") === "hero";

type Serie = { n: number; max: number; echantillons: number[] };
const series = new Map<string, Serie>();

/** Garde les 240 dernières durées : de quoi lire une médiane et un p95 stables. */
export function releve(nom: string, ms: number): void {
  let s = series.get(nom);
  if (!s) {
    s = { n: 0, max: 0, echantillons: [] };
    series.set(nom, s);
  }
  s.n += 1;
  if (ms > s.max) s.max = ms;
  s.echantillons.push(ms);
  if (s.echantillons.length > 240) s.echantillons.shift();
}

/** Enveloppe un travail par image. Neutre quand la sonde est éteinte. */
export function mesure<T>(nom: string, fn: () => T): T {
  if (!SONDE) return fn();
  const t0 = performance.now();
  try {
    return fn();
  } finally {
    releve(nom, performance.now() - t0);
  }
}

export type Resume = { nom: string; n: number; p50: number; p95: number; max: number };

export function resumes(): Resume[] {
  const out: Resume[] = [];
  for (const [nom, s] of series) {
    const t = [...s.echantillons].sort((a, b) => a - b);
    const q = (p: number) => (t.length ? t[Math.min(t.length - 1, Math.floor(p * t.length))] : 0);
    out.push({ nom, n: s.n, p50: q(0.5), p95: q(0.95), max: s.max });
  }
  return out;
}

/**
 * Valeurs par défaut des propriétés qui, si elles en dévient, créent un bloc
 * conteneur : `position: fixed` se positionne alors sur cet ancêtre et non sur
 * la fenêtre. `overflow` est du même ordre pour `position: sticky`, qui échoue
 * SILENCIEUSEMENT dans un ancêtre `hidden` ou `clip`. Les deux produisent
 * « du contenu visible trop tôt » et survivent à toute correction de hauteur.
 */
const DEFAUTS: Record<string, string> = {
  transform: "none",
  filter: "none",
  perspective: "none",
  willChange: "auto",
  contain: "none",
  backdropFilter: "none",
  containerType: "normal",
  overflow: "visible",
  overflowX: "visible",
  overflowY: "visible",
  isolation: "auto",
};

export type Piege = { el: string; ecarts: Record<string, string> };

/** Remonte la chaîne des ancêtres et relève tout ce qui n'est pas par défaut. */
export function pieges(depuis: Element | null): Piege[] {
  const out: Piege[] = [];
  for (let el: Element | null = depuis; el; el = el.parentElement) {
    const cs = getComputedStyle(el);
    const ecarts: Record<string, string> = {};
    for (const [k, def] of Object.entries(DEFAUTS)) {
      const v = (cs as unknown as Record<string, string>)[k];
      if (v && v !== def) ecarts[k] = v;
    }
    if (Object.keys(ecarts).length) {
      const cls = typeof el.className === "string" ? el.className : "";
      out.push({ el: `${el.tagName.toLowerCase()}${cls ? "." + cls.split(/\s+/)[0] : ""}`, ecarts });
    }
  }
  return out;
}
