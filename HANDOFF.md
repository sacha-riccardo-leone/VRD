# Reprise sur une autre machine

État au commit `d918ce1`, branche `main`,
`https://github.com/sacha-riccardo-leone/VRD.git`.

---

## 1. Ce que c'est

Proposition de site **spéculative** pour **VRD ingénieurs-conseils SA**, bureau
d'ingénieurs en technique du bâtiment (CVCS) à Sugiez, canton de Fribourg. Ce
n'est pas un remplacement commandé du site actuel : c'est un artefact de
présentation, déployé sur Vercel, destiné à leur être montré.

Next.js 16.3.3 / React 19.2.8, App Router, TypeScript strict, CSS Modules,
toutes les routes prérendues. **Zéro dépendance runtime** hors `next` et
`react` — pas de Tailwind, pas de bibliothèque d'animation, pas de librairie
d'icônes.

---

## 2. Démarrer

```bash
git clone https://github.com/sacha-riccardo-leone/VRD.git && cd VRD && npm install
```

`npm run verify` doit passer avant chaque push : `typecheck → lint →
audit:contrast → build`. L'audit de contraste est **bloquant** (WCAG AA).

Piège relevé plusieurs fois dans cette session : ne jamais faire passer `verify`
dans un `| tail`, le code de sortie est masqué et un échec passe pour un succès.

```bash
npm run verify > /tmp/v.log 2>&1; RC=$?; echo "VERIFY_EXIT=$RC"; tail -5 /tmp/v.log
```

### Fichiers hors dépôt à recopier à la main

Ils sont dans le dossier parent, **pas dans git**, et ne suivront pas un clone :

| fichier | ce qu'il contient |
|---|---|
| `VRD-project-context.md` | les trois briefs de départ, verbatim |
| `VRD-portfolio-data.md` | les faits extraits du portfolio PDF — la seule source de vérité sur VRD |
| `VRD-build-plan.md` | le plan de construction par étapes |
| `VRD-cowork-instructions.md` | consignes de tenue pour les sessions |
| `Portfolio_VRD_ingenieurs.pdf` | l'original (PDF image, sans couche texte — extrait via PyMuPDF en PNG) |
| `portal-zoom.html` | démo de référence du portail, fournie par l'utilisateur |

Pour l'aperçu navigateur, `.claude/launch.json` à la racine de l'espace de
travail (le dossier **parent** du dépôt) :

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "vrd-dev", "runtimeExecutable": "npm", "runtimeArgs": ["--prefix", "VRD", "run", "dev"], "port": 3000 }
  ]
}
```

---

## 3. Règles non négociables

Reprises des briefs, et à tenir telles quelles :

- **Ne jamais inventer de contenu VRD.** Projets, clients, certifications,
  biographies, chiffres, témoignages : tout doit venir de `VRD-portfolio-data.md`
  ou d'une source citée. Le remplissage doit être visiblement étiqueté comme
  représentatif. Déjà arrivé deux fois dans cette session : un canton inventé
  (« Savigny / VD ») et un décompte faux (« 5 cantons »). Les deux ont été
  retirés.
- **Vérifier avant d'affirmer.** Chercher la source, ne pas répondre de mémoire.
- **Étiqueter** : FOUND (avec URL) / INFERRED / ASSUMED. Ce qui n'existe pas
  publiquement se note « not found » — l'absence est un résultat, pas un trou à
  combler.
- **Contredire l'utilisateur quand son cadrage est faux**, avec des preuves.
- **Pas de préambule, pas d'annonce de ce qu'on va faire, pas de proposition
  d'aide en clôture.**
- **Français réel** : accents et accords corrects. Ne pas reproduire les fautes
  du site actuel (« projet commerciale », « techniques maitrisé »).
- **Monochrome, sans couleur d'accent** (décision du 28.08.2026). Papier
  `#F2EFE9`, encre `#141210`, anthracite `#1C1C1C`. Le contraste passe par
  l'inversion, l'épaisseur de trait, le tireté, le poids — jamais par la teinte.
- `AGENTS.md` (chargé via `CLAUDE.md`) fait foi pour le reste.

---

## 4. Où en est la construction

**Routes** — `/`, `/prestations`, `/realisations`, `/a-propos`, `/carrieres`,
`/contact`, plus `/labo` et `/tokens` (pages de travail). `/methode` a été
supprimée à la demande de l'utilisateur. L'entrée de nav « Accueil » pointe sur
`/`, il n'y a pas de route `/accueil`.

