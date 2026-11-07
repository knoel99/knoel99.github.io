// Hero: l'escalier des cinq bancs d'essai ; vignettes VKS, DRESDYN et boîte périodique en vector 3D (L.cylinder3, L.circle3, L.obliqueBox), illustrated finish ; vignettes 0 et 1 calculées (make_data.py)
export const figure = { width: 183, height: 120, name: 'plan-these', format: 'journal', illustrate: true };

// ---------------------------------------------------------------------------------------------------
// Palette : bancs, frise, outils en gris neutres ; couleur réservée aux trois axes (clé des figures sœurs
// « taxonomie » et « cadre » : bleu = par échantillon, orange = en loi, vert = paramètre de contrôle / seuil).
const C = {
  ink: '#2b2b2b', txt: '#1a1a1a', sub: '#555555', grey: '#8a8a8a', lg: '#cfcfcf',
  step: '#EEEEEE', stepEdge: '#BDBDBD', tread: '#8c8c8c', badge: '#4d4d4d',
  glass: '#EDF1F4', glassEdge: '#7f8b96', iron: '#5d646c', ironEdge: '#3b4148', metal: '#C9CED4',
  a1: '#0072B2', a1t: '#005E92', a1l: '#E6EFF8',
  a2: '#E69F00', a2t: '#8A5A00', a2l: '#FCF0D9',
  a3: '#009E73', a3t: '#006E4F', a3l: '#E0F2EA',
};
const AX = [
  { c: C.a1, t: C.a1t, l: C.a1l },
  { c: C.a2, t: C.a2t, l: C.a2l },
  { c: C.a3, t: C.a3t, l: C.a3l },
];

// Mise en page (mm)
const X0 = 25, CW = 26, NT = 5, XR = X0 + NT * CW;           // colonnes des paliers : 25 → 155
const colX = (k) => X0 + k * CW, colC = (k) => X0 + (k + 0.5) * CW;
const YB = 50, tread = (k) => 44 - 3.6 * k;                 // bas de l'escalier, dessus de chaque marche
const IH = 17;                                               // hauteur des vignettes
const BAND_Y = [53, 65, 77], BAND_H = 10;                    // bandes des axes
const XT0 = X0, XT1 = XR, mo = (k) => XT0 + k * (XT1 - XT0) / 36;   // frise : mois → mm
const RX = 158, RW = 24;                                     // colonne de droite

// petits outils 3D
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (...v) => v.reduce((s, a) => [s[0] + a[0], s[1] + a[1], s[2] + a[2]], [0, 0, 0]);
const sc3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a) => sc3(a, 1 / Math.hypot(...a));

function orthoProj(L, az, el, origin) {
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  const V = [Math.sin(a) * Math.cos(e), -Math.cos(a) * Math.cos(e), Math.sin(e)];   // vers l'observateur
  const R = [Math.cos(a), Math.sin(a), 0], U = cross3(V, R);
  return L.obliqueProj({ x: [R[0], -U[0]], y: [R[1], -U[1]], z: [R[2], -U[2]], origin, view: V });
}

// flèche de rotation : arc de cercle 3D (centre c, axe, rayon r, de phi0 à phi1) avec une pointe pleine
function rotArrow(L, p, P, c, axis, r, phi0, phi1, { stroke = '#3d3d3d', width = 0.55, head = 2.3 } = {}) {
  const a = unit3(axis), t = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = unit3(sub3(t, sc3(a, dot3(t, a)))), e2 = cross3(a, e1);
  const pts = [];
  for (let i = 0; i <= 48; i++) { const f = phi0 + (phi1 - phi0) * i / 48; pts.push(P(...add3(c, sc3(e1, r * Math.cos(f)), sc3(e2, r * Math.sin(f))))); }
  const q = pts[48], q0 = pts[45], d = [q[0] - q0[0], q[1] - q0[1]], n = Math.hypot(...d) || 1, u = [d[0] / n, d[1] / n];
  const base = [q[0] - u[0] * head, q[1] - u[1] * head];
  L.polyline(p, pts.slice(0, 46).concat([base]), { stroke, width, fill: 'none', cap: 'round' });
  L.polygon(p, [q, [base[0] - u[1] * head * 0.45, base[1] + u[0] * head * 0.45], [base[0] + u[1] * head * 0.45, base[1] - u[0] * head * 0.45]], { fill: stroke, stroke: 'none' });
}

