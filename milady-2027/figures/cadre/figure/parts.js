// Parts shared by the drafts of the « cadre » figure. Every function draws one station's content into a box (pt).
// Colour key (one hue per entity, carried into the labels): lambda green, latent z violet, u blue, B vermillion, energy/law amber.
export const K = {
  lam: '#009E73', z: '#6C4BA0', u: '#0072B2', B: '#D55E00', E: '#C98A00', Efill: '#F6DFA6',
  ink: '#2b2b2b', mid: '#7a7a7a', light: '#bdbdbd', faint: '#ececec', paper: '#ffffff',
  glass: '#D7E9F3', metal: '#8d949c',
};

const fmt = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------- small helpers
export function chev(L, g, pts, f, color, opts = {}) {
  // chevron at fraction f of a polyline's length, pointing along the travel
  let tot = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let acc = 0, tgt = f * tot;
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= tgt && seg[i - 1] > 0) {
      const u = (tgt - acc) / seg[i - 1];
      const x = pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), y = pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1]);
      const dx = (pts[i][0] - pts[i - 1][0]) / seg[i - 1], dy = (pts[i][1] - pts[i - 1][1]) / seg[i - 1];
      L.chevron(g, [x + dx * (opts.len ?? 1.6) * 0.5, y + dy * (opts.len ?? 1.6) * 0.5], [dx, dy], { len: opts.len ?? 1.6, spread: opts.spread ?? 0.75, stroke: color, width: opts.width ?? 0.5 });
      return [x, y];
    }
    acc += seg[i - 1];
  }
}

export function check(L, g, x, y, s, color) {      // tick mark
  L.polyline(g, [[x - s * 0.5, y], [x - s * 0.12, y + s * 0.4], [x + s * 0.55, y - s * 0.45]], { stroke: color, width: 0.9, fill: 'none', cap: 'round', join: 'round' });
}
export function cross(L, g, x, y, s, color) {      // cross mark
  L.line(g, [x - s * 0.4, y - s * 0.4], [x + s * 0.4, y + s * 0.4], { stroke: color, width: 0.9, cap: 'round' });
  L.line(g, [x - s * 0.4, y + s * 0.4], [x + s * 0.4, y - s * 0.4], { stroke: color, width: 0.9, cap: 'round' });
}

export function heading(L, P, str, opts = {}) {
  L.text(P, opts.dx ?? 12, opts.dy ?? 7.6, str, { size: 7, weight: 'bold', color: K.ink, role: 'title' });
}

// constraint chip: class code in a dark tab, then the mechanism
export function chip(L, g, x, y, w, code, line, opts = {}) {
  const h = opts.h ?? 12, col = opts.color ?? K.ink;
  L.rect(g, x, y, w, h, { r: 2.2, fill: opts.fill ?? '#ffffff', stroke: opts.stroke ?? '#9a9a9a', width: 0.4, dash: opts.dash });
  if (code) {
    L.rect(g, x, y, 13, h, { r: 2.2, fill: col, stroke: 'none' });
    L.rect(g, x + 8, y, 5, h, { fill: col, stroke: 'none' });
    L.text(g, x + 6.5, y + h / 2, code, { size: 6, weight: 'bold', color: '#ffffff', anchor: 'middle', valign: 'middle' });
  }
  L.text(g, x + (code ? 16 : 4), y + h / 2, line, { size: 6, color: K.ink, valign: 'middle' });
}

// ---------------------------------------------------------------- a. parameters
export function lambdaCard(F, L, g, x, y, w) {
  L.text(g, x + w / 2, y + 2, '**λ**', { size: 8.5, color: K.lam, anchor: 'middle', valign: 'top' });
  const names = ['*Re*', '*Rm*', '*μ*_{r}'], pos = [0.62, 0.35, 0.78];
  const x0 = x + 9.5, x1 = x + w - 1.5;
  names.forEach((n, i) => {
    const yy = y + 17 + i * 8.2;
    L.text(g, x, yy, n, { size: 6, color: K.ink, valign: 'middle' });
    L.line(g, [x0, yy], [x1, yy], { stroke: '#c9c9c9', width: 1.6, cap: 'round' });
    L.line(g, [x0, yy], [x0 + (x1 - x0) * pos[i], yy], { stroke: K.lam, width: 1.6, cap: 'round' });
    L.circle(g, x0 + (x1 - x0) * pos[i], yy, 2.1, { fill: '#ffffff', stroke: K.lam, width: 0.7 });
  });
  F.anchor('lam.out', g, x1 + 3, y + 17 + 8.2);
  return { bottom: y + 17 + 2 * 8.2 + 4 };
}

