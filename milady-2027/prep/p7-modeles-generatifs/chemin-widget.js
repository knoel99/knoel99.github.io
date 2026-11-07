/* MilaDy 2027 — module p7, schéma interactif « chemin de probabilité du flow matching ».
   Cible 1D : mélange 0,3 N(-a, s²) + 0,7 N(a, s²), a = 0,5 + 2λ ; source N(0, 1) ;
   chemin linéaire x_t = (1 - t) x0 + t x1 (t = 0 : bruit, t = 1 : données).
   Densité p_t et vitesse marginale v_t calculées exactement (exemple 4.6 du module).
   Aucun appel réseau, aucune bibliothèque. */
(function () {
  "use strict";
  var root = document.getElementById("fmw");
  if (!root) return;
  var cMain = document.getElementById("fmw-main");
  var cSide = document.getElementById("fmw-side");
  var inLam = document.getElementById("fmw-lam");
  var inS = document.getElementById("fmw-s");
  var inT = document.getElementById("fmw-t");
  var outLam = document.getElementById("fmw-lam-out");
  var outS = document.getElementById("fmw-s-out");
  var outT = document.getElementById("fmw-t-out");
  var readout = document.getElementById("fmw-readout");
  var modes = root.querySelectorAll("input[name=fmw-mode]");
  var PI = [0.3, 0.7];
  var XMIN = -5, XMAX = 5;
  var NTRAJ = 15;

  /* tirages fixes (générateur congruentiel) : les segments ne « sautent » pas quand on bouge un curseur */
  var seed = 12345;
  function unif() { seed = (seed * 1103515245 + 12345) % 2147483648; return (seed + 0.5) / 2147483648; }
  function gauss() { var u = unif(), v = unif(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var PAIRS = [];
  for (var i = 0; i < NTRAJ; i++) PAIRS.push({ z0: gauss(), z1: gauss(), k: unif() < PI[0] ? 0 : 1 });
  /* points de départ des trajectoires du flot : quantiles réguliers de N(0, 1) */
  function probit(p) { /* Acklam, précision ~1e-9, suffisante pour un dessin */
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var q, r;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
    if (p > 1 - 0.02425) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
    q = p - 0.5; r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  }
  var STARTS = [];
  for (i = 0; i < NTRAJ; i++) STARTS.push(probit(0.03 + 0.94 * i / (NTRAJ - 1)));

  function params() {
    var lam = parseFloat(inLam.value), s = parseFloat(inS.value);
    return { lam: lam, s: s, m: [-(0.5 + 2 * lam), 0.5 + 2 * lam], t: parseFloat(inT.value) };
  }
  /* densité et vitesse marginale au point (x, t) */
  function pv(P, x, t) {
    var s2 = P.s * P.s, v2 = (1 - t) * (1 - t) + t * t * s2;
    var g0 = PI[0] * Math.exp(-0.5 * Math.pow(x - t * P.m[0], 2) / v2);
    var g1 = PI[1] * Math.exp(-0.5 * Math.pow(x - t * P.m[1], 2) / v2);
    var p = (g0 + g1) / Math.sqrt(2 * Math.PI * v2);
    var c = (t * s2 - (1 - t)) / v2;
    var vk0 = P.m[0] + c * (x - t * P.m[0]), vk1 = P.m[1] + c * (x - t * P.m[1]);
    var tot = g0 + g1;
    var v = tot > 0 ? (g0 * vk0 + g1 * vk1) / tot : 0;
    return [p, v];
  }
  /* trajectoires du flot (Heun, 120 pas) ; rapport longueur totale / corde totale (1 = droites) */
  function trajectories(P) {
    var steps = 120, h = 1 / steps, out = [], Ltot = 0, Ctot = 0;
    for (var j = 0; j < NTRAJ; j++) {
      var x = STARTS[j], path = [x], L = 0;
      for (var k = 0; k < steps; k++) {
        var t = k * h, d0 = pv(P, x, t)[1], d1 = pv(P, x + h * d0, t + h)[1];
        var xn = x + 0.5 * h * (d0 + d1);
        L += Math.abs(xn - x);
        x = xn; path.push(x);
      }
      Ltot += L; Ctot += Math.abs(x - STARTS[j]);
      out.push(path);
    }
    return { paths: out, ratio: Ctot > 1e-9 ? Ltot / Ctot : 1 };
  }

  /* couleurs : jetons du site ; teintes de série choisies selon le fond (clair ou sombre) */
  function colors() {
    var cs = getComputedStyle(document.documentElement);
    var bg = (cs.getPropertyValue("--bg") || "#ffffff").trim();
    var hex = bg.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    var dark = (0.2126 * r + 0.7152 * g + 0.0722 * b) < 128;
    return {
      dark: dark, bg: [r, g, b],
      ink: (cs.getPropertyValue("--ink") || "#0a0a0a").trim(),
      muted: (cs.getPropertyValue("--muted") || "#374151").trim(),
      hair: (cs.getPropertyValue("--hair") || "#6b7280").trim(),
      blue: dark ? [57, 135, 229] : [42, 120, 214],
      orange: dark ? "#d95926" : "#eb6834"
    };
  }
  function rgb(a) { return "rgb(" + a[0] + "," + a[1] + "," + a[2] + ")"; }

  function setup(canvas, cssH) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || canvas.parentNode.clientWidth || 600;
    canvas.style.height = cssH + "px";
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(cssH * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: cssH };
  }

  function draw() {
    var P = params(), C = colors();
    outLam.textContent = P.lam.toFixed(2).replace(".", ",");
    outS.textContent = P.s.toFixed(2).replace(".", ",");
    outT.textContent = P.t.toFixed(2).replace(".", ",");
    var mode = "both";
    for (var i = 0; i < modes.length; i++) if (modes[i].checked) mode = modes[i].value;

    var wMain = cMain.clientWidth || 500;
    var H = Math.max(240, Math.min(380, Math.round(wMain * 0.62)));
    var M = setup(cMain, H), ctx = M.ctx;
    var ml = 34, mr = 8, mt = 10, mb = 34;
    var pw = M.w - ml - mr, ph = M.h - mt - mb;
    function X(t) { return ml + t * pw; }
    function Y(x) { return mt + (XMAX - x) / (XMAX - XMIN) * ph; }
    ctx.fillStyle = rgb(C.bg); ctx.fillRect(0, 0, M.w, M.h);

    /* carte de densité p_t(x), normalisée par son maximum à chaque instant t */
    var nt = 120, nx = 100, img = ctx.createImageData(nt, nx), vals = [], cmax = [];
    for (var a = 0; a < nt; a++) {
      var mx = 0;
      for (var b = 0; b < nx; b++) {
        var t = (a + 0.5) / nt, x = XMAX - (b + 0.5) / nx * (XMAX - XMIN);
        var p = pv(P, x, t)[0]; vals.push(p); if (p > mx) mx = p;
      }
      cmax.push(mx);
    }
    var k = 0;
    for (a = 0; a < nt; a++) for (b = 0; b < nx; b++) {
      var f = Math.pow(vals[k++] / cmax[a], 0.8), idx = 4 * (b * nt + a);
      for (var c = 0; c < 3; c++) img.data[idx + c] = Math.round(C.bg[c] + f * (C.blue[c] - C.bg[c]));
      img.data[idx + 3] = 255;
    }
    var off = document.createElement("canvas"); off.width = nt; off.height = nx;
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, X(0), Y(XMAX), pw, ph);

    /* segments conditionnels (droites qui se croisent) */
    if (mode !== "marg") {
      ctx.strokeStyle = C.orange; ctx.lineWidth = 1.6;
      PAIRS.forEach(function (q) {
        var x0 = q.z0, x1 = P.m[q.k] + P.s * q.z1;
        ctx.beginPath(); ctx.moveTo(X(0), Y(x0)); ctx.lineTo(X(1), Y(x1)); ctx.stroke();
      });
    }
    /* trajectoires du flot marginal (sans croisement) */
    var T = trajectories(P);
    if (mode !== "cond") {
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8;
      T.paths.forEach(function (path) {
        ctx.beginPath();
        path.forEach(function (x, j) { var tt = j / (path.length - 1); if (j === 0) ctx.moveTo(X(tt), Y(x)); else ctx.lineTo(X(tt), Y(x)); });
        ctx.stroke();
      });
    }
    /* temps sélectionné */
    ctx.setLineDash([5, 4]); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(X(P.t), mt); ctx.lineTo(X(P.t), mt + ph); ctx.stroke(); ctx.setLineDash([]);
    /* axes */
    ctx.strokeStyle = C.hair; ctx.lineWidth = 1; ctx.strokeRect(ml, mt, pw, ph);
    ctx.fillStyle = C.muted; ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    [0, 0.25, 0.5, 0.75, 1].forEach(function (tt) { ctx.fillText(String(tt).replace(".", ","), X(tt), mt + ph + 4); });
    ctx.fillText("temps du flot t   (0 : bruit, 1 : données)", ml + pw / 2, mt + ph + 18);
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    [-4, -2, 0, 2, 4].forEach(function (x) { ctx.fillText(String(x).replace("-", "−"), ml - 5, Y(x)); });

    /* panneau latéral : densité p_t(x) et flèches de vitesse v_t(x) au temps choisi */
    var S = setup(cSide, cSide.clientWidth > 320 ? 220 : H), sx = S.ctx;
    var sl = 8, sr = 8;
    var sw = S.w - sl - sr, sh = S.h - mt - mb;
    function SY(x) { return mt + (XMAX - x) / (XMAX - XMIN) * sh; }
    sx.fillStyle = rgb(C.bg); sx.fillRect(0, 0, S.w, S.h);
    var n = 200, prof = [], pm = 0;
    for (i = 0; i <= n; i++) { var xx = XMAX - i / n * (XMAX - XMIN); var r = pv(P, xx, P.t); prof.push([xx, r[0], r[1]]); if (r[0] > pm) pm = r[0]; }
    sx.beginPath(); sx.moveTo(sl, SY(XMAX));
    prof.forEach(function (q) { sx.lineTo(sl + 0.62 * sw * q[1] / pm, SY(q[0])); });
    sx.lineTo(sl, SY(XMIN)); sx.closePath();
    sx.fillStyle = "rgba(" + C.blue.join(",") + ",0.35)"; sx.fill();
    sx.strokeStyle = rgb(C.blue); sx.lineWidth = 1.6; sx.stroke();
    /* flèches : longueur ∝ v_t(x) (déplacement pendant Δt = 0,15) */
    sx.strokeStyle = C.ink; sx.fillStyle = C.ink; sx.lineWidth = 1.6;
    var ax = sl + 0.82 * sw;
    for (var xv = -4; xv <= 4.01; xv += 1) {
      var vv = pv(P, xv, P.t)[1], y0 = SY(xv), y1 = SY(xv + 0.15 * vv);
      sx.beginPath(); sx.moveTo(ax, y0); sx.lineTo(ax, y1); sx.stroke();
      if (Math.abs(y1 - y0) > 3) {
        var dir = y1 < y0 ? -1 : 1;
        sx.beginPath(); sx.moveTo(ax, y1); sx.lineTo(ax - 4, y1 - dir * 6); sx.lineTo(ax + 4, y1 - dir * 6); sx.closePath(); sx.fill();
      } else { sx.beginPath(); sx.arc(ax, y0, 2, 0, 2 * Math.PI); sx.fill(); }
    }
    sx.strokeStyle = C.hair; sx.lineWidth = 1; sx.strokeRect(sl, mt, sw, sh);
    sx.fillStyle = C.muted; sx.font = "12px system-ui, sans-serif"; sx.textAlign = "center"; sx.textBaseline = "top";
    sx.fillText("pₜ(x) et vₜ(x) à t = " + P.t.toFixed(2).replace(".", ","), sl + sw / 2, mt + sh + 4);

    var txt = "Longueur totale des trajectoires du flot marginal rapportée à la somme de leurs cordes : " +
      T.ratio.toFixed(3).replace(".", ",") + " (1 = trajectoires droites).";
    readout.textContent = txt;
    cMain.setAttribute("aria-label", "Densité du chemin de probabilité dans le plan (t, x) pour λ = " +
      P.lam.toFixed(2) + " et s = " + P.s.toFixed(2) + ". " + txt);
  }

  [inLam, inS, inT].forEach(function (e) { e.addEventListener("input", draw); });
  for (var j = 0; j < modes.length; j++) modes[j].addEventListener("change", draw);
  var lastW = -1, pending = false;
  function onResize() {                       /* ne redessine que si la largeur change (pas de boucle) */
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      var w = root.clientWidth;
      if (w !== lastW) { lastW = w; draw(); }
    });
  }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(root);
  else window.addEventListener("resize", onResize);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", draw);
  }
  draw();
})();
