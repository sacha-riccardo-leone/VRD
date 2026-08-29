import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FigureBackdrop } from "@/components/FigureBackdrop";
import { BatimentCoupeIso } from "@/components/BatimentCoupeIso";
import s from "./page.module.css";

/**
 * Planche 03 — Réalisations. La page la plus sensible du dossier.
 *
 * INTÉGRITÉ DU CONTENU — décision arrêtée, à ne pas contourner :
 *  - VRD ingénieurs-conseils SA ne publie AUCUNE référence de projet
 *    vérifiable. Aucun nom de client, aucun lieu de chantier, aucune date de
 *    mise en service n’est accessible sur une source primaire.
 *  - Le rôle du bureau sur le centre commercial de Rennaz, vu en source
 *    secondaire, n’est pas confirmé : il ne figure donc nulle part ici.
 *  - « +200 projets réalisés » est un chiffre PUBLIÉ PAR VRD ; il est cité
 *    comme tel, avec sa source, partout où il apparaît — jamais comme un fait
 *    que nous aurions établi.
 *
 * Les dix lignes de l’index sont donc du contenu REPRÉSENTATIF, écrit pour
 * montrer la structure : intitulés génériques, maîtres d’ouvrage anonymes,
 * districts et non adresses. Chaque ligne porte sa marque « démonstration » à
 * l’écran — pas seulement dans ce commentaire — et un avertissement inversé
 * ouvre la page. Le jour où VRD transmet ses références, on remplace le
 * tableau `LIGNES_DEMO` et on supprime la section d’avertissement : la
 * structure, elle, ne bouge pas. C’est tout l’objet de cette planche.
 *
 * TYPOGRAPHIE — convention du projet : les espaces insécables du français sont
 * posées en entités `&nbsp;` dans le TEXTE JSX, et en échappement ` `
 * dans les chaînes JavaScript, qui sont rendues par interpolation et où une
 * entité s’afficherait telle quelle. Jamais de caractère U+00A0 littéral :
 * invisible en relecture, il se perd au premier copier-coller.
 */

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Index des réalisations de VRD ingénieurs-conseils SA — structure prête pour les vraies références, lignes affichées à titre de démonstration.",
};

type Ligne = {
  id: string;
  projet: string;
  ouvrage: string;
  lieu: string;
  annee: string;
  techniques: string;
};

/* Contenu de démonstration. Volontairement générique et neutre : aucun nom
   d’entreprise, aucune commune précise, aucun ouvrage identifiable. Les lieux
   sont des districts, les maîtres d’ouvrage des catégories. */
const LIGNES_DEMO: readonly Ligne[] = [
  {
    id: "dem-01",
    projet: "Immeuble de logements, 24 appartements",
    ouvrage: "Maître d’ouvrage privé",
    lieu: "Broye (FR)",
    annee: "2024",
    techniques: "CVCS",
  },
  {
    id: "dem-02",
    projet: "École primaire, rénovation",
    ouvrage: "Commune",
    lieu: "Lac (FR)",
    annee: "2023",
    techniques: "Chauffage · ventilation",
  },
  {
    id: "dem-03",
    projet: "Halle industrielle, construction neuve",
    ouvrage: "Maître d’ouvrage privé",
    lieu: "Seeland (BE)",
    annee: "2023",
    techniques: "Ventilation · sanitaire",
  },
  {
    id: "dem-04",
    projet: "Établissement médico-social, extension",
    ouvrage: "Fondation",
    lieu: "Sarine (FR)",
    annee: "2022",
    techniques: "CVCS · énergétique",
  },
  {
    id: "dem-05",
    projet: "Bâtiment administratif, trois niveaux",
    ouvrage: "Maître d’ouvrage institutionnel",
    lieu: "Broye-Vully (VD)",
    annee: "2024",
    techniques: "CVC · BIM",
  },
  {
    id: "dem-06",
    projet: "Deux villas mitoyennes",
    ouvrage: "Maîtres d’ouvrage privés",
    lieu: "Lac (FR)",
    annee: "2021",
    techniques: "Chauffage · sanitaire",
  },
  {
    id: "dem-07",
    projet: "Centre sportif, remplacement de la production de chaleur",
    ouvrage: "Commune",
    lieu: "Singine (FR)",
    annee: "2025",
    techniques: "Chauffage · énergétique",
  },
  {
    id: "dem-08",
    projet: "Immeuble mixte, logements et surfaces commerciales",
    ouvrage: "Maître d’ouvrage privé",
    lieu: "Jura-Nord vaudois (VD)",
    annee: "2023",
    techniques: "CVCS · BIM",
  },
  {
    id: "dem-09",
    projet: "Atelier et bureaux, transformation",
    ouvrage: "Maître d’ouvrage privé",
    lieu: "Gruyère (FR)",
    annee: "2022",
    techniques: "Ventilation · froid",
  },
  {
    id: "dem-10",
    projet: "Crèche, aménagement intérieur",
    ouvrage: "Commune",
    lieu: "Seeland (BE)",
    annee: "2025",
    techniques: "CVC",
  },
];

