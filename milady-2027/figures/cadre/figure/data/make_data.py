"""Données calculées de la figure « cadre » (toutes illustratives, modèles jouets).

Lancer : python figure/data/make_data.py  (depuis figures/cadre/) -> figure/data/cadre.json
Contenu :
  flow     : trajectoires du flot marginal de flow matching 1D (chemin linéaire, couplage indépendant),
             base N(0,1) -> mélange symétrique 0.5 N(-m, s^2) + 0.5 N(m, s^2) ; v* exact (posterior gaussien).
  pot      : potentiels 2D périodiques psi, a (somme de Fourier, |k| <= 4, amplitude ~ k^-2) ;
             isolignes orientées selon u = grad^perp psi = (d_y psi, -d_x psi), B = grad^perp a.
  vks      : fonction de courant de Stokes à deux cellules (u_r = -1/r d_z psi, u_z = 1/r d_r psi) ;
             lignes de champ d'un solénoïde fini (dipôle axial), Biot-Savart par spires (intégrales elliptiques).
  law      : échantillons de dissipation eps ~ Gamma(k, theta) (q_theta brut, moyenne 1.15 E[P]),
             inclinaison exponentielle exacte vers la moyenne E[P] = 1 ; P - eps : loi large de moyenne 0.
  uses     : modes (modèles réduits), ensemble + observations (assimilation), densité de D (Rice).
"""
import json, os
import numpy as np
from scipy.special import ellipk, ellipe
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
out = {}

# ---------------------------------------------------------------- 1. flot latent 1D
m, s = 1.55, 0.30
mus = np.array([-m, m]); pis = np.array([0.5, 0.5])

def vstar(x, t):
    var = t**2 * s**2 + (1 - t)**2
    logw = np.log(pis)[None, :] - 0.5 * (x[:, None] - t * mus[None, :])**2 / var
    w = np.exp(logw - logw.max(1, keepdims=True)); w /= w.sum(1, keepdims=True)
    ex1 = mus[None, :] + (t * s**2 / var) * (x[:, None] - t * mus[None, :])
    e = (w * ex1).sum(1)
    return (e - x) / (1 - t)

from scipy.stats import norm
n = 22
q = (np.arange(n) + 0.5) / n
x = norm.ppf(q)
ts = np.linspace(0, 1, 401)
traj = [x.copy()]
for i in range(len(ts) - 1):
    t0, t1 = ts[i], ts[i + 1]
    h = t1 - t0
    if t1 >= 1:   # last step: jump to the posterior mean (the ODE limit)
        tt = t0
        var = tt**2 * s**2 + (1 - tt)**2
        logw = np.log(pis)[None, :] - 0.5 * (x[:, None] - tt * mus[None, :])**2 / var
        w = np.exp(logw - logw.max(1, keepdims=True)); w /= w.sum(1, keepdims=True)
        x = x + h * vstar(x, tt)
    else:
        k1 = vstar(x, t0); k2 = vstar(x + h / 2 * k1, t0 + h / 2)
        k3 = vstar(x + h / 2 * k2, t0 + h / 2); k4 = vstar(x + h * k3, t1)
        x = x + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
    traj.append(x.copy())
traj_indep = np.array(traj)
# Couplage optimal (OT) : en 1D la carte monotone x1 = F1^-1(Phi(x0)) donne des trajectoires droites
from scipy.optimize import brentq
F1 = lambda y: 0.5 * norm.cdf(y, -m, s) + 0.5 * norm.cdf(y, m, s)
x0 = norm.ppf(q)
x1 = np.array([brentq(lambda y: F1(y) - qq, -6, 6) for qq in q])
traj = (1 - ts[:, None]) * x0[None, :] + ts[:, None] * x1[None, :]
print('flow: max deviation of the independent-coupling paths', np.abs(traj_indep - ((1 - ts[:, None]) * traj_indep[0] + ts[:, None] * traj_indep[-1])).max().round(2))
sel = np.linspace(0, len(ts) - 1, 41).astype(int)
zz = np.linspace(-3.2, 3.2, 161)
p0 = norm.pdf(zz)
p1 = 0.5 * norm.pdf(zz, -m, s) + 0.5 * norm.pdf(zz, m, s)
# straightness: max deviation from the chord, per trajectory
chord = traj[0][None, :] + ts[:, None] * (traj[-1] - traj[0])[None, :]
dev = np.abs(traj - chord).max(0)
# background velocity field samples (t, z) -> v*
grid_t = np.linspace(0.08, 0.92, 7); grid_z = np.linspace(-2.6, 2.6, 9)
vf = [[float(t), float(z), float(vstar(np.array([z]), t)[0])] for t in grid_t for z in grid_z]
out['flow'] = {
    't': ts[sel].tolist(), 'traj': traj[sel].T.tolist(), 'z': zz.tolist(), 'p0': p0.tolist(), 'p1': p1.tolist(),
    'm': m, 's': s, 'dev': dev.tolist(), 'vf': vf,
}
print('flow: max deviation from straight line', dev.max(), 'final', traj[-1].round(2))

