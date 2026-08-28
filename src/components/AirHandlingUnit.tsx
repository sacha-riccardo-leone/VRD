"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./AirHandlingUnit.module.css";

/**
 * Schéma de principe single-line — centrale de traitement d'air (CTA) double
 * flux : prise d'air neuf, filtres G4 puis F7, batterie froide, batterie chaude,
 * ventilateur de soufflage vers un local ; reprise en gaine tiretée revenant par
 * un récupérateur de chaleur avant rejet. Line-work vectoriel AUTHORED ici, pas
 * tracé sur un document tiers : c'est une illustration, pas un projet VRD réel.
 *
 * Le dessin s'assemble au scroll : les gaines pleines se tracent
 * (stroke-dashoffset), le tireté, les symboles puis les étiquettes apparaissent
 * en cascade. Une seule idée de mouvement, déclenchée par le lecteur, jouée une
 * fois. `prefers-reduced-motion` → tout est visible d'emblée, aucune animation.
 * SVG à ratio fixe → CLS 0.
 *
 * Monochrome : soufflage = trait plein plus épais + flèche ; reprise = tireté
 * plus fin + flèche. Les circuits se distinguent par le trait, jamais la couleur.
 */
const iv = (n: number) => ({ "--i": n }) as CSSProperties;

export function AirHandlingUnit() {
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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={s.svg}
      viewBox="0 0 1120 460"
      role="img"
      aria-label="Schéma single-line d'une centrale de traitement d'air : prise d'air neuf, filtres G4 puis F7, batterie froide, batterie chaude et ventilateur de soufflage alimentent un local ; l'air de reprise revient en gaine tiretée par un récupérateur de chaleur avant rejet à l'extérieur. Débit d'illustration 3 400 mètres cubes par heure."
    >
      {/* --- Gaines pleines : soufflage, se dessinent ---------------------- */}
      {/* Air neuf → filtres → batteries → aspiration du ventilateur. */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.6} d="M80 170 H670" />
      {/* Refoulement du ventilateur → gaine de soufflage → local. */}
      <path className={s.pipe} style={iv(1)} pathLength={1} strokeWidth={2.6} d="M730 170 H962" />

      {/* --- Gaine de reprise : tireté, apparaît en fondu ------------------ */}
      <path className={s.pipeDashed} strokeWidth={1.7} d="M1026 300 L1026 350 L80 350" />

      {/* --- Symboles ----------------------------------------------------- */}
      {/* Prise d'air neuf : grille à lames. */}
      <g className={s.sym}>
        <rect x={32} y={150} width={48} height={40} fill="none" strokeWidth={2.2} />
        <path fill="none" strokeWidth={1.4} d="M36 188 L52 152 M50 188 L66 152 M64 188 L80 152" />
      </g>
      {/* Rejet : grille à lames. */}
      <g className={s.sym}>
        <rect x={32} y={330} width={48} height={40} fill="none" strokeWidth={2.2} />
        <path fill="none" strokeWidth={1.4} d="M36 368 L52 332 M50 368 L66 332 M64 368 L80 332" />
      </g>
      {/* Récupérateur de chaleur : losange traversé par les deux flux. */}
      <path className={s.sym} fill="none" strokeWidth={2.2} d="M160 130 L240 260 L160 390 L80 260 Z" />
      {/* Filtre G4 : caisson + hachures. */}
      <g className={s.sym}>
        <rect x={252} y={142} width={38} height={56} fill="none" strokeWidth={2} />
        <path fill="none" strokeWidth={1.4} d="M252 198 L290 160 M252 178 L288 142 M272 198 L290 180" />
      </g>
      {/* Filtre F7 : caisson + hachures. */}
      <g className={s.sym}>
        <rect x={330} y={142} width={38} height={56} fill="none" strokeWidth={2} />
        <path fill="none" strokeWidth={1.4} d="M330 198 L368 160 M330 178 L366 142 M350 198 L368 180" />
      </g>
      {/* Batterie froide : caisson + serpentin. */}
      <g className={s.sym}>
        <rect x={406} y={140} width={58} height={60} fill="none" strokeWidth={2} />
        <path fill="none" strokeWidth={1.6} d="M406 170 q9.5 -20 19 0 t19 0 t19 0" />
      </g>
      {/* Batterie chaude : caisson + serpentin. */}
      <g className={s.sym}>
        <rect x={574} y={140} width={58} height={60} fill="none" strokeWidth={2} />
        <path fill="none" strokeWidth={1.6} d="M574 170 q9.5 -20 19 0 t19 0 t19 0" />
      </g>
      {/* Ventilateur de soufflage : cercle + triangle de sens. */}
      <g className={s.sym}>
        <circle cx={700} cy={170} r={30} fill="none" strokeWidth={2.2} />
        <path fill="none" strokeWidth={1.8} d="M686 153 L686 187 L722 170 Z" />
      </g>
      {/* Local desservi. */}
      <rect className={s.sym} x={962} y={110} width={128} height={190} fill="none" strokeWidth={2} />

      {/* Flèches de sens : air neuf & soufflage (plein), reprise & rejet (tireté). */}
      <path className={s.sym} fill="currentColor" stroke="none" d="M104 163 L104 177 L120 170 Z" />
      <path className={s.sym} fill="currentColor" stroke="none" d="M838 163 L838 177 L854 170 Z" />
      <path className={s.sym} fill="currentColor" stroke="none" d="M708 343 L708 357 L692 350 Z" />
      <path className={s.sym} fill="currentColor" stroke="none" d="M120 343 L120 357 L104 350 Z" />

      {/* --- Étiquettes --------------------------------------------------- */}
      <text className={s.lab} x={56} y={138} textAnchor="middle">
        AIR NEUF
      </text>
      <text className={s.lab} x={160} y={264} textAnchor="middle">
        RÉCUPÉRATEUR
      </text>
      <text className={s.lab} x={271} y={126} textAnchor="middle">
        G4
      </text>
      <text className={s.lab} x={349} y={126} textAnchor="middle">
        F7
      </text>
      <text className={s.lab} x={435} y={230} textAnchor="middle">
        BATTERIE FROIDE
      </text>
      <text className={s.lab} x={435} y={248} textAnchor="middle">
        14 °C
      </text>
      <text className={s.lab} x={603} y={230} textAnchor="middle">
        BATTERIE CHAUDE
      </text>
      <text className={s.lab} x={603} y={248} textAnchor="middle">
        22 °C
      </text>
      <text className={s.lab} x={700} y={118} textAnchor="middle">
        VENTILATEUR
      </text>
      <text className={s.lab} x={846} y={150} textAnchor="middle">
        SOUFFLAGE
      </text>
      <text className={s.lab} x={846} y={192} textAnchor="middle">
        DÉBIT 3 400 m³/h
      </text>
      <text className={s.lab} x={1026} y={208} textAnchor="middle">
        LOCAL
      </text>
      <text className={s.lab} x={700} y={376} textAnchor="middle">
        REPRISE
      </text>
      <text className={s.lab} x={56} y={392} textAnchor="middle">
        REJET
      </text>
    </svg>
  );
}
