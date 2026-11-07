/*
 * abc-dynamo.js — MilaDy 2027, widget interactif « abc-dynamo » (FR / EN).
 * Dynamo cinématique de l'écoulement ABC (A = B = C = 1) : taux de croissance λ(Rm) et coupe du mode.
 * Usage : <div class="widget" data-widget="abc-dynamo" data-src="…/data/abc-dynamo.json"></div>
 *         + <script defer src=".../abc-dynamo.js"></script>
 * Données : JSON produit à partir de experiences/e3_abc.py (resultats/e3_abc.json, e3_modes.npz).
 *
 * ---------------------------------------------------------------------------------------------
 * Formules utilisées
 *
 * 1. Équation d'induction cinématique (écoulement imposé), domaine [0, 2π)³ périodique :
 *        ∂B/∂t = ∇×(u×B) + η ΔB,   ∇·B = 0,   Rm = 1/η   (|u| ~ 1, longueur 1/k avec k = 1),
 *        u = (A sin z + C cos y,  B sin x + A cos z,  C sin y + B cos x),   A = B = C = 1
 *    (Arnold 1965 ; Childress 1970 ; Dombre et al. 1986).
 *
 * 2. Schéma numérique de e3_abc.py (rappel, pas recalculé ici) : pseudo-spectral 32³ (rfftn),
 *    désaliasage 2/3, RK4 à facteur intégrant e^{−η k² t}, dt = 0,05, t ∈ [0 ; 150] ; ∇·B = 0
 *    conservé au niveau discret (k·(k×v) = 0). Le champ moyen k = 0 (conservé exactement, λ = 0)
 *    est retiré de la condition initiale.
 *    Taux de croissance : ‖B‖ = moyenne quadratique de |B| sur le volume, renormalisée tous les
 *    20 pas ; λ = pente (moindres carrés) de ln‖B‖(t) sur la seconde moitié de la simulation,
 *    λ_q = même pente sur le dernier quart (l'écart |λ − λ_q| indique la précision).
 *
 * 3. Seuils (bords des fenêtres de dynamo) : interpolation linéaire entre deux points successifs
 *    (Rm_a, λ_a), (Rm_b, λ_b) de signes opposés :
 *        Rm_c = Rm_a + (Rm_b − Rm_a) (−λ_a) / (λ_b − λ_a).
 *    Les zones ombrées sont les intervalles où la courbe affine par morceaux vérifie λ > 0.
 *    Valeurs publiées : 8,9 < Rm < 17,5 puis Rm > ≈ 27 (Galloway & Frisch 1986).
 *
 * 4. Mode exact de référence (courbe −1/Rm) : u est un champ de Beltrami, ∇×u = u
 *    (∇×u = (C cos y + A sin z, A cos z + B sin x, B cos x + C sin y) = u), et chaque composante
 *    n'a que des nombres d'onde |k| = 1. Pour B = u : u×B = 0 et ΔB = −B, donc
 *        ∂B/∂t = −η B,   λ = −η = −1/Rm   exactement.
 *    Le taux dominant vérifie donc λ(Rm) ≥ −1/Rm (λ → −1/Rm quand Rm → 0, diffusion du mode |k| = 1).
 *
 * 5. Carte : coupe z = 0 (indice i_z = 0) du champ final B(t = 150), qui approche le mode propre de plus
 *    grande partie réelle (le moins amorti si λ < 0), normalisé par
 *        B_rms = ( ⟨|B|²⟩_volume )^{1/2}  (= 1 par construction),
 *    valeurs |B|/B_rms, Bx/B_rms, By/B_rms aux points de grille x_i = 2π i/32, y_j = 2π j/32
 *    (chaque cellule de la carte est centrée sur un point de grille). Flèches : (Bx, By) tous les
 *    4 points, longueur proportionnelle à |B⊥| = (Bx² + By²)^{1/2} (même échelle pour toute la carte).
 *    Couleur : rampe séquentielle à une teinte (bleu), linéaire en |B|/B_rms sur [0 ; max].
 *
 * Références
 *  - V. I. Arnold, « Sur la topologie des écoulements stationnaires des fluides parfaits »,
 *    C. R. Acad. Sci. Paris 261, 17–20 (1965).
 *  - S. Childress, « New solutions of the kinematic dynamo problem », J. Math. Phys. 11, 3063 (1970).
 *  - V. I. Arnold, E. I. Korkina, « The growth of a magnetic field in a three-dimensional steady
 *    incompressible flow », Vestn. Mosk. Univ. Ser. 1 Mat. Mekh. 3, 43–46 (1983).
 *  - T. Dombre, U. Frisch, J. M. Greene, M. Hénon, A. Mehr, A. M. Soward, « Chaotic streamlines in
 *    the ABC flows », J. Fluid Mech. 167, 353–391 (1986).
 *  - D. J. Galloway, U. Frisch, « Dynamo action in a family of flows with chaotic streamlines »,
 *    Geophys. Astrophys. Fluid Dyn. 36, 53–83 (1986).
 *  - S. B. F. Dorch, « On the structure of the magnetic field in a kinematic ABC flow dynamo »,
 *    Physica Scripta 61, 717–722 (2000).
 *  - I. Bouya, E. Dormy, « Revisiting the ABC flow dynamo », Phys. Fluids 25, 037103 (2013).
 * ---------------------------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var NAME = "abc-dynamo";
  var TWO_PI = 2 * Math.PI;
  var PAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
  var PAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];
  // rampe séquentielle bleue (une teinte), du « presque nul » (proche du fond) au maximum
  var SEQ_LIGHT = ["#f4f8fe", "#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"];
  var SEQ_DARK = ["#0f1722", "#104281", "#1c5cab", "#3987e5", "#86b6ef", "#cde2fb"];
  var VIEWS = {
    zoom: { y0: -0.0125, y1: 0.0165, step: 0.005, dec: 3 },
    full: { y0: -0.55, y1: 0.06, step: 0.1, dec: 1 }
  };
  var X0 = 0, X1 = 31;                 // domaine de Rm affiché
  var ARROW_EVERY = 4;                 // une flèche tous les 4 points de grille

  /* ---------- textes ---------- */
  var TXT = {
    fr: {
      title: "Dynamo cinématique ABC (A = B = C = 1) : taux de croissance λ(Rm) et carte de |B|",
      cursor: "Point lu", cursorAria: "Point de la courbe λ(Rm) lu par le curseur",
      modes: "Carte du mode à", modesAria: "Rm du mode affiché dans la carte (coupe z = 0)",
      view: "Axe λ", zoom: "zoom près de 0", full: "complet", viewAria: "Échelle de l'axe λ",
      arrows: "flèches (Bx, By)", common: "échelle de couleur commune",
      panelA: "(a) taux de croissance λ en fonction de Rm = 1/η",
      panelB: function (rm) { return "(b) |B|/B_rms, coupe z = 0, Rm = " + rm; },
      lg32: "λ (32³)", lg48: "λ (48³, contrôle)", lgDyn: "dynamo (λ > 0)", lgGF: "seuils publiés (Galloway & Frisch 1986)",
      lgRef: "−1/Rm : mode exact B = u",
      dyn: "dynamo", xAxis: "Rm = 1/η", yAxis: "λ",
      tipLam: "λ", tipQ: "dernier quart", tip48: "48³",
      canvas: "Panneau (a) : taux de croissance λ du champ magnétique en fonction de Rm pour l'écoulement ABC, " +
        "avec la ligne λ = 0 et les fenêtres de dynamo (λ > 0) ombrées. Flèches gauche et droite : parcourir les points ; " +
        "Entrée : afficher la carte du mode si elle existe. Panneau (b) : carte de |B| dans le plan z = 0 pour le Rm choisi.",
      l1: function (rm, lam, q, n48, dyn) {
        return "Rm = " + rm + " : λ = " + lam + " (dernier quart : " + q +
          (n48 ? " ; 48³ : " + n48 : "") + ") → " + (dyn ? "dynamo (λ > 0)" : "pas de dynamo (λ < 0, champ amorti)");
      },
      l2: function (rm, grow, mx, mean, hov) {
        return "Carte : Rm = " + rm + ", " + (grow ? "mode croissant (λ > 0)" : "mode le moins amorti (λ < 0)") +
          " ; |B|/B_rms dans la coupe : max " + mx + ", moyenne " + mean + (hov ? " ; " + hov : "");
      },
      hov: function (x, y, v, bx, by) {
        return "en (x, y) = (" + x + " ; " + y + ") : |B|/B_rms = " + v + ", (Bx, By)/B_rms = (" + bx + " ; " + by + ")";
      },
      l3: function (s, ref) { return "Seuils interpolés (32³) : Rm ≈ " + s + " — publiés (Galloway & Frisch 1986) : " + ref; },
      listSep: " ; ", approx: "≈ ",
      loading: "Chargement des données…",
      noSrc: "Données absentes : ajoutez l'attribut data-src (chemin du fichier abc-dynamo.json).",
      error: function (src) { return "Données introuvables (" + src + "). La page doit être servie en http(s), pas ouverte en file://."; },
      note: "Écoulement u = (A sin z + C cos y, B sin x + A cos z, C sin y + B cos x) dans [0, 2π)³ périodique, Rm = 1/η. " +
        "λ = pente de ln‖B‖ sur la seconde moitié de t ∈ [0 ; 150] (pseudo-spectral 32³, désaliasage 2/3, RK4 à facteur intégrant, " +
        "dt = 0,05 ; champ moyen k = 0 retiré) ; carrés : contrôle en 48³. Zones vertes : λ > 0, bornes interpolées linéairement. " +
        "Fenêtres attendues ≈ 8,9 < Rm < 17,5 puis Rm > ≈ 27 (Galloway & Frisch 1986). Comme ∇×u = u, B = u est un mode exact " +
        "de taux −1/Rm, donc λ ≥ −1/Rm (vue « complet »). Carte : champ final (t = 150) normalisé (B_rms = 1 sur le volume), qui " +
        "approche le mode propre de plus grand λ ; à Rm = 8 et 20 (λ < 0), c'est le mode le moins amorti. Survolez la carte pour lire |B| et (Bx, By)."
    },
    en: {
      title: "Kinematic ABC dynamo (A = B = C = 1): growth rate λ(Rm) and map of |B|",
      cursor: "Point read", cursorAria: "Point of the λ(Rm) curve read by the cursor",
      modes: "Map of the mode at", modesAria: "Rm of the mode shown in the map (slice z = 0)",
      view: "λ axis", zoom: "zoom near 0", full: "full", viewAria: "Scale of the λ axis",
      arrows: "arrows (Bx, By)", common: "common colour scale",
      panelA: "(a) growth rate λ versus Rm = 1/η",
      panelB: function (rm) { return "(b) |B|/B_rms, slice z = 0, Rm = " + rm; },
      lg32: "λ (32³)", lg48: "λ (48³, check)", lgDyn: "dynamo (λ > 0)", lgGF: "published thresholds (Galloway & Frisch 1986)",
      lgRef: "−1/Rm: exact mode B = u",
      dyn: "dynamo", xAxis: "Rm = 1/η", yAxis: "λ",
      tipLam: "λ", tipQ: "last quarter", tip48: "48³",
      canvas: "Panel (a): growth rate λ of the magnetic field versus Rm for the ABC flow, with the line λ = 0 and the " +
        "dynamo windows (λ > 0) shaded. Left and right arrows: step through the points; Enter: show the map of the mode " +
        "when available. Panel (b): map of |B| in the plane z = 0 for the chosen Rm.",
      l1: function (rm, lam, q, n48, dyn) {
        return "Rm = " + rm + ": λ = " + lam + " (last quarter: " + q +
          (n48 ? "; 48³: " + n48 : "") + ") → " + (dyn ? "dynamo (λ > 0)" : "no dynamo (λ < 0, decaying field)");
      },
      l2: function (rm, grow, mx, mean, hov) {
        return "Map: Rm = " + rm + ", " + (grow ? "growing mode (λ > 0)" : "least damped mode (λ < 0)") +
          "; |B|/B_rms in the slice: max " + mx + ", mean " + mean + (hov ? "; " + hov : "");
      },
      hov: function (x, y, v, bx, by) {
        return "at (x, y) = (" + x + ", " + y + "): |B|/B_rms = " + v + ", (Bx, By)/B_rms = (" + bx + ", " + by + ")";
      },
      l3: function (s, ref) { return "Interpolated thresholds (32³): Rm ≈ " + s + " — published (Galloway & Frisch 1986): " + ref; },
      listSep: "; ", approx: "≈ ",
      loading: "Loading data…",
      noSrc: "No data: add the data-src attribute (path of the abc-dynamo.json file).",
      error: function (src) { return "Data not found (" + src + "). The page must be served over http(s), not opened as file://."; },
      note: "Flow u = (A sin z + C cos y, B sin x + A cos z, C sin y + B cos x) in the periodic box [0, 2π)³, Rm = 1/η. " +
        "λ = slope of ln‖B‖ over the second half of t ∈ [0, 150] (pseudo-spectral 32³, 2/3 dealiasing, integrating-factor RK4, " +
        "dt = 0.05; mean field k = 0 removed); squares: 48³ check. Green zones: λ > 0, edges linearly interpolated. " +
        "Expected windows ≈ 8.9 < Rm < 17.5, then Rm > ≈ 27 (Galloway & Frisch 1986). Since ∇×u = u, B = u is an exact mode " +
        "with rate −1/Rm, hence λ ≥ −1/Rm (“full” view). Map: final field (t = 150) normalised (B_rms = 1 over the volume), which " +
        "approaches the eigenmode with the largest λ; at Rm = 8 and 20 (λ < 0) it is the least damped mode. Hover over the map to read |B| and (Bx, By)."
    }
  };

  /* ---------- utilitaires ---------- */
  function langOf() {
    return /^en/i.test(document.documentElement.getAttribute("lang") || "") ? "en" : "fr";
  }

  var NF = {};
  function fmt(lang, x, d, sign) {
    if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0;   // pas de « −0 »
    var key = lang + d;
    if (!(key in NF)) {
      try {
        NF[key] = new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR",
          { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false });
      } catch (e) { NF[key] = null; }
    }
    var s;
    if (NF[key]) s = NF[key].format(x);
    else { s = x.toFixed(d); if (lang === "fr") s = s.replace(".", ","); }
    s = s.replace(/-/g, "−");
    if (sign && x > 0) s = "+" + s;
    return s;
  }
  function fmtRm(lang, rm) { return fmt(lang, rm, Math.abs(rm - Math.round(rm)) < 1e-9 ? 0 : 1); }

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function hexRgb(hex) {
    var n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function luminance(col) {
    var m = /^#?([0-9a-f]{6})$/i.exec(col) || /^#?([0-9a-f]{3})$/i.exec(col);
    if (!m) {
      var r = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(col);
      if (!r) return 1;
      return (0.2126 * r[1] + 0.7152 * r[2] + 0.0722 * r[3]) / 255;
    }
    var h = m[1];
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var c = hexRgb(h);
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  }

  function cssVar(cs, name, fallback) {
    var v = cs.getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || fallback;
  }

  function styleButton(b, pressed) {
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
    b.style.background = pressed ? "var(--ink)" : "transparent";
    b.style.color = pressed ? "var(--bg)" : "var(--ink)";
  }

  function group(labelText, aria) {
    var g = mk("span");
    g.setAttribute("role", "group");
    g.setAttribute("aria-label", aria);
    g.style.display = "inline-flex"; g.style.flexWrap = "wrap";
    g.style.alignItems = "center"; g.style.gap = ".35rem";
    g.appendChild(mk("span", null, labelText));
    return g;
  }

  /* ---------- widget ---------- */
  function Widget(el) {
    var self = this;
    this.el = el;
    this.lang = langOf();
    var T = this.T = TXT[this.lang];
    el.textContent = "";
    el.appendChild(mk("p", "widget-title", T.title));

    var controls = this.controls = mk("div", "widget-controls");
    el.appendChild(controls);

    // curseur (point lu)
    var cl = mk("label");
    cl.style.flexWrap = "wrap";
    this.cOut = mk("span", null, T.cursor + " : Rm = …");
    this.cOut.style.minWidth = "8.5em";
    var ci = this.cIn = document.createElement("input");
    ci.type = "range"; ci.min = "0"; ci.max = "1"; ci.step = "1"; ci.value = "0";
    ci.disabled = true;
    ci.setAttribute("aria-label", T.cursorAria);
    cl.appendChild(this.cOut); cl.appendChild(ci);
    controls.appendChild(cl);

    // carte du mode : boutons créés à l'arrivée des données
    this.modeGroup = group(T.modes + (this.lang === "fr" ? " :" : ":"), T.modesAria);
    controls.appendChild(this.modeGroup);
    this.modeBtns = [];

    // vue de l'axe λ
    var vg = group(T.view + (this.lang === "fr" ? " :" : ":"), T.viewAria);
    this.viewBtns = [];
    ["zoom", "full"].forEach(function (v) {
      var b = mk("button", null, T[v]);
      b.type = "button";
      b.style.padding = ".3rem .55rem";
      b.addEventListener("click", function () { self.setView(v); });
      vg.appendChild(b);
      self.viewBtns.push({ b: b, v: v });
    });
    controls.appendChild(vg);

    // cases à cocher
    function check(text, on, fn) {
      var l = mk("label");
      var c = document.createElement("input");
      c.type = "checkbox"; c.checked = on;
      c.addEventListener("change", function () { fn(c.checked); });
      l.appendChild(c); l.appendChild(mk("span", null, text));
      controls.appendChild(l);
      return c;
    }
    this.arrowsIn = check(T.arrows, true, function (v) { self.arrows = v; self.draw(); });
    this.commonIn = check(T.common, false, function (v) { self.common = v; self.draw(); self.updateReadout(); });

    // canvas
    var cv = this.canvas = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", T.canvas);
    cv.tabIndex = 0;
    cv.textContent = T.canvas;
    cv.style.touchAction = "pan-y";
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
    this.view = "zoom"; this.arrows = true; this.common = false;
    this.data = null; this.cursor = 0; this.mode = 0;
    this.hoverCell = null; this.tipOn = false;
    this.W = 0; this.H = 0; this.dpr = 0;
    this.setView("zoom", true);
    this.readTheme();
    this.rl[0].textContent = T.loading;

    // interactions sur le canvas
    cv.addEventListener("pointermove", function (e) { self.onPointer(e, false); });
    cv.addEventListener("pointerdown", function (e) { self.onPointer(e, true); });
    cv.addEventListener("pointerleave", function () {
      var ch = self.tipOn || self.hoverCell;
      self.tipOn = false; self.hoverCell = null;
      if (ch) { self.draw(); self.updateReadout(); }
    });
    cv.addEventListener("keydown", function (e) { self.onKey(e); });
    cv.addEventListener("focus", function () { if (self.data) { self.tipOn = true; self.draw(); } });
    cv.addEventListener("blur", function () { if (self.tipOn) { self.tipOn = false; self.draw(); } });
    ci.addEventListener("input", function () { self.setCursor(parseInt(ci.value, 10), true); });
    ci.addEventListener("focus", function () { if (self.data) { self.tipOn = true; self.draw(); } });
    ci.addEventListener("blur", function () { if (self.tipOn) { self.tipOn = false; self.draw(); } });

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

    this.load();
  }

  /* ----- données ----- */
  Widget.prototype.load = function () {
    var self = this, T = this.T;
    var src = this.el.getAttribute("data-src");
    if (!src) { this.fail(T.noSrc); return; }
    var url;
    try { url = new URL(src, document.baseURI).href; } catch (e) { url = src; }
    if (!window.fetch || /^file:/i.test(url)) { this.fail(T.error(src)); return; }
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) { self.setData(d); })
      .catch(function () { self.fail(T.error(src)); });
  };

  Widget.prototype.fail = function (msg) {
    this.rl[0].textContent = msg;
    this.rl[1].textContent = ""; this.rl[2].textContent = "";
    this.canvas.style.display = "none";
  };

  Widget.prototype.setData = function (d) {
    var self = this, lg = this.lang;
    var pts = (d.points || []).map(function (p) { return { rm: +p[0], lam: +p[1], lamq: +p[2] }; })
      .filter(function (p) { return isFinite(p.rm) && isFinite(p.lam); })
      .sort(function (a, b) { return a.rm - b.rm; });
    if (pts.length < 2) { this.fail(this.T.error(this.el.getAttribute("data-src"))); return; }
    var n48 = {};
    (d.convergence_N48 || []).forEach(function (c) { n48[+c[0]] = +c[1]; });
    pts.forEach(function (p) { p.n48 = (p.rm in n48) ? n48[p.rm] : null; });

    // seuils et intervalles λ > 0 (courbe affine par morceaux)
    var thr = [], zones = [], zStart = pts[0].lam > 0 ? pts[0].rm : null;
    for (var i = 0; i + 1 < pts.length; i++) {
      var a = pts[i], b = pts[i + 1];
      if ((a.lam > 0) !== (b.lam > 0)) {
        var rc = a.rm + (b.rm - a.rm) * (-a.lam) / (b.lam - a.lam);
        thr.push(rc);
        if (b.lam > 0) zStart = rc; else { zones.push([zStart, rc, false]); zStart = null; }
      }
    }
    if (zStart !== null) zones.push([zStart, pts[pts.length - 1].rm, true]);   // ouverte à droite

    // coupes
    var modes = (d.coupes || []).map(function (c) {
      var A = c.abs, BX = c.bx, BY = c.by, N = A.length;
      var mx = 0, mperp = 0, sum = 0;
      for (var j = 0; j < N; j++) for (var k = 0; k < N; k++) {
        var v = A[j][k]; if (v > mx) mx = v; sum += v;
        if (BX && BY) { var bp = Math.sqrt(BX[j][k] * BX[j][k] + BY[j][k] * BY[j][k]); if (bp > mperp) mperp = bp; }
      }
      var idx = -1;
      pts.forEach(function (p, q) { if (Math.abs(p.rm - c.Rm) < 1e-9) idx = q; });
      return { rm: +c.Rm, lam: +c.lambda, N: N, abs: A, bx: BX, by: BY, max: mx, mean: sum / (N * N), perp: mperp, idx: idx };
    }).filter(function (m) { return m.N > 1; });
    var gmax = 0, gperp = 0;
    modes.forEach(function (m) { gmax = Math.max(gmax, m.max); gperp = Math.max(gperp, m.perp); });

    this.data = { pts: pts, thr: thr, zones: zones, modes: modes, gmax: gmax, gperp: gperp,
      ref: (d.seuils_reference && d.seuils_reference.valeurs) || [8.9, 17.5, 27] };

    // boutons de mode
    this.modeBtns = [];
    modes.forEach(function (m, q) {
      var b = mk("button", null, "Rm = " + fmtRm(lg, m.rm));
      b.type = "button";
      b.style.padding = ".3rem .55rem";
      b.addEventListener("click", function () { self.setMode(q, true); });
      self.modeGroup.appendChild(b);
      self.modeBtns.push(b);
    });
    if (!modes.length) this.modeGroup.style.display = "none";

    this.cIn.max = String(pts.length - 1);
    this.cIn.disabled = false;
    // état initial : mode de la première fenêtre de dynamo le plus proche de Rm = 12
    var m0 = 0;
    modes.forEach(function (m, q) { if (Math.abs(m.rm - 12) < Math.abs(modes[m0].rm - 12)) m0 = q; });
    if (modes.length) this.setMode(m0, true, true);
    else this.setCursor(0, true, true);
    this.resize(true);
    this.updateReadout();
  };

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
    c.seq = (c.dark ? SEQ_DARK : SEQ_LIGHT).map(hexRgb);
    c.font = getComputedStyle(this.el).fontFamily || "system-ui, sans-serif";
    this.C = c;
    this.mapCache = null;
  };

  /* ----- géométrie ----- */
  Widget.prototype.legendItems = function () {
    var T = this.T, it = [
      { k: "line", t: T.lg32 }, { k: "sq", t: T.lg48 }, { k: "band", t: T.lgDyn }, { k: "tri", t: T.lgGF }
    ];
    if (this.view === "full") it.push({ k: "dash", t: T.lgRef });
    return it;
  };

  Widget.prototype.legendLayout = function (x, w) {
    var items = this.legendItems(), rows = [[]], cx = 0, self = this;
    items.forEach(function (it) {
      var iw = 22 + self.textWidth(it.t, 12);
      if (cx > 0 && cx + iw > w) { rows.push([]); cx = 0; }
      rows[rows.length - 1].push({ k: it.k, t: it.t, x: x + cx });
      cx += iw + 14;
    });
    return rows;
  };

  Widget.prototype.resize = function (force) {
    var r = this.canvas.getBoundingClientRect();
    var W = Math.floor(r.width || this.el.clientWidth || 600);
    var dpr = window.devicePixelRatio || 1;
    if (!force && W === this.W && dpr === this.dpr) return;
    if (W < 50) return;
    this.W = W; this.dpr = dpr;
    var gap = 22, a, b, H;
    var MAPX = 34, MAPR = 12 + 12 + 40;     // marge gauche (graduations), barre de couleur + étiquettes
    if (W >= 600) {
      var wb = Math.round(Math.max(250, Math.min(380, W * 0.42)));
      var wa = W - wb - gap;
      a = { x: 0, y: 0, w: wa };
      a.leg = this.legendLayout(a.x + 4, wa - 8);
      var headA = 24 + a.leg.length * 17 + 10;
      var s = wb - MAPX - MAPR;
      H = Math.max(28 + s + 30, headA + 210 + 40);
      a.h = H;
      b = { x: W - wb, y: 0, w: wb, h: H, s: s };
    } else {
      a = { x: 0, y: 0, w: W };
      a.leg = this.legendLayout(a.x + 4, W - 8);
      var headN = 24 + a.leg.length * 17 + 10;
      var ph = Math.round(Math.max(180, Math.min(250, W * 0.58)));
      a.h = headN + ph + 40;
      var sN = Math.max(120, Math.min(340, W - MAPX - MAPR));
      b = { x: 0, y: a.h + gap, w: W, s: sN };
      b.h = 28 + sN + 30;
      H = b.y + b.h;
    }
    a.l = a.x + 56; a.r = a.x + a.w - 10;
    a.t = a.y + 24 + a.leg.length * 17 + 10; a.b = a.y + a.h - 40;
    var off = Math.max(0, (b.w - (MAPX + b.s + MAPR)) / 2);
    b.l = b.x + off + MAPX; b.r = b.l + b.s; b.t = b.y + 28; b.b = b.t + b.s;
    this.L = { a: a, b: b, H: H };
    this.H = H;
    this.canvas.style.height = H + "px";
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.draw();
  };

  /* ----- échelles ----- */
  Widget.prototype.X = function (rm) { var a = this.L.a; return a.l + (rm - X0) / (X1 - X0) * (a.r - a.l); };
  Widget.prototype.Y = function (lam) {
    var a = this.L.a, v = VIEWS[this.view];
    return a.t + (v.y1 - lam) / (v.y1 - v.y0) * (a.b - a.t);
  };

  /* ----- actions ----- */
  Widget.prototype.setView = function (v, silent) {
    this.view = v;
    this.viewBtns.forEach(function (o) { styleButton(o.b, o.v === v); });
    if (!silent) this.resize(true);
  };

  Widget.prototype.setCursor = function (i, fromSlider, silent) {
    if (!this.data) return;
    var n = this.data.pts.length;
    i = Math.max(0, Math.min(n - 1, i | 0));
    this.cursor = i;
    if (!fromSlider || this.cIn.value !== String(i)) this.cIn.value = String(i);
    var p = this.data.pts[i], lg = this.lang;
    this.cOut.textContent = this.T.cursor + (lg === "fr" ? " : " : ": ") + "Rm = " + fmtRm(lg, p.rm);
    this.cIn.setAttribute("aria-valuetext", "Rm = " + fmtRm(lg, p.rm) + ", λ = " + fmt(lg, p.lam, 5, true));
    if (!silent) { this.draw(); this.updateReadout(); }
  };

  Widget.prototype.setMode = function (q, moveCursor, silent) {
    if (!this.data || !this.data.modes[q]) return;
    this.mode = q;
    this.modeBtns.forEach(function (b, k) { styleButton(b, k === q); });
    this.hoverCell = null;
    if (moveCursor && this.data.modes[q].idx >= 0) this.setCursor(this.data.modes[q].idx, false, true);
    if (!silent) { this.draw(); this.updateReadout(); }
  };

  Widget.prototype.modeAt = function (i) {
    var ms = this.data.modes;
    for (var q = 0; q < ms.length; q++) if (ms[q].idx === i) return q;
    return -1;
  };

  Widget.prototype.onKey = function (e) {
    if (!this.data) return;
    var i = this.cursor, n = this.data.pts.length, k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") i++;
    else if (k === "ArrowLeft" || k === "ArrowDown") i--;
    else if (k === "Home") i = 0;
    else if (k === "End") i = n - 1;
    else if (k === "Enter" || k === " ") {
      var q = this.modeAt(this.cursor);
      if (q >= 0) this.setMode(q, false);
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    this.tipOn = true;
    this.setCursor(i, false);
  };

  Widget.prototype.canvasPos = function (e) {
    var r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  Widget.prototype.onPointer = function (e, down) {
    if (!this.data || !this.L) return;
    var p = this.canvasPos(e), a = this.L.a, b = this.L.b;
    var inA = p.x >= a.l - 12 && p.x <= a.r + 10 && p.y >= a.t - 10 && p.y <= a.b + 12;
    var inB = p.x >= b.l && p.x < b.r && p.y >= b.t && p.y < b.b;
    var changed = false;
    if (inA) {
      var pts = this.data.pts, best = 0, bd = Infinity;
      for (var i = 0; i < pts.length; i++) {
        var dx = Math.abs(this.X(pts[i].rm) - p.x);
        if (dx < bd) { bd = dx; best = i; }
      }
      if (best !== this.cursor || !this.tipOn) { this.tipOn = true; this.setCursor(best, false, true); changed = true; }
      if (down) {
        var q = this.modeAt(best);
        if (q >= 0 && q !== this.mode) { this.setMode(q, false, true); changed = true; }
      }
      if (this.hoverCell) { this.hoverCell = null; changed = true; }
    } else if (this.tipOn) { this.tipOn = false; changed = true; }
    if (inB) {
      var m = this.data.modes[this.mode];
      if (m) {
        var N = m.N;
        var ci = Math.min(N - 1, Math.max(0, Math.floor((p.x - b.l) / b.s * N)));
        var cj = N - 1 - Math.min(N - 1, Math.max(0, Math.floor((p.y - b.t) / b.s * N)));
        if (!this.hoverCell || this.hoverCell.i !== ci || this.hoverCell.j !== cj) { this.hoverCell = { i: ci, j: cj }; changed = true; }
      }
    } else if (this.hoverCell && !inA) { this.hoverCell = null; changed = true; }
    if (changed) { this.draw(); this.updateReadout(); }
  };

  /* ----- lecture ----- */
  Widget.prototype.updateReadout = function () {
    if (!this.data) return;
    var T = this.T, lg = this.lang, d = this.data;
    var p = d.pts[this.cursor];
    var lines = [T.l1(fmtRm(lg, p.rm), fmt(lg, p.lam, 5, true), fmt(lg, p.lamq, 5, true),
      p.n48 != null ? fmt(lg, p.n48, 5, true) : null, p.lam > 0)];
    var m = d.modes[this.mode];
    if (m) {
      var hov = null;
      if (this.hoverCell) {
        var i = this.hoverCell.i, j = this.hoverCell.j;
        hov = T.hov(fmt(lg, TWO_PI * i / m.N, 2), fmt(lg, TWO_PI * j / m.N, 2), fmt(lg, m.abs[j][i], 2),
          m.bx ? fmt(lg, m.bx[j][i], 2) : "–", m.by ? fmt(lg, m.by[j][i], 2) : "–");
      }
      lines.push(T.l2(fmtRm(lg, m.rm), m.lam > 0, fmt(lg, m.max, 2), fmt(lg, m.mean, 2), hov));
    } else lines.push("");
    var sep = T.listSep;
    lines.push(T.l3(d.thr.map(function (x) { return fmt(lg, x, 2); }).join(sep),
      d.ref.map(function (x, k) { return (k === d.ref.length - 1 ? T.approx : "") + fmtRm(lg, x); }).join(sep)));
    for (var k = 0; k < 3; k++) if (this.rl[k].textContent !== lines[k]) this.rl[k].textContent = lines[k];
  };

  /* ----- dessin : outils ----- */
  Widget.prototype.text = function (s, x, y, align, color, size, weight, halo) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + this.C.font;
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    if (halo) {
      c.lineWidth = 3.5; c.strokeStyle = this.C.bg; c.lineJoin = "round";
      c.strokeText(s, x, y);
    }
    c.fillStyle = color || this.C.ink;
    c.fillText(s, x, y);
    return c.measureText(s).width;
  };

  Widget.prototype.textWidth = function (s, size, weight) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + (this.C ? this.C.font : "sans-serif");
    return c.measureText(s).width;
  };

  Widget.prototype.fitText = function (s, maxW, size, weight) {
    if (this.textWidth(s, size, weight) <= maxW) return s;
    while (s.length > 4 && this.textWidth(s + "…", size, weight) > maxW) s = s.slice(0, -1);
    return s + "…";
  };

  Widget.prototype.marker = function (k, x, y, color) {
    var c = this.ctx, C = this.C;
    c.lineWidth = 2; c.strokeStyle = C.bg; c.fillStyle = color;
    c.beginPath();
    if (k === "sq") c.rect(x - 4.5, y - 4.5, 9, 9);
    else if (k === "tri") { c.moveTo(x, y - 6); c.lineTo(x + 5.5, y + 4); c.lineTo(x - 5.5, y + 4); c.closePath(); }
    else c.arc(x, y, 4, 0, TWO_PI);
    c.fill(); c.stroke();
  };

  Widget.prototype.seqColor = function (t) {
    var s = this.C.seq, n = s.length - 1;
    t = Math.max(0, Math.min(1, t)) * n;
    var k = Math.min(n - 1, Math.floor(t)), f = t - k, a = s[k], b = s[k + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  };

  /* ----- dessin ----- */
  Widget.prototype.draw = function () {
    if (!this.L) return;
    var c = this.ctx, dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, this.W, this.H);
    if (!this.data) return;
    c.lineJoin = "round"; c.lineCap = "round";
    this.drawChart(this.L.a);
    this.drawMap(this.L.b);
  };

  Widget.prototype.drawChart = function (p) {
    var c = this.ctx, C = this.C, T = this.T, lg = this.lang, d = this.data, self = this;
    var v = VIEWS[this.view], pw = p.r - p.l, ph = p.b - p.t;
    var X = function (r) { return self.X(r); }, Y = function (l) { return self.Y(l); };

    this.text(this.fitText(T.panelA, p.w - 4, 13, "700"), p.x, p.y + 15, "left", C.ink, 13, "700");
    // légende
    p.leg.forEach(function (row, ri) {
      var y = p.y + 24 + ri * 17 + 9;
      row.forEach(function (it) {
        var x = it.x;
        if (it.k === "line") {
          c.strokeStyle = C.pal[0]; c.lineWidth = 2;
          c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 16, y - 4); c.stroke();
          self.marker("dot", x + 8, y - 4, C.pal[0]);
        } else if (it.k === "sq") self.marker("sq", x + 8, y - 4, C.pal[1]);
        else if (it.k === "band") {
          c.fillStyle = C.pal[2]; c.globalAlpha = C.dark ? 0.32 : 0.22;
          c.fillRect(x + 1, y - 11, 14, 13); c.globalAlpha = 1;
        } else if (it.k === "tri") self.marker("tri", x + 8, y - 4, C.ink);
        else if (it.k === "dash") {
          c.strokeStyle = C.ink; c.lineWidth = 1.5; c.setLineDash([5, 3]);
          c.beginPath(); c.moveTo(x, y - 4); c.lineTo(x + 16, y - 4); c.stroke(); c.setLineDash([]);
        }
        self.text(it.t, x + 22, y, "left", C.soft, 12);
      });
    });

    c.save();
    c.beginPath(); c.rect(p.l, p.t, pw, ph); c.clip();

    // zones de dynamo (λ > 0)
    d.zones.forEach(function (z) {
      var xa = X(z[0]), xb = X(z[1]);
      c.fillStyle = C.pal[2]; c.globalAlpha = C.dark ? 0.26 : 0.16;
      c.fillRect(xa, p.t, xb - xa, ph);
      c.globalAlpha = 1;
    });

    // grille
    c.lineWidth = 1; c.strokeStyle = C.hair; c.globalAlpha = 0.35; c.beginPath();
    var yt = [];
    for (var yv = Math.ceil(v.y0 / v.step - 1e-9) * v.step; yv <= v.y1 + 1e-12; yv += v.step) yt.push(Math.round(yv / v.step) * v.step);
    yt.forEach(function (yv) { var y = Math.round(Y(yv)) + 0.5; c.moveTo(p.l, y); c.lineTo(p.r, y); });
    var xt = [];
    for (var xv = 0; xv <= X1; xv += 5) xt.push(xv);
    xt.forEach(function (xv) { var x = Math.round(X(xv)) + 0.5; c.moveTo(x, p.t); c.lineTo(x, p.b); });
    c.stroke(); c.globalAlpha = 1;

    // seuils interpolés (tirets)
    c.strokeStyle = C.soft; c.lineWidth = 1; c.setLineDash([3, 3]);
    c.beginPath();
    d.thr.forEach(function (r) { var x = Math.round(X(r)) + 0.5; c.moveTo(x, p.t); c.lineTo(x, p.b); });
    c.stroke(); c.setLineDash([]);

    // référence exacte −1/Rm (vue complète)
    if (this.view === "full") {
      c.strokeStyle = C.ink; c.lineWidth = 1.5; c.setLineDash([5, 3]);
      c.beginPath();
      var first = true;
      for (var rr = 1.6; rr <= X1 + 1e-9; rr += 0.1) {
        var xx = X(rr), yy = Y(-1 / rr);
        if (first) { c.moveTo(xx, yy); first = false; } else c.lineTo(xx, yy);
      }
      c.stroke(); c.setLineDash([]);
    }

    // λ = 0 (référence)
    c.strokeStyle = C.ink; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(p.l, Y(0)); c.lineTo(p.r, Y(0)); c.stroke();

    // courbe λ(Rm), 32³
    c.strokeStyle = C.pal[0]; c.lineWidth = 2;
    c.beginPath();
    d.pts.forEach(function (q, i) { var x = X(q.rm), y = Y(q.lam); if (i) c.lineTo(x, y); else c.moveTo(x, y); });
    c.stroke();

    // points de mode disponibles (anneau) et mode affiché (anneau épais)
    d.modes.forEach(function (m, q) {
      if (m.idx < 0) return;
      var pt = d.pts[m.idx], y = Y(pt.lam);
      if (y < p.t - 2 || y > p.b + 2) return;
      c.beginPath(); c.arc(X(pt.rm), y, q === self.mode ? 8.5 : 7.5, 0, TWO_PI);
      c.lineWidth = q === self.mode ? 2.5 : 1.2; c.strokeStyle = q === self.mode ? C.ink : C.soft;
      c.stroke();
    });

    var lo = [];
    d.pts.forEach(function (q) {
      var x = X(q.rm), y = Y(q.lam);
      if (y > p.b + 1) lo.push(x);
      else if (y >= p.t - 1) self.marker("dot", x, y, C.pal[0]);
    });
    d.pts.forEach(function (q) {
      if (q.n48 == null) return;
      var y = Y(q.n48);
      if (y >= p.t - 1 && y <= p.b + 1) self.marker("sq", X(q.rm), y, C.pal[1]);
    });

    // seuils publiés (Galloway & Frisch 1986) : triangles sur l'axe des Rm
    d.ref.forEach(function (r) { self.marker("tri", X(r), p.b - 6, C.ink); });

    c.restore();

    // points hors champ (vue zoom) : chevrons sous l'axe bas
    lo.forEach(function (x) {
      c.strokeStyle = C.pal[0]; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x - 4, p.b - 16); c.lineTo(x, p.b - 12); c.lineTo(x + 4, p.b - 16); c.stroke();
    });

    // étiquettes des zones et des seuils (en haut du cadre)
    var lastR = -1e9;
    d.thr.forEach(function (r) {
      var s = fmt(lg, r, 2), w = self.textWidth(s, 11, "600"), x = X(r) + 4;
      if (x + w > p.r - 2) x = X(r) - 4 - w;
      if (x > lastR + 4) { self.text(s, x, p.t + 13, "left", C.soft, 11, "600", true); lastR = x + w; }
    });
    d.zones.forEach(function (z) {
      var xa = X(z[0]), xb = X(z[1]), s = T.dyn + (z[2] ? " →" : ""), w = self.textWidth(s, 11, "700");
      if (xb - xa > w + 6) self.text(s, (xa + xb) / 2, p.t + 28, "center", C.ink, 11, "700", true);
    });

    // cadre
    c.lineWidth = 1; c.strokeStyle = C.rule;
    c.strokeRect(Math.round(p.l) + 0.5, Math.round(p.t) + 0.5, Math.round(pw), Math.round(ph));

    // graduations
    yt.forEach(function (yv) {
      var s = yv === 0 ? "0" : fmt(lg, yv, v.dec);
      self.text(s, p.l - 6, Y(yv) + 4, "right", C.soft, 12);
    });
    var lastX = -1e9;
    xt.forEach(function (xv) {
      var s = fmt(lg, xv, 0), w = self.textWidth(s, 12), x = X(xv);
      if (x - w / 2 < lastX + 6) return;
      self.text(s, x, p.b + 16, "center", C.soft, 12); lastX = x + w / 2;
    });
    this.text(T.xAxis, (p.l + p.r) / 2, p.b + 33, "center", C.ink, 12, "700");
    c.save();
    c.translate(p.x + 12, (p.t + p.b) / 2); c.rotate(-Math.PI / 2);
    this.text(T.yAxis, 0, 0, "center", C.ink, 13, "700");
    c.restore();

    // curseur
    var cp = d.pts[this.cursor], cx = X(cp.rm), cy = Y(cp.lam);
    c.strokeStyle = C.soft; c.lineWidth = 1; c.globalAlpha = 0.8;
    c.beginPath(); c.moveTo(Math.round(cx) + 0.5, p.t); c.lineTo(Math.round(cx) + 0.5, p.b); c.stroke();
    c.globalAlpha = 1;
    var cyc = Math.max(p.t, Math.min(p.b, cy));
    c.beginPath(); c.arc(cx, cyc, 6, 0, TWO_PI);
    c.fillStyle = cy === cyc ? C.pal[0] : C.bg; c.fill();
    c.lineWidth = 2.5; c.strokeStyle = C.ink; c.stroke();
    if (this.tipOn) this.tooltip(p, cx, cyc, [
      "Rm = " + fmtRm(lg, cp.rm),
      T.tipLam + " = " + fmt(lg, cp.lam, 5, true),
      T.tipQ + " : " + fmt(lg, cp.lamq, 5, true)
    ].concat(cp.n48 != null ? [T.tip48 + " : " + fmt(lg, cp.n48, 5, true)] : []));
  };

  Widget.prototype.tooltip = function (p, x, y, lines) {
    var c = this.ctx, C = this.C, self = this;
    if (this.lang === "en") lines = lines.map(function (s) { return s.replace(" : ", ": "); });
    var w = 0;
    lines.forEach(function (s, i) { w = Math.max(w, self.textWidth(s, 12, i ? "400" : "700")); });
    w += 16; var h = lines.length * 16 + 10;
    // à droite du point, sinon à gauche, sinon centré ; au-dessus, sinon en dessous : jamais sur le point lu
    var bx = x + 12, by = y - h - 10;
    if (bx + w > p.x + p.w) bx = x - 12 - w;
    if (bx < p.x) bx = Math.max(p.x, Math.min(p.x + p.w - w, x - w / 2));
    if (by < p.y) by = y + 12;
    if (by + h > p.y + p.h) by = Math.max(p.y, y - h - 10);
    c.fillStyle = C.bg; c.strokeStyle = C.rule; c.lineWidth = 1;
    c.beginPath();
    if (c.roundRect) c.roundRect(bx + 0.5, by + 0.5, w, h, 5); else c.rect(bx + 0.5, by + 0.5, w, h);
    c.fill(); c.stroke();
    lines.forEach(function (s, i) { self.text(s, bx + 8, by + 18 + i * 16, "left", C.ink, 12, i ? "400" : "700"); });
  };

  Widget.prototype.mapImage = function (m, vmax) {
    var key = m.rm + "|" + vmax + "|" + (this.C.dark ? 1 : 0);
    if (this.mapCache && this.mapCache.key === key) return this.mapCache.cv;
    var N = m.N, off = document.createElement("canvas");
    off.width = N; off.height = N;
    var x = off.getContext("2d"), img = x.createImageData(N, N);
    for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
      var col = this.seqColor(m.abs[j][i] / vmax), o = ((N - 1 - j) * N + i) * 4;
      img.data[o] = Math.round(col[0]); img.data[o + 1] = Math.round(col[1]); img.data[o + 2] = Math.round(col[2]);
      img.data[o + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    this.mapCache = { key: key, cv: off };
    return off;
  };

  Widget.prototype.drawMap = function (p) {
    var c = this.ctx, C = this.C, T = this.T, lg = this.lang, d = this.data, self = this;
    var m = d.modes[this.mode];
    if (!m) return;
    var N = m.N, s = p.s, cell = s / N;
    var vmax = this.common ? d.gmax : m.max;
    var perpMax = this.common ? d.gperp : m.perp;
    this.text(this.fitText(T.panelB(fmtRm(lg, m.rm)), p.w - 4, 13, "700"), p.x, p.y + 15, "left", C.ink, 13, "700");

    // carte |B|/B_rms (cellules centrées sur les points de grille)
    c.imageSmoothingEnabled = false;
    c.drawImage(this.mapImage(m, vmax), p.l, p.t, s, s);
    c.imageSmoothingEnabled = true;

    // flèches (Bx, By)
    if (this.arrows && m.bx && m.by && perpMax > 0) {
      var sp = ARROW_EVERY * cell, paths = new Path2D();
      for (var j = ARROW_EVERY / 2; j < N; j += ARROW_EVERY) for (var i = ARROW_EVERY / 2; i < N; i += ARROW_EVERY) {
        var bx = m.bx[j][i], by = m.by[j][i], mag = Math.sqrt(bx * bx + by * by);
        var len = mag / perpMax * sp * 0.95;
        if (len < 2) continue;
        var ux = bx / mag, uy = -by / mag;                    // y vers le haut à l'écran
        var cx = p.l + (i + 0.5) * cell, cy = p.t + (N - 1 - j + 0.5) * cell;
        var x0 = cx - ux * len / 2, y0 = cy - uy * len / 2, x1 = cx + ux * len / 2, y1 = cy + uy * len / 2;
        var hl = Math.min(6, 0.4 * len + 1.5);
        paths.moveTo(x0, y0); paths.lineTo(x1, y1);
        paths.moveTo(x1 - hl * (ux + 0.5 * uy), y1 - hl * (uy - 0.5 * ux));
        paths.lineTo(x1, y1);
        paths.lineTo(x1 - hl * (ux - 0.5 * uy), y1 - hl * (uy + 0.5 * ux));
      }
      c.lineWidth = 3.4; c.strokeStyle = C.bg; c.stroke(paths);
      c.lineWidth = 1.4; c.strokeStyle = C.ink; c.stroke(paths);
    }

    // cellule survolée
    if (this.hoverCell) {
      var hx = p.l + this.hoverCell.i * cell, hy = p.t + (N - 1 - this.hoverCell.j) * cell;
      c.lineWidth = 3; c.strokeStyle = C.bg; c.strokeRect(hx - 1, hy - 1, cell + 2, cell + 2);
      c.lineWidth = 1.5; c.strokeStyle = C.ink; c.strokeRect(hx - 1, hy - 1, cell + 2, cell + 2);
    }

    c.lineWidth = 1; c.strokeStyle = C.rule;
    c.strokeRect(Math.round(p.l) - 0.5, Math.round(p.t) - 0.5, Math.round(s) + 1, Math.round(s) + 1);

    // axes : x_i = 2π i/N au centre de la cellule i
    var labs = ["0", "π/2", "π", "3π/2"];
    labs.forEach(function (sv, k) {
      var px = p.l + (k * N / 4 + 0.5) * cell, py = p.t + (N - 1 - k * N / 4 + 0.5) * cell;
      c.strokeStyle = C.rule; c.lineWidth = 1; c.beginPath();
      c.moveTo(px, p.b + 1); c.lineTo(px, p.b + 5); c.moveTo(p.l - 1, py); c.lineTo(p.l - 5, py); c.stroke();
      self.text(sv, px, p.b + 17, "center", C.soft, 12);
      self.text(sv, p.l - 7, py + 4, "right", C.soft, 12);
    });
    this.text("x", p.r, p.b + 17, "right", C.ink, 12, "700");
    this.text("y", p.l - 7, p.t + 10, "right", C.ink, 12, "700");

    // barre de couleur
    var cbx = p.r + 12, cbw = 12, steps = 64;
    for (var k = 0; k < steps; k++) {
      var col = this.seqColor((k + 0.5) / steps);
      c.fillStyle = "rgb(" + Math.round(col[0]) + "," + Math.round(col[1]) + "," + Math.round(col[2]) + ")";
      var y0b = p.b - (k + 1) * s / steps, y1b = p.b - k * s / steps;
      c.fillRect(cbx, Math.floor(y0b), cbw, Math.ceil(y1b) - Math.floor(y0b));
    }
    c.lineWidth = 1; c.strokeStyle = C.rule;
    c.strokeRect(cbx - 0.5, p.t - 0.5, cbw + 1, s + 1);
    var st = vmax <= 3 ? 0.5 : 1, dec = st < 1 ? 1 : 0;
    for (var tv = 0; tv <= vmax + 1e-9; tv += st) {
      var ty = p.b - tv / vmax * s;
      if (p.t - ty > 0.5) continue;
      c.beginPath(); c.moveTo(cbx + cbw, ty); c.lineTo(cbx + cbw + 4, ty); c.stroke();
      if (ty > p.t + 14) this.text(fmt(lg, tv, dec), cbx + cbw + 7, ty + 4, "left", C.soft, 12);
    }
    this.text(fmt(lg, vmax, 2), cbx + cbw + 7, p.t + 9, "left", C.ink, 12, "700");

    // valeur survolée
    if (this.hoverCell) {
      var hi = this.hoverCell.i, hj = this.hoverCell.j;
      var tx = p.l + (hi + 0.5) * cell, ty2 = p.t + (N - 1 - hj + 0.5) * cell;
      this.tooltip({ x: 0, y: 0, w: this.W, h: this.H }, tx, ty2, [
        "(x, y) = (" + fmt(lg, TWO_PI * hi / N, 2) + (lg === "fr" ? " ; " : ", ") + fmt(lg, TWO_PI * hj / N, 2) + ")",
        "|B|/B_rms = " + fmt(lg, m.abs[hj][hi], 2)
      ]);
    }
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