// glyphe « version du code » : carré arrondi gris foncé à trois lignes blanches
function codeGlyph(L, p, cx, cy, s) {
  L.rect(p, cx - s / 2, cy - s / 2, s, s, { r: s * 0.18, fill: '#4a4a4a', stroke: 'none' });
  for (const [k, f] of [[-0.22, 0.55], [0, 0.4], [0.22, 0.5]]) L.line(p, [cx - s * 0.3, cy + k * s], [cx - s * 0.3 + f * s, cy + k * s], { stroke: '#ffffff', width: Math.max(0.35, s * 0.07), cap: 'round' });
}
function diamond(L, p, cx, cy, s, fill) {
  L.polygon(p, [[cx, cy - s / 2], [cx + s / 2, cy], [cx, cy + s / 2], [cx - s / 2, cy]], { fill, stroke: '#ffffff', width: 0.4 });
}
function badge(L, p, cx, cy, r, k, size = 7) {
  L.circle(p, cx, cy, r, { fill: C.badge, stroke: 'none' });
  L.text(p, cx, cy, String(k), { size, weight: 'bold', color: '#ffffff', anchor: 'middle', valign: 'middle' });
}
// pastille de texte (station d'un axe) : largeur mesurée sur le texte
function pill(L, p, cx, cy, str, ax, { size = 6.5, h = 4.6, padX = 1.5 } = {}) {
  const m = L.mm;
  const g = L.group(p, {}).node;
  const bg = L.rect(g, 0, 0, 1, 1, { r: m(h / 2), fill: '#ffffff', stroke: ax.c, width: 0.6 });
  const t = L.text(g, cx, cy, str, { size, anchor: 'middle', valign: 'middle', color: ax.t });
  let w;
  try { w = t.getBBox().width; } catch (e) { w = str.length * size * 0.5; }
  const W = w + m(2 * padX), H = m(h);
  bg.setAttribute('x', cx - W / 2); bg.setAttribute('y', cy - H / 2); bg.setAttribute('width', W); bg.setAttribute('height', H);
  return { w: W, h: H };
}

