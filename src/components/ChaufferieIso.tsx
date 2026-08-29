"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { boxFaces, circle, cylinder, grid, path, project, run, seg, type V3 } from "./iso";
import s from "./ChaufferieIso.module.css";

/**
 * Chaufferie en axonométrie — ILLUSTRATION (contenu de démonstration).
 *
 * Toute la géométrie est décrite en (x, y, z) puis projetée par iso.ts : ce
 * n'est pas un rendu 3D, c'est une projection, donc du trait vectoriel net à
 * toute échelle et fidèle à l'impression. Repère : x droite-bas, z gauche-bas,
 * y vers le haut ; sx = (x - z)·0,866 et sy = (x + z)/2 - y.
 *
 * Cadrage — extrêmes projetés recalculés sur l'ensemble des sommets :
 *   dalle 0→120 .............. sx -103,9 → +103,9   sy 0 → 124
 *   chaudière + conduit ...... sx  -69,3 → -13,9    sy -28,8 → 65
 *   ballon 1 000 L ........... sx   -1,1 → +35,7    sy 1,4 → 76,6
 *   collecteur + pieds ....... sx  +38,1 → +84,9    sy 6 → 58
 *   départ / retour .......... sx  -34,6 → +110,9   sy -26 → 103
 *   rappels + étiquettes ..... sx -168,1 → +206,7   sy -52,6 → 128,7
 *   → total 374,8 × 181,3. D'où viewBox 0 0 410 215 et translate(186, 69),
 *     ce qui laisse ~17 unités de marge sur les quatre bords.
 *
 * Occlusion : les faces des volumes sont remplies en var(--paper) (.solid), ce
 * qui masque le quadrillage de sol et les pieds du collecteur. Les cylindres
 * n'ont pas de silhouette fermée dans iso.ts : on la reconstruit ici avec les
 * deux disques et le bandeau entre les génératrices apparentes (angles ±45°,
 * soit un décalage r/√2 sur x et z — exactement les points que cylinder()
 * retient comme génératrices). Ces trois formes sont posées en .mask :
 * remplies SANS trait, sinon les cordes du bandeau barreraient les ellipses.
 *
 * Croisements : deux lignes de rappel coupent un réseau (rappel du collecteur
 * × départ, rappel du ballon × retour), toujours en milieu de segment. C'est
 * l'usage de la planche d'ingénieur, et les épaisseurs les séparent sans
 * ambiguïté : pointillé 0,9 contre trait plein 2,6 ou tireté 1,5.
 */

/* --- Silhouette pleine d'un cylindre vertical, pour l'occlusion ---------- */
function cylMask(base: V3, r: number, h: number) {
  const [cx, by, cz] = base;
  const k = r * Math.SQRT1_2; // génératrices apparentes : ±45° dans le plan xz
  const band: V3[] = [
    [cx - k, by + h, cz + k],
    [cx + k, by + h, cz - k],
    [cx + k, by, cz - k],
    [cx - k, by, cz + k],
  ];
  return {
    top: path(circle([cx, by + h, cz], r, "xz"), true),
    bottom: path(circle([cx, by, cz], r, "xz"), true),
    band: path(band, true),
  };
}

const disc = (c: V3, r: number) => path(circle(c, r, "xz"), true); // bride à plat
const ring = (c: V3, r: number) => path(circle(c, r, "xy"), true); // organe sur tuyau

/* --- Dalle et sol -------------------------------------------------------- */
const SLAB = boxFaces([0, -4, 0], [120, 4, 120]);
const FLOOR = grid(120, 15, 0);

/* --- Chaudière : 150 kW -------------------------------------------------- */
const BOILER = boxFaces([8, 0, 58], [34, 46, 30]);
const DOOR = path(
  [
    [12, 6, 88],
    [30, 6, 88],
    [30, 30, 88],
    [12, 30, 88],
  ],
  true,
);
const PORT = ring([21, 18, 88], 3.5);
const FLUE = cylinder([20, 46, 72], 4, 26);
const FLUE_MASK = cylMask([20, 46, 72], 4, 26);

/* --- Ballon tampon : 1 000 L --------------------------------------------- */
const TANK_BASE: V3 = [76, 0, 56];
const TANK_R = 15;
const TANK_H = 54;
const TANK = cylinder(TANK_BASE, TANK_R, TANK_H);
const TANK_MASK = cylMask(TANK_BASE, TANK_R, TANK_H);
const TANK_IN = disc([76, 54, 56], 5);
const TANK_OUT = disc([84, 54, 48], 4);
const TANK_K = TANK_R * Math.SQRT1_2;

