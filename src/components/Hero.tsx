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
 * blanches.
 *
 * Au défilement, le masque grandit autour d'un point pris dans le PLEIN du
 * jambage gauche du V. La course vaut exactement un écran : quand l'ouverture
 * dépasse le cadre, la première section arrive en haut — aucun temps mort.
 *
 * On plonge par le V, et non par le R : le V n'a PAS de contrepoinçon. Dans un
 * masque, le contrepoinçon d'une lettre n'appartient pas au glyphe — il reste
 * opaque, îlot collé au repère de plongée, qui grandit avec le reste et balaie
 * l'écran.
 *
 * ── LE RELAIS ──────────────────────────────────────────────────────────────
 * Un glyphe ne peut pas être agrandi indéfiniment. Au-delà d'environ 10 890
 * pixels d'écran de corps, le moteur cesse purement et simplement de le
 * rastériser : le trou disparaît et la plaque devient un aplat noir. Le seuil a
 * été MESURÉ, pas supposé, sur quatre tailles de fenêtre — c'est une limite en
 * pixels d'écran, donc l'échelle qu'elle autorise TOMBE quand la fenêtre
 * grandit : 34× à 1280 de large, 22,7× à 1920, 11,4× à 3840. Or la plongée doit
 * atteindre ~54× pour couvrir le cadre. C'était la cause du fond noir, et la
 * raison pour laquelle il empirait en plein écran.
 *
 * D'où le relais : les deux jambages du V sont RELEVÉS ligne par ligne, à
 * arêtes sous-pixel, puis reconstruits en deux quadrilatères qui les CONTIENNENT
 * sur toute leur hauteur. Les ajouter au masque ne change donc rien à l'image, à
 * aucune échelle. Passé le point où ils suffisent à eux seuls — quand le R a
 * quitté le cadre et que l'écran ne montre plus que le milieu droit des
 * jambages — le texte est retiré et les barres continuent seules. Un
 * quadrilatère n'a pas de limite de taille.
 *
 * Le champ thermique se dessine PAR-DESSUS la plaque : il appartient à
 * l'anthracite, pas aux lettres. Il s'efface dès que la plongée commence.
 */

/**
 * Étendue du masque et des deux rectangles, en unités de viewBox.
 *
 * NE PAS AGRANDIR. Un `<mask>` n'est pas un découpage vectoriel : le navigateur
 * en RASTÉRISE une surface, à la résolution de l'écran, de la taille de la
 * région déclarée. Une version précédente déclarait 18000 × 18000 unités « pour
 * être tranquille » : sous `slice`, une fenêtre de 1920 × 1080 réclamait
 * 28 575 × 28 575 pixels, soit 816 mégapixels, quand la dimension maximale
 * d'une texture est de 16 384 chez la plupart des pilotes. Le rendu se bloquait.
 *
 * Cette étendue-ci suffit et se démontre : sous `preserveAspectRatio` en mode
 * `slice`, k = max(L/1200, H/800), donc la largeur visible vaut L/k ≤ 1200 et la
 * hauteur H/k ≤ 800. La région visible est TOUJOURS un sous-rectangle de la
 * viewBox, quelle que soit la fenêtre. Le liseré de 8 unités absorbe
 * l'anticrénelage du bord. Coût : 2,5 mégapixels au lieu de 816.
 */
const ZONE = { x: -8, y: -8, w: 1216, h: 816 };

/**
 * Corps maximal, en pixels d'écran, auquel le moteur accepte encore de
 * rastériser le glyphe. MESURÉ par dichotomie sur la construction réelle
 * (rect + mask + text mis à l'échelle) à quatre tailles de fenêtre : 10 892 /
 * 10 893 / 10 885 / 10 894 px pour 1280, 1920, 2560 et 3840 de large. La valeur
 * est invariante en PIXELS D'ÉCRAN, ce qui confirme une limite de rastérisation
 * et non un défaut de géométrie — et explique que le défaut empirait quand la
 * fenêtre grandissait.
 *
 * Le seuil dépend de la fonte : la même mesure sur une sans-serif générique
 * donnait 11 840. Si la police du sigle change, il faut le reprendre.
 */
const GLYPHE_MAX_PX = 10890;

type Plage = [number, number];
type Ligne = { y: number; a: Plage; b: Plage };

