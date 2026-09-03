import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CarteSuisse } from "@/components/carte/CarteSuisse";
import {
  REALISATIONS,
  BUDGET_TOTAL_MIOS,
  CANTONS,
  CLIENTS,
  type Client,
} from "@/content/realisations";
import s from "./page.module.css";

/**
 * Planche 03 — Réalisations.
 *
 * Cette page n'affiche plus AUCUN contenu de démonstration : les huit
 * références proviennent du portfolio remis par VRD. Maître d'ouvrage, lieu,
 * années, rôle, surface et budget des installations techniques sont ceux du
 * document. Le maître d'ouvrage marqué confidentiel par VRD le reste ici.
 */
export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Huit références en technique du bâtiment : manufactures horlogères, gare CFF, surfaces commerciales et culturelles — CVCS et MCR, de l’étude au suivi d’exécution.",
};

/** Le français écrit 22,1 — pas 22.1. */
const budgetFr = BUDGET_TOTAL_MIOS.toFixed(1).replace(".", ",");

function LogoClient({ client }: { client: Client }) {
  return (
    <Image
      className={s.clientLogo}
      src={client.logo}
      alt={client.nom}
      width={160}
      height={56}
      loading="lazy"
      /* Les SVG passent tels quels : les faire transiter par l'optimiseur
         demanderait `dangerouslyAllowSVG`, et un logo vectoriel n'a rien à y
         gagner. */
      unoptimized={client.logo.endsWith(".svg")}
    />
  );
}

export default function RealisationsPage() {
  return (
    <main id="contenu">
      <PageHeader
        planche="Planche 03 · Réalisations"
        title="Nos plans deviennent des bâtiments."
        lede="Manufactures horlogères, gare CFF, surfaces commerciales et culturelles — en ingénierie CVCS et MCR, de l’étude au suivi d’exécution."
      />

      {/* Chiffres d'ensemble, calculés depuis les références elles-mêmes. */}
      <section className={s.totaux} aria-label="Vue d’ensemble">
        <dl className={s.totauxList}>
          <div className={s.total}>
            <dt className={s.totalLabel}>Références documentées</dt>
            <dd className={s.totalValue}>{REALISATIONS.length}</dd>
          </div>
          <div className={s.total}>
            <dt className={s.totalLabel}>Mios CHF d’installations</dt>
            <dd className={s.totalValue}>{budgetFr}</dd>
          </div>
          <div className={s.total}>
            <dt className={s.totalLabel}>Cantons — {CANTONS.join(" · ")}</dt>
            <dd className={s.totalValue}>{CANTONS.length}</dd>
          </div>
        </dl>
      </section>

      {/* La carte, entre les chiffres et l'index : elle situe ce que les
          chiffres résument et que l'index détaille. Chaque épingle renvoie à
          la fiche correspondante plus bas. */}
      <CarteSuisse />

      {/* L'index : une ligne par référence, métadonnées en mono. */}
      <section className={s.index} aria-labelledby="index-titre">
        <h2 id="index-titre" className="label">
          Index des réalisations
        </h2>

        <ol className={s.list} role="list">
          {REALISATIONS.map((r, i) => (
            <li key={r.slug} id={r.slug} className={s.item}>
              <p className={s.num}>{String(i + 1).padStart(2, "0")}</p>

              <div className={s.body}>
                <h3 className={s.maitre}>
                  {r.maitre}
                  {r.confidentiel ? (
                    <>
                      <span aria-hidden="true">*</span>
                      <span className="visuallyHidden">
                        {" "}— maître d’ouvrage confidentiel
                      </span>
                    </>
                  ) : null}
                </h3>
                <p className={s.meta}>
                  {r.lieu}{r.canton ? ` / ${r.canton}` : ""} · {r.annees} · {r.role}
                </p>
                <p className={s.desc}>{r.descriptif}</p>
              </div>

              <dl className={s.chiffres}>
                {r.surface ? (
                  <div>
                    <dt className={s.cLabel}>Surface</dt>
                    <dd className={s.cValue}>{r.surface}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className={s.cLabel}>Budget inst. techniques</dt>
                  <dd className={s.cValue}>{r.budgetLabel}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>

        <p className={s.note}>
          * Le nom du maître de l’ouvrage est confidentiel.
        </p>
      </section>

      {/* Les clients, en toutes lettres — pas de logos, pas de droits d'usage. */}
      <section className={s.clients} aria-labelledby="clients-titre">
        <h2 id="clients-titre" className="label">
          Ils nous font confiance
        </h2>
        <ul className={s.clientsList} role="list">
          {CLIENTS.map((c) => (
            <li key={c.nom} className={s.client}>
              {/* Le nom passe dans `alt` : sans images, avec un lecteur d'écran
                  ou à l'impression, la liste reste exactement celle d'avant.
                  Le logo n'est un lien que si l'adresse a été vérifiée ; sinon
                  il reste une image, ce qui vaut mieux qu'un lien deviné. */}
              {c.site ? (
                <a
                  className={s.clientLien}
                  href={c.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${c.nom} — ${c.siteLibelle ?? "site officiel"}, nouvel onglet`}
                >
                  <LogoClient client={c} />
                </a>
              ) : (
                <LogoClient client={c} />
              )}
            </li>
          ))}
        </ul>

        {/* Le filtre de teinte, défini une fois. Un `feComponentTransfer` après
            désaturation reproduit EXACTEMENT une colorisation TSL — teinte 45°,
            saturation 23 % — en conservant la clarté de chaque pixel : le noir
            reste noir, le blanc reste blanc, et deux aplats de marque aussi
            éloignés qu'un vert et un rouge tombent sur le même kaki. Les
            fonctions `sepia()` et `hue-rotate()` de CSS n'en donnent qu'une
            approximation, avec une teinte qui dérive selon la couleur d'entrée.

            Le dernier échelon est ramené à 1 pour que le blanc reste PUR :
            combiné à `mix-blend-mode: multiply`, c'est ce qui fait disparaître
            les fonds blancs opaques au lieu d'en laisser des rectangles. */}
        <svg className={s.filtreDef} aria-hidden="true" focusable="false">
          <filter id="teinte-logo" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR
                type="table"
                tableValues="0.0000 0.0400 0.1168 0.1937 0.2706 0.3475 0.4243 0.5012 0.5781 0.6400 0.6881 0.7363 0.7844 0.8325 0.8807 0.9288 1.0000"
              />
              <feFuncG
                type="table"
                tableValues="0.0000 0.0362 0.1059 0.1756 0.2453 0.3150 0.3847 0.4544 0.5241 0.5863 0.6416 0.6969 0.7522 0.8075 0.8628 0.9181 1.0000"
              />
              <feFuncB
                type="table"
                tableValues="0.0000 0.0250 0.0732 0.1213 0.1694 0.2175 0.2656 0.3138 0.3619 0.4250 0.5018 0.5787 0.6556 0.7325 0.8094 0.8862 1.0000"
              />
            </feComponentTransfer>
          </filter>
        </svg>
      </section>

      <section className={s.cta}>
        <p className={s.ctaText}>
          Un projet de même nature&nbsp;? Nous en discutons volontiers.
        </p>
        <Link href="/contact" className={s.ctaLink}>
          Nous contacter
        </Link>
      </section>
    </main>
  );
}
