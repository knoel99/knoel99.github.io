// Draft A of the « cadre » figure: one causal row of five stations, constraint chips aligned under the stations
// that enforce them, one feedback arc (stationarity loss) above.
// Hero: VKS cylinder with generated u and B, drawn with vector 3D library parts (L.obliqueProj, L.cylinder3) and the illustrated finish.
import { K, heading, chip, lambdaCard, latentFlow, potentialMap, fieldLines, vks, lawHist, miniDiff, modesGlyph, assimGlyph, riceGlyph, check, cross } from './parts.js';
import * as CS from '../engine/cs.js';

export const figure = { width: 183, height: 75, name: 'cadre_a', format: 'journal', illustrate: true };

export default async function draw(F, L) {
  const D = await (await fetch('/figure/data/cadre.json')).json();
  const T = 5;                                   // top strip (mm) for the feedback arc
  const H = 69.5;
  const pa = F.panel('a', { x: 0, y: T, w: 52, h: H });
  const pb = F.panel('b', { x: 52, y: T, w: 47, h: H });
  const pc = F.panel('c', { x: 99, y: T, w: 30, h: H });
  const pd = F.panel('d', { x: 129, y: T, w: 32, h: H });
  const pe = F.panel('e', { x: 161, y: T, w: 22, h: H });
  heading(L, pa, 'Flow matching latent');
  heading(L, pb, 'Décodeur à potentiels');
  heading(L, pc, 'Cible 3D : VKS');
  heading(L, pd, 'Contrôle en loi');
  heading(L, pe, 'Usages');
  const yAxis = 88;                              // main axis (panel-local pt)
  const chipY = H * 2.8346 - 15;

  // ---------------------------------------------------------------- a
  // vertical sliders for lambda
  const lx = 3, ly = 18;
  L.text(pa, lx + 14, ly, '**λ**', { size: 8.5, color: K.lam, anchor: 'middle', valign: 'top' });
  const names = ['*Re*', '*Rm*', '*μ*_{r}'], pos = [0.62, 0.35, 0.78];
  names.forEach((n, i) => {
    const xx = lx + 4 + i * 10, y0 = ly + 22, y1 = ly + 92;
    L.line(pa, [xx, y0], [xx, y1], { stroke: '#cfcfcf', width: 1.8, cap: 'round' });
    L.line(pa, [xx, y1], [xx, y1 - (y1 - y0) * pos[i]], { stroke: K.lam, width: 1.8, cap: 'round' });
    L.circle(pa, xx, y1 - (y1 - y0) * pos[i], 2.3, { fill: '#ffffff', stroke: K.lam, width: 0.7 });
    L.text(pa, xx, y1 + 7, n, { size: 5.6, anchor: 'middle', valign: 'top', color: K.ink });
  });
  L.text(pa, lx + 14, ly + 116, 'Paramètres\nde contrôle', { size: 5.6, anchor: 'middle', valign: 'top', color: K.ink, lineGap: 1.15 });
  const fl = latentFlow(F, L, pa, { x: 52, y: yAxis - 58, w: 50, h: 116 }, D, { dens: 11 });
  // v_theta label + conditioning by lambda
  const vx = fl.X(0.5), vy = 20;
  L.text(pa, vx, vy, '*v*_{θ}(**z**, *t*, {#009E73|**λ**})', { size: 6, anchor: 'middle', valign: 'middle', color: K.z });
  F.anchor('vth.left', pa, vx - 22, vy); F.anchor('lam.top', pa, lx + 22, ly + 5);
  F.anchor('vth.top', pa, vx, vy - 4);
  L.arrow(pa, [lx + 21, ly + 4.5], [vx - 22.5, vy], { stroke: K.lam, width: 0.7, head: 2.6, headWidth: 1.7 });
  F.drew('lam.top', 'vth.left', 'conditions');
  L.text(pa, fl.X(0), fl.Y(2.45) - 4, '*t* = 0', { size: 5.5, anchor: 'middle', color: K.mid });
  L.text(pa, fl.X(1), fl.Y(2.45) - 4, '*t* = 1', { size: 5.5, anchor: 'middle', color: K.mid });

  // ---------------------------------------------------------------- b
  const tok = [], tx = 4, ts = 6.2;
  for (let i = 0; i < 5; i++) {
    const yy = yAxis - 22 + i * 9;
    L.rect(pb, tx, yy, ts, ts, { r: 0.8, fill: L.shade(K.z, 0.35 + 0.1 * (i % 3)), stroke: K.z, width: 0.4 });
    tok.push([tx + ts, yy + ts / 2]);
  }
  L.text(pb, tx + ts / 2, yAxis - 26, '**z**_{1}', { size: 6, anchor: 'middle', color: K.z });
  // attention box
  const bx = 17, bw = 32, by = yAxis - 16, bh = 32;
  L.rect(pb, bx, by, bw, bh, { r: 3, fill: '#f1eef7', stroke: K.z, width: 0.5 });
  L.text(pb, bx + bw / 2, by + bh / 2, 'Attention\ncroisée', { size: 5.6, anchor: 'middle', valign: 'middle', color: K.ink, lineGap: 1.15 });
  const w8 = [0.25, 0.6, 1, 0.45, 0.15];
  tok.forEach(([x, y], i) => L.line(pb, [x + 0.3, y], [bx, by + 6 + i * 5], { stroke: K.z, width: 0.25 + 0.75 * w8[i], opacity: 0.35 + 0.6 * w8[i] }));
  // query point x in the domain
  const qx = bx + 4, qy = by + bh + 12, qs = 22;
  L.rect(pb, qx, qy, qs, qs, { fill: '#f4f4f4', stroke: '#8a8a8a', width: 0.4 });
  L.circle(pb, qx + qs * 0.62, qy + qs * 0.38, 1.4, { fill: K.ink, stroke: 'none' });
  L.text(pb, qx + qs * 0.62 + 2.5, qy + qs * 0.38 + 1, '*x*', { size: 6, valign: 'middle', color: K.ink });
  L.text(pb, qx + qs + 2.5, qy + qs - 2, 'Ω', { size: 5.6, color: K.mid });
  L.arrow(pb, [qx + qs * 0.62, qy + qs * 0.38 - 2], [qx + qs * 0.62, by + bh + 0.6], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  // potentials -> curl -> fields
  const ms = 31, mx = bx + bw + 9, my1 = yAxis - ms - 3.5, my2 = yAxis + 3.5;
  L.arrow(pb, [bx + bw + 0.5, yAxis], [mx - 1, yAxis], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  const lev = [-0.7, -0.3, 0.1, 0.5, 0.9];
  potentialMap(L, pb, mx, my1, ms, D.pot.psi, D.pot.cpsi, 'u', { levels: [-0.9, -0.5, -0.1, 0.3, 0.7] });
  potentialMap(L, pb, mx, my2, ms, D.pot.a, D.pot.ca, 'B', { levels: [-0.9, -0.5, -0.1, 0.3, 0.7] });
  L.text(pb, mx + ms / 2, my1 - 3, '*ψ*', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, mx + ms / 2, my2 + ms + 7.5, '*a*', { size: 6.5, anchor: 'middle', color: K.B });
  const fx = mx + ms + 14;
  fieldLines(L, pb, fx, my1, ms, D.pot.cpsi, 'u', { levels: [-0.9, -0.5, -0.1, 0.3, 0.7] });
  fieldLines(L, pb, fx, my2, ms, D.pot.ca, 'B', { levels: [-0.9, -0.5, -0.1, 0.3, 0.7] });
  for (const [yy, c] of [[my1 + ms / 2, K.u], [my2 + ms / 2, K.B]]) {
    L.arrow(pb, [mx + ms + 1.5, yy], [fx - 1.5, yy], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
    L.text(pb, mx + ms + 7, yy - 3, '∇×', { size: 6, anchor: 'middle', color: K.ink });
  }
  L.text(pb, fx + ms / 2, my1 - 3, '**u**', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, fx + ms / 2, my2 + ms + 7.5, '**B**', { size: 6.5, anchor: 'middle', color: K.B });
  L.text(pb, mx + ms / 2 - 2, by - 12, '**A**_{u}, **A**_{B}', { size: 5.8, anchor: 'start', color: K.ink });

  // ---------------------------------------------------------------- c
  const v = vks(F, L, pc, 27, yAxis + 2, 22, D, { elev: 20, clipR: 2.3 });
  L.callout(pc, L.toLocal(F, pc, F.at('vks.imp')), [52, 34], 'Turbines\ncontra-\nrotatives', { anchor: 'start', size: 5.6 });

  // ---------------------------------------------------------------- d
  const lh = lawHist(F, L, pd, { x: 6, y: 34, w: 66, h: 44 }, D);
  L.text(pd, lh.xe, 26, '*E*[*ε*] = *E*[*P*]', { size: 6, anchor: 'middle', color: K.ink });
  L.text(pd, 62, 62, '*q*_{θ}', { size: 5.8, color: K.mid });
  miniDiff(L, pd, 6, 112, 28, 20, D, 'law');
  miniDiff(L, pd, 46, 112, 28, 20, D, 'sample');
  check(L, pd, 31, 108, 5, K.ink); cross(L, pd, 71, 108, 5, K.ink);
  L.text(pd, 20, 141, 'en loi', { size: 5.6, anchor: 'middle', color: K.ink });
  L.text(pd, 60, 141, 'par échantillon', { size: 5.6, anchor: 'middle', color: K.ink });
  L.text(pd, 40, 153, 'd*E*/d*t* = *P* − *ε*', { size: 5.6, anchor: 'middle', color: K.ink });

  // ---------------------------------------------------------------- e
  modesGlyph(L, pe, 4, 26, 14, D);
  L.text(pe, 4, 50, 'Modèles réduits', { size: 5.6, color: K.ink });
  assimGlyph(L, pe, 4, 70, 46, 20, D);
  L.text(pe, 4, 100, 'Assimilation', { size: 5.6, color: K.ink });
  riceGlyph(L, pe, 4, 118, 46, 20, D);
  L.text(pe, 4, 148, 'Renversements\n(Rice)', { size: 5.6, color: K.ink, lineGap: 1.15 });

  // ---------------------------------------------------------------- chips
  chip(L, pa, 3, chipY, 138, 'C3', 'symétrie **B** → −**B** : équivariance', { color: K.ink });
  chip(L, pb, 3, chipY, 126, 'C1', '∇·**u** = ∇·**B** = 0 : exact', { color: K.ink });
  chip(L, pc, 3, chipY, 78, null, 'stage : 3 modes, MHD 2D', { dash: '1.6 1.2', fill: '#f6f6f6' });
  chip(L, pd, 3, chipY, 86, 'C4', 'bilan d’énergie : en loi', { color: K.ink });

  // ---------------------------------------------------------------- flow between stations
  const R = F.root, mm = L.mm;
  const ya = mm(T) + yAxis;
  const ba = (x0, x1) => L.blockArrow(R, [mm(x0), ya], [mm(x1), ya], { width: 4.5, head: 4.5, headWidth: 8.5, fill: '#d6d6d6' });
  ba(50.6, 53.4); ba(97.4, 100.2); ba(128.6, 131.2); ba(160.4, 163);
  // feedback: stationarity loss, from the law back to v_theta
  const d0 = L.toLocal(F, R, [0, 0]);
  const xd = mm(129) + lh.xe, xv = vx, yv = mm(T) + vy - 6;
  L.path(R, `M${xd},${mm(T) + 20} L${xd},${mm(2.2)} L${xv},${mm(2.2)} L${xv},${yv}`, { stroke: K.mid, width: 0.6, dash: '2 1.3', fill: 'none' });
  L.chevron(R, [xv, yv], [0, 1], { len: 2.6, spread: 0.6, stroke: K.mid, width: 0.6 });
  L.text(R, (xd + xv) / 2, mm(2.2), 'perte de stationnarité (entraînement)', { size: 5.6, anchor: 'middle', valign: 'middle', color: K.mid, halo: true, italic: true });
}
