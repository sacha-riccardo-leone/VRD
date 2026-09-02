"use client";

import { useEffect, useRef, useState } from "react";
import { ThermalField } from "./ThermalField";
import { HeroProbe } from "./hero/HeroProbe";
import { mesure } from "./hero/probe";
import { SIGLE } from "./hero/outlines";
import s from "./Hero.module.css";

/**
 * Hero — portail blanc. Les lettres sont des fenêtres sur la page.
 *
 * Une plaque anthracite couvre l'écran, PERCÉE aux lettres « VRD ». Derrière
 * elle : la page réelle, qui défile normalement. On voit donc le document AU
 * TRAVERS du sigle — et comme le papier est clair, les lettres se lisent
 * blanches.
 *
 * Au défilement, le masque grandit autour d'un point pris dans le PLEIN du fût
 * du R. La course vaut exactement un écran : quand l'ouverture dépasse le cadre,
 * la première section arrive en haut — aucun temps mort.
 *
 * ── LE SIGLE EST UN TRACÉ, PAS DU TEXTE ────────────────────────────────────
 * Les contours viennent de `outlines.ts`, extraits de la police une fois pour
 * toutes, hors ligne. Ce choix règle quatre défauts qui avaient chacun coûté un
 * correctif :
 *
 *   — l'escalier. L'ouverture était relevée en rastérisant le glyphe puis en le
 *     balayant ligne par ligne. Sur la courbe haute du R, presque horizontale,
 *     les marches s'allongeaient et se voyaient. Un tracé n'a pas de marches.
 *   — le plafond de rastérisation. Un glyphe cesse d'être dessiné fidèlement
 *     au-delà d'environ 9 600 pixels d'écran de corps, seuil qui BAISSE quand la
 *     fenêtre grandit — c'était la plaque devenue noire en plein écran. Un tracé
 *     n'a ni cache de glyphes ni plafond : tout le mécanisme de relais qui
 *     contournait cette limite disparaît avec elle.
 *   — la course avec le chargement de la police. Il n'y a plus rien à mesurer au
 *     montage, donc plus rien à remesurer après `document.fonts.ready`.
 *   — la géométrie périmée au point de rupture. Position et échelle se déduisent
 *     de constantes et du corps courant ; il n'y a plus de relevé à invalider.
 *
 * Le champ thermique se dessine PAR-DESSUS la plaque : il appartient à
 * l'anthracite, pas aux lettres. Il s'efface dès que la plongée commence.
 */

/** Ligne de base du sigle, en unités de viewBox. */
const BASE = 500;

/** Corps de repli, en unités de viewBox. La valeur réelle vient de `--sigle`. */
const CORPS = 300;

/** Abscisse de pose pour un corps donné : le mot est centré dans la viewBox. */
const poseX = (corps: number) => 600 - (SIGLE.largeur * corps) / 2;

/**
 * Étendue de repli du masque et des deux rectangles, en unités de viewBox.
 *
 * Elle doit être posée dans le balisage, et pas seulement par `cadrer()` : sans
 * portail — écran étroit, ou mouvement réduit — le script ne tourne pas, et des
 * rectangles sans dimensions ne peignent RIEN. La plaque devenait alors
 * entièrement transparente. Elle sert aussi de premier rendu côté serveur, avant
 * que le script n'ait resserré la région.
 *
 * Elle couvre la viewBox avec de la marge : sous `slice`, la région visible est
 * toujours un sous-rectangle de 0 0 1200 800.
 */
const REPLI = { x: -100, y: -100, w: 1400, h: 1000 };

