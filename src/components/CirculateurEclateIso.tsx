"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { boxFaces, circle, path, project, seg, type V3 } from "./iso";
import s from "./CirculateurEclateIso.module.css";

/**
 * Vue éclatée axonométrique d'un circulateur — illustration.
 *
 * Toute la géométrie est décrite en (x, y, z) puis projetée par `iso.ts` :
 * le relief vient de la projection, jamais d'un rendu 3D. Sept pièces empilées
 * le long de l'axe d'éclatement (y), séparées par des jeux réguliers, reliées
 * par l'axe en pointillé qui les traverse (visible à travers les alésages).
 *
 * Line-work AUTHORED ici : aucune pièce n'est relevée sur un document tiers,
 * aucune marque, cotes plausibles mais génériques.
 *
 * ÉCHELLE — une seule, pour que les valeurs cotées restent cohérentes entre
 * elles : 1 unité de dessin = 5 mm. D'où socle 52 u = 26 cm, roue Ø 38 u =
 * 190 mm, corps Ø 42 u = 210 mm, alésage de bride Ø 13 u = 65 mm et piquage
 * Ø 14 u = 70 mm, soit DN 65 — à 12 m³/h la vitesse vaut ≈ 1,0 m/s, ce qui
 * est la plage usuelle d'une distribution de chauffage.
 *
 * REPÈRES PROJETÉS (sx = (x−z)·0,866 ; sy = (x+z)·0,5 − y). Un disque de
 * rayon r perché en y occupe sy ∈ [−0,707 r − y ; +0,707 r − y] : c'est ce
 * demi-grand axe, et non l'écart en y, qui fixe le jeu entre deux pièces —
 * l'empilage est calé pour ~11 unités de vide projeté partout.
 *   axe                     y ∈ [−16, 338]   → sy ∈ [−338, +16]
 *   socle 52×7×52 centré                     → sx ∈ [−45, +45], sy ∈ [−33, +26]
 *   ligne de cote du socle                   → sx = −58,0, sy = +44,5
 *   étiquette « 26 cm », pivotée de 30°      → sy = +53,6
 *   colonne des pastilles x = −42, z = 42    → sx = −72,7 (r = 12)
 *   étiquette de légende la plus longue      → sx = −224,0
 *   bout de la ligne de rappel DN            → sx = +71,9
 *   étiquette « 12 m³/h »                    → sx = +126,4
 * Contenu réel : 350,4 × 391,6. D'où viewBox 384 × 424 et translate(240, 354),
 * qui laisse 16,0 à gauche, 17,6 à droite, 16,0 en haut et 16,4 en bas.
 */

/* ── outils de composition, bâtis sur iso.ts ─────────────────────────────
   iso.ts fournit la projection ; on lui ajoute ici la silhouette pleine
   (nécessaire au masquage en --paper) et la séparation arc vu / arc caché. */

const N = 48;
const T = Math.SQRT1_2; // direction (−1, 0, 1) : horizontale à l'écran

/** Indices des deux génératrices apparentes d'un disque échantillonné. */
function extremes(pts: readonly V3[]): [number, number] {
  let lo = 0;
  let hi = 0;
  pts.forEach((p, i) => {
    const x = project(p)[0];
    if (x < project(pts[lo])[0]) lo = i;
    if (x > project(pts[hi])[0]) hi = i;
  });
  return [lo, hi];
}

/** Demi-arc d'un cercle échantillonné, de `from` vers `to`, indices croissants. */
function arcPts(pts: readonly V3[], from: number, to: number): V3[] {
  const out: V3[] = [];
  for (let k = 0; k <= pts.length; k++) {
    const i = (from + k) % pts.length;
    out.push(pts[i]);
    if (i === to) break;
  }
  return out;
}

type Cyl = {
  /** ellipse supérieure, vue en entier */
  top: string;
  /** demi-ellipse inférieure côté observateur — trait plein */
  near: string;
  /** demi-ellipse inférieure cachée — tireté */
  far: string;
  /** génératrices apparentes */
  sides: string;
  /** silhouette fermée, à remplir en --paper pour masquer l'arrière-plan */
  mask: string;
};

