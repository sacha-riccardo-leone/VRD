"use client";

import { useEffect, useRef } from "react";
import { ThermalField } from "./ThermalField";
import { HeroProbe } from "./hero/HeroProbe";
import { mesure } from "./hero/probe";
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
 * ── POURQUOI LE R ──────────────────────────────────────────────────────────
 * Le fût du R est un rectangle PARFAITEMENT VERTICAL : relevé ligne par ligne,
 * il occupe la même plage sur toute la hauteur de capitale. Le jambage du V, lui,
 * est oblique ET fuselé. La différence n'est pas cosmétique : une ouverture qui
 * suit un fût droit se décrit exactement, alors qu'un jambage oblique n'était
 * approché que par une corde, débordante d'environ 0,7 unité — écart invisible
 * au repos, mais multiplié par l'échelle au fil de la plongée, et interrompu net
 * là où la barre s'arrêtait. C'est ce qui produisait le décrochement sur le
 * flanc gauche du V.
 *
 * Le fût du R donne aussi une ouverture plus large à hauteur égale, donc une
 * échelle finale plus basse (~52 au lieu de ~73) : le moteur travaille plus
 * loin de ses limites.
 *
 * Le contrepoinçon n'est pas un obstacle. Ce qu'on relève n'est pas « le fût »
 * mais la COMPOSANTE D'ENCRE qui le contient, ligne par ligne : là où le fût est
 * seul elle vaut le fût, là où il rejoint la panse elle s'élargit d'autant. Le
 * contrepoinçon en est exclu par construction, puisqu'il n'est pas de l'encre.
 *
 * ── LE RELAIS ──────────────────────────────────────────────────────────────
 * Un glyphe ne peut pas être agrandi indéfiniment. Passé un certain corps EN
 * PIXELS D'ÉCRAN, le moteur cesse de le rastériser fidèlement, puis cesse tout
 * court : le trou disparaît et la plaque devient un aplat noir. Comme la limite
 * est en pixels d'écran, l'échelle qu'elle autorise TOMBE quand la fenêtre
 * grandit — c'était la cause du fond noir en plein écran.
 *
 * D'où le relais : la composante est relevée à arêtes sous-pixel et reconstruite
 * en un polygone qui SUIT ses deux bords, sans corde ni marge. L'ajouter au
 * masque ne change donc rien à l'image. Passé le point où il suffit à lui seul —
 * quand le V et le reste du R ont quitté le cadre — le texte est retiré et le
 * polygone continue seul. Un polygone n'a pas de limite de taille.
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
 * Corps maximal, en pixels d'écran, auquel le glyphe est encore rastérisé
 * FIDÈLEMENT. Ce n'est pas le point où il disparaît : c'est celui où il
 * commence à se déformer, et c'est le seul qui compte.
 *
 * Protocole : on rend la même région utilisateur à deux résolutions — 1200×630,
 * où le rendu est sûr, et 3840×2016, proche du seuil — puis on compare la
 * surface d'ouverture. Tant que l'écart reste nul, le glyphe est juste.
 *
 *   9 600 px → écart 0,07 %   (fidèle)
 *  10 080 px → écart 1,21 %   (la déformation commence)
 *  10 560 px → écart 4,51 %   (glyphe faux)
 *  10 890 px → le trou disparaît, la plaque devient un aplat noir
 *
 * On retient donc 9 600, dernier corps fidèle. Chercher la disparition franche
 * aurait laissé travailler le moteur en pleine zone de déformation — c'est là
 * que naissaient les « boules pixelisées » et les morceaux de lettre manquants.
 *
 * La valeur dépend de la fonte — la même mesure sur une sans-serif générique
 * donnait 11 840. Si la police du sigle change, il faut reprendre la mesure.
 */
const GLYPHE_MAX_PX = 9600;

type Plage = [number, number];
/** Une ligne de relevé, en unités de viewBox. */
type Ligne = {
  y: number;
  /** bords de la composante d'encre contenant le fût */
  g: number;
  d: number;
  /** bord gauche de l'encre suivante du R (panse, jambe) — Infinity s'il n'y en a pas */
  suite: number;
  /** bord droit de l'encre du V sur cette ligne — -Infinity s'il n'y en a pas */
  vFin: number;
};

