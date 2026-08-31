"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import s from "./BilanEnergetique.module.css";

const iv = (n: number) => ({ "--i": n }) as CSSProperties;

/* Tête de flèche : chevron ouvert, pointe en (x, y), orienté par le vecteur (dx, dy). */
const head = (x: number, y: number, dx: number, dy: number, len = 11) => {
  const a = Math.atan2(dy, dx);
  const a1 = a - 0.38;
  const a2 = a + 0.38;
  const p1x = (x - len * Math.cos(a1)).toFixed(1);
  const p1y = (y - len * Math.sin(a1)).toFixed(1);
  const p2x = (x - len * Math.cos(a2)).toFixed(1);
  const p2y = (y - len * Math.sin(a2)).toFixed(1);
  return `M${p1x} ${p1y} L${x} ${y} L${p2x} ${p2y}`;
};

/* Pan gauche de la toiture : de (344, 200) à (490, 130).
   Direction unitaire (0.9018, -0.4323), normale sortante (-0.4323, -0.9018).
   Le champ de capteurs occupe l'abscisse curviligne t = 32 à 132, à 6 et 20 de déport. */
const HACHURES_CAPTEUR = Array.from({ length: 9 }, (_, k) => {
  const t = 42 + k * 10;
  const bx = 344 + 0.9018 * t - 2.59;
  const by = 200 - 0.4323 * t - 5.41;
  const tx = 344 + 0.9018 * (t + 8) - 8.65;
  const ty = 200 - 0.4323 * (t + 8) - 18.04;
  return `M${bx.toFixed(1)} ${by.toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}`;
}).join(" ");

/* Terrain : hachures sous la ligne de sol (y = 400), interrompues au droit des sondes. */
const HACHURES_SOL = Array.from({ length: 32 }, (_, k) => 70 + k * 22)
  .filter((x) => !(x > 166 && x < 210) && !(x > 236 && x < 280))
  .map((x) => `M${x} 400 L${x - 11} 412`)
  .join(" ");

type Poste = {
  cle: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ep: number;
  texte: string;
  ly: number;
};

/* Déperditions : flux sortants, épaisseur du tireté proportionnelle au poste. */
const DEPERDITIONS: Poste[] = [
  { cle: "toiture", x1: 566, y1: 166, x2: 770, y2: 96, ep: 1.5, texte: "TOITURE · 18 %", ly: 100 },
  { cle: "ventilation", x1: 630, y1: 218, x2: 770, y2: 168, ep: 1.7, texte: "VENTILATION · 23 %", ly: 172 },
  { cle: "murs", x1: 630, y1: 265, x2: 770, y2: 240, ep: 1.8, texte: "MURS · 26 %", ly: 244 },
  { cle: "fenetres", x1: 630, y1: 346, x2: 770, y2: 312, ep: 1.6, texte: "FENÊTRES · 21 %", ly: 316 },
  { cle: "plancher", x1: 630, y1: 392, x2: 770, y2: 380, ep: 1.2, texte: "PLANCHER · 12 %", ly: 384 },
];

const CLASSES = ["A", "B", "C", "D", "E", "F", "G"];

