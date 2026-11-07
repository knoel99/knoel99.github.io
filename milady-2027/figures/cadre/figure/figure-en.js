// Figure 1 "cadre", ENGLISH version (MilaDy internship report): the proposed generative framework, one causal row of five stations.
// a lambda conditions a latent flow matching (equivariant under S); b a functional decoder outputs potentials, the curl gives
// divergence-free fields; c generated u, B in the VKS target geometry; d the energy balance checked in law; e downstream uses.
// Constraint chips (classes C1, C3, C4 of the theory note) sit under the station that enforces each one.
// Hero: VKS cylinder with generated u and B, drawn with vector 3D library parts (L.obliqueProj, L.cylinder3) and the illustrated finish.
import { K, heading, chip, latentFlow, potentialMap, fieldLines, vks, lawHist, miniDiff, modesGlyph, assimGlyph, riceGlyph, check, cross } from './parts.js';

export const figure = { width: 183, height: 72, name: 'cadre-en', format: 'journal', illustrate: true };

export default async function draw(F, L) {
  const D = await (await fetch('/figure/data/cadre.json')).json();
  const mm = L.mm, R0 = F.root;
  const T = 5, H = 66.5;                         // top strip (feedback arc), panel height (mm)
  const pa = F.panel('a', { x: 0, y: T, w: 52, h: H });
  const pb = F.panel('b', { x: 52, y: T, w: 47, h: H });
  const pc = F.panel('c', { x: 99, y: T, w: 30, h: H });
  const pd = F.panel('d', { x: 129, y: T, w: 32, h: H });
  const pe = F.panel('e', { x: 161, y: T, w: 22, h: H });
  heading(L, pa, 'Latent flow matching');
  heading(L, pb, 'Potential decoder');
  heading(L, pc, '3D target: VKS');
  heading(L, pd, 'Control in law');
  heading(L, pe, 'Uses');
  const yA = 90;                                 // main axis (panel-local pt)
  const chipY = mm(H) - 15;

  // ================================================================ a: lambda + latent flow
  const vy = 19;
  L.text(pa, 15, vy, '**λ**', { size: 8, color: K.lam, anchor: 'middle', valign: 'middle' });
  const names = ['*Re*', '*Rm*', '*μ*_{r}'], pos = [0.62, 0.35, 0.78];
  names.forEach((n, i) => {
    const xx = 6 + i * 9.5, y0 = 34, y1 = 106;
    L.line(pa, [xx, y0], [xx, y1], { stroke: '#cfcfcf', width: 1.8, cap: 'round' });
    L.line(pa, [xx, y1], [xx, y1 - (y1 - y0) * pos[i]], { stroke: K.lam, width: 1.8, cap: 'round' });
    L.circle(pa, xx, y1 - (y1 - y0) * pos[i], 2.3, { fill: '#ffffff', stroke: K.lam, width: 0.7 });
    L.text(pa, xx, y1 + 6, n, { size: 5.6, anchor: 'middle', valign: 'top', color: K.ink });
  });
  L.text(pa, 17.5, 127, 'Control\nparameters', { size: 6, anchor: 'middle', valign: 'top', color: K.ink, lineGap: 1.15 });
  const fl = latentFlow(F, L, pa, { x: 52, y: yA - 56, w: 50, h: 112 }, D, { dens: 11 });
  const vx = fl.X(0.5);
  L.text(pa, vx, vy, '*v*_{θ}(**z**, *t*, {#009E73|**λ**})', { size: 6, anchor: 'middle', valign: 'middle', color: K.z });
  F.anchor('lam', pa, 21, vy); F.anchor('vth', pa, vx - 22.5, vy);
  F.relate('lam', 'vth', 'conditions');
  L.connect(F, 'lam', 'vth', { stroke: K.lam, width: 0.7, head: 2.6, headWidth: 1.7, kind: 'conditions' });

  // ================================================================ b: decoder -> potentials -> curl
  const tx = 3, ts = 6.2, tok = [];
  for (let i = 0; i < 5; i++) {
    const yy = yA - 22 + i * 9;
    L.rect(pb, tx, yy, ts, ts, { r: 0.8, fill: L.shade(K.z, 0.35 + 0.1 * (i % 3)), stroke: K.z, width: 0.4 });
    tok.push([tx + ts, yy + ts / 2]);
  }
  L.text(pb, tx + ts / 2, yA - 26, '**z**_{1}', { size: 6, anchor: 'middle', color: K.z });
  const bx = 13.5, bw = 30, by = yA - 16, bh = 32;
  const w8 = [0.25, 0.6, 1, 0.45, 0.15];
  tok.forEach(([x, y], i) => L.line(pb, [x + 0.3, y], [bx, by + 6 + i * 5], { stroke: K.z, width: 0.25 + 0.75 * w8[i], opacity: 0.35 + 0.6 * w8[i] }));
  L.rect(pb, bx, by, bw, bh, { r: 3, fill: '#f1eef7', stroke: K.z, width: 0.5 });
  L.text(pb, bx + bw / 2, by + bh / 2, 'Cross-\nattention', { size: 6, anchor: 'middle', valign: 'middle', color: K.ink, lineGap: 1.15 });
  const qs = 20, qx = bx + (bw - qs) / 2, qy = by + bh + 10;
  L.rect(pb, qx, qy, qs, qs, { fill: '#f4f4f4', stroke: '#8a8a8a', width: 0.4 });
  L.circle(pb, qx + qs * 0.5, qy + qs * 0.42, 1.4, { fill: K.ink, stroke: 'none' });
  L.text(pb, qx + qs * 0.5 + 2.4, qy + qs * 0.42 + 1.2, '*x*', { size: 6, valign: 'middle', color: K.ink });
  L.text(pb, qx + qs + 2, qy + qs - 1, 'Ω', { size: 5.6, color: K.mid });
  L.arrow(pb, [qx + qs * 0.5, qy + qs * 0.42 - 2.2], [qx + qs * 0.5, by + bh + 0.6], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  const ms = 29, mx = bx + bw + 15, my1 = yA - ms - 4, my2 = yA + 4, fx = mx + ms + 14;
  L.arrow(pb, [bx + bw + 0.5, yA], [mx + 2, yA], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  L.text(pb, bx + bw + 7.5, yA - 2.2, '**A**_{u}', { size: 5.6, anchor: 'middle', color: K.u });
  L.text(pb, bx + bw + 7.5, yA + 6.6, '**A**_{B}', { size: 5.6, anchor: 'middle', color: K.B });
  const lv = [-0.8, -0.5, -0.2, 0.2, 0.5, 0.8];
  potentialMap(L, pb, mx, my1, ms, D.pot.psi, D.pot.cpsi, 'u', { levels: lv });
  potentialMap(L, pb, mx, my2, ms, D.pot.a, D.pot.ca, 'B', { levels: [-0.8, -0.5, 0.2, 0.5] });
  fieldLines(L, pb, fx, my1, ms, D.pot.cpsi, 'u', { levels: lv });
  fieldLines(L, pb, fx, my2, ms, D.pot.ca, 'B', { levels: [-0.8, -0.5, 0.2, 0.5] });
  for (const yy of [my1 + ms / 2, my2 + ms / 2]) {
    L.arrow(pb, [mx + ms + 1.5, yy], [fx - 1.5, yy], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
    L.text(pb, mx + ms + 7, yy - 3, '∇×', { size: 6, anchor: 'middle', color: K.ink });
  }
  L.text(pb, mx + ms / 2, my1 - 3.5, '*ψ*', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, mx + ms / 2, my2 + ms + 7.5, '*a*', { size: 6.5, anchor: 'middle', color: K.B });
  L.text(pb, fx + ms / 2, my1 - 3.5, '**u**', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, fx + ms / 2, my2 + ms + 7.5, '**B**', { size: 6.5, anchor: 'middle', color: K.B });

  // ================================================================ c: VKS target
  vks(F, L, pc, 31, yA + 2, 22, D, { elev: 20, clipR: 2.4 });
  L.callout(pc, L.toLocal(F, pc, F.at('vks.impB')), [6, 143], 'Counter-rotating\nimpellers', { anchor: 'start', size: 6 });
  L.callout(pc, L.toLocal(F, pc, F.at('vks.ucell')), [4, yA - 20], '**u**', { anchor: 'middle', size: 6.5, textColor: K.u, color: K.u });
  L.callout(pc, L.toLocal(F, pc, F.at('vks.Bloop')), [76, 62], '**B**', { anchor: 'middle', size: 6.5, textColor: K.B, color: K.B });

  // ================================================================ d: law control
  const lh = lawHist(F, L, pd, { x: 6, y: 42, w: 66, h: 40 }, D, { arrowY: 35 });
  L.text(pd, lh.xe, 25, '*E*[*ε*] = *E*[*P*]', { size: 6, anchor: 'middle', color: K.ink });
  L.text(pd, lh.xr0 + 3, 35, 'tilting', { size: 5.5, color: K.E, valign: 'middle' });
  L.text(pd, 61, 64, '*q*_{θ}', { size: 5.8, color: K.mid });
  miniDiff(L, pd, 6, 106, 28, 20, D, 'law');
  miniDiff(L, pd, 46, 106, 28, 20, D, 'sample');
  check(L, pd, 31, 103, 5, K.ink); cross(L, pd, 71, 103, 5, K.ink);
  L.text(pd, 20, 135, 'in law', { size: 6, anchor: 'middle', color: K.ink });
  L.text(pd, 60, 135, 'per sample', { size: 6, anchor: 'middle', color: K.ink });
  L.text(pd, 40, 147, 'd*E*/d*t* = *P* − *ε*', { size: 6, anchor: 'middle', color: K.ink });

  // ================================================================ e: uses
  modesGlyph(L, pe, 4, 27, 15, D);
  L.text(pe, 4, 53, 'Reduced models', { size: 6, color: K.ink });
  assimGlyph(L, pe, 4, 67, 52, 21, D);
  L.text(pe, 4, 98, 'Data\nassimilation', { size: 6, color: K.ink, lineGap: 1.15 });
  riceGlyph(L, pe, 4, 119, 48, 20, D);
  L.text(pe, 55, 139, '*D*', { size: 5.6, color: K.ink, valign: 'middle' });
  L.text(pe, 4, 151, 'Field reversals\n(Rice)', { size: 6, color: K.ink, lineGap: 1.15 });

  // ================================================================ constraint chips (classes of the theory note)
  chip(L, pa, 3, chipY, 138, 'C3', 'symmetry **B** ↦ −**B**: equivariance');
  chip(L, pb, 3, chipY, 126, 'C1', '∇·**u** = ∇·**B** = 0: by construction');
  chip(L, pc, 3, chipY, 79, null, 'internship: 3-mode, 2D MHD', { dash: '1.6 1.2', fill: '#f6f6f6' });
  chip(L, pd, 3, chipY, 86, 'C4', 'energy balance: in law');

  // ================================================================ flow between stations
  const ya = mm(T) + yA;
  const ba = (x0, x1, from, to, o = {}) => { const b = L.blockArrow(R0, [mm(x0), ya], [mm(x1), ya], { width: 4.5, head: 4.5, headWidth: 8.5, fill: '#d6d6d6', ...o }); if (o.dash) b.setAttribute('stroke-dasharray', o.dash); F.drew(from, to, 'flow'); };
  F.anchor('st.a', R0, mm(50.6), ya); F.anchor('st.b', R0, mm(53.4), ya); F.anchor('st.b2', R0, mm(97.4), ya); F.anchor('st.c', R0, mm(100.2), ya);
  F.anchor('st.c2', R0, mm(128.6), ya); F.anchor('st.d', R0, mm(131.2), ya); F.anchor('st.d2', R0, mm(160.4), ya); F.anchor('st.e', R0, mm(163), ya);
  for (const [a, b, k] of [['st.a', 'st.b', 'flow'], ['st.b2', 'st.c', 'flow'], ['st.c2', 'st.d', 'flow'], ['st.d2', 'st.e', 'flow']]) F.relate(a, b, k);
  ba(50.6, 53.4, 'st.a', 'st.b'); ba(97.4, 100.2, 'st.b2', 'st.c', { fill: '#ffffff', stroke: '#9a9a9a', dash: '1.2 0.8' });   // into the target: hollow, not trained here
  ba(128.6, 131.2, 'st.c2', 'st.d'); ba(160.4, 163, 'st.d2', 'st.e');
  // feedback: stationarity loss (training), from the law constraint back to v_theta
  const xv = vx + 10, yv = mm(T) + vy - 5.5, yt = mm(2.3), xl = mm(129) - 4.5, yeq = mm(T) + 23;   // xl: clear of the panel letter d
  L.path(R0, `M${mm(129) + lh.xe - 17.5},${yeq} L${xl},${yeq} L${xl},${yt} L${xv},${yt} L${xv},${yv}`, { stroke: K.mid, width: 0.6, dash: '2 1.3', fill: 'none' });
  L.chevron(R0, [xv, yv], [0, 1], { len: 2.6, spread: 0.6, stroke: K.mid, width: 0.6 });
  L.text(R0, (xl + xv) / 2, yt, 'stationarity loss', { size: 5.6, anchor: 'middle', valign: 'middle', color: K.mid, halo: true, italic: true });
  F.anchor('fb.from', R0, mm(129) + lh.xe - 17.5, yeq); F.anchor('fb.to', R0, xv, yv);
  F.relate('fb.from', 'fb.to', 'feedback'); F.drew('fb.from', 'fb.to', 'feedback');
}
