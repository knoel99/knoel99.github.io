// Figure « taxonomie » : classes de contraintes C1–C4 et mécanisme adapté (a) ; piège de C4 (b).
// Hero: none, taxonomie et lois de probabilité (route flat : cases, vignettes géométriques, petits graphes qualitatifs).
export const figure = { width: 183, height: 80, name: 'taxonomie', format: 'journal', illustrate: false };

export default async function draw(F, L) {
  const m = L.mm;
  const D = await (await fetch('/figure/data/densities.json')).json();

  // ---- colour key ----------------------------------------------------------------------------------
  const BLUE = '#0072B2', BLUE_TXT = '#0067A3', BLUE_T = '#E9F2F9';
  const OR = '#E69F00', OR_TXT = '#A86A00', OR_T = '#FDF3E2', OR_D = '#C98A00';
  const INK = '#2b2b2b', TXT = '#1a1a1a', SUB = '#4d4d4d', GREY = '#8a8a8a', LG = '#cfcfcf';
  const DOT = '#4a4a4a', LAWFILL = '#E4E4E4', FRAME = '#F6F6F6', FRAMEST = '#D4D4D4';
  const T = { head: 7.5, label: 7, small: 6.5 };
  const dot = (p, x, y, r = m(0.62), fill = DOT) => L.circle(p, x, y, r, { fill, stroke: 'none' });
  const ring = (p, x, y, r = m(0.7), stroke = GREY) => L.circle(p, x, y, r, { fill: '#fff', stroke, width: 0.6 });
  const tri = (p, x, y, s, fill) => L.polygon(p, [[x, y], [x - s * 0.62, y + s], [x + s * 0.62, y + s]], { fill, stroke: 'none' });

  // =====================================================================================================
  // panel a : la grille C1–C4
  // =====================================================================================================
  const a = F.panel('a', { x: 0, y: 0, w: 112, h: 80 });
  const colX = [2, 29.5, 57, 84.5].map(m), colW = m(25.5);
  const groups = [
    { x0: colX[0], x1: colX[1] + colW, col: BLUE, txt: BLUE_TXT, s: 'Vraie pour chaque échantillon' },
    { x0: colX[2], x1: colX[3] + colW, col: OR, txt: OR_TXT, s: 'Vraie pour la loi' },
  ];
  for (const g of groups) {
    L.text(a, (g.x0 + g.x1) / 2, m(4.6), g.s, { size: T.head, weight: 'bold', anchor: 'middle', valign: 'middle', color: g.txt });
    L.line(a, [g.x0, m(7)], [g.x1, m(7)], { stroke: g.col, width: 1.0, cap: 'butt' });
  }
  const classes = [
    // join : « ou » = deux mécanismes possibles ; « et » (C3) = deux conditions qui vont ensemble (Prop. 4)
    { id: 'C1', name: 'Locale\nlinéaire', g: 0, form: '*A***x** = 0', ex: ['∇·**u** = 0,  ∇·**B** = 0', 'Conditions aux limites', 'linéaires homogènes'],
      mech: ['Potentiels\n**B** = ∇×**A**', 'Projection\nde Leray'], join: 'ou' },
    { id: 'C2', name: 'Locale non\nlinéaire', g: 0, form: '*c*(**x**) = 0', ex: ['Résidu d\'EDP', 'stationnaire'],
      mech: ['Projection\nnon linéaire', 'Pénalité,\nguidage'], join: 'ou' },
    { id: 'C3', name: 'Symétrie', g: 1, form: '*g*_#μ = μ', ex: ['**B** ↦ −**B**', 'Rotation *R*_π (VKS)'],
      mech: ['*v*_θ équivariant', 'Loi de base\ninvariante'], join: 'et' },
    { id: 'C4', name: 'Statistique\nen loi', g: 1, form: '𝔼_μ[ℒφ] = 0', ex: ['Bilan d\'énergie', '𝔼[ε] = 𝔼[*P*]'],
      mech: ['Perte de\nstationnarité', 'Inclinaison\nexponentielle'], join: 'ou' },
  ];
  const fy0 = m(16.3), fh = m(24);        // vignette frame
  const glyphs = [];
  classes.forEach((c, i) => {
    const x = colX[i], G = groups[c.g];
    // badge + name
    L.rect(a, x, m(9.6), m(7), m(4.8), { r: m(1.1), fill: G.col, stroke: 'none' });
    L.text(a, x + m(3.5), m(12), c.id, { size: T.head, weight: 'bold', anchor: 'middle', valign: 'middle', color: '#fff' });
    L.text(a, x + m(8.6), m(12), c.name, { size: T.label, weight: 'bold', valign: 'middle', color: TXT, lineGap: 1.1 });
    // vignette frame
    L.rect(a, x, fy0, colW, fh, { r: m(1.4), fill: FRAME, stroke: FRAMEST, width: 0.4 });
    const g = L.group(a, { x, y: fy0 });
    glyphs.push(g);
    // form, examples
    L.text(a, x + colW / 2, m(44.2), c.form, { size: T.head, anchor: 'middle', valign: 'middle', color: TXT });
    c.ex.forEach((s, j) => L.text(a, x + colW / 2, m(48.3 + 2.7 * j), s, { size: T.small, anchor: 'middle', valign: 'middle', color: SUB }));
    // mechanism box
    const by = m(59.2), bh = m(19.3);
    L.rect(a, x, by, colW, bh, { r: m(1.2), fill: G.col === BLUE ? BLUE_T : OR_T, stroke: G.col, width: 0.6 });
    {
      const jt = L.text(a, x + colW / 2, by + bh / 2, c.join, { size: T.small, anchor: 'middle', valign: 'middle', color: G.txt, italic: true });
      const jb = jt.getBBox();
      L.line(a, [x + m(3), by + bh / 2], [jb.x - m(1.2), by + bh / 2], { stroke: G.col, width: 0.35, opacity: 0.6 });
      L.line(a, [jb.x + jb.width + m(1.2), by + bh / 2], [x + colW - m(3), by + bh / 2], { stroke: G.col, width: 0.35, opacity: 0.6 });
    }
    L.text(a, x + colW / 2, by + bh * 0.25, c.mech[0], { size: T.label, anchor: 'middle', valign: 'middle', color: TXT, lineGap: 1.12 });
    L.text(a, x + colW / 2, by + bh * 0.75, c.mech[1], { size: T.label, anchor: 'middle', valign: 'middle', color: TXT, lineGap: 1.12 });
  });
  // row header for the mechanisms
  {
    const y = m(56.4), s = 'Mécanisme adapté';
    const t = L.text(a, m(56), y, s, { size: T.small, anchor: 'middle', valign: 'middle', color: GREY, italic: true });
    const b = t.getBBox();
    L.line(a, [colX[0], y], [b.x - m(1.5), y], { stroke: LG, width: 0.4 });
    L.line(a, [b.x + b.width + m(1.5), y], [colX[3] + colW, y], { stroke: LG, width: 0.4 });
  }

  const W = colW, H = fh;
  // ---- C1 : sous-espace S = ker A, projection orthogonale P ----------------------------------------
  {
    const g = glyphs[0];
    const A0 = [m(2.6), m(19.6)], A1 = [m(23), m(6.4)];
    const P = (t) => [A0[0] + (A1[0] - A0[0]) * t, A0[1] + (A1[1] - A0[1]) * t];
    const ux = (A1[0] - A0[0]), uy = (A1[1] - A0[1]), un = Math.hypot(ux, uy), nx = uy / un, ny = -ux / un; // normal (up-left)
    L.line(g, A0, A1, { stroke: BLUE, width: 1.1, cap: 'round' });
    for (const t of [0.1, 0.27, 0.6, 0.76, 0.92]) dot(g, ...P(t));
    const foot = P(0.43);
    const src = [foot[0] + nx * m(6.2) * -1, foot[1] + ny * m(6.2) * -1];
    // right-angle mark
    const k = m(1.1), ex = [ux / un, uy / un], nn = [-nx, -ny];
    L.polyline(g, [[foot[0] + ex[0] * k, foot[1] + ex[1] * k], [foot[0] + ex[0] * k + nn[0] * k, foot[1] + ex[1] * k + nn[1] * k], [foot[0] + nn[0] * k, foot[1] + nn[1] * k]], { stroke: BLUE, width: 0.4, fill: 'none' });
    L.arrow(g, src, foot, { stroke: BLUE, width: 0.6, dash: '1.4 0.9', head: 2.6, gap0: m(0.8), gap1: m(0.75) });
    ring(g, ...src, m(0.7), GREY);
    dot(g, ...foot, m(0.62), BLUE);
    L.text(g, (src[0] + foot[0]) / 2 + m(1.6), (src[1] + foot[1]) / 2 - m(0.6), '*P*', { size: T.label, color: BLUE_TXT, valign: 'middle' });
  }
  // ---- C2 : variété c(x) = 0, écart de Jensen ------------------------------------------------------
  {
    const g = glyphs[1];
    const arc = (u) => [m(2.4) + u * m(20.8), m(19.8) - m(15.5) * Math.sin(Math.PI * (0.08 + 0.84 * u)) ];
    const pts = []; for (let i = 0; i <= 40; i++) pts.push(arc(i / 40));
    L.path(g, L.smooth(pts, false), { stroke: BLUE, width: 1.1, fill: 'none', cap: 'round' });
    const ua = 0.1, ub = 0.86, pa = arc(ua), pb = arc(ub);
    for (const u of [0.3, 0.7]) dot(g, ...arc(u));
    L.line(g, pa, pb, { stroke: GREY, width: 0.5, dash: '1.2 0.8' });
    dot(g, ...pa); dot(g, ...pb);
    const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
    // point of the arc above the midpoint (same x)
    let best = 0, bd = 1e9; for (let i = 0; i <= 400; i++) { const q = arc(i / 400); const d = Math.abs(q[0] - mid[0]); if (d < bd) { bd = d; best = q; } }
    L.line(g, [mid[0], mid[1] - m(0.9)], [best[0], best[1] + m(0.9)], { stroke: BLUE, width: 0.5 });
    L.line(g, [mid[0] - m(0.7), best[1] + m(0.9)], [mid[0] + m(0.7), best[1] + m(0.9)], { stroke: BLUE, width: 0.5 });
    ring(g, ...mid, m(0.7), GREY);
    L.text(g, mid[0], m(21.3), 'écart de Jensen', { size: T.small, anchor: 'middle', valign: 'middle', color: BLUE_TXT, italic: true });
  }
  // ---- C3 : loi symétrique (deux nuages miroirs), échantillons non symétriques --------------------
  {
    const g = glyphs[2], cx = W / 2;
    const blob = (sx) => {
      const pts = [];
      for (let i = 0; i < 48; i++) {
        const th = (i / 48) * 2 * Math.PI;
        const r = 1 + 0.18 * Math.cos(th - 0.6) + 0.07 * Math.cos(2 * th + 0.4);
        const ex = m(4.3) * r * Math.cos(th), ey = m(6.3) * r * Math.sin(th);
        const rot = 0.38, X = ex * Math.cos(rot) - ey * Math.sin(rot), Y = ex * Math.sin(rot) + ey * Math.cos(rot);
        pts.push([cx + sx * (m(5.6) + X), m(14.2) + Y]);
      }
      return pts;
    };
    for (const sx of [-1, 1]) L.path(g, L.smooth(blob(sx), true), { fill: LAWFILL, stroke: '#a8a8a8', width: 0.45 });
    L.line(g, [cx, m(5.6)], [cx, m(23.2)], { stroke: OR, width: 0.7, dash: '1.6 1' });
    for (const [x, y] of [[5.2, 1.0], [7.4, -3.6], [4.3, 4.2], [8.1, 2.6]]) dot(g, cx + m(x), m(14.2) + m(y));
    for (const [x, y] of [[-6.6, -1.4], [-4.0, 2.4], [-7.2, 4.6]]) dot(g, cx + m(x), m(14.2) + m(y));
    L.arrow(g, [cx - m(5.4), m(5.4)], [cx + m(5.4), m(5.4)], { bend: 0.22, both: true, stroke: OR, width: 0.7, head: 2.6 });
    L.text(g, cx, m(2.6), '*g*', { size: T.label, anchor: 'middle', valign: 'middle', color: OR_TXT });
  }
  // ---- C4 : loi de dE/dt, moyenne nulle -------------------------------------------------------------
  {
    const g = glyphs[3];
    const X = (v) => m(2.6) + (v + 3.2) / 6.4 * m(20.3), base = m(17.6), Y = (d) => base - d * m(27);
    const pts = D.x.map((v, i) => [X(v), Y(D.mu[i])]);
    L.polygon(g, [[X(-3.2), base], ...pts, [X(3.2), base]], { fill: LAWFILL, stroke: 'none' });
    L.polyline(g, pts, { stroke: INK, width: 0.6, fill: 'none' });
    L.line(g, [X(0), base], [X(0), m(3.2)], { stroke: GREY, width: 0.4, dash: '1 0.8' });
    L.line(g, [X(-3.2), base], [X(3.2), base], { stroke: INK, width: 0.5, cap: 'butt' });
    tri(g, X(0), base, m(1.5), OR);
    L.text(g, X(3.2), m(21.2), 'd*E*/d*t*', { size: T.small, anchor: 'end', valign: 'middle', color: SUB });
    L.text(g, X(0), m(21.2), '0', { size: T.small, anchor: 'middle', valign: 'middle', color: SUB });
  }

  // =====================================================================================================
  // panel b : C4, trois lois de dE/dt sur les mêmes axes
  // =====================================================================================================
  const b = F.panel('b', { x: 117, y: 0, w: 66, h: 80 });
  L.text(b, m(5), m(2.9), 'Bilan d\'énergie (C4)', { size: T.head, weight: 'bold', valign: 'middle', color: TXT });
  L.text(b, m(65.5), m(2.9), 'Allures illustratives', { size: T.small, anchor: 'end', valign: 'middle', color: GREY, italic: true });
  const px = [1.5, 23.75, 46].map(m), pw = m(19.5);
  const base = m(44), ytop = m(15.5), ys = m(45 - 17) / 0.5;      // 0.5 density units = 28 mm
  const titles = [
    { s: 'Loi vraie', c: TXT }, { s: 'Projection par\néchantillon', c: BLUE_TXT }, { s: 'Correction\nen loi', c: OR_TXT },
  ];
  const Xs = (k) => (v) => px[k] + (v + 3.2) / 6.4 * pw;
  const curve = (k, arr) => D.x.map((v, i) => [Xs(k)(v), base - arr[i] * ys]);
  const area = (k, arr) => [[Xs(k)(-3.2), base], ...curve(k, arr), [Xs(k)(3.2), base]];
  for (let k = 0; k < 3; k++) {
    const X = Xs(k), cx = px[k] + pw / 2;
    L.text(b, cx, m(12.6), titles[k].s, { size: T.label, weight: 'bold', anchor: 'middle', valign: 'bottom', color: titles[k].c, lineGap: 1.1 });
    // zero line
    L.line(b, [X(0), base], [X(0), ytop], { stroke: GREY, width: 0.4, dash: '1 0.8' });
    if (k === 0) {
      L.polygon(b, area(0, D.mu), { fill: LAWFILL, stroke: 'none' });
      L.polyline(b, curve(0, D.mu), { stroke: INK, width: 0.8, fill: 'none' });
    } else {
      // q_theta : modèle avant correction (gris pâle, pointillé)
      L.polygon(b, area(k, D.q), { fill: '#EFEFEF', stroke: 'none' });
      L.polyline(b, curve(k, D.q), { stroke: '#9a9a9a', width: 0.6, dash: '1.6 1', fill: 'none' });
    }
    if (k === 2) {
      L.polygon(b, area(2, D.nu), { fill: OR, fillOpacity: 0.45, stroke: 'none' });
      L.polyline(b, curve(2, D.nu), { stroke: OR_D, width: 0.9, fill: 'none' });
    }
    if (k > 0) L.polyline(b, curve(k, D.mu), { stroke: INK, width: 0.45, dash: '0.5 0.7', fill: 'none' });
    if (k === 1) {
      // Dirac en 0 : flèche verticale (notation de delta)
      L.arrow(b, [X(0), base], [X(0), m(14.6)], { stroke: BLUE, width: 1.3, head: 3.4 });
    }
    // axis
    L.line(b, [px[k], base], [px[k] + pw, base], { stroke: INK, width: 0.5, cap: 'butt' });
    // means
    if (k > 0) tri(b, X(D.q_mean), base + m(0.2), m(1.5), '#a6a6a6');
    tri(b, X(0), base + m(0.2), m(1.5), k === 0 ? INK : k === 1 ? BLUE : OR);
    L.text(b, X(0), m(48.3), '0', { size: T.small, anchor: 'middle', valign: 'middle', color: SUB });
    if (k === 0) L.text(b, px[k] + pw, m(48.3), 'd*E*/d*t*', { size: T.small, anchor: 'end', valign: 'middle', color: SUB });
  }
  // direct labels
  L.text(b, Xs(0)(-1.55), base - 0.29 * ys, 'μ', { size: T.label, anchor: 'end', valign: 'middle', color: INK });
  L.text(b, Xs(0)(0) - m(1.5), base + m(1.75), 'moyenne', { size: T.small, anchor: 'end', valign: 'middle', color: SUB });
  for (const k of [1, 2]) L.text(b, Xs(k)(-1.6), base - 0.2 * ys, 'μ', { size: T.label, anchor: 'end', valign: 'middle', color: INK });
  L.text(b, Xs(1)(1.95), base - 0.22 * ys, '*q*_θ', { size: T.label, anchor: 'start', valign: 'middle', color: '#7a7a7a' });
  L.text(b, Xs(2)(1.95), base - 0.22 * ys, '*q*_θ', { size: T.label, anchor: 'start', valign: 'middle', color: '#7a7a7a' });
  L.text(b, Xs(1)(0) - m(1.2), m(17.2), 'Dirac en 0', { size: T.small, anchor: 'end', valign: 'middle', color: BLUE_TXT });

  // ---- sample rows : lois empiriques (masses de Dirac pondérées), mêmes axes que les densités ---------
  const sb = m(60.2), h0 = m(2.6), N = D.samples_mu.length;      // h0 = hauteur d'un poids uniforme 1/N
  const stem = (x, h, col, edge) => { L.line(b, [x, sb], [x, sb - h], { stroke: edge, width: 0.6, cap: 'butt' }); L.circle(b, x, sb - h, m(0.42), { fill: col, stroke: edge, width: 0.35 }); };
  for (const k of [0, 2]) L.line(b, [px[k] + m(1), sb], [px[k] + pw - m(1), sb], { stroke: GREY, width: 0.4, cap: 'butt' });
  for (const v of D.samples_mu) stem(Xs(0)(v), h0, DOT, DOT);
  L.text(b, px[0] + pw / 2, m(63.3), 'Échantillons', { size: T.small, anchor: 'middle', valign: 'middle', color: SUB });
  // projection : chaque échantillon envoyé sur 0
  {
    const X = Xs(1), tgt = [X(0), sb];
    // anneaux décalés en hauteur un sur deux : les quantiles centraux ne sont qu'à 0,95 mm l'un de l'autre
    D.samples_q.forEach((v, i) => {
      const s = [X(v), m(i % 2 ? 51.2 : 52.4)];
      L.line(b, s, [tgt[0] + (s[0] - tgt[0]) * 0.14, tgt[1] + (s[1] - tgt[1]) * 0.14], { stroke: BLUE, width: 0.4, opacity: 0.85 });
      ring(b, ...s, m(0.45), '#8a8a8a');
    });
    dot(b, ...tgt, m(1.0), BLUE);
  }
  // inclinaison exponentielle : mêmes échantillons, poids w_i
  {
    const X = Xs(2);
    D.samples_q.forEach((v, i) => stem(X(v), h0 * N * D.weights[i], OR, OR_D));
    L.text(b, px[2] + pw / 2, m(63.3), 'Poids *w*_i', { size: T.small, anchor: 'middle', valign: 'middle', color: OR_TXT });
  }
  // verdicts
  const verdict = ['𝔼 = 0,  Var > 0', '𝔼 = 0,  Var = 0', '𝔼 = 0,  Var > 0'];
  for (let k = 0; k < 3; k++) {
    const cx = px[k] + pw / 2;
    L.rect(b, px[k] + m(1), m(68.8), pw - m(2), m(6), { r: m(3), fill: k === 0 ? '#F2F2F2' : k === 1 ? BLUE_T : OR_T, stroke: k === 0 ? LG : k === 1 ? BLUE : OR, width: 0.5 });
    L.text(b, cx, m(71.8), verdict[k], { size: T.small, anchor: 'middle', valign: 'middle', color: TXT });
  }

  // ---- zoom from the C4 vignette to panel b --------------------------------------------------------
  const r0 = F.panels[0], r1 = b;
  const src = { x: colX[3], y: fy0, w: colW, h: fh };
  const dst = { x: r1.x - r0.x + px[0], y: ytop, w: pw, h: base - ytop };
  L.zoomLines(a, src, dst, { stroke: '#9a9a9a', width: 0.45, dash: '1.4 1', box: false });
}