**Pièces principales**

| composant | rôle |
|---|---|
| `Hero` | le portail de la page d'accueil — voir §5 |
| `ThermalField` | champ d'isothermes au curseur (marching squares), deux points aimantés à inerties différentes |
| `OctagonNav` | les 8 disciplines en octogone sur `/prestations`, déplacement magnétique au survol |
| `ProofBar` | bandeau de chiffres, `CountUp` sur le 200+ |
| `Approche` | le texte « Notre approche », fourni par le père de l'utilisateur |
| `CoutCycleVie` | graphique du surcoût de réparation |
| `FigureBackdrop` | motifs techniques posés en fond — exception consignée dans `AGENTS.md` |
| `iso.ts`, `exploded-parts.ts` | projection isométrique et données des éclatés |

**Contenu** — `src/content/realisations.ts` (les 8 références réelles du
portfolio, `canton` renseigné seulement là où le portfolio le dit,
`BUDGET_TOTAL_MIOS` et `CANTONS` dérivés) et `src/content/disciplines.ts`
(`teaser: null` pour sprinkler et MCR, faute de texte existant).

---

## 5. Le portail du hero — l'essentiel à ne pas casser

C'est là qu'est passé tout l'effort récent. **Toutes les constantes du fichier
sont mesurées, aucune n'est choisie.** Chaque tentative précédente a échoué
exactement pour cette raison : une valeur devinée. Ne pas « simplifier » ces
nombres.

### Principe

Une plaque anthracite en `position: fixed` couvre la fenêtre, **percée** aux
lettres « VRD » par un `<mask>` SVG. La page défile derrière et se lit au travers
du sigle. Au défilement, le masque grandit autour d'un point pris dans le plein
du **jambage gauche du V** — le V parce qu'il n'a pas de contrepoinçon : dans un
masque, le contrepoinçon d'une lettre reste opaque et balaie l'écran.

Progression **exponentielle** `maxScale ** p`, pas quadratique. La course vaut
exactement un écran.

### Les trois pannes trouvées, dans l'ordre

