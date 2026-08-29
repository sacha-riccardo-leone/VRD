"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { boxFaces, path, project, run, seg, type V3 } from "./iso";
import s from "./ReseauGainesIso.module.css";

/**
 * Réseau de gaines — vue AXONOMÉTRIQUE (illustration).
 *
 * Toute la géométrie est décrite en (x, y, z) puis projetée par iso.ts : aucune
 * coordonnée 2D n'est écrite à la main (l'ancrage des étiquettes est posé lui
 * aussi par project()). La profondeur vient donc de la projection, pas d'un
 * moteur 3D — c'est du trait vectoriel, net à toute échelle, fidèle à
 * l'impression, sans aucune dépendance.
 *
 * Les gaines sont des VOLUMES : chaque tronçon est une boîte dont on trace les
 * trois faces vues (dessus, +x, +z). Chaque volume est doublé d'un masque
 * fill=var(--paper) qui occulte ce qui passe derrière — seul emploi d'un aplat
 * ici. L'ordre de tracé suit la profondeur : socle, caisson, reprise, gaine
 * principale, puis chaque piquage du plus lointain au plus proche, et dans
 * chaque piquage plaque → plénum → chute → gaine. Les faces cachées ne sont
 * pas tracées : la chute et le socle sont dessinés sans leur dessus, qui est
 * occulté par le volume qui les surplombe.
 *
 * Monochrome strict. Les circuits se distinguent par le trait : soufflage =
 * plein épais avec flèches de sens posées à plat sur les faces (donc en 3D) ;
 * reprise = tireté plus fin ; lignes de rappel et cotes = pointillé fin.
 *
 * Le dessin s'assemble à l'arrivée dans le cadre : les arêtes se tracent en
 * cascade (caisson, gaine principale, puis les trois piquages), les masques,
 * symboles et flèches apparaissent, les étiquettes en dernier. Jouée une fois.
 * prefers-reduced-motion → tout est visible d'emblée. Ratio fixe → CLS 0.
 *
 * Contenu d'illustration : réseau générique et plausible, aucun projet réel.
 */

const p = (x: number, y: number, z: number): V3 => [x, y, z];
const iv = (n: number) => ({ "--i": n }) as CSSProperties;
const tri = (a: V3, b: V3, c: V3) => path([a, b, c], true);

/** Boîte fermée : les trois faces vues, réunies en un seul chemin. */
const box = (origin: V3, size: V3) => {
  const f = boxFaces(origin, size);
  return `${f.top} ${f.right} ${f.left}`;
};
/** Idem sans le dessus, quand un volume le surplombe et l'occulte. */
const sides = (origin: V3, size: V3) => {
  const f = boxFaces(origin, size);
  return `${f.right} ${f.left}`;
};

/* ------------------------------------------------------------------------ *
 * Géométrie 3D. Unité de dessin ≈ 23 mm : la section 26 × 13 u de la gaine
 * principale vaut 600 × 300 mm, soit 0,18 m² — 3 400 m³/h y passent à 5,2 m/s.
 *
 * Extrêmes projetés (sx = (x − z)·0,866 ; sy = (x + z)/2 − y) :
 *   sx  −91,8 (arête avant du caisson, x = −80, z = 26)
 *     → +224,3 (bout des lignes de rappel de cote, x = 246, z = −13)
 *   sy  −122 (haut du rappel du caisson, x = −70, z = −30, y = 72)
 *     → +161,5 (coin avant de la plaque de la 3ᵉ bouche, x = 209, z = 80)
 * Étiquettes comprises, le contenu occupe 397,8 × 345 ; le viewBox 444 × 392
 * avec translate(115, 175) laisse ≈ 23 de marge sur les quatre côtés.
 * ------------------------------------------------------------------------ */

/* Socle du caisson : x ∈ [−76, −12], y ∈ [−12, 0], z ∈ [−46, 22].
   Son dessus est sous le caisson, donc invisible : on ne le trace pas. */
const SOCLE_D = sides(p(-76, -12, -46), p(64, 12, 68));

/* Caisson de traitement d'air : x ∈ [−80, −8], y ∈ [0, 46], z ∈ [−50, 26] */
const CAISSON_D = box(p(-80, 0, -50), p(72, 46, 76));
/* Porte de visite, à plat sur la face avant (z = 26) */
const PANNEAU_D = [
  path([p(-72, 8, 26), p(-20, 8, 26), p(-20, 38, 26), p(-72, 38, 26)], true),
  seg(p(-72, 23, 26), p(-20, 23, 26)),
  seg(p(-24, 19, 26), p(-24, 27, 26)),
].join(" ");

