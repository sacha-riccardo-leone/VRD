import type { Metadata } from "next";
import { contrastRatio, grade, type Hex } from "@/lib/contrast";
import s from "./tokens.module.css";

/**
 * INTERNAL REVIEW PAGE — not part of the site.
 * Delete `src/app/tokens/` before any delivery to VRD.
 */

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

/**
 * `decorative: true` — a hairline carrying no meaning, exempt from a floor.
 * `forbidden: true`  — a pairing that must never ship; shown with its real
 *                      ratio so the number stays visible.
 * Grading either against 4.5:1 and printing "fail" would make this page
 * misreport its own data.
 */
type Pair = {
  fg: Hex;
  bg: Hex;
  use: string;
  limit?: string;
  decorative?: boolean;
  forbidden?: boolean;
};

const ON_PAPER: Pair[] = [
  { fg: "#141210", bg: "#f2efe9", use: "--ink sur --paper", limit: "corps de texte, titres" },
  { fg: "#55504a", bg: "#f2efe9", use: "--ink-muted sur --paper", limit: "texte secondaire" },
  { fg: "#8a8271", bg: "#f2efe9", use: "--rule-strong sur --paper", limit: "séparateurs porteurs de sens" },
  {
    fg: "#d8d2c7",
    bg: "#f2efe9",
    use: "--rule sur --paper",
    limit: "filets décoratifs — jamais porteurs de sens",
    decorative: true,
  },
];

const ON_DARK: Pair[] = [
  { fg: "#f2efe9", bg: "#1c1c1c", use: "--on-dark sur --dark", limit: "corps de texte" },
  { fg: "#b0aeab", bg: "#1c1c1c", use: "--on-dark-muted sur --dark", limit: "texte secondaire" },
  { fg: "#6e6e6e", bg: "#1c1c1c", use: "--rule-strong sur --dark", limit: "séparateurs porteurs de sens" },
  { fg: "#333333", bg: "#1c1c1c", use: "--dark-rule sur --dark", limit: "filets décoratifs", decorative: true },
];

const TYPE_STEPS = [
  { token: "--fs-800", el: "sans", note: "titre de page — un seul par page" },
  { token: "--fs-700", el: "sans", note: "titre de section" },
  { token: "--fs-600", el: "sans", note: "sous-section" },
  { token: "--fs-500", el: "sans", note: "chapô, intertitre" },
  { token: "--fs-400", el: "sans", note: "corps de texte" },
  { token: "--fs-300", el: "sans", note: "petit corps, cellules de tableau" },
  { token: "--fs-200", el: "mono", note: "légendes, références" },
  { token: "--fs-100", el: "mono", note: "unités, étiquettes d’axe" },
];

const SPACE = ["--s-1", "--s-2", "--s-3", "--s-4", "--s-5", "--s-6", "--s-7", "--s-8", "--s-9", "--s-10"];

