"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CANTONS, ZONE } from "./cantons";
import { MANQUANTS, POINTS, type Point } from "./points";
import { ecarter } from "./relaxation";
import s from "./CarteSuisse.module.css";

/**
 * Carte des réalisations — un seul `<svg>`, aucune requête réseau, aucune clé
 * d'API, aucune tuile.
 *
 * Pourquoi pas Leaflet ou Google Maps : une bibliothèque cartographique
 * transmet l'adresse IP du visiteur à un tiers dès l'affichage, ce qui relève
 * du consentement préalable en Europe, et ajoute une dépendance qui peut tomber
 * ou devenir payante. Le compromis assumé : pas de fond de carte — ni routes,
 * ni relief, ni noms de villes. Pour situer huit chantiers dans un pays, c'est
 * suffisant, et c'est plus lisible.
 */

const ZOOM_MAX = 6;
/** Cible tactile : 44 px de diamètre, quelle que soit la largeur d'affichage. */
const RAYON_CIBLE_PX = 22;
const TAILLE_EPINGLE_PX = 13;

type Fenetre = { x: number; y: number; w: number; h: number };

const DEPART: Fenetre = { x: 0, y: 0, w: ZONE.largeur, h: ZONE.hauteur };

/** Empêche la fenêtre de sortir du pays. */
function borner(f: Fenetre): Fenetre {
  const w = Math.min(ZONE.largeur, Math.max(ZONE.largeur / ZOOM_MAX, f.w));
  const h = w * (ZONE.hauteur / ZONE.largeur);
  return {
    w,
    h,
    x: Math.min(Math.max(0, f.x), ZONE.largeur - w),
    y: Math.min(Math.max(0, f.y), ZONE.hauteur - h),
  };
}

