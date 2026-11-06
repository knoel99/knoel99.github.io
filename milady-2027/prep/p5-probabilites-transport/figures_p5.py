"""Figures statiques du module p5 (probabilités, statistiques, transport optimal).

Usage : python figures_p5.py <dossier_fr> <dossier_en>
Produit fig-*.png (libellés français) dans <dossier_fr> et les mêmes noms (libellés anglais) dans <dossier_en>.
"""
import sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.stats import norm

C1, C2, C3 = "#2a78d6", "#eb6834", "#1baf7a"     # bleu, orange, aqua (palette catégorielle validée)
INK, INK2, GRID = "#0b0b0b", "#52514e", "#d9d8d4"
plt.rcParams.update({
    "font.size": 11, "axes.edgecolor": INK2, "axes.labelcolor": INK, "xtick.color": INK2,
    "ytick.color": INK2, "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6,
    "axes.spines.top": False, "axes.spines.right": False, "legend.frameon": False,
    "figure.dpi": 150, "savefig.bbox": "tight", "lines.linewidth": 2,
})

T = {
 "fr": dict(
   pf_a="Loi de X ~ N(0, 1)", pf_b="Loi de Y = sinh(X)", pf_band="8 tranches de probabilité 1/8",
   pf_hist="10⁶ tirages", pf_form="jacobien",
   mc_a="Estimation de E[cos X] et IC à 95 %", mc_b="Erreur quadratique moyenne (200 répétitions)",
   mc_N="nombre de tirages N", mc_est="estimation", mc_ex="valeur exacte e^(−1/2)", mc_err="erreur RMS", mc_slope="pente −1/2",
   ti_a="Loi de base q et lois inclinées p_λ", ti_b="Taille d'échantillon effective", ti_q="q (base)",
   ti_c="E[X] = {c}", ti_c_lab="valeur imposée c = E[X]", ti_ess="ESS / N", ti_emp="estimée (N = 20 000)", ti_th="limite N → ∞",
   w_a="Fonctions de répartition : aire = W₁", w_b="Couplage monotone (appariement des quantiles)",
   w_F="F (loi μ)", w_G="G (loi ν)", w_area="|F − G|", w_mu="échantillon de μ", w_nu="échantillon de ν",
   ou_a="Trajectoires d'Ornstein–Uhlenbeck (Euler–Maruyama)", ou_b="Histogrammes et solutions de Fokker–Planck",
   ou_t="temps t", ou_band="moyenne ± 2 écarts-types (exact)", ou_h1="t = 0,25", ou_h2="t = 4", ou_pinf="p∞ = N(0, σ²/2θ)", ou_pt="p(·, 0,25) exacte",
   fl_a="Chemins conditionnels x_t = (1 − t)x₀ + t x₁", fl_b="Flot marginal dx/dt = v(x, t)", fl_t="temps du flot t",
   dens="densité", x="x", y="y",
 ),
 "en": dict(
   pf_a="Law of X ~ N(0, 1)", pf_b="Law of Y = sinh(X)", pf_band="8 slices of probability 1/8",
   pf_hist="10⁶ draws", pf_form="Jacobian",
   mc_a="Estimate of E[cos X] and 95% CI", mc_b="Root-mean-square error (200 repetitions)",
   mc_N="number of draws N", mc_est="estimate", mc_ex="exact value e^(−1/2)", mc_err="RMS error", mc_slope="slope −1/2",
   ti_a="Base law q and tilted laws p_λ", ti_b="Effective sample size", ti_q="q (base)",
   ti_c="E[X] = {c}", ti_c_lab="imposed value c = E[X]", ti_ess="ESS / N", ti_emp="estimated (N = 20,000)", ti_th="limit N → ∞",
   w_a="Cumulative distribution functions: area = W₁", w_b="Monotone coupling (matching quantiles)",
   w_F="F (law μ)", w_G="G (law ν)", w_area="|F − G|", w_mu="sample of μ", w_nu="sample of ν",
   ou_a="Ornstein–Uhlenbeck paths (Euler–Maruyama)", ou_b="Histograms and Fokker–Planck solutions",
   ou_t="time t", ou_band="mean ± 2 standard deviations (exact)", ou_h1="t = 0.25", ou_h2="t = 4", ou_pinf="p∞ = N(0, σ²/2θ)", ou_pt="exact p(·, 0.25)",
   fl_a="Conditional paths x_t = (1 − t)x₀ + t x₁", fl_b="Marginal flow dx/dt = v(x, t)", fl_t="flow time t",
   dens="density", x="x", y="y",
 ),
}


