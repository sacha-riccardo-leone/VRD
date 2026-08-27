import Link from "next/link";
import s from "./Hero.module.css";

/**
 * Section 1 — Hero. Sur papier : le titre est en encre, le seul bouton jaune
 * du site sur fond clair est le CTA primaire (remplissage jaune, texte encre =
 * 11.76:1). Au survol il s'inverse en encre + jaune (le jaune passe premier plan,
 * 10.73:1) — les deux états respectent le contrat de contraste.
 */
export function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-titre">
      <p className={`label ${s.kicker}`}>Technique du bâtiment · CVCS</p>

      <h1 id="hero-titre" className={s.title}>
        Nous concevons ce qui fait fonctionner un bâtiment.
      </h1>

      <p className={s.lede}>
        Bureau d’ingénieurs en technique du bâtiment à Sugiez. Chauffage, froid,
        ventilation, sanitaire, énergie et BIM — de l’étude SIA à la mise en
        service.
      </p>

      <div className={s.actions}>
        <Link href="/#contact" className={s.ctaPrimary}>
          Discuter d’un projet
        </Link>
        <Link href="/#realisations" className={s.ctaSecondary}>
          Voir nos réalisations
        </Link>
      </div>
    </section>
  );
}
