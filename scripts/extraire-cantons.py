"""Extrait les frontières cantonales suisses en tracés SVG.

À exécuter À LA MAIN, une fois. Le résultat est COMMIS dans
src/components/carte/cantons.ts : rien ne tourne au build ni dans le
navigateur, et le projet ne gagne aucune dépendance.

    py -m pip install  # rien : la bibliothèque standard suffit
    curl -O https://registry.npmjs.org/swiss-maps/-/swiss-maps-4.7.0.tgz
    tar xzf swiss-maps-4.7.0.tgz package/2026/ch-combined.json
    py scripts/extraire-cantons.py package/2026/ch-combined.json > src/components/carte/cantons.ts

Source : swiss-maps (Interactive Things, BSD-3-Clause), TopoJSON dérivé des
limites généralisées de l'OFS / swisstopo. L'attribution est reportée dans le
fichier généré ET affichée sous la carte.

DEUX DÉCISIONS À CONNAÎTRE.

Projection. Le cahier des charges propose une interpolation linéaire sur
lon/lat et une zone de dessin 1000 × 641. Une interpolation strictement
linéaire étire la Suisse : à 46,8° de latitude un degré de longitude vaut
~76 km contre ~111 km pour un degré de latitude. On applique donc le cosinus
de la latitude moyenne — une équirectangulaire à parallèle standard, trois
termes — et la HAUTEUR de la zone de dessin en découle au lieu d'être posée.
Le rapport ne peut alors plus diverger de la boîte géographique, ce qui
supprime par construction le piège « pays écrasé » du §13.

Boîte englobante. Elle est CALCULÉE sur les tracés décodés, jamais recopiée.
C'est le premier piège du §4 : une boîte qui ne correspond pas au tracé décale
toutes les épingles de plusieurs kilomètres, de façon systématique et donc
difficile à voir. Les mêmes constantes sont exportées pour que le composant
place ses épingles avec EXACTEMENT la même formule que les frontières.
"""

import json
import math
import sys

# Numéros officiels OFS des cantons. Vérifiés géométriquement plus bas : le
# script refuse de produire un fichier si un canton tombe loin de sa place.
CANTONS = {
    1: ("ZH", "Zurich"), 2: ("BE", "Berne"), 3: ("LU", "Lucerne"), 4: ("UR", "Uri"),
    5: ("SZ", "Schwytz"), 6: ("OW", "Obwald"), 7: ("NW", "Nidwald"), 8: ("GL", "Glaris"),
    9: ("ZG", "Zoug"), 10: ("FR", "Fribourg"), 11: ("SO", "Soleure"), 12: ("BS", "Bâle-Ville"),
    13: ("BL", "Bâle-Campagne"), 14: ("SH", "Schaffhouse"), 15: ("AR", "Appenzell Rh.-Ext."),
    16: ("AI", "Appenzell Rh.-Int."), 17: ("SG", "Saint-Gall"), 18: ("GR", "Grisons"),
    19: ("AG", "Argovie"), 20: ("TG", "Thurgovie"), 21: ("TI", "Tessin"), 22: ("VD", "Vaud"),
    23: ("VS", "Valais"), 24: ("NE", "Neuchâtel"), 25: ("GE", "Genève"), 26: ("JU", "Jura"),
}

# Repères de contrôle : un point connu par canton, en lon/lat, et la tolérance.
# Si le centre calculé d'un canton s'en écarte trop, la table ci-dessus est
# fausse ou la source a changé de numérotation — mieux vaut échouer que livrer
# une carte mal étiquetée.
CONTROLES = {25: (6.14, 46.20), 21: (8.80, 46.33), 26: (7.14, 47.35), 1: (8.65, 47.42)}
TOLERANCE_DEG = 0.9

LARGEUR = 1000.0
EPSILON = 0.9  # simplification : ~0,7 px d'écart à la taille d'affichage


def decoder_arcs(topo):
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    out = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        out.append(pts)
    return out


def anneau(arcs, indices):
    pts = []
    for i in indices:
        a = arcs[~i][::-1] if i < 0 else arcs[i]
        pts.extend(a[1:] if pts else a)
    return pts


def polygones(geom, arcs):
    if geom["type"] == "Polygon":
        return [[anneau(arcs, r) for r in geom["arcs"]]]
    if geom["type"] == "MultiPolygon":
        return [[anneau(arcs, r) for r in poly] for poly in geom["arcs"]]
    return []


def simplifier(pts, eps):
    """Douglas-Peucker. Sans elle le fichier pèse plusieurs centaines de Ko."""
    if len(pts) < 3:
        return pts
    dmax, idx = 0.0, 0
    x1, y1 = pts[0]
    x2, y2 = pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = math.hypot(dx, dy)
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / n if n else math.hypot(px - x1, py - y1)
        if d > dmax:
            dmax, idx = d, i
    if dmax <= eps:
        return [pts[0], pts[-1]]
    return simplifier(pts[: idx + 1], eps)[:-1] + simplifier(pts[idx:], eps)


