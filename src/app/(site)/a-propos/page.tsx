import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { FigureBackdrop } from "@/components/FigureBackdrop";
import { PlanNiveauCote } from "@/components/PlanNiveauCote";
import s from "./page.module.css";

/**
 * À propos — planche 05. Le bureau et l’équipe.
 *
 * Intégrité du contenu — la règle dure du projet s’applique ici plus qu’ailleurs,
 * parce que c’est la page où l’envie d’inventer est la plus forte :
 *
 *  - Tout ce qui figure dans « Le bureau » vient du registre du commerce
 *    (CHE-287.600.663, inscription du 30.10.2020) ou d’un chiffre publié par
 *    VRD, et chaque ligne porte sa source à l’écran. L’effectif n’est PAS une
 *    donnée de registre : sa ligne le dit en toutes lettres, et le sur-titre de
 *    la section annonce « faits et sources », pas « faits de registre ».
 *  - Deux personnes seulement sont nommées : les organes inscrits au registre.
 *    Les autres fiches sont REPRÉSENTATIVES, marquées comme telles à l’écran
 *    (puce « à compléter », filet tireté, surface non surélevée) et ne portent
 *    AUCUN nom : ni réel, ni fictif.
 *  - Aucune répartition de l’effectif n’est avancée. Nous savons que VRD
 *    annonce six collaborateurs et que deux personnes figurent au registre ;
 *    nous ignorons si les six incluent les deux. La page ne fait donc pas la
 *    soustraction, et le nombre de fiches représentatives ne prétend rien.
 *  - Les rôles génériques sont repris des métiers que VRD dit rechercher sur sa
 *    page Carrières — ce sont des intitulés de poste, pas des personnes.
 *  - Portraits et biographies : explicitement annoncés comme à fournir par VRD.
 *  - Aucune certification, aucun client, aucune référence de projet : rien de
 *    tout cela n’est public, donc rien de tout cela n’est écrit.
 *
 * L’écart « fondée en 2021 » (site actuel) contre 30.10.2020 (registre) est
 * signalé à l’écran plutôt que masqué : c’est à VRD de trancher.
 *
 * Typographie — les espaces insécables du français (avant « : », à l’intérieur
 * des guillemets, dans le numéro de téléphone) sont posées en entités
 * `&nbsp;`, jamais en caractère U+00A0 littéral : un caractère invisible se
 * perd au premier copier-coller et personne ne s’en aperçoit, alors qu’une
 * entité se voit et se cherche. Les chaînes JavaScript de ce fichier, elles,
 * sont formulées sans insécable — tiret cadratin plutôt que deux-points.
 */

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Le bureau et l’équipe de VRD ingénieurs-conseils SA — registre du commerce 2020, siège à Sugiez (Mont-Vully, FR), direction, effectif et coordonnées.",
};

/* --- Faits sourcés. Chaque ligne porte sa provenance à l’écran, y compris la
   seule qui ne vienne PAS du registre : l’effectif. ------------------------ */

type Ligne = { terme: string; valeur: string; source: string };

const REGISTRE: readonly Ligne[] = [
  {
    terme: "Raison sociale",
    valeur: "VRD ingénieurs-conseils SA",
    source: "Registre du commerce",
  },
  {
    terme: "Numéro IDE",
    valeur: "CHE-287.600.663",
    source: "Registre du commerce",
  },
  {
    terme: "Inscription",
    valeur: "30 octobre 2020",
    source: "Registre du commerce",
  },
  {
    terme: "Siège",
    valeur: "Chemin du Chablais 46, 1786 Sugiez — commune du Mont-Vully (FR)",
    source: "Registre du commerce",
  },
  {
    terme: "But inscrit",
    valeur:
      "Ingénierie-conseil en chauffage, ventilation, climatisation, sanitaire et énergies renouvelables",
    source: "Registre du commerce",
  },
  {
    terme: "Signature",
    valeur: "Collective à deux",
    source: "Registre du commerce",
  },
  {
    terme: "Effectif",
    valeur: "6 collaborateurs",
    source:
      "Hors registre — chiffre publié par VRD ; LinkedIn indique une fourchette de 2 à 10",
  },
];

/* --- Équipe : deux personnes nommées, parce qu’elles sont au registre. ---- */

type Organe = { nom: string; role: string; note: string };

const ORGANES: readonly Organe[] = [
  {
    nom: "Dominique Rodrigues Fonseca",
    role: "Président du conseil d’administration",
    note: "Signature collective à deux.",
  },
  {
    nom: "Ruben Varela Facal",
    role: "Administrateur",
    note: "Signature collective à deux.",
  },
];

