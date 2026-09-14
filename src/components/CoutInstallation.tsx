"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp } from "./CountUp";
import s from "./CoutInstallation.module.css";

/**
 * Deux installations, deux barres de coût — la figure de la section
 * « Notre approche ».
 *
 * CE QU'ELLE MONTRE. Le croisement. Une ligne par installation : un
 * pictogramme d'équipement, puis une barre en deux segments — ce qu'on paie
 * à l'achat, ce qu'on paie pendant les vingt ans qui suivent — et les
 * montants. La première installation est la moins chère à l'achat : son
 * contour est le plus court. Mais sa barre est la plus LONGUE au total.
 * La seconde coûte un peu plus le premier jour, et beaucoup moins ensuite.
 * C'est l'argument du bureau, et c'est tout ce que la figure dit.
 *
 * LES MONTANTS SONT UN EXEMPLE, et la figure le dit à l'écran. Ils ne
 * viennent d'aucun cas réel ni d'aucune étude : aucune source publique ne
 * chiffre « la moins chère à l'achat contre la moins chère sur la durée »
 * pour une installation CVCS — cherché, non trouvé (14.09.2026). Ce sont des
 * montants fictifs, ronds, posés pour lire un PRINCIPE : le second segment
 * regroupe l'énergie, l'entretien et les réparations — les trois postes qui
 * courent après l'achat. Un cas du bureau, anonymisé, peut les remplacer.
 *
 * MOUVEMENT — « le dessin s'assemble », l'unique idée du site. Quand le
 * lecteur amène la figure à l'écran, l'achat se trace, puis les vingt ans le
 * prolongent d'une poussée ; les montants comptent EN MÊME TEMPS (CountUp en
 * mode piloté : c'est cette figure qui donne le départ, pas chaque nombre
 * pour lui-même), puis l'écart se compte en dernier — c'est la conclusion.
 * L'ordre gauche → droite est aussi l'ordre du temps : d'abord l'achat, puis
 * les années. C'est ce qui fait lire le croisement sans axe.
 *
 * DURÉE — EXCEPTION CONSIGNÉE (AGENTS.md, 14.09.2026). 600 + 600 ms pour les
 * barres, 600 ms pour l'écart : 1,8 s en tout, au-dessus du plafond de 400 ms
 * qui vaut partout ailleurs. À 360 ms, on ne voyait pas les barres
 * s'élargir — constat de Sacha. Les durées vivent ICI, en une seule table,
 * et sont passées à la feuille de style en propriétés personnalisées : le
 * CSS ne peut pas diverger des compteurs.
 *
 * Sans JavaScript, ou sous `prefers-reduced-motion`, les barres sont rendues
 * pleines d'emblée : l'animation est un enrichissement, jamais une condition.
 * Le repli `scaleX(0)` n'est posé QUE par le script, juste avant de jouer.
 *
 * AUCUN DÉCALAGE DE MISE EN PAGE : les segments ont leur largeur finale dès
 * le rendu ; seule une transformation les révèle.
 *
 * Monochrome. Achat = contour vide (le coût connu, borné, celui qu'on
 * compare) ; les vingt ans = aplat d'encre (la masse qu'on ne voit pas
 * venir). Ni teinte, ni dégradé.
 */

const ANNEES = 20;

/** Les temps de la figure, en ms — la seule table. */
const T = {
  achat: 600, // l'achat se trace
  suite: 600, // les vingt ans le prolongent, dès que l'achat a fini
  ecart: 600, // l'écart se compte, une fois les deux barres posées
};
const T_BARRES = T.achat + T.suite;

/** L'état de la figure, traduit pour les compteurs. */
const PILOTE = { plein: "final", attente: "zero", joue: "compte" } as const;

