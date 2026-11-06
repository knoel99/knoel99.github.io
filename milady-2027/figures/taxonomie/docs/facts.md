# Facts — figure « taxonomie »

Sources : **[D]** description technique de la commande (workflow) ; **[N]** `specs/theorie-brief.md` (§1 tableau de la taxonomie, Propositions 1–7, Corollaire 6) ; **[No]** `specs/notations.md` ; **[C]** calcul illustratif `figure/data/make_densities.py` → `figure/data/densities.json`.

## Enregistrement géométrique
Aucun appareil physique n'est dessiné (le VKS n'apparaît que comme nom d'exemple). Les vignettes sont des espaces d'états abstraits : leur géométrie (droite, courbe, nuages) est un schéma, pas une mesure.

## Panneau a — chaînes affichées
| Chaîne (exacte) | Source | Remarque |
|---|---|---|
| « Vraie pour chaque échantillon » | [N] §1 colonne « Vraie pour » (C1, C2 : chaque échantillon) | C2 : « si aucune dérivée en temps n'intervient », dit dans la légende |
| « Vraie pour la loi » | [N] §1 (C3 : la loi ; C4 : la loi seulement) | |
| « C1 », « C2 », « C3 », « C4 » | [D], [N] §1 | |
| « Locale linéaire » | [D] « C1 locales linéaires » ; [N] « C1 locale linéaire » | singulier, comme [N] |
| « Locale non linéaire » | [D], [N] | |
| « Symétrie » | [D] « C3 symétries » ; [N] « C3 symétrie » | |
| « Statistique en loi » | [D] « C4 statistiques « en loi » » ; [N] « C4 statistique (stationnarité) » | |
| « *A***x** = 0 » (affiché « Ax = 0 ») | [N] §1 « x ∈ S, S = ker A » | |
| « *P* » | [N] Prop. 2 « P le projecteur orthogonal sur S » ; la projection de Leray est ce projecteur pour ∇·u = 0 | |
| « *c*(**x**) = 0 » (affiché « c(x) = 0 ») | [N] §1 forme de C2 | |
| « écart de Jensen » | [D] « pénalité/guidage (écart de Jensen) » ; [N] Prop. 3 | vignette : la moyenne de deux états admissibles n'est pas admissible |
| « *g*_#μ = μ » (affiché « g#μ = μ ») et « g » | [N] §1 forme de C3, *g* ∈ *G* | |
| « 𝔼_μ[ℒφ] = 0 » (affiché « 𝔼μ[ℒφ] = 0 ») | [D] « identités de stationnarité E[𝓛φ] = 0 » ; [N] §1 et Prop. 5 | ℒ (U+2112) pour le générateur 𝓛 |
| « dE/dt », « 0 » | [N] §1 remarque clé : d*E*/d*t* = *P* − ε | |
| « ∇·u = 0,  ∇·B = 0 » | [D], [N] §1 | |
| « Conditions aux limites » | [D] « conditions aux limites linéaires » ; [N] « conditions aux limites linéaires homogènes » | « linéaires homogènes » est porté par l'en-tête « Locale linéaire » et la légende (place) |
| « Résidu d'EDP stationnaire » (deux lignes « Résidu d'EDP », « stationnaire ») | [D] « résidu d'une EDP stationnaire » ; [N] « état stationnaire d'une EDP (Darcy dans PIDM) » | |
| « B ↦ −B » | [D] « B → −B » ; [N] §1 | flèche « ↦ » (application) pour la lisibilité de la police |
| « Rotation Rπ (VKS) » | [D] « rotation Rπ de VKS » ; [N] §1 | |
| « Bilan d'énergie » | [D] « bilan d'énergie moyen » | |
| « 𝔼[ε] = 𝔼[P] » | [D] « E[ε] = E[P] » ; [N] ⟨ε⟩ = ⟨P⟩ | |
| « Mécanisme adapté » | [N] §1 en-tête de colonne « Mécanisme adapté » | |
| « Potentiels B = ∇×A » | [D] « architecture (potentiels, rotationnel) » ; [N] Prop. 1 « B = ∇×A » ; [No] | |
| « Projection de Leray » | [D] | |
| « Projection non linéaire » | [D] ; [N] §1 « projection non linéaire (PCFM, ECI) » | |
| « Pénalité, guidage » | [D] « pénalité/guidage » | |
| « vθ équivariant » | [D] « champ de vitesse équivariant » ; [N] Prop. 4 ; [No] *v*_θ = champ de vitesse du flot | |
| « Loi de base invariante » | [D] ; [N] Prop. 4 | |
| « Perte de stationnarité » | [D] ; [N] Prop. 7 | |
| « Inclinaison exponentielle » | [D] ; [N] §1, Prop. 7 | |

## Panneau b — chaînes affichées
| Chaîne (exacte) | Source | Remarque |
|---|---|---|
| « Bilan d'énergie (C4) » | [D] « pour C4, trois lois de dE/dt » | |
| « Allures illustratives » | [D] « courbes qualitatives clairement présentées comme illustratives » | |
| « Loi vraie » | [D] « la loi vraie (étalée, moyenne nulle) » | |
| « Projection par échantillon » | [D] « la loi après projection de chaque échantillon sur dE/dt = 0 » | |
| « Correction en loi » | [D] « la loi après correction en loi (étalée, moyenne recentrée) » | |
| « μ » | [No] loi des données μ_λ | |
| « qθ » | [No] loi générée *q*_θ | modèle avant correction |
| « Dirac en 0 » | [D] « un pic de Dirac : fausse » ; [N] Cor. 6 | |
| « moyenne » | triangles = moyenne de d*E*/d*t* sous chaque loi [C] | |
| « 0 », « dE/dt » | axe partagé des trois graphes | pas d'autre graduation (qualitatif) |
| « Échantillons » | quantiles centrés de μ, *N* = 7 [C] | |
| « Poids wi » | [N] Prop. 7 « poids autonormalisés » ; *w*_i ∝ exp(β d*E*/d*t*_i), β tel que Σ *w*_i d*E*/d*t*_i = 0 [C] | |
| « 𝔼 = 0,  Var > 0 » | loi vraie et loi corrigée : moyenne nulle, dispersion conservée [N] Prop. 5, 7 | |
| « 𝔼 = 0,  Var = 0 » | projection par échantillon : variance ramenée à 0 [N] Cor. 6 (« variance de dE/dt ramenée à 0 », E1) | |

## Nombres du calcul illustratif [C] (dans la légende, jamais sur la figure)
- Unités : d*E*/d*t* divisé par l'écart type de μ.
- μ = 𝒩(0, 1) ; *q*_θ = 𝒩(0,6 ; 0,85²) (choix illustratifs, pas des mesures).
- I-projection de *q*_θ sur {𝔼[d*E*/d*t*] = 0} : β = −0,83 ; loi corrigée de moyenne 0 et d'écart type 0,85 (une gaussienne inclinée reste gaussienne, de même variance).
- Échantillon de 7 points (quantiles centrés de *q*_θ) : β_s = −1,11, poids de 0,40 à 0,025, taille effective ESS = 4,1.