/** Cylindre d'axe y décomposé en traits vus / cachés + silhouette pleine. */
function cyl(base: V3, r: number, h: number): Cyl {
  const [bx, by, bz] = base;
  const t = circle([bx, by + h, bz], r, "xz", N);
  const b = circle([bx, by, bz], r, "xz", N);
  const [lo, hi] = extremes(b);
  return {
    top: path(t, true),
    near: path(arcPts(b, hi, lo)),
    far: path(arcPts(b, lo, hi)),
    sides: `${seg(b[lo], t[lo])} ${seg(b[hi], t[hi])}`,
    mask: path([...arcPts(t, lo, hi), ...arcPts(b, hi, lo)], true),
  };
}

/** Disque plan (plan xz) : alésage, trou de boulon, joint. */
const disc = (c: V3, r: number) => path(circle(c, r, "xz", N), true);

/** Arc avant d'un cercle horizontal — nervure de carter vue de face. */
function nervure(y: number, r: number): string {
  const c = circle([0, y, 0], r, "xz", N);
  const [lo, hi] = extremes(c);
  return path(arcPts(c, hi, lo));
}

/**
 * Le point est-il DANS la silhouette projetée d'un cylindre d'axe y ?
 * Sur la droite x − z = u, le cylindre de rayon r n'existe que si u² ≤ 2r²,
 * et il y occupe alors une bande verticale de demi-hauteur √(2r² − u²)/2.
 */
function dansCylindre(p: V3, r: number, y0: number, y1: number): boolean {
  const q = 2 * r * r - (p[0] - p[2]) ** 2;
  if (q < 0) return false;
  const half = Math.sqrt(q) / 2;
  const sy = project(p)[1];
  return sy >= -half - y1 && sy <= half - y0;
}

/**
 * Abscisse à laquelle une génératrice horizontale (y et z fixes) quitte cette
 * silhouette : c'est là que le piquage doit commencer à se voir, sinon son
 * trait traverse le corps de pompe qu'il est censé percer.
 */
function sortieDeCorps(y: number, z: number, r: number, y0: number, y1: number): number {
  let x = 0;
  while (x < 80 && dansCylindre([x, y, z], r, y0, y1)) x += 0.1;
  return x;
}

const deg = (d: number) => (d * Math.PI) / 180;

/** Arrondi d'affichage : garde le balisage lisible, sans effet sur le tracé. */
const r2 = (n: number) => Number(n.toFixed(2));

/** Angle écran de l'axe x projeté (30°) — sert à coucher la cote sur sa ligne. */
const [PX0, PY0] = project([0, 0, 0]);
const [PX1, PY1] = project([1, 0, 0]);
const ANGLE_X = r2((Math.atan2(PY1 - PY0, PX1 - PX0) * 180) / Math.PI);

/* ── 1 · géométrie des sept pièces (1 unité = 5 mm) ──────────────────── */

// axe d'éclatement, traverse tout l'empilage
const AXE = seg([0, -16, 0], [0, 338, 0]);

// 7 · socle — boîte plate 52 × 7 × 52, soit 26 cm de côté
const SOCLE = boxFaces([-26, 0, -26], [52, 7, 52]);
const SOCLE_FACES = `${SOCLE.top} ${SOCLE.right} ${SOCLE.left}`;
const SOCLE_ANCRAGES: readonly V3[] = [
  [-17, 7, -17],
  [17, 7, -17],
  [-17, 7, 17],
  [17, 7, 17],
];
const SOCLE_TROUS = SOCLE_ANCRAGES.map((p) => disc(p, 3)).join(" ");
const COTE = [
  seg([-26, -10, 40], [26, -10, 40]),
  seg([-26, 0, 26], [-26, -11, 41]),
  seg([26, 0, 26], [26, -11, 41]),
].join(" ");
const [COTE_X, COTE_Y] = project([0, -10, 40]);

