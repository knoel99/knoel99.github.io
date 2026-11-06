// Draft B of the « cadre » figure: the generator on a top row (lambda, latent flow, decoder with 2D maps),
// the outputs on a bottom row (VKS target as a larger hero, law control, uses).
// Hero: VKS cylinder with generated u and B, drawn with vector 3D library parts (L.obliqueProj, L.cylinder3) and the illustrated finish.
import { K, heading, chip, latentFlow, potentialMap, fieldLines, vks, lawHist, miniDiff, modesGlyph, assimGlyph, riceGlyph, check, cross } from './parts.js';

export const figure = { width: 183, height: 104, name: 'cadre_b', format: 'journal', illustrate: true };

export default async function draw(F, L) {
  const D = await (await fetch('/figure/data/cadre.json')).json();
  const mm = L.mm, R0 = F.root;
  const pa = F.panel('a', { x: 0, y: 1, w: 74, h: 50 });
  const pb = F.panel('b', { x: 74, y: 1, w: 109, h: 50 });
  const pc = F.panel('c', { x: 0, y: 53, w: 62, h: 50 });
  const pd = F.panel('d', { x: 62, y: 53, w: 58, h: 50 });
  const pe = F.panel('e', { x: 120, y: 53, w: 63, h: 50 });
  heading(L, pa, 'Flow matching latent');
  heading(L, pb, 'Décodeur à potentiels (banc d’essai MHD 2D)');
  heading(L, pc, 'Cible 3D : dynamo VKS');
  heading(L, pd, 'Contrôle en loi');
  heading(L, pe, 'Usages en aval');
  const yA = 76;

  // a: sliders + flow
  const lx = 4, ly = 22;
  L.text(pa, lx + 14, ly, '**λ**', { size: 8.5, color: K.lam, anchor: 'middle', valign: 'top' });
  ['*Re*', '*Rm*', '*μ*_{r}'].forEach((n, i) => {
    const pos = [0.62, 0.35, 0.78][i], xx = lx + 4 + i * 10, y0 = ly + 20, y1 = ly + 82;
    L.line(pa, [xx, y0], [xx, y1], { stroke: '#cfcfcf', width: 1.8, cap: 'round' });
    L.line(pa, [xx, y1], [xx, y1 - (y1 - y0) * pos], { stroke: K.lam, width: 1.8, cap: 'round' });
    L.circle(pa, xx, y1 - (y1 - y0) * pos, 2.3, { fill: '#ffffff', stroke: K.lam, width: 0.7 });
    L.text(pa, xx, y1 + 7, n, { size: 5.6, anchor: 'middle', valign: 'top', color: K.ink });
  });
  const fl = latentFlow(F, L, pa, { x: 70, y: yA - 48, w: 92, h: 96 }, D, { dens: 12 });
  const vx = fl.X(0.5), vy = 19;
  L.text(pa, vx, vy, '*v*_{θ}(**z**, *t*, {#009E73|**λ**})', { size: 6, anchor: 'middle', valign: 'middle', color: K.z });
  L.arrow(pa, [lx + 21, ly + 4.5], [vx - 23, vy], { stroke: K.lam, width: 0.7, head: 2.6, headWidth: 1.7 });

  // b: tokens, attention, query, maps
  const tx = 6, ts = 6.2, tok = [];
  for (let i = 0; i < 5; i++) { const yy = yA - 22 + i * 9; L.rect(pb, tx, yy, ts, ts, { r: 0.8, fill: L.shade(K.z, 0.35 + 0.1 * (i % 3)), stroke: K.z, width: 0.4 }); tok.push([tx + ts, yy + ts / 2]); }
  L.text(pb, tx + ts / 2, yA - 26, '**z**_{1}', { size: 6, anchor: 'middle', color: K.z });
  const bx = 20, bw = 36, by = yA - 16, bh = 32;
  L.rect(pb, bx, by, bw, bh, { r: 3, fill: '#f1eef7', stroke: K.z, width: 0.5 });
  L.text(pb, bx + bw / 2, by + bh / 2, 'Attention\ncroisée', { size: 5.6, anchor: 'middle', valign: 'middle', color: K.ink, lineGap: 1.15 });
  const w8 = [0.25, 0.6, 1, 0.45, 0.15];
  tok.forEach(([x, y], i) => L.line(pb, [x + 0.3, y], [bx, by + 6 + i * 5], { stroke: K.z, width: 0.25 + 0.75 * w8[i], opacity: 0.35 + 0.6 * w8[i] }));
  const qx = bx + 7, qy = by + bh + 10, qs = 20;
  L.rect(pb, qx, qy, qs, qs, { fill: '#f4f4f4', stroke: '#8a8a8a', width: 0.4 });
  L.circle(pb, qx + qs * 0.62, qy + qs * 0.38, 1.4, { fill: K.ink, stroke: 'none' });
  L.text(pb, qx + qs * 0.62 + 2.5, qy + qs * 0.38 + 1, '*x*', { size: 6, valign: 'middle', color: K.ink });
  L.arrow(pb, [qx + qs * 0.62, qy + qs * 0.38 - 2], [qx + qs * 0.62, by + bh + 0.6], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  const ms = 44, lv = [-0.9, -0.5, -0.1, 0.3, 0.7];
  const x1 = bx + bw + 22, x2 = x1 + ms + 22, x3 = x2 + ms + 26, x4 = x3 + ms + 22, my = yA - ms / 2;
  L.arrow(pb, [bx + bw + 0.5, yA], [x1 - 1, yA], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
  L.text(pb, (bx + bw + x1) / 2, yA - 4, '**A**_{u}', { size: 5.6, anchor: 'middle', color: K.u });
  potentialMap(L, pb, x1, my, ms, D.pot.psi, D.pot.cpsi, 'u', { levels: lv });
  fieldLines(L, pb, x2, my, ms, D.pot.cpsi, 'u', { levels: lv });
  potentialMap(L, pb, x3, my, ms, D.pot.a, D.pot.ca, 'B', { levels: lv });
  fieldLines(L, pb, x4, my, ms, D.pot.ca, 'B', { levels: lv });
  for (const [xa, xb2] of [[x1 + ms, x2], [x3 + ms, x4]]) {
    L.arrow(pb, [xa + 1.5, yA], [xb2 - 1.5, yA], { stroke: K.ink, width: 0.5, head: 2.4, headWidth: 1.5 });
    L.text(pb, (xa + xb2) / 2, yA - 3.5, '∇×', { size: 6, anchor: 'middle', color: K.ink });
  }
  L.text(pb, x1 + ms / 2, my - 4, '*ψ*', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, x2 + ms / 2, my - 4, '**u**', { size: 6.5, anchor: 'middle', color: K.u });
  L.text(pb, x3 + ms / 2, my - 4, '*a*', { size: 6.5, anchor: 'middle', color: K.B });
  L.text(pb, x4 + ms / 2, my - 4, '**B**', { size: 6.5, anchor: 'middle', color: K.B });
  L.text(pb, (x2 + x4 + ms) / 2, my + ms + 10, '∇·**u** = ∇·**B** = 0', { size: 6, anchor: 'middle', color: K.ink });

  // c: VKS hero
  vks(F, L, pc, 52, 74, 34, D, { elev: 20, clipR: 2.2 });
  L.callout(pc, L.toLocal(F, pc, F.at('vks.imp')), [130, 26], 'Turbines\ncontrarotatives', { anchor: 'start', size: 5.6 });

  // d: law
  const lh = lawHist(F, L, pd, { x: 8, y: 30, w: 84, h: 62 }, D);
  L.text(pd, lh.xe, 22, '*E*[*ε*] = *E*[*P*]', { size: 6, anchor: 'middle', color: K.ink });
  L.text(pd, 70, 64, '*q*_{θ}', { size: 5.8, color: K.mid });
  miniDiff(L, pd, 116, 34, 34, 20, D, 'law'); check(L, pd, 146, 30, 5, K.ink);
  miniDiff(L, pd, 116, 84, 34, 20, D, 'sample'); cross(L, pd, 146, 80, 5, K.ink);
  L.text(pd, 133, 63, 'en loi', { size: 5.6, anchor: 'middle' });
  L.text(pd, 133, 113, 'par échantillon', { size: 5.6, anchor: 'middle' });
  L.text(pd, 133, 124, '*P* − *ε*', { size: 5.6, anchor: 'middle' });

  // e: uses in a row
  modesGlyph(L, pe, 6, 40, 14, D); L.text(pe, 6, 72, 'Modèles\nréduits', { size: 5.6, lineGap: 1.15 });
  assimGlyph(L, pe, 62, 36, 50, 22, D); L.text(pe, 62, 72, 'Assimilation\nde données', { size: 5.6, lineGap: 1.15 });
  riceGlyph(L, pe, 124, 36, 50, 22, D); L.text(pe, 124, 72, 'Renversements\n(Rice)', { size: 5.6, lineGap: 1.15 });

  // chips inside the panels
  chip(L, pa, 70, 128, 120, 'C3', 'symétrie : équivariance');
  chip(L, pb, x2, 128, 120, 'C1', 'divergence nulle : exacte');
  chip(L, pd, 8, 118, 96, 'C4', 'énergie : en loi');
  chip(L, pc, 6, 122, 90, null, 'stage : 3 modes, MHD 2D', { dash: '1.6 1.2', fill: '#f6f6f6' });

  // flow arrows: a -> b, b -> c (wrap), d <- c, e <- d
  const ba = (p0, p1) => L.blockArrow(R0, p0, p1, { width: 4.5, head: 4.5, headWidth: 8.5, fill: '#d6d6d6' });
  ba([mm(72.3), mm(1) + yA], [mm(75.2), mm(1) + yA]);
  L.path(R0, `M${mm(176)},${mm(1) + yA + 26} L${mm(176)},${mm(51.6)} L${mm(30)},${mm(51.6)} L${mm(30)},${mm(55.5)}`, { stroke: '#bdbdbd', width: 1.6, fill: 'none' });
  L.chevron(R0, [mm(30), mm(56.5)], [0, 1], { len: 3, spread: 0.7, stroke: '#bdbdbd', width: 1.6 });
  ba([mm(60.6), mm(53) + 74], [mm(63.4), mm(53) + 74]);
  ba([mm(118.6), mm(53) + 60], [mm(121.4), mm(53) + 60]);
}
