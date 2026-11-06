/* Schémas interactifs du module p4 (systèmes dynamiques). Textes des canevas en français ou en anglais selon <html lang>.
   Interactive diagrams of module p4; canvas strings follow <html lang>. */
(function () {
  if (document.getElementById("p4w-style")) return;
  var st = document.createElement("style"); st.id = "p4w-style";
  st.textContent = '.p4w { --s1: #2a78d6; --s2: #eb6834; --s3: #1baf7a; }\n@media (prefers-color-scheme: dark) { :root:where(:not([data-theme="light"])) .p4w { --s1: #3987e5; --s2: #d95926; --s3: #199e70; } }\n:root[data-theme="dark"] .p4w { --s1: #3987e5; --s2: #d95926; --s3: #199e70; }\n.p4w .p4-row { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }\n@media (max-width: 680px) { .p4w .p4-row { grid-template-columns: 1fr; } }\n.p4w select { font: inherit; padding: .2rem .4rem; border: 2px solid var(--ink); border-radius: .4rem; background: var(--bg); color: var(--ink); }\n.p4w .p4-key { display: inline-flex; align-items: center; gap: .35rem; margin-right: 1rem; }\n.p4w .p4-sw { display: inline-block; width: .9rem; height: .9rem; border-radius: 50%; }';
  document.head.appendChild(st);
})();
window.P4 = window.P4 || (function () {
  var root = document.documentElement;
  function css(el, name, dflt) { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || dflt; }
  function lang() { return /^en/i.test(root.getAttribute("lang") || "") ? "en" : "fr"; }
  function fmt(x, d) { var s = (+x).toFixed(d); return lang() === "fr" ? s.replace(".", ",") : s; }
  function setup(canvas, ratio) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 600, h = Math.max(160, Math.round(w * ratio));
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h, el: canvas };
  }
  function frame(c, xr, yr, o) {
    o = o || {};
    var ctx = c.ctx, m = { l: 48, r: 20, t: 24, b: 36 };
    var W = c.w - m.l - m.r, H = c.h - m.t - m.b;
    var X = function (x) { return m.l + (x - xr[0]) / (xr[1] - xr[0]) * W; };
    var Y = function (y) { return m.t + (1 - (y - yr[0]) / (yr[1] - yr[0])) * H; };
    var ink = css(root, "--ink", "#000"), soft = css(root, "--soft", "#333"), hair = css(root, "--hair", "#888");
    ctx.clearRect(0, 0, c.w, c.h);
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif"; ctx.lineWidth = 1;
    ctx.strokeStyle = hair; ctx.globalAlpha = 0.3;
    (o.xt || []).forEach(function (t) { ctx.beginPath(); ctx.moveTo(X(t), m.t); ctx.lineTo(X(t), m.t + H); ctx.stroke(); });
    (o.yt || []).forEach(function (t) { ctx.beginPath(); ctx.moveTo(m.l, Y(t)); ctx.lineTo(m.l + W, Y(t)); ctx.stroke(); });
    ctx.globalAlpha = 1; ctx.strokeStyle = soft;
    ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + H); ctx.lineTo(m.l + W, m.t + H); ctx.stroke();
    ctx.fillStyle = soft; ctx.textAlign = "center"; ctx.textBaseline = "top";
    (o.xt || []).forEach(function (t) { ctx.fillText(fmt(t, o.xd || 0), X(t), m.t + H + 4); });
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    (o.yt || []).forEach(function (t) { ctx.fillText(fmt(t, o.yd || 0), m.l - 5, Y(t)); });
    ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    if (o.xl) ctx.fillText(o.xl, m.l + W / 2, c.h - 1);
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    if (o.title) { ctx.font = "bold 12px system-ui, -apple-system, Segoe UI, sans-serif"; ctx.fillText(o.title, m.l, 4); }
    ctx.font = "12px system-ui, -apple-system, Segoe UI, sans-serif";
    if (o.yl) { ctx.save(); ctx.translate(12, m.t + H / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(o.yl, 0, -8); ctx.restore(); }
    return { X: X, Y: Y, m: m, W: W, H: H, ink: ink, soft: soft, hair: hair };
  }
  function polyline(ctx, f, xs, ys, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width || 1.5; ctx.beginPath();
    for (var i = 0; i < xs.length; i++) { var px = f.X(xs[i]), py = f.Y(ys[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke();
  }
  function clip(ctx, f) { ctx.save(); ctx.beginPath(); ctx.rect(f.m.l, f.m.t, f.W, f.H); ctx.clip(); }
  function onChange(fn) {
    new MutationObserver(fn).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn); } catch (e) {}
    var t = null; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fn, 150); });
  }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(u) { var spare = null; return function () { if (spare !== null) { var s = spare; spare = null; return s; } var a = u() || 1e-12, b = u(); var r = Math.sqrt(-2 * Math.log(a)); spare = r * Math.sin(2 * Math.PI * b); return r * Math.cos(2 * Math.PI * b); }; }
  return { css: css, lang: lang, fmt: fmt, setup: setup, frame: frame, polyline: polyline, clip: clip, onChange: onChange, rng: rng, gauss: gauss, root: root };
})();

