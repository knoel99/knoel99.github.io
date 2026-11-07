// Figure « flow-matching » (module de préparation « modèles génératifs », site MilaDy 2027).
// One principle, two cases on the same space-time template (flow time t to the right, one coordinate of x up):
// a  base law N(0, I) at t = 0, two-mode symmetric data law at t = 1, straight conditional paths between independent
//    pairs, and the exact marginal field v(x, t) = E[x1 - x0 | x_t = x] (arrows); a fan of paths through one point
//    shows the averaging. Small 2D clouds beside the profiles show the laws in dimension 2 (isotropic noise, +/- modes).
// b  the same noise and the same conditional field v_theta(x, t, lambda): two lambda values, two target laws.
// c  sampling: the ODE dx/dt = v_theta integrated with Heun's scheme (4 steps), one trajectory of b.
// Data: figure/data/make_data.py (numpy) -> figure/data/flow-matching.json. Hero: none (concept figure), route flat.
import { K, frame, heading, profile, dot, fieldArrow, curve, timeAxis } from './parts.js';

export const figure = { width: 136, height: 123, name: 'flow-matching', format: 'journal', illustrate: true };

export default async function draw(F, L) {
  const D = await (await fetch('/figure/data/flow-matching.json')).json();
  const mm = L.mm;

  // =============================================================== a: principle
  const pa = F.panel('a', { x: 0, y: 0, w: 136, h: 65 });
  heading(L, pa, 'Chemins et champ marginal');
  const fa = frame(mm(36), mm(96), mm(31.5), mm(7.0));
  const XR = 3.15;
  const kA = mm(21);                                    // pt per unit of density, both profiles of a
  // slices t = 0 and t = 1
  for (const t of [0, 1]) L.line(pa, [fa.T(t), fa.Y(XR)], [fa.T(t), fa.Y(-XR)], { stroke: K.light, width: 0.4 });
  profile(L, pa, fa, fa.T(0), D.grid, D.pdf_noise, kA, -1, { fill: K.noiseFill, stroke: K.noise, xr: [-XR, XR] });
  profile(L, pa, fa, fa.T(1), D.grid, D.pdf_law2, kA, +1, { fill: K.dataFill, stroke: K.data, xr: [-XR, XR] });

  // conditional straight paths between independent pairs
  const gp = L.group(pa, {});
  for (const [x0, x1] of D.pairs) L.line(gp.node ?? gp, [fa.T(0), fa.Y(x0)], [fa.T(1), fa.Y(x1)], { stroke: K.path, width: 0.35 });

  // marginal field (exact v*), opacity follows sqrt of the marginal density p_t(x)
  const fan = D.fan;
  for (const f of D.field) {
    if (Math.hypot((f.t - fan.t) * 6, f.x - fan.x) < 0.75) continue;
    const op = 0.12 + 0.88 * Math.sqrt(f.p);
    fieldArrow(L, L.group(pa, { opacity: +op.toFixed(3) }), fa, f.t, f.x, f.v, mm(2.6));
  }
  // fan of conditional paths through (t*, x*)
  for (const [x0, x1] of fan.pairs) L.line(pa, [fa.T(0), fa.Y(x0)], [fa.T(1), fa.Y(x1)], { stroke: K.fan, width: 0.5 });
  // samples on the slices
  for (const [x0, x1] of D.pairs) { dot(L, pa, fa.T(0), fa.Y(x0), 0.75, K.noise); dot(L, pa, fa.T(1), fa.Y(x1), 0.75, K.data); }
  for (const [x0, x1] of fan.pairs) { dot(L, pa, fa.T(0), fa.Y(x0), 1.15, '#ffffff', K.fan, 0.5); dot(L, pa, fa.T(1), fa.Y(x1), 1.15, '#ffffff', K.data, 0.5); }
  // the averaged direction at the fan point
  fieldArrow(L, pa, fa, fan.t, fan.x, fan.v, mm(7.2), { from: 0, width: 2.4, head: 4.6, headWidth: 2.3, stroke: '#ffffff' });   // white halo
  fieldArrow(L, pa, fa, fan.t, fan.x, fan.v, mm(7.2), { from: 0, width: 1.0, head: 3.4, headWidth: 1.5 });
  dot(L, pa, fa.T(fan.t), fa.Y(fan.x), 1.5, '#ffffff', K.ink, 0.6);
  // labels of one fan path
  const [hx0, hx1] = fan.pairs[0];
  L.text(pa, fa.T(0) + mm(1.6), fa.Y(hx0) - mm(1.6), '**x**_{0}', { size: 7, anchor: 'start', valign: 'bottom', halo: true, color: K.ink });
  L.text(pa, fa.T(1) - mm(1.4), fa.Y(hx1) + mm(1.8), '**x**_{1}', { size: 7, anchor: 'end', valign: 'top', halo: true, color: K.ink });
  L.text(pa, fa.T(fan.t) - mm(1.2), fa.Y(fan.x) - mm(1.6), '**x**_{*t*}', { size: 7, anchor: 'end', valign: 'bottom', halo: true, color: K.ink });

  // axes
  timeAxis(L, pa, fa, fa.Y(-XR) + mm(2.2));
  L.arrow(pa, [fa.T(0), fa.Y(-XR)], [fa.T(0), fa.Y(XR) - mm(2.5)], { stroke: K.ink, width: 0.4, head: 2.2, headWidth: 0.95 });
  L.text(pa, fa.T(0) + mm(1.2), fa.Y(XR) - mm(2.2), '**x**', { size: 7, anchor: 'start', valign: 'middle', color: K.ink });

  // 2D clouds (dimension 2: isotropic noise, two symmetric modes); same vertical sense as the plotted coordinate
  const gs = mm(2.75), R = mm(7.2);
  const cl = (cx, cy, pts, col) => {
    L.circle(pa, cx, cy, R, { fill: K.faint, stroke: K.light, width: 0.4 });
    L.line(pa, [cx - 2, cy], [cx + 2, cy], { stroke: K.mid, width: 0.35 }); L.line(pa, [cx, cy - 2], [cx, cy + 2], { stroke: K.mid, width: 0.35 });
    for (const [u, w] of pts) { const px = cx + u * gs, py = cy - w * gs; if (Math.hypot(px - cx, py - cy) < R - 1.2) dot(L, pa, px, py, 0.7, col); }
  };
  const c0 = [mm(14), mm(31.5)], c1 = [mm(122), mm(31.5)];
  cl(c0[0], c0[1], D.cloud0, K.noise);
  cl(c1[0], c1[1], D.cloud1.map(([a, b]) => [a, b]), K.data);
  L.text(pa, c0[0], c0[1] - R - mm(1.6), 'Loi de base', { size: 7, anchor: 'middle', valign: 'bottom', color: '#555555' });
  L.text(pa, c0[0], c0[1] + R + mm(1.6), '𝒩(0, *I*)', { size: 7, anchor: 'middle', valign: 'top', color: K.ink });
  L.text(pa, c1[0], c1[1] - R - mm(1.6), 'Loi des données *μ*', { size: 7, anchor: 'middle', valign: 'bottom', color: K.data });
  // symmetry B -> -B: point reflection that swaps the two modes
  const mh = D.cloud_mh, mv = D.params.m;
  L.arrow(pa, [c1[0] + mh * gs, c1[1] - mv * gs], [c1[0] - mh * gs, c1[1] + mv * gs], { both: true, bend: 0.42, gap0: mm(2.2), gap1: mm(2.2), stroke: K.ink, width: 0.5, head: 2.2, headWidth: 1.0 });
  const by = c1[1] + R + mm(3.0);
  L.text(pa, c1[0] - mm(2.4), by, '**B**', { size: 7, anchor: 'end', valign: 'middle', color: K.ink });
  L.arrow(pa, [c1[0] - mm(1.7), by], [c1[0] + mm(1.7), by], { stroke: K.ink, width: 0.45, head: 2.0, headWidth: 0.9 });
  L.text(pa, c1[0] + mm(2.4), by, '−**B**', { size: 7, anchor: 'start', valign: 'middle', color: K.ink });

  // legend row: the two repeated glyphs and their defining relations, centred under the panel
  const ly = mm(62.6), gl = mm(5), gg = mm(1.2), gap = mm(7);
  const t1 = L.text(pa, 0, ly, 'Chemin conditionnel  **x**_{*t*} = (1 − *t*) **x**_{0} + *t* **x**_{1}', { size: 7, valign: 'middle', color: K.ink });
  const t2 = L.text(pa, 0, ly, 'Champ marginal  *v*(**x**, *t*) = 𝔼[**x**_{1} − **x**_{0} | **x**_{*t*} = **x**]', { size: 7, valign: 'middle', color: K.ink });
  const w1 = t1.getBBox().width, w2 = t2.getBBox().width, wt = 2 * (gl + gg) + w1 + w2 + gap;
  let lx = (pa.w - wt) / 2;
  L.line(pa, [lx, ly], [lx + gl, ly], { stroke: K.fan, width: 0.5 }); t1.setAttribute('x', lx + gl + gg); t1.querySelectorAll('tspan[x]').forEach((e) => e.setAttribute('x', lx + gl + gg));
  lx += gl + gg + w1 + gap;
  L.arrow(pa, [lx, ly], [lx + gl, ly], { stroke: K.ink, width: 0.6, head: 2.2, headWidth: 1.0 }); t2.setAttribute('x', lx + gl + gg); t2.querySelectorAll('tspan[x]').forEach((e) => e.setAttribute('x', lx + gl + gg));

  // =============================================================== b: conditioning by lambda
  const pb = F.panel('b', { x: 0, y: 66, w: 86, h: 57 });
  heading(L, pb, 'Conditionnement par **λ**');
  const fb = frame(mm(13), mm(63), mm(31), mm(7.0));
  const XB = 2.75, kB = mm(13);
  for (const t of [0, 1]) L.line(pb, [fb.T(t), fb.Y(XB)], [fb.T(t), fb.Y(-XB)], { stroke: K.light, width: 0.4 });
  profile(L, pb, fb, fb.T(0), D.grid, D.pdf_noise, kB, -1, { fill: K.noiseFill, stroke: K.noise, xr: [-XB, XB] });
  profile(L, pb, fb, fb.T(1), D.grid, D.pdf_law1, kB, +1, { fill: K.lam1Fill, stroke: K.lam1, xr: [-XB, XB], fillOpacity: 0.8 });
  profile(L, pb, fb, fb.T(1), D.grid, D.pdf_law2, kB, +1, { fill: K.dataFill, stroke: K.data, xr: [-XB, XB], fillOpacity: 0.6 });
  const HI = 5;                                          // trajectory followed in c
  D.traj.lam1.forEach((tr) => curve(L, pb, fb, tr, { stroke: K.lam1, width: 0.55 }));
  D.traj.lam2.forEach((tr, i) => curve(L, pb, fb, tr, { stroke: K.data, width: i === HI ? 1.2 : 0.55 }));
  D.traj.lam1.forEach((tr) => dot(L, pb, fb.T(1), fb.Y(tr[tr.length - 1][1]), 0.85, K.lam1));
  D.traj.lam2.forEach((tr) => dot(L, pb, fb.T(1), fb.Y(tr[tr.length - 1][1]), 0.85, K.data));
  D.x0b.forEach((x, i) => dot(L, pb, fb.T(0), fb.Y(x), i === HI ? 1.3 : 1.05, K.noise, i === HI ? K.ink : '#ffffff', i === HI ? 0.4 : 0.3));
  dot(L, pb, fb.T(1), fb.Y(D.traj.lam2[HI][D.traj.lam2[HI].length - 1][1]), 1.3, K.data, K.ink, 0.4);
  timeAxis(L, pb, fb, fb.Y(-XB) + mm(2.0), { over: 14 });
  // column headers: same noise, same field, only lambda changes
  const hy = fb.Y(XB) - mm(2.2);
  L.text(pb, fb.T(0) + mm(1.0), hy, 'Même bruit', { size: 7, anchor: 'end', valign: 'baseline', color: K.ink });
  L.text(pb, fb.T(0.5), hy, 'Même champ *v*_{θ}(**x**, *t*, **λ**)', { size: 7, anchor: 'middle', valign: 'baseline', color: K.ink });
  L.text(pb, fb.T(1) - mm(1.0), hy, 'Lois cibles', { size: 7, anchor: 'start', valign: 'baseline', color: K.ink });
  // target laws, labelled in their colours
  L.text(pb, fb.T(1) + kB * 0.887 + mm(1.4), fb.Y(0), '**λ**_{1}', { size: 7.5, anchor: 'start', valign: 'middle', color: K.lam1 });
  L.text(pb, fb.T(1) + kB * 0.57 + mm(1.4), fb.Y(D.params.m), '**λ**_{2}', { size: 7.5, anchor: 'start', valign: 'middle', color: K.data });
  L.text(pb, fb.T(1) + kB * 0.57 + mm(1.4), fb.Y(-D.params.m), '**λ**_{2}', { size: 7.5, anchor: 'start', valign: 'middle', color: K.data });

  // =============================================================== c: sampling with Heun
  const pc = F.panel('c', { x: 88, y: 66, w: 48, h: 57 });
  heading(L, pc, 'Échantillonnage');
  L.text(pc, mm(4), mm(9.55), 'd**x**/d*t* = *v*_{θ}(**x**, *t*, **λ**)', { size: 7, anchor: 'start', valign: 'baseline', color: K.ink });
  const lo = -0.15, hi = 1.25, yTop = mm(14.2), yBot = mm(50.25);
  const fc = frame(mm(6), mm(42), yBot + lo / (hi - lo) * (yBot - yTop), (yBot - yTop) / (hi - lo));
  for (const t of [0, 1]) L.line(pc, [fc.T(t), fc.Y(hi)], [fc.T(t), fc.Y(lo)], { stroke: K.light, width: 0.4 });
  for (const t of [0.25, 0.5, 0.75]) L.line(pc, [fc.T(t), fc.Y(hi)], [fc.T(t), fc.Y(lo)], { stroke: K.faint, width: 0.4 });
  curve(L, pc, fc, D.heun.exact, { stroke: K.dataPale, width: 1.6 });
  const S = D.heun.steps4;
  for (let n = 0; n < S.length - 1; n++) {
    const a = S[n], b = S[n + 1];
    L.line(pc, [fc.T(a.t), fc.Y(a.x)], [fc.T(b.t), fc.Y(a.xp)], { stroke: K.mid, width: 0.45, dash: '1.3 0.9' });
    L.line(pc, [fc.T(a.t), fc.Y(a.x)], [fc.T(b.t), fc.Y(b.x)], { stroke: K.ink, width: 0.6 });
  }
  for (let n = 0; n < S.length - 1; n++) dot(L, pc, fc.T(S[n + 1].t), fc.Y(S[n].xp), 1.1, '#ffffff', K.mid, 0.45);
  S.forEach((s, n) => dot(L, pc, fc.T(s.t), fc.Y(s.x), 1.3, n === 0 ? K.noise : n === S.length - 1 ? K.data : K.ink, n === 0 || n === S.length - 1 ? K.ink : 'none', 0.4));
  timeAxis(L, pc, fc, yBot + mm(2.0), { ticks: [0, 0.25, 0.5, 0.75, 1], over: 3 });
  // step length h: a dimension arrow spanning one step between the grid lines t = 0.5 and 0.75 (empty strip under the curves)
  const yh = fc.Y(-0.1);
  L.arrow(pc, [fc.T(0.5) + 0.5, yh], [fc.T(0.75) - 0.5, yh], { both: true, stroke: K.ink, width: 0.4, head: 2.0, headWidth: 0.85 });
  L.text(pc, (fc.T(0.5) + fc.T(0.75)) / 2, yh - mm(0.7), '*h*', { size: 7, anchor: 'middle', valign: 'bottom', halo: true, color: K.ink });
  // key in the empty upper-left corner of the plot: three line styles
  const kx = fc.T(0) + mm(1.6), ky = fc.Y(1.12), kd = mm(3.6), kw = mm(5);
  L.line(pc, [kx, ky], [kx + kw, ky], { stroke: K.dataPale, width: 1.6, cap: 'round' });
  L.text(pc, kx + kw + mm(1.3), ky, 'Exacte', { size: 7, valign: 'middle', color: K.ink });
  L.line(pc, [kx, ky + kd], [kx + kw, ky + kd], { stroke: K.ink, width: 0.6 });
  dot(L, pc, kx + kw, ky + kd, 1.3, K.ink);
  L.text(pc, kx + kw + mm(1.3), ky + kd, 'Heun', { size: 7, valign: 'middle', color: K.ink });
  L.line(pc, [kx, ky + 2 * kd], [kx + kw, ky + 2 * kd], { stroke: K.mid, width: 0.45, dash: '1.3 0.9' });
  dot(L, pc, kx + kw, ky + 2 * kd, 1.1, '#ffffff', K.mid, 0.45);
  L.text(pc, kx + kw + mm(1.3), ky + 2 * kd, 'Prédicteur', { size: 7, valign: 'middle', color: K.ink });
}