// 6 · moteur — carter Ø 26 u (130 mm), nervures, boîte à bornes, bout d'arbre
const MOTEUR = cyl([0, 54, 0], 13, 44);
const NERVURES = [64, 72, 80, 88].map((y) => nervure(y, 13.6)).join(" ");
const BORNIER = boxFaces([11, 66, -7], [13, 16, 14]);
const BORNIER_FACES = `${BORNIER.top} ${BORNIER.right} ${BORNIER.left}`;
const ARBRE = cyl([0, 98, 0], 3.5, 10);

// 5 · roue à aubes — plateau Ø 38 u (190 mm), huit aubes radiales, moyeu
const PLATEAU = cyl([0, 135, 0], 19, 3);
const MOYEU = cyl([0, 138, 0], 7.5, 8);
const AUBES = Array.from({ length: 8 }, (_, k) => {
  const a = deg(k * 45 + 22.5);
  return { c: Math.cos(a), z: Math.sin(a) };
})
  // tri arrière → avant : l'aube la plus proche masque celle qui est derrière
  .sort((u, v) => u.c + u.z - (v.c + v.z))
  .map((v) => {
    const quad: readonly V3[] = [
      [6 * v.c, 138, 6 * v.z],
      [18.5 * v.c, 138, 18.5 * v.z],
      [18.5 * v.c, 143.5, 18.5 * v.z],
      [6 * v.c, 143.5, 6 * v.z],
    ];
    return path(quad, true);
  });

// 4 · corps de pompe — volute Ø 42 u (210 mm), alésage traversant, chambre cachée
const R_CORPS = 21;
const Y_CORPS_BAS = 176;
const Y_CORPS_HAUT = 204;
const CORPS = cyl([0, Y_CORPS_BAS, 0], R_CORPS, Y_CORPS_HAUT - Y_CORPS_BAS);
const CORPS_ALESAGE = disc([0, Y_CORPS_HAUT, 0], 9);
const CORPS_MASK = `${CORPS.mask} ${CORPS_ALESAGE}`; // evenodd : l'axe traverse
const CHAMBRE = [
  disc([0, Y_CORPS_BAS, 0], 13),
  seg([-13 * T, Y_CORPS_BAS, 13 * T], [-13 * T, Y_CORPS_HAUT, 13 * T]),
  seg([13 * T, Y_CORPS_BAS, -13 * T], [13 * T, Y_CORPS_HAUT, -13 * T]),
].join(" ");

// réseau principal : piquage de refoulement DN 65 et sa bride.
// Les deux génératrices du piquage ne commencent qu'à la sortie de la
// silhouette du corps — sinon elles se dessineraient par-dessus la volute.
const RP = 7;
const YR = 190;
const GEN = [
  { y: YR - RP * T, z: RP * T },
  { y: YR + RP * T, z: -RP * T },
];
const REFOULEMENT = GEN.map(({ y, z }) =>
  seg([sortieDeCorps(y, z, R_CORPS, Y_CORPS_BAS, Y_CORPS_HAUT), y, z], [48, y, z]),
).join(" ");
const BRIDE_R = path(circle([48, YR, 0], 11, "zy", N), true);
const BRIDE_R_BORE = path(circle([48, YR, 0], RP, "zy", N), true);
const BRIDE_R_TROUS = [45, 135, 225, 315]
  .map((d) => {
    const a = deg(d);
    return path(circle([48, YR + Math.cos(a) * 9, Math.sin(a) * 9], 1.8, "zy", N), true);
  })
  .join(" ");
const DN_LEADER = seg([48, YR, -11], [60, YR, -23]);
const [DN_X, DN_Y] = project([60, YR, -23]);

// 3 · joint torique — deux cercles concentriques dans le plan xz
const JOINT_OUT = disc([0, 240, 0], 16);
const JOINT_IN = disc([0, 240, 0], 11.5);

// 2 · bride ronde — Ø 36 u (180 mm), alésage Ø 13 u (65 mm),
//     4 trous sur un cercle Ø 29 u (145 mm) : perçage de contre-bride DN 65
const BRIDE = cyl([0, 275, 0], 18, 3.5);
const BRIDE_BORE = disc([0, 278.5, 0], 6.5);
const BRIDE_TROUS = [45, 135, 225, 315]
  .map((d) => {
    const a = deg(d);
    return disc([Math.cos(a) * 14.5, 278.5, Math.sin(a) * 14.5], 1.8);
  })
  .join(" ");

