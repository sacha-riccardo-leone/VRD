import Link from "next/link";
import { FigureBackdrop } from "./FigureBackdrop";
import { BatimentCoupeIso } from "./BatimentCoupeIso";
import s from "./Hero.module.css";

/**
 * Section 1 — Hero. Monochrome : le CTA primaire est un aplat d'encre à texte
 * papier, inversé au survol ; le secondaire est de l'encre soulignée. La
 * hiérarchie vient de l'inversion et du poids, jamais de la teinte.
 *
 * En fond, la coupe axonométrique de bâtiment en épaisseur de substrat — elle
 * illustre le titre (« ce qui fait fonctionner un bâtiment ») sans le
 * concurrencer. Voir FigureBackdrop pour la discipline appliquée.
 */
export function Hero() {
  return (
    <section className={s.hero} aria-labelledby="hero-titre">
      <FigureBackdrop placement="right" size="min(58%, 40rem)">
        <BatimentCoupeIso />
      </FigureBackdrop>
      <div className={s.content}>
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
        <Link href="/contact" className={s.ctaPrimary}>
          Discuter d’un projet
        </Link>
        <Link href="/realisations" className={s.ctaSecondary}>
          Voir nos réalisations
        </Link>
      </div>
      </div>
    </section>
  );
}
