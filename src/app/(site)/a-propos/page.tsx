import type { Metadata } from "next";
import { DiaporamaBureau } from "@/components/DiaporamaBureau";
import { PageHeader } from "@/components/PageHeader";
import s from "./page.module.css";

/**
 * À propos — planche 05. Le bureau et l’équipe.
 *
 * Intégrité du contenu — la règle dure du projet s’applique ici plus qu’ailleurs,
 * parce que c’est la page où l’envie d’inventer est la plus forte :
 *
 *  - « Le bureau » (14.09.2026, demande de Sacha) : le cartouche de faits de
 *    registre a été retiré et remplacé par le diaporama des locaux, dont les
 *    cinq cadres sont VIDES et le disent : VRD n’a fourni aucune photo. Ce que
 *    le cartouche doublait avec /contact (raison sociale, IDE, inscription du
 *    30.10.2020, siège) y reste ; la signature collective à deux reste ici,
 *    dans les deux fiches d’organes. Trois choses ne sont plus affichées
 *    nulle part : la date exacte de fondation (1er janvier 2021, organigramme
 *    — l’accueil ne porte que l’année, dans le tampon du hero, et un âge
 *    « 5 ans d’existence » dont la source est le portfolio), le but inscrit
 *    au registre (libellé verbatim), et la SOURCE de l’effectif (le chiffre 6
 *    reste sur l’accueil, plus sa provenance « hors registre, confirmée par
 *    l’organigramme »). Signalé à Sacha, non réinséré d’office.
 *    La section « Coordonnées » a été retirée de même ; ce qu’elle avait en
 *    plus (le registre du commerce du canton de Fribourg) est passé dans
 *    « Nous joindre » sur /contact.
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
    "L’équipe et le bureau de VRD ingénieurs-conseils SA : six personnes à Sugiez (Mont-Vully, FR), deux ingénieurs HES à la direction.",
};

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

      {/* ---------------------------------------------------------------- 01 */}
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

      {/* ---------------------------------------------------------------- 02 */}
      <section className={s.bureau} aria-labelledby="bureau-titre">
        <div className={s.inner}>
          <p className={`label ${s.kicker}`}>02 · Les locaux</p>
          <h2 id="bureau-titre" className={s.h2}>
            Le bureau
          </h2>

          <p className={s.intro}>
            Chemin du Chablais 46, à Sugiez. Les photos des locaux sont à
            fournir par VRD&nbsp;: cinq emplacements les attendent.
          </p>

          <DiaporamaBureau />
        </div>
      </section>

    </main>
  );
}
