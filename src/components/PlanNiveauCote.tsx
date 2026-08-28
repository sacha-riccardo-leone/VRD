"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import s from "./PlanNiveauCote.module.css";

const iv = (n: number): CSSProperties => ({ "--i": n } as CSSProperties);

const range = (a: number, b: number, step: number): number[] =>
  Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, k) => a + k * step);

type Seg = [number, number, number, number];

// Hachures fines dans l'épaisseur des murs (traits ~45°), avec réserves aux ouvertures
const hatchTop: Seg[] = range(250, 674, 10).map((x): Seg => [x, 196, x + 16, 180]);
const hatchBottom: Seg[] = range(250, 674, 10)
  .filter((x) => !(x + 16 > 430 && x < 590))
  .map((x): Seg => [x, 470, x + 16, 454]);
const hatchLeft: Seg[] = range(196, 470, 10)
  .filter((y) => !(y > 250 && y - 16 < 340))
  .map((y): Seg => [250, y, 266, y - 16]);
const hatchRight: Seg[] = range(196, 470, 10).map((y): Seg => [674, y, 690, y - 16]);
const hatch: Seg[] = [...hatchTop, ...hatchBottom, ...hatchLeft, ...hatchRight];

const fins: number[] = range(458, 562, 13);

export function PlanNiveauCote() {
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
      viewBox="0 0 920 600"
      role="img"
      aria-label="Fragment de plan de niveau coté d'un local CVCS : pièce rectangulaire à murs en double trait hachuré, porte avec arc de débattement, fenêtre et radiateur, avec raccordement de chauffage en départ (trait plein) et retour (trait tireté) au régime 70/50 °C, repère de niveau +2,70 et chaînes de cotes en centimètres."
    >
      {/* MURS — double trait, tracé principal qui se dessine (cascade 0→3) */}
      <path className={s.pipe} style={iv(0)} pathLength={1} strokeWidth={2} d="M250 180 L690 180 M266 196 L674 196" />
      <path className={s.pipe} style={iv(1)} pathLength={1} strokeWidth={2} d="M690 180 L690 470 M674 196 L674 454" />
      <path className={s.pipe} style={iv(2)} pathLength={1} strokeWidth={2} d="M250 470 L430 470 M590 470 L690 470 M266 454 L430 454 M590 454 L674 454" />
      <path className={s.pipe} style={iv(3)} pathLength={1} strokeWidth={2} d="M250 180 L250 250 M250 340 L250 470 M266 196 L266 250 M266 340 L266 454" />

      {/* HACHURES dans l'épaisseur des murs */}
      <g className={s.sym}>
        {hatch.map((l, i) => (
          <line key={`h${i}`} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} strokeWidth={0.9} />
        ))}
      </g>

      {/* OUVERTURES + ÉQUIPEMENTS */}
      <g className={s.sym}>
        {/* jambages de la porte */}
        <line x1={250} y1={250} x2={266} y2={250} strokeWidth={1.6} />
        <line x1={250} y1={340} x2={266} y2={340} strokeWidth={1.6} />
        {/* vantail + arc de débattement (quart de cercle, rayon 90) */}
        <line x1={266} y1={340} x2={356} y2={340} strokeWidth={1.8} />
        <path d="M266 250 A90 90 0 0 1 356 340" strokeWidth={1.3} />
        {/* jambages de la fenêtre */}
        <line x1={430} y1={454} x2={430} y2={470} strokeWidth={1.6} />
        <line x1={590} y1={454} x2={590} y2={470} strokeWidth={1.6} />
        {/* fenêtre : dormant (2 faces) + ligne de vitrage */}
        <line x1={430} y1={454} x2={590} y2={454} strokeWidth={1.3} />
        <line x1={430} y1={462} x2={590} y2={462} strokeWidth={1.1} />
        <line x1={430} y1={470} x2={590} y2={470} strokeWidth={1.3} />
        {/* radiateur sous la fenêtre (corps + éléments) */}
        <rect x={445} y={420} width={130} height={20} strokeWidth={1.6} />
        {fins.map((x, i) => (
          <line key={`f${i}`} x1={x} y1={420} x2={x} y2={440} strokeWidth={1} />
        ))}
        {/* repère de niveau : trait de référence + triangle plein
            (remplissage via style inline : l'emporte sur .sym{fill:none}) */}
        <line x1={414} y1={335} x2={446} y2={335} strokeWidth={1.2} />
        <path d="M422 321 L438 321 L430 335 Z" style={{ fill: "currentColor", stroke: "none" }} />
      </g>

      {/* CHAUFFAGE — raccordement du radiateur : départ (plein, se dessine) / retour (tireté) + colonne */}
      <path className={s.pipe} style={iv(4)} pathLength={1} strokeWidth={2.2} d="M396 426 H445" />
      <path className={s.pipeDashed} strokeWidth={1.5} d="M445 434 H396" />
      <g className={s.sym}>
        {/* colonne montante */}
        <circle cx={396} cy={430} r={6} strokeWidth={1.3} />
        {/* flèche de sens — départ (vers le radiateur) */}
        <path d="M420 423 L425 426 L420 429" strokeWidth={1.3} />
        {/* flèche de sens — retour (vers la colonne) */}
        <path d="M421 431 L416 434 L421 437" strokeWidth={1.3} />
      </g>

      {/* CHAÎNES DE COTES (lignes fines + pattes + tirets aux stations) */}
      <g className={s.sym}>
        {/* haut — cote générale */}
        <line x1={250} y1={130} x2={690} y2={130} strokeWidth={1.2} />
        <line x1={250} y1={176} x2={250} y2={124} strokeWidth={1} />
        <line x1={690} y1={176} x2={690} y2={124} strokeWidth={1} />
        <line x1={245} y1={135} x2={255} y2={125} strokeWidth={1.4} />
        <line x1={685} y1={135} x2={695} y2={125} strokeWidth={1.4} />
        {/* bas — chaîne segmentée (position de la fenêtre) */}
        <line x1={250} y1={540} x2={690} y2={540} strokeWidth={1.2} />
        {[250, 430, 590, 690].map((x, i) => (
          <line key={`be${i}`} x1={x} y1={474} x2={x} y2={546} strokeWidth={1} />
        ))}
        {[250, 430, 590, 690].map((x, i) => (
          <line key={`bt${i}`} x1={x - 5} y1={545} x2={x + 5} y2={535} strokeWidth={1.4} />
        ))}
        {/* gauche — chaîne segmentée (position de la porte) */}
        <line x1={180} y1={180} x2={180} y2={470} strokeWidth={1.2} />
        {[180, 250, 340, 470].map((y, i) => (
          <line key={`le${i}`} x1={246} y1={y} x2={174} y2={y} strokeWidth={1} />
        ))}
        {[180, 250, 340, 470].map((y, i) => (
          <line key={`lt${i}`} x1={175} y1={y + 5} x2={185} y2={y - 5} strokeWidth={1.4} />
        ))}
        {/* droite — hauteur générale */}
        <line x1={760} y1={180} x2={760} y2={470} strokeWidth={1.2} />
        <line x1={694} y1={180} x2={766} y2={180} strokeWidth={1} />
        <line x1={694} y1={470} x2={766} y2={470} strokeWidth={1} />
        <line x1={755} y1={185} x2={765} y2={175} strokeWidth={1.4} />
        <line x1={755} y1={475} x2={765} y2={465} strokeWidth={1.4} />
      </g>

      {/* ÉTIQUETTES (majuscules, mono, révélées en dernier) */}
      <g className={s.lab}>
        <text x={60} y={54} textAnchor="start">PLAN DE NIVEAU · ÉCH. 1:50</text>
        <text x={860} y={54} textAnchor="end">COTES EN CM</text>

        <text x={470} y={121} textAnchor="middle">440</text>

        <text x={340} y={534} textAnchor="middle">180</text>
        <text x={510} y={534} textAnchor="middle">160</text>
        <text x={640} y={534} textAnchor="middle">100</text>

        <text x={168} y={215} textAnchor="middle" transform="rotate(-90 168 215)">70</text>
        <text x={168} y={295} textAnchor="middle" transform="rotate(-90 168 295)">90</text>
        <text x={168} y={405} textAnchor="middle" transform="rotate(-90 168 405)">130</text>

        <text x={776} y={325} textAnchor="middle" transform="rotate(-90 776 325)">290</text>

        <text x={520} y={250} textAnchor="middle" fontSize={15} letterSpacing="0.12em">LOCAL 01</text>
        <text x={520} y={272} textAnchor="middle" fontSize={12}>10,5 m²</text>

        <text x={452} y={331} textAnchor="start" fontSize={12}>HSFP +2,70</text>
        <text x={510} y={406} textAnchor="middle" fontSize={11}>RADIATEUR · 1200 W</text>
        <text x={388} y={434} textAnchor="end" fontSize={11}>CH · 70/50 °C</text>
        <text x={300} y={372} textAnchor="middle" fontSize={11}>P.01 · 90</text>
        <text x={510} y={516} textAnchor="middle" fontSize={11}>F.01 · 160/120</text>
      </g>
    </svg>
  );
}