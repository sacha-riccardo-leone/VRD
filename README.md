# VRD — site vitrine (démonstration spéculative)

Maquette déployable pour **VRD ingénieurs-conseils SA**, bureau d'ingénieurs
en technique du bâtiment (CVCS) à Sugiez, canton de Fribourg.

> **Démonstration non officielle.** Ce dépôt n'est pas commandité par VRD et
> ne remplace pas leur site de production. `noindex` global + `robots.txt`
> `Disallow: /` sont volontaires — voir la note dans `src/app/layout.tsx`.

---

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

Node ≥ 20.9 (voir `.nvmrc`). npm, lockfile commité.

## Scripts

| Script | Ce qu'il fait |
| --- | --- |
| `npm run dev` | serveur de développement |
| `npm run build` | build de production, toutes les pages en statique |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run audit:contrast` | matrice de contraste WCAG 2.1 depuis `tokens.css`, sort en erreur si un couple passe sous son seuil |
| `npm run verify` | les quatre ci-dessus, dans l'ordre |

`npm run verify` doit passer avant chaque push.

## Décisions structurantes

**Pas de `output: 'export'`.** Toutes les pages sont générées statiquement et
le rendu visiteur est identique à un export, mais la route API reste
disponible pour le formulaire de contact. Passer à `export` plus tard coûte
une ligne de config plus le remplacement du formulaire par un service hébergé.

**Zéro dépendance runtime au-delà de Next et React.** Pas de Tailwind, pas de
bibliothèque d'animation, pas de bibliothèque d'icônes, pas de SDK de cartes.
Toute dépendance ajoutée doit se justifier dans la PR qui l'introduit.

**Palette — monochrome.** Papier off-white, encre near-black, fond anthracite
#1C1C1C pour les sections techniques. Aucune couleur d'accent (décision du
28.08.2026) : le contraste passe par l'inversion encre↔papier, l'épaisseur de
trait, le tireté/plein et le poids typographique. `npm run audit:contrast`
vérifie chaque couple texte/fond.

**Polices auto-hébergées.** IBM Plex Sans 400/600 + IBM Plex Mono 400/500,
sous-ensemble `latin` uniquement — vérifié comme couvrant l'intégralité du jeu
français (œ Œ, guillemets, tirets cadratins, €, °, µ). 76 Ko pour les quatre
fontes. Licence OFL 1.1 dans `src/fonts/LICENSE-IBM-Plex.txt`.

**Pas de GitHub Actions.** Le build Vercel est le CI. Un seul pipeline.

## Arborescence

```
scripts/audit-contrast.mjs   audit de contraste, sans dépendance
src/app/                     routes (App Router)
  layout.tsx                 <html lang="fr">, polices, posture noindex
  robots.ts                  Disallow: / pendant la démonstration
  tokens/                    ← page de revue INTERNE, à supprimer avant livraison
src/fonts/                   .woff2 + licence OFL
src/lib/contrast.ts          formule WCAG, utilisée au build
src/styles/
  tokens.css                 source de vérité des jetons
  globals.css                reset + primitives globales
```

## Intégrité du contenu — règle dure

Aucun contenu VRD n'est inventé. Pas de référence de projet, de nom de client,
de certification, de biographie ni de statistique fabriquée. Tout contenu de
remplissage est **visiblement étiqueté** comme représentatif.

Les pages *Réalisations* et *L'équipe* utilisent du contenu représentatif
explicitement marqué, décision arrêtée le 27.08.2026.

## État

- [x] Étape 1 — chaîne dépôt / build / déploiement
- [x] Étape 2 — jetons, typographie, contrastes mesurés
- [ ] Étape 3 — page d'accueil *(bloquée : wireframe et copie FR)*
- [ ] Étape 4 — pages secondaires *(bloquée : arborescence)*
- [ ] Étape 5 — contenu technique / schémas
- [ ] Étape 6 — SEO et redirections *(bloquée : inventaire d'URL)*
- [ ] Étape 7 — formulaire de contact
- [ ] Étape 8 — audit accessibilité et performance
- [ ] Étape 9 — emballage du pitch
