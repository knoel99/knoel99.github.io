// Figure « vks-en » (English version of figure.js): the von Kármán Sodium (VKS) experiment and the dipole reversals.
// Hero: VKS cylinder (vessel, sodium, curved-blade impellers), drawn in vector 3D with the illustrated finish.
import { K, G, proj, vesselBack, vesselFront, turbine, shaft, ringArc, ribbonArc, poloidalLoop, polarityGlyph, tFront } from './parts.js';

export const figure = { width: 183, height: 118, name: 'vks-en', format: 'journal', illustrate: true };

export default async function draw(F, L) {
  const mm = L.mm, data = await (await fetch('/figure/data/vks.json')).json();
  L.STYLE.text.label = 7;   // 183 mm wide: labels at 7 pt, headings at 8 pt
  const { H, Xi } = G;

  // =============================================================== a : the experiment
  const a = F.panel('a', { x: 0, y: 0, w: 183, h: 66 });
  const kR = mm(14.5);
  const P1 = proj(L, kR, [mm(50), mm(35)], 28, 15), P2 = proj(L, kR, [mm(137), mm(35)], 28, 15);
  const head = (p, tip, dir, color, hl = 3.2) => {
    const hw = hl * 0.45, b = [tip[0] - dir[0] * hl, tip[1] - dir[1] * hl];
    L.polygon(p, [tip, [b[0] - dir[1] * hw, b[1] + dir[0] * hw], [tip[0] - dir[0] * hl * 0.78, tip[1] - dir[1] * hl * 0.78], [b[0] + dir[1] * hw, b[1] - dir[0] * hw]], { fill: color, part: 'head' });
  };
  const headOn = (p, P, pts3, i, color, hl) => {
    const q0 = P(...pts3[i - 1]), q1 = P(...pts3[i + 1]), d = [q1[0] - q0[0], q1[1] - q0[1]], m = Math.hypot(...d);
    const c = P(...pts3[i]); head(p, [c[0] + d[0] / m * hl * 0.5, c[1] + d[1] / m * hl * 0.5], [d[0] / m, d[1] / m], color, hl);
  };
  const xRot = H + 0.68, rRot = 0.3;

  // ---- a1 : mean flow
  const g1 = L.group(a, { part: 'flow-view' }).node;
  // right shaft outside the vessel, with its rotation arrow (behind, shaft, front)
  shaft(g1, L, P1, H, H + G.shaftOut);
  const rotR = ringArc(g1, L, P1, xRot, rRot, -1, { part: 'front', span: 0.9 * Math.PI, color: K.mid, width: 0.75, head: true, headLen: 3.4 });
  vesselBack(g1, L, P1);
  shaft(g1, L, P1, Xi + G.td, H);
  turbine(g1, L, P1, +1);
  turbine(g1, L, P1, -1, { only: 'blades' });
  // poloidal recirculation: two nested streamlines per quadrant of the meridional plane y = 0
  const pol = {};
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const c of [0.065, 0.16]) {
    const lp = poloidalLoop(c, sx, sz);
    if (c < 0.1) pol[`${sx},${sz}`] = lp;
    L.path(g1, L.smooth(lp.map((q) => P1(...q)), true), { stroke: K.u, width: c < 0.1 ? 0.75 : 0.5, fill: 'none', part: 'poloidal' });
    if (c < 0.1) { headOn(g1, P1, lp, 30, K.u, 3.0); headOn(g1, P1, lp, 90, K.u, 3.0); }
  }
  // the left turbine is seen from behind: its iron disc lies between the viewer and the left cells
  turbine(g1, L, P1, -1, { only: 'disc' });
  // toroidal cells: angular velocity +x in the left half, -x in the right half (as their turbines)
  const torL = ribbonArc(g1, L, P1, -0.5, 0.9, +1), torR = ribbonArc(g1, L, P1, +0.5, 0.9, -1);
  shaft(g1, L, P1, -H, -(Xi + G.td));
  vesselFront(g1, L, P1);
  shaft(g1, L, P1, -H - G.shaftOut, -H);
  const rotL = ringArc(g1, L, P1, -xRot, rRot, +1, { part: 'front', span: 0.9 * Math.PI, color: K.mid, width: 0.75, head: true, headLen: 3.4 });

  // ---- a2 : mean field
  const g2 = L.group(a, { part: 'field-view' }).node;
  shaft(g2, L, P2, H, H + G.shaftOut);
  vesselBack(g2, L, P2, { sodium: '#EDF0F3' });
  const gh = L.group(g2, { opacity: 0.55 }).node;
  shaft(gh, L, P2, Xi + G.td, H); turbine(gh, L, P2, +1); turbine(gh, L, P2, -1); shaft(gh, L, P2, -H, -(Xi + G.td));
  // field lines in the plane y = 0, clipped to a box around the cylinder
  const XC = 2.25, ZC = 1.72;
  const clip = L.clipPath(g2, 'M' + [[-XC, 0, ZC], [XC, 0, ZC], [XC, 0, -ZC], [-XC, 0, -ZC]].map((q) => P2(...q).join(',')).join(' L') + 'Z');
  const gf = L.group(g2, { clip }).node;
  const fl = [{ pts: [[-3.5, 0], [3.5, 0]] }, ...data.fieldlines];
  for (const line of fl) for (const sz of [1, -1]) {
    if (line.pts.length === 2 && sz < 0) continue;                       // the axis is one line
    let pts = line.pts.length === 2 ? Array.from({ length: 41 }, (_, i) => [-3.5 + 7 * i / 40, 0, 0]) : line.pts.map(([x, r]) => [x, 0, sz * r]);
    // orient: B along +x where the line crosses the mid-plane nearest the axis
    let best = -1;
    for (let i = 1; i < pts.length - 1; i++) if (Math.abs(pts[i][0]) < 0.1 && (best < 0 || Math.abs(pts[i][2]) < Math.abs(pts[best][2]))) best = i;
    if (pts[best + 1][0] < pts[best - 1][0]) pts = pts.reverse();
    L.path(gf, L.smooth(pts.map((q) => P2(...q))), { stroke: K.B, width: 0.8, fill: 'none', part: 'fieldline' });
    // heads where the line crosses the mid-plane x = 0 (inside: +x, outside: -x), when inside the clip box
    for (let i = 1; i < pts.length - 2; i++) if (Math.sign(pts[i][0]) !== Math.sign(pts[i + 1][0]) && Math.abs(pts[i][2]) < ZC - 0.15) headOn(gf, P2, pts, i, K.B, 3.0);
  }
  head(g2, P2(XC - 0.02, 0, 0), [P2.ex[0] / Math.hypot(...P2.ex), P2.ex[1] / Math.hypot(...P2.ex)], K.B, 3.4);   // B at the end of the axis line
  vesselFront(g2, L, P2, { capOpacity: 0.22 });
  shaft(g2, L, P2, -H - G.shaftOut, -H);

  // ---- a : labels, headings, the causal arrow
  const at = (P, q) => P(...q);
  L.text(a, mm(50), mm(5.2), 'mean flow {#0072B2|**u**}', { size: 8, weight: 'bold', anchor: 'middle', role: 'title' });
  L.text(a, mm(137), mm(5.2), 'mean field {#D55E00|**B**}', { size: 8, weight: 'bold', anchor: 'middle', role: 'title' });
  L.callout(a, at(P1, [-Xi - G.td, 0.68 * Math.cos(1.0), 0.68 * Math.sin(1.0)]), [mm(4), mm(13)], 'soft-iron impeller', { anchor: 'start' });
  L.callout(a, at(P1, [Xi - 0.1, -0.45, 0.25]), [mm(84), mm(13)], 'curved blades', { anchor: 'end' });
  L.callout(a, [torL.at(0.08), torR.at(0.92)].map((q) => q), [mm(50), mm(11.5)], 'toroidal cells', { anchor: 'middle', textColor: K.u });
  L.callout(a, at(P1, [-0.42, 0, -0.62]), [mm(42), mm(61)], 'poloidal recirculation', { anchor: 'middle', textColor: K.u });
  L.callout(a, at(P1, [-1.1, -0.2, -0.75]), [mm(4), mm(55)], 'liquid sodium', { anchor: 'start' });
  L.callout(a, at(P1, [0, -0.62, -0.78]), [mm(66), mm(58)], 'mid-plane', { anchor: 'start' });
  const fL = rotL.tip, fR = rotR.tip;
  const cL = P1(-xRot, 0, -rRot), cR = P1(xRot, 0, rRot);
  L.text(a, cL[0], cL[1] + mm(3.2), '*F*_{1}', { anchor: 'middle', valign: 'middle', size: 8 });
  L.text(a, cR[0], cR[1] - mm(3), '*F*_{2}', { anchor: 'middle', valign: 'middle', size: 8 });
  // field view labels
  const bTip = P2(XC, 0, 0);
  L.text(a, bTip[0] + 2.5, bTip[1], '{#D55E00|**B**}', { anchor: 'start', valign: 'middle', size: 8 });
  const fOut = data.fieldlines[2].pts.filter(([x, r]) => r > 1.05 && x > 0).reduce((bq, q) => (Math.abs(q[0] - 0.4) < Math.abs(bq[0] - 0.4) ? q : bq));
  L.callout(a, P2(fOut[0], 0, fOut[1]), [mm(166.5), mm(15)], 'axial dipole', { anchor: 'start', textColor: K.B });
  F.anchor('flow', a, mm(84), mm(35)); F.anchor('field', a, mm(104), mm(35));
  F.relate('flow', 'field', 'induction');
  L.connect(F, 'flow', 'field', { stroke: K.mid, width: 1.1, head: 4.2, headWidth: 2.2, label: 'dynamo effect', labelOffset: -5, kind: 'induction' });

  // =============================================================== b, c : reversals
  const S = data.series, Ds = data.fixed.stable[0], Qs = data.fixed.stable[1];
  const yTop = mm(8), yBot = mm(44), Dmax = 1.6, Y = (d) => yTop + (Dmax - d) / (2 * Dmax) * (yBot - yTop);
  const b = F.panel('b', { x: 0, y: 68, w: 124, h: 50 });
  const c = F.panel('c', { x: 126, y: 68, w: 57, h: 50 });
  const bx0 = mm(13), bx1 = mm(121), T1 = S.t[S.t.length - 1], X = (t) => bx0 + mm(1.5) + t / T1 * (bx1 - bx0 - mm(1.5));
  // Q scale: the slow curve (max |Q| = 0.75) must end left of the axis label « quadrupole Q »
  const cx0 = mm(4), cx1 = mm(55), cQ0 = mm(27.2), Qk = mm(17.6), QX = (q) => cQ0 + q * Qk;
  const evCol = { renversement: K.rev, excursion: K.exc }, evTint = { renversement: '#EEEAF5', excursion: '#E3F3EC' };
  // event bands
  for (const e of S.events) L.rect(b, X(S.t[e.span[0]]) - 1, yTop - mm(1), X(S.t[e.span[1]]) - X(S.t[e.span[0]]) + 2, yBot - yTop + mm(2), { fill: evTint[e.kind], part: 'event-band' });
  // shared levels: +D*, 0, -D* run across b and c (same scale)
  const cRoot = mm(126);
  for (const d of [Ds, -Ds]) {
    L.line(b, [bx0, Y(d)], [cRoot + cx1, Y(d)], { stroke: K.mid, width: 0.4, dash: '1.6 1.2', part: 'level' });
  }
  L.line(b, [bx0, Y(0)], [bx1, Y(0)], { stroke: K.light, width: 0.4, part: 'zero' });
  // axes of b
  L.arrow(b, [bx0, yBot + mm(2)], [bx0, yTop - mm(3)], { stroke: K.ink, width: 0.5, head: 3 });
  L.arrow(b, [bx0, yBot + mm(2)], [bx1 + mm(1), yBot + mm(2)], { stroke: K.ink, width: 0.5, head: 3 });
  L.text(b, bx0 + mm(1.6), yTop - mm(3.5), 'dipole *D*', { anchor: 'start', valign: 'middle' });
  L.text(b, bx1 + mm(1), yBot + mm(4.6), 'time *t*', { anchor: 'end', valign: 'middle' });
  L.text(b, bx0 - mm(1), Y(Ds), '+*D*^{∗}', { anchor: 'end', valign: 'middle' });
  L.text(b, bx0 - mm(1), Y(-Ds), '−*D*^{∗}', { anchor: 'end', valign: 'middle' });
  // the series: plateaus in the colour of B, events in their own colour
  const pts = S.t.map((t, i) => [X(t), Y(S.D[i])]);
  const state = S.t.map(() => 'plateau');
  for (const e of S.events) for (let i = e.span[0]; i <= e.span[1]; i++) state[i] = e.kind;
  L.statePolyline(b, pts, state, { plateau: { stroke: K.B, width: 0.55 }, renversement: { stroke: K.rev, width: 1.0 }, excursion: { stroke: K.exc, width: 1.0 } });
  // event labels and polarity glyphs
  const ev = S.events, mid = (e) => Math.round((e.span[0] + e.span[1]) / 2);
  const r1 = ev[0], ex = ev[1], r2 = ev[2];
  L.callout(b, pts[mid(r1)], [X(S.t[mid(r1)]) - mm(4), mm(20)], 'reversal', { anchor: 'end', textColor: K.rev, color: K.rev });
  L.callout(b, pts[mid(r2)], [X(S.t[mid(r2)]) + mm(4), mm(20)], 'reversal', { anchor: 'start', textColor: K.rev, color: K.rev });
  const exLow = ex.span[0] + S.D.slice(ex.span[0], ex.span[1]).reduce((bi, v, i, arr) => (Math.abs(v) < Math.abs(arr[bi]) ? i : bi), 0);
  L.callout(b, pts[exLow], [pts[exLow][0] + mm(5), mm(31)], 'excursion', { anchor: 'start', textColor: K.exc, color: K.exc });
  polarityGlyph(b, L, X(30), mm(31.5), mm(7.5), S.sign0);
  polarityGlyph(b, L, X(170), mm(21), mm(7.5), -S.sign0);
  polarityGlyph(b, L, X(268), mm(31.5), mm(7.5), S.sign0);

  // ---- c : the (Q, D) plane
  L.arrow(c, [cx0, Y(0)], [cx1, Y(0)], { stroke: K.ink, width: 0.5, head: 3 });
  L.arrow(c, [cQ0, yBot + mm(2)], [cQ0, yTop - mm(3)], { stroke: K.ink, width: 0.5, head: 3 });
  L.text(c, cQ0 + mm(1.4), yTop - mm(3.5), '*D*', { anchor: 'start', valign: 'middle' });
  L.text(c, cx1 + mm(1), Y(0) + mm(4.6), 'quadrupole *Q*', { anchor: 'end', valign: 'middle', halo: true });
  polarityGlyph(c, L, mm(50.5), Y(0) + mm(10.5), mm(7.5), 'quad');
  L.path(c, L.smooth(data.manifold.map(([d, q]) => [QX(q), Y(d)]), true), { stroke: K.mid, width: 0.4, dash: '1.2 1', fill: 'none', part: 'slow-manifold' });
  const cp = S.t.map((t, i) => [QX(S.Q[i]), Y(S.D[i])]);
  // residence around each fixed point: a soft spot with the mean and covariance of the plateau samples (2 sigma)
  for (const sg of [1, -1]) {
    const Pq = cp.filter((_, i) => state[i] === 'plateau' && Math.sign(S.D[i]) === sg), n = Pq.length;
    const mx = Pq.reduce((a_, q) => a_ + q[0], 0) / n, my = Pq.reduce((a_, q) => a_ + q[1], 0) / n;
    let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of Pq) { sxx += (x - mx) ** 2 / n; syy += (y - my) ** 2 / n; sxy += (x - mx) * (y - my) / n; }
    const tr = (sxx + syy) / 2, dd = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy ** 2), ang = 0.5 * Math.atan2(2 * sxy, sxx - syy) * 180 / Math.PI;
    L.softSpot(c, mx, my, 2.2 * Math.sqrt(tr + dd), 2.2 * Math.sqrt(Math.max(tr - dd, 0.01)), ang, K.B, 0.42);
  }
  // event paths, smoothed (moving average) so that their direction reads; the excursion more, it is short and noisy
  const sm = (arr, i0, i1, k = 2) => arr.slice(i0, i1 + 1).map((_, j) => { const i = i0 + j, lo = Math.max(i0, i - k), hi = Math.min(i1, i + k); let sx = 0, sy = 0; for (let q = lo; q <= hi; q++) { sx += arr[q][0]; sy += arr[q][1]; } return [sx / (hi - lo + 1), sy / (hi - lo + 1)]; });
  const ext = (i0, i1) => {   // extend a reversal span to where |D| is back near D* on both sides, so the path meets the spots
    while (i0 > 0 && Math.abs(S.D[i0]) < 0.9 * Ds) i0--;
    while (i1 < S.D.length - 1 && Math.abs(S.D[i1]) < 0.9 * Ds) i1++;
    return [i0, i1];
  };
  const arrowAt = (seg, f, col) => {
    const i = Math.max(1, Math.min(seg.length - 2, Math.round((seg.length - 1) * f))), d = [seg[i + 1][0] - seg[i - 1][0], seg[i + 1][1] - seg[i - 1][1]], m = Math.hypot(...d);
    head(c, [seg[i][0] + d[0] / m * 1.5, seg[i][1] + d[1] / m * 1.5], [d[0] / m, d[1] / m], col, 3.2);
  };
  for (const e of S.events.filter((e_) => e_.kind === 'renversement')) {
    const [i0, i1] = ext(e.span[0], e.span[1]), seg = sm(cp, i0, i1, 2);
    L.path(c, L.smooth(seg), { stroke: K.rev, width: 1.0, fill: 'none', part: 'event-path' });
    arrowAt(seg, 0.5, K.rev);
  }
  // the excursion: its phase leaves theta_s, reaches theta_max < theta_saddle and comes back; drawn as an out-and-back
  // hairpin along the slow curve r(theta) of the model (out just outside, back just inside), to the phase it reached
  {
    const e = S.events.find((e_) => e_.kind === 'excursion'), sgn = Math.sign(S.D[e.span[0]]);
    const [mr, mi] = data.params.mu, nu = data.params.nu, rr = (t) => Math.sqrt(mr + nu * Math.cos(2 * t));
    const ph = (i) => Math.atan2(sgn * S.Q[i], sgn * S.D[i]);
    const ths = Math.atan2(Qs, Ds), thu = Math.atan2(data.fixed.saddle[1], data.fixed.saddle[0]);
    let thm = -9; for (let i = e.span[0]; i <= e.span[1]; i++) thm = Math.max(thm, ph(i));
    thm = Math.min(thm, thu - 0.06);
    const n = 40, to = (t, k) => [QX(sgn * rr(t) * k * Math.sin(t)), Y(sgn * rr(t) * k * Math.cos(t))];
    const out = Array.from({ length: n + 1 }, (_, i) => to(ths + 0.12 + (thm - ths - 0.12) * i / n, 1.05));
    const back = Array.from({ length: n + 1 }, (_, i) => to(thm - (thm - ths - 0.12) * i / n, 0.95));
    const hp = [...out, to(thm + 0.03, 1.0), ...back];
    L.path(c, L.smooth(hp), { stroke: K.exc, width: 1.0, fill: 'none', part: 'event-path' });
    arrowAt(out, 0.55, K.exc); arrowAt(back, 0.5, K.exc);
  }
  for (const sg of [1, -1]) {
    L.circle(c, QX(sg * data.fixed.saddle[1]), Y(sg * data.fixed.saddle[0]), 1.5, { fill: '#fff', stroke: K.ink, width: 0.5, part: 'saddle' });
    L.circle(c, QX(sg * Qs), Y(sg * Ds), 1.9, { fill: K.B, stroke: '#fff', width: 0.5, part: 'fixed-point' });
  }
  L.text(c, QX(Qs) + mm(1.8), Y(Ds) - mm(3.2), '+(*D*^{∗}, *Q*^{∗})', { anchor: 'start', valign: 'middle', halo: true });
  L.text(c, QX(-Qs) - mm(1.8), Y(-Ds) + mm(3.2), '−(*D*^{∗}, *Q*^{∗})', { anchor: 'end', valign: 'middle', halo: true });
  L.callout(c, [QX(-data.fixed.saddle[1]) - 1.1, Y(-data.fixed.saddle[0]) + 1.1], [mm(2.5), Y(-0.62)], 'saddle point', { anchor: 'start' });
}