/* Séparateur de l’index. Espace insécable AVANT le tiret : la ligne ne se
   coupe jamais juste devant lui. Masqué au-dessus de 64rem, où l’alignement
   en colonnes remplace la ponctuation. */
const SEP = " — ";

type Champ = { terme: string; texte: string };

const CHAMPS: readonly Champ[] = [
  {
    terme: "Intitulé",
    texte:
      "Nature et taille de l’ouvrage : « immeuble de 24 logements », « école, rénovation complète ».",
  },
  {
    terme: "Maître d’ouvrage",
    texte:
      "Nom exact, publié uniquement avec son accord écrit de citation. Sans accord, la ligne reste anonyme.",
  },
  {
    terme: "Lieu",
    texte: "Commune et canton, tels qu’ils figurent au permis de construire.",
  },
  {
    terme: "Année",
    texte:
      "Année de mise en service, ou phase en cours lorsque le chantier est ouvert.",
  },
  {
    terme: "Prestations",
    texte:
      "Techniques traitées et phases couvertes, de l’étude préliminaire à la mise en service.",
  },
  {
    terme: "Repères techniques",
    texte:
      "Surface chauffée, puissance installée, débit d’air — au format 1 250 m², 180 kW, 4 500 m³/h, quand ces chiffres sont connus et communicables.",
  },
];

const A_FOURNIR: readonly string[] = [
  "La liste des projets que VRD accepte de citer publiquement.",
  "Pour chacun : intitulé, maître d’ouvrage, commune, année, prestations.",
  "L’accord de citation du maître d’ouvrage, même bref, par écrit.",
  "Les chiffres communicables : surface, puissance installée, débits.",
  "Les photographies ou plans dont le bureau détient les droits.",
];

