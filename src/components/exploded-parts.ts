// Données partagées entre le composant client <ExplodedAssembly> (géométrie) et
// la page serveur /labo (légende). DOIT rester hors d'un module "use client" :
// sinon Next transforme l'export en référence client et le tableau n'est plus
// un vrai tableau côté serveur (EXPLODED_PARTS.map is not a function au build).

export type ExplodedPart = { n: number; cy: number; lx: number; label: string };

export const EXPLODED_PARTS: ExplodedPart[] = [
  { n: 1, cy: 80, lx: 418, label: "Bouchon de purge" },
  { n: 2, cy: 165, lx: 394, label: "Écrou-union" },
  { n: 3, cy: 230, lx: 400, label: "Joint torique" },
  { n: 4, cy: 330, lx: 356, label: "Corps de vanne" },
  { n: 5, cy: 445, lx: 388, label: "Roue" },
  { n: 6, cy: 565, lx: 396, label: "Moteur" },
  { n: 7, cy: 690, lx: 374, label: "Socle" },
];
