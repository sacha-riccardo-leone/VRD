export type NavItem = { href: string; label: string };

/**
 * Navigation principale — source unique (en-tête + panneau mobile).
 *
 * Des PAGES distinctes, pas des ancres : chaque entrée est une route réelle.
 * Un site d'une seule page qui défile ne permet ni de lier une prestation dans
 * une offre, ni d'être indexé page par page — or l'audit a montré que VRD est
 * invisible en recherche non-marque.
 */
export const navItems: NavItem[] = [
  { href: "/prestations", label: "Prestations" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/carrieres", label: "Carrières" },
  { href: "/contact", label: "Contact" },
];