1. **`maxScale` sous-évalué.** Deux erreurs cumulées : les fractions relevées au
   canvas se rapportent au *pas* de la police mais étaient appliquées à la
   *chasse* (qui inclut l'interlettrage −12), et un terme vertical `dy/(demi*4)`
   sans aucun sens géométrique. La couverture n'était atteinte qu'à p = 0,986.
2. **Région de masque de 18000 × 18000 unités.** Un `<mask>` est *rastérisé*, pas
   découpé vectoriellement : à 1920 × 1080 cela réclamait 28 575 × 28 575 px,
   816 mégapixels, au-delà de la limite de texture de 16 384. Le rendu se
   bloquait. Réduite à la viewBox + un liseré (`ZONE`), soit 2,5 Mpx.
   **NE PAS AGRANDIR** — la démonstration que ça suffit est dans le fichier.
3. **La vraie cause du fond noir : un glyphe ne se rastérise pas indéfiniment.**
   Mesuré, invariant en **pixels d'écran**, donc l'échelle autorisée *tombe*
   quand la fenêtre grandit — d'où un défaut qui empirait en plein écran.

   | corps écran | état |
   |---|---|
   | 9 600 px | fidèle (écart 0,07 %) |
   | 10 080 px | la déformation commence (1,21 %) |
   | 10 560 px | glyphe faux (4,51 %) |
   | 10 890 px | le trou disparaît, plaque noire |

   `GLYPHE_MAX_PX = 9600` vise le **dernier corps fidèle**, pas la disparition.
   C'est la zone de déformation qui produisait les « boules pixelisées » et les
   morceaux de lettre manquants. **Cette valeur dépend de la fonte** — la même
   mesure sur une sans-serif générique donnait 11 840. Si la police du sigle
   change, il faut reprendre la mesure.

### Le relais

Les deux jambages du V sont relevés **ligne par ligne, à arêtes sous-pixel**
(interpolation de la rampe d'anticrénelage), puis reconstruits en deux
quadrilatères qui les **contiennent** sur toute leur hauteur — chaque arête est
ajustée sur la corde des lignes extrêmes puis décalée du plus grand écart relevé.
Les ajouter au masque ne change donc rien à l'image. Passé l'échelle où ils
suffisent seuls, le `<text>` est retiré et les barres continuent : un polygone
n'a pas de limite de taille.

L'échelle du relais est calculée : il faut que le **R**, le **jambage droit** et
les extrémités du V aient quitté le cadre. Elle vaut ≈ 10,6 ici, plafonnée par ce
que le moteur sait encore dessiner fidèlement.

### Piste écartée, à ne pas ressusciter

Un audit a proposé de **geler** l'échelle du texte au lieu de le retirer, en
affirmant que le glyphe figé ne pouvait ajouter que du hors-cadre ou de
l'intérieur de barre. **C'est faux**, et mesuré comme tel. L'homothétie n'est sûre
que pour une forme contenant le centre : la barre gauche contient le repère de
plongée, la droite non. Le jambage droit figé, ramené vers le repère, tombe dans
le creux du V, hors des deux barres, et y reste immobile pendant que le reste
plonge — **jusqu'à 20 % de l'écran à l'échelle 12**.

### État vérifié

| fenêtre | dpr | relais | saut au relais | marge glyphe |
|---|---|---|---|---|
| 1280 | 1 | 10,6 | 0 % | 2,83× |
| 1920 | 1 | 10,6 | 0 % | 1,89× |
| 1920 | 2 | 9,0 | 0 % | 1,11× |
| 3840 | 1 | 9,0 | 0 % | 1,11× |
| 2560 | 2 | 6,75 | **1,67 %** | 1,11× |

Anthracite résiduel nul dès l'échelle 50 partout. Le seul cas imparfait est un
grand écran dense : un liseré au bord, sur une image.

---

## 6. Mesurer le portail — le harnais

**L'aperçu navigateur intégré ment sur ce composant.** Il rapporte
`document.hidden = true`, donc `requestAnimationFrame` ne se déclenche jamais et
le portail paraît figé ; et ses captures d'écran d'un calque masqué en
`position: fixed` sont composées de travers. Ne pas diagnostiquer à l'œil dessus.

La méthode fiable : reconstruire la même structure dans une chaîne
`<svg>` → data-URI → `<img>` → `<canvas>`, puis lire les pixels. Blink rastérise
par le même chemin, et on obtient une réponse numérique sur tout l'écran plutôt
qu'un coup d'œil.

Trois mesures utiles :

- **anthracite résiduel** — proportion de pixels opaques, par échelle ;
- **saut au relais** — pixels différant entre « avec texte » et « barres seules »
  à la même échelle ; doit valoir 0 ;
- **fidélité du glyphe** — même région utilisateur rendue à deux résolutions
  (1200 × 630, sûr, contre 3840 × 2016) ; tout écart de surface est une
  déformation.

---

## 7. Ce qui reste ouvert

**Signalé par l'utilisateur, pas encore traité**

- « There's way too much text in the website all over. » Rien n'a été fait
  là-dessus, c'est probablement le prochain vrai chantier.

**Questions de design en suspens**

- « S.T. 2021 » dans le hero, ou « Depuis 2021 » ?
- Le hero a-t-il besoin d'un appel à l'action ?
- Rendre l'en-tête transparent au-dessus du hero sombre ?
- Le liseré à 2560 en dpr 2 (§5) — corrigeable en élargissant l'arête extérieure
  de la barre droite, au prix d'un jambage très légèrement plus gras au repos.

**Bloqué sur le client, pas sur la construction**

- Textes pour **Sprinkler**, **MCR** et **Froid** — les sections existent, la
  copie n'existe pas (`teaser: null`).
- Photos et biographies au-delà des deux directeurs.
- Le 22ᵉ logo client, illisible dans le PDF.
- Les certifications Minergie / CECB+ : mentionnées, jamais confirmées. Elles
  sont marquées INFÉRÉES et ne doivent pas apparaître comme des faits.

---

## 8. Amorce pour la prochaine session

> Reprends le projet VRD. Lis d'abord `HANDOFF.md`, `AGENTS.md` et
> `VRD-portfolio-data.md`. Tiens les règles du §3 : ne rien inventer sur VRD,
> vérifier avant d'affirmer, étiqueter les sources, me contredire quand je me
> trompe, pas de préambule ni de conclusion de politesse.
