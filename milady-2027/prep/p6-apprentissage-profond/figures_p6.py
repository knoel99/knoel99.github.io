"""Figures statiques du module p6 (FR et EN). Usage : python figures_p6.py <dossier_sortie>"""
import sys
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

torch.set_num_threads(1)
OUT = Path(sys.argv[1])
C1, C2, C3 = "#2a78d6", "#eb6834", "#1baf7a"
INK, INK2, GRID = "#0b0b0b", "#52514e", "#d9d8d4"
plt.rcParams.update({"font.size": 10.5, "axes.edgecolor": INK2, "axes.labelcolor": INK, "xtick.color": INK2,
                     "ytick.color": INK2, "axes.spines.top": False, "axes.spines.right": False,
                     "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6, "lines.linewidth": 2,
                     "legend.frameon": False, "axes.titleweight": "bold", "axes.titlesize": 11})
T = {
 "fr": dict(err="erreur relative (test)", nlat="nombre de variables latentes r", pod="POD (linéaire)",
            ae="autoencodeur", x="x", u="u(x)", truth="vérité", podr="POD, r = 2", aer="AE, r = 2",
            z1="latent z₁", z2="latent z₂", pos="position s de l'impulsion",
            ta="(a) Erreur en fonction de r", tb="(b) Un instantané de test", tc="(c) Latents de l'AE (r = 2)",
            i="indice i du mode", lam="valeur propre λᵢ", pred="prédiction N aₖ²/4", meas="POD empirique",
            td="(a) Valeurs propres POD = spectre", te="(b) Quatre premiers modes POD", mode="mode",
            shift="translation s (pas de grille)", eq="erreur relative d'équivariance",
            tf="U-Net à 2 sous-échantillonnages : ‖U(Tₛx) − TₛU(x)‖ / ‖U(x)‖", zero="0 exactement"),
 "en": dict(err="relative error (test)", nlat="number of latent variables r", pod="POD (linear)",
            ae="autoencoder", x="x", u="u(x)", truth="truth", podr="POD, r = 2", aer="AE, r = 2",
            z1="latent z₁", z2="latent z₂", pos="pulse position s",
            ta="(a) Error versus r", tb="(b) One test snapshot", tc="(c) AE latents (r = 2)",
            i="mode index i", lam="eigenvalue λᵢ", pred="prediction N aₖ²/4", meas="empirical POD",
            td="(a) POD eigenvalues = spectrum", te="(b) First four POD modes", mode="mode",
            shift="shift s (grid steps)", eq="relative equivariance error",
            tf="U-Net with 2 downsamplings: ‖U(Tₛx) − TₛU(x)‖ / ‖U(x)‖", zero="exactly 0"),
}

# ---------- Données et modèles (mêmes réglages que les blocs du cours) ----------
torch.manual_seed(0); rng = np.random.default_rng(0)
N, w = 64, 0.3
x = np.arange(N) * 2 * np.pi / N
def pulse(s):
    dist = np.angle(np.exp(1j * (x[None, :] - s[:, None])))
    return np.exp(-dist ** 2 / (2 * w ** 2))
X_train = pulse(rng.uniform(0, 2 * np.pi, 256)); s_test = rng.uniform(0, 2 * np.pi, 256); X_test = pulse(s_test)
mean = X_train.mean(0)
U, s, Vt = np.linalg.svd(X_train - mean, full_matrices=False)
def pod_rec(r, X):
    return mean + (X - mean) @ Vt[:r].T @ Vt[:r]
pod_errs = [np.linalg.norm(pod_rec(r, X_test) - X_test) / np.linalg.norm(X_test - mean) for r in range(1, 25)]
class AE(nn.Module):
    def __init__(self, r, h=64):
        super().__init__()
        self.register_buffer("P", torch.tensor(Vt[:r].T * 16 / s[0], dtype=torch.float32))
        self.enc = nn.Sequential(nn.Linear(N, h), nn.GELU(), nn.Linear(h, r))
        self.dec = nn.Sequential(nn.Linear(r, h), nn.GELU(), nn.Linear(h, h), nn.GELU(), nn.Linear(h, N))
    def encode(self, u): return u @ self.P + self.enc(u)
    def forward(self, u): return self.dec(self.encode(u))
Xt = torch.tensor(X_train - mean, dtype=torch.float32); Xs = torch.tensor(X_test - mean, dtype=torch.float32)
aes, ae_errs = {}, {}
for r in (1, 2):
    ae = AE(r); opt = torch.optim.Adam(ae.parameters(), lr=2e-3)
    sch = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=2000)
    for _ in range(2000):
        loss = ((ae(Xt) - Xt) ** 2).mean(); opt.zero_grad(); loss.backward(); opt.step(); sch.step()
    with torch.no_grad():
        ae_errs[r] = ((ae(Xs) - Xs).norm() / Xs.norm()).item()
    aes[r] = ae
print("AE :", ae_errs, "POD r=1,2 :", pod_errs[:2])
with torch.no_grad():
    Z = aes[2].encode(Xs).numpy(); rec_ae = aes[2](Xs).numpy() + mean

# POD d'un champ homogène
rng2 = np.random.default_rng(0)
M = 4000; k = np.fft.rfftfreq(N, 1 / N)
amp = np.where((k >= 1) & (k <= 20), 1 / np.maximum(k, 1), 0.0)
snap = np.fft.irfft(amp * np.exp(1j * rng2.uniform(0, 2 * np.pi, (M, k.size))) * N / 2, n=N)
lam, phi = np.linalg.eigh(snap.T @ snap / M); lam, phi = lam[::-1], phi[:, ::-1]
pred = np.repeat(N * amp[1:21] ** 2 / 4, 2)

