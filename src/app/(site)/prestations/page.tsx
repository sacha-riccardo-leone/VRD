import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OctagonNav } from "@/components/OctagonNav";
import s from "./page.module.css";

/**
 * Planche 02 — Prestations. Les cinq techniques affichées par VRD, détaillées.
 *
 * Intégrité du contenu. Trois choses seulement sont vérifiées ici — le but
 * inscrit au registre du commerce (ingénierie-conseil en chauffage,
 * ventilation, climatisation, sanitaire et énergies renouvelables), les cinq
 * spécialités que le bureau affiche, et ses coordonnées. Le DÉTAIL de chaque
 * technique décrit une mission d’ingénierie-conseil type. C’est du contenu
 * REPRÉSENTATIF, étiqueté comme tel à l’écran — note de relecture en tête de
 * page, marqueur « contenu représentatif » dans le cartouche de chaque
 * technique, marqueur « à valider » sur chaque liste de prestations, mention
 * sur la légende du schéma. Rien n’est marqué en commentaire seulement.
 *
 * Ce qui n’apparaît pas, faute de source primaire — aucun projet, aucun
 * client, aucune référence, aucune certification (celles que l’on voit passer
 * sur les réseaux ne sont confirmées nulle part), aucun effectif affecté à une
 * technique.
 *
 * Les normes citées (SIA 382/1, directive W3 de la SSIGE) sont des références
 * de métier publiques, pas une adhésion ni une qualification revendiquée par
 * VRD. Elles décrivent l’état de l’art, et elles tombent sous le marqueur de
 * contenu représentatif comme le reste du détail.
 *
 * Une seule illustration sur la page — la boucle de chauffage, dans la section
 * qu’elle documente. Pas de motif en fond : la page est déjà longue, et un
 * substrat derrière cinq blocs de texte serait de la décoration sans fonction.
 */
export const metadata: Metadata = {
  title: "Prestations",
  description:
    "Chauffage et froid, ventilation, sanitaire, énergétique et BIM — les cinq techniques du bureau, de l’étude et du dimensionnement à la mise en service.",
};