/* Gaine principale, axe x : x ∈ [−8, 208], y ∈ [16, 29], z ∈ [−13, 13] */
const GAINE_D = box(p(-8, 16, -13), p(216, 13, 26));
/* Flèches de soufflage, posées sur le dessus de la gaine (y = 29) */
const SOUFFLAGE_D = [
  tri(p(60, 29, -6), p(60, 29, 6), p(76, 29, 0)),
  tri(p(140, 29, -6), p(140, 29, 6), p(156, 29, 0)),
].join(" ");

/* Reprise : revient en parallèle, en retrait (z = −46) et plus haut (y = 26),
   jusqu'à la face latérale du caisson. */
const REPRISE_D = run([p(198, 26, -46), p(-8, 26, -46)]);
const REPRISE_FLECHE_D = tri(p(100, 26, -52), p(100, 26, -40), p(84, 26, -46));

/* Trois piquages selon l'axe z, coudés à 90° vers une bouche de soufflage.
   Section conservée dans le coude : 14 × 10 u ≈ 320 × 230 mm. */
const BRANCHES = [40, 116, 192].map((cx) => ({
  cx,
  /* plaque de finition, légèrement plus large que le plénum */
  plaqueD: box(p(cx - 17, -16, 46), p(34, 3, 34)),
  plenumD: box(p(cx - 14, -13, 49), p(28, 9, 28)),
  /* chute : dessus omis, occulté par le piquage horizontal qui la surplombe */
  chuteD: sides(p(cx - 7, -4, 60), p(14, 21, 10)),
  gaineD: box(p(cx - 7, 17, 13), p(14, 10, 57)),
  flechesD: [
    tri(p(cx - 5, 27, 30), p(cx + 5, 27, 30), p(cx, 27, 46)),
    tri(p(cx - 5, 12, 70), p(cx + 5, 12, 70), p(cx, 3, 70)),
  ].join(" "),
}));

/* Cote de section, reportée depuis la face d'extrémité de la gaine */
const RAPPEL_COTE_D = [
  seg(p(208, 29, -13), p(246, 29, -13)),
  seg(p(208, 29, 13), p(246, 29, 13)),
  seg(p(208, 16, 13), p(246, 16, 13)),
].join(" ");
const COTE_D = [seg(p(238, 29, -13), p(238, 29, 13)), seg(p(238, 29, 13), p(238, 16, 13))].join(" ");
const COTE_FLECHES_D = [
  tri(p(238, 29, -13), p(236.6, 29, -8), p(239.4, 29, -8)),
  tri(p(238, 29, 13), p(236.6, 29, 8), p(239.4, 29, 8)),
  tri(p(238, 29, 13), p(236.6, 24.5, 13), p(239.4, 24.5, 13)),
  tri(p(238, 16, 13), p(236.6, 20.5, 13), p(239.4, 20.5, 13)),
].join(" ");

/* Lignes de rappel des étiquettes */
const RAPPELS_D = [
  seg(p(-70, 46, -30), p(-70, 72, -30)), // caisson
  seg(p(168, 29, -13), p(168, 92, -13)), // gaine principale
  seg(p(199, 17, 25), p(199, -24, 25)), // piquage, au droit du raccordement
  seg(p(175, -16, 80), p(175, -34, 80)), // bouche
  seg(p(198, 26, -46), p(198, 56, -46)), // reprise
].join(" ");

/* Ancrages d'étiquettes : posés en 2D, mais calculés par project() */
const [CAISSON_LX, CAISSON_LY] = project(p(-70, 92, -30));
const [GAINE_LX, GAINE_LY] = project(p(168, 114, -13));
const [PIQUAGE_LX, PIQUAGE_LY] = project(p(203, -22, 21));
const [BOUCHE_LX, BOUCHE_LY] = project(p(175, -49, 80));
const [REPRISE_LX, REPRISE_LY] = project(p(198, 64, -46));
const [COTE_LX, COTE_LY] = project(p(258, 14, -13));

