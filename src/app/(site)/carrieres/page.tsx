import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FigureBackdrop } from "@/components/FigureBackdrop";
import { ChaufferieIso } from "@/components/ChaufferieIso";
import s from "./page.module.css";

/**
 * Carrières — planche 06.
 *
 * Ton : celui de leur page actuelle, conservé — tutoiement, « rejoins
 * l’aventure », deux amis ingénieurs HES à l’origine du bureau.
 *
 * Intégrité du contenu — ce qui est FACTUEL (les lignes de provenance qui
 * suivaient chaque raison ont été retirées à la demande du bureau. Où les
 * sources restent visibles : les deux dirigeants et les six personnes sont
 * étiquetés sur /a-propos, fiche par fiche ; l’IDE et l’inscription au
 * registre sont sur /contact ; les neuf domaines et leur origine sur
 * /prestations. Depuis le retrait du cartouche de registre d’À propos
 * (14.09.2026), le but inscrit et la mention « chiffre publié par VRD » de
 * l’effectif ne sont plus affichés nulle part) :
 *  - six collaborateurs (chiffre publié par VRD) ;
 *  - deux dirigeants, Dominique Rodrigues Fonseca et Ruben Varela Facal
 *    (registre du commerce, CHE-287.600.663) ;
 *  - neuf domaines d’activité (organigramme VRD 2026) et le but inscrit au
 *    registre ;
 *  - les trois intitulés de poste et l’adresse de candidature, repris tels
 *    quels de la page Carrières de VRD.
 *
 * Ce qui est REPRÉSENTATIF, et marqué comme tel À L’ÉCRAN par un marqueur
 * « contenu représentatif » placé AVANT chaque bloc concerné — jamais en
 * simple commentaire : le déroulé des phases d’un mandat et les descriptifs
 * de poste. VRD ne publie rien de tout
 * cela ; ces textes sont les nôtres. La note de relecture qui coiffait la
 * page a été retirée à la demande du bureau ; les marqueurs de bloc, eux,
 * restent la garantie que rien ne se lit comme une affirmation de VRD.
 *
 * Aucune offre datée, aucun avantage social, aucun logiciel nommé, aucune
 * certification, aucun client, aucun projet : rien de cela n’est vérifiable,
 * donc rien de cela n’est écrit.
 */
export const metadata: Metadata = {
  title: "Carrières",
  description:
    "Projeteur, technicien ES ou ingénieur HES en techniques du bâtiment : rejoins l’équipe de VRD ingénieurs-conseils à Sugiez. Candidature spontanée bienvenue.",
};

type Raison = {
  num: string;
  titre: string;
  texte: string;
  representatif?: boolean;
};

/* Ces chaînes sont rendues par interpolation : une entité `&nbsp;` s’y
   afficherait telle quelle. L’espace insécable avant « : » est donc écrite
   ` ` — échappée plutôt que littérale, pour rester visible en relecture. */
const RAISONS: Raison[] = [
  {
    num: "01",
    titre: "Une équipe où l’on se parle",
    texte:
      "Six collaborateurs. À la direction, deux amis ingénieurs HES qui sont à l’origine du bureau. Pour poser une question, tu traverses la pièce, pas trois niveaux hiérarchiques. Ce que tu proposes se discute le jour même.",
  },
  {
    num: "02",
    titre: "Neuf domaines, pas un seul",
    texte:
      "Chauffage, ventilation, froid, sanitaire, sprinkler, BIM, MCR, énergétique, sécurité incendie. Le bureau couvre les neuf, donc ton horizon ne se limite pas à un seul lot. C’est plus exigeant qu’une spécialisation, et c’est comme ça qu’on apprend vite.",
  },
  {
    num: "03",
    titre: "Le projet, du concept à la mise en service",
    texte:
      "Tu ne lâches pas le dossier après l’avant-projet : dimensionnement, appel d’offres, suivi d’exécution, mise en service. Voir tourner une installation qu’on a dessinée reste la meilleure école du métier.",
    representatif: true,
  },
];

type Metier = { num: string; intitule: string; texte: string };