// ---------------------------------------------------------------- a. latent flow (t horizontal, one latent direction vertical)
export function latentFlow(F, L, g, box, D, opts = {}) {
  const { x, y, w, h } = box;               // the t axis spans [x, x + w]; z spans the box height
  const fl = D.flow, zs = opts.zScale ?? (h / 2) / 2.45, cy = y + h / 2;
  const X = (t) => x + t * w, Y = (z) => cy - z * zs;
  const dens = opts.dens ?? 11;             // pt for the density peak (p0 max 0.4)
  // mirror axis z = 0
  L.line(g, [X(0) - dens - 2, cy], [X(1) + dens * 0.95 + 2, cy], { stroke: '#9a9a9a', width: 0.4, dash: '1.6 1.2' });
  // densities: Gaussian at t = 0 (bulging left), bimodal at t = 1 (bulging right)
  const p0 = fl.p0, p1 = fl.p1, zz = fl.z, k0 = dens / 0.4, k1 = dens / Math.max(...p1) * 0.95;
  const left = zz.map((z, i) => [X(0) - p0[i] * k0, Y(z)]).filter((p) => Math.abs(p[1] - cy) <= h / 2 + 2);
  const right = zz.map((z, i) => [X(1) + p1[i] * k1, Y(z)]).filter((p) => Math.abs(p[1] - cy) <= h / 2 + 2);
  const close = (pts, x0) => [[x0, pts[0][1]], ...pts, [x0, pts[pts.length - 1][1]]];
  L.polygon(g, close(left, X(0)), { fill: '#e6e1ef', stroke: 'none' });
  L.polyline(g, left, { stroke: '#8f84a8', width: 0.6, fill: 'none' });
  L.polygon(g, close(right, X(1)), { fill: '#ddd3ee', stroke: 'none' });
  L.polyline(g, right, { stroke: K.z, width: 0.7, fill: 'none' });
  // trajectories
  const t = fl.t;
  fl.traj.forEach((tr, j) => {
    const pts = tr.map((z, i) => [X(t[i]), Y(z)]);
    L.polyline(g, pts, { stroke: K.z, width: 0.42, opacity: 0.8, fill: 'none' });
    L.circle(g, pts[0][0], pts[0][1], 0.75, { fill: '#8f84a8', stroke: 'none' });
    L.circle(g, pts[pts.length - 1][0], pts[pts.length - 1][1], 0.85, { fill: K.z, stroke: 'none' });
    if (j === 2 || j === fl.traj.length - 3) chev(L, g, pts, 0.55, K.z, { len: 1.8, width: 0.5 });
  });
  // the two t lines
  L.line(g, [X(0), Y(2.45)], [X(0), Y(-2.45)], { stroke: '#8f84a8', width: 0.35 });
  L.line(g, [X(1), Y(2.45)], [X(1), Y(-2.45)], { stroke: K.z, width: 0.35 });
  // flow-time axis
  const ya = y + h + 4.5;
  L.arrow(g, [X(0), ya], [X(1) + 6, ya], { width: 0.45, head: 2.6, stroke: K.ink });
  L.line(g, [X(0), ya - 1.4], [X(0), ya + 1.4], { stroke: K.ink, width: 0.45 });
  L.line(g, [X(1), ya - 1.4], [X(1), ya + 1.4], { stroke: K.ink, width: 0.45 });
  L.text(g, X(0), ya + 3.2, '0', { size: 5.5, anchor: 'middle', valign: 'top', color: K.ink });
  L.text(g, X(1), ya + 3.2, '1', { size: 5.5, anchor: 'middle', valign: 'top', color: K.ink });
  L.text(g, X(1) + 7.5, ya, '*t*', { size: 6, valign: 'middle', color: K.ink });
  // labels of the two laws
  L.text(g, X(0) - dens * 0.55, Y(2.45) - 3, '**z**_{0} ~ *N*(0, *I*)', { size: 6, anchor: 'middle', color: '#5d5370' });
  L.text(g, X(1) + dens * 0.5, Y(2.45) - 3, '**z**_{1}', { size: 6, anchor: 'middle', color: K.z });
  // polarity of the two latent modes: + B and - B
  const m = fl.m, xb = X(1) + dens * 0.95 + 5.5;
  for (const sgn of [1, -1]) {
    const yc = Y(sgn * m);
    L.arrow(g, [xb, yc + sgn * 3.6], [xb, yc - sgn * 3.6], { stroke: K.B, width: 0.8, head: 2.2, headWidth: 1.5 });
    L.text(g, xb + 2.4, yc, sgn > 0 ? '**B**' : '−**B**', { size: 6, color: K.B, valign: 'middle' });
  }
  // symmetry S: curved double arrow between the two modes
  const xs = X(1) + dens * 0.95 + 15.5;
  L.arrow(g, [xs - 1.2, Y(m) + 1.5], [xs - 1.2, Y(-m) - 1.5], { both: true, bend: -0.35, stroke: K.ink, width: 0.45, head: 2.2, headWidth: 1.4 });
  L.text(g, xs + 2.3, cy, '*S*', { size: 6.5, color: K.ink, valign: 'middle' });
  F.anchor('flow.in', g, X(0) + 4, Y(2.45) - 1);
  F.anchor('flow.vtheta', g, X(0.5), Y(2.45) - 2);
  F.anchor('flow.out', g, xs + 7, cy);
  F.anchor('flow.top', g, X(0.5), Y(2.45) - 8);
  return { X, Y, cy, xs };
}