/* ---- w1.html ---- */
(function () {
  var P = window.P4, box = document.getElementById("w-bif"); if (!P || !box) return;
  var en = P.lang() === "en";
  var sel = box.querySelector("#wb-forme"), sr = box.querySelector("#wb-r"), sh = box.querySelector("#wb-h");
  var out = box.querySelector("#wb-out"), c1 = box.querySelector("#wb-c1"), c2 = box.querySelector("#wb-c2");
  var F = {
    sn: [function (x, r) { return r + x * x; }, function (x) { return 2 * x; }],
    pf: [function (x, r) { return r * x - x * x * x; }, function (x, r) { return r - 3 * x * x; }],
    sub: [function (x, r) { return r * x + x * x * x - Math.pow(x, 5); }, function (x, r) { return r + 3 * x * x - 5 * Math.pow(x, 4); }],
    imp: [function (x, r, h) { return h + r * x - x * x * x; }, function (x, r) { return r - 3 * x * x; }]
  };
  var XM = 1.6;
  function roots(f, r, h) {
    var N = 801, dx = 2 * XM / N, res = [], a = -XM + dx / 2, fa = f(a, r, h);
    for (var i = 1; i < N; i++) {
      var b = -XM + (i + 0.5) * dx, fb = f(b, r, h);
      if (fa * fb < 0) {
        var lo = a, hi = b, flo = fa;
        for (var k = 0; k < 50; k++) { var mid = (lo + hi) / 2, fm = f(mid, r, h); if (flo * fm <= 0) hi = mid; else { lo = mid; flo = fm; } }
        res.push((lo + hi) / 2);
      }
      a = b; fa = fb;
    }
    return res;
  }
  var cache = { key: "", pts: [] };
  function diagram(form, h) {
    var key = form + ":" + h; if (key === cache.key) return cache.pts;
    var pts = [], f = F[form][0], fp = F[form][1];
    for (var j = 0; j <= 600; j++) {
      var r = -1 + j / 300;
      roots(f, r, h).forEach(function (x) { var st = fp(x, r, h) < 0; if (st || j % 8 === 0) pts.push([r, x, st]); });
    }
    cache = { key: key, pts: pts }; return pts;
  }
  function marker(ctx, px, py, st, s1, s2, bg) {
    ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.lineWidth = 2.5;
    if (st) { ctx.fillStyle = s1; ctx.fill(); } else { ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = s2; ctx.stroke(); }
  }
  function draw() {
    var form = sel.value, r = +sr.value, h = form === "imp" ? +sh.value : 0;
    sh.disabled = form !== "imp";
    var f = F[form][0], fp = F[form][1];
    var s1 = P.css(box, "--s1", "#2a78d6"), s2 = P.css(box, "--s2", "#eb6834"), bg = P.css(P.root, "--bg", "#fff");
    var xs = [], ys = [], m = 0;
    for (var i = 0; i <= 320; i++) { var x = -XM + 2 * XM * i / 320, y = f(x, r, h); xs.push(x); ys.push(y); m = Math.max(m, Math.abs(y)); }
    var ym = m < 0.5 ? 0.5 : (m < 1 ? 1 : 2);
    var c = P.setup(c1, 0.75), fr = P.frame(c, [-XM, XM], [-ym, ym], { xt: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], xd: 1, yt: [-ym, -ym / 2, 0, ym / 2, ym], yd: ym < 1 ? 2 : 1, xl: "x", yl: "ẋ = f(x)", title: en ? "Vector field on the line" : "Champ de vecteurs sur la droite" });
    var ctx = c.ctx; P.clip(ctx, fr);
    ctx.strokeStyle = fr.soft; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fr.X(-XM), fr.Y(0)); ctx.lineTo(fr.X(XM), fr.Y(0)); ctx.stroke();
    P.polyline(ctx, fr, xs, ys, fr.ink, 2);
    for (var k = -8; k < 8; k++) {
      var xa = k * 0.2 + 0.1, v = f(xa, r, h); if (Math.abs(v) < 2e-3) continue;
      var d = v > 0 ? 1 : -1, px = fr.X(xa), py = fr.Y(0);
      ctx.fillStyle = fr.soft; ctx.beginPath(); ctx.moveTo(px + 6 * d, py); ctx.lineTo(px - 4 * d, py - 5); ctx.lineTo(px - 4 * d, py + 5); ctx.closePath(); ctx.fill();
    }
    var rs = roots(f, r, h), txt = [];
    rs.forEach(function (x) { var st = fp(x, r, h) < 0; marker(ctx, fr.X(x), fr.Y(0), st, s1, s2, bg); txt.push("x* = " + P.fmt(Math.abs(x) < 5e-4 ? 0 : x, 3) + (st ? " (stable)" : (en ? " (unstable)" : " (instable)"))); });
    ctx.restore();
    var c2d = P.setup(c2, 0.75), fd = P.frame(c2d, [-1, 1], [-XM, XM], { xt: [-1, -0.5, 0, 0.5, 1], xd: 1, yt: [-1.5, -1, -0.5, 0, 0.5, 1, 1.5], yd: 1, xl: "r", yl: "x*", title: en ? "Bifurcation diagram" : "Diagramme de bifurcation" });
    var cx = c2d.ctx; P.clip(cx, fd);
    diagram(form, h).forEach(function (p) { cx.fillStyle = p[2] ? s1 : s2; var s = p[2] ? 2.6 : 2.2; cx.fillRect(fd.X(p[0]) - s / 2, fd.Y(p[1]) - s / 2, s, s); });
    cx.strokeStyle = fd.ink; cx.lineWidth = 1.2; cx.setLineDash([5, 4]);
    cx.beginPath(); cx.moveTo(fd.X(r), fd.m.t); cx.lineTo(fd.X(r), fd.m.t + fd.H); cx.stroke(); cx.setLineDash([]);
    rs.forEach(function (x) { marker(cx, fd.X(r), fd.Y(x), fp(x, r, h) < 0, s1, s2, bg); });
    cx.restore();
    out.textContent = "r = " + P.fmt(r, 2) + (form === "imp" ? ", h = " + P.fmt(h, 2) : "") + " — " +
      (txt.length ? txt.join(" ; ") : (en ? "no fixed point" : "aucun point fixe"));
  }
  [sel, sr, sh].forEach(function (e) { e.addEventListener("input", draw); e.addEventListener("change", draw); });
  P.onChange(draw); draw();
})();

