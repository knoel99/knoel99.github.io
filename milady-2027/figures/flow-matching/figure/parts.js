// Shared glyphs of the « flow-matching » figure: colour key, space-time frame, sideways density profiles,
// sample dots, direction-field arrows. Every panel draws the same objects through these helpers.

export const K = {
  noise: '#8a8a8a', noiseFill: '#e6e6e6',          // base law N(0, I): neutral grey (context)
  path: '#c6c6c6',                                  // conditional straight paths (context)
  fan: '#555555',                                   // the conditional paths through one point (panel a)
  ink: '#2b2b2b', mid: '#7a7a7a', light: '#bdbdbd', faint: '#f2f2f2',
  data: '#0072B2', dataFill: '#d4e6f3', dataPale: '#9cc7e6',   // data law of a = law at lambda_2
  lam1: '#D55E00', lam1Fill: '#f9dfcf',                        // law at lambda_1
};

// space-time frame: t in [0, 1] runs left to right (x0 -> x1, pt), one coordinate of x runs up (yMid at x = 0, sy pt per unit)
export function frame(x0, x1, yMid, sy) {
  return { T: (t) => x0 + t * (x1 - x0), Y: (x) => yMid - x * sy, x0, x1, yMid, sy, sx: x1 - x0 };
}

export function heading(L, P, str, opts = {}) {
  return L.text(P, opts.dx ?? 11, opts.dy ?? 7.6, str, { size: 7, weight: 'bold', color: K.ink, role: 'title' });
}

// density drawn sideways from the vertical baseline X (dir -1: to the left, +1: to the right), k pt per unit of density
export function profile(L, g, fr, X, grid, pdf, k, dir, { fill, stroke, width = 0.5, xr = [-9, 9], fillOpacity = 1 } = {}) {
  const pts = [];
  grid.forEach((x, i) => { if (x >= xr[0] && x <= xr[1]) pts.push([X + dir * k * pdf[i], fr.Y(x)]); });
  const d = 'M' + pts.map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`).join(' L');
  const y0 = pts[0][1], y1 = pts[pts.length - 1][1];
  L.path(g, `M${X.toFixed(2)},${y0.toFixed(2)} ` + d.replace('M', 'L') + ` L${X.toFixed(2)},${y1.toFixed(2)} Z`, { fill, fillOpacity, stroke: 'none' });
  L.path(g, d, { stroke, width, join: 'round' });
  return pts;
}

export function dot(L, g, x, y, r, fill, stroke, width = 0.3) {
  return L.circle(g, x, y, r, { fill, stroke: stroke ?? 'none', width });
}

// short arrow of fixed page length along the space-time tangent (1, v) at (t, x)
export function fieldArrow(L, g, fr, t, x, v, len, s = {}) {
  const dx = fr.sx, dy = -fr.sy * v, n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  const cx = fr.T(t), cy = fr.Y(x), f = s.from ?? 0.5;
  const a = [cx - ux * len * f, cy - uy * len * f], b = [cx + ux * len * (1 - f), cy + uy * len * (1 - f)];
  return L.arrow(g, a, b, { stroke: s.stroke ?? K.ink, width: s.width ?? 0.4, head: s.head ?? 1.9, headWidth: s.headWidth ?? 0.85, opacity: s.opacity });
}

// polyline through [t, x] pairs
export function curve(L, g, fr, tx, s) {
  return L.polyline(g, tx.map(([t, x]) => [fr.T(t), fr.Y(x)]), { join: 'round', cap: 'round', ...s });
}

// time axis under a frame: arrow, ticks at the given t, labels for some of them
export function timeAxis(L, g, fr, y, { ticks = [0, 1], labels = { 0: '0', 1: '1' }, over = 7, size = 6.5 } = {}) {
  L.arrow(g, [fr.T(0), y], [fr.T(1) + over, y], { stroke: K.ink, width: 0.4, head: 2.2, headWidth: 0.95 });
  for (const t of ticks) L.line(g, [fr.T(t), y], [fr.T(t), y + 1.6], { stroke: K.ink, width: 0.4 });
  for (const [t, s] of Object.entries(labels)) L.text(g, fr.T(+t), y + 2.4, s, { size, anchor: 'middle', valign: 'top', color: K.ink });
  L.text(g, fr.T(1) + over + 1.2, y, '*t*', { size, anchor: 'start', valign: 'middle', color: K.ink });
}