/* --- Fiches représentatives : un rôle, jamais un nom. ---------------------
   Les intitulés sont ceux des métiers que VRD dit rechercher (page Carrières),
   plus la coordination BIM, spécialité affichée par le bureau. Ce sont des
   postes, pas des personnes : aucune de ces fiches ne décrit quelqu’un, et
   leur nombre ne dit rien de l’effectif réel. */

const ROLES_REPRESENTATIFS: readonly string[] = [
  "Projeteur en techniques du bâtiment",
  "Technicien ES en techniques du bâtiment",
  "Ingénieur HES en techniques du bâtiment",
  "Coordination BIM",
];

export default function AProposPage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        planche="Planche 05 · À propos"
        title="Deux ingénieurs HES, six collaborateurs, un bureau à Sugiez."
        lede="VRD ingénieurs-conseils SA est inscrite au registre du commerce depuis le 30 octobre 2020. Son siège est au chemin du Chablais 46, sur la commune du Mont-Vully, dans le canton de Fribourg."
      />

      {/* ---------------------------------------------------------------- 01 */}
      <section className={s.bureau} aria-labelledby="bureau-titre">
        <FigureBackdrop placement="right" size="min(52%, 34rem)">
          <PlanNiveauCote />
        </FigureBackdrop>

        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>01 · Faits et sources</p>
          <h2 id="bureau-titre" className={s.h2}>
            Le bureau
          </h2>

          <div className={s.grille}>
            <div className={s.prose}>
              <p>
                VRD est né de deux amis ingénieurs HES. Ils dirigent le bureau
                ensemble&nbsp;: Dominique Rodrigues Fonseca en préside le
                conseil d’administration, Ruben Varela Facal y siège comme
                administrateur, l’un et l’autre avec signature collective à
                deux.
              </p>
              <p>
                La société est inscrite au registre du commerce depuis le 30
                octobre 2020, sous le numéro CHE-287.600.663. Le siège est au
                chemin du Chablais 46, à 1786 Sugiez, commune du Mont-Vully,
                canton de Fribourg.
              </p>
              <p>
                Le but inscrit au registre tient en une phrase&nbsp;:
                ingénierie-conseil en chauffage, ventilation, climatisation,
                sanitaire et énergies renouvelables. C’est le périmètre du
                bureau — rien de plus, et c’est déjà l’essentiel de ce qui fait
                fonctionner un bâtiment.
              </p>
              <p>
                VRD annonce six collaborateurs. Ce chiffre ne vient pas du
                registre&nbsp;: il vient du bureau lui-même. Le profil LinkedIn
                affiche la fourchette «&nbsp;2-10&nbsp;», qui le contient sans
                le contredire.
              </p>
            </div>

            <dl className={s.registre}>
              {REGISTRE.map((l) => (
                <div className={s.ligne} key={l.terme}>
                  <dt className={s.terme}>{l.terme}</dt>
                  <dd className={s.valeur}>
                    {l.valeur}
                    <span className={s.source}>{l.source}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className={s.reserve} aria-labelledby="reserve-titre">
            <p className={`label ${s.reserveTitre}`} id="reserve-titre">
              Écart relevé <span className={s.flag}>à trancher avec VRD</span>
            </p>
            <p className={s.reserveTexte}>
              Le site actuel de VRD indique une fondation en 2021. Le registre
              du commerce date l’inscription du 30 octobre 2020. L’écart est
              signalé ici plutôt que corrigé en silence&nbsp;: c’est au bureau
              de dire laquelle des deux dates il souhaite publier.
            </p>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 02 */}
      <section className={s.equipe} aria-labelledby="equipe-titre">
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>02 · Organes et fiches</p>
          <h2 id="equipe-titre" className={s.h2}>
            L’équipe
          </h2>

          <p className={s.intro}>
            Deux noms sont publics, parce qu’ils figurent au registre du
            commerce. Le reste de l’équipe n’y figure pas, et nous n’inventerons
            personne&nbsp;: les fiches ci-dessous tiennent leur place avec un
            intitulé de poste, sans nom ni parcours.
          </p>

          <ul className={s.cartes}>
            {ORGANES.map((m) => (
              <li className={`${s.carte} ${s.carteVerifiee}`} key={m.nom}>
                <p className={`label ${s.carteFlag}`}>Registre du commerce</p>
                <h3 className={s.carteNom}>{m.nom}</h3>
                <p className={s.carteRole}>{m.role}</p>
                <p className={s.carteNote}>{m.note}</p>
              </li>
            ))}

            {ROLES_REPRESENTATIFS.map((role) => (
              <li className={`${s.carte} ${s.carteRepresentative}`} key={role}>
                <p className={`label ${s.carteFlag}`}>
                  Fiche représentative{" "}
                  <span className={s.flag}>à compléter</span>
                </p>
                <h3 className={s.carteNom}>{role}</h3>
                <dl className={s.champs}>
                  <div className={s.champ}>
                    <dt className={s.champTerme}>Nom</dt>
                    <dd className={s.champValeur}>à compléter</dd>
                  </div>
                  <div className={s.champ}>
                    <dt className={s.champTerme}>Parcours</dt>
                    <dd className={s.champValeur}>à compléter</dd>
                  </div>
                  <div className={s.champ}>
                    <dt className={s.champTerme}>Portrait</dt>
                    <dd className={s.champValeur}>à fournir</dd>
                  </div>
                </dl>
                <p className={s.carteNote}>
                  Intitulé de poste générique, repris des métiers que VRD
                  recherche. Aucune personne réelle n’est décrite ici, et le
                  nombre de fiches ne dit rien de l’effectif.
                </p>
              </li>
            ))}
          </ul>

          <aside className={s.encadre} aria-labelledby="encadre-titre">
            <p className={`label ${s.encadreTitre}`} id="encadre-titre">
              Contenu à fournir par VRD
            </p>
            <p className={s.encadreTexte}>
              Les portraits et les biographies de l’équipe seront fournis par
              VRD. Tant qu’ils ne le sont pas, cette page ne publie ni photo, ni
              texte de présentation, ni nom de collaborateur&nbsp;: les fiches
              représentatives ci-dessus sont du contenu de démonstration, marqué
              comme tel, et seront remplacées une par une à la remise des
              éléments.
            </p>
            <p className={s.encadreTexte}>
              VRD indique rechercher ces mêmes métiers — voir{" "}
              <Link className={s.lienProse} href="/carrieres">
                la page Carrières
              </Link>
              .
            </p>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 03 */}
      <section
        className={`technique ${s.reperes}`}
        aria-labelledby="reperes-titre"
      >
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>03 · Coordonnées</p>
          <h2 id="reperes-titre" className={s.h2}>
            Repères
          </h2>

          <div className={s.colonnes}>
            <div className={s.colonne}>
              <p className="label">Adresse</p>
              <address className={s.adresse}>
                VRD ingénieurs-conseils SA
                <br />
                Chemin du Chablais 46
                <br />
                1786&nbsp;Sugiez
                <br />
                Commune du Mont-Vully
                <br />
                Canton de Fribourg
              </address>
            </div>

            <div className={s.colonne}>
              <p className="label">Contact</p>
              <ul className={s.liens}>
                <li>
                  <a className={s.lien} href="tel:+41265520100">
                    026&nbsp;552&nbsp;01&nbsp;00
                  </a>
                </li>
                <li>
                  <a className={s.lien} href="mailto:info@vrd-ingenieurs.ch">
                    info@vrd-ingenieurs.ch
                  </a>
                </li>
                <li>
                  <a
                    className={s.lien}
                    href="https://www.linkedin.com/company/vrd-ing%C3%A9nieurs"
                    rel="noopener noreferrer"
                  >
                    LinkedIn · /company/vrd-ingénieurs
                  </a>
                </li>
              </ul>
            </div>

            <div className={s.colonne}>
              <p className="label">Identification</p>
              <dl className={s.identite}>
                <div className={s.champ}>
                  <dt className={s.champTerme}>IDE</dt>
                  <dd className={s.champValeur}>CHE-287.600.663</dd>
                </div>
                <div className={s.champ}>
                  <dt className={s.champTerme}>Inscription</dt>
                  <dd className={s.champValeur}>30.10.2020</dd>
                </div>
                <div className={s.champ}>
                  <dt className={s.champTerme}>Registre</dt>
                  <dd className={s.champValeur}>Canton de Fribourg</dd>
                </div>
              </dl>
            </div>

            <div className={s.colonne}>
              <p className="label">Aller plus loin</p>
              <ul className={s.liens}>
                <li>
                  <Link className={s.lien} href="/prestations">
                    Les prestations
                  </Link>
                </li>
                <li>
                  <Link className={s.lien} href="/carrieres">
                    Les métiers recherchés
                  </Link>
                </li>
                <li>
                  <Link className={s.lien} href="/contact">
                    Écrire au bureau
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
