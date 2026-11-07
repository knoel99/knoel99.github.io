"""Condensé chiffré des résultats (Markdown) à partir des JSON : python3 digest.py > resultats/digest.md

Les pages du site citent ces valeurs ; ne pas recopier de chiffres d'ailleurs.
"""
from __future__ import annotations

import json
from pathlib import Path

R = Path(__file__).resolve().parent / "resultats"


def f(v, d=3):
    if v is None:
        return "–"
    if isinstance(v, (int,)) and not isinstance(v, bool):
        return str(v)
    if abs(v) != 0 and (abs(v) < 1e-3 or abs(v) >= 1e4):
        return f"{v:.2e}"
    return f"{v:.{d}g}"


def e1():
    p = R / "e1_gissinger.json"
    if not p.is_file():
        print("## E1 — résultats complets absents (calcul en cours)\n")
        return
    r = json.loads(p.read_text())
    res = r["resume"]
    print("## E1 — modèle de renversements de Gissinger (loi invariante conditionnée par Γ)\n")
    c = r["config"]
    print(f"Configuration : μ = {c['mu']}, ν = {c['nu']} ; Γ d'entraînement {c['G_train']} ; Γ de test {c['G_test']} ; "
          f"{c['trajectoires_par_Gamma']} trajectoires par Γ, durée gardée {c['duree_gardee']} ; itérations {c['iters']} ; "
          f"graines {c['seeds']} ; {c['n_gen']} échantillons générés par Γ ; Heun {c['pas_ODE_Heun']} pas ; MLP {c['largeur_MLP']}×{c['profondeur_MLP']} ; h_Rice = {c['h_Rice']}.\n")
    keys = [("energie", "dist. énergie"), ("sw1", "SW1"), ("asym", "|P(D>0)−½|"), ("liou_train_moy", "Liouville deg≤2"),
            ("liou_test_moy", "Liouville deg 3"), ("dEdt_std", "σ(dE/dt)"), ("erreur_pont", "err. P(|D|<0,25)"),
            ("erreur_taux_rice", "err. taux Rice")]
    for split in ("test", "train"):
        print(f"\n### Moyennes sur les Γ de {split} (moyenne des graines)\n")
        print("| variante | " + " | ".join(k[1] for k in keys) + " | ESS/N |")
        print("|---|" + "---|" * (len(keys) + 1))
        for v, d in res.items():
            if split in d:
                print(f"| {v} | " + " | ".join(f(d[split].get(k[0])) for k in keys) + f" | {f(d[split].get('ess_frac_b'))} |")
    print(f"\nPlanchers de bruit Monte-Carlo (sous-échantillon de la référence) : {json.dumps(res['planchers_bruit_MC'])}")
    print(f"Référence : {json.dumps(res['reference'])}\n")
    print("### Données : passages de D par 0 (simulation) et asymétrie des données d'entraînement\n")
    print("| Γ | taux simulation | taux Rice (réf.) | P(D>0) entraînement |")
    print("|---|---|---|---|")
    for g, s in sorted(r["donnees"].items(), key=lambda t: float(t[0])):
        print(f"| {g} | {f(s['taux_passages_simulation'])} | {f(s['taux_rice_reference'])} | {f(s.get('P(D>0)_train'))} |")
    print("\n### Grille fine (modèle C graine 0 et F graine 0)\n")
    print("| Γ | taux sim. | Rice réf. | Rice C | Rice F | pont réf. | pont C | pont F |")
    print("|---|---|---|---|---|---|---|---|")
    for x in r["grille_fine"]:
        print(f"| {x['Gamma']} | {f(x['taux_simulation'])} | {f(x['taux_rice_ref'])} | {f(x['taux_rice_modele'])} | "
              f"{f(x.get('taux_rice_modele_F'))} | {f(x['pont_ref'])} | {f(x['pont_modele'])} | {f(x.get('pont_modele_F'))} |")
    print(f"\nDurée totale : {r['duree_totale_s']:.0f} s.\n")


def e2():
    p = R / "e2_mhd2d.json"
    if not p.is_file():
        print("## E2 — absent\n")
        return
    r = json.loads(p.read_text())
    res, c = r["resume"], r["config"]
    print("## E2 — MHD 2D forcée, génération conditionnée par η\n")
    print(f"Configuration : N = {c['N']}, ν = {c['nu']}, α = {c['alpha']}, bande de forçage {c['kf']} ; η d'entraînement "
          f"{[round(e, 5) for e in c['eta_train']]} ; η de test {[round(e, 5) for e in c['eta_test']]} ; {c['modes']} modes de Fourier "
          f"indépendants ; dimension {c['dim_potentiels']} (potentiels) ou {c['dim_composantes']} (composantes) ; MLP largeur {c['largeur']}, "
          f"{c['iters']} itérations ; {c['n_gen']} échantillons par η ; {c['n_train_par_eta']} instantanés d'entraînement par η ; "
          f"injection (Itô) ε_u, ε_b, ε_{{a²}} = {[round(x, 5) for x in c['injection']]}.\n")
    keys = [("div_rel_u", "div. rel. u"), ("div_rel_b", "div. rel. B"), ("err_spectre_log10", "err. spectre"),
            ("err_Eu_rel", "err. E_u"), ("err_Eb_rel", "err. E_B"), ("residu_bilan_energie", "résidu énergie"),
            ("residu_bilan_Hc", "résidu H_c"), ("residu_bilan_A2", "résidu ⟨a²⟩"), ("std_diss_rel", "σ(D)/σ_ref"),
            ("dist_energie_features", "dist. énergie")]
    for split in ("test", "train"):
        print(f"\n### Moyennes sur les η de {split}\n")
        print("| variante | " + " | ".join(k[1] for k in keys) + " |")
        print("|---|" + "---|" * len(keys))
        for v, d in res.items():
            if v == "en_loi":
                continue
            print(f"| {v} | " + " | ".join(f(d[split][k[0]]) for k in keys) + " |")
        for m in ("base", "inclinaison", "recalage"):
            print(f"| en loi : {m} (V4, moitié b) | " + " | ".join(f(res['en_loi'][m][split][k[0]]) for k in keys) + " |")
    print(f"\nESS/N moyen de l'inclinaison : {f(res['en_loi']['ess_frac_b_moy'])}")
    print("\nTemps : " + json.dumps({k: {kk: round(vv, 4) if isinstance(vv, float) else vv for kk, vv in v.items()}
                                     for k, v in r["variantes"].items()}))
    print(f"\nDurée totale : {r['duree_totale_s']:.0f} s.\n")


def e3():
    p = R / "e3_abc.json"
    if not p.is_file():
        return
    r = json.loads(p.read_text())
    print("## E3 — dynamo cinématique ABC (A = B = C = 1, Rm = 1/η, N = 32)\n")
    print("| Rm | λ | λ (dernier quart) | div. rel. |")
    print("|---|---|---|---|")
    for t in r["taux"]:
        print(f"| {t['Rm']} | {f(t['lambda'], 4)} | {f(t['lambda_dernier_quart'], 4)} | {f(t['div_rel'])} |")
    print(f"\nConvergence N = 48 : {r['convergence']}")
    print(f"Seuils interpolés : {[round(s, 2) for s in r['seuils_interpoles']]}")
    print(f"Durée : {r['duree_s']:.0f} s.\n")


if __name__ == "__main__":
    print("# Condensé des résultats (généré par experiences/digest.py)\n")
    e1(); e2(); e3()
