"use client";

import { useEffect, useRef } from "react";
import s from "./ThermalField.module.css";

/**
 * Champ thermique réactif — prototype de la section technique.
 *
 * Ce n'est pas « des lignes qui bougent ». C'est un champ scalaire (une source
 * de chaleur sous le curseur + un relief fixe) rendu en isothermes par
 * « marching squares ». Le curseur est un aimant : le champ suit un point qui
 * le poursuit avec inertie (lerp), d'où le réajustement magnétique. L'isotherme
 * la plus proche du curseur passe en trait plein blanc (plus épais), avec sa
 * valeur — c'est une figure, pas un décor : elle porte une unité (°C) et une légende.
 *
 * Contraintes respectées :
 *  - déclenché par le lecteur : la boucle rAF ne tourne QUE pendant/juste après
 *    un mouvement du curseur, puis s'arrête (aucune boucle ambiante) ;
 *  - `prefers-reduced-motion` : rendu statique unique, aucun écouteur, aucun rAF ;
 *  - canvas en fond, `pointer-events: none`, hauteur fixée : zéro décalage (CLS 0) ;
 *  - réservé au fond anthracite `.technique`, seul endroit où le mouvement est
 *    permis ; monochrome — les circuits se distinguent par l'épaisseur et le
 *    plein/tireté, pas par la couleur.
 */
