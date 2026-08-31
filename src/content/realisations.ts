/**
 * Références de VRD — TOUTES issues du portfolio remis par le bureau.
 * Source primaire, donc des faits : ni inventé, ni inféré, ni « représentatif ».
 *
 * Règle de confidentialité : le portfolio marque explicitement un maître
 * d'ouvrage confidentiel (« le nom du Maître de l'Ouvrage est confidentiel »).
 * On reproduit cette réserve telle quelle — c'est la leur, pas la nôtre.
 *
 * Ne rien ajouter ici qui ne figure pas dans le portfolio.
 */

export type Realisation = {
  slug: string;
  maitre: string;
  confidentiel?: boolean;
  /** Localité telle qu'écrite dans le portfolio. */
  lieu: string;
  /** Canton — uniquement quand le portfolio le donne. */
  canton?: string;
  annees: string;
  role: string;
  descriptif: string;
  surface?: string;
  /** Budget des installations techniques, en francs. */
  budgetCHF: number;
  budgetLabel: string;
};

/** Classées par budget d'installations techniques décroissant. */
export const REALISATIONS: Realisation[] = [
  {
    slug: "manufacture-horlogere-le-noirmont",
    maitre: "Manufacture horlogère",
    confidentiel: true,
    lieu: "Le Noirmont",
    canton: "JU",
    annees: "2022–2024",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Extension d’une usine dévolue à la fabrication de produits horlogers — boîtiers et cadrans haut de gamme.",
    surface: "11’000 m²",
    budgetCHF: 7_500_000,
    budgetLabel: "≈ 7.5 mios CHF",
  },
  {
    slug: "werthanor-le-locle",
    maitre: "Werthanor SA",
    lieu: "Le Locle",
    canton: "NE",
    annees: "2024–2026",
    role: "Ingénieur CVCS et MCR",
    descriptif:
      "Extension d’une manufacture horlogère dévolue à la fabrication de boîtes, de bracelets et de fermoirs.",
    surface: "7’500 m²",
    budgetCHF: 4_800_000,
    budgetLabel: "≈ 4.8 mios CHF",
  },
  {
    slug: "tag-heuer-cornol",
    maitre: "TAG-Heuer — Branch of LVMH",
    lieu: "Cornol",
    canton: "JU",
    annees: "2023–2026",
    role: "Ingénieur CVCS et MCR",
    descriptif:
      "Construction d’une nouvelle usine dévolue à la fabrication de produits horlogers.",
    surface: "6’000 m²",
    budgetCHF: 4_600_000,
    budgetLabel: "≈ 4.6 mios CHF",
  },
  {
    slug: "2k99-la-fonderie-bienne",
    maitre: "2K99 SA — La Fonderie",
    lieu: "Bienne",
    canton: "BE",
    annees: "2023–2026",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Construction d’un bâtiment multifonctionnel comprenant un musée, une salle de spectacle et un restaurant.",
    surface: "3’700 m²",
    budgetCHF: 1_500_000,
    budgetLabel: "≈ 1.5 mios CHF",
  },
  {
    slug: "tag-heuer-la-chaux-de-fonds",
    maitre: "TAG-Heuer — Branch of LVMH",
    lieu: "La Chaux-de-Fonds",
    canton: "NE",
    annees: "2023–2026",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Assainissement et mise en conformité de l’installation de froid — climatique et process — de l’usine, raccordement au CAD et assainissement des installations de ventilation.",
    budgetCHF: 1_400_000,
    budgetLabel: "≈ 1.4 mios CHF",
  },
  {
    slug: "cff-gare-la-chaux-de-fonds",
    maitre: "CFF Immobilier SA",
    lieu: "Gare de La Chaux-de-Fonds",
    canton: "NE",
    annees: "2022–2023",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Création d’une nouvelle production de froid climatique centralisée, avec mise en place d’une boucle de condensation pour les locataires.",
    budgetCHF: 1_100_000,
    budgetLabel: "≈ 1.1 mios CHF",
  },
  {
    slug: "centre-formation-horlogers-le-brassus",
    maitre: "Centre de formation des horlogers",
    lieu: "Le Brassus",
    canton: "VD",
    annees: "2023–2024",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Transformation du centre de formation des horlogers pour le compte de Blancpain, Breguet, CHH et Swatch-Group.",
    budgetCHF: 700_000,
    budgetLabel: "≈ 700 KCHF",
  },
  {
    slug: "coop-savigny",
    maitre: "COOP Savigny",
    lieu: "Savigny",
    annees: "2024–2025",
    role: "Ingénierie CVCS et MCR",
    descriptif:
      "Suivi des travaux d’exécution et d’aménagement CVCSR du magasin.",
    budgetCHF: 500_000,
    budgetLabel: "≈ 500 KCHF",
  },
];

/** Somme des budgets ci-dessus — calculée, jamais saisie à la main. */
export const BUDGET_TOTAL_MIOS =
  Math.round((REALISATIONS.reduce((t, r) => t + r.budgetCHF, 0) / 1_000_000) * 10) / 10;

/** Cantons réellement représentés — dérivés, pour qu'aucun chiffre affiché ne
 *  puisse diverger des références. Le siège (Fribourg) n'en fait PAS partie :
 *  aucune des huit références ne s'y trouve. */
export const CANTONS: string[] = [
  ...new Set(REALISATIONS.map((r) => r.canton).filter((c): c is string => Boolean(c))),
];

/**
 * Clients cités par VRD dans son portfolio (page « Ils nous font confiance »).
 * Reproduits en toutes lettres, sans logo : nous n'avons pas de droit d'usage
 * sur les marques, et un nom se vérifie mieux qu'une image.
 */
export const CLIENTS: string[] = [
  "Bulgari",
  "TAG Heuer",
  "Swatch Group",
  "CFF",
  "Coop",
  "Coop Restaurant",
  "Lidl",
  "UNIL",
  "Canton de Vaud",
  "Ville de Nyon",
  "tl — transports lausannois",
  "eHnv — Étab. hospitaliers du Nord vaudois",
  "Groupe COMINA Architecture",
  "CCHE",
  "a-rr.",
  "Fondation St-George",
  "Werthanor",
  "APA",
  "MOM Le Prélet SA",
  "CHH Microtechnique",
  "Monnin SA",
  // Un 22e logo du portfolio n'a pas pu être lu de façon fiable (« RemoveD ? »).
  // Omission assumée : demander la raison sociale exacte à VRD plutôt que de la deviner.
];
