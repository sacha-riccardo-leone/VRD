"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compteur qui monte de 0 à `to`.
 *
 * C'est la deuxième expression de l'idée de mouvement du projet — « le dessin
 * s'assemble » : les nombres se comptent une fois. Déclenché par le lecteur,
 * joué une seule fois.
 *
 * DEUX MODES.
 * - Autonome (`pilote` absent) : le compteur s'observe lui-même et part quand
 *   il entre dans le cadre. Plafonné à --dur-slow (400 ms). C'est le « 200+ ».
 * - Piloté (`pilote` fourni) : le parent dit où l'on en est — "final" (valeur
 *   finale, rien ne joue), "zero" (0, en attente), "compte" (part après
 *   `delay`). Sert à la figure du coût, dont les montants doivent compter EN
 *   MÊME TEMPS que les barres se tracent : un observateur par nombre ne
 *   donnerait jamais ce synchronisme. En mode piloté, c'est le parent qui
 *   porte `prefers-reduced-motion` — il ne passe jamais par "zero"/"compte"
 *   si le lecteur l'a demandé — et c'est lui qui répond du plafond de durée.
 *
 * Zéro décalage de mise en page : la valeur finale est rendue côté serveur et
 * reste dans le flux ; le compteur ne fait que la remplacer visuellement. Avec
 * `tabular-nums` sur le conteneur, la largeur ne bouge pas pendant le comptage.
 *
 * `prefers-reduced-motion` (mode autonome) : la valeur finale s'affiche
 * d'emblée, sans boucle.
 */
export function CountUp({
  to,
  duration = 400,
  delay = 0,
  pilote,
  suffix = "",
  format = String,
}: {
  to: number;
  duration?: number;
  /** Mode piloté seulement : attente avant de compter, en ms. */
  delay?: number;
  pilote?: "final" | "zero" | "compte";
  suffix?: string;
  /** Mise en forme du nombre affiché — par défaut, tel quel. Sert aux montants
      en francs (séparateur de milliers suisse), qui ne se lisent pas bruts. */
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null); // null = pas en train de compter
  const [fini, setFini] = useState(false); // mode piloté : le comptage a eu lieu

  // Mode autonome.
  useEffect(() => {
    if (pilote !== undefined) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.disconnect();
          setN(0);
          const step = (t: number) => {
            if (!start) start = t;
            const p = Math.min((t - start) / duration, 1);
            // Sortie douce : rapide au départ, se pose sur la valeur finale.
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(step);
            else setN(null); // rend la main au rendu serveur
          };
          raf = requestAnimationFrame(step);
          break;
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration, pilote]);

  // Mode piloté : on part quand le parent dit "compte", après `delay`.
  useEffect(() => {
    if (pilote !== "compte") return;

    let raf = 0;
    let start = 0;
    const timer = setTimeout(() => {
      setN(0);
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          setN(null);
          setFini(true);
        }
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [pilote, delay, duration, to]);

  // Hors comptage : 0 tant que le parent tient la figure repliée ou que le
  // départ différé n'a pas eu lieu ; la valeur finale partout ailleurs.
  const affiche =
    n !== null
      ? n
      : pilote === "zero" || (pilote === "compte" && !fini)
        ? 0
        : to;

  return (
    <span ref={ref}>
      {format(affiche)}
      {suffix}
    </span>
  );
}