export function ReseauGainesIso() {
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
      viewBox="0 0 444 392"
      role="img"
      aria-label="Vue axonométrique d'un réseau de gaines de ventilation. Un caisson de traitement d'air posé sur son socle, débit 3 400 mètres cubes par heure, alimente une gaine principale rectangulaire de section 600 sur 300 millimètres, où l'air circule à 5,2 mètres par seconde. Trois piquages s'en détachent perpendiculairement, chacun coudé à 90 degrés vers le bas et terminé par une bouche de soufflage à plénum et plaque, 1 130 mètres cubes par heure chacune. Une gaine de reprise, tracée en tireté, revient parallèlement en retrait jusqu'au caisson."
    >
      <g transform="translate(115,175)">
        {/* --- Socle, puis caisson : le caisson masque le dessus du socle --- */}
        <path className={s.solid} d={SOCLE_D} />
        <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={1.6} d={SOCLE_D} />
        <path className={s.solid} d={CAISSON_D} />
        <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.2} d={CAISSON_D} />
        <path className={s.sym} strokeWidth={1.2} d={PANNEAU_D} />

        {/* --- Reprise : tireté plus fin, en retrait, parallèle ----------- */}
        <path className={s.pipeDashed} strokeWidth={1.5} d={REPRISE_D} />
        <path className={s.arrow} d={REPRISE_FLECHE_D} />

        {/* --- Gaine principale : trait plein le plus épais --------------- */}
        <path className={s.solid} d={GAINE_D} />
        <path className={s.pipe} style={iv(1)} pathLength={1} strokeWidth={2.6} d={GAINE_D} />
        <path className={s.arrow} d={SOUFFLAGE_D} />

        {/* --- Piquages : du plus bas au plus haut, donc du fond vers l'avant */}
        {BRANCHES.map((b, k) => (
          <g key={b.cx}>
            <path className={s.solid} d={b.plaqueD} />
            <path
              className={s.pipe}
              style={iv(2 + k)}
              pathLength={1}
              strokeWidth={1.4}
              d={b.plaqueD}
            />
            <path className={s.solid} d={b.plenumD} />
            <path
              className={s.pipe}
              style={iv(2 + k)}
              pathLength={1}
              strokeWidth={1.8}
              d={b.plenumD}
            />
            <path className={s.solid} d={b.chuteD} />
            <path className={s.pipe} style={iv(2 + k)} pathLength={1} strokeWidth={2} d={b.chuteD} />
            <path className={s.solid} d={b.gaineD} />
            <path className={s.pipe} style={iv(2 + k)} pathLength={1} strokeWidth={2} d={b.gaineD} />
            <path className={s.arrow} d={b.flechesD} />
          </g>
        ))}

        {/* --- Cote de section + lignes de rappel ------------------------- */}
        <path className={s.rappel} d={RAPPEL_COTE_D} />
        <path className={s.cote} d={COTE_D} />
        <path className={s.coteArrow} d={COTE_FLECHES_D} />
        <path className={s.rappel} d={RAPPELS_D} />

        {/* --- Étiquettes ------------------------------------------------- */}
        <text className={s.lab} x={CAISSON_LX} y={CAISSON_LY} textAnchor="middle">
          Caisson
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={CAISSON_LX}
          y={CAISSON_LY + 14}
          textAnchor="middle"
        >
          3 400 m³/h
        </text>

        <text className={s.lab} x={GAINE_LX} y={GAINE_LY} textAnchor="middle">
          Gaine principale
        </text>
        <text className={`${s.lab} ${s.data}`} x={GAINE_LX} y={GAINE_LY + 14} textAnchor="middle">
          5,2 m/s
        </text>

        <text className={s.lab} x={PIQUAGE_LX} y={PIQUAGE_LY} textAnchor="start">
          Piquage
        </text>

        <text className={s.lab} x={BOUCHE_LX} y={BOUCHE_LY} textAnchor="middle">
          Bouche
        </text>
        <text className={`${s.lab} ${s.data}`} x={BOUCHE_LX} y={BOUCHE_LY + 14} textAnchor="middle">
          1 130 m³/h
        </text>

        <text className={s.lab} x={REPRISE_LX} y={REPRISE_LY} textAnchor="middle">
          Reprise
        </text>

        <text className={s.lab} x={COTE_LX} y={COTE_LY} textAnchor="start">
          Section
        </text>
        <text className={`${s.lab} ${s.data}`} x={COTE_LX} y={COTE_LY + 14} textAnchor="start">
          600 × 300 mm
        </text>
      </g>
    </svg>
  );
}