export function BilanEnergetique() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.draw = "done";
      return;
    }
    el.dataset.draw = "pending";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.dataset.draw = "true";
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={s.svg}
      viewBox="0 0 1000 560"
      role="img"
      aria-label={
        "Bilan énergétique d’un bâtiment, schéma de principe. Coupe d’un bâtiment de deux niveaux sous une toiture à deux pans : des capteurs photovoltaïques hachurés sont posés sur le pan gauche et reçoivent trois rayons solaires ; une liaison électrique en tireté descend des capteurs vers un onduleur, puis vers la pompe à chaleur dessinée au sol à gauche avec son compresseur, son condenseur et deux sondes géothermiques en U plongeant sous le terrain hachuré ; une conduite d’alimentation en trait plein épais relie la pompe à chaleur au bâtiment. Cinq flèches en tireté fin sortent à droite et chiffrent les déperditions : toiture 18 %, ventilation 23 %, murs 26 %, fenêtres 21 %, plancher 12 %. En partie basse, une échelle de performance graduée de A à G situe le bâtiment en classe B. Données portées sur la figure : 18 m² de capteurs pour 3,8 kWc, coefficient de performance 4,2, puissance 8,4 kW, deux sondes de 100 m, 240 m² chauffés à 20 °C et un besoin de chaleur de 42 kWh par m² et par an."
      }
    >
      {/* Ligne de terrain fini */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2.2} d="M56 400 L768 400" />

      {/* Enveloppe : toiture à deux pans, plafond, murs */}
      <path
        className={s.pipe}
        style={iv(1)}
        pathLength={1}
        strokeWidth={2}
        d="M344 200 L490 130 L636 200 M360 200 L620 200 M360 200 L360 400 M620 200 L620 400"
      />

      {/* Séparation des deux niveaux */}
      <path className={s.pipe} style={iv(2)} pathLength={1} strokeWidth={1.4} d="M360 300 L620 300" />

      {/* Champ de capteurs posé sur le pan gauche */}
      <path
        className={s.pipe}
        style={iv(3)}
        pathLength={1}
        strokeWidth={1.8}
        d="M370.3 180.8 L460.4 137.5 L454.4 124.9 L364.3 168.2 Z"
      />

      {/* Pompe à chaleur : enveloppe du local technique */}
      <path
        className={s.pipe}
        style={iv(4)}
        pathLength={1}
        strokeWidth={2}
        d="M140 310 L290 310 L290 400 L140 400 Z"
      />

      {/* Sondes géothermiques : deux boucles en U sous le terrain */}
      <path
        className={s.pipe}
        style={iv(5)}
        pathLength={1}
        strokeWidth={2}
        d="M178 400 L178 442 A10 10 0 0 0 198 442 L198 400 M248 400 L248 442 A10 10 0 0 0 268 442 L268 400"
      />

      {/* Apport solaire : rayons incidents, trait plein */}
      <path
        className={s.pipe}
        style={iv(6)}
        pathLength={1}
        strokeWidth={2.2}
        d="M330.9 85.2 L380.4 160.4 M358 72.2 L407.5 147.4 M385 59.2 L434.5 134.4"
      />

      {/* Conduite principale d'alimentation en chaleur : trait plein épais */}
      <path className={s.pipe} style={iv(7)} pathLength={1} strokeWidth={2.6} d="M272 352 L356 352" />

      {/* Échelle de performance : sept segments de A à G */}
      <path
        className={s.pipe}
        style={iv(8)}
        pathLength={1}
        strokeWidth={1.8}
        d="M360 496 L780 496 L780 528 L360 528 Z M420 496 L420 528 M480 496 L480 528 M540 496 L540 528 M600 496 L600 528 M660 496 L660 528 M720 496 L720 528"
      />

      {/* Liaison électrique : capteurs, onduleur, pompe à chaleur (tireté fin) */}
      <path
        className={s.pipeDashed}
        strokeWidth={1.5}
        d="M367 174 L336 174 L336 286 L262 286 L262 306"
      />

      {/* Déperditions : flux sortants, tireté fin */}
      {DEPERDITIONS.map((p) => (
        <path
          key={p.cle}
          className={s.pipeDashed}
          strokeWidth={p.ep}
          d={`M${p.x1} ${p.y1} L${p.x2} ${p.y2}`}
        />
      ))}

      {/* Symboles */}
      <g className={s.sym} fill="none">
        {/* Hachures : terrain et capteurs */}
        <path strokeWidth={1.2} d={HACHURES_SOL} />
        <path strokeWidth={1.2} d={HACHURES_CAPTEUR} />

        {/* Sens des apports solaires */}
        <path strokeWidth={2.2} d={head(380.4, 160.4, 0.55, 0.835, 10)} />
        <path strokeWidth={2.2} d={head(407.5, 147.4, 0.55, 0.835, 10)} />
        <path strokeWidth={2.2} d={head(434.5, 134.4, 0.55, 0.835, 10)} />

        {/* Sens du départ de chaleur et de l'alimentation électrique */}
        <path strokeWidth={2.6} d={head(356, 352, 1, 0, 12)} />
        <path strokeWidth={1.6} d={head(262, 310, 0, 1, 10)} />

        {/* Onduleur */}
        <rect className={s.node} x={328} y={222} width={16} height={16} strokeWidth={1.4} />
        <path strokeWidth={1.1} d="M331 235 L341 225" />

        {/* Compresseur et condenseur */}
        <circle className={s.node} cx={196} cy={352} r={24} strokeWidth={1.6} />
        <path className={s.solid} d="M187 338 L216 352 L187 366 Z" />
        <path strokeWidth={1.6} d="M220 352 L240 352" />
        <path
          strokeWidth={1.4}
          d="M240 330 L272 330 L272 342 L240 342 L240 354 L272 354 L272 366 L240 366"
        />

        {/* Circulation dans les sondes : descente et remontée */}
        <path strokeWidth={1.6} d={head(178, 426, 0, 1, 9)} />
        <path strokeWidth={1.6} d={head(198, 414, 0, -1, 9)} />
        <path strokeWidth={1.6} d={head(248, 426, 0, 1, 9)} />
        <path strokeWidth={1.6} d={head(268, 414, 0, -1, 9)} />

        {/* Bouche de ventilation */}
        <rect className={s.node} x={612} y={206} width={16} height={16} strokeWidth={1.4} />
        <path strokeWidth={1.1} d="M615 211 L625 211 M615 217 L625 217" />

        {/* Fenêtres */}
        <rect className={s.node} x={612} y={330} width={16} height={32} strokeWidth={1.4} />
        <path strokeWidth={1.1} d="M612 346 L628 346" />
        <rect className={s.node} x={352} y={236} width={16} height={32} strokeWidth={1.4} />
        <path strokeWidth={1.1} d="M352 252 L368 252" />

        {/* Sens des déperditions */}
        {DEPERDITIONS.map((p) => (
          <path
            key={p.cle}
            strokeWidth={p.ep + 0.2}
            d={head(p.x2, p.y2, p.x2 - p.x1, p.y2 - p.y1, 10)}
          />
        ))}

        {/* Repère de la classe atteinte */}
        <path className={s.solid} d="M436 475 L464 475 L450 490 Z" />
      </g>

      {/* Étiquettes */}
      <text className={s.lab} x={56} y={44}>
        {"BILAN ÉNERGÉTIQUE"}
      </text>

      <text className={s.lab} x={310} y={88} textAnchor="end">
        {"PHOTOVOLTAÏQUE"}
      </text>
      <text className={s.lab} x={310} y={110} textAnchor="end">
        {"18 M² · 3,8 KWC"}
      </text>
      <text className={s.lab} x={322} y={234} textAnchor="end">
        {"ONDULEUR"}
      </text>

      <text className={s.lab} x={205} y={274} textAnchor="middle">
        {"POMPE À CHALEUR"}
      </text>
      <text className={s.lab} x={205} y={294} textAnchor="middle">
        {"COP 4,2"}
      </text>
      <text className={s.lab} x={320} y={338} textAnchor="middle">
        {"8,4 KW"}
      </text>

      <text className={s.lab} x={223} y={478} textAnchor="middle">
        {"SONDES GÉOTHERMIQUES"}
      </text>
      <text className={s.lab} x={223} y={500} textAnchor="middle">
        {"2 × 100 M"}
      </text>

      <text className={s.lab} x={490} y={244} textAnchor="middle">
        {"BESOIN DE CHALEUR"}
      </text>
      <text className={s.lab} x={490} y={266} textAnchor="middle">
        {"42 KWH/M²·AN"}
      </text>
      <text className={s.lab} x={490} y={352} textAnchor="middle">
        {"240 M² · 20 °C"}
      </text>

      <text className={s.lab} x={782} y={64}>
        {"DÉPERDITIONS"}
      </text>
      {DEPERDITIONS.map((p) => (
        <text key={p.cle} className={s.lab} x={782} y={p.ly}>
          {p.texte}
        </text>
      ))}

      <text className={s.lab} x={450} y={464} textAnchor="middle">
        {"CLASSE B"}
      </text>
      <text className={s.lab} x={780} y={464} textAnchor="end">
        {"ÉTIQUETTE ÉNERGÉTIQUE"}
      </text>
      {CLASSES.map((c, k) => (
        <text
          key={c}
          className={c === "B" ? `${s.lab} ${s.classe} ${s.classeAtteinte}` : `${s.lab} ${s.classe}`}
          x={390 + k * 60}
          y={517}
          textAnchor="middle"
        >
          {c}
        </text>
      ))}
    </svg>
  );
}
