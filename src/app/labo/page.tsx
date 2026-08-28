import { ThermalField } from "@/components/ThermalField";
import { SchematicLoop } from "@/components/SchematicLoop";
import { Manifold } from "@/components/Manifold";
import { ExplodedAssembly } from "@/components/ExplodedAssembly";
import { EXPLODED_PARTS } from "@/components/exploded-parts";
import { AirHandlingUnit } from "@/components/AirHandlingUnit";
import { ColonneMontanteSanitaire } from "@/components/ColonneMontanteSanitaire";
import { RampeGaz } from "@/components/RampeGaz";
import { PlanNiveauCote } from "@/components/PlanNiveauCote";
import s from "./page.module.css";

/**
 * Page de revue INTERNE (comme /tokens) — hors du groupe (site), donc sans
 * chrome. Sert à valider les prototypes d'illustration technique avant de
 * décider où ils vivent. À retirer avant livraison. `noindex` global + robots
 * Disallow s'appliquent déjà.
 */
export const metadata = {
  title: "Labo — illustrations techniques",
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

      <section className={s.schema} aria-labelledby="nourrice-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · schéma de principe</p>
          <h2 id="nourrice-titre" className={s.title}>
            Nourrice de distribution
          </h2>
          <p className={s.caption}>
            Quatre circuits, vanne d’isolement et débitmètre chacun. Trait plein =
            départ, tireté = retour. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <Manifold />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="eclate-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · vue éclatée</p>
          <h2 id="eclate-titre" className={s.title}>
            Groupe de pompage
          </h2>
          <p className={s.caption}>
            L’assemblage s’éclate à l’arrivée dans le cadre : chaque pièce rejoint
            sa position, en cascade. Illustration — contenu de démonstration.
          </p>
          <div className={s.explodedGrid}>
            <div className={s.explodedFigure}>
              <ExplodedAssembly />
            </div>
            <ol className={s.legend}>
              {EXPLODED_PARTS.map((p) => (
                <li key={p.n}>
                  <span className={s.legendNum}>{p.n}</span>
                  {p.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="cta-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · ventilation</p>
          <h2 id="cta-titre" className={s.title}>
            Centrale de traitement d’air
          </h2>
          <p className={s.caption}>
            Air neuf, filtration G4 puis F7, batteries froide et chaude,
            soufflage ; reprise en gaine tiretée via récupérateur avant rejet.
            Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <AirHandlingUnit />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="sanitaire-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · sanitaire</p>
          <h2 id="sanitaire-titre" className={s.title}>
            Colonne montante EF / ECS
          </h2>
          <p className={s.caption}>
            Trois niveaux, piquage et robinet d’arrêt par étage, ballon en pied.
            Trait plein = eau froide, tireté = eau chaude. Illustration —
            contenu de démonstration.
          </p>
          <div className={s.schemaFigureNarrow}>
            <ColonneMontanteSanitaire />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="gaz-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · gaz</p>
          <h2 id="gaz-titre" className={s.title}>
            Rampe gaz — bloc sécurité
          </h2>
          <p className={s.caption}>
            Vanne d’arrêt, filtre, détendeur, compteur et double électrovanne de
            sécurité jusqu’au brûleur. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <RampeGaz />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="plan-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · plan</p>
          <h2 id="plan-titre" className={s.title}>
            Plan de niveau coté
          </h2>
          <p className={s.caption}>
            Murs hachurés, débattement de porte, chaînes de cotes, repère de
            niveau et raccordement du radiateur départ/retour. Illustration —
            contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <PlanNiveauCote />
          </div>
        </div>
      </section>
    </main>
  );
}
