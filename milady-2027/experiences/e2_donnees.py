"""E2 (données) — Instantanés de MHD 2D forcée pour une gamme de diffusivités magnétiques η.

ν = 8e-3 fixé ; η parcourt une grille log (Pm = ν/η de 2 à ≈ 0.35).
Grille 32², désaliasage 2/3 : les coefficients non nuls vérifient |kx|, |ky| ≤ 10.
Chaque instantané est stocké par les coefficients de Fourier de ω et a (complexes).

Usage : python3 e2_donnees.py [--quick]
Sortie : $E2_DATA (défaut : ./donnees_e2/) eta_<valeur>.npz
"""
from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

import numpy as np

from mhd2d import MHD2D

N, NU, ALPHA, KF, EPS = 32, 8e-3, 0.02, (2.0, 3.0), 0.05
ETA_TRAIN = [4e-3 * 2 ** (k / 2) for k in range(6)]
ETA_TEST = [4e-3 * 2 ** (k / 2 + 0.25) for k in range(5)]
DATA = Path(os.environ.get("E2_DATA", Path(__file__).resolve().parent / "donnees_e2"))


def run(eta, n_snap_per_member, seed, batch=16, dt=1e-2, t_burn=30.0, every=1.0):
    m = MHD2D(n=N, nu=NU, eta=eta, alpha=ALPHA, kf=KF, eps_u=EPS, eps_b=EPS, batch=batch, seed=seed)
    inj = m.injection_rate(dt=dt, n_draw=400)
    nb, ne = int(t_burn / dt), int(every / dt)
    W, A = [], []
    for k in range(nb + n_snap_per_member * ne):
        m.step(dt)
        if k >= nb and (k - nb + 1) % ne == 0:
            W.append(m.w.copy()); A.append(m.a.copy())
    W = np.concatenate(np.stack(W, 1), 0)  # (batch * n_snap, N, N//2+1), regroupé par membre
    A = np.concatenate(np.stack(A, 1), 0)
    return W.astype(np.complex64), A.astype(np.complex64), inj


def main(quick=False):
    DATA.mkdir(parents=True, exist_ok=True)
    n_tr, n_ref = (20, 10) if quick else (150, 75)
    meta = {"N": N, "nu": NU, "alpha": ALPHA, "kf": KF, "eps": EPS, "eta_train": ETA_TRAIN, "eta_test": ETA_TEST,
            "dt": 1e-2, "intervalle": 1.0, "membres": 16, "fichiers": {}}
    for i, eta in enumerate(ETA_TRAIN + ETA_TEST):
        t0 = time.time()
        jobs = [("train", n_tr, 100 + i)] if eta in ETA_TRAIN else []
        jobs.append(("ref", n_ref, 200 + i))
        for split, n_snap, seed in jobs:
            fname = f"eta_{eta:.6f}_{split}.npz"
            if (DATA / fname).is_file():  # reprise après interruption
                d = np.load(DATA / fname)
                meta["fichiers"][fname] = {"eta": eta, "split": split, "n": int(len(d["w"])),
                                           "inj": [float(d["inj_u"]), float(d["inj_b"])]}
                print(f"η={eta:.5f} {split}: déjà présent", flush=True)
                continue
            W, A, inj = run(eta, n_snap, seed)
            np.savez_compressed(DATA / fname, w=W, a=A, inj_u=inj[0], inj_b=inj[1], eta=eta)
            meta["fichiers"][fname] = {"eta": eta, "split": split, "n": int(len(W)), "inj": [float(inj[0]), float(inj[1])]}
            print(f"η={eta:.5f} {split}: {len(W)} instantanés, injection {sum(inj):.4f}, {time.time() - t0:.0f} s", flush=True)
    (DATA / "meta.json").write_text(json.dumps(meta, indent=1))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    main(ap.parse_args().quick)
