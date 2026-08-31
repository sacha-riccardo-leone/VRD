import { ThermalField } from "@/components/ThermalField";
import { SchematicLoop } from "@/components/SchematicLoop";
import { Manifold } from "@/components/Manifold";
import { ExplodedAssembly } from "@/components/ExplodedAssembly";
import { EXPLODED_PARTS } from "@/components/exploded-parts";
import { AirHandlingUnit } from "@/components/AirHandlingUnit";
import { ColonneMontanteSanitaire } from "@/components/ColonneMontanteSanitaire";
import { RampeGaz } from "@/components/RampeGaz";
import { PlanNiveauCote } from "@/components/PlanNiveauCote";
import { ChaufferieIso } from "@/components/ChaufferieIso";
import { CirculateurEclateIso } from "@/components/CirculateurEclateIso";
import { ReseauGainesIso } from "@/components/ReseauGainesIso";
import { BatimentCoupeIso } from "@/components/BatimentCoupeIso";
import { ReseauSprinkler } from "@/components/ReseauSprinkler";
import { BilanEnergetique } from "@/components/BilanEnergetique";
import { FigureBackdrop } from "@/components/FigureBackdrop";
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

      <section className={s.schema} aria-labelledby="batiment-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · axonométrie</p>
          <h2 id="batiment-titre" className={s.title}>
            Coupe axonométrique de bâtiment
          </h2>
          <p className={s.caption}>
            Trois niveaux en écorché : chaufferie en pied, colonne montante départ/retour, piquages d’étage et CTA en toiture. Géométrie 3D réelle, projetée. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <BatimentCoupeIso />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="chaufferie-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · axonométrie</p>
          <h2 id="chaufferie-titre" className={s.title}>
            Chaufferie axonométrique
          </h2>
          <p className={s.caption}>
            Chaudière 150 kW, ballon tampon 1 000 L et collecteur DN 80 sur dalle quadrillée ; départ plein, retour tireté, régime 70/50 °C. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <ChaufferieIso />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="gaines-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · axonométrie</p>
          <h2 id="gaines-titre" className={s.title}>
            Réseau de gaines
          </h2>
          <p className={s.caption}>
            Caisson, gaine principale 600 × 300 traitée en volume et trois piquages coudés vers leurs bouches ; reprise en tireté. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigure}>
            <ReseauGainesIso />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="circulateur-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · axonométrie</p>
          <h2 id="circulateur-titre" className={s.title}>
            Circulateur — vue éclatée
          </h2>
          <p className={s.caption}>
            Sept pièces alignées sur l’axe d’éclatement, arêtes cachées tiretées, axe pointillé, refoulement DN 65 à 12 m³/h. Illustration — contenu de démonstration.
          </p>
          <div className={s.schemaFigureNarrow}>
            <CirculateurEclateIso />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="fond-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · substrat de planche</p>
          <h2 id="fond-titre" className={s.title}>
            Motifs en fond de section
          </h2>
          <p className={s.caption}>
            Les mêmes dessins, posés en fond : épaisseur de filet décoratif, aucune
            étiquette, aucun mouvement, jamais devant le texte. À comparer avec les
            mêmes motifs en figure, plus haut.
          </p>
        </div>
        <div className={s.bdGrid}>
          <div className={s.bdDemo}>
            <FigureBackdrop placement="right" size="min(70%, 34rem)">
              <BatimentCoupeIso />
            </FigureBackdrop>
            <div className={s.bdContent}>
              <p className="label">Coupe de bâtiment</p>
              <p className={s.bdText}>Nous concevons ce qui fait fonctionner un bâtiment : chauffage, ventilation, sanitaire et énergie, de l’étude à la mise en service.</p>
            </div>
          </div>
          <div className={s.bdDemo}>
            <FigureBackdrop placement="left" size="min(72%, 34rem)">
              <ReseauGainesIso />
            </FigureBackdrop>
            <div className={s.bdContent}>
              <p className="label">Réseau de gaines</p>
              <p className={s.bdText}>Dimensionnement aéraulique, tracé des réseaux et coordination des passages avec les autres corps d’état.</p>
            </div>
          </div>
          <div className={s.bdDemo}>
            <FigureBackdrop placement="right" size="min(52%, 22rem)">
              <CirculateurEclateIso />
            </FigureBackdrop>
            <div className={s.bdContent}>
              <p className="label">Circulateur éclaté</p>
              <p className={s.bdText}>Choix des équipements, points de fonctionnement et maintenabilité : ce qui se répare se dessine d’abord.</p>
            </div>
          </div>
          <div className={s.bdDemo}>
            <FigureBackdrop placement="right" size="min(46%, 20rem)">
              <ExplodedAssembly />
            </FigureBackdrop>
            <div className={s.bdContent}>
              <p className="label">Groupe de pompage</p>
              <p className={s.bdText}>Production, distribution et régulation : les organes sont choisis pour le régime réel, pas pour le catalogue.</p>
            </div>
          </div>
          <div className={s.bdDemo}>
            <FigureBackdrop placement="left" size="min(78%, 36rem)">
              <RampeGaz />
            </FigureBackdrop>
            <div className={s.bdContent}>
              <p className="label">Rampe gaz</p>
              <p className={s.bdText}>Alimentation et sécurité gaz : vannes, détente, comptage et double électrovanne jusqu’au brûleur.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="sprinkler-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · protection incendie</p>
          <h2 id="sprinkler-titre" className={s.title}>
            Réseau sprinkler
          </h2>
          <p className={s.caption}>Réservoir, pompe, clapet anti-retour, poste de contrôle sous eau (vanne verrouillée, clapet d’alarme, cloche hydraulique, manomètres), colonne montante, antenne et têtes à déflecteur. Ligne d’essai en tireté vers l’égout. Illustration — contenu de démonstration.</p>
          <div className={s.schemaFigure}>
            <ReseauSprinkler />
          </div>
        </div>
      </section>

      <section className={s.schema} aria-labelledby="bilan-titre">
        <div className={s.schemaInner}>
          <p className="label">Prototype · énergétique</p>
          <h2 id="bilan-titre" className={s.title}>
            Bilan énergétique
          </h2>
          <p className={s.caption}>Apports en trait plein (solaire, pompe à chaleur sur sondes géothermiques), déperditions en tireté par poste (toiture, murs, fenêtres, ventilation, plancher), échelle de performance A–G. Illustration — contenu de démonstration.</p>
          <div className={s.schemaFigure}>
            <BilanEnergetique />
          </div>
        </div>
      </section>
    </main>
  );
}
