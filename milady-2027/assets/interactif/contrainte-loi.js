/*
 * contrainte-loi.js — MilaDy 2027, widget interactif « contrainte-loi » (FR / EN).
 * Contrainte en loi contre contrainte par échantillon (Propositions 5 à 7 de specs/theorie-brief.md) :
 * projection de chaque échantillon sur {r = 0} contre inclinaison exponentielle (I-projection).
 * Usage : <div class="widget" data-widget="contrainte-loi"></div>
 *         <script defer src=".../assets/interactif/contrainte-loi.js"></script>
 *
 * ---------------------------------------------------------------------------------------------
 * Formules utilisées
 *
 * 1. Vraie loi μ de la variable scalaire r = dE/dt = P − ε (puissance injectée moins dissipation) d'un
 *    état statistiquement stationnaire, en unités arbitraires. Mélange asymétrique de deux gaussiennes
 *        μ = 0,7 N(−0,45 ; 0,5²) + 0,3 N(1,05 ; 0,8²),
 *    de moyenne 0,7 × (−0,45) + 0,3 × 1,05 = 0 EXACTEMENT : c'est l'identité de stationnarité
 *    E_μ[𝓛E] = E_μ[dE/dt] = 0 (Proposition 5, φ = E). Variance Σ p_k (σ_k² + m_k²) = 0,8395,
 *    écart-type 0,9162 ; queue droite plus lourde (bouffées d'injection).
 *    Fonctions exactes, avec z_k = (x − m_k)/σ_k :
 *        F_μ(x) = Σ p_k Φ(z_k),   f_μ(x) = Σ p_k φ(z_k)/σ_k,
 *        M(x) = E_μ[r 1{r ≤ x}] = Σ p_k (m_k Φ(z_k) − σ_k φ(z_k)),
 *        G(x) = ∫_{−∞}^x F_μ = E_μ[(x − r)⁺] = x F_μ(x) − M(x)   (intégration par parties).
 *    Φ par la série de Marsaglia (2004), sans terme alterné :
 *        Φ(z) = 1/2 + φ(z) Σ_{n≥0} z^{2n+1} / (1·3·5···(2n+1)),   |Φ − Φ_exact| ≲ 1e−15 pour |z| ≤ 9,
 *    et Φ = 0 ou 1 au-delà (Φ(−9) ≈ 1,1e−19).
 *
 * 2. « Modèle génératif » q_{b,s} : loi de s X + b avec X ~ μ (biais b = décalage de la moyenne,
 *    largeur s = dilatation autour de 0) ; moyenne b, écart-type 0,9162 s.
 *    Option « support manquant » : q conditionnée à r < r_c (le modèle ne produit jamais r ≥ r_c).
 *    Tirage par inversion : u_j = (k_j + 1/2)/2³² avec k_j entiers de mulberry32 (graine affichée),
 *        X_j = F_μ^{-1}(u_j)   ou, tronqué,   X_j = F_μ^{-1}(u_j F_μ(x_c)),  x_c = (r_c − b)/s,
 *        r_j = s X_j + b,
 *    F_μ^{-1} par Newton protégé par bissection. Les mêmes u_j servent quand on bouge les curseurs
 *    (nombres aléatoires communs) : l'image varie continûment ; « Nouveau tirage » change la graine.
 *    Les N premiers u_j sont triés, donc les r_j sont triés (s > 0).
 *
 * 3. Projection par échantillon sur {r = 0} : r_j ← 0 pour tout j. Loi obtenue δ₀ : moyenne 0,
 *    variance 0, étrangère à μ (KL(δ₀ ‖ q) = +∞) et
 *        W₁(δ₀, μ) = E_μ|r| = 2 G(0) = −2 M(0) ≈ 0,7216,
 *    (contrôle : Σ p_k [σ_k √(2/π) e^{−m_k²/(2σ_k²)} + m_k (1 − 2Φ(−m_k/σ_k))] = 0,7216),
 *    indépendant du modèle : même un générateur parfait la subit (Corollaire 6).
 *
 * 4. Inclinaison exponentielle (I-projection, Csiszár 1975 ; Proposition 7). Parmi les lois ν ≪ q_N
 *    (q_N = (1/N) Σ δ_{r_j}) telles que E_ν[r] = 0, celle qui minimise KL(ν ‖ q_N) est
 *        w_j = e^{β r_j} / Σ_i e^{β r_i},
 *    où β minimise le dual convexe Λ(β) = log((1/N) Σ_j e^{β r_j}) :
 *        Λ'(β) = Σ w_j r_j = E_w[r],   Λ''(β) = Var_w(r) > 0.
 *    Newton β ← β − Λ'(β)/Λ''(β) à partir de β = 0, protégé par l'encadrement de la racine
 *    (bissection si le pas en sort) ; exponentielles en log-somme-exp. Arrêt quand |E_w[r]| ≤ 1e−12 (max r − min r).
 *    Solution si et seulement si min r_j < 0 < max r_j (sinon aucun poids positif ne ramène la moyenne à 0).
 *        KL(ν* ‖ q_N) = Σ w_j log(N w_j) = β E_w[r] − Λ(β) = −Λ(β*)   (en nats),
 *        ESS = 1 / Σ w_j²   (taille effective d'échantillon, Kish 1965), affichée aussi en ESS/N.
 *    Un repondérage ne crée pas de masse : supp ν* ⊂ supp q.
 *
 * 5. Distance de Wasserstein-1 en dimension 1 (Vallender 1973), contre la loi EXACTE μ :
 *        W₁(ν, μ) = ∫_0^1 |F_ν^{-1}(u) − F_μ^{-1}(u)| du = ∫_ℝ |F_ν(x) − F_μ(x)| dx.
 *    Pour ν = Σ_j w_j δ_{r_(j)} (valeurs triées, poids cumulés c_j = Σ_{i≤j} w_i), la fonction quantile
 *    de ν vaut r_(j) sur ]c_{j−1}, c_j] ; on intègre exactement morceau par morceau :
 *        W₁ = G(r_(1)) + Σ_{j<N} ∫_{r_(j)}^{r_(j+1)} |c_j − F_μ(x)| dx + (G(r_(N)) − r_(N)),
 *    avec ∫_a^b (F_μ − c) dx = G(b) − G(a) − c (b − a), en coupant en x* = F_μ^{-1}(c_j) quand
 *    F_μ(a) < c_j < F_μ(b) ; la queue droite vaut ∫_t^∞ (1 − F_μ) = E_μ[(r − t)⁺] = G(t) − t (car E_μ[r] = 0).
 *    Même pour q = μ, W₁(q_N, μ) n'est pas nul : bruit d'échantillonnage de l'ordre de 1/√N.
 *
 * 6. Masse manquante : μ(r ≥ r_c) = 1 − F_μ(r_c).
 *
 * 7. Histogrammes : densité Σ_{j ∈ case} w_j / Δ, cases de largeur Δ = 0,125 sur [−3 ; 5] ;
 *    la même échelle verticale sert aux trois panneaux. Le Dirac δ₀ est dessiné comme une flèche.
 *
 * Références
 *  - I. Csiszár, « I-divergence geometry of probability distributions and minimization problems »,
 *    Ann. Probab. 3(1), 146–158 (1975).
 *  - S. S. Vallender, « Calculation of the Wasserstein distance between probability distributions on
 *    the line », Theory Probab. Appl. 18(4), 784–786 (1973).
 *  - G. Marsaglia, « Evaluating the normal distribution », J. Stat. Softw. 11(4), 1–11 (2004).
 *  - L. Kish, Survey Sampling, Wiley (1965) ; J. S. Liu, Monte Carlo Strategies in Scientific
 *    Computing, Springer (2001), § 2.5 (ESS des poids d'importance).
 *  - T. M. Cover, J. A. Thomas, Elements of Information Theory, 2e éd., Wiley (2006), § 12.1
 *    (loi d'entropie maximale / famille exponentielle).
 *  - Générateur pseudo-aléatoire mulberry32 (T. Ettinger, 2017, domaine public).
 *  - specs/theorie-brief.md : Proposition 5 (identités de stationnarité), Corollaire 6 (contrainte par
 *    échantillon incohérente), Proposition 7 (I-projection, ESS, support manquant).
 * ---------------------------------------------------------------------------------------------
 */
