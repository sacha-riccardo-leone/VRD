"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compteur qui monte de 0 à `to` quand il entre dans le cadre.
 *
 * C'est la deuxième expression de l'idée de mouvement du projet — « le dessin
 * s'assemble » : les nombres se comptent une fois. Déclenché par le lecteur,
 * joué une seule fois, plafonné à --dur-slow (400 ms).
 *
 * Zéro décalage de mise en page : la valeur finale est rendue côté serveur et
 * reste dans le flux ; le compteur ne fait que la remplacer visuellement. Avec
 * `tabular-nums` sur le conteneur, la largeur ne bouge pas pendant le comptage.
 *
 * `prefers-reduced-motion` : la valeur finale s'affiche d'emblée, sans boucle.
 */
export function CountUp({
  to,
  duration = 400,
  suffix = "",
}: {
  to: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState<number | null>(null); // null = valeur finale (SSR)

  useEffect(() => {
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
  }, [to, duration]);

  return (
    <span ref={ref}>
      {n === null ? to : n}
      {suffix}
    </span>
  );
}
