/* Schémas interactifs du module p5 « Probabilités, statistiques et transport optimal ».
   Interactive diagrams for module p5 "Probability, statistics and optimal transport".
   Un seul fichier pour les pages française et anglaise : la langue suit <html lang>.
   Chaque widget est un <div class="widget" data-widget="..."> ; ce script y ajoute les
   réglages, un <canvas> et les valeurs calculées. Aucune dépendance externe. */
(function () {
  "use strict";
  var LANG = /^en/i.test(document.documentElement.getAttribute("lang") || "") ? "en" : "fr";
  var S = {
    fr: {
      a: "non-linéarité a", s: "échelle s", mintp: "min T′", integral: "∫ p_Y", histerr: "écart max histogramme / formule",
      topX: "loi de X ~ N(0, 1), 10 tranches de probabilité 0,1", botY: "loi de Y = T(X) : mêmes tranches, même masse",
      mapLbl: "T(x) = s (x + a sin 2x)",
      c: "contrainte c = E[X]", lamS: "λ (échantillon)", lamE: "λ (exact)", ess: "ESS / N", kl: "KL(p̂ ‖ q̂)",
      infeas: "c est hors de l'enveloppe convexe de l'échantillon : aucune inclinaison ne convient (ESS → 1).",
      baseH: "échantillon de q", tiltH: "échantillon repondéré", tiltE: "loi inclinée exacte", essCurve: "ESS / N en fonction de c",
      m: "décalage m", sd: "écart-type s", d: "séparation des modes d", w1: "W₁", w2: "W₂", de: "ℰ (énergie)", klnm: "KL(ν ‖ μ)",
      dens: "densités μ (bleu) et ν (orange)", cdf: "répartitions F, G ; aire colorée = W₁",
      theta: "θ", sigma: "σ", dt: "Δt", x0: "x₀", run: "Lancer", pause: "Pause", reset: "Réinitialiser",
      t: "t", meanE: "moyenne (empirique / exacte)", varE: "variance (empirique / exacte)", vdisc: "variance stationnaire du schéma",
      unstable: "instable : θ Δt ≥ 2", traj: "trajectoires X_t", histo: "histogramme, p(·, t) exacte, p∞",
      tt: "temps du flot t", mode: "affichage", cond: "chemins conditionnels (droites)", ode: "flot marginal (EDO)", anim: "Animer",
      w1t: "W₁(nuage conditionnel, nuage EDO)", disp: "écart moyen |x_t cond − x_t EDO|", pt: "p_t(x) et chemins", ht: "histogramme à l'instant t et p_t exacte",
      alt1: "Mesure image : densité de X, application T et densité de Y = T(X).",
      alt2: "Inclinaison exponentielle d'un échantillon : histogrammes et ESS.",
      alt3: "Densités et fonctions de répartition de deux lois, et distances associées.",
      alt4: "Particules d'Ornstein–Uhlenbeck simulées par Euler–Maruyama et densités de Fokker–Planck.",
      alt5: "Transport d'une gaussienne vers un mélange par chemins conditionnels ou flot marginal."
    },
    en: {
      a: "non-linearity a", s: "scale s", mintp: "min T′", integral: "∫ p_Y", histerr: "max gap histogram / formula",
      topX: "law of X ~ N(0, 1), 10 slices of probability 0.1", botY: "law of Y = T(X): same slices, same mass",
      mapLbl: "T(x) = s (x + a sin 2x)",
      c: "constraint c = E[X]", lamS: "λ (sample)", lamE: "λ (exact)", ess: "ESS / N", kl: "KL(p̂ ‖ q̂)",
      infeas: "c lies outside the convex hull of the sample: no tilt works (ESS → 1).",
      baseH: "sample of q", tiltH: "reweighted sample", tiltE: "exact tilted law", essCurve: "ESS / N as a function of c",
      m: "shift m", sd: "standard deviation s", d: "mode separation d", w1: "W₁", w2: "W₂", de: "ℰ (energy)", klnm: "KL(ν ‖ μ)",
      dens: "densities μ (blue) and ν (orange)", cdf: "CDFs F, G; shaded area = W₁",
      theta: "θ", sigma: "σ", dt: "Δt", x0: "x₀", run: "Run", pause: "Pause", reset: "Reset",
      t: "t", meanE: "mean (empirical / exact)", varE: "variance (empirical / exact)", vdisc: "stationary variance of the scheme",
      unstable: "unstable: θ Δt ≥ 2", traj: "paths X_t", histo: "histogram, exact p(·, t), p∞",
      tt: "flow time t", mode: "display", cond: "conditional paths (straight lines)", ode: "marginal flow (ODE)", anim: "Animate",
      w1t: "W₁(conditional cloud, ODE cloud)", disp: "mean gap |x_t cond − x_t ODE|", pt: "p_t(x) and paths", ht: "histogram at time t and exact p_t",
      alt1: "Pushforward: density of X, map T and density of Y = T(X).",
      alt2: "Exponential tilting of a sample: histograms and ESS.",
      alt3: "Densities and CDFs of two laws, and the associated distances.",
      alt4: "Ornstein–Uhlenbeck particles simulated by Euler–Maruyama and Fokker–Planck densities.",
      alt5: "Transport of a Gaussian to a mixture by conditional paths or marginal flow."
    }
  }[LANG];

  /* ---------- outils numériques ---------- */
  function fmt(x, d) {
    if (!isFinite(x)) return "∞";
    var s = (Math.abs(x) >= 1e4 || (Math.abs(x) < 1e-3 && x !== 0)) ? x.toExponential(Math.max(1, d - 1)) : x.toFixed(d);
    return LANG === "fr" ? s.replace(".", ",") : s;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normalGen(seed) {
    var u = mulberry32(seed), spare = null;
    return function () {
      if (spare !== null) { var r = spare; spare = null; return r; }
      var a = u() || 1e-12, b = u();
      var m = Math.sqrt(-2 * Math.log(a));
      spare = m * Math.sin(2 * Math.PI * b);
      return m * Math.cos(2 * Math.PI * b);
    };
  }
  var SQ2PI = Math.sqrt(2 * Math.PI);
  function phi(x, m, v) { m = m || 0; v = v || 1; return Math.exp(-(x - m) * (x - m) / (2 * v)) / Math.sqrt(2 * Math.PI * v); }
  function erf(x) { // Abramowitz–Stegun 7.1.26 (|erreur| < 1.5e-7)
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  function Phi(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
  function PhiInv(p) { var lo = -10, hi = 10; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (Phi(mid) < p) lo = mid; else hi = mid; } return (lo + hi) / 2; }
  function linspace(a, b, n) { var r = new Float64Array(n); for (var i = 0; i < n; i++) r[i] = a + (b - a) * i / (n - 1); return r; }
  function sortedCopy(a) { return Float64Array.from(a).sort(); }
  function w1Sorted(a, b) { var s = 0, n = Math.min(a.length, b.length); for (var i = 0; i < n; i++) s += Math.abs(a[i] - b[i]); return s / n; }

  /* ---------- thème et dessin ---------- */
  function lum(hex) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(hex || "");
    if (!m) return 1;
    return (0.2126 * parseInt(m[1], 16) + 0.7152 * parseInt(m[2], 16) + 0.0722 * parseInt(m[3], 16)) / 255;
  }
  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var g = function (n, d) { var v = cs.getPropertyValue(n).trim(); return v || d; };
    var bg = g("--bg", "#ffffff"), dark = lum(bg) < 0.5;
    return {
      bg: bg, ink: g("--ink", "#0a0a0a"), soft: g("--soft", "#1f2937"), hair: g("--hair", "#6b7280"), dark: dark,
      grid: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.09)",
      c1: dark ? "#3987e5" : "#2a78d6", c2: dark ? "#d95926" : "#eb6834", c3: dark ? "#199e70" : "#1baf7a",
      c1a: dark ? "rgba(57,135,229,0.40)" : "rgba(42,120,214,0.30)",
      c3a: dark ? "rgba(25,158,112,0.42)" : "rgba(27,175,122,0.32)",
      c2a: dark ? "rgba(217,89,38,0.40)" : "rgba(235,104,52,0.28)"
    };
  }
  function niceTicks(a, b, n) {
    var span = b - a; if (!(span > 0)) return [a];
    var step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var e = span / n / step;
    step *= e >= 5 ? 5 : e >= 2 ? 2 : 1;
    var out = [], t = Math.ceil(a / step - 1e-9) * step;
    for (; t <= b + 1e-9 * step; t += step) out.push(Math.abs(t) < 1e-12 ? 0 : t);
    return out;
  }
  function tickLabel(t) {
    var s = Math.abs(t) >= 100 || Number.isInteger(Math.round(t * 1000) / 1000) && Math.abs(t - Math.round(t)) < 1e-9 ? String(Math.round(t)) : String(Math.round(t * 100) / 100);
    s = s.replace("-", "−");
    return LANG === "fr" ? s.replace(".", ",") : s;
  }
  // Repère : box = {x, y, w, h} en pixels CSS ; xr, yr = [min, max]
  function axes(ctx, P, box, xr, yr, opt) {
    opt = opt || {};
    var X = function (v) { return box.x + (v - xr[0]) / (xr[1] - xr[0]) * box.w; };
    var Y = opt.logy
      ? function (v) { return box.y + box.h - (Math.log10(Math.max(v, 1e-300)) - Math.log10(yr[0])) / (Math.log10(yr[1]) - Math.log10(yr[0])) * box.h; }
      : function (v) { return box.y + box.h - (v - yr[0]) / (yr[1] - yr[0]) * box.h; };
    ctx.save();
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.lineWidth = 1;
    ctx.strokeStyle = P.grid; ctx.fillStyle = P.soft;
    var xt = niceTicks(xr[0], xr[1], opt.nx || 6);
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    xt.forEach(function (t) {
      var px = X(t);
      ctx.beginPath(); ctx.moveTo(px, box.y); ctx.lineTo(px, box.y + box.h); ctx.stroke();
      if (!opt.noXLabels) ctx.fillText(tickLabel(t), px, box.y + box.h + 4);
    });
    if (!opt.noY) {
      var yt = opt.logy ? (function () { var r = []; for (var k = Math.ceil(Math.log10(yr[0])); k <= Math.floor(Math.log10(yr[1])); k++) r.push(Math.pow(10, k)); return r; })()
                        : niceTicks(yr[0], yr[1], opt.ny || 4);
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      yt.forEach(function (t) {
        var py = Y(t);
        ctx.beginPath(); ctx.moveTo(box.x, py); ctx.lineTo(box.x + box.w, py); ctx.stroke();
        var lab = opt.logy ? (t === 1 ? "1" : "10" + supers(Math.round(Math.log10(t)))) : tickLabel(t);
        ctx.fillText(lab, box.x - 5, py);
      });
    }
    ctx.strokeStyle = P.hair; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(box.x, box.y + box.h); ctx.lineTo(box.x + box.w, box.y + box.h); ctx.stroke();
    if (!opt.noY) { ctx.beginPath(); ctx.moveTo(box.x, box.y); ctx.lineTo(box.x, box.y + box.h); ctx.stroke(); }
    if (opt.title) {
      ctx.fillStyle = P.ink; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.font = "600 12.5px system-ui, -apple-system, Segoe UI, sans-serif";
      ctx.fillText(opt.title, box.x, box.y - 5);
    }
    ctx.restore();
    return { X: X, Y: Y };
  }
  function supers(k) { var m = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" }; return String(k).split("").map(function (c) { return m[c] || c; }).join(""); }
  function polyline(ctx, xs, ys, T, color, width, dash) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width || 2; if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    for (var i = 0; i < xs.length; i++) { var px = T.X(xs[i]), py = T.Y(ys[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
  }
  function fillUnder(ctx, xs, ys, T, color, y0) {
    ctx.save(); ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo(T.X(xs[0]), T.Y(y0 || 0));
    for (var i = 0; i < xs.length; i++) ctx.lineTo(T.X(xs[i]), T.Y(ys[i]));
    ctx.lineTo(T.X(xs[xs.length - 1]), T.Y(y0 || 0)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function histo(values, weights, a, b, nb) {
    var h = new Float64Array(nb), tot = 0, dx = (b - a) / nb;
    for (var i = 0; i < values.length; i++) {
      var w = weights ? weights[i] : 1; tot += w;
      var k = Math.floor((values[i] - a) / dx);
      if (k >= 0 && k < nb) h[k] += w;
    }
    for (var j = 0; j < nb; j++) h[j] /= (tot * dx);
    return h;
  }
  function drawHist(ctx, h, a, b, T, fill, stroke) {
    var nb = h.length, dx = (b - a) / nb;
    ctx.save();
    for (var k = 0; k < nb; k++) {
      if (h[k] <= 0) continue;
      var x0 = T.X(a + k * dx), x1 = T.X(a + (k + 1) * dx), y = T.Y(h[k]), y0 = T.Y(0);
      if (fill) { ctx.fillStyle = fill; ctx.fillRect(x0 + 0.5, y, Math.max(0.5, x1 - x0 - 1), y0 - y); }
    }
    if (stroke) {
      ctx.strokeStyle = stroke; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(T.X(a), T.Y(0));
      for (var j = 0; j < nb; j++) { ctx.lineTo(T.X(a + j * dx), T.Y(h[j])); ctx.lineTo(T.X(a + (j + 1) * dx), T.Y(h[j])); }
      ctx.lineTo(T.X(b), T.Y(0)); ctx.stroke();
    }
    ctx.restore();
  }

  /* ---------- squelette commun d'un widget ---------- */
  function makeWidget(el, alt) {
    var controls = document.createElement("div"); controls.className = "widget-controls";
    var canvas = document.createElement("canvas"); canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", alt);
    var read = document.createElement("p"); read.className = "widget-readout"; read.setAttribute("aria-live", "polite");
    var note = el.querySelector(".widget-note");
    el.insertBefore(controls, note); el.insertBefore(canvas, note); el.insertBefore(read, note);
    var W = { el: el, controls: controls, canvas: canvas, read: read, draw: function () {} };
    W.size = function (aspectWide, aspectNarrow) {
      var w = Math.max(260, Math.round(canvas.getBoundingClientRect().width || el.clientWidth || 600));
      var narrow = w < 560;
      var h = Math.round(w * (narrow ? aspectNarrow : aspectWide));
      var dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      var ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var P = palette();
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
      return { ctx: ctx, w: w, h: h, narrow: narrow, P: P };
    };
    return W;
  }
  function slider(W, label, min, max, step, value, format, onChange) {
    var lab = document.createElement("label");
    var span = document.createElement("span"); span.textContent = label;
    var input = document.createElement("input"); input.type = "range"; input.min = min; input.max = max; input.step = step; input.value = value;
    var out = document.createElement("output"); out.className = "widget-readout";
    lab.appendChild(span); lab.appendChild(input); lab.appendChild(out); W.controls.appendChild(lab);
    var upd = function (fire) { out.textContent = format(+input.value); if (fire !== false) onChange(+input.value); };
    input.addEventListener("input", function () { upd(true); });
    upd(false);
    return { input: input, get: function () { return +input.value; }, set: function (v, fire) { input.value = v; upd(fire); } };
  }
  function button(W, label, onClick) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = label;
    b.addEventListener("click", onClick); W.controls.appendChild(b); return b;
  }
  function select(W, label, options, onChange) {
    var lab = document.createElement("label"); var span = document.createElement("span"); span.textContent = label;
    var sel = document.createElement("select");
    options.forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; sel.appendChild(op); });
    sel.addEventListener("change", function () { onChange(sel.value); });
    lab.appendChild(span); lab.appendChild(sel); W.controls.appendChild(lab); return sel;
  }
  function readout(W, pairs) {
    W.read.textContent = pairs.map(function (p) { return p[0] + " = " + p[1]; }).join(" · ");
  }

  /* ======================= 1. Mesure image et jacobien ======================= */
  function wPushforward(el) {
    var W = makeWidget(el, S.alt1);
    var st = { a: 0.3, s: 1.0 };
    var g = normalGen(11), N = 20000, xs = new Float64Array(N);
    for (var i = 0; i < N; i++) xs[i] = g();
    var qEdges = []; for (var k = 1; k < 10; k++) qEdges.push(PhiInv(k / 10));
    var T = function (x) { return st.s * (x + st.a * Math.sin(2 * x)); };
    var Tp = function (x) { return st.s * (1 + 2 * st.a * Math.cos(2 * x)); };
    var Tinv = function (y) { var lo = -14, hi = 14; for (var it = 0; it < 70; it++) { var m = (lo + hi) / 2; if (T(m) < y) lo = m; else hi = m; } return (lo + hi) / 2; };
    slider(W, S.a, -0.45, 0.45, 0.01, st.a, function (v) { return fmt(v, 2); }, function (v) { st.a = v; W.draw(); });
    slider(W, S.s, 0.5, 1.8, 0.01, st.s, function (v) { return fmt(v, 2); }, function (v) { st.s = v; W.draw(); });
    W.draw = function () {
      var G = W.size(0.62, 0.95), ctx = G.ctx, P = G.P;
      var L = 46, R = 12, top = 24, gap = G.h * 0.16;
      var hTop = (G.h - top - gap - 40) * 0.42, hBot = (G.h - top - gap - 40) * 0.58;
      var xr = [-6, 6];
      var bTop = { x: L, y: top, w: G.w - L - R, h: hTop };
      var bBot = { x: L, y: top + hTop + gap + 4, w: G.w - L - R, h: hBot };
      var grid = linspace(-6, 6, 961);
      var pX = Array.from(grid, function (x) { return phi(x); });
      var At = axes(ctx, P, bTop, xr, [0, 0.45], { title: S.topX, ny: 3, noXLabels: true });
      // Tranches de probabilité 0,1 de X
      var edges = [-6].concat(qEdges, [6]);
      for (var b = 0; b < 10; b++) {
        var seg = linspace(edges[b], edges[b + 1], 60);
        fillUnder(ctx, seg, Array.from(seg, function (x) { return phi(x); }), At, b % 2 ? P.c3a : P.c1a);
      }
      polyline(ctx, grid, pX, At, P.c1, 2);
      // Densité de Y par la formule du jacobien
      var yv = linspace(-6, 6, 961), pY = new Float64Array(yv.length), integ = 0, mx = 0;
      for (var j = 0; j < yv.length; j++) { var xi = Tinv(yv[j]); pY[j] = phi(xi) / Math.abs(Tp(xi)); integ += pY[j] * (yv[1] - yv[0]); if (pY[j] > mx) mx = pY[j]; }
      var hist = histo(Array.from(xs, T), null, -6, 6, 96);
      var hm = Math.max(mx, Math.max.apply(null, hist)) * 1.08;
      var Ab = axes(ctx, P, bBot, xr, [0, hm], { title: S.botY, ny: 3 });
      var yEdges = edges.map(function (e, idx) { return idx === 0 || idx === 10 ? e : T(e); });
      for (var c = 0; c < 10; c++) {
        var a0 = Math.max(-6, yEdges[c]), a1 = Math.min(6, yEdges[c + 1]);
        if (a1 <= a0) continue;
        var sg = linspace(a0, a1, 60);
        fillUnder(ctx, sg, Array.from(sg, function (y) { var x = Tinv(y); return phi(x) / Math.abs(Tp(x)); }), Ab, c % 2 ? P.c3a : P.c1a);
      }
      drawHist(ctx, hist, -6, 6, Ab, null, P.soft);
      polyline(ctx, yv, pY, Ab, P.c2, 2);
      // Liens x -> T(x) entre les deux axes
      ctx.save();
      var yA = bTop.y + bTop.h, yB = bBot.y - 20;
      ctx.strokeStyle = P.hair; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.6;
      for (var x = -3.5; x <= 3.51; x += 0.25) { ctx.beginPath(); ctx.moveTo(At.X(x), yA); ctx.lineTo(Ab.X(T(x)), yB); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.lineWidth = 1.6; ctx.strokeStyle = P.ink;
      qEdges.forEach(function (e) { ctx.beginPath(); ctx.moveTo(At.X(e), yA); ctx.lineTo(Ab.X(T(e)), yB); ctx.stroke(); });
      ctx.fillStyle = P.soft; ctx.font = "italic 12px system-ui, sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(S.mapLbl, bTop.x + bTop.w, (yA + yB) / 2);
      ctx.restore();
      var minTp = Infinity; for (var z = -6; z <= 6; z += 0.01) minTp = Math.min(minTp, Tp(z));
      var err = 0, dx = 12 / 96;
      for (var q = 0; q < 96; q++) { var yc = -6 + (q + 0.5) * dx, xc = Tinv(yc); err = Math.max(err, Math.abs(hist[q] - phi(xc) / Math.abs(Tp(xc)))); }
      readout(W, [[S.mintp, fmt(minTp, 3)], [S.integral, fmt(integ, 3)], [S.histerr, fmt(err, 3)]]);
    };
    return W;
  }

  /* ======================= 2. Inclinaison exponentielle et ESS ======================= */
  function wTilt(el) {
    var W = makeWidget(el, S.alt2);
    var s = 0.5, N = 4000, g = normalGen(23), u = mulberry32(5), xs = new Float64Array(N);
    for (var i = 0; i < N; i++) xs[i] = (u() < 0.5 ? -2 : 2) + s * g();
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    function newton(c) {
      if (c <= xmin || c >= xmax) return null;
      var lam = 0, w = new Float64Array(N);
      for (var it = 0; it < 200; it++) {
        var amax = -Infinity, k; for (k = 0; k < N; k++) amax = Math.max(amax, lam * xs[k]);
        var Z = 0, m1 = 0, m2 = 0;
        for (k = 0; k < N; k++) { w[k] = Math.exp(lam * xs[k] - amax); Z += w[k]; m1 += w[k] * xs[k]; m2 += w[k] * xs[k] * xs[k]; }
        m1 /= Z; m2 /= Z;
        var grad = m1 - c, hess = Math.max(m2 - m1 * m1, 1e-12);
        if (Math.abs(grad) < 1e-10) break;
        var step = grad / hess; if (Math.abs(step) > 5) step = 5 * Math.sign(step);
        lam -= step;
      }
      var Zs = 0, Z2 = 0, kl = 0, mx = -Infinity, q;
      for (q = 0; q < N; q++) mx = Math.max(mx, lam * xs[q]);
      for (q = 0; q < N; q++) { w[q] = Math.exp(lam * xs[q] - mx); Zs += w[q]; Z2 += w[q] * w[q]; }
      for (q = 0; q < N; q++) { var p = w[q] / Zs; if (p > 0) kl += p * Math.log(N * p); }
      return { lam: lam, w: w, ess: Zs * Zs / Z2, kl: kl };
    }
    function lmgf(l) { var a = -2 * l + l * l * s * s / 2, b = 2 * l + l * l * s * s / 2, m = Math.max(a, b); return m + Math.log(0.5 * Math.exp(a - m) + 0.5 * Math.exp(b - m)); }
    function meanExact(l) { var a = -2 * l, b = 2 * l, m = Math.max(a, b), pa = Math.exp(a - m), pb = Math.exp(b - m); return (pa * (-2 + l * s * s) + pb * (2 + l * s * s)) / (pa + pb); }
    function lamExact(c) { var lo = -80, hi = 80; for (var it = 0; it < 100; it++) { var m = (lo + hi) / 2; if (meanExact(m) < c) lo = m; else hi = m; } return (lo + hi) / 2; }
    var curve = [];
    for (var c = -3.6; c <= 3.601; c += 0.05) {
      var le = lamExact(c), r = newton(c);
      curve.push({ c: c, th: Math.exp(2 * lmgf(le) - lmgf(2 * le)), emp: r ? r.ess / N : null });
    }
    var st = { c: 1.5 };
    slider(W, S.c, -3.9, 3.9, 0.05, st.c, function (v) { return fmt(v, 2); }, function (v) { st.c = v; W.draw(); });
    W.draw = function () {
      var G = W.size(0.46, 1.2), ctx = G.ctx, P = G.P;
      var b1, b2;
      if (G.narrow) { b1 = { x: 44, y: 24, w: G.w - 56, h: G.h * 0.42 }; b2 = { x: 44, y: G.h * 0.42 + 76, w: G.w - 56, h: G.h * 0.42 - 60 }; }
      else { b1 = { x: 44, y: 24, w: G.w * 0.56 - 50, h: G.h - 56 }; b2 = { x: G.w * 0.56 + 40, y: 24, w: G.w * 0.44 - 52, h: G.h - 56 }; }
      var r = newton(st.c), le = lamExact(st.c);
      var grid = linspace(-4.5, 4.5, 600);
      var pa = Math.exp(-2 * le + le * le * s * s / 2 - lmgf(le)) * 0.5, pb = 1 - pa;
      var dens = Array.from(grid, function (x) { return pa * phi(x, -2 + le * s * s, s * s) + pb * phi(x, 2 + le * s * s, s * s); });
      var hb = histo(xs, null, -4.5, 4.5, 90), ht = r ? histo(xs, r.w, -4.5, 4.5, 90) : null;
      var ym = Math.max(Math.max.apply(null, hb), ht ? Math.max.apply(null, ht) : 0, Math.max.apply(null, dens)) * 1.1;
      ym = Math.min(Math.max(ym * 1.35, 0.6), 3.4);
      var A = axes(ctx, P, b1, [-4.5, 4.5], [0, ym], { title: S.tiltH + " / " + S.tiltE, ny: 4 });
      drawHist(ctx, hb, -4.5, 4.5, A, null, P.soft);
      if (ht) drawHist(ctx, ht, -4.5, 4.5, A, P.c1a, null);
      polyline(ctx, grid, dens.map(function (v) { return Math.min(v, ym); }), A, P.c2, 2);
      ctx.save(); ctx.strokeStyle = P.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(A.X(st.c), b1.y); ctx.lineTo(A.X(st.c), b1.y + b1.h); ctx.stroke(); ctx.restore();
      // Légende
      ctx.save(); ctx.font = "12px system-ui, sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      var lx = b1.x + 8, ly = b1.y + 12;
      [[P.soft, S.baseH, "line"], [P.c1a, S.tiltH, "box"], [P.c2, S.tiltE, "line"]].forEach(function (it, k) {
        var yy = ly + 16 * k;
        if (it[2] === "box") { ctx.fillStyle = it[0]; ctx.fillRect(lx, yy - 5, 14, 10); }
        else { ctx.strokeStyle = it[0]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + 14, yy); ctx.stroke(); }
        ctx.fillStyle = P.ink; ctx.fillText(it[1], lx + 20, yy);
      });
      ctx.restore();
      var B = axes(ctx, P, b2, [-3.6, 3.6], [1e-4, 1.5], { title: S.essCurve, logy: true, nx: 4 });
      polyline(ctx, curve.map(function (p) { return p.c; }), curve.map(function (p) { return Math.max(p.th, 1e-4); }), B, P.c2, 2);
      ctx.save(); ctx.fillStyle = P.c1;
      curve.forEach(function (p, k) { if (p.emp !== null && k % 2 === 0) { ctx.beginPath(); ctx.arc(B.X(p.c), B.Y(Math.max(p.emp, 1e-4)), 2.6, 0, 2 * Math.PI); ctx.fill(); } });
      ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
      var cur = r ? r.ess / N : 1 / N;
      ctx.beginPath(); ctx.arc(B.X(Math.max(-3.6, Math.min(3.6, st.c))), B.Y(Math.max(cur, 1e-4)), 6, 0, 2 * Math.PI); ctx.stroke();
      ctx.restore();
      if (r) readout(W, [[S.lamS, fmt(r.lam, 3)], [S.lamE, fmt(le, 3)], [S.ess, fmt(r.ess / N, 4)], [S.kl, fmt(r.kl, 3)]]);
      else W.read.textContent = S.infeas + " (min x_i = " + fmt(xmin, 2) + ", max x_i = " + fmt(xmax, 2) + ")";
    };
    return W;
  }

  /* ======================= 3. Wasserstein 1D, énergie, KL ======================= */
  function wWasserstein(el) {
    var W = makeWidget(el, S.alt3);
    var st = { m: 1.0, s: 1.0, d: 0 };
    slider(W, S.m, -3, 3, 0.05, st.m, function (v) { return fmt(v, 2); }, function (v) { st.m = v; W.draw(); });
    slider(W, S.sd, 0.1, 3, 0.05, st.s, function (v) { return fmt(v, 2); }, function (v) { st.s = v; W.draw(); });
    slider(W, S.d, 0, 3, 0.05, st.d, function (v) { return fmt(v, 2); }, function (v) { st.d = v; W.draw(); });
    var n = 6001, xg = linspace(-12, 12, n), dx = xg[1] - xg[0];
    W.draw = function () {
      var G = W.size(0.44, 1.15), ctx = G.ctx, P = G.P;
      var f = new Float64Array(n), g = new Float64Array(n), F = new Float64Array(n), Gc = new Float64Array(n);
      var v = st.s * st.s;
      for (var i = 0; i < n; i++) {
        f[i] = phi(xg[i]);
        g[i] = 0.5 * phi(xg[i], st.m - st.d, v) + 0.5 * phi(xg[i], st.m + st.d, v);
        F[i] = Phi(xg[i]);
        Gc[i] = 0.5 * Phi((xg[i] - st.m + st.d) / st.s) + 0.5 * Phi((xg[i] - st.m - st.d) / st.s);
      }
      var w1 = 0, de = 0, kl = 0;
      for (i = 0; i < n; i++) {
        var dF = F[i] - Gc[i]; w1 += Math.abs(dF) * dx; de += 2 * dF * dF * dx;
        if (g[i] > 1e-300) kl += g[i] * (Math.log(g[i]) - (-xg[i] * xg[i] / 2 - Math.log(SQ2PI))) * dx;
      }
      // W2 par les fonctions quantiles
      var nu = 2000, w2 = 0, iF = 0, iG = 0;
      for (var k = 0; k < nu; k++) {
        var uu = (k + 0.5) / nu;
        while (iF < n - 2 && F[iF + 1] < uu) iF++;
        while (iG < n - 2 && Gc[iG + 1] < uu) iG++;
        var qf = xg[iF] + (uu - F[iF]) / Math.max(F[iF + 1] - F[iF], 1e-300) * dx;
        var qg = xg[iG] + (uu - Gc[iG]) / Math.max(Gc[iG + 1] - Gc[iG], 1e-300) * dx;
        w2 += (qf - qg) * (qf - qg) / nu;
      }
      w2 = Math.sqrt(w2);
      var b1, b2;
      if (G.narrow) { b1 = { x: 42, y: 24, w: G.w - 54, h: G.h * 0.4 }; b2 = { x: 42, y: G.h * 0.4 + 70, w: G.w - 54, h: G.h * 0.45 - 50 }; }
      else { b1 = { x: 42, y: 24, w: G.w / 2 - 56, h: G.h - 56 }; b2 = { x: G.w / 2 + 36, y: 24, w: G.w / 2 - 48, h: G.h - 56 }; }
      var lo = Math.floor(n * (6 / 24)), hi = Math.ceil(n * (18 / 24));
      var xs = xg.subarray(lo, hi), fs = f.subarray(lo, hi), gs = g.subarray(lo, hi);
      var ym = Math.min(Math.max(0.45, Math.max.apply(null, gs) * 1.08), 4.2);
      var A = axes(ctx, P, b1, [-6, 6], [0, ym], { title: S.dens, ny: 4 });
      fillUnder(ctx, xs, fs, A, P.c1a); polyline(ctx, xs, fs, A, P.c1, 2);
      polyline(ctx, xs, Array.from(gs, function (z) { return Math.min(z, ym); }), A, P.c2, 2);
      var B = axes(ctx, P, b2, [-6, 6], [0, 1], { title: S.cdf, ny: 4 });
      ctx.save(); ctx.fillStyle = P.c3a; ctx.beginPath();
      ctx.moveTo(B.X(xs[0]), B.Y(F[lo]));
      for (i = lo; i < hi; i++) ctx.lineTo(B.X(xg[i]), B.Y(F[i]));
      for (i = hi - 1; i >= lo; i--) ctx.lineTo(B.X(xg[i]), B.Y(Gc[i]));
      ctx.closePath(); ctx.fill(); ctx.restore();
      polyline(ctx, xs, F.subarray(lo, hi), B, P.c1, 2);
      polyline(ctx, xs, Gc.subarray(lo, hi), B, P.c2, 2);
      readout(W, [[S.w1, fmt(w1, 3)], [S.w2, fmt(w2, 3)], [S.de, fmt(de, 3)], [S.klnm, fmt(kl, 3)]]);
    };
    return W;
  }

  /* ======================= 4. Ornstein–Uhlenbeck : Euler–Maruyama et Fokker–Planck ======================= */
  function wOU(el) {
    var W = makeWidget(el, S.alt4);
    var DTS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
    var st = { theta: 2, sigma: 1, idt: 4, x0: 1.5, t: 0, running: false };
    var N = 3000, NT = 25, TMAX = 8, X = new Float64Array(N), gen = normalGen(31), traces = [], raf = null;
    function reset() {
      st.t = 0; for (var i = 0; i < N; i++) X[i] = st.x0;
      traces = []; for (var k = 0; k < NT; k++) traces.push([[0, st.x0]]);
    }
    function stepOnce() {
      var dt = DTS[st.idt], sq = st.sigma * Math.sqrt(dt);
      for (var i = 0; i < N; i++) { X[i] = X[i] - st.theta * X[i] * dt + sq * gen(); if (!isFinite(X[i]) || Math.abs(X[i]) > 1e6) X[i] = Math.sign(X[i]) * 1e6 || 1e6; }
      st.t += dt;
      for (var k = 0; k < NT; k++) traces[k].push([st.t, X[k]]);
    }
    function frame() {
      var dt = DTS[st.idt], n = Math.max(1, Math.round(0.04 / dt));
      for (var j = 0; j < n && st.t < TMAX - 1e-9; j++) stepOnce();
      W.draw();
      if (st.t >= TMAX - 1e-9) { st.running = false; runBtn.textContent = S.run; raf = null; return; }
      if (st.running) raf = requestAnimationFrame(frame);
    }
    function restart() { st.running = false; if (raf) cancelAnimationFrame(raf); raf = null; runBtn.textContent = S.run; reset(); W.draw(); }
    slider(W, S.theta, 0.2, 4, 0.1, st.theta, function (v) { return fmt(v, 1); }, function (v) { st.theta = v; restart(); });
    slider(W, S.sigma, 0.2, 2, 0.05, st.sigma, function (v) { return fmt(v, 2); }, function (v) { st.sigma = v; restart(); });
    slider(W, S.dt, 0, DTS.length - 1, 1, st.idt, function (v) { return fmt(DTS[v], DTS[v] < 0.01 ? 3 : 2); }, function (v) { st.idt = v; restart(); });
    slider(W, S.x0, -3, 3, 0.1, st.x0, function (v) { return fmt(v, 1); }, function (v) { st.x0 = v; restart(); });
    var runBtn = button(W, S.run, function () {
      if (st.t >= TMAX - 1e-9) reset();
      st.running = !st.running; runBtn.textContent = st.running ? S.pause : S.run;
      if (st.running) raf = requestAnimationFrame(frame);
    });
    button(W, S.reset, restart);
    reset();
    W.draw = function () {
      var G = W.size(0.46, 1.2), ctx = G.ctx, P = G.P;
      var b1, b2;
      if (G.narrow) { b1 = { x: 42, y: 24, w: G.w - 54, h: G.h * 0.4 }; b2 = { x: 42, y: G.h * 0.4 + 70, w: G.w - 54, h: G.h * 0.45 - 50 }; }
      else { b1 = { x: 42, y: 24, w: G.w * 0.55 - 52, h: G.h - 56 }; b2 = { x: G.w * 0.55 + 34, y: 24, w: G.w * 0.45 - 46, h: G.h - 56 }; }
      var vinf = st.sigma * st.sigma / (2 * st.theta);
      var R = Math.max(4 * Math.sqrt(vinf), Math.abs(st.x0) + 0.5, 1.5);
      var A = axes(ctx, P, b1, [0, TMAX], [-R, R], { title: S.traj, ny: 4 });
      // Bande exacte moyenne ± 2 écarts-types
      var tg = linspace(0, TMAX, 300), up = [], dn = [];
      for (var i = 0; i < tg.length; i++) {
        var m = st.x0 * Math.exp(-st.theta * tg[i]), v = vinf * (1 - Math.exp(-2 * st.theta * tg[i]));
        up.push(m + 2 * Math.sqrt(v)); dn.push(m - 2 * Math.sqrt(v));
      }
      ctx.save(); ctx.fillStyle = P.c1a; ctx.beginPath(); ctx.moveTo(A.X(tg[0]), A.Y(up[0]));
      for (i = 1; i < tg.length; i++) ctx.lineTo(A.X(tg[i]), A.Y(Math.min(up[i], R)));
      for (i = tg.length - 1; i >= 0; i--) ctx.lineTo(A.X(tg[i]), A.Y(Math.max(dn[i], -R)));
      ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(b1.x, b1.y, b1.w, b1.h); ctx.clip();
      traces.forEach(function (tr) {
        ctx.strokeStyle = P.soft; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.8; ctx.beginPath();
        tr.forEach(function (p, k) { var px = A.X(p[0]), py = A.Y(p[1]); if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
        ctx.stroke();
      });
      ctx.restore();
      ctx.save(); ctx.strokeStyle = P.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(A.X(st.t), b1.y); ctx.lineTo(A.X(st.t), b1.y + b1.h); ctx.stroke(); ctx.restore();
      var h = histo(X, null, -R, R, 60);
      var xx = linspace(-R, R, 400);
      var mt = st.x0 * Math.exp(-st.theta * st.t), vtEx = vinf * (1 - Math.exp(-2 * st.theta * st.t)), vt = Math.max(vtEx, 1e-4);
      var pinf = Array.from(xx, function (x) { return phi(x, 0, vinf); });
      var ptt = Array.from(xx, function (x) { return phi(x, mt, vt); });
      var ym = Math.max(Math.max.apply(null, pinf) * 1.6, 0.5);
      ym = Math.min(Math.max(ym, Math.max.apply(null, h) * 1.05), Math.max.apply(null, pinf) * 4);
      var B = axes(ctx, P, b2, [-R, R], [0, ym], { title: S.histo, ny: 4, nx: 4 });
      ctx.save(); ctx.beginPath(); ctx.rect(b2.x, b2.y, b2.w, b2.h); ctx.clip();
      drawHist(ctx, h, -R, R, B, P.c3a, null);
      polyline(ctx, xx, ptt, B, P.c3, 2, [6, 4]);
      polyline(ctx, xx, pinf, B, P.c2, 2);
      ctx.restore();
      var me = 0, ve = 0; for (i = 0; i < N; i++) me += X[i]; me /= N; for (i = 0; i < N; i++) ve += (X[i] - me) * (X[i] - me); ve /= N;
      var dt = DTS[st.idt], th = st.theta * dt;
      var vd = th < 2 ? fmt(st.sigma * st.sigma / (st.theta * (2 - th)), 3) : S.unstable;
      readout(W, [[S.t, fmt(st.t, 2)], [S.meanE, fmt(me, 3) + " / " + fmt(mt, 3)], [S.varE, fmt(ve, 3) + " / " + fmt(vtEx, 3)], [S.vdisc, vd]]);
    };
    return W;
  }

  /* ======================= 5. Équation de continuité et flow matching ======================= */
  function wFlow(el) {
    var W = makeWidget(el, S.alt5);
    var pis = [0.5, 0.5], ms = [-2, 2], ss = [0.4, 0.4];
    function pt(x, t) { var r = 0; for (var k = 0; k < 2; k++) r += pis[k] * phi(x, t * ms[k], (1 - t) * (1 - t) + t * t * ss[k] * ss[k]); return r; }
    function vel(x, t) {
      var num = 0, den = 0;
      for (var k = 0; k < 2; k++) {
        var va = (1 - t) * (1 - t) + t * t * ss[k] * ss[k], cv = t * ss[k] * ss[k] - (1 - t);
        var w = pis[k] * phi(x, t * ms[k], va);
        num += w * (ms[k] + cv / va * (x - t * ms[k])); den += w;
      }
      return den > 1e-300 ? num / den : (x > 0 ? 1 : -1) * 0;
    }
    var N = 3000, NS = 100, g = normalGen(41), u = mulberry32(9);
    var x0 = new Float64Array(N), x1 = new Float64Array(N);
    for (var i = 0; i < N; i++) { x0[i] = g(); x1[i] = (u() < 0.5 ? -2 : 2) + 0.4 * g(); }
    var ode = new Float64Array((NS + 1) * N), z = Float64Array.from(x0), tau = 1 / NS;
    ode.set(z, 0);
    for (var n = 0; n < NS; n++) {
      var t = n * tau;
      for (i = 0; i < N; i++) {
        var a = z[i], k1 = vel(a, t), k2 = vel(a + tau / 2 * k1, t + tau / 2), k3 = vel(a + tau / 2 * k2, t + tau / 2), k4 = vel(a + tau * k3, t + tau);
        z[i] = a + tau / 6 * (k1 + 2 * k2 + 2 * k3 + k4);
      }
      ode.set(z, (n + 1) * N);
    }
    var show = []; for (i = 0; i < 36; i++) show.push(Math.floor(i * N / 36));
    var st = { t: 0.5, mode: "cond" }, raf = null, heat = null, heatKey = "";
    function odeAt(t) {
      var f = t * NS, n0 = Math.min(NS - 1, Math.floor(f)), r = f - n0, out = new Float64Array(N);
      for (var i = 0; i < N; i++) out[i] = (1 - r) * ode[n0 * N + i] + r * ode[(n0 + 1) * N + i];
      return out;
    }
    function condAt(t) { var out = new Float64Array(N); for (var i = 0; i < N; i++) out[i] = (1 - t) * x0[i] + t * x1[i]; return out; }
    var tS = slider(W, S.tt, 0, 1, 0.01, st.t, function (v) { return fmt(v, 2); }, function (v) { st.t = v; W.draw(); });
    select(W, S.mode, [["cond", S.cond], ["ode", S.ode]], function (v) { st.mode = v; W.draw(); });
    button(W, S.anim, function () {
      if (raf) cancelAnimationFrame(raf);
      var t0 = null;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var t = Math.min(1, (ts - t0) / 3500);
        tS.set(t, true);
        if (t < 1) raf = requestAnimationFrame(step); else raf = null;
      };
      raf = requestAnimationFrame(step);
    });
    function heatmap(P) {
      var key = P.c1 + P.bg;
      if (heat && heatKey === key) return heat;
      var nx = 140, nt = 100, cv = document.createElement("canvas"); cv.width = nt; cv.height = nx;
      var c = cv.getContext("2d"), img = c.createImageData(nt, nx), mx = 0, vals = new Float64Array(nt * nx);
      for (var j = 0; j < nx; j++) for (var k = 0; k < nt; k++) { var v = Math.sqrt(pt(4 - 8 * (j + 0.5) / nx, (k + 0.5) / nt)); vals[j * nt + k] = v; if (v > mx) mx = v; }
      var rgb = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(P.c1);
      for (var q = 0; q < nt * nx; q++) {
        img.data[4 * q] = parseInt(rgb[1], 16); img.data[4 * q + 1] = parseInt(rgb[2], 16); img.data[4 * q + 2] = parseInt(rgb[3], 16);
        img.data[4 * q + 3] = Math.round(200 * vals[q] / mx);
      }
      c.putImageData(img, 0, 0); heat = cv; heatKey = key; return cv;
    }
    W.draw = function () {
      var G = W.size(0.5, 1.1), ctx = G.ctx, P = G.P;
      var b1, b2;
      if (G.narrow) { b1 = { x: 40, y: 24, w: G.w - 52, h: G.h * 0.45 }; b2 = { x: 40, y: G.h * 0.45 + 70, w: G.w - 52, h: G.h * 0.4 - 50 }; }
      else { b1 = { x: 40, y: 24, w: G.w * 0.62 - 50, h: G.h - 56 }; b2 = { x: G.w * 0.62 + 20, y: 24, w: G.w * 0.38 - 32, h: G.h - 56 }; }
      var A = axes(ctx, P, b1, [0, 1], [-4, 4], { title: S.pt, ny: 4, nx: 5 });
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(heatmap(P), b1.x, b1.y, b1.w, b1.h); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(b1.x, b1.y, b1.w, b1.h); ctx.clip();
      ctx.strokeStyle = P.c2; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.9;
      show.forEach(function (i) {
        ctx.beginPath();
        if (st.mode === "cond") { ctx.moveTo(A.X(0), A.Y(x0[i])); ctx.lineTo(A.X(1), A.Y(x1[i])); }
        else { for (var n = 0; n <= NS; n++) { var px = A.X(n / NS), py = A.Y(ode[n * N + i]); if (n) ctx.lineTo(px, py); else ctx.moveTo(px, py); } }
        ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.strokeStyle = P.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(A.X(st.t), b1.y); ctx.lineTo(A.X(st.t), b1.y + b1.h); ctx.stroke();
      var cur = st.mode === "cond" ? condAt(st.t) : odeAt(st.t);
      ctx.fillStyle = P.ink;
      show.forEach(function (i) { ctx.beginPath(); ctx.arc(A.X(st.t), A.Y(cur[i]), 3, 0, 2 * Math.PI); ctx.fill(); });
      ctx.restore();
      // Histogramme horizontal (axe vertical commun avec le panneau de gauche)
      var h = histo(cur, null, -4, 4, 64), xx = linspace(-4, 4, 300), pv = Array.from(xx, function (x) { return pt(x, st.t); });
      var hm = Math.max(Math.max.apply(null, h), Math.max.apply(null, pv)) * 1.1;
      var B = axes(ctx, P, b2, [0, hm], [-4, 4], { title: S.ht, ny: 4, nx: 3 });
      ctx.save(); ctx.fillStyle = P.c1a;
      var dy = 8 / 64;
      for (var k = 0; k < 64; k++) { if (h[k] <= 0) continue; var yTop = B.Y(-4 + (k + 1) * dy), yBot = B.Y(-4 + k * dy); ctx.fillRect(B.X(0), yTop + 0.5, B.X(h[k]) - B.X(0), Math.max(0.5, yBot - yTop - 1)); }
      ctx.strokeStyle = P.c2; ctx.lineWidth = 2; ctx.beginPath();
      xx.forEach(function (x, j) { var px = B.X(pv[j]), py = B.Y(x); if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
      ctx.stroke(); ctx.restore();
      var c1 = condAt(st.t), o1 = odeAt(st.t), disp = 0;
      for (var q = 0; q < N; q++) disp += Math.abs(c1[q] - o1[q]);
      readout(W, [[S.t, fmt(st.t, 2)], [S.w1t, fmt(w1Sorted(sortedCopy(c1), sortedCopy(o1)), 3)], [S.disp, fmt(disp / N, 3)]]);
    };
    return W;
  }

  /* ---------- montage ---------- */
  var REG = { pushforward: wPushforward, tilt: wTilt, wasserstein: wWasserstein, ou: wOU, flow: wFlow };
  var widgets = [];
  function redrawAll() { widgets.forEach(function (W) { try { W.draw(); } catch (e) { if (window.console) console.error(e); } }); }
  function mount() {
    document.querySelectorAll(".widget[data-widget]").forEach(function (el) {
      var f = REG[el.getAttribute("data-widget")];
      if (!f || el.getAttribute("data-mounted")) return;
      el.setAttribute("data-mounted", "1");
      try { var W = f(el); widgets.push(W); W.draw(); } catch (e) { if (window.console) console.error(e); }
    });
    var timer = null;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(redrawAll, 120); });
    try { new MutationObserver(redrawAll).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}
    try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redrawAll); } catch (e) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
