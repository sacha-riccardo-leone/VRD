import { REALISATIONS } from "@/content/realisations";
import { projeter } from "./cantons";

/**
 * Positions des références sur la carte.
 *
 * Ce fichier n'ajoute qu'une chose aux références : des COORDONNÉES. Tout le
 * reste — maître d'ouvrage, localité, années, budget — est lu dans
 * `realisations.ts`, pour que la carte ne puisse pas diverger de l'index qui la
 * suit. Une référence sans coordonnée n'apparaît simplement pas, et le compte
 * affiché le dit.
 *
 * Les coordonnées ne sont PAS des données VRD : ce sont les positions publiques
 * de communes suisses, relevées sur des sources vérifiables et recoupées deux
 * fois. Le portfolio ne donne aucune adresse ; le point vaut donc pour la
 * LOCALITÉ, ce que la carte annonce sous elle. Un chantier n'est pas au centre
 * de son village, et la carte ne prétend pas le contraire.
 *
 * ── Le cas Savigny ─────────────────────────────────────────────────────────
 * Le portfolio ne donne pas son canton — c'est le seul des huit dans ce cas, et
 * j'avais déjà inventé « VD » une fois, à tort. Il ne l'est plus ici par
 * déduction hasardeuse mais par un fait vérifiable : il n'existe qu'UNE SEULE
 * commune nommée Savigny en Suisse, dans le canton de Vaud, district de
 * Lavaux-Oron, numéro OFS 5611 — recoupé sur la recherche swisstopo
 * (api3.geo.admin.ch) et sur Nominatim. Le nom suffit donc à situer le point.
 * Le champ `canton` de la référence reste vide pour autant : il rapporte ce que
 * dit le portfolio, et le portfolio se tait.
 */

type Coord = { lat: number; lng: number; deduit?: string };

/**
 * Valeurs retenues après recoupement : deux sources indépendantes au moins par
 * point (gazetteer et limites communales swisstopo, Nominatim/OSM, Wikidata),
 * concordantes à moins de 3 km, et chaque point testé À L'INTÉRIEUR du polygone
 * communal de son canton (swissBOUNDARIES3D 2026). Écart maximal entre sources
 * retenues : 0,65 km.
 *
 * Trois réserves consignées, parce qu'elles changeraient le sens de la carte si
 * on les oubliait :
 *
 *  — Le Brassus n'est pas une commune mais une localité de la commune du Chenit.
 *    La carte ne parle que de localités, ce que dit la mention sous elle.
 *  — Bienne : c'est le centre URBAIN, à 2,7 km du centre de gravité communal,
 *    la commune étant très étendue. C'est la même convention que pour les autres
 *    points — centre de la localité — et il ne faut pas en changer d'un point à
 *    l'autre sous peine de rendre les distances incomparables.
 *  — Savigny : la valeur Wikidata (46.5667/6.7167), arrondie à la minute d'arc,
 *    tombe à 3,3 km du village. On prend celle du gazetteer swisstopo.
 */
const COORDONNEES: Record<string, Coord> = {
  "manufacture-horlogere-le-noirmont": { lat: 47.2247, lng: 6.9563 },
  "werthanor-le-locle": { lat: 47.056, lng: 6.7483 },
  "tag-heuer-cornol": { lat: 47.4078, lng: 7.1624 },
  "2k99-la-fonderie-bienne": { lat: 47.1402, lng: 7.2439 },
  "tag-heuer-la-chaux-de-fonds": { lat: 47.104, lng: 6.8314 },
  // La gare, et non le centre : 764 m plus au sud, mesuré sur les référentiels
  // swisstopo. Les deux points doivent rester distincts — c'est le cas d'espèce
  // que l'écartement des épingles traite, et la seule des huit références qui
  // désigne un ouvrage plutôt qu'une localité.
  "cff-gare-la-chaux-de-fonds": { lat: 47.09865, lng: 6.82561 },
  "centre-formation-horlogers-le-brassus": { lat: 46.5855, lng: 6.2119 },
  "coop-savigny": {
    lat: 46.5379,
    lng: 6.7302,
    deduit: "Commune unique de ce nom en Suisse (VD) — le portfolio ne donne pas le canton.",
  },
};

export type Point = {
  slug: string;
  nom: string;
  lieu: string;
  canton?: string;
  annees: string;
  budgetLabel: string;
  /** Unités de la zone de dessin, via la MÊME projection que les frontières. */
  x: number;
  y: number;
  deduit?: string;
};

export const POINTS: Point[] = REALISATIONS.flatMap((r) => {
  const c = COORDONNEES[r.slug];
  if (!c) return [];
  const { x, y } = projeter(c.lng, c.lat);
  return [
    {
      slug: r.slug,
      nom: r.maitre,
      lieu: r.lieu,
      canton: r.canton,
      annees: r.annees,
      budgetLabel: r.budgetLabel,
      x,
      y,
      deduit: c.deduit,
    },
  ];
});

/** Références qu'on ne sait pas situer — comptées, jamais devinées. */
export const MANQUANTS = REALISATIONS.length - POINTS.length;
