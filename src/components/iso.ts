/**
 * Projection axonométrique (isométrique) — géométrie 3D réelle projetée en 2D.
 *
 * Les planches d'ingénieur ne sont pas des rendus 3D : ce sont des projections.
 * On décrit donc les objets par leurs sommets dans l'espace (x, y, z) et on les
 * projette ; le résultat est du trait vectoriel, net à toute échelle, fidèle à
 * l'impression et sans aucune dépendance (pas de WebGL, pas de three.js).
 *
 * Repère : x vers la droite-bas, z vers la gauche-bas, y vers le HAUT.
 * L'axe y étant inversé en SVG, la projection le soustrait.
 *
 * Placement : ces fonctions renvoient des coordonnées centrées sur l'origine du
 * monde. On positionne la figure avec un <g transform="translate(ox,oy)">
 * plutôt qu'en décalant chaque point.
 */

export type V3 = readonly [number, number, number];

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;

/** Projette un point 3D en coordonnées écran SVG. */
export function project([x, y, z]: V3): [number, number] {
  return [(x - z) * COS30, (x + z) * SIN30 - y];
}

const fmt = (n: number) => (Math.abs(n) < 0.005 ? "0" : n.toFixed(2));

/** Construit un chemin SVG à partir de points 3D. */
export function path(pts: readonly V3[], close = false): string {
  if (pts.length === 0) return "";
  const d = pts
    .map((p, i) => {
      const [x, y] = project(p);
      return `${i === 0 ? "M" : "L"}${fmt(x)} ${fmt(y)}`;
    })
    .join(" ");
  return close ? `${d} Z` : d;
}

/** Segment 3D isolé, pratique pour les cotes et les repères. */
export function seg(a: V3, b: V3): string {
  return path([a, b]);
}

export type Plane = "xz" | "xy" | "zy";

/**
 * Échantillonne un cercle dans un plan donné. On échantillonne puis on projette
 * plutôt que de calculer une ellipse analytique : c'est exact quel que soit le
 * plan, et ça reste du trait.
 */
export function circle(center: V3, r: number, plane: Plane = "xz", n = 48): V3[] {
  const [cx, cy, cz] = center;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a) * r;
    const s = Math.sin(a) * r;
    if (plane === "xz") return [cx + c, cy, cz + s] as V3;
    if (plane === "xy") return [cx + c, cy + s, cz] as V3;
    return [cx, cy + c, cz + s] as V3;
  });
}

/**
 * Faces visibles d'une boîte alignée sur les axes, depuis le point de vue
 * isométrique standard : le dessus, la face +x et la face +z. Renvoyées
 * fermées, pour pouvoir les remplir en --paper et masquer ce qui est derrière.
 */
export function boxFaces(origin: V3, size: V3): { top: string; right: string; left: string } {
  const [x, y, z] = origin;
  const [w, h, d] = size;
  const top = path(
    [
      [x, y + h, z],
      [x + w, y + h, z],
      [x + w, y + h, z + d],
      [x, y + h, z + d],
    ],
    true,
  );
  const right = path(
    [
      [x + w, y + h, z],
      [x + w, y + h, z + d],
      [x + w, y, z + d],
      [x + w, y, z],
    ],
    true,
  );
  const left = path(
    [
      [x, y + h, z + d],
      [x + w, y + h, z + d],
      [x + w, y, z + d],
      [x, y, z + d],
    ],
    true,
  );
  return { top, right, left };
}

/**
 * Cylindre vertical (axe y) : disque supérieur, arc avant du disque inférieur,
 * et les deux génératrices aux extrémités apparentes. C'est la convention des
 * vues éclatées — un cylindre s'y lit à ses deux ellipses et à sa silhouette.
 */
export function cylinder(
  base: V3,
  r: number,
  h: number,
  n = 48,
): { top: string; bottomFront: string; sides: string } {
  const [bx, by, bz] = base;
  const topPts = circle([bx, by + h, bz], r, "xz", n);
  const botPts = circle([bx, by, bz], r, "xz", n);

  // Génératrices : aux points d'abscisse écran extrême du disque.
  let iMin = 0;
  let iMax = 0;
  botPts.forEach((p, i) => {
    const sx = project(p)[0];
    if (sx < project(botPts[iMin])[0]) iMin = i;
    if (sx > project(botPts[iMax])[0]) iMax = i;
  });

  // Arc avant : du point gauche au point droit en passant par l'avant (z max).
  const front: V3[] = [];
  const count = botPts.length;
  for (let k = 0; k <= count; k++) {
    const i = (iMin + k) % count;
    front.push(botPts[i]);
    if (i === iMax) break;
  }

  return {
    top: path(topPts, true),
    bottomFront: path(front),
    sides: `${seg(botPts[iMin], [botPts[iMin][0], by + h, botPts[iMin][2]])} ${seg(
      botPts[iMax],
      [botPts[iMax][0], by + h, botPts[iMax][2]],
    )}`,
  };
}

/** Tracé d'un réseau (gaine, tuyauterie) suivant une polyligne 3D. */
export function run(pts: readonly V3[]): string {
  return path(pts);
}

/** Grille de sol dans le plan xz — le quadrillage de la planche, en 3D. */
export function grid(size: number, step: number, y = 0): string {
  const parts: string[] = [];
  for (let i = 0; i <= size; i += step) {
    parts.push(seg([i, y, 0], [i, y, size]));
    parts.push(seg([0, y, i], [size, y, i]));
  }
  return parts.join(" ");
}