export default function RealisationsPage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        planche="Planche 03 · Réalisations"
        title="L’index des projets du bureau."
        lede="La structure est prête, le contenu ne l’est pas encore. Les lignes affichées ci-dessous sont des exemples de démonstration, pas des mandats réels."
      />

      {/* --- Avertissement : surface inversée, impossible à manquer --------- */}
      <section
        className={`technique ${s.avertissement}`}
        aria-labelledby="avertissement-titre"
      >
        <div className={s.avertissementInner}>
          <p className={`label ${s.marqueLigne}`}>
            Avertissement{" "}
            <span className={s.marque}>contenu de démonstration</span>
          </p>

          <h2 id="avertissement-titre" className={s.titreFort}>
            Aucune des réalisations listées ci-dessous n’est réelle.
          </h2>

          <p className={s.avertissementTexte}>
            VRD annonce plus de 200 projets réalisés — c’est le chiffre publié
            par le bureau — mais aucun n’est documenté à ce jour sur une source
            publique. Faute de références vérifiables, les dix lignes qui
            suivent ont été écrites pour montrer la forme de l’index, et rien
            d’autre&nbsp;: intitulés génériques, maîtres d’ouvrage anonymes,
            districts plutôt que communes. Aucun projet, aucun client, aucun
            lieu, aucune date ne correspond à un mandat existant.
          </p>

          <p className={s.avertissementTexte}>
            Les références authentiques sont à fournir par VRD. Elles
            remplaceront cet index ligne pour ligne, sans changer la mise en
            page&nbsp;: c’est précisément ce que cette planche sert à démontrer.
          </p>
        </div>
      </section>

      {/* --- L’index ------------------------------------------------------- */}
      <section className={s.section} aria-labelledby="index-titre">
        <p className="label">Index · 10 lignes</p>
        <h2 id="index-titre" className={s.titre}>
          Projet, maître d’ouvrage, lieu, année, techniques.
        </h2>
        <p className={s.intro}>
          Une réalisation tient en une ligne. C’est le format d’un cartouche de
          planche&nbsp;: cinq champs, toujours les mêmes, lisibles d’un coup
          d’œil et triables le jour où la liste s’allonge.
        </p>

        <div className={s.indexWrap}>
          <div className={`${s.ligne} ${s.entete}`}>
            {/* Colonne de la marque de démonstration : sans en-tête. */}
            <span aria-hidden="true" />
            <span className="label">Projet</span>
            <span className="label">Maître d’ouvrage</span>
            <span className="label">Lieu</span>
            <span className="label">Année</span>
            <span className="label">Techniques</span>
          </div>

          <ol className={s.index}>
            {LIGNES_DEMO.map((l) => (
              <li className={`${s.ligne} ${s.rang}`} key={l.id}>
                <span className={s.marqueRang}>démonstration</span>
                <span className={`${s.cellule} ${s.cellulePrincipale}`}>
                  {l.projet}
                </span>
                <span className={s.separateur}>{SEP}</span>
                <span className={s.cellule}>{l.ouvrage}</span>
                <span className={s.separateur}>{SEP}</span>
                <span className={s.cellule}>{l.lieu}</span>
                <span className={s.separateur}>{SEP}</span>
                <span className={`${s.cellule} ${s.celluleAnnee}`}>
                  {l.annee}
                </span>
                <span className={s.separateur}>{SEP}</span>
                <span className={s.cellule}>{l.techniques}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className={s.noteIndex}>
          Dix lignes, dix exemples. Aucun de ces projets n’existe&nbsp;; aucune
          de ces dates n’engage le bureau.
        </p>
      </section>

      {/* --- Le gabarit d’une vraie référence ------------------------------ */}
      <section className={s.section} aria-labelledby="champs-titre">
        <p className="label">Gabarit</p>
        <h2 id="champs-titre" className={s.titre}>
          Ce que contiendra chaque référence publiée.
        </h2>
        <p className={s.intro}>
          Six champs, remplis à partir des pièces du mandat. Tant qu’un champ
          n’est pas confirmé par VRD, il reste vide — jamais estimé, jamais
          arrondi vers le haut.
        </p>

        <dl className={s.champs}>
          {CHAMPS.map((c) => (
            <div className={s.champ} key={c.terme}>
              <dt className={`label ${s.champTerme}`}>{c.terme}</dt>
              <dd className={s.champTexte}>{c.texte}</dd>
            </div>
          ))}
        </dl>

        <p className={s.noteIndex}>
          Même règle que pour les qualifications du bureau&nbsp;: ce qui n’est
          pas vérifiable n’est pas publié.
        </p>
      </section>

      {/* --- L’appel : fournir les vraies références ------------------------ */}
      <section className={s.appel} aria-labelledby="appel-titre">
        <FigureBackdrop placement="right" size="min(52%, 34rem)">
          <BatimentCoupeIso />
        </FigureBackdrop>

        <div className={s.appelInner}>
          <p className={`label ${s.marqueLigne}`}>
            Note de production{" "}
            <span className={s.marqueSobre}>à traiter avec VRD</span>
          </p>

          <h2 id="appel-titre" className={s.titre}>
            Cette page attend les vraies références.
          </h2>

          <p className={s.intro}>
            Plus de 200 projets réalisés selon le bureau, et pas une ligne
            publiable&nbsp;: le travail existe, la preuve manque. Cinq éléments
            suffisent à transformer chaque exemple de démonstration en référence
            réelle.
          </p>

          <ol className={s.aFournir}>
            {A_FOURNIR.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>

          <p className={s.intro}>
            Dès réception, l’avertissement disparaît et l’index se remplit. Une
            seule référence vérifiée vaut mieux que dix lignes inventées — c’est
            la raison pour laquelle rien n’a été inventé ici.
          </p>

          <div className={s.actions}>
            <a className={s.ctaPrimary} href="mailto:info@vrd-ingenieurs.ch">
              Transmettre une référence par e-mail
            </a>
            <Link className={s.ctaSecondary} href="/contact">
              Parler d’un projet
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
