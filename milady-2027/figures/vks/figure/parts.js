// Parts of the « vks » figure: the VKS cylinder in vector 3D (one orthographic view shared by both drawings of
// panel a), its turbines, the mean-flow glyphs, and the small polarity glyph reused in panel b.
// World units: R (radius of the sodium volume) = 1; axis along x; z up. Geometry record: docs/facts.md.
export const K = {
  u: '#0072B2', uPale: '#8DB9D9', B: '#D55E00', rev: '#5E3C99', exc: '#009E73',
  ink: '#2b2b2b', mid: '#7a7a7a', light: '#bdbdbd', faint: '#ececec',
  sodium: '#E3E7EC', iron: '#6B7178', ironDark: '#454A50', shaft: '#9AA1A9', vessel: '#5C636B',
};
export const G = { H: 1.27, Xi: 0.90, Ri: 0.75, hb: 0.20, td: 0.05, hub: 0.13, shaftR: 0.055, shaftOut: 0.95, ring: 0.85 };

const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// orthographic projection, verticals vertical: azimuth phi from the front toward -x, elevation eps; k pt per R
export function proj(L, k, origin, phi = 22, eps = 14) {
  const p = phi * Math.PI / 180, e = eps * Math.PI / 180, cp = Math.cos(p), sp = Math.sin(p), ce = Math.cos(e), se = Math.sin(e);
  return L.obliqueProj({ x: [k * cp, -k * sp * se], y: [-k * sp, -k * cp * se], z: [0, -k * ce], origin, view: [-sp * ce, -cp * ce, se] });
}
const ringPt = (x, r, t) => [x, r * Math.cos(t), r * Math.sin(t)];
const pg = (P, w) => P(w[0], w[1], w[2]);
const ellD = (L, P, x, r, n = 96) => L.smooth(Array.from({ length: n }, (_, i) => pg(P, ringPt(x, r, 2 * Math.PI * i / n))), true);
// front-ness of a point on a ring around the x axis (> 0: on the viewer's side of the meridional plane through the axis)
const front = (P, t) => Math.cos(t) * P.view[1] + Math.sin(t) * P.view[2];
// the parameter of the ring point nearest the viewer
export const tFront = (P) => Math.atan2(P.view[2], P.view[1]);

// ---- vessel ------------------------------------------------------------------------------------------
export function vesselBack(p, L, P, o = {}) {
  const { H } = G, g = L.group(p, { part: 'vessel-back', opacity: o.opacity }).node;
  // sodium volume (body + both end discs), lit from the upper left
  L.cylinder3(g, P, [-H, 0, 0], [H, 0, 0], 1, 1, { fill: o.sodium ?? K.sodium, shading: true, cap: false, stroke: 'none', part: 'sodium' });
  L.path(g, ellD(L, P, H, 1), { fill: L.shade(o.sodium ?? K.sodium, -0.06), stroke: K.vessel, width: 0.35, part: 'end-far' });
  // mid-plane annulus (thin ring on the wall, x = 0): back half only here
  const tf = tFront(P), back = Array.from({ length: 49 }, (_, i) => tf + Math.PI / 2 + Math.PI * i / 48);
  const out = back.map((t) => pg(P, ringPt(0, 1, t))), inn = back.map((t) => pg(P, ringPt(0, G.ring, t))).reverse();
  L.polygon(g, [...out, ...inn], { fill: L.shade(K.shaft, 0.35), stroke: K.mid, width: 0.3, part: 'annulus' });
  return g;
}
export function vesselFront(p, L, P, o = {}) {
  const { H } = G, g = L.group(p, { part: 'vessel-front' }).node;
  // front half of the annulus, translucent
  const tf = tFront(P), fr = Array.from({ length: 49 }, (_, i) => tf - Math.PI / 2 + Math.PI * i / 48);
  const out = fr.map((t) => pg(P, ringPt(0, 1, t))), inn = fr.map((t) => pg(P, ringPt(0, G.ring, t))).reverse();
  L.polygon(g, [...out, ...inn], { fill: L.shade(K.shaft, 0.4), fillOpacity: o.annulusOpacity ?? 0.55, stroke: K.mid, width: 0.3, part: 'annulus-front' });
  // near end wall (x = -H) as a glass wash, then the silhouette and a highlight
  L.path(g, ellD(L, P, -H, 1), { fill: '#ffffff', fillOpacity: o.capOpacity ?? 0.28, stroke: K.vessel, width: 0.45, part: 'end-near' });
  L.cylinder3(g, P, [-H, 0, 0], [H, 0, 0], 1, 1, { fill: 'none', cap: false, stroke: K.vessel, width: 0.6, part: 'vessel' });
  L.cylinder3(g, P, [-H, 0, 0], [H, 0, 0], 1, 1, { fill: 'none', cap: false, stroke: 'none', streak: { at: 0.62, width: 0.1, opacity: 0.75, t0: 0.03, t1: 0.97 }, part: 'vessel-streak' });
  return g;
}

