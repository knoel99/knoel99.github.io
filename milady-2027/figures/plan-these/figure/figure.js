// Hero: l'escalier des cinq bancs d'essai ; vignettes VKS, DRESDYN et boîte périodique en vector 3D (L.cylinder3, L.circle3, L.obliqueBox), illustrated finish ; vignettes 0 et 1 calculées (make_data.py)
export const figure = { width: 183, height: 120, name: 'plan-these', format: 'journal', illustrate: true };

// ---------------------------------------------------------------------------------------------------
// Palette : bancs, frise, outils en gris neutres ; couleur réservée aux trois axes (clé des figures sœurs
// « taxonomie » et « cadre » : bleu = par échantillon, orange = en loi, vert = paramètre de contrôle / seuil).
const C = {
  ink: '#2b2b2b', txt: '#1a1a1a', sub: '#555555', grey: '#8a8a8a', lg: '#cfcfcf',
  tread: '#8c8c8c', badge: '#4d4d4d',
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
const X0 = 25, CW = 26, NT = 5, XR = X0 + NT * CW;            // colonnes des paliers : 25 → 155
const colX = (k) => X0 + k * CW, colC = (k) => X0 + (k + 0.5) * CW;
const YB = 50, tread = (k) => 41 - 2.0 * k;                  // bas de l'escalier, dessus de chaque marche
const IH = 21;                                                // hauteur réservée aux vignettes
const vtop = (k) => tread(k) - IH - 0.6;
const ST_Y = 51.3, ST_H = 3.2;                                // rangée « acquis du stage »
const BAND_H = 9.6, BAND_Y = [56.2, 56.2 + BAND_H + 1.5, 56.2 + 2 * (BAND_H + 1.5)];
const XT0 = X0, XT1 = XR, mo = (k) => XT0 + k * (XT1 - XT0) / 36;   // frise : mois → mm
const RX = 158, RW = 24.4;                                    // colonne de droite

// petits outils 3D
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (...v) => v.reduce((s, a) => [s[0] + a[0], s[1] + a[1], s[2] + a[2]], [0, 0, 0]);
const sc3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a) => sc3(a, 1 / Math.hypot(...a));

// projection orthographique : azimut az, élévation el (degrés), z vers le haut
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
  const q = pts[48], q0 = pts[44], d = [q[0] - q0[0], q[1] - q0[1]], n = Math.hypot(...d) || 1, u = [d[0] / n, d[1] / n];
  const base = [q[0] - u[0] * head, q[1] - u[1] * head];
  let cut = 48; while (cut > 1 && Math.hypot(pts[cut][0] - q[0], pts[cut][1] - q[1]) < head * 0.9) cut--;
  L.polyline(p, pts.slice(0, cut + 1).concat([base]), { stroke, width, fill: 'none', cap: 'round', join: 'round' });
  L.polygon(p, [q, [base[0] - u[1] * head * 0.45, base[1] + u[0] * head * 0.45], [base[0] + u[1] * head * 0.45, base[1] - u[0] * head * 0.45]], { fill: stroke, stroke: 'none' });
}

