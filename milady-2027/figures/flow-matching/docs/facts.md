# Facts — figure « flow-matching »

Pas d'objet physique : aucune géométrie d'appareil à enregistrer. Toutes les marques de données sont calculées par `figure/data/make_data.py` (numpy, graine 7) → `figure/data/flow-matching.json`.

## Modèle jouet (source : demande + `specs/theorie-brief.md` §0)
- Chemin linéaire x_t = (1 − t) x₀ + t x₁, x₀ ~ 𝒩(0, 1), x₁ ~ μ, couplage **indépendant** (demande ; note §0).
- Champ marginal exact v*(x, t) = 𝔼[x₁ − x₀ ∣ x_t = x] (note §0, minimiseur de la perte) ; pour un mélange de gaussiennes : v* = Σ_k w_k(x, t) [m_k + (t s_k² − (1 − t)) / σ_k²(t) · (x − t m_k)], σ_k²(t) = (1 − t)² + t² s_k², w_k ∝ π_k 𝒩(x ; t m_k, σ_k²(t)). Choix de conception (apprentissage parfait, v_θ = v*).
- Loi des données (a) = loi λ₂ (b) : ½ 𝒩(+1,5 ; 0,35²) + ½ 𝒩(−1,5 ; 0,35²) — symétrique (C3, B → −B). Choix illustratif.
- Loi λ₁ : 𝒩(0 ; 0,45²) — unimodale, symétrique. Choix illustratif (analogie « sous le seuil », légende seulement).
- Panneau a : 34 paires indépendantes ; grille 9 × 12 du champ (t ∈ [0,07 ; 0,93], x ∈ [−2,75 ; 2,75]) ; éventail : 7 chemins par (t* = 0,40 ; x* = 0,30), x₁ aux quantiles (i + ½)/7 du posterior p(x₁ ∣ x_t = x*) ; v*(x*, t*) = 0,611, moyenne des 7 pentes 0,593 ; poids des modes 0,72 / 0,28.
- Panneau b : 10 bruits aux quantiles (i + ½)/10 de 𝒩(0, 1) ; RK4, 400 pas ; arrivées λ₁ ∈ [−0,74 ; 0,74], λ₂ = ±[1,05 ; 1,95] (en 1D le flot est monotone : quantiles → quantiles).
- Panneau c : trajectoire λ₂ partant de x₀ = 0,126 (6ᵉ bruit de b) ; exacte (RK4, 800 pas) arrive en 1,051 ; Heun N = 4, h = 0,25 arrive en 1,004.

## Textes à l'écran (source)
Chaînes affichées (telles que le contrôle les extrait), avec leur source :
- « Chemins et champ marginal », « Conditionnement par λ », « Échantillonnage » : titres de panneaux, demande (panneaux a, b, c).
- « x », « t », « 0 », « 1 », « h » : axes (h : double flèche entre les grilles t = 0,5 et 0,75 du panneau c) ; convention flow matching de `specs/notations.md` (t ∈ [0, 1], t = 1 données) ; h = 1/N, N = 4 pas (choix).
- « x0 », « x1 », « xt » : extrémités et point de l'éventail ; notations `specs/notations.md`.
- « Loi de base », « 𝒩(0, I) » : demande (« loi de base gaussienne ») et note §0 (𝒩(0, I)).
- « Loi des données μ » : notations (μ_λ loi des données).
- « B », « −B » (« B → −B ») : demande (« clin d'œil à B → −B ») ; note §1, classe C3.
- « Chemin conditionnel  xt = (1 − t) x0 + t x1 » : demande et note §0.
- « Champ marginal  v(x, t) = 𝔼[x1 − x0 | xt = x] » : note §0 (minimiseur v⋆).
- « Même bruit », « Même champ vθ(x, t, λ) », « Lois cibles » : demande (« à partir du même bruit (le même champ v_θ(x, t, λ)) »).
- « λ1 », « λ2 » : demande (deux valeurs λ₁, λ₂).
- « dx/dt = vθ(x, t, λ) » : demande (EDO d'échantillonnage).
- « Exacte », « Heun », « Prédicteur » : demande (schéma de Heun) ; « Prédicteur » = étape d'Euler du schéma de Heun.

## Inventé (choix de conception, à signaler)
- Les deux lois jouets, leurs paramètres, la position de l'éventail, le nombre de paires et de pas, la trajectoire suivie en c.
- L'analogie λ₁ « sous le seuil » / λ₂ « au-dessus » (légende seulement).
- Les vignettes 2D (seconde coordonnée illustrative, décalage ±0,85).
