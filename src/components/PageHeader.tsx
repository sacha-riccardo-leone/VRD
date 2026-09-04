import s from "./PageHeader.module.css";

/**
 * En-tête commun à toutes les pages intérieures : titre et chapô. Un seul
 * <h1> par page, porté ici.
 *
 * ÉCHELLE. Les titres étaient des phrases (« Neuf techniques, du concept à la
 * mise en service. ») ; ce sont désormais des mots seuls — « Prestations »,
 * « Contact ». Le réglage n'avait pas suivi : --fs-800 est calibré pour une
 * phrase, qui remplit la mesure sur deux ou trois lignes et pèse par sa
 * surface autant que par son corps. Un mot seul au même corps n'occupe qu'un
 * quart de la ligne et se lit comme une étiquette. On rend donc par le CORPS
 * la surface que le texte ne fournit plus — rien d'autre n'est ajouté : ni
 * filet, ni cartouche, ni capitales, ni seconde police. Le détail des
 * réglages (rampe d'interlettrage, graisse 400, blanc) est dans le CSS.
 *
 * ALIGNEMENT OPTIQUE. À 120 px, l'approche gauche du dessin de caractère
 * cesse d'être négligeable : le fût du « P » de Prestations démarre à
 * 0,094 em du bord, le « C » de Contact à 0,047, le « A » d'À propos à 0,016.
 * Les cinq titres partiraient donc de trois retraits différents, contre un
 * chapô et un filet qui, eux, partent tous à zéro — ce qui se lit comme un
 * défaut de fabrication, pas comme un parti pris. Chaque titre est retiré de
 * sa propre approche pour que son ENCRE tombe sur la marge.
 *
 * Une correction uniforme ne marcherait pas : entre le « P » et le « A »
 * l'écart est de 0,078 em, soit 9 px au corps maximal. Elle réparerait quatre
 * titres et casserait le cinquième.
 */

/**
 * Approche gauche des capitales d'IBM Plex Sans 400, en em.
 *
 * MESURÉES, pas estimées : relevées au canvas à 1000 px dans la police
 * réellement chargée (`actualBoundingBoxLeft`), puis regroupées — les six
 * valeurs distinctes correspondent aux familles de dessin. Les fûts droits
 * (B, D, E, F, H, K, L, M, N, P, R) ouvrent le plus ; les diagonales (A, V,
 * W, X, Y) presque pas, leur pointe touchant déjà la marge.
 *
 * À regénérer si la police du titre change : ces valeurs appartiennent au
 * dessin, pas au projet.
 */
const APPROCHE: Record<string, number> = {
  B: 0.094, D: 0.094, E: 0.094, F: 0.094, H: 0.094, K: 0.094,
  L: 0.094, M: 0.094, N: 0.094, P: 0.094, R: 0.094,
  U: 0.078,
  C: 0.047, G: 0.047, I: 0.047, O: 0.047, Q: 0.047,
  S: 0.031, Z: 0.031,
  A: 0.016, J: 0.016, T: 0.016, V: 0.016, W: 0.016, X: 0.016,
  Y: 0,
};

/** 0,047 em — la valeur médiane, pour une initiale hors table (chiffre, symbole). */
const APPROCHE_DEFAUT = 0.047;

function approcheDe(titre: string): number {
  // « À » et « É » portent l'approche de leur lettre de base : l'accent est
  // au-dessus de la capitale, il ne déborde pas à gauche.
  const base = titre
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .charAt(0)
    .toUpperCase();
  return APPROCHE[base] ?? APPROCHE_DEFAUT;
}

export function PageHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <header className={s.head}>
      <div className={s.inner}>
        <h1
          className={s.title}
          style={{ "--approche": `${approcheDe(title)}em` } as React.CSSProperties}
        >
          {title}
        </h1>
        <p className={s.lede}>{lede}</p>
      </div>
    </header>
  );
}