def fig_pushforward(L, out):
    rng = np.random.default_rng(1)
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
    x = np.linspace(-3.2, 3.2, 600)
    q = norm.ppf(np.linspace(0, 1, 9)); q[0], q[-1] = -3.2, 3.2
    for i in range(8):
        col = C1 if i % 2 == 0 else C3
        xs = np.linspace(q[i], q[i + 1], 100)
        ax[0].fill_between(xs, norm.pdf(xs), color=col, alpha=0.35, lw=0)
        ys = np.sinh(xs)
        ax[1].fill_between(ys, norm.pdf(np.arcsinh(ys)) / np.sqrt(1 + ys ** 2), color=col, alpha=0.35, lw=0)
    ax[0].plot(x, norm.pdf(x), color=C1)
    ax[0].set_title(L["pf_a"] + " : " + L["pf_band"] if L is T["fr"] else L["pf_a"] + ": " + L["pf_band"], fontsize=11); ax[0].set_xlabel(L["x"]); ax[0].set_ylabel(L["dens"])
    Y = np.sinh(rng.standard_normal(1_000_000))
    ax[1].hist(Y, bins=120, range=(-6, 6), density=True, histtype="step", color=INK2, lw=1, label=L["pf_hist"])
    y = np.linspace(-6, 6, 800)
    ax[1].plot(y, norm.pdf(np.arcsinh(y)) / np.sqrt(1 + y ** 2), color=C2, label=L["pf_form"])
    ax[1].set_xlim(-6, 6); ax[1].set_title(L["pf_b"], fontsize=11); ax[1].set_xlabel(L["y"])
    ax[1].legend(fontsize=9, loc="upper left")
    fig.savefig(out / "fig-mesure-image.png"); plt.close(fig)


def fig_montecarlo(L, out):
    rng = np.random.default_rng(2)
    I = np.exp(-0.5)
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
    Nmax = 100_000
    f = np.cos(rng.standard_normal(Nmax))
    n = np.arange(1, Nmax + 1)
    m = np.cumsum(f) / n
    s = np.sqrt(np.maximum(np.cumsum(f ** 2) / n - m ** 2, 0))
    k = n >= 10
    ax[0].fill_between(n[k], (m - 1.96 * s / np.sqrt(n))[k], (m + 1.96 * s / np.sqrt(n))[k], color=C1, alpha=0.2, lw=0)
    ax[0].plot(n[k], m[k], color=C1, lw=1.5, label=L["mc_est"])
    ax[0].axhline(I, color=C2, lw=1.5, ls="--", label=L["mc_ex"])
    ax[0].set_xscale("log"); ax[0].set_ylim(0.45, 0.8); ax[0].set_xlabel(L["mc_N"])
    ax[0].set_title(L["mc_a"], fontsize=11); ax[0].legend(fontsize=9)
    Ns = np.unique(np.logspace(1, 5, 13).astype(int))
    rms = [np.sqrt(np.mean((np.cos(rng.standard_normal((200, N))).mean(1) - I) ** 2)) for N in Ns]
    ax[1].loglog(Ns, rms, "o", color=C1, ms=6, label=L["mc_err"])
    sd = np.sqrt((1 + np.exp(-2)) / 2 - np.exp(-1))       # écart-type de cos X
    ax[1].loglog(Ns, sd / np.sqrt(Ns), color=C2, lw=1.5, label=L["mc_slope"] + "  (σ/√N)")
    ax[1].set_xlabel(L["mc_N"]); ax[1].set_title(L["mc_b"], fontsize=11); ax[1].legend(fontsize=9)
    fig.savefig(out / "fig-monte-carlo.png"); plt.close(fig)


def tilted_mixture(lam, ms=np.array([-2.0, 2.0]), s=0.5):
    logp = lam * ms + lam ** 2 * s ** 2 / 2
    p = np.exp(logp - logp.max()); p /= p.sum()
    return p, ms + lam * s ** 2


