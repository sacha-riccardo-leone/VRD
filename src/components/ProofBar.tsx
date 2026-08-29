import s from "./ProofBar.module.css";

/**
 * Section 2 — Barre de preuve. Sa fonction : donner en un coup d'œil de quoi
 * situer le bureau, parce que l'audit a montré que le site actuel ne le fait
 * nulle part (équipe vide, aucune référence, certifications absentes alors
 * qu'elles existent sur LinkedIn).
 *
 * Intégrité du contenu — chaque valeur porte sa source :
 *  - 2020 : registre du commerce (CHE-287.600.663, inscription du 30.10.2020).
 *    Le site actuel affiche « fondée en 2021 » : contradiction avec le registre,
 *    à trancher avec VRD.
 *  - 6 collaborateurs, +200 projets : chiffres publiés par VRD.
 *  - 5 techniques : les spécialités listées sur leur site.
 *  - Certifications : vues sur LinkedIn uniquement, jamais confirmées sur une
 *    source primaire. Elles sont donc affichées SOUS RÉSERVE, marquées comme
 *    telles. On ne présente pas une qualification non vérifiée comme un fait.
 */
type Stat = { value: string; label: string; note?: string };

const STATS: Stat[] = [
  { value: "2020", label: "Année de création", note: "Registre du commerce" },
  { value: "6", label: "Collaborateurs", note: "Chiffre publié par VRD" },
  { value: "200+", label: "Projets réalisés", note: "Chiffre publié par VRD" },
  { value: "5", label: "Techniques maîtrisées", note: "CVCS · énergie · BIM" },
];

const CERTS = ["Minergie-P", "CECB+", "Sprinklers AEAI", "BIM"];

export function ProofBar() {
  return (
    <section className={s.band} aria-labelledby="preuve-titre">
      <div className={s.inner}>
        <h2 id="preuve-titre" className={`label ${s.kicker}`}>
          VRD en bref
        </h2>

        <dl className={s.stats}>
          {STATS.map((st) => (
            <div className={s.stat} key={st.label}>
              <dt className={s.statLabel}>{st.label}</dt>
              <dd className={s.statValue}>{st.value}</dd>
              {st.note ? <p className={s.statNote}>{st.note}</p> : null}
            </div>
          ))}
        </dl>

        <div className={s.certs}>
          <p className={`label ${s.certsLabel}`}>
            Qualifications <span className={s.flag}>à confirmer</span>
          </p>
          <ul className={s.certsList}>
            {CERTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className={s.certsNote}>
            Relevées sur le profil LinkedIn du bureau, non vérifiées auprès d’une
            source officielle — à valider avant publication.
          </p>
        </div>
      </div>
    </section>
  );
}
