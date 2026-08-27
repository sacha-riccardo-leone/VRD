import Link from "next/link";
import s from "./page.module.css";

/**
 * Étape 1 — placeholder. Prouve la chaîne build → déploiement.
 * Volontairement nu : rien ici n’est une proposition de design.
 * Remplacé intégralement à l’étape 3.
 */
export default function Home() {
  return (
    <main id="contenu" className={s.main}>
      <p className="label">Étape 1 · chaîne de déploiement</p>
      <h1>VRD ingénieurs-conseils SA</h1>
      <p className={s.lede}>
        Démonstration non officielle. Le contenu de cette page est un
        emplacement réservé&nbsp;: la maquette réelle commence à l’étape&nbsp;3.
      </p>
      <ul className={s.list}>
        <li>
          <Link href="/tokens">Système de jetons et contrastes mesurés</Link>{" "}
          <span className={s.aside}>— page de revue interne, retirée avant livraison</span>
        </li>
      </ul>
    </main>
  );
}