def fig_tilt(L, out):
    from scipy.optimize import brentq
    s = 0.5
    x = np.linspace(-4, 5, 800)
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
    q = 0.5 * norm.pdf(x, -2, s) + 0.5 * norm.pdf(x, 2, s)
    ax[0].plot(x, q, color=INK2, lw=1.5, label=L["ti_q"])
    for c, col in zip([0.5, 1.5, 2.5], [C1, C3, C2]):
        lam = brentq(lambda l: tilted_mixture(l)[0] @ tilted_mixture(l)[1] - c, -50, 50)
        p, mu = tilted_mixture(lam)
        ax[0].plot(x, p[0] * norm.pdf(x, mu[0], s) + p[1] * norm.pdf(x, mu[1], s), color=col,
                   label=L["ti_c"].format(c=str(c).replace(".", ",") if L is T["fr"] else c) + f"  (λ = {lam:.2f})".replace(".", "," if L is T["fr"] else "."))
    ax[0].set_title(L["ti_a"], fontsize=11); ax[0].set_xlabel(L["x"]); ax[0].legend(fontsize=8.5, loc="upper left")
    rng = np.random.default_rng(3)
    N = 20_000
    xs = np.where(rng.random(N) < 0.5, -2.0, 2.0) + s * rng.standard_normal(N)
    cs = np.linspace(0, 3.5, 36)
    ess_emp, ess_th = [], []
    for c in cs:
        lam = brentq(lambda l: tilted_mixture(l)[0] @ tilted_mixture(l)[1] - c, -50, 50)
        a = lam * xs; w = np.exp(a - a.max())
        ess_emp.append(w.sum() ** 2 / (w ** 2).sum() / N)
        # limite : (E_q e^{λX})² / E_q e^{2λX}, calculée en log pour la stabilité
        lm = lambda l: np.log(0.5 * np.exp(l * -2.0 + l ** 2 * s ** 2 / 2) + 0.5 * np.exp(l * 2.0 + l ** 2 * s ** 2 / 2))
        ess_th.append(np.exp(2 * lm(lam) - lm(2 * lam)))
    ax[1].semilogy(cs, ess_th, color=C2, lw=1.5, label=L["ti_th"])
    ax[1].semilogy(cs, ess_emp, "o", color=C1, ms=5, label=L["ti_emp"])
    ax[1].set_xlabel(L["ti_c_lab"]); ax[1].set_ylabel(L["ti_ess"]); ax[1].set_title(L["ti_b"], fontsize=11)
    ax[1].legend(fontsize=9, loc="lower left")
    fig.savefig(out / "fig-inclinaison.png"); plt.close(fig)


def fig_wasserstein(L, out):
    rng = np.random.default_rng(4)
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
    x = np.linspace(-4, 7, 800)
    F, G = norm.cdf(x), norm.cdf(x, 1, 2)
    ax[0].fill_between(x, F, G, color=C3, alpha=0.3, lw=0, label=L["w_area"])
    ax[0].plot(x, F, color=C1, label=L["w_F"]); ax[0].plot(x, G, color=C2, label=L["w_G"])
    ax[0].set_title(L["w_a"], fontsize=11); ax[0].set_xlabel(L["x"]); ax[0].legend(fontsize=9, loc="upper left")
    a = np.sort(rng.standard_normal(12)); b = np.sort(1 + 2 * rng.standard_normal(12))
    for ai, bi in zip(a, b):
        ax[1].plot([ai, bi], [1, 0], color=INK2, lw=1)
    ax[1].plot(a, np.ones_like(a), "o", color=C1, ms=8, label=L["w_mu"])
    ax[1].plot(b, np.zeros_like(b), "o", color=C2, ms=8, label=L["w_nu"])
    ax[1].set_yticks([]); ax[1].set_ylim(-0.3, 1.45); ax[1].set_xlabel(L["x"]); ax[1].grid(axis="y", visible=False)
    ax[1].set_title(L["w_b"], fontsize=11); ax[1].legend(fontsize=9, loc="upper left", ncol=2)
    fig.savefig(out / "fig-wasserstein-1d.png"); plt.close(fig)


