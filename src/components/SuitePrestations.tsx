import Link from "next/link";
import { DISCIPLINES } from "@/content/disciplines";
import s from "./SuitePrestations.module.css";

/**
 * Clôture de l'accueil — le bandeau qui envoie vers les prestations.
 *
 * Il remplace le petit lien souligné qui terminait Approche : Sacha veut que
 * « Voir nos prestations » soit GRAND et pousse à cliquer (14.09.2026). On
 * reprend donc la grammaire du bandeau anthracite de Prestations (kicker
 * « Suite », titre, ligne d'appui, bouton primaire inversé) en retournant sa
 * hiérarchie : le bouton est le sujet, le titre n'en est que la légende. Il
 * devient le plus grand bouton du site, sur toute la largeur de la colonne.
 * L'accueil s'ouvre sur l'anthracite (le hero) et se ferme dessus.
 *
 * Le bouton domine par l'INVERSION et la pleine largeur — les leviers
 * d'AGENTS.md — pas par le corps : le titre reste au corps de tout h2 du
 * site, le bouton est au même corps. C'est l'aplat qui fait le poids.
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
 * Le kicker « Suite » est le même que sur /prestations ; enchaîner les deux
 * pages le fait lire deux fois. Repli si VRD tique : « Et maintenant ».
 *
 * Composant serveur : pas d'état, pas de script. Le seul mouvement est dans le
 * CSS — la flèche qui se trace au survol ou au focus.
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
    <section className={`technique ${s.band}`} aria-labelledby="suite-titre">
      <div className={s.inner}>
        {/* Pas de classe de module : la marge sous le kicker vit sur `.title`
            (`margin-block-start`), comme sur le bandeau de /prestations. */}
        <p className="label">Suite</p>

        <h2 id="suite-titre" className={s.title}>
          Neuf techniques, du concept à la mise en service.
        </h2>

        <p className={s.text}>
          {enumeration(DISCIPLINES.map((d) => d.label))}.
        </p>

        {/* Le texte du lien est imposé. La flèche est dessinée plutôt que
            tapée : une ligne de construction en tireté, une pointe pleine, et
            un trait plein qui se trace par-dessus le tireté au survol — le
            dessin s'assemble. Tout en currentColor : elle suit l'inversion du
            bouton. Masquée aux lecteurs d'écran — le nom du lien suffit. */}
        <Link href="/prestations" className={s.primary}>
          <span className={s.primaryText}>Voir nos prestations</span>
          <svg
            className={s.arrow}
            viewBox="0 0 48 24"
            aria-hidden="true"
            focusable="false"
          >
            <line
              x1="4"
              y1="12"
              x2="44"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
            <line
              className={s.shaft}
              x1="4"
              y1="12"
              x2="44"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M33 1 L44 12 L33 23"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
