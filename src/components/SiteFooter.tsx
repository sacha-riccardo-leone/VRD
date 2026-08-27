import s from "./SiteFooter.module.css";

/**
 * Pied de page (composant serveur). Porte les coordonnées réelles et la mention
 * de démonstration — exigée tant que la maquette n'est pas approuvée par VRD
 * (voir la note dans app/layout.tsx et le README).
 */
export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div>
          <p className={s.wordmark}>VRD ingénieurs-conseils SA</p>
          <p className={s.tagline}>Technique du bâtiment · Sugiez (FR)</p>
        </div>

        <address className={s.contact}>
          <p className="label">Contact</p>
          <p>
            Chemin du Chablais 46
            <br />
            1786 Sugiez
          </p>
          <p>
            <a className={s.link} href="tel:+41265520100">
              026 552 01 00
            </a>
            <br />
            <a className={s.link} href="mailto:info@vrd-ingenieurs.ch">
              info@vrd-ingenieurs.ch
            </a>
          </p>
        </address>

        <div>
          <p className="label">Démonstration</p>
          <p className={s.demoText}>
            Maquette non officielle, sans lien avec VRD ingénieurs-conseils SA.
            Certains contenus sont représentatifs, à des fins de démonstration.
          </p>
        </div>
      </div>

      <div className={s.baseline}>
        <div className={s.baselineInner}>
          <span>© 2026 · démonstration non officielle</span>
          <span>Direction A · « Le Dossier »</span>
        </div>
      </div>
    </footer>
  );
}
