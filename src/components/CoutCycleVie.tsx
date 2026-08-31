import s from "./CoutCycleVie.module.css";

/**
 * Coût sur la durée de vie d'une installation technique — barre de composition.
 *
 * SOURCE — ce sont des ordres de grandeur de la LITTÉRATURE DU MÉTIER (analyse
 * de coût global, life-cycle cost analysis), pas une statistique de VRD ni un
 * chiffre inventé :
 *   · prix d'achat initial ......... 10 à 25 % du coût total de possession
 *   · énergie sur la durée de vie .. 3 à 4 fois le prix d'achat
 *   · entretien et réparations ..... 1 à 2 fois le prix d'achat
 * Soit, aux valeurs médianes, un coût total de 5 à 7 fois le prix d'achat, dont
 * le prix d'achat lui-même ne représente qu'environ un sixième.
 * Réf. : Consulting-Specifying Engineer, « LCCA for HVAC systems » ; ASHRAE,
 * « Economic Analyses and Life-Cycle Costs ».
 *
 * Les proportions du graphique sont calculées depuis SEGMENTS : la barre ne
 * peut pas diverger des chiffres annoncés.
 *
 * Monochrome : les trois postes se distinguent par le REMPLISSAGE — aplat
 * d'encre, hachures, hachures espacées — jamais par la couleur. Cela survit à
 * l'impression en noir et blanc, comme les schémas du dossier.
 */
const SEGMENTS = [
  { key: "achat", label: "Prix d’achat", part: 1, fill: "solid" },
  { key: "energie", label: "Énergie", part: 3.5, fill: "hatch" },
  { key: "entretien", label: "Entretien et réparations", part: 1.5, fill: "light" },
] as const;

const TOTAL = SEGMENTS.reduce((t, x) => t + x.part, 0); // = 6
const pct = (p: number) => (p / TOTAL) * 100;

export function CoutCycleVie() {
  // Position cumulée de chaque segment, en pourcentage de la barre. Calcul pur :
  // muter un accumulateur pendant le rendu est refusé par le compilateur React.
  const placed = SEGMENTS.map((seg, i) => ({
    ...seg,
    x: SEGMENTS.slice(0, i).reduce((t, p) => t + pct(p.part), 0),
    w: pct(seg.part),
  }));

  return (
    <figure className={s.figure}>
      <figcaption className={s.head}>
        <p className={`label ${s.kicker}`}>Coût réel sur la durée de vie</p>
        <p className={s.lead}>
          <span className={s.leadValue}>5 à 7×</span>
          <span className={s.leadLabel}>
            ce qu’une installation coûte réellement, rapporté à son prix d’achat
          </span>
        </p>
      </figcaption>

      <svg
        className={s.chart}
        viewBox="0 0 100 26"
        role="img"
        aria-label="Composition du coût total d’une installation technique sur sa durée de vie : le prix d’achat représente environ 17 %, l’énergie environ 58 %, l’entretien et les réparations environ 25 %."
      >
        <defs>
          <pattern id="ccv-hatch" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="1.4" />
          </pattern>
          <pattern id="ccv-light" width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="4.5" stroke="currentColor" strokeWidth="0.9" />
          </pattern>
        </defs>

        {placed.map((seg) => (
          <rect
            key={seg.key}
            x={seg.x}
            y={0}
            width={seg.w}
            height={14}
            className={s.seg}
            fill={
              seg.fill === "solid"
                ? "currentColor"
                : seg.fill === "hatch"
                  ? "url(#ccv-hatch)"
                  : "url(#ccv-light)"
            }
          />
        ))}

        {/* Cotation : le prix d'achat, la part que l'on croit payer. */}
        <g className={s.dim}>
          <line x1={0} y1={18} x2={placed[0].w} y2={18} />
          <line x1={0} y1={15.5} x2={0} y2={20.5} />
          <line x1={placed[0].w} y1={15.5} x2={placed[0].w} y2={20.5} />
        </g>
        <text className={s.dimText} x={0} y={25}>
          ≈ 17 % — CE QUE L’ON COMPARE À L’ACHAT
        </text>
      </svg>

      <ul className={s.legend}>
        {placed.map((seg) => (
          <li key={seg.key}>
            <span className={s.swatch} data-fill={seg.fill} aria-hidden="true" />
            <span className={s.legLabel}>{seg.label}</span>
            <span className={s.legValue}>{Math.round(seg.w)}&nbsp;%</span>
          </li>
        ))}
      </ul>

      <p className={s.source}>
        Ordres de grandeur issus de l’analyse de coût global du métier — énergie
        3 à 4× et entretien 1 à 2× le prix d’achat sur la durée de service.
        Sources&nbsp;: Consulting-Specifying Engineer, ASHRAE. Valeurs
        indicatives, non propres à un projet.
      </p>
    </figure>
  );
}