export function CarteSuisse() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [fenetre, setFenetre] = useState<Fenetre>(DEPART);
  const [actif, setActif] = useState<string | null>(null);
  const [largeurPx, setLargeurPx] = useState(900);

  // Le zoom se DÉDUIT de la fenêtre plutôt que d'être stocké à part : deux
  // sources de vérité finiraient par diverger.
  const zoom = ZONE.largeur / fenetre.w;
  const pxParUnite = largeurPx / fenetre.w;

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setLargeurPx(el.getBoundingClientRect().width || 900));
    ro.observe(el);
    setLargeurPx(el.getBoundingClientRect().width || 900);
    return () => ro.disconnect();
  }, []);

  // Fonction pure, mémoïsée sur le seul zoom.
  const places = useMemo(() => ecarter(POINTS.map((p) => ({ id: p.slug, x: p.x, y: p.y })), zoom), [zoom]);
  const parSlug = useMemo(() => new Map(POINTS.map((p) => [p.slug, p])), []);

  /** Zoom ancré : le point sous le curseur reste sous le curseur. */
  const zoomer = useCallback((facteur: number, ancreX: number, ancreY: number) => {
    setFenetre((f) => {
      const fx = (ancreX - f.x) / f.w;
      const fy = (ancreY - f.y) / f.h;
      const w = f.w / facteur;
      const h = w * (ZONE.hauteur / ZONE.largeur);
      return borner({ w, h, x: ancreX - fx * w, y: ancreY - fy * h });
    });
  }, []);

  const surMolette = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const r = e.currentTarget.getBoundingClientRect();
      const ax = fenetre.x + ((e.clientX - r.left) / r.width) * fenetre.w;
      const ay = fenetre.y + ((e.clientY - r.top) / r.height) * fenetre.h;
      zoomer(e.deltaY < 0 ? 1.2 : 1 / 1.2, ax, ay);
    },
    [fenetre, zoomer],
  );

  // L'état du glissement vit dans une référence : le stocker dans l'état
  // provoquerait un rendu à chaque mouvement de souris.
  const glisse = useRef<{ x: number; y: number; fx: number; fy: number; bouge: number } | null>(null);
  const [enGlisse, setEnGlisse] = useState(false);

  const surPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (zoom <= 1.001) return;
    glisse.current = { x: e.clientX, y: e.clientY, fx: fenetre.x, fy: fenetre.y, bouge: 0 };
    setEnGlisse(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const surPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = glisse.current;
    if (!g) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - g.x) / r.width) * fenetre.w;
    const dy = ((e.clientY - g.y) / r.height) * fenetre.h;
    g.bouge = Math.max(g.bouge, Math.hypot(e.clientX - g.x, e.clientY - g.y));
    setFenetre((f) => borner({ ...f, x: g.fx - dx, y: g.fy - dy }));
  };

  const surPointerUp = () => {
    glisse.current = null;
    setEnGlisse(false);
  };

  // Un doigt bouge toujours un peu : sans ce seuil, taper une épingle sur une
  // carte zoomée n'ouvrirait jamais son lien.
  const estUnClic = () => !glisse.current || glisse.current.bouge < 5;

  const p = actif ? parSlug.get(actif) : null;
  const place = actif ? places.find((q) => q.id === actif) : null;

  // L'infobulle se place toute seule : deux booléens composent les quatre
  // placements. En pourcentage du conteneur, pour survivre au redimensionnement.
  const fx = place ? ((place.x - fenetre.x) / fenetre.w) * 100 : 0;
  const fy = place ? ((place.y - fenetre.y) / fenetre.h) * 100 : 0;
  const dessous = fy < 34;
  const aGauche = fx > 72;

  return (
    <section className={`technique ${s.bande}`} aria-labelledby="carte-titre">
      <div className={s.cadre}>
        <div className={s.entete}>
          <h2 id="carte-titre" className="label">
            Implantation des références
          </h2>
          <p className={s.legende}>
            {POINTS.length} références situées
            {MANQUANTS > 0 ? ` · ${MANQUANTS} sans localisation` : ""}
          </p>
        </div>

        <div className={s.scene} ref={sceneRef}>
          <svg
            className={s.carte}
            viewBox={`${fenetre.x} ${fenetre.y} ${fenetre.w} ${fenetre.h}`}
            role="img"
            aria-label="Carte de Suisse situant les références documentées de VRD"
            data-glissable={zoom > 1.001 ? "oui" : "non"}
            data-glisse={enGlisse ? "oui" : "non"}
            onWheel={surMolette}
            onPointerDown={surPointerDown}
            onPointerMove={surPointerMove}
            onPointerUp={surPointerUp}
            onPointerCancel={surPointerUp}
          >
            {/* Couche 1 — les cantons */}
            <g>
              {CANTONS.map((c) => (
                <path
                  key={c.sigle}
                  className={s.canton}
                  d={c.d}
                  vectorEffect="non-scaling-stroke"
                >
                  <title>{c.nom}</title>
                </path>
              ))}
            </g>
            <g aria-hidden="true">
              {CANTONS.map((c) => (
                <text
                  key={c.sigle}
                  className={s.sigleCanton}
                  x={c.etiquette.x}
                  y={c.etiquette.y}
                  style={{ fontSize: `${9 / pxParUnite}px` }}
                >
                  {c.sigle}
                </text>
              ))}
            </g>

            {/* Couche 2 — les épingles. Taille constante à l'écran : c'est ce
                qui donne l'impression que les points se séparent quand on
                zoome, au lieu de grossir ensemble en restant un amas. */}
            <g>
              {places.map((q) => {
                const pt = parSlug.get(q.id);
                if (!pt) return null;
                const ech = TAILLE_EPINGLE_PX / pxParUnite;
                const rCible = RAYON_CIBLE_PX / pxParUnite;
                const ouvert = actif === q.id;
                return (
                  <g key={q.id}>
                    {q.deplace && (
                      <g className={s.rappel} strokeWidth={1 / pxParUnite}>
                        <line x1={q.vraiX} y1={q.vraiY} x2={q.x} y2={q.y} />
                        <circle cx={q.vraiX} cy={q.vraiY} r={1.5 / pxParUnite} fill="currentColor" />
                      </g>
                    )}
                    {/* La transformation porte sur un `g` : en JSX, `a` est
                        typé comme une ancre HTML et n'accepte pas `transform`. */}
                    <g transform={`translate(${q.x} ${q.y}) scale(${ouvert ? 1.2 : 1})`}>
                    <a
                      href={`#${pt.slug}`}
                      className={s.epingle}
                      aria-label={`${pt.nom}, ${pt.lieu}${pt.canton ? ` (${pt.canton})` : ""} — aller à la fiche${q.deplace ? ", position ajustée pour lisibilité" : ""}`}
                      onMouseEnter={() => setActif(q.id)}
                      onMouseLeave={() => setActif(null)}
                      onFocus={() => setActif(q.id)}
                      onBlur={() => setActif(null)}
                      onClick={(e) => {
                        if (!estUnClic()) e.preventDefault();
                      }}
                    >
                      <ellipse cx={0} cy={0} rx={ech * 0.32} ry={ech * 0.12} className={s.ombre} />
                      {/* Goutte en un seul chemin, anneau évidé par evenodd. */}
                      <path
                        className={s.goutte}
                        fillRule="evenodd"
                        strokeWidth={1 / pxParUnite}
                        d={goutte(ech)}
                      />
                      {/* Zone de clic centrée sur le CORPS de la goutte, pas sur
                          sa pointe : on clique là où on voit le marqueur. */}
                      <circle className={s.cible} cx={0} cy={-ech * 0.62} r={rCible} />
                    </a>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Couche 3 — la fiche, en HTML à côté du SVG. */}
          {p && place && (
            <div
              className={s.fiche}
              aria-hidden="true"
              style={{
                left: aGauche ? undefined : `${fx}%`,
                right: aGauche ? `${100 - fx}%` : undefined,
                top: dessous ? `${fy}%` : undefined,
                bottom: dessous ? undefined : `${100 - fy}%`,
                marginBlock: dessous ? "1.2rem 0" : "0 1.2rem",
                marginInline: aGauche ? "0 0.6rem" : "0.6rem 0",
              }}
            >
              <p className={s.ficheNom}>{p.nom}</p>
              <p className={s.ficheMeta}>
                {p.lieu}
                {p.canton ? ` / ${p.canton}` : ""} · {p.annees}
              </p>
              <p className={s.ficheBudget}>{p.budgetLabel}</p>
              {place.deplace && (
                <p className={s.ficheNote}>Position ajustée pour la lisibilité.</p>
              )}
              {/* Le portfolio ne donne pas le canton de Savigny. Le point vient
                  d'un fait vérifiable — commune unique de ce nom en Suisse — et
                  la carte le dit plutôt que de le laisser passer pour acquis. */}
              {p.deduit && <p className={s.ficheNote}>{p.deduit}</p>}
            </div>
          )}

          <div className={s.commandes}>
            <button
              type="button"
              className={s.bouton}
              onClick={() => zoomer(1.5, fenetre.x + fenetre.w / 2, fenetre.y + fenetre.h / 2)}
              disabled={zoom >= ZOOM_MAX - 0.001}
              aria-label="Agrandir la carte"
            >
              +
            </button>
            <button
              type="button"
              className={s.bouton}
              onClick={() => zoomer(1 / 1.5, fenetre.x + fenetre.w / 2, fenetre.y + fenetre.h / 2)}
              disabled={zoom <= 1.001}
              aria-label="Réduire la carte"
            >
              −
            </button>
            <button
              type="button"
              className={s.bouton}
              onClick={() => setFenetre(DEPART)}
              disabled={zoom <= 1.001}
              aria-label="Revenir à la vue d’ensemble"
            >
              ⤢
            </button>
          </div>
        </div>

        <p className={s.pied}>
          <span>Frontières : OFS / swisstopo via swiss-maps (BSD-3-Clause).</span>
          <span>
            Positions au centre de la localité — sauf la gare de La
            Chaux-de-Fonds, située à l’ouvrage.
          </span>
        </p>
      </div>
    </section>
  );
}

/** Goutte classique : corps circulaire, pointe en bas, anneau évidé. */
function goutte(t: number): string {
  const r = t * 0.42;
  const cy = -t * 0.62;
  const rc = r * 0.36;
  return [
    `M 0 0`,
    `C ${-r * 0.75} ${-t * 0.5} ${-r} ${cy + r * 0.55} ${-r} ${cy}`,
    `A ${r} ${r} 0 1 1 ${r} ${cy}`,
    `C ${r} ${cy + r * 0.55} ${r * 0.75} ${-t * 0.5} 0 0`,
    `Z`,
    `M ${-rc} ${cy}`,
    `a ${rc} ${rc} 0 1 0 ${2 * rc} 0`,
    `a ${rc} ${rc} 0 1 0 ${-2 * rc} 0`,
    `Z`,
  ].join(" ");
}

export type { Point };
