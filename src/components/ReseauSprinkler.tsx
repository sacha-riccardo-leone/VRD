"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./ReseauSprinkler.module.css";

/**
 * Réseau sprinkler — installation fixe d'extinction automatique à eau.
 * Illustration composée ici : schéma de principe générique, ce n'est ni un
 * projet VRD réel ni le tracé d'un document tiers, et aucune marque n'y figure.
 *
 * Lecture de gauche à droite : réservoir, pompe, clapet anti-retour, poste de
 * contrôle sous eau (vanne principale verrouillée ouverte, manomètres amont et
 * aval, clapet d'alarme, cloche hydraulique), colonne montante, antenne de
 * distribution et têtes à déflecteur. En partie basse, la ligne d'essai et de
 * vidange se déverse librement à l'égout.
 *
 * Le dessin s'assemble au scroll : la conduite en charge se trace en cascade
 * (stroke-dashoffset sur pathLength=1), puis le tireté, les symboles et les
 * étiquettes apparaissent en fondu. Une seule idée de mouvement, déclenchée par
 * le lecteur, jouée une fois. En prefers-reduced-motion, ou sans JS, tout est
 * visible d'emblée. viewBox fixe → CLS nul.
 *
 * Monochrome strict : les circuits se distinguent par LE TRAIT. Conduite en
 * charge = trait plein épais avec flèches de sens ; liaison d'alarme, ligne
 * d'essai et jets = tireté plus fin. Les corps d'appareils sont masqués en
 * var(--paper) pour se lire comme des organes montés en ligne.
 */

const iv = (n: number) => ({ "--i": n }) as CSSProperties;

/** Abscisses des quatre têtes représentées, entraxe constant de 80 unités. */
const TETES: readonly number[] = [675, 755, 835, 915];

/** Descente de tête : de l'antenne (y 70) au corps de la tête (y 106). */
const descente = (x: number): string => `M${x} 70 V106`;

/** Jet symbolisé sous le déflecteur : trois filets divergents. */
const jet = (x: number): string =>
  `M${x - 8} 131 L${x - 16} 148 M${x} 131 V150 M${x + 8} 131 L${x + 16} 148`;

