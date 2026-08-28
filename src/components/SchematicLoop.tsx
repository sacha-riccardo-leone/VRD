"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./SchematicLoop.module.css";

/**
 * Schéma de principe — boucle de chauffage (chaudière · circulateur · départ ·
 * émetteurs · retour · vase d'expansion). Line-work vectoriel AUTHORED ici, pas
 * tracé sur un document tiers ; c'est une illustration, pas un projet VRD réel.
 *
 * Le dessin s'assemble au scroll : le trait de départ se dessine (stroke-dash-
 * offset), le retour et les symboles apparaissent en cascade. Une seule idée de
 * mouvement, déclenchée par le lecteur, jouée une fois. `prefers-reduced-motion`
 * → tout est visible d'emblée, aucune animation. SVG à ratio fixe → CLS 0.
 *
 * Monochrome : départ = trait plein plus épais + flèche ; retour = tireté plus
 * fin + flèche. Les circuits se distinguent par le trait, jamais par la couleur.
 */
const RADS = [380, 560, 740]; // x des trois émetteurs (largeur 110)
const iv = (n: number) => ({ "--i": n }) as CSSProperties;

export function SchematicLoop() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.draw = "done"; // visible, sans animation
      return;
    }
    el.dataset.draw = "pending"; // état initial caché
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
      viewBox="0 0 1000 440"
      role="img"
      aria-label="Schéma de principe d'une boucle de chauffage : la chaudière alimente un circulateur, un départ dessert trois émetteurs, le retour revient à la chaudière ; un vase d'expansion est raccordé au retour."
    >
      {/* --- Tuyauterie ---------------------------------------------------- */}
      {/* Départ : trait plein, se dessine. */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.6} d="M155 235 L155 90 L800 90" />
      {RADS.map((x, idx) => {
        const c = x + 55;
        return (
          <path
            key={`d${c}`}
            className={s.pipe}
            style={iv(idx + 1)}
            pathLength={1}
            strokeWidth={1.8}
            d={`M${c} 90 L${c} 175`}
          />
        );
      })}
      {/* Retour : tireté, apparaît en fondu. */}
      <path className={s.pipeDashed} strokeWidth={1.8} d="M795 370 L155 370" />
      {RADS.map((x) => {
        const c = x + 55;
        return <path key={`r${c}`} className={s.pipeDashed} strokeWidth={1.6} d={`M${c} 245 L${c} 370`} />;
      })}
      <path className={s.pipeDashed} strokeWidth={1.6} d="M260 370 L260 320" />

      {/* --- Symboles ------------------------------------------------------ */}
      {/* Chaudière + brûleur */}
      <g className={s.sym}>
        <rect x={80} y={235} width={150} height={140} fill="none" strokeWidth={2.4} />
        <path fill="currentColor" d="M110 362 L120 348 L130 362 Z" />
        <path fill="currentColor" d="M145 362 L155 348 L165 362 Z" />
        <path fill="currentColor" d="M180 362 L190 348 L200 362 Z" />
      </g>
      {/* Circulateur */}
      <g className={s.sym}>
        <circle cx={155} cy={165} r={18} fill="none" strokeWidth={2} />
        <path fill="currentColor" d="M155 153 L146 176 L164 176 Z" />
      </g>
      {/* Vanne (nœud) */}
      <g className={s.sym}>
        <path fill="none" strokeWidth={1.8} d="M288 80 L288 100 L300 90 Z" />
        <path fill="none" strokeWidth={1.8} d="M312 80 L312 100 L300 90 Z" />
      </g>
      {/* Émetteurs */}
      {RADS.map((x) => (
        <g className={s.sym} key={`rad${x}`}>
          <rect x={x} y={175} width={110} height={70} fill="none" strokeWidth={2} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={x + 22 + k * 22} y1={181} x2={x + 22 + k * 22} y2={239} strokeWidth={1.4} />
          ))}
        </g>
      ))}
      {/* Vase d'expansion */}
      <g className={s.sym}>
        <rect x={245} y={300} width={30} height={22} rx={11} fill="none" strokeWidth={1.8} />
      </g>
      {/* Flèches de sens */}
      <path className={s.sym} fill="currentColor" d="M556 84 L556 96 L568 90 Z" />
      <path className={s.sym} fill="currentColor" d="M504 364 L504 376 L492 370 Z" />

      {/* --- Étiquettes ---------------------------------------------------- */}
      <text className={s.lab} x={155} y={398} textAnchor="middle">
        CHAUDIÈRE
      </text>
      <text className={s.lab} x={185} y={168} textAnchor="start">
        CIRCULATEUR
      </text>
      <text className={s.lab} x={300} y={62} textAnchor="middle">
        VANNE
      </text>
      <text className={s.lab} x={432} y={74} textAnchor="middle">
        DÉPART · 70 °C
      </text>
      <text className={s.lab} x={595} y={164} textAnchor="middle">
        ÉMETTEURS
      </text>
      <text className={s.lab} x={432} y={392} textAnchor="middle">
        RETOUR · 50 °C
      </text>
      <text className={s.lab} x={300} y={314} textAnchor="start">
        VASE D’EXP.
      </text>
      <text className={s.lab} x={155} y={422} textAnchor="middle">
        ≈ 24 KW · ΔT 20 K
      </text>
    </svg>
  );
}
