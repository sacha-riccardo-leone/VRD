"""Extrait le sigle « VRD » de la police en contours vectoriels.

À exécuter À LA MAIN, une fois, quand la police ou la graisse du sigle change.
Le résultat est COMMIS dans src/components/hero/outlines.ts : rien de tout ceci
ne tourne au build ni dans le navigateur, et le projet ne gagne aucune
dépendance.

    py -m pip install fonttools brotli
    py scripts/extraire-sigle.py > src/components/hero/outlines.ts

Pourquoi. L'ouverture du portail était jusqu'ici RELEVÉE : le glyphe était
rastérisé sur un canvas puis balayé ligne par ligne, et l'ouverture
reconstruite en escalier, une marche par ligne. Sur la courbe haute du R, où le
contour est presque horizontal, les marches s'allongent et se voient. Le
relevé dépendait en outre du chargement de la police et de la taille courante,
d'où deux défauts de plus : une course entre mesure et police, et une géométrie
périmée au franchissement du point de rupture.

Les quadratiques sont conservées telles quelles. IBM Plex est une police
TrueType : ses contours sont des courbes de degré 2, et `Q` existe en SVG comme
en Path2D. Les convertir en cubiques serait approximer une géométrie qu'on a
sous la main — c'est exactement ce qui avait produit le ressaut du jambage du V.
"""

from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen

POLICE = "src/fonts/ibm-plex-sans-latin-600-normal.woff2"
MOT = "VRD"
INTERLETTRAGE_EM = -0.04  # doit suivre le letter-spacing du CSS


def contours(rec, depart_x):
    """Segments d'un glyphe, en unités de police, décalés de `depart_x`.

    TrueType enchaîne les points hors courbe en sous-entendant un point sur
    courbe à mi-chemin : on le rétablit explicitement, sinon la forme est fausse.
    """
    out = []
    depart = None
    dernier = None
    for op, args in rec.value:
        if op == "moveTo":
            depart = dernier = (args[0][0] + depart_x, args[0][1])
            out.append(("M", [depart]))
        elif op == "lineTo":
            dernier = (args[0][0] + depart_x, args[0][1])
            out.append(("L", [dernier]))
        elif op == "qCurveTo":
            pts = [(p[0] + depart_x, p[1]) if p else None for p in args]
            sur = pts[-1]
            hors = pts[:-1]
            if sur is None:  # contour tout en points hors courbe
                sur = ((hors[-1][0] + depart[0]) / 2, (hors[-1][1] + depart[1]) / 2)
            for i, c in enumerate(hors):
                fin = sur if i == len(hors) - 1 else ((c[0] + hors[i + 1][0]) / 2, (c[1] + hors[i + 1][1]) / 2)
                out.append(("Q", [c, fin]))
                dernier = fin
        elif op == "curveTo":
            raise SystemExit("cubique inattendue : la police n'est pas TrueType")
        elif op == "closePath":
            out.append(("Z", []))
    return out


