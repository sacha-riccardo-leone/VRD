"use client";

import { useState } from "react";
import s from "./DiaporamaBureau.module.css";

/**
 * Le diaporama des locaux — pour l'instant, des emplacements vides.
 *
 * Sacha l'a demandé ainsi (14.09.2026) : sous « Le bureau », à la place du
 * cartouche de registre, des cadres réservés à des photos du bureau et de ses
 * pièces, qu'on fait défiler en cliquant. VRD n'a fourni aucune photo, donc
 * AUCUNE image n'est montrée, et aucun cadre ne prétend savoir ce qu'il
 * contiendra : ni « salle de réunion », ni « atelier » — on ne connaît pas
 * les pièces. Chaque cadre dit ce qu'il est : un emplacement, numéroté, à
 * fournir. Le tireté est la convention du site pour ce qui est représentatif,
 * et les deux diagonales sont celles d'une surface non définie sur un plan.
 * Cinq emplacements : un nombre de maquette, pas un nombre de pièces.
 *
 * LA FRISE (seconde version, même jour). La photo courante est au centre, à
 * plat, pleine opacité. La précédente et la suivante restent visibles de
 * part et d'autre, à 50 %, pivotées sur leur axe vertical vers le centre —
 * les volets d'un paravent. Quand on avance, tout glisse d'un cran : la
 * suivante vient au centre en se redressant, la courante part en se
 * penchant. Chaque vue a une POSITION relative à la courante, −2 … +2 ; la
 * feuille de style pose transformation et opacité par position, et la
 * transition fait le reste. Les positions ±2 sont hors champ, invisibles :
 * elles servent au passage, pour qu'une vue entre et sorte par le bon côté.
 *
 * INTERACTION. Cliquer la photo du centre : suivante. Cliquer une photo de
 * côté : elle vient au centre. Deux boutons ← → de 44 px pour le clavier, un
 * compteur en région vive et atomique. Boucle après la dernière.
 *
 * STRUCTURE — les cadres NE SONT PAS dans les boutons. Un bouton rend son
 * contenu « présentationnel » et un `aria-label` en écrase le nom : le texte
 * des cadres (et, demain, l'`alt` des photos) doit rester lisible. Chaque vue
 * porte donc son cadre, lu comme un bloc ordinaire — seule la vue courante
 * n'est pas `aria-hidden` — et une surface cliquable transparente posée
 * PAR-DESSUS, sans texte, dont le nom est son action.
 *
 * LE JOUR OÙ LES PHOTOS ARRIVENT : dans chaque `.vue`, remplacer le
 * `<span className={s.cadre}>` par une image (next/image, `fill`, `alt` qui
 * décrit la pièce), garder l'ordre d'`EMPLACEMENTS`, retirer « à fournir »
 * du compteur et de l'intro de la page. Rien d'autre ne change.
 *
 * MOUVEMENT — glissement et pivot en une seule transition, `transform` et
 * `opacity` seuls, en --dur-slow (400 ms, le plafond), déclenchée par le
 * lecteur. Sous `prefers-reduced-motion`, --dur-slow vaut 1 ms : la vue
 * change de place sans glisser. Aucun décalage de mise en page : la scène a
 * une hauteur fixe, dérivée du rapport 3:2 de la vue centrale.
 */

const NOMBRE = 5;
const EMPLACEMENTS = Array.from({ length: NOMBRE }, (_, i) => i + 1);
const deux = (n: number) => String(n).padStart(2, "0");

/** Position d'une vue par rapport à la courante, dans −2 … +2, en anneau. */
const position = (i: number, courante: number) =>
  ((i - courante + NOMBRE + 2) % NOMBRE) - 2;

export function DiaporamaBureau() {
  const [index, setIndex] = useState(0);
  const suivante = () => setIndex((i) => (i + 1) % NOMBRE);
  const precedente = () => setIndex((i) => (i - 1 + NOMBRE) % NOMBRE);

  return (
    <div
      className={s.diaporama}
      role="region"
      aria-roledescription="diaporama"
      aria-label="Les locaux — emplacements réservés aux photos"
    >
      <div className={s.scene}>
        {EMPLACEMENTS.map((n, i) => {
          const pos = position(i, index);
          const courante = pos === 0;
          const visible = Math.abs(pos) <= 1;
          return (
            <div className={s.vue} key={n} data-pos={pos}>
              <span className={s.cadre} aria-hidden={!courante}>
                {/* Les deux diagonales d'une surface non définie. Trait de
                    1 px à toute taille (`non-scaling-stroke`), dans --rule. */}
                <svg
                  className={s.croix}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <line x1="0" y1="0" x2="100" y2="100" vectorEffect="non-scaling-stroke" />
                  <line x1="100" y1="0" x2="0" y2="100" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className={`label ${s.cadreNum}`}>
                  Emplacement {deux(n)}&nbsp;/&nbsp;{deux(NOMBRE)}
                </span>
                <span className={s.cadreTexte}>
                  Photo du bureau à fournir par VRD
                </span>
              </span>

              {/* La surface cliquable, par-dessus le cadre. Sans contenu :
                  son nom est son action. Hors champ, pas de bouton du tout —
                  rien de focalisable qui ne se voie pas. */}
              {visible &&
                (courante ? (
                  <button
                    type="button"
                    className={s.surface}
                    onClick={suivante}
                    aria-label="Photo suivante"
                  />
                ) : (
                  <button
                    type="button"
                    className={s.surface}
                    onClick={() => setIndex(i)}
                    aria-label={`Voir l’emplacement ${deux(n)}`}
                  />
                ))}
            </div>
          );
        })}
      </div>

      <div className={s.commandes}>
        <button
          type="button"
          className={s.bouton}
          onClick={precedente}
          aria-label="Précédente"
        >
          ←
        </button>
        <p
          className={`label ${s.compteur}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {deux(index + 1)}&nbsp;/&nbsp;{deux(NOMBRE)} · emplacement réservé
        </p>
        <button
          type="button"
          className={s.bouton}
          onClick={suivante}
          aria-label="Suivante"
        >
          →
        </button>
      </div>
    </div>
  );
}
