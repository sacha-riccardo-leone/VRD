"use client";

import { useEffect, useRef, useState } from "react";
import { ThermalField } from "./ThermalField";
import s from "./Hero.module.css";

/**
 * Hero — portail blanc. Les lettres sont des fenêtres sur la page.
 *
 * Une plaque anthracite couvre l'écran, PERCÉE aux lettres « VRD ». Derrière
 * elle : la page réelle, qui défile normalement. On voit donc le document AU
 * TRAVERS du sigle — et comme le papier est clair, les lettres se lisent
 * blanches. C'est le portail de la variante (A), mais ce qu'il révèle n'est plus
 * une surface morte : c'est le contenu lui-même.
 *
 * Au défilement, le masque grandit autour d'un point pris dans le PLEIN du R.
 * Le trou s'élargit, on voit de plus en plus de page, jusqu'à ce que la plaque
 * ait entièrement disparu. La course vaut exactement un écran : quand le masque
 * est grand ouvert, la première section arrive en haut de l'écran — aucun temps
 * mort, aucune page blanche entre les deux.
 *
 * Le contrepoinçon du R — le vide enfermé dans sa panse — n'appartient pas au
 * glyphe : dans un masque texte il reste donc OPAQUE, îlot d'anthracite au
 * milieu du trou, qui grandit avec le reste et balaie l'écran. On le bouche :
 * un canvas hors écran dessine le R, une propagation depuis le bord distingue
 * l'extérieur de l'intérieur, et l'intérieur est rendu au masque en bandes. La
 * lettre devient un trou d'un seul tenant, et comme il fait toute la largeur du
 * R, il couvre l'écran bien plus vite qu'un fût seul.
 *
 * Le champ thermique se dessine PAR-DESSUS la plaque : il appartient à
 * l'anthracite, pas aux lettres. Il s'efface dès que la plongée commence.
 */

const HIDE_AT = 0.85;

/** Un rectangle de bouchage, en unités de viewBox. */
type Fill = { x: number; y: number; w: number; h: number };

