import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ReseauGainesIso } from "@/components/ReseauGainesIso";
import s from "./page.module.css";

/**
 * Méthode — planche 04.
 *
 * INTÉGRITÉ DU CONTENU. Cette page ne raconte aucun projet VRD, ne cite aucun
 * client, aucune certification, aucun chiffre d'entreprise. Les phases
 * partielles et leurs intitulés viennent du modèle de prestations de la SIA
 * (SIA 112, repris par le règlement SIA 108 pour les ingénieurs en
 * installations du bâtiment) : ce sont des faits de la norme, donc publiables.
 * Les livrables décrits sont ceux d'un mandat courant en chauffage,
 * ventilation, climatisation et sanitaire — la prestation type, pas le compte
 * rendu d'une affaire. La page le dit à l'écran, sous le tableau, et y précise
 * que la SIA est citée comme référence normative et NON comme une affiliation
 * de VRD : aucune adhésion (SIA, usic, suissetec) n'est publique.
 *
 * Le seul contenu inventé est le déroulé de coordination BIM : il est encadré,
 * tireté et étiqueté « contenu de démonstration » VISIBLEMENT, pas seulement
 * en commentaire. Idem pour la légende du réseau de gaines, dont les débits et
 * les sections portés sur le dessin sont des valeurs d'exemple.
 *
 * Le seul fait concernant VRD qui apparaisse ici : le BIM figure parmi les
 * spécialités qu'ils affichent, à côté de chauffage/froid, ventilation,
 * sanitaire et énergétique.
 *
 * ILLUSTRATION — écart avec la version précédente. ChaufferieIso porte déjà la
 * planche 06 (Carrières) ; la reprendre ici aurait répété le même dessin dans
 * le dossier. ReseauGainesIso n'était employé que dans /labo, et c'est le sujet
 * exact du texte de cette section : gaines, faux plafonds, hauteur disponible.
 *
 * NUMÉROTATION — écart assumé avec la commande. La demande plaçait l'appel
 * d'offres en 33 et le projet d'exécution en 41 ; le modèle SIA place en 33 la
 * procédure de demande d'autorisation, en 41 l'appel d'offres, et en 51 le
 * projet d'exécution. Décalage d'un cran, corrigé ici : une numérotation SIA
 * fausse sur le site d'un bureau d'ingénieurs se verrait au premier coup d'œil
 * d'un maître d'ouvrage. Les sept phases demandées sont toutes présentes.
 */

export const metadata: Metadata = {
  title: "Méthode",
  description:
    "Les sept phases du mandat d’ingénieur en technique du bâtiment selon le modèle SIA, de l’avant-projet à la mise en service, et le rôle du BIM.",
};

type Phase = { n: string; titre: string; texte: ReactNode; livrable: ReactNode };

/**
 * Les sept phases partielles du mandat, dans l'ordre du dossier.
 * 31 à 33 : étude du projet · 41 : appel d'offres · 51 à 53 : réalisation.
 */
const PHASES: Phase[] = [
  {
    n: "31",
    titre: "Avant-projet",
    texte: (
      <>
        Deux ou trois concepts sont mis en regard&nbsp;: mode de production de
        chaleur, principe de distribution, emprises à réserver. La comparaison
        porte autant sur l’énergie et le coût que sur la place occupée.
      </>
    ),
    livrable: (
      <>
        Schémas de principe, bilan de puissances provisoire, comparatif des
        variantes, estimation des coûts.
      </>
    ),
  },
  {
    n: "32",
    titre: "Projet de l’ouvrage",
    texte: (
      <>
        La variante retenue est calculée&nbsp;: puissances, débits, régimes de
        température, sections de réseau, emplacement et dimension des locaux
        techniques. C’est la phase où le projet cesse d’être réversible sans
        coût.
      </>
    ),
    livrable: (
      <>
        Plans d’ensemble, notes de calcul, descriptif technique, devis
        estimatif.
      </>
    ),
  },
  {
    n: "33",
    titre: "Procédure de demande d’autorisation",
    texte: (
      <>
        Les pièces techniques exigées par la commune et le canton sont réunies,
        puis mises en cohérence avec le dossier de l’architecte&nbsp;: ce sont
        les mêmes surfaces et les mêmes volumes qui doivent y figurer.
      </>
    ),
    livrable: (
      <>
        Justificatif énergétique cantonal, pièces relatives à la protection
        incendie, formulaires et plans annexés à la demande.
      </>
    ),
  },
  {
    n: "41",
    titre: "Appel d’offres",
    texte: (
      <>
        Les travaux sont décrits poste par poste pour que les offres soient
        comparables entre elles, puis dépouillées sur une seule et même grille.
        La phase couvre aussi la comparaison des offres et la proposition
        d’adjudication.
      </>
    ),
    livrable: (
      <>
        Descriptif par articles, tableau comparatif des offres, proposition
        d’adjudication.
      </>
    ),
  },
  {
    n: "51",
    titre: "Projet d’exécution",
    texte: (
      <>
        Le projet devient exécutable&nbsp;: tracés définitifs, réservations
        transmises au gros œuvre avant coulage, régulation décrite point par
        point.
      </>
    ),
    livrable: (
      <>
        Plans d’exécution, schémas de principe et de régulation, liste des
        réservations, liste des appareils.
      </>
    ),
  },
  {
    n: "52",
    titre: "Exécution de l’ouvrage",
    texte: (
      <>
        Le chantier est suivi sur place&nbsp;: contrôle de conformité au projet,
        réponses aux questions d’exécution, tenue des délais et du budget.
      </>
    ),
    livrable: (
      <>
        Rapports de visite, procès-verbaux des séances techniques, suivi des
        coûts et des modifications.
      </>
    ),
  },
  {
    n: "53",
    titre: "Mise en service, achèvement",
    texte: (
      <>
        Les installations sont réglées, mesurées, puis remises à l’exploitant
        avec de quoi les conduire&nbsp;; les défauts constatés sont listés,
        suivis et levés.
      </>
    ),
    livrable: (
      <>
        Mesures de réception (débits, températures), instruction de
        l’exploitant, dossier de révision, liste des défauts.
      </>
    ),
  },
];

