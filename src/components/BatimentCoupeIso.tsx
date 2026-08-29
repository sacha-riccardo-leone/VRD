"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { boxFaces, circle, cylinder, path, project, run, seg, type V3 } from "./iso";
import s from "./BatimentCoupeIso.module.css";

/**
 * Coupe axonométrique d'un petit bâtiment CVCS — ILLUSTRATION.
 *
 * Toute la géométrie est décrite en (x, y, z) puis projetée par ./iso : c'est
 * une projection, pas un rendu. L'écorché retire la façade avant (le montant
 * x=+HW / z=+HD n'est pas tracé) pour laisser voir la technique, qui est le
 * sujet : trait épais pour les réseaux, trait fin pour l'architecture.
 *
 * Repère : x droite-bas, z gauche-bas, y vers le haut.
 * Projection : sx = (x - z)·0,866 ; sy = (x + z)·0,5 - y.
 *
 * Extrêmes projetés recalculés sur TOUS les points, étiquettes comprises
 * (avance mono retenue : 0,62 em + 0,06 em d'interlettrage) :
 *   sx : -190,9 (fin gauche de « TOITURE », ancrée en end à sx = -138,6)
 *        → +225,3 (fin de « COLONNE MONTANTE », ancrée en start à sx = +105,7)
 *   sy : -223,5 (coin arrière de la dalle de toiture, [-60, 171, -45] :
 *        (-60 + -45)·0,5 - 171) → +71,5 (2e ligne du repère chaufferie ;
 *        l'emprise dessinée s'arrête à +58,5, coin avant du radier)
 * Soit 416,3 × 295,0. D'où translate(216, 248) dans un viewBox 0 0 468 344 :
 * marges 25,1 / 26,7 à gauche et à droite, 24,5 en haut et en bas. Ratio fixe,
 * donc CLS nul.
 */

/* ---- Silhouette pleine d'un cylindre, pour l'occlusion --------------------
   cylinder() ne renvoie pas de contour fermé : sans ce masque, le quadrillage
   de sol et les arêtes situées derrière traverseraient les volumes. On la
   reconstruit avec les deux disques et le bandeau tendu entre les génératrices
   apparentes (±45° dans le plan xz, soit r/√2 sur x et z — exactement les
   points que cylinder() retient). Trois sous-chemins distincts, remplis SANS
   trait : une seule forme les ferait se barrer de cordes. */
function cylMask(base: V3, r: number, h: number): readonly string[] {
  const [cx, by, cz] = base;
  const k = r * Math.SQRT1_2;
  return [
    path(circle([cx, by + h, cz], r, "xz"), true),
    path(circle([cx, by, cz], r, "xz"), true),
    path(
      [
        [cx - k, by + h, cz + k],
        [cx + k, by + h, cz - k],
        [cx + k, by, cz - k],
        [cx - k, by, cz + k],
      ],
      true,
    ),
  ];
}

/* ---- Trame du bâtiment ---------------------------------------------------- */

const HW = 60; // demi-largeur (x)
const HD = 45; // demi-profondeur (z)
const SLAB = 5; // épaisseur de dalle
const Y_ROOF = 171; // plancher de toiture

/** Cote du plancher fini de chaque niveau — hauteur d'étage constante (57 u). */
const LEVELS: readonly { readonly label: string; readonly y: number }[] = [
  { label: "RDC", y: 0 },
  { label: "R+1", y: 57 },
  { label: "R+2", y: 114 },
];

/** Colonne montante : abscisse commune, z du départ et z du retour. */
const CX = -28;
const Z_UP = -18;
const Z_DN = -2;

/* ---- Enveloppe ------------------------------------------------------------ */

const FOOTING = boxFaces([-HW, -6, -HD], [2 * HW, 6, 2 * HD]);
const SLABS = [52, 109, 166].map((y) => boxFaces([-HW, y, -HD], [2 * HW, SLAB, 2 * HD]));

/** Trois montants seulement : le quatrième (x=+HW, z=+HD) est l'écorché. */
const POSTS = [
  seg([-HW, 0, -HD], [-HW, Y_ROOF, -HD]),
  seg([HW, 0, -HD], [HW, Y_ROOF, -HD]),
  seg([-HW, 0, HD], [-HW, Y_ROOF, HD]),
].join(" ");

const FLOOR_GRID = (() => {
  const parts: string[] = [];
  for (let x = -HW + 15; x < HW; x += 15) parts.push(seg([x, 0, -HD], [x, 0, HD]));
  for (let z = -HD + 15; z < HD; z += 15) parts.push(seg([-HW, 0, z], [HW, 0, z]));
  return parts.join(" ");
})();