// ---------------------------------------------------------------- b. potential maps and field lines
export function potentialMap(L, g, x, y, s, grid, segs, kind, opts = {}) {
  const col = kind === 'u' ? K.u : K.B;
  const pal = kind === 'u' ? ['#f3f8fc', '#a9cbe8'] : ['#fdf4ee', '#f2b993'];
  const rows = grid.slice().reverse();      // row 0 of the data is y = 0 (bottom)
  L.pixelImage(g, x, y, s, rows, { palette: pal, skipBelow: -1, overlap: 0.6 });
  const keep = (sg) => opts.levels ? opts.levels.some((v) => Math.abs(v - sg.lev) < 1e-3) : true;
  const cg = L.group(g, { clip: L.clipPath(g, `M${x},${y} h${s} v${s} h${-s} Z`) });
  for (const sg of segs.filter(keep)) {
    const pts = sg.pts.map(([u, v]) => [x + u * s, y + (1 - v) * s]);
    L.polyline(cg.node, pts, { stroke: L.shade(col, 0.25), width: 0.3, fill: 'none', opacity: 0.85 });
  }
  L.rect(g, x, y, s, s, { stroke: '#8a8a8a', width: 0.4, fill: 'none' });
}

export function fieldLines(L, g, x, y, s, segs, kind, opts = {}) {
  const col = kind === 'u' ? K.u : K.B;
  L.rect(g, x, y, s, s, { fill: '#ffffff', stroke: 'none' });
  const keep = (sg) => opts.levels ? opts.levels.some((v) => Math.abs(v - sg.lev) < 1e-3) : true;
  const cg = L.group(g, { clip: L.clipPath(g, `M${x},${y} h${s} v${s} h${-s} Z`) });
  for (const sg of segs.filter(keep)) {
    const pts = sg.pts.map(([u, v]) => [x + u * s, y + (1 - v) * s]);
    L.polyline(cg.node, pts, { stroke: col, width: 0.55, fill: 'none' });
    let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (len > s * 0.5) chev(L, cg.node, pts, 0.5, col, { len: 1.5, width: 0.5 });
  }
  L.rect(g, x, y, s, s, { stroke: '#8a8a8a', width: 0.4, fill: 'none' });
}

