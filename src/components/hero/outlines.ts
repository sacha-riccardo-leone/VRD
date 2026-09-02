// GÉNÉRÉ — ne pas modifier à la main.
// Source : src/fonts/ibm-plex-sans-latin-600-normal.woff2
// Régénérer : py scripts/extraire-sigle.py > src/components/hero/outlines.ts
//
// Le sigle en CONTOURS, pas en texte. Un tracé n'a ni cache de glyphes ni
// plafond de rastérisation : il se met à l'échelle sans se dégrader, ce qui
// supprime d'un coup l'escalier de l'ancienne ouverture, la course avec le
// chargement de la police, et la géométrie périmée au point de rupture.
//
// Repère : em, y vers le BAS, ligne de base à y = 0, x = 0 au bord visuel
// gauche du mot. Quadratiques d'origine conservées (police TrueType).

export const SIGLE = {
  /** Tracé « VRD ». Remplissage non-zéro : les contrepoinçons restent pleins. */
  d: "M 0.37700 0.00000 L 0.22700 0.00000 L 0.00000 -0.69800 L 0.13500 -0.69800 L 0.24200 -0.35800 L 0.30400 -0.12600 L 0.30700 -0.12600 L 0.36800 -0.35800 L 0.47500 -0.69800 L 0.60600 -0.69800 Z M 0.79600 -0.26900 L 0.79600 0.00000 L 0.66400 0.00000 L 0.66400 -0.69800 L 0.97900 -0.69800 Q 1.04300 -0.69800 1.08900 -0.67150 Q 1.13500 -0.64500 1.16000 -0.59650 Q 1.18500 -0.54800 1.18500 -0.48200 Q 1.18500 -0.41100 1.15250 -0.35850 Q 1.12000 -0.30600 1.05500 -0.28400 L 1.19800 0.00000 L 1.05100 0.00000 L 0.92100 -0.26900 Z M 0.79600 -0.38000 L 0.96600 -0.38000 Q 0.99200 -0.38000 1.01000 -0.38950 Q 1.02800 -0.39900 1.03800 -0.41650 Q 1.04800 -0.43400 1.04800 -0.45900 L 1.04800 -0.50500 Q 1.04800 -0.53100 1.03800 -0.54800 Q 1.02800 -0.56500 1.01000 -0.57400 Q 0.99200 -0.58300 0.96600 -0.58300 L 0.79600 -0.58300 Z M 1.28800 0.00000 L 1.28800 -0.69800 L 1.54200 -0.69800 Q 1.63300 -0.69800 1.70100 -0.65900 Q 1.76900 -0.62000 1.80600 -0.54250 Q 1.84300 -0.46500 1.84300 -0.34900 Q 1.84300 -0.23300 1.80600 -0.15550 Q 1.76900 -0.07800 1.70100 -0.03900 Q 1.63300 0.00000 1.54200 0.00000 Z M 1.42000 -0.11700 L 1.54200 -0.11700 Q 1.59100 -0.11700 1.62700 -0.13650 Q 1.66300 -0.15600 1.68300 -0.19550 Q 1.70300 -0.23500 1.70300 -0.29400 L 1.70300 -0.40400 Q 1.70300 -0.46400 1.68300 -0.50300 Q 1.66300 -0.54200 1.62700 -0.56150 Q 1.59100 -0.58100 1.54200 -0.58100 L 1.42000 -0.58100 Z",
  /** Largeur visuelle, en em. */
  largeur: 1.84300,
  /** Hauteur de capitale, en em. */
  capitale: 0.69800,
  /** Repère de plongée : centre du fût du R. */
  plongee: { x: 0.73000, y: -0.34900 },
  /**
   * Demi-dimensions du plus grand rectangle inscrit dans le fût, centré sur le
   * repère. C'est la sous-région CONVEXE de l'ouverture : le test de couverture
   * par les quatre coins n'est valable que sur un convexe, et le R n'en est pas
   * un. La prendre plus petite que l'ouverture réelle ne peut que majorer
   * l'échelle finale — jamais la sous-estimer.
   */
  ouverture: { w: 0.06600, h: 0.34725 },
} as const;
