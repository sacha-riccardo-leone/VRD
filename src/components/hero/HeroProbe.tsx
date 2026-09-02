"use client";

import { useEffect, useState } from "react";
import { SONDE, pieges, resumes, type Piege, type Resume } from "./probe";
import s from "./HeroProbe.module.css";

/**
 * Superposition de diagnostic, visible seulement avec `?debug=hero`.
 *
 * Elle existe pour répondre par la MESURE à deux questions restées ouvertes,
 * et sur l'appareil concerné — un iPhone — qu'aucun outil d'ici ne peut
 * simuler. Deux correctifs ont déjà été livrés sur la première en se fondant
 * sur un raisonnement plutôt que sur des chiffres ; aucun n'a tenu.
 *
 * Lecture attendue au moment où la fuite apparaît :
 *   - plaque.bas < fenetre.bas          -> défaut de COUVERTURE
 *   - suite.haut < fenetre.bas
 *     alors que la plaque couvre        -> défaut d'OPACITÉ ou de RETRAIT
 *   - la plaque a déjà disparu          -> défaut de CALENDRIER
 *   - un piège est listé                -> bloc conteneur : `fixed` ne se
 *                                          positionne pas sur la fenêtre
 */
export function HeroProbe() {
  const [txt, setTxt] = useState<string | null>(null);
  const [alerte, setAlerte] = useState(false);

  useEffect(() => {
    if (!SONDE) return;

    let stop = false;
    let dernier = performance.now();
    let images = 0;
    let sautees = 0;
    let pire = 0;

    // Compteur d'images : un intervalle au-delà de 20 ms est une image perdue à
    // 60 Hz. C'est la mesure qui dira si le défilement au doigt saccade encore.
    const battre = () => {
      if (stop) return;
      const t = performance.now();
      const dt = t - dernier;
      dernier = t;
      images += 1;
      if (dt > 20) sautees += 1;
      if (dt > pire) pire = dt;
      requestAnimationFrame(battre);
    };
    requestAnimationFrame(battre);

    const nb = (v: number) => Math.round(v);

    const rendre = () => {
      if (stop) return;
      const plaque = document.querySelector<HTMLElement>('[class*="plate"]');
      const titre = document.querySelector<HTMLElement>("h1");
      // La sonde est elle-même le frère suivant du titre : la sauter, sinon
      // elle se mesure elle-même et rend un verdict faux.
      let suite = titre?.nextElementSibling as HTMLElement | null;
      while (suite && suite.hasAttribute("data-hero-probe")) {
        suite = suite.nextElementSibling as HTMLElement | null;
      }
      const vv = window.visualViewport;

      const pr = plaque?.getBoundingClientRect();
      const sr = suite?.getBoundingClientRect();
      const basFenetre = vv ? vv.height : window.innerHeight;

      const p = plaque
        ? Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
        : 0;

      // Le diagnostic, formulé comme une question tranchable.
      let verdict = "—";
      if (pr && sr) {
        const plaqueCouvre = pr.bottom >= basFenetre - 0.5;
        const suiteVisible = sr.top < basFenetre - 0.5;
        const plaqueRetiree = getComputedStyle(plaque!).visibility === "hidden";
        if (plaqueRetiree && p < 0.99) verdict = "CALENDRIER (plaque retiree trop tot)";
        else if (suiteVisible && !plaqueCouvre) verdict = "COUVERTURE (plaque trop courte)";
        else if (suiteVisible && plaqueCouvre) verdict = "OPACITE (plaque couvre mais laisse voir)";
        else verdict = "ok";
      }

      // On part du PARENT : l'`overflow` de la plaque elle-même ne crée pas de
      // bloc conteneur pour elle-même, et le lister ici ferait lire un piège là
      // où il n'y en a pas. Il comptera en revanche le jour où la plaque passera
      // en `position: sticky`, d'où la ligne séparée.
      const tr: Piege[] = pieges(plaque?.parentElement ?? null);
      const rs: Resume[] = resumes();

      const l: string[] = [];
      l.push(`p=${p.toFixed(3)}  scrollY=${nb(window.scrollY)}  dpr=${window.devicePixelRatio}`);
      l.push(
        `innerH=${nb(window.innerHeight)} clientH=${nb(document.documentElement.clientHeight)}` +
          (vv ? ` vvH=${nb(vv.height)} vvTop=${nb(vv.offsetTop)} vvScale=${vv.scale.toFixed(2)}` : " vv=n/a"),
      );
      if (pr) l.push(`plaque top=${nb(pr.top)} bas=${nb(pr.bottom)} vis=${getComputedStyle(plaque!).visibility}`);
      if (sr) l.push(`suite <${suite!.tagName.toLowerCase()}> haut=${nb(sr.top)}  (bas fenetre=${nb(basFenetre)})`);
      l.push(`VERDICT: ${verdict}`);
      l.push(
        tr.length
          ? `PIEGES: ${tr.map((t) => `${t.el} {${Object.entries(t.ecarts).map(([k, v]) => `${k}:${v}`).join(" ")}}`).join(" | ")}`
          : "PIEGES: aucun (chaine d'ancetres propre)",
      );
      if (plaque) {
        const po = getComputedStyle(plaque).overflow;
        l.push(`plaque overflow=${po}${po !== "visible" ? "  (bloquerait un sticky)" : ""}`);
      }
      l.push(
        `images=${images} perdues=${sautees} (${images ? Math.round((100 * sautees) / images) : 0}%) pire=${pire.toFixed(0)}ms`,
      );
      for (const r of rs) {
        l.push(`${r.nom}: n=${r.n} p50=${r.p50.toFixed(2)} p95=${r.p95.toFixed(2)} max=${r.max.toFixed(2)} ms`);
      }
      if (!rs.length) l.push("temps par image : aucun relevé (defilez sur le hero)");

      setAlerte(verdict !== "ok" && verdict !== "—");
      setTxt(l.join("\n"));
    };

    rendre();
    const id = window.setInterval(rendre, 250);
    return () => {
      stop = true;
      window.clearInterval(id);
    };
  }, []);

  if (!txt) return null;
  return (
    <div
      data-hero-probe=""
      className={`${s.probe} ${alerte ? s.alerte : s.bon}`}
      role="status"
      aria-live="off"
    >
      {txt}
    </div>
  );
}