/* --- Collecteur DN 80 sur pieds ------------------------------------------ */
const LEG_A = boxFaces([94, 0, 10], [6, 30, 6]);
const LEG_B = boxFaces([94, 0, 38], [6, 30, 6]);
const HEADER = boxFaces([92, 30, 4], [10, 12, 44]);
const HEADER_IN = disc([97, 42, 26], 4);
const STUB_A = seg([97, 42, 12], [97, 51, 12]);
const STUB_B = seg([97, 42, 40], [97, 51, 40]);
const FLANGE_A = disc([97, 51, 12], 3.5);
const FLANGE_B = disc([97, 51, 40], 3.5);

/* --- Réseau : départ (plein, épais) puis retour (tireté, fin) -------------
   Le départ quitte le collecteur par sa face +x côté fond (z = 16) : il passe
   ainsi au-dessus des pieds au lieu de les recouper, puis monte vers le
   réseau. Le retour longe l'avant de la dalle et rentre en façade. */
const FLOW_A = run([
  [30, 46, 70],
  [30, 76, 70],
  [76, 76, 70],
  [76, 76, 56],
  [76, 54, 56],
]);
const FLOW_B = run([
  [84, 54, 48],
  [84, 84, 48],
  [97, 84, 48],
  [97, 84, 26],
  [97, 42, 26],
]);
const FLOW_C = run([
  [102, 38, 16],
  [130, 38, 16],
  [130, 66, 16],
  [144, 66, 16],
]);
const RETURN = run([
  [150, 30, 60],
  [126, 30, 60],
  [126, 16, 60],
  [126, 16, 112],
  [38, 16, 112],
  [38, 16, 88],
]);
const PUMP_FLOW = ring([30, 62, 70], 5);
const PUMP_RETURN = ring([102, 16, 112], 5);

/* --- Lignes de rappel et ancres d'étiquettes ----------------------------- */
const LEAD_BOILER = seg([14, 46, 60], [-18, 64, 60]);
const LEAD_TANK = seg([76 - TANK_K, 0, 56 + TANK_K], [46, -20, 112]);
const LEAD_HEADER = seg([102, 31, 4], [142, 6, 4]);
const LEAD_FLOW = seg([138, 66, 16], [154, 98, 6]);
const LEAD_RETURN = seg([126, 16, 86], [138, 6, 94]);

const A_BOILER = project([-18, 64, 60]);
const A_TANK = project([46, -20, 112]);
const A_HEADER = project([142, 6, 4]);
const A_FLOW = project([154, 98, 6]);
const A_RETURN = project([138, 6, 94]);

const GAP = 8; // écart entre l'ancre du rappel et le début du texte
const LINE = 16; // interligne des étiquettes, en unités de viewBox

