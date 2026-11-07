"""Graphiques des résultats (matplotlib), en français et en anglais.

Usage : python3 figures.py [e1] [e2] [e3] [--quick]
Sorties : figures/<nom>.png|svg (français) et figures/<nom>-en.png|svg (anglais).
Palette catégorielle de référence (ordre fixe) ; la référence « vérité » est en encre neutre.
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
INK, INK2, GRID, LIGHT = "#0b0b0b", "#52514e", "#e4e3df", "#b9b8b2"
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 9, "axes.edgecolor": INK2, "axes.labelcolor": INK,
    "xtick.color": INK2, "ytick.color": INK2, "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6,
    "axes.spines.top": False, "axes.spines.right": False, "legend.frameon": False, "lines.linewidth": 2,
    "savefig.facecolor": "white", "figure.facecolor": "white",
})

TXT = {
    "fr": {
        "sim": "simulation (comptage)", "rice_ref": "Rice, loi de référence", "rice_C": "Rice, loi générée (C)",
        "rice_F": "Rice, loi générée (F)", "gtrain": "Γ d'entraînement", "rate": "passages de D par 0 par unité de temps",
        "ref": "référence", "genC": "loi générée (C)", "genF": "loi générée (F)",
        "ed": "distance d'énergie", "liou3": "résidu de Liouville (degré 3)", "asym": "|P(D>0) − 1/2|", "mc": " bruit MC",
        "density": "densité", "projC": "C projetée sur dE/dt = 0", "genCshort": "C (générée)",
        "var": {"A_reference": "A référence", "B_augmentation": "B augmentation", "C_equivariant": "C équivariant",
                "C_court": "C budget court", "F_stationnarite_Ccourt": "C court + perte stat.",
                "F0_temoin_Ccourt": "C court + témoin", "F_stationnarite_C": "C + perte stat.", "F0_temoin_C": "C + témoin",
                "D_inclinaison_C": "C + inclinaison", "E_projection_C": "C + projection/éch."},
        "e2var": {"V0_libre": "V0 libre", "V1_penalite": "V1 pénalité", "V2_proj_finale": "V2 projection finale",
                  "V3_flot_projete": "V3 flot projeté", "V4_potentiels": "V4 potentiels",
                  "V5_potentiels_stat": "V5 potentiels + perte stat.", "V5_temoin": "V5 témoin",
                  "reference_sous_echantillon": "données (sous-éch.)"},
        "div": "divergence relative de u", "spec": "erreur de spectre (log₁₀, moyenne)",
        "bal": "|E[D] − ε_inj| / ε_inj", "k": "nombre d'onde k", "Eu": "E_u(k)", "Eb": "E_B(k)",
        "diss": "dissipation D(x) / ε_inj", "base": "V4 (générée)", "tilt": "V4 + inclinaison", "resc": "V4 + recalage/éch.",
        "rm": "Rm = 1/η", "lam": "taux de croissance λ",
    },
    "en": {
        "sim": "simulation (counting)", "rice_ref": "Rice, reference law", "rice_C": "Rice, generated law (C)",
        "rice_F": "Rice, generated law (F)", "gtrain": "training Γ", "rate": "zero crossings of D per unit time",
        "ref": "reference", "genC": "generated law (C)", "genF": "generated law (F)",
        "ed": "energy distance", "liou3": "Liouville residual (degree 3)", "asym": "|P(D>0) − 1/2|", "mc": " MC noise",
        "density": "density", "projC": "C projected on dE/dt = 0", "genCshort": "C (generated)",
        "var": {"A_reference": "A baseline", "B_augmentation": "B augmentation", "C_equivariant": "C equivariant",
                "C_court": "C short budget", "F_stationnarite_Ccourt": "C short + stat. loss",
                "F0_temoin_Ccourt": "C short + control", "F_stationnarite_C": "C + stat. loss", "F0_temoin_C": "C + control",
                "D_inclinaison_C": "C + tilting", "E_projection_C": "C + per-sample proj."},
        "e2var": {"V0_libre": "V0 free", "V1_penalite": "V1 penalty", "V2_proj_finale": "V2 final projection",
                  "V3_flot_projete": "V3 projected flow", "V4_potentiels": "V4 potentials",
                  "V5_potentiels_stat": "V5 potentials + stat. loss", "V5_temoin": "V5 control",
                  "reference_sous_echantillon": "data (subsample)"},
        "div": "relative divergence of u", "spec": "spectrum error (log₁₀, mean)",
        "bal": "|E[D] − ε_inj| / ε_inj", "k": "wavenumber k", "Eu": "E_u(k)", "Eb": "E_B(k)",
        "diss": "dissipation D(x) / ε_inj", "base": "V4 (generated)", "tilt": "V4 + tilting", "resc": "V4 + per-sample rescaling",
        "rm": "Rm = 1/η", "lam": "growth rate λ",
    },
}


def fmt(lang):
    """Séparateur décimal : virgule en français."""
    if lang == "fr":
        plt.rcParams["axes.formatter.use_locale"] = False
        from matplotlib.ticker import FuncFormatter
        return FuncFormatter(lambda v, _: f"{v:g}".replace(".", ","))
    return None


def finish(fig, name, lang):
    f = fmt(lang)
    if f is not None:
        for ax in fig.axes:
            if ax.get_xscale() == "linear":
                ax.xaxis.set_major_formatter(f)
            if ax.get_yscale() == "linear" and not getattr(ax, "_categ", False):
                ax.yaxis.set_major_formatter(f)
    fig.tight_layout()
    stem = name if lang == "fr" else f"{name}-en"
    fig.savefig(FIGS / f"{stem}.png", dpi=200)
    fig.savefig(FIGS / f"{stem}.svg")
    plt.close(fig)
    print("écrit", FIGS / f"{stem}.png")


def load(name):
    return json.loads((RESULTS / name).read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
def e1(suffix="", lang="fr"):
    t = TXT[lang]
    r = load(f"e1_gissinger{suffix}.json")
    fine = r["grille_fine"]
    g = np.array([f["Gamma"] for f in fine])
    fig, ax = plt.subplots(1, 2, figsize=(8.6, 3.3))
    ax[0].plot(g, [f["taux_simulation"] for f in fine], color=INK, lw=2.4, label=t["sim"])
    ax[0].plot(g, [f["taux_rice_ref"] for f in fine], color=INK2, ls="--", lw=1.4, label=t["rice_ref"])
    ax[0].plot(g, [f["taux_rice_modele"] for f in fine], color=C[0], label=t["rice_C"])
    if "taux_rice_modele_F" in fine[0]:
        ax[0].plot(g, [f["taux_rice_modele_F"] for f in fine], color=C[1], label=t["rice_F"])
    tr = [f["Gamma"] for f in fine if f["dans_entrainement"]]
    ax[0].plot(tr, np.zeros(len(tr)), "|", color=INK2, ms=9, mew=1.5, label=t["gtrain"])
    ax[0].set_xlabel("Γ"); ax[0].set_ylabel(t["rate"])
    ax[0].legend(fontsize=7.5, loc="upper left")
    ax[1].plot(g, [f["pont_ref"] for f in fine], color=INK, lw=2.4, label=t["ref"])
    ax[1].plot(g, [f["pont_modele"] for f in fine], color=C[0], label=t["genC"])
    if "pont_modele_F" in fine[0]:
        ax[1].plot(g, [f["pont_modele_F"] for f in fine], color=C[1], label=t["genF"])
    ax[1].set_xlabel("Γ"); ax[1].set_ylabel("P(|D| < 0.25)" if lang == "en" else "P(|D| < 0,25)")
    ax[1].legend(fontsize=7.5, loc="upper left")
    finish(fig, f"e1_seuil{suffix}", lang)

    res = r["resume"]
    keys = ["A_reference", "B_augmentation", "C_equivariant", "C_court", "F_stationnarite_Ccourt", "F0_temoin_Ccourt",
            "F_stationnarite_C", "F0_temoin_C", "D_inclinaison_C", "E_projection_C"]
    keys = [k for k in keys if k in res]
    fig, ax = plt.subplots(1, 3, figsize=(10, 3.8), sharey=True)
    y = np.arange(len(keys))[::-1]
    for j, (key, lab, floor_key) in enumerate((("energie", t["ed"], "energie"), ("liou_test_moy", t["liou3"], "liou_test_moy"),
                                               ("asym", t["asym"], None))):
        vals = [res[k]["test"][key] for k in keys]
        ax[j].barh(y, vals, color=C[0], height=0.62)
        if floor_key:
            fl = res["planchers_bruit_MC"]["n_gen"][floor_key]
            ax[j].axvline(fl, color=INK2, ls="--", lw=1)
            ax[j].text(fl, len(keys) - 0.45, t["mc"], color=INK2, fontsize=7, va="bottom")
        ax[j].set_xscale("log"); ax[j].set_xlabel(lab)
    ax[0].set_yticks(y); ax[0].set_yticklabels([t["var"][k] for k in keys])
    for a in ax:
        a._categ = True
    finish(fig, f"e1_variantes{suffix}", lang)

    d = np.load(RESULTS / f"e1_echantillons{suffix}.npz")
    from e1_gissinger import dEdt
    gam, gam2 = "0.85", "0.93"
    fig, ax = plt.subplots(1, 3, figsize=(10, 3.3))
    bins = np.linspace(-1.5, 1.5, 80)
    for key, col, lab in (("ref", INK, t["ref"]), ("C_equivariant", C[0], t["genCshort"]), ("E_projection_C", C[1], t["projC"])):
        x = d[f"{key}|{gam2}"]
        ax[0].hist(dEdt(x, float(gam2)), bins=bins, density=True, histtype="step", color=col, lw=1.6, label=lab)
    ax[0].set_xlabel(f"dE/dt  (Γ = {gam2})"); ax[0].set_ylabel(t["density"]); ax[0].legend(fontsize=7)
    ax[0].set_yscale("log")
    for j, key in enumerate(("A_reference", "C_equivariant")):
        ref, x = d[f"ref|{gam}"], d[f"{key}|{gam}"]
        ax[j + 1].scatter(ref[:3000, 0], ref[:3000, 1], s=1, color=LIGHT, rasterized=True)
        ax[j + 1].scatter(x[:3000, 0], x[:3000, 1], s=1, color=C[0], rasterized=True)
        ax[j + 1].set_xlabel("Q"); ax[j + 1].set_ylabel("D")
        p = f"{(x[:, 1] > 0).mean():.2f}"
        ax[j + 1].set_title(f"{t['var'][key]}, Γ = {gam} : P(D>0) = {p if lang == 'en' else p.replace('.', ',')}", fontsize=8.5)
    finish(fig, f"e1_symetrie_projection{suffix}", lang)


# ---------------------------------------------------------------------------
def e2(suffix="", lang="fr"):
    t = TXT[lang]
    r = load(f"e2_mhd2d{suffix}.json")
    res = r["resume"]
    keys = [k for k in ("V0_libre", "V1_penalite", "V2_proj_finale", "V3_flot_projete", "V4_potentiels",
                        "V5_potentiels_stat", "V5_temoin", "reference_sous_echantillon") if k in res]
    fig, ax = plt.subplots(1, 3, figsize=(10.5, 3.6), sharey=True)
    y = np.arange(len(keys))[::-1]
    for j, (key, lab) in enumerate((("div_rel_u", t["div"]), ("err_spectre_log10", t["spec"]), ("residu_bilan_energie", t["bal"]))):
        vals = np.array([max(res[k]["test"][key], 1e-17) for k in keys])
        cols = [INK2 if k == "reference_sous_echantillon" else C[0] for k in keys]
        ax[j].barh(y, vals, color=cols, height=0.62)
        ax[j].set_xscale("log"); ax[j].set_xlabel(lab, fontsize=8)
    ax[0].set_yticks(y); ax[0].set_yticklabels([t["e2var"][k] for k in keys])
    for a in ax:
        a._categ = True
    finish(fig, f"e2_mecanismes{suffix}", lang)

    # spectres moyens à un η de test
    d = np.load(RESULTS / f"e2_echantillons{suffix}.npz")
    kx, ky = d["kx"], d["ky"]
    shell = np.rint(np.sqrt(kx ** 2 + ky ** 2)).astype(int)

    def spectra(c):
        su = [(0.5 * (np.abs(c[:, 0]) ** 2 + np.abs(c[:, 1]) ** 2) * (shell == s)).sum(-1).mean() for s in range(1, 14)]
        sb = [(0.5 * (np.abs(c[:, 2]) ** 2 + np.abs(c[:, 3]) ** 2) * (shell == s)).sum(-1).mean() for s in range(1, 14)]
        return np.array(su), np.array(sb)
    fig, ax = plt.subplots(1, 2, figsize=(8.6, 3.3))
    ks = np.arange(1, 14)
    for name, col, lab in (("ref", INK, t["ref"]), ("V0_libre", C[1], t["e2var"]["V0_libre"]),
                           ("V4_potentiels", C[0], t["e2var"]["V4_potentiels"])):
        if name not in d:
            continue
        su, sb = spectra(d[name])
        ax[0].loglog(ks, su, color=col, label=lab, lw=2.2 if name == "ref" else 1.6)
        ax[1].loglog(ks, sb, color=col, label=lab, lw=2.2 if name == "ref" else 1.6)
    ax[0].set_xlabel(t["k"]); ax[0].set_ylabel(t["Eu"]); ax[1].set_xlabel(t["k"]); ax[1].set_ylabel(t["Eb"])
    ax[0].legend(fontsize=7.5)
    finish(fig, f"e2_spectres{suffix}", lang)

    # volet en loi : moyennes sur η de test
    law = dict(res["en_loi"])
    law["V5"] = res["V5_potentiels_stat"]
    fig, ax = plt.subplots(1, 3, figsize=(10, 3.4), sharey=True)
    modes = [("base", t["base"]), ("inclinaison", t["tilt"]), ("recalage", t["resc"]), ("V5", t["e2var"]["V5_potentiels_stat"])]
    y = np.arange(len(modes))[::-1]
    for j, (key, lab) in enumerate((("residu_bilan_energie", t["bal"]), ("std_diss_rel", "σ(D) / σ_ref(D)"),
                                    ("dist_energie_features", t["ed"]))):
        vals = [law[m]["test"][key] for m, _ in modes]
        ax[j].barh(y, vals, color=[C[0], C[2], C[1], C[3]], height=0.6)
        for yy, v in zip(y, vals):
            txt = f"{v:.2g}" if lang == "en" else f"{v:.2g}".replace(".", ",")
            ax[j].text(v, yy, " " + txt, va="center", fontsize=7.5, color=INK2)
        ax[j].set_xlabel(lab, fontsize=8)
        if key == "std_diss_rel":
            ax[j].axvline(1, color=INK2, ls="--", lw=1)
    ax[0].set_yticks(y); ax[0].set_yticklabels([lab for _, lab in modes])
    for a in ax:
        a._categ = True
    finish(fig, f"e2_en_loi{suffix}", lang)


# ---------------------------------------------------------------------------
def e3(suffix="", lang="fr"):
    t = TXT[lang]
    r = load(f"e3_abc{suffix}.json")
    rm = np.array([x["Rm"] for x in r["taux"]])
    lam = np.array([x["lambda"] for x in r["taux"]])
    fig, ax = plt.subplots(figsize=(5.6, 3.3))
    ax.axhline(0, color=INK2, lw=1)
    ax.fill_between(rm, 0, np.where(lam > 0, lam, 0), color=C[0], alpha=0.15, lw=0)
    ax.plot(rm, lam, "-o", color=C[0], ms=4, label="N = 32")
    conv = r.get("convergence", [])
    if conv:
        ax.plot([c["Rm"] for c in conv], [c["lambda_N48"] for c in conv], "s", color=C[1], ms=6, label="N = 48")
    ax.set_ylim(max(lam.min(), -0.06), lam.max() * 1.6)
    for s in r.get("seuils_interpoles", []):
        ax.axvline(s, color=INK2, ls=":", lw=1)
        lab = f" {s:.1f}" if lang == "en" else f" {s:.1f}".replace(".", ",")
        ax.text(s, ax.get_ylim()[1] * 0.9, lab, color=INK2, fontsize=7.5)
    ax.legend(fontsize=7.5, loc="lower right")
    ax.set_xlabel(t["rm"]); ax.set_ylabel(t["lam"])
    finish(fig, f"e3_abc{suffix}", lang)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")] or ["e1", "e2", "e3"]
    suffix = "_quick" if "--quick" in sys.argv else ""
    for a in args:
        for lang in ("fr", "en"):
            try:
                globals()[a](suffix, lang)
            except FileNotFoundError as e:
                print(f"{a} ({lang}) : résultats absents ({e.filename})")
