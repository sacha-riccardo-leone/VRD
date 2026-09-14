import Link from "next/link";
import type { ReactNode } from "react";
import s from "./BandeauSuite.module.css";

/**
 * Le bandeau de clôture — anthracite, un grand bouton.
 *
 * Un seul composant pour l'accueil (→ /prestations) et pour /prestations
 * (→ /contact) : Sacha a demandé que le second soit « exactement » le premier
 * (14.09.2026). Le partage est la seule façon de le garantir — deux copies
 * finiraient par diverger.
 *
 * Grammaire : kicker « Suite », titre, ligne d'appui, puis le bouton primaire
 * inversé, retourné en sujet — un aplat clair sur toute la largeur de la
 * colonne, au corps d'un h2. Il domine par l'INVERSION et la pleine largeur,
 * les leviers d'AGENTS.md, pas par le corps : le titre reste au corps de tout
 * h2 du site. Rien après le bouton : /prestations avait le téléphone en
 * complément, retiré le 14.09.2026 — il est sur /contact, où mène le bouton.
 *
 * Composant serveur : pas d'état, pas de script. Le seul mouvement est dans le
 * CSS — la flèche qui se trace au survol ou au focus.
 *
 * Le kicker « Suite » se lit deux fois si l'on enchaîne accueil → prestations.
 * Vocabulaire commun du site, gardé ; repli si VRD tique : « Et maintenant ».
 */
export function BandeauSuite({
  id,
  titre,
  texte,
  href,
  action,
}: {
  /** Identifiant du titre, cible d'`aria-labelledby` — unique par page. */
  id: string;
  titre: ReactNode;
  texte: ReactNode;
  href: string;
  /** Le texte du bouton. */
  action: ReactNode;
}) {
  return (
    <section className={`technique ${s.band}`} aria-labelledby={id}>
      <div className={s.inner}>
        {/* Pas de classe de module : la marge sous le kicker vit sur `.title`
            (`margin-block-start`), comme sur le précédent de /prestations. */}
        <p className="label">Suite</p>

        <h2 id={id} className={s.title}>
          {titre}
        </h2>

        <p className={s.text}>{texte}</p>

        {/* La flèche est dessinée plutôt que tapée : une ligne de construction
            en tireté, une pointe pleine, et un trait plein qui se trace
            par-dessus le tireté au survol — le dessin s'assemble. Tout en
            currentColor : elle suit l'inversion du bouton. Masquée aux
            lecteurs d'écran — le nom du lien suffit. */}
        <Link href={href} className={s.primary}>
          <span className={s.primaryText}>{action}</span>
          <svg
            className={s.arrow}
            viewBox="0 0 48 24"
            aria-hidden="true"
            focusable="false"
          >
            <line
              x1="4"
              y1="12"
              x2="44"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
            <line
              className={s.shaft}
              x1="4"
              y1="12"
              x2="44"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M33 1 L44 12 L33 23"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
