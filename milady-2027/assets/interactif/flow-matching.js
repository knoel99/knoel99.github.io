/* MilaDy 2027 — widget interactif « flow-matching ».
   Flow matching conditionnel en 2D avec le champ de vitesse marginal EXACT
   (aucun réseau : le champ que l'apprentissage chercherait à approcher est
   calculé en forme close puis intégré par la méthode de Heun).

   ------------------------------------------------------------------------
   Modèle
   ------------------------------------------------------------------------
   Base     : x0 ~ N(0, I2).
   Cible    : x1 ~ sum_k pi_k N(m_k, s^2 I2), deux composantes k = +/-,
              m_+ = (lambda, 0), m_- = (-lambda, 0), pi_+ = pi_- = 1/2,
              s = 0,35 (symétrie B -> -B : la cible est invariante par x -> -x).
   Couplage : indépendant, (x0, x1) ~ p0 (x) p1 (I-CFM, Tong et al. 2024).
   Chemin   : x_t = (1 - t) x0 + t x1, t dans [0, 1] (rectified flow /
              interpolant linéaire ; vitesse conditionnelle u = x1 - x0).

   Dérivation (vérifiée numériquement : Monte-Carlo et forme close) :
   (1) Sachant k, x_t = (1 - t) x0 + t m_k + t s e1 avec x0, e1 ~ N(0, I)
       indépendants, donc
           x_t | k ~ N(t m_k, sigma_t^2 I),   sigma_t^2 = (1 - t)^2 + t^2 s^2.
   (2) Sachant k, (u, x_t) est gaussien avec E[u | k] = m_k et
       Cov(u, x_t | k) = Cov(s e1 - x0, (1 - t) x0 + t s e1) = (t s^2 - (1 - t)) I.
       Conditionnement gaussien (Bishop, PRML, §2.3.1) :
           E[x1 - x0 | x_t, k] = m_k + a(t) (x_t - t m_k),
           a(t) = (t s^2 - (1 - t)) / sigma_t^2.
   (3) Champ marginal (Lipman et al. 2023, th. 1 ; Liu et al. 2023, th. 3.3 ;
       Albergo & Vanden-Eijnden 2023) : v(x, t) = E[x1 - x0 | x_t = x]
           = sum_k w_k(x, t) E[x1 - x0 | x_t = x, k],
           w_k(x, t) = pi_k N(x; t m_k, sigma_t^2 I) / sum_j pi_j N(x; t m_j, sigma_t^2 I)
       (formule de Bayes ; calcul en log-somme-exp ci-dessous).
       L'EDO dx/dt = v(x, t), x(0) ~ p0, a pour loi p_t à tout t (équation de
       continuité), donc x(1) ~ cible exactement.
   (4) Forme close pour deux composantes symétriques (contrôle) :
       w_+ - w_- = tanh(t m.x / sigma_t^2) et 1 - a(t) t = (1 - t) / sigma_t^2, d'où
           v(x, t) = [ (t s^2 - (1 - t)) x + (1 - t) tanh(t m.x / sigma_t^2) m ] / sigma_t^2.
       Vérifications : v(x, 0) = E[x1] - x = -x ; v(x, 1) = x - E[x0] = x.
   (5) Coordonnées x = (xi, eta) : d eta/dt = a(t) eta avec a = (1/2) d ln sigma_t^2 / dt,
       donc eta_t = sigma_t eta_0 (exact ; eta_1 = s eta_0 ~ N(0, s^2)).
       v_xi ne dépend que de (xi, t) et est impaire en xi : la droite xi = 0 est
       invariante, la moitié droite de la base est envoyée sur la moitié droite de
       la cible (masse 1/2, au voisinage de +m).
       v est lisse, donc (unicité de Cauchy-Lipschitz) deux trajectoires du flot ne
       sont jamais au même point au même instant. Leurs tracés DANS LE PLAN peuvent
       en revanche se couper à des instants différents : xi_t et eta_t ne sont pas
       monotones (v(x, 0) = -x contracte d'abord ; sigma_t est minimal en
       t* = 1/(1 + s^2)). Contrôle numérique (revue) : parmi les 40 trajectoires
       tracées, 12 à 59 paires sur 780 se coupent dans le plan, contre 136 à 222
       pour les 40 segments conditionnels. Au contraire, par un même (x, t) passe un
       continuum de chemins conditionnels x0 -> x1 de directions différentes
       (loi de (x0, x1) sachant x_t = x non dégénérée) : v en est la moyenne.
   (6) Heun (Runge-Kutta explicite d'ordre 2 ; Hairer, Nørsett & Wanner, Solving
       ODE I, §II.1 ; échantillonneur de Karras et al. 2022), h = 1/N :
           x~ = x_n + h v(x_n, t_n),
           x_{n+1} = x_n + (h/2) [ v(x_n, t_n) + v(x~, t_{n+1}) ].
       Affichage entre deux nœuds : interpolation linéaire.
   (7) Densité marginale exacte de xi sous p_t (courbe de référence) :
           p_t(xi) = (1/2) phi((xi - t lambda)/sigma_t)/sigma_t + (1/2) phi((xi + t lambda)/sigma_t)/sigma_t.
   (8) Statistiques cibles (t = 1) : E|xi_1| = s sqrt(2/pi) exp(-lambda^2/(2 s^2))
       + lambda erf(lambda/(s sqrt 2)) (loi normale repliée ; Leone, Nelson &
       Nottingham, Technometrics 3, 1961) ; écart-type de eta_1 = s ; P(xi_1 > 0) = 1/2.
       erf : Abramowitz & Stegun 7.1.26 (|erreur| <= 1,5e-7).
   (9) Cercles de référence : pour N(c, r^2 I2), P(|x - c| <= 2r) = 1 - e^{-2} ~ 86,5 %.
   (10) Flèches du champ : segment v(x, t) dt avec dt = 0,1 (déplacement pendant 0,1).

   Références :
   - Y. Lipman, R. T. Q. Chen, H. Ben-Hamu, M. Nickel, M. Le, « Flow Matching for
     Generative Modeling », ICLR 2023, arXiv:2210.02747.
   - X. Liu, C. Gong, Q. Liu, « Flow Straight and Fast: Learning to Generate and
     Transfer Data with Rectified Flow », ICLR 2023, arXiv:2209.03003.
   - M. S. Albergo, E. Vanden-Eijnden, « Building Normalizing Flows with Stochastic
     Interpolants », ICLR 2023, arXiv:2209.15571.
   - A. Tong et al., « Improving and Generalizing Flow-Based Generative Models with
     Minibatch Optimal Transport », TMLR 2024, arXiv:2302.00482.
   - T. Karras, M. Aittala, T. Aila, S. Laine, « Elucidating the Design Space of
     Diffusion-Based Generative Models », NeurIPS 2022, arXiv:2206.00364.

   Contrat : <div class="widget" data-widget="flow-matching"></div> ; textes
   FR / EN selon <html lang> ; couleurs lues dans les variables CSS de la page. */
