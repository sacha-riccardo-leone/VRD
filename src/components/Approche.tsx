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
 * dire à VRD des mots qu'elle n'a pas écrits. Le marqueur « à valider par
 * VRD » a été retiré de l'écran le 14.09.2026, à la demande de Sacha : le
 * bureau relira tout le site, la réserve n'a pas besoin d'être affichée.
 *
 * Le français d'origine comportait deux fautes de construction (« nous mettant
 * en compte », « en focalisons sur ») : corrigées, la structure et tous les
 * termes techniques de l'auteur sont conservés.
 *
 * Le renvoi vers les prestations n'est plus ici : il est porté par le bandeau
 * SuitePrestations qui suit, à l'échelle de la page (14.09.2026).
 */
export function Approche() {
  return (
    <section className={s.band} aria-labelledby="approche-titre">
      <div className={s.inner}>
        <div className={s.text}>
        <p className={`label ${s.kicker}`}>Notre approche</p>

        {/* Le bureau parle de lui, à la première personne : c'est sa manière
            de choisir. « Long terme », pas « vingt ans » : les vingt ans sont
            l'horizon de l'EXEMPLE en dessous, pas du principe. La figure
            montre le croisement — la moins chère le premier jour n'est pas la
            moins chère à la fin. */}
        <h2 id="approche-titre" className={s.statement}>
          Nous choisissons avec discernement, pour le long terme.
        </h2>

        <p className={s.body}>
          Le prix d’achat ne décide pas seul. Nous regardons ce qu’une
          installation coûtera pendant toute sa vie&nbsp;: l’énergie,
          l’entretien, les réparations.
        </p>

        <CoutInstallation />
        </div>

      </div>
    </section>
  );
}