export function ChaufferieIso() {
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
      viewBox="0 0 410 215"
      role="img"
      aria-label="Vue axonométrique d'une chaufferie : sur une dalle quadrillée reposent une chaudière de 150 kilowatts coiffée de son conduit de fumée, un ballon tampon vertical de 1 000 litres et un collecteur DN 80 posé sur deux pieds. La tuyauterie de départ, en trait plein épais, sort de la chaudière, monte au-dessus des appareils, plonge dans le ballon tampon, rejoint le collecteur, puis en repart vers le fond en s'élevant vers le réseau. Le retour, en tireté plus fin, longe l'avant de la dalle, passe par un circulateur et rentre en façade de la chaudière. Régime 70 sur 50 degrés Celsius."
    >
      <g transform="translate(186,69)">
        {/* --- Dalle : faces pleines en papier, puis quadrillage ---------- */}
        <path className={s.solid} d={SLAB.top} />
        <path className={s.solid} d={SLAB.right} />
        <path className={s.solid} d={SLAB.left} />
        <path className={s.rule} d={FLOOR} />

        {/* --- Chaudière -------------------------------------------------- */}
        <path className={s.solid} d={BOILER.top} />
        <path className={s.solid} d={BOILER.right} />
        <path className={s.solid} d={BOILER.left} />
        <path className={s.sym} d={DOOR} />
        <path className={s.sym} d={PORT} />
        <path className={s.mask} d={FLUE_MASK.band} />
        <path className={s.mask} d={FLUE_MASK.bottom} />
        <path className={s.mask} d={FLUE_MASK.top} />
        <path className={s.sym} d={FLUE.sides} />
        <path className={s.sym} d={FLUE.bottomFront} />
        <path className={s.sym} d={FLUE.top} />

        {/* --- Collecteur : pieds d'abord, le corps les recouvre ---------- */}
        <path className={s.solid} d={LEG_A.top} />
        <path className={s.solid} d={LEG_A.right} />
        <path className={s.solid} d={LEG_A.left} />
        <path className={s.solid} d={LEG_B.top} />
        <path className={s.solid} d={LEG_B.right} />
        <path className={s.solid} d={LEG_B.left} />
        <path className={s.solid} d={HEADER.top} />
        <path className={s.solid} d={HEADER.right} />
        <path className={s.solid} d={HEADER.left} />
        <path className={s.sym} d={STUB_A} />
        <path className={s.sym} d={STUB_B} />
        <path className={s.sym} d={FLANGE_A} />
        <path className={s.sym} d={FLANGE_B} />
        <path className={s.sym} d={HEADER_IN} />

        {/* --- Ballon tampon ---------------------------------------------- */}
        <path className={s.mask} d={TANK_MASK.band} />
        <path className={s.mask} d={TANK_MASK.bottom} />
        <path className={s.mask} d={TANK_MASK.top} />
        <path className={s.sym} d={TANK.sides} />
        <path className={s.sym} d={TANK.bottomFront} />
        <path className={s.sym} d={TANK.top} />
        <path className={s.sym} d={TANK_IN} />
        <path className={s.sym} d={TANK_OUT} />

        {/* --- Retour : tireté, plus fin, il passe devant la dalle --------- */}
        <path className={s.pipeDashed} d={RETURN} />
        <path className={s.sym} d={PUMP_RETURN} />

        {/* --- Départ : trait plein, plus épais, il se trace en cascade ---- */}
        <path
          className={s.pipe}
          d={FLOW_A}
          pathLength={1}
          style={{ "--i": 0 } as CSSProperties}
        />
        <path
          className={s.pipe}
          d={FLOW_B}
          pathLength={1}
          style={{ "--i": 1 } as CSSProperties}
        />
        <path
          className={s.pipe}
          d={FLOW_C}
          pathLength={1}
          style={{ "--i": 2 } as CSSProperties}
        />
        <path className={s.sym} d={PUMP_FLOW} />

        {/* --- Rappels et étiquettes -------------------------------------- */}
        <path className={s.lead} d={LEAD_BOILER} />
        <path className={s.lead} d={LEAD_TANK} />
        <path className={s.lead} d={LEAD_HEADER} />
        <path className={s.lead} d={LEAD_FLOW} />
        <path className={s.lead} d={LEAD_RETURN} />

        <text className={s.lab} x={A_BOILER[0] - GAP} y={A_BOILER[1]} textAnchor="end">
          CHAUDIÈRE
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={A_BOILER[0] - GAP}
          y={A_BOILER[1] + LINE}
          textAnchor="end"
        >
          150 kW
        </text>

        <text className={s.lab} x={A_TANK[0] - GAP} y={A_TANK[1]} textAnchor="end">
          BALLON TAMPON
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={A_TANK[0] - GAP}
          y={A_TANK[1] + LINE}
          textAnchor="end"
        >
          1 000 L
        </text>

        <text className={s.lab} x={A_HEADER[0] + GAP} y={A_HEADER[1]}>
          COLLECTEUR
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={A_HEADER[0] + GAP}
          y={A_HEADER[1] + LINE}
        >
          DN 80
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={A_HEADER[0] + GAP}
          y={A_HEADER[1] + 2 * LINE}
        >
          70/50 °C
        </text>

        <text className={s.lab} x={A_FLOW[0] + GAP} y={A_FLOW[1]}>
          DÉPART
        </text>
        <text className={`${s.lab} ${s.data}`} x={A_FLOW[0] + GAP} y={A_FLOW[1] + LINE}>
          70 °C
        </text>

        <text className={s.lab} x={A_RETURN[0] + GAP} y={A_RETURN[1]}>
          RETOUR
        </text>
        <text
          className={`${s.lab} ${s.data}`}
          x={A_RETURN[0] + GAP}
          y={A_RETURN[1] + LINE}
        >
          50 °C
        </text>
      </g>
    </svg>
  );
}
