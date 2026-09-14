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

        {/* L'argument du bureau, dans l'ordre où il se vit : d'abord l'achat,
            puis les années. La figure en dessous montre le croisement — la
            moins chère le premier jour n'est pas la moins chère à la fin. */}
        <h2 id="approche-titre" className={s.statement}>
          Un peu plus à l’achat. Beaucoup moins ensuite.
        </h2>

        <p className={s.body}>
          Nous ne choisissons pas une installation sur son prix d’achat. Nous
          regardons ce qu’elle coûtera pendant toute sa vie&nbsp;: l’énergie,
          l’entretien, les réparations. Celle qui coûte le moins le premier
          jour n’est pas toujours celle qui coûte le moins sur vingt ans
          — c’est ce coût-là que nous faisons baisser.
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
