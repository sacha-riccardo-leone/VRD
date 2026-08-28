import { ThermalField } from "@/components/ThermalField";
import { SchematicLoop } from "@/components/SchematicLoop";
import s from "./page.module.css";

/**
 * Page de revue INTERNE (comme /tokens) — hors du groupe (site), donc sans
 * chrome. Sert à valider le prototype de champ thermique réactif avant de
 * décider où il vit. À retirer avant livraison. `noindex` global + robots
 * Disallow s'appliquent déjà.
 */
export const metadata = {
  title: "Labo — champ thermique",
};

export default function Labo() {
  return (
    <main id="contenu">
      <section className={`technique ${s.section}`} aria-labelledby="champ-titre">
        <ThermalField />
        <div className={s.content}>
          <p className="label">Prototype · section technique</p>
          <h1 id="champ-titre" className={s.title}>
            Champ thermique
          </h1>
          <p className={s.caption}>
            Isothermes 18–24&nbsp;°C. Déplacez le curseur : la source de chaleur
            le suit avec inertie, l’isotherme la plus proche passe en trait plein
            avec sa valeur. Schéma d’illustration — contenu de démonstration.
          </p>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="schema-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · schéma de principe</p>
          <h2 id="schema-titre" className={s.title}>
            Boucle de chauffage
          </h2>
          <p className={s.caption}>
            Le dessin s’assemble à l’arrivée dans le cadre : le départ se trace,
            le retour et les symboles suivent. Trait plein = départ, tireté =
            retour. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <SchematicLoop />
          </div>
        </div>
      </section>
    </main>
  );
}
