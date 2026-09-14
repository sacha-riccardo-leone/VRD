import { DISCIPLINES } from "@/content/disciplines";
import { BandeauSuite } from "./BandeauSuite";

/**
 * Clôture de l'accueil — le bandeau qui envoie vers les prestations.
 *
 * Il remplace le petit lien souligné qui terminait Approche : Sacha veut que
 * « Voir nos prestations » soit GRAND et pousse à cliquer (14.09.2026). Le
 * bandeau lui-même est le composant partagé BandeauSuite — le même que la
 * clôture de /prestations ; ce fichier n'en est que l'instance de l'accueil,
 * avec son contenu. L'accueil s'ouvre sur l'anthracite (le hero) et se ferme
 * dessus.
 *
 * Intégrité du contenu. Rien n'est promis ni chiffré ici : le titre reprend
 * mot pour mot le chapô de la page de destination (« Neuf techniques, du
 * concept à la mise en service. ») — il dit ce que le lecteur va trouver, pas
 * plus. La ligne d'appui énumère les neuf domaines, lus dans `DISCIPLINES`
 * (organigramme VRD 2026) plutôt que recopiés : un nom corrigé à un seul
 * endroit ne peut pas rester faux ici. La phrase produite est, au caractère
 * près, celle de la `description` des metadata de /prestations. « Neuf » est
 * dit ici pour la deuxième fois sur l'accueil (ProofBar : « Domaines
 * maîtrisés 9 ») — choix assumé, c'est le chapô de destination tel quel.
 *
 */

/**
 * « Chauffage, ventilation, …, énergétique et sécurité incendie ».
 * Les libellés portent une capitale initiale (ce sont des titres) ; dans une
 * phrase, ils passent en bas de casse — sauf le premier, et sauf les sigles
 * (BIM, MCR), qui restent en capitales.
 */
function enumeration(labels: string[]): string {
  const mots = labels.map((l, i) =>
    i === 0 || l === l.toUpperCase()
      ? l
      : l.charAt(0).toLowerCase() + l.slice(1),
  );
  return `${mots.slice(0, -1).join(", ")} et ${mots[mots.length - 1]}`;
}

export function SuitePrestations() {
  return (
    <BandeauSuite
      id="suite-titre"
      titre="Neuf techniques, du concept à la mise en service."
      texte={`${enumeration(DISCIPLINES.map((d) => d.label))}.`}
      href="/prestations"
      action="Voir nos prestations"
    />
  );
}