/**
 * Plages d'encre d'une ligne de pixels, à arêtes SOUS-PIXEL.
 *
 * S'arrêter au premier pixel qui franchit le seuil situe l'arête à un pixel
 * près. Cette erreur est ensuite multipliée par l'échelle : à 10× elle vaut déjà
 * une dizaine de pixels d'écran. On interpole donc la rampe d'anticrénelage pour
 * trouver où l'opacité vaut exactement la moitié.
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
  const spacerRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const maskElRef = useRef<SVGMaskElement>(null);
  const blancRef = useRef<SVGRectElement>(null);
  const plaqueRef = useRef<SVGRectElement>(null);
  const markRef = useRef<SVGTextElement>(null);
  const futRef = useRef<SVGPolygonElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const spacer = spacerRef.current;
    const plate = plateRef.current;
    const svg = svgRef.current;
    const mask = maskRef.current;
    const maskEl = maskElRef.current;
    const blanc = blancRef.current;
    const plaque = plaqueRef.current;
    const mark = markRef.current;
    const fut = futRef.current;
    const text = measureRef.current;
    const field = fieldRef.current;
    const overlay = overlayRef.current;
    if (
      !spacer || !plate || !svg || !mask || !maskEl || !blanc || !plaque ||
      !mark || !fut || !text || !field || !overlay
    ) {
      return;
    }

    // Le portail tourne aussi sur téléphone. Il n'y avait pas de raison
    // technique au seuil de 1024 px : la géométrie est relevée, donc elle suit
    // la taille du sigle, et celle-ci est réduite en CSS sur écran étroit.
    // Seul le mouvement réduit le désactive.
    const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) {
      plate.dataset.portal = "off";
      return;
    }

    // ------------------------------------------------------------------
    // Tout ce qui suit est RELEVÉ sur le glyphe, jamais choisi à la main.
    // Les valeurs de repli ne servent qu'au premier rendu, avant que la police
    // soit chargée ; à ce moment la page n'a pas encore défilé.
    // ------------------------------------------------------------------
    let ox = 543;
    let oy = 395;
    let maxScale = 20;
    let bascule = Infinity; // échelle du relais texte → polygone
    let corps = 300; // taille de police, en unités de viewBox
    let cadrer = () => {}; // recalcul de l'échelle finale et du relais

    const measure = (): boolean => {
      const cs = getComputedStyle(text);
      const size = parseFloat(cs.fontSize) || 300;
      const largeur = Math.ceil(size * 1.4);
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

      const yHaut = Math.round(base - size * 0.78);
      const yBas = Math.round(base);

      // --- Le R seul. On ne dessine qu'une lettre à la fois : aucune dépendance
      //     à l'interlettrage du canvas, mal supporté hors Blink. Le report en
      //     espace SVG se fait ensuite par les positions que le moteur SVG donne.
      c.fillText("R", 0, base);
      const relevéR: { y: number; g: number; d: number; suite: number }[] = [];
      for (let y = yHaut; y <= yBas; y++) {
        const r = plages(c, largeur, y);
        if (!r.length) continue;
        relevéR.push({ y, g: r[0][0], d: r[0][1], suite: r[1] ? r[1][0] : Infinity });
      }
      if (relevéR.length < 40) return false;

      // --- Le V seul, pour savoir quand il quitte le cadre par la gauche.
      c.clearRect(0, 0, largeur, hauteur);
      c.fillText("V", 0, base);
      const finV = new Map<number, number>();
      for (let y = yHaut; y <= yBas; y++) {
        const r = plages(c, largeur, y);
        if (r.length) finV.set(y, r[r.length - 1][1]);
      }

      // --- Report en espace SVG.
      let V: DOMPoint;
      let R: DOMPoint;
      try {
        V = text.getStartPositionOfChar(0);
        R = text.getStartPositionOfChar(1);
      } catch {
        return false;
      }
      const Y = (v: number) => R.y - (base - v);

      const bande: Ligne[] = relevéR.map((l) => ({
        y: Y(l.y),
        g: R.x + l.g,
        d: R.x + l.d,
        suite: l.suite === Infinity ? Infinity : R.x + l.suite,
        vFin: finV.has(l.y) ? V.x + (finV.get(l.y) as number) : -Infinity,
      }));

      // --- Le polygone suit les deux bords en ESCALIER, une marche par ligne
      //     relevée, chaque marche prise au plus prudent des deux bords qu'elle
      //     relie. Relier deux lignes par un segment oblique ferait couper au
      //     court là où le glyphe tourne — au raccord du fût et de la panse, ce
      //     raccourci mordait dans le contrepoinçon. L'escalier, lui, reste DANS
      //     l'encre par construction : le polygone ne peut rien ajouter à
      //     l'image, à aucune échelle, et ne rogne que d'une ligne.
      //
      //     C'est ce que le jambage du V ne permettait pas : oblique et fuselé,
      //     il n'était approché que par une corde débordante, et ce débordement,
      //     multiplié par l'échelle puis interrompu net au bout de la barre,
      //     formait le ressaut visible sur son flanc.
      const marchesG: number[][] = [];
      const marchesD: number[][] = [];
      for (let i = 0; i < bande.length - 1; i++) {
        const bord = Math.max(bande[i].g, bande[i + 1].g);
        marchesG.push([bord, bande[i].y], [bord, bande[i + 1].y]);
      }
      for (let i = bande.length - 1; i > 0; i--) {
        const bord = Math.min(bande[i].d, bande[i - 1].d);
        marchesD.push([bord, bande[i].y], [bord, bande[i - 1].y]);
      }
      const pts = [...marchesG, ...marchesD];
      fut.setAttribute(
        "points",
        pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
      );

      // Bords effectifs du polygone à chaque ligne : les marches qui la touchent.
      const droits = bande.map((l, i) =>
        Math.min(bande[Math.max(i - 1, 0)].d, l.d, bande[Math.min(i + 1, bande.length - 1)].d),
      );

      corps = size;

      // Le fût, c'est la composante là où elle est la PLUS ÉTROITE : ailleurs
      // elle s'élargit parce qu'elle rejoint la panse. C'est cette largeur-là
      // qui commande la couverture.
      let gauche = Infinity;
      let droite = Infinity;
      for (const l of bande) {
        gauche = Math.min(gauche, l.g);
        droite = Math.min(droite, l.d);
      }

      ox = (gauche + droite) / 2;
      oy = (bande[0].y + bande[bande.length - 1].y) / 2;
      const demi = Math.max((droite - gauche) / 2, 1);
      const demiBande = (bande[bande.length - 1].y - bande[0].y) / 2;

      // --- Échelle du relais, cherchée numériquement sur le relevé plutôt que
      //     posée en formule : à une échelle donnée on ramène la fenêtre dans le
      //     glyphe et on vérifie, ligne à ligne, qu'il n'y reste QUE la
      //     composante. Il faut donc que le V soit sorti par la gauche, que la
      //     panse et la jambe soient sorties par la droite, et que la fenêtre
      //     tienne dans la hauteur relevée.
      //
      //     Contrairement à `maxScale`, ce calcul-ci prend la fenêtre RÉELLE et
      //     non la viewBox entière. La majoration est de mise pour la couverture,
      //     où elle ne coûte qu'un peu d'échelle ; ici elle coûterait un relais
      //     retardé, donc un glyphe poussé plus loin dans sa zone de déformation.
      //     Le relais est donc recalculé quand la fenêtre change.
      cadrer = () => {
        const el = svg.getBoundingClientRect();
        const k = Math.max(el.width / 1200, el.height / 800);
        const demiL = k > 0 ? el.width / k / 2 : 600;
        const demiH = k > 0 ? el.height / k / 2 : 400;
        const vx = 600 - demiL;
        const vy = 400 - demiH;

        // La région du masque est RASTÉRISÉE à chaque image, puisque son contenu
        // se met à l'échelle. Elle n'a donc à couvrir que ce qui est visible, et
        // non la viewBox entière : sous `slice` la fenêtre est une bande, et sur
        // un téléphone cette bande fait le tiers de la viewBox.
        //
        // La marge de 15 % n'est pas du confort. Hors de cette région le masque
        // vaut zéro, donc le rectangle anthracite y est TRANSPARENT : une région
        // trop courte laisse voir la section suivante par le bas. Or sur iOS le
        // viewport grandit dès que la barre d'adresse se replie, sans qu'un
        // `resize` soit garanti. La marge absorbe ce décalage, et le
        // ResizeObserver plus bas le rattrape même quand l'évènement manque.
        const mx = Math.max(8, demiL * 0.3);
        const my = Math.max(8, demiH * 0.3);
        const z = {
          x: vx - mx,
          y: vy - my,
          w: 2 * (demiL + mx),
          h: 2 * (demiH + my),
        };
        for (const el2 of [maskEl, blanc, plaque]) {
          el2.setAttribute("x", String(z.x.toFixed(1)));
          el2.setAttribute("y", String(z.y.toFixed(1)));
          el2.setAttribute("width", String(z.w.toFixed(1)));
          el2.setAttribute("height", String(z.h.toFixed(1)));
        }
        const dxr = Math.max(ox - vx, vx + 2 * demiL - ox);
        const dyr = Math.max(oy - vy, vy + 2 * demiH - oy);

        // Échelle finale : celle où l'ouverture déborde la fenêtre. Le fût est
        // VERTICAL, donc c'est sa largeur qui doit couvrir l'écart horizontal et
        // sa hauteur l'écart vertical — deux conditions séparées, pas une
        // diagonale. Prendre la diagonale, comme il le fallait pour un jambage
        // oblique dont on ignorait l'orientation, surestimait ici d'un tiers.
        //
        // Le calcul porte sur la fenêtre RÉELLE. La majorer par la viewBox
        // entière ne coûtait rien sur un écran large, où les deux se
        // confondent ; sur un téléphone, où l'on ne voit qu'une bande verticale,
        // elle triplait l'échelle finale — la plongée s'achevait aux trois
        // quarts de la course et le dernier quart ne montrait plus rien.
        maxScale = Math.max(dxr / demi, dyr / demiBande, 8) * 1.35;

        // Le critère est une AIRE, pas un test ligne à ligne. L'escalier rogne
        // d'une demi-ligne là où la composante s'élargit d'un coup : c'est un
        // désaccord réel, mais haut d'une ligne de relevé. Le compter comme
        // rédhibitoire repoussait le relais à 38, bien au-delà de ce que le
        // moteur sait dessiner — donc à un relais toujours plafonné, c'est-à-dire
        // toujours prématuré. On mesure donc la surface en désaccord et on la
        // rapporte à celle de la fenêtre. Le seuil, 0,05 %, est le point où la
        // mesure de rendu ne distingue plus les deux images.
        const pas = bande.length > 1 ? Math.abs(bande[1].y - bande[0].y) : 1;
        const conforme = (S: number) => {
          const h = dyr / S;
          if (h > demiBande) return false;
          const xg = ox - dxr / S;
          const xd = ox + dxr / S;
          let ecart = 0;
          for (let i = 0; i < bande.length; i++) {
            const l = bande[i];
            if (Math.abs(l.y - oy) > h) continue;
            // le V, à gauche
            if (l.vFin > xg) ecart += (Math.min(l.vFin, xd) - xg) * pas;
            // le polygone doit atteindre le bord utile : celui de la composante,
            // ou celui de la fenêtre s'il est plus proche
            const utile = Math.min(l.d, xd);
            if (droits[i] < utile) ecart += (utile - droits[i]) * pas;
            // au-delà de la composante, la panse ou la jambe ne doivent pas
            // entrer dans le cadre
            if (xd > l.d && l.suite < xd) ecart += (xd - Math.max(l.suite, l.d)) * pas;
          }
          return ecart / ((2 * dxr * 2 * dyr) / (S * S)) < 5e-4;
        };
        bascule = Infinity;
        for (let S = 3; S <= 60; S += 0.1) {
          if (conforme(S)) {
            bascule = S * 1.15;
            break;
          }
        }
      };
      cadrer();
      return Number.isFinite(bascule);
    };

    const clamp = (n: number) => Math.min(Math.max(n, 0), 1);

    const apply = () => mesure("portail", () => {
      raf.current = 0;
      // La course ne peut PAS venir de `window.innerHeight` : sur iOS cette
      // valeur change quand la barre d'adresse se replie, en plein défilement,
      // et la plongée sauterait. On la prend sur les éléments eux-mêmes —
      // l'espaceur vaut `100svh - en-tête`, et le haut de la plaque vaut
      // l'en-tête, puisqu'elle est fixe. Leur somme vaut `100svh`, qui est la
      // hauteur PETITE du viewport : stable, elle, par définition.
      const course = Math.max(spacer.offsetHeight + plate.getBoundingClientRect().top, 1);
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

      // Le relais. Le plafond dépend de la fenêtre ET de la densité de l'écran,
      // puisque la limite est en pixels d'écran : il est donc recalculé à chaque
      // image plutôt que figé au montage.
      const el = svg.getBoundingClientRect();
      const k =
        Math.max(el.width / 1200, el.height / 800) * (window.devicePixelRatio || 1);
      const plafond = k > 0 ? (GLYPHE_MAX_PX / (corps * k)) * 0.9 : Infinity;
      mark.style.display = scale >= Math.min(bascule, plafond) ? "none" : "";

      // Le dessin ne se lit qu'au repos ; il s'efface dès la plongée.
      field.style.opacity = String(clamp(1 - p * 3));
      overlay.style.opacity = String(clamp(1 - p * 4));

      // Aucun fondu. À ce stade l'ouverture dépasse la fenêtre : la plaque
      // n'affiche plus un seul pixel d'anthracite, on peut donc la retirer sans
      // transition — personne ne peut voir disparaître ce qui ne se voyait déjà
      // plus.
      plate.style.visibility = p > 0.995 ? "hidden" : "visible";
    });

    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(apply);
    };

    // La fenêtre a changé de forme : l'échelle finale et le relais dépendent
    // tous deux de la région réellement visible, il faut les reprendre avant de
    // repeindre.
    const onResize = () => {
      // Le sigle change de corps au point de rupture. Tout le relevé — le
      // polygone d'abord — est fait à un corps donné : le laisser tel quel après
      // un changement de taille posait une ouverture taillée pour 300 par-dessus
      // un sigle dessiné à 160, visible comme une lettre fantôme. On ne remesure
      // que si le corps a bougé : un redimensionnement ordinaire n'en a pas
      // besoin, et le relevé coûte deux cents lectures de pixels.
      const size = parseFloat(getComputedStyle(text).fontSize) || 0;
      if (Math.abs(size - corps) > 0.5) measure();
      else cadrer();
      onScroll();
    };

    measure();
    apply();
    // La police arrive après le premier rendu : sans cette seconde mesure, tout
    // serait relevé sur la police de repli. Si elle échoue même à ce moment-là,
    // on préfère une section normale à un portail approximatif.
    document.fonts?.ready.then(() => {
      if (!measure()) {
        plate.dataset.portal = "off";
        return;
      }
      apply();
    });

    // La plaque est ancrée en haut et en bas : sa hauteur suit le viewport. Sur
    // iOS ce viewport change quand la barre d'adresse se replie, en plein
    // défilement, et `resize` ne se déclenche pas de façon fiable dans ce cas.
    // On observe donc l'élément lui-même, qui, lui, ne peut pas mentir sur sa
    // propre taille.
    const ro = new ResizeObserver(() => {
      cadrer();
      onScroll();
    });
    ro.observe(plate);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf.current);
      // Sans cette remise à zéro, la garde `if (!raf.current)` de `onScroll`
      // reste armée sur l'identifiant d'une image ANNULÉE : plus aucun
      // défilement n'est traité, le sigle reste à l'échelle 1 et la plaque ne
      // s'ouvre plus jamais. Le `ref` survit au remontage de l'effet, donc le
      // cas se produit à chaque rechargement à chaud et sous StrictMode.
      raf.current = 0;
    };
  }, []);

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
              x={ZONE.x}
              y={ZONE.y}
              width={ZONE.w}
              height={ZONE.h}
            >
              <rect
                ref={blancRef}
                x={ZONE.x}
                y={ZONE.y}
                width={ZONE.w}
                height={ZONE.h}
                fill="#fff"
              />
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
                {/* La composante d'encre qui contient le fût du R, relevée ligne
                    par ligne. Elle SUIT le glyphe au lieu de l'approcher : elle
                    ne déborde donc nulle part, et reste invisible tant que le
                    texte est là. Les points sont posés à la mesure. */}
                <polygon ref={futRef} fill="#000" points="" />
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
            ref={plaqueRef}
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
      <HeroProbe />
    </>
  );
}