export function Hero() {
  const plateRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  /** Rectangles qui bouchent le contrepoinçon du R dans le masque. */
  const [fills, setFills] = useState<Fill[]>([]);

  useEffect(() => {
    const plate = plateRef.current;
    const mask = maskRef.current;
    const text = measureRef.current;
    const field = fieldRef.current;
    const overlay = overlayRef.current;
    if (!plate || !mask || !text || !field || !overlay) return;

    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) {
      plate.dataset.portal = "off";
      return;
    }

    // ------------------------------------------------------------------
    // Le contrepoinçon du R doit être BOUCHÉ.
    //
    // Dans un masque texte, le glyphe fait le trou — mais le contrepoinçon, le
    // vide enfermé dans la panse, n'appartient pas au glyphe : il reste opaque.
    // C'est donc un îlot d'anthracite collé au fût, qui grandit avec le reste et
    // balaie l'écran avant de sortir. Aucun réglage de repère ne le corrige :
    // il faut le remplir.
    //
    // On repère l'intérieur par propagation depuis le bord du canvas : tout ce
    // qui n'est pas de l'encre et que le bord peut atteindre est EXTÉRIEUR ; le
    // reste est un contrepoinçon. On le rend au masque sous forme de bandes.
    // La lettre devient alors un trou d'un seul tenant — plus aucun îlot — et,
    // le trou faisant désormais toute la largeur du R et non celle du fût, il
    // couvre l'écran bien plus vite.
    // ------------------------------------------------------------------
    let ox = 593;
    let oy = 395;
    let maxScale = 40;

    const measure = () => {
      let rA = 500;
      let chasse = 186;
      try {
        const a2 = text.getStartPositionOfChar(1); // le R
        const b2 = text.getEndPositionOfChar(1);
        if (b2.x > a2.x) {
          rA = a2.x;
          chasse = b2.x - a2.x;
          oy = a2.y - 300 * 0.36;
        }
      } catch {
        // Texte pas encore mis en page : on garde le repli.
      }

      const out: Fill[] = [];
      try {
        const cs = getComputedStyle(text);
        const size = parseFloat(cs.fontSize) || 300;
        const W = Math.ceil(size * 1.3);
        const H = Math.ceil(size * 1.6);
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const c = cv.getContext("2d", { willReadFrequently: true });
        if (c) {
          const baseline = size * 1.15;
          c.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
          c.textBaseline = "alphabetic";
          c.fillStyle = "#000";
          c.fillText("R", 0, baseline);
          const px = c.getImageData(0, 0, W, H).data;

          const ink = (i: number) => px[i * 4 + 3] > 128;
          // Propagation depuis le bord : marque tout l'extérieur.
          const ext = new Uint8Array(W * H);
          const stack: number[] = [];
          for (let x = 0; x < W; x++) {
            stack.push(x, (H - 1) * W + x);
          }
          for (let y = 0; y < H; y++) {
            stack.push(y * W, y * W + W - 1);
          }
          while (stack.length) {
            const i = stack.pop() as number;
            if (ext[i] || ink(i)) continue;
            ext[i] = 1;
            const x = i % W;
            const y = (i - x) / W;
            if (x > 0) stack.push(i - 1);
            if (x < W - 1) stack.push(i + 1);
            if (y > 0) stack.push(i - W);
            if (y < H - 1) stack.push(i + W);
          }

          // Ce qui n'est ni encre ni extérieur : le contrepoinçon.
          const k = chasse / size; // canvas -> unités de viewBox
          for (let y = 0; y < H; y++) {
            let run = -1;
            for (let x = 0; x <= W; x++) {
              const i = y * W + x;
              const inside = x < W && !ink(i) && !ext[i];
              if (inside && run < 0) run = x;
              if (!inside && run >= 0) {
                out.push({
                  x: rA + run * k,
                  y: oy + (y - baseline + size * 0.36) * k,
                  w: (x - run) * k + 0.5,
                  h: k + 0.5,
                });
                run = -1;
              }
            }
          }
        }
      } catch {
        // Canvas indisponible : le contrepoinçon restera visible, sans plus.
      }
      setFills(out);

      // Le trou fait maintenant toute la largeur du R : on plonge en son centre.
      ox = rA + chasse * 0.5;
      const demi = Math.max(chasse * 0.34, 1);
      maxScale = Math.max(Math.max(ox, 1200 - ox) / demi, 12) * 1.5;
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const course = window.innerHeight;
      const p = clamp(window.scrollY / course);

      const scale = 1 + p * p * (maxScale - 1);
      mask.setAttribute(
        "transform",
        `translate(${ox} ${oy}) scale(${scale.toFixed(3)}) translate(${-ox} ${-oy})`,
      );

      // Le dessin ne se lit qu'au repos ; il s'efface dès la plongée.
      field.style.opacity = String(clamp(1 - p * 3));
      overlay.style.opacity = String(clamp(1 - p * 4));

      // Aucun fondu. À ce stade l'ouverture dépasse la fenêtre : la plaque
      // n'affiche plus un seul pixel d'anthracite, on peut donc la retirer sans
      // transition — personne ne peut voir disparaître ce qui ne se voyait déjà
      // plus. Cela libère aussi le contenu de tout recouvrement.
      plate.style.visibility = p >= HIDE_AT ? "hidden" : "visible";
    };

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    measure();
    apply();
    // La police arrive après le premier rendu : on remesure alors, sinon le
    // repère est calculé sur la police de repli.
    document.fonts?.ready.then(() => {
      measure();
      apply();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      {/* Course de défilement : exactement un écran. */}
      <div className={s.spacer} />

      <div ref={plateRef} className={`technique ${s.plate}`}>
        <svg
          className={s.panel}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask
              id="vrd-portal"
              maskUnits="userSpaceOnUse"
              x="-6000"
              y="-6000"
              width="18000"
              height="18000"
            >
              <rect x="-6000" y="-6000" width="18000" height="18000" fill="#fff" />
              <g ref={maskRef}>
                <text className={s.markText} x="600" y="500" textAnchor="middle" fill="#000">
                  VRD
                </text>
                {/* Bandes qui bouchent le contrepoinçon du R : sans elles il
                    reste un îlot opaque au milieu du trou, qui balaie l'écran
                    pendant la plongée. */}
                {fills.map((f, i) => (
                  <rect key={i} x={f.x} y={f.y} width={f.w} height={f.h} fill="#000" />
                ))}
              </g>
            </mask>
          </defs>

          {/* Jumeau de mesure : identique au texte du masque, mais RENDU —
              seul un élément mis en page répond à getStartPositionOfChar.
              Invisible par fill-opacity, et non par visibility, pour rester
              dans l'arbre de rendu. */}
          <text
            ref={measureRef}
            className={s.markText}
            x="600"
            y="500"
            textAnchor="middle"
            fillOpacity={0}
            aria-hidden="true"
          >
            VRD
          </text>
          <rect
            x="-6000"
            y="-6000"
            width="18000"
            height="18000"
            fill="var(--dark)"
            mask="url(#vrd-portal)"
          />
        </svg>

        {/* AU-DESSUS de la plaque : le dessin appartient à l'anthracite, pas
            aux lettres. Il s'efface dès que la plongée commence. */}
        <div ref={fieldRef} className={s.field}>
          <ThermalField />
        </div>

        <div ref={overlayRef} className={s.overlay}>
          <p className={s.sub}>Ingénieurs conseils</p>
          <p className={s.baseline}>Techniques et énergétique du bâtiment</p>
          <p className={s.stamp}>S.T. 2021</p>
        </div>
      </div>

      <h1 className="visuallyHidden">VRD — Ingénieurs conseils</h1>
    </>
  );
}