// ---- turbines ----------------------------------------------------------------------------------------
// side +1: right turbine at x = +Xi, blades toward -x (face visible); side -1: left turbine, seen from behind.
export function turbine(p, L, P, side, o = {}) {
  const { Xi, Ri, hb, td, hub } = G, g = L.group(p, { part: 'turbine', opacity: o.opacity }).node;
  const iron = o.iron ?? K.iron, dark = L.shade(iron, -0.35), lite = L.shade(iron, 0.3);
  const xf = side * Xi, xb = side * (Xi + td), xt = side * (Xi - hb);   // fluid face, back face, blade tips
  const nb = 8, blade = (j) => {
    // curved blade: from r = 0.2 to r = Ri, the angle advancing with r (same curvature on both turbines)
    const n = 14, pts = Array.from({ length: n + 1 }, (_, i) => { const r = 0.2 + (Ri - 0.2) * i / n; return [r, 2 * Math.PI * j / nb + 0.15 + 0.95 * (r - 0.2)]; });
    return pts;
  };
  const disc = () => L.cylinder3(g, P, [Math.min(xf, xb), 0, 0], [Math.max(xf, xb), 0, 0], Ri, Ri, { fill: iron, shading: true, capFill: side > 0 ? L.shade(iron, 0.12) : L.shade(iron, 0.05), stroke: dark, width: 0.4, part: 'turbine-disc' });
  const drawBlades = () => {
    const items = [];
    for (let j = 0; j < nb; j++) {
      const pts = blade(j), mid = pts[7];
      const depth = P.depth(...ringPt((xf + xt) / 2, mid[0], mid[1]));
      items.push({ depth, pts });
    }
    items.sort((a, b) => a.depth - b.depth);
    for (const { pts } of items) {
      const base = pts.map(([r, t]) => pg(P, ringPt(xf, r, t))), tip = pts.map(([r, t]) => pg(P, ringPt(xt, r, t)));
      L.polygon(g, [...base, ...tip.slice().reverse()], { fill: lite, stroke: dark, width: 0.3, join: 'round', part: 'blade' });
      L.polyline(g, tip, { stroke: L.shade(iron, 0.55), width: 0.35, part: 'blade-edge' });
    }
  };
  if (side > 0) { disc(); drawBlades(); L.cylinder3(g, P, [xt, 0, 0], [xf, 0, 0], hub, hub, { fill: lite, shading: true, stroke: dark, width: 0.35, part: 'hub' }); }
  else { drawBlades(); L.cylinder3(g, P, [xt, 0, 0], [xf, 0, 0], hub, hub, { fill: lite, shading: true, stroke: dark, width: 0.35, part: 'hub' }); disc(); }
  return g;
}
export function shaft(p, L, P, x0, x1, o = {}) {
  return L.cylinder3(p, P, [x0, 0, 0], [x1, 0, 0], G.shaftR, G.shaftR, { fill: o.fill ?? K.shaft, shading: true, stroke: K.vessel, width: 0.35, part: 'shaft' });
}

// ---- rotation glyphs ---------------------------------------------------------------------------------
// arc around the x axis in the plane x = xc, radius r, angular velocity s·x (s = ±1); part 'back' | 'front' | 'all'.
// Returns the page tip and direction of the head (drawn when head: true).
export function ringArc(p, L, P, xc, r, s, o = {}) {
  const tf = tFront(P), span = o.span ?? 1.25 * Math.PI, c = o.centre ?? tf;
  const t0 = c - s * span / 2, n = 80;
  const ts = Array.from({ length: n + 1 }, (_, i) => t0 + s * span * i / n);
  const pts = ts.map((t) => pg(P, ringPt(xc, r, t)));
  const width = o.width ?? 0.9, color = o.color ?? K.ink;
  // split by side so that the back part can be drawn before the content and the front part after it
  const runs = []; let cur = null;
  ts.forEach((t, i) => { const f = front(P, t) >= 0 ? 'front' : 'back'; if (!cur || cur.k !== f) { cur = { k: f, pts: i ? [pts[i - 1]] : [] }; runs.push(cur); } cur.pts.push(pts[i]); });
  for (const run of runs) {
    if (o.part !== 'all' && run.k !== o.part) continue;
    L.polyline(p, run.pts, { stroke: color, width: run.k === 'back' ? width * 0.75 : width, opacity: run.k === 'back' ? (o.backOpacity ?? 0.45) : 1, part: 'ring-arc' });
  }
  const tip = pts[n], pre = pts[n - 3], d = [tip[0] - pre[0], tip[1] - pre[1]], m = Math.hypot(...d);
  const dir = [d[0] / m, d[1] / m];
  const tipSide = front(P, ts[n]) >= 0 ? 'front' : 'back';
  if (o.head && (o.part === 'all' || o.part === tipSide)) {
    const hl = o.headLen ?? 3.4, hw = hl * 0.45, b = [tip[0] - dir[0] * hl, tip[1] - dir[1] * hl];
    L.polygon(p, [tip, [b[0] - dir[1] * hw, b[1] + dir[0] * hw], [tip[0] - dir[0] * hl * 0.78, tip[1] - dir[1] * hl * 0.78], [b[0] + dir[1] * hw, b[1] - dir[0] * hw]], { fill: color, part: 'ring-head' });
  }
  return { tip, dir, at: (f) => pts[Math.round(f * n)], pts };
}

