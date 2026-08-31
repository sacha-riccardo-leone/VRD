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

/**
 * Le fût du R est une barre étroite : environ 26 unités de viewBox sur 1200
 * visibles. Pour que son ouverture couvre la fenêtre entière, il faut donc une
 * échelle de l'ordre de 70 — d'où 200, qui laisse une marge confortable quel
 * que soit le format d'écran. C'est parce que cette valeur était trop basse (60)
 * qu'il restait de l'anthracite sur les bords, et qu'un fondu était nécessaire
 * pour le masquer. Avec une ouverture qui dépasse vraiment l'écran, il n'y a
 * plus rien à masquer : aucun fondu.
 */
const MAX_SCALE = 200;

/** Au-delà, l'ouverture dépasse largement l'écran : la plaque ne montre plus
 *  rien et peut être retirée sans que personne ne le voie. */
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

    // Repère de plongée mesuré sur le glyphe. La mesure porte sur un texte
    // RÉELLEMENT RENDU (invisible mais dans l'arbre de rendu) : un <text> placé
    // dans <defs> n'est jamais mis en page, getStartPositionOfChar y échoue, et
    // le repli tombait alors sur le centre exact de « VRD » — c'est-à-dire le
    // contrepoinçon du R. D'où l'écran noir.
    let ox = 470; // repli : à gauche du centre, donc du côté du fût
    let oy = 395;
    try {
      const a = text.getStartPositionOfChar(1); // le R
      const b = text.getEndPositionOfChar(1);
      if (b.x > a.x) {
        ox = a.x + (b.x - a.x) * 0.17; // dans le fût, pas dans la panse
        oy = a.y - 300 * 0.36; // à mi-hauteur de capitale
      }
    } catch {
      // Police pas encore chargée : le repli reste du côté du plein.
    }

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const course = window.innerHeight;
      const p = clamp(window.scrollY / course);

      const scale = 1 + p * p * (MAX_SCALE - 1);
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

    apply();
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
