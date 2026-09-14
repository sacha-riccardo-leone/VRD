"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp } from "./CountUp";
import s from "./CoutInstallation.module.css";

/**
 * Deux installations, deux barres de coût — la figure de la section
 * « Notre approche ».
 *
 * CE QU'ELLE MONTRE. Une ligne par installation : un pictogramme d'équipement,
 * puis une barre horizontale en deux segments — coût d'achat, coût de
 * maintenance — et les montants en francs. La barre de l'installation
 * inadaptée est la plus longue, sur les DEUX segments : elle se paie deux
 * fois, c'est le titre de la section.
 *
 * LES MONTANTS SONT UN EXEMPLE, et la figure le dit à l'écran. La base
 * (100'000 CHF d'achat pour l'installation adaptée) est posée pour lire des
 * ordres de grandeur ; ce sont les RAPPORTS qui viennent d'études publiées :
 *   - surdimensionnement d'un facteur 2 → +115 % d'investissement
 *     (OST, Instituts SPF + IET, pour l'OFEN — factsheet OptiPower 2023,
 *     cas calculé sur l'immeuble OST-FZ ; le surdimensionnement lui-même
 *     est la situation courante : médiane +40 % sur 500+ immeubles suisses) ;
 *   - entretien annuel 1,94 % de la valeur à neuf des installations
 *     techniques (Bahr & Bossmann, 136 bâtiments, 2013), sur 25 ans.
 * L'entretien se calcule sur la valeur à neuf : ce qui vaut plus cher coûte
 * plus cher à entretenir, chaque année. Rien d'autre n'est empilé — ni
 * l'énergie, ni la durée de vie, dont les seules valeurs publiées sont des
 * simulations assorties de « parfois ».
 *
 * MOUVEMENT — « le dessin s'assemble », l'unique idée du site. Quand le
 * lecteur amène la figure à l'écran, l'achat se trace, puis la maintenance le
 * prolonge d'une poussée ; les montants comptent en même temps (CountUp, le
 * précédent du « 200+ »). 240 + 120 = 360 ms, sous le plafond de 400.
 *
 * Sans JavaScript, ou sous `prefers-reduced-motion`, les barres sont rendues
 * pleines d'emblée : l'animation est un enrichissement, jamais une condition.
 * Le repli `scaleX(0)` n'est posé QUE par le script, juste avant de jouer.
 *
 * AUCUN DÉCALAGE DE MISE EN PAGE : les segments ont leur largeur finale dès
 * le rendu ; seule une transformation les révèle.
 *
 * Monochrome. Achat = contour vide (le coût connu, borné) ; maintenance =
 * aplat d'encre (la masse qu'on ne voit pas venir). Ni teinte, ni dégradé.
 */

const BASE_ACHAT = 100_000; // CHF — base d'exemple, installation adaptée
const SURDIM = 2.15; // +115 % à l'achat pour un facteur 2 (OptiPower 2023)
const TAUX_ENTRETIEN = 0.0194; // par an, sur la valeur à neuf (Bahr & Bossmann)
const ANNEES = 25;

const maintenance = (achat: number) =>
  Math.round(achat * TAUX_ENTRETIEN * ANNEES);

const LIGNES = [
  { key: "adaptee", nom: "Installation adaptée", achat: BASE_ACHAT },
  { key: "inadaptee", nom: "Installation inadaptée", achat: Math.round(BASE_ACHAT * SURDIM) },
].map((l) => ({
  ...l,
  maintenance: maintenance(l.achat),
  total: l.achat + maintenance(l.achat),
}));

const MAX = Math.max(...LIGNES.map((l) => l.total));

/** 104275 → « 104’275 » — séparateur de milliers suisse, apostrophe typographique. */
const chf = (n: number) => n.toLocaleString("de-CH").replace(/[’'’]/g, "’");

/** Pompe à chaleur monobloc : carter, ventilateur à trois pales, deux départs. */
function Equipement() {
  return (
    <svg
      className={s.icone}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.5" y="5.5" width="13.5" height="12" rx="1.2" />
      <circle cx="9.25" cy="11.5" r="3.5" />
      <path d="M9.25 11.5V8.4M9.25 11.5l2.7 1.55M9.25 11.5l-2.7 1.55" />
      <path d="M16 9h5.5M16 14h5.5" />
      <path d="M5 17.5v2M13.5 17.5v2" />
    </svg>
  );
}

export function CoutInstallation() {
  const ref = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<"plein" | "attente" | "joue">("plein");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Les barres sont pleines au rendu, et elles le RESTENT si la figure est
    // déjà à l'écran au montage : replier sous les yeux du lecteur ferait un
    // flash. On ne replie que ce qui est hors champ, pour le rejouer quand il
    // y arrive. La première notification de l'observateur dit où l'on en est.
    let premiere = true;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (premiere) {
          premiere = false;
          if (e.intersectionRatio > 0) {
            io.disconnect(); // visible, même en partie : rien à jouer
            return;
          }
          setEtat("attente");
          return;
        }
        if (!e.isIntersecting) return;
        io.disconnect();
        // Une image d'attente pour que le passage attente → joué soit bien une
        // transition, et non un état initial.
        raf = requestAnimationFrame(() => setEtat("joue"));
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={s.figure} ref={ref} data-etat={etat}>
      {LIGNES.map((l) => (
        <div className={s.rangee} key={l.key}>
          <Equipement />
          <div className={s.contenu}>
            <p className={`label ${s.nom}`}>{l.nom}</p>

            <div
              className={s.barre}
              role="img"
              aria-label={`${l.nom} : achat ${chf(l.achat)} francs, maintenance sur ${ANNEES} ans ${chf(l.maintenance)} francs, total ${chf(l.total)} francs.`}
            >
              <span
                className={s.achat}
                style={{ flexBasis: `${(l.achat / MAX) * 100}%` }}
              />
              <span
                className={s.maint}
                style={{ flexBasis: `${(l.maintenance / MAX) * 100}%` }}
              />
            </div>

            <dl className={s.montants}>
              <div className={s.poste}>
                <span className={s.pastille} data-fill="achat" aria-hidden="true" />
                <dt>Coût d’achat</dt>
                <dd>
                  CHF&nbsp;<CountUp to={l.achat} format={chf} />
                </dd>
              </div>
              <div className={s.poste}>
                <span className={s.pastille} data-fill="maint" aria-hidden="true" />
                <dt>Coût de maintenance, {ANNEES}&nbsp;ans</dt>
                <dd>
                  CHF&nbsp;<CountUp to={l.maintenance} format={chf} />
                </dd>
              </div>
              <div className={`${s.poste} ${s.total}`}>
                <dt>Total</dt>
                <dd>
                  CHF&nbsp;<CountUp to={l.total} format={chf} />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ))}

      <p className={s.exemple}>
        Exemple illustratif — base 100’000&nbsp;CHF d’achat pour l’installation
        adaptée. Les rapports viennent d’études publiées&nbsp;: surcoût
        d’achat d’une installation surdimensionnée, OST pour l’Office fédéral
        de l’énergie, 2023&nbsp;; entretien 1,94&nbsp;% par an de la valeur à
        neuf, 136&nbsp;bâtiments, 2013.
      </p>
    </div>
  );
}
