# Condensé des résultats (généré par experiences/digest.py)

## E1 — résultats complets absents (calcul en cours)

## E2 — MHD 2D forcée, génération conditionnée par η

Configuration : N = 32, ν = 0.008, α = 0.02, bande de forçage [2.0, 3.0] ; η d'entraînement [0.004, 0.00566, 0.008, 0.01131, 0.016, 0.02263] ; η de test [0.00476, 0.00673, 0.00951, 0.01345, 0.01903] ; 220 modes de Fourier indépendants ; dimension 880 (potentiels) ou 1760 (composantes) ; MLP largeur 1024, 6000 itérations ; 1000 échantillons par η ; 2400 instantanés d'entraînement par η ; injection (Itô) ε_u, ε_b, ε_{a²} = [0.04479, 0.04476, 0.00726].


### Moyennes sur les η de test

| variante | div. rel. u | div. rel. B | err. spectre | err. E_u | err. E_B | résidu énergie | résidu H_c | résidu ⟨a²⟩ | σ(D)/σ_ref | dist. énergie |
|---|---|---|---|---|---|---|---|---|---|---|
| V0_libre | 0.408 | 0.408 | 0.23 | 0.464 | 0.562 | 0.491 | 0.0182 | 0.543 | 0.68 | 4.31 |
| V1_penalite | 0.34 | 0.162 | 0.18 | 0.0995 | 1.68 | 0.895 | 0.00798 | 1.35 | 1.21 | 5.86 |
| V2_proj_finale | 5.05e-17 | 5.00e-17 | 0.168 | 0.222 | 0.337 | 0.469 | 0.0172 | 0.421 | 0.677 | 2.61 |
| V3_flot_projete | 2.03e-08 | 2.03e-08 | 0.135 | 0.0922 | 0.236 | 0.335 | 0.00595 | 0.322 | 0.565 | 1.85 |
| V4_potentiels | 1.78e-17 | 1.68e-17 | 0.168 | 0.261 | 0.369 | 0.472 | 0.0169 | 0.443 | 0.672 | 2.58 |
| V5_potentiels_stat | 1.74e-17 | 1.62e-17 | 0.0696 | 0.0668 | 0.0621 | 0.0611 | 0.0237 | 0.0612 | 0.788 | 0.699 |
| V5_temoin | 1.78e-17 | 1.67e-17 | 0.165 | 0.252 | 0.355 | 0.462 | 0.0143 | 0.43 | 0.663 | 2.52 |
| reference_sous_echantillon | 1.52e-17 | 0 | 0.00212 | 0.00261 | 0.00248 | 0.00661 | 0.0782 | 0.0265 | 0.998 | 0.00178 |
| en loi : base (V4, moitié b) | 1.78e-17 | 1.69e-17 | 0.168 | 0.268 | 0.36 | 0.47 | 0.0272 | 0.438 | 0.644 | 2.62 |
| en loi : inclinaison (V4, moitié b) | 1.76e-17 | 1.59e-17 | 0.143 | 0.098 | 0.115 | 0.193 | 0.388 | 0.143 | 0.204 | 4.15 |
| en loi : recalage (V4, moitié b) | 2.75e-17 | 2.71e-17 | 0.0804 | 0.113 | 0.188 | 8.27e-06 | 0.015 | 0.299 | 8.64e-04 | 1.1 |

### Moyennes sur les η de train

