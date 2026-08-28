"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { EXPLODED_PARTS } from "./exploded-parts";
import s from "./ExplodedAssembly.module.css";

/**
 * Vue éclatée — groupe de pompage (illustration). Line-work AUTHORED ici, pas
 * tracé sur un document tiers. Ellipses aplaties = convention des vues éclatées
 * (cylindres/disques vus légèrement de dessus). Numéros à repères + légende.
 *
 * Au scroll, l'assemblage « s'éclate » : chaque pièce part du centre vers sa
 * position, en cascade ; l'axe pointillé, puis les repères, apparaissent.
 * Une seule idée de mouvement, jouée une fois. reduced-motion → tout en place
 * d'emblée. SVG à ratio fixe → CLS 0. Monochrome, tout au trait.
 */
const CX = 440;
const CENTER = 400; // les pièces s'éloignent de ce centre

const hexPoints = Array.from({ length: 6 }, (_, k) => {
  const a = (k * Math.PI) / 3;
  return `${(CX + 46 * Math.cos(a)).toFixed(1)},${(165 + 23 * Math.sin(a)).toFixed(1)}`;
}).join(" ");

function cyl(cy: number, rx: number, h: number) {
  const ry = rx * 0.42;
  const ty = cy - h / 2;
  const by = cy + h / 2;
  return (
    <>
      <ellipse cx={CX} cy={ty} rx={rx} ry={ry} />
      <path d={`M${CX - rx} ${ty} L${CX - rx} ${by}`} />
      <path d={`M${CX + rx} ${ty} L${CX + rx} ${by}`} />
      <path d={`M${CX - rx} ${by} A ${rx} ${ry} 0 0 0 ${CX + rx} ${by}`} />
    </>
  );
}

function renderPart(n: number) {
  switch (n) {
    case 1:
      return (
        <>
          <rect x={CX - 8} y={54} width={16} height={14} />
          {cyl(80, 22, 26)}
        </>
      );
    case 2:
      return (
        <>
          <polygon points={hexPoints} />
          <ellipse cx={CX} cy={165} rx={20} ry={9} />
        </>
      );
    case 3:
      return (
        <>
          <ellipse cx={CX} cy={230} rx={40} ry={17} />
          <ellipse cx={CX} cy={230} rx={27} ry={11} />
        </>
      );
    case 4:
      return (
        <>
          {cyl(330, 54, 78)}
          <path d={`M${CX - 54} 330 L${CX - 84} 330`} />
          <ellipse cx={CX - 84} cy={330} rx={6} ry={14} />
        </>
      );
    case 5:
      return (
        <>
          <ellipse cx={CX} cy={445} rx={52} ry={22} />
          <ellipse cx={CX} cy={445} rx={12} ry={6} />
          {Array.from({ length: 8 }, (_, k) => {
            const a = (k * Math.PI) / 4;
            return (
              <line
                key={k}
                x1={CX + 14 * Math.cos(a)}
                y1={445 + 7 * Math.sin(a)}
                x2={CX + 50 * Math.cos(a)}
                y2={445 + 21 * Math.sin(a)}
              />
            );
          })}
        </>
      );
    case 6:
      return (
        <>
          {cyl(565, 44, 104)}
          <path d={`M${CX - 44} 545 A 44 18 0 0 0 ${CX + 44} 545`} />
          <path d={`M${CX - 44} 585 A 44 18 0 0 0 ${CX + 44} 585`} />
          <rect x={CX + 44} y={540} width={26} height={22} />
        </>
      );
    default:
      return (
        <>
          <ellipse cx={CX} cy={690} rx={66} ry={24} />
          <ellipse cx={CX - 30} cy={684} rx={7} ry={3} />
          <ellipse cx={CX + 30} cy={684} rx={7} ry={3} />
          <path d={`M${CX - 46} 706 L${CX - 40} 726 L${CX - 24} 726 L${CX - 30} 706`} />
          <path d={`M${CX + 46} 706 L${CX + 40} 726 L${CX + 24} 726 L${CX + 30} 706`} />
        </>
      );
  }
}

export function ExplodedAssembly() {
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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={s.svg}
      viewBox="0 0 620 780"
      role="img"
      aria-label="Vue éclatée d'un groupe de pompage, sept pièces alignées sur un axe : 1 bouchon de purge, 2 écrou-union, 3 joint torique, 4 corps de vanne, 5 roue, 6 moteur, 7 socle."
    >
      <path className={s.axis} d="M440 45 L440 735" />

      {EXPLODED_PARTS.map((p, idx) => (
        <g
          key={p.n}
          className={s.part}
          style={{ "--dy": `${CENTER - p.cy}px`, "--i": idx } as CSSProperties}
        >
          {renderPart(p.n)}
        </g>
      ))}

      <g className={s.callout}>
        {EXPLODED_PARTS.map((p) => (
          <g key={p.n}>
            <line className={s.leader} x1={147} y1={p.cy} x2={p.lx} y2={p.cy} />
            <circle className={s.balloon} cx={130} cy={p.cy} r={15} />
            <text className={s.num} x={130} y={p.cy} textAnchor="middle" dominantBaseline="central">
              {p.n}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
