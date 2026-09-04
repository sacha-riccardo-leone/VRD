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
 *    (CHE-287.600.663, inscription du 30.10.2020) ou de l’organigramme VRD
 *    2026, et chaque ligne porte sa source à l’écran. La fondation et
 *    l’effectif ne sont PAS des données de registre : leurs lignes le disent en
 *    toutes lettres, et le sur-titre de la section annonce « faits et sources »,
 *    pas « faits de registre ».
 *  - Les six personnes sont nommées, et chaque fiche porte d’où vient son nom :
 *    deux du registre du commerce (les organes inscrits), quatre de
 *    l’organigramme. Aucun nom n’est inventé, et rien ne s’y ajoute — ni
 *    portrait, ni parcours, ni courriel, ni portable : le PDF en contient, leur
 *    publication n’est pas tranchée, la page n’en publie donc aucun.
 *  - Aucune arithmétique sur l’effectif : l’organigramme dit six personnes,
 *    direction incluse, donc les deux organes sont deux des six. Six fiches
 *    pour six personnes, sans addition ni soustraction.
 *  - Portraits et biographies : explicitement annoncés comme à fournir par VRD.
 *  - Aucune certification, aucun client, aucune référence de projet : rien de
 *    tout cela n’est public, donc rien de tout cela n’est écrit.
 *
 * Date de fondation : l’organigramme donne le 1er janvier 2021, et le cartouche
 * porte cette ligne. La ligne « Inscription — 30 octobre 2020 » reste juste
 * au-dessous : c’est la date d’INSCRIPTION au registre, un fait distinct de la
 * fondation, et les deux ne se contredisent pas.
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

/* --- Faits sourcés. Chaque ligne porte sa provenance à l’écran, y compris les
   deux qui ne viennent PAS du registre : la fondation et l’effectif. ------- */

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
    terme: "Fondation",
    valeur: "1er janvier 2021",
    source: "Organigramme VRD 2026",
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
      "Hors registre — chiffre publié par VRD, confirmé par l’organigramme VRD 2026, qui nomme six personnes, direction comprise",
  },
];

/* --- Les deux organes inscrits au registre du commerce. Ils sont deux des six
   personnes de l’équipe, pas deux de plus. ---------------------------------- */

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

/* --- Les quatre autres personnes de l’équipe, nommées par l’organigramme. ---
   Nom et rôle, rien de plus : les intitulés sont ceux du document, non
   développés, parce que les développer serait déjà écrire à la place de VRD. */

type Collaborateur = { nom: string; role: string };

const EQUIPE: readonly Collaborateur[] = [
  { nom: "J. Suarez", role: "Administration" },
  { nom: "Fabio Soares", role: "DT CVS" },
  { nom: "Cloé Fabrizio", role: "Projeteuse CVS" },
  { nom: "Maxime Allemann", role: "Projeteur CVS" },
];

export default function AProposPage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        title="À propos"
        lede="Six personnes à Sugiez, deux ingénieurs HES à la direction."
      />

      {/* ---------------------------------------------------------------- 02 */}
      <section className={s.equipe} aria-labelledby="equipe-titre">
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>01 · Organes et collaborateurs</p>
          <h2 id="equipe-titre" className={s.h2}>
            L’équipe
          </h2>

          <p className={s.intro}>
            Les six personnes du bureau sont nommées&nbsp;: deux par le registre
            du commerce, quatre par l’organigramme 2026. Restent à fournir les
            portraits et les biographies.
          </p>

          <ul className={s.cartes}>
            {ORGANES.map((m) => (
              <li className={`${s.carte} ${s.carteRegistre}`} key={m.nom}>
                <p className={`label ${s.carteFlag}`}>Registre du commerce</p>
                <h3 className={s.carteNom}>{m.nom}</h3>
                <p className={s.carteRole}>{m.role}</p>
                <p className={s.carteNote}>{m.note}</p>
              </li>
            ))}

            {EQUIPE.map((membre) => (
              <li
                className={`${s.carte} ${s.carteOrganigramme}`}
                key={membre.nom}
              >
                <p className={`label ${s.carteFlag}`}>Organigramme VRD 2026</p>
                <h3 className={s.carteNom}>{membre.nom}</h3>
                <p className={s.carteRole}>{membre.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- 01 */}
      <section className={s.bureau} aria-labelledby="bureau-titre">
        <FigureBackdrop placement="right" size="min(52%, 34rem)">
          <PlanNiveauCote />
        </FigureBackdrop>

        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>02 · Faits et sources</p>
          <h2 id="bureau-titre" className={s.h2}>
            Le bureau
          </h2>

          <p className={s.intro}>
            VRD est né de deux amis ingénieurs HES, qui dirigent le bureau
            ensemble. Tout ce qui suit vient du registre du commerce, sauf la
            fondation et l’effectif&nbsp;: chaque ligne porte sa source.
          </p>

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