# Équivariance du U-Net
def block(ci, co):
    cs = [nn.Conv2d(a, co, 3, padding=1, padding_mode="circular", bias=False) for a in (ci, co)]
    for c in cs: nn.init.kaiming_normal_(c.weight)
    return nn.Sequential(cs[0], nn.ReLU(), cs[1], nn.ReLU())
class UNet(nn.Module):
    def __init__(self, c=8):
        super().__init__()
        self.e1, self.e2, self.mid = block(1, c), block(c, 2 * c), block(2 * c, 4 * c)
        self.d2, self.d1 = block(6 * c, 2 * c), block(3 * c, c)
        self.out = nn.Conv2d(c, 1, 1); self.down, self.up = nn.AvgPool2d(2), nn.Upsample(scale_factor=2)
    def forward(self, x):
        h1 = self.e1(x); h2 = self.e2(self.down(h1)); m = self.mid(self.down(h2))
        u2 = self.d2(torch.cat([self.up(m), h2], 1)); return self.out(self.d1(torch.cat([self.up(u2), h1], 1)))
torch.manual_seed(0)
xg = torch.randn(1, 1, 32, 32); net = UNet()
with torch.no_grad():
    y = net(xg)
    shifts = np.arange(0, 17)
    eqerr = [((net(torch.roll(xg, (int(q), int(q)), (-2, -1))) - torch.roll(y, (int(q), int(q)), (-2, -1))).norm()
              / y.norm()).item() for q in shifts]

for lang, t in T.items():
    sfx = "" if lang == "fr" else "-en"
    # Figure 1 : POD vs AE
    fig, ax = plt.subplots(1, 3, figsize=(11.5, 3.5), constrained_layout=True)
    r_ax = np.arange(1, 25)
    ax[0].plot(r_ax, pod_errs, color=C1, marker="o", ms=4, label=t["pod"])
    ax[0].plot([1, 2], [ae_errs[1], ae_errs[2]], ls="none", marker="s", ms=8, color=C2, label=t["ae"])
    ax[0].set_yscale("log"); ax[0].set_xlabel(t["nlat"]); ax[0].set_ylabel(t["err"]); ax[0].set_title(t["ta"])
    ax[0].legend(loc="lower left")
    j = int(np.argmin(np.abs(s_test - 2.0)))
    ax[1].plot(x, X_test[j], color=INK, lw=2.5, label=t["truth"])
    ax[1].plot(x, pod_rec(2, X_test)[j], color=C1, label=t["podr"])
    ax[1].plot(x, rec_ae[j], color=C2, ls="--", label=t["aer"])
    ax[1].set_xlabel(t["x"]); ax[1].set_ylabel(t["u"]); ax[1].set_title(t["tb"]); ax[1].legend(loc="upper right")
    sc = ax[2].scatter(Z[:, 0], Z[:, 1], c=s_test, cmap="twilight", s=14, edgecolors="none")
    ax[2].set_xlabel(t["z1"]); ax[2].set_ylabel(t["z2"]); ax[2].set_title(t["tc"]); ax[2].set_aspect("equal", "datalim")
    cb = fig.colorbar(sc, ax=ax[2], shrink=0.85); cb.set_label(t["pos"])
    fig.savefig(OUT / f"fig-pod-ae{sfx}.png", dpi=160); plt.close(fig)
    # Figure 2 : POD homogène = Fourier
    fig, ax = plt.subplots(1, 2, figsize=(11, 3.9), constrained_layout=True)
    i = np.arange(1, 41)
    ax[0].semilogy(i, lam[:40], color=C1, marker="o", ms=4, ls="none", label=t["meas"])
    ax[0].semilogy(i, pred, color=C2, label=t["pred"])
    ax[0].set_xlabel(t["i"]); ax[0].set_ylabel(t["lam"]); ax[0].set_title(t["td"]); ax[0].legend()
    for q, c in zip(range(4), (C1, C2, C3, INK2)):
        ax[1].plot(x, phi[:, q] * np.sqrt(N / 2), color=c, label=f"{t['mode']} {q + 1}")
    ax[1].set_xlabel(t["x"]); ax[1].set_title(t["te"]); ax[1].legend(ncol=4, loc="upper center", bbox_to_anchor=(0.5, -0.2), fontsize=9)
    fig.savefig(OUT / f"fig-pod-fourier{sfx}.png", dpi=160); plt.close(fig)
    # Figure 3 : équivariance du U-Net
    fig, ax = plt.subplots(figsize=(8, 3.2), constrained_layout=True)
    cols = [C2 if q % 4 == 0 else C1 for q in shifts]
    ax.bar(shifts, eqerr, color=cols, width=0.7)
    for q in shifts[shifts % 4 == 0]:
        ax.annotate(t["zero"], (q, 0), xytext=(0, 6), textcoords="offset points", ha="center",
                    fontsize=8.5, color=INK, rotation=90, va="bottom")
    ax.set_xticks(shifts); ax.set_xlabel(t["shift"]); ax.set_ylabel(t["eq"]); ax.set_title(t["tf"], fontsize=10.5)
    ax.grid(axis="x", visible=False)
    fig.savefig(OUT / f"fig-unet-equiv{sfx}.png", dpi=160); plt.close(fig)
print("ok")
