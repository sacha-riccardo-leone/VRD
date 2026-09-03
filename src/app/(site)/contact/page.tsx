import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import s from "./page.module.css";

/**
 * Contact — planche 07. La page qui manque au site actuel : aujourd’hui, joindre
 * VRD suppose de retrouver un numéro dans un pied de page.
 *
 * Intégrité du contenu — ce qui est vérifié, ce qui ne l’est pas :
 *  - Raison sociale, numéro IDE, adresse, téléphone, e-mail et LinkedIn sont
 *    des faits (registre du commerce et supports publics de VRD). Ils ne
 *    portent aucune réserve, parce qu’ils n’en ont pas besoin.
 *  - Le paragraphe de confidentialité est une RÉDACTION D’EXEMPLE, écrite au
 *    conditionnel et marquée à l’écran : VRD n’a publié aucune politique de
 *    traitement des données. On ne lui en invente pas une.
 *  - Aucun mandat, aucune référence de projet, aucun nom de client, aucune
 *    certification, aucun chiffre : rien de tel n’est public.
 *
 * Le formulaire — composant serveur, donc aucun état, aucun `onSubmit`.
 * Correction de revue (29.08.2026) : le bouton d’envoi ne SOUMET plus. Un
 * <form> sans `action` ni `method` se soumet en GET vers l’URL courante, ce qui
 * aurait recopié nom, e-mail, téléphone et message dans la barre d’adresse —
 * puis dans l’historique, les journaux du serveur et l’en-tête Referer. La page
 * affirme que rien n’est transmis ; il fallait que ce soit vrai. Le bouton est
 * donc `type="button"` + `aria-disabled` : il reste focusable, annonce son état
 * et ne déclenche rien. Sans bouton de soumission et avec plusieurs champs
 * texte, la soumission implicite (touche Entrée) est elle aussi neutralisée.
 *
 * Les `required` et `type="email"` restent : ils portent l’état « requis » dans
 * l’arbre d’accessibilité et alimentent `:user-invalid`, qui se déclenche à la
 * sortie du champ, sans soumission. Le jour où une Server Action est branchée,
 * elle postera en POST — jamais de données personnelles par l’URL.
 */

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Coordonnées de VRD ingénieurs-conseils SA à Sugiez (Mont-Vully, FR) — adresse, téléphone, e-mail et formulaire de contact.",
};

