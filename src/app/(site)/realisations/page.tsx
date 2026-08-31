import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { REALISATIONS, BUDGET_TOTAL_MIOS, CANTONS, CLIENTS } from "@/content/realisations";
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

      {/* L'index : une ligne par référence, métadonnées en mono. */}
      <section className={s.index} aria-labelledby="index-titre">
        <h2 id="index-titre" className="label">
          Index des réalisations
        </h2>

        <ol className={s.list} role="list">
          {REALISATIONS.map((r, i) => (
            <li key={r.slug} className={s.item}>
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
            <li key={c}>{c}</li>
          ))}
        </ul>
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