function Swatches({ pairs, dark }: { pairs: Pair[]; dark?: boolean }) {
  return (
    <div className={s.tableWrap}>
      <table className={`${s.table} ${dark ? "technique" : ""}`}>
        <caption className="label">{dark ? "Sur fond sombre (anthracite)" : "Sur fond papier"}</caption>
        <thead>
          <tr>
            <th scope="col">Échantillon</th>
            <th scope="col">Jeton</th>
            <th scope="col">Ratio</th>
            <th scope="col">Niveau</th>
            <th scope="col">Usage autorisé</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((p) => {
            const ratio = contrastRatio(p.fg, p.bg);
            const verdict = p.forbidden ? "interdit" : p.decorative ? "décoratif" : grade(ratio);
            return (
              <tr key={p.use}>
                <td>
                  <span className={s.chip} style={{ background: p.bg, color: p.fg, borderColor: p.fg }}>
                    Aa
                  </span>
                </td>
                <th scope="row" className={s.token}>
                  {p.use}
                </th>
                <td className={s.num}>{ratio.toFixed(2)}:1</td>
                <td>
                  <span className={s.grade} data-grade={verdict}>
                    {verdict}
                  </span>
                </td>
                <td className={s.limit}>{p.limit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TokensPage() {
  return (
    <main id="contenu" className={s.page}>
      <header className={s.head}>
        <p className="label">Interne · Direction A « Le Dossier »</p>
        <h1>Système</h1>
        <p className={s.lede}>
          Chaque valeur ci-dessous est mesurée au moment du build, pas estimée. Cette page n’est pas une page du
          site&nbsp;: elle sert à valider les jetons avant de construire quoi que ce soit.
        </p>
        <p className={s.warn}>
          <strong>--paper</strong> et <strong>--ink</strong> sont des valeurs provisoires. Le brief indique « papier
          off-white » et « encre near-black » sans hexadécimal. À remplacer depuis le document de contexte.
        </p>
      </header>

      <section className={s.section} aria-labelledby="t-couleur">
        <h2 id="t-couleur">Couleur et contraste</h2>
        <Swatches pairs={ON_PAPER} />
        <Swatches pairs={ON_DARK} dark />
      </section>

      <section className={s.section} aria-labelledby="t-mono">
        <h2 id="t-mono">Contraste sans couleur</h2>
        <p className={s.note}>
          Aucune teinte d’accent (décision du 28.08.2026) : les matériaux du client sont noir et blanc. La hiérarchie
          et l’emphase passent par l’<strong>inversion</strong> encre↔papier, l’<strong>épaisseur de trait</strong>, le
          <strong> tireté opposé au plein</strong> et le <strong>poids typographique</strong>. Le bouton primaire est un
          aplat d’encre à texte papier ; au survol il s’inverse (papier, texte encre, filet d’encre) — voir « États
          interactifs » plus bas.
        </p>
        <p className={s.note}>
          Un schéma technique sépare ses circuits par épaisseur de trait et par tireté avant tout&nbsp;: ça survit à
          l’impression en noir et blanc et au daltonisme. Sur fond sombre, l’isotherme active du champ thermique passe en
          trait plein plus épais, pas en couleur.
        </p>
      </section>

      <section className={s.section} aria-labelledby="t-type">
        <h2 id="t-type">Échelle typographique</h2>
        <p className="label">IBM Plex Sans 400/600 · IBM Plex Mono 400/500 · sous-ensemble latin · 76 Ko au total</p>
        <ul className={s.typeList}>
          {TYPE_STEPS.map((t) => (
            <li key={t.token}>
              <span className="label">
                {t.token} · {t.note}
              </span>
              <span
                className={t.el === "mono" ? s.sampleMono : s.sample}
                style={{ fontSize: `var(${t.token})` }}
              >
                Chauffage, ventilation, climatisation — cœur d’îlot, 1 250 m²
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="t-espace">
        <h2 id="t-espace">Échelle d’espacement</h2>
        <ul className={s.spaceList}>
          {SPACE.map((tok) => (
            <li key={tok}>
              <span className="label">{tok}</span>
              <span className={s.bar} style={{ inlineSize: `var(${tok})` }} />
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section} aria-labelledby="t-etats">
        <h2 id="t-etats">États interactifs</h2>
        <p className={s.note}>
          Naviguez au clavier&nbsp;: l’anneau de focus doit rester visible sur les deux fonds — encre sur papier
          (16.28:1), papier sur anthracite (14.85:1). Cible tactile minimale 44&nbsp;×&nbsp;44&nbsp;px.
        </p>
        <div className={s.states}>
          <a href="#t-etats">Lien dans le texte</a>
          <button type="button" className={s.btn}>
            Bouton primaire
          </button>
          <button type="button" className={s.btnGhost}>
            Bouton secondaire
          </button>
        </div>
        <div className={`${s.states} technique ${s.statesDark}`}>
          <a href="#t-etats">Lien dans le texte</a>
          <button type="button" className={s.btn}>
            Bouton primaire
          </button>
          <button type="button" className={s.btnGhost}>
            Bouton secondaire
          </button>
        </div>
      </section>

      <section className={s.section} aria-labelledby="t-mouvement">
        <h2 id="t-mouvement">Mouvement</h2>
        <p className={s.note}>
          Une seule idée&nbsp;: « le dessin s’assemble ». Plafond dur à 400&nbsp;ms, déclenché par le lecteur, jamais en
          boucle, aucun décalage de mise en page. Sous <code>prefers-reduced-motion</code>, toutes les durées passent à
          1&nbsp;ms&nbsp;— l’état final est identique.
        </p>
        <dl className={s.motion}>
          <div>
            <dt className="label">--dur-fast</dt>
            <dd>120 ms — retours d’état (survol, focus)</dd>
          </div>
          <div>
            <dt className="label">--dur</dt>
            <dd>240 ms — transitions de composant</dd>
          </div>
          <div>
            <dt className="label">--dur-slow</dt>
            <dd>400 ms — assemblage d’un schéma. Plafond.</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