/** Intitulés repris mot pour mot de la page Carrières de VRD. */
const METIERS: Metier[] = [
  {
    num: "01",
    intitule: "Projeteur en techniques du bâtiment",
    texte:
      "Tu dessines : schémas de principe, plans d’exécution, coupes, réservations. Tu tiens la cohérence entre les lots et tu vois ton trait se monter sur le chantier.",
  },
  {
    num: "02",
    intitule: "Technicien ES en techniques du bâtiment",
    texte:
      "Tu dimensionnes, tu chiffres, tu prépares les soumissions et tu suis l’exécution. La place charnière entre le dessin et la conduite du projet.",
  },
  {
    num: "03",
    intitule: "Ingénieur HES en techniques du bâtiment",
    texte:
      "Tu portes le concept technique et énergétique, tu discutes d’égal à égal avec l’architecte et le maître d’ouvrage, et tu réponds du projet.",
  },
];

const MAILTO = "mailto:info@vrd-ingenieurs.ch?subject=Candidature%20spontan%C3%A9e";

export default function CarrieresPage() {
  return (
    <main id="contenu">
      <PageHeader
        title="Carrières"
        lede="Rejoins l’aventure."
      />

      {/* --- Pourquoi nous rejoindre -------------------------------------- */}
      <section className={s.section} aria-labelledby="pourquoi-titre">
        <div className={s.inner}>
          <p className="label">Section 01 · Ce que ça implique</p>
          <h2 id="pourquoi-titre" className={s.title}>
            Pourquoi nous rejoindre
          </h2>
          <p className={s.intro}>
            Trois raisons, et ce qu’elles impliquent vraiment&nbsp;: une petite
            structure, ce n’est pas que des avantages.
          </p>

          <ol className={s.raisons}>
            {RAISONS.map((r) => (
              <li className={s.raison} key={r.num}>
                <div className={s.raisonHead}>
                  <p className="label">{r.num}</p>
                  {r.representatif ? (
                    <span className={s.flag}>contenu représentatif</span>
                  ) : null}
                </div>
                <h3 className={s.raisonTitle}>{r.titre}</h3>
                <p className={s.raisonText}>{r.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- Nos métiers : section technique, fond anthracite -------------- */}
      <section
        className={`technique ${s.metiersSection}`}
        aria-labelledby="metiers-titre"
      >
        <FigureBackdrop placement="right" size="min(48%, 32rem)">
          <ChaufferieIso />
        </FigureBackdrop>

        <div className={s.above}>
          <p className="label">Section 02 · Profils</p>
          <h2 id="metiers-titre" className={s.title}>
            Nos métiers
          </h2>
          <p className={s.intro}>
            Trois profils, et une porte ouverte pour qui ne rentre dans aucune
            case.
          </p>

          {/* Le marqueur précède la liste qu’il qualifie : on ne lit pas
              d’abord le contenu pour découvrir sa réserve ensuite. */}
          <p className={s.flagLine}>
            <span className={s.flag}>contenu représentatif</span>
            <span className={s.flagText}>
              Les trois intitulés ci-dessous sont ceux annoncés par VRD. Les
              descriptifs de poste, eux, sont les nôtres&nbsp;: VRD ne publie
              pas de cahier des charges.
            </span>
          </p>

          <ol className={s.metiers}>
            {METIERS.map((m) => (
              /* tabIndex : le descriptif ne se révèle qu'au survol, et un
                 clavier ne survole pas. Rendre la fiche focalisable lui donne
                 le même accès (:focus-within) — WCAG 2.1.1. Le texte reste
                 dans l'arbre d'accessibilité en permanence : il est masqué
                 par l'opacité, pas retiré. */
              <li className={s.metier} key={m.num} tabIndex={0}>
                <p className="label">{m.num}</p>
                <h3 className={s.metierTitle}>{m.intitule}</h3>
                <p className={s.metierText}>{m.texte}</p>
              </li>
            ))}
          </ol>

          <p className={s.equivalence}>
            … ou une expérience équivalente. Si tu as appris le métier autrement,
            sur le chantier, en reconversion ou ailleurs qu’en Suisse, écris
            quand même.
          </p>
        </div>
      </section>

      {/* --- Candidature spontanée ----------------------------------------- */}
      <section className={s.section} aria-labelledby="candidature-titre">
        <div className={s.inner}>
          <p className="label">Section 03 · Postuler</p>
          <h2 id="candidature-titre" className={s.title}>
            Candidature spontanée
          </h2>
          <p className={s.intro}>
            Pas d’annonce datée sur cette page&nbsp;: les besoins arrivent avec
            les mandats, et une bonne candidature tombe rarement au bon moment.
            Envoie la tienne quand même.
          </p>

          <div className={s.actions}>
            <a className={s.cta} href={MAILTO}>
              Envoyer ta candidature par courriel
            </a>
            <a className={s.link} href="mailto:info@vrd-ingenieurs.ch">
              info@vrd-ingenieurs.ch
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
