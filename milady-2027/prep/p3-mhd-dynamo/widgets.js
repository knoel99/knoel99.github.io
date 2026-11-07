/* Outils communs aux widgets du module p3 (couleurs suivant le thème, langue). */
window.P3W = window.P3W || (function () {
  var root = document.documentElement;
  var EN = /^en/i.test(root.getAttribute("lang") || "");
  function hexLum(h) {
    h = (h || "").trim();
    var m = /^#?([0-9a-f]{6})$/i.exec(h);
    if (!m) return 1;
    var n = parseInt(m[1], 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  function pal() {
    var cs = getComputedStyle(root);
    var bg = cs.getPropertyValue("--bg").trim() || "#ffffff";
    var dark = hexLum(bg) < 0.4;
    return {
      dark: dark, bg: bg,
      ink: cs.getPropertyValue("--ink").trim() || (dark ? "#f5f7fa" : "#0a0a0a"),
      soft: cs.getPropertyValue("--muted").trim() || (dark ? "#c7d0da" : "#374151"),
      grid: dark ? "#2b3440" : "#e4e3df",
      faint: dark ? "#4a5563" : "#b9b8b2",
      s1: dark ? "#3987e5" : "#2a78d6",
      s2: dark ? "#d95926" : "#eb6834",
      s3: dark ? "#e66767" : "#e34948"
    };
  }
  var hooks = [];
  function onTheme(f) { hooks.push(f); }
  function fire() { hooks.forEach(function (f) { try { f(); } catch (e) {} }); }
  new MutationObserver(fire).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  if (window.matchMedia) {
    try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fire); } catch (e) {}
  }
  function localize(el) {
    if (!EN) return;
    el.querySelectorAll("[data-en]").forEach(function (e) { e.textContent = e.getAttribute("data-en"); });
    if (el.hasAttribute("data-en-label")) el.setAttribute("aria-label", el.getAttribute("data-en-label"));
    el.querySelectorAll("[data-en-label]").forEach(function (e) { e.setAttribute("aria-label", e.getAttribute("data-en-label")); });
  }
  function num(x, d) {
    var s = x.toFixed(d);
    return EN ? s : s.replace(".", ",");
  }
  function fitCanvas(cv, ratio) {
    var w = Math.max(280, cv.clientWidth || cv.parentNode.clientWidth || 600);
    var dpr = window.devicePixelRatio || 1;
    var h = Math.round(w * ratio);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.height = h + "px";
    }
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  return { EN: EN, pal: pal, onTheme: onTheme, localize: localize, num: num, fitCanvas: fitCanvas };
})();

