import s from "./CoutCycleVie.module.css";

/**
 * Coût d'une installation mal dimensionnée — comparaison à deux colonnes.
 *
 * CE QUE LA FIGURE DIT, et pourquoi ce n'est pas ce qu'on croit.
 * L'intuition du maître d'ouvrage est « économiser à l'achat coûte cher
 * ensuite ». Les données publiées ne disent pas cela. Le défaut courant n'est
 * pas le matériel bon marché : c'est le SURDIMENSIONNEMENT, et il coûte plus
 * cher DÈS L'ACHAT. L'installation mal étudiée n'économise rien, jamais — elle
 * est payée deux fois. C'est un argument pour l'étude, pas pour le matériel.
 *
 * LES DEUX SEULS CHIFFRES EMPILÉS, et d'où ils viennent.
 *
 *  1. Investissement — « Eine Überdimensionierung um den Faktor 2 erhöht die
 *     Investitionskosten bei einer reinen Wärmepumpenlösung um ca. 115 % ».
 *     OST (Institut SPF + Institut IET) sur mandat de l'OFEN, des cantons de
 *     Bâle-Ville et Zurich et de la Ville de Zurich, factsheet OptiPower 2023.
 *     C'est UN cas calculé, l'immeuble de bureaux OST-FZ à Rapperswil : la
 *     figure le nomme et ne le présente jamais comme une règle générale.
 *
 *  2. Entretien — 1,94 % par an de la valeur de remplacement à neuf des
 *     installations techniques (DIN 276 groupe 400), extrêmes 0,5 à 9 %.
 *     Bahr (Hochschule Karlsruhe) et Bossmann (KIT), 136 bâtiments publics
 *     allemands, Journal für Facility Management 7/2013.
 *
 * L'HYPOTHÈSE, posée à l'écran plutôt que cachée : le même taux d'entretien
 * est appliqué aux deux colonnes. Ce n'est pas un artifice, c'est le mécanisme
 * même — l'entretien se calcule sur la valeur à neuf, donc une installation
 * qui vaut deux fois plus coûte deux fois plus à entretenir, chaque année,
 * pendant toute sa vie. Le surcoût d'investissement ne se rattrape pas : il se
 * reproduit.
 *
 * CE QUI N'EST PAS DANS LES BARRES, et pourquoi.
 * L'énergie et la durée de vie manquent volontairement. Les seules valeurs
 * publiées (« parfois 20 à 40 % de durée de vie en moins », « peut augmenter
 * la consommation de 30 % ») portent sur une pompe à chaleur air-eau à
 * onduleur, viennent d'une SIMULATION, et la même source publie le
 * contre-exemple pour les PAC saumure-eau. Elles sont donc énoncées sous la
 * figure, avec leurs réserves, et ne sont pas converties en hauteur de barre :
 * une barre est une affirmation de quantité, un texte peut porter un « parfois ».
 *
 * Monochrome : les deux postes se distinguent par le REMPLISSAGE — aplat
 * d'encre, hachures — jamais par la teinte. Survit à l'impression noir et blanc.
 */

/** Base 100 = l'investissement de l'installation dimensionnée. */
const INVEST_JUSTE = 100;
const INVEST_SURDIM = 215; // +115 % (OST-FZ, factsheet OptiPower 2023)

const TAUX_ENTRETIEN = 0.0194; // par an, sur la valeur à neuf (Bahr & Bossmann)
const ANNEES = 25;

const entretien = (invest: number) =>
  Math.round(invest * TAUX_ENTRETIEN * ANNEES);

const COLONNES = [
  {
    key: "juste",
    titre: "Adaptée",
    sous: "puissance juste",
    invest: INVEST_JUSTE,
  },
  {
    key: "surdim",
    titre: "Trop grosse",
    sous: "puissance doublée",
    invest: INVEST_SURDIM,
  },
].map((c) => ({
  ...c,
  entretien: entretien(c.invest),
  total: c.invest + entretien(c.invest),
}));

const MAX = Math.max(...COLONNES.map((c) => c.total));

/* Géométrie du dessin, en unités du viewBox.
   La colonne de droite du viewBox est RÉSERVÉE à la cote : rien ne doit sortir
   de la boîte. Un texte SVG qui déborde ne se contente pas d'être laid — il
   élargit la page et fait apparaître une barre de défilement horizontale sur
   tout le site. */
const H = 100; // hauteur utile des barres
const L = 26; // largeur d'une barre
const X = [12, 50]; // abscisse de chaque barre
const SOL = 116; // ligne de sol
const COTE_X = 79; // axe de la ligne de cote
/* Le viewBox reserve du CIEL au-dessus de la plus haute colonne : le total y
   est ecrit, et une hampe qui sort du cadre est coupee net depuis que la boite
   ne laisse plus rien deborder. 116 - 100 (hauteur utile) = 16 unites de marge
   haute, contre 8 auparavant — la ligne de base du total passe de y=4 a y=11,
   ses hampes rentrent. */
const VB = "0 0 108 136";

