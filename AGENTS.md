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

**Direction A « Le Dossier » uniquement.** Papier off-white, encre near-black,
un seul accent jaune (#FCC603), fond anthracite (#1C1C1C) réservé aux sections
techniques. Pas de cyan.

**L'accent inverse son rôle selon la surface.** #FCC603 mesure **1.38:1** sur
le papier : sous tous les seuils WCAG, texte comme non-texte. Sur papier il
n'est jamais un premier plan — uniquement un remplissage (`--on-signal` posé
dessus, 11.76:1), un filet ou un surlignage (`--signal-wash`). Sur fond
anthracite il redevient un premier plan (10.73:1) : texte, traits, cotes,
anneau de focus. Les liens sur papier sont en encre avec un soulignement
jaune, jamais en jaune.

**Classe `.technique`** pour les sections sombres. Elle réassigne `--paper`,
`--ink`, `--rule*` et `--focus-ring` ; tout ce qui est à l'intérieur hérite.

**Pas de seconde teinte pour les schémas.** Les circuits se distinguent par
épaisseur de trait et tireté avant la couleur — ça survit à l'impression
noir et blanc et au daltonisme.

**Dépendances : zéro par défaut.** Chaque ajout doit se justifier.

**Mouvement : une seule idée** — « le dessin s'assemble ». Déclenché par le
lecteur, ≤400 ms, `prefers-reduced-motion` respecté, aucun décalage de mise
en page.

**Le contenu technique est le sujet, jamais un décor.** Chaque schéma porte
une unité, une étiquette ou une légende. Si supprimer la légende ne fait rien
perdre, supprimer le visuel.

**Accessibilité WCAG 2.1 AA.** Repères sémantiques, un seul `h1` par page,
anneau de focus visible, tout opérable au clavier, cibles tactiles ≥44 px.

**`npm run verify` doit passer avant chaque push.**
