"""Données jouets de la figure « flow-matching » (1D, chemin linéaire, couplage indépendant).

Loi de base  : N(0, 1).
Loi lambda_2 : 1/2 N(+m, s^2) + 1/2 N(-m, s^2), m = 1.5, s = 0.35 (aussi la loi du panneau a).
Loi lambda_1 : N(0, s1^2), s1 = 0.45.
Pour une loi cible mélange de gaussiennes et x_t = (1-t) x0 + t x1 avec x0, x1 indépendants,
le champ marginal v*(x, t) = E[x1 - x0 | x_t = x] est exact (formules gaussiennes conditionnelles).
Sortie : flow-matching.json (même dossier).
"""
import json, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
M, S = 1.5, 0.35
S1 = 0.45
LAW2 = [(0.5, +M, S), (0.5, -M, S)]
LAW1 = [(1.0, 0.0, S1)]


def npdf(x, m, s):
    return np.exp(-0.5 * ((x - m) / s) ** 2) / (s * np.sqrt(2 * np.pi))


def mix_pdf(x, law):
    return sum(w * npdf(x, m, s) for w, m, s in law)


def pt(x, t, law):
    """densité marginale p_t(x)"""
    return sum(w * npdf(x, t * m, np.sqrt((1 - t) ** 2 + t ** 2 * s ** 2)) for w, m, s in law)


def vstar(x, t, law):
    x = np.asarray(x, float)
    num = np.zeros_like(x); den = np.zeros_like(x)
    for w, m, s in law:
        var = (1 - t) ** 2 + t ** 2 * s ** 2
        wk = w * npdf(x, t * m, np.sqrt(var))
        vk = m + (t * s ** 2 - (1 - t)) / var * (x - t * m)
        num += wk * vk; den += wk
    return num / den


def rk4(x0, law, n=400):
    ts = np.linspace(0, 1, n + 1); xs = [x0]; x = x0; h = 1 / n
    for i in range(n):
        t = ts[i]
        k1 = vstar(x, t, law); k2 = vstar(x + h / 2 * k1, t + h / 2, law)
        k3 = vstar(x + h / 2 * k2, t + h / 2, law); k4 = vstar(x + h * k3, t + h, law)
        x = x + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4); xs.append(x)
    return ts, np.array(xs)


def heun(x0, law, N):
    h = 1 / N; out = [dict(t=0.0, x=float(x0))]; x = x0
    for n in range(N):
        t = n * h
        k1 = float(vstar(x, t, law)); xp = x + h * k1
        k2 = float(vstar(xp, t + h, law)); xn = x + h * (k1 + k2) / 2
        out[-1].update(k1=k1, xp=xp, k2=k2)
        x = xn; out.append(dict(t=t + h, x=float(x)))
    return out


def posterior_x1(x, t, law, qs):
    """quantiles du posterior p(x1 | x_t = x) (mélange de gaussiennes)"""
    comps = []
    for w, m, s in law:
        # x | x1 ~ N(t x1, (1-t)^2) ; x1 ~ N(m, s^2)
        var = (1 - t) ** 2 + t ** 2 * s ** 2
        wk = w * npdf(x, t * m, np.sqrt(var))
        pv = 1 / (1 / s ** 2 + t ** 2 / (1 - t) ** 2)
        pm = pv * (m / s ** 2 + t * x / (1 - t) ** 2)
        comps.append((wk, pm, np.sqrt(pv)))
    Z = sum(c[0] for c in comps); comps = [(c[0] / Z, c[1], c[2]) for c in comps]
    grid = np.linspace(-4, 4, 20001)
    cdf = np.cumsum(sum(w * npdf(grid, m, s) for w, m, s in comps)); cdf /= cdf[-1]
    return [float(np.interp(q, cdf, grid)) for q in qs], comps


rng = np.random.default_rng(7)
out = {"params": dict(m=M, s=S, s1=S1)}

# ---- densités de bord
xg = np.linspace(-3.3, 3.3, 331)
out["grid"] = xg.round(4).tolist()
out["pdf_noise"] = npdf(xg, 0, 1).round(5).tolist()
out["pdf_law2"] = mix_pdf(xg, LAW2).round(5).tolist()
out["pdf_law1"] = mix_pdf(xg, LAW1).round(5).tolist()

