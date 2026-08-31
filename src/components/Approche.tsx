import Link from "next/link";
import s from "./Approche.module.css";

/**
 * Section 3 — le principe d'investissement.
 *
 * C'est la première fois que le site ARGUMENTE. Le hero annonce, les chiffres
 * situent ; ici le bureau dit comment il choisit. C'est aussi la réponse à la
 * question que se pose vraiment un maître d'ouvrage : pourquoi eux.
 *
 * PROVENANCE — texte proposé, pas encore validé par VRD. Il reprend une idée
 * formulée par un tiers, reformulée ici dans la voix du bureau. Il n'est donc
 * ni présenté entre guillemets, ni attribué à quiconque : une citation ferait
 * dire à VRD des mots qu'elle n'a pas écrits. La réserve est visible à l'écran,
 * comme partout ailleurs sur cette maquette.
 *
 * Le français d'origine comportait deux fautes de construction (« nous mettant
 * en compte », « en focalisons sur ») : corrigées, la structure et tous les
 * termes techniques de l'auteur sont conservés.
 */
export function Approche() {
  return (
    <section className={s.band} aria-labelledby="approche-titre">
      <div className={s.inner}>
        <p className={`label ${s.kicker}`}>
          Notre approche <span className={s.flag}>à valider par VRD</span>
        </p>

        <h2 id="approche-titre" className={s.statement}>
          Le moins cher à l’achat est rarement le moins cher à l’usage.
        </h2>

        <p className={s.body}>
          Nos choix d’investissement ne reposent pas sur le seul coût initial.
          Nous prenons en compte les coûts d’exploitation sur le long terme et la
          durée de vie de l’installation, en nous concentrant sur le coût réel
          d’exploitation&nbsp;: coût d’entretien, coût énergétique et pérennité
          du fournisseur.
        </p>

        <ul className={s.criteres}>
          <li>
            <span className={s.critNum}>01</span>
            <span className={s.critLabel}>Coût d’entretien</span>
          </li>
          <li>
            <span className={s.critNum}>02</span>
            <span className={s.critLabel}>Coût énergétique</span>
          </li>
          <li>
            <span className={s.critNum}>03</span>
            <span className={s.critLabel}>Durée de vie</span>
          </li>
          <li>
            <span className={s.critNum}>04</span>
            <span className={s.critLabel}>Pérennité du fournisseur</span>
          </li>
        </ul>

        <Link href="/prestations" className={s.link}>
          Voir nos prestations
        </Link>
      </div>
    </section>
  );
}
