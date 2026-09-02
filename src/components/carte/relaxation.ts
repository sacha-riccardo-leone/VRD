/**
 * Écartement des épingles qui se recouvrent.
 *
 * Deux références de VRD sont dans la même ville — l'usine TAG-Heuer de La
 * Chaux-de-Fonds et la gare de La Chaux-de-Fonds, séparées de quelques
 * centaines de mètres. À l'échelle du pays leurs épingles se superposent et
 * deviennent incliquables.
 *
 * Le procédé est celui des rédactions de données pour les cartes annotées à
 * faible nombre de points : pour chaque paire plus proche qu'un espacement
 * minimal, pousser chacune de la moitié du recouvrement le long de l'axe qui
 * les relie, et recommencer. Chaque déplacement est BRIDÉ, faute de quoi un
 * amas dense finit par expulser une épingle dans le canton voisin.
 *
 * Fonction PURE : à entrées identiques, sortie identique. Elle ne dépend que du
 * zoom, donc elle se mémoïse avec le zoom pour seule dépendance.
 */

export type Ancre = { id: string; x: number; y: number };
export type Place = Ancre & { vraiX: number; vraiY: number; deplace: boolean };

/** En unités de la zone de dessin, AVANT division par le zoom. */
const ESPACEMENT = 36;
const DEPLACEMENT_MAX = 70;
const ITERATIONS = 40;
/** En deçà, le déplacement ne mérite ni ligne de rappel ni mention. */
const SEUIL_DEPLACE = 0.5;

export function ecarter(points: Ancre[], zoom: number): Place[] {
  // L'espacement voulu est constant À L'ÉCRAN : en unités de la zone de dessin
  // il doit donc rétrécir quand on zoome. C'est ce qui fait que les amas se
  // dénouent d'eux-mêmes au zoom, et que les lignes de rappel disparaissent
  // sans qu'on ait à l'expliquer.
  const espacement = ESPACEMENT / zoom;
  const bride = DEPLACEMENT_MAX / zoom;

  // Ordre stable. Sans lui, l'accumulation en virgule flottante change d'un
  // rendu à l'autre et les épingles frémissent.
  const tri = [...points].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const p = tri.map((a) => ({ ...a, vraiX: a.x, vraiY: a.y, deplace: false }));

  for (let it = 0; it < ITERATIONS; it++) {
    let bouge = 0;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const a = p[i];
        const b = p[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);

        if (d >= espacement) continue;

        if (d < 1e-6) {
          // Deux points exactement confondus : la direction de poussée est
          // indéfinie. On en dérive une des indices plutôt que de la tirer au
          // hasard, qui réintroduirait le frémissement d'un rendu à l'autre.
          const angle = ((i * 73 + j * 149) % 360) * (Math.PI / 180);
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          d = 1;
        }

        const pousse = (espacement - d) / 2;
        const ux = (dx / d) * pousse;
        const uy = (dy / d) * pousse;
        a.x -= ux;
        a.y -= uy;
        b.x += ux;
        b.y += uy;
        bouge += pousse;
      }
    }

    // Bride : une épingle ne s'éloigne jamais de plus de `bride` de sa vraie
    // place. Appliquée à chaque tour, pas seulement à la fin — sinon les tours
    // suivants repartent d'une position déjà illégale.
    for (const q of p) {
      const dx = q.x - q.vraiX;
      const dy = q.y - q.vraiY;
      const d = Math.hypot(dx, dy);
      if (d > bride) {
        q.x = q.vraiX + (dx / d) * bride;
        q.y = q.vraiY + (dy / d) * bride;
      }
    }

    if (bouge < 1e-3) break;
  }

  for (const q of p) {
    q.deplace = Math.hypot(q.x - q.vraiX, q.y - q.vraiY) > SEUIL_DEPLACE;
  }
  return p;
}