/** Baies dans les deux murs conservés, une par niveau. */
const BAYS = LEVELS.map((l) =>
  [
    path(
      [
        [8, l.y + 14, -HD],
        [40, l.y + 14, -HD],
        [40, l.y + 38, -HD],
        [8, l.y + 38, -HD],
      ],
      true,
    ),
    path(
      [
        [-HW, l.y + 14, -28],
        [-HW, l.y + 14, 2],
        [-HW, l.y + 38, 2],
        [-HW, l.y + 38, -28],
      ],
      true,
    ),
  ].join(" "),
).join(" ");

/* ---- Chaufferie en pied --------------------------------------------------- */

const BOILER = boxFaces([-52, 0, -22], [34, 30, 46]);
const BOILER_DOOR = path(
  [
    [-18, 4, -14],
    [-18, 4, 2],
    [-18, 24, 2],
    [-18, 24, -14],
  ],
  true,
);
const BOILER_PANEL = path(
  [
    [-46, 12, 24],
    [-32, 12, 24],
    [-32, 24, 24],
    [-46, 24, 24],
  ],
  true,
);

/** Ballon d'accumulation, posé au RDC devant la chaufferie : il ancre le bas. */
const TANK_BASE: V3 = [6, 0, 16];
const TANK = cylinder(TANK_BASE, 9, 30);
const TANK_MASK = cylMask(TANK_BASE, 9, 30);
const TANK_LINK = run([
  [-18, 18, 16],
  [-3, 18, 16],
]);

/* ---- Colonne montante ----------------------------------------------------- */

/** Un tronçon par niveau : la cascade de tracé lit le bâtiment de bas en haut. */
const RISER_SPANS: readonly (readonly [number, number])[] = [
  [30, 57],
  [57, 114],
  [114, Y_ROOF],
];

const RISER = RISER_SPANS.map((sp) => ({
  up: run([
    [CX, sp[0], Z_UP],
    [CX, sp[1], Z_UP],
  ]),
  dn: run([
    [CX, sp[0], Z_DN],
    [CX, sp[1], Z_DN],
  ]),
}));

/** Raccordement en toiture : le trait s'arrête sous le volume opaque de la CTA. */
const RISER_HEAD = run([
  [CX, Y_ROOF, Z_UP],
  [CX, 190, Z_UP],
  [22, 190, Z_UP],
]);
const RISER_HEAD_RET = run([
  [CX, Y_ROOF, Z_DN],
  [CX, 181, Z_DN],
  [22, 181, Z_DN],
]);

/** Percements de dalle, départ et retour. */
const SLEEVES = [57, 114, Y_ROOF]
  .flatMap((y) => [
    path(circle([CX, y, Z_UP], 5, "xz"), true),
    path(circle([CX, y, Z_DN], 5, "xz"), true),
  ])
  .join(" ");

/* ---- Piquages d'étage ----------------------------------------------------- */

type Branch = {
  readonly flow: string;
  readonly ret: string;
  readonly emitter: ReturnType<typeof boxFaces>;
  readonly tees: string;
};

const BRANCHES: readonly Branch[] = LEVELS.map((l) => {
  const yf = l.y + 40; // départ, arrive sur le dessus de l'émetteur (l.y + 34)
  const yr = l.y + 30; // retour, repique dans le flanc de l'émetteur
  return {
    flow: run([
      [CX, yf, Z_UP],
      [42, yf, Z_UP],
      [42, yf, 24],
      [42, l.y + 34, 24],
    ]),
    ret: run([
      [CX, yr, Z_DN],
      [34, yr, Z_DN],
      [34, yr, 24],
      [38, yr, 24],
    ]),
    emitter: boxFaces([38, l.y + 8, 18], [8, 26, 14]),
    tees: [
      path(circle([CX, yf, Z_UP], 4, "xz"), true),
      path(circle([CX, yr, Z_DN], 4, "xz"), true),
    ].join(" "),
  };
});

/* ---- CTA en toiture et gaine de soufflage --------------------------------- */

const CTA = boxFaces([4, Y_ROOF, -30], [52, 34, 40]);
const CTA_RIBS = [
  seg([56, 176, -24], [56, 200, -24]),
  seg([56, 176, -6], [56, 200, -6]),
  seg([20, 176, 10], [20, 200, 10]),
  seg([40, 176, 10], [40, 200, 10]),
].join(" ");

const STACK_A_BASE: V3 = [18, 205, -20];
const STACK_B_BASE: V3 = [44, 205, 0];
const STACK_A = cylinder(STACK_A_BASE, 6, 10);
const STACK_B = cylinder(STACK_B_BASE, 6, 10);
const STACK_MASKS = [...cylMask(STACK_A_BASE, 6, 10), ...cylMask(STACK_B_BASE, 6, 10)];

