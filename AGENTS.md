<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Règles propres à ce projet

**Intégrité du contenu — non négociable.** Ne jamais inventer de contenu VRD :
projets, clients, certifications, biographies, chiffres, témoignages. Tout
remplissage doit être visiblement étiqueté comme représentatif. Les éléments
non confirmés (rôle CVCS Coop/Rennaz, « 12 certificats Minergie-P »,
« +200 projets ») sont INFÉRÉS et ne doivent pas apparaître comme des faits.

**Français réel.** Accents et accords corrects. Ne jamais reproduire les
erreurs du site actuel (« projet commerciale », « techniques maitrisé »).

**Direction A « Le Dossier » uniquement — monochrome.** Papier off-white, encre
near-black, fond anthracite (#1C1C1C) réservé aux sections techniques. **Aucune
couleur d'accent** (décision du 28.08.2026) : les matériaux du client — cartes,
site, signalétique — sont noir/blanc ; le jaune de gaz a été écarté pour ne pas
imposer une teinte qu'ils n'ont pas choisie. Pas de cyan non plus.

**Le contraste ne passe jamais par la teinte.** Hiérarchie et emphase :
**inversion** encre↔papier, épaisseur de trait, tireté opposé au plein, poids
typographique. Le bouton primaire est un aplat d'encre à texte papier ; au
survol il s'inverse (papier, texte encre, filet d'encre). Les liens sont en
encre soulignée. L'anneau de focus est en encre sur papier (16.28:1) et en
papier sur anthracite (14.85:1).

**Classe `.technique`** pour les sections sombres. Elle réassigne `--paper`,
`--ink`, `--rule*` et `--focus-ring` ; tout ce qui est à l'intérieur hérite.

**Pas de seconde teinte pour les schémas.** Les circuits se distinguent par
épaisseur de trait et tireté avant la couleur — ça survit à l'impression
noir et blanc et au daltonisme.

**Dépendances : zéro par défaut.** Chaque ajout doit se justifier.

**Motifs en fond de section — exception consignée (29.08.2026).** Les dessins
techniques sont normalement des figures : ils portent unité, étiquette ou
légende. Posés en FOND ils ne le font plus — c’est de la décoration, assumée
comme telle. Elle n’est admise que sous la discipline du composant
`FigureBackdrop` : teinte `--rule` (jamais `--ink`), aucune étiquette, aucun
mouvement, `aria-hidden`, `pointer-events: none`, hors flux. Un motif en fond
qui s’anime, qui porte du texte, ou dont la teinte s’approche de l’encre, sort
de l’exception. Elle vise les motifs POSÉS en fond via `FigureBackdrop` ; elle
ne concerne pas `ThermalField`, qui est une figure interactive à part entière —
il porte ses unités, réagit au lecteur et relève de la règle générale. `npm run audit:contrast` vérifie que le texte reste lisible
par-dessus (`--ink` sur `--rule`).

**Mouvement : une seule idée** — « le dessin s'assemble ». Déclenché par le
lecteur, ≤400 ms, `prefers-reduced-motion` respecté, aucun décalage de mise
en page.

**Le contenu technique est le sujet, jamais un décor.** Chaque schéma porte
une unité, une étiquette ou une légende. Si supprimer la légende ne fait rien
perdre, supprimer le visuel.

**Accessibilité WCAG 2.1 AA.** Repères sémantiques, un seul `h1` par page,
anneau de focus visible, tout opérable au clavier, cibles tactiles ≥44 px.

**`npm run verify` doit passer avant chaque push.**