# ---- panneau a : paires indépendantes (x0, x1)
npairs = 34
x0 = rng.standard_normal(4 * npairs)
x0 = x0[np.abs(x0) < 2.7][:npairs]
comp = np.arange(npairs) % 2          # échantillon équilibré : 17 + 17 (loi symétrique)
x1 = np.where(comp == 0, M, -M) + S * rng.standard_normal(npairs)
out["pairs"] = [[round(float(a), 4), round(float(b), 4)] for a, b in zip(x0, x1)]

# ---- panneau a : grille du champ marginal
tcols = np.linspace(0.07, 0.93, 9)
xrows = np.linspace(-2.75, 2.75, 12)
field = []
pmax = 0
for t in tcols:
    for x in xrows:
        p = float(pt(x, t, LAW2)); pmax = max(pmax, p)
        field.append(dict(t=round(float(t), 4), x=round(float(x), 4), v=round(float(vstar(x, t, LAW2)), 4), p=p))
for f in field:
    f["p"] = round(f["p"] / pmax, 4)
out["field"] = field

# ---- panneau a : éventail de chemins conditionnels par un point (t*, x*)
TS, XS = 0.40, 0.30
qs = [(i + 0.5) / 7 for i in range(7)]
x1s, comps = posterior_x1(XS, TS, LAW2, qs)
fan = [[round((XS - TS * b) / (1 - TS), 4), round(b, 4)] for b in x1s]
out["fan"] = dict(t=TS, x=XS, v=round(float(vstar(XS, TS, LAW2)), 4), pairs=fan,
                  weights=[round(c[0], 3) for c in comps])

# ---- panneau b : mêmes bruits, deux lois
nb = 10
from statistics import NormalDist
q0 = [NormalDist().inv_cdf((i + 0.5) / nb) for i in range(nb)]
trajs = {"lam1": [], "lam2": []}
for key, law in (("lam1", LAW1), ("lam2", LAW2)):
    for a in q0:
        ts, xs = rk4(a, law, 400)
        trajs[key].append([[round(float(t), 4), round(float(x), 4)] for t, x in zip(ts[::8], xs[::8])])
out["traj"] = trajs
out["x0b"] = [round(a, 4) for a in q0]

# ---- panneau c : Heun sur une trajectoire lambda_2
xc = q0[5]
ts, xs = rk4(xc, LAW2, 800)
out["heun"] = dict(x0=round(xc, 4), exact=[[round(float(t), 4), round(float(x), 4)] for t, x in zip(ts[::10], xs[::10])],
                   steps4=heun(xc, LAW2, 4), steps3=heun(xc, LAW2, 3))

# ---- vignettes 2D (nuages) : bruit isotrope N(0, I_2), données ± (m_h, m) avec la même coordonnée verticale que les tracés
r2 = np.random.default_rng(11)
c0 = r2.standard_normal((400, 2)); c0 = c0[np.hypot(c0[:, 0], c0[:, 1]) < 2.35][:130]
MH = 0.85
n2 = 70
cp = np.array([MH, M]) + S * r2.standard_normal((n2, 2))
cm = np.array([-MH, -M]) + S * r2.standard_normal((n2, 2))
out["cloud0"] = c0.round(3).tolist()
out["cloud1"] = np.vstack([cp, cm]).round(3).tolist()
out["cloud_mh"] = MH

with open(os.path.join(HERE, "flow-matching.json"), "w") as f:
    json.dump(out, f)

# résumé console
print("fan v* =", out["fan"]["v"], "weights", out["fan"]["weights"], "pairs", fan)
print("slopes", [round(b - a, 2) for a, b in fan], "mean", np.mean([b - a for a, b in fan]))
print("x0b", [round(a, 3) for a in q0])
print("ends lam1", [t[-1][1] for t in trajs["lam1"]])
print("ends lam2", [t[-1][1] for t in trajs["lam2"]])
print("heun x0", xc, "exact end", xs[-1])
for s in out["heun"]["steps4"]: print(s)
for s in out["heun"]["steps3"]: print(s)