/**
 * Gaine de soufflage : sort du flanc de la CTA (z = 10), traverse la dalle de
 * toiture et dessert le faux plafond du R+2. Axe posé en x = 30 / z = 19, soit
 * sx = +9,5 — hors de la bande d'écran des émetteurs (sx +5,2 → +24,3) au
 * niveau où elle s'arrête, donc aucun volume ne se recouvre.
 */
const DUCT = run([
  [30, 186, 10],
  [30, 186, 19],
  [30, 161, 19],
]);
const DUCT_SLEEVE = path(circle([30, Y_ROOF, 19], 7, "xz"), true);
/** Bouche de soufflage : volume plat, calé sous la dalle de toiture. */
const DIFFUSER = boxFaces([25, 158, 14], [10, 3, 10]);

/* ---- Repérage et cotation ------------------------------------------------- */

/** Les étiquettes sont le seul élément posé en 2D — via project(), règle admise. */
function at(p: V3): { x: number; y: number } {
  const [x, y] = project(p);
  return { x, y };
}

const LEVEL_MARKS: readonly { readonly label: string; readonly y: number }[] = [
  ...LEVELS,
  { label: "TOITURE", y: Y_ROOF },
];

/** Cote de hauteur libre, lue sur l'arête arrière-droite. */
const DIM_LINE = seg([88, 0, -HD], [88, 52, -HD]);
const DIM_TICKS = [
  seg([84, 0, -HD], [92, 0, -HD]),
  seg([84, 52, -HD], [92, 52, -HD]),
].join(" ");
const DIM_LEADS = [
  seg([HW, 0, -HD], [92, 0, -HD]),
  seg([HW, 52, -HD], [92, 52, -HD]),
].join(" ");

const LEAD_CTA = seg([56, 190, -30], [96, 190, -30]);
const LEAD_RISER = seg([CX, 134, Z_UP], [98, 134, Z_UP]);
const LEAD_BOILER = seg([-34, 0, 24], [-34, -52, 24]);

const P_DIM = at([96, 26, -HD]);
const P_CTA = at([102, 190, -30]);
const P_RISER = at([104, 134, Z_UP]);
const P_BOILER = at([-34, -60, 24]);
const P_CART = at([HW, -46, -HD]);