// 1 · bouchon de purge — petit cylindre à six pans creux
const BOUCHON = cyl([0, 308, 0], 7, 11);
const BOUCHON_SIX_PANS = disc([0, 319, 0], 3.6);

/* ── 2 · repères, pastilles et légende ───────────────────────────────── */

type Piece = {
  readonly n: number;
  /** point d'attache de la ligne de rappel, sur la silhouette de la pièce */
  readonly from: V3;
  readonly lab: string;
  readonly sub?: string;
  /** valeur chiffrée : la casse des unités (mm, kW) doit être préservée */
  readonly subData?: boolean;
};

const PIECES: readonly Piece[] = [
  { n: 1, from: [-7 * T, 314, 7 * T], lab: "Bouchon de purge" },
  { n: 2, from: [-18 * T, 277, 18 * T], lab: "Bride ronde", sub: "4 × M16", subData: true },
  { n: 3, from: [-16 * T, 240, 16 * T], lab: "Joint torique" },
  { n: 4, from: [-21 * T, 190, 21 * T], lab: "Corps de pompe" },
  { n: 5, from: [-19 * T, 137, 19 * T], lab: "Roue à aubes", sub: "Ø 190 mm", subData: true },
  { n: 6, from: [-13 * T, 76, 13 * T], lab: "Moteur", sub: "1,5 kW", subData: true },
  { n: 7, from: [-26, 3.5, 26], lab: "Socle", sub: "Antivibratile" },
];

/** Colonne des pastilles : les points (−42, y, 42) se projettent en x constant. */
const balloon = (y: number): V3 => [-42, y, 42];
const LEG_X = -92; // fin des étiquettes de légende (repère écran)

/* ── 3 · fragments réutilisés ────────────────────────────────────────── */

function Cylindre({ c, mask }: { c: Cyl; mask?: string }) {
  return (
    <>
      <path className={s.solid} d={mask ?? c.mask} />
      <path className={s.pipeDashed} d={c.far} />
      <path className={s.pipe} pathLength={1} d={`${c.top} ${c.near} ${c.sides}`} />
    </>
  );
}

