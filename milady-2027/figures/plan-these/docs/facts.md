# Faits — figure « plan-these »

Sources : [D] description technique de l'appelant (verbatim dans `brief.md`) ; [T] note théorique `specs/theorie-brief.md` ; [N] `specs/notations.md` ; [R] notes de recherche vérifiées de la session (`scratchpad/research/encadrants.md`, `dynamo.md`, contre-vérifiées le 6 novembre 2026) ; [E1], [E2], [E3] expériences du stage (`experiences/`) ; [G12] Gissinger, Eur. Phys. J. B 85, 137 (2012) ; [B26] Bousquet, Ponty, Botez, Plihon, Nore, PRFluids 11, 063703 (2026) ; [Bo26] Botez, Giesecke, Nore, Cappanera, Stefani, PRFluids 11, 083701 (2026) ; [K17] Kreuzahler et al. (2017) (code LATU) ; [M07] Monchaux et al., PRL 98, 044502 (2007) ; [Z57] Zel'dovich, JETP 4, 460 (1957) ; [TDA] Cheng, Min, Liu, Arcucci, Comput. Phys. Commun. 306, 109359 (2025) (TorchDA). « mémoire » : connu mais non revérifié ici (web=off) ; aucune valeur de ce type n'est affichée.
« proposé » : choix de conception de ce plan (aucune source ne fixe le calendrier) ; à valider avec les encadrants.

## Fiches géométriques (avant tout dessin)

### Palier 3 — cuve VKS (vignette)
| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Cuve | cylindre d'axe horizontal, rapport longueur/diamètre ≈ 1,27 (diamètre intérieur 412 mm, longueur 524 mm), dessiné translucide | [R] dynamo.md l.116, [M07] |
| Turbines | deux disques coaxiaux près des deux fonds, rayon ≈ 0,75 R (154,5 mm), distants de 371 mm (± 0,90 R du plan médian) ; 8 pales courbes sur la face côté fluide (dessinées comme 8 traits radiaux courts, sens de courbure non signifiant) | [R], [M07] |
| Matériau des turbines | fer doux (μ_r = 16 dans la simulation de référence de [B26]) : gris plus foncé que la cuve ; c'est le « saut de μ » de l'axe 1 | [R] encadrants.md l.228–230, [B26] |
| Rotation | contrarotation : deux flèches courbes de sens opposés autour de l'axe, une à chaque turbine | [M07] |
| Arbres | un arbre par turbine, sortant de chaque fond | [M07] |
| Extérieur | isolant (« vide » pour **B**) : non dessiné, nommé dans l'axe 1 | [D], [R] |

### Palier 4 — DRESDYN (vignette)
| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Récipient | cylindre de rapport hauteur/diamètre ≈ 1 | mémoire (2 m × 2 m) ; non affiché |
| Rotation propre | flèche courbe autour de l'axe du cylindre | [D] « cylindre en précession » |
| Précession | axe vertical (tirets) avec flèche courbe en haut ; plateau tournant (ellipse) sous le cylindre | [D], mémoire |
| Angle entre les axes | dessiné à ≈ 60° ; réglable dans l'expérience | mémoire ; angle non affiché |
| Paramètre | nombre de Poincaré *Po* = rapport précession / rotation ; dynamo probable dans une fenêtre étroite en *Po* ; *Rm*_c sensible aux conditions aux parois | [Bo26] (via [R] encadrants.md l.236–240, 345–350) |
| Symétrie | modes quadrupolaires centro-symétriques et dipolaires centro-antisymétriques | [Bo26] via [R] |