/**
 * Plages d'encre d'une ligne de pixels, à arêtes SOUS-PIXEL.
 *
 * S'arrêter au premier pixel qui franchit le seuil situe l'arête à un pixel
 * près. Cette erreur est ensuite multipliée par l'échelle : à 8,5× elle vaut
 * déjà une dizaine de pixels d'écran, et elle se voyait au relais sous la forme
 * d'un liseré au bord du jambage droit. On interpole donc la rampe
 * d'anticrénelage pour trouver où l'opacité vaut exactement la moitié.
 */
function plages(c: CanvasRenderingContext2D, largeur: number, y: number): Plage[] {
  const px = c.getImageData(0, y, largeur, 1).data;
  const alpha = (i: number) => (i < 0 || i >= largeur ? 0 : px[i * 4 + 3]);
  const out: Plage[] = [];
  let debut = 0;
  let dedans = false;
  for (let i = 0; i < largeur; i++) {
    const encre = alpha(i) > 128;
    if (encre && !dedans) {
      const av = alpha(i - 1);
      debut = alpha(i) === av ? i : i - 1 + (128 - av) / (alpha(i) - av);
      dedans = true;
    } else if (!encre && dedans) {
      const av = alpha(i - 1);
      out.push([debut, av === alpha(i) ? i : i - 1 + (av - 128) / (av - alpha(i))]);
      dedans = false;
    }
  }
  if (dedans) out.push([debut, largeur]);
  return out;
}

