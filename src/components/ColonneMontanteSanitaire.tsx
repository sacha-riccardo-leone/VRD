"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./ColonneMontanteSanitaire.module.css";

const iv = (n: number): CSSProperties => ({ "--i": n } as CSSProperties);

type Niveau = { nom: string; sol: number; ef: number; ecs: number; i: number };

const NIVEAUX: Niveau[] = [
  { nom: "R+2", sol: 200, ef: 172, ecs: 188, i: 3 },
  { nom: "R+1", sol: 350, ef: 322, ecs: 338, i: 2 },
  { nom: "RDC", sol: 500, ef: 472, ecs: 488, i: 1 },
];

export function ColonneMontanteSanitaire() {
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
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={s.svg}
      viewBox="0 0 900 640"
      role="img"
      aria-label="Schéma d'une colonne montante sanitaire sur trois niveaux (RDC, R+1, R+2) : colonne d'eau froide EF en trait plein et colonne d'eau chaude ECS en tireté, piquage horizontal avec robinet d'arrêt à chaque niveau, ballon ECS raccordé en pied et flèche de sens montant."
    >
      {/* Traits de niveau (repères) */}
      {NIVEAUX.map((n) => (
        <line
          key={`sol-${n.nom}`}
          className={s.sym}
          strokeWidth={1.4}
          x1={150}
          y1={n.sol}
          x2={800}
          y2={n.sol}
        />
      ))}

      {/* Colonne EF — eau froide, trait plein (flux principal, se dessine) */}
      <path
        className={s.pipe}
        style={iv(0)}
        pathLength={1}
        strokeWidth={2.6}
        d="M210 558 L210 105"
      />
      <path className={s.sym} fill="none" strokeWidth={2} d="M203 116 L210 103 L217 116" />

      {/* Colonne ECS — eau chaude, tireté (circuit secondaire) */}
      <path className={s.pipeDashed} strokeWidth={1.7} d="M250 558 L250 105" />
      <path className={s.sym} fill="none" strokeWidth={1.6} d="M243 116 L250 103 L257 116" />

      {/* Masques de non-raccordement : le piquage EF enjambe la colonne ECS
          (fond papier sans contour -> interrompt le tracé du dessous) */}
      {NIVEAUX.map((n) => (
        <circle key={`pas-${n.nom}`} className={s.mask} cx={250} cy={n.ef} r={5} />
      ))}

      {/* Piquages EF (plein, se dessinent en cascade) */}
      {NIVEAUX.map((n) => (
        <path
          key={`ef-${n.nom}`}
          className={s.pipe}
          style={iv(n.i)}
          pathLength={1}
          strokeWidth={2.2}
          d={`M210 ${n.ef} L600 ${n.ef}`}
        />
      ))}

      {/* Piquages ECS (tireté) */}
      {NIVEAUX.map((n) => (
        <path
          key={`ecs-${n.nom}`}
          className={s.pipeDashed}
          strokeWidth={1.6}
          d={`M250 ${n.ecs} L600 ${n.ecs}`}
        />
      ))}

      {/* Tés de raccordement des piquages aux colonnes */}
      {NIVEAUX.map((n) => (
        <g key={`te-${n.nom}`} className={s.node}>
          <circle cx={210} cy={n.ef} r={3} />
          <circle cx={250} cy={n.ecs} r={3} />
        </g>
      ))}

      {/* Robinets d'arrêt : EF (avec volant) + ECS */}
      {NIVEAUX.map((n) => (
        <g key={`rob-${n.nom}`} className={s.sym} fill="none" strokeWidth={1.6}>
          <path d={`M368 ${n.ef - 9} L368 ${n.ef + 9} L392 ${n.ef - 9} L392 ${n.ef + 9} Z`} />
          <path d={`M380 ${n.ef - 9} L380 ${n.ef - 18}`} />
          <path d={`M372 ${n.ef - 18} L388 ${n.ef - 18}`} />
          <path d={`M460 ${n.ecs - 7} L460 ${n.ecs + 7} L480 ${n.ecs - 7} L480 ${n.ecs + 7} Z`} />
        </g>
      ))}

      {/* Flèches de sens sur les piquages EF (vers l'appareil) */}
      {NIVEAUX.map((n) => (
        <path
          key={`fl-${n.nom}`}
          className={s.sym}
          fill="none"
          strokeWidth={1.6}
          d={`M548 ${n.ef - 6} L555 ${n.ef} L548 ${n.ef + 6}`}
        />
      ))}

      {/* Points de puisage */}
      {NIVEAUX.map((n) => (
        <g key={`app-${n.nom}`} className={s.sym} strokeWidth={1.4}>
          <circle fill="var(--paper)" cx={600} cy={n.ef} r={5} />
          <circle fill="var(--paper)" cx={600} cy={n.ecs} r={4} />
        </g>
      ))}

      {/* Ballon ECS en pied (cylindre raccordé aux deux colonnes) */}
      <g className={s.sym} strokeWidth={1.6}>
        <path fill="var(--paper)" d="M182 558 L182 618 A48 11 0 0 0 278 618 L278 558" />
        <ellipse fill="var(--paper)" cx={230} cy={558} rx={48} ry={11} />
      </g>
      <g className={s.node}>
        <circle cx={210} cy={558} r={3} />
        <circle cx={250} cy={558} r={3} />
      </g>

      {/* Flèche de sens montant */}
      <g className={s.sym} fill="none" strokeWidth={1.4}>
        <path d="M180 195 L180 135" />
        <path d="M174 149 L180 135 L186 149" />
      </g>

      {/* Légende — distinction par le trait */}
      <line className={s.sym} strokeWidth={2.4} x1={640} y1={72} x2={688} y2={72} />
      <line
        className={s.sym}
        strokeWidth={1.6}
        strokeDasharray="7 6"
        x1={640}
        y1={96}
        x2={688}
        y2={96}
      />

      {/* Étiquettes */}
      <text className={`${s.lab} ${s.capt}`} x={150} y={60} textAnchor="start">
        COLONNE MONTANTE SANITAIRE
      </text>

      <text className={s.lab} x={210} y={90} textAnchor="middle">
        EF
      </text>
      <text className={s.lab} x={250} y={90} textAnchor="middle">
        ECS
      </text>

      <text className={s.lab} x={196} y={252} textAnchor="end">
        DN 32
      </text>
      <text className={s.lab} x={264} y={432} textAnchor="start">
        DN 25
      </text>

      <text className={s.lab} transform="translate(166 210) rotate(-90)" textAnchor="middle">
        SENS MONTANT
      </text>

      {NIVEAUX.map((n) => (
        <text key={`lab-${n.nom}`} className={s.lab} x={138} y={n.sol + 4} textAnchor="end">
          {n.nom}
        </text>
      ))}

      <text className={s.lab} x={380} y={444} textAnchor="middle">
        ROBINET D&apos;ARRÊT
      </text>
      <text className={s.lab} x={300} y={464} textAnchor="middle">
        DN 20
      </text>

      <text className={s.lab} x={300} y={582} textAnchor="start">
        BALLON ECS · 200 L
      </text>
      <text className={s.lab} x={300} y={600} textAnchor="start">
        ECS 60 °C
      </text>
      <text className={s.lab} x={300} y={618} textAnchor="start">
        EF 10 °C
      </text>

      <text className={s.lab} x={698} y={76} textAnchor="start">
        EF · EAU FROIDE
      </text>
      <text className={s.lab} x={698} y={100} textAnchor="start">
        ECS · EAU CHAUDE
      </text>
    </svg>
  );
}

export default ColonneMontanteSanitaire;