// ---------------------------------------------------------------- c. VKS cylinder with u (left half) and B (right half)
export function vks(F, L, g, cx, cy, R, D, opts = {}) {
  const phi = (opts.elev ?? 20) * Math.PI / 180, sp = Math.sin(phi), cp = Math.cos(phi);
  const P = L.obliqueProj({ x: [1, 0], y: [0, -sp], z: [0, -cp], origin: [cx, cy] });
  const h = D.vks.h * R, Hc = 1.13 * R, rd = 0.75 * R, bh = 0.2 * R;
  const ell = (z, r, a0, a1, n = 60) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return P(r * Math.cos(a), r * Math.sin(a), z); });
  const PI = Math.PI;
  // bottom shaft (behind everything)
  L.cylinder3(g, P, [0, 0, -Hc - 0.38 * R], [0, 0, -Hc], 0.07 * R, 0.07 * R, { fill: '#9aa1a8', shading: true, stroke: '#5f656b', width: 0.35 });
  // glass body (back)
  const sil = [...ell(Hc, R, 0, -PI), ...ell(-Hc, R, -PI, 0)];
  L.polygon(g, sil, { fill: K.glass, opacity: 0.45, stroke: 'none' });
  L.polyline(g, ell(-Hc, R, 0, PI), { stroke: '#7f9aab', width: 0.35, fill: 'none', opacity: 0.7 });   // far half of the bottom rim
  // impeller (disc + 8 curved blades). side = -1 bottom (blades up), +1 top (blades down)
  const blades = (zDisc, side) => {
    const out = [];
    for (let i = 0; i < 8; i++) {
      const a0 = (i + 0.5) * PI / 4 + (side > 0 ? 0.2 : -0.2);
      const curve = Array.from({ length: 7 }, (_, k) => { const r = 0.22 * R + (rd - 0.22 * R) * k / 6; const a = a0 + 0.42 * (k / 6) ** 1.5 * (side > 0 ? 1 : -1); return [r * Math.cos(a), r * Math.sin(a)]; });
      const z1 = zDisc - side * bh;
      const quad = [...curve.map(([u, v]) => P(u, v, zDisc)), ...curve.slice().reverse().map(([u, v]) => P(u, v, z1))];
      const mid = curve[3];
      out.push({ quad, depth: -mid[1] });   // nearer = more negative y
    }
    return out.sort((a, b) => a.depth - b.depth);
  };
  const disc = (zc, side) => {
    const z0 = zc + side * 0.05 * R;      // disc thickness toward the end wall
    L.cylinder3(g, P, [0, 0, Math.min(zc, z0)], [0, 0, Math.max(zc, z0)], rd, rd, { fill: K.metal, capFill: '#b9bfc5', shading: true, stroke: '#5f656b', width: 0.35 });
  };
  const drawBlades = (zc, side) => { for (const b of blades(zc, side)) L.polygon(g, b.quad, { fill: '#a7aeb5', stroke: '#5f656b', width: 0.3, join: 'round' }); };
  disc(-h, -1); drawBlades(-h, -1);
  // meridional plane: faint sheet, u on the left half, B on the right half
  const mer = [P(-R, 0, -h + bh), P(R, 0, -h + bh), P(R, 0, h - bh), P(-R, 0, h - bh)];
  L.polygon(g, mer, { fill: '#ffffff', opacity: 0.55, stroke: 'none' });
  // glass highlight: near the left wall and under the streamlines (on top it read as a white bar through the u cells)
  const hl = (a) => [P(R * Math.cos(a), R * Math.sin(a), -Hc + 0.15 * R), P(R * Math.cos(a), R * Math.sin(a), Hc - 0.15 * R)];
  L.line(g, ...hl(-2.8), { stroke: '#ffffff', width: 1.2, opacity: 0.85, cap: 'round' });
  for (const sg of D.vks.u) {
    if (Math.abs(sg.lev) < 0.04) continue;
    const pts = sg.pts.map(([r, z]) => P(-r * R, 0, z * R));
    L.polyline(g, pts, { stroke: K.u, width: 0.55, fill: 'none' });
    chev(L, g, pts, 0.25, K.u, { len: 1.6 }); chev(L, g, pts, 0.75, K.u, { len: 1.6 });
  }
  // B loops (clip outside the station)
  const clipW = opts.clipR ?? 1.95;
  const cl = L.group(g, { clip: L.clipPath(g, `M${cx},${cy - 1.6 * R} h${clipW * R} v${3.2 * R} h${-clipW * R} Z`) });
  D.vks.B.forEach((b, i) => {
    const pts = b.pts.map(([r, z]) => P(r * R, 0, z * R));
    L.polyline(cl.node, pts, { stroke: K.B, width: 0.6, fill: 'none' });
    chev(L, cl.node, pts, 0.02 + 0.03 * i, K.B, { len: 1.7 });
    if (b.L < 2.5) chev(L, cl.node, pts, 0.62, K.B, { len: 1.7 });
  });
  // axis line of B through the centre
  L.line(g, P(0, 0, -h + bh), P(0, 0, h - bh), { stroke: K.B, width: 0.6 });
  L.chevron(g, P(0, 0, 0.1 * R), [0, -1], { len: 1.7, spread: 0.75, stroke: K.B, width: 0.5 });
  // top impeller: blades first (they hang below the disc), then the disc
  drawBlades(h, 1); disc(h, 1);
  // glass front: near half of the bottom rim, the whole top rim, the walls, a highlight
  L.polygon(g, [...ell(Hc, R, 0, -PI), ...ell(-Hc, R, -PI, 0)], { fill: K.glass, opacity: 0.22, stroke: 'none' });
  L.polyline(g, ell(-Hc, R, 0, -PI), { stroke: '#5f7f93', width: 0.5, fill: 'none' });
  L.polygon(g, ell(Hc, R, 0, 2 * PI, 90), { fill: K.glass, opacity: 0.35, stroke: '#5f7f93', width: 0.5 });
  L.line(g, P(-R, 0, -Hc), P(-R, 0, Hc), { stroke: '#5f7f93', width: 0.5 });
  L.line(g, P(R, 0, -Hc), P(R, 0, Hc), { stroke: '#5f7f93', width: 0.5 });
  // top shaft
  L.cylinder3(g, P, [0, 0, Hc], [0, 0, Hc + 0.38 * R], 0.07 * R, 0.07 * R, { fill: '#9aa1a8', shading: true, stroke: '#5f656b', width: 0.35 });
  // counter-rotation: arcs on the near side at the two impeller levels, opposite senses
  const rot = (z, sense) => {           // curved arrow around the shaft, just outside the end wall
    const a0 = -PI * 0.92, a1 = -PI * 0.08, rr = 0.46 * R;
    const pts = ell(z, rr, sense > 0 ? a0 : a1, sense > 0 ? a1 : a0, 40);
    L.polyline(g, pts.slice(0, -2), { stroke: K.ink, width: 0.65, fill: 'none' });
    const [p1, p2] = [pts[pts.length - 3], pts[pts.length - 1]], d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    L.chevron(g, p2, [(p2[0] - p1[0]) / d, (p2[1] - p1[1]) / d], { len: 2.2, spread: 0.7, stroke: K.ink, width: 0.65 });
  };
  rot(Hc + 0.2 * R, 1); rot(-Hc - 0.2 * R, -1);
  F.anchor('vks.ucell', g, ...P(-0.88 * R, 0, 0.28 * R));
  const ob = D.vks.B[0].pts, rmax = Math.max(...ob.map((p) => p[0]));
  const bq = ob.filter((p) => p[1] > 0).reduce((best, p) => (Math.abs(p[0] - 0.8 * rmax) < Math.abs(best[0] - 0.8 * rmax) ? p : best));
  F.anchor('vks.Bloop', g, ...P(bq[0] * R, 0, bq[1] * R));
  F.anchor('vks.left', g, ...P(-1.2 * R, 0, 0));
  F.anchor('vks.right', g, ...P(1.95 * R, 0, 0));
  F.anchor('vks.top', g, ...P(0, 0, Hc + 0.35 * R));
  F.anchor('vks.imp', g, ...P(0.55 * R, -0.55 * R, h));
  F.anchor('vks.impB', g, ...P(0.55 * R, -0.55 * R, -h));
  return { P, Hc, h };
}

