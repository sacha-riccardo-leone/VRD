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
 * STRUCTURE — la piste N'EST PAS dans le bouton. Un bouton rend son contenu
 * « présentationnel » et un `aria-label` en écrase le nom : une piste dans le
 * bouton aurait caché le texte des cadres (et, demain, l'`alt` des photos) à
 * tout lecteur d'écran. La piste est donc un bloc ordinaire, lu comme tel — la
 * vue courante seule, les autres sont `aria-hidden` — et le bouton « Photo
 * suivante » est une surface transparente posée PAR-DESSUS : c'est lui qu'on
 * clique, c'est lui qui prend le focus, et il ne porte aucun texte visible.
 *
 * LE JOUR OÙ LES PHOTOS ARRIVENT : dans chaque `.vue`, remplacer le
 * `<span className={s.cadre}>` par une image (next/image, `fill`, `alt` qui
 * décrit la pièce), garder l'ordre d'`EMPLACEMENTS`, retirer « à fournir »
 * du compteur et de l'intro de la page. La piste, la surface, les commandes
 * ne changent pas — l'`alt` de la vue courante sera lu, les autres non.
 *
 * FONCTIONNEMENT. Clic sur la scène ou sur → : suivante ; ← : précédente ;
 * boucle après la dernière. Deux boutons de 44 px pour le clavier, un
 * compteur en région vive et atomique pour qu'un lecteur d'écran entende le
 * message entier (« 02 / 05 · emplacement réservé »), pas le seul chiffre
 * qui change.
 *
 * MOUVEMENT — le glissement de la piste, `transform` seul, en --dur (240 ms),
 * déclenché par le lecteur : dans la règle. Sous `prefers-reduced-motion`,
 * --dur vaut 1 ms, la vue change sans glisser. Aucun décalage de mise en
 * page : la scène a un rapport 3:2 fixe, quelle que soit la vue.
 */

const NOMBRE = 5;
const EMPLACEMENTS = Array.from({ length: NOMBRE }, (_, i) => i + 1);
const deux = (n: number) => String(n).padStart(2, "0");

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
        <div
          className={s.piste}
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {EMPLACEMENTS.map((n) => (
            <div className={s.vue} key={n} aria-hidden={n - 1 !== index}>
              <span className={s.cadre}>
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
            </div>
          ))}
        </div>

        {/* La surface cliquable, par-dessus la piste. Sans contenu : son nom
            est son action, et rien de visible ne le contredit. */}
        <button
          type="button"
          className={s.surface}
          onClick={suivante}
          aria-label="Photo suivante"
        />
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
