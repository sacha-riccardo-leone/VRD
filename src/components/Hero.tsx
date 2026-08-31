"use client";

import { useEffect, useRef } from "react";
import { ThermalField } from "./ThermalField";
import s from "./Hero.module.css";

/**
 * Hero — portail blanc. Les lettres sont des fenêtres sur la page.
 *
 * Une plaque anthracite couvre l'écran, PERCÉE aux lettres « VRD ». Derrière
 * elle : la page réelle, qui défile normalement. On voit donc le document AU
 * TRAVERS du sigle — et comme le papier est clair, les lettres se lisent
 * blanches. C'est le portail de la variante (A), mais ce qu'il révèle n'est plus
 * une surface morte : c'est le contenu lui-même.
 *
 * Au défilement, le masque grandit autour d'un point pris dans le PLEIN du R.
 * Le trou s'élargit, on voit de plus en plus de page, jusqu'à ce que la plaque
 * ait entièrement disparu. La course vaut exactement un écran : quand le masque
 * est grand ouvert, la première section arrive en haut de l'écran — aucun temps
 * mort, aucune page blanche entre les deux.
 *
 * Le repère du fût du R est MESURÉ sur un jumeau du texte réellement rendu :
 * un <text> placé dans <defs> n'est jamais mis en page, les API de mesure y
 * échouent, et le repli tombait sur le centre exact de « VRD » — c'est-à-dire
 * le contrepoinçon du R. L'anthracite grandissait alors au lieu du blanc, d'où
 * l'écran noir. Aucun fondu n'est utilisé : l'ouverture grandit jusqu'à
 * dépasser la fenêtre, puis la plaque est simplement retirée — invisible,
 * puisqu'elle n'affichait déjà plus rien.
 *
 * Le champ thermique se dessine PAR-DESSUS la plaque : il appartient à
 * l'anthracite, pas aux lettres. Il s'efface dès que la plongée commence.
 */

const HIDE_AT = 0.85;