(function () {
  "use strict";

  var NAME = "flow-matching";
  var S = 0.35;                 /* écart-type de chaque composante cible */
  var P = 600;                  /* nombre de particules du nuage */
  var K_LINES = 40;             /* trajectoires / chemins conditionnels tracés */
  var XMIN = -4.2, XMAX = 4.2, YMIN = -3, YMAX = 3;
  var NS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64, 80, 100, 128, 160, 200];
  var N_DEFAULT_INDEX = NS.indexOf(100);
  var DT_ARROW = 0.1;
  var DUR = 5200, HOLD_END = 1500, HOLD_START = 500;   /* ms */
  var BIN = 0.2;

  var I18N = {
    fr: {
      title: "Flow matching conditionnel : champ de vitesse marginal exact",
      lambda: "λ", lambdaLong: "λ, demi-écart entre les deux modes",
      t: "t", tLong: "temps t du flot",
      steps: "pas N", stepsLong: "pas N : nombre de pas de Heun",
      play: "Lecture", pause: "Pause", playLabel: "Lancer l'animation", pauseLabel: "Mettre l'animation en pause",
      resample: "Nouveau tirage",
      paths: "Chemins :", none: "aucun", cond: "conditionnels", flow: "flot",
      field: "champ v(x, t)",
      canvas: "Nuage de particules transporté de la gaussienne N(0, I₂) vers un mélange de deux gaussiennes de moyennes ±(λ, 0), avec la densité de la première coordonnée en dessous.",
      density: "densité de ξ",
      legRight: "vers +m", legLeft: "vers −m", legTarget: "cible (rayon 2s)", legPt: "loi exacte pₜ (rayon 2σₜ)",
      legField: "v(x, t)·Δt, Δt = 0,1", legCond: "xₜ = (1 − t)x₀ + t x₁, paires indépendantes",
      legDens: "densité exacte pₜ(ξ)", legHist: "histogramme du nuage",
      readout: function (o) {
        return "t = " + o.t + " (σₜ = " + o.st + ") · λ = " + o.lam + " · Heun, N = " + o.n + "\u00a0pas. " +
          "Nuage final (t = 1) : moyenne de |ξ| = " + o.mabs + " (cible " + o.mabsT + ", écart " + o.gap + ") · " +
          "écart-type de η = " + o.sdy + " (cible " + o.sdyT + ") · à droite : " + o.right + "\u202f% (cible 50\u202f%).";
      },
      note: "x = (ξ, η). Base x₀ ~ N(0, I₂) ; cible ½ N((λ, 0), s²I₂) + ½ N((−λ, 0), s²I₂), s = 0,35, invariante par x → −x (comme B → −B). " +
        "Champ exact v(x, t) = Σₖ wₖ(x, t) E[x₁ − x₀ | xₜ = x, k], avec w₊ = P(k = + | xₜ = x), intégré par Heun en N pas. " +
        "Par un même point x passent, au même instant t, des chemins conditionnels (segments x₀ → x₁) de directions différentes : v en est la moyenne. " +
        "Deux trajectoires du flot ne sont jamais au même point au même instant et aucune ne franchit ξ = 0 ; leurs tracés peuvent se couper dans le plan, " +
        "mais à des instants différents. Survol ou toucher : v et w₊ au point visé.",
      tipX: "x", tipV: "v", tipW: "w₊"
    },
    en: {
      title: "Conditional flow matching: exact marginal velocity field",
      lambda: "λ", lambdaLong: "λ, half-distance between the two modes",
      t: "t", tLong: "flow time t",
      steps: "steps N", stepsLong: "steps N: number of Heun steps",
      play: "Play", pause: "Pause", playLabel: "Start the animation", pauseLabel: "Pause the animation",
      resample: "New sample",
      paths: "Paths:", none: "none", cond: "conditional", flow: "flow",
      field: "field v(x, t)",
      canvas: "Particle cloud carried from the Gaussian N(0, I₂) to a mixture of two Gaussians with means ±(λ, 0), with the density of the first coordinate below.",
      density: "density of ξ",
      legRight: "to +m", legLeft: "to −m", legTarget: "target (radius 2s)", legPt: "exact distribution pₜ (radius 2σₜ)",
      legField: "v(x, t)·Δt, Δt = 0.1", legCond: "xₜ = (1 − t)x₀ + t x₁, independent pairs",
      legDens: "exact density pₜ(ξ)", legHist: "cloud histogram",
      readout: function (o) {
        return "t = " + o.t + " (σₜ = " + o.st + ") · λ = " + o.lam + " · Heun, N = " + o.n + (o.n === "1" ? "\u00a0step. " : "\u00a0steps. ") +
          "Final cloud (t = 1): mean |ξ| = " + o.mabs + " (target " + o.mabsT + ", gap " + o.gap + ") · " +
          "std of η = " + o.sdy + " (target " + o.sdyT + ") · on the right: " + o.right + "% (target 50%).";
      },
      note: "x = (ξ, η). Base x₀ ~ N(0, I₂); target ½ N((λ, 0), s²I₂) + ½ N((−λ, 0), s²I₂), s = 0.35, invariant under x → −x (like B → −B). " +
        "Exact field v(x, t) = Σₖ wₖ(x, t) E[x₁ − x₀ | xₜ = x, k], with w₊ = P(k = + | xₜ = x), integrated with Heun in N steps. " +
        "Through a given point x, at a given time t, pass conditional paths (segments x₀ → x₁) with different directions: v is their average. " +
        "Two flow trajectories are never at the same point at the same time, and none crosses ξ = 0; their traces may intersect in the plane, " +
        "but at different times. Hover or tap: v and w₊ at that point.",
      tipX: "x", tipV: "v", tipW: "w₊"
    }
  };

  var LIGHT_SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
  var DARK_SERIES = ["#3987e5", "#d95926", "#199e70", "#c98500"];
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  function getLang() {
    var l = (document.documentElement.getAttribute("lang") || "fr").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "fr";
  }

  function fmt(x, d, lang) {
    var s = Math.abs(x).toFixed(d);
    var neg = x < 0 && parseFloat(s) !== 0;
    if (lang === "fr") s = s.replace(".", ",");
    return (neg ? "\u2212" : "") + s;
  }

  /* Espaces insécables : pas de coupure autour de « = », « → », « ~ », ni avant
     « : » / « ; » en français (espace fine pour « ; »). */
  function nb(s, lang) {
    s = s.replace(/ = /g, "\u00a0=\u00a0").replace(/ \u2192 /g, "\u00a0\u2192\u00a0").replace(/ ~ /g, "\u00a0~\u00a0");
    if (lang === "fr") s = s.replace(/ :/g, "\u00a0:").replace(/ ;/g, "\u202f;");
    return s;
  }

  /* ---------------- aléa reproductible ---------------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function normalPair(rng) {
    var u = 0;
    while (u <= 1e-12) u = rng();
    var v = rng();
    var r = Math.sqrt(-2 * Math.log(u));
    return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)];
  }

  /* ---------------- physique / mathématiques ---------------- */
  function sigma2(t) { return (1 - t) * (1 - t) + t * t * S * S; }

  /* Composantes de la cible : [pi_k, m_k^xi, m_k^eta]. */
  function components(lam) { return [[0.5, lam, 0], [0.5, -lam, 0]]; }

  /* v(x, t) = sum_k w_k [m_k + a(t)(x - t m_k)], w_k par log-somme-exp (formule (3)).
     out = [v_xi, v_eta, w_0]. */
  function velocity(x, y, t, comps, out) {
    var s2 = sigma2(t);
    var a = (t * S * S - (1 - t)) / s2;
    var K = comps.length, k, lmax = -Infinity;
    var lw = velocity.lw || (velocity.lw = new Float64Array(8));
    for (k = 0; k < K; k++) {
      var c = comps[k];
      var dx = x - t * c[1], dy = y - t * c[2];
      lw[k] = Math.log(c[0]) - (dx * dx + dy * dy) / (2 * s2);
      if (lw[k] > lmax) lmax = lw[k];
    }
    var Z = 0;
    for (k = 0; k < K; k++) { lw[k] = Math.exp(lw[k] - lmax); Z += lw[k]; }
    var vx = 0, vy = 0;
    for (k = 0; k < K; k++) {
      var ck = comps[k], w = lw[k] / Z;
      vx += w * (ck[1] + a * (x - t * ck[1]));
      vy += w * (ck[2] + a * (y - t * ck[2]));
    }
    out[0] = vx; out[1] = vy; out[2] = lw[0] / Z;
    return out;
  }

  /* Heun, h = 1/N ; renvoie les nœuds (N+1) x P x 2 (formule (6)). */
  function integrate(x0, N, comps) {
    var n = x0.length / 2;
    var nodes = new Float32Array((N + 1) * n * 2);
    var h = 1 / N, v1 = [0, 0, 0], v2 = [0, 0, 0];
    for (var i = 0; i < n; i++) {
      var x = x0[2 * i], y = x0[2 * i + 1];
      nodes[2 * i] = x; nodes[2 * i + 1] = y;
      for (var j = 0; j < N; j++) {
        var t = j * h;
        velocity(x, y, t, comps, v1);
        var xp = x + h * v1[0], yp = y + h * v1[1];
        velocity(xp, yp, t + h, comps, v2);
        x += 0.5 * h * (v1[0] + v2[0]);
        y += 0.5 * h * (v1[1] + v2[1]);
        var o = ((j + 1) * n + i) * 2;
        nodes[o] = x; nodes[o + 1] = y;
      }
    }
    return nodes;
  }

  /* erf : Abramowitz & Stegun 7.1.26. */
  function erf(x) {
    var sgn = x < 0 ? -1 : 1; x = Math.abs(x);
    var tt = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * tt - 1.453152027) * tt) + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-x * x);
    return sgn * y;
  }
  /* E|xi_1| pour ½N(λ, s²) + ½N(−λ, s²) : moyenne de la normale repliée (formule (8)). */
  function foldedMean(lam) {
    return S * Math.sqrt(2 / Math.PI) * Math.exp(-lam * lam / (2 * S * S)) + lam * erf(lam / (S * Math.SQRT2));
  }
  /* p_t(xi), formule (7). */
  function densityXi(xi, t, lam) {
    var sd = Math.sqrt(sigma2(t)), c = 1 / (sd * Math.sqrt(2 * Math.PI));
    var a = (xi - t * lam) / sd, b = (xi + t * lam) / sd;
    return 0.5 * c * (Math.exp(-0.5 * a * a) + Math.exp(-0.5 * b * b));
  }

  /* ---------------- thème ---------------- */
  function parseColor(str) {
    str = (str || "").trim();
    var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(str);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(str);
    if (m) return [+m[1], +m[2], +m[3]];
    return null;
  }
  function readTheme() {
    var root = document.documentElement;
    var cs = getComputedStyle(root);
    function v(n, fb) { var x = cs.getPropertyValue(n).trim(); return x || fb; }
    var bg = v("--bg", "#ffffff");
    var rgb = parseColor(bg), dark;
    if (rgb) {
      dark = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 < 0.4;
    } else {
      var dt = root.getAttribute("data-theme");
      dark = dt === "dark" || (dt !== "light" && !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
    }
    return {
      bg: bg,
      ink: v("--ink", dark ? "#f5f7fa" : "#0a0a0a"),
      soft: v("--soft", dark ? "#dfe5ec" : "#1f2937"),
      rule: v("--rule", dark ? "#c7d0da" : "#374151"),
      accent: v("--accent", dark ? "#93bbff" : "#0037b3"),
      dark: dark,
      series: dark ? DARK_SERIES : LIGHT_SERIES
    };
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* Pastilles de légende en SVG (couleur = currentColor, fixée par updateLegend). */
  function swatch(kind) {
    var NSV = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NSV, "svg");
    svg.setAttribute("viewBox", "0 0 22 14");
    svg.setAttribute("width", "22"); svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    /* la feuille de style met .widget svg en bloc pleine largeur : on annule ici */
    svg.style.display = "inline-block"; svg.style.width = "22px"; svg.style.height = "14px";
    svg.style.maxWidth = "none"; svg.style.flex = "none";
    function add(tag, attrs) {
      var e = document.createElementNS(NSV, tag);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, String(attrs[k]));
      svg.appendChild(e); return e;
    }
    var cc = "currentColor";
    if (kind === "dot") add("circle", { cx: 11, cy: 7, r: 4, fill: cc });
    else if (kind === "ring") add("circle", { cx: 11, cy: 7, r: 5.6, fill: "none", stroke: cc, "stroke-width": 1.6 });
    else if (kind === "dashring") add("circle", { cx: 11, cy: 7, r: 5.6, fill: "none", stroke: cc, "stroke-width": 1.4, "stroke-dasharray": "3 2.3" });
    else if (kind === "marker") {
      add("line", { x1: 1, y1: 13, x2: 21, y2: 1, stroke: cc, "stroke-width": 1.2, opacity: 0.45 });
      add("circle", { cx: 11, cy: 7, r: 4, fill: "none", stroke: cc, "stroke-width": 2 });
    } else if (kind === "arrow") add("path", { d: "M2 7 H18 M14 3.5 L19 7 L14 10.5", fill: "none", stroke: cc, "stroke-width": 1.5 });
    else if (kind === "line") add("line", { x1: 1, y1: 7, x2: 21, y2: 7, stroke: cc, "stroke-width": 2 });
    else if (kind === "bars") {
      add("rect", { x: 3, y: 2, width: 7, height: 11 });
      add("rect", { x: 12, y: 5, width: 7, height: 8 });
    }
    return svg;
  }

  var instances = [];

  /* ======================================================================= */
  function build(host) {
    if (host.getAttribute("data-ready") === "1") return;
    host.setAttribute("data-ready", "1");
    var lang = getLang();
    var L = I18N[lang];
    host.textContent = "";

    var st = {
      lam: 1.5, t: 0, nIndex: N_DEFAULT_INDEX, mode: "flow", field: false, seed: 1,
      playing: false, holdUntil: 0, last: 0, raf: 0, visible: true, autoplayed: false,
      hover: null
    };
    var data = {};          /* x0, pairs, nodes, stats */
    var theme = readTheme();
    var geo = null;         /* géométrie courante */
    var cur = new Float32Array(2 * P);

    /* ---------- DOM ---------- */
    var title = el("p", "widget-title", L.title);
    var controls = el("div", "widget-controls");

    function slider(short, long, min, max, step, value, id) {
      var lab = el("label");
      var span = el("span", null, short);
      var input = document.createElement("input");
      input.type = "range"; input.min = String(min); input.max = String(max); input.step = String(step);
      input.value = String(value);
      input.setAttribute("aria-label", long);
      input.id = id;
      var out = el("span");
      out.style.minWidth = "2.6em";
      out.style.fontVariantNumeric = "tabular-nums";
      out.setAttribute("aria-hidden", "true");
      lab.appendChild(span); lab.appendChild(input); lab.appendChild(out);
      lab.title = long;
      return { label: lab, input: input, out: out };
    }
    var uid = NAME + "-" + Math.random().toString(36).slice(2, 8);
    var sLam = slider(L.lambda, L.lambdaLong, 0.5, 3, 0.05, st.lam, uid + "-lam");
    var sT = slider(L.t, L.tLong, 0, 1, 0.01, st.t, uid + "-t");
    var sN = slider(L.steps, L.stepsLong, 0, NS.length - 1, 1, st.nIndex, uid + "-n");
    sLam.input.style.width = "9rem"; sT.input.style.width = "9rem"; sN.input.style.width = "8rem";

    var bPlay = el("button", null, L.play); bPlay.type = "button";
    var bNew = el("button", null, L.resample); bNew.type = "button";
    var bField = el("button", null, L.field); bField.type = "button";

    var group = el("span");
    group.setAttribute("role", "group");
    group.style.display = "inline-flex"; group.style.flexWrap = "wrap"; group.style.alignItems = "center";
    group.style.gap = ".4rem";
    var gLab = el("span", null, L.paths);
    gLab.id = uid + "-paths";
    group.setAttribute("aria-labelledby", gLab.id);
    group.appendChild(gLab);
    var modeButtons = {};
    ["none", "cond", "flow"].forEach(function (m) {
      var b = el("button", null, L[m]); b.type = "button";
      b.addEventListener("click", function () { st.mode = m; syncButtons(); draw(); updateLegend(); });
      modeButtons[m] = b; group.appendChild(b);
    });

    controls.appendChild(sLam.label);
    controls.appendChild(sT.label);
    controls.appendChild(sN.label);
    controls.appendChild(bPlay);
    controls.appendChild(bNew);
    controls.appendChild(bField);
    controls.appendChild(group);

    var wrap = el("div");
    wrap.style.position = "relative"; wrap.style.width = "100%";
    var canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", L.canvas);
    canvas.style.touchAction = "pan-y";
    wrap.appendChild(canvas);

    var legend = el("div");
    legend.style.display = "flex"; legend.style.flexWrap = "wrap"; legend.style.gap = ".15rem 1rem";
    legend.style.fontSize = ".85rem"; legend.style.margin = ".45rem 0 .2rem"; legend.style.color = "var(--soft)";
    legend.style.lineHeight = "1.4";
    var legItems = {};
    function legItem(key, kind, text) {
      var s = el("span");
      s.style.display = "inline-flex"; s.style.alignItems = "center"; s.style.gap = ".35rem";
      var g = swatch(kind);
      s.appendChild(g); s.appendChild(el("span", null, nb(text, lang)));
      legend.appendChild(s);
      legItems[key] = { root: s, glyph: g };
    }
    legItem("right", "dot", L.legRight);
    legItem("left", "dot", L.legLeft);
    legItem("target", "ring", L.legTarget);
    legItem("pt", "dashring", L.legPt);
    legItem("cond", "marker", L.legCond);
    legItem("field", "arrow", L.legField);
    legItem("dens", "line", L.legDens);
    legItem("hist", "bars", L.legHist);

    var readout = el("p", "widget-readout");
    readout.setAttribute("aria-live", "polite");
    var note = el("p", "widget-note", nb(L.note, lang));

    host.appendChild(title);
    host.appendChild(controls);
    host.appendChild(wrap);
    host.appendChild(legend);
    host.appendChild(readout);
    host.appendChild(note);

    var ctx = canvas.getContext("2d");

    /* ---------- données ---------- */
    function sample() {
      var rng = mulberry32(0x9E3779B1 ^ (st.seed * 2654435761));
      var x0 = new Float64Array(2 * P);
      for (var i = 0; i < P; i++) {
        var z = normalPair(rng);
        x0[2 * i] = z[0]; x0[2 * i + 1] = z[1];
      }
      /* paires indépendantes : x0 des K premières particules, x1 tiré indépendamment */
      var kk = new Int8Array(K_LINES), eps = new Float64Array(2 * K_LINES);
      for (var j = 0; j < K_LINES; j++) {
        kk[j] = rng() < 0.5 ? 1 : -1;
        var e = normalPair(rng);
        eps[2 * j] = e[0]; eps[2 * j + 1] = e[1];
      }
      data.x0 = x0; data.k = kk; data.eps = eps;
    }

    function compute() {
      var N = NS[st.nIndex];
      var comps = components(st.lam);
      data.comps = comps;
      data.N = N;
      data.nodes = integrate(data.x0, N, comps);
      /* x1 des paires conditionnelles */
      var x1 = new Float64Array(2 * K_LINES);
      for (var j = 0; j < K_LINES; j++) {
        x1[2 * j] = data.k[j] * st.lam + S * data.eps[2 * j];
        x1[2 * j + 1] = S * data.eps[2 * j + 1];
      }
      data.x1 = x1;
      /* statistiques du nuage final */
      var base = N * P * 2, sabs = 0, sy = 0, sy2 = 0, right = 0;
      var side = new Int8Array(P);
      for (var i = 0; i < P; i++) {
        var xf = data.nodes[base + 2 * i], yf = data.nodes[base + 2 * i + 1];
        sabs += Math.abs(xf); sy += yf; sy2 += yf * yf;
        if (xf > 0) { right++; side[i] = 1; } else side[i] = -1;
      }
      var my = sy / P;
      data.side = side;
      data.stats = {
        mabs: sabs / P,
        sdy: Math.sqrt(Math.max(0, (sy2 - P * my * my) / (P - 1))),
        right: right / P,
        mabsT: foldedMean(st.lam)
      };
      /* échelle verticale fixe de la bande de densité (max de p_t sur t et xi) */
      var mx = 0;
      for (var a = 0; a <= 50; a++) {
        var tt = a / 50;
        for (var b = 0; b <= 168; b++) {
          var d = densityXi(XMIN + (XMAX - XMIN) * b / 168, tt, st.lam);
          if (d > mx) mx = d;
        }
      }
      data.ymax = mx * 1.18;
    }

    function positionsAt(t, outArr) {
      var N = data.N, nodes = data.nodes;
      var f = t * N, j = Math.floor(f);
      if (j >= N) { j = N - 1; f = N; }
      if (j < 0) { j = 0; f = 0; }
      var r = f - j, o0 = j * P * 2, o1 = (j + 1) * P * 2;
      for (var i = 0; i < 2 * P; i++) outArr[i] = nodes[o0 + i] + r * (nodes[o1 + i] - nodes[o0 + i]);
      return outArr;
    }

    /* ---------- géométrie ---------- */
    function layout() {
      var W = Math.floor(wrap.getBoundingClientRect().width);
      if (!(W > 0)) return false;
      if (geo && geo.W === W) return false;
      var small = W < 520;
      var padL = small ? 26 : 32, padR = 8, padT = 6, gap = 12;
      var k = Math.min((W - padL - padR) / (XMAX - XMIN), 80);
      var plotW = k * (XMAX - XMIN);
      var x0 = padL + ((W - padL - padR) - plotW) / 2;
      var mainH = k * (YMAX - YMIN);
      var stripH = Math.max(56, Math.min(110, k * 1.5));
      var padB = small ? 36 : 40;
      var H = Math.round(padT + mainH + gap + stripH + padB);
      var dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = H + "px";
      geo = {
        W: W, H: H, dpr: dpr, k: k, small: small,
        left: x0, right: x0 + plotW, top: padT, bottom: padT + mainH,
        sTop: padT + mainH + gap, sBottom: padT + mainH + gap + stripH
      };
      return true;
    }
    function px(x) { return geo.left + (x - XMIN) * geo.k; }
    function py(y) { return geo.top + (YMAX - y) * geo.k; }

    /* ---------- dessin ---------- */
    function draw() {
      if (!geo || !data.nodes) return;
      var c = ctx, th = theme, g = geo;
      var t = st.t, lam = st.lam;
      c.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
      c.clearRect(0, 0, g.W, g.H);
      c.fillStyle = th.bg; c.fillRect(0, 0, g.W, g.H);
      var fs = g.small ? 11 : 12;
      c.font = fs + "px " + FONT;

      positionsAt(t, cur);
      var blue = th.series[0], orange = th.series[1];

      /* --- panneau principal --- */
      c.save();
      c.beginPath(); c.rect(g.left, g.top, g.right - g.left, g.bottom - g.top); c.clip();
      /* axes ξ = 0, η = 0 */
      c.strokeStyle = th.rule; c.globalAlpha = 0.3; c.lineWidth = 1;
      c.beginPath();
      c.moveTo(px(0), g.top); c.lineTo(px(0), g.bottom);
      c.moveTo(g.left, py(0)); c.lineTo(g.right, py(0));
      c.stroke();
      c.globalAlpha = 1;

      /* champ v(x, t) */
      if (st.field) {
        var spacing = g.small ? 26 : 36;
        var nx = Math.max(6, Math.round((g.right - g.left) / spacing));
        var ny = Math.max(4, Math.round((g.bottom - g.top) / spacing));
        var vv = [0, 0, 0];
        c.strokeStyle = th.soft; c.fillStyle = th.soft; c.lineWidth = 1.1; c.globalAlpha = th.dark ? 0.6 : 0.5;
        c.beginPath();
        for (var ix = 0; ix < nx; ix++) {
          for (var iy = 0; iy < ny; iy++) {
            var gx = XMIN + (ix + 0.5) * (XMAX - XMIN) / nx;
            var gy = YMIN + (iy + 0.5) * (YMAX - YMIN) / ny;
            velocity(gx, gy, t, data.comps, vv);
            var X0 = px(gx), Y0 = py(gy);
            var dxp = vv[0] * DT_ARROW * g.k, dyp = -vv[1] * DT_ARROW * g.k;
            var len = Math.sqrt(dxp * dxp + dyp * dyp);
            if (len < 1.2) { c.moveTo(X0 + 1, Y0); c.arc(X0, Y0, 1, 0, 2 * Math.PI); continue; }
            var X1 = X0 + dxp, Y1 = Y0 + dyp;
            c.moveTo(X0, Y0); c.lineTo(X1, Y1);
            var hl = Math.min(5, 0.4 * len), ux = dxp / len, uy = dyp / len;
            c.moveTo(X1, Y1); c.lineTo(X1 - hl * (ux - 0.5 * uy), Y1 - hl * (uy + 0.5 * ux));
            c.moveTo(X1, Y1); c.lineTo(X1 - hl * (ux + 0.5 * uy), Y1 - hl * (uy - 0.5 * ux));
          }
        }
        c.stroke();
        c.globalAlpha = 1;
      }

      /* référence : cibles (rayon 2s) et loi exacte p_t (rayon 2 sigma_t), encre neutre */
      var sd = Math.sqrt(sigma2(t));
      c.strokeStyle = th.ink; c.lineWidth = 1.6;
      c.beginPath();
      c.arc(px(lam), py(0), 2 * S * g.k, 0, 2 * Math.PI);
      c.moveTo(px(-lam) + 2 * S * g.k, py(0));
      c.arc(px(-lam), py(0), 2 * S * g.k, 0, 2 * Math.PI);
      c.stroke();
      c.setLineDash([5, 4]); c.lineWidth = 1.3;
      c.beginPath();
      c.arc(px(t * lam), py(0), 2 * sd * g.k, 0, 2 * Math.PI);
      c.moveTo(px(-t * lam) + 2 * sd * g.k, py(0));
      c.arc(px(-t * lam), py(0), 2 * sd * g.k, 0, 2 * Math.PI);
      c.stroke();
      c.setLineDash([]);

      /* tracés : trajectoires du flot ou chemins conditionnels */
      var i, j;
      if (st.mode === "flow") {
        var N = data.N, nodes = data.nodes, f = t * N, jn = Math.min(N, Math.floor(f));
        [1, -1].forEach(function (sgn) {
          c.strokeStyle = sgn > 0 ? blue : orange;
          /* trajectoire complète, pâle */
          c.globalAlpha = 0.28; c.lineWidth = 1;
          c.beginPath();
          for (i = 0; i < K_LINES; i++) {
            if (data.side[i] !== sgn) continue;
            c.moveTo(px(nodes[2 * i]), py(nodes[2 * i + 1]));
            for (j = 1; j <= N; j++) c.lineTo(px(nodes[(j * P + i) * 2]), py(nodes[(j * P + i) * 2 + 1]));
          }
          c.stroke();
          /* partie parcourue */
          c.globalAlpha = 0.9; c.lineWidth = 1.6;
          c.beginPath();
          for (i = 0; i < K_LINES; i++) {
            if (data.side[i] !== sgn) continue;
            c.moveTo(px(nodes[2 * i]), py(nodes[2 * i + 1]));
            for (j = 1; j <= jn; j++) c.lineTo(px(nodes[(j * P + i) * 2]), py(nodes[(j * P + i) * 2 + 1]));
            c.lineTo(px(cur[2 * i]), py(cur[2 * i + 1]));
          }
          c.stroke();
        });
        c.globalAlpha = 1;
      } else if (st.mode === "cond") {
        [1, -1].forEach(function (sgn) {
          c.strokeStyle = sgn > 0 ? blue : orange;
          c.globalAlpha = 0.28; c.lineWidth = 1;
          c.beginPath();
          for (i = 0; i < K_LINES; i++) {
            if (data.k[i] !== sgn) continue;
            c.moveTo(px(data.x0[2 * i]), py(data.x0[2 * i + 1]));
            c.lineTo(px(data.x1[2 * i]), py(data.x1[2 * i + 1]));
          }
          c.stroke();
          c.globalAlpha = 0.9; c.lineWidth = 1.6;
          c.beginPath();
          for (i = 0; i < K_LINES; i++) {
            if (data.k[i] !== sgn) continue;
            var ax = data.x0[2 * i], ay = data.x0[2 * i + 1];
            c.moveTo(px(ax), py(ay));
            c.lineTo(px((1 - t) * ax + t * data.x1[2 * i]), py((1 - t) * ay + t * data.x1[2 * i + 1]));
          }
          c.stroke();
        });
        c.globalAlpha = 1;
      }

      /* nuage de particules, couleur = mode d'arrivée (signe de ξ à t = 1) */
      var r = g.small ? 1.7 : 2.1;
      [1, -1].forEach(function (sgn) {
        c.fillStyle = sgn > 0 ? blue : orange;
        c.globalAlpha = 0.78;
        c.beginPath();
        for (var q = 0; q < P; q++) {
          if (data.side[q] !== sgn) continue;
          var X = px(cur[2 * q]), Y = py(cur[2 * q + 1]);
          c.moveTo(X + r, Y); c.arc(X, Y, r, 0, 2 * Math.PI);
        }
        c.fill();
      });
      c.globalAlpha = 1;

      /* marqueurs creux x_t sur les chemins conditionnels */
      if (st.mode === "cond") {
        c.lineWidth = 2;
        [1, -1].forEach(function (sgn) {
          c.strokeStyle = sgn > 0 ? blue : orange;
          c.beginPath();
          for (i = 0; i < K_LINES; i++) {
            if (data.k[i] !== sgn) continue;
            var X = px((1 - t) * data.x0[2 * i] + t * data.x1[2 * i]);
            var Y = py((1 - t) * data.x0[2 * i + 1] + t * data.x1[2 * i + 1]);
            c.moveTo(X + 4.5, Y); c.arc(X, Y, 4.5, 0, 2 * Math.PI);
          }
          c.fillStyle = th.bg; c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1;
          c.stroke();
        });
      }

      /* étiquettes ±m au-dessus des cercles cibles */
      c.fillStyle = th.ink; c.textAlign = "center"; c.textBaseline = "bottom";
      c.font = "700 " + fs + "px " + FONT;
      c.strokeStyle = th.bg; c.lineWidth = 3; c.lineJoin = "round";
      c.strokeText("+m", px(lam), py(2 * S) - 3);
      c.strokeText("\u2212m", px(-lam), py(2 * S) - 3);
      c.fillText("+m", px(lam), py(2 * S) - 3);
      c.fillText("\u2212m", px(-lam), py(2 * S) - 3);

      /* survol : v et w_+ au point visé */
      if (st.hover) drawHover(c, th, g, fs);
      c.restore();

      /* étiquette du temps (au-dessus du clip pour rester lisible) */
      c.font = "700 " + (fs + 2) + "px " + FONT;
      c.textAlign = "left"; c.textBaseline = "top";
      var tl = "t = " + fmt(t, 2, lang);
      var tw = c.measureText(tl).width;
      c.fillStyle = th.bg; c.globalAlpha = 0.85;
      c.fillRect(g.left + 4, g.top + 4, tw + 10, fs + 9);
      c.globalAlpha = 1; c.fillStyle = th.ink;
      c.fillText(tl, g.left + 9, g.top + 8);

      /* cadre principal */
      c.strokeStyle = th.rule; c.lineWidth = 1;
      c.strokeRect(g.left + 0.5, g.top + 0.5, g.right - g.left - 1, g.bottom - g.top - 1);

      /* graduations η */
      c.font = fs + "px " + FONT;
      c.fillStyle = th.soft; c.textAlign = "right"; c.textBaseline = "middle";
      var ys = g.small ? [-2, 0, 2] : [-2, -1, 0, 1, 2];
      ys.forEach(function (yv) {
        c.fillText(fmt(yv, 0, lang), g.left - 5, py(yv));
        c.beginPath(); c.moveTo(g.left - 3, py(yv)); c.lineTo(g.left, py(yv));
        c.strokeStyle = th.rule; c.stroke();
      });
      c.font = "italic 700 " + (fs + 1) + "px " + FONT;
      c.fillStyle = th.ink; c.textBaseline = "top";
      c.fillText("η", g.left - 6, g.top + 2);

      /* --- bande : densité de ξ --- */
      var sH = g.sBottom - g.sTop;
      function sy(d) { return g.sBottom - Math.min(1, d / data.ymax) * (sH - 4); }
      var nb = Math.round((XMAX - XMIN) / BIN);
      var cntR = new Float64Array(nb), cntL = new Float64Array(nb);
      for (i = 0; i < P; i++) {
        var b = Math.floor((cur[2 * i] - XMIN) / BIN);
        if (b < 0 || b >= nb) continue;
        if (data.side[i] > 0) cntR[b]++; else cntL[b]++;
      }
      var norm = 1 / (P * BIN);
      for (b = 0; b < nb; b++) {
        var xl = px(XMIN + b * BIN) + 1, wpx = Math.max(1, BIN * g.k - 2);
        var hL = cntL[b] * norm, hR = cntR[b] * norm;
        if (hL > 0) {
          c.fillStyle = orange; c.globalAlpha = 0.75;
          c.fillRect(xl, sy(hL), wpx, g.sBottom - sy(hL));
        }
        if (hR > 0) {
          c.fillStyle = blue; c.globalAlpha = 0.75;
          var yb = sy(hL), yt = sy(hL + hR);
          c.fillRect(xl, yt, wpx, yb - yt);
        }
      }
      c.globalAlpha = 1;
      /* densité exacte p_t(ξ) */
      c.strokeStyle = th.ink; c.lineWidth = 2;
      c.beginPath();
      var steps = Math.round(g.right - g.left);
      for (i = 0; i <= steps; i++) {
        var xv = XMIN + (XMAX - XMIN) * i / steps;
        var yy = sy(densityXi(xv, t, lam));
        if (i === 0) c.moveTo(px(xv), yy); else c.lineTo(px(xv), yy);
      }
      c.stroke();
      c.strokeStyle = th.rule; c.lineWidth = 1;
      c.strokeRect(g.left + 0.5, g.sTop + 0.5, g.right - g.left - 1, sH - 1);
      c.font = fs + "px " + FONT; c.fillStyle = th.soft; c.textAlign = "left"; c.textBaseline = "top";
      c.fillText(L.density, g.left + 6, g.sTop + 4);

      /* graduations ξ (partagées) */
      c.textAlign = "center"; c.textBaseline = "top"; c.fillStyle = th.soft;
      var xs = g.small ? [-4, -2, 0, 2, 4] : [-4, -3, -2, -1, 0, 1, 2, 3, 4];
      xs.forEach(function (xv) {
        c.fillText(fmt(xv, 0, lang), px(xv), g.sBottom + 4);
        c.beginPath(); c.moveTo(px(xv), g.sBottom); c.lineTo(px(xv), g.sBottom + 3);
        c.strokeStyle = th.rule; c.stroke();
      });
      c.font = "italic 700 " + (fs + 1) + "px " + FONT; c.fillStyle = th.ink;
      c.fillText("ξ", (g.left + g.right) / 2, g.sBottom + 4 + fs + 4);
    }

    function drawHover(c, th, g, fs) {
      var hv = st.hover;
      var x = XMIN + (hv.X - g.left) / g.k, y = YMAX - (hv.Y - g.top) / g.k;
      var vv = velocity(x, y, st.t, data.comps, [0, 0, 0]);
      /* flèche v Δt au point visé */
      var dxp = vv[0] * DT_ARROW * g.k, dyp = -vv[1] * DT_ARROW * g.k;
      c.strokeStyle = th.ink; c.fillStyle = th.ink; c.lineWidth = 2;
      c.beginPath(); c.arc(hv.X, hv.Y, 3, 0, 2 * Math.PI); c.fill();
      var len = Math.sqrt(dxp * dxp + dyp * dyp);
      if (len > 2) {
        var X1 = hv.X + dxp, Y1 = hv.Y + dyp, ux = dxp / len, uy = dyp / len, hl = Math.min(7, 0.4 * len);
        c.beginPath(); c.moveTo(hv.X, hv.Y); c.lineTo(X1, Y1);
        c.moveTo(X1, Y1); c.lineTo(X1 - hl * (ux - 0.5 * uy), Y1 - hl * (uy + 0.5 * ux));
        c.moveTo(X1, Y1); c.lineTo(X1 - hl * (ux + 0.5 * uy), Y1 - hl * (uy - 0.5 * ux));
        c.stroke();
      }
      var lines = [
        L.tipX + " = (" + fmt(x, 2, lang) + " ; " + fmt(y, 2, lang) + ")",
        L.tipV + " = (" + fmt(vv[0], 2, lang) + " ; " + fmt(vv[1], 2, lang) + ")",
        L.tipW + " = " + fmt(vv[2], 3, lang)
      ];
      if (lang === "en") {
        lines[0] = lines[0].replace(" ; ", ", ");
        lines[1] = lines[1].replace(" ; ", ", ");
      }
      c.font = fs + "px " + FONT;
      var w = 0;
      lines.forEach(function (s) { w = Math.max(w, c.measureText(s).width); });
      var bw = w + 14, bh = lines.length * (fs + 5) + 8;
      var bx = hv.X + 12, by = hv.Y + 12;
      if (bx + bw > g.right - 2) bx = hv.X - 12 - bw;
      if (by + bh > g.bottom - 2) by = hv.Y - 12 - bh;
      bx = Math.max(g.left + 2, bx); by = Math.max(g.top + 2, by);
      c.fillStyle = th.bg; c.globalAlpha = 0.94; c.fillRect(bx, by, bw, bh); c.globalAlpha = 1;
      c.strokeStyle = th.rule; c.lineWidth = 1; c.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
      c.fillStyle = th.ink; c.textAlign = "left"; c.textBaseline = "top";
      lines.forEach(function (s, q) { c.fillText(s, bx + 7, by + 5 + q * (fs + 5)); });
    }

    /* ---------- textes ---------- */
    function updateReadout() {
      var s = data.stats;
      readout.textContent = nb(L.readout({
        t: fmt(st.t, 2, lang), st: fmt(Math.sqrt(sigma2(st.t)), 2, lang), lam: fmt(st.lam, 2, lang),
        n: String(data.N),
        mabs: fmt(s.mabs, 2, lang), mabsT: fmt(s.mabsT, 2, lang), gap: fmt(Math.abs(s.mabs - s.mabsT), 2, lang),
        sdy: fmt(s.sdy, 2, lang), sdyT: fmt(S, 2, lang), right: fmt(100 * s.right, 1, lang)
      }), lang);
      sLam.out.textContent = fmt(st.lam, 2, lang);
      sT.out.textContent = fmt(st.t, 2, lang);
      sN.out.textContent = String(NS[st.nIndex]);
      sLam.input.setAttribute("aria-valuetext", "λ = " + fmt(st.lam, 2, lang));
      sT.input.setAttribute("aria-valuetext", "t = " + fmt(st.t, 2, lang));
      sN.input.setAttribute("aria-valuetext", "N = " + NS[st.nIndex]);
    }
    function updateLegend() {
      var th = theme;
      legItems.right.glyph.style.color = th.series[0];
      legItems.left.glyph.style.color = th.series[1];
      legItems.target.glyph.style.color = th.ink;
      legItems.pt.glyph.style.color = th.ink;
      legItems.cond.glyph.style.color = th.ink;
      legItems.field.glyph.style.color = th.soft;
      legItems.dens.glyph.style.color = th.ink;
      var bars = legItems.hist.glyph.querySelectorAll("rect");
      bars[0].setAttribute("fill", th.series[1]);
      bars[1].setAttribute("fill", th.series[0]);
      legItems.cond.root.style.display = st.mode === "cond" ? "inline-flex" : "none";
      legItems.field.root.style.display = st.field ? "inline-flex" : "none";
    }
    function setPressed(b, on) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.style.background = on ? "var(--ink)" : "";
      b.style.color = on ? "var(--bg)" : "";
    }
    function syncButtons() {
      Object.keys(modeButtons).forEach(function (m) { setPressed(modeButtons[m], st.mode === m); });
      setPressed(bField, st.field);
      /* nom accessible = texte visible (WCAG 2.5.3) ; pictogramme masqué, forme texte (U+FE0E) */
      bPlay.textContent = "";
      var glyph = el("span", null, st.playing ? "\u275a\u275a" : "\u25b6\ufe0e");
      glyph.setAttribute("aria-hidden", "true");
      bPlay.appendChild(glyph);
      bPlay.appendChild(document.createTextNode(" " + (st.playing ? L.pause : L.play)));
      bPlay.title = st.playing ? L.pauseLabel : L.playLabel;
    }

    /* ---------- animation ---------- */
    function frame(ts) {
      st.raf = 0;
      if (!st.playing || !st.visible) return;
      var dt = st.last ? Math.min(100, ts - st.last) : 0;
      st.last = ts;
      if (st.holdUntil) {
        if (ts >= st.holdUntil) {
          st.holdUntil = 0;
          if (st.t >= 1) { st.t = 0; st.holdUntil = ts + HOLD_START; }
        }
      } else {
        st.t += dt / DUR;
        if (st.t >= 1) { st.t = 1; st.holdUntil = ts + HOLD_END; }
      }
      sT.input.value = String(st.t);
      updateReadout();
      draw();
      st.raf = requestAnimationFrame(frame);
    }
    function play() {
      if (st.playing) return;
      st.playing = true;
      if (st.t >= 1) st.t = 0;
      st.last = 0; st.holdUntil = 0;
      readout.setAttribute("aria-live", "off");
      syncButtons();
      if (st.visible && !st.raf) st.raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (!st.playing) return;
      st.playing = false;
      if (st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
      readout.setAttribute("aria-live", "polite");
      syncButtons();
      updateReadout();
    }

    /* ---------- évènements ---------- */
    sLam.input.addEventListener("input", function () {
      st.lam = parseFloat(sLam.input.value);
      compute(); updateReadout(); draw();
    });
    sT.input.addEventListener("input", function () {
      pause();
      st.t = parseFloat(sT.input.value);
      updateReadout(); draw();
    });
    sN.input.addEventListener("input", function () {
      st.nIndex = parseInt(sN.input.value, 10);
      compute(); updateReadout(); draw();
    });
    bPlay.addEventListener("click", function () { if (st.playing) pause(); else play(); });
    bNew.addEventListener("click", function () {
      st.seed += 1; sample(); compute(); updateReadout(); draw();
    });
    bField.addEventListener("click", function () { st.field = !st.field; syncButtons(); updateLegend(); draw(); });

    function pointer(e) {
      if (!geo) return;
      var rect = canvas.getBoundingClientRect();
      var X = (e.clientX - rect.left) * (geo.W / rect.width), Y = (e.clientY - rect.top) * (geo.H / rect.height);
      if (X >= geo.left && X <= geo.right && Y >= geo.top && Y <= geo.bottom) st.hover = { X: X, Y: Y };
      else st.hover = null;
      if (!st.playing) draw();
    }
    canvas.addEventListener("pointermove", pointer);
    canvas.addEventListener("pointerdown", pointer);
    canvas.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;   /* au doigt, l'info reste jusqu'au toucher suivant */
      st.hover = null; if (!st.playing) draw();
    });

    function onResize() {
      if (layout()) draw();
    }
    if (window.ResizeObserver) {
      var pending = false;
      new ResizeObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; onResize(); });
      }).observe(wrap);
    } else {
      window.addEventListener("resize", onResize);
    }

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          st.visible = en.isIntersecting;
          if (st.visible) {
            if (!st.autoplayed) {
              st.autoplayed = true;
              if (!reducedMotion()) play();
            }
            if (st.playing && !st.raf) { st.last = 0; st.raf = requestAnimationFrame(frame); }
          } else if (st.raf) {
            cancelAnimationFrame(st.raf); st.raf = 0;
          }
        });
      }, { threshold: 0.15 }).observe(host);
    } else if (!reducedMotion()) {
      st.autoplayed = true;
      play();
    }

    /* ---------- démarrage ---------- */
    if (reducedMotion()) { st.t = 1; sT.input.value = "1"; }
    sample();
    compute();
    layout();
    syncButtons();
    updateLegend();
    updateReadout();
    draw();

    instances.push({
      retheme: function () { theme = readTheme(); updateLegend(); draw(); },
      motion: function () { if (reducedMotion()) pause(); },
      resize: function () { geo = null; onResize(); }
    });
  }

  /* ---------------- observateurs globaux ---------------- */
  var globalsReady = false;
  function setupGlobals() {
    if (globalsReady) return;
    globalsReady = true;
    function retheme() { instances.forEach(function (it) { it.retheme(); }); }
    if (window.MutationObserver) {
      new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
    }
    function listen(q, fn) {
      if (!window.matchMedia) return;
      var mq = window.matchMedia(q);
      if (mq.addEventListener) mq.addEventListener("change", fn);
      else if (mq.addListener) mq.addListener(fn);
    }
    listen("(prefers-color-scheme: dark)", retheme);
    listen("(prefers-reduced-motion: reduce)", function () { instances.forEach(function (it) { it.motion(); }); });
    var lastDpr = window.devicePixelRatio || 1;
    window.addEventListener("resize", function () {
      var d = window.devicePixelRatio || 1;
      if (d !== lastDpr) { lastDpr = d; instances.forEach(function (it) { it.resize(); }); }
    });
  }

  function init() {
    var hosts = document.querySelectorAll('div.widget[data-widget="' + NAME + '"]');
    if (!hosts.length) return;
    setupGlobals();
    for (var i = 0; i < hosts.length; i++) build(hosts[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  document.addEventListener("DOMContentLoaded", init);
})();