export function CoutCycleVie() {
  const echelle = (v: number) => (v / MAX) * H;

  return (
    <figure className={s.figure}>
      <figcaption className={s.head}>
        <p className={`label ${s.kicker}`}>Ce que coûte vraiment une installation</p>
        <p className={s.lead}>
          <span className={s.leadValue}>2,1×</span>
          <span className={s.leadLabel}>
            plus cher sur 25&nbsp;ans quand l’installation est trop grosse.
            Et le surcoût commence <strong>le jour de l’achat</strong>.
          </span>
        </p>
      </figcaption>

      <svg
        className={s.chart}
        viewBox={VB}
        role="img"
        aria-label={
          `Deux colonnes comparent le coût sur 25 ans. Installation adaptée, à la puissance juste : ` +
          `prix d’achat ${COLONNES[0].invest}, entretien et réparations ${COLONNES[0].entretien}, total ${COLONNES[0].total}. ` +
          `Installation trop grosse, à la puissance doublée : prix d’achat ${COLONNES[1].invest}, entretien et réparations ` +
          `${COLONNES[1].entretien}, total ${COLONNES[1].total}. Elle coûte plus cher à l’achat et à l’entretien.`
        }
      >
        <defs>
          <pattern
            id="ccv-hatch"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="1.2" />
          </pattern>
        </defs>

        {COLONNES.map((c, i) => {
          const hInvest = echelle(c.invest);
          const hEntretien = echelle(c.entretien);
          const yEntretien = SOL - hInvest - hEntretien;
          return (
            <g key={c.key}>
              {/* Investissement : aplat d'encre, posé au sol. */}
              <rect
                className={s.seg}
                x={X[i]}
                y={SOL - hInvest}
                width={L}
                height={hInvest}
                fill="currentColor"
              />
              {/* Entretien sur 25 ans : hachuré, empilé dessus. */}
              <rect
                className={s.seg}
                x={X[i]}
                y={yEntretien}
                width={L}
                height={hEntretien}
                fill="url(#ccv-hatch)"
              />
              {/* Total, en tête de colonne. */}
              <text className={s.total} x={X[i] + L / 2} y={yEntretien - 4}>
                {c.total}
              </text>
              {/* Étiquettes de pied. */}
              <text className={s.colTitre} x={X[i] + L / 2} y={SOL + 8}>
                {c.titre}
              </text>
              <text className={s.colSous} x={X[i] + L / 2} y={SOL + 14}>
                {c.sous}
              </text>
            </g>
          );
        })}

        {/* Ligne de sol — la seule règle du graphique. */}
        <line className={s.sol} x1={6} y1={SOL} x2={80} y2={SOL} />

        {/* Cotation de l'écart d'investissement : c'est LA surprise de la
            figure, elle mérite d'être cotée comme sur une planche. */}
        <g className={s.dim}>
          <line
            x1={COTE_X}
            y1={SOL - echelle(INVEST_JUSTE)}
            x2={COTE_X}
            y2={SOL - echelle(INVEST_SURDIM)}
          />
          <line
            x1={X[1] + L}
            y1={SOL - echelle(INVEST_JUSTE)}
            x2={COTE_X + 3}
            y2={SOL - echelle(INVEST_JUSTE)}
          />
          <line
            x1={X[1] + L}
            y1={SOL - echelle(INVEST_SURDIM)}
            x2={COTE_X + 3}
            y2={SOL - echelle(INVEST_SURDIM)}
          />
        </g>
        <text
          className={s.dimText}
          x={COTE_X + 5}
          y={SOL - (echelle(INVEST_JUSTE) + echelle(INVEST_SURDIM)) / 2}
        >
          <tspan x={COTE_X + 5} dy="-1.2">
            +115 %
          </tspan>
          <tspan x={COTE_X + 5} dy="4.4">
            à l’achat
          </tspan>
        </text>
      </svg>

      <ul className={s.legend}>
        <li>
          <span className={s.swatch} data-fill="solid" aria-hidden="true" />
          <span className={s.legLabel}>Prix d’achat</span>
          <span className={s.legValue}>
            100 → {INVEST_SURDIM}
          </span>
        </li>
        <li>
          <span className={s.swatch} data-fill="hatch" aria-hidden="true" />
          <span className={s.legLabel}>Entretien et réparations, {ANNEES}&nbsp;ans</span>
          <span className={s.legValue}>
            {COLONNES[0].entretien} → {COLONNES[1].entretien}
          </span>
        </li>
      </ul>

      <p className={s.mecanisme}>
        Plus une installation est grosse, plus elle coûte à acheter — et plus
        elle coûte à entretenir, chaque année, pendant toute sa vie.
      </p>

      {/* La source tient en deux lignes. Le détail — périmètre, réserves sur
          l'énergie et la durée de vie, ce qui a été écarté — vit dans le
          commentaire d'en-tête de ce fichier, pas à l'écran : une figure
          d'accueil se lit en une seconde ou ne se lit pas. */}
      <p className={s.source}>
        Surcoût d’achat&nbsp;: cas calculé par la haute école OST pour l’Office
        fédéral de l’énergie, 2023. Entretien&nbsp;: 1,94&nbsp;% par an de la
        valeur à neuf, 136&nbsp;bâtiments, 2013. Ordres de grandeur.
      </p>
    </figure>
  );
}