export function Hero() {
  const plateRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const plate = plateRef.current;
    const mask = maskRef.current;
    const text = measureRef.current;
    const field = fieldRef.current;
    const overlay = overlayRef.current;
    if (!plate || !mask || !text || !field || !overlay) return;

    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) {
      plate.dataset.portal = "off";
      return;
    }

    // ------------------------------------------------------------------
    // Repère de plongée : TROUVÉ EN SONDANT LES PIXELS, pas estimé.
    //
    // Trois tentatives ont échoué en devinant où se trouve le fût du R. Ici on
    // dessine le glyphe sur un canvas hors écran et on cherche la première
    // colonne d'encre à mi-hauteur de capitale : c'est le fût, quelle que soit
    // la police. On en déduit aussi sa LARGEUR, donc l'échelle réellement
    // nécessaire pour que l'ouverture dépasse la fenêtre.
    //
    // La mesure attend `document.fonts.ready` : lancée trop tôt, elle porte sur
    // la police de repli et le résultat tombe à côté — c'était le défaut.
    // ------------------------------------------------------------------
    let ox = 531; // repli calculé pour Plex : dans le fût, jamais dans un creux
    let oy = 395;
    let maxScale = 200;

    const measure = () => {
      let frac = 0.17; // position du fût dans la chasse, en repli
      let stemFrac = 0.14; // largeur du fût, en repli

      try {
        const cs = getComputedStyle(text);
        const size = parseFloat(cs.fontSize) || 300;
        const cv = document.createElement("canvas");
        cv.width = Math.ceil(size * 1.2);
        cv.height = Math.ceil(size * 1.4);
        const c = cv.getContext("2d", { willReadFrequently: true });
        if (c) {
          c.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
          c.textBaseline = "alphabetic";
          c.fillStyle = "#000";
          const baseline = size * 1.1;
          c.fillText("R", 0, baseline);
          const advance = c.measureText("R").width;
          const row = Math.round(baseline - size * 0.36); // mi-hauteur de capitale
          const px = c.getImageData(0, row, cv.width, 1).data;

          // Première colonne d'encre, puis fin de cette colonne : le fût.
          let a = -1;
          let b = -1;
          for (let i = 0; i < cv.width; i++) {
            const on = px[i * 4 + 3] > 128;
            if (on && a < 0) a = i;
            if (a >= 0 && !on) { b = i; break; }
          }
          if (a >= 0 && b > a && advance > 0) {
            frac = (a + b) / 2 / advance;
            stemFrac = (b - a) / advance;
          }
        }
      } catch {
        // Canvas indisponible : on garde les valeurs de repli.
      }

      try {
        const a = text.getStartPositionOfChar(1); // le R
        const b = text.getEndPositionOfChar(1);
        if (b.x > a.x) {
          const chasse = b.x - a.x;
          ox = a.x + chasse * frac;
          oy = a.y - 300 * 0.36;
          // Échelle nécessaire pour que le fût couvre la fenêtre, majorée de 40 %.
          const demi = Math.max((chasse * stemFrac) / 2, 1);
          maxScale = Math.max(Math.max(ox, 1200 - ox) / demi, 40) * 1.4;
        }
      } catch {
        // Texte pas encore mis en page : on garde le repli.
      }
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const course = window.innerHeight;
      const p = clamp(window.scrollY / course);

      const scale = 1 + p * p * (maxScale - 1);
      mask.setAttribute(
        "transform",
        `translate(${ox} ${oy}) scale(${scale.toFixed(3)}) translate(${-ox} ${-oy})`,
      );

      // Le dessin ne se lit qu'au repos ; il s'efface dès la plongée.
      field.style.opacity = String(clamp(1 - p * 3));
      overlay.style.opacity = String(clamp(1 - p * 4));

      // Aucun fondu. À ce stade l'ouverture dépasse la fenêtre : la plaque
      // n'affiche plus un seul pixel d'anthracite, on peut donc la retirer sans
      // transition — personne ne peut voir disparaître ce qui ne se voyait déjà
      // plus. Cela libère aussi le contenu de tout recouvrement.
      plate.style.visibility = p >= HIDE_AT ? "hidden" : "visible";
    };

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    measure();
    apply();
    // La police arrive après le premier rendu : on remesure alors, sinon le
    // repère est calculé sur la police de repli.
    document.fonts?.ready.then(() => {
      measure();
      apply();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Course de défilement : exactement un écran. */}
      <div className={s.spacer} />

      <div ref={plateRef} className={`technique ${s.plate}`}>
        <svg
          className={s.panel}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask
              id="vrd-portal"
              maskUnits="userSpaceOnUse"
              x="-6000"
              y="-6000"
              width="18000"
              height="18000"
            >
              <rect x="-6000" y="-6000" width="18000" height="18000" fill="#fff" />
              <g ref={maskRef}>
                <text className={s.markText} x="600" y="500" textAnchor="middle" fill="#000">
                  VRD
                </text>
              </g>
            </mask>
          </defs>

          {/* Jumeau de mesure : identique au texte du masque, mais RENDU —
              seul un élément mis en page répond à getStartPositionOfChar.
              Invisible par fill-opacity, et non par visibility, pour rester
              dans l'arbre de rendu. */}
          <text
            ref={measureRef}
            className={s.markText}
            x="600"
            y="500"
            textAnchor="middle"
            fillOpacity={0}
            aria-hidden="true"
          >
            VRD
          </text>
          <rect
            x="-6000"
            y="-6000"
            width="18000"
            height="18000"
            fill="var(--dark)"
            mask="url(#vrd-portal)"
          />
        </svg>

        {/* AU-DESSUS de la plaque : le dessin appartient à l'anthracite, pas
            aux lettres. Il s'efface dès que la plongée commence. */}
        <div ref={fieldRef} className={s.field}>
          <ThermalField />
        </div>

        <div ref={overlayRef} className={s.overlay}>
          <p className={s.sub}>Ingénieurs conseils</p>
          <p className={s.baseline}>Techniques et énergétique du bâtiment</p>
          <p className={s.stamp}>S.T. 2021</p>
        </div>
      </div>

      <h1 className="visuallyHidden">VRD — Ingénieurs conseils</h1>
    </>
  );
}