export function Hero() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const maskElRef = useRef<SVGMaskElement>(null);
  const blancRef = useRef<SVGRectElement>(null);
  const plaqueRef = useRef<SVGRectElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  // Le portail est une composition de FORMAT BUREAU. Sur téléphone il est
  // retiré, pas dégradé : les deux défauts iOS qui restaient — contenu visible
  // trop tôt, défilement saccadé au doigt — sont des propriétés de la plaque
  // fixe et de son repeint par image. Supprimer le mécanisme les supprime.
  //
  // Le seuil porte sur la LARGEUR, pas sur l'entrée : un portable à écran
  // tactile en 1440 garde le portail, une fenêtre étroite sur un poste fixe ne
  // l'a pas. C'est le format qui décide.
  const [actif, setActif] = useState(false);

  useEffect(() => {
    const large = window.matchMedia("(min-width: 1024px)");
    const calme = window.matchMedia("(prefers-reduced-motion: reduce)");
    const maj = () => setActif(large.matches && !calme.matches);
    maj();
    // On écoute la requête de média ET le redimensionnement. Les deux, parce que
    // l'évènement `change` ne s'est pas déclenché lors d'un essai, et qu'un
    // navigateur réel émet bien les deux. S'il manque, le CSS bascule la mise en
    // page mais le script croit encore le portail actif : la boucle met alors le
    // masque à l'échelle sur une plaque redevenue statique.
    large.addEventListener("change", maj);
    calme.addEventListener("change", maj);
    window.addEventListener("resize", maj);
    window.addEventListener("orientationchange", maj);
    return () => {
      large.removeEventListener("change", maj);
      calme.removeEventListener("change", maj);
      window.removeEventListener("resize", maj);
      window.removeEventListener("orientationchange", maj);
    };
  }, []);

  useEffect(() => {
    const spacer = spacerRef.current;
    const plate = plateRef.current;
    const svg = svgRef.current;
    const mask = maskRef.current;
    const maskEl = maskElRef.current;
    const blanc = blancRef.current;
    const plaque = plaqueRef.current;
    const field = fieldRef.current;
    const overlay = overlayRef.current;
    if (!spacer || !plate || !svg || !mask || !maskEl || !blanc || !plaque || !field || !overlay) {
      return;
    }

    if (!actif) {
      plate.dataset.portal = "off";
      return;
    }
    delete plate.dataset.portal;

    let ox = 0;
    let oy = 0;
    let maxScale = 20;

    /**
     * Pose la géométrie : repère de plongée, échelle finale, étendue du masque.
     * Tout se déduit des contours commis et du corps courant — aucun relevé,
     * donc rien à invalider. Repris au redimensionnement.
     */
    const cadrer = () => {
      const corps = parseFloat(getComputedStyle(svg).getPropertyValue("--sigle")) || CORPS;
      ox = poseX(corps) + SIGLE.plongee.x * corps;
      oy = BASE + SIGLE.plongee.y * corps;
      const demi = Math.max(SIGLE.ouverture.w * corps, 0.001);
      const demiBande = Math.max(SIGLE.ouverture.h * corps, 0.001);

      const el = svg.getBoundingClientRect();
      const k = Math.max(el.width / 1200, el.height / 800);
      const demiL = k > 0 ? el.width / k / 2 : 600;
      const demiH = k > 0 ? el.height / k / 2 : 400;
      const vx = 600 - demiL;
      const vy = 400 - demiH;

      // La région du masque est RASTÉRISÉE à chaque image, puisque son contenu
      // se met à l'échelle. Elle n'a donc à couvrir que ce qui est visible, et
      // non la viewBox entière. La marge de 15 % n'est pas du confort : hors de
      // cette région le masque vaut zéro, donc le rectangle anthracite y est
      // TRANSPARENT, et une région trop courte laisse voir la suite par le bas.
      const mx = Math.max(8, demiL * 0.3);
      const my = Math.max(8, demiH * 0.3);
      const z = { x: vx - mx, y: vy - my, w: 2 * (demiL + mx), h: 2 * (demiH + my) };
      for (const e of [maskEl, blanc, plaque]) {
        e.setAttribute("x", z.x.toFixed(1));
        e.setAttribute("y", z.y.toFixed(1));
        e.setAttribute("width", z.w.toFixed(1));
        e.setAttribute("height", z.h.toFixed(1));
      }

      // Échelle finale : celle où l'ouverture déborde la fenêtre. Le fût est
      // VERTICAL, donc sa largeur doit couvrir l'écart horizontal et sa hauteur
      // l'écart vertical — deux conditions séparées, pas une diagonale.
      //
      // `ouverture` est le plus grand rectangle INSCRIT dans le fût, donc une
      // sous-région convexe : le test par les quatre coins n'est valable que sur
      // un convexe, et le R n'en est pas un. La prendre plus petite que
      // l'ouverture réelle ne peut que majorer l'échelle — jamais la
      // sous-estimer.
      const dxr = Math.max(ox - vx, vx + 2 * demiL - ox);
      const dyr = Math.max(oy - vy, vy + 2 * demiH - oy);
      maxScale = Math.max(dxr / demi, dyr / demiBande, 8) * 1.35;
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () =>
      mesure("portail", () => {
        raf.current = 0;
        // La course ne peut PAS venir de `window.innerHeight` : sur iOS cette
        // valeur change quand la barre d'adresse se replie, en plein défilement.
        // On la prend sur les éléments — l'espaceur vaut `100svh - en-tête`, le
        // haut de la plaque vaut l'en-tête. Leur somme vaut `100svh`, hauteur
        // PETITE du viewport, stable par définition.
        const course = Math.max(spacer.offsetHeight + plate.getBoundingClientRect().top, 1);
        const p = clamp(window.scrollY / course);

        // Progression EXPONENTIELLE, pas quadratique : une interpolation en p²
        // donne 70 % de course où il ne se passe rien, puis un coup de fouet.
        const scale = Math.pow(maxScale, p);
        mask.setAttribute(
          "transform",
          `translate(${ox} ${oy}) scale(${scale.toFixed(3)}) translate(${-ox} ${-oy})`,
        );

        // Le dessin ne se lit qu'au repos ; il s'efface dès la plongée.
        field.style.opacity = String(clamp(1 - p * 3));
        overlay.style.opacity = String(clamp(1 - p * 4));

        // Aucun fondu. À ce stade l'ouverture dépasse la fenêtre : la plaque
        // n'affiche plus un seul pixel d'anthracite, on peut donc la retirer
        // sans transition.
        plate.style.visibility = p > 0.995 ? "hidden" : "visible";
      });

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    const onResize = () => {
      cadrer();
      onScroll();
    };

    cadrer();
    apply();

    // La plaque est ancrée en haut et en bas : sa hauteur suit le viewport. Sur
    // iOS ce viewport change quand la barre d'adresse se replie et `resize` ne
    // se déclenche pas de façon fiable. On observe donc l'élément lui-même.
    const ro = new ResizeObserver(onResize);
    ro.observe(plate);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf.current);
      // Retour à l'état de repos. Sans cela, franchir le seuil vers le mobile
      // laisserait une échelle, une opacité ou une visibilité figées.
      mask.removeAttribute("transform");
      field.style.opacity = "";
      overlay.style.opacity = "";
      plate.style.visibility = "";
      // Sans cette remise à zéro, la garde `if (!raf.current)` de `onScroll`
      // reste armée sur l'identifiant d'une image ANNULÉE : plus aucun
      // défilement n'est traité et la plaque ne s'ouvre plus jamais.
      raf.current = 0;
    };
  }, [actif]);

  return (
    <>
      {/* Course de défilement : exactement un écran. */}
      <div ref={spacerRef} className={s.spacer} />

      <div ref={plateRef} className={`technique ${s.plate}`}>
        <svg
          ref={svgRef}
          className={s.panel}
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask
              ref={maskElRef}
              id="vrd-portal"
              maskUnits="userSpaceOnUse"
              x={REPLI.x}
              y={REPLI.y}
              width={REPLI.w}
              height={REPLI.h}
            >
              <rect
                ref={blancRef}
                x={REPLI.x}
                y={REPLI.y}
                width={REPLI.w}
                height={REPLI.h}
                fill="#fff"
              />
              <g ref={maskRef}>
                {/* Le sigle en contours. La pose (attribut) vaut pour le format
                    bureau ; le CSS la remplace sur écran étroit, de sorte que la
                    mise en page est juste dès le PREMIER rendu, sans script et
                    sans saut à l'hydratation. */}
                <g
                  className={s.sigle}
                  transform={`translate(${poseX(CORPS).toFixed(2)} ${BASE}) scale(${CORPS})`}
                >
                  <path d={SIGLE.d} fill="#000" />
                </g>
              </g>
            </mask>
          </defs>

          <rect
            ref={plaqueRef}
            x={REPLI.x}
            y={REPLI.y}
            width={REPLI.w}
            height={REPLI.h}
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
      <HeroProbe />
    </>
  );
}