### Palier 2 — boîte périodique (vignette)
| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Domaine | cube [0, 2π]³ périodique, vu en oblique (3 faces visibles) | [E3], [D] |
| Contenu | |**B**| du mode dynamo cinématique ABC (A = B = C = 1, *Rm* = 12, première fenêtre 8,9 < *Rm* < 17,5) sur les faces *x* = 2π, *y* = 0, *z* = 2π ; niveaux de gris normalisés | calculé : `experiences/resultats/e3_modes.npz` → `figure/data/make_data.py` ; fenêtre : [R] dynamo.md l.41 |
| Indices de la grille | (x, y, z) dans cet ordre (`meshgrid(..., indexing="ij")`) | `experiences/e3_abc.py` l.27, 32 |
| Périodicité | petites flèches qui sortent d'une face et rentrent par la face opposée | [D] « périodiques » |

### Palier 1 — MHD 2D (vignette)
| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Domaine | carré [0, 2π]² périodique | [E2] |
| Contenu | densité de courant *j* (niveaux de gris) et isolignes du potentiel *a* (lignes de champ de **B**, traits fins) d'un instantané de référence de E2 (|k_x|, |k_y| ≤ 10) | calculé : `experiences/resultats/e2_echantillons_quick.npz` → `make_data.py` |

### Palier 0 — modèle à 3 modes (vignette)
| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Courbe | série *D*(*t*) du modèle de Gissinger, d*Q*/d*t* = μ*Q* − *VD*, d*D*/d*t* = −ν*D* + *VQ*, d*V*/d*t* = Γ − *V* + *QD*, μ = 0,119, ν = 0,1, Γ = 0,9 (au-dessus de la crise des renversements, 0,86–0,87) ; fenêtre de 560 unités de temps contenant 3 renversements | [G12], [E1] (`experiences/e1_gissinger.py`), [T] §3 ; calculé `make_data.py` |
| Axes | ligne *D* = 0 en tirets ; pas de graduation (vignette) | — |
| DQVU | modèle de Galerkin réduit identifié sur les simulations VKS (POD, PySINDy sous contraintes) ; nommé seulement | [B26] via [R] encadrants.md l.234 |

## Grille paliers × axes (ce que chaque case affiche)
| Axe \ palier | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| 1 contraintes dures (C1) | sans objet : amplitudes modales, pas de champ discrétisé | potentiels ψ, *a* (**u** = ∇^⊥ψ, **B** = ∇^⊥*a*), validé dans E2 [T] Prop. 1 | **B** = ∇×**A** et jauge [D], forme rotationnelle validée dans E3 [T] §3 | conditions de vide et saut de perméabilité aux turbines [D], [R] (SFEMaNS traite ces sauts) | conditions aux parois (conductrices, perméables) qui déplacent *Rm*_c [Bo26] |
| 2 en loi et symétries (C3–C4) | **B** → −**B**, soit (*Q*, *D*, *V*) → (−*Q*, −*D*, *V*) ; identités de stationnarité (E1) [T] | bilan d'énergie en loi 𝔼[*P* − ε] = 0 (E2) [T] | bilans d'hélicité en 3D (prolongement de E2 : hélicité croisée) — proposé | symétrie *R*_π de VKS [T] taxonomie | centro-symétrie des modes de précession [Bo26] |
| 3 seuil et renversements | formule de Rice (fréquence des renversements depuis la loi, Prop. 8) ; crise Γ = 0,86–0,87 (E1) [T] | sans objet : pas de dynamo 2D [Z57] (formulation via Tobias, [R] dynamo.md l.441–442) | borne d'erreur près du seuil (Prop. 9) ; seuil *Rm*_c (E3 : ≈ 8,9 pour ABC) ; bifurcation sous-critique de Taylor–Green (Ponty et al. 2007) [R] | renversements de VKS simulés [B26] | seuil en fonction de *Po* [Bo26] |