/* ---- w3.html ---- */
(function () {
  var P = window.P4, box = document.getElementById("w-kram"); if (!P || !box) return;
  var en = P.lang() === "en";
  var ss = box.querySelector("#wk-s"), sv = box.querySelector("#wk-sv"), btn = box.querySelector("#wk-run"), out = box.querySelector("#wk-out");
  var c1 = box.querySelector("#wk-c1"), c2 = box.querySelector("#wk-c2");
  var DT = 0.01, T = 10000, SHOW = 800, EVERY = 20, NB = 60, LO = -2.2, HI = 2.2, seed = 11, data = null;
  function U(x) { return x * x * x * x / 4 - x * x / 2; }
  function tauExact(s) {
    var a = -3, b = 1, N = 4000, h = (b - a) / N, inner = 0, outer = 0, prevI = 0, prevO = null;
    for (var i = 0; i <= N; i++) {
      var y = a + i * h, e = Math.exp(-2 * U(y) / (s * s));
      if (i > 0) inner += 0.5 * h * (e + prevI);
      prevI = e;
      if (y >= -1 - 1e-12) { var g = Math.exp(2 * U(y) / (s * s)) * inner; if (prevO !== null) outer += 0.5 * h * (g + prevO); prevO = g; }
    }
    return 2 / (s * s) * outer;
  }
  function compute() {
    var s = +ss.value, g = P.gauss(P.rng(seed)), x = -1, well = -1, nsw = 0, sq = s * Math.sqrt(DT);
    var path = new Float32Array(SHOW / DT / EVERY), hist = new Array(NB).fill(0), N = Math.round(T / DT);
    for (var n = 0; n < N; n++) {
      x += -(x * x * x - x) * DT + sq * g();
      if ((well < 0 && x > 1) || (well > 0 && x < -1)) { well = -well; nsw++; }
      if (n < SHOW / DT && n % EVERY === 0) path[n / EVERY] = x;
      var b = Math.floor((x - LO) / (HI - LO) * NB); if (b >= 0 && b < NB) hist[b]++;
    }
    var Z = 0, hz = 0.001; for (var y = -3; y <= 3; y += hz) Z += Math.exp(-2 * U(y) / (s * s)) * hz;
    data = { s: s, path: path, hist: hist.map(function (c) { return c / (N * (HI - LO) / NB); }), nsw: nsw, Z: Z,
             tauK: 2 * Math.PI / Math.SQRT2 * Math.exp(0.5 / (s * s)), tauE: tauExact(s) };
  }
  function draw() {
    if (!data) compute();
    var s1 = P.css(box, "--s1", "#2a78d6"), s2 = P.css(box, "--s2", "#eb6834");
    sv.textContent = "σ = " + P.fmt(data.s, 2);
    var c = P.setup(c1, 0.75), fr = P.frame(c, [0, SHOW], [-2, 2], { xt: [0, 200, 400, 600, 800], yt: [-2, -1, 0, 1, 2], xl: en ? "time t" : "temps t", yl: "x(t)", title: en ? "Sample path" : "Trajectoire" });
    var ctx = c.ctx; P.clip(ctx, fr);
    ctx.strokeStyle = s1; ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 0; i < data.path.length; i++) { var px = fr.X(i * EVERY * DT), py = fr.Y(data.path[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
    var ym = 0;
    for (var j = 0; j < NB; j++) ym = Math.max(ym, data.hist[j]);
    var xs = [], ys = [];
    for (var k = 0; k <= 200; k++) { var xx = LO + (HI - LO) * k / 200, rho = Math.exp(-2 * U(xx) / (data.s * data.s)) / data.Z; xs.push(xx); ys.push(rho); ym = Math.max(ym, rho); }
    ym *= 1.1;
    var c2d = P.setup(c2, 0.75), fh = P.frame(c2d, [LO, HI], [0, ym], { xt: [-2, -1, 0, 1, 2], yt: [0, ym / 2, ym], yd: 2, xl: "x", yl: en ? "density" : "densité", title: en ? "Histogram vs stationary density" : "Histogramme et densité stationnaire" });
    var hx = c2d.ctx; P.clip(hx, fh);
    hx.fillStyle = s1; hx.globalAlpha = 0.55;
    for (var b = 0; b < NB; b++) { var x0 = LO + b * (HI - LO) / NB, x1 = x0 + (HI - LO) / NB; hx.fillRect(fh.X(x0) + 1, fh.Y(data.hist[b]), fh.X(x1) - fh.X(x0) - 2, fh.Y(0) - fh.Y(data.hist[b])); }
    hx.globalAlpha = 1; P.polyline(hx, fh, xs, ys, s2, 2.5); hx.restore();
    var est = data.nsw > 0 ? P.fmt(T / data.nsw, 1) : "> " + T;
    out.textContent = (en ? "Switches: " : "Bascules : ") + data.nsw + (en ? " — simulated mean time τ ≈ " : " — temps moyen simulé τ ≈ ") + est +
      (en ? " ; exact (integral formula) " : " ; exact (formule intégrale) ") + P.fmt(data.tauE, 1) + (en ? " ; Kramers asymptotics " : " ; asymptotique de Kramers ") + P.fmt(data.tauK, 1) + ".";
  }
  var timer = null;
  ss.addEventListener("input", function () { sv.textContent = "σ = " + P.fmt(+ss.value, 2); clearTimeout(timer); timer = setTimeout(function () { compute(); draw(); }, 60); });
  btn.addEventListener("click", function () { seed += 1; compute(); draw(); });
  P.onChange(draw); compute(); draw();
})();

/* ---- w2.html ---- */
(function () {
  var P = window.P4, box = document.getElementById("w-giss"); if (!P || !box) return;
  var en = P.lang() === "en";
  var sg = box.querySelector("#wg-gamma"), gv = box.querySelector("#wg-g"), btn = box.querySelector("#wg-run"), out = box.querySelector("#wg-out");
  var c1 = box.querySelector("#wg-c1"), c2 = box.querySelector("#wg-c2"), c3 = box.querySelector("#wg-c3");
  var MU = 0.119, NU = 0.1, DT = 0.02, NTR = 30000, NK = 100000, EVERY = 10, seed = 7, data = null;
  function run(q, d, v, G) {
    var Ds = new Float32Array(NK / EVERY), Qs = new Float32Array(NK / EVERY), cross = 0, pos = 0;
    for (var n = 0; n < NTR + NK; n++) {
      var a1 = MU * q - v * d, b1 = -NU * d + v * q, c1_ = G - v + q * d;
      var q2 = q + 0.5 * DT * a1, d2 = d + 0.5 * DT * b1, v2 = v + 0.5 * DT * c1_;
      var a2 = MU * q2 - v2 * d2, b2 = -NU * d2 + v2 * q2, c2_ = G - v2 + q2 * d2;
      var q3 = q + 0.5 * DT * a2, d3 = d + 0.5 * DT * b2, v3 = v + 0.5 * DT * c2_;
      var a3 = MU * q3 - v3 * d3, b3 = -NU * d3 + v3 * q3, c3_ = G - v3 + q3 * d3;
      var q4 = q + DT * a3, d4 = d + DT * b3, v4 = v + DT * c3_;
      var a4 = MU * q4 - v4 * d4, b4 = -NU * d4 + v4 * q4, c4_ = G - v4 + q4 * d4;
      var dn = d + DT / 6 * (b1 + 2 * b2 + 2 * b3 + b4);
      q += DT / 6 * (a1 + 2 * a2 + 2 * a3 + a4); v += DT / 6 * (c1_ + 2 * c2_ + 2 * c3_ + c4_);
      if (n >= NTR) {
        if ((dn > 0) !== (d > 0)) cross++;
        if (dn > 0) pos++;
        var k = n - NTR; if (k % EVERY === 0) { Ds[k / EVERY] = dn; Qs[k / EVERY] = q; }
      }
      d = dn;
    }
    return { D: Ds, Q: Qs, cross: cross, pos: pos / NK };
  }
  function compute() {
    var G = +sg.value, u = P.rng(seed), g = P.gauss(u);
    var q0 = 0.8 * g(), d0 = 0.8 * g(), v0 = Math.abs(0.8 * g());
    data = { G: G, tr: [run(q0, d0, v0, G), run(-q0, -d0, v0, G)] };
  }
  function draw() {
    if (!data) compute();
    var s = [P.css(box, "--s1", "#2a78d6"), P.css(box, "--s2", "#eb6834")];
    gv.textContent = "Γ = " + P.fmt(data.G, 3);
    var c = P.setup(c1, 0.3), n = data.tr[0].D.length, T = n * EVERY * DT;
    var fr = P.frame(c, [0, T], [-3.5, 3.5], { xt: [0, 500, 1000, 1500, 2000], yt: [-3, -2, -1, 0, 1, 2, 3], xl: en ? "time t" : "temps t", yl: "D", title: en ? "Dipole D(t)" : "Dipôle D(t)" });
    var ctx = c.ctx; P.clip(ctx, fr);
    data.tr.forEach(function (tr, j) {
      ctx.strokeStyle = s[j]; ctx.lineWidth = 1; ctx.globalAlpha = 0.85; ctx.beginPath();
      for (var i = 0; i < n; i++) { var px = fr.X(i * EVERY * DT), py = fr.Y(tr.D[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke(); ctx.globalAlpha = 1;
    });
    ctx.restore();
    var cp = P.setup(c2, 0.8), fp = P.frame(cp, [-3, 3], [-3.5, 3.5], { xt: [-3, -2, -1, 0, 1, 2, 3], yt: [-3, -2, -1, 0, 1, 2, 3], xl: "Q", yl: "D", title: en ? "Projection on (Q, D)" : "Projection sur (Q, D)" });
    var cx = cp.ctx; P.clip(cx, fp);
    data.tr.forEach(function (tr, j) { cx.fillStyle = s[j]; cx.globalAlpha = 0.5; for (var i = 0; i < n; i += 2) cx.fillRect(fp.X(tr.Q[i]) - 0.8, fp.Y(tr.D[i]) - 0.8, 1.6, 1.6); cx.globalAlpha = 1; });
    cx.restore();
    var nb = 56, lo = -3.5, hi = 3.5, hs = data.tr.map(function (tr) {
      var h = new Array(nb).fill(0); for (var i = 0; i < n; i++) { var b = Math.floor((tr.D[i] - lo) / (hi - lo) * nb); if (b >= 0 && b < nb) h[b]++; }
      return h.map(function (x) { return x / (n * (hi - lo) / nb); });
    });
    var ymax = Math.max.apply(null, hs[0].concat(hs[1])) * 1.1 || 1;
    var ch = P.setup(c3, 0.8), fh = P.frame(ch, [lo, hi], [0, ymax], { xt: [-3, -2, -1, 0, 1, 2, 3], yt: [0, ymax / 2, ymax], yd: 2, xl: "D", yl: en ? "density" : "densité", title: en ? "Histogram of D" : "Histogramme de D" });
    var hx = ch.ctx; P.clip(hx, fh);
    hs.forEach(function (h, j) {
      hx.strokeStyle = s[j]; hx.lineWidth = 2; hx.beginPath(); hx.moveTo(fh.X(lo), fh.Y(0));
      for (var b = 0; b < nb; b++) { var x0 = lo + b * (hi - lo) / nb, x1 = x0 + (hi - lo) / nb; hx.lineTo(fh.X(x0), fh.Y(h[b])); hx.lineTo(fh.X(x1), fh.Y(h[b])); }
      hx.lineTo(fh.X(hi), fh.Y(0)); hx.stroke();
    });
    hx.restore();
    var tot = data.tr[0].cross + data.tr[1].cross, dur = NK * DT;
    var msg = (en ? "Zero crossings of D: " : "Passages de D par zéro : ") + data.tr[0].cross + " + " + data.tr[1].cross +
      (en ? " (rate " : " (taux ") + P.fmt(tot / (2 * dur), 4) + (en ? " per unit time); time fraction with D > 0: " : " par unité de temps) ; fraction du temps avec D > 0 : ") +
      P.fmt(data.tr[0].pos, 2) + (en ? " and " : " et ") + P.fmt(data.tr[1].pos, 2) + ". ";
    msg += tot === 0 ? (en ? "Two separate symmetric attractors: no reversal." : "Deux attracteurs symétriques séparés : aucun renversement.")
                     : (en ? "The attractors have merged: chaotic reversals." : "Les attracteurs ont fusionné : renversements chaotiques.");
    out.textContent = msg;
  }
  var timer = null;
  sg.addEventListener("input", function () { gv.textContent = "Γ = " + P.fmt(+sg.value, 3); clearTimeout(timer); timer = setTimeout(function () { compute(); draw(); }, 60); });
  btn.addEventListener("click", function () { seed += 1; compute(); draw(); });
  P.onChange(draw); compute(); draw();
})();
