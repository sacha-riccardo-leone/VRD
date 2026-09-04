import s from "./PageHeader.module.css";

/**
 * En-tête commun à toutes les pages intérieures : titre et chapô. Un seul
 * <h1> par page, porté ici.
 *
 * Le cartouche de planche (« Planche 02 » + « VRD · Sugiez (FR) ») a été
 * retiré : le numéro ne disait rien au lecteur, et la mention du siège se
 * répétait de page en page alors qu'elle a sa place au pied et sur Contact.
 */
export function PageHeader({
  title,
  lede,
}: {
  title: string;
  lede: string;
}) {
  return (
    <header className={s.head}>
      <div className={s.inner}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.lede}>{lede}</p>
      </div>
    </header>
  );
}