def fig_ou(L, out):
    rng = np.random.default_rng(6)
    theta, sigma, x0 = 2.0, 1.0, 1.5
    dt, Tf = 2e-3, 4.0
    nT = int(Tf / dt); t = np.linspace(0, Tf, nT + 1)
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
    m = x0 * np.exp(-theta * t); v = sigma ** 2 / (2 * theta) * (1 - np.exp(-2 * theta * t))
    ax[0].fill_between(t, m - 2 * np.sqrt(v), m + 2 * np.sqrt(v), color=C1, alpha=0.18, lw=0, label=L["ou_band"])
    X = np.full(20, x0); P = [X.copy()]
    for _ in range(nT):
        X = X - theta * X * dt + sigma * np.sqrt(dt) * rng.standard_normal(20); P.append(X.copy())
    P = np.array(P)
    ax[0].plot(t, P[:, :8], color=INK2, lw=0.7)
    ax[0].plot(t, m, color=C1, lw=2)
    ax[0].set_xlabel(L["ou_t"]); ax[0].set_ylabel("X_t"); ax[0].set_title(L["ou_a"], fontsize=11)
    ax[0].legend(fontsize=9, loc="upper right")
    N = 100_000
    X = np.full(N, x0); snaps = {}
    for n in range(1, nT + 1):
        X = X - theta * X * dt + sigma * np.sqrt(dt) * rng.standard_normal(N)
        if n in (int(0.25 / dt), nT):
            snaps[n] = X.copy()
    xx = np.linspace(-2, 2.5, 500)
    vinf = sigma ** 2 / (2 * theta)
    m1, v1 = x0 * np.exp(-theta * 0.25), vinf * (1 - np.exp(-2 * theta * 0.25))
    ax[1].hist(snaps[int(0.25 / dt)], bins=70, range=(-2, 2.5), density=True, color=C3, alpha=0.45, label=L["ou_h1"])
    ax[1].hist(snaps[nT], bins=70, range=(-2, 2.5), density=True, color=C1, alpha=0.35, label=L["ou_h2"])
    ax[1].plot(xx, norm.pdf(xx, m1, np.sqrt(v1)), color=C3, lw=1.8, ls="--", label=L["ou_pt"])
    ax[1].plot(xx, norm.pdf(xx, 0, np.sqrt(vinf)), color=C2, lw=1.8, label=L["ou_pinf"])
    ax[1].set_xlabel(L["x"]); ax[1].set_title(L["ou_b"], fontsize=11); ax[1].legend(fontsize=8.5, loc="upper left")
    fig.savefig(out / "fig-ornstein-uhlenbeck.png"); plt.close(fig)


def fig_flow(L, out):
    rng = np.random.default_rng(7)
    pis, ms, ss = np.array([0.5, 0.5]), np.array([-2.0, 2.0]), np.array([0.4, 0.4])
    g = lambda x, m, v: np.exp(-(x - m) ** 2 / (2 * v)) / np.sqrt(2 * np.pi * v)
    def p_t(x, t):
        x = np.asarray(x)[..., None]
        return np.sum(pis * g(x, t * ms, (1 - t) ** 2 + t ** 2 * ss ** 2), -1)
    def vel(x, t):
        x = np.asarray(x)[..., None]
        var = (1 - t) ** 2 + t ** 2 * ss ** 2; cov = t * ss ** 2 - (1 - t)
        post = pis * g(x, t * ms, var)
        return np.sum(post * (ms + cov / var * (x - t * ms)), -1) / np.sum(post, -1)
    ts = np.linspace(0, 1, 201); xs = np.linspace(-4, 4, 300)
    D = np.array([p_t(xs, t) for t in ts]).T
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.8), sharey=True)
    for a in ax:
        a.imshow(np.sqrt(D), origin="lower", aspect="auto", extent=[0, 1, -4, 4], cmap="Blues", vmin=0, vmax=np.sqrt(D).max() * 1.15)
        a.grid(False)
    n = 24
    x0 = rng.standard_normal(n)
    x1 = np.where(rng.random(n) < 0.5, -2.0, 2.0) + 0.4 * rng.standard_normal(n)
    for a0, a1 in zip(x0, x1):
        ax[0].plot([0, 1], [a0, a1], color=C2, lw=1, alpha=0.9)
    z = np.sort(x0); path = [z.copy()]; tau = ts[1] - ts[0]
    for t in ts[:-1]:
        k1 = vel(z, t); k2 = vel(z + tau / 2 * k1, t + tau / 2); k3 = vel(z + tau / 2 * k2, t + tau / 2); k4 = vel(z + tau * k3, t + tau)
        z = z + tau / 6 * (k1 + 2 * k2 + 2 * k3 + k4); path.append(z.copy())
    ax[1].plot(ts, np.array(path), color=C2, lw=1)
    ax[0].set_title(L["fl_a"], fontsize=11); ax[1].set_title(L["fl_b"], fontsize=11)
    for a in ax:
        a.set_xlabel(L["fl_t"])
    ax[0].set_ylabel(L["x"])
    fig.savefig(out / "fig-flot-continuite.png"); plt.close(fig)


if __name__ == "__main__":
    for lang, d in (("fr", sys.argv[1]), ("en", sys.argv[2])):
        out = Path(d); out.mkdir(parents=True, exist_ok=True)
        L = T[lang]
        for f in (fig_pushforward, fig_montecarlo, fig_tilt, fig_wasserstein, fig_ou, fig_flow):
            f(L, out)
        print(lang, "->", out)
