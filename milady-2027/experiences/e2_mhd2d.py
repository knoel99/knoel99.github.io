"""E2 — Génération conditionnelle de champs MHD 2D (u, B) : comparaison des mécanismes de contrainte.

Représentation : coefficients de Fourier indépendants (|kx|, |ky| ≤ 10) des instantanés 32².
En turbulence homogène sur domaine périodique, les modes POD sont les modes de Fourier : cette base
joue le rôle de l'espace latent linéaire. Un MLP de flow matching conditionné par log η y génère.

Variantes (même réseau, même budget) :
  V0_libre        : génère (ûx, ûy, B̂x, B̂y) sans contrainte ;
  V1_penalite     : V0 + pénalité douce sur la divergence de la prédiction x̂1 = x_t + (1 - t) v ;
  V2_proj_finale  : V0, puis projection de Leray des échantillons finaux ;
  V3_flot_projete : bruit et pas d'intégration projetés sur le sous-espace à divergence nulle ;
  V4_potentiels   : génère (ψ̂, â), puis u = ∇⊥ψ, B = ∇⊥a (divergence nulle exacte par construction) ;
  V5_potentiels_stat : V4 + réglage fin avec perte de stationnarité en loi (bilan d'énergie moyen),
                       imposée à tout η (y compris sans données) ; témoin V5_temoin (sans la perte).
Volet « en loi » sur V4 : inclinaison exponentielle (3 identités de stationnarité) contre
recalage de chaque échantillon sur le bilan d'énergie.

Usage : python3 e2_mhd2d.py [--quick]  (données : e2_donnees.py, dossier $E2_DATA)
Sortie : resultats/e2_mhd2d[_quick].json
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import time
from pathlib import Path

import numpy as np
import torch

from common import MLPField, energy_distance, exp_tilt, fm_loss, sample_ode, save_json, seed_all, systematic_resample, train
from e2_donnees import ALPHA, EPS, ETA_TEST, ETA_TRAIN, KF, N, NU
from mhd2d import MHD2D

DATA = Path(os.environ.get("E2_DATA", Path(__file__).resolve().parent / "donnees_e2"))
KMAX = 10

# --- géométrie spectrale --------------------------------------------------------------
_k = np.fft.fftfreq(N, 1.0 / N)
_kr = np.fft.rfftfreq(N, 1.0 / N)
KX, KY = np.meshgrid(_kr, _k)
MASK = (np.abs(KX) <= KMAX) & (np.abs(KY) <= KMAX) & ~((KX == 0) & (KY <= 0))
kx, ky = KX[MASK], KY[MASK]               # (M,) modes indépendants
k2 = kx ** 2 + ky ** 2
M = len(kx)
# Chaque mode retenu représente une paire conjuguée (k, -k) : Parseval donne ⟨f²⟩ = (2/N⁴) Σ_M |f̂|².
NORM = 2.0 / N ** 4
SHELL = np.rint(np.sqrt(k2)).astype(int)
CSV = lambda z: np.concatenate([z.real, z.imag], -1)


def from_csv(v, nfield):
    v = v.reshape(v.shape[0], nfield, 2, M)
    return v[:, :, 0] + 1j * v[:, :, 1]


def mean_sq(fh):
    """⟨f²⟩ à partir des coefficients indépendants f̂ (..., M)."""
    return NORM * np.sum(np.abs(fh) ** 2, -1)


def load(split, etas):
    out = {}
    for eta in etas:
        d = np.load(DATA / f"eta_{eta:.6f}_{split}.npz")
        w, a = d["w"][:, MASK].astype(np.complex128), d["a"][:, MASK].astype(np.complex128)
        out[eta] = {"psi": w / k2, "a": a, "inj": float(d["inj_u"] + d["inj_b"])}
    return out


# --- passages entre représentations ----------------------------------------------------
def comps_from_pot(psi, a):
    """(ψ̂, â) -> (ûx, ûy, B̂x, B̂y) avec u = (∂yψ, -∂xψ)."""
    return np.stack([1j * ky * psi, -1j * kx * psi, 1j * ky * a, -1j * kx * a], 1)


def leray(c):
    """Projection de Leray mode par mode sur les champs à divergence nulle. c : (n, 4, M)."""
    out = c.copy()
    for i in (0, 2):
        div = kx * c[:, i] + ky * c[:, i + 1]
        out[:, i] = c[:, i] - kx * div / k2
        out[:, i + 1] = c[:, i + 1] - ky * div / k2
    return out


def diagnostics(c, eta):
    """Grandeurs physiques par échantillon à partir de (ûx, ûy, B̂x, B̂y)."""
    ux, uy, bx, by = c[:, 0], c[:, 1], c[:, 2], c[:, 3]
    om = 1j * kx * uy - 1j * ky * ux
    jj = 1j * kx * by - 1j * ky * bx
    # potentiel a reconstruit à partir de la partie solénoïdale de B (a = ĵ / k²)
    ah = jj / k2
    Eu = 0.5 * (mean_sq(ux) + mean_sq(uy))
    Eb = 0.5 * (mean_sq(bx) + mean_sq(by))
    divu = np.sqrt(mean_sq(kx * ux + ky * uy) / np.maximum(mean_sq(np.sqrt(k2) * ux) + mean_sq(np.sqrt(k2) * uy), 1e-30))
    divb = np.sqrt(mean_sq(kx * bx + ky * by) / np.maximum(mean_sq(np.sqrt(k2) * bx) + mean_sq(np.sqrt(k2) * by), 1e-30))
    Hc = NORM * np.sum((ux * np.conj(bx) + uy * np.conj(by)).real, -1)
    Z = mean_sq(om)
    J2 = mean_sq(jj)
    omj = NORM * np.sum((om * np.conj(jj)).real, -1)
    A2 = 0.5 * mean_sq(ah)
    shells_u = np.stack([0.5 * NORM * np.sum((np.abs(ux) ** 2 + np.abs(uy) ** 2) * (SHELL == s), -1) for s in range(1, 15)], 1)
    shells_b = np.stack([0.5 * NORM * np.sum((np.abs(bx) ** 2 + np.abs(by) ** 2) * (SHELL == s), -1) for s in range(1, 15)], 1)
    diss = NU * Z + eta * J2 + 2 * ALPHA * (Eu + Eb)
    return {"Eu": Eu, "Eb": Eb, "divu": divu, "divb": divb, "Hc": Hc, "diss": diss,
            "g_Hc": (NU + eta) * omj + 2 * ALPHA * Hc, "g_A2": eta * 2 * Eb + 2 * ALPHA * A2,
            "Su": shells_u, "Sb": shells_b}


def features(dg):
    return np.concatenate([np.log10(dg["Su"][:, :10] + 1e-12), np.log10(dg["Sb"][:, :10] + 1e-12), dg["Hc"][:, None] * 10], 1)


# --- modèle ------------------------------------------------------------------------------
def main(quick=False):
    torch.set_num_threads(2)
    t_start = time.time()
    tr, ref = load("train", ETA_TRAIN), load("ref", ETA_TRAIN + ETA_TEST)
    solver = MHD2D(n=N, nu=NU, eta=ETA_TRAIN[0], alpha=ALPHA, kf=KF, eps_u=EPS, eps_b=EPS, batch=8, seed=0)
    inj_u, inj_b, inj_a2 = solver.injection_rates_all()
    inj = inj_u + inj_b
    cn = lambda eta: (np.log(eta) - np.log(3.5e-3)) / (np.log(2.6e-2) - np.log(3.5e-3))

    # Jeux d'entraînement dans les deux représentations
    pot = np.concatenate([CSV(np.stack([tr[e]["psi"], tr[e]["a"]], 1)).reshape(len(tr[e]["psi"]), -1) for e in ETA_TRAIN])
    comp = np.concatenate([CSV(comps_from_pot(tr[e]["psi"], tr[e]["a"])).reshape(len(tr[e]["psi"]), -1) for e in ETA_TRAIN])
    cond = np.concatenate([np.full(len(tr[e]["psi"]), cn(e)) for e in ETA_TRAIN])
    sd_pot = pot.std(0) + 1e-12
    sd_comp = comp.std(0) + 1e-12
    Xp = torch.tensor(pot / sd_pot, dtype=torch.float32)
    Xc = torch.tensor(comp / sd_comp, dtype=torch.float32)
    Cc = torch.tensor(cond, dtype=torch.float32)

    # opérateurs linéaires en coordonnées normalisées (torch) : divergence et projection
    kx_t, ky_t, k2_t = (torch.tensor(v, dtype=torch.float32) for v in (kx, ky, k2))
    sdc_t = torch.tensor(sd_comp, dtype=torch.float32)

    def to_complex_t(z):  # z normalisé (n, 4*2*M) -> champs complexes séparés (re, im) (n, 4, M)
        v = (z * sdc_t).view(z.shape[0], 4, 2, M)
        return v[:, :, 0], v[:, :, 1]

    def div_rel_t(z):
        re, im = to_complex_t(z)
        num = den = 0.0
        for i in (0, 2):
            num = num + (kx_t * re[:, i] + ky_t * re[:, i + 1]) ** 2 + (kx_t * im[:, i] + ky_t * im[:, i + 1]) ** 2
            den = den + k2_t * (re[:, i] ** 2 + im[:, i] ** 2 + re[:, i + 1] ** 2 + im[:, i + 1] ** 2)
        return (num.sum(1) / den.sum(1)).mean()

    def project_t(z):
        re, im = to_complex_t(z)
        outs = []
        for part in (re, im):
            p = part.clone()
            for i in (0, 2):
                d = kx_t * part[:, i] + ky_t * part[:, i + 1]
                p[:, i] = part[:, i] - kx_t * d / k2_t
                p[:, i + 1] = part[:, i + 1] - ky_t * d / k2_t
            outs.append(p)
        v = torch.stack(outs, 2).reshape(z.shape[0], -1)
        return v / sdc_t

    def penalty(model, xt, t, c, v, x1):
        x1hat = xt + (1 - t)[:, None] * v
        return 10.0 * div_rel_t(x1hat)

    proj_noise = lambda shape: project_t(torch.randn(shape))

    iters = 400 if quick else 6000
    width = 512 if quick else 1024
    n_gen = 300 if quick else 1000

    def batcher(X):
        def fn():
            idx = torch.randint(0, len(X), (256,))
            return X[idx], Cc[idx]
        return fn

    variants = {
        "V0_libre": dict(X=Xc, extra=None, noise=None, project=None, post=None),
        "V1_penalite": dict(X=Xc, extra=penalty, noise=None, project=None, post=None),
        "V2_proj_finale": dict(X=Xc, extra=None, noise=None, project=None, post="leray", reuse="V0_libre"),
        "V3_flot_projete": dict(X=Xc, extra=None, noise=proj_noise, project=project_t, post=None),
        "V4_potentiels": dict(X=Xp, extra=None, noise=None, project=None, post=None),
    }
    results = {"config": {"N": N, "nu": NU, "alpha": ALPHA, "kf": KF, "eta_train": ETA_TRAIN, "eta_test": ETA_TEST,
                          "modes": int(M), "dim_potentiels": int(Xp.shape[1]), "dim_composantes": int(Xc.shape[1]),
                          "iters": iters, "largeur": width, "n_gen": n_gen, "injection": [inj_u, inj_b, inj_a2],
                          "n_train_par_eta": int(len(tr[ETA_TRAIN[0]]["psi"]))}, "variantes": {}}
    models, gens = {}, {}

    def generate(model, eta, kind, noise=None, project=None, n=n_gen, seed=0):
        torch.manual_seed(seed)
        dim = Xp.shape[1] if kind == "pot" else Xc.shape[1]
        z = sample_ode(model, torch.full((n,), float(cn(eta))), (n, dim), steps=50, noise_fn=noise, project=project)
        z = z.numpy().astype(np.float64)
        if kind == "pot":
            v = from_csv(z * sd_pot, 2)
            return comps_from_pot(v[:, 0], v[:, 1])
        return from_csv(z * sd_comp, 4)

    for name, cfg in variants.items():
        t0 = time.time()
        if "reuse" in cfg:
            model, tsec = models[cfg["reuse"]], 0.0
        else:
            seed_all(0)
            model = MLPField(cfg["X"].shape[1], width=width, depth=4)
            hist, tsec = train(model, batcher(cfg["X"]), iters, lr=1e-3, log_every=max(iters // 6, 1),
                               extra=cfg["extra"], noise_fn=cfg["noise"], name=name)
            model.eval()
            models[name] = model
        kind = "pot" if name.startswith("V4") else "comp"
        tg = time.time()
        for eta in ETA_TRAIN + ETA_TEST:
            c = generate(model, eta, kind, noise=cfg["noise"], project=cfg["project"])
            if cfg["post"] == "leray":
                c = leray(c)
            gens[(name, eta)] = c
        results["variantes"][name] = {"temps_entrainement_s": tsec,
                                      "temps_generation_s_par_echantillon": (time.time() - tg) / (n_gen * 11)}

    # V5 : réglage fin de V4 avec perte de stationnarité (bilan d'énergie moyen imposé à tout η)
    sdp_t = torch.tensor(sd_pot, dtype=torch.float32)
    k2f = torch.tensor(np.tile(k2, 2), dtype=torch.float32)

    def diss_t(z, eta):
        """Dissipation moyenne D(x) (différentiable) depuis les potentiels normalisés z, η par échantillon."""
        v = (z * sdp_t).view(z.shape[0], 2, 2 * M)  # (n, champ, re/im concaténés)
        psi2 = v[:, 0] ** 2
        a2 = v[:, 1] ** 2
        Z = NORM * (k2f ** 2 * psi2).sum(1)        # ⟨ω²⟩
        J2 = NORM * (k2f ** 2 * a2).sum(1)         # ⟨j²⟩
        E2u = NORM * (k2f * psi2).sum(1)           # ⟨|u|²⟩
        E2b = NORM * (k2f * a2).sum(1)
        return NU * Z + eta * J2 + ALPHA * (E2u + E2b)

    ft_iters = 50 if quick else 600
    for beta, vname in ((50.0, "V5_potentiels_stat"), (0.0, "V5_temoin")):
        seed_all(1)
        model = copy.deepcopy(models["V4_potentiels"]).train()
        opt = torch.optim.Adam(model.parameters(), lr=2e-4)
        bt = batcher(Xp)
        t0 = time.time()
        for it in range(1, ft_iters + 1):
            x1, c = bt()
            loss = fm_loss(model, x1, c)
            if beta > 0:
                le = np.log(3.5e-3) + (np.log(2.6e-2) - np.log(3.5e-3)) * np.random.rand(4)
                etas = np.repeat(np.exp(le), 64)
                cc = torch.tensor(cn(etas), dtype=torch.float32)
                z = torch.randn(len(etas), Xp.shape[1])
                h = 1.0 / 8
                for k in range(8):
                    v0 = model(z, torch.full((len(z),), k * h), cc)
                    v1 = model(z + h * v0, torch.full((len(z),), (k + 1) * h), cc)
                    z = z + 0.5 * h * (v0 + v1)
                d = diss_t(z, torch.tensor(etas, dtype=torch.float32)).view(4, 64).mean(1)
                loss = loss + beta * ((d - inj) / inj).pow(2).mean()
            opt.zero_grad(set_to_none=True)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            if it % max(ft_iters // 4, 1) == 0:
                print(f"[{vname}] it {it} perte {loss.item():.4f} {time.time() - t0:.0f} s", flush=True)
        model.eval()
        models[vname] = model
        for eta in ETA_TRAIN + ETA_TEST:
            gens[(vname, eta)] = generate(model, eta, "pot")
        results["variantes"][vname] = {"temps_reglage_fin_s": time.time() - t0, "iters": ft_iters, "beta": beta}

    # --- évaluation ---------------------------------------------------------------------
    ref_dg = {e: diagnostics(comps_from_pot(ref[e]["psi"], ref[e]["a"]), e) for e in ETA_TRAIN + ETA_TEST}
    tr_dg = {e: diagnostics(comps_from_pot(tr[e]["psi"], tr[e]["a"]), e) for e in ETA_TRAIN}
    fmean = np.concatenate([features(ref_dg[e]) for e in ETA_TRAIN]).mean(0)
    fstd = np.concatenate([features(ref_dg[e]) for e in ETA_TRAIN]).std(0) + 1e-9

    def evaluate(c, eta):
        dg = diagnostics(c, eta)
        r = ref_dg[eta]
        spec_err = float(np.mean(np.abs(np.log10(dg["Su"].mean(0)[:10] / r["Su"].mean(0)[:10]))) / 2
                         + np.mean(np.abs(np.log10(dg["Sb"].mean(0)[:10] / r["Sb"].mean(0)[:10]))) / 2)
        return {
            "div_rel_u": float(np.mean(dg["divu"])), "div_rel_b": float(np.mean(dg["divb"])),
            "err_spectre_log10": spec_err,
            "err_Eu_rel": float(abs(dg["Eu"].mean() / r["Eu"].mean() - 1)),
            "err_Eb_rel": float(abs(dg["Eb"].mean() / r["Eb"].mean() - 1)),
            "residu_bilan_energie": float((dg["diss"].mean() - inj) / inj),
            "residu_bilan_Hc": float(dg["g_Hc"].mean() / (r["g_Hc"].std() + 1e-12)),
            "residu_bilan_A2": float((dg["g_A2"].mean() - inj_a2) / inj_a2),
            "std_diss_rel": float(dg["diss"].std() / r["diss"].std()),
            "dist_energie_features": energy_distance((features(dg) - fmean) / fstd, (features(r) - fmean) / fstd, n=1000),
            "Hc_moy": float(dg["Hc"].mean()), "Hc_std": float(dg["Hc"].std()),
        }

    evals = {}
    for name in list(variants) + ["V5_potentiels_stat", "V5_temoin"]:
        for split, etas in (("train", ETA_TRAIN), ("test", ETA_TEST)):
            evals.setdefault(name, {})[split] = [{"eta": e, **evaluate(gens[(name, e)], e)} for e in etas]
    # Référence : sous-échantillon de même taille (plancher de bruit) et données d'entraînement
    floor = {}
    for split, etas in (("train", ETA_TRAIN), ("test", ETA_TEST)):
        rows = []
        for e in etas:
            rng = np.random.default_rng(3)
            src = tr[e] if e in tr else ref[e]
            idx = rng.choice(len(src["psi"]), size=min(n_gen, len(src["psi"])), replace=False)
            rows.append({"eta": e, **evaluate(comps_from_pot(src["psi"][idx], src["a"][idx]), e)})
        floor[split] = rows
    evals["reference_sous_echantillon"] = floor

    # --- volet en loi : inclinaison exponentielle contre recalage par échantillon (sur V4) ---
    law = {}
    for e in ETA_TRAIN + ETA_TEST:
        c = gens[("V4_potentiels", e)]
        dg = diagnostics(c, e)
        g = np.stack([dg["diss"] - inj, dg["g_Hc"], dg["g_A2"] - inj_a2], 1)
        half = len(c) // 2
        w, lam, info = exp_tilt(g[:half], reg=1.0)
        zb = g[half:] @ lam
        wb = np.exp(zb - zb.max()); wb /= wb.sum()
        tilted = c[half:][systematic_resample(wb, len(c) - half, seed=1)]
        # recalage : on multiplie les échelles |k| > 3 par s pour que D(x) = ε_inj exactement
        big = (np.sqrt(k2) > 3)
        cl, cs = c * (~big), c * big
        dl, ds = diagnostics(cl, e)["diss"], diagnostics(cs, e)["diss"]
        s = np.sqrt(np.clip((inj - dl) / np.maximum(ds, 1e-12), 0, None))
        rescaled = cl + cs * s[:, None, None]
        law[str(e)] = {"base": evaluate(c[half:], e), "inclinaison": evaluate(tilted, e), "recalage": evaluate(rescaled, e),
                       "ess_frac_b": float(1 / np.sum(wb ** 2) / len(wb)), "lambda": lam.tolist(),
                       "split": "train" if e in ETA_TRAIN else "test"}
    results["evaluation"] = evals
    results["en_loi"] = law
    keys = ["div_rel_u", "div_rel_b", "err_spectre_log10", "err_Eu_rel", "err_Eb_rel", "residu_bilan_energie",
            "residu_bilan_Hc", "residu_bilan_A2", "std_diss_rel", "dist_energie_features"]
    summary = {}
    for name, ev in evals.items():
        summary[name] = {split: {k: float(np.mean([abs(r[k]) if k.startswith("residu") else r[k] for r in rows])) for k in keys}
                         for split, rows in ev.items()}
    summary["en_loi"] = {m: {split: {k: float(np.mean([abs(v[m][k]) if k.startswith("residu") else v[m][k]
                                                       for v in law.values() if v["split"] == split])) for k in keys}
                             for split in ("train", "test")} for m in ("base", "inclinaison", "recalage")}
    summary["en_loi"]["ess_frac_b_moy"] = float(np.mean([v["ess_frac_b"] for v in law.values()]))
    results["resume"] = summary
    results["duree_totale_s"] = time.time() - t_start
    save_json(results, "e2_mhd2d_quick.json" if quick else "e2_mhd2d.json")
    # échantillons pour figures (η du milieu)
    e_mid = ETA_TEST[2]
    np.savez_compressed(Path(__file__).resolve().parent / "resultats" / ("e2_echantillons_quick.npz" if quick else "e2_echantillons.npz"),
                        **{f"{n}": gens[(n, e_mid)][:8] for n in list(variants) + ["V5_potentiels_stat"]},
                        ref=comps_from_pot(ref[e_mid]["psi"][:8], ref[e_mid]["a"][:8]), kx=kx, ky=ky, eta=e_mid)
    for name, v in summary.items():
        print(name, json.dumps(v)[:600], flush=True)
    print(f"durée totale {time.time() - t_start:.0f} s")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--quick", action="store_true")
    main(ap.parse_args().quick)
