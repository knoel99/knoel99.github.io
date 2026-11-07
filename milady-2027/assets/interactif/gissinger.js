/*
 * gissinger.js — MilaDy 2027, widget interactif « gissinger » (FR / EN).
 * Explorateur du modèle à trois modes de Gissinger : renversements chaotiques du dipôle.
 * Usage : <div class="widget" data-widget="gissinger"></div> + <script defer src=".../gissinger.js"></script>
 *
 * ---------------------------------------------------------------------------------------------
 * Formules utilisées
 *
 * 1. Modèle (Gissinger 2012) — Q : mode quadripolaire, D : mode dipolaire, V : mode de vitesse
 *        dQ/dt = μ Q − V D
 *        dD/dt = −ν D + V Q
 *        dV/dt = Γ − V + Q D,        μ = 0,119 ; ν = 0,1 ; Γ ∈ [0,80 ; 1,00] (pas 0,005).
 *
 * 2. Symétrie : le champ F vérifie F(S x) = S F(x) avec S = diag(−1, −1, 1). L'application
 *    (Q, D, V) → (−Q, −D, V) envoie donc toute solution sur une solution (analogue de B → −B) ;
 *    le bouton « Symétrie » l'applique à l'état courant.
 *
 * 3. Points fixes (calcul direct, F = 0) : (0, 0, Γ) et la paire échangée par S
 *        V* = −√(μν),  D*² = μ (Γ + √(μν)) / √(μν),  Q* = −√(ν/μ) D*.
 *    (μQ = VD et νD = VQ imposent Q = VD/μ puis V² = μν si D ≠ 0 ; la troisième équation donne
 *    D² = μ (V − Γ) / V : avec V = +√(μν), D² > 0 exigerait Γ < √(μν) ≈ 0,109, donc seule la
 *    racine négative convient sur [0,80 ; 1,00].)
 *    Ils sont marqués « × » dans le portrait de phase (Q, D).
 *
 * 4. Intégration : Runge–Kutta classique d'ordre 4 à pas fixe dt = 0,01 (Hairer, Nørsett,
 *    Wanner 1993, § II.1)
 *        k1 = F(x), k2 = F(x + dt k1/2), k3 = F(x + dt k2/2), k4 = F(x + dt k3),
 *        x ← x + dt (k1 + 2 k2 + 2 k3 + k4) / 6.
 *    Plusieurs pas par image ; ×1 = 10 unités de temps (u.t.) par seconde, ×5, ×20.
 *
 * 5. Comptage : un passage de D par 0 est compté entre les pas n et n + 1 quand
 *    signe(D_n) ≠ signe(D_{n+1}) (renversements et excursions). Compteurs remis à zéro à
 *    chaque changement de Γ (et à la réinitialisation) ; fréquence = N / T, où N et T ne
 *    portent que sur la durée écoulée après un transitoire de 200 u.t.
 *
 * 6. Formule de Rice (Kac 1943 ; Rice 1944–1945) : pour un processus stationnaire ergodique
 *    dérivable, le nombre moyen de passages par 0 par unité de temps vaut
 *        ν₀ = E[ |Ḋ| δ(D) ] = ∫ |ḋ| p(0, ḋ) dḋ,
 *    estimé en remplaçant δ(D) par 1{|D| < h} / (2h) et l'espérance par la moyenne sur les états
 *    visités après le transitoire (sans utiliser leur ordre temporel) :
 *        ν₀ ≈ E[ |Ḋ| 1{|D| < h} ] / (2h),   Ḋ = −ν D + V Q,
 *        Ê = (1/T) Σ_n |Ḋ_n| 1{|D_n| < h} dt.
 *    Les contributions |Ḋ_n| dt sont rangées dans un histogramme de |D| (pas 0,01 sur [0 ; 0,5[),
 *    ce qui donne l'estimation exacte pour tout h multiple de 0,01 sans relancer la simulation.
 *    Biais en O(h²) quand h grandit, variance en O(1/(hT)) quand h diminue. Le long d'une seule
 *    trajectoire, une traversée monotone de la bande donne ∫|Ḋ| 1{|D| < h} dt = ∫_{−h}^{h} dD = 2h :
 *    l'estimation coïncide alors avec le comptage, aux excursions près qui entrent dans la bande
 *    sans la traverser. Son intérêt est de n'utiliser que la loi des états (échantillons sans ordre).
 *
 * 7. Condition initiale aléatoire (bouton « Réinitialiser ») : ±(Q*, D*, V*) + bruit gaussien
 *    d'écart-type 0,5 sur chaque composante. On évite le voisinage du point fixe trivial (0, 0, Γ) :
 *    sa jacobienne a pour valeurs propres −1 et (μ − ν)/2 ± i √(Γ² − ((μ + ν)/2)²), donc une spirale
 *    instable de taux (μ − ν)/2 ≈ 0,0095 seulement, qui donnerait des transitoires (oscillations de D
 *    autour de 0, période ≈ 2π/Γ) plus longs que les 200 u.t. ignorées.
 *
 * 8. Seuil des renversements : jusqu'à Γ = 0,86, D garde son signe (deux attracteurs symétriques
 *    disjoints) ; ils fusionnent par une crise (Grebogi, Ott, Romeiras, Yorke 1987) entre
 *    Γ = 0,86 et 0,865 avec cet intégrateur (RK4, dt = 0,01 ; contrôle indépendant sur
 *    16 × 10 000 u.t. : 0 passage à Γ = 0,86, taux 0,0007 à 0,8625, 0,0012 à 0,865, 0,0042 à 0,9,
 *    0,0113 à 1,0), intervalle compatible avec ]0,86 ; 0,87] de l'expérience E1 du site
 *    (experiences/e1_gissinger.py). Aux valeurs du curseur (pas 0,005) : aucun renversement pour
 *    Γ ≤ 0,86, renversements dès Γ = 0,865.
 *
 * Références
 *  - C. Gissinger, « A new deterministic model for chaotic reversals », Eur. Phys. J. B 85, 137 (2012).
 *  - M. Kac, « On the average number of real roots of a random algebraic equation »,
 *    Bull. Amer. Math. Soc. 49, 314–320 (1943).
 *  - S. O. Rice, « Mathematical analysis of random noise », Bell Syst. Tech. J. 23, 282–332 (1944)
 *    et 24, 46–156 (1945).
 *  - E. Hairer, S. P. Nørsett, G. Wanner, Solving Ordinary Differential Equations I, 2e éd.,
 *    Springer (1993).
 *  - C. Grebogi, E. Ott, F. Romeiras, J. A. Yorke, « Critical exponents for crisis-induced
 *    intermittency », Phys. Rev. A 36, 5365–5380 (1987).
 * ---------------------------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var NAME = "gissinger";

  /* ---------- constantes du modèle et de l'affichage ---------- */
  var MU = 0.119, NU = 0.1, DT = 0.01;
  var SQ_MN = Math.sqrt(MU * NU), SQ_NM = Math.sqrt(NU / MU);
  var G_MIN = 0.8, G_MAX = 1.0, G_STEP = 0.005, G_DEF = 0.95;
  var H_MIN = 0.05, H_MAX = 0.5, H_STEP = 0.01, H_DEF = 0.2;
  var BIN = 0.01, NBIN = 50;                       // histogramme de |D| sur [0 ; 0,5[
  var WINDOW = 600, TRANSIENT = 200, PREFILL = 800, TRAIL = 200;
  var K_TRANS = Math.round(TRANSIENT / DT);        // 20 000 pas
  var K_PREFILL = Math.round(PREFILL / DT);        // 80 000 pas
  var SUB = 5;                                     // un point tracé tous les 5 pas (0,05 u.t.)
  var CAP = Math.round(WINDOW / (SUB * DT)) + 400; // tampon circulaire des points tracés
  var BASE_RATE = 10;                              // u.t. par seconde à ×1
  var SPEEDS = [1, 5, 20];
  var AX = 3.5;                                    // demi-étendue des axes Q et D
  var NCHUNK = 20;                                 // dégradé de la traînée
  var PAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
  var PAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];

  /* ---------- textes ---------- */
  var TXT = {
    fr: {
      title: "Renversements du dipôle dans le modèle à trois modes de Gissinger",
      gName: "Γ, paramètre de contrôle", hName: "h, demi-largeur de la fenêtre |D| < h de l'estimateur de Rice",
      speed: "Vitesse", speedTip: "×1 = 10 unités de temps par seconde",
      pause: "Pause", play: "Lecture",
      reset: "Réinitialiser", resetTip: "Nouvelle condition initiale aléatoire, compteurs remis à zéro",
      sym: "Symétrie", symTip: "Applique (Q, D, V) → (−Q, −D, V) à l'état courant",
      panelA: "(a) dipôle D(t)", panelB: "(b) portrait de phase (Q, D)",
      pos: "D > 0", neg: "D < 0", band: "|D| < h", transient: "transitoire", symMark: "sym.", colon: " :",
      canvas: "Panneau (a) : dipôle D en fonction du temps sur les 600 dernières unités de temps, " +
        "avec la ligne D = 0, en bleu quand D > 0 et en orange quand D < 0. Panneau (b) : portrait de " +
        "phase (Q, D) avec la traînée des 200 dernières unités de temps, les deux points fixes non triviaux (croix) et l'état courant (point).",
      l1: function (g, t) { return "Γ\u00a0=\u00a0" + g + " · durée depuis le dernier changement\u00a0: " + t + " u.t."; },
      l2: function (n, np) { return "Passages de D par 0\u00a0: " + n + ", dont " + np + " après le transitoire (200 premières u.t. ignorées)"; },
      l3: function (np, T, f, h, r) { return "Fréquence par u.t.\u00a0: comptage " + np + "\u00a0/\u00a0" + T + "\u00a0=\u00a0" + f + " ; Rice (h\u00a0=\u00a0" + h + ")\u00a0: " + r; },
      l3wait: function (left) { return "Fréquence\u00a0: transitoire en cours, encore " + left + " u.t. avant l'estimation"; },
      note: "μ = 0,119, ν = 0,1 ; RK4, dt = 0,01 ; u.t. = unité de temps (×1 = 10 u.t./s). " +
        "Bleu : D > 0, orange : D < 0, bande verte : |D| < h, × : points fixes non triviaux, ● : état courant. " +
        "Jusqu'à Γ = 0,86, pas de renversement : la trajectoire reste sur l'un des deux attracteurs symétriques " +
        "(D > 0 ou D < 0). Ils fusionnent par une crise entre 0,86 et 0,865 ; dès Γ = 0,865, D change de signe " +
        "de façon irrégulière. Le long d'une trajectoire, chaque traversée de la bande apporte ∫|Ḋ|\u00a0dt ≈ 2h, " +
        "d'où l'accord avec le comptage ; mais Rice n'utilise que la loi des états, pas leur ordre : elle vaut donc " +
        "aussi pour les échantillons d'un modèle génératif. En pause, changer Γ ou réinitialiser calcule d'un coup 800 u.t."
    },
    en: {
      title: "Dipole reversals in Gissinger's three-mode model",
      gName: "Γ, control parameter", hName: "h, half-width of the |D| < h window of the Rice estimator",
      speed: "Speed", speedTip: "×1 = 10 time units per second",
      pause: "Pause", play: "Play",
      reset: "Reset", resetTip: "New random initial condition, counters set to zero",
      sym: "Symmetry", symTip: "Applies (Q, D, V) → (−Q, −D, V) to the current state",
      panelA: "(a) dipole D(t)", panelB: "(b) phase portrait (Q, D)",
      pos: "D > 0", neg: "D < 0", band: "|D| < h", transient: "transient", symMark: "sym.", colon: ":",
      canvas: "Panel (a): dipole D versus time over the last 600 time units, with the line D = 0, " +
        "blue where D > 0 and orange where D < 0. Panel (b): phase portrait (Q, D) with the trail of the " +
        "last 200 time units, the two non-trivial fixed points (crosses) and the current state (dot).",
      l1: function (g, t) { return "Γ\u00a0=\u00a0" + g + " · time since last change: " + t + " t.u."; },
      l2: function (n, np) { return "Zero crossings of D: " + n + ", of which " + np + " after the transient (first 200 t.u. ignored)"; },
      l3: function (np, T, f, h, r) { return "Rate per t.u.: count " + np + "\u00a0/\u00a0" + T + "\u00a0=\u00a0" + f + "; Rice (h\u00a0=\u00a0" + h + "): " + r; },
      l3wait: function (left) { return "Rate: transient in progress, " + left + " t.u. left before estimating"; },
      note: "μ = 0.119, ν = 0.1; RK4, dt = 0.01; t.u. = time unit (×1 = 10 t.u./s). " +
        "Blue: D > 0, orange: D < 0, green band: |D| < h, ×: non-trivial fixed points, ●: current state. " +
        "Up to Γ = 0.86 there is no reversal: the trajectory stays on one of the two symmetric attractors " +
        "(D > 0 or D < 0). They merge in a crisis between 0.86 and 0.865; from Γ = 0.865 on, D changes sign " +
        "irregularly. Along a trajectory, each traversal of the band contributes ∫|Ḋ|\u00a0dt ≈ 2h, hence the " +
        "agreement with the count; but Rice uses only the distribution of states, not their order, so it also " +
        "holds for samples from a generative model. While paused, changing Γ or resetting computes 800 t.u. at once."
    }
  };

  // Typographie : espaces insécables autour de =, <, >, ≈, → et entre un nombre et « u.t. » ;
  // en français, espace insécable avant « : » et fine insécable avant « ; ».
  function typo(lang, s) {
    s = s.replace(/ ([=<>≈→]) /g, "\u00a0$1\u00a0").replace(/(\d) (u\.t\.|t\.u\.)/g, "$1\u00a0$2");
    if (lang === "fr") s = s.replace(/ :/g, "\u00a0:").replace(/ ;/g, "\u202f;");
    return s;
  }
  Object.keys(TXT).forEach(function (lg) {
    var D = TXT[lg];
    Object.keys(D).forEach(function (k) {
      var v = D[k];
      // « | » autorise une coupure après lui (classe BA d'UAX 14) : gluer |D| et ∫|Ḋ| dans la note
      // par un gluon de mots (U+2060) ; pas dans les textes dessinés sur le canvas.
      if (k === "note") v = v.replace(/\|/g, "|\u2060");
      if (typeof v === "string") D[k] = typo(lg, v);
      else if (typeof v === "function") D[k] = function () { return typo(lg, v.apply(null, arguments)); };
    });
  });

  /* ---------- utilitaires ---------- */
  function langOf() {
    return /^en/i.test(document.documentElement.getAttribute("lang") || "") ? "en" : "fr";
  }

  var NF = {};
  function fmt(lang, x, d, group) {
    if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0;   // pas de « −0 »
    var key = lang + d + (group === false ? "n" : "g");
    if (!(key in NF)) {
      try {
        NF[key] = new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR",
          { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: group !== false });
      } catch (e) { NF[key] = null; }
    }
    var s;
    if (NF[key]) s = NF[key].format(x);
    else { s = x.toFixed(d); if (lang === "fr") s = s.replace(".", ","); }
    return s.replace(/-/g, "−");
  }

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function gauss() {                       // Box–Muller
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function luminance(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex) || /^#?([0-9a-f]{3})$/i.exec(hex);
    if (!m) {
      var r = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(hex);
      if (!r) return 1;
      return (0.2126 * r[1] + 0.7152 * r[2] + 0.0722 * r[3]) / 255;
    }
    var h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }

  function cssVar(cs, name, fallback) {
    var v = cs.getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || fallback;
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function styleButton(b, pressed) {
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
    b.style.background = pressed ? "var(--ink)" : "transparent";
    b.style.color = pressed ? "var(--bg)" : "var(--ink)";
  }

  /* ---------- widget ---------- */
  function Widget(el) {
    var self = this;
    this.el = el;
    this.lang = langOf();
    var T = this.T = TXT[this.lang];
    el.textContent = "";

    el.appendChild(mk("p", "widget-title", T.title));

    var controls = mk("div", "widget-controls");
    el.appendChild(controls);

    // Γ
    var gl = mk("label");
    gl.style.flexWrap = "wrap";
    this.gOut = mk("span", null, "");
    this.gOut.style.minWidth = "5.6em";
    var gi = this.gIn = document.createElement("input");
    gi.type = "range"; gi.min = String(G_MIN); gi.max = String(G_MAX); gi.step = String(G_STEP);
    gi.value = String(G_DEF);
    gi.setAttribute("aria-label", T.gName);
    gl.title = T.gName;
    gl.appendChild(this.gOut); gl.appendChild(gi);
    controls.appendChild(gl);

    // h
    var hl = mk("label");
    hl.style.flexWrap = "wrap";
    this.hOut = mk("span", null, "");
    this.hOut.style.minWidth = "4.6em";
    var hi = this.hIn = document.createElement("input");
    hi.type = "range"; hi.min = String(H_MIN); hi.max = String(H_MAX); hi.step = String(H_STEP);
    hi.value = String(H_DEF);
    hi.setAttribute("aria-label", T.hName);
    hl.title = T.hName;
    hl.appendChild(this.hOut); hl.appendChild(hi);
    controls.appendChild(hl);

    // vitesse
    var sg = mk("span");
    sg.setAttribute("role", "group");
    sg.setAttribute("aria-label", T.speed + " (" + T.speedTip + ")");
    sg.title = T.speedTip;
    sg.style.display = "inline-flex"; sg.style.flexWrap = "wrap";
    sg.style.alignItems = "center"; sg.style.gap = ".35rem";
    sg.appendChild(mk("span", null, T.speed + T.colon));
    this.speedBtns = [];
    SPEEDS.forEach(function (s) {
      var b = mk("button", null, "×" + s);
      b.type = "button";
      b.style.padding = ".3rem .55rem";
      b.addEventListener("click", function () { self.setSpeed(s); });
      sg.appendChild(b);
      self.speedBtns.push({ b: b, s: s });
    });
    controls.appendChild(sg);

    // boutons
    var bp = this.pauseBtn = mk("button", null, T.pause);
    bp.type = "button";
    bp.addEventListener("click", function () { if (self.running) self.stop(); else self.start(); });
    var br = mk("button", null, T.reset);
    br.type = "button"; br.title = T.resetTip;
    br.addEventListener("click", function () { self.reset(); });
    var bs = mk("button", null, T.sym);
    bs.type = "button"; bs.title = T.symTip;
    bs.setAttribute("aria-label", T.sym + T.colon + " " + T.symTip);
    bs.addEventListener("click", function () { self.symmetry(); });
    controls.appendChild(bp); controls.appendChild(br); controls.appendChild(bs);

    // canvas
    var cv = this.canvas = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", T.canvas);
    cv.textContent = T.canvas;
    el.appendChild(cv);
    this.ctx = cv.getContext("2d");

    // lecture
    var ro = this.readout = mk("p", "widget-readout");
    ro.setAttribute("aria-live", "polite");
    this.rl = [mk("span"), mk("span"), mk("span")];
    this.rl.forEach(function (s) { s.style.display = "block"; ro.appendChild(s); });
    el.appendChild(ro);
    el.appendChild(mk("p", "widget-note", T.note));

    // état
    this.g = G_DEF; this.h = H_DEF; this.speed = 1;
    this.hist = new Float64Array(NBIN);
    this.bt = new Float64Array(CAP); this.bq = new Float32Array(CAP); this.bd = new Float32Array(CAP);
    this.markers = [];
    this.running = false; this.raf = 0; this.lastTs = 0; this.acc = 0; this.lastRead = 0;
    this.visible = true;
    this.W = 0; this.H = 0; this.dpr = 0;

    gi.addEventListener("input", function () { self.setGamma(parseFloat(gi.value)); });
    hi.addEventListener("input", function () { self.setH(parseFloat(hi.value)); });

    this.readTheme();
    this.setSpeed(1, true);
    this.updateLabels();
    this.newState();
    this.advance(K_PREFILL);
    this.resize(true);

    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(function () {
        if (self.roPending) return;
        self.roPending = true;
        requestAnimationFrame(function () { self.roPending = false; self.resize(false); });
      });
      this.ro.observe(el);
    } else {
      window.addEventListener("resize", function () { self.resize(false); });
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { self.visible = e.isIntersecting; });
      }).observe(el);
    }
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onRm = function (e) { if (e.matches) self.stop(); };
      if (mq.addEventListener) mq.addEventListener("change", onRm);
      else if (mq.addListener) mq.addListener(onRm);
    }

    this.updateReadout();
    if (reducedMotion()) this.stop(); else this.start();
  }

  /* ----- thème ----- */
  Widget.prototype.readTheme = function () {
    var cs = getComputedStyle(document.documentElement);
    var c = {
      ink: cssVar(cs, "--ink", "#0a0a0a"),
      soft: cssVar(cs, "--soft", "#1f2937"),
      rule: cssVar(cs, "--rule", "#374151"),
      bg: cssVar(cs, "--bg", "#ffffff"),
      accent: cssVar(cs, "--accent", "#0037b3")
    };
    c.hair = cssVar(cs, "--hair", c.rule);
    c.dark = luminance(c.bg) < 0.5;
    c.pal = c.dark ? PAL_DARK : PAL_LIGHT;
    c.font = getComputedStyle(this.el).fontFamily || "system-ui, sans-serif";
    this.C = c;
  };

  /* ----- géométrie ----- */
  Widget.prototype.resize = function (force) {
    var r = this.canvas.getBoundingClientRect();
    var W = Math.floor(r.width || this.el.clientWidth || 600);
    var dpr = window.devicePixelRatio || 1;
    if (!force && W === this.W && dpr === this.dpr) return;
    this.W = W; this.dpr = dpr;
    var gap = 18, L;
    if (W >= 620) {
      var H = Math.round(Math.max(270, Math.min(340, W * 0.44)));
      var wb = Math.round(Math.min(H + 8, W * 0.42));
      L = { a: { x: 0, y: 0, w: W - wb - gap, h: H }, b: { x: W - wb, y: 0, w: wb, h: H }, H: H };
    } else {
      var ha = Math.round(Math.max(200, Math.min(260, W * 0.58)));
      var hb = Math.round(Math.min(W, 340));
      L = { a: { x: 0, y: 0, w: W, h: ha }, b: { x: 0, y: ha + gap, w: W, h: hb }, H: ha + gap + hb };
    }
    // zones de tracé
    var a = L.a;
    a.l = a.x + 34; a.r = a.x + a.w - 6; a.t = a.y + 26; a.b = a.y + a.h - 26;
    var b = L.b;
    var avw = b.w - 34 - 10, avh = b.h - 26 - 26;
    var s = Math.max(60, Math.min(avw, avh));
    b.s = s;
    b.l = b.x + 34 + Math.max(0, (avw - s) / 2); b.t = b.y + 26;
    b.r = b.l + s; b.b = b.t + s;
    this.L = L; this.H = L.H;
    this.canvas.style.height = L.H + "px";
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(L.H * dpr);
    this.draw();
  };

  /* ----- état et intégration ----- */
  Widget.prototype.newState = function () {
    // condition initiale : un des deux points fixes non triviaux (signe au hasard) + bruit N(0, 0,5²)
    var Ds = Math.sqrt(MU * (this.g + SQ_MN) / SQ_MN), Qs = -SQ_NM * Ds, sg = Math.random() < 0.5 ? -1 : 1;
    this.q = sg * Qs + 0.5 * gauss(); this.d = sg * Ds + 0.5 * gauss(); this.v = -SQ_MN + 0.5 * gauss();
    this.k = 0; this.sub = 0;
    this.head = 0; this.count = 0;
    this.markers = [];
    this.resetCounters();
    this.push(0, this.q, this.d);
  };

  Widget.prototype.resetCounters = function () {
    this.kChange = this.k;
    this.nCross = 0; this.nPost = 0;
    for (var i = 0; i < NBIN; i++) this.hist[i] = 0;
  };

  Widget.prototype.push = function (t, q, d) {
    this.bt[this.head] = t; this.bq[this.head] = q; this.bd[this.head] = d;
    this.head = (this.head + 1) % CAP;
    if (this.count < CAP) this.count++;
  };

  Widget.prototype.advance = function (n) {
    var q = this.q, d = this.d, v = this.v, g = this.g;
    var k = this.k, kc = this.kChange, sub = this.sub, hist = this.hist;
    var nCross = this.nCross, nPost = this.nPost;
    var h2 = 0.5 * DT, h6 = DT / 6, dMax = NBIN * BIN;
    for (var i = 0; i < n; i++) {
      var k1q = MU * q - v * d, k1d = -NU * d + v * q, k1v = g - v + q * d;
      var q2 = q + h2 * k1q, d2 = d + h2 * k1d, v2 = v + h2 * k1v;
      var k2q = MU * q2 - v2 * d2, k2d = -NU * d2 + v2 * q2, k2v = g - v2 + q2 * d2;
      var q3 = q + h2 * k2q, d3 = d + h2 * k2d, v3 = v + h2 * k2v;
      var k3q = MU * q3 - v3 * d3, k3d = -NU * d3 + v3 * q3, k3v = g - v3 + q3 * d3;
      var q4 = q + DT * k3q, d4 = d + DT * k3d, v4 = v + DT * k3v;
      var k4q = MU * q4 - v4 * d4, k4d = -NU * d4 + v4 * q4, k4v = g - v4 + q4 * d4;
      var dn = d + h6 * (k1d + 2 * k2d + 2 * k3d + k4d);
      q = q + h6 * (k1q + 2 * k2q + 2 * k3q + k4q);
      v = v + h6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      k++;
      var post = (k - kc) > K_TRANS;
      if ((d < 0) !== (dn < 0)) { nCross++; if (post) nPost++; }
      d = dn;
      if (post) {
        var ad = d < 0 ? -d : d;
        if (ad < dMax) {
          var dd = -NU * d + v * q;
          hist[Math.floor(ad / BIN)] += (dd < 0 ? -dd : dd) * DT;
        }
      }
      if (++sub === SUB) { sub = 0; this.push(k * DT, q, d); }
    }
    if (!(isFinite(q) && isFinite(d) && isFinite(v))) { this.newState(); return; }
    this.q = q; this.d = d; this.v = v; this.k = k; this.sub = sub;
    this.nCross = nCross; this.nPost = nPost;
  };

  Widget.prototype.riceRate = function () {
    var T = (this.k - this.kChange - K_TRANS) * DT;
    if (T <= 0) return 0;
    var nb = Math.round(this.h / BIN), s = 0;
    for (var i = 0; i < nb && i < NBIN; i++) s += this.hist[i];
    return s / (2 * this.h * T);
  };

  /* ----- actions ----- */
  Widget.prototype.setGamma = function (g) {
    g = Math.round(Math.min(G_MAX, Math.max(G_MIN, g)) * 1000) / 1000;
    if (g === this.g) return;
    this.g = g;
    var t = this.k * DT, last = this.markers[this.markers.length - 1];
    if (last && last.type === "g" && t - last.t < 2) { last.g = g; last.t = t; }
    else this.markers.push({ t: t, type: "g", g: g });
    this.resetCounters();
    if (!this.running) this.advance(K_PREFILL);
    this.updateLabels();
    this.draw();
    this.updateReadout();
  };

  Widget.prototype.setH = function (h) {
    h = Math.round(Math.min(H_MAX, Math.max(H_MIN, h)) * 100) / 100;
    this.h = h;
    this.updateLabels();
    this.draw();
    this.updateReadout();
  };

  Widget.prototype.setSpeed = function (s) {
    this.speed = s;
    this.speedBtns.forEach(function (o) { styleButton(o.b, o.s === s); });
  };

  Widget.prototype.reset = function () {
    this.newState();
    this.acc = 0;
    if (!this.running) this.advance(K_PREFILL);
    this.draw();
    this.updateReadout();
  };

  Widget.prototype.symmetry = function () {
    this.q = -this.q; this.d = -this.d;            // (Q, D, V) → (−Q, −D, V)
    var t = this.k * DT;
    this.push(t, NaN, NaN);                         // coupure de la courbe
    this.push(t, this.q, this.d);
    this.markers.push({ t: t, type: "s" });
    this.draw();
    this.updateReadout();
  };

  Widget.prototype.start = function () {
    if (this.running) return;
    this.running = true; this.lastTs = 0;
    this.pauseBtn.textContent = this.T.pause;
    this.readout.setAttribute("aria-busy", "true");   // pas d'annonce continue pendant l'animation
    var self = this;
    this.raf = requestAnimationFrame(function (ts) { self.frame(ts); });
  };

  Widget.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.pauseBtn.textContent = this.T.play;
    this.readout.setAttribute("aria-busy", "false");
    this.updateReadout();
  };

  Widget.prototype.frame = function (ts) {
    if (!this.running) return;
    var self = this;
    var dtr = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 1 / 60;
    this.lastTs = ts;
    if (this.visible) {
      this.acc += BASE_RATE * this.speed * dtr / DT;
      var n = Math.floor(this.acc);
      this.acc -= n;
      if (n > 0) this.advance(n);
      this.draw();
      if (ts - this.lastRead > 300) { this.lastRead = ts; this.updateReadout(); }
    }
    this.raf = requestAnimationFrame(function (t) { self.frame(t); });
  };

  /* ----- textes ----- */
  Widget.prototype.updateLabels = function () {
    var lg = this.lang;
    var gs = fmt(lg, this.g, 3), hs = fmt(lg, this.h, 2);
    this.gOut.textContent = "Γ\u00a0=\u00a0" + gs;
    this.gIn.setAttribute("aria-valuetext", gs);
    this.hOut.textContent = "h\u00a0=\u00a0" + hs;
    this.hIn.setAttribute("aria-valuetext", hs);
  };

  Widget.prototype.updateReadout = function () {
    var T = this.T, lg = this.lang;
    var since = (this.k - this.kChange) * DT;
    var lines = [
      T.l1(fmt(lg, this.g, 3), fmt(lg, Math.floor(since), 0)),
      T.l2(fmt(lg, this.nCross, 0), fmt(lg, this.nPost, 0))
    ];
    var Tp = since - TRANSIENT;
    if (Tp > 0) {
      lines.push(T.l3(fmt(lg, this.nPost, 0), fmt(lg, Math.floor(Tp), 0), fmt(lg, this.nPost / Tp, 4),
        fmt(lg, this.h, 2), fmt(lg, this.riceRate(), 4)));
    } else {
      lines.push(T.l3wait(fmt(lg, Math.ceil(-Tp), 0)));
    }
    for (var i = 0; i < 3; i++) if (this.rl[i].textContent !== lines[i]) this.rl[i].textContent = lines[i];
  };

  /* ----- dessin ----- */
  Widget.prototype.draw = function () {
    if (!this.L) return;
    var c = this.ctx, dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    c.lineJoin = "round"; c.lineCap = "round";
    this.drawSeries(this.L.a);
    this.drawPhase(this.L.b);
  };

  Widget.prototype.text = function (s, x, y, align, color, size, weight, halo) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + this.C.font;
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    if (halo) {
      c.lineWidth = 3; c.strokeStyle = this.C.bg; c.lineJoin = "round";
      c.strokeText(s, x, y);
    }
    c.fillStyle = color || this.C.ink;
    c.fillText(s, x, y);
    return c.measureText(s).width;
  };

  Widget.prototype.textWidth = function (s, size, weight) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + this.C.font;
    return c.measureText(s).width;
  };

  Widget.prototype.frameBox = function (p) {
    var c = this.ctx;
    c.lineWidth = 1; c.strokeStyle = this.C.rule; c.globalAlpha = 0.9;
    c.strokeRect(Math.round(p.l) + 0.5, Math.round(p.t) + 0.5, Math.round(p.r - p.l), Math.round(p.b - p.t));
    c.globalAlpha = 1;
  };

  Widget.prototype.titleLegend = function (p, title, legend) {
    var C = this.C, T = this.T;
    var tw = this.text(title, p.x, p.y + 15, "left", C.ink, 13, "700");
    if (!legend) return;
    var w1 = this.textWidth(T.pos, 12), w2 = this.textWidth(T.neg, 12);
    var lw = 12 + 5 + w1 + 12 + 12 + 5 + w2;
    if (tw + 16 + lw > p.w) return;
    var x = p.x + p.w - lw, y = p.y + 15, c = this.ctx;
    c.fillStyle = C.pal[0]; c.fillRect(x, y - 9, 12, 4);
    this.text(T.pos, x + 17, y, "left", C.soft, 12);
    x += 17 + w1 + 12;
    c.fillStyle = C.pal[1]; c.fillRect(x, y - 9, 12, 4);
    this.text(T.neg, x + 17, y, "left", C.soft, 12);
  };

  Widget.prototype.drawSeries = function (p) {
    var c = this.ctx, C = this.C, T = this.T, lg = this.lang;
    var tNow = this.k * DT, t1 = Math.max(tNow, WINDOW), t0 = t1 - WINDOW;
    var pw = p.r - p.l, ph = p.b - p.t;
    var X = function (t) { return p.l + (t - t0) / WINDOW * pw; };
    var Y = function (d) { return p.t + (AX - d) / (2 * AX) * ph; };

    this.titleLegend(p, T.panelA, true);

    c.save();
    c.beginPath(); c.rect(p.l, p.t, pw, ph); c.clip();

    // transitoire du réglage courant
    var tc = this.kChange * DT, te = Math.min(tc + TRANSIENT, tNow);
    if (te > t0 && te > tc) {
      var xa = X(Math.max(tc, t0)), xb = X(te);
      c.fillStyle = C.soft; c.globalAlpha = 0.09;
      c.fillRect(xa, p.t, xb - xa, ph);
      c.globalAlpha = 1;
      if (xb - xa > this.textWidth(T.transient, 11) + 8)
        this.text(T.transient, (xa + xb) / 2, p.b - 6, "center", C.soft, 11, "400", true);
    }

    // bande |D| < h
    c.fillStyle = C.pal[2]; c.globalAlpha = C.dark ? 0.28 : 0.2;
    c.fillRect(p.l, Y(this.h), pw, Y(-this.h) - Y(this.h));
    c.globalAlpha = 1;

    // grille
    c.lineWidth = 1; c.strokeStyle = C.hair; c.globalAlpha = 0.45;
    c.beginPath();
    [-2, 2].forEach(function (d) { var y = Math.round(Y(d)) + 0.5; c.moveTo(p.l, y); c.lineTo(p.r, y); });
    c.stroke(); c.globalAlpha = 1;

    // graduations du temps
    var lab = this.textWidth(fmt(lg, Math.max(t1, 1000), 0), 12) + 18;
    var steps = [50, 100, 200, 300, 600], step = 600;
    for (var si = 0; si < steps.length; si++) if (steps[si] * pw / WINDOW >= lab) { step = steps[si]; break; }
    var ticks = [];
    for (var tt = Math.ceil(t0 / step) * step; tt <= t1 + 1e-9; tt += step) ticks.push(tt);
    c.strokeStyle = C.hair; c.globalAlpha = 0.3; c.beginPath();
    ticks.forEach(function (t) { var x = Math.round(X(t)) + 0.5; c.moveTo(x, p.t); c.lineTo(x, p.b); });
    c.stroke(); c.globalAlpha = 1;

    // D = 0 (référence)
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(p.l, Y(0)); c.lineTo(p.r, Y(0)); c.stroke();

    // série D(t), colorée par le signe
    var pp = new Path2D(), pn = new Path2D();
    var start = (this.head - this.count + CAP) % CAP;
    var pd = NaN, px = 0;
    for (var i = 0; i < this.count; i++) {
      var j = (start + i) % CAP, t = this.bt[j], d = this.bd[j];
      if (t < t0 - 0.06) continue;
      if (d !== d) { pd = NaN; continue; }
      var x = X(t), y = Y(d);
      if (pd !== pd) { (d >= 0 ? pp : pn).moveTo(x, y); }
      else if ((pd >= 0) === (d >= 0)) { (d >= 0 ? pp : pn).lineTo(x, y); }
      else {
        var xz = px + (x - px) * pd / (pd - d), yz = Y(0);
        (pd >= 0 ? pp : pn).lineTo(xz, yz);
        (d >= 0 ? pp : pn).moveTo(xz, yz);
        (d >= 0 ? pp : pn).lineTo(x, y);
      }
      pd = d; px = x;
    }
    c.lineWidth = 1.4;
    c.strokeStyle = C.pal[0]; c.stroke(pp);
    c.strokeStyle = C.pal[1]; c.stroke(pn);

    // repères : changements de Γ et symétries
    var lastLab = [-1e9, -1e9], self = this;
    this.markers = this.markers.filter(function (m) { return m.t >= t0 - 1; });
    this.markers.forEach(function (m) {
      var xm = Math.round(X(m.t)) + 0.5;
      c.lineWidth = 1.5;
      if (m.type === "g") { c.strokeStyle = C.soft; c.setLineDash([4, 3]); }
      else { c.strokeStyle = C.pal[3]; c.setLineDash([2, 2]); }
      c.beginPath(); c.moveTo(xm, p.t); c.lineTo(xm, p.b); c.stroke();
      c.setLineDash([]);
      var s = m.type === "g" ? "Γ\u00a0=\u00a0" + fmt(lg, m.g, 3) : T.symMark;
      var w = self.textWidth(s, 11, "600");
      var xl = Math.min(xm + 3, p.r - w - 2);
      for (var row = 0; row < 2; row++) {            // deux rangées d'étiquettes, sans chevauchement
        if (xl > lastLab[row] + 4) {
          self.text(s, xl, p.t + 12 + 13 * row, "left", m.type === "g" ? C.soft : C.ink, 11, "600", true);
          lastLab[row] = xl + w;
          break;
        }
      }
    });

    // étiquette de la bande
    var yb = Y(this.h) - 4;
    this.text(T.band, p.l + 4, Math.max(p.t + 26, yb), "left", C.ink, 11, "600", true);

    c.restore();
    this.frameBox(p);

    // étiquettes des axes
    var sx = this;
    [-2, 0, 2].forEach(function (d) { sx.text(fmt(lg, d, 0), p.l - 6, Y(d) + 4, "right", C.soft, 12); });
    sx.text("D", p.l - 6, p.t + 11, "right", C.ink, 12, "700");
    var wt = this.textWidth("t", 12, "700");
    ticks.forEach(function (t) {
      var x = X(t), s = fmt(lg, t, 0), w = sx.textWidth(s, 12);
      if (x + w / 2 > p.r - wt - 8 || x - w / 2 < p.l - 30) return;
      sx.text(s, x, p.b + 16, "center", C.soft, 12);
    });
    sx.text("t", p.r, p.b + 16, "right", C.ink, 12, "700");
  };

  Widget.prototype.drawPhase = function (p) {
    var c = this.ctx, C = this.C, T = this.T, lg = this.lang;
    var s = p.s;
    var X = function (q) { return p.l + (q + AX) / (2 * AX) * s; };
    var Y = function (d) { return p.t + (AX - d) / (2 * AX) * s; };

    this.titleLegend(p, T.panelB, false);

    c.save();
    c.beginPath(); c.rect(p.l, p.t, s, s); c.clip();

    // bande |D| < h
    c.fillStyle = C.pal[2]; c.globalAlpha = C.dark ? 0.28 : 0.2;
    c.fillRect(p.l, Y(this.h), s, Y(-this.h) - Y(this.h));
    c.globalAlpha = 1;

    // grille
    c.lineWidth = 1; c.strokeStyle = C.hair; c.globalAlpha = 0.45; c.beginPath();
    [-2, 2].forEach(function (v) {
      var y = Math.round(Y(v)) + 0.5, x = Math.round(X(v)) + 0.5;
      c.moveTo(p.l, y); c.lineTo(p.r, y); c.moveTo(x, p.t); c.lineTo(x, p.b);
    });
    var x0 = Math.round(X(0)) + 0.5;
    c.moveTo(x0, p.t); c.lineTo(x0, p.b);
    c.stroke(); c.globalAlpha = 1;
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(p.l, Y(0)); c.lineTo(p.r, Y(0)); c.stroke();

    // traînée : dégradé d'opacité selon l'âge, couleur selon le signe de D
    var tNow = this.k * DT, tA = tNow - TRAIL;
    var paths = [];
    for (var ci = 0; ci < NCHUNK; ci++) paths.push([new Path2D(), new Path2D()]);
    var start = (this.head - this.count + CAP) % CAP;
    var pd = NaN, pxx = 0, pyy = 0;
    for (var i = 0; i < this.count; i++) {
      var j = (start + i) % CAP, t = this.bt[j], d = this.bd[j];
      if (t < tA) continue;
      if (d !== d) { pd = NaN; continue; }
      var x = X(this.bq[j]), y = Y(d);
      if (pd === pd) {
        var ch = Math.min(NCHUNK - 1, Math.max(0, Math.floor((t - tA) / TRAIL * NCHUNK)));
        var P = paths[ch];
        if ((pd >= 0) === (d >= 0)) {
          var pa = P[d >= 0 ? 0 : 1]; pa.moveTo(pxx, pyy); pa.lineTo(x, y);
        } else {
          var f = pd / (pd - d), xz = pxx + (x - pxx) * f, yz = Y(0);
          var a1 = P[pd >= 0 ? 0 : 1], a2 = P[d >= 0 ? 0 : 1];
          a1.moveTo(pxx, pyy); a1.lineTo(xz, yz); a2.moveTo(xz, yz); a2.lineTo(x, y);
        }
      }
      pd = d; pxx = x; pyy = y;
    }
    c.lineWidth = 1.3;
    for (ci = 0; ci < NCHUNK; ci++) {
      c.globalAlpha = 0.1 + 0.9 * Math.pow((ci + 1) / NCHUNK, 1.4);
      c.strokeStyle = C.pal[0]; c.stroke(paths[ci][0]);
      c.strokeStyle = C.pal[1]; c.stroke(paths[ci][1]);
    }
    c.globalAlpha = 1;

    // points fixes non triviaux
    var Ds = Math.sqrt(MU * (this.g + SQ_MN) / SQ_MN), Qs = -SQ_NM * Ds;
    c.strokeStyle = C.ink; c.lineWidth = 2;
    [[Qs, Ds], [-Qs, -Ds]].forEach(function (pt) {
      var x = X(pt[0]), y = Y(pt[1]), r = 5;
      c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x - r, y + r); c.lineTo(x + r, y - r);
      c.stroke();
    });

    // état courant
    var xc = X(this.q), yc = Y(this.d);
    c.beginPath(); c.arc(xc, yc, 5, 0, 2 * Math.PI);
    c.fillStyle = C.ink; c.fill();
    c.lineWidth = 2; c.strokeStyle = C.bg; c.stroke();

    c.restore();
    this.frameBox({ l: p.l, r: p.r, t: p.t, b: p.b });

    var sx = this;
    [-2, 0, 2].forEach(function (v) {
      sx.text(fmt(lg, v, 0), p.l - 6, Y(v) + 4, "right", C.soft, 12);
      sx.text(fmt(lg, v, 0), X(v), p.b + 16, "center", C.soft, 12);
    });
    sx.text("D", p.l - 6, p.t + 11, "right", C.ink, 12, "700");
    sx.text("Q", p.r, p.b + 16, "right", C.ink, 12, "700");
  };

  /* ---------- initialisation et thème ---------- */
  var instances = [];
  function refreshAll() {
    instances.forEach(function (w) { w.readTheme(); w.draw(); });
  }

  function init() {
    var els = document.querySelectorAll('div.widget[data-widget="' + NAME + '"]');
    for (var i = 0; i < els.length; i++) {
      if (els[i].getAttribute("data-ready") === "1") continue;
      els[i].setAttribute("data-ready", "1");
      instances.push(new Widget(els[i]));
    }
    if (instances.length && !init.observing) {
      init.observing = true;
      new MutationObserver(refreshAll).observe(document.documentElement,
        { attributes: true, attributeFilter: ["data-theme"] });
      if (window.matchMedia) {
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        if (mq.addEventListener) mq.addEventListener("change", refreshAll);
        else if (mq.addListener) mq.addListener(refreshAll);
      }
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
})();
