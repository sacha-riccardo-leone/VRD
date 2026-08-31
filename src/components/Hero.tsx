"use client";

import { useEffect, useRef } from "react";
import { ThermalField } from "./ThermalField";
import s from "./Hero.module.css";

/**
 * Hero — portail. On traverse le sigle.
 *
 * Construction. Une plaque anthracite pleine page est PERCÉE aux lettres
 * « VRD » : masque SVG où le rectangle est opaque et le texte fait le trou.
 * Derrière la plaque, le papier et le champ thermique redessiné à l'encre. Au
 * repos, les lettres se lisent donc comme du papier à dessin avec ses lignes de
 * construction — c'est la teinte qu'avait déjà le titre, donc aucune rupture
 * visuelle avec la version précédente.
 *
 * Au défilement, le masque grandit autour d'un point pris DANS LE PLEIN du R.
 * C'est ce qui ouvre : le contrepoinçon du R — le vide de sa panse — n'est pas
 * du glyphe, il resterait opaque et se refermerait au lieu de s'ouvrir. On sort
 * de la plaque noire, on passe par le R, on arrive dans le dessin.
 *
 * Mise en œuvre. Un seul écouteur de défilement, une seule boucle rAF, échelle
 * écrite directement dans le DOM par ref : aucun état React, donc aucun rendu
 * pendant l'animation. La plaque est en `pointer-events: none`, le champ
 * thermique continue donc de recevoir le curseur.
 *
 * Replis. Sous 1024 px et sous `prefers-reduced-motion` : ni épinglage, ni
 * boucle, l'écouteur n'est jamais posé et la course de défilement n'existe pas.
 */

/** Repère de zoom, en unités de viewBox : dans le PLEIN du R, pas son vide. */
const ORIGIN_X = 566;
const ORIGIN_Y = 408;
/** Échelle finale. Au-delà, la lettre a de toute façon quitté l'écran. */
const MAX_SCALE = 46;

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mask = maskRef.current;
    const overlay = overlayRef.current;
    if (!wrap || !mask || !overlay) return;

    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    wrap.dataset.portal = "on";

    const apply = () => {
      raf.current = 0;
      const r = wrap.getBoundingClientRect();
      const course = r.height - window.innerHeight;
      const p = course > 0 ? Math.min(Math.max(-r.top / course, 0), 1) : 0;
      const scale = 1 + p * p * (MAX_SCALE - 1);
      mask.setAttribute(
        "transform",
        `translate(${ORIGIN_X} ${ORIGIN_Y}) scale(${scale.toFixed(3)}) translate(${-ORIGIN_X} ${-ORIGIN_Y})`,
      );
      overlay.style.opacity = String(Math.max(1 - p * 4, 0));
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
      delete wrap.dataset.portal;
    };
  }, []);

  return (
    <div ref={wrapRef} className={s.wrap}>
      <div className={`technique ${s.stage}`}>
        <div className={s.behind}>
          <div className={s.field}>
            <ThermalField />
          </div>
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
              x="-3000"
              y="-3000"
              width="9000"
              height="9000"
            >
              <rect x="-3000" y="-3000" width="9000" height="9000" fill="#fff" />
              <g ref={maskRef}>
                <text
                  className={s.markText}
                  x="600"
                  y="408"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                >
                  VRD
                </text>
              </g>
            </mask>
          </defs>
          <rect
            x="-3000"
            y="-3000"
            width="9000"
            height="9000"
            fill="var(--dark)"
            mask="url(#vrd-portal)"
          />
        </svg>

        <h1 className="visuallyHidden">VRD — Ingénieurs conseils</h1>

        <div ref={overlayRef} className={s.overlay}>
          <p className={s.sub}>Ingénieurs conseils</p>
          <p className={s.baseline}>Techniques et énergétique du bâtiment</p>
          <p className={s.stamp}>S.T. 2021</p>
        </div>
      </div>
    </div>
  );
}
