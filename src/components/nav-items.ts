export type NavItem = { href: string; label: string };

/**
 * Navigation principale — source unique (en-tête + panneau mobile).
 *
 * Phase « accueil seul » : les liens pointent vers les ancres de sections de la
 * home. Ils deviendront des routes réelles (/realisations, /a-propos…) quand les
 * pages secondaires existeront — Étape 4. Les ancres se remplissent au fur et à
 * mesure que les sections de l'accueil sont livrées.
 */
export const navItems: NavItem[] = [
  { href: "/#prestations", label: "Prestations" },
  { href: "/#realisations", label: "Réalisations" },
  { href: "/#methode", label: "Méthode" },
  { href: "/#equipe", label: "À propos" },
  { href: "/#carrieres", label: "Carrières" },
  { href: "/#contact", label: "Contact" },
];