const LIGNES = [
  {
    key: "prix",
    nom: "La moins chère à l’achat",
    choix: false,
    achat: 80_000,
    suite: 240_000,
  },
  {
    key: "duree",
    nom: "La moins chère sur vingt ans",
    choix: true,
    achat: 100_000,
    suite: 170_000,
  },
].map((l) => ({ ...l, total: l.achat + l.suite }));

const MAX = Math.max(...LIGNES.map((l) => l.total));

/** Ce que la seconde fait économiser sur vingt ans, malgré l'achat plus cher. */
const ECART = LIGNES[0].total - LIGNES[1].total;
const SURCOUT_ACHAT = LIGNES[1].achat - LIGNES[0].achat;

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
      // 0,4 et non 0,6 : la figure est haute, et l'animation est longue —
      // elle part dès que le lecteur en voit une bonne part, pour qu'il la
      // voie jouer, pas finir.
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={s.figure}
      ref={ref}
      data-etat={etat}
      style={
        {
          "--t-achat": `${T.achat}ms`,
          "--t-suite": `${T.suite}ms`,
        } as React.CSSProperties
      }
    >
      {LIGNES.map((l) => (
        <div className={s.rangee} key={l.key}>
          <Equipement />
          <div className={s.contenu}>
            <p className={`label ${s.nom}`}>
              {l.nom}
              {l.choix && <span className={s.choix}>Notre choix</span>}
            </p>

            <div
              className={s.barre}
              role="img"
              aria-label={`${l.nom} : ${chf(l.achat)} francs à l’achat, ${chf(l.suite)} francs sur les ${ANNEES} ans qui suivent, ${chf(l.total)} francs au total.`}
            >
              <span
                className={s.achat}
                style={{ flexBasis: `${(l.achat / MAX) * 100}%` }}
              />
              <span
                className={s.suite}
                style={{ flexBasis: `${(l.suite / MAX) * 100}%` }}
              />
            </div>

            <dl className={s.montants}>
              <div className={s.poste}>
                <span className={s.pastille} data-fill="achat" aria-hidden="true" />
                <dt>À l’achat</dt>
                <dd>
                  CHF&nbsp;
                  <CountUp
                    to={l.achat}
                    format={chf}
                    pilote={PILOTE[etat]}
                    duration={T.achat}
                  />
                </dd>
              </div>
              <div className={s.poste}>
                <span className={s.pastille} data-fill="suite" aria-hidden="true" />
                <dt>Les {ANNEES}&nbsp;ans qui suivent</dt>
                <dd>
                  CHF&nbsp;
                  <CountUp
                    to={l.suite}
                    format={chf}
                    pilote={PILOTE[etat]}
                    delay={T.achat}
                    duration={T.suite}
                  />
                </dd>
              </div>
              <div className={`${s.poste} ${s.total}`}>
                <dt>Total</dt>
                <dd>
                  CHF&nbsp;
                  <CountUp
                    to={l.total}
                    format={chf}
                    pilote={PILOTE[etat]}
                    duration={T_BARRES}
                  />
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ))}

      {/* La conclusion en un chiffre — ce que le lecteur veut lire. Une ligne
          de total, alignée sur les barres, pas sur les pictogrammes. */}
      <p className={s.ecart}>
        <span className={s.ecartNom}>
          Économisé sur {ANNEES}&nbsp;ans, pour {chf(SURCOUT_ACHAT)}&nbsp;francs
          de plus à l’achat
        </span>
        <span className={s.ecartVal}>
          CHF&nbsp;
          <CountUp
            to={ECART}
            format={chf}
            pilote={PILOTE[etat]}
            delay={T_BARRES}
            duration={T.ecart}
          />
        </span>
      </p>

      <p className={s.exemple}>
        Exemple illustratif, montants fictifs&nbsp;: la figure montre le
        principe, pas un cas réel. «&nbsp;Les {ANNEES}&nbsp;ans qui
        suivent&nbsp;» regroupent l’énergie, l’entretien et les réparations.
      </p>
    </div>
  );
}