export default function PrestationsPage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        planche="Planche 02 · Prestations"
        title="Cinq techniques, du concept à la mise en service."
        lede="Chauffage et froid, ventilation, sanitaire, énergétique, BIM. Voici ce que chacune recouvre dans une mission d’ingénierie-conseil, et à quel moment elle intervient."
      />

      <section className={`technique ${s.octogone}`} aria-labelledby="octogone-titre">
        <h2 id="octogone-titre" className="visuallyHidden">
          Nos huit techniques
        </h2>
        <OctagonNav />
      </section>



      {/* --- 01 · Chauffage & froid ------------------------------------- */}
      <section
        id="chauffage"
        className={s.tech}
        aria-labelledby="chauffage-titre"
      >
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;01&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="chauffage-titre" className={s.techTitle}>
              Chauffage
            </h2>
            <p className={s.claim}>
              Production, distribution, émission&nbsp;: des installations
              dimensionnées au plus juste.
            </p>
          </div>

          <div className={s.techBody}>
            <p>
              Le dimensionnement part des besoins réels&nbsp;: déperditions
              calculées pièce par pièce, puis choix de la production — pompe à
              chaleur, chaudière, raccordement à un réseau de chaleur — et de la
              température de départ qui va avec. Les réseaux suivent&nbsp;:
              diamètres, pertes de charge, hauteur manométrique des
              circulateurs, équilibrage des colonnes et des boucles.
            </p>
            <p>
              Le bureau établit les schémas de principe et les plans, rédige les
              descriptifs d’appel d’offres, compare les soumissions, puis suit
              l’exécution jusqu’à la mise en service et à la remise des documents
              de révision.
            </p>

            <p className={`label ${s.listLabel}`}>
              Prestations <span className={s.flag}>à valider</span>
            </p>
            <ul className={s.list}>
              <li>Calcul des déperditions et des puissances, local par local</li>
              <li>
                Production&nbsp;: pompe à chaleur, chaudière, réseau de chaleur
              </li>
              <li>
                Distribution, équilibrage hydraulique, choix des circulateurs
              </li>
              <li>
                Émission&nbsp;: radiateurs, chauffage de sol, plafonds actifs
              </li>
              <li>Schémas de principe, plans et descriptifs d’appel d’offres</li>
              <li>Suivi d’exécution, mise en service, documents de révision</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- 02 · Ventilation ------------------------------------------- */}
      <section
        id="ventilation"
        className={s.tech}
        aria-labelledby="ventilation-titre"
      >
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;02&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="ventilation-titre" className={s.techTitle}>
              Ventilation
            </h2>
            <p className={s.claim}>
              Air neuf, confort et hygiène, sans surconsommation.
            </p>
          </div>

          <div className={s.techBody}>
            <p>
              Les débits s’établissent local par local à partir de l’usage —
              occupation, apports internes, charges d’humidité — puis se
              confrontent aux exigences de la norme SIA&nbsp;382/1. Viennent
              ensuite le dimensionnement des centrales double flux, des réseaux
              de gaines et des bouches, en tenant la vitesse d’air et le niveau
              sonore là où ils s’entendent&nbsp;: chambres, salles de classe,
              bureaux.
            </p>
            <p>
              La récupération de chaleur, la régulation et les plages horaires
              se règlent pour que l’installation ne tourne pas quand personne
              n’est là&nbsp;; un débit surdimensionné se paie sur toute la durée
              de vie du bâtiment. En chantier, les réseaux se contrôlent avant
              la fermeture des faux plafonds, avant l’assistance à l’équilibrage
              et aux mesures de débit à la réception.
            </p>

            <p className={`label ${s.listLabel}`}>
              Prestations <span className={s.flag}>à valider</span>
            </p>
            <ul className={s.list}>
              <li>Bilans de débits et concept de ventilation par zone</li>
              <li>
                Centrales double flux, récupération de chaleur, traitement d’air
              </li>
              <li>Réseaux de gaines, bouches, acoustique et vitesses d’air</li>
              <li>
                Désenfumage et mises en surpression, avec le concept incendie
              </li>
              <li>Descriptifs, comparatifs de soumissions, adjudication</li>
              <li>Équilibrage, mesures de débit, mise en service</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="froid" className={s.tech} aria-labelledby="froid-titre">
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;03&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="froid-titre" className={s.techTitle}>
              Froid
            </h2>
            
          </div>

          <div className={s.techBody}>
            <p>
              Le froid obéit à la même logique, avec ses charges d’été et sa
              gestion de la condensation.
            </p>
            <p className={s.todo}>
              <strong>Contenu à fournir.</strong> Le site actuel ne décrit le
              froid que par cette phrase, à l’intérieur du chapitre chauffage.
              Un descriptif propre reste à rédiger avec VRD.
            </p>
          </div>
        </div>
      </section>


      {/* --- 03 · Sanitaire --------------------------------------------- */}
      <section
        id="sanitaire"
        className={s.tech}
        aria-labelledby="sanitaire-titre"
      >
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;04&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="sanitaire-titre" className={s.techTitle}>
              Sanitaire
            </h2>
            <p className={s.claim}>Eau, évacuation et protection incendie.</p>
          </div>

          <div className={s.techBody}>
            <p>
              Eau froide, eau chaude et bouclage se dimensionnent au débit
              probable selon la directive W3 de la SSIGE, avec les vitesses et
              les volumes que l’hygiène impose&nbsp;: la légionelle se traite au
              dimensionnement et à la température, pas après coup. La production
              d’eau chaude s’étudie avec le chauffage — pompe à chaleur,
              appoint, accumulation, rendement du bouclage.
            </p>
            <p>
              Les évacuations, les colonnes de chute et la ventilation primaire
              se calent tôt avec la structure, parce qu’une chute déplacée en
              cours d’exécution coûte cher. Les besoins de défense incendie —
              postes incendie, colonnes — se reprennent du concept de protection
              incendie du projet, puis se coordonnent avec les réseaux d’eau,
              les percements et les gaines techniques.
            </p>

            <p className={`label ${s.listLabel}`}>
              Prestations <span className={s.flag}>à valider</span>
            </p>
            <ul className={s.list}>
              <li>
                Dimensionnement eau froide, eau chaude et bouclage au débit
                probable
              </li>
              <li>
                Production et accumulation d’eau chaude, prévention de la
                légionelle
              </li>
              <li>
                Évacuations, colonnes de chute, ventilation primaire, eaux
                pluviales
              </li>
              <li>Appareils sanitaires, robinetterie, points de puisage</li>
              <li>Défense incendie&nbsp;: postes et colonnes, selon concept</li>
              <li>Percements et réservations, coordonnés avec la structure</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="sprinkler" className={s.tech} aria-labelledby="sprinkler-titre">
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;05&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="sprinkler-titre" className={s.techTitle}>
              Sprinkler
            </h2>
            
          </div>

          <div className={s.techBody}>
            <p className={s.todo}>
              <strong>Contenu à fournir.</strong> Ce domaine figure parmi les huit
              du portfolio de VRD, mais aucun descriptif n’existe à ce jour — ni
              sur le site actuel, ni dans le portfolio. À rédiger avec le bureau.
            </p>
          </div>
        </div>
      </section>


      {/* --- 04 · Énergétique ------------------------------------------- */}

      {/* --- 05 · BIM & coordination ------------------------------------ */}
      <section id="bim" className={s.tech} aria-labelledby="bim-titre">
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;06&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="bim-titre" className={s.techTitle}>
              BIM &amp; coordination
            </h2>
            <p className={s.claim}>
              Une maquette unique, tous les corps d’état alignés.
            </p>
          </div>

          <div className={s.techBody}>
            <p>
              Chauffage, ventilation et sanitaire se modélisent dans une
              maquette exportée en IFC, avec des rôles, des échanges et un
              niveau de détail fixés au démarrage plutôt que subis en cours de
              route. La coordination se fait sur la maquette fédérée&nbsp;: les
              collisions sont détectées, arbitrées en séance, puis corrigées
              avant que quiconque ne perce une dalle.
            </p>
            <p>
              Réservations, gaines techniques et hauteurs de faux plafond
              sortent du même modèle que les plans&nbsp;: une seule référence,
              donc pas d’écart entre les documents. Les quantités extraites de
              la maquette alimentent les descriptifs d’appel d’offres et le
              suivi des coûts.
            </p>

            <p className={`label ${s.listLabel}`}>
              Prestations <span className={s.flag}>à valider</span>
            </p>
            <ul className={s.list}>
              <li>Modélisation des réseaux CVCS et export IFC</li>
              <li>
                Rôles, échanges et niveaux de détail définis par phase de projet
              </li>
              <li>
                Maquette fédérée&nbsp;: détection et arbitrage des collisions
              </li>
              <li>
                Réservations coordonnées avec la structure et l’architecture
              </li>
              <li>Extraction de quantités pour les appels d’offres</li>
              <li>Plans issus du modèle, sans écart entre les documents</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="mcr" className={s.tech} aria-labelledby="mcr-titre">
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;07&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="mcr-titre" className={s.techTitle}>
              MCR
            </h2>
            
          </div>

          <div className={s.techBody}>
            <p className={s.todo}>
              <strong>Contenu à fournir.</strong> Ce domaine figure parmi les huit
              du portfolio de VRD, mais aucun descriptif n’existe à ce jour — ni
              sur le site actuel, ni dans le portfolio. À rédiger avec le bureau.
            </p>
          </div>
        </div>
      </section>
      <section
        id="energetique"
        className={s.tech}
        aria-labelledby="energetique-titre"
      >
        <div className={s.techInner}>
          <div className={s.techHead}>
            <p className={`label ${s.techLabel}`}>
              Technique&nbsp;08&nbsp;/&nbsp;08{" "}
              <span className={s.flag}>contenu représentatif</span>
            </p>
            <h2 id="energetique-titre" className={s.techTitle}>
              Énergétique
            </h2>
            <p className={s.claim}>
              Concevoir sobre&nbsp;: bilans, variantes et énergies
              renouvelables.
            </p>
          </div>

          <div className={s.techBody}>
            <p>
              Avant tout dimensionnement vient le bilan&nbsp;: besoins de
              chaleur et de froid, eau chaude sanitaire, électricité des
              installations techniques. Les variantes de production se comparent
              ensuite sur une même base — investissement, consommation,
              entretien, émissions — pour que le maître d’ouvrage arbitre sur
              des chiffres.
            </p>
            <p>
              Pompe à chaleur sur sondes ou air-eau, bois, raccordement à un
              réseau de chaleur, solaire thermique, photovoltaïque&nbsp;: le
              choix se fait en avant-projet, au moment où une décision coûte
              encore peu et change encore tout. Les exigences énergétiques
              cantonales cadrent l’exercice, et le travail ne s’arrête pas à la
              réception&nbsp;: relevés et corrections de réglage sur la première
              saison de chauffe.
            </p>

            <p className={`label ${s.listLabel}`}>
              Prestations <span className={s.flag}>à valider</span>
            </p>
            <ul className={s.list}>
              <li>
                Bilan des besoins&nbsp;: chaleur, froid, eau chaude, électricité
                technique
              </li>
              <li>
                Comparatif de variantes de production, coûts et émissions à
                l’appui
              </li>
              <li>
                Intégration des renouvelables&nbsp;: pompe à chaleur, solaire,
                photovoltaïque
              </li>
              <li>Vérification des exigences énergétiques cantonales</li>
              <li>Récupération de chaleur et sobriété d’exploitation</li>
              <li>Suivi des consommations sur la première saison de chauffe</li>
            </ul>
          </div>
        </div>
      </section>


      {/* --- Appel à l’action : inversion encre/papier ------------------- */}
      <section className={`technique ${s.cta}`} aria-labelledby="cta-titre">
        <div className={s.ctaInner}>
          <p className="label">Suite</p>
          <h2 id="cta-titre" className={s.ctaTitle}>
            Un projet à cadrer&nbsp;?
          </h2>
          <p className={s.ctaText}>
            Dites-nous le type de bâtiment, la phase en cours et l’échéance.
            Nous vous répondrons sur ce que la technique demande, quand elle
            doit intervenir et ce que nous pouvons prendre en charge.
          </p>
          <div className={s.actions}>
            <Link href="/contact" className={s.ctaPrimary}>
              Discuter d’un projet
            </Link>
            <a
              href="tel:+41265520100"
              className={s.ctaSecondary}
              aria-label="Appeler VRD au 026 552 01 00"
            >
              026&nbsp;552&nbsp;01&nbsp;00
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