// ---------------------------------------------------------------- d. law control
export function lawHist(F, L, g, box, D, opts = {}) {
  const { x, y, w, h } = box, lw = D.law, e = lw.edges;
  const xr = [0.2, 2.4], X = (v) => x + (v - xr[0]) / (xr[1] - xr[0]) * w;
  const ymax = Math.max(...lw.tilt, ...lw.raw) * 1.05, Yv = (v) => y + h - v / ymax * h;
  const steps = (hs) => { const pts = [[X(e[0]), Yv(0)]]; hs.forEach((v, i) => { pts.push([X(e[i]), Yv(v)], [X(e[i + 1]), Yv(v)]); }); pts.push([X(e[e.length - 1]), Yv(0)]); return pts; };
  L.polygon(g, steps(lw.tilt), { fill: K.Efill, stroke: 'none' });
  L.polyline(g, steps(lw.tilt), { stroke: K.E, width: 0.6, fill: 'none' });
  L.polyline(g, steps(lw.raw), { stroke: '#8a8a8a', width: 0.5, fill: 'none', dash: '1.4 0.9' });
  L.arrow(g, [x - 1, y + h], [x + w + 4, y + h], { width: 0.45, head: 2.4, stroke: K.ink });
  L.text(g, x + w + 5.5, y + h, '*ε*', { size: 6.5, valign: 'middle', color: K.ink });
  // means
  const xe = X(lw.EP), xr0 = X(lw.mean_raw);
  L.line(g, [xe, (opts.arrowY ?? y) - 4], [xe, y + h + 1.5], { stroke: K.ink, width: 0.6 });
  L.line(g, [xr0, (opts.arrowY ?? y + 4) - 1.5], [xr0, y + h], { stroke: '#8a8a8a', width: 0.45, dash: '1.2 0.9' });
  L.arrow(g, [xr0 - 0.4, opts.arrowY ?? y + 6.5], [xe + 0.6, opts.arrowY ?? y + 6.5], { stroke: K.E, width: 0.55, head: 2.0, headWidth: 1.3 });
  L.text(g, xe, y + h + 3.2, '*E*[*P*]', { size: 5.5, anchor: 'middle', valign: 'top', color: K.ink });
  return { X, Yv, xe, xr0 };
}