| variante | div. rel. u | div. rel. B | err. spectre | err. E_u | err. E_B | résidu énergie | résidu H_c | résidu ⟨a²⟩ | σ(D)/σ_ref | dist. énergie |
|---|---|---|---|---|---|---|---|---|---|---|
| V0_libre | 0.459 | 0.459 | 0.15 | 0.205 | 0.3 | 0.146 | 0.031 | 0.288 | 0.573 | 2.35 |
| V1_penalite | 0.312 | 0.14 | 0.177 | 0.0242 | 1.61 | 0.857 | 0.0147 | 1.28 | 1.07 | 5.57 |
| V2_proj_finale | 5.46e-17 | 5.42e-17 | 0.096 | 0.0526 | 0.105 | 0.135 | 0.03 | 0.184 | 0.57 | 1.09 |
| V3_flot_projete | 1.94e-08 | 1.95e-08 | 0.109 | 0.118 | 0.153 | 0.172 | 0.0187 | 0.203 | 0.612 | 1.12 |
| V4_potentiels | 1.70e-17 | 1.58e-17 | 0.0925 | 0.0374 | 0.114 | 0.174 | 0.0289 | 0.17 | 0.666 | 1.03 |
| V5_potentiels_stat | 1.69e-17 | 1.60e-17 | 0.0826 | 0.0543 | 0.0814 | 0.0708 | 0.0299 | 0.0884 | 0.568 | 0.863 |
| V5_temoin | 1.70e-17 | 1.59e-17 | 0.0955 | 0.0487 | 0.121 | 0.185 | 0.0292 | 0.179 | 0.653 | 1.11 |
| reference_sous_echantillon | 1.50e-17 | 0 | 0.0114 | 0.0226 | 0.0164 | 0.0112 | 0.0251 | 0.0125 | 1.01 | 0.0304 |
| en loi : base (V4, moitié b) | 1.70e-17 | 1.59e-17 | 0.0931 | 0.0406 | 0.115 | 0.175 | 0.0365 | 0.171 | 0.674 | 1.03 |
| en loi : inclinaison (V4, moitié b) | 1.74e-17 | 1.63e-17 | 0.0878 | 0.149 | 0.0843 | 0.0253 | 0.133 | 0.0324 | 0.396 | 1.59 |
| en loi : recalage (V4, moitié b) | 2.85e-17 | 2.81e-17 | 0.0472 | 0.0688 | 0.0515 | 2.07e-16 | 0.0294 | 0.116 | 1.40e-15 | 0.422 |

ESS/N moyen de l'inclinaison : 0.287

Temps : {"V0_libre": {"temps_entrainement_s": 1199.9813, "temps_generation_s_par_echantillon": 0.0074}, "V1_penalite": {"temps_entrainement_s": 1059.0879, "temps_generation_s_par_echantillon": 0.0189}, "V2_proj_finale": {"temps_entrainement_s": 0.0, "temps_generation_s_par_echantillon": 0.0059}, "V3_flot_projete": {"temps_entrainement_s": 424.0978, "temps_generation_s_par_echantillon": 0.0064}, "V4_potentiels": {"temps_entrainement_s": 304.9478, "temps_generation_s_par_echantillon": 0.0045}, "V5_potentiels_stat": {"temps_reglage_fin_s": 460.1759, "iters": 600, "beta": 50.0}, "V5_temoin": {"temps_reglage_fin_s": 79.2724, "iters": 600, "beta": 0.0}}

Durée totale : 4023 s.

## E3 — dynamo cinématique ABC (A = B = C = 1, Rm = 1/η, N = 32)

| Rm | λ | λ (dernier quart) | div. rel. |
|---|---|---|---|
| 2 | -0.5001 | -0.5 | 3.05e-19 |
| 4 | -0.1511 | -0.151 | 5.06e-17 |
| 6 | -0.04598 | -0.04573 | 4.61e-17 |
| 8 | -0.007649 | -0.008009 | 8.89e-17 |
| 8.5 | -0.002755 | -0.003069 | 9.74e-17 |
| 9 | 9.61e-04 | 7.58e-04 | 8.31e-17 |
| 9.5 | 0.003694 | 0.003667 | 7.51e-17 |
| 10 | 0.00557 | 0.00578 | 8.04e-17 |
| 11 | 0.007483 | 0.008049 | 6.97e-17 |
| 12 | 0.007653 | 0.00803 | 9.28e-17 |
| 13 | 0.007328 | 0.008161 | 1.23e-16 |
| 14 | 0.006042 | 0.005958 | 9.88e-17 |
| 15 | 0.004152 | 0.002831 | 8.45e-17 |
| 16 | 0.002858 | 0.0036 | 1.21e-16 |
| 17 | 0.001394 | 0.002367 | 9.47e-17 |
| 17.5 | 2.34e-04 | -2.17e-04 | 9.56e-17 |
| 18 | -9.07e-04 | -0.002641 | 1.03e-16 |
| 19 | -0.002205 | -0.002479 | 1.24e-16 |
| 20 | -0.003185 | -9.37e-04 | 1.01e-16 |
| 22 | -0.004749 | -0.005808 | 1.52e-16 |
| 24 | -0.005743 | -0.004698 | 1.04e-16 |
| 26 | -0.002578 | -3.80e-04 | 1.27e-16 |
| 28 | 0.003897 | 0.005553 | 1.25e-16 |
| 30 | 0.01043 | 0.01113 | 1.35e-16 |

Convergence N = 48 : [{'Rm': 12, 'lambda_N48': 0.008124492445079802}, {'Rm': 17.5, 'lambda_N48': -0.0005204871455609309}]
Seuils interpolés : [8.87, 17.6, 26.8]
Durée : 1366 s.

