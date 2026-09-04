/**
 * Les neuf pictogrammes des domaines — dessinés ici, aucune bibliothèque
 * ajoutée (le projet n'en utilisait aucune).
 *
 * Un seul fichier, une seule spécification de trait : `stroke: currentColor`,
 * épaisseur 1.4, extrémités arrondies, viewBox 24×24, aucun remplissage. C'est
 * ce qui fait qu'ils se lisent comme un jeu et non comme neuf dessins.
 * Ils reprennent l'iconographie du portfolio de VRD (flamme, hélice, flocon,
 * goutte, sprinkler, nœud BIM, courbe MCR, issue de secours, feuille) traduite
 * au trait.
 *
 * Purement décoratifs : le nom du domaine est toujours écrit à côté.
 */
export function DisciplineIcon({ name, className }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
  };

  switch (name) {
    case "chauffage": // flamme
      return (
        <svg {...common}>
          <path d="M12 3c2.5 3 4.5 5 4.5 8a4.5 4.5 0 0 1-9 0c0-1.2.5-2.3 1.4-3.4.4 1 1 1.6 1.8 1.8C10.5 7.4 11 5.2 12 3Z" />
        </svg>
      );
    case "ventilation": // hélice
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1.7" />
          <path d="M12 10.3c0-3 .6-5.3 2.2-5.3 1.4 0 2 1.7.8 3.4-.8 1.1-1.9 1.7-3 1.9Z" />
          <path d="M13.7 12c3 0 5.3.6 5.3 2.2 0 1.4-1.7 2-3.4.8-1.1-.8-1.7-1.9-1.9-3Z" />
          <path d="M10.3 12c-3 0-5.3-.6-5.3-2.2 0-1.4 1.7-2 3.4-.8 1.1.8 1.7 1.9 1.9 3Z" />
          <path d="M12 13.7c0 3-.6 5.3-2.2 5.3-1.4 0-2-1.7-.8-3.4.8-1.1 1.9-1.7 3-1.9Z" />
        </svg>
      );
    case "froid": // flocon
      return (
        <svg {...common}>
          <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
          <path d="M12 6.6 9.9 4.9M12 6.6l2.1-1.7M12 17.4l-2.1 1.7M12 17.4l2.1 1.7" />
          <path d="m6.8 9.6-2.6.3M17.2 14.4l2.6-.3M6.8 14.4l-2.6.3M17.2 9.6l2.6-.3" />
        </svg>
      );
    case "sanitaire": // goutte
      return (
        <svg {...common}>
          <path d="M12 3.5c3 3.6 5 6.2 5 8.7a5 5 0 0 1-10 0c0-2.5 2-5.1 5-8.7Z" />
          <path d="M9.6 13.2a2.6 2.6 0 0 0 2 3" />
        </svg>
      );
    case "sprinkler": // tête sprinkler + jet
      return (
        <svg {...common}>
          <path d="M12 3v4.2M8.4 7.2h7.2" />
          <path d="M10 7.2c0 1.6.9 2.6 2 2.6s2-1 2-2.6" />
          <path d="M6.6 12.6 5.4 15M9.6 13.6l-.5 2.7M14.4 13.6l.5 2.7M17.4 12.6l1.2 2.4M12 13.2v3.2" />
        </svg>
      );
    case "bim": // nœud entrelacé
      return (
        <svg {...common}>
          <rect x="4.6" y="9.4" width="9.4" height="9.4" rx="1" transform="rotate(-45 9.3 14.1)" />
          <rect x="10" y="4" width="9.4" height="9.4" rx="1" transform="rotate(-45 14.7 8.7)" />
        </svg>
      );
    case "mcr": // courbe de régulation
      return (
        <svg {...common}>
          <rect x="3.4" y="5.2" width="17.2" height="13.6" rx="1.2" />
          <path d="M6.4 15.4l3-3.4 2.6 2 4.6-5.2" />
          <path d="M16.6 8.8h-2.2M16.6 8.8v2.2" />
        </svg>
      );
    case "securite-incendie": // issue de secours + flèche d'évacuation
      // Le motif de l'évacuation plutôt que celui du feu : à 24 px une flamme
      // barrée reste une flamme et se confondrait avec le chauffage, alors que
      // le local ouvert et la flèche gardent une silhouette qui n'existe pas
      // ailleurs dans le jeu.
      return (
        <svg {...common}>
          <path d="M10.4 4.8H5.6A1.2 1.2 0 0 0 4.4 6v12a1.2 1.2 0 0 0 1.2 1.2h4.8" />
          <path d="M9.2 12h10.4" />
          <path d="m16.2 8.8 3.4 3.2-3.4 3.2" />
        </svg>
      );
    default: // energetique — feuille
      return (
        <svg {...common}>
          <path d="M19 5c0 7.2-3.4 11-8 11a5.6 5.6 0 0 1-5.4-4C7 8.2 11.6 5.6 19 5Z" />
          <path d="M5 19c1.6-3.4 4-6 7.4-7.8" />
        </svg>
      );
  }
}
