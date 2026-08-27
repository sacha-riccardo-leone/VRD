import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Layout du site public. Ajoute l'en-tête et le pied de page autour de chaque
 * page du groupe (site). La route `/tokens` reste hors de ce groupe : elle n'a
 * que le layout racine, sans chrome de site (c'est une page de revue interne).
 *
 * html/body vivent dans le layout racine — un seul par application.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