export function Hero() {
  const plateRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const markRef = useRef<SVGTextElement>(null);
  const barreARef = useRef<SVGPolygonElement>(null);
  const barreBRef = useRef<SVGPolygonElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const plate = plateRef.current;
    const svg = svgRef.current;
    const mask = maskRef.current;
    const mark = markRef.current;
    const barreA = barreARef.current;
    const barreB = barreBRef.current;
    const text = measureRef.current;
    const field = fieldRef.current;
    const overlay = overlayRef.current;
    if (!plate || !svg || !mask || !mark || !barreA || !barreB || !text || !field || !overlay) {
      return;
    }

    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) {
      plate.dataset.portal = "off";
      return;
    }

    // ------------------------------------------------------------------
    // Tout ce qui suit est RELEVÉ sur le glyphe, jamais choisi à la main.
    // Les valeurs de repli ne servent qu'au tout premier rendu, avant que la
    // police soit chargée ; à ce moment la page n'a pas encore défilé.
    // ------------------------------------------------------------------
    let ox = 372;
    let oy = 376;
    let maxScale = 20;
    let bascule = Infinity; // échelle du relais texte → barres
    let corps = 300; // taille de police, en unités de viewBox

    const measure = (): boolean => {
      const cs = getComputedStyle(text);
      const size = parseFloat(cs.fontSize) || 300;
      const largeur = Math.ceil(size * 1.3);
      const hauteur = Math.ceil(size * 1.5);
      const cv = document.createElement("canvas");
      cv.width = largeur;
      cv.height = hauteur;
      const c = cv.getContext("2d", { willReadFrequently: true });
      if (!c) return false;

      const police = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const base = size * 1.15;
      c.font = police;
      c.textBaseline = "alphabetic";
      c.fillStyle = "#000";

      // --- Le V, lettre par lettre : on ne dessine QUE le V, donc aucune
      //     dépendance à l'interlettrage du canvas (mal supporté ailleurs que
      //     sur Blink). Le report en espace SVG se fait ensuite par les
      //     positions exactes que le moteur SVG nous donne.
      c.fillText("V", 0, base);
      const bande: Ligne[] = [];
      // Pas de 1 : l'enveloppe des arêtes est d'autant plus juste qu'elle est
      // relevée sur toutes les lignes, et le coût est de deux cents lectures.
      for (let y = Math.round(base - size * 0.75); y <= Math.round(base); y += 1) {
        const r = plages(c, largeur, y);
        // Deux plages nettement séparées : les deux jambages. Au-dessus, le
        // glyphe n'a pas commencé ; en dessous, ils ont fusionné au sommet.
        if (r.length >= 2 && r[1][0] > r[0][1]) bande.push({ y, a: r[0], b: r[1] });
      }
      if (bande.length < 8) return false;

      const haut = bande[0];
      const bas = bande[bande.length - 1];
      const milieu = bande[Math.floor(bande.length / 2)];

      // --- Le R : son premier pixel d'encre dit à quelle échelle il quitte le
      //     cadre, donc à partir de quand les barres suffisent.
      c.clearRect(0, 0, largeur, hauteur);
      c.fillText("R", 0, base);
      let rGauche = Infinity;
      for (let y = Math.round(base - size * 0.7); y <= Math.round(base); y += 2) {
        const r = plages(c, largeur, y);
        if (r.length && r[0][0] < rGauche) rGauche = r[0][0];
      }
      if (!Number.isFinite(rGauche)) return false;

      // --- Report en espace SVG. Les positions de départ des caractères sont
      //     lues sur un texte RÉELLEMENT MIS EN PAGE : c'est le seul moyen de
      //     tenir compte de l'interlettrage sans le recalculer.
      let A: DOMPoint;
      let R: DOMPoint;
      try {
        A = text.getStartPositionOfChar(0);
        R = text.getStartPositionOfChar(1);
      } catch {
        return false;
      }
      const X = (v: number) => A.x + v;
      const Y = (v: number) => A.y - (base - v);

      // --- Les deux barres. Les arêtes des jambages sont droites, mais pas au
      //     centième : on ajuste la corde sur les deux lignes extrêmes, puis on
      //     la décale VERS L'EXTÉRIEUR du plus grand écart relevé sur la bande.
      //     La barre contient alors le jambage sur toute sa hauteur — c'est la
      //     condition pour que le relais ne fasse rien apparaître. L'excédent
      //     se compte en centièmes d'unité, invisible au repos.
      const arete = (cle: "a" | "b", bord: 0 | 1): [number, number] => {
        const v0 = haut[cle][bord];
        const v1 = bas[cle][bord];
        const corde = (y: number) => v0 + ((v1 - v0) * (y - haut.y)) / (bas.y - haut.y);
        let ecart = 0;
        for (const l of bande) {
          const d = bord === 0 ? corde(l.y) - l[cle][0] : l[cle][1] - corde(l.y);
          if (d > ecart) ecart = d;
        }
        const jeu = bord === 0 ? -ecart : ecart;
        return [v0 + jeu, v1 + jeu];
      };

      const aG = arete("a", 0);
      const aD = arete("a", 1);
      const bG = arete("b", 0);
      const bD = arete("b", 1);

      const quad = (g: [number, number], d: [number, number]) =>
        [
          [X(g[0]), Y(haut.y)],
          [X(d[0]), Y(haut.y)],
          [X(d[1]), Y(bas.y)],
          [X(g[1]), Y(bas.y)],
        ]
          .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
          .join(" ");
      barreA.setAttribute("points", quad(aG, aD));
      barreB.setAttribute("points", quad(bG, bD));

      corps = size;
      ox = X((milieu.a[0] + milieu.a[1]) / 2);
      oy = Y(milieu.y);

      // --- Géométrie du jambage : inclinaison, demi-longueur, demi-épaisseur.
      const dyB = bas.y - haut.y;
      const dxB = (bas.a[0] + bas.a[1]) / 2 - (haut.a[0] + haut.a[1]) / 2;
      const longueur = Math.hypot(dxB, dyB);
      const cosP = dyB / longueur;
      const sinP = Math.abs(dxB) / longueur;
      const demiLong = longueur / 2;

      // La plus petite largeur de la bande : le jambage se fusèle, et c'est
      // l'endroit le plus étroit qui commande la couverture.
      let etroit = Infinity;
      for (const l of bande) etroit = Math.min(etroit, l.a[1] - l.a[0]);
      // Épaisseur relevée à l'horizontale = coupe oblique ; la vraie épaisseur,
      // perpendiculaire à l'axe, vaut cette largeur fois le cosinus.
      const demi = Math.max((etroit * cosP) / 2, 1);

      // Sous `slice` la région visible est toujours incluse dans la viewBox :
      // ces deux distances majorent donc le cas réel pour TOUTE fenêtre.
      const dx = Math.max(ox, 1200 - ox);
      const dy = Math.max(oy, 800 - oy);

      // Échelle à laquelle le coin visible le plus lointain entre dans
      // l'ouverture — calculée, jamais choisie. La distance en ligne droite
      // majore la distance perpendiculaire quelle que soit l'inclinaison.
      maxScale = Math.max(Math.hypot(dx, dy) / demi, 8) * 1.35;

      // Échelle du relais. Trois conditions, toutes mesurées :
      //  — le R doit avoir quitté le cadre (les barres ne le reproduisent pas) ;
      //  — l'écran doit tenir dans la longueur droite des jambages, sinon le
      //    sommet du V, que les barres ne couvrent pas non plus, entre en scène ;
      //  — le jambage DROIT doit être sorti lui aussi. C'est la condition la plus
      //    exigeante, et la moins évidente : la barre contient le jambage, mais
      //    le glyphe agrandi n'est pas exactement le glyphe de référence agrandi
      //    (le rendu à 300 px est optimisé, celui à 3 000 px ne l'est plus). Il
      //    subsiste un écart de quelques centièmes d'unité sur l'arête
      //    extérieure ; multiplié par l'échelle, il se voit. Une fois ce jambage
      //    hors cadre, la question ne se pose plus.
      const ecartR = Math.max(R.x + rGauche - ox, 1);
      const ecartJambage = Math.max(X(Math.min(bD[0], bD[1])) - ox, 1);
      const portee = dx * sinP + dy * cosP;
      bascule = Math.max(dx / ecartR, dx / ecartJambage, portee / demiLong);

      return true;
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => {
      raf.current = 0;
      const course = window.innerHeight;
      const p = clamp(window.scrollY / course);

      // Progression EXPONENTIELLE, pas quadratique : une interpolation en p²
      // donne 70 % de course où il ne se passe rien, puis un coup de fouet.
      // maxScale ** p tient une vitesse d'approche constante — c'est ce que
      // fait un travelling réel.
      const scale = Math.pow(maxScale, p);
      mask.setAttribute(
        "transform",
        `translate(${ox} ${oy}) scale(${scale.toFixed(3)}) translate(${-ox} ${-oy})`,
      );

      // Le relais. Le plafond dépend de la fenêtre et de la densité de l'écran,
      // puisque la limite est en pixels d'écran : il est donc recalculé à
      // chaque image plutôt que figé au montage.
      const el = svg.getBoundingClientRect();
      const k =
        Math.max(el.width / 1200, el.height / 800) * (window.devicePixelRatio || 1);
      const plafond = k > 0 ? (GLYPHE_MAX_PX / (corps * k)) * 0.88 : Infinity;
      mark.style.display = scale >= Math.min(bascule, plafond) ? "none" : "";

      // Le dessin ne se lit qu'au repos ; il s'efface dès la plongée.
      field.style.opacity = String(clamp(1 - p * 3));
      overlay.style.opacity = String(clamp(1 - p * 4));

      // Aucun fondu. À ce stade l'ouverture dépasse la fenêtre : la plaque
      // n'affiche plus un seul pixel d'anthracite, on peut donc la retirer sans
      // transition — personne ne peut voir disparaître ce qui ne se voyait déjà
      // plus.
      plate.style.visibility = p > 0.995 ? "hidden" : "visible";
    };

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    measure();
    apply();
    // La police arrive après le premier rendu : sans cette seconde mesure, tout
    // serait relevé sur la police de repli. Si elle échoue même à ce
    // moment-là, on préfère une section normale à un portail approximatif.
    document.fonts?.ready.then(() => {
      if (!measure()) {
        plate.dataset.portal = "off";
        return;
      }
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
          ref={svgRef}
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
              x={ZONE.x}
              y={ZONE.y}
              width={ZONE.w}
              height={ZONE.h}
            >
              <rect x={ZONE.x} y={ZONE.y} width={ZONE.w} height={ZONE.h} fill="#fff" />
              <g ref={maskRef}>
                <text
                  ref={markRef}
                  className={s.markText}
                  x="600"
                  y="500"
                  textAnchor="middle"
                  fill="#000"
                >
                  VRD
                </text>
                {/* Les deux jambages du V, relevés au pixel. Inclus dans le
                    glyphe : invisibles tant que le texte est là, seuls
                    au-delà. Les points sont posés à la mesure. */}
                <polygon ref={barreARef} fill="#000" points="" />
                <polygon ref={barreBRef} fill="#000" points="" />
              </g>
            </mask>
          </defs>

          {/* Jumeau de mesure : identique au texte du masque, mais RENDU —
              seul un élément mis en page répond à getStartPositionOfChar.
              Invisible par fill-opacity, et non par visibility, pour rester
              dans l'arbre de rendu. Il n'est jamais mis à l'échelle, donc il
              n'atteint jamais la limite de rastérisation. */}
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
            x={ZONE.x}
            y={ZONE.y}
            width={ZONE.w}
            height={ZONE.h}
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