export default function ContactPage() {
  return (
    <main id="contenu" className={s.page}>
      <PageHeader
        planche="Planche 07 · Contact"
        title="Parlons de votre projet."
        lede="Le bureau est établi à Sugiez, sur le Mont-Vully. Téléphone, adresse, e-mail — ou le formulaire ci-dessous, si vous préférez écrire."
      />

      <div className={s.grid}>
        {/* --- Colonne gauche : les coordonnées réelles, sans réserve. ----- */}
        <section className={s.coords} aria-labelledby="joindre-titre">
          <p className={`label ${s.kicker}`}>Coordonnées</p>
          <h2 id="joindre-titre" className={s.h2}>
            Nous joindre
          </h2>

          <address className={s.address}>
            <dl className={s.rows}>
              <div className={s.row}>
                <dt className="label">Bureau</dt>
                <dd className={s.value}>
                  VRD ingénieurs-conseils SA
                  <br />
                  Chemin du Chablais 46
                  <br />
                  1786&nbsp;Sugiez
                  <span className={s.sub}>
                    Commune du Mont-Vully · canton de Fribourg
                  </span>
                </dd>
              </div>

              <div className={s.row}>
                <dt className="label">Téléphone</dt>
                <dd className={s.value}>
                  <a className={s.link} href="tel:+41265520100">
                    026&nbsp;552&nbsp;01&nbsp;00
                  </a>
                </dd>
              </div>

              <div className={s.row}>
                <dt className="label">E-mail</dt>
                <dd className={s.value}>
                  <a className={s.link} href="mailto:info@vrd-ingenieurs.ch">
                    info@vrd-ingenieurs.ch
                  </a>
                </dd>
              </div>

              <div className={s.row}>
                <dt className="label">LinkedIn</dt>
                <dd className={s.value}>
                  {/* Intitulé explicite : « /company/… » ne dit rien hors
                      contexte, et un aria-label qui ne reprendrait pas le texte
                      visible casserait « Label in Name » (WCAG 2.5.3). Le
                      « é » est encodé dans l’href, affiché dans le texte. */}
                  <a
                    className={s.link}
                    href="https://www.linkedin.com/company/vrd-ing%C3%A9nieurs"
                  >
                    Page LinkedIn du bureau
                  </a>
                  <span className={s.sub}>/company/vrd-ingénieurs</span>
                </dd>
              </div>

              <div className={s.row}>
                <dt className="label">Registre</dt>
                <dd className={s.value}>
                  CHE-287.600.663
                  <span className={s.sub}>
                    Inscrite au registre du commerce le 30.10.2020
                  </span>
                </dd>
              </div>
            </dl>
          </address>

          <div className={s.aside}>
            <h3 className={s.h3}>Candidatures</h3>
            <p className={s.asideText}>
              Les métiers recherchés sont listés sur la page Carrières&nbsp;; les
              dossiers arrivent à la même adresse que le reste du courrier.
            </p>
            <Link className={s.link} href="/carrieres">
              Voir la page Carrières
            </Link>
          </div>
        </section>

        {/* --- Colonne droite : le formulaire. ----------------------------- */}
        <section className={s.write} aria-labelledby="ecrire-titre">
          <p className={`label ${s.kicker}`}>Formulaire</p>
          <h2 id="ecrire-titre" className={s.h2}>
            Écrire au bureau
          </h2>
          <p className={s.intro}>
            Quelques lignes suffisent&nbsp;: la nature du bâtiment, la phase du
            projet, l’échéance visée. C’est ce qui permet d’orienter la réponse
            vers la bonne personne.
          </p>

          {/* Mention de démonstration — visible à l’écran et placée AVANT le
              formulaire : une réserve qu’on ne lit qu’après avoir tout saisi ne
              sert à rien. C’est la seule chose qui empêche ce formulaire de
              mentir au lecteur. */}
          <p id="note-demo" className={s.demo}>
            <span className={s.demoTag}>Démonstration</span>
            Ce formulaire n’est relié à aucun service. Le bouton d’envoi est
            volontairement inactif&nbsp;: aucune donnée n’est transmise, ni
            enregistrée, ni recopiée dans l’adresse de la page. Pour joindre
            réellement le bureau, utilisez le téléphone ou l’adresse e-mail qui
            figurent sur cette page.
          </p>

          <form className={s.form} aria-labelledby="ecrire-titre">
            <p className={s.hint}>
              Les champs marqués «&nbsp;requis&nbsp;» sont obligatoires.
            </p>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="nom">
                Nom et prénom <span className={s.req}>requis</span>
              </label>
              <input
                className={s.input}
                id="nom"
                name="nom"
                type="text"
                autoComplete="name"
                maxLength={120}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="courriel">
                E-mail <span className={s.req}>requis</span>
              </label>
              <input
                className={s.input}
                id="courriel"
                name="courriel"
                type="email"
                autoComplete="email"
                maxLength={160}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="telephone">
                Téléphone <span className={s.opt}>facultatif</span>
              </label>
              <input
                className={s.input}
                id="telephone"
                name="telephone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
              />
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="objet">
                Objet <span className={s.req}>requis</span>
              </label>
              <p id="objet-aide" className={s.aide}>
                Par exemple&nbsp;: «&nbsp;Étude CVC — rénovation d’un immeuble de
                12&nbsp;logements&nbsp;».
              </p>
              <input
                className={s.input}
                id="objet"
                name="objet"
                type="text"
                autoComplete="off"
                maxLength={120}
                aria-describedby="objet-aide"
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="message">
                Message <span className={s.req}>requis</span>
              </label>
              <p id="message-aide" className={s.aide}>
                Commune du projet, phase en cours (avant-projet, appel d’offres,
                exécution), surfaces et échéance si vous les connaissez.
              </p>
              <textarea
                className={s.textarea}
                id="message"
                name="message"
                rows={7}
                maxLength={4000}
                aria-describedby="message-aide"
                required
              />
            </div>

            {/* `type="button"` : aucune soumission, donc aucune donnée dans
                l’URL. `aria-disabled` plutôt que `disabled` — le bouton reste
                atteignable au clavier et annonce pourquoi il ne fait rien. */}
            <button
              className={s.submit}
              type="button"
              aria-disabled="true"
              aria-describedby="note-demo"
            >
              Envoyer le message
              <span className={s.submitState}>inactif</span>
            </button>
          </form>

          <p className={s.privacy}>
            <span className={s.flag}>rédaction d’exemple</span>
            Confidentialité — une fois le formulaire raccordé, les informations
            saisies ne serviraient qu’à traiter la demande, ne seraient ni cédées
            ni exploitées à des fins publicitaires, et seraient effacées à la
            clôture du dossier. Ce paragraphe montre la forme que prendrait la
            mention&nbsp;; le texte réel reste à arrêter par VRD.
          </p>
        </section>
      </div>

    </main>
  );
}