export default async function draw(F, L) {
  const m = L.mm;
  const D = await (await fetch('/figure/data/plan_data.json')).json();
  const P = F.panel('', { x: 0, y: 0, w: 183, h: 120 });

  // =================================================================================================
  // 1. Escalier des paliers
  // =================================================================================================
  const stair = [[m(X0), m(YB)]];
  for (let k = 0; k < NT; k++) { stair.push([m(colX(k)), m(tread(k))]); stair.push([m(colX(k + 1)), m(tread(k))]); }
  stair.push([m(XR), m(YB)]);
  const stepFill = L.linearGradient(P.node, [[0, '#F3F3F3'], [1, '#E3E3E3']], 90);
  L.polygon(P, stair, { fill: stepFill, stroke: C.stepEdge, width: 0.4, join: 'miter' });
  for (let k = 1; k < NT; k++) L.line(P, [m(colX(k)), m(tread(k - 1))], [m(colX(k)), m(YB)], { stroke: '#d4d4d4', width: 0.35 });
  for (let k = 0; k < NT; k++) {
    L.line(P, [m(colX(k)), m(tread(k))], [m(colX(k + 1)), m(tread(k))], { stroke: C.tread, width: 0.9 });
    badge(L, P, m(colX(k) + 2.9), m(tread(k) + 2.9), m(1.85), k);
  }
  // étiquettes E1–E3 (bancs déjà utilisés au stage)
  for (let k = 0; k < 3; k++) {
    const cx = m(colX(k) + CW - 4.2), cy = m(tread(k) + 2.9);
    L.rect(P, cx - m(2.6), cy - m(1.55), m(5.2), m(3.1), { r: m(1.55), fill: '#ffffff', stroke: '#9a9a9a', width: 0.4 });
    L.text(P, cx, cy, 'E' + (k + 1), { size: 5.5, anchor: 'middle', valign: 'middle', color: C.sub });
  }

  // noms des paliers
  const NAMES = [
    ['**Modèles réduits**', 'Gissinger, DQVU'],
    ['**MHD 2D**', 'périodique'],
    ['**Dynamos 3D**\n**périodiques**', 'ABC, Taylor–Green'],
    ['**VKS**', 'SFEMaNS, LATU'],
    ['**DRESDYN**', 'précession, HZDR'],
  ];
  for (let k = 0; k < NT; k++) {
    const top = tread(k) - IH - 0.9;
    L.text(P, m(colC(k)), m(top - 1.0), NAMES[k][1], { size: 6, anchor: 'middle', color: C.sub });
    const nl = NAMES[k][0].split('\n').length;
    L.text(P, m(colC(k)), m(top - 3.6 - 2.75 * (nl - 1)), NAMES[k][0], { size: 7, anchor: 'middle', color: C.txt, lineGap: 1.12 });
  }

  // ---- vignette 0 : série D(t) du modèle de Gissinger ----
  {
    const bx = colX(0) + 1.8, bw = CW - 3.6, by = tread(0) - IH + 1.5, bh = IH - 3.2;
    const g = L.group(P, {}).node;
    const y0 = m(by + bh / 2), X = (t) => m(bx + 1.6 + t * (bw - 3.2)), Y = (d) => y0 - d * m(bh / 2 - 0.4);
    L.line(g, [m(bx + 1.0), m(by)], [m(bx + 1.0), m(by + bh)], { stroke: '#7a7a7a', width: 0.4 });
    L.line(g, [m(bx + 1.0), y0], [m(bx + bw - 0.6), y0], { stroke: '#9a9a9a', width: 0.4, dash: '1.2 0.9' });
    L.polygon(g, [[m(bx + bw), y0], [m(bx + bw - 1.3), y0 - m(0.55)], [m(bx + bw - 1.3), y0 + m(0.55)]], { fill: '#7a7a7a', stroke: 'none' });
    const pts = D.gissinger.t.map((t, i) => [X(t), Y(D.gissinger.D[i])]);
    L.polyline(g, pts, { stroke: C.ink, width: 0.45, fill: 'none', join: 'round' });
    L.text(g, m(bx + 0.3), m(by - 0.3), '*D*', { size: 6, anchor: 'end', valign: 'top', italic: false });
    L.text(g, m(bx + bw - 0.2), y0 + m(2.4), '*t*', { size: 6, anchor: 'end', valign: 'middle' });
  }

  // ---- vignette 1 : MHD 2D (carte de j, isolignes de a), données E2 ----
  {
    const s = IH - 1.6, bx = colC(1) - s / 2, by = tread(1) - IH + 0.2;
    const rows = D.mhd2d.j.slice().reverse();
    L.pixelImage(P, m(bx), m(by), m(s), rows, { palette: ['#fbfbfb', '#d2d2d2', '#7b7b7b'], overlap: 0.6, skipBelow: 0 });
    const clip = L.clipPath(P.node, `M${m(bx)},${m(by)} h${m(s)} v${m(s)} h${-m(s)} Z`);
    const g = L.group(P, { clip }).node;
    for (const ln of D.mhd2d.a_lines) L.polyline(g, L.smooth ? ln.map(([u, v]) => [m(bx + u * s), m(by + (1 - v) * s)]) : [], { stroke: '#2f2f2f', width: 0.3, fill: 'none', opacity: 0.85 });
    L.rect(P, m(bx), m(by), m(s), m(s), { fill: 'none', stroke: '#6b6b6b', width: 0.45 });
  }

  // ---- vignette 2 : boîte périodique, |B| du mode dynamo ABC (E3) sur trois faces ----
  {
    const e = m(10.2);
    const P3 = L.obliqueProj({ preset: 'angles', angle: 32, depth: 0.55 });
    const box = L.obliqueBox(P, P3, [e, e, e], { at: [m(colC(2) - 0.6), m(tread(2) - IH / 2 - 0.6)], anchor: 'center', fill: '#ffffff', stroke: 'none' });
    const lerp = (v) => L.ramp(['#f8f8f8', '#c4c4c4', '#4a4a4a'], v);
    const N = 24, F_ = D.abc;
    const sample = (key, w) => {
      const f = w.map((c) => Math.min(31, Math.max(0, Math.floor(c / e * 32))));
      if (key === 'x1') return F_.x1[f[1]][f[2]];
      if (key === 'y0') return F_.y0[f[0]][f[2]];
      return F_.z1[f[0]][f[1]];
    };
    for (const key of ['y0', 'x1', 'z1']) {
      const M = box.faces[key];
      const d = 'M' + M.corners.map((q) => q.map((v) => v.toFixed(3)).join(',')).join(' L') + ' Z';
      const g = L.group(P, { clip: L.clipPath(P.node, d) }).node;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const u0 = i / N, v0 = j / N, du = 1 / N, ov = 0.35 / N;
        const val = sample(key, M.world(u0 + du / 2, v0 + du / 2));
        L.polygon(g, M.quad(u0 - ov, v0 - ov, u0 + du + ov, v0 + du + ov), { fill: lerp(val), stroke: 'none' });
      }
      L.polygon(P, M.corners, { fill: 'none', stroke: C.ink, width: 0.5, join: 'round' });
    }
    F.anchor('cube.x1', P.node, ...box.faces.x1.center);
  }

  // ---- vignette 3 : cuve VKS ----
  {
    const R = m(6.4), Lh = 1.27 * R, xi = 0.708 * Lh, Ri = 0.75 * R, hb = 0.2 * R;
    const PV = orthoProj(L, 24, 17, [m(colC(3) - 0.3), m(tread(3) - IH / 2 - 0.4)]);
    const g = L.group(P, {}).node;
    // corps de verre (fond), bord du fond éloigné
    L.cylinder3(g, PV, [-Lh, 0, 0], [Lh, 0, 0], R, R, { fill: C.glass, stroke: 'none', cap: false });
    L.circle3(g, PV, [-Lh, 0, 0], 'x', R, { stroke: '#b3bcc4', width: 0.35 });
    // arbres
    L.cylinder3(g, PV, [-Lh - m(2.4), 0, 0], [-xi, 0, 0], m(0.45), m(0.45), { fill: '#8b929a', stroke: C.ironEdge, width: 0.3 });
    const blades = (x0, dir) => {
      for (let i = 0; i < 8; i++) {
        const f = i * Math.PI / 4 + 0.2, c = Math.cos(f), s = Math.sin(f);
        const q = [[x0, 0.28 * Ri * c, 0.28 * Ri * s], [x0, Ri * c, Ri * s], [x0 + dir * hb, Ri * c, Ri * s], [x0 + dir * hb, 0.28 * Ri * c, 0.28 * Ri * s]];
        L.polygon(g, q.map((w) => PV(...w)), { fill: '#7b828a', stroke: C.ironEdge, width: 0.25, join: 'round' });
      }
    };
    // turbine gauche (dos vers l'observateur éloigné ; pales côté fluide, +x)
    L.circle3(g, PV, [-xi, 0, 0], 'x', Ri, { fill: C.iron, stroke: C.ironEdge, width: 0.4 });
    blades(-xi, 1);
    // turbine droite : pales côté fluide (−x), derrière le disque vu de l'observateur
    blades(xi, -1);
    L.circle3(g, PV, [xi, 0, 0], 'x', Ri, { fill: C.iron, stroke: C.ironEdge, width: 0.4 });
    L.cylinder3(g, PV, [xi, 0, 0], [Lh + m(2.4), 0, 0], m(0.45), m(0.45), { fill: '#8b929a', stroke: C.ironEdge, width: 0.3 });
    // verre : contour et bord avant
    L.cylinder3(g, PV, [-Lh, 0, 0], [Lh, 0, 0], R, R, { fill: 'none', capFill: 'none', stroke: C.glassEdge, width: 0.5 });
    // reflet
    const hl = [];
    for (let i = 0; i <= 20; i++) { const t = -0.82 + 1.64 * i / 20; hl.push(PV(t * Lh, -0.35 * R, 0.93 * R)); }
    L.polyline(g, hl, { stroke: '#ffffff', width: 0.9, opacity: 0.9, fill: 'none', cap: 'round' });
    // contrarotation
    rotArrow(L, g, PV, [-Lh - m(1.3), 0, 0], [1, 0, 0], m(2.0), 0.6, 0.6 + 4.6);
    rotArrow(L, g, PV, [Lh + m(1.3), 0, 0], [1, 0, 0], m(2.0), 0.6 + 4.6, 0.6);
  }

  // ---- vignette 4 : DRESDYN, cylindre en précession ----
  {
    const R = m(4.6), H = m(9.2), th = 58 * Math.PI / 180;
    const ax = [Math.sin(th), 0, Math.cos(th)];
    const PD = orthoProj(L, -28, 20, [m(colC(4) + 0.2), m(tread(4) - 3.9)]);
    const g = L.group(P, {}).node;
    const zc = m(7.0), c = [0, 0, zc];
    // plateau tournant
    L.cylinder3(g, PD, [0, 0, -m(1.1)], [0, 0, 0], m(8.6), m(8.6), { fill: '#d6d6d6', capFill: '#e6e6e6', stroke: '#6f6f6f', width: 0.4, shading: true });
    // axe de précession (bas)
    L.line3(g, PD, [0, 0, 0], [0, 0, zc], { stroke: '#7a7a7a', width: 0.45, dash: '1.4 1' });
    // montants (étrier) : celui de derrière, puis le cylindre, puis celui de devant
    const post = (y) => {
      L.cylinder3(g, PD, [0, y, 0], [0, y, zc], m(0.55), m(0.55), { fill: '#a9aeb4', stroke: '#555b61', width: 0.3, shading: true });
      L.cylinder3(g, PD, [0, y, zc], [0, y * 0.78, zc], m(0.5), m(0.5), { fill: '#a9aeb4', stroke: '#555b61', width: 0.3 });
    };
    const yP = R + m(1.4);
    const viewY = PD.view[1];
    post(viewY < 0 ? yP : -yP);
    const c0 = sub3(c, sc3(ax, H / 2)), c1 = add3(c, sc3(ax, H / 2));
    L.cylinder3(g, PD, c0, c1, R, R, { fill: C.metal, capFill: '#dde1e5', stroke: '#4a4f55', width: 0.5, shading: true });
    post(viewY < 0 ? -yP : yP);
    // axe de précession (haut)
    const zt = zc + H / 2 * Math.cos(th) + R * Math.sin(th) + m(0.6);
    L.line3(g, PD, [0, 0, zt], [0, 0, zc + m(11.4)], { stroke: '#7a7a7a', width: 0.45, dash: '1.4 1' });
    rotArrow(L, g, PD, [0, 0, zc + m(10.0)], [0, 0, 1], m(2.3), -2.2, -2.2 + 4.4);
    // rotation propre, au-delà du couvercle supérieur
    rotArrow(L, g, PD, add3(c1, sc3(ax, m(1.2))), ax, R * 0.55, 1.0, 1.0 + 4.5);
  }

  // complexité croissante : flèche diagonale au-dessus de l'escalier
  {
    const a = [m(27.5), m(14.6)], b = [m(96), m(2.6)];
    L.arrow(P, a, b, { stroke: '#8a8a8a', width: 0.5, head: 2.6 });
    L.text(P, m(28.5), m(18.0), 'complexité croissante', { size: 6, italic: true, color: C.sub, rotate: 0 });
  }
  // en-tête de ligne de l'escalier
  L.text(P, m(1.2), m(36.5), '**Bancs d\'essai**', { size: 7.5, color: C.txt });
  L.text(P, m(1.2), m(40.0), 'E1–E3 : stage M2', { size: 6, color: C.sub });

  // =================================================================================================
  // 2. Bandes des trois axes
  // =================================================================================================
  const HEAD = [
    ['Axe 1', 'Contraintes dures 3D'],
    ['Axe 2', 'Contraintes en loi\net symétries'],
    ['Axe 3', 'Seuil dynamo\net renversements'],
  ];
  const ST = [
    [null, 'potentiels ψ, *a*', '∇×**A**, jauge', 'vide, saut de *μ*', 'parois conductrices'],
    ['**B** → −**B**', '𝔼[*P* − ε] = 0', 'bilans d\'hélicité', 'symétrie *R*_{π}', 'centro-symétrie'],
    ['formule de Rice', null, 'borne près de *Rm*_{c}', 'renversements', '*Rm*_{c}(*Po*)'],
  ];
  // séparateurs de colonnes (grille)
  for (let k = 1; k < NT; k++) L.line(P, [m(colX(k)), m(BAND_Y[0] - 0.8)], [m(colX(k)), m(BAND_Y[2] + BAND_H + 0.8)], { stroke: '#d9d9d9', width: 0.35, dash: '1 1.2' });
  for (let i = 0; i < 3; i++) {
    const ax = AX[i], y0 = BAND_Y[i], y1 = y0 + BAND_H, ym = (y0 + y1) / 2;
    const segs = i === 0 ? [[colX(1) + 0.5, XR]] : i === 2 ? [[colX(0) + 0.5, colX(1) - 0.5], [colX(2) + 0.5, XR]] : [[colX(0) + 0.5, XR]];
    for (const [xa, xb] of segs) {
      const last = xb === XR;
      const pts = [[m(xa), m(y0)], [m(xb), m(y0)]];
      if (last) pts.push([m(xb + 2.6), m(ym)]);
      pts.push([m(xb), m(y1)], [m(xa), m(y1)]);
      L.polygon(P, pts, { fill: ax.l, stroke: 'none' });
      L.rect(P, m(xa), m(y0), m(0.8), m(BAND_H), { fill: ax.c, stroke: 'none' });
      if (last) L.polygon(P, [[m(xb), m(y0)], [m(xb + 2.6), m(ym)], [m(xb), m(y1)]], { fill: ax.c, stroke: 'none' });
    }
    F.anchor(`axe${i + 1}.end`, P.node, m(XR + 2.6), m(ym));
    // en-tête de ligne
    L.text(P, m(1.2), m(y0 + 3.4), `**${HEAD[i][0]}**`, { size: 7, color: ax.t });
    L.text(P, m(1.2), m(y0 + 6.3), HEAD[i][1], { size: 6, color: C.txt, lineGap: 1.1 });
    // stations
    for (let k = 0; k < NT; k++) {
      const s = ST[i][k];
      if (s) pill(L, P, m(colC(k) + 0.4), m(ym), s, ax);
    }
  }
  // trous signifiants
  L.text(P, m(colC(0)), m(BAND_Y[0] + BAND_H / 2), 'sans objet', { size: 6, italic: true, color: C.grey, anchor: 'middle', valign: 'middle' });
  {
    const ym = BAND_Y[2] + BAND_H / 2;
    L.line(P, [m(colX(1) - 0.5), m(ym)], [m(colX(2) + 0.5), m(ym)], { stroke: C.a3, width: 0.5, dash: '1.2 1.1' });
    L.text(P, m(colC(1)), m(ym - 0.2), 'pas de dynamo 2D', { size: 6, italic: true, color: C.grey, anchor: 'middle', valign: 'middle', halo: true });
  }

  // =================================================================================================
  // 3. Colonne de droite : boîte à outils, débouchés
  // =================================================================================================
  {
    const y0 = BAND_Y[0] + 1.0, y1 = BAND_Y[2] + BAND_H - 1.0;
    L.rect(P, m(RX), m(y0), m(RW), m(y1 - y0), { r: m(1.6), fill: '#F5F5F5', stroke: '#9a9a9a', width: 0.6 });
    codeGlyph(L, P, m(RX + RW / 2), m((y0 + y1) / 2 - 4.2), m(4.2));
    L.text(P, m(RX + RW / 2), m((y0 + y1) / 2 + 1.6), '**Boîte à outils**\n**MilaDy**', { size: 6.5, anchor: 'middle', color: C.txt, lineGap: 1.15 });
    for (let i = 0; i < 3; i++) {
      F.anchor(`outils.in${i + 1}`, P.node, m(RX), m(BAND_Y[i] + BAND_H / 2));
      F.relate(`axe${i + 1}.end`, `outils.in${i + 1}`, 'flow');
      F.drew(`axe${i + 1}.end`, `outils.in${i + 1}`, 'flow');
    }
    F.anchor('outils.top', P.node, m(RX + RW / 2), m(y0));
  }
  {
    // débouchés
    L.text(P, m(RX), m(4.6), '**Débouchés**', { size: 7.5, color: C.txt });
    // réduction de modèle : instantanés → quelques modes
    const gy = 7.6;
    for (let i = 0; i < 3; i++) L.rect(P, m(RX + 0.4 + i * 1.3), m(gy + i * 1.0), m(6.2), m(6.2), { fill: L.ramp(['#f2f2f2', '#d0d0d0'], i / 2), stroke: '#6b6b6b', width: 0.4 });
    L.arrow(P, [m(RX + 10.4), m(gy + 4.6)], [m(RX + 14.6), m(gy + 4.6)], { stroke: '#6b6b6b', width: 0.5, head: 2.0 });
    const bars = [5.6, 3.4, 2.0, 1.1];
    bars.forEach((h, i) => L.rect(P, m(RX + 15.8 + i * 1.9), m(gy + 8.2 - h), m(1.3), m(h), { fill: '#7a7a7a', stroke: 'none' }));
    L.line(P, [m(RX + 15.3), m(gy + 8.2)], [m(RX + 23.6), m(gy + 8.2)], { stroke: '#6b6b6b', width: 0.4 });
    L.text(P, m(RX), m(gy + 11.6), 'Réduction de modèle', { size: 6.5, color: C.txt });
    // assimilation : ensemble resserré sur des observations
    const ay = 25.0, aw = 23.0, ah = 8.0;
    const obs = [[0.38, 0.45], [0.66, 0.62], [0.9, 0.42]];
    for (let k = 0; k < 6; k++) {
      const off = (k - 2.5) / 2.5;
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40, spread = Math.exp(-3.2 * t) * 0.85 + 0.06;
        const base = 0.5 + 0.12 * Math.sin(6.5 * t + 0.4) - 0.05 * t;
        pts.push([m(RX + 0.4 + t * aw), m(ay + ah * (base + off * spread * 0.5))]);
      }
      L.polyline(P, pts, { stroke: '#9a9a9a', width: 0.35, fill: 'none' });
    }
    for (const [u, v] of obs) L.circle(P, m(RX + 0.4 + u * aw), m(ay + ah * v), m(0.55), { fill: '#2b2b2b', stroke: '#ffffff', width: 0.3 });
    L.text(P, m(RX), m(ay + ah + 3.2), 'Assimilation (TorchDA)', { size: 6.5, color: C.txt });
    F.anchor('debouches.bottom', P.node, m(RX + RW / 2), m(ay + ah + 5.2));
    F.relate('outils.top', 'debouches.bottom', 'flow');
    L.connect(F, 'outils.top', 'debouches.bottom', { stroke: '#7a7a7a', width: 0.7, head: 2.6, kind: 'flow', gap0: 0.5, gap1: 0.6 });
  }

  // =================================================================================================
  // 4. Frise de 36 mois
  // =================================================================================================
  {
    const yM = 91.0, yY0 = 93.4, yY1 = 97.0, yG = 99.4, dG = 2.35, yAx = 113.7;
    // années
    for (let a = 0; a < 3; a++) {
      L.rect(P, m(mo(12 * a)), m(yY0), m(mo(12) - mo(0)), m(yY1 - yY0), { fill: a % 2 ? '#E4E4E4' : '#EFEFEF', stroke: '#ffffff', width: 0.6 });
      L.text(P, m(mo(12 * a + 6)), m((yY0 + yY1) / 2), `Année ${a + 1}`, { size: 6, anchor: 'middle', valign: 'middle', color: C.txt });
    }
    for (const k of [12, 24]) L.line(P, [m(mo(k)), m(yY1)], [m(mo(k)), m(yAx)], { stroke: '#cfcfcf', width: 0.35, dash: '1 1.2' });
    // barres des paliers (calendrier proposé)
    const G = [[0, 1, 6], [1, 1, 9], [2, 6, 20], [3, 15, 33], [4, 24, 34]];
    G.forEach(([k, a, b], i) => {
      const y = yG + i * dG;
      L.rect(P, m(mo(a - 1)), m(y + 0.25), m(mo(b) - mo(a - 1)), m(1.5), { r: m(0.75), fill: '#bdbdbd', stroke: 'none' });
      badge(L, P, m(mo(a - 1) - 1.7), m(y + 1.0), m(1.15), k, 5.5);
    });
    {
      const y = yG + 5 * dG;
      L.rect(P, m(mo(30)), m(y + 0.25), m(mo(36) - mo(30)), m(1.5), { r: m(0.75), fill: '#ffffff', stroke: '#9a9a9a', width: 0.45, dash: '1 0.8' });
      L.text(P, m(mo(30) - 1.2), m(y + 1.0), 'rédaction', { size: 6, anchor: 'end', valign: 'middle', color: C.sub });
    }
    // graduation
    L.line(P, [m(mo(0)), m(yAx)], [m(mo(36)), m(yAx)], { stroke: '#6b6b6b', width: 0.45 });
    for (let k = 0; k <= 36; k += 6) {
      L.line(P, [m(mo(k)), m(yAx)], [m(mo(k)), m(yAx + 0.9)], { stroke: '#6b6b6b', width: 0.45 });
      L.text(P, m(mo(k)), m(yAx + 3.2), String(k), { size: 5.5, anchor: 'middle', color: C.sub });
    }
    L.text(P, m(mo(36) + 2.2), m(yAx + 3.2), 'mois', { size: 5.5, anchor: 'start', color: C.sub });
    // jalons
    const ART = [[10, 1], [22, 0], [33, 2]];
    for (const [k, i] of ART) diamond(L, P, m(mo(k)), m(yM), m(3.3), AX[i].c);
    for (const k of [16, 30]) codeGlyph(L, P, m(mo(k)), m(yM), m(2.7));
    // soutenance : drapeau
    {
      const x = m(mo(36)), y = m(yM);
      L.line(P, [x, y + m(1.6)], [x, y - m(1.9)], { stroke: '#2b2b2b', width: 0.6 });
      L.polygon(P, [[x, y - m(1.9)], [x + m(2.4), y - m(1.2)], [x, y - m(0.5)]], { fill: '#2b2b2b', stroke: 'none' });
      L.text(P, x + m(3.0), y, 'soutenance', { size: 6, anchor: 'start', valign: 'middle', color: C.txt });
    }
    // en-tête
    L.text(P, m(1.2), m(yY0 + 2.6), '**Calendrier**', { size: 7.5, color: C.txt });
    L.text(P, m(1.2), m(yY0 + 6.1), '36 mois', { size: 6, color: C.sub });
    // légende des jalons (colonne de droite)
    {
      const lx = RX + 0.4, ly = 99.6;
      [0, 1, 2].forEach((i) => diamond(L, P, m(lx + 1.3 + i * 2.2), m(ly), m(2.8), AX[i].c));
      L.text(P, m(lx + 8.0), m(ly), 'article', { size: 6, valign: 'middle', color: C.txt });
      codeGlyph(L, P, m(lx + 1.3), m(ly + 4.4), m(2.5));
      L.text(P, m(lx + 3.4), m(ly + 4.4), 'version du code', { size: 6, valign: 'middle', color: C.txt });
    }
  }
}
