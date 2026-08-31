/**
 * Les huit domaines de VRD, dans l'ordre du portfolio.
 *
 * Module SANS "use client" à dessein : la page serveur et l'octogone client
 * importent la même source. Exporter des données depuis un module client les
 * transforme en références client et casse le prérendu.
 *
 * `teaser` et `chips` sont CONDENSÉS À PARTIR DE LA COPIE EXISTANTE de la page,
 * jamais réécrits. Deux domaines n'ont aucune copie sur le site actuel
 * (sprinkler, MCR) : leur teaser vaut null et la carte affiche la réserve.
 */
export type Discipline = {
  id: string;
  label: string;
  /** ≤ 140 caractères, repris de la copie existante. null = à fournir par VRD. */
  teaser: string | null;
  chips: string[];
};

/** Ordre horaire depuis midi — il fixe aussi l'ordre de tabulation. */
export const DISCIPLINES: Discipline[] = [
  {
    id: "chauffage",
    label: "Chauffage",
    teaser:
      "Production, distribution, émission : des installations dimensionnées au plus juste.",
    chips: ["Déperditions", "Production", "Équilibrage"],
  },
  {
    id: "ventilation",
    label: "Ventilation",
    teaser: "Air neuf, confort et hygiène, sans surconsommation.",
    chips: ["Débits", "Gaines", "Mise en service"],
  },
  {
    id: "froid",
    label: "Froid",
    teaser:
      "Le froid obéit à la même logique, avec ses charges d’été et sa gestion de la condensation.",
    // La copie actuelle ne dit rien de plus sur le froid : deux mots-clés seulement.
    chips: ["Charges d’été", "Condensation"],
  },
  {
    id: "sanitaire",
    label: "Sanitaire",
    teaser: "Eau, évacuation et protection incendie.",
    chips: ["Robinetterie", "Défense incendie", "Réservations"],
  },
  {
    id: "sprinkler",
    label: "Sprinkler",
    teaser: null, // TODO: teaser — aucune copie sprinkler sur le site actuel.
    chips: [],
  },
  {
    id: "bim",
    label: "BIM",
    teaser: "Une maquette unique, tous les corps d’état alignés.",
    chips: ["Maquette", "IFC", "Coordination"],
  },
  {
    id: "mcr",
    label: "MCR",
    teaser: null, // TODO: teaser — aucune copie MCR sur le site actuel.
    chips: [],
  },
  {
    id: "energetique",
    label: "Énergétique",
    teaser: "Concevoir sobre : bilans, variantes et énergies renouvelables.",
    chips: ["Bilans", "Variantes", "Exigences cantonales"],
  },
];
