/*
 * leray.js — MilaDy 2027, widget interactif « leray » (FR / EN).
 * Projection de Leray / décomposition de Helmholtz–Hodge sur le tore 2D [0, 2π)².
 * Usage : <div class="widget" data-widget="leray"></div> + <script defer src=".../leray.js"></script>
 * Attributs facultatifs : data-seed (graine initiale, entier ≥ 1, défaut 1), data-alpha (α initial, défaut 0,5).
 *
 * ---------------------------------------------------------------------------------------------
 * Formules utilisées (x = (x, y) ∈ [0, 2π)², k ∈ ℤ², k⊥ = (−k_y, k_x), |k| = √(k_x² + k_y²))
 *
 * 1. Champ. K = 20 vecteurs d'onde tirés (graine) parmi les 24 vecteurs entiers du demi-plan
 *    {k_x > 0} ∪ {k_x = 0, k_y > 0} tels que 1 ≤ |k| ≤ 4 (un seul représentant de ±k : les
 *    fonctions cos(k·x), sin(k·x), k ∈ K, sont alors deux à deux orthogonales sur le tore).
 *        u(x) = Σ_{k∈K} [ a_k cos(k·x) + b_k sin(k·x) ],   a_k, b_k ∈ ℝ²
 *    (forme réelle de u = Σ û_k e^{ik·x} avec û_k = (a_k − i b_k)/2, û_{−k} = conj(û_k)).
 *        a_k = s_k k⊥/|k| + α p_k k/|k|,   b_k = t_k k⊥/|k| + α q_k k/|k|,
 *    s_k, t_k, p_k, q_k ~ N(0, σ_k²), σ_k ∝ |k|^(−3/2) (générateur mulberry32 + Box–Muller).
 *    u = v + α ∇φ avec v = u_sol = ∇⊥ψ = (−∂_y ψ, ∂_x ψ), ψ = Σ (s_k sin(k·x) − t_k cos(k·x))/|k|,
 *    et ∇φ = u_grad, φ = Σ (p_k sin(k·x) − q_k cos(k·x))/|k|. Moyenne spatiale nulle (pas de k = 0,
 *    donc pas de partie harmonique : sur le tore, celle-ci serait le champ constant û_0, que P garde).
 *    Normalisation : ⟨|v|²⟩ = ⟨|∇φ|²⟩ = 1, où ⟨f⟩ = (2π)⁻² ∫ f dx.
 *
 * 2. Divergence analytique (∇·[a cos(k·x)] = −(k·a) sin(k·x), ∇·[b sin(k·x)] = (k·b) cos(k·x)) :
 *        ∇·u(x) = Σ_k [ (k·b_k) cos(k·x) − (k·a_k) sin(k·x) ],
 *    k·a_k = α p_k |k|, k·b_k = α q_k |k| (k·k⊥ = 0) : seule la partie gradient contribue.
 *    Évaluée sur une grille 128 × 128 (fond) par cos(k·x) = cos(k_x x) cos(k_y y) − sin(k_x x) sin(k_y y)
 *    et sin(k·x) = sin(k_x x) cos(k_y y) + cos(k_x x) sin(k_y y). Comme ∇·u est linéaire en α,
 *    max_grille |∇·u| = α D avec D = max_grille |∇·u| à α = 1 (repères sur la barre de couleur) ;
 *    échelle de couleur fixe pour un champ : ±S, S = D/2 = max |∇·u| à α = 0,5, saturée au-delà.
 *    Flèches (grille 16 × 16, centrées sur les centres des cellules) : longueur = |u| / U₉₀ cellule,
 *    U₉₀ = 90e centile de |u| à α = 1 sur la grille (échelle linéaire fixe pour un champ).
 *
 * 3. Projection de Leray (Leray 1934 ; Chorin 1968), mode par mode, exacte (pas de FFT : les
 *    coefficients sont connus) :
 *        P̂_k = I − k kᵀ/|k|²,   û_k ← û_k − k (k·û_k)/|k|²,   appliqué à a_k et à b_k.
 *    Ici P u = v. Transition animée : u_τ = u − τ (I − P) u = P u + (1 − τ)(I − P) u, τ : 0 → 1
 *    (lissage 3τ² − 2τ³ du temps, 0,9 s), puisque P est linéaire.
 *
 * 4. Normes (Parseval sur le tore, K dans un demi-plan) :
 *        ‖u‖² = ⟨|u|²⟩ = ½ Σ (|a_k|² + |b_k|²),
 *        ‖∇u‖² = ⟨Σ_ij (∂_i u_j)²⟩ = ½ Σ |k|² (|a_k|² + |b_k|²),
 *        ‖∇·u‖² = ⟨(∇·u)²⟩ = ½ Σ [ (k·a_k)² + (k·b_k)² ].
 *    Divergence relative δ = ‖∇·u‖ / ‖∇u‖ ∈ [0, 1] (|k·a| ≤ |k| |a|) : 0 si u est solénoïdal,
 *    1 si u est un gradient pur. Après projection, δ est évaluée sur les coefficients projetés en
 *    virgule flottante (résidu ~ 10⁻¹⁷, zéro à la précision machine).
 *
 * 5. Orthogonalité et Pythagore : ⟨v · ∇φ⟩ = ½ Σ (s_k p_k + t_k q_k)(k⊥·k)/|k|² = 0, donc
 *        ‖u‖² = ‖P u‖² + ‖(I − P) u‖²,  ‖P u‖² ≤ ‖u‖²  (P projecteur orthogonal : P² = P, P* = P),
 *    fraction d'énergie retirée f = ‖(I − P) u‖² / ‖u‖² = α² / (1 + α²) avec la normalisation du § 1.
 *    Panneau (b) : coordonnées (‖P u_τ‖, ‖(I − P) u_τ‖) = (‖P u‖, (1 − τ) ‖(I − P) u‖) dans L² = H ⊕ G.
 *
 * 6. Traceurs : dX/dt = u_τ(X), Runge–Kutta 4 à pas ≤ 0,02, repliement périodique ; 32 × 32
 *    particules sur une grille uniforme perturbée, relancées toutes les 4 unités de temps (1 u.t./s) ;
 *    sur une carte de moins de 360 px, une particule sur deux (damier) est dessinée.
 *    Continuité ∂ρ/∂t + ∇·(ρu) = 0, soit Dρ/Dt = −ρ ∇·u : les traceurs s'accumulent là où ∇·u < 0
 *    (puits) ; si ∇·u = 0, le flot préserve les aires (Liouville) et une densité uniforme reste
 *    uniforme. En pause ou avec prefers-reduced-motion : instantané à t = 2 u.t., calculé d'un coup.
 *
 * 7. Domaine borné Ω (non simulé ici) : u = w + ∇φ avec ∇·w = 0, w·n = 0 sur ∂Ω exige de résoudre
 *    Δφ = ∇·u dans Ω, ∂φ/∂n = u·n sur ∂Ω (problème de Neumann), puis P u = u − ∇φ (Chorin 1968 ;
 *    Temam 1977, chap. I). Même opération pour imposer ∇·B = 0 à un champ magnétique
 *    (nettoyage de divergence par projection, Brackbill & Barnes 1980).
 *
 * Références
 *  - H. von Helmholtz, « Über Integrale der hydrodynamischen Gleichungen, welche den
 *    Wirbelbewegungen entsprechen », J. reine angew. Math. 55, 25–55 (1858).
 *  - J. Leray, « Sur le mouvement d'un liquide visqueux emplissant l'espace », Acta Math. 63,
 *    193–248 (1934).
 *  - A. J. Chorin, « Numerical solution of the Navier–Stokes equations », Math. Comp. 22,
 *    745–762 (1968).
 *  - R. Temam, Navier–Stokes Equations: Theory and Numerical Analysis, North-Holland (1977).
 *  - A. J. Majda, A. L. Bertozzi, Vorticity and Incompressible Flow, Cambridge Univ. Press (2002).
 *  - J. U. Brackbill, D. C. Barnes, « The effect of nonzero ∇·B on the numerical solution of the
 *    magnetohydrodynamic equations », J. Comput. Phys. 35, 426–430 (1980).
 *  - H. Bhatia, G. Norgard, V. Pascucci, P.-T. Bremer, « The Helmholtz–Hodge decomposition —
 *    a survey », IEEE Trans. Vis. Comput. Graph. 19, 1386–1404 (2013).
 *  - B. Ottosson, « A perceptual color space for image processing » (OKLab, 2020) : interpolation
 *    de la palette divergente.
 * ---------------------------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var NAME = "leray";

  /* ---------- constantes ---------- */
  var TWO_PI = 2 * Math.PI;
  var KMAX = 4, NMODES = 20;
  var SPEC = 1.5;                 // σ_k ∝ |k|^(−SPEC)
  var NARROW = 16;                // grille des flèches 16 × 16
  var NIMG = 128;                 // grille de ∇·u (fond)
  var NTR = 32;                   // 32 × 32 traceurs
  var T_CYCLE = 4, T_SNAP = 2, RATE = 1, DT_MAX = 0.02;
  var TRANS_S = 0.9;              // durée de la transition de projection (s)
  var A_DEF = 0.5;
  var PAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
  var PAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];
  var ZERO_LIGHT = "#d5d9de", ZERO_DARK = "#343a42";   // gris de la palette divergente au zéro

  /* ---------- textes ---------- */
  var TXT = {
    fr: {
      title: "Projection de Leray : retirer la partie gradient d'un champ périodique 2D",
      aName: "α, part compressible (amplitude de la partie gradient)",
      newField: "Nouveau champ", newTip: "Nouvelle graine : nouveaux coefficients de Fourier aléatoires",
      project: "Projeter (Leray)", projectTip: "Applique û_k ← û_k − k (k·û_k)/|k|² à chaque mode (bascule)",
      showGrad: "afficher la partie gradient", tracers: "traceurs",
      pause: "Pause", play: "Lecture",
      titleU: "(a) u = v + α∇φ et ∇·u", titlePU: "(a) Pu = v et ∇·(Pu)", titleMid: "(a) projection en cours…",
      titleB: "(b) Dans L² = H ⊕ G", titleBshort: "(b) L² = H ⊕ G",
      axH: "H (∇·v = 0)", axG: "G (gradients)",
      legU: "u affiché", legG: "(I−P)u = α∇φ", legTr: function (t) { return "traceurs, t = " + t; },
      cbCap: "fond : ∇·u (échelle fixe, saturée au-delà)", cbCapShort: "fond : ∇·u (échelle fixe)", sinks: "puits", sources: "sources",
      pyth: "‖u‖² = ‖Pu‖² + ‖(I−P)u‖²",
      canvas: "Panneau (a) : carte de couleur de la divergence du champ affiché sur le domaine périodique " +
        "[0, 2π)², bleu pour les valeurs négatives, gris au zéro, orange pour les positives, avec les flèches " +
        "du champ sur une grille 16 × 16. Panneau (b) : triangle rectangle ‖u‖² = ‖Pu‖² + ‖(I−P)u‖² dans " +
        "l'espace L², somme orthogonale des champs à divergence nulle H et des gradients G.",
      l1: function (n, a, shown) { return "Graine " + n + " : 20 modes, 1 ≤ |k| ≤ 4 · α = " + a + " · affiché : " + shown; },
      shownU: "u (non projeté)", shownPU: "Pu (projeté)", shownMid: "transition u → Pu",
      l2: function (b, a, exact) {
        return "Divergence relative ‖∇·u‖/‖∇u‖ : avant " + b + " ; après projection " + a +
          (exact ? " (exact)" : " (zéro à la précision machine)");
      },
      l3: function (e, pe, kept, re, rem) {
        return "Énergie ‖u‖² = " + e + " ; ‖Pu‖² = " + pe + " ≤ ‖u‖² (conservée : " + kept +
          ") ; retirée ‖(I−P)u‖² = " + re + " (" + rem + ")";
      },
      note: "Domaine périodique [0, 2π)², u = v + α∇φ avec v = u_sol (∇·v = 0) et ∇φ = u_grad, " +
        "20 modes de Fourier aléatoires ; ‖f‖² = ⟨|f|²⟩ (moyenne sur le domaine) et ‖v‖ = ‖∇φ‖ = 1, " +
        "donc fraction retirée = α²/(1 + α²). P agit mode par mode, û_k ← û_k − k\u00a0(k·û_k)/|k|², " +
        "exactement et sans FFT puisque les coefficients sont connus ; Pu ne dépend pas de α. " +
        "Fond : ∇·u, bleu < 0 (puits), orange > 0 (sources), gris = 0 ; échelle fixe pour un champ donné " +
        "(±S, S = max |∇·u| à α = 0,5, saturée au-delà) ; les repères au-dessus de la barre marquent ±max |∇·u| actuel. " +
        "Divergence relative : 0 pour un champ solénoïdal, 1 pour un gradient pur. " +
        "Traceurs : particules advectées par le champ affiché, relancées uniformément toutes les 4 unités de temps ; " +
        "Dρ/Dt = −ρ\u00a0∇·u les concentre dans les puits, alors qu'après projection l'écoulement conserve les aires " +
        "et leur densité reste uniforme. " +
        "En domaine borné, la projection exige de résoudre un problème de Poisson Δφ = ∇·u avec la condition " +
        "aux limites ∂φ/∂n = u·n, puis Pu = u − ∇φ ; c'est la même opération qui impose ∇·B = 0 " +
        "à un champ magnétique (nettoyage de divergence)."
    },
    en: {
      title: "Leray projection: removing the gradient part of a 2D periodic field",
      aName: "α, compressible part (amplitude of the gradient part)",
      newField: "New field", newTip: "New seed: new random Fourier coefficients",
      project: "Project (Leray)", projectTip: "Applies û_k ← û_k − k (k·û_k)/|k|² to every mode (toggle)",
      showGrad: "show gradient part", tracers: "tracers",
      pause: "Pause", play: "Play",
      titleU: "(a) u = v + α∇φ and ∇·u", titlePU: "(a) Pu = v and ∇·(Pu)", titleMid: "(a) projecting…",
      titleB: "(b) In L² = H ⊕ G", titleBshort: "(b) L² = H ⊕ G",
      axH: "H (∇·v = 0)", axG: "G (gradients)",
      legU: "u shown", legG: "(I−P)u = α∇φ", legTr: function (t) { return "tracers, t = " + t; },
      cbCap: "background: ∇·u (fixed scale, saturated beyond)", cbCapShort: "background: ∇·u (fixed scale)", sinks: "sinks", sources: "sources",
      pyth: "‖u‖² = ‖Pu‖² + ‖(I−P)u‖²",
      canvas: "Panel (a): color map of the divergence of the displayed field on the periodic domain " +
        "[0, 2π)², blue for negative values, gray at zero, orange for positive ones, with the field arrows " +
        "on a 16 × 16 grid. Panel (b): right triangle ‖u‖² = ‖Pu‖² + ‖(I−P)u‖² in the space L², " +
        "orthogonal sum of divergence-free fields H and gradients G.",
      l1: function (n, a, shown) { return "Seed " + n + ": 20 modes, 1 ≤ |k| ≤ 4 · α = " + a + " · shown: " + shown; },
      shownU: "u (not projected)", shownPU: "Pu (projected)", shownMid: "transition u → Pu",
      l2: function (b, a, exact) {
        return "Relative divergence ‖∇·u‖/‖∇u‖: before " + b + "; after projection " + a +
          (exact ? " (exact)" : " (zero to machine precision)");
      },
      l3: function (e, pe, kept, re, rem) {
        return "Energy ‖u‖² = " + e + "; ‖Pu‖² = " + pe + " ≤ ‖u‖² (kept: " + kept +
          "); removed ‖(I−P)u‖² = " + re + " (" + rem + ")";
      },
      note: "Periodic domain [0, 2π)², u = v + α∇φ with v = u_sol (∇·v = 0) and ∇φ = u_grad, " +
        "20 random Fourier modes; ‖f‖² = ⟨|f|²⟩ (domain average) and ‖v‖ = ‖∇φ‖ = 1, " +
        "so the removed fraction is α²/(1 + α²). P acts mode by mode, û_k ← û_k − k\u00a0(k·û_k)/|k|², " +
        "exactly and without an FFT since the coefficients are known; Pu does not depend on α. " +
        "Background: ∇·u, blue < 0 (sinks), orange > 0 (sources), gray = 0; fixed scale for a given field " +
        "(±S, S = max |∇·u| at α = 0.5, saturated beyond); the marks above the color bar show ±max |∇·u| now. " +
        "Relative divergence: 0 for a solenoidal field, 1 for a pure gradient. " +
        "Tracers: particles advected by the displayed field, reseeded uniformly every 4 time units; " +
        "Dρ/Dt = −ρ\u00a0∇·u gathers them in the sinks, whereas after projection the flow preserves areas " +
        "and their density stays uniform. " +
        "In a bounded domain, the projection requires solving a Poisson problem Δφ = ∇·u with the boundary " +
        "condition ∂φ/∂n = u·n, then Pu = u − ∇φ; the same operation enforces ∇·B = 0 " +
        "on a magnetic field (divergence cleaning)."
    }
  };

  /* ---------- utilitaires ---------- */
  function langOf() {
    return /^en/i.test(document.documentElement.getAttribute("lang") || "") ? "en" : "fr";
  }

  var NF = {};
  function fmt(lang, x, d) {
    if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0;   // pas de « −0 »
    var key = lang + d;
    if (!(key in NF)) {
      try {
        NF[key] = new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR",
          { minimumFractionDigits: d, maximumFractionDigits: d });
      } catch (e) { NF[key] = null; }
    }
    var s;
    if (NF[key]) s = NF[key].format(x);
    else { s = x.toFixed(d); if (lang === "fr") s = s.replace(".", ","); }
    return s.replace(/-/g, "−");
  }

  function pct(lang, f) { return fmt(lang, 100 * f, 1) + (lang === "fr" ? " %" : "%"); }

  // Texte du DOM : pas de coupure de ligne autour de =, ≤, ×, +, − entourés d'espaces, ni après
  // un « | » ou un « / » collé au signe suivant (U+2060, gluon : « |∇·u| », « ∂φ/∂n ») ;
  // en français, espace insécable avant « : », fine insécable avant « ; » et « % ».
  function glue(lang, s) {
    s = s.replace(/ ([=≤×+−]) /g, "\u00a0$1\u00a0").replace(/([|/])(?=[^\s|])/g, "$1\u2060");
    if (lang === "fr") s = s.replace(/ :/g, "\u00a0:").replace(/ ([;%])/g, "\u202f$1");
    return s;
  }

  var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
  function fmtSci(lang, x, d) {
    if (x === 0) return "0";
    var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
    var m = x / Math.pow(10, e);
    if (Math.abs(m) >= 10 - 0.5 * Math.pow(10, -d)) { m /= 10; e += 1; }
    if (Math.abs(m) < 1) { m *= 10; e -= 1; }
    return fmt(lang, m, d) + "\u00a0×\u00a010" + String(e).replace(/./g, function (ch) { return SUP[ch] || ch; });
  }

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussFrom(rng) {                 // Box–Muller
    var u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TWO_PI * v);
  }

  function parseColor(s) {
    var m = /^#?([0-9a-f]{6})$/i.exec(s) || /^#?([0-9a-f]{3})$/i.exec(s);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var r = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(s);
    if (r) return [+r[1], +r[2], +r[3]];
    return [255, 255, 255];
  }

  function luminance(s) {
    var c = parseColor(s);
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  }

  function cssVar(cs, name, fallback) {
    var v = cs.getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || fallback;
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function smooth(x) { return x * x * (3 - 2 * x); }

  /* ----- OKLab (Ottosson 2020) pour la palette divergente ----- */
  function toLin(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function toSrgb(c) {
    c = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(255 * c)));
  }
  function rgb2lab(rgb) {
    var r = toLin(rgb[0]), g = toLin(rgb[1]), b = toLin(rgb[2]);
    var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function lab2rgb(L) {
    var l = L[0] + 0.3963377774 * L[1] + 0.2158037573 * L[2];
    var m = L[0] - 0.1055613458 * L[1] - 0.0638541728 * L[2];
    var s = L[0] - 0.0894841775 * L[1] - 1.2914855480 * L[2];
    l = l * l * l; m = m * m * m; s = s * s * s;
    return [toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)];
  }
  function buildLut(neg, zero, pos) {          // 256 entrées pour t ∈ [−1, 1]
    var A = rgb2lab(parseColor(neg)), Z = rgb2lab(parseColor(zero)), B = rgb2lab(parseColor(pos));
    var lut = new Uint8ClampedArray(256 * 3);
    for (var i = 0; i < 256; i++) {
      var t = 2 * i / 255 - 1, E = t < 0 ? A : B, w = Math.abs(t);
      var c = lab2rgb([Z[0] + w * (E[0] - Z[0]), Z[1] + w * (E[1] - Z[1]), Z[2] + w * (E[2] - Z[2])]);
      lut[3 * i] = c[0]; lut[3 * i + 1] = c[1]; lut[3 * i + 2] = c[2];
    }
    return lut;
  }

  /* ---------- modes candidats : demi-plan, 1 ≤ |k| ≤ 4 (24 vecteurs) ---------- */
  var CAND = (function () {
    var L = [];
    for (var kx = 0; kx <= KMAX; kx++) {
      for (var ky = -KMAX; ky <= KMAX; ky++) {
        var k2 = kx * kx + ky * ky;
        if (k2 < 1 || k2 > KMAX * KMAX) continue;
        if (kx === 0 && ky <= 0) continue;
        L.push([kx, ky]);
      }
    }
    return L;
  })();

  /* tables cos(m x_i), sin(m x_i), m = 0..KMAX */
  function trigTable(xs) {
    var c = [], s = [];
    for (var m = 0; m <= KMAX; m++) {
      var cm = new Float64Array(xs.length), sm = new Float64Array(xs.length);
      for (var i = 0; i < xs.length; i++) { cm[i] = Math.cos(m * xs[i]); sm[i] = Math.sin(m * xs[i]); }
      c.push(cm); s.push(sm);
    }
    return { c: c, s: s };
  }
  // fond : centres des pixels ; x_i de gauche à droite, y_r de haut (2π) en bas (0)
  var TIX = trigTable(Array.from({ length: NIMG }, function (_, i) { return (i + 0.5) * TWO_PI / NIMG; }));
  var TIY = trigTable(Array.from({ length: NIMG }, function (_, r) { return TWO_PI - (r + 0.5) * TWO_PI / NIMG; }));
  // flèches : centres des cellules 16 × 16 (mêmes valeurs en x et en y, y vers le haut)
  var TA = trigTable(Array.from({ length: NARROW }, function (_, i) { return (i + 0.5) * TWO_PI / NARROW; }));

  /* ---------- champ ---------- */
  function makeField(seed) {
    var rng = mulberry32(seed * 7919 + 17);
    var idx = CAND.map(function (_, i) { return i; });
    for (var i = idx.length - 1; i > 0; i--) {            // Fisher–Yates
      var j = Math.floor(rng() * (i + 1)), tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    idx = idx.slice(0, NMODES).sort(function (a, b) { return a - b; });
    var n = NMODES;
    var F = {
      seed: seed, n: n,
      kx: new Int8Array(n), ky: new Int8Array(n), k2: new Float64Array(n), kn: new Float64Array(n),
      s: new Float64Array(n), t: new Float64Array(n), p: new Float64Array(n), q: new Float64Array(n)
    };
    var es = 0, eg = 0;
    for (var m = 0; m < n; m++) {
      var kx = CAND[idx[m]][0], ky = CAND[idx[m]][1];
      F.kx[m] = kx; F.ky[m] = ky; F.k2[m] = kx * kx + ky * ky; F.kn[m] = Math.sqrt(F.k2[m]);
      var sig = Math.pow(F.kn[m], -SPEC);
      F.s[m] = sig * gaussFrom(rng); F.t[m] = sig * gaussFrom(rng);
      F.p[m] = sig * gaussFrom(rng); F.q[m] = sig * gaussFrom(rng);
      es += 0.5 * (F.s[m] * F.s[m] + F.t[m] * F.t[m]);
      eg += 0.5 * (F.p[m] * F.p[m] + F.q[m] * F.q[m]);
    }
    var fs = 1 / Math.sqrt(es), fg = 1 / Math.sqrt(eg);     // ⟨|v|²⟩ = ⟨|∇φ|²⟩ = 1
    for (m = 0; m < n; m++) { F.s[m] *= fs; F.t[m] *= fs; F.p[m] *= fg; F.q[m] *= fg; }
    return F;
  }

  function newCoef(n) {
    return { ax: new Float64Array(n), ay: new Float64Array(n), bx: new Float64Array(n), by: new Float64Array(n) };
  }

  // a_k = s k⊥/|k| + α p k/|k|,  b_k = t k⊥/|k| + α q k/|k|
  function coefU(F, alpha, C) {
    for (var m = 0; m < F.n; m++) {
      var ex = F.kx[m] / F.kn[m], ey = F.ky[m] / F.kn[m];      // k/|k| ; k⊥/|k| = (−ey, ex)
      C.ax[m] = -F.s[m] * ey + alpha * F.p[m] * ex;
      C.ay[m] = F.s[m] * ex + alpha * F.p[m] * ey;
      C.bx[m] = -F.t[m] * ey + alpha * F.q[m] * ex;
      C.by[m] = F.t[m] * ex + alpha * F.q[m] * ey;
    }
    return C;
  }

  // Leray : û_k ← û_k − k (k·û_k)/|k|²
  function leray(F, C, out) {
    for (var m = 0; m < F.n; m++) {
      var kx = F.kx[m], ky = F.ky[m], k2 = F.k2[m];
      var da = (kx * C.ax[m] + ky * C.ay[m]) / k2, db = (kx * C.bx[m] + ky * C.by[m]) / k2;
      out.ax[m] = C.ax[m] - kx * da; out.ay[m] = C.ay[m] - ky * da;
      out.bx[m] = C.bx[m] - kx * db; out.by[m] = C.by[m] - ky * db;
    }
    return out;
  }

  // out = w1 C1 + w2 C2
  function combine(n, C1, w1, C2, w2, out) {
    for (var m = 0; m < n; m++) {
      out.ax[m] = w1 * C1.ax[m] + w2 * C2.ax[m]; out.ay[m] = w1 * C1.ay[m] + w2 * C2.ay[m];
      out.bx[m] = w1 * C1.bx[m] + w2 * C2.bx[m]; out.by[m] = w1 * C1.by[m] + w2 * C2.by[m];
    }
    return out;
  }

  // Parseval : ‖u‖², ‖∇·u‖², ‖∇u‖² (moyennes sur le tore)
  function norms(F, C) {
    var e = 0, ed = 0, eg = 0;
    for (var m = 0; m < F.n; m++) {
      var a2 = C.ax[m] * C.ax[m] + C.ay[m] * C.ay[m] + C.bx[m] * C.bx[m] + C.by[m] * C.by[m];
      var da = F.kx[m] * C.ax[m] + F.ky[m] * C.ay[m], db = F.kx[m] * C.bx[m] + F.ky[m] * C.by[m];
      e += 0.5 * a2; ed += 0.5 * (da * da + db * db); eg += 0.5 * F.k2[m] * a2;
    }
    return { E: e, Ediv: ed, Egrad: eg };
  }

  // évaluation ponctuelle (récurrence de Tchebychev pour cos(m x), sin(m x))
  var CXs = new Float64Array(KMAX + 1), SXs = new Float64Array(KMAX + 1);
  var CYs = new Float64Array(KMAX + 1), SYs = new Float64Array(KMAX + 1);
  function harmonics(x, C, S) {
    var c1 = Math.cos(x), s1 = Math.sin(x);
    C[0] = 1; S[0] = 0; C[1] = c1; S[1] = s1;
    for (var m = 2; m <= KMAX; m++) {
      C[m] = 2 * c1 * C[m - 1] - C[m - 2];
      S[m] = 2 * c1 * S[m - 1] - S[m - 2];
    }
  }
  function evalAt(F, C, x, y, out) {        // out = [u_x, u_y, ∇·u]
    harmonics(x, CXs, SXs); harmonics(y, CYs, SYs);
    var ux = 0, uy = 0, dv = 0;
    for (var m = 0; m < F.n; m++) {
      var kx = F.kx[m], ky = F.ky[m], aky = ky < 0 ? -ky : ky, sg = ky < 0 ? -1 : 1;
      var cxm = CXs[kx], sxm = SXs[kx], cym = CYs[aky], sym = sg * SYs[aky];
      var co = cxm * cym - sxm * sym, si = sxm * cym + cxm * sym;
      ux += C.ax[m] * co + C.bx[m] * si;
      uy += C.ay[m] * co + C.by[m] * si;
      dv += (kx * C.bx[m] + ky * C.by[m]) * co - (kx * C.ax[m] + ky * C.ay[m]) * si;
    }
    out[0] = ux; out[1] = uy; out[2] = dv;
    return out;
  }

  // ∇·u sur la grille du fond
  function divGrid(F, C, buf) {
    var N = NIMG;
    buf.fill(0);
    for (var m = 0; m < F.n; m++) {
      var kx = F.kx[m], ky = F.ky[m], aky = ky < 0 ? -ky : ky, sg = ky < 0 ? -1 : 1;
      var DA = kx * C.ax[m] + ky * C.ay[m], DB = kx * C.bx[m] + ky * C.by[m];
      if (DA === 0 && DB === 0) continue;
      var cxa = TIX.c[kx], sxa = TIX.s[kx], cya = TIY.c[aky], sya = TIY.s[aky];
      for (var r = 0; r < N; r++) {
        var cy = cya[r], sy = sg * sya[r], o = r * N;
        for (var i = 0; i < N; i++) {
          var co = cxa[i] * cy - sxa[i] * sy, si = sxa[i] * cy + cxa[i] * sy;
          buf[o + i] += DB * co - DA * si;
        }
      }
    }
    return buf;
  }

  // u sur la grille des flèches (i : x, j : y vers le haut)
  function arrowGrid(F, C, ux, uy) {
    var N = NARROW;
    ux.fill(0); uy.fill(0);
    for (var m = 0; m < F.n; m++) {
      var kx = F.kx[m], ky = F.ky[m], aky = ky < 0 ? -ky : ky, sg = ky < 0 ? -1 : 1;
      var cxa = TA.c[kx], sxa = TA.s[kx], cya = TA.c[aky], sya = TA.s[aky];
      for (var j = 0; j < N; j++) {
        var cy = cya[j], sy = sg * sya[j], o = j * N;
        for (var i = 0; i < N; i++) {
          var co = cxa[i] * cy - sxa[i] * sy, si = sxa[i] * cy + cxa[i] * sy;
          ux[o + i] += C.ax[m] * co + C.bx[m] * si;
          uy[o + i] += C.ay[m] * co + C.by[m] * si;
        }
      }
    }
  }

  function styleToggle(b, pressed) {
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

    var seed0 = parseInt(el.getAttribute("data-seed") || "1", 10);
    if (!(seed0 >= 1)) seed0 = 1;
    var a0 = parseFloat(el.getAttribute("data-alpha"));
    if (!(a0 >= 0 && a0 <= 1)) a0 = A_DEF;

    el.appendChild(mk("p", "widget-title", glue(this.lang, T.title)));
    var controls = mk("div", "widget-controls");
    el.appendChild(controls);

    // α
    var al = mk("label");
    al.style.flexWrap = "wrap";
    this.aOut = mk("span", null, "");
    this.aOut.style.minWidth = "4.6em";
    var ai = this.aIn = document.createElement("input");
    ai.type = "range"; ai.min = "0"; ai.max = "1"; ai.step = "0.01"; ai.value = String(a0);
    ai.setAttribute("aria-label", T.aName);
    al.title = T.aName;
    al.appendChild(this.aOut); al.appendChild(ai);
    controls.appendChild(al);

    // boutons
    var bn = mk("button", null, T.newField);
    bn.type = "button"; bn.title = T.newTip;
    bn.addEventListener("click", function () { self.newField(self.F.seed + 1); });
    var bpj = this.projBtn = mk("button", null, T.project);
    bpj.type = "button"; bpj.title = T.projectTip;
    bpj.addEventListener("click", function () { self.toggleProjection(); });
    controls.appendChild(bn); controls.appendChild(bpj);

    // cases
    function checkbox(text, checked, onChange) {
      var l = mk("label"), c = document.createElement("input");
      c.type = "checkbox"; c.checked = checked;
      c.addEventListener("change", function () { onChange(c.checked); });
      l.appendChild(c); l.appendChild(document.createTextNode(text));
      controls.appendChild(l);
      return c;
    }
    this.gradBox = checkbox(T.showGrad, false, function (v) { self.showGrad = v; self.draw(); });
    this.trBox = checkbox(T.tracers, true, function (v) { self.setTracers(v); });

    var bp = this.pauseBtn = mk("button", null, T.pause);
    bp.type = "button";
    bp.addEventListener("click", function () { self.setPlaying(!self.playing); });
    controls.appendChild(bp);

    // canvas
    var cv = this.canvas = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", T.canvas);
    cv.textContent = T.canvas;
    el.appendChild(cv);
    this.ctx = cv.getContext("2d");
    this.img = document.createElement("canvas");
    this.img.width = NIMG; this.img.height = NIMG;
    this.imgCtx = this.img.getContext("2d");
    this.imgData = this.imgCtx.createImageData(NIMG, NIMG);

    // lecture
    var ro = this.readout = mk("p", "widget-readout");
    ro.setAttribute("aria-live", "polite");
    this.rl = [mk("span"), mk("span"), mk("span")];
    this.rl.forEach(function (s) { s.style.display = "block"; ro.appendChild(s); });
    el.appendChild(ro);
    el.appendChild(mk("p", "widget-note", glue(this.lang, T.note)));

    // état
    this.alpha = Math.round(a0 * 100) / 100;
    this.showGrad = false;
    this.tracersOn = true;
    this.playing = !reducedMotion();
    this.target = 0; this.tauLin = 0;           // projection : cible 0/1, avancement linéaire
    this.divBuf = new Float32Array(NIMG * NIMG);
    this.gux = new Float64Array(NARROW * NARROW); this.guy = new Float64Array(NARROW * NARROW);
    this.ggx = new Float64Array(NARROW * NARROW); this.ggy = new Float64Array(NARROW * NARROW);
    this.tx = new Float64Array(NTR * NTR); this.ty = new Float64Array(NTR * NTR);
    this.tt = 0;
    this.imgKey = null;
    this.raf = 0; this.lastTs = 0; this.visible = true;
    this.W = 0; this.H = 0; this.dpr = 0;

    ai.addEventListener("input", function () { self.setAlpha(parseFloat(ai.value)); });

    this.readTheme();
    this.setField(makeField(seed0));
    this.restartTracers();
    this.updateButtons();
    this.resize(true);

    if (window.__LERAY_TEST__) el.__leray = this;   // accès pour les tests uniquement

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
        if (self.visible) self.ensureLoop();      // relance la boucle au retour à l'écran
      }).observe(el);
    }
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      var onRm = function (e) { if (e.matches) self.setPlaying(false); };
      if (mq.addEventListener) mq.addEventListener("change", onRm);
      else if (mq.addListener) mq.addListener(onRm);
    }
    this.ensureLoop();
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
    c.zero = c.dark ? ZERO_DARK : ZERO_LIGHT;
    c.lut = buildLut(c.pal[0], c.zero, c.pal[1]);
    c.font = getComputedStyle(this.el).fontFamily || "system-ui, sans-serif";
    this.C = c;
    this.imgKey = null;
  };

  /* ----- champ et coefficients ----- */
  Widget.prototype.setField = function (F) {
    this.F = F;
    var n = F.n;
    this.cU = newCoef(n); this.cP = newCoef(n); this.cG = newCoef(n); this.cCur = newCoef(n);
    // échelles fixes pour ce champ (indépendantes de α et de τ)
    var c1 = coefU(F, 1, newCoef(n));
    var buf = divGrid(F, c1, new Float32Array(NIMG * NIMG)), D = 0;
    for (var i = 0; i < buf.length; i++) { var a = Math.abs(buf[i]); if (a > D) D = a; }
    this.Dmax = D || 1;            // max |∇·u| à α = 1
    this.Sc = 0.5 * this.Dmax;     // échelle de couleur ±S (= max à α = 0,5)
    // flèches : échelle linéaire fixe pour un champ, U₉₀ (90e centile de |u| à α = 1) ↔ une cellule
    var ux = new Float64Array(NARROW * NARROW), uy = new Float64Array(NARROW * NARROW), mags = [];
    arrowGrid(F, c1, ux, uy);
    for (var j = 0; j < ux.length; j++) mags.push(Math.hypot(ux[j], uy[j]));
    mags.sort(function (x, y) { return x - y; });
    this.Uref = mags[Math.floor(0.9 * (mags.length - 1))] || 1;
    this.updateCoefs();
    this.seedTracers();
    this.updateReadout();
  };

  Widget.prototype.tau = function () { return smooth(this.tauLin); };

  Widget.prototype.updateCoefs = function () {
    var F = this.F;
    coefU(F, this.alpha, this.cU);
    leray(F, this.cU, this.cP);                      // P u
    combine(F.n, this.cU, 1, this.cP, -1, this.cG);  // (I − P) u
    this.updateCur();
    this.normU = norms(F, this.cU); this.normP = norms(F, this.cP); this.normG = norms(F, this.cG);
  };

  Widget.prototype.updateCur = function () {
    var tau = this.tau();
    combine(this.F.n, this.cU, 1 - tau, this.cP, tau, this.cCur);   // u_τ = (1 − τ) u + τ P u
    arrowGrid(this.F, this.cCur, this.gux, this.guy);
    arrowGrid(this.F, this.cG, this.ggx, this.ggy);
  };

  // échantillon ponctuel [u_x, u_y, ∇·u] de u, P u, (I − P) u ou du champ affiché (tests)
  Widget.prototype.sample = function (which, x, y) {
    var C = which === "P" ? this.cP : which === "G" ? this.cG : which === "cur" ? this.cCur : this.cU;
    return evalAt(this.F, C, x, y, [0, 0, 0]);
  };

  /* ----- traceurs ----- */
  Widget.prototype.seedTracers = function () {
    var rng = mulberry32(this.F.seed * 104729 + 3), h = TWO_PI / NTR, k = 0;
    for (var j = 0; j < NTR; j++) {
      for (var i = 0; i < NTR; i++, k++) {
        this.tx[k] = (i + rng()) * h; this.ty[k] = (j + rng()) * h;
      }
    }
    this.tt = 0;
  };

  Widget.prototype.advanceTracers = function (T) {
    var F = this.F, C = this.cCur, X = this.tx, Y = this.ty, n = X.length;
    var nsub = Math.max(1, Math.ceil(T / DT_MAX - 1e-9)), dt = T / nsub;
    var o = [0, 0, 0];
    for (var st = 0; st < nsub; st++) {
      for (var k = 0; k < n; k++) {
        var x = X[k], y = Y[k];
        evalAt(F, C, x, y, o); var k1x = o[0], k1y = o[1];
        evalAt(F, C, x + 0.5 * dt * k1x, y + 0.5 * dt * k1y, o); var k2x = o[0], k2y = o[1];
        evalAt(F, C, x + 0.5 * dt * k2x, y + 0.5 * dt * k2y, o); var k3x = o[0], k3y = o[1];
        evalAt(F, C, x + dt * k3x, y + dt * k3y, o);
        x += dt / 6 * (k1x + 2 * k2x + 2 * k3x + o[0]);
        y += dt / 6 * (k1y + 2 * k2y + 2 * k3y + o[1]);
        X[k] = x - TWO_PI * Math.floor(x / TWO_PI);
        Y[k] = y - TWO_PI * Math.floor(y / TWO_PI);
      }
    }
    this.tt += T;
  };

  // relance uniforme ; immobile (pause / mouvement réduit) : instantané à t = T_SNAP
  Widget.prototype.restartTracers = function () {
    this.seedTracers();
    if (this.tracersOn && !this.playing) this.advanceTracers(T_SNAP);
  };

  /* ----- actions ----- */
  Widget.prototype.setAlpha = function (a) {
    a = Math.round(Math.min(1, Math.max(0, a)) * 100) / 100;
    if (a === this.alpha) return;
    this.alpha = a;
    this.updateCoefs();
    this.restartTracers();
    this.updateReadout();
    this.draw();
  };

  Widget.prototype.newField = function (seed) {
    this.setField(makeField(seed));
    this.restartTracers();
    this.updateReadout();
    this.draw();
  };

  Widget.prototype.toggleProjection = function () {
    this.target = this.target ? 0 : 1;
    this.updateButtons();
    if (!this.playing) {                       // pas d'animation : saut direct
      this.tauLin = this.target;
      this.endTransition();
    } else {
      this.ensureLoop();
    }
    this.updateReadout();
  };

  Widget.prototype.endTransition = function () {
    this.updateCur();
    this.restartTracers();
    this.updateReadout();
    this.draw();
  };

  Widget.prototype.setTracers = function (on) {
    this.tracersOn = on;
    if (on) this.restartTracers();
    this.updateButtons();
    this.draw();
    this.ensureLoop();
  };

  Widget.prototype.setPlaying = function (on) {
    this.playing = on;
    if (!on && this.tauLin !== this.target) { this.tauLin = this.target; this.endTransition(); }
    this.updateButtons();
    this.ensureLoop();
  };

  Widget.prototype.updateButtons = function () {
    styleToggle(this.projBtn, this.target === 1);
    var pb = this.pauseBtn;
    pb.textContent = this.playing ? this.T.pause : this.T.play;
    pb.disabled = !this.tracersOn;
    pb.style.opacity = this.tracersOn ? "1" : "0.45";
    pb.style.cursor = this.tracersOn ? "pointer" : "default";
    this.readout.setAttribute("aria-busy", "false");
  };

  /* ----- boucle d'animation ----- */
  Widget.prototype.needsLoop = function () {
    // hors écran : seule une transition en cours garde la boucle active
    return this.tauLin !== this.target || (this.tracersOn && this.playing && this.visible);
  };

  Widget.prototype.ensureLoop = function () {
    if (this.raf || !this.needsLoop()) return;
    var self = this;
    this.lastTs = 0;
    this.raf = requestAnimationFrame(function (ts) { self.frame(ts); });
  };

  Widget.prototype.frame = function (ts) {
    this.raf = 0;
    var self = this;
    var dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 1 / 60;
    this.lastTs = ts;
    if (this.tauLin !== this.target) {
      var dir = this.target > this.tauLin ? 1 : -1;
      this.tauLin = Math.min(1, Math.max(0, this.tauLin + dir * dt / TRANS_S));
      if ((dir > 0 && this.tauLin >= this.target) || (dir < 0 && this.tauLin <= this.target)) {
        this.tauLin = this.target;
        this.endTransition();
      } else {
        this.updateCur();
      }
    }
    if (this.tracersOn && this.playing && this.visible) {
      this.advanceTracers(RATE * dt);
      if (this.tt >= T_CYCLE) this.seedTracers();
    }
    if (this.visible) this.draw();
    if (this.needsLoop()) this.raf = requestAnimationFrame(function (t) { self.frame(t); });
  };

  /* ----- lecture ----- */
  Widget.prototype.updateReadout = function () {
    if (!this.normU) return;
    var T = this.T, lg = this.lang;
    var nu = this.normU, np = this.normP, ng = this.normG;
    var dBefore = nu.Egrad > 0 ? Math.sqrt(nu.Ediv / nu.Egrad) : 0;
    var dAfter = np.Egrad > 0 ? Math.sqrt(np.Ediv / np.Egrad) : 0;
    var shown = this.tauLin === 0 && this.target === 0 ? T.shownU :
      (this.tauLin === 1 && this.target === 1 ? T.shownPU : T.shownMid);
    var lines = [
      T.l1(fmt(lg, this.F.seed, 0), fmt(lg, this.alpha, 2), shown),
      T.l2(fmt(lg, dBefore, 3), dAfter === 0 ? "0" : fmtSci(lg, dAfter, 1), dAfter === 0),
      T.l3(fmt(lg, nu.E, 3), fmt(lg, np.E, 3), pct(lg, np.E / nu.E), fmt(lg, ng.E, 3), pct(lg, ng.E / nu.E))
    ];
    for (var i = 0; i < 3; i++) {
      lines[i] = glue(lg, lines[i]);
      if (this.rl[i].textContent !== lines[i]) this.rl[i].textContent = lines[i];
    }
    this.aOut.textContent = "α\u00a0=\u00a0" + fmt(lg, this.alpha, 2);
    this.aIn.setAttribute("aria-valuetext", fmt(lg, this.alpha, 2));
  };

  /* ----- géométrie ----- */
  Widget.prototype.resize = function (force) {
    var r = this.canvas.getBoundingClientRect();
    var W = Math.floor(r.width || this.el.clientWidth || 600);
    var dpr = window.devicePixelRatio || 1;
    if (!force && W === this.W && dpr === this.dpr) return;
    this.W = W; this.dpr = dpr;
    var ml = 26, mt = 26, mb = 24, L = {};
    var CBH = 66;                                   // bloc de la barre de couleur
    if (W >= 600) {
      var wr = Math.max(210, Math.min(270, Math.round(W * 0.34)));
      var gap = 22;
      var s = Math.max(240, Math.min(520, W - wr - gap - ml - 2));
      wr = W - (ml + s + gap);
      var H = mt + s + mb;
      L.map = { l: ml, t: mt, s: s };
      var x0 = ml + s + gap;
      var cbY = H - CBH - 6;                      // marge basse : jambages de « puits (< 0) »
      L.cb = { x: x0, y: cbY, w: wr };
      L.leg = { x: x0, y: cbY - 62, w: wr, vertical: true };
      var hb = cbY - 62 - 8;                      // titre + triangle + formules
      L.b = this.layoutB(x0, 0, wr, hb);
      L.H = H;
    } else {
      var s2 = W - ml - 6;
      L.map = { l: ml, t: mt, s: s2 };
      var y = mt + s2 + mb + 4;
      var lh = this.legendHeight(W);
      L.leg = { x: 0, y: y, w: W, vertical: false };
      y += lh + 6;
      L.cb = { x: 0, y: y, w: Math.min(W, 420) };
      y += CBH + 12;
      var hb2 = Math.round(Math.max(230, Math.min(300, W * 0.8)));
      L.b = this.layoutB(0, y, Math.min(W, 420), hb2);
      L.H = y + hb2;
    }
    this.L = L; this.H = L.H;
    this.canvas.style.height = L.H + "px";
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(L.H * dpr);
    this.draw();
  };

  // panneau (b) : titre, triangle (origine O, échelle sc), deux lignes de formules
  Widget.prototype.layoutB = function (x, y, w, h) {
    var top = 24, bottom = 44, ox = x + 30;
    var sc = Math.min(150, w - 30 - 66, (h - top - bottom - 34) / 1.22);
    sc = Math.max(70, sc);
    var oy = y + top + 14 + 1.22 * sc;
    return { x: x, y: y, w: w, h: h, sc: sc, ox: ox, oy: oy, fy: oy + 40 };
  };

  Widget.prototype.legendItems = function () {
    var T = this.T, C = this.C;
    return [
      { kind: "arrow", color: C.ink, text: T.legU, on: true },
      { kind: "arrow", color: C.pal[2], text: T.legG, on: this.showGrad },
      { kind: "dot", color: C.pal[3], text: T.legTr(fmt(this.lang, Math.min(this.tt, T_CYCLE - 0.05), 1)), on: this.tracersOn }
    ];
  };

  Widget.prototype.legendHeight = function (w) {
    var items = this.legendItems(), x = 0, lines = 1;
    for (var i = 0; i < items.length; i++) {
      var iw = 30 + this.textWidth(items[i].text.replace(/\d/g, "0"), 12) + 16;
      if (x > 0 && x + iw > w) { lines++; x = 0; }
      x += iw;
    }
    return lines * 18;
  };

  /* ----- dessin ----- */
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

  // flèche simple (légende, panneau b)
  Widget.prototype.arrow = function (x0, y0, x1, y1, color, lw, head) {
    var c = this.ctx, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    if (L < 1e-6) return;
    var ux = dx / L, uy = dy / L, hl = Math.min(head, 0.6 * L), hw = 0.5 * hl;
    c.strokeStyle = color; c.fillStyle = color; c.lineWidth = lw; c.lineCap = "round";
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * hl * 0.8, y1 - uy * hl * 0.8); c.stroke();
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 - ux * hl - uy * hw, y1 - uy * hl + ux * hw);
    c.lineTo(x1 - ux * hl + uy * hw, y1 - uy * hl - ux * hw);
    c.closePath(); c.fill();
  };

  Widget.prototype.draw = function () {
    if (!this.L) return;
    var c = this.ctx, dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    c.lineJoin = "round"; c.lineCap = "round";
    this.drawMap(this.L.map);
    this.drawLegend(this.L.leg);
    this.drawColorbar(this.L.cb);
    this.drawB(this.L.b);
  };

  Widget.prototype.updateImage = function () {
    var key = this.F.seed + "|" + this.alpha + "|" + this.tauLin;
    if (key === this.imgKey) return;
    this.imgKey = key;
    var buf = divGrid(this.F, this.cCur, this.divBuf), D = this.Sc, lut = this.C.lut;
    var px = this.imgData.data;
    for (var i = 0, o = 0; i < buf.length; i++, o += 4) {
      var t = buf[i] / D;
      if (t > 1) t = 1; else if (t < -1) t = -1;
      var li = 3 * Math.round((t + 1) * 127.5);
      px[o] = lut[li]; px[o + 1] = lut[li + 1]; px[o + 2] = lut[li + 2]; px[o + 3] = 255;
    }
    this.imgCtx.putImageData(this.imgData, 0, 0);
  };

  Widget.prototype.drawMap = function (p) {
    var c = this.ctx, C = this.C, T = this.T, s = p.s;
    var title = this.tauLin === 0 ? T.titleU : (this.tauLin === 1 ? T.titlePU : T.titleMid);
    this.text(title, 0, 16, "left", C.ink, 13, "700");

    this.updateImage();
    c.save();
    c.beginPath(); c.rect(p.l, p.t, s, s); c.clip();
    c.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in c) c.imageSmoothingQuality = "high";
    c.drawImage(this.img, p.l, p.t, s, s);

    // traceurs
    if (this.tracersOn) {
      var X = this.tx, Y = this.ty, k = s / TWO_PI, path = new Path2D(), rr = s > 360 ? 1.7 : 1.5;
      var thin = s < 360;                       // petit écran : un traceur sur deux (damier)
      for (var i = 0; i < X.length; i++) {
        if (thin && ((i + Math.floor(i / NTR)) & 1)) continue;
        var px = p.l + X[i] * k, py = p.t + s - Y[i] * k;
        path.moveTo(px + rr, py); path.arc(px, py, rr, 0, TWO_PI);
      }
      c.fillStyle = C.pal[3]; c.fill(path);
      c.lineWidth = 0.6; c.strokeStyle = C.dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.45)"; c.stroke(path);
    }

    // flèches : u_τ (encre) et, en option, (I − P) u (vert)
    var cell = s / NARROW, scale = cell / this.Uref;
    this.quiver(p, this.gux, this.guy, scale, C.ink, 1.5);
    if (this.showGrad) this.quiver(p, this.ggx, this.ggy, scale, C.pal[2], 1.5);
    c.restore();

    // cadre et axes
    c.lineWidth = 1; c.strokeStyle = C.rule;
    c.strokeRect(Math.round(p.l) + 0.5, Math.round(p.t) + 0.5, Math.round(s), Math.round(s));
    var labs = ["0", "π", "2π"], self = this;
    c.beginPath();
    for (var j = 0; j < 3; j++) {
      var xx = Math.round(p.l + j * s / 2) + 0.5, yy = Math.round(p.t + s - j * s / 2) + 0.5;
      c.moveTo(xx, p.t + s); c.lineTo(xx, p.t + s + 4);
      c.moveTo(p.l - 4, yy); c.lineTo(p.l, yy);
    }
    c.stroke();
    for (j = 0; j < 3; j++) {
      self.text(labs[j], p.l + j * s / 2, p.t + s + 17, j === 0 ? "left" : (j === 2 ? "right" : "center"), C.soft, 12);
      self.text(labs[j], p.l - 6, p.t + s - j * s / 2 + (j === 0 ? 0 : (j === 2 ? 10 : 4)), "right", C.soft, 12);
    }
    this.text("x", p.l + s * 0.75, p.t + s + 17, "center", C.ink, 12, "700");
    this.text("y", p.l - 6, p.t + s * 0.25 + 4, "right", C.ink, 12, "700");
  };

  Widget.prototype.quiver = function (p, ux, uy, scale, color, lw) {
    var c = this.ctx, N = NARROW, s = p.s, cell = s / N;
    var shafts = new Path2D(), heads = new Path2D(), dots = new Path2D();
    for (var j = 0; j < N; j++) {
      for (var i = 0; i < N; i++) {
        var o = j * N + i;
        var dx = ux[o] * scale, dy = -uy[o] * scale, L = Math.hypot(dx, dy);
        var cx = p.l + (i + 0.5) * cell, cy = p.t + s - (j + 0.5) * cell;
        if (L < 2.5) { dots.moveTo(cx + 1.1, cy); dots.arc(cx, cy, 1.1, 0, TWO_PI); continue; }
        var x0 = cx - dx / 2, y0 = cy - dy / 2, x1 = cx + dx / 2, y1 = cy + dy / 2;
        var vx = dx / L, vy = dy / L, hl = Math.min(6.5, 0.45 * L), hw = 0.42 * hl;
        shafts.moveTo(x0, y0); shafts.lineTo(x1 - vx * hl * 0.7, y1 - vy * hl * 0.7);
        heads.moveTo(x1, y1);
        heads.lineTo(x1 - vx * hl - vy * hw, y1 - vy * hl + vx * hw);
        heads.lineTo(x1 - vx * hl + vy * hw, y1 - vy * hl - vx * hw);
        heads.closePath();
      }
    }
    // halo couleur de fond pour la lisibilité sur la carte
    c.lineCap = "round"; c.lineJoin = "round";
    c.globalAlpha = 0.85; c.strokeStyle = this.C.bg;
    c.lineWidth = lw + 2.2; c.stroke(shafts);
    c.lineWidth = 2.2; c.stroke(heads); c.stroke(dots);
    c.globalAlpha = 1;
    c.strokeStyle = color; c.fillStyle = color;
    c.lineWidth = lw; c.stroke(shafts);
    c.fill(heads); c.lineWidth = 0.8; c.stroke(heads);
    c.fill(dots);
  };

  Widget.prototype.drawLegend = function (p) {
    var items = this.legendItems(), C = this.C, c = this.ctx;
    var x = p.x, y = p.y + 13;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var iw = 30 + this.textWidth(it.text.replace(/\d/g, "0"), 12) + 16;
      if (!p.vertical && x > p.x && x + iw > p.x + p.w) { x = p.x; y += 18; }
      c.globalAlpha = it.on ? 1 : 0.38;
      if (it.kind === "arrow") this.arrow(x + 1, y - 4, x + 23, y - 4, it.color, 1.6, 7);
      else {
        c.beginPath(); c.arc(x + 12, y - 4, 2.4, 0, TWO_PI);
        c.fillStyle = it.color; c.fill();
        c.lineWidth = 0.7; c.strokeStyle = "rgba(0,0,0,0.5)"; c.stroke();
      }
      this.text(it.text, x + 30, y, "left", C.ink, 12);
      c.globalAlpha = 1;
      if (p.vertical) { y += 18; } else { x += iw; }
    }
  };

  Widget.prototype.drawColorbar = function (p) {
    var c = this.ctx, C = this.C, lg = this.lang, T = this.T;
    var ext = 9, x0 = p.x + 2 + ext, w = p.w - 4 - 2 * ext, yb = p.y + 24, hb = 12;
    var cap = this.textWidth(T.cbCap, 12, "600") <= p.w ? T.cbCap : T.cbCapShort;
    this.text(cap, p.x, p.y + 12, "left", C.ink, 12, "600");
    // dégradé à partir de la table de couleurs, embouts triangulaires = saturation au-delà de ±S
    var lut = C.lut, n = Math.max(2, Math.round(w));
    for (var i = 0; i < n; i++) {
      var li = 3 * Math.round(i / (n - 1) * 255);
      c.fillStyle = "rgb(" + lut[li] + "," + lut[li + 1] + "," + lut[li + 2] + ")";
      c.fillRect(x0 + i * w / n, yb, w / n + 0.6, hb);
    }
    var caps = [[x0, x0 - ext, 0], [x0 + w, x0 + w + ext, 255]];
    caps.forEach(function (k) {
      c.fillStyle = "rgb(" + lut[3 * k[2]] + "," + lut[3 * k[2] + 1] + "," + lut[3 * k[2] + 2] + ")";
      c.beginPath(); c.moveTo(k[0], yb); c.lineTo(k[1], yb + hb / 2); c.lineTo(k[0], yb + hb); c.closePath(); c.fill();
    });
    c.lineWidth = 1; c.strokeStyle = C.rule;
    c.beginPath();
    c.moveTo(x0, yb + 0.5); c.lineTo(x0 + w, yb + 0.5); c.lineTo(x0 + w + ext, yb + hb / 2); c.lineTo(x0 + w, yb + hb - 0.5);
    c.lineTo(x0, yb + hb - 0.5); c.lineTo(x0 - ext, yb + hb / 2); c.closePath(); c.stroke();
    // repères : ±max |∇·u| actuel = ±α (1 − τ) D, bornés aux embouts
    var cur = this.alpha * (1 - this.tau()) * this.Dmax, xm = x0 + w / 2;
    var rel = cur / this.Sc, half = rel <= 1 ? w / 2 * rel : w / 2 + 0.6 * ext;   // au-delà : dans l'embout
    c.fillStyle = C.ink;
    [xm - half, xm + half].forEach(function (xx) {
      c.beginPath(); c.moveTo(xx, yb - 1); c.lineTo(xx - 4, yb - 7); c.lineTo(xx + 4, yb - 7); c.closePath(); c.fill();
    });
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(Math.round(xm) + 0.5, yb + hb); c.lineTo(Math.round(xm) + 0.5, yb + hb + 4); c.stroke();
    var S = this.Sc;
    this.text(fmt(lg, -S, 1), x0 - ext, yb + hb + 15, "left", C.soft, 12);
    this.text("0", xm, yb + hb + 15, "center", C.soft, 12);
    this.text(fmt(lg, S, 1), x0 + w + ext, yb + hb + 15, "right", C.soft, 12);
    this.text(T.sinks + " (< 0)", x0 - ext, yb + hb + 30, "left", C.soft, 11);
    this.text(T.sources + " (> 0)", x0 + w + ext, yb + hb + 30, "right", C.soft, 11);
  };

  Widget.prototype.drawB = function (p) {
    var c = this.ctx, C = this.C, T = this.T, lg = this.lang;
    var tb = this.textWidth(T.titleB, 13, "700") <= p.w ? T.titleB : T.titleBshort;
    this.text(tb, p.x, p.y + 16, "left", C.ink, 13, "700");
    var sc = p.sc, ox = p.ox, oy = p.oy;
    var P = Math.sqrt(this.normP.E), Q = Math.sqrt(this.normG.E), tau = this.tau();
    var Qt = (1 - tau) * Q;
    var X = function (v) { return ox + v * sc; }, Y = function (v) { return oy - v * sc; };

    // axes H et G
    this.arrow(ox, oy, X(1.22), oy, C.soft, 1, 7);
    this.arrow(ox, oy, ox, Y(1.22), C.soft, 1, 7);
    this.text(T.axH, X(1.22), oy + 17, "right", C.soft, 12);
    this.text(T.axG, ox + 6, Y(1.22) + 4, "left", C.soft, 12);
    this.text("0", ox - 5, oy + 13, "right", C.soft, 11);

    // (I − P) u : segment vertical vert, angle droit en P u
    if (Q * sc > 1) {
      c.strokeStyle = C.pal[2]; c.lineWidth = 3; c.lineCap = "butt";
      c.beginPath(); c.moveTo(X(P), oy); c.lineTo(X(P), Y(Q)); c.stroke();
      c.lineCap = "round";
      if (Q * sc > 16) this.text("(I−P)u", X(P) + 7, Y(Q / 2) + 4, "left", C.ink, 12, "600", true);
      var r = Math.min(8, Q * sc * 0.5);
      c.strokeStyle = C.soft; c.lineWidth = 1;
      c.beginPath(); c.moveTo(X(P) - r, oy); c.lineTo(X(P) - r, oy - r); c.lineTo(X(P), oy - r); c.stroke();
    }
    // u d'origine en pointillés quand la projection a commencé
    if (tau > 0.001 && Q * sc > 1) {
      c.setLineDash([5, 4]); c.strokeStyle = C.soft; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(X(P), Y(Q)); c.stroke();
      c.setLineDash([]);
    }
    // P u (série 1) puis u_τ affiché (encre)
    this.arrow(ox, oy, X(P), oy, C.pal[0], 4.5, 11);
    this.arrow(ox, oy, X(P), Y(Qt), C.ink, 2, 10);
    // étiquettes
    this.text("Pu", X(P * 0.3), oy + 17, "center", C.pal[0], 12, "700");
    this.text("u", X(P * 0.5) - 6, Y(Q * 0.5) - 6, "right", C.ink, 12, "700", true);

    // Pythagore
    var nu = this.normU, np = this.normP, ng = this.normG;
    this.text(T.pyth, p.x, p.fy, "left", C.ink, 12);
    this.text(fmt(lg, nu.E, 3) + " = " + fmt(lg, np.E, 3) + " + " + fmt(lg, ng.E, 3), p.x, p.fy + 18, "left", C.soft, 12);
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
