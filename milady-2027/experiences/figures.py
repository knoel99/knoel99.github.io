"""Graphiques des résultats (matplotlib) : python3 figures.py [e1] [e2] [e3]

Palette catégorielle de référence (ordre fixe) ; la référence « vérité » est en encre neutre.
Sorties : figures/*.png (200 dpi) et *.svg.
"""
from __future__ import annotations

import json
import sys

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

from common import FIGS, RESULTS  # noqa: E402

C = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"]
INK, INK2, GRID = "#0b0b0b", "#52514e", "#e4e3df"
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 9, "axes.edgecolor": INK2, "axes.labelcolor": INK,
    "xtick.color": INK2, "ytick.color": INK2, "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6,
    "axes.spines.top": False, "axes.spines.right": False, "legend.frameon": False, "lines.linewidth": 2,
    "savefig.facecolor": "white", "figure.facecolor": "white",
})


def save(fig, name):
    fig.tight_layout()
    fig.savefig(FIGS / f"{name}.png", dpi=200)
    fig.savefig(FIGS / f"{name}.svg")
    plt.close(fig)
    print("écrit", FIGS / f"{name}.png")


def load(name):
    return json.loads((RESULTS / name).read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
def e1(suffix=""):
    r = load(f"e1_gissinger{suffix}.json")
    fine = r["grille_fine"]
    g = np.array([f["Gamma"] for f in fine])
    # 1. Seuil des renversements : fréquence des passages de D par 0
    fig, ax = plt.subplots(1, 2, figsize=(8.6, 3.2))
    ax[0].plot(g, [f["taux_simulation"] for f in fine], color=INK, lw=2.4, label="simulation (comptage)")
    ax[0].plot(g, [f["taux_rice_ref"] for f in fine], color=INK2, ls="--", lw=1.4, label="Rice, loi de référence")
    ax[0].plot(g, [f["taux_rice_modele"] for f in fine], color=C[0], label="Rice, loi générée (C)")
    if "taux_rice_modele_F" in fine[0]:
        ax[0].plot(g, [f["taux_rice_modele_F"] for f in fine], color=C[1], label="Rice, loi générée (F)")
    tr = [f["Gamma"] for f in fine if f["dans_entrainement"]]
    ax[0].plot(tr, np.zeros(len(tr)) - 0.0006, "|", color=INK2, ms=8, label="Γ d'entraînement")
    ax[0].set_xlabel("Γ"); ax[0].set_ylabel("passages de D par 0 par unité de temps")
    ax[0].legend(fontsize=7.5, loc="upper left")
    ax[1].plot(g, [f["pont_ref"] for f in fine], color=INK, lw=2.4, label="référence")
    ax[1].plot(g, [f["pont_modele"] for f in fine], color=C[0], label="loi générée (C)")
    if "pont_modele_F" in fine[0]:
        ax[1].plot(g, [f["pont_modele_F"] for f in fine], color=C[1], label="loi générée (F)")
    ax[1].set_xlabel("Γ"); ax[1].set_ylabel("P(|D| < 0,25)")
    ax[1].legend(fontsize=7.5, loc="upper left")
    save(fig, f"e1_seuil{suffix}")

    # 2. Comparaison des variantes (Γ de test)
    res = r["resume"]
    names = [("A_reference", "A référence"), ("B_augmentation", "B augmentation"), ("C_equivariant", "C équivariant"),
             ("C_court", "C budget court"), ("F_stationnarite_Ccourt", "C court + perte stat."),
             ("F0_temoin_Ccourt", "C court + témoin"), ("F_stationnarite_C", "C + perte stat."), ("F0_temoin_C", "C + témoin"),
             ("D_inclinaison_C", "C + inclinaison"), ("E_projection_C", "C + projection/éch.")]
    names = [(k, l) for k, l in names if k in res]
    fig, ax = plt.subplots(1, 3, figsize=(10, 3.6), sharey=True)
    y = np.arange(len(names))[::-1]
    for j, (key, lab, floor_key) in enumerate((("energie", "distance d'énergie", "energie"),
                                               ("liou_test_moy", "résidu de Liouville (degré 3)", "liou_test_moy"),
                                               ("asym", "|P(D>0) − 1/2|", None))):
        vals = [res[k]["test"][key] for k, _ in names]
        ax[j].barh(y, vals, color=C[0], height=0.62)
        if floor_key:
            fl = res["planchers_bruit_MC"]["n_gen"][floor_key]
            ax[j].axvline(fl, color=INK2, ls="--", lw=1)
            ax[j].text(fl, len(names) - 0.4, " bruit MC", color=INK2, fontsize=7, va="bottom")
        ax[j].set_xscale("log"); ax[j].set_xlabel(lab)
    ax[0].set_yticks(y); ax[0].set_yticklabels([l for _, l in names])
    save(fig, f"e1_variantes{suffix}")

    # 3. Contrainte échantillon par échantillon vs en loi : loi de dE/dt et nuage (Q, D)
    d = np.load(RESULTS / f"e1_echantillons{suffix}.npz")
    gam = "0.85" if f"ref|0.85" in d else sorted(k.split("|")[1] for k in d.files if k.startswith("ref|"))[3]
    gam2 = "0.93" if f"ref|0.93" in d else gam
    from e1_gissinger import dEdt
    fig, ax = plt.subplots(1, 3, figsize=(10, 3.2))
    bins = np.linspace(-1.5, 1.5, 80)
    for key, col, lab in (("ref", INK, "référence"), ("C_equivariant", C[0], "C (générée)"), ("E_projection_C", C[1], "C projetée sur dE/dt = 0")):
        x = d[f"{key}|{gam2}"]
        vals = dEdt(x, float(gam2))
        ax[0].hist(vals, bins=bins, density=True, histtype="step", color=col, lw=1.6, label=lab)
    ax[0].set_xlabel(f"dE/dt  (Γ = {gam2})"); ax[0].set_ylabel("densité"); ax[0].legend(fontsize=7)
    ax[0].set_yscale("log")
    for j, (key, lab) in enumerate((("A_reference", "A référence"), ("C_equivariant", "C équivariant"))):
        ref = d[f"ref|{gam}"]
        x = d[f"{key}|{gam}"]
        ax[j + 1].scatter(ref[:3000, 0], ref[:3000, 1], s=1, color="#b9b8b2", label="référence", rasterized=True)
        ax[j + 1].scatter(x[:3000, 0], x[:3000, 1], s=1, color=C[0], label=lab, rasterized=True)
        ax[j + 1].set_xlabel("Q"); ax[j + 1].set_ylabel("D")
        ax[j + 1].set_title(f"{lab}, Γ = {gam} : P(D>0) = {(x[:, 1] > 0).mean():.2f}", fontsize=8.5)
    save(fig, f"e1_symetrie_projection{suffix}")


# ---------------------------------------------------------------------------
def e3(suffix=""):
    r = load(f"e3_abc{suffix}.json")
    rm = np.array([t["Rm"] for t in r["taux"]])
    lam = np.array([t["lambda"] for t in r["taux"]])
    fig, ax = plt.subplots(figsize=(5.4, 3.2))
    ax.axhline(0, color=INK2, lw=1)
    ax.plot(rm, lam, "-o", color=C[0], ms=4, label="N = 32")
    for c in r.get("convergence", []):
        ax.plot([c["Rm"]], [c["lambda_N48"]], "s", color=C[1], ms=6, label="N = 48")
    for s in r.get("seuils_interpoles", []):
        ax.axvline(s, color=INK2, ls=":", lw=1)
        ax.text(s, ax.get_ylim()[1] * 0.85, f" {s:.1f}", color=INK2, fontsize=7.5)
    h, l = ax.get_legend_handles_labels()
    keep = dict(zip(l, h))
    ax.legend(keep.values(), keep.keys(), fontsize=7.5)
    ax.set_xlabel("Rm = 1/η"); ax.set_ylabel("taux de croissance λ")
    save(fig, f"e3_abc{suffix}")


if __name__ == "__main__":
    args = sys.argv[1:] or ["e1", "e2", "e3"]
    suffix = "_quick" if "--quick" in args else ""
    for a in args:
        if a in ("e1", "e2", "e3") and a in globals():
            globals()[a](suffix)
