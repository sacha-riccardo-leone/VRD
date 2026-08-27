import { Hero } from "@/components/Hero";
import s from "./page.module.css";

/**
 * Accueil — planche 01. Livré par incréments : pour l'instant le cartouche
 * (bloc-titre) + la Hero. Les sections 2 à 9 arrivent à leur tour, une revue
 * par section.
 *
 * Pas de metadata locale : le titre par défaut du layout racine
 * (« VRD ingénieurs-conseils SA ») convient pour l'accueil.
 */
export default function Home() {
  return (
    <main id="contenu" className={s.page}>
      {/* Cartouche : le bloc-titre de la planche, en mono. */}
      <div className={s.sheet}>
        <p className="label">Planche 01 · Accueil</p>
        <p className="label">VRD · Sugiez (FR)</p>
      </div>

      <Hero />
    </main>
  );
}