## Calendrier (proposé)
| Élément | Mois | Source |
|---|---|---|
| Palier 0 (reprise E1, modèle DQVU) | 1–6 | proposé |
| Palier 1 (reprise E2, version GPU) | 1–9 | proposé |
| Palier 2 (ABC, Taylor–Green) | 6–20 | proposé |
| Palier 3 (VKS : SFEMaNS, LATU) | 15–33 | proposé |
| Palier 4 (DRESDYN) | 24–34 | proposé |
| Rédaction | 31–36 | proposé |
| Article 1 (axe 2 : contraintes en loi, paliers 0–1) | 10 | proposé |
| Version 1 du code dans la boîte à outils MilaDy (paliers 0–2, boîte périodique) | 16 | proposé ; « boîte à outils MilaDy » : [D] |
| Article 2 (axe 1 : contraintes dures 3D, paliers 2–3) | 22 | proposé |
| Version 2 du code (géométrie cylindrique) | 30 | proposé |
| Article 3 (axe 3 : seuil et renversements, paliers 2–4) | 33 | proposé |
| Soutenance | 36 | durée de 36 mois : [D] |

## Débouchés
| Élément | Source |
|---|---|
| Réduction de modèle (objectif (i) de l'ANR MilaDy : ROM des renversements ; objectif (ii) : ROM paramétriques pour DRESDYN) | [D], [R] litterature.md l.56 |
| Assimilation de données avec TorchDA (logiciel de S. Cheng, cité par le résumé ANR) | [D], [TDA], [R] encadrants.md l.60, 141 |

## Étiquettes affichées (registre ; chaînes telles que rendues, balisage entre parenthèses)
| Chaîne à l'écran | Source |
|---|---|
| "Bancs d'essai" | [D] « échelle de bancs d'essai » |
| "complexité croissante" | [D] |
| "E1–E3 : stage M2", "E1", "E2", "E3" | [T] §3 |
| "0", "1", "2", "3", "4" (numéros de palier) | [D] |
| "Modèles réduits" | [D] palier 0 |
| "Gissinger, DQVU" | [D], [G12], [B26] |
| "MHD 2D" , "périodique" | [D] palier 1 |
| "Dynamos 3D" , "périodiques" , "ABC, Taylor–Green" | [D] palier 2 |
| "VKS" , "SFEMaNS, LATU" | [D] palier 3, [R] |
| "DRESDYN" , "précession, HZDR" | [D] palier 4 |
| "D" , "t" (italiques, vignette du palier 0) | [G12] |
| "Axe 1" , "Contraintes dures 3D" | [D] axe 1 |
| "Axe 2" , "Contraintes en loi" , "et symétries" | [D] axe 2 |
| "Axe 3" , "Seuil dynamo" , "et renversements" | [D] axe 3 |
| "sans objet" | grille ci-dessus (axe 1, palier 0) |
| "potentiels ψ, a" (a italique) | [T] Prop. 1, [N] |
| "∇×A, jauge" (A gras) | [D], [T] Prop. 1 |
| "vide, saut de μ" (μ italique) | [D] |
| "parois conductrices" | [Bo26] |
| "B → −B" (B gras) | [D], [T] |
| "𝔼[P − ε] = 0" (P italique) | [T] §1 |
| "bilans d'hélicité" | proposé, [N] (hélicités) |
| "symétrie Rπ" (R italique, π en indice) | [T] taxonomie C3 |
| "centro-symétrie" | [Bo26] |
| "formule de Rice" | [D], [T] Prop. 8 |
| "pas de dynamo 2D" | [Z57] |
| "borne près de Rmc" (Rm italique, c en indice) | [D], [T] Prop. 9 |
| "renversements" | [D], [B26] |
| "Rmc(Po)" (Rm, Po italiques ; c en indice) | [Bo26] |
| "Boîte à outils MilaDy" | [D] |
| "Débouchés" , "Réduction de modèle" , "Assimilation (TorchDA)" | [D] |
| "Calendrier" , "36 mois" | [D] |
| "Année 1" , "Année 2" , "Année 3" | [D] |
| "0" , "6" , "12" , "18" , "24" , "30" , "36" , "mois" | graduation de la frise (36 mois [D]) |
| "rédaction" , "soutenance" | proposé |
| "article" , "version du code" (légende des jalons) | [D] « jalons (articles, code intégré à la boîte à outils MilaDy) » |
