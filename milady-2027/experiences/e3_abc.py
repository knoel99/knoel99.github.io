"""E3 — Dynamo cinématique de l'écoulement ABC (A = B = C = 1) : taux de croissance en fonction de Rm.

Équation d'induction avec écoulement imposé, domaine [0, 2π)³ périodique :
    ∂B/∂t = ∇×(u×B) + η ΔB,   u = (A sin z + C cos y, B sin x + A cos z, C sin y + B cos x),   Rm = 1/η.
Schéma pseudo-spectral (rfftn), désaliasage 2/3, RK4 à facteur intégrant pour la diffusion.
La forme en rotationnel conserve ∇·B = 0 au niveau discret (k·(k×v) = 0).
On mesure le taux de croissance λ = d ln‖B‖/dt après le transitoire, et on garde le mode propre.

Usage : python3 e3_abc.py [--quick]
Sorties : resultats/e3_abc[_quick].json, resultats/e3_modes[_quick].npz
"""
from __future__ import annotations

import argparse
import time

import numpy as np

from common import RESULTS, save_json


class Induction3D:
    def __init__(self, n=32, eta=0.1, A=1.0, B=1.0, C=1.0, seed=0):
        self.n, self.eta = n, eta
        k = np.fft.fftfreq(n, 1.0 / n)
        kr = np.fft.rfftfreq(n, 1.0 / n)
        self.kx, self.ky, self.kz = np.meshgrid(k, k, kr, indexing="ij")
        self.k2 = self.kx ** 2 + self.ky ** 2 + self.kz ** 2
        kmax = n // 3
        self.dealias = (np.abs(self.kx) <= kmax) & (np.abs(self.ky) <= kmax) & (np.abs(self.kz) <= kmax)
        x = np.arange(n) * 2 * np.pi / n
        X, Y, Z = np.meshgrid(x, x, x, indexing="ij")
        self.u = np.stack([A * np.sin(Z) + C * np.cos(Y), B * np.sin(X) + A * np.cos(Z), C * np.sin(Y) + B * np.cos(X)])
        rng = np.random.default_rng(seed)
        b = rng.normal(size=(3, n, n, n))
        bh = np.stack([np.fft.rfftn(c) for c in b]) * self.dealias * np.exp(-self.k2 / 8)
        bh[:, 0, 0, 0] = 0  # pas de champ moyen : en périodique, il est conservé exactement (mode neutre)
        self.bh = self.solenoidal(bh)
        self.bh /= self.norm(self.bh)

    def solenoidal(self, vh):
        k2 = np.where(self.k2 == 0, 1, self.k2)
        d = self.kx * vh[0] + self.ky * vh[1] + self.kz * vh[2]
        return np.stack([vh[0] - self.kx * d / k2, vh[1] - self.ky * d / k2, vh[2] - self.kz * d / k2])

    def norm(self, vh):
        b = np.stack([np.fft.irfftn(c, s=(self.n,) * 3, axes=(0, 1, 2)) for c in vh])
        return np.sqrt(np.mean(np.sum(b ** 2, 0)))

    def rhs(self, bh):
        b = np.stack([np.fft.irfftn(c, s=(self.n,) * 3, axes=(0, 1, 2)) for c in bh])
        e = np.cross(self.u, b, axis=0)               # u × B
        eh = np.stack([np.fft.rfftn(c) for c in e]) * self.dealias
        # ∇×(u×B) en Fourier : i k × ê
        return 1j * np.stack([self.ky * eh[2] - self.kz * eh[1], self.kz * eh[0] - self.kx * eh[2], self.kx * eh[1] - self.ky * eh[0]])

    def step(self, dt):
        L = -self.eta * self.k2
        E, E2 = np.exp(L * dt), np.exp(L * dt / 2)
        b = self.bh
        k1 = self.rhs(b)
        k2 = self.rhs(E2 * (b + 0.5 * dt * k1))
        k3 = self.rhs(E2 * b + 0.5 * dt * k2)
        k4 = self.rhs(E * b + dt * E2 * k3)
        self.bh = E * b + dt / 6 * (E * k1 + 2 * E2 * (k2 + k3) + k4)

    def divergence_rel(self):
        d = self.kx * self.bh[0] + self.ky * self.bh[1] + self.kz * self.bh[2]
        return float(np.sqrt(np.sum(np.abs(d) ** 2) / np.sum(self.k2 * np.sum(np.abs(self.bh) ** 2, 0))))


def growth_rate(rm, n=32, t_total=120.0, dt=0.05, seed=0):
    m = Induction3D(n=n, eta=1.0 / rm, seed=seed)
    logn, ts = [], []
    acc = 0.0
    for k in range(int(t_total / dt)):
        m.step(dt)
        if (k + 1) % 20 == 0:
            nb = m.norm(m.bh)
            acc += np.log(nb)
            m.bh /= nb
            logn.append(acc)
            ts.append((k + 1) * dt)
    ts, logn = np.array(ts), np.array(logn)
    late = ts > t_total / 2
    lam = np.polyfit(ts[late], logn[late], 1)[0]
    lam_q = np.polyfit(ts[ts > 3 * t_total / 4], logn[ts > 3 * t_total / 4], 1)[0]
    return float(lam), float(lam_q), m


def main(quick=False):
    t0 = time.time()
    rms = [4, 8, 12, 16, 20] if quick else [2, 4, 6, 8, 8.5, 9, 9.5, 10, 11, 12, 13, 14, 15, 16, 17, 17.5, 18, 19, 20, 22, 24, 26, 28, 30]
    t_total = 60.0 if quick else 150.0
    rows, modes = [], {}
    for rm in rms:
        lam, lam_q, m = growth_rate(rm, t_total=t_total)
        rows.append({"Rm": rm, "lambda": lam, "lambda_dernier_quart": lam_q, "div_rel": m.divergence_rel()})
        print(f"Rm={rm:5.1f}  λ={lam:+.4f} (dernier quart {lam_q:+.4f})  div={m.divergence_rel():.1e}  {time.time() - t0:.0f} s", flush=True)
        if rm in (8, 12, 16, 20):
            modes[f"Rm{rm}"] = np.stack([np.fft.irfftn(c, s=(32,) * 3, axes=(0, 1, 2)) for c in m.bh]).astype(np.float32)
    # Convergence en résolution sur deux points
    conv = []
    for rm in ([12] if quick else [12, 17.5]):
        lam48, _, _ = growth_rate(rm, n=48, t_total=t_total)
        conv.append({"Rm": rm, "lambda_N48": lam48})
        print(f"N=48 Rm={rm}  λ={lam48:+.4f}", flush=True)
    # Seuils par interpolation linéaire des changements de signe
    seuils = []
    for a, b in zip(rows[:-1], rows[1:]):
        if np.sign(a["lambda"]) != np.sign(b["lambda"]):
            seuils.append(a["Rm"] + (b["Rm"] - a["Rm"]) * (-a["lambda"]) / (b["lambda"] - a["lambda"]))
    out = {"config": {"N": 32, "A": 1, "B": 1, "C": 1, "dt": 0.05, "t_total": t_total, "Rm": "1/eta"},
           "taux": rows, "convergence": conv, "seuils_interpoles": seuils, "duree_s": time.time() - t0}
    suffix = "_quick" if quick else ""
    save_json(out, f"e3_abc{suffix}.json")
    np.savez_compressed(RESULTS / f"e3_modes{suffix}.npz", **modes)
    print("seuils :", seuils)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    main(ap.parse_args().quick)