// ---- poloidal loops (plane y = 0) ------------------------------------------------------------------------
// contour psi = c of psi(r, x) = r^2 (1 - r^2) sin(pi |x| / X) in one quadrant (sx, sz = ±1), oriented with the flow:
// along the axis toward the turbine, out along the turbine, back along the wall, in at the mid-plane.
export function poloidalLoop(c, sx, sz, X = 0.86) {
  // x range where sin(pi x / X) >= 4c
  const xa = X * Math.asin(4 * c) / Math.PI, xb = X - xa, n = 60;
  const xsA = Array.from({ length: n + 1 }, (_, i) => xa + (xb - xa) * (1 - Math.cos(Math.PI * i / n)) / 2);
  const rr = (x, sgn) => { const g = Math.sin(Math.PI * x / X), q = Math.max(0, 1 - 4 * c / g); return Math.sqrt((1 + sgn * Math.sqrt(q)) / 2); };
  const inner = xsA.map((x) => [x, rr(x, -1)]), outer = xsA.slice().reverse().map((x) => [x, rr(x, +1)]);
  const loop = [...inner, ...outer.slice(1)];        // inner leg x increasing (toward the turbine), outer leg back
  return loop.map(([x, r]) => [sx * x, 0, sz * r]);
}

// ---- small 2D glyph: the cylinder with the dipole arrow (panel b, c) -----------------------------------------
// dir +1: B along +x (D > 0); -1: along -x; 'quad': opposite in each half (quadrupole)
export function polarityGlyph(p, L, cx, cy, w, dir, o = {}) {
  const h = w * 0.56, g = L.group(p, { part: 'polarity-glyph' }).node;
  L.rect(g, cx - w / 2, cy - h / 2, w, h, { fill: K.sodium, stroke: K.vessel, width: 0.4, r: h * 0.18 });
  for (const sx of [-1, 1]) L.line(g, [cx + sx * w * 0.36, cy - h * 0.36], [cx + sx * w * 0.36, cy + h * 0.36], { stroke: K.iron, width: 0.9, cap: 'butt' });
  const col = o.color ?? K.B, aw = 0.75, hl = 2.3;
  const arr = (x0, x1) => L.arrow(g, [x0, cy], [x1, cy], { stroke: col, width: aw, head: hl, headWidth: 1.1 });
  if (dir === 'quad') { arr(cx + w * 0.07, cx + w * 0.31); arr(cx - w * 0.07, cx - w * 0.31); L.line(g, [cx, cy - h * 0.42], [cx, cy + h * 0.42], { stroke: K.mid, width: 0.3, dash: '0.8 0.6' }); }
  else arr(cx - dir * w * 0.30, cx + dir * w * 0.30);
  return g;
}

// toroidal cell glyph: a translucent ribbon on the cylinder r about the x axis, centred on the plane x = xc, over the
// front half (seen through the transparent vessel), ending in an arrowhead; s = ±1 is the sense of rotation about +x.
export function ribbonArc(p, L, P, xc, r, s, o = {}) {
  const tf = tFront(P), span = o.span ?? 0.92 * Math.PI, w = o.w ?? 0.13, hl = o.headAng ?? 0.42, hw = o.headW ?? 0.13;
  const t0 = tf - s * span / 2, t1 = tf + s * span / 2 - s * hl, n = 60;
  const T = (i) => t0 + (t1 - t0) * i / n;
  const e1 = [], e2 = [];
  for (let i = 0; i <= n; i++) { e1.push(pg(P, ringPt(xc - w / 2, r, T(i)))); e2.push(pg(P, ringPt(xc + w / 2, r, T(i)))); }
  const m = 10, side = (x0) => Array.from({ length: m + 1 }, (_, i) => pg(P, ringPt(x0 + (xc - x0) * i / m, r, t1 + s * hl * i / m)));
  const s1 = side(xc - w / 2 - hw), s2 = side(xc + w / 2 + hw).reverse();
  const poly = [...e1, s1[0], ...s1.slice(1), ...s2.slice(1, -1), s2[s2.length - 1], ...e2.slice().reverse()];
  const fill = o.fill ?? K.u;
  L.polygon(p, poly, { fill, fillOpacity: o.opacity ?? 0.55, stroke: L.shade(fill, -0.25), width: 0.35, join: 'round', part: 'toroidal-ribbon' });
  return { tip: pg(P, ringPt(xc, r, t1 + s * hl)), mid: pg(P, ringPt(xc, r, tf)), at: (f) => pg(P, ringPt(xc, r, t0 + (t1 - t0) * f)) };
}