/* ===================== Widget 1 : expulsion du flux par un tourbillon ===================== */
(function () {
  var box = document.getElementById("w-expulsion");
  if (!box) return;
  var W = window.P3W;
  W.localize(box);
  var cv = box.querySelector("canvas");
  var sl = box.querySelector("input[name=rm]");
  var out = box.querySelector(".rm-val");
  var rd = box.querySelector(".widget-readout");
  var bPlay = box.querySelector("button.play"), bReset = box.querySelector("button.reset");
  var N = 128, TWO = 2 * Math.PI, h = TWO / N, NN = N * N;
  var ux = new Float64Array(NN), uy = new Float64Array(NN), psi = new Float64Array(NN);
  var ip = new Int32Array(N), im = new Int32Array(N), ip2 = new Int32Array(N), im2 = new Int32Array(N);
  for (var i = 0; i < N; i++) {
    ip[i] = (i + 1) % N; im[i] = (i - 1 + N) % N; ip2[i] = (i + 2) % N; im2[i] = (i - 2 + N) % N;
  }
  for (var j = 0; j < N; j++) for (i = 0; i < N; i++) {
    var x = i * h, y = j * h, k = j * N + i;
    ux[k] = Math.sin(x) * Math.cos(y); uy[k] = -Math.cos(x) * Math.sin(y); psi[k] = Math.sin(x) * Math.sin(y);
  }
  var a = new Float64Array(NN), a1 = new Float64Array(NN), a2 = new Float64Array(NN), L = new Float64Array(NN);
  var t = 0, running = true, Rm = 40, eta = 1 / 40;
  function rmFromSlider() { return Math.round(Math.pow(10, parseFloat(sl.value))); }
  function rhs(f, o) {
    var c6 = 1 / (6 * h), ih2 = 1 / (h * h);
    for (var j = 0; j < N; j++) {
      var r = j * N, rp = ip[j] * N, rm = im[j] * N, rp2 = ip2[j] * N, rm2 = im2[j] * N;
      for (var i = 0; i < N; i++) {
        var k = r + i, u = ux[k], v = uy[k], f0 = f[k];
        var fx = u > 0 ? (2 * f[r + ip[i]] + 3 * f0 - 6 * f[r + im[i]] + f[r + im2[i]]) * c6
                       : (-f[r + ip2[i]] + 6 * f[r + ip[i]] - 3 * f0 - 2 * f[r + im[i]]) * c6;
        var fy = v > 0 ? (2 * f[rp + i] + 3 * f0 - 6 * f[rm + i] + f[rm2 + i]) * c6
                       : (-f[rp2 + i] + 6 * f[rp + i] - 3 * f0 - 2 * f[rm + i]) * c6;
        var lap = (f[r + ip[i]] + f[r + im[i]] + f[rp + i] + f[rm + i] - 4 * f0) * ih2;
        o[k] = -(u * fx + v * fy) - v + eta * lap;
      }
    }
  }
  function step(dt) {                       /* Runge-Kutta SSP d'ordre 3 */
    var k;
    rhs(a, L); for (k = 0; k < NN; k++) a1[k] = a[k] + dt * L[k];
    rhs(a1, L); for (k = 0; k < NN; k++) a2[k] = 0.75 * a[k] + 0.25 * (a1[k] + dt * L[k]);
    rhs(a2, L); for (k = 0; k < NN; k++) a[k] = a[k] / 3 + 2 / 3 * (a2[k] + dt * L[k]);
    t += dt;
  }
  function advance(T) {
    var dtmax = Math.min(0.03, 0.15 * h * h / eta);
    var n = Math.ceil(T / dtmax), dt = T / n;
    for (var s = 0; s < n; s++) step(dt);
  }
  function value(i, j) {                    /* a = y + a', prolongé périodiquement en x */
    var ii = i % N, jj = j % N;
    return j * h + a[jj * N + ii];
  }
  function contour(get, levels, sx, sy, ctx) {
    ctx.beginPath();
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var v0 = get(i, j), v1 = get(i + 1, j), v2 = get(i + 1, j + 1), v3 = get(i, j + 1);
      var lo = Math.min(v0, v1, v2, v3), hi = Math.max(v0, v1, v2, v3);
      for (var m = 0; m < levels.length; m++) {
        var c = levels[m];
        if (c < lo || c > hi) continue;
        var pts = [];
        function edge(va, vb, xa, ya, xb, yb) {
          if ((va - c) * (vb - c) < 0) { var s = (c - va) / (vb - va); pts.push([xa + s * (xb - xa), ya + s * (yb - ya)]); }
        }
        edge(v0, v1, i, j, i + 1, j); edge(v1, v2, i + 1, j, i + 1, j + 1);
        edge(v2, v3, i + 1, j + 1, i, j + 1); edge(v3, v0, i, j + 1, i, j);
        for (var p = 0; p + 1 < pts.length; p += 2) {
          ctx.moveTo(pts[p][0] * sx, (N - pts[p][1]) * sy);
          ctx.lineTo(pts[p + 1][0] * sx, (N - pts[p + 1][1]) * sy);
        }
      }
    }
    ctx.stroke();
  }
  var psiLevels = [-0.85, -0.55, -0.25, 0.25, 0.55, 0.85];
  var aLevels = [];
  for (var m = -10; m <= 30; m++) aLevels.push(m * TWO / 20 + 1e-3);
  function draw() {
    var P = W.pal(), f = W.fitCanvas(cv, 1.0), ctx = f.ctx, sx = f.w / N, sy = f.h / N;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, f.w, f.h);
    ctx.lineWidth = 1; ctx.strokeStyle = P.faint;
    contour(function (i, j) { return psi[(j % N) * N + (i % N)]; }, psiLevels, sx, sy, ctx);
    ctx.lineWidth = 1.4; ctx.strokeStyle = P.s1;
    contour(value, aLevels, sx, sy, ctx);
    ctx.strokeStyle = P.soft; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, f.w - 1, f.h - 1);
    var e = 0, bmax = 0;
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var bx = 1 + (a[ip[j] * N + i] - a[im[j] * N + i]) / (2 * h);
      var by = -(a[j * N + ip[i]] - a[j * N + im[i]]) / (2 * h);
      var b2 = bx * bx + by * by; e += b2; if (b2 > bmax) bmax = b2;
    }
    e /= NN;
    rd.textContent = (W.EN ? "t = " : "t = ") + W.num(t, 1) + "   ·   ⟨|B|²⟩/B₀² = " + W.num(e, 2) +
      "   ·   max |B|/B₀ = " + W.num(Math.sqrt(bmax), 1);
  }
  function reset() { a.fill(0); t = 0; draw(); }
  function setRm() {
    Rm = rmFromSlider(); eta = 1 / Rm; out.textContent = String(Rm);
  }
  sl.addEventListener("input", function () { setRm(); });
  bPlay.addEventListener("click", function () {
    running = !running;
    bPlay.textContent = running ? (W.EN ? "Pause" : "Pause") : (W.EN ? "Run" : "Lancer");
    if (running) loop();
  });
  bReset.addEventListener("click", reset);
  W.onTheme(draw);
  window.addEventListener("resize", draw);
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && running) loop(); }).observe(box);
  }
  var pending = false;
  function loop() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      if (!running || !visible) return;
      if (t < 400) advance(Rm < 20 ? 0.1 : 0.2);
      draw();
      loop();
    });
  }
  setRm(); reset(); loop();
})();