def main():
    f = TTFont(POLICE)
    upm = f["head"].unitsPerEm
    cap = f["OS/2"].sCapHeight
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    hmtx = f["hmtx"]
    track = INTERLETTRAGE_EM * upm

    # Position de chaque lettre et relevé de ses contours.
    segments, x, boites = [], 0.0, {}
    for ch in MOT:
        gn = cmap[ord(ch)]
        rec = RecordingPen()
        gs[gn].draw(rec)
        segments += contours(rec, x)
        pts = [p for _, a in contours(rec, x) for p in a]
        boites[ch] = (min(p[0] for p in pts), max(p[0] for p in pts))
        x += hmtx[gn][0] + track

    gauche = boites[MOT[0]][0]
    droite = boites[MOT[-1]][1]
    largeur = droite - gauche

    # --- Ouverture : le fût du R, plus grand rectangle inscrit qui le contient.
    #     Mesuré sur le CONTOUR, par intersection de segments — pas sur un
    #     rendu. La sous-région convexe est un rectangle : la coupe par les
    #     coins n'est valable que sur un convexe, et le R ne l'est pas.
    xr = 0.0
    for ch in MOT:
        if ch == "R":
            break
        xr += hmtx[cmap[ord(ch)]][0] + track
    recR = RecordingPen()
    gs[cmap[ord("R")]].draw(recR)
    plat = aplatir(contours(recR, xr))

    def plages(y):
        xs = []
        for c in plat:
            for i in range(len(c)):
                (x1, y1), (x2, y2) = c[i], c[(i + 1) % len(c)]
                if (y1 <= y < y2) or (y2 <= y < y1):
                    xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        xs.sort()
        return [(xs[i], xs[i + 1]) for i in range(0, len(xs) - 1, 2)]

    lignes = [(y, plages(y)[0]) for y in (cap * k / 400 for k in range(1, 400)) if plages(y)]
    x0 = min(a for _, (a, _) in lignes)
    w = min(b - a for _, (a, b) in lignes)
    dedans = [y for y, (a, b) in lignes if a <= x0 + 0.5 and b >= x0 + w - 0.5]
    yhaut, ybas = min(dedans), max(dedans)

    # --- Report en espace SVG : y vers le BAS, ligne de base à 0, origine du
    #     mot à son bord visuel gauche.
    def X(v):
        return (v - gauche) / upm

    def Y(v):
        return -v / upm

    d = []
    for op, pts in segments:
        if op == "Z":
            d.append("Z")
        else:
            d.append(op + " " + " ".join(f"{X(p[0]):.5f} {Y(p[1]):.5f}" for p in pts))

    plongee_x = X(x0 + w / 2)
    plongee_y = Y((yhaut + ybas) / 2)

    print(f"""// GÉNÉRÉ — ne pas modifier à la main.
// Source : {POLICE}
// Régénérer : py scripts/extraire-sigle.py > src/components/hero/outlines.ts
//
// Le sigle en CONTOURS, pas en texte. Un tracé n'a ni cache de glyphes ni
// plafond de rastérisation : il se met à l'échelle sans se dégrader, ce qui
// supprime d'un coup l'escalier de l'ancienne ouverture, la course avec le
// chargement de la police, et la géométrie périmée au point de rupture.
//
// Repère : em, y vers le BAS, ligne de base à y = 0, x = 0 au bord visuel
// gauche du mot. Quadratiques d'origine conservées (police TrueType).

export const SIGLE = {{
  /** Tracé « VRD ». Remplissage non-zéro : les contrepoinçons restent pleins. */
  d: "{' '.join(d)}",
  /** Largeur visuelle, en em. */
  largeur: {largeur / upm:.5f},
  /** Hauteur de capitale, en em. */
  capitale: {cap / upm:.5f},
  /** Repère de plongée : centre du fût du R. */
  plongee: {{ x: {plongee_x:.5f}, y: {plongee_y:.5f} }},
  /**
   * Demi-dimensions du plus grand rectangle inscrit dans le fût, centré sur le
   * repère. C'est la sous-région CONVEXE de l'ouverture : le test de couverture
   * par les quatre coins n'est valable que sur un convexe, et le R n'en est pas
   * un. La prendre plus petite que l'ouverture réelle ne peut que majorer
   * l'échelle finale — jamais la sous-estimer.
   */
  ouverture: {{ w: {w / 2 / upm:.5f}, h: {(ybas - yhaut) / 2 / upm:.5f} }},
}} as const;""")


def aplatir(segs, pas=48):
    """Contours en polylignes, pour les mesures seulement."""
    cs, cur, dernier = [], [], None
    for op, pts in segs:
        if op == "M":
            if cur:
                cs.append(cur)
            dernier = pts[0]
            cur = [dernier]
        elif op == "L":
            dernier = pts[0]
            cur.append(dernier)
        elif op == "Q":
            c, fin = pts
            p0 = dernier
            for s in range(1, pas + 1):
                t = s / pas
                mt = 1 - t
                cur.append((mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * fin[0],
                            mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * fin[1]))
            dernier = fin
        elif op == "Z":
            if cur:
                cs.append(cur)
                cur = []
    if cur:
        cs.append(cur)
    return cs


if __name__ == "__main__":
    main()