export function CirculateurEclateIso() {
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
      viewBox="0 0 384 424"
      role="img"
      aria-label="Vue éclatée axonométrique d'un circulateur : sept pièces empilées sur un axe vertical en pointillé et repérées de 1 à 7 — 1 bouchon de purge, 2 bride ronde à quatre boulons M16, 3 joint torique, 4 corps de pompe percé d'un alésage et muni d'un piquage de refoulement DN 65 débitant 12 mètres cubes par heure, 5 roue à aubes de 190 millimètres de diamètre, 6 moteur de 1,5 kilowatt avec boîte à bornes et bout d'arbre, 7 socle antivibratile de 26 centimètres de côté."
    >
      <g transform="translate(240,354)">
        {/* axe d'éclatement — pointillé fin, traverse tout l'empilage */}
        <path className={s.axis} d={AXE} />

        {/* 7 · socle */}
        <g style={{ "--i": 0 } as CSSProperties}>
          <path className={s.solid} d={SOCLE_FACES} />
          <path className={s.pipe} pathLength={1} d={SOCLE_FACES} />
          <path className={s.sym} d={SOCLE_TROUS} />
          <path className={s.leader} d={COTE} />
        </g>

        {/* 6 · moteur */}
        <g style={{ "--i": 1 } as CSSProperties}>
          <Cylindre c={MOTEUR} />
          <path className={s.sym} d={NERVURES} />
          <path className={s.solid} d={BORNIER_FACES} />
          <path className={s.pipe} pathLength={1} d={BORNIER_FACES} />
          <Cylindre c={ARBRE} />
        </g>

        {/* 5 · roue à aubes */}
        <g style={{ "--i": 2 } as CSSProperties}>
          <Cylindre c={PLATEAU} />
          {AUBES.map((d, k) => (
            <g key={k}>
              <path className={s.solid} d={d} />
              <path className={s.pipe} pathLength={1} d={d} />
            </g>
          ))}
          <Cylindre c={MOYEU} />
        </g>

        {/* 4 · corps de pompe */}
        <g style={{ "--i": 3 } as CSSProperties}>
          <Cylindre c={CORPS} mask={CORPS_MASK} />
          <path className={s.pipeDashed} d={CHAMBRE} />
          <path className={s.pipe} pathLength={1} d={CORPS_ALESAGE} />
        </g>

        {/* réseau principal — refoulement DN 65, trait plein le plus épais */}
        <g style={{ "--i": 7 } as CSSProperties}>
          <path className={`${s.pipe} ${s.main}`} pathLength={1} d={REFOULEMENT} />
          <path className={s.solid} d={`${BRIDE_R} ${BRIDE_R_BORE}`} />
          <path
            className={`${s.pipe} ${s.main}`}
            pathLength={1}
            d={`${BRIDE_R} ${BRIDE_R_BORE}`}
          />
          <path className={s.sym} d={BRIDE_R_TROUS} />
        </g>

        {/* 3 · joint torique */}
        <g style={{ "--i": 4 } as CSSProperties}>
          <path className={s.solid} d={`${JOINT_OUT} ${JOINT_IN}`} />
          <path className={s.pipe} pathLength={1} d={`${JOINT_OUT} ${JOINT_IN}`} />
        </g>

        {/* 2 · bride ronde */}
        <g style={{ "--i": 5 } as CSSProperties}>
          <Cylindre c={BRIDE} mask={`${BRIDE.mask} ${BRIDE_BORE}`} />
          <path className={s.pipe} pathLength={1} d={BRIDE_BORE} />
          <path className={s.sym} d={BRIDE_TROUS} />
        </g>

        {/* 1 · bouchon de purge */}
        <g style={{ "--i": 6 } as CSSProperties}>
          <Cylindre c={BOUCHON} />
          <path className={s.sym} d={BOUCHON_SIX_PANS} />
        </g>

        {/* données chiffrées du réseau */}
        <g>
          <path className={s.leader} d={DN_LEADER} />
          <text className={s.lab} x={r2(DN_X + 6)} y={r2(DN_Y - 6)}>
            DN 65
          </text>
          <text
            className={`${s.lab} ${s.sub} ${s.data}`}
            x={r2(DN_X + 6)}
            y={r2(DN_Y + 14)}
          >
            12 m³/h
          </text>
          {/* la cote du socle est couchée sur sa ligne : l'angle vient de la
              projection de l'axe x, pas d'une valeur écrite à la main */}
          <text
            className={`${s.lab} ${s.sub} ${s.data}`}
            x={r2(COTE_X)}
            y={r2(COTE_Y + 15)}
            textAnchor="middle"
            transform={`rotate(${ANGLE_X} ${r2(COTE_X)} ${r2(COTE_Y)})`}
          >
            26 cm
          </text>
        </g>

        {/* numéros à repères et légende */}
        <g data-labels>
        {PIECES.map((p) => {
          const [bx, by] = project(balloon(p.from[1])).map(r2);
          return (
            <g key={p.n}>
              <path className={s.leader} d={seg(p.from, balloon(p.from[1]))} />
              <circle className={s.node} cx={bx} cy={by} r={12} />
              <text
                className={s.num}
                x={bx}
                y={by}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {p.n}
              </text>
              <text
                className={s.lab}
                x={LEG_X}
                y={p.sub ? r2(by - 7) : by}
                textAnchor="end"
                dominantBaseline="central"
              >
                {p.lab}
              </text>
              {p.sub ? (
                <text
                  className={
                    p.subData ? `${s.lab} ${s.sub} ${s.data}` : `${s.lab} ${s.sub}`
                  }
                  x={LEG_X}
                  y={r2(by + 8)}
                  textAnchor="end"
                  dominantBaseline="central"
                >
                  {p.sub}
                </text>
              ) : null}
            </g>
          );
        })}
        </g>
      </g>
    </svg>
  );
}
