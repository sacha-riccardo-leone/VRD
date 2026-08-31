"use client";

import { useEffect, useRef } from "react";
import { ThermalField } from "./ThermalField";
import s from "./Hero.module.css";

/**
 * Hero — variante (B) : le survol du sigle.
 *
 * Le sigle reste de l'encre pleine, il ne devient pas une fenêtre. Au
 * défilement il grossit et passe le spectateur, pendant que la plaque
 * anthracite se dissout : les lettres filent, la pièce sombre s'efface, on se
 * retrouve dans le document sur papier.
 *
 * Différence avec la variante (A), le portail : ici rien n'est masqué. Aucune
 * géométrie de glyphe à deviner, donc aucun risque que le zoom se referme sur
 * un contrepoinçon ; et le titre reste du VRAI TEXTE, ce qui vaut mieux pour la
 * sémantique comme pour le référencement. C'est aussi beaucoup plus simple.
 *
 * Le centre de la mise à l'échelle est le milieu du sigle, c'est-à-dire le R :
 * on passe donc bien par cette lettre, mais sans aperture à calibrer.
 *
 * Un seul écouteur de défilement, une seule boucle rAF, écriture directe dans
 * le DOM par ref : aucun état React, aucun rendu pendant l'animation. Seules
 * `transform` et `opacity` sont animées.
 *
 * Replis. Sous 1024 px et sous `prefers-reduced-motion` : ni épinglage, ni
 * boucle, l'ecouteur n'est jamais posé, la course de defilement n'existe pas.
 */

/** Échelle atteinte quand le sigle a fini de passer. */
const MAX_SCALE = 14;

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mark = markRef.current;
    const plate = plateRef.current;
    const overlay = overlayRef.current;
    if (!wrap || !mark || !plate || !overlay) return;

    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    wrap.dataset.portal = "on";

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const r = wrap.getBoundingClientRect();
      const course = r.height - window.innerHeight;
      const p = course > 0 ? clamp(-r.top / course) : 0;

      // Le sigle : accélère puis passe. transform + opacity seulement.
      const scale = 1 + p * p * (MAX_SCALE - 1);
      mark.style.transform = `scale(${scale.toFixed(3)})`;
      mark.style.opacity = String(clamp(1 - p * 1.7));

      // La plaque se dissout dans la seconde moitié, jamais avant : les
      // lettres doivent partir avant que la pièce ne s'efface.
      plate.style.opacity = String(clamp(1 - Math.max(p - 0.45, 0) * 2.2));

      // Les textes secondaires s'effacent tôt.
      overlay.style.opacity = String(clamp(1 - p * 4));
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
        {/* La plaque : fond anthracite et champ thermique. Elle se dissout en
            fin de course pour laisser paraître le papier. */}
        <div ref={plateRef} className={s.plate}>
          <ThermalField />
        </div>

        <div ref={markRef} className={s.markWrap}>
          <h1 className={s.mark}>VRD</h1>
        </div>

        <div ref={overlayRef} className={s.overlay}>
          <p className={s.sub}>Ingénieurs conseils</p>
          <p className={s.baseline}>Techniques et énergétique du bâtiment</p>
          <p className={s.stamp}>S.T. 2021</p>
        </div>
      </div>
    </div>
  );
}
