import type { ReactNode } from "react";
import s from "./FigureBackdrop.module.css";

/**
 * Substrat de planche — un motif technique posé en FOND de section.
 *
 * Décision assumée (29.08.2026) : en figure, ces dessins portent unités et
 * légendes, donc ils informent. En fond, ils ne le font plus : c'est de la
 * décoration, choisie sciemment. La discipline qui la rend acceptable :
 *
 *  - épaisseur de substrat — teinte `--rule`, le jeton des filets décoratifs
 *    (1.31:1 sur papier), jamais `--ink`. Le motif se lit comme le grain du
 *    papier, pas comme une illustration qui concurrence le texte ;
 *  - aucune étiquette — une donnée illisible en fond est pire que pas de
 *    donnée ; les <text> sont masqués ;
 *  - aucun mouvement — le budget « le dessin s'assemble » appartient aux
 *    figures. Un fond qui s'anime derrière du texte est une distraction ;
 *  - `aria-hidden` et `pointer-events: none` — invisible aux technologies
 *    d'assistance, jamais un obstacle au pointeur ni à la sélection ;
 *  - hors flux (`position: absolute`) — aucun décalage de mise en page.
 *
 * Sur fond anthracite, `.technique` redéfinit `--rule`, donc le substrat suit
 * la surface sans réglage supplémentaire.
 */
export type BackdropPlacement = "right" | "left" | "center";

export function FigureBackdrop({
  children,
  placement = "right",
  size = "60%",
}: {
  children: ReactNode;
  placement?: BackdropPlacement;
  size?: string;
}) {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <div className={`${s.inner} ${s[placement]}`} style={{ inlineSize: size }}>
        {children}
      </div>
    </div>
  );
}