# ---------------------------------------------------------------- 2. potentiels 2D
N = 64
g = np.linspace(0, 2 * np.pi, N, endpoint=False)
X, Y = np.meshgrid(g, g, indexing='xy')

def field(seed, kmax=3, slope=2.0):
    r = np.random.default_rng(seed)
    f = np.zeros_like(X)
    for kx in range(-kmax, kmax + 1):
        for ky in range(0, kmax + 1):
            if (ky == 0 and kx <= 0): continue
            k = np.hypot(kx, ky)
            if k > kmax + 0.5: continue
            amp = k**(-slope) * r.normal()
            ph = r.uniform(0, 2 * np.pi)
            f += amp * np.cos(kx * X + ky * Y + ph)
    return f / np.abs(f).max()

def contours(f, levels):
    fig, ax = plt.subplots()
    # periodic padding so contours run to the edge
    fp = np.pad(f, ((0, 1), (0, 1)), mode='wrap')
    gp = np.linspace(0, 1, N + 1)
    cs = ax.contour(gp, gp, fp, levels=levels)
    segs = []
    for lev, ss in zip(cs.levels, cs.allsegs):
        for sgm in ss:
            if len(sgm) < 6: continue
            segs.append({'lev': float(lev), 'pts': np.round(sgm, 4).tolist()})
    plt.close(fig)
    return segs

def grad_perp(f):
    dx = 2 * np.pi / N
    fy = (np.roll(f, -1, 0) - np.roll(f, 1, 0)) / (2 * dx)   # axis 0 is y
    fx = (np.roll(f, -1, 1) - np.roll(f, 1, 1)) / (2 * dx)
    return fy, -fx    # (u_x, u_y) = (d_y f, -d_x f)

def orient(segs, f):
    ux, uy = grad_perp(f)
    for sg in segs:
        p = np.array(sg['pts'])
        i = len(p) // 2
        tvec = p[min(i + 1, len(p) - 1)] - p[max(i - 1, 0)]
        ix = int(np.clip(round(p[i, 0] * N), 0, N - 1)) % N; iy = int(np.clip(round(p[i, 1] * N), 0, N - 1)) % N
        if tvec[0] * ux[iy, ix] + tvec[1] * uy[iy, ix] < 0:
            sg['pts'] = p[::-1].tolist()
    return segs

psi = field(11, kmax=3, slope=1.6)
a = field(23, kmax=4, slope=1.3)
lev_psi = np.linspace(-0.9, 0.9, 10)
lev_a = np.linspace(-0.9, 0.9, 10)
# check divergence of the discrete grad-perp (exactly zero for centred differences)
ux, uy = grad_perp(psi)
dx = 2 * np.pi / N
div = (np.roll(ux, -1, 1) - np.roll(ux, 1, 1)) / (2 * dx) + (np.roll(uy, -1, 0) - np.roll(uy, 1, 0)) / (2 * dx)
print('pot: max |div u| (centred differences) =', np.abs(div).max())
step = 2
out['pot'] = {
    'n': N // step,
    'psi': ((psi[::step, ::step] + 1) / 2).round(3).tolist(), 'a': ((a[::step, ::step] + 1) / 2).round(3).tolist(),
    'cpsi': orient(contours(psi, lev_psi), psi), 'ca': orient(contours(a, lev_a), a),
}

# ---------------------------------------------------------------- 3. VKS : écoulement moyen et dipôle axial
# Unités : rayon du cylindre R = 1, turbines en z = +-h (VKS2 : 185.5/206 = 0.90).
h = 0.90
rr = np.linspace(0, 1, 81); zv = np.linspace(-h, h, 145)
Rg, Zg = np.meshgrid(rr, zv, indexing='xy')
psiS = Rg**2 * (1 - Rg**2) * np.sin(np.pi * Zg / h)   # u_z = (1/r) d_r psi > 0 on axis for z > 0 (vers la turbine)
fig, ax = plt.subplots()
cs = ax.contour(rr, zv, psiS, levels=[-0.2, -0.12, -0.05, 0.05, 0.12, 0.2])
vks_u = []
for lev, ss in zip(cs.levels, cs.allsegs):
    for sgm in ss:
        p = np.array(sgm)
        # orient along the flow: u_r = -(1/r) d_z psi, u_z = (1/r) d_r psi
        i = len(p) // 2; r0, z0 = p[i]
        ur = -r0 * (1 - r0**2) * (np.pi / h) * np.cos(np.pi * z0 / h)
        uz = (2 - 4 * r0**2) * np.sin(np.pi * z0 / h)
        tv = p[min(i + 1, len(p) - 1)] - p[max(i - 1, 0)]
        if tv[0] * ur + tv[1] * uz < 0: p = p[::-1]
        vks_u.append({'lev': float(lev), 'pts': np.round(p, 4).tolist()})
