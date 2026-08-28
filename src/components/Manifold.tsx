"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./Manifold.module.css";

/**
 * Nourrice de distribution (illustration) — un collecteur départ, un collecteur
 * retour, quatre circuits avec vanne d'isolement et débitmètre. Line-work
 * AUTHORED ici. Départ = trait plein, retour = tireté ; distinction par le
 * trait, pas la couleur. Se dessine au scroll (même moteur que le schéma).
 */
type Circuit = { cx: number; n: number; type: string };
const CIRC: Circuit[] = [
  { cx: 250, n: 1, type: "PLANCHER" },
  { cx: 440, n: 2, type: "RADIATEURS" },
  { cx: 630, n: 3, type: "PLANCHER" },
  { cx: 820, n: 4, type: "BALLON ECS" },
];
const iv = (n: number) => ({ "--i": n }) as CSSProperties;

export function Manifold() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.draw = "done";
      return;
    }
    el.dataset.draw = "pending";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.draw = "true";
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={s.svg}
      viewBox="0 0 960 400"
      role="img"
      aria-label="Nourrice de distribution : un collecteur départ et un collecteur retour alimentent quatre circuits (plancher, radiateurs, plancher, ballon ECS), chacun avec une vanne d'isolement et un débitmètre."
    >
      {/* Collecteurs */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.6} d="M60 100 L900 100" />
      <path className={s.pipeDashed} strokeWidth={1.9} d="M60 170 L900 170" />

      {/* Flèches de sens */}
      <path className={s.sym} fill="currentColor" d="M486 94 L486 106 L498 100 Z" />
      <path className={s.sym} fill="currentColor" d="M474 164 L474 176 L462 170 Z" />

      {CIRC.map((c, idx) => (
        <g key={c.n}>
          {/* Départ : plein / Retour : tireté */}
          <path
            className={s.pipe}
            style={iv(idx + 1)}
            pathLength={1}
            strokeWidth={1.8}
            d={`M${c.cx - 14} 100 L${c.cx - 14} 290`}
          />
          <path className={s.pipeDashed} strokeWidth={1.6} d={`M${c.cx + 14} 290 L${c.cx + 14} 170`} />

          {/* Vanne d'isolement (nœud papillon) sur le départ */}
          <g className={s.sym}>
            <path fill="none" strokeWidth={1.7} d={`M${c.cx - 24} 128 L${c.cx - 24} 142 L${c.cx - 14} 135 Z`} />
            <path fill="none" strokeWidth={1.7} d={`M${c.cx - 4} 128 L${c.cx - 4} 142 L${c.cx - 14} 135 Z`} />
          </g>
          {/* Débitmètre sur le retour */}
          <g className={s.sym}>
            <circle cx={c.cx + 14} cy={210} r={10} fill="none" strokeWidth={1.6} />
            <path fill="none" strokeWidth={1.4} d={`M${c.cx + 14} 210 L${c.cx + 21} 204`} />
          </g>
          {/* Boîtier circuit */}
          <rect className={s.sym} x={c.cx - 42} y={290} width={84} height={32} fill="none" strokeWidth={1.8} />
          <text className={s.labStrong} x={c.cx} y={311} textAnchor="middle">
            C{c.n}
          </text>
          <text className={s.lab} x={c.cx} y={344} textAnchor="middle">
            {c.type}
          </text>
        </g>
      ))}

      {/* Étiquettes des collecteurs */}
      <text className={s.lab} x={70} y={86} textAnchor="start">
        NOURRICE · DÉPART
      </text>
      <text className={s.lab} x={70} y={190} textAnchor="start">
        RETOUR
      </text>
    </svg>
  );
}
