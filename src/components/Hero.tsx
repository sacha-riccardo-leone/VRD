import { ThermalField } from "./ThermalField";
import s from "./Hero.module.css";

/**
 * Section 1 — Hero. Page d'atterrissage, pas une page intérieure : plein écran,
 * fond anthracite, tout en blanc, le champ thermique en fond réactif.
 *
 * Le contenu reprend l'identité réelle du bureau, telle qu'elle figure sur leur
 * portfolio : le sigle VRD, « Ingénieurs conseils », et la baseline
 * « techniques et énergétique du bâtiment ».
 *
 * `.technique` bascule toute la section sur la palette sombre — c'est aussi la
 * seule surface où le mouvement est permis, et le champ thermique y vit déjà.
 */
export function Hero() {
  return (
    <section className={`technique ${s.hero}`} aria-labelledby="hero-titre">
      <ThermalField />

      <div className={s.content}>
        <h1 id="hero-titre" className={s.mark}>
          VRD
        </h1>
        <p className={s.sub}>Ingénieurs conseils</p>
      </div>

      <p className={s.baseline}>Techniques et énergétique du bâtiment</p>

      <p className={s.stamp}>S.T. 2021</p>
    </section>
  );
}
