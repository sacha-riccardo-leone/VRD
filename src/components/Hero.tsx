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
 * Le repère du fût du R n'est plus deviné : il est MESURÉ au montage, avec
 * getStartPositionOfChar / getEndPositionOfChar sur le glyphe. Viser le
 * contrepoinçon — le vide de la panse — faisait grandir de l'anthracite et
 * finissait en noir ; c'est ce qui a fait échouer les deux essais précédents.
 *
 * Le champ thermique vit derrière la plaque : il n'est donc visible qu'au
 * travers des lettres, et s'efface dès que la plongée commence.
 */

const MAX_SCALE = 60;

export function Hero() {
  const plateRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const plate = plateRef.current;
    const mask = maskRef.current;
    const text = textRef.current;
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

    // Repère de plongée MESURÉ sur le glyphe, jamais deviné : le R est le
    // caractère d'index 1, et son fût occupe le bord gauche de sa chasse.
    let ox = 600;
    let oy = 400;
    try {
      const a = text.getStartPositionOfChar(1);
      const b = text.getEndPositionOfChar(1);
      ox = a.x + (b.x - a.x) * 0.17; // dans le fût, pas dans la panse
      oy = a.y - 300 * 0.36; // à mi-hauteur de capitale au-dessus de la ligne de pied
    } catch {
      // Police pas encore chargée : on garde le repère par défaut.
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

      // Une fois grand ouvert, la plaque ne doit plus rien intercepter.
      plate.style.visibility = p >= 0.999 ? "hidden" : "visible";
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
        {/* Derrière la plaque, donc visible seulement au travers des lettres. */}
        <div ref={fieldRef} className={s.field}>
          <ThermalField />
        </div>

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
                <text
                  ref={textRef}
                  className={s.markText}
                  x="600"
                  y="500"
                  textAnchor="middle"
                  fill="#000"
                >
                  VRD
                </text>
              </g>
            </mask>
          </defs>
          <rect
            x="-6000"
            y="-6000"
            width="18000"
            height="18000"
            fill="var(--dark)"
            mask="url(#vrd-portal)"
          />
        </svg>

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