plt.close(fig)
# axe : u_z sur l'axe, contrôle du sens
print('vks: u_z(axis, z=+0.45) =', 2 * np.sin(np.pi * 0.45 / h), ' u_r(r=0.5, z=0) =', -0.5 * 0.75 * np.pi / h)

# Dipôle axial : noyau uniformément aimanté (sphère de rayon a) ; dedans B axial uniforme, dehors dipôle pur.
# Une ligne qui coupe le plan médian en r0 < a sort de la sphère en sin(theta) = r0/a et suit r = L sin^2(theta), L = a^3/r0^2.
acore = 0.80
vks_B = []
for r0 in [0.40, 0.52, 0.64]:
    L = acore**3 / r0**2
    th_e = np.arcsin(r0 / acore)
    z_e = np.sqrt(acore**2 - r0**2)
    th = np.linspace(th_e, np.pi - th_e, 300)
    outer = np.c_[L * np.sin(th)**3, L * np.sin(th)**2 * np.cos(th)]          # de la sortie haute vers l'entrée basse
    inner = np.c_[np.full(40, r0), np.linspace(-z_e, z_e, 40)]                  # montée à l'intérieur (B_z > 0)
    line = np.vstack([inner, outer[1:]])                                         # boucle fermée orientée dans le sens de B
    vks_B.append({'L': float(L), 'pts': np.round(line[::2], 4).tolist()})
print('vks: B loops L =', [round(b['L'], 2) for b in vks_B])
out['vks'] = {'h': h, 'u': vks_u, 'B': vks_B}

# ---------------------------------------------------------------- 4. contrôle en loi
k = 7.0
mean_raw = 1.15
eps = rng.gamma(k, mean_raw / k, 6000)
beta = k / 1.0 - k / mean_raw                # Gamma(k, rate) * exp(-beta eps) -> Gamma(k, rate + beta): moyenne 1
w = np.exp(-beta * eps); w /= w.sum()
ess = 1 / np.sum(w**2)
edges = np.linspace(0.2, 2.4, 23)
h_raw, _ = np.histogram(eps, edges, density=True)
h_til, _ = np.histogram(eps, edges, weights=w, density=True)
print('law: E_q[eps] =', eps.mean().round(3), ' E_tilt[eps] =', (w * eps).sum().round(3), ' ESS/N =', (ess / len(eps)).round(2))
# P - eps (= dE/dt) : loi stationnaire de moyenne nulle et de variance non nulle (Corollaire 6)
d = rng.normal(0, 0.28, 6000)
dedges = np.linspace(-1, 1, 17)
h_d, _ = np.histogram(d, dedges, density=True)
out['law'] = {'edges': edges.tolist(), 'raw': h_raw.round(4).tolist(), 'tilt': h_til.round(4).tolist(),
              'mean_raw': float(eps.mean()), 'mean_tilt': float((w * eps).sum()), 'EP': 1.0,
              'dedges': dedges.tolist(), 'dhist': h_d.round(4).tolist(), 'ess_frac': float(ess / len(eps))}

# ---------------------------------------------------------------- 5. usages
# modes (modèles réduits) : trois modes de Fourier du domaine 2D
n2 = 16; gg = np.linspace(0, 2 * np.pi, n2, endpoint=False); XX, YY = np.meshgrid(gg, gg)
modes = [np.sin(XX) * np.sin(YY), np.cos(XX) * np.sin(2 * YY), np.sin(2 * XX + YY)]
modes = [((mm / np.abs(mm).max()) + 1) / 2 for mm in modes]
# assimilation : ensemble de 7 trajectoires d'un AR(1), resserré aux instants d'observation
T = 60; tt = np.arange(T); obs_t = [14, 30, 46]
truth = np.cumsum(rng.normal(0, 0.12, T)); truth -= truth.mean()
truth = 0.8 * np.sin(tt / 9.0) + 0.25 * np.sin(tt / 3.7)
ens = []
for j in range(7):
    x_ = 0.0 + rng.normal(0, 0.4); path = []
    for i in range(T):
        x_ = x_ + 0.15 * (truth[i] - x_) * 0.2 + rng.normal(0, 0.07)
        if i in obs_t: x_ = truth[i] + 0.35 * (x_ - truth[i])
        path.append(x_)
    ens.append(np.round(path, 3).tolist())
obs = [[int(i), float(truth[i] + rng.normal(0, 0.05))] for i in obs_t]
out['uses'] = {'modes': [mm.round(3).tolist() for mm in modes], 'ens': ens, 'obs': obs, 'T': T}

path = os.path.join(os.path.dirname(__file__), 'cadre.json')
with open(path, 'w') as fh:
    json.dump(out, fh)
print('wrote', path, os.path.getsize(path) // 1024, 'kB')
