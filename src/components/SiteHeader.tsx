import Link from "next/link";
import { SiteNav } from "./SiteNav";
import s from "./SiteHeader.module.css";

/**
 * En-tête du site (composant serveur). L'interactivité vit dans <SiteNav />,
 * le seul îlot client, pour garder le bundle client minimal.
 */
export function SiteHeader() {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Link
          href="/"
          className={s.wordmark}
          aria-label="VRD ingénieurs-conseils, accueil"
        >
          <span className={s.mark}>VRD</span>
          <span className={s.markSub}>ingénieurs-conseils</span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