export function ThermalField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Après montage, les refs sont attachées et getContext("2d") est fiable.
    // Non-null explicite : TS ne propage pas le narrowing d'un garde dans les
    // closures ci-dessous (render / resize / onMove).
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const host = wrap.parentElement ?? wrap;

    const cs = getComputedStyle(wrap);
    const C_LINE = cs.getPropertyValue("--on-dark-muted").trim() || "#b0aeab";
    const C_FRAME = cs.getPropertyValue("--dark-rule").trim() || "#333333";
    const C_ACTIVE = cs.getPropertyValue("--on-dark").trim() || "#f2efe9";

    // --- champ ------------------------------------------------------------
    const CELL = 26;
    const LMIN = -0.25;
    const LMAX = 1.55;
    const NL = 13;
    const GRID_PULL = 0.28; // fraction : à quel point la grille glisse vers le curseur
    const GRID_K = 0.045; // inertie de la grille (la sensation que tu as validée)
    const FIELD_K = 0.02; // inertie de la source thermique — plus lente que la grille
    const levels = Array.from({ length: NL }, (_, k) => LMIN + (k / (NL - 1)) * (LMAX - LMIN));
    const T_MIN = 18;
    const T_MAX = 24;

    // Relief fixe : quelques bosses pour que les isothermes ne soient pas des
    // cercles parfaits même au repos (coordonnées normalisées 0..1).
    const BUMPS = [
      { x: 0.28, y: 0.34, a: 0.55, s: 0.22 },
      { x: 0.7, y: 0.52, a: 0.5, s: 0.26 },
      { x: 0.52, y: 0.9, a: -0.4, s: 0.3 },
    ];

    let W = 0;
    let H = 0;
    let minDim = 1;
    let cols = 0;
    let rows = 0;
    let grid = new Float32Array(0);

    const target = { x: 0.5, y: 0.5 }; // normalisé
    const eased = { x: 0.5, y: 0.5 }; // pilote la grille
    const easedField = { x: 0.5, y: 0.5 }; // pilote la source thermique (plus lent)
    const cursorPx = { x: -1, y: -1 };
    let active = false;
    let running = false;
    let raf = 0;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    function fieldAt(px: number, py: number, ex: number, ey: number): number {
      let v = 0;
      for (const b of BUMPS) {
        const dx = px - b.x * W;
        const dy = py - b.y * H;
        const sg = b.s * minDim;
        v += b.a * Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg));
      }
      const dx = px - ex;
      const dy = py - ey;
      const sg = 0.24 * minDim; // source plus large = mouvement plus doux
      v += 0.9 * Math.exp(-(dx * dx + dy * dy) / (2 * sg * sg));
      return v;
    }

    function computeGrid() {
      const ex = easedField.x * W;
      const ey = easedField.y * H;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          grid[j * cols + i] = fieldAt(i * CELL, j * CELL, ex, ey);
        }
      }
    }

    // Marching squares : pour chaque case, les arêtes traversées par le niveau.
    const TABLE: ReadonlyArray<ReadonlyArray<readonly [string, string]>> = [
      [], [["L", "T"]], [["T", "R"]], [["L", "R"]],
      [["R", "B"]], [["L", "T"], ["R", "B"]], [["T", "B"]], [["L", "B"]],
      [["B", "L"]], [["T", "B"]], [["T", "R"], ["B", "L"]], [["R", "B"]],
      [["L", "R"]], [["T", "R"]], [["L", "T"]], [],
    ];

    function pathForLevel(L: number): Path2D {
      const p = new Path2D();
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const vTL = grid[j * cols + i];
          const vTR = grid[j * cols + i + 1];
          const vBR = grid[(j + 1) * cols + i + 1];
          const vBL = grid[(j + 1) * cols + i];
          const idx =
            (vTL >= L ? 1 : 0) | (vTR >= L ? 2 : 0) | (vBR >= L ? 4 : 0) | (vBL >= L ? 8 : 0);
          const segs = TABLE[idx];
          if (segs.length === 0) continue;
          const xL = i * CELL;
          const yT = j * CELL;
          const pt = (edge: string): [number, number] | null => {
            switch (edge) {
              case "T": {
                const d = vTR - vTL;
                return d === 0 ? null : [xL + ((L - vTL) / d) * CELL, yT];
              }
              case "R": {
                const d = vBR - vTR;
                return d === 0 ? null : [xL + CELL, yT + ((L - vTR) / d) * CELL];
              }
              case "B": {
                const d = vBR - vBL;
                return d === 0 ? null : [xL + ((L - vBL) / d) * CELL, yT + CELL];
              }
              default: {
                const d = vBL - vTL;
                return d === 0 ? null : [xL, yT + ((L - vTL) / d) * CELL];
              }
            }
          };
          for (const [ea, eb] of segs) {
            const a = pt(ea);
            const b = pt(eb);
            if (!a || !b) continue;
            p.moveTo(a[0], a[1]);
            p.lineTo(b[0], b[1]);
          }
        }
      }
      return p;
    }

    // La grille de construction reste DROITE (jamais déformée). Elle glisse
    // vers le curseur sur X et Y : les lignes verticales se décalent de `ox`,
    // les horizontales de `oy`. Le décalage suit le point aimanté `eased` (donc
    // du retard, un « lock-on » paresseux) et est plafonné par GRID_PULL — la
    // grille se rapproche du curseur sans jamais s'y coller.
    function drawFrame() {
      const ox = (eased.x - 0.5) * W * GRID_PULL;
      const oy = (eased.y - 0.5) * H * GRID_PULL;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = C_FRAME;
      ctx.setLineDash([2, 6]);
      ctx.lineWidth = 1;
      const nx = 6;
      const ny = 4;
      for (let i = 0; i <= nx; i++) {
        const x = (i / nx) * W + ox;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let j = 0; j <= ny; j++) {
        const y = (j / ny) * H + oy;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // marques de repère aux intersections, décalées avec la grille
      ctx.setLineDash([]);
      const m = 5;
      for (let i = 1; i < nx; i += 2) {
        for (let j = 1; j < ny; j += 1) {
          ctx.strokeRect((i / nx) * W + ox - m, (j / ny) * H + oy - m, m * 2, m * 2);
        }
      }
      ctx.restore();
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawFrame();

      let activeIdx = -1;
      if (active && cursorPx.x >= 0) {
        const vCur = fieldAt(cursorPx.x, cursorPx.y, easedField.x * W, easedField.y * H);
        let best = Infinity;
        for (let k = 0; k < levels.length; k++) {
          const d = Math.abs(levels[k] - vCur);
          if (d < best) {
            best = d;
            activeIdx = k;
          }
        }
      }

      ctx.save();
      ctx.globalAlpha = 0.34;
      ctx.strokeStyle = C_LINE;
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 1;
      for (let k = 0; k < levels.length; k++) {
        if (k === activeIdx) continue;
        ctx.stroke(pathForLevel(levels[k]));
      }
      ctx.restore();

      if (activeIdx >= 0) {
        // Distinction par le trait, pas la couleur : plein + plus épais + blanc.
        ctx.save();
        ctx.strokeStyle = C_ACTIVE;
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        ctx.stroke(pathForLevel(levels[activeIdx]));
        ctx.restore();

        const t = (levels[activeIdx] - LMIN) / (LMAX - LMIN);
        const temp = Math.round(T_MIN + Math.min(Math.max(t, 0), 1) * (T_MAX - T_MIN));
        ctx.save();
        ctx.fillStyle = C_ACTIVE;
        ctx.font = '500 12px ui-monospace, "IBM Plex Mono", monospace';
        ctx.fillText(`${temp} °C`, cursorPx.x + 14, cursorPx.y - 12);
        ctx.restore();
      }
    }

    function tick() {
      eased.x += (target.x - eased.x) * GRID_K;
      eased.y += (target.y - eased.y) * GRID_K;
      easedField.x += (target.x - easedField.x) * FIELD_K;
      easedField.y += (target.y - easedField.y) * FIELD_K;
      computeGrid();
      render();
      const rest = Math.max(
        Math.hypot(target.x - eased.x, target.y - eased.y),
        Math.hypot(target.x - easedField.x, target.y - easedField.y),
      );
      if (rest < 0.0015) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function kick() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function resize() {
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      minDim = Math.min(W, H);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      grid = new Float32Array(cols * rows);
      computeGrid();
      render();
    }

    function onMove(e: PointerEvent) {
      const r = canvas.getBoundingClientRect();
      cursorPx.x = e.clientX - r.left;
      cursorPx.y = e.clientY - r.top;
      target.x = Math.min(Math.max(cursorPx.x / W, 0), 1);
      target.y = Math.min(Math.max(cursorPx.y / H, 0), 1);
      active = true;
      kick();
    }

    function onLeave() {
      active = false;
      cursorPx.x = -1;
      target.x = 0.5;
      target.y = 0.5;
      kick();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    if (reduceMq.matches) {
      // Statique : champ centré, aucune interaction, aucune boucle.
      return () => ro.disconnect();
    }

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={s.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={s.canvas} />
    </div>
  );
}
