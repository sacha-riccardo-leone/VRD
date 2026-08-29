import s from "./PageHeader.module.css";

/**
 * En-tête commun à toutes les pages intérieures : cartouche de planche (mono,
 * numéro + lieu), titre, chapô. Un seul <h1> par page, porté ici.
 *
 * Le numéro de planche donne à chaque page sa place dans le dossier — c'est le
 * fil qui relie l'accueil aux pages intérieures.
 */
export function PageHeader({
  planche,
  title,
  lede,
}: {
  planche: string;
  title: string;
  lede: string;
}) {
  return (
    <header className={s.head}>
      <div className={s.sheet}>
        <p className="label">{planche}</p>
        <p className="label">VRD · Sugiez (FR)</p>
      </div>
      <div className={s.inner}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.lede}>{lede}</p>
      </div>
    </header>
  );
}
