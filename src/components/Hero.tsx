"use client";

import { useEffect, useRef } from "react";
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
 * On plonge par le V, et non par le R : le V n'a PAS de contrepoinçon. Dans un
 * masque, le contrepoinçon d'une lettre n'appartient pas au glyphe — il reste
 * opaque, îlot collé au repère de plongée, qui grandit avec le reste et balaie
 * l'écran. Le V n'en a aucun ; ceux du R et du D sont loin du centre et sortent
 * du cadre aussitôt. C'est le seul moyen de garder les lettres correctes au
 * repos ET de n'avoir rien qui traverse l'écran : avec un groupe unique mis à
 * l'échelle, on ne peut pas avoir les deux sur une lettre à contrepoinçon.
 *
 * Le repère est trouvé en sondant les pixels du glyphe, et l'échelle finale est
 * CALCULÉE : c'est celle à laquelle le coin visible le plus lointain entre dans
 * l'ouverture. La progression est EXPONENTIELLE (maxScale ** p) : vitesse
 * d'approche constante, comme un travelling. Aucun fondu, aucune étape de
 * nettoyage — la plaque n'est retirée qu'une fois sortie du cadre.
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
    // Repère de plongée : TROUVÉ EN SONDANT LES PIXELS, pas estimé.
    //
    // Trois tentatives ont échoué en devinant où se trouve le fût du R. Ici on
    // dessine le glyphe sur un canvas hors écran et on cherche la première
    // colonne d'encre à mi-hauteur de capitale : c'est le fût, quelle que soit
    // la police. On en déduit aussi sa LARGEUR, donc l'échelle réellement
    // nécessaire pour que l'ouverture dépasse la fenêtre.
    //
    // La mesure attend `document.fonts.ready` : lancée trop tôt, elle porte sur
    // la police de repli et le résultat tombe à côté — c'était le défaut.
    // ------------------------------------------------------------------
    let ox = 377; // repli : dans le jambage gauche du V, jamais dans un creux
    let oy = 392;
    let maxScale = 70; // recalculé à la mesure

    const measure = () => {
      let frac = 0.30; // centre du jambage dans le pas, en repli
      let stemFrac = 0.20; // largeur du jambage, rapportée au pas
      let cosPente = 0.95; // le jambage du V est oblique : cos de son inclinaison

      try {
        const cs = getComputedStyle(text);
        const size = parseFloat(cs.fontSize) || 300;
        const cv = document.createElement("canvas");
        cv.width = Math.ceil(size * 1.2);
        cv.height = Math.ceil(size * 1.4);
        const c = cv.getContext("2d", { willReadFrequently: true });
        if (c) {
          c.font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
          c.textBaseline = "alphabetic";
          c.fillStyle = "#000";
          const baseline = size * 1.1;
          c.fillText("V", 0, baseline);
          const advance = c.measureText("V").width;

          // Première plage d'encre d'une ligne : le jambage gauche.
          const plage = (y: number) => {
            const px = c.getImageData(0, Math.round(y), cv.width, 1).data;
            let a = -1;
            let b = -1;
            for (let i = 0; i < cv.width; i++) {
              const on = px[i * 4 + 3] > 128;
              if (on && a < 0) a = i;
              if (a >= 0 && !on) { b = i; break; }
            }
            return a >= 0 && b > a ? { a, b } : null;
          };

          const y1 = baseline - size * 0.36; // mi-hauteur de capitale
          const y2 = baseline - size * 0.2; // plus bas, vers le sommet du V
          const p1 = plage(y1);
          const p2 = plage(y2);

          if (p1 && advance > 0) {
            frac = (p1.a + p1.b) / 2 / advance;
            stemFrac = (p1.b - p1.a) / advance;
          }
          if (p1 && p2) {
            // Inclinaison MESURÉE entre les deux lignes. La largeur relevée à
            // l'horizontale est celle d'une coupe oblique : la vraie épaisseur
            // du jambage, perpendiculaire à son axe, vaut cette largeur fois
            // le cosinus. Sans ce facteur l'ouverture est surestimée et il
            // reste un liseré d'anthracite au bout de la plongée.
            const dCentre = (p2.a + p2.b) / 2 - (p1.a + p1.b) / 2;
            const dLignes = y2 - y1;
            cosPente = dLignes / Math.hypot(dCentre, dLignes);
          }
        }
      } catch {
        // Canvas indisponible : on garde les valeurs de repli.
      }

      try {
        const a = text.getStartPositionOfChar(0); // le V — sans contrepoinçon
        const b = text.getEndPositionOfChar(0);
        if (b.x > a.x) {
          // `chasse` inclut l'interlettrage négatif ; les fractions mesurées au
          // canvas se rapportent au PAS de la police. Les appliquer à la chasse
          // rétrécissait tout de 6 % — le repère glissait et l'ouverture était
          // sous-évaluée d'autant.
          const cs = getComputedStyle(text);
          const inter = parseFloat(cs.letterSpacing) || 0;
          const pas = b.x - a.x - inter;
          ox = a.x + pas * frac;
          oy = a.y - 300 * 0.36;

          // Demi-épaisseur RÉELLE de l'ouverture, perpendiculaire à l'axe du
          // jambage.
          const demi = Math.max((pas * stemFrac * cosPente) / 2, 1);
          // Échelle à laquelle le coin visible le plus lointain entre dans
          // l'ouverture. On prend la distance en ligne droite : elle majore la
          // distance perpendiculaire quelle que soit l'inclinaison, donc le
          // résultat couvre sans avoir à connaître l'orientation du coin.
          const dx = Math.max(ox, 1200 - ox);
          const dy = Math.max(oy, 800 - oy);
          maxScale = Math.max(Math.hypot(dx, dy) / demi, 8) * 1.35;
        }
      } catch {
        // Texte pas encore mis en page : on garde le repli.
      }
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const course = window.innerHeight;
      const p = clamp(window.scrollY / course);

      // Progression EXPONENTIELLE, pas quadratique. Une interpolation en p²
      // donne 70 % de course où il ne se passe rien, puis un coup de fouet à la
      // fin. maxScale ** p tient une vitesse d'approche constante — c'est ce que
      // fait un travelling réel, et c'est la différence la plus visible entre
      // une bonne version et une mauvaise.
      const scale = Math.pow(maxScale, p);
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
      plate.style.visibility = p > 0.995 ? "hidden" : "visible";
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