export default function MethodePage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        planche="Planche 04 · Méthode"
        title="Sept phases, un seul dossier."
        lede="Un mandat d’ingénieur en technique du bâtiment se découpe en phases numérotées par la SIA. Voici ce que chacune produit, et pourquoi l’ordre tient."
      />

      {/* --- Les phases SIA : le tableau de la planche --------------------- */}
      <section className={s.section} aria-labelledby="phases-titre">
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>
            Modèle de prestations SIA&nbsp;112 · règlement SIA&nbsp;108
          </p>
          <h2 id="phases-titre" className={s.title}>
            Les phases SIA
          </h2>
          <p className={s.intro}>
            Les numéros ci-dessous ne sont pas une invention maison&nbsp;: ce
            sont ceux du modèle de prestations de la SIA, communs à tous les
            mandataires d’un projet. Les phases partielles 31 à 33 forment
            l’étude du projet, la phase 41 l’appel d’offres, les phases 51 à 53
            la réalisation. En amont viennent la définition des objectifs et les
            études préliminaires&nbsp;; en aval, l’exploitation.
          </p>

          <ol className={s.phases}>
            {PHASES.map((p) => (
              <li className={s.phase} key={p.n}>
                <p className={s.num}>{p.n}</p>
                <div>
                  <h3 className={s.phaseTitle}>{p.titre}</h3>
                  <p className={s.phaseText}>{p.texte}</p>
                  <p className={s.deliv}>
                    <span className={`label ${s.delivLabel}`}>Livrable</span>
                    {p.livrable}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className={s.source}>
            Source&nbsp;: modèle de prestations SIA&nbsp;112 et règlement
            SIA&nbsp;108, qui fixe les prestations et honoraires des ingénieurs
            en installations du bâtiment. Les intitulés reprennent ceux de la
            norme&nbsp;; les livrables décrits sont ceux d’un mandat courant en
            chauffage, ventilation, climatisation et sanitaire, non le récit
            d’un projet particulier. Cette page présente le cadre normalisé du
            métier et non un déroulé validé avec VRD&nbsp;; la SIA y est citée
            comme référence normative, pas comme une affiliation.
          </p>
        </div>
      </section>

      {/* --- BIM et coordination : section technique, encre inversée -------- */}
      <section className={`technique ${s.tech}`} aria-labelledby="bim-titre">
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>
            Coordination · maquette numérique
          </p>
          <h2 id="bim-titre" className={s.title}>
            Le BIM, c’est la coordination faite avant le chantier
          </h2>

          <div className={s.prose}>
            <p>
              Le BIM figure parmi les spécialités affichées par VRD, aux côtés
              du chauffage et du froid, de la ventilation, du sanitaire et de
              l’énergétique.
            </p>
            <p>
              Une maquette numérique n’est pas un plan en trois
              dimensions&nbsp;: c’est un modèle où chaque gaine, chaque conduite
              et chaque appareil occupe un volume et porte ses caractéristiques.
              Superposées, les maquettes des mandataires font apparaître les
              conflits — une gaine qui traverse une poutre, un collecteur qui
              empêche d’ouvrir la porte d’une chaufferie — pendant qu’ils ne
              coûtent encore qu’un déplacement à l’écran.
            </p>
            <p>
              La coordination se joue toujours aux mêmes endroits&nbsp;: locaux
              techniques, faux plafonds de couloir, gaines montantes. C’est là
              que les corps de métier se disputent les mêmes centimètres, et
              c’est là qu’un arbitrage pris tôt évite un percement, un retard et
              une plus-value.
            </p>
          </div>

          <figure className={s.figure}>
            <ReseauGainesIso />
            <figcaption className={s.figCaption}>
              Réseau de ventilation en axonométrie&nbsp;: caisson de traitement
              d’air, gaine principale de section 600&nbsp;×&nbsp;300&nbsp;mm
              traitée en volume, trois piquages coudés vers leurs
              bouches&nbsp;; la reprise revient en tireté. Un réseau de ce type
              est exactement ce que la coordination doit faire tenir dans la
              hauteur disponible. Illustration — contenu de démonstration&nbsp;:
              les débits et les sections portés sur le dessin sont des valeurs
              d’exemple et ne représentent aucun projet VRD.
            </figcaption>
          </figure>

          {/* Contenu inventé : encadré, tireté, étiqueté à l'écran. */}
          <div className={s.demo}>
            <p className={`label ${s.demoHead}`}>
              Déroulé type d’une coordination
              <span className={s.flag}>contenu de démonstration</span>
            </p>
            <p className={s.demoNote}>
              Le rythme ci-dessous illustre une pratique courante du métier. Il
              n’a pas été validé avec VRD et ne décrit pas leur organisation
              réelle&nbsp;: à remplacer par la leur avant publication.
            </p>
            <ol className={s.demoList}>
              <li>Chaque discipline dépose sa maquette à date fixe.</li>
              <li>
                Les maquettes sont superposées et les conflits relevés
                automatiquement.
              </li>
              <li>
                Une revue passe en séance les seuls conflits qui demandent un
                arbitrage.
              </li>
              <li>
                Chaque conflit est attribué, corrigé, puis vérifié au dépôt
                suivant.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