/* ===================== Widget 2 : dynamo alpha², modes et seuil ===================== */
(function () {
  var box = document.getElementById("w-alpha2");
  if (!box) return;
  var W = window.P3W;
  W.localize(box);
  var svg = box.querySelector("svg"), sl = box.querySelector("input[name=c]"), out = box.querySelector(".c-val");
  var rd = box.querySelector(".widget-readout");
  var NS = "http://www.w3.org/2000/svg";
  var VW = 640, VH = 320, ml = 56, mr = 16, mt = 14, mb = 44;
  var xmax = 4, ymin = -60, ymax = 70;
  function X(n) { return ml + (VW - ml - mr) * n / xmax; }
  function Y(s) { return mt + (VH - mt - mb) * (ymax - Math.max(ymin, Math.min(ymax, s))) / (ymax - ymin); }
  function el(tag, attrs, txt) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt !== undefined) e.textContent = txt;
    svg.appendChild(e); return e;
  }
  function draw() {
    var P = W.pal(), C = parseFloat(sl.value), pi = Math.PI;
    out.textContent = W.num(C, 2);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", "0 0 " + VW + " " + VH);
    for (var s = -60; s <= 60; s += 20) {
      el("line", { x1: ml, x2: VW - mr, y1: Y(s), y2: Y(s), stroke: s === 0 ? P.soft : P.grid, "stroke-width": s === 0 ? 1.2 : 1 });
      el("text", { x: ml - 8, y: Y(s) + 4, "text-anchor": "end", "font-size": 12, fill: P.soft }, W.num(s, 0).replace("-", "−"));
    }
    for (var n = 0; n <= xmax; n++) {
      el("line", { x1: X(n), x2: X(n), y1: mt, y2: VH - mb, stroke: P.grid });
      el("text", { x: X(n), y: VH - mb + 18, "text-anchor": "middle", "font-size": 12, fill: P.soft }, String(n));
    }
    el("text", { x: (ml + VW - mr) / 2, y: VH - 6, "text-anchor": "middle", "font-size": 12.5, fill: P.ink },
       W.EN ? "mode index n (wavenumber k = 2πn/L in the periodic box)" : "indice du mode n (nombre d'onde k = 2πn/L dans la boîte périodique)");
    el("text", { x: 14, y: (mt + VH - mb) / 2, "text-anchor": "middle", "font-size": 12.5, fill: P.ink,
                 transform: "rotate(-90 14 " + ((mt + VH - mb) / 2) + ")" }, W.EN ? "growth rate σ L²/η_T" : "taux σ L²/η_T");
    function curve(f, color, dash) {
      var d = "";
      for (var q = 0; q <= 200; q++) { var nn = xmax * q / 200; d += (q ? "L" : "M") + X(nn).toFixed(1) + " " + Y(f(nn)).toFixed(1); }
      el("path", { d: d, fill: "none", stroke: color, "stroke-width": 2, "stroke-dasharray": dash || "none" });
    }
    var per = function (nn) { return 2 * pi * nn * C - 4 * pi * pi * nn * nn; };
    var wal = function (nn) { return C * C / 4 - pi * pi * nn * nn; };
    curve(per, P.s1); curve(wal, P.s2, "6 4");
    for (n = 1; n <= xmax; n++) {
      el("circle", { cx: X(n), cy: Y(per(n)), r: 6, fill: P.bg, stroke: P.s1, "stroke-width": 2.2 });
      el("rect", { x: X(n) - 5, y: Y(wal(n)) - 5, width: 10, height: 10, fill: P.bg, stroke: P.s2, "stroke-width": 2.2 });
    }
    el("text", { x: VW - mr - 4, y: mt + 14, "text-anchor": "end", "font-size": 12, fill: P.ink },
       W.EN ? "● periodic box: σ = Ck L − (kL)²" : "● boîte périodique : σ = C kL − (kL)²");
    el("text", { x: VW - mr - 4, y: mt + 32, "text-anchor": "end", "font-size": 12, fill: P.ink },
       W.EN ? "■ walls B = 0: λₙ = C²/4 − n²π²" : "■ parois B = 0 : λₙ = C²/4 − n²π²");
    var best = 1, bs = per(1);
    for (n = 2; n <= 6; n++) if (per(n) > bs) { bs = per(n); best = n; }
    var sat = C > 2 * pi && C < 4 * pi ? C / (2 * pi) - 1 : null;
    var txt = (W.EN ? "Periodic: " : "Périodique : ") + (bs > 0 ? (W.EN ? "dynamo, fastest mode n = " : "dynamo, mode le plus rapide n = ") + best +
      " (σ = " + W.num(bs, 1) + ")" : (W.EN ? "no dynamo" : "pas de dynamo")) +
      "   ·   " + (W.EN ? "Walls: " : "Parois : ") + (wal(1) > 0 ? "λ₁ = " + W.num(wal(1), 1) : (W.EN ? "no dynamo" : "pas de dynamo")) +
      "   ·   " + (W.EN ? "threshold C = 2π ≈ 6.28 in both cases" : "seuil C = 2π ≈ 6,28 dans les deux cas") +
      (sat !== null ? "   ·   " + (W.EN ? "saturated ⟨|B|²⟩/B_eq² (α-quenching, n = 1) = " : "⟨|B|²⟩/B_eq² saturé (α-quenching, n = 1) = ") + W.num(sat, 3) : "");
    rd.textContent = txt;
  }
  sl.addEventListener("input", draw);
  W.onTheme(draw);
  draw();
})();