def centre_visuel(anneaux):
    """Point garanti DANS le canton.

    Le centre de gravité tombe hors du territoire pour un canton en croissant,
    et dans un lac pour d'autres — c'est le §5 du cahier des charges. On prend
    plutôt le milieu du plus long segment intérieur, sur la ligne horizontale
    qui en offre le plus.
    """
    grand = max(anneaux, key=lambda r: abs(aire(r)))
    ys = [p[1] for p in grand]
    y0, y1 = min(ys), max(ys)
    best = (0.0, None)
    for k in range(1, 40):
        y = y0 + (y1 - y0) * k / 40
        xs = []
        for i in range(len(grand)):
            (ax, ay), (bx, by) = grand[i], grand[(i + 1) % len(grand)]
            if (ay <= y < by) or (by <= y < ay):
                xs.append(ax + (y - ay) * (bx - ax) / (by - ay))
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            largeur = xs[i + 1] - xs[i]
            if largeur > best[0]:
                best = (largeur, ((xs[i] + xs[i + 1]) / 2, y))
    return best[1] or grand[0]


def aire(anneau_pts):
    s = 0.0
    for i in range(len(anneau_pts)):
        x1, y1 = anneau_pts[i]
        x2, y2 = anneau_pts[(i + 1) % len(anneau_pts)]
        s += x1 * y2 - x2 * y1
    return s / 2


def main(chemin):
    topo = json.load(open(chemin, encoding="utf-8"))
    arcs = decoder_arcs(topo)
    geoms = topo["objects"]["cantons"]["geometries"]

    # --- boîte englobante CALCULÉE sur les tracés, jamais recopiée.
    lo_min = la_min = 1e9
    lo_max = la_max = -1e9
    brut = {}
    for g in geoms:
        polys = polygones(g, arcs)
        brut[g["id"]] = polys
        for poly in polys:
            for ring in poly:
                for lo, la in ring:
                    lo_min, lo_max = min(lo_min, lo), max(lo_max, lo)
                    la_min, la_max = min(la_min, la), max(la_max, la)

    lat0 = (la_min + la_max) / 2
    kx = math.cos(math.radians(lat0))
    k = LARGEUR / ((lo_max - lo_min) * kx)
    hauteur = (la_max - la_min) * k

    def proj(lo, la):
        return ((lo - lo_min) * kx * k, (la_max - la) * k)

    # --- contrôle de la numérotation avant de produire quoi que ce soit.
    for cid, (lo_att, la_att) in CONTROLES.items():
        # `brut` est encore en degrés : on compare donc directement, sans
        # reprojeter. Convertir ici reviendrait à appliquer deux fois la
        # transformation — c'est ce que faisait la première version, et le
        # contrôle accusait la table des cantons d'une erreur qui était la
        # sienne.
        lo, la = centre_visuel([r for poly in brut[cid] for r in poly])
        if math.hypot(lo - lo_att, la - la_att) > TOLERANCE_DEG:
            sigle = CANTONS[cid][0]
            raise SystemExit(
                f"ERREUR : le canton {cid} ({sigle}) est calcule en {lo:.2f},{la:.2f} "
                f"mais attendu vers {lo_att},{la_att}. Numerotation OFS a revoir."
            )

    sortie = []
    for g in geoms:
        cid = g["id"]
        sigle, nom = CANTONS[cid]
        d = []
        anneaux_proj = []
        for poly in brut[cid]:
            for ring in poly:
                pr = simplifier([proj(lo, la) for lo, la in ring], EPSILON)
                if len(pr) < 3:
                    continue
                anneaux_proj.append(pr)
                d.append("M " + " L ".join(f"{x:.1f} {y:.1f}" for x, y in pr) + " Z")
        cx, cy = centre_visuel(anneaux_proj)
        sortie.append((sigle, nom, " ".join(d), round(cx, 1), round(cy, 1)))

    sortie.sort(key=lambda r: r[0])
    lignes = ",\n".join(
        f'  {{ sigle: "{s}", nom: "{n}", d: "{d}", etiquette: {{ x: {x}, y: {y} }} }}'
        for s, n, d, x, y in sortie
    )

    print(f"""// GÉNÉRÉ — ne pas modifier à la main.
// Régénérer : voir scripts/extraire-cantons.py
//
// Source : swiss-maps (Interactive Things), BSD-3-Clause, TopoJSON dérivé des
// limites généralisées de l'OFS / swisstopo. Copyright (c) 2014 – present,
// Interactive Things GmbH. L'attribution est affichée sous la carte.
//
// Projection : équirectangulaire à parallèle standard {lat0:.4f}°. La hauteur de
// la zone de dessin DÉCOULE de la boîte englobante, elle n'est pas posée : le
// rapport ne peut donc pas diverger et écraser le pays.
//
// La boîte est CALCULÉE sur ces tracés-ci. Toute épingle doit être placée avec
// `projeter()` ci-dessous, et pas avec une autre formule — une boîte qui ne
// correspond pas au tracé décale toutes les épingles de plusieurs kilomètres,
// de façon systématique et donc difficile à repérer.

export const ZONE = {{ largeur: {LARGEUR:.0f}, hauteur: {hauteur:.1f} }};

const BOITE = {{
  ouest: {lo_min:.6f},
  est: {lo_max:.6f},
  sud: {la_min:.6f},
  nord: {la_max:.6f},
}};

const COS_LAT0 = {kx:.9f};
const K = {k:.6f};

/** Degrés WGS84 → unités de la zone de dessin. */
export function projeter(lng: number, lat: number): {{ x: number; y: number }} {{
  return {{
    x: (lng - BOITE.ouest) * COS_LAT0 * K,
    y: (BOITE.nord - lat) * K,
  }};
}}

export type Canton = {{
  sigle: string;
  nom: string;
  d: string;
  etiquette: {{ x: number; y: number }};
}};

export const CANTONS: Canton[] = [
{lignes},
];""")


if __name__ == "__main__":
    main(sys.argv[1])
