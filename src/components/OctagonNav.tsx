"use client";

import { useEffect, useRef, useState } from "react";
import { DISCIPLINES } from "@/content/disciplines";
import { DisciplineIcon } from "./DisciplineIcon";
import { SchematicLoop } from "./SchematicLoop";
import { Manifold } from "./Manifold";
import { AirHandlingUnit } from "./AirHandlingUnit";
import { ColonneMontanteSanitaire } from "./ColonneMontanteSanitaire";
import { RampeGaz } from "./RampeGaz";
import { ChaufferieIso } from "./ChaufferieIso";
import { ReseauGainesIso } from "./ReseauGainesIso";
import { BatimentCoupeIso } from "./BatimentCoupeIso";
import s from "./OctagonNav.module.css";

/**
 * Octogone des huit domaines : image d'ouverture et navigation vers les
 * sections détaillées, plus bas dans la page.
 *
 * Géométrie — huit sommets d'un octogone régulier, sens horaire depuis midi.
 * Repère normalisé (viewBox 0 0 100 100) partagé par les arêtes et les nœuds :
 * les arêtes peuvent donc suivre les nœuds déplacés.
 *
 * Déplacement — ANCRÉ SUR LE NŒUD SURVOLÉ, jamais sur la position brute du
 * curseur. Les positions sont donc déterministes : elles se calculent au rendu,
 * les transitions CSS font le reste. Aucune boucle d'animation, aucun
 * scintillement, aucun état bloqué en balayant rapidement les nœuds.
 * Voisins immédiats : 12 px vers le nœud survolé. Voisins suivants : 4 px.
 * Au-delà : rien.
 *
 * Repli — sous 640 px le CSS reflue le MÊME DOM en grille de deux colonnes.
 * Les huit noms sont écrits dans le document dès le premier rendu.
 */

const N = 8;
const R = 50;
const CX = 50;
const CY = 50;

/** Sommet i, sens horaire depuis midi. */
function vertex(i: number): [number, number] {
  const a = (-90 + i * (360 / N)) * (Math.PI / 180);
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}
const VERTICES: [number, number][] = Array.from({ length: N }, (_, i) => vertex(i));

/** Attraction en pixels, par distance au nœud survolé. */
const PULL = [0, 12, 4] as const; // 0 = le nœud survolé lui-même (il ne bouge pas)

/** Distance cyclique entre deux index sur l'anneau (0…4). */
function ringGap(a: number, b: number): number {
  const d = Math.abs(a - b);
  return Math.min(d, N - d);
}

/**
 * Déplacement du nœud i lorsque `hover` est survolé — vecteur unitaire de i
 * vers le nœud survolé, multiplié par l'attraction de son rang.
 */
function offsetFor(i: number, hover: number | null): { x: number; y: number } {
  if (hover === null || hover === i) return { x: 0, y: 0 };
  const gap = ringGap(i, hover);
  if (gap > 2) return { x: 0, y: 0 };
  const [ax, ay] = VERTICES[i];
  const [bx, by] = VERTICES[hover];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const p = PULL[gap];
  return { x: (dx / len) * p, y: (dy / len) * p };
}

/** Le schéma affiché à droite pour chaque domaine. */
function Schematic({ id }: { id: string }) {
  switch (id) {
    case "chauffage":
      return <ChaufferieIso />;
    case "ventilation":
      return <AirHandlingUnit />;
    case "froid":
      return <SchematicLoop />;
    case "sanitaire":
      return <ColonneMontanteSanitaire />;
    case "sprinkler":
      return <Manifold />; // approximation : réseau de distribution
    case "bim":
      return <BatimentCoupeIso />;
    case "mcr":
      return <RampeGaz />; // vannes, détente, comptage : la chaîne de régulation
    default:
      return <ReseauGainesIso />; // énergétique — approximation
  }
}

export function OctagonNav() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  /** Largeur du disque, pour convertir des pixels en unités de viewBox.
   *  Mise à jour au redimensionnement seulement — jamais pendant l'animation. */
  const [ringPx, setRingPx] = useState(640);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setRingPx(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const unitPerPx = 100 / ringPx;
  const offsets = Array.from({ length: N }, (_, i) => offsetFor(i, hover));
  const card = hover === null ? null : DISCIPLINES[hover];

  return (
    <div className={s.stage}>
      {/* Schémas : les huit sont montés en permanence et ne changent que
          d'opacité — d'où un fondu croisé sans démontage, donc sans
          scintillement ni schéma resté affiché. Décor pur. */}
      <div className={s.asides} aria-hidden="true">
        {DISCIPLINES.map((d, i) => (
          <div key={d.id} className={s.aside} data-on={hover === i ? "true" : undefined}>
            <Schematic id={d.id} />
          </div>
        ))}
      </div>

      <div ref={ringRef} className={s.ring}>
        {/* Arêtes entre sommets ADJACENTS uniquement — jamais un maillage.
            Les extrémités suivent les nœuds déplacés. */}
        <svg className={s.edges} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          {VERTICES.map((a, i) => {
            const j = (i + 1) % N;
            const b = VERTICES[j];
            return (
              <line
                key={i}
                x1={a[0] + offsets[i].x * unitPerPx}
                y1={a[1] + offsets[i].y * unitPerPx}
                x2={b[0] + offsets[j].x * unitPerPx}
                y2={b[1] + offsets[j].y * unitPerPx}
              />
            );
          })}
        </svg>

        <div className={s.center}>
          <div className={s.centerInner} aria-live="polite">
            {card === null ? (
              <p className={s.centerTitle}>Nos huit techniques</p>
            ) : (
              <div className={s.card}>
                <p className={s.cardName}>{card.label}</p>
                {card.teaser ? (
                  <p className={s.cardText}>{card.teaser}</p>
                ) : (
                  <p className={s.cardTodo}>Descriptif à fournir par VRD.</p>
                )}
                {card.chips.length > 0 ? (
                  <ul className={s.chips}>
                    {card.chips.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
                <span className={s.cardLink}>En savoir plus →</span>
              </div>
            )}
          </div>
        </div>

        {/* Ordre du DOM = sens horaire depuis midi = ordre de tabulation.
            Vrais liens : la page fonctionne sans JavaScript. */}
        {DISCIPLINES.map((d, i) => (
          <a
            key={d.id}
            href={`#${d.id}`}
            className={s.node}
            data-hovered={hover === i ? "true" : undefined}
            style={{
              left: `${VERTICES[i][0]}%`,
              top: `${VERTICES[i][1]}%`,
              // translate3d puis scale : transform et opacité seulement, jamais
              // une propriété qui déclencherait une mise en page.
              transform: `translate3d(${offsets[i].x}px, ${offsets[i].y}px, 0) scale(${
                hover === i ? 1.15 : 1
              })`,
            }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          >
            <span className={s.nodeIcon}>
              <DisciplineIcon name={d.id} />
            </span>
            <span className={s.nodeLabel}>{d.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
