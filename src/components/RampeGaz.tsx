"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./RampeGaz.module.css";

/**
 * Rampe gaz (gas train) — bloc de sécurité, illustration AUTHORED ici, pas
 * tracée sur un document tiers ; ce n'est pas un projet VRD réel.
 *
 * Le dessin s'assemble au scroll : la conduite principale se dessine
 * (stroke-dashoffset) en cascade, puis les symboles et la prise d'impulsion
 * apparaissent en fondu. Une seule idée de mouvement, déclenchée par le
 * lecteur, jouée une fois. `prefers-reduced-motion` → tout visible d'emblée,
 * aucune animation. SVG à ratio fixe → CLS 0.
 *
 * Monochrome strict : départ = trait plein plus épais + flèches de sens ;
 * secondaire (prise d'impulsion) = tireté plus fin. Les circuits se
 * distinguent par le trait, jamais par la couleur. Les corps d'appareils sont
 * masqués en var(--paper) pour se lire comme des organes en ligne.
 */
const iv = (n: number) => ({ "--i": n }) as CSSProperties;

export function RampeGaz() {
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
      viewBox="0 0 1000 340"
      role="img"
      aria-label="Schéma d'une rampe gaz de sécurité : le long d'une conduite principale se succèdent, de gauche à droite, une vanne d'arrêt manuelle à papillon, un filtre, un détendeur de pression à membrane, un compteur à cadran et une double électrovanne de sécurité, avant le brûleur ; une prise d'impulsion en tireté relie la conduite au détendeur."
    >
      {/* --- Conduite principale : trait plein, se dessine en cascade ------ */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.6} d="M40 150 H300" />
      <path className={s.pipe} style={iv(1)} pathLength={1} strokeWidth={2.6} d="M300 150 H600" />
      <path className={s.pipe} style={iv(2)} pathLength={1} strokeWidth={2.6} d="M600 150 H835" />

      {/* --- Secondaire : prise d'impulsion, tireté plus fin (fondu) ------- */}
      <path className={s.pipeDashed} strokeWidth={1.5} d="M460 150 V115 H429" />

      {/* --- Symboles ----------------------------------------------------- */}
      <g className={s.sym}>
        {/* Vanne d'arrêt manuelle (papillon) */}
        <path fill="var(--paper)" strokeWidth={1.8} d="M100 135 L100 165 L120 150 Z M140 135 L140 165 L120 150 Z" />
        <path fill="none" strokeWidth={1.6} d="M108 163 L132 137" />
        <path fill="none" strokeWidth={1.8} d="M120 135 V113 M104 113 H136" />

        {/* Filtre : rectangle hachuré */}
        <rect x={218} y={128} width={64} height={44} fill="var(--paper)" strokeWidth={1.8} />
        <path
          fill="none"
          strokeWidth={1.3}
          d="M218 150 L240 128 M218 162 L252 128 M220 172 L264 128 M232 172 L276 128 M244 172 L282 134 M256 172 L282 146 M268 172 L282 158"
        />

        {/* Détendeur / régulateur à membrane */}
        <path fill="var(--paper)" strokeWidth={1.8} d="M385 135 L385 165 L405 150 Z M425 135 L425 165 L405 150 Z" />
        <path fill="none" strokeWidth={1.8} d="M405 135 V121" />
        <ellipse cx={405} cy={115} rx={24} ry={6} fill="var(--paper)" strokeWidth={1.6} />
        <path fill="none" strokeWidth={1.5} d="M405 109 L397 105 L413 101 L397 97 L413 93 L405 89" />
        <path fill="none" strokeWidth={1.6} d="M395 86 H415 M405 89 V86" />
        <path fill="none" strokeWidth={1.4} d="M435 111 L429 115 L435 119" />

        {/* Compteur : cercle à cadran */}
        <circle cx={560} cy={150} r={32} fill="var(--paper)" strokeWidth={1.8} />
        <path fill="none" strokeWidth={1.3} d="M544 150 A16 16 0 0 1 576 150" />
        <path fill="none" strokeWidth={1.6} d="M560 150 L574 136" />
        <circle cx={560} cy={150} r={2.5} fill="currentColor" stroke="none" />
        <path fill="none" strokeWidth={1.3} d="M560 122 V127 M536 138 L541 141 M584 138 L579 141" />

        {/* Double électrovanne de sécurité (deux corps à bobine) */}
        <path fill="var(--paper)" strokeWidth={1.8} d="M670 135 L670 165 L688 150 Z M706 135 L706 165 L688 150 Z" />
        <rect x={679} y={113} width={18} height={22} fill="var(--paper)" strokeWidth={1.6} />
        <path fill="none" strokeWidth={1.4} d="M679 135 L697 113" />
        <path fill="var(--paper)" strokeWidth={1.8} d="M714 135 L714 165 L732 150 Z M750 135 L750 165 L732 150 Z" />
        <rect x={723} y={113} width={18} height={22} fill="var(--paper)" strokeWidth={1.6} />
        <path fill="none" strokeWidth={1.4} d="M723 135 L741 113" />

        {/* Brûleur : buse convergente + flammes */}
        <path fill="var(--paper)" strokeWidth={1.8} d="M835 137 L860 145 L860 155 L835 163 Z" />
        <path fill="none" strokeWidth={1.5} d="M863 141 L877 135 M864 150 L880 150 M863 159 L877 165" />

        {/* Flèches de sens (départ) */}
        <path
          fill="none"
          strokeWidth={1.6}
          d="M169 144 L175 150 L169 156 M329 144 L335 150 L329 156 M494 144 L500 150 L494 156 M622 144 L628 150 L622 156 M794 144 L800 150 L794 156"
        />
      </g>

      {/* --- Étiquettes --------------------------------------------------- */}
      <text className={s.lab} x={42} y={176} textAnchor="start">
        GAZ
      </text>
      <text className={`${s.lab} ${s.sub}`} x={42} y={194} textAnchor="start">
        P 0,3 BAR
      </text>
      <text className={`${s.lab} ${s.sub}`} x={486} y={112} textAnchor="start">
        IMPULSION
      </text>

      <text className={s.lab} x={120} y={236} textAnchor="middle">
        VANNE
      </text>
      <text className={s.lab} x={250} y={236} textAnchor="middle">
        FILTRE
      </text>
      <text className={s.lab} x={405} y={236} textAnchor="middle">
        DÉTENDEUR
      </text>
      <text className={s.lab} x={560} y={236} textAnchor="middle">
        COMPTEUR
      </text>
      <text className={s.lab} x={710} y={236} textAnchor="middle">
        ÉLECTROVANNES
      </text>
      <text className={s.lab} x={847} y={236} textAnchor="middle">
        BRÛLEUR
      </text>

      <text className={`${s.lab} ${s.sub}`} x={120} y={258} textAnchor="middle">
        DN 50
      </text>
      <text className={`${s.lab} ${s.sub}`} x={405} y={258} textAnchor="middle">
        P 20 MBAR
      </text>
      <text className={`${s.lab} ${s.sub}`} x={560} y={258} textAnchor="middle">
        DÉBIT 4,5 M³/H
      </text>
      <text className={`${s.lab} ${s.sub}`} x={710} y={258} textAnchor="middle">
        SÉCURITÉ
      </text>
    </svg>
  );
}