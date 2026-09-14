import type { Metadata, Viewport } from "next";
import { plexMono, plexSans } from "@/fonts";
import "@/styles/globals.css";

/**
 * DEMO POSTURE — deliberate.
 *
 * This is a speculative pitch built with VRD's name. It must not be indexed
 * and must not read as an official VRD property. `noindex` here plus
 * `Disallow: /` in app/robots.ts are both required: robots.txt asks crawlers
 * not to *fetch*, the meta tag stops indexing of URLs discovered elsewhere.
 *
 * Remove both only when VRD has approved the work.
 */
export const metadata: Metadata = {
  title: {
    default: "VRD ingénieurs-conseils SA",
    template: "%s · VRD ingénieurs-conseils SA",
  },
  description:
    "Bureau d'ingénieurs-conseils en technique du bâtiment à Sugiez (FR) : chauffage, ventilation, climatisation, sanitaire.",
  robots: { index: false, follow: false, nocache: true },
  /* Icônes : convention de fichiers de l'App Router, pas de champ `icons` —
     src/app/favicon.ico (16/32/48, vrai .ico), icon.png (500 px, le fichier
     fourni par Sacha le 14.09.2026, converti sans perte) et apple-icon.png
     (180 px). Next les sert et écrit les <link rel="icon"> tout seul. Le fond
     de l'icône est #f5f5f5 — --paper, comme themeColor. */
};

export const viewport: Viewport = {
  /* Doit valoir --paper (src/styles/tokens.css). Ecrit en dur parce qu'une
     variable CSS ne se lit pas depuis les metadonnees : le navigateur teinte
     sa barre AVANT d'avoir la moindre feuille de style. C'est la seule copie
     d'un jeton dans le depot ; si --paper change, cette ligne change avec. */
  themeColor: "#f5f5f5",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <a className="skipLink" href="#contenu">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
