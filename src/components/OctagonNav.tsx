"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DISCIPLINES } from "@/content/disciplines";
import { DisciplineIcon } from "./DisciplineIcon";
import s from "./OctagonNav.module.css";

/**
 * Octogone des huit domaines : à la fois image d'ouverture et navigation vers
 * les sections détaillées, plus bas dans la page.
 *
 * Géométrie — huit sommets d'un octogone régulier, dans le sens horaire depuis
 * midi. L'espace de travail est normalisé (viewBox 0 0 100 100) : le SVG des
 * arêtes et les nœuds partagent donc exactement le même repère, et les arêtes
 * peuvent suivre les nœuds déplacés.
 *
 * Magnétisme — UN seul écouteur `pointermove` sur le conteneur, UNE seule
 * boucle rAF, et les transformations sont écrites directement dans le DOM par
 * refs. Aucun état React dans la boucle : aucun rendu pendant l'animation.
 *
 * Repli — la boucle n'est jamais attachée sous 1024 px, ni sur pointeur
 * grossier, ni sous `prefers-reduced-motion`. Sous 640 px, le CSS reflue le même
 * DOM en grille de deux colonnes : les huit noms restent dans le document,
 * écrits, dès le premier rendu.
 */

const N = 8;
const R = 50; // rayon, en unités de viewBox
const CX = 50;
const CY = 50;

/** Sommet i, sens horaire depuis midi. */
function vertex(i: number): [number, number] {
  const a = (-90 + i * (360 / N)) * (Math.PI / 180);
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}

const VERTICES: [number, number][] = Array.from({ length: N }, (_, i) => vertex(i));

/** Longueur d'arête d'un octogone régulier : 2·R·sin(π/8). */
const EDGE = 2 * R * Math.sin(Math.PI / N);
/** Rayon d'influence : 0,6 × l'arête — deux nœuds adjacents au plus réagissent. */
const INFLUENCE = 0.6 * EDGE;
const MAX_PUSH = 24; // px
const LERP = 0.15;

export function OctagonNav() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const raf = useRef(0);

  // État d'animation — hors de React, pour ne provoquer aucun rendu.
  const cur = useRef(Array.from({ length: N }, () => ({ x: 0, y: 0 })));
  const tgt = useRef(Array.from({ length: N }, () => ({ x: 0, y: 0 })));

  const [active, setActive] = useState<number | null>(null);

  /** Applique les positions courantes aux nœuds ET aux arêtes. */
  const paint = useCallback((unitPerPx: number) => {
    for (let i = 0; i < N; i++) {
      const el = nodeRefs.current[i];
      if (el) {
        const { x, y } = cur.current[i];
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }
    // Les arêtes reprennent les sommets déplacés, convertis en unités.
    for (let i = 0; i < N; i++) {
      const line = lineRefs.current[i];
      if (!line) continue;
      const j = (i + 1) % N;
      const a = VERTICES[i];
      const b = VERTICES[j];
      line.setAttribute("x1", String(a[0] + cur.current[i].x * unitPerPx));
      line.setAttribute("y1", String(a[1] + cur.current[i].y * unitPerPx));
      line.setAttribute("x2", String(b[0] + cur.current[j].x * unitPerPx));
      line.setAttribute("y2", String(b[1] + cur.current[j].y * unitPerPx));
    }
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Le magnétisme ne s'attache qu'aux pointeurs fins, en large, sans réserve
    // de mouvement. Ailleurs : rien du tout, pas même l'écouteur.
    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    let box = wrap.getBoundingClientRect();
    const remeasure = () => {
      box = wrap.getBoundingClientRect();
    };
    const ro = new ResizeObserver(remeasure);
    ro.observe(wrap);

    const tick = () => {
      const unitPerPx = box.width ? 100 / box.width : 0;
      let moving = false;
      for (let i = 0; i < N; i++) {
        const c = cur.current[i];
        const t = tgt.current[i];
        c.x += (t.x - c.x) * LERP;
        c.y += (t.y - c.y) * LERP;
        if (Math.abs(t.x - c.x) > 0.05 || Math.abs(t.y - c.y) > 0.05) moving = true;
      }
      paint(unitPerPx);
      if (moving) {
        raf.current = requestAnimationFrame(tick);
      } else {
        raf.current = 0; // au repos : la boucle s'arrête d'elle-même
      }
    };

    const start = () => {
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const px = e.clientX - box.left;
      const py = e.clientY - box.top;
      const pxPerUnit = box.width / 100;
      const influencePx = INFLUENCE * pxPerUnit;
      for (let i = 0; i < N; i++) {
        const vx = VERTICES[i][0] * pxPerUnit;
        const vy = VERTICES[i][1] * pxPerUnit;
        const dx = px - vx;
        const dy = py - vy;
        const d = Math.hypot(dx, dy);
        if (d < influencePx && d > 0.001) {
          const f = Math.min(Math.max(1 - d / influencePx, 0), 1); // décroissance linéaire
          tgt.current[i].x = (dx / d) * MAX_PUSH * f;
          tgt.current[i].y = (dy / d) * MAX_PUSH * f;
        } else {
          tgt.current[i].x = 0;
          tgt.current[i].y = 0;
        }
      }
      start();
    };

    const onEnter = () => {
      remeasure();
      start();
    };

    const onLeave = () => {
      for (let i = 0; i < N; i++) {
        tgt.current[i].x = 0;
        tgt.current[i].y = 0;
      }
      start(); // la boucle ramène les nœuds à l'origine, puis s'arrête
    };

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [paint]);

  const card = active === null ? null : DISCIPLINES[active];

  return (
    <div className={s.stage}>
      <div ref={wrapRef} className={s.ring}>
        {/* Arêtes : uniquement entre sommets ADJACENTS — jamais un maillage
            complet. Même traitement de trait que la grille du champ thermique. */}
        <svg className={s.edges} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          {VERTICES.map((a, i) => {
            const b = VERTICES[(i + 1) % N];
            return (
              <line
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
              />
            );
          })}
        </svg>

        {/* Centre : titre par défaut, carte au survol ou au focus. */}
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

        {/* Les huit nœuds. Ordre du DOM = sens horaire depuis midi = ordre de
            tabulation. Ce sont de vrais liens : ils fonctionnent sans JS. */}
        {DISCIPLINES.map((d, i) => (
          <a
            key={d.id}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            href={`#${d.id}`}
            className={s.node}
            style={{ left: `${VERTICES[i][0]}%`, top: `${VERTICES[i][1]}%` }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
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