export function ReseauSprinkler() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.draw = "done"; // visible immédiatement, sans animation
      return;
    }
    el.dataset.draw = "pending"; // seul état qui masque quoi que ce soit
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
      viewBox="0 0 1040 480"
      role="img"
      aria-label="Schéma de principe d’une installation de protection incendie par sprinklers. À gauche, un réservoir d’eau de 120 mètres cubes alimente une pompe, puis un clapet anti-retour ; la conduite en charge DN 100 entre dans un poste de contrôle sous eau qui réunit une vanne principale verrouillée en position ouverte, un manomètre amont, un clapet d’alarme et un manomètre aval sous 6 bar. Une liaison en tireté relie le clapet d’alarme à une cloche d’alarme hydraulique placée au-dessus du poste. La conduite s’élève ensuite par une colonne montante jusqu’à une antenne horizontale DN 65, d’où descendent quatre têtes sprinkler à déflecteur, cotées à un entraxe de 3,00 mètres et protégeant 12 mètres carrés chacune ; l’antenne se termine par un bouchon. En partie basse, une ligne d’essai et de vidange en tireté part du poste, traverse un robinet et se déverse librement à l’égout. Des flèches indiquent le sens d’écoulement."
    >
      {/* --- Conduite en charge : trait plein, se trace en cascade --------- */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.4} d="M136 290 H330" />
      <path className={s.pipe} style={iv(1)} pathLength={1} strokeWidth={2.4} d="M330 290 H558" />
      <path
        className={s.pipe}
        style={iv(2)}
        pathLength={1}
        strokeWidth={2.4}
        d="M558 290 H588 Q596 290 596 282 V78 Q596 70 604 70"
      />
      <path className={s.pipe} style={iv(3)} pathLength={1} strokeWidth={2.4} d="M604 70 H990" />
      <path
        className={s.pipe}
        style={iv(4)}
        pathLength={1}
        strokeWidth={1.9}
        d={TETES.map(descente).join(" ")}
      />

      {/* --- Circuits secondaires en tireté -------------------------------- */}
      <path className={s.pipeDashed} strokeWidth={1.5} d="M536 290 V386 H578 M602 386 H660 V406" />
      <path className={s.pipeDashed} strokeWidth={1.4} d="M440 274 V166" />
      <path className={s.pipeDashed} strokeWidth={1.2} d={TETES.map(jet).join(" ")} />

      {/* --- Réservoir ----------------------------------------------------- */}
      <g className={s.sym}>
        <rect x={48} y={230} width={88} height={90} rx={3} strokeWidth={1.8} />
        <path
          strokeWidth={1.3}
          d="M58 254 q11 -7 22 0 t22 0 t22 0 M58 266 q11 -7 22 0 t22 0 t22 0"
        />
      </g>

      {/* --- Pompe : cercle masqué + triangle de refoulement ---------------- */}
      <g className={s.sym}>
        <circle className={s.mask} cx={200} cy={290} r={18} strokeWidth={1.8} />
        <path className={s.solid} d="M192 280 L212 290 L192 300 Z" />
      </g>

      {/* --- Clapet anti-retour : siège + battant articulé ------------------ */}
      <g className={s.sym}>
        <path strokeWidth={1.7} d="M262 276 V304" />
        <path strokeWidth={1.6} d="M262 277 L277 299" />
        <circle className={s.solid} cx={262} cy={276} r={2.4} />
      </g>

      {/* --- Poste de contrôle sous eau ------------------------------------ */}
      <g className={s.sym}>
        <rect
          x={330}
          y={190}
          width={228}
          height={152}
          rx={4}
          strokeWidth={1.2}
          strokeDasharray="1 6"
          strokeLinecap="round"
        />

        {/* vanne principale verrouillée ouverte */}
        <path strokeWidth={1.8} d="M353 278 L353 302 L377 278 L377 302 Z" />
        <path strokeWidth={1.6} d="M365 290 V266" />
        <path strokeWidth={1.8} d="M353 266 H377" />
        <rect className={s.mask} x={358} y={252} width={14} height={12} rx={1.5} strokeWidth={1.4} />
        <path strokeWidth={1.4} d="M361 252 V248 a4 4 0 0 1 8 0 V252" />
        <path strokeWidth={1.2} d="M365 256 V260" />

        {/* manomètre amont */}
        <path strokeWidth={1.5} d="M400 290 V242" />
        <circle className={s.mask} cx={400} cy={232} r={10} strokeWidth={1.6} />
        <path strokeWidth={1.4} d="M400 232 L406 226" />
        <circle className={s.solid} cx={400} cy={232} r={1.6} />

        {/* clapet d'alarme */}
        <circle className={s.mask} cx={440} cy={290} r={16} strokeWidth={1.8} />
        <path strokeWidth={1.4} d="M432 278 V302" />
        <path strokeWidth={1.6} d="M432 279 L450 296" />
        <circle className={s.solid} cx={432} cy={278} r={2} />

        {/* manomètre aval */}
        <path strokeWidth={1.5} d="M470 290 V242" />
        <circle className={s.mask} cx={470} cy={232} r={10} strokeWidth={1.6} />
        <path strokeWidth={1.4} d="M470 232 L476 226" />
        <circle className={s.solid} cx={470} cy={232} r={1.6} />

        {/* cloche d'alarme hydraulique */}
        <path strokeWidth={1.8} d="M420 166 A20 18 0 0 1 460 166" />
        <path strokeWidth={1.8} d="M412 166 H468" />
        <path strokeWidth={1.4} d="M426 166 V171" />
        <circle className={s.solid} cx={426} cy={174} r={3.4} />
        <path strokeWidth={1.3} d="M404 158 q-7 8 0 16 M476 158 q7 8 0 16" />
      </g>

      {/* --- Têtes sprinkler, cotation d'entraxe, bouchon d'antenne --------- */}
      <g className={s.sym}>
        {TETES.map((x) => (
          <g key={x}>
            <rect className={s.mask} x={x - 4} y={106} width={8} height={9} strokeWidth={1.5} />
            <path
              strokeWidth={1.4}
              d={`M${x - 4} 115 L${x - 9} 126 M${x + 4} 115 L${x + 9} 126`}
            />
            <path strokeWidth={2.2} d={`M${x - 12} 126 H${x + 12}`} />
          </g>
        ))}
        <path strokeWidth={1.2} d="M675 156 V178 M755 156 V178 M675 172 H755" />
        <path strokeWidth={1.3} d="M671 176 L679 168 M751 176 L759 168" />
        <path strokeWidth={1.6} d="M990 62 V78" />
      </g>

      {/* --- Flèches de sens et organes de la ligne d'essai ----------------- */}
      <g className={s.sym}>
        <path
          strokeWidth={1.6}
          d="M164 284 L172 290 L164 296 M304 284 L312 290 L304 296 M590 148 L596 140 L602 148 M694 64 L702 70 L694 76"
        />
        <path strokeWidth={1.5} d="M578 378 L578 394 L602 378 L602 394 Z" />
        <path strokeWidth={1.4} d="M626 380 L634 386 L626 392" />
        <path strokeWidth={1.4} d="M646 414 H674 M652 420 H668 M657 426 H663" />
      </g>

      {/* --- Étiquettes ----------------------------------------------------- */}
      <text className={s.lab} x={92} y={344} textAnchor="middle">
        RÉSERVOIR
      </text>
      <text className={`${s.lab} ${s.sub}`} x={92} y={364} textAnchor="middle">
        120&#160;M³
      </text>

      <text className={s.lab} x={200} y={244} textAnchor="middle">
        POMPE
      </text>
      <text className={`${s.lab} ${s.sub}`} x={200} y={262} textAnchor="middle">
        Q&#160;1&#160;800&#160;L/MIN
      </text>

      <text className={`${s.lab} ${s.sub}`} x={303} y={276} textAnchor="middle">
        DN&#160;100
      </text>
      <text className={s.lab} x={262} y={344} textAnchor="middle">
        ANTI-RETOUR
      </text>

      <text className={s.lab} x={440} y={130} textAnchor="middle">
        CLOCHE D’ALARME
      </text>
      <text className={`${s.lab} ${s.sub}`} x={486} y={236} textAnchor="start">
        P&#160;6&#160;BAR
      </text>
      <text className={`${s.lab} ${s.sub}`} x={365} y={326} textAnchor="middle">
        VANNE
      </text>
      <text className={`${s.lab} ${s.sub}`} x={455} y={326} textAnchor="middle">
        CLAPET D’ALARME
      </text>
      <text className={s.lab} x={440} y={366} textAnchor="middle">
        POSTE DE CONTRÔLE
      </text>

      <text className={s.lab} x={580} y={220} textAnchor="middle" transform="rotate(-90 580 220)">
        COLONNE MONTANTE
      </text>

      <text className={s.lab} x={620} y={52} textAnchor="start">
        ANTENNE
      </text>
      <text className={`${s.lab} ${s.sub}`} x={760} y={52} textAnchor="middle">
        DN&#160;65
      </text>

      <text className={`${s.lab} ${s.sub}`} x={715} y={194} textAnchor="middle">
        ENTRAXE 3,00&#160;M
      </text>
      <text className={s.lab} x={875} y={194} textAnchor="middle">
        TÊTES SPRINKLER
      </text>
      <text className={`${s.lab} ${s.sub}`} x={875} y={214} textAnchor="middle">
        AMPOULE 68&#160;°C
      </text>
      <text className={`${s.lab} ${s.sub}`} x={875} y={234} textAnchor="middle">
        12&#160;M² / TÊTE
      </text>

      <text className={s.lab} x={610} y={446} textAnchor="middle">
        ESSAI / VIDANGE
      </text>
    </svg>
  );
}
