import { CountUp } from "./CountUp";
import s from "./ProofBar.module.css";

/**
 * Section 2 — Chiffres clé.
 *
 * Source : le portfolio remis par VRD. Ce sont LEURS trois chiffres officiels —
 * Âge 5, Collaborateurs 6, Projets réalisés +200. Deux corrections en découlent
 * par rapport à la version précédente :
 *  - le « 5 » désigne l'ÂGE du bureau, pas un nombre de techniques ;
 *  - les domaines sont au nombre de HUIT (chauffage, ventilation, froid,
 *    sanitaire, sprinkler, BIM, MCR, énergétique) et non cinq.
 * L'année de création disparaît d'ici : elle est portée par le hero.
 *
 * Le nombre de projets ouvre la section, seul, et se compte à l'arrivée dans le
 * cadre — c'est le chiffre qui porte la crédibilité du bureau.
 */
export function ProofBar() {
  return (
    <section className={s.band} aria-labelledby="preuve-titre">
      <div className={s.inner}>
        <h2 id="preuve-titre" className={`label ${s.kicker}`}>
          Chiffres clé
        </h2>

        {/* Le chiffre qui compte, seul sur sa ligne. */}
        <div className={s.lead}>
          <p className={s.leadValue}>
            <CountUp to={200} suffix="+" />
          </p>
          <p className={s.leadLabel}>Projets réalisés</p>
        </div>

        {/* Les autres, alignés en dessous. */}
        <dl className={s.stats}>
          <div className={s.stat}>
            <dt className={s.statLabel}>Collaborateurs</dt>
            <dd className={s.statValue}>6</dd>
          </div>
          <div className={s.stat}>
            <dt className={s.statLabel}>Ans d’existence</dt>
            <dd className={s.statValue}>5</dd>
          </div>
          <div className={s.stat}>
            <dt className={s.statLabel}>Domaines maîtrisés</dt>
            <dd className={s.statValue}>8</dd>
          </div>
        </dl>

        <p className={s.source}>
          Chiffres publiés par VRD — portfolio du bureau. Domaines&nbsp;: chauffage,
          ventilation, froid, sanitaire, sprinkler, BIM, MCR, énergétique.
        </p>
      </div>
    </section>
  );
}
