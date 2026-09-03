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
 *
 * Le nom RESTE la donnée : il sert de texte alternatif à chaque logo, si bien
 * qu'un lecteur d'écran, un flux sans images ou une impression en noir donnent
 * la même liste qu'avant. Le logo s'ajoute par-dessus, il ne remplace rien.
 *
 * Les marques appartiennent à leurs titulaires. Elles figurent déjà sous cette
 * forme dans le portfolio remis par VRD : la maquette reprend l'usage du
 * client, elle ne l'invente pas.
 */
/**
 * `site` est FACULTATIF, et c'est voulu. Une adresse absente n'est pas un
 * défaut : le logo s'affiche, il n'est simplement pas cliquable. C'est
 * préférable à un lien deviné — une URL fausse envoie le lecteur chez un
 * homonyme, et sur une page de références clients cela se remarque.
 */
export type Client = {
  nom: string;
  logo: string;
  site?: string;
  /**
   * Ce que le lien mène voir, quand ce n'est PAS le site propre de la société.
   * Sert au libellé accessible : annoncer « site officiel » pour une fiche
   * d'entreprise hébergée par une maison mère serait inexact.
   */
  siteLibelle?: string;
};

export const CLIENTS: Client[] = [
  { nom: "Bulgari", logo: "/logos/bulgari.svg", site: "https://www.bulgari.com" },
  { nom: "TAG Heuer", logo: "/logos/tag-heuer.png", site: "https://www.tagheuer.com" },
  { nom: "Swatch Group", logo: "/logos/swatch-group.png", site: "https://www.swatchgroup.com" },
  { nom: "CFF", logo: "/logos/cff.webp", site: "https://www.sbb.ch" },
  { nom: "Coop", logo: "/logos/coop.webp", site: "https://www.coop.ch" },
  { nom: "Coop Restaurant", logo: "/logos/coop-restaurant.png", site: "https://www.coop-restaurant.ch" },
  { nom: "Lidl", logo: "/logos/lidl.webp", site: "https://www.lidl.ch" },
  { nom: "UNIL", logo: "/logos/unil.png", site: "https://www.unil.ch" },
  { nom: "Canton de Vaud", logo: "/logos/canton-de-vaud.webp", site: "https://www.vd.ch" },
  { nom: "Ville de Nyon", logo: "/logos/ville-de-nyon.webp", site: "https://www.nyon.ch" },
  { nom: "tl — transports lausannois", logo: "/logos/tl.svg", site: "https://www.t-l.ch" },
  { nom: "eHnv — Étab. hospitaliers du Nord vaudois", logo: "/logos/ehnv.svg", site: "https://www.ehnv.ch" },
  { nom: "Groupe COMINA Architecture", logo: "/logos/groupe-comina.webp", site: "https://www.comina-architecture.ch/fr/" },
  { nom: "CCHE", logo: "/logos/cche.png", site: "https://cche.com" },
  { nom: "a-rr.", logo: "/logos/a-rr.png", site: "https://a-rr.ch" },
  { nom: "Fondation St-George", logo: "/logos/fondation-st-george.png", site: "https://www.fondationstgeorge.ch" },
  { nom: "Werthanor", logo: "/logos/werthanor.png", site: "https://werthanor.ch" },
  // APA = Atelier Pulver Architectes — adresse fournie, confirmée en ouvrant
  // la page (le titre du site porte la raison sociale en toutes
  // lettres). Le sigle seul ne permettait pas de la retrouver.
  { nom: "APA", logo: "/logos/apa.webp", site: "https://aparchitectes.ch/fr/" },
  // MOM Le Prélet n'a pas de site propre : cette page est sa fiche sur le site
  // du groupe Swatch, sa maison mère. Page vérifiée — titre « MOM Le Prélet —
  // Swatch Group », sans redirection. Le libellé le dit, plutôt que de la
  // faire passer pour le site de l'entreprise.
  {
    nom: "MOM Le Prélet SA",
    logo: "/logos/mom-le-prelet.avif",
    site: "https://www.swatchgroup.com/fr/entreprises-et-marques/production/mom-le-prelet",
    siteLibelle: "fiche sur le site du groupe Swatch",
  },
  { nom: "CHH Microtechnique", logo: "/logos/chh-microtechnique.webp", site: "https://chh-microtechnique.ch" },
  { nom: "Monnin SA", logo: "/logos/monnin.png", site: "https://www.monnin.ch" },
  // Un 22e logo du portfolio n'a pas pu être lu de façon fiable (« RemoveD ? »).
  // Omission assumée : demander la raison sociale exacte à VRD plutôt que de la deviner.
];
