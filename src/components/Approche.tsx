import Link from "next/link";
import { CoutInstallation } from "./CoutInstallation";
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
        <div className={s.text}>
        <p className={`label ${s.kicker}`}>
          Notre approche <span className={s.flag}>à valider par VRD</span>
        </p>

        {/* « Inadaptée », pas « trop grosse » ni « bon marché » : le mot ne
            préjuge ni de la taille ni du prix. Il couvre le cas documenté (le
            surdimensionnement, plus cher à l'achat aussi) comme les autres. */}
        <h2 id="approche-titre" className={s.statement}>
          Une installation inadaptée se paie deux fois.
        </h2>

        <p className={s.body}>
          Nous ne choisissons pas une installation sur son prix d’achat. Nous
          regardons ce qu’elle coûtera pendant toute sa vie&nbsp;: l’entretien,
          l’énergie, et la solidité du fournisseur. C’est ce coût-là que nous
          cherchons à réduire.
        </p>

        <CoutInstallation />


          <Link href="/prestations" className={s.link}>
            Voir nos prestations
          </Link>
        </div>

      </div>
    </section>
  );
}
