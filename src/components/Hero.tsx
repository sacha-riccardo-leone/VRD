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

export function Hero() {
  const plateRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  /** Contour du contrepoinçon du R, à boucher dans le masque. */
  const [counter, setCounter] = useState("");

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
    let coverScale = 26; // échelle à laquelle l'ouverture dépasse la fenêtre

    const measure = () => {
      let rA = 500;
      let aY = 500;
      let chasse = 186;
      try {
        const a2 = text.getStartPositionOfChar(1); // le R
        const b2 = text.getEndPositionOfChar(1);
        if (b2.x > a2.x) {
          rA = a2.x;
          aY = a2.y;
          chasse = b2.x - a2.x;
        }
      } catch {
        // Texte pas encore mis en page : on garde le repli.
      }
      oy = aY - 300 * 0.36;

      let pts = "";
      try {
        const cs = getComputedStyle(text);
        const size = parseFloat(cs.fontSize) || 300;
        const W = Math.ceil(size * 1.3);
        const H = Math.ceil(size * 1.7);
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const c = cv.getContext("2d", { willReadFrequently: true });
        if (c) {
          const baseline = size * 1.25;
          c.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
          c.textBaseline = "alphabetic";
          c.fillStyle = "#000";
          c.fillText("R", 0, baseline);

          // Conversion pixels -> unités de viewBox. C'EST ICI que la version
          // précédente se trompait : elle divisait par la taille de police au
          // lieu de la CHASSE réellement dessinée, d'où un bouchon à 62 % et
          // décalé — la « boule » pixelisée.
          const advance = c.measureText("R").width || size * 0.62;
          const k = chasse / advance;

          const px = c.getImageData(0, 0, W, H).data;
          const ink = (i: number) => px[i * 4 + 3] > 128;

          // Propagation depuis le bord : tout ce que l'extérieur atteint.
          const ext = new Uint8Array(W * H);
          const stack: number[] = [];
          for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
          for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
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

          // Bords gauche et droit du contrepoinçon, ligne par ligne. On en fait
          // un POLYGONE : des bandes d'un pixel donneraient l'escalier qu'on
          // voyait une fois grossi treize fois.
          const left: string[] = [];
          const right: string[] = [];
          for (let y = 0; y < H; y++) {
            let lo = -1;
            let hi = -1;
            for (let x = 0; x < W; x++) {
              const i = y * W + x;
              if (!ink(i) && !ext[i]) {
                if (lo < 0) lo = x;
                hi = x;
              }
            }
            if (lo >= 0) {
              const sy = (aY + (y - baseline) * k).toFixed(1);
              left.push(`${(rA + lo * k).toFixed(1)},${sy}`);
              right.unshift(`${(rA + (hi + 1) * k).toFixed(1)},${sy}`);
            }
          }
          if (left.length > 2) pts = left.concat(right).join(" ");
        }
      } catch {
        // Canvas indisponible : le contrepoinçon restera ouvert, sans plus.
      }
      setCounter(pts);

      // Le trou fait toute la largeur du R : on plonge en son centre.
      ox = rA + chasse * 0.5;
      const demi = Math.max(chasse * 0.34, 1);
      coverScale = Math.max(Math.max(ox, 1200 - ox) / demi, 8);
      maxScale = coverScale * 1.6;
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
      // Retrait fondé sur la COUVERTURE réelle, pas sur une fraction devinée :
      // dès que l'ouverture dépasse la fenêtre, la plaque n'affiche plus rien
      // et peut partir sans que cela se voie. Un seuil fixe la faisait
      // disparaître alors qu'un morceau de lettre était encore à l'écran.
      plate.style.visibility = scale >= coverScale * 1.05 ? "hidden" : "visible";
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
                {/* Bouche le contrepoinçon du R : sans lui, un îlot opaque
                    subsiste au milieu du trou et balaie l'écran pendant la
                    plongée. */}
                {counter ? <polygon points={counter} fill="#000" /> : null}
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
