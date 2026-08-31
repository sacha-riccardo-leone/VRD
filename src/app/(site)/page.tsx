import { Hero } from "@/components/Hero";
import { ProofBar } from "@/components/ProofBar";
import { Approche } from "@/components/Approche";

/**
 * Accueil. Contrairement aux pages intérieures, elle ne porte PAS de cartouche
 * de planche : c'est une page d'atterrissage, elle s'annonce au lieu de se
 * situer dans le dossier. Le hero occupe l'écran, en anthracite.
 *
 * Pas de metadata locale : le titre par défaut du layout racine convient.
 */
export default function Home() {
  return (
    <main id="contenu">
      <Hero />
      <ProofBar />
      <Approche />
    </main>
  );
}