export function BatimentCoupeIso() {
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
      viewBox="0 0 468 344"
      role="img"
      aria-label="Coupe axonométrique d'un bâtiment de trois niveaux en écorché, façade avant omise. En pied, la chaufferie de 120 kilowatts et son ballon d'accumulation ; une colonne montante départ et retour en DN 50, régime 60 sur 40 degrés, traverse les planchers du rez-de-chaussée à la toiture, avec un piquage et un émetteur à chaque étage ; en toiture, une centrale de traitement d'air de 4 800 mètres cubes par heure, à deux souches, dont la gaine de soufflage redescend alimenter une bouche au deuxième étage. Niveaux repérés RDC, R+1, R+2 et toiture, hauteur libre 2,70 mètres."
    >
      <g transform="translate(216,248)">
        {/* ---------- Architecture : trait fin ---------- */}
        <path className={s.grid} d={FLOOR_GRID} />
        <path className={s.hair} d={FOOTING.top} />
        <path className={s.hair} d={FOOTING.right} />
        <path className={s.hair} d={FOOTING.left} />
        <path className={s.hair} d={POSTS} />
        <path className={s.hair} d={BAYS} />
        {SLABS.map((f, i) => (
          <g key={`slab-${i}`}>
            <path className={s.hair} d={f.top} />
            <path className={s.hair} d={f.right} />
            <path className={s.hair} d={f.left} />
          </g>
        ))}

        {/* ---------- Chaufferie ---------- */}
        <path className={s.solid} d={BOILER.left} />
        <path className={s.solid} d={BOILER.right} />
        <path className={s.solid} d={BOILER.top} />
        <path className={s.hair} d={BOILER_DOOR} />
        <path className={s.hair} d={BOILER_PANEL} />
        <path
          className={s.pipe}
          pathLength={1}
          style={{ "--i": 0 } as CSSProperties}
          d={TANK_LINK}
        />
        {TANK_MASK.map((d, i) => (
          <path key={`tank-mask-${i}`} className={s.mask} d={d} />
        ))}
        <path className={s.sym} d={TANK.sides} />
        <path className={s.sym} d={TANK.bottomFront} />
        <path className={s.sym} d={TANK.top} />

        {/* ---------- Colonne montante ---------- */}
        {RISER.map((r, i) => (
          <g key={`riser-${i}`}>
            <path
              className={s.pipe}
              pathLength={1}
              style={{ "--i": i + 1 } as CSSProperties}
              d={r.up}
            />
            <path className={s.pipeDashed} d={r.dn} />
          </g>
        ))}

        {/* ---------- Piquages d'étage ---------- */}
        {BRANCHES.map((b, i) => (
          <g key={`branch-${i}`}>
            <path
              className={s.pipe}
              pathLength={1}
              style={{ "--i": i + 2 } as CSSProperties}
              d={b.flow}
            />
            <path className={s.pipeDashed} d={b.ret} />
            <path className={s.solid} d={b.emitter.left} />
            <path className={s.solid} d={b.emitter.right} />
            <path className={s.solid} d={b.emitter.top} />
            <path className={s.node} d={b.tees} />
          </g>
        ))}

        <path className={s.plug} d={SLEEVES} />

        {/* ---------- Raccordement en toiture, puis CTA ---------- */}
        <path
          className={s.pipe}
          pathLength={1}
          style={{ "--i": 4 } as CSSProperties}
          d={RISER_HEAD}
        />
        <path className={s.pipeDashed} d={RISER_HEAD_RET} />
        <path className={s.solid} d={CTA.left} />
        <path className={s.solid} d={CTA.right} />
        <path className={s.solid} d={CTA.top} />
        <path className={s.hair} d={CTA_RIBS} />
        {STACK_MASKS.map((d, i) => (
          <path key={`stack-mask-${i}`} className={s.mask} d={d} />
        ))}
        <path className={s.sym} d={STACK_A.sides} />
        <path className={s.sym} d={STACK_A.bottomFront} />
        <path className={s.sym} d={STACK_A.top} />
        <path className={s.sym} d={STACK_B.sides} />
        <path className={s.sym} d={STACK_B.bottomFront} />
        <path className={s.sym} d={STACK_B.top} />

        {/* ---------- Gaine de soufflage ---------- */}
        <path className={s.pipe} pathLength={1} style={{ "--i": 5 } as CSSProperties} d={DUCT} />
        <path className={s.plug} d={DUCT_SLEEVE} />
        <path className={s.solid} d={DIFFUSER.left} />
        <path className={s.solid} d={DIFFUSER.right} />
        <path className={s.solid} d={DIFFUSER.top} />

        {/* ---------- Repérage ---------- */}
        {LEVEL_MARKS.map((m) => {
          const p = at([-HW, m.y, 100]);
          return (
            <g key={m.label}>
              <path className={s.lead} d={seg([-HW, m.y, HD], [-HW, m.y, 92])} />
              <text className={s.lab} x={p.x} y={p.y} textAnchor="end" dominantBaseline="middle">
                {m.label}
              </text>
            </g>
          );
        })}

        <path className={s.lead} d={DIM_LEADS} />
        <path className={s.dim} d={DIM_LINE} />
        <path className={s.dim} d={DIM_TICKS} />
        <text className={s.lab} x={P_DIM.x} y={P_DIM.y} textAnchor="start">
          HAUTEUR LIBRE
        </text>
        <text className={`${s.lab} ${s.sub}`} x={P_DIM.x} y={P_DIM.y + 14} textAnchor="start">
          2,70 m
        </text>

        <path className={s.lead} d={LEAD_CTA} />
        <text className={s.lab} x={P_CTA.x} y={P_CTA.y} textAnchor="start">
          CTA EN TOITURE
        </text>
        <text className={`${s.lab} ${s.sub}`} x={P_CTA.x} y={P_CTA.y + 14} textAnchor="start">
          4 800 m³/h
        </text>

        <path className={s.lead} d={LEAD_RISER} />
        <text className={s.lab} x={P_RISER.x} y={P_RISER.y} textAnchor="start">
          COLONNE MONTANTE
        </text>
        <text className={`${s.lab} ${s.sub}`} x={P_RISER.x} y={P_RISER.y + 14} textAnchor="start">
          DN 50 · 60/40 °C
        </text>

        <path className={s.lead} d={LEAD_BOILER} />
        <text className={s.lab} x={P_BOILER.x} y={P_BOILER.y} textAnchor="middle">
          CHAUFFERIE
        </text>
        <text className={`${s.lab} ${s.sub}`} x={P_BOILER.x} y={P_BOILER.y + 14} textAnchor="middle">
          120 kW
        </text>

        <text className={s.lab} x={P_CART.x} y={P_CART.y} textAnchor="start">
          3 NIVEAUX
        </text>
        <text className={`${s.lab} ${s.sub}`} x={P_CART.x} y={P_CART.y + 14} textAnchor="start">
          1 250 m² SRE
        </text>
      </g>
    </svg>
  );
}