// glyphe « version du code » : carré arrondi à trois lignes blanches
function codeGlyph(L, p, cx, cy, s, fill = '#4a4a4a') {
  L.rect(p, cx - s / 2, cy - s / 2, s, s, { r: s * 0.18, fill, stroke: 'none' });
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
// bilinéaire périodique sur une carte n × n (indices [i][j], i suivant u, j suivant v ; coordonnées dans [0, 1))
function bilinP(Mx, u, v) {
  const n = Mx.length, x = u * n - 0.5, y = v * n - 0.5;
  const i0 = Math.floor(x), j0 = Math.floor(y), fx = x - i0, fy = y - j0;
  const w = (i) => ((i % n) + n) % n;
  const a = Mx[w(i0)][w(j0)], b = Mx[w(i0 + 1)][w(j0)], c = Mx[w(i0)][w(j0 + 1)], d = Mx[w(i0 + 1)][w(j0 + 1)];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

export default async function draw(F, L) {
  const m = L.mm;
  const D = await (await fetch('/figure/data/plan_data.json')).json();
  const P = F.panel('', { x: 0, y: 0, w: 183, h: 120 });

  // =================================================================================================
  // 1. Escalier des paliers (noms sur les contremarches, vignettes sur les marches)
  // =================================================================================================
  const stair = [[m(X0), m(YB)]];
  for (let k = 0; k < NT; k++) { stair.push([m(colX(k)), m(tread(k))]); stair.push([m(colX(k + 1)), m(tread(k))]); }
  stair.push([m(XR), m(YB)]);
  const stepFill = L.linearGradient(P.node, [[0, '#F4F4F4'], [1, '#E2E2E2']], 90);
  L.polygon(P, stair, { fill: stepFill, stroke: '#BDBDBD', width: 0.4, join: 'miter' });
  for (let k = 1; k < NT; k++) L.line(P, [m(colX(k)), m(tread(k - 1))], [m(colX(k)), m(YB)], { stroke: '#d0d0d0', width: 0.35 });
  for (let k = 0; k < NT; k++) {
    L.line(P, [m(colX(k)), m(tread(k))], [m(colX(k + 1)), m(tread(k))], { stroke: C.tread, width: 0.9 });
    badge(L, P, m(colX(k) + 2.75), m(tread(k) + 2.85), m(1.85), k);
  }
  const NAMES = [
    ['**Modèles réduits**', 'Gissinger, DQVU'],
    ['**MHD 2D**', 'périodique'],
    ['**Dynamos 3D**', '**périodiques**', 'ABC, Taylor–Green'],
    ['**VKS**', 'SFEMaNS, LATU'],
    ['**DRESDYN**', 'précession, HZDR'],
  ];
  for (let k = 0; k < NT; k++) {
    const x = m(colX(k) + 5.2);
    NAMES[k].forEach((s, i) => {
      const bold = s.startsWith('**');
      L.text(P, x, m(tread(k) + 3.8 + 2.95 * i), s, { size: bold ? 7 : 6.5, color: bold ? C.txt : C.sub });
    });
  }

  // ---- vignette 0 : série D(t) du modèle de Gissinger ----
  {
    const bx = colX(0) + 2.2, bw = CW - 3.6, by = vtop(0) + 2.6, bh = IH - 4.2;
    const g = L.group(P, {}).node;
    const y0 = m(by + bh / 2), X = (t) => m(bx + 1.6 + t * (bw - 3.4)), Y = (d) => y0 - d * m(bh / 2 - 0.3);
    L.line(g, [m(bx + 1.0), m(by - 0.6)], [m(bx + 1.0), m(by + bh + 0.4)], { stroke: '#7a7a7a', width: 0.4 });
    L.line(g, [m(bx + 1.0), y0], [m(bx + bw - 0.9), y0], { stroke: '#9a9a9a', width: 0.4, dash: '1.2 0.9' });
    L.polygon(g, [[m(bx + bw + 0.2), y0], [m(bx + bw - 1.2), y0 - m(0.55)], [m(bx + bw - 1.2), y0 + m(0.55)]], { fill: '#7a7a7a', stroke: 'none' });
    const pts = D.gissinger.t.map((t, i) => [X(t), Y(D.gissinger.D[i])]);
    L.polyline(g, pts, { stroke: C.ink, width: 0.45, fill: 'none', join: 'round' });
    L.text(g, m(bx + 0.2), m(by - 0.4), '*D*', { size: 6, anchor: 'end', valign: 'top' });
    L.text(g, m(bx + bw + 0.2), y0 + m(2.5), '*t*', { size: 6, anchor: 'end', valign: 'middle' });
  }

  // ---- vignette 1 : MHD 2D (carte de j, isolignes de a), données E2 ----
  {
    const s = IH - 2.2, bx = colC(1) - s / 2, by = vtop(1) + 1.6;
    const rows0 = D.mhd2d.j.slice().reverse(), NU = 120;          // suréchantillonnage bilinéaire périodique (48 → 120)
    const rows = Array.from({ length: NU }, (_, r) => Array.from({ length: NU }, (_, c) => bilinP(rows0, (r + 0.5) / NU, (c + 0.5) / NU)));
    L.pixelImage(P, m(bx), m(by), m(s), rows, { palette: ['#fafafa', '#cdcdcd', '#6f6f6f'], overlap: 0.6, skipBelow: 0 });
    const clip = L.clipPath(P.node, `M${m(bx)},${m(by)} h${m(s)} v${m(s)} h${-m(s)} Z`);
    const g = L.group(P, { clip }).node;
    for (const ln of D.mhd2d.a_lines) L.polyline(g, ln.map(([u, v]) => [m(bx + u * s), m(by + (1 - v) * s)]), { stroke: '#2f2f2f', width: 0.3, fill: 'none', opacity: 0.8 });
    L.rect(P, m(bx), m(by), m(s), m(s), { fill: 'none', stroke: '#5f5f5f', width: 0.45 });
  }

  // ---- vignette 2 : boîte périodique, |B| du mode dynamo ABC (E3) sur trois faces ----
  {
    const e = m(11.6);
    const P3 = L.obliqueProj({ preset: 'angles', angle: 32, depth: 0.55 });
    const box = L.obliqueBox(P, P3, [e, e, e], { at: [m(colC(2) - 0.8), m(vtop(2) + IH / 2 + 0.6)], anchor: 'center', fill: '#ffffff', stroke: 'none' });
    const lerp = (v) => L.ramp(['#f9f9f9', '#c9c9c9', '#8a8a8a', '#3f3f3f'], Math.min(1, Math.max(0, v)));
    const N = 48, F_ = D.abc;
    const sample = (key, w) => {
      const f = w.map((c) => c / e);
      if (key === 'x1') return bilinP(F_.x1, f[1], f[2]);
      if (key === 'y0') return bilinP(F_.y0, f[0], f[2]);
      return bilinP(F_.z1, f[0], f[1]);
    };
    for (const key of ['y0', 'x1', 'z1']) {
      const M = box.faces[key];
      const d = 'M' + M.corners.map((q) => q.map((v) => v.toFixed(3)).join(',')).join(' L') + ' Z';
      const g = L.group(P, { clip: L.clipPath(P.node, d) }).node;
      const shade = key === 'z1' ? 0 : key === 'y0' ? -0.04 : -0.1;     // faces latérales un peu plus sombres
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const du = 1 / N, ov = 0.4 / N, u0 = i * du, v0 = j * du;
        const val = sample(key, M.world(u0 + du / 2, v0 + du / 2));
        L.polygon(g, M.quad(u0 - ov, v0 - ov, u0 + du + ov, v0 + du + ov), { fill: L.shade(lerp(val), shade), stroke: 'none' });
      }
    }
    for (const key of ['y0', 'x1', 'z1']) L.polygon(P, box.faces[key].corners, { fill: 'none', stroke: C.ink, width: 0.5, join: 'round' });
    // périodicité : sortie par la face x = 2π, rentrée par x = 0 (flèches courtes)
    const BP = box.P, xo = box.faces.x1.world(1.0, 0.72), xi = box.faces.y0.world(0.0, 0.72);
    L.arrow(P, BP(...xo), BP(xo[0] + m(2.8), xo[1], xo[2]), { stroke: '#4d4d4d', width: 0.5, head: 1.9 });
    L.arrow(P, BP(xi[0] - m(2.8), xi[1], xi[2]), BP(xi[0] - m(0.3), xi[1], xi[2]), { stroke: '#4d4d4d', width: 0.5, head: 1.9 });
  }

  // ---- vignette 3 : cuve VKS (cylindre horizontal, deux turbines en fer doux contrarotatives) ----
  {
    const R = m(6.6), Lh = 1.27 * R, xi = 0.708 * Lh, Ri = 0.75 * R, hb = 0.2 * R;
    const PV = orthoProj(L, 24, 17, [m(colC(3) - 0.2), m(vtop(3) + IH / 2 + 0.3)]);
    const g = L.group(P, {}).node;
    // corps de verre (fond), bord du fond éloigné
    L.cylinder3(g, PV, [-Lh, 0, 0], [Lh, 0, 0], R, R, { fill: C.glass, stroke: 'none', cap: false });
    L.circle3(g, PV, [-Lh, 0, 0], 'x', R, { stroke: '#b3bcc4', width: 0.35 });
    L.cylinder3(g, PV, [-Lh - m(2.2), 0, 0], [-xi, 0, 0], m(0.45), m(0.45), { fill: '#8b929a', stroke: C.ironEdge, width: 0.3 });
    const blades = (x0, dir) => {
      for (let i = 0; i < 8; i++) {
        const f = i * Math.PI / 4 + 0.2, c = Math.cos(f), s = Math.sin(f);
        const q = [[x0, 0.28 * Ri * c, 0.28 * Ri * s], [x0, Ri * c, Ri * s], [x0 + dir * hb, Ri * c, Ri * s], [x0 + dir * hb, 0.28 * Ri * c, 0.28 * Ri * s]];
        L.polygon(g, q.map((w) => PV(...w)), { fill: '#7b828a', stroke: C.ironEdge, width: 0.25, join: 'round' });
      }
    };
    L.circle3(g, PV, [-xi, 0, 0], 'x', Ri, { fill: C.iron, stroke: C.ironEdge, width: 0.4 });
    blades(-xi, 1);
    blades(xi, -1);
    L.circle3(g, PV, [xi, 0, 0], 'x', Ri, { fill: C.iron, stroke: C.ironEdge, width: 0.4 });
    L.cylinder3(g, PV, [xi, 0, 0], [Lh + m(2.2), 0, 0], m(0.45), m(0.45), { fill: '#8b929a', stroke: C.ironEdge, width: 0.3 });
    L.cylinder3(g, PV, [-Lh, 0, 0], [Lh, 0, 0], R, R, { fill: 'none', capFill: 'none', stroke: C.glassEdge, width: 0.5 });
    const hl = [];
    for (let i = 0; i <= 20; i++) { const t = -0.82 + 1.64 * i / 20; hl.push(PV(t * Lh, -0.35 * R, 0.93 * R)); }
    L.polyline(g, hl, { stroke: '#ffffff', width: 0.9, opacity: 0.9, fill: 'none', cap: 'round' });
    // contrarotation
    rotArrow(L, g, PV, [-Lh - m(1.3), 0, 0], [1, 0, 0], m(2.0), 0.6, 0.6 + 4.6);
    rotArrow(L, g, PV, [Lh + m(1.3), 0, 0], [1, 0, 0], m(2.0), 0.6 + 4.6, 0.6);
  }

  // ---- vignette 4 : DRESDYN, cylindre en précession sur plateau tournant ----
  {
    const R = m(4.7), H = m(9.4), th = 60 * Math.PI / 180;      // axe du cylindre à 60° de la verticale
    const ax = [Math.sin(th), 0, Math.cos(th)];
    const zc = R * Math.sin(th) + H / 2 * Math.cos(th) + m(1.0);
    const PD = orthoProj(L, 26, 19, [m(colC(4) - 1.0), m(tread(4) - 4.4)]);
    const g = L.group(P, {}).node;
    const rT = m(8.8);
    // plateau tournant (axe de précession vertical)
    L.cylinder3(g, PD, [0, 0, -m(1.2)], [0, 0, 0], rT, rT, { fill: '#d4d4d4', capFill: '#e9e9e9', stroke: '#6f6f6f', width: 0.4, shading: true });
    // axe de précession (tirets), derrière le cylindre
    const zt = zc + H / 2 * Math.cos(th) + R * Math.sin(th);
    L.line3(g, PD, [0, 0, 0], [0, 0, zt + m(2.4)], { stroke: '#6a6a6a', width: 0.45, dash: '1.3 0.9' });
    // étrier : montant arrière, cylindre, montant avant (y vers l'arrière pour cette vue)
    const yP = R + m(1.3);
    const post = (y) => {
      L.cylinder3(g, PD, [0, y, 0], [0, y, zc], m(0.6), m(0.6), { fill: '#a9aeb4', stroke: '#555b61', width: 0.3, shading: true });
      L.cylinder3(g, PD, [0, y, zc], [0, y * 0.8, zc], m(0.5), m(0.5), { fill: '#a9aeb4', stroke: '#555b61', width: 0.3 });
    };
    const back = PD.view[1] < 0 ? yP : -yP;
    post(back);
    const c = [0, 0, zc], c0 = sub3(c, sc3(ax, H / 2)), c1 = add3(c, sc3(ax, H / 2));
    L.cylinder3(g, PD, c0, c1, R, R, { fill: C.metal, capFill: '#e4e7ea', stroke: '#4a4f55', width: 0.5, shading: true });
    post(-back);
    // rotation propre (autour de l'axe du cylindre), au-dessus du couvercle visible
    rotArrow(L, g, PD, add3(c1, sc3(ax, m(1.0))), ax, R * 0.55, 0.9, 0.9 + 4.6, { head: 2.0 });
    // précession : flèche de rotation autour de l'axe vertical, au-dessus du cylindre
    rotArrow(L, g, PD, [0, 0, zt + m(1.5)], [0, 0, 1], m(2.3), -2.3, -2.3 + 4.6, { head: 2.0 });
  }

  // complexité croissante : flèche parallèle à l'escalier, au-dessus des vignettes
  {
    const yAt = (x) => vtop(0) - 2.4 - (x - colC(0)) * 2.0 / CW;
    const a = [m(colX(0) + 1.0), m(yAt(colX(0) + 1.0))], b = [m(XR - 1.0), m(yAt(XR - 1.0))];
    L.arrow(P, a, b, { stroke: '#8a8a8a', width: 0.5, head: 2.6 });
    L.text(P, m(colX(0) + 1.0), m(yAt(colX(0) + 1.0) - 3.0), 'complexité croissante', { size: 6.5, italic: true, color: C.sub });
  }
  // en-têtes de ligne
  L.text(P, m(1.2), m(tread(0) + 2.6), '**Bancs d\'essai**', { size: 7.5, color: C.txt });

  // ---- rangée « acquis du stage » : E1, E2, E3 sous les paliers 0, 1, 2 ----
  {
    L.rect(P, m(colX(0) + 0.6), m(ST_Y), m(3 * CW - 1.2), m(ST_H), { r: m(ST_H / 2), fill: '#F3F3F3', stroke: '#a6a6a6', width: 0.4 });
    for (let k = 1; k < 3; k++) L.line(P, [m(colX(k)), m(ST_Y + 0.6)], [m(colX(k)), m(ST_Y + ST_H - 0.6)], { stroke: '#c4c4c4', width: 0.35 });
    for (let k = 0; k < 3; k++) L.text(P, m(colC(k)), m(ST_Y + ST_H / 2), 'E' + (k + 1), { size: 6.5, anchor: 'middle', valign: 'middle', color: C.sub });
    L.text(P, m(1.2), m(ST_Y + ST_H / 2), 'Acquis du stage', { size: 6.5, valign: 'middle', color: C.sub });
  }

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
    L.text(P, m(1.2), m(y0 + 3.3), `**${HEAD[i][0]}**`, { size: 7, color: ax.t });
    L.text(P, m(1.2), m(y0 + 6.2), HEAD[i][1], { size: 6.5, color: C.txt, lineGap: 1.08 });
    for (let k = 0; k < NT; k++) {
      const s = ST[i][k];
      if (s) pill(L, P, m(colC(k) + 0.4), m(ym), s, ax);
    }
  }
  // trous signifiants
  L.text(P, m(colC(0)), m(BAND_Y[0] + BAND_H / 2), 'sans objet', { size: 6.5, italic: true, color: C.grey, anchor: 'middle', valign: 'middle' });
  {
    const ym = BAND_Y[2] + BAND_H / 2;
    L.line(P, [m(colX(1) - 0.5), m(ym)], [m(colX(2) + 0.5), m(ym)], { stroke: C.a3, width: 0.5, dash: '1.2 1.1' });
    L.text(P, m(colC(1)), m(ym - 0.2), 'pas de dynamo 2D', { size: 6.5, italic: true, color: C.grey, anchor: 'middle', valign: 'middle', halo: true });
  }

  // =================================================================================================
  // 3. Colonne de droite : boîte à outils (un module par axe), débouchés
  // =================================================================================================
  {
    const y0 = 44.6, y1 = BAND_Y[2] + BAND_H;
    L.rect(P, m(RX), m(y0), m(RW), m(y1 - y0), { r: m(1.6), fill: '#F5F5F5', stroke: '#9a9a9a', width: 0.6 });
    L.text(P, m(RX + RW / 2), m(y0 + 3.4), '**Boîte à outils**\n**MilaDy**', { size: 6.5, anchor: 'middle', color: C.txt, lineGap: 1.15 });
    for (let i = 0; i < 3; i++) {
      const ym = BAND_Y[i] + BAND_H / 2, ax = AX[i];
      const mx = RX + 2.2, mw = RW - 4.4, mh = 6.0;
      L.rect(P, m(mx), m(ym - mh / 2), m(mw), m(mh), { r: m(1.0), fill: '#ffffff', stroke: ax.c, width: 0.6 });
      codeGlyph(L, P, m(mx + 3.4), m(ym), m(3.4), ax.c);
      [0.62, 0.44, 0.54].forEach((f, j) => L.line(P, [m(mx + 6.4), m(ym - 1.5 + 1.5 * j)], [m(mx + 6.4 + f * (mw - 8.2)), m(ym - 1.5 + 1.5 * j)], { stroke: '#b5b5b5', width: 0.6, cap: 'round' }));
      F.anchor(`outils.in${i + 1}`, P.node, m(RX), m(ym));
      F.relate(`axe${i + 1}.end`, `outils.in${i + 1}`, 'flow');
      F.drew(`axe${i + 1}.end`, `outils.in${i + 1}`, 'flow');
    }
    F.anchor('outils.top', P.node, m(RX + RW / 2), m(y0));
  }
  {
    L.text(P, m(RX), m(4.6), '**Débouchés**', { size: 7.5, color: C.txt });
    // réduction de modèle : instantanés → quelques modes
    const gy = 7.4;
    for (let i = 0; i < 3; i++) L.rect(P, m(RX + 0.4 + i * 1.3), m(gy + i * 1.0), m(6.2), m(6.2), { fill: L.ramp(['#f2f2f2', '#d0d0d0'], i / 2), stroke: '#6b6b6b', width: 0.4 });
    L.arrow(P, [m(RX + 10.4), m(gy + 4.6)], [m(RX + 14.6), m(gy + 4.6)], { stroke: '#6b6b6b', width: 0.5, head: 2.0 });
    const bars = [5.6, 3.4, 2.0, 1.1];
    bars.forEach((h, i) => L.rect(P, m(RX + 15.8 + i * 1.9), m(gy + 8.2 - h), m(1.3), m(h), { fill: '#7a7a7a', stroke: 'none' }));
    L.line(P, [m(RX + 15.3), m(gy + 8.2)], [m(RX + 23.6), m(gy + 8.2)], { stroke: '#6b6b6b', width: 0.4 });
    L.text(P, m(RX), m(gy + 11.6), 'Réduction de modèle', { size: 6.5, color: C.txt });
    // assimilation : ensemble resserré par des observations
    const ay = 24.0, aw = 23.0, ah = 8.0;
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
    F.anchor('debouches.bottom', P.node, m(RX + RW / 2), m(ay + ah + 5.0));
    F.relate('outils.top', 'debouches.bottom', 'flow');
    L.connect(F, 'outils.top', 'debouches.bottom', { stroke: '#7a7a7a', width: 0.7, head: 2.6, kind: 'flow', gap0: 0.5, gap1: 0.6 });
  }

  // =================================================================================================
  // 4. Frise de 36 mois
  // =================================================================================================
  {
    const yM = 92.0, yY0 = 94.4, yY1 = 97.8, yG = 99.9, dG = 2.3, yAx = 114.2;
    for (let a = 0; a < 3; a++) {
      L.rect(P, m(mo(12 * a)), m(yY0), m(mo(12) - mo(0)), m(yY1 - yY0), { fill: a % 2 ? '#E4E4E4' : '#EFEFEF', stroke: '#ffffff', width: 0.6 });
      L.text(P, m(mo(12 * a + 6)), m((yY0 + yY1) / 2), `Année ${a + 1}`, { size: 6.5, anchor: 'middle', valign: 'middle', color: C.txt });
    }
    for (const k of [12, 24]) L.line(P, [m(mo(k)), m(yY1)], [m(mo(k)), m(yAx)], { stroke: '#cfcfcf', width: 0.35, dash: '1 1.2' });
    // barres des paliers (calendrier proposé)
    const G = [[0, 1, 6], [1, 1, 9], [2, 6, 20], [3, 15, 33], [4, 24, 34]];
    G.forEach(([k, a, b], i) => {
      const y = yG + i * dG;
      L.rect(P, m(mo(a - 1)), m(y + 0.25), m(mo(b) - mo(a - 1)), m(1.5), { r: m(0.75), fill: '#bdbdbd', stroke: 'none' });
      badge(L, P, m(mo(a - 1) - 1.7), m(y + 1.0), m(1.12), k, 5.5);
    });
    {
      const y = yG + 5 * dG;
      L.rect(P, m(mo(30)), m(y + 0.25), m(mo(36) - mo(30)), m(1.5), { r: m(0.75), fill: '#ffffff', stroke: '#9a9a9a', width: 0.45, dash: '1 0.8' });
      L.text(P, m(mo(30) - 1.2), m(y + 1.0), 'rédaction', { size: 6.5, anchor: 'end', valign: 'middle', color: C.sub });
    }
    L.line(P, [m(mo(0)), m(yAx)], [m(mo(36)), m(yAx)], { stroke: '#6b6b6b', width: 0.45 });
    for (let k = 0; k <= 36; k += 6) {
      L.line(P, [m(mo(k)), m(yAx)], [m(mo(k)), m(yAx + 0.9)], { stroke: '#6b6b6b', width: 0.45 });
      L.text(P, m(mo(k)), m(yAx + 3.2), String(k), { size: 5.5, anchor: 'middle', color: C.sub });
    }
    L.text(P, m(mo(36) + 2.2), m(yAx + 3.2), 'mois', { size: 5.5, anchor: 'start', color: C.sub });
    // jalons : tige courte jusqu'au bandeau des années
    const ART = [[10, 1], [22, 0], [33, 2]];
    for (const k of [10, 16, 22, 30, 33]) L.line(P, [m(mo(k)), m(yM)], [m(mo(k)), m(yY0)], { stroke: '#9a9a9a', width: 0.35 });
    for (const [k, i] of ART) diamond(L, P, m(mo(k)), m(yM), m(3.3), AX[i].c);
    for (const k of [16, 30]) codeGlyph(L, P, m(mo(k)), m(yM), m(2.7));
    {
      const x = m(mo(36)), y = m(yM);
      L.line(P, [x, m(yY0)], [x, y - m(1.9)], { stroke: '#2b2b2b', width: 0.6 });
      L.polygon(P, [[x, y - m(1.9)], [x + m(2.4), y - m(1.2)], [x, y - m(0.5)]], { fill: '#2b2b2b', stroke: 'none' });
      L.text(P, x + m(3.0), y - m(0.6), 'soutenance', { size: 6.5, anchor: 'start', valign: 'middle', color: C.txt });
    }
    L.text(P, m(1.2), m(yY0 + 2.6), '**Calendrier**', { size: 7.5, color: C.txt });
    L.text(P, m(1.2), m(yY0 + 6.1), '36 mois', { size: 6.5, color: C.sub });
    // légende des jalons
    {
      const lx = RX + 0.4, ly = 101.4;
      [0, 1, 2].forEach((i) => diamond(L, P, m(lx + 1.3 + i * 2.2), m(ly), m(2.8), AX[i].c));
      L.text(P, m(lx + 8.0), m(ly), 'article', { size: 6.5, valign: 'middle', color: C.txt });
      codeGlyph(L, P, m(lx + 1.3), m(ly + 4.4), m(2.5));
      L.text(P, m(lx + 3.4), m(ly + 4.4), 'version du code', { size: 6.5, valign: 'middle', color: C.txt });
    }
  }
}