export function miniDiff(L, g, x, y, w, h, D, kind) {
  // histogram of P - eps on a shared zero: law-level (broad, mean 0) or per-sample (spike at 0)
  const X = (v) => x + (v + 1) / 2 * w, base = y + h;
  L.line(g, [x, base], [x + w, base], { stroke: K.ink, width: 0.4 });
  L.line(g, [X(0), base], [X(0), base + 1.3], { stroke: K.ink, width: 0.4 });
  if (kind === 'law') {
    const e = D.law.dedges, hs = D.law.dhist, mx = Math.max(...hs);
    const pts = [[X(e[0]), base]]; hs.forEach((v, i) => pts.push([X(e[i]), base - v / mx * h * 0.85], [X(e[i + 1]), base - v / mx * h * 0.85])); pts.push([X(e[e.length - 1]), base]);
    L.polygon(g, pts, { fill: K.Efill, stroke: K.E, width: 0.5 });
  } else {
    L.rect(g, X(0) - 0.7, y + 0.5, 1.4, h - 0.5, { fill: '#c8c8c8', stroke: '#8a8a8a', width: 0.4 });
  }
}

// ---------------------------------------------------------------- e. uses
export function modesGlyph(L, g, x, y, s, D) {
  D.uses.modes.forEach((m, i) => {
    L.pixelImage(g, x + i * (s + 1.6), y, s, m, { palette: ['#e8eef6', '#6f8fb5'], skipBelow: -1, overlap: 0.6 });
    L.rect(g, x + i * (s + 1.6), y, s, s, { stroke: '#8a8a8a', width: 0.35, fill: 'none' });
  });
}

export function assimGlyph(L, g, x, y, w, h, D) {
  const U = D.uses, T = U.T, X = (i) => x + i / (T - 1) * w;
  const all = U.ens.flat(), lo = Math.min(...all) - 0.1, hi = Math.max(...all) + 0.1, Y = (v) => y + h - (v - lo) / (hi - lo) * h;
  U.ens.forEach((e) => L.polyline(g, e.map((v, i) => [X(i), Y(v)]), { stroke: '#7c93ad', width: 0.35, opacity: 0.85, fill: 'none' }));
  U.obs.forEach(([i, v]) => {
    L.line(g, [X(i), Y(v) - 2.4], [X(i), Y(v) + 2.4], { stroke: K.ink, width: 0.45 });
    L.circle(g, X(i), Y(v), 1.1, { fill: K.ink, stroke: 'none' });
  });
}

export function riceGlyph(L, g, x, y, w, h, D) {
  const fl = D.flow, X = (z) => x + (z + 2.6) / 5.2 * w, mx = Math.max(...fl.p1);
  const pts = fl.z.map((z, i) => [X(z), y + h - fl.p1[i] / mx * h * 0.9]).filter((p) => p[0] >= x && p[0] <= x + w);
  L.polygon(g, [[pts[0][0], y + h], ...pts, [pts[pts.length - 1][0], y + h]], { fill: '#f7e0d2', stroke: 'none' });
  L.polyline(g, pts, { stroke: K.B, width: 0.55, fill: 'none' });
  L.rect(g, X(-0.18), y + 1, X(0.18) - X(-0.18), h - 1, { fill: K.B, opacity: 0.28, stroke: 'none' });
  L.line(g, [X(0), y + 1], [X(0), y + h], { stroke: K.B, width: 0.5, dash: '1 0.8' });
  L.line(g, [x, y + h], [x + w, y + h], { stroke: K.ink, width: 0.4 });
}