/* ===================== Widget 3 : modèle de renversements de Gissinger ===================== */
(function () {
  var box = document.getElementById("w-gissinger");
  if (!box) return;
  var W = window.P3W;
  W.localize(box);
  var cv = box.querySelector("canvas");
  var sG = box.querySelector("input[name=gamma]"), sM = box.querySelector("input[name=mu]");
  var oG = box.querySelector(".g-val"), oM = box.querySelector(".mu-val");
  var rd = box.querySelector(".widget-readout");
  var bPlay = box.querySelector("button.play"), bReset = box.querySelector("button.reset");
  var nu = 0.1, G = 0.9, mu = 0.119, dt = 0.02;
  var Q, D, V, t, last, nrev, trev, running = true;
  var NS = 2400, DS = 0.5, tl = new Float32Array(NS), tlN = 0, tlH = 0, acc = 0;
  var NP = 4000, pq = new Float32Array(NP), pd = new Float32Array(NP), pN = 0, pH = 0;
  function reset() {
    Q = 0.1 + 0.2 * (Math.random() - 0.5); D = 0.1 + 0.2 * (Math.random() - 0.5); V = 0.5 * Math.random();
    t = 0; last = 0; nrev = 0; trev = []; tlN = tlH = pN = pH = 0; acc = 0;
  }
  function f(q, d, v) { return [mu * q - v * d, -nu * d + v * q, G - v + q * d]; }
  function rk4() {
    var k1 = f(Q, D, V), k2 = f(Q + dt / 2 * k1[0], D + dt / 2 * k1[1], V + dt / 2 * k1[2]);
    var k3 = f(Q + dt / 2 * k2[0], D + dt / 2 * k2[1], V + dt / 2 * k2[2]);
    var k4 = f(Q + dt * k3[0], D + dt * k3[1], V + dt * k3[2]);
    Q += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    D += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    V += dt / 6 * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]);
    t += dt;
    if (t > 200) {
      var p = D > 0.5 ? 1 : (D < -0.5 ? -1 : 0);
      if (p !== 0) { if (last !== 0 && p !== last) { nrev++; trev.push(t); } last = p; }
    }
    acc += dt;
    if (acc >= DS) { acc -= DS; tl[tlH] = D; tlH = (tlH + 1) % NS; if (tlN < NS) tlN++; }
    pq[pH] = Q; pd[pH] = D; pH = (pH + 1) % NP; if (pN < NP) pN++;
  }
  function draw() {
    var P = W.pal(), fc = W.fitCanvas(cv, 0.42), ctx = fc.ctx, w = fc.w, hh = fc.h;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, hh);
    var gap = 18, lw = Math.round(w * 0.64), x0 = 34, y0 = 10, ph = hh - 34;
    var rw = w - lw - gap - 30, rx = lw + gap + 22;
    var Dm = 3.4;
    ctx.font = "12px system-ui, sans-serif";
    /* série temporelle de D */
    ctx.strokeStyle = P.grid; ctx.lineWidth = 1;
    [-2, 0, 2].forEach(function (v) {
      var yy = y0 + ph * (Dm - v) / (2 * Dm);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(lw, yy); ctx.stroke();
      ctx.fillStyle = P.soft; ctx.textAlign = "right"; ctx.fillText(String(v).replace("-", "−"), x0 - 6, yy + 4);
    });
    ctx.strokeStyle = P.s2; ctx.lineWidth = 1.2; ctx.beginPath();
    for (var s = 0; s < tlN; s++) {
      var idx = (tlH - tlN + s + NS) % NS;
      var xx = x0 + (lw - x0) * (NS - tlN + s) / (NS - 1), yy = y0 + ph * (Dm - tl[idx]) / (2 * Dm);
      if (s) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
    }
    ctx.stroke();
    ctx.fillStyle = P.ink; ctx.textAlign = "center";
    ctx.fillText(W.EN ? "dipole D over the last 1200 time units" : "dipôle D sur les 1200 dernières unités de temps", (x0 + lw) / 2, hh - 8);
    /* portrait de phase (Q, D) */
    ctx.strokeStyle = P.grid; ctx.strokeRect(rx, y0, rw, ph);
    var Qm = 3.0;
    ctx.strokeStyle = P.s1; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.beginPath();
    for (s = 0; s < pN; s++) {
      var id2 = (pH - pN + s + NP) % NP;
      var px = rx + rw * (pq[id2] + Qm) / (2 * Qm), py = y0 + ph * (Dm - pd[id2]) / (2 * Dm);
      if (s) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = P.ink;
    ctx.fillText(W.EN ? "phase portrait (Q, D)" : "portrait de phase (Q, D)", rx + rw / 2, hh - 8);
    var wait = trev.length > 1 ? (trev[trev.length - 1] - trev[0]) / (trev.length - 1) : null;
    rd.textContent = "t = " + W.num(t, 0) + "   ·   " + (W.EN ? "reversals: " : "renversements : ") + nrev +
      (wait ? "   ·   " + (W.EN ? "mean waiting time ≈ " : "attente moyenne ≈ ") + W.num(wait, 0) : "") +
      "   ·   V = " + W.num(V, 2);
  }
  function params() {
    G = parseFloat(sG.value); mu = parseFloat(sM.value);
    oG.textContent = W.num(G, 3); oM.textContent = W.num(mu, 3);
  }
  sG.addEventListener("input", function () { params(); nrev = 0; trev = []; });
  sM.addEventListener("input", function () { params(); nrev = 0; trev = []; });
  bPlay.addEventListener("click", function () {
    running = !running;
    bPlay.textContent = running ? "Pause" : (W.EN ? "Run" : "Lancer");
    if (running) loop();
  });
  bReset.addEventListener("click", function () { reset(); draw(); });
  W.onTheme(draw);
  window.addEventListener("resize", draw);
  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && running) loop(); }).observe(box);
  }
  var pending = false;
  function loop() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      if (!running || !visible) return;
      for (var k = 0; k < 200; k++) rk4();
      draw();
      loop();
    });
  }
  params(); reset(); loop();
})();
