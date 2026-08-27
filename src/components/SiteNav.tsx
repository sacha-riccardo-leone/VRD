"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems } from "./nav-items";
import s from "./SiteNav.module.css";

/**
 * Seul îlot client du site : l'état ouvert/fermé du menu mobile.
 * Les liens sont rendus des deux côtés du même tableau `navItems`.
 *
 * Mouvement : l'apparition du panneau est une transition d'interface (≤ --dur),
 * pas l'idée « le dessin s'assemble ». `prefers-reduced-motion` la neutralise via
 * les jetons de durée. Aucun décalage de mise en page (le panneau est en overlay).
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  // Échap ferme le panneau.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className={s.nav} aria-label="Navigation principale">
      <button
        type="button"
        className={s.toggle}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.toggleLabel}>{open ? "Fermer" : "Menu"}</span>
        <span className={s.toggleIcon} data-open={open} aria-hidden="true" />
      </button>

      <ul id="menu-principal" className={s.list} data-open={open}>
        {navItems.map((item) => (
          <li key={item.href} className={s.item}>
            <Link href={item.href} className={s.link} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