(function () {
  "use strict";

  var NAME = "contrainte-loi";

  /* ---------- vraie loi μ ---------- */
  var PK = [0.7, 0.3], MK = [-0.45, 1.05], SK = [0.5, 0.8];
  var VAR_MU = PK[0] * (SK[0] * SK[0] + MK[0] * MK[0]) + PK[1] * (SK[1] * SK[1] + MK[1] * MK[1]);
  var SD_MU = Math.sqrt(VAR_MU);
  var INV_SQRT_2PI = 0.3989422804014327;
  var QLO = -12, QHI = 12;                      // encadrement initial de F_μ^{-1}

  /* ---------- curseurs, affichage ---------- */
  var B_MIN = -1, B_MAX = 1, B_STEP = 0.05, B_DEF = 0.4;
  var S_MIN = 0.5, S_MAX = 1.5, S_STEP = 0.05, S_DEF = 1;
  var NS = [250, 500, 1000, 2000, 4000, 8000, 16000], N_DEF = 4;
  var C_MIN = -0.25, C_MAX = 1.5, C_STEP = 0.05, C_DEF = 0.15;
  var XMIN = -3, XMAX = 5, NBIN = 64, DX = (XMAX - XMIN) / NBIN;   // Δ = 0,125
  var SWEEP_PERIOD = 12;                        // s, aller-retour de b
  var PAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];
  var PAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500"];

  /* ---------- textes ---------- */
  var TXT = {
    fr: {
      title: "Contrainte en loi ou par échantillon : le bilan d'énergie moyen ⟨dE/dt⟩ = 0",
      bLab: "biais b", sLab: "largeur s", nLab: "N", cLab: "seuil r<sub>c</sub>",
      bName: "Biais du modèle b : décalage de la moyenne de q",
      sName: "Largeur du modèle s : dilatation de q autour de 0",
      nName: "Nombre N d'échantillons tirés du modèle",
      cName: "Seuil r_c : le modèle tronqué ne produit jamais r ≥ r_c",
      trunc: "support manquant", truncName: "Support manquant : le modèle n'a pas la queue droite de la vraie loi (r ≥ r_c)",
      redraw: "Nouveau tirage", redrawTip: "Nouvelle graine pour les N tirages du modèle",
      play: "Animer b", pause: "Pause", playTip: "Fait varier le biais b entre −1 et 1, en boucle",
      panelA: "(a) Vérité μ et modèle q", panelAs: "(a) μ et q",
      panelB: "(b) Projection par échantillon : chaque r ← 0", panelBs: "(b) Projection r ← 0",
      panelC: "(c) Inclinaison exponentielle : poids w ∝ exp(βr)", panelCs: "(c) Inclinaison w ∝ exp(βr)",
      legTruth: "vérité μ (densité exacte)", legQ: "modèle q", legQd: "q avant correction",
      legProj: "projection : Dirac en 0", legTilt: "inclinaison ν*", legMiss: "zone où q n'a aucune masse",
      xAxis: "r = dE/dt = P − ε (unités arbitraires)", yAxis: "densité",
      dirac: "δ₀ : masse 1, variance 0", diracS: "δ₀ (masse 1)",
      stA: function (m, w) { return "moyenne " + m + " · W₁ = " + w; },
      stB: function (w) { return "écart-type 0 · W₁ = " + w; },
      stC: function (w, e) { return "W₁ = " + w + " · ESS/N = " + e; },
      miss: function (p) { return p + " de μ"; },
      infeasible: function (pos) { return "impossible : aucun r " + (pos ? "> 0" : "< 0") + " dans l'échantillon"; },
      canvas: "Trois panneaux superposés, même axe horizontal r = dE/dt. (a) densité exacte de la vraie loi μ " +
        "(courbe) et histogramme des N échantillons du modèle q. (b) projection par échantillon : toute la masse " +
        "en r = 0 (flèche, Dirac). (c) histogramme pondéré de l'inclinaison exponentielle, avec le contour de q " +
        "et la densité de μ. Les valeurs numériques sont données sous la figure.",
      lTruth: function (sd) { return "<b>Vérité μ</b> : moyenne 0 ; écart-type " + sd + "."; },
      lModel: function (n, seed, m, sd, w) {
        return "<b>Modèle q</b> (N = " + n + ", graine " + seed + ") : moyenne " + m + " ; écart-type " + sd +
          " ; W₁(q, μ) = " + w + ".";
      },
      lProj: function (w) {
        return "<b>Projection r ← 0</b> : moyenne 0 ; écart-type 0 ; W₁ = E<sub>μ</sub>|r| = " + w + " ; KL(δ₀ ‖ q) = ∞.";
      },
      lTilt: function (beta, it, m, sd, w, kl, ess, essN) {
        return "<b>Inclinaison</b> : β = " + beta + " (" + it + " itér. de Newton) ; moyenne " + m + " ; écart-type " + sd +
          " ; W₁ = " + w + " ; KL(ν* ‖ q) = " + kl + " nat ; ESS = " + ess + " (ESS/N = " + essN + ").";
      },
      lTiltNo: function (pos) {
        return "<b>Inclinaison</b> : impossible, tous les r<sub>j</sub> sont " + (pos ? "≤ 0" : "≥ 0") +
          " : aucun poids positif ne ramène la moyenne à 0.";
      },
      lMiss: function (rc, p) {
        return "<b>Support manquant</b> : q ne produit jamais r ≥ r<sub>c</sub> = " + rc + ", où μ met " + p +
          " de sa masse ; aucun poids ne peut l'y créer.";
      },
      note: "La projection par échantillon met chaque tirage sur r = 0 : la moyenne est juste, mais l'écart-type tombe à 0, " +
        "la loi obtenue (un Dirac) est étrangère à μ et son erreur W₁ = E_μ|r| ne dépend pas du modèle : un générateur parfait " +
        "(b = 0, s = 1) la subit aussi (Corollaire 6). L'inclinaison n'impose que la moyenne, en déformant q le moins possible " +
        "au sens de KL (Proposition 7). Elle ne crée pas de masse : avec « support manquant », la masse s'entasse sous r_c, " +
        "l'ESS chute (impossible si r_c ≤ 0), W₁ peut dépasser celui de q et ne baisse pas quand N augmente. W₁ est calculé " +
        "exactement contre μ ; même pour q = μ, il reste de l'ordre de 1/√N (bruit d'échantillonnage)."
    },
    en: {
      title: "Constraint on the law or on each sample: the mean energy balance ⟨dE/dt⟩ = 0",
      bLab: "bias b", sLab: "width s", nLab: "N", cLab: "cut-off r<sub>c</sub>",
      bName: "Model bias b: shift of the mean of q",
      sName: "Model width s: dilation of q about 0",
      nName: "Number N of samples drawn from the model",
      cName: "Cut-off r_c: the truncated model never produces r ≥ r_c",
      trunc: "missing support", truncName: "Missing support: the model lacks the right tail of the true law (r ≥ r_c)",
      redraw: "New draw", redrawTip: "New seed for the N model samples",
      play: "Animate b", pause: "Pause", playTip: "Sweeps the bias b between −1 and 1, in a loop",
      panelA: "(a) Truth μ and model q", panelAs: "(a) μ and q",
      panelB: "(b) Per-sample projection: every r ← 0", panelBs: "(b) Projection r ← 0",
      panelC: "(c) Exponential tilting: weights w ∝ exp(βr)", panelCs: "(c) Tilting w ∝ exp(βr)",
      legTruth: "truth μ (exact density)", legQ: "model q", legQd: "q before correction",
      legProj: "projection: Dirac at 0", legTilt: "tilted ν*", legMiss: "region where q has no mass",
      xAxis: "r = dE/dt = P − ε (arbitrary units)", yAxis: "density",
      dirac: "δ₀: mass 1, variance 0", diracS: "δ₀ (mass 1)",
      stA: function (m, w) { return "mean " + m + " · W₁ = " + w; },
      stB: function (w) { return "std 0 · W₁ = " + w; },
      stC: function (w, e) { return "W₁ = " + w + " · ESS/N = " + e; },
      miss: function (p) { return p + " of μ"; },
      infeasible: function (pos) { return "impossible: no r " + (pos ? "> 0" : "< 0") + " in the sample"; },
      canvas: "Three stacked panels sharing the horizontal axis r = dE/dt. (a) exact density of the true law μ " +
        "(curve) and histogram of the N samples of the model q. (b) per-sample projection: all the mass at r = 0 " +
        "(arrow, Dirac). (c) weighted histogram of the exponential tilting, with the outline of q and the density of μ. " +
        "The numbers are given below the figure.",
      lTruth: function (sd) { return "<b>Truth μ</b>: mean 0; standard deviation " + sd + "."; },
      lModel: function (n, seed, m, sd, w) {
        return "<b>Model q</b> (N = " + n + ", seed " + seed + "): mean " + m + "; standard deviation " + sd +
          "; W₁(q, μ) = " + w + ".";
      },
      lProj: function (w) {
        return "<b>Projection r ← 0</b>: mean 0; standard deviation 0; W₁ = E<sub>μ</sub>|r| = " + w + "; KL(δ₀ ‖ q) = ∞.";
      },
      lTilt: function (beta, it, m, sd, w, kl, ess, essN) {
        return "<b>Tilting</b>: β = " + beta + " (" + it + " Newton iter.); mean " + m + "; standard deviation " + sd +
          "; W₁ = " + w + "; KL(ν* ‖ q) = " + kl + " nat; ESS = " + ess + " (ESS/N = " + essN + ").";
      },
      lTiltNo: function (pos) {
        return "<b>Tilting</b>: impossible, all r<sub>j</sub> are " + (pos ? "≤ 0" : "≥ 0") +
          ": no positive weights can bring the mean back to 0.";
      },
      lMiss: function (rc, p) {
        return "<b>Missing support</b>: q never produces r ≥ r<sub>c</sub> = " + rc + ", where μ puts " + p +
          " of its mass; no weights can create it there.";
      },
      note: "Per-sample projection puts every draw at r = 0: the mean is right, but the standard deviation drops to 0, " +
        "the resulting law (a Dirac) is singular with respect to μ and its error W₁ = E_μ|r| does not depend on the model: " +
        "a perfect generator (b = 0, s = 1) suffers it too (Corollary 6). Tilting only imposes the mean, distorting q as " +
        "little as possible in the KL sense (Proposition 7). It creates no mass: with “missing support”, the mass piles up " +
        "below r_c, the ESS drops (impossible if r_c ≤ 0), W₁ can exceed that of q and does not decrease as N grows. " +
        "W₁ is computed exactly against μ; even for q = μ it stays of order 1/√N (sampling noise)."
    }
  };

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
  function fmtSmall(lang, x) {            // ESS/N : 3 décimales, davantage si très petit
    return fmt(lang, x, x > 0 && x < 0.01 ? 4 : 3);
  }
  function pct(lang, x) {
    var s = fmt(lang, 100 * x, 1);
    return lang === "fr" ? s + " %" : s + "%";
  }

  function mk(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
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
    var n = parseInt(h, 16);
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  function cssVar(cs, name, fallback) {
    var v = cs.getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || fallback;
  }
  function hexA(hex, a) {                // "#rrggbb" + alpha → rgba()
    var m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    var n = parseInt(m[1], 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ---------- générateur pseudo-aléatoire (mulberry32) ---------- */
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0);
    };
  }
  function uniforms(seed, n) {           // u_j = (k_j + 1/2)/2³² ∈ ]0 ; 1[, triés
    var r = mulberry32(seed * 2654435761 + 12345), u = new Float64Array(n);
    for (var i = 0; i < n; i++) u[i] = (r() + 0.5) / 4294967296;
    u.sort();
    return u;
  }

  /* ---------- loi normale et mélange ---------- */
  function phi(z) { return INV_SQRT_2PI * Math.exp(-0.5 * z * z); }
  function Phi(z) {                      // Marsaglia (2004)
    if (z < -9) return 0;
    if (z > 9) return 1;
    var z2 = z * z, t = z, s = z, k = 1, old;
    do { k += 2; t *= z2 / k; old = s; s += t; } while (s !== old && k < 2000);
    return 0.5 + s * phi(z);
  }
  // évaluation du mélange en x : F, f, G (résultats dans des variables du module, sans allocation)
  var mF = 0, mf = 0, mG = 0;
  function mix(x) {
    var F = 0, f = 0, M = 0;
    for (var k = 0; k < 2; k++) {
      var z = (x - MK[k]) / SK[k], P = Phi(z), d = phi(z);
      F += PK[k] * P;
      f += PK[k] * d / SK[k];
      M += PK[k] * (MK[k] * P - SK[k] * d);
    }
    mF = F; mf = f; mG = x * F - M;
  }
  function density(x) {
    var f = 0;
    for (var k = 0; k < 2; k++) { var z = (x - MK[k]) / SK[k]; f += PK[k] * phi(z) / SK[k]; }
    return f;
  }
  // F_μ^{-1}(u) sur [lo ; hi] avec F(lo) ≤ u ≤ F(hi) : Newton protégé par bissection
  function quantile(u, lo, hi, x) {
    if (!(x >= lo && x <= hi)) x = 0.5 * (lo + hi);
    for (var it = 0; it < 200; it++) {
      mix(x);
      var d = mF - u;
      if (d === 0) return x;
      if (d > 0) hi = x; else lo = x;
      var nx = mf > 0 ? x - d / mf : NaN;
      if (!(nx > lo && nx < hi)) nx = 0.5 * (lo + hi);
      if (Math.abs(nx - x) <= 1e-14 * (1 + Math.abs(x))) return nx;
      x = nx;
    }
    return x;
  }
  mix(0);
  var W1_PROJ = 2 * mG;                  // E_μ|r| = 2 G(0)
  var F_MAX = 0;                         // maximum de f_μ (≈ 0,567)
  for (var xg = -1.5; xg <= 1; xg += 0.001) F_MAX = Math.max(F_MAX, density(xg));

  /* ---------- inclinaison exponentielle : Newton sur le dual ---------- */
  // y trié (n valeurs) ; remplit w (poids normalisés) ; renvoie {ok, beta, it, mean, sd, kl, ess}
  function solveTilt(y, n, w) {
    var ymin = y[0], ymax = y[n - 1];
    if (!(ymin < 0 && ymax > 0)) return { ok: false, pos: ymax <= 0 };
    var range = ymax - ymin, tol = 1e-12 * range;
    var lo = -Infinity, hi = Infinity, beta = 0, it = 0, i, m = 0, v = 0, s0 = 0, mx = 0;
    for (;;) {
      mx = beta >= 0 ? beta * ymax : beta * ymin;
      s0 = 0; var s1 = 0;
      for (i = 0; i < n; i++) { var e = Math.exp(beta * y[i] - mx); w[i] = e; s0 += e; s1 += e * y[i]; }
      m = s1 / s0;
      var s2 = 0;
      for (i = 0; i < n; i++) { var dd = y[i] - m; s2 += w[i] * dd * dd; }
      v = s2 / s0;
      if (Math.abs(m) <= tol || it >= 200) break;
      if (m < 0) lo = beta; else hi = beta;
      var nb = beta - m / v;
      if (!(nb > lo && nb < hi) || !isFinite(nb)) {
        if (isFinite(lo) && isFinite(hi)) nb = 0.5 * (lo + hi);
        else nb = m < 0 ? beta + Math.max(Math.abs(beta), 1 / range) : beta - Math.max(Math.abs(beta), 1 / range);
      }
      if (nb === beta) break;
      beta = nb; it++;
    }
    var sw2 = 0;
    for (i = 0; i < n; i++) { w[i] /= s0; sw2 += w[i] * w[i]; }
    var logZ = mx + Math.log(s0 / n);     // Λ(β) = log((1/N) Σ e^{β r_j})
    return { ok: true, beta: beta, it: it, mean: m, sd: Math.sqrt(v), kl: Math.max(0, -logZ), ess: 1 / sw2 };
  }

  /* ---------- W₁ exacte entre Σ w_j δ_{y_j} (y trié) et μ ---------- */
  // FA, GA : F_μ et G aux points y (précalculés) ; w = null pour des poids uniformes 1/n
  function wasserstein1(y, n, w, FA, GA) {
    var res = GA[0], cum = 0;
    for (var i = 0; i < n - 1; i++) {
      var c;
      if (w) { cum += w[i]; c = cum; } else c = (i + 1) / n;
      var a = y[i], b = y[i + 1];
      if (!(b > a)) continue;
      var Fa = FA[i], Fb = FA[i + 1], dG = GA[i + 1] - GA[i];
      if (c <= Fa) res += dG - c * (b - a);
      else if (c >= Fb) res += c * (b - a) - dG;
      else {
        var xs = quantile(c, a, b, a + (b - a) * (c - Fa) / (Fb - Fa));
        mix(xs);
        res += c * (xs - a) - (mG - GA[i]) + (GA[i + 1] - mG) - c * (b - xs);
      }
    }
    return res + (GA[n - 1] - y[n - 1]);
  }

  function histo(y, n, w, out) {
    for (var k = 0; k < NBIN; k++) out[k] = 0;
    var outL = 0, outR = 0;
    for (var i = 0; i < n; i++) {
      var wi = w ? w[i] : 1 / n, j = Math.floor((y[i] - XMIN) / DX);
      if (j < 0) outL += wi; else if (j >= NBIN) outR += wi; else out[j] += wi;
    }
    var mxv = 0;
    for (k = 0; k < NBIN; k++) { out[k] /= DX; if (out[k] > mxv) mxv = out[k]; }
    return { max: mxv, outL: outL, outR: outR };
  }

  function styleButton(b, pressed) {
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
    b.style.background = pressed ? "var(--ink)" : "transparent";
    b.style.color = pressed ? "var(--bg)" : "var(--ink)";
  }

  /* ======================================================================= */
  function Widget(el) {
    var self = this;
    this.el = el;
    this.lang = langOf();
    var T = this.T = TXT[this.lang];
    el.textContent = "";

    el.appendChild(mk("p", "widget-title", T.title));
    var controls = mk("div", "widget-controls");
    el.appendChild(controls);

    function slider(lab, name, min, max, step, val, minW) {
      var l = mk("label");
      l.style.flexWrap = "wrap";
      l.title = name;
      var out = mk("span");
      out.style.minWidth = minW;
      var inp = document.createElement("input");
      inp.type = "range"; inp.min = String(min); inp.max = String(max); inp.step = String(step);
      inp.value = String(val);
      inp.setAttribute("aria-label", name);
      l.appendChild(out); l.appendChild(inp);
      controls.appendChild(l);
      return { label: l, out: out, input: inp, lab: lab };
    }
    this.cb = slider(T.bLab, T.bName, B_MIN, B_MAX, B_STEP, B_DEF, "7.2em");
    this.cs = slider(T.sLab, T.sName, S_MIN, S_MAX, S_STEP, S_DEF, "7.6em");
    this.cn = slider(T.nLab, T.nName, 0, NS.length - 1, 1, N_DEF, "6.2em");

    var tl = mk("label");
    tl.title = T.truncName;
    var tc = this.truncIn = document.createElement("input");
    tc.type = "checkbox";
    tc.setAttribute("aria-label", T.truncName);
    tl.appendChild(tc); tl.appendChild(document.createTextNode(T.trunc));
    controls.appendChild(tl);
    this.cc = slider(T.cLab, T.cName, C_MIN, C_MAX, C_STEP, C_DEF, "7.6em");

    var br = mk("button", null, T.redraw);
    br.type = "button"; br.title = T.redrawTip;
    br.setAttribute("aria-label", T.redraw + " : " + T.redrawTip);
    var bp = this.playBtn = mk("button", null, T.play);
    bp.type = "button"; bp.title = T.playTip;
    controls.appendChild(br); controls.appendChild(bp);

    var cv = this.canvas = document.createElement("canvas");
    cv.setAttribute("role", "img");
    cv.setAttribute("aria-label", T.canvas);
    cv.textContent = T.canvas;
    el.appendChild(cv);
    this.ctx = cv.getContext("2d");

    var ro = this.readout = mk("p", "widget-readout");
    ro.setAttribute("aria-live", "polite");
    this.rl = [];
    for (var i = 0; i < 5; i++) { var s = mk("span"); s.style.display = "block"; ro.appendChild(s); this.rl.push(s); }
    el.appendChild(ro);
    el.appendChild(mk("p", "widget-note", T.note));

    /* état */
    this.b = B_DEF; this.s = S_DEF; this.nIdx = N_DEF; this.trunc = false; this.rc = C_DEF; this.seed = 1;
    this.running = false; this.raf = 0; this.lastTs = 0; this.phase = Math.asin(B_DEF / B_MAX); this.lastRead = 0;
    this.visible = true; this.pending = false; this.ymaxHold = 0;
    this.hRaw = new Float64Array(NBIN); this.hTilt = new Float64Array(NBIN);
    this.W = 0; this.H = 0; this.dpr = 0;

    this.cb.input.addEventListener("input", function () {
      if (self.running) self.stop();
      self.b = Math.round(parseFloat(self.cb.input.value) / B_STEP) * B_STEP;
      self.schedule();
    });
    this.cs.input.addEventListener("input", function () {
      self.s = Math.round(parseFloat(self.cs.input.value) / S_STEP) * S_STEP; self.schedule();
    });
    this.cn.input.addEventListener("input", function () {
      self.nIdx = Math.max(0, Math.min(NS.length - 1, parseInt(self.cn.input.value, 10) || 0));
      self.base = null; self.schedule();
    });
    this.cc.input.addEventListener("input", function () {
      self.rc = Math.round(parseFloat(self.cc.input.value) / C_STEP) * C_STEP; self.schedule();
    });
    tc.addEventListener("change", function () {
      self.trunc = tc.checked; self.layoutDirty = true; self.schedule();
    });
    br.addEventListener("click", function () { self.seed++; self.base = null; self.schedule(); });
    bp.addEventListener("click", function () { if (self.running) self.stop(); else self.start(); });

    this.readTheme();
    this.compute();
    this.updateLabels();
    this.updateReadout();
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
    styleButton(bp, false);
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
    c.dark = luminance(c.bg) < 0.5;
    c.pal = c.dark ? PAL_DARK : PAL_LIGHT;
    c.font = getComputedStyle(this.el).fontFamily || "system-ui, sans-serif";
    this.C = c;
  };

  /* ----- calcul ----- */
  Widget.prototype.schedule = function () {
    if (this.pending) return;
    this.pending = true;
    var self = this;
    requestAnimationFrame(function () {
      self.pending = false;
      self.compute();
      self.updateLabels();
      if (self.layoutDirty) { self.layoutDirty = false; self.resize(true); } else self.draw();
      if (!self.running) self.updateReadout();
    });
  };

  Widget.prototype.compute = function () {
    var n = NS[this.nIdx], i;
    if (!this.base || this.base.n !== n || this.base.seed !== this.seed) {
      var u = uniforms(this.seed, n), x0 = new Float64Array(n), prev = QLO;
      for (i = 0; i < n; i++) { prev = quantile(u[i], prev, QHI, prev); x0[i] = prev; }
      this.base = { n: n, seed: this.seed, u: u, x0: x0 };
      this.y = new Float64Array(n); this.w = new Float64Array(n);
      this.FA = new Float64Array(n); this.GA = new Float64Array(n);
    }
    var y = this.y, b = this.b, s = this.s, B = this.base;
    if (this.trunc) {                       // X_j = F^{-1}(u_j F(x_c)) : loi de X conditionnée à X < x_c
      var xc = (this.rc - b) / s;
      mix(xc);
      var Fc = mF, p = QLO;
      for (i = 0; i < n; i++) { p = quantile(B.u[i] * Fc, p, xc, p); y[i] = s * p + b; }
    } else {
      for (i = 0; i < n; i++) y[i] = s * B.x0[i] + b;
    }
    // statistiques du modèle brut
    var m = 0;
    for (i = 0; i < n; i++) m += y[i];
    m /= n;
    var v = 0;
    for (i = 0; i < n; i++) { var d = y[i] - m; v += d * d; }
    this.rawMean = m; this.rawSd = Math.sqrt(v / n);
    // F_μ et G aux points
    for (i = 0; i < n; i++) { mix(y[i]); this.FA[i] = mF; this.GA[i] = mG; }
    this.rawW1 = wasserstein1(y, n, null, this.FA, this.GA);
    this.hr = histo(y, n, null, this.hRaw);
    // inclinaison
    this.tilt = solveTilt(y, n, this.w);
    if (this.tilt.ok) {
      this.tilt.w1 = wasserstein1(y, n, this.w, this.FA, this.GA);
      this.ht = histo(y, n, this.w, this.hTilt);
    } else this.ht = null;
    mix(this.rc);
    this.missMass = 1 - mF;
  };

  /* ----- textes ----- */
  Widget.prototype.updateLabels = function () {
    var lg = this.lang, T = this.T;
    var bs = fmt(lg, this.b, 2), ss = fmt(lg, this.s, 2), ns = fmt(lg, NS[this.nIdx], 0), cs = fmt(lg, this.rc, 2);
    this.cb.out.textContent = T.bLab + " = " + bs;
    this.cs.out.textContent = T.sLab + " = " + ss;
    this.cn.out.textContent = T.nLab + " = " + ns;
    this.cc.out.innerHTML = T.cLab + " = " + cs;
    this.cb.input.setAttribute("aria-valuetext", bs);
    this.cs.input.setAttribute("aria-valuetext", ss);
    this.cn.input.setAttribute("aria-valuetext", ns);
    this.cc.input.setAttribute("aria-valuetext", cs);
    this.cc.input.disabled = !this.trunc;
    this.cc.label.style.opacity = this.trunc ? "1" : "0.55";
  };

  Widget.prototype.updateReadout = function () {
    var T = this.T, lg = this.lang, t = this.tilt;
    var lines = [
      T.lTruth(fmt(lg, SD_MU, 3)),
      T.lModel(fmt(lg, NS[this.nIdx], 0), fmt(lg, this.seed, 0), fmt(lg, this.rawMean, 3), fmt(lg, this.rawSd, 3),
        fmt(lg, this.rawW1, 3)),
      T.lProj(fmt(lg, W1_PROJ, 3)),
      t.ok ? T.lTilt(fmt(lg, t.beta, 3), fmt(lg, t.it, 0), fmt(lg, t.mean, 3), fmt(lg, t.sd, 3), fmt(lg, t.w1, 3),
        fmt(lg, t.kl, 3), fmt(lg, t.ess, 0), fmtSmall(lg, t.ess / NS[this.nIdx])) : T.lTiltNo(t.pos),
      this.trunc ? T.lMiss(fmt(lg, this.rc, 2), pct(lg, this.missMass)) : ""
    ];
    if (!this.lastLines) this.lastLines = [];
    for (var i = 0; i < 5; i++) {
      if (this.lastLines[i] === lines[i]) continue;
      this.lastLines[i] = lines[i];
      this.rl[i].innerHTML = lines[i];
      this.rl[i].style.display = lines[i] ? "block" : "none";
    }
  };

  /* ----- animation : balayage de b ----- */
  Widget.prototype.start = function () {
    if (this.running) return;
    this.running = true; this.lastTs = 0;
    this.phase = Math.asin(Math.max(-1, Math.min(1, this.b / B_MAX)));
    this.playBtn.textContent = this.T.pause;
    styleButton(this.playBtn, true);
    this.readout.setAttribute("aria-busy", "true");
    var self = this;
    this.raf = requestAnimationFrame(function (ts) { self.frame(ts); });
  };
  Widget.prototype.stop = function () {
    var was = this.running;
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.playBtn.textContent = this.T.play;
    styleButton(this.playBtn, false);
    this.readout.setAttribute("aria-busy", "false");
    if (was) {
      this.b = Math.round(this.b / B_STEP) * B_STEP;   // retour sur la grille du curseur
      this.cb.input.value = String(this.b);
      this.ymaxHold = 0;
      this.compute(); this.updateLabels(); this.draw();
    }
    this.updateReadout();
  };
  Widget.prototype.frame = function (ts) {
    if (!this.running) return;
    var self = this;
    var dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 1 / 60;
    this.lastTs = ts;
    if (this.visible) {
      this.phase += 2 * Math.PI * dt / SWEEP_PERIOD;
      this.b = B_MAX * Math.sin(this.phase);
      this.cb.input.value = String(this.b);
      this.compute(); this.updateLabels(); this.draw();
      if (ts - this.lastRead > 400) { this.lastRead = ts; this.updateReadout(); }
    }
    this.raf = requestAnimationFrame(function (t) { self.frame(t); });
  };

  /* ----- géométrie ----- */
  Widget.prototype.legendItems = function () {
    var T = this.T, it = [
      { k: "truth", t: T.legTruth }, { k: "q", t: T.legQ }, { k: "qd", t: T.legQd },
      { k: "proj", t: T.legProj }, { k: "tilt", t: T.legTilt }
    ];
    if (this.trunc) it.push({ k: "miss", t: T.legMiss });
    return it;
  };

  Widget.prototype.resize = function (force) {
    var r = this.canvas.getBoundingClientRect();
    var W = Math.floor(r.width || this.el.clientWidth || 600);
    var dpr = window.devicePixelRatio || 1;
    if (!force && W === this.W && dpr === this.dpr) return;
    this.W = W; this.dpr = dpr;
    var fs = W < 460 ? 11 : 12;
    this.fs = fs;
    // légende sur une ou plusieurs lignes
    var items = this.legendItems(), x = 0, row = 0, sw = 24, gapI = 16, rowH = fs + 7;
    for (var i = 0; i < items.length; i++) {
      var wi = sw + this.textWidth(items[i].t, fs) + gapI;
      if (x > 0 && x + wi - gapI > W) { x = 0; row++; }
      items[i].x = x; items[i].row = row;
      x += wi;
    }
    this.legend = items;
    var legH = (row + 1) * rowH + 6;
    var padL = 46, padR = 8, headH = fs + 9, gap = 12, axisH = 2 * fs + 22;
    var ph = Math.round(Math.max(92, Math.min(128, W * 0.17)));
    var panels = [], y = legH;
    for (var k = 0; k < 3; k++) {
      panels.push({ top: y, l: padL, r: W - padR, t: y + headH, b: y + headH + ph });
      y += headH + ph + gap;
    }
    this.L = { W: W, H: y - gap + axisH, panels: panels, rowH: rowH, padL: padL };
    this.H = this.L.H;
    this.canvas.style.height = this.H + "px";
    this.canvas.width = Math.round(W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.draw();
  };

  /* ----- dessin ----- */
  Widget.prototype.textWidth = function (s, size, weight) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + (this.C ? this.C.font : "sans-serif");
    return c.measureText(s).width;
  };
  Widget.prototype.text = function (s, x, y, align, color, size, weight, halo) {
    var c = this.ctx;
    c.font = (weight || "400") + " " + (size || 12) + "px " + this.C.font;
    c.textAlign = align || "left";
    c.textBaseline = "alphabetic";
    if (halo) {
      c.lineWidth = 4; c.strokeStyle = this.C.bg; c.lineJoin = "round";
      c.strokeText(s, x, y);
    }
    c.fillStyle = color || this.C.ink;
    c.fillText(s, x, y);
    return c.measureText(s).width;
  };

  Widget.prototype.yMax = function () {
    var m = Math.max(F_MAX, this.hr.max);
    if (this.ht) m = Math.max(m, this.ht.max);
    m *= 1.08;
    var q = m <= 1 ? 0.1 : (m <= 2 ? 0.25 : 0.5);
    var y = Math.min(3, Math.ceil(m / q) * q);
    if (this.running) { y = Math.max(y, this.ymaxHold); this.ymaxHold = y; }
    this.ymaxNow = y;
    return y;
  };

  Widget.prototype.draw = function () {
    if (!this.L || !this.hr) return;
    var c = this.ctx, dpr = this.dpr, L = this.L, C = this.C, T = this.T, lg = this.lang, fs = this.fs;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, L.W, L.H);
    c.lineJoin = "round"; c.lineCap = "butt";
    var p0 = L.panels[0];
    var X = function (v) { return p0.l + (v - XMIN) / (XMAX - XMIN) * (p0.r - p0.l); };
    var ymax = this.yMax();
    this.drawLegend();

    var narrow = (p0.r - p0.l) < 330;
    var titles = [[T.panelA, T.panelAs], [T.panelB, T.panelBs], [T.panelC, T.panelCs]];
    var t = this.tilt;
    var stats = [
      T.stA(fmt(lg, this.rawMean, 2), fmt(lg, this.rawW1, 2)),
      T.stB(fmt(lg, W1_PROJ, 2)),
      t.ok ? T.stC(fmt(lg, t.w1, 2), fmt(lg, t.ess / NS[this.nIdx], t.ess / NS[this.nIdx] < 0.01 ? 3 : 2)) : ""
    ];
    for (var k = 0; k < 3; k++) {
      var p = L.panels[k];
      var Y = (function (pp) { return function (v) { return pp.b - Math.min(v, ymax) / ymax * (pp.b - pp.t); }; })(p);
      // en-tête : titre (long ou court) + statistique si la place suffit
      var tx = narrow ? 4 : p.l, avail = p.r - tx;
      var tl = this.textWidth(titles[k][0], fs + 1, "700"), ts = this.textWidth(titles[k][1], fs + 1, "700");
      var stw = stats[k] ? this.textWidth(stats[k], fs) + 14 : 0, title, showSt = false;
      if (tl + stw <= avail) { title = titles[k][0]; showSt = !!stw; }
      else if (ts + stw <= avail) { title = titles[k][1]; showSt = !!stw; }
      else title = tl <= avail ? titles[k][0] : titles[k][1];
      this.text(title, tx, p.t - 6, "left", C.ink, fs + 1, "700");
      if (showSt) this.text(stats[k], p.r, p.t - 6, "right", C.soft, fs);

      // grille et axes
      var step = ymax <= 0.6 ? 0.2 : ymax <= 1.2 ? 0.25 : ymax <= 2 ? 0.5 : 1;
      if (ymax / step > 4.01) step *= 2;
      c.lineWidth = 1;
      for (var gv = step; gv < ymax - 1e-9; gv += step) {
        var gy = Math.round(Y(gv)) + 0.5;
        c.strokeStyle = C.rule; c.globalAlpha = 0.18;
        c.beginPath(); c.moveTo(p.l, gy); c.lineTo(p.r, gy); c.stroke();
        c.globalAlpha = 1;
        this.text(fmt(lg, gv, step < 0.5 ? 2 : 1), p.l - 5, gy + 4, "right", C.soft, fs - 1);
      }
      this.text("0", p.l - 5, p.b + 3, "right", C.soft, fs - 1);

      c.save();
      c.beginPath(); c.rect(p.l, p.t, p.r - p.l, p.b - p.t); c.clip();
      if (this.trunc) this.hatch(p, X(this.rc));
      if (k === 0) this.drawPanelA(p, X, Y);
      else if (k === 1) this.drawPanelB(p, X, Y, ymax);
      else this.drawPanelC(p, X, Y);
      // droite r = 0 (contrainte E[r] = 0)
      c.setLineDash([4, 4]); c.strokeStyle = C.soft; c.lineWidth = 1; c.globalAlpha = 0.85;
      var x0 = Math.round(X(0)) + 0.5;
      c.beginPath(); c.moveTo(x0, p.t); c.lineTo(x0, p.b); c.stroke();
      c.setLineDash([]); c.globalAlpha = 1;
      // vraie densité
      this.truthCurve(p, X, Y);
      c.restore();

      // cadre
      c.strokeStyle = C.rule; c.lineWidth = 1; c.globalAlpha = 0.9;
      c.beginPath(); c.moveTo(p.l + 0.5, p.t); c.lineTo(p.l + 0.5, p.b + 0.5); c.lineTo(p.r, p.b + 0.5); c.stroke();
      c.globalAlpha = 1;
      if (k === 0) this.meanMarker(p, X(this.rawMean), C.pal[0]);
      if (k === 2 && t.ok) this.meanMarker(p, X(t.mean), C.pal[2]);
      if (k === 2 && !t.ok) {
        this.text(T.infeasible(t.pos), (p.l + p.r) / 2, (p.t + p.b) / 2, "center", C.ink, fs + 1, "700", true);
      }
    }

    // axe horizontal
    var pl = L.panels[2], xs = narrow ? 2 : 1;
    for (var xv = XMIN; xv <= XMAX; xv += 1) {
      var xx = Math.round(X(xv)) + 0.5;
      c.strokeStyle = C.rule; c.lineWidth = 1;
      c.beginPath(); c.moveTo(xx, pl.b); c.lineTo(xx, pl.b + 4); c.stroke();
      if ((xv - XMIN) % xs === (narrow ? 1 : 0) || !narrow) this.text(fmt(lg, xv, 0), xx, pl.b + fs + 5, "center", C.soft, fs);
    }
    if (this.trunc) {
      var xr = X(this.rc);
      c.fillStyle = C.pal[3];
      c.beginPath(); c.moveTo(xr, pl.b + 1); c.lineTo(xr - 4, pl.b + 8); c.lineTo(xr + 4, pl.b + 8); c.closePath(); c.fill();
    }
    this.text(T.xAxis, (pl.l + pl.r) / 2, pl.b + 2 * fs + 15, "center", C.ink, fs, "700");
    // axe vertical (texte tourné)
    c.save();
    c.translate(11, (L.panels[0].t + L.panels[2].b) / 2);
    c.rotate(-Math.PI / 2);
    this.text(T.yAxis, 0, 0, "center", C.ink, fs, "700");
    c.restore();
  };

  Widget.prototype.drawLegend = function () {
    var c = this.ctx, C = this.C, fs = this.fs, rh = this.L.rowH;
    for (var i = 0; i < this.legend.length; i++) {
      var it = this.legend[i], x = it.x, y = it.row * rh + rh / 2 + 1;
      c.save();
      if (it.k === "truth") {
        c.strokeStyle = C.ink; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x + 1, y); c.lineTo(x + 19, y); c.stroke();
      } else if (it.k === "q" || it.k === "tilt") {
        var col = it.k === "q" ? C.pal[0] : C.pal[2];
        c.fillStyle = hexA(col, 0.35); c.fillRect(x + 2, y - 5, 16, 10);
        c.strokeStyle = col; c.lineWidth = 1.5; c.strokeRect(x + 2.5, y - 4.5, 15, 9);
      } else if (it.k === "qd") {
        c.strokeStyle = C.pal[0]; c.lineWidth = 1.6; c.setLineDash([4, 3]);
        c.beginPath(); c.moveTo(x + 1, y); c.lineTo(x + 19, y); c.stroke();
      } else if (it.k === "proj") {
        c.strokeStyle = C.pal[1]; c.fillStyle = C.pal[1]; c.lineWidth = 3;
        c.beginPath(); c.moveTo(x + 10, y + 6); c.lineTo(x + 10, y - 2); c.stroke();
        c.beginPath(); c.moveTo(x + 5, y - 1); c.lineTo(x + 10, y - 7); c.lineTo(x + 15, y - 1); c.closePath(); c.fill();
      } else if (it.k === "miss") {
        c.beginPath(); c.rect(x + 2, y - 5, 16, 10); c.clip();
        this.hatchRect(x + 2, y - 5, 16, 10);
        c.restore(); c.save();
        c.strokeStyle = C.pal[3]; c.lineWidth = 1; c.strokeRect(x + 2.5, y - 4.5, 15, 9);
      }
      c.restore();
      this.text(it.t, x + 24, y + fs * 0.36, "left", C.ink, fs);
    }
  };

  Widget.prototype.hatchRect = function (x, y, w, h) {
    var c = this.ctx;
    c.strokeStyle = this.C.pal[3]; c.lineWidth = 1.2; c.globalAlpha = 0.9;
    c.beginPath();
    for (var s = -h; s < w + h; s += 6) { c.moveTo(x + s, y + h); c.lineTo(x + s + h, y); }
    c.stroke();
    c.globalAlpha = 1;
  };
  Widget.prototype.hatch = function (p, xr) {
    if (xr >= p.r) return;
    var x = Math.max(p.l, xr);
    var c = this.ctx;
    c.fillStyle = hexA(this.C.pal[3], this.C.dark ? 0.1 : 0.08);
    c.fillRect(x, p.t, p.r - x, p.b - p.t);
    c.save();
    c.beginPath(); c.rect(x, p.t, p.r - x, p.b - p.t); c.clip();
    c.globalAlpha = 0.55;
    this.hatchRect(x - (x - p.l) % 6, p.t, p.r - x + 12, p.b - p.t);
    c.restore();
    c.strokeStyle = this.C.pal[3]; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(Math.round(x) + 0.5, p.t); c.lineTo(Math.round(x) + 0.5, p.b); c.stroke();
  };

  Widget.prototype.histPath = function (h, X, Y, p) {
    var c = this.ctx;
    c.beginPath();
    c.moveTo(X(XMIN), p.b);
    for (var k = 0; k < NBIN; k++) {
      var y = Y(h[k]);
      c.lineTo(X(XMIN + k * DX), y); c.lineTo(X(XMIN + (k + 1) * DX), y);
    }
    c.lineTo(X(XMAX), p.b);
  };
  Widget.prototype.drawHist = function (h, X, Y, p, col, fill, dashed, ymaxClip) {
    var c = this.ctx;
    this.histPath(h, X, Y, p);
    if (fill) { c.fillStyle = hexA(col, this.C.dark ? 0.4 : 0.32); c.fill(); }
    c.strokeStyle = col; c.lineWidth = dashed ? 1.4 : 1.6;
    if (dashed) c.setLineDash([4, 3]);
    c.stroke();
    c.setLineDash([]);
    // cases tronquées par l'échelle : chevron
    for (var k = 0; k < NBIN; k++) {
      if (h[k] > ymaxClip && !dashed) {
        var xm = X(XMIN + (k + 0.5) * DX);
        c.fillStyle = col;
        c.beginPath(); c.moveTo(xm - 5, p.t + 9); c.lineTo(xm, p.t + 2); c.lineTo(xm + 5, p.t + 9); c.closePath(); c.fill();
      }
    }
  };
  Widget.prototype.truthCurve = function (p, X, Y) {
    var c = this.ctx;
    c.strokeStyle = this.C.ink; c.lineWidth = 2;
    c.beginPath();
    for (var px = p.l; px <= p.r; px += 1.5) {
      var v = XMIN + (px - p.l) / (p.r - p.l) * (XMAX - XMIN);
      var y = Y(density(v));
      if (px === p.l) c.moveTo(px, y); else c.lineTo(px, y);
    }
    c.stroke();
  };
  Widget.prototype.meanMarker = function (p, x, col) {
    var c = this.ctx;
    c.fillStyle = col; c.strokeStyle = this.C.bg; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x, p.b - 9); c.lineTo(x - 6, p.b + 1); c.lineTo(x + 6, p.b + 1); c.closePath();
    c.fill(); c.stroke();
  };

  Widget.prototype.drawPanelA = function (p, X, Y) {
    var c = this.ctx, C = this.C;
    if (this.trunc) {                     // masse de μ au-delà de r_c
      var xr = Math.max(p.l, X(this.rc));
      c.beginPath(); c.moveTo(xr, p.b);
      for (var px = xr; px <= p.r; px += 1.5) {
        var v = XMIN + (px - p.l) / (p.r - p.l) * (XMAX - XMIN);
        c.lineTo(px, Y(density(v)));
      }
      c.lineTo(p.r, p.b); c.closePath();
      c.fillStyle = hexA(C.pal[3], C.dark ? 0.55 : 0.5); c.fill();
    }
    this.drawHist(this.hRaw, X, Y, p, C.pal[0], true, false, this.ymaxNow);
    if (this.trunc && X(this.rc) < p.r - 30) {
      var lab = this.T.miss(pct(this.lang, this.missMass));
      var lx = Math.max(p.l, X(this.rc)) + 5;
      var w = this.textWidth(lab, this.fs, "700");
      if (lx + w > p.r - 3) lx = p.r - 3 - w;
      this.text(lab, lx, p.t + this.fs + 3, "left", C.ink, this.fs, "700", true);
    }
  };
  Widget.prototype.drawPanelB = function (p, X, Y) {
    var c = this.ctx, C = this.C, fs = this.fs;
    this.drawHist(this.hRaw, X, Y, p, C.pal[0], false, true, Infinity);
    var x0 = X(0), col = C.pal[1];
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4;
    c.beginPath(); c.moveTo(x0, p.b); c.lineTo(x0, p.t + 10); c.stroke();
    c.beginPath(); c.moveTo(x0 - 7, p.t + 12); c.lineTo(x0, p.t + 1); c.lineTo(x0 + 7, p.t + 12); c.closePath(); c.fill();
    var lab = (p.r - x0) > this.textWidth(this.T.dirac, fs, "700") + 20 ? this.T.dirac : this.T.diracS;
    this.text(lab, x0 + 11, p.t + fs + 4, "left", C.ink, fs, "700", true);
  };
  Widget.prototype.drawPanelC = function (p, X, Y) {
    var C = this.C;
    this.drawHist(this.hRaw, X, Y, p, C.pal[0], false, true, Infinity);
    if (this.tilt.ok) this.drawHist(this.hTilt, X, Y, p, C.pal[2], true, false, this.ymaxNow);
  };

  /* ---------- initialisation et thème ---------- */
  var instances = [];
  function refreshAll() {
    instances.forEach(function (w) { w.readTheme(); w.resize(true); });
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
