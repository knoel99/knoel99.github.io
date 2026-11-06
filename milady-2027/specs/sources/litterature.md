# État de l'art : modèles génératifs sous contraintes physiques pour les EDP (2020–2026)

## Bilan de vérification (vérificateur indépendant, 6 novembre 2026)

**Méthode.** Chaque référence a été rouverte sur une source primaire, sans reprendre les URL du fichier telles quelles :
- API arXiv pour les 53 identifiants (titre, auteurs, dates, commentaire, journal-ref) ;
- API Crossref pour les 21 DOI ;
- pages d'actes (PMLR, JMLR, ICLR, NeurIPS, ML Anthology, prix AISTATS 2024) ;
- PMC pour FunDiff, Solera-Rico, CoNFiLD et GenCast ;
- texte intégral des 53 PDF arXiv, pour chaque chiffre et chaque équation ;
- PDF de l'offre et page ANR.

**Décompte.** 55 entrées bibliographiques :
- **46 [vérifié]**, dont 5 complétées par un DOI ou des pages ;
- **9 [corrigé]** ;
- **0 [NON CONFIRMÉ]** : aucune référence introuvable.

Trois détails secondaires restent non confirmés (voir « Non confirmé » en fin de fichier).

**Corrections importantes :**
1. **ECI : l'« incohérence ×310 vs ×4,9 » n'existe pas.** Le Tableau 4 donne la mémoire par lot : 5,4 Go pour 128 échantillons contre 26,4 Go pour 2 échantillons (D-Flow). Par échantillon, l'écart est d'environ ×313, cohérent avec le « ×310 » du texte. L'affirmation inverse du rapport de recherche est fausse.
2. **Solera-Rico et al.** : tous les chiffres (89,8 % / 64,4 % / 69 modes, β = 0,05, d = 20, 78,1 % / 64,6 %) sont confirmés dans la **version publiée** (PMC10866995). Ils ne viennent pas seulement du préprint.
3. **Eivazi et al.** : 87,36 % contre 32,41 % est confirmé dans l'article d'Eivazi lui-même.
4. **Albergo, Boffi, Vanden-Eijnden** : *JMLR* 26(209):1–80 (2025). Le volume était noté non confirmé.
5. **« Project and Generate »** : la divergence O(10⁻⁷) et la divergence (« Inf ») du flow matching non contraint à Re = 1000 sont vérifiées dans le Tableau 1.
6. **Genuist et al. 2026** :
   - le texte nomme aussi l'écoulement « Kolmogorov flow », mais il s'agit d'une turbulence en déclin non forcée avec frottement d'Ekman ;
   - sur Taylor–Green hors distribution, L a la meilleure MSE mais une divergence non nulle (ε_div 1,84×10⁻²).
7. **Galletti et al. 2026** : le titre réel est « A Shortcut to Statistically Steady-State Turbulence with Flow Matching ». GyroFlow est le nom du modèle.
8. **Statuts confirmés** : DDPM à NeurIPS 2020, prix AISTATS 2024 de FFM, PDM et D-Flow (DOI, pages PMLR).
9. **FunDiff** : « below 10% » (Burgers) ne figure que dans la version publiée (PMC), pas dans arXiv v2.

**Confirmé sans changement :**
- **FunDiff** : référence (Nat. Commun. 17, 5749, DOI, dates, T.-R. Liu au Laboratoire Navier de l'ENPC) et équations dans l'article (ψ avec u = ∂ψ/∂y, v = −∂ψ/∂x ; γ = [cos x, sin x, cos y, sin y] ; symétrie à 4 évaluations ; L_PDE ; rectified flow ; z̃₁ = z₁ + E(c)). Erreur de 5,12 %.
- **PIDM** : Éq. 14, c = 10⁻³ / 10⁻⁵, +23 % / +69 %, Tableau 1.
- **Genuist** : citations et Tableaux 1 et 2.
- **PCDM** : environ ×5, soit 12 jours contre 56.
- **Kacmaz** : Tableau 1.
- **Fukami & Taira** : référence et chiffres confirmés.
- **GenCast** : 97,2 % contre 97,4 %.

L'absence de modèle génératif sur des simulations de dynamo reste une affirmation négative. Une recherche complémentaire (API arXiv, web) ne l'a pas contredite.

---

Base de faits pour le site, le rapport de stage prospectif et le sujet de thèse **MilaDy** (stage M2 « Physics-Constrained Generative AI Modelling of Parametric Dynamical Systems », CEREA/ENPC).
Consultation des sources : 6 novembre 2026. Chaque fait est suivi de l'URL réellement ouverte. Les jugements de synthèse (non issus d'une source) sont marqués **[synthèse]**.

Convention : « dure » = contrainte satisfaite par construction ou à la précision machine ; « douce » = pénalité ou guidage qui réduit la violation sans l'annuler.

---

## 0. Contexte vérifié (offre et projet ANR)

- **Offre de stage** [vérifié] (PDF : https://scheng2024.github.io/stage_milady_2027.pdf). Travaux : (i) modèles génératifs conditionnels par diffusion ou flow matching de champs physiques conditionnés par des paramètres ; (ii) contraintes issues des EDP et des conditions aux limites, imposées « through model design, training losses, or sampling procedures » ; (iii) validation sur EDP simples puis champs MHD avec métriques « energy spectra, helicity, divergence control, and topology preservation ». Livrable attendu : « A comparative study of physics-constrained generative modelling strategies for parameter-dependent MHD fields ». Durée 5–6 mois à partir du printemps 2027, ENPC Champs-sur-Marne ; thèse financée possible. Références de l'offre : FunDiff (Wang et al. 2026), Fukami & Taira 2023 ; « Other References » : Bansal et al. 2024, Bastek et al. 2025, Solera-Rico et al. 2024.
- **Projet ANR MilaDy** [vérifié] (ANR-25-CE51-0077, https://anr.fr/Projet-ANR-25-CE51-0077) : « Modélisation par apprentissage automatique des dynamos turbulentes ». Coordinatrice Caroline Nore (LISN). Partenaires : LISN, Lagrange (Observatoire de la Côte d'Azur), CEREA (ENPC). Aide ANR 560 612 €, 48 mois, début janvier 2026. Objectifs : (1) étudier les renversements de champ magnétique et les phénomènes dynamo « explosifs » par méthodes guidées par les données, construire des ROM qui reproduisent précurseur, renversement et rebond ; (2) optimiser l'expérience DRESDYN (cylindre en précession) via des ROM paramétriques (rapport fréquence de précession / rotation).

---

## 1. Fondations : diffusion et modèles à score

### 1.1 Ho, Jain, Abbeel (2020) — DDPM [corrigé : lieu « non vérifié » → NeurIPS 2020 confirmé (ML Anthology)]
- Réf. : J. Ho, A. Jain, P. Abbeel, « Denoising Diffusion Probabilistic Models », NeurIPS 2020. arXiv:2006.11239 (v1 19 juin 2020, v2 16 déc. 2020). https://arxiv.org/abs/2006.11239
- Apport : processus direct de bruitage gaussien à pas discrets, réseau entraîné à prédire le bruit, échantillonnage par chaîne de Markov inverse.
- Chiffres (résumé) : CIFAR-10 non conditionnel **FID 3,17**, **Inception score 9,46** ; LSUN 256×256 de qualité « similar to ProgressiveGAN ».
- Contrainte physique : aucune.
- Lieu : **NeurIPS 2020** confirmé sur https://mlanthology.org/neurips/2020/ho2020neurips-denoising/ (la page arXiv ne le mentionne pas).

### 1.2 Song, Sohl-Dickstein, Kingma, Kumar, Ermon, Poole (2021) — Score SDE [vérifié]
- Réf. : « Score-Based Generative Modeling through Stochastic Differential Equations », **ICLR 2021 (Oral)** (commentaire arXiv). arXiv:2011.13456. https://arxiv.org/abs/2011.13456
- Apport : unifie DDPM et score matching sous forme d'EDS directe/inverse ; introduit l'ODE de flot de probabilité (échantillonnage déterministe et vraisemblance exacte) et l'échantillonnage prédicteur-correcteur.
- Chiffres (résumé) : CIFAR-10 **IS 9,89**, **FID 2,20**, **2,99 bits/dim** ; première génération 1024×1024 par modèle à score.
- Contrainte physique : aucune. Cadre réutilisé par CoCoGen, SDA, DDO.

### 1.3 Karras, Aittala, Aila, Laine (2022) — EDM [vérifié]
- Réf. : « Elucidating the Design Space of Diffusion-Based Generative Models », **NeurIPS 2022** (commentaire arXiv). arXiv:2206.00364. https://arxiv.org/abs/2206.00364
- Apport : sépare les choix de conception (préconditionnement du réseau, planning de bruit, échantillonneur) ; échantillonneur rapide.
- Chiffres (résumé) : CIFAR-10 **FID 1,79** (conditionnel) et **1,97** (non conditionnel) avec **35 évaluations réseau** par image ; ImageNet-64 : FID 2,07 → **1,55** (modèle pré-entraîné), **1,36** après réentraînement.
- Usage EDP : DiffusionPDE suit le débruiteur EDM (https://arxiv.org/html/2406.17763v2) ; GenCast suit le cadre EDM (https://pmc.ncbi.nlm.nih.gov/articles/PMC11666454/) ; Genuist et al. 2026 utilisent un « vanilla EDM » comme référence (https://arxiv.org/html/2601.19368).

### 1.4 Ho & Salimans (2022) — Classifier-free guidance (CFG) [vérifié]
- Réf. : J. Ho, T. Salimans, « Classifier-Free Diffusion Guidance », arXiv:2207.12598 (26 juil. 2022). Version courte au **NeurIPS 2021 Workshop on Deep Generative Models and Downstream Applications**. https://arxiv.org/abs/2207.12598
- Apport : un seul réseau entraîné conditionnel et non conditionnel (on remplace la condition par ∅ avec probabilité p_uncond) ; à l'échantillonnage, **ε̃ = (1+w)·ε(z,c) − w·ε(z)** (Éq. 6). https://ar5iv.labs.arxiv.org/html/2207.12598
- Chiffres : p_uncond testé à 0,1 / 0,2 / 0,5 (0,1 et 0,2 équivalents, 0,5 moins bon). ImageNet 64×64 : FID 1,8 (w=0) ; **meilleur FID 1,55** (w=0,1) ; FID 26,22 / IS 260,2 à w=4. ImageNet 128×128 : FID 7,27 (w=0) → **2,43** (w=0,3).
- Pertinence MilaDy **[synthèse]** : mécanisme standard pour conditionner sur (Re, Rm, propriétés matériaux). Shu et al. 2023 l'utilisent avec le gradient du résidu EDP comme « condition » (voir 3.4).

### 1.5 Chung, Kim, McCann, Klasky, Ye (2023) — DPS [vérifié]
- Réf. : « Diffusion Posterior Sampling for General Noisy Inverse Problems », **ICLR 2023 (spotlight)**. arXiv:2209.14687. https://arxiv.org/abs/2209.14687
- Méthode : estimation de Tweedie x̂₀ = (1/√ᾱᵢ)(xᵢ + (1−ᾱᵢ)ŝ), puis pas de gradient x_{i−1} ← x'_{i−1} − ζᵢ ∇_{xᵢ}‖y − 𝒜(x̂₀)‖² ; ζᵢ = ζ'/‖y − 𝒜(x̂₀)‖. Approximation p(y|x_t) ≃ p(y|x̂₀) dont l'erreur est quantifiée par l'**écart de Jensen** (borne qui décroît quand σ croît). https://ar5iv.labs.arxiv.org/html/2209.14687
- Chiffres : FFHQ « about 95 seconds per image (1000 NFE) » sur une RTX 2080Ti.
- Contrainte : guidage à l'échantillonnage, **douce**. Base de DiffusionPDE, CoNFiLD, PISD, SDA (version améliorée).

### 1.6 Bansal, Chu, Schwarzschild, Sengupta, Goldblum, Geiping, Goldstein (2024) — Universal guidance [vérifié]
- Réf. : « Universal Guidance for Diffusion Models », **ICLR 2024**. arXiv:2302.07121 (14 fév. 2023). Actes : https://proceedings.iclr.cc/paper_files/paper/2024/hash/dfbb3d1807b21dadee735eb75069ada4-Abstract-Conference.html ; arXiv : https://arxiv.org/abs/2302.07121
- Méthode (https://arxiv.org/html/2302.07121) :
  - *Forward guidance* : ẑ₀ = (z_t − √(1−α_t)ε_θ)/√α_t puis ε̂ = ε_θ + s(t)·∇_{z_t} ℓ(c, f(ẑ₀)), avec f un réseau de guidage quelconque (non entraîné sur des données bruitées).
  - *Backward guidance* : Δz₀ = argmin_Δ ℓ(c, f(ẑ₀+Δ)) par m pas de descente, puis ε̃ = ε_θ − √(α_t/(1−α_t))·Δz₀ ; « prioritizes enforcing the constraint ».
  - *Per-step self-recurrence* : re-bruitage z′_t = √(α_t/α_{t−1}) z_{t−1} + √(1−α_t/α_{t−1}) ε′, répété k fois.
- Hyperparamètres rapportés : Stable Diffusion + CLIP s(t)=10·√(1−α_t), k=8, m=0 ; segmentation s=400·√(1−α_t), k=10 ; reconnaissance faciale s=20000·√(1−α_t), k=2. Le papier précise que les hyperparamètres doivent être choisis par réseau de guidage.
- Contrainte : **douce**, à l'échantillonnage, sans réentraînement. Coût **[synthèse]** : k × (forward + rétropropagation à travers f) par pas.
- Remarque : les actes ICLR écrivent « Roni Sengupta », arXiv/OpenReview « Soumyadip Sengupta » (même personne selon l'usage courant ; identité non vérifiée formellement, voir « Non confirmé »). L'offre de stage cite « Sengupta, R. ».

---

## 2. Flow matching, interpolants stochastiques, génératif en espace de fonctions

### 2.1 Lipman, Chen, Ben-Hamu, Nickel, Le (2023) — Flow Matching [vérifié]
- Réf. : « Flow Matching for Generative Modeling », **ICLR 2023** (https://mlanthology.org/iclr/2023/lipman2023iclr-flow/, OpenReview id PqvMRDCJT9t). arXiv:2210.02747. https://arxiv.org/abs/2210.02747
- Apport : entraînement sans simulation de CNF par régression d'un champ de vitesse sur des chemins de probabilité conditionnels gaussiens ; les chemins de diffusion sont un cas particulier ; le chemin de déplacement OT est plus efficace (entraînement et échantillonnage plus rapides).
- Statut « spotlight » : **[NON CONFIRMÉ]** (OpenReview inaccessible ; un miroir des listes ICLR 2023 indique « notable top 25 % »). Voir section finale.

### 2.2 Liu, Gong, Liu (2023) — Rectified flow [vérifié]
- Réf. : X. Liu, C. Gong, Q. Liu, « Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow », **ICLR 2023** (https://mlanthology.org/iclr/2023/liu2023iclr-flow/). arXiv:2209.03003. https://arxiv.org/abs/2209.03003
- Méthode : min ∫₀¹ E‖(X₁−X₀) − v(X_t,t)‖² dt avec X_t = tX₁ + (1−t)X₀ ; « reflow » itératif qui redresse les trajectoires. https://ar5iv.labs.arxiv.org/html/2209.03003
- Chiffre : « state-of-the-art result of FID (4.85) and recall (0.51) on CIFAR10 for one-step » (introduction).
- Usage EDP : **FunDiff entraîne son DiT latent par rectified flow** (https://arxiv.org/html/2506.07902v2).

### 2.3 Albergo & Vanden-Eijnden (2023) ; Albergo, Boffi, Vanden-Eijnden (JMLR 2025) — Interpolants stochastiques [vérifié (réf. 1) ; corrigé (réf. 2) : volume JMLR « non confirmé » → *JMLR* 26(209):1–80, 2025]
- Réf. 1 : M. S. Albergo, E. Vanden-Eijnden, « Building Normalizing Flows with Stochastic Interpolants », **ICLR 2023**. arXiv:2209.15571. https://arxiv.org/abs/2209.15571 — perte quadratique sur la vitesse, sans rétropropagation à travers un solveur d'ODE ; compétitif avec la diffusion sur CIFAR-10 et ImageNet 32×32, jusqu'à 128×128.
- Réf. 2 : M. S. Albergo, N. M. Boffi, E. Vanden-Eijnden, « Stochastic Interpolants: A Unifying Framework for Flows and Diffusions », ***JMLR* 26(209):1–80 (2025)** (https://jmlr.org/papers/v26/23-1605.html ; bib JMLR ouverte). arXiv:2303.08797 (v4, 9 oct. 2025, commentaire « JMLR Version »). https://arxiv.org/abs/2303.08797 — unifie ODE et EDS à coefficient de diffusion réglable ; retrouve le pont de Schrödinger si l'interpolant est optimisé.
- Réf. 2 : volume, numéro et pages confirmés par la page et le fichier .bib de JMLR (soumis 12/23, publié 9/25).

### 2.4 Tong et al. (2024) — OT-CFM [vérifié]
- Réf. : A. Tong, K. Fatras, N. Malkin, G. Huguet, Y. Zhang, J. Rector-Brooks, G. Wolf, Y. Bengio, « Improving and generalizing flow-based generative models with minibatch optimal transport », **TMLR 2024** (https://mlanthology.org/tmlr/2024/tong2024tmlr-improving/). arXiv:2302.00482. https://arxiv.org/abs/2302.00482
- Apport : *generalized conditional flow matching* (CFM), sans source gaussienne obligatoire ; la variante OT-CFM (couplage OT par mini-lot) donne des flots plus simples, plus stables à entraîner et plus rapides à l'inférence.

### 2.5 Kerrigan, Migliorini, Smyth (2024) — Functional Flow Matching (FFM) [corrigé : prix « vu en résultat de recherche » → confirmé sur la page officielle AISTATS 2024]
- Réf. : « Functional Flow Matching », **AISTATS 2024, PMLR 238:3934–3942**. https://proceedings.mlr.press/v238/kerrigan24a.html ; arXiv:2305.17209. Prix « Outstanding Student Paper » : confirmé sur https://aistats.org/aistats2024/awards.html (la page UCI https://ics.uci.edu/2024/05/30/mlstats-collaboration-leads-to-outstanding-student-paper-at-aistats/ renvoyait une erreur 503 lors de la vérification).
- Apport : flow matching en dimension infinie ; chemin de mesures depuis une mesure gaussienne fixe ; sans vraisemblance ni simulation.
- Usage : prior FFM + FNO pour ECI (https://arxiv.org/html/2412.01786v2) ; baseline dans PCFM.

### 2.6 Lim et al. (2025) — Diffusion à score en espace de fonctions (DDO) [vérifié]
- Réf. : J. H. Lim, N. B. Kovachki, R. Baptista, C. Beckham, K. Azizzadenesheli, J. Kossaifi, V. Voleti, J. Song, K. Kreis, J. Kautz, C. Pal, A. Vahdat, A. Anandkumar, « Score-Based Diffusion Models in Function Space », **JMLR 26(158):1–62, 2025**. https://jmlr.org/papers/v26/23-1472.html ; arXiv:2302.07400.
- Apport : *Denoising Diffusion Operators* ; bruitage par processus gaussien, dynamique de Langevin à valeurs fonctionnelles, coût d'échantillonnage indépendant de la résolution. Tests : Navier–Stokes, InSAR volcanique, MNIST-SDF.

---

## 3. Modèles génératifs pour EDP et écoulements

### 3.1 FunDiff — Wang, Dou, Shan, Liu, Lu (2026) ★ référence principale de l'offre [vérifié]
- **Réf. vérifiée** : S. Wang, Z. Dou, S. Shan, T.-R. Liu, L. Lu, « FunDiff: diffusion models over function spaces for physics-informed generative modeling », ***Nature Communications* 17, 5749 (2026)**, **DOI 10.1038/s41467-026-72292-0**. Reçu 7 juil. 2025, accepté 7 avr. 2026, publié **27 avr. 2026**. https://pmc.ncbi.nlm.nih.gov/articles/PMC13324421/ — Préprint arXiv:2506.07902 (v1 9 juin 2025, v2 25 nov. 2025). https://arxiv.org/abs/2506.07902
- Affiliations (PMC) : Yale (Wang, Dou, Shan, Lu) ; **Tong-Rui Liu : Laboratoire Navier, École nationale des ponts et chaussées** (même établissement que le CEREA → contact local potentiel **[synthèse]**). Code : https://github.com/sifanexisted/fundiff
- **Architecture** (https://arxiv.org/html/2506.07902v2) :
  - *Function autoencoder (FAE)*. Encodeur : patchification de type ViT, embeddings positionnels entraînables interpolés (discrétisations variables), **cross-attention de type Perceiver** (N requêtes latentes apprises), puis blocs Transformer. Décodeur : de type **CViT** ; coordonnées de requête encodées (Fourier features aléatoires ou grille), K blocs de cross-attention (requêtes = coordonnées, clés/valeurs = latents), MLP de sortie → fonction évaluable en tout point.
  - Hyperparamètres : encodeur 8 couches, décodeur 4 couches, dim. 256, MLP 512 ; DiT 8 blocs, dim. 256, 8 têtes, AdaLN-Zero.
  - *Diffusion latente* : DiT entraîné par **rectified flow** ; conditionnement par mesures grossières c encodées par l'encodeur FAE gelé et ajoutées : z̃₁ = z₁ + E(c) ; 20–50 évaluations typiques (100 pas pour l'exemple sinusoïdal).
  - Entraînement : FAE (MSE sur points aléatoires, 4 096 points/échantillon, AdamW, lot 16, sous-échantillonnage aléatoire ×1/2/4/8) puis DiT (FAE gelé, lot 128, 10⁵ itérations).
- **Imposition des contraintes** :
  - **Divergence nulle (dure, architecture)** : le décodeur produit une **fonction de courant ψ**, u = ∂ψ/∂y, v = −∂ψ/∂x (Kolmogorov). Divergence prédite « negligible » ; sans contrainte « higher » / « large » (Fig. S1–S3). **Aucune valeur numérique** dans le texte.
  - **Périodicité (dure, architecture)** : embedding γ(x,y) = [cos x, sin x, cos y, sin y] → période 2π sur [0,2π]² (approche de « hard constraint » citée à Lu et al. 2021).
  - **Résidu d'EDP (douce, perte)** : L_PDE = ‖R(f̂)‖², dérivées par différentiation automatique (Burgers ; w_data = 100, w_physics = 1).
  - **Symétrie (dure, architecture)** : D(z,x,y)+D(z,1−x,y)+D(z,x,1−y)+D(z,1−x,1−y) (élasticité linéaire).
- **Benchmarks et chiffres** :
  - Sinusoïde amortie : n = 16 à 256 échantillons d'entraînement, 8 192 échantillons générés.
  - **Kolmogorov 2D, Re = 1000**, forçage −4cos(4x₂) − 0,1ω, domaine (0,2π)² ; données : solveur pseudo-spectral 2048² → 256², **40 séquences** de 10 s, Δt = 1/32 s, 320 trames. Reconstruction 64×64 + 20 % de bruit ; spectres corrects jusqu'à k ~ O(10²) puis composantes haute fréquence artificielles. Baselines : FNO, ViT, UNet, CViT, DPOT, CNextU-Net, AViT, DPS, DiffusionPDE, Spatially-Aware Diffusion (erreurs uniquement en figure 3d–e).
  - **Burgers** (ν = 0,001, 4 000 CI GRF, 200×201) : erreur L2 relative « below 10% » (phrase présente dans la version publiée PMC, absente d'arXiv v2) ; résidu « O(10⁻²) » (Fig. S4).
  - **Élasticité linéaire** (7 500 RVE 256×256) : **erreur L2 relative 5,12 %** à 256×256 depuis 32×32 + 10 % de bruit (Fig. 5a).
  - Transfert de masse turbulent (RANS, 900 entraînement / 55 test) : uniquement graphique.
- **Théorie** : taux minimax pour l'estimation de densité en dimension infinie ; boule RKHS (décroissance polynomiale) W₁ ≲ (log log n / log n)^β ; borne inférieure (1/log n)^β, écart O(poly(log log n)).
- Coût d'entraînement GPU : **non rapporté** dans le texte lu.

### 3.2 PIDM — Bastek, Sun, Kochmann (2025) ★ référence de l'offre [vérifié]
- **Réf. vérifiée** : J.-H. Bastek, W. Sun, D. M. Kochmann, « Physics-Informed Diffusion Models », **ICLR 2025** (« ICLR 2025 camera ready contribution »). arXiv:2403.14404 (v4, 13 mars 2025). https://arxiv.org/abs/2403.14404
- **Formulation** (https://arxiv.org/html/2403.14404v4) : résidu traité comme une **observable virtuelle** r̂ = 0 de vraisemblance q_R(r̂|x₀*) = N(r̂; R(x₀*), Σ_t/c · I). Perte totale (Éq. 14) :
  L_PIDM = E[ λ_t‖x₀ − x̂₀(x_t,t)‖² + (1/(2Σ̄_t))‖R(x₀*(x_t,t))‖² ], Σ̄_t = Σ_t/c, λ_t = Min-SNR-5.
  - *Mean estimation* : x₀* = x̂₀ = E[x₀|x_t] ; c = 10⁻³ (Darcy).
  - *Sample estimation* : x₀* = échantillon DDIM déterministe en 2 pas ; c = 10⁻⁵ (Darcy).
  - Paramétrisation x₀ ; entraîner sur ε ou μ « leads to larger residual errors ».
- **Écart de Jensen** : R(E[x₀|x_t]) ≠ E[R(x₀)|x_t] ; l'estimée ne coïncide avec un vrai échantillon qu'au dernier pas ; conflit croissant entre perte données et perte résiduelle quand t augmente ; la *sample estimation* « drastically improves the alignment of the two losses ».
- **Darcy** (64×64, 10 000 entraînement / 1 000 validation, U-Net) : résidu réduit « by around two orders of magnitude » par rapport au DDPM standard (résumé : « up to two orders of magnitude » vs travaux antérieurs) ; PG-Diffusion (Shu et al.) sans réduction significative ; CoCoGen amélioration modérée. **Surcoût d'entraînement : +23 % (mean) et +69 % (sample)**. Valeurs MAE exactes : **uniquement en Fig. 2**, pas de tableau.
- **Optimisation topologique** (Tableau 1) : R_MAE en distribution 1,86×10⁻³ (diffusion) → **1,24×10⁻³** (PIDM, −33 %) ; hors distribution 1,97×10⁻³ → 1,29×10⁻³ (−35 %). Gère contraintes d'égalité et d'inégalité (volume, c = 0,1).
- Contrainte : **douce, à l'entraînement**. Effet régularisant contre le sur-apprentissage.

### 3.3 DiffusionPDE — Huang, Yang, Wang, Park (NeurIPS 2024) [vérifié ; complété : pages 130291–130323]
- Réf. : J. Huang, G. Yang, Z. Wang, J. J. Park, « DiffusionPDE: Generative PDE-Solving under Partial Observation », **NeurIPS 2024 (Advances in NeurIPS 37), pp. 130291–130323**, DOI 10.52202/079017-4140. https://proceedings.neurips.cc/paper_files/paper/2024/hash/eb3878c1dcbfff9ee95d5d033e5f5942-Abstract.html ; arXiv:2406.17763.
- Méthode (https://arxiv.org/html/2406.17763v2) : diffusion **jointe** sur coefficient a et solution u (canaux empilés) ; guidage DPS avec L_obs et L_pde (ζ_obs, ζ_pde ; ex. Darcy ζ_obs = 2,5×10³ pour a, 10⁶ pour u, ζ_pde = 10³) ; **PDE guidance seulement après 80 % des itérations**, ζ_obs divisé par 10 ensuite. Pour NS : f = ∇·w (horizon trop long pour la vraie EDP). Débruiteur EDM.
- Chiffres (Tableau 1, ~500 observations ≈ 3 %, erreur relative) : Darcy direct **2,5 %** (FNO 28,2 %, PINO 35,2 %) ; inverse 3,2 % ; Poisson 4,5 % / 20,0 % ; Helmholtz 8,8 % / 22,6 % ; NS 6,9 % / 10,4 %. Caveat : baselines entraînées sur observations complètes ; optimisées (Annexe H) elles s'améliorent fortement (PINN optimisé 6,9 % sur Darcy direct, Tableau 5, discuté en Annexe H).
- Contrainte : **douce, échantillonnage**.

### 3.4 Shu, Li, Barati Farimani (2023) — Diffusion physics-informed pour la reconstruction d'écoulements [vérifié]
- Réf. : D. Shu, Z. Li, A. Barati Farimani, « A physics-informed diffusion model for high-fidelity flow field reconstruction », ***J. Comput. Phys.* 478, 111972 (2023)**, DOI 10.1016/j.jcp.2023.111972 (Crossref : https://api.crossref.org/works/10.1016/j.jcp.2023.111972). arXiv:2211.14680.
- Méthode (https://arxiv.org/html/2211.14680v2) : DDPM entraîné uniquement sur données haute fidélité ; reconstruction type SDEdit (bruitage partiel du champ basse fidélité puis débruitage DDIM, K = 1 à 3 itérations). Physique via c = ∂r/∂x (gradient du résidu de l'équation de transport de vorticité) : (a) *learned guidance* (c en entrée du U-Net, style CFG) ; (b) *direct gradient guidance* (−λ·∂r/∂x à chaque pas).
- Données : **Kolmogorov 2D, Re = 1000**, DNS 2048² → 256², 40 séquences (36/4).
- Chiffres (Tableau 1, L2 / perte d'équation) : 64→256 : 0,5622 / **0,2178** vs UNet direct 0,6048 / 0,5438 vs bicubique 1,3355 / 10,6639 ; 32→256 : 1,3035 / 0,2039 vs 1,3700 / 9,9291 ; 5 % → 256 : 0,9318 / 0,2815 ; 1,5625 % → 256 : 1,8213 / 0,2290. Gain L2 « marginal », gain sur le résidu important.
- Contrainte : **douce** (conditionnement + guidage). Appelé « PG-Diffusion » par Bastek et al.

### 3.5 CoCoGen — Jacobsen, Zhuang, Duraisamy [vérifié]
- Réf. : C. Jacobsen, Y. Zhuang, K. Duraisamy, « CoCoGen: Physically Consistent and Conditioned Score-Based Generative Models for Forward and Inverse Problems », ***SIAM J. Sci. Comput.* 47(2), C399–C425 (2025)**, DOI 10.1137/24M1636071 (Crossref). arXiv:2312.10527 (v2 20 oct. 2024). https://arxiv.org/abs/2312.10527
- Méthode (https://arxiv.org/html/2312.10527v2) : pas de gradient du résidu discrétisé y ← y − 2ε r∇_y r ajouté aux **N derniers pas** du solveur (EDS ou ODE de flot), puis M pas supplémentaires à t = 0 ; appliqué à la pression seulement ; ε = 2×10⁻⁴ / max∇_y r. Modèles conditionnels légers sur un backbone non conditionnel gelé.
- Chiffres : Darcy 64×64 (10 000 échantillons) : avec τ = 2000, M = 1, N = 3 (**4 évaluations d'opérateur**), résidus ≤ ceux du jeu d'entraînement. Burgers 1D : résidu 8,84 → 6,24 (500 pas), RMSE ≈ 3,5×10⁻². Surrogate s = 256 : erreur L2 7,0×10⁻⁴ (pression).
- Contrainte : **douce, échantillonnage (post-correction)**.

### 3.6 Lienen, Lüdke, Hansen-Palmus, Günnemann (ICLR 2024) — « From Zero to Turbulence » [vérifié]
- Réf. : « From Zero to Turbulence: Generative Modeling for 3D Flow Simulation », **ICLR 2024**. arXiv:2306.01776. https://arxiv.org/abs/2306.01776
- Méthode (https://arxiv.org/html/2306.01776v3) : **TurbDiff**, DDPM (N = 500 pas, planning log-linéaire du SNR), U-Net 3D (4 niveaux + attention au niveau le plus grossier) ; génère des états turbulents sans état initial. Conditions de Dirichlet imposées en fixant les cellules de bord (seules les cellules libres sont débruitées). **Pas de contrainte d'incompressibilité explicite**.
- Données : 45 LES OpenFOAM (27/9/9), canal 0,4×0,1×0,1 m, 20 m/s, **Re = 2×10⁵**, grille **192×48×48**, 5 000 états par simulation, 2,2 To.
- Métriques nouvelles : W₂,TKE (Wasserstein-2 sur spectres log-TKE) et W₂,ℛ (régions de vitesses).
- Chiffres (Tableau 1) : TurbDiff W₂,TKE 3,9 ± 0,4 ; W₂,ℛ 1,38 ± 0,04 ; **≈ 20 s par échantillon (A100) vs ≈ 602 s de solveur (16 cœurs)** → facteur ≈ 30.

### 3.7 Kohl, Chen, Thuerey — Diffusion conditionnelle autorégressive (ACDM) [vérifié]
- Réf. : G. Kohl, L.-W. Chen, N. Thuerey, « Benchmarking autoregressive conditional diffusion models for turbulent flow simulation », ***Neural Networks* 199, 108641 (juillet 2026)**, DOI 10.1016/j.neunet.2026.108641 (Crossref). arXiv:2309.01745 (v3 11 déc. 2024). https://arxiv.org/abs/2309.01745
- Méthode (https://arxiv.org/html/2309.01745v3) : DDPM conditionné sur k = 2 états précédents et paramètres (Re, Ma) ; **bruit ajouté au conditionnement** (« crucial for temporal stability ») ; 20–100 pas de diffusion.
- Cas : Inc (Re ∈ [200, 900] entraînement, test Re ∈ [100,180] et [920,1000]), Tra (Mach), Iso (JHTDB). Généralisation hors plage paramétrique exigée.
- Chiffres : Iso MSE 3,7 ± 0,8 (×10⁻²) vs U-Net 26 ± 35 ; ACDM « on par » avec entraînement déroulé ; coût d'inférence ∝ nombre de pas (20–100×). **Aucune contrainte physique**.

### 3.8 Gao et al. (2024) — Diffusion conditionnelle bayésienne pour la turbulence [vérifié]
- Réf. : H. Gao, X. Han, X. Fan, L. Sun, L.-P. Liu, L. Duan, J.-X. Wang, « Bayesian conditional diffusion models for versatile spatiotemporal turbulence generation », ***CMAME* 427, 117023 (2024)**, DOI 10.1016/j.cma.2024.117023 (Crossref). arXiv:2311.07896.
- Méthode : conditions liées différentiablement à la sortie → gradient ajouté au score non conditionnel (sans réentraînement) ; sinon condition en entrée ; séquences longues par échantillonnage conditionnel autorégressif. Cas : URANS → LES, turbulence pariétale, super-résolution de couche limite. Contrainte : **douce/aucune** (pas de contrainte EDP explicite dans le résumé).

### 3.9 CoNFiLD — Du, Parikh, Fan, Liu, Wang (2024) [vérifié]
- Réf. : P. Du, M. H. Parikh, X. Fan, X.-Y. Liu, J.-X. Wang, « Conditional neural field latent diffusion model for generating spatiotemporal turbulence », ***Nature Communications* 15, 10416 (29 nov. 2024)**, DOI 10.1038/s41467-024-54712-1 (Crossref). arXiv:2403.05940.
- Méthode (https://arxiv.org/html/2403.05940v2) : champ neuronal conditionnel (SIREN + FiLM, auto-décodage, décodage sans maillage) → latents par instantané empilés en « image » latente (N_l × N_t) → diffusion latente (U-Net) ; conditionnement zéro-shot de type DPS dans l'espace latent.
- Cas : conduite 2D irrégulière (écart moyen 0,041 ≈ 4 %), canal 3D Re_τ = 180, colline périodique Re_h = 2800, rugosité 3D Re_h = 3200 ; reconstruction à partir de 10 capteurs (0,1 %, colline périodique) ou 100 capteurs (0,17 %, rugosité) — chiffres confirmés dans la version publiée (PMC11607081). **Pas de contrainte de divergence explicite**.
- Pertinence **[synthèse]** : architecture « autoencodeur fonctionnel + diffusion latente » proche de FunDiff, sur géométries 3D complexes.

### 3.10 Rozet & Louppe (2023) — Score-based Data Assimilation (SDA) [vérifié]
- Réf. : F. Rozet, G. Louppe, « Score-based Data Assimilation », **NeurIPS 2023 (Advances in NeurIPS 36), pp. 40521–40541**, DOI 10.52202/075280-1763 (Crossref). arXiv:2306.10574.
- Méthode (https://arxiv.org/html/2306.10574v2) : score d'une trajectoire longue décomposé en scores locaux sur segments de longueur 2k+1 (pseudo-couverture de Markov) ; génération de toute la trajectoire d'un coup ; modèle d'observation découplé de l'entraînement ; vraisemblance approchée avec terme σ²/μ²·AΓAᵀ (Γ = 10⁻² I), amélioration de DPS ; correcteurs de Langevin.
- Cas : Lorenz 63 ; **Kolmogorov Re = 10³**, jax-cfd 256² → 64², 1 024 trajectoires de 64 états, k = 2. **Aucune contrainte physique explicite**.

### 3.11 DiffDA — Huang, Gianinazzi, Yu, Dueben, Hoefler (ICML 2024) [vérifié]
- Réf. : « DiffDA: a Diffusion model for weather-scale Data Assimilation », **ICML 2024, PMLR 235:19798–19815**. https://proceedings.mlr.press/v235/huang24h.html ; arXiv:2401.05932.
- Méthode : GraphCast pré-entraîné adapté en débruiteur ; conditionnement sur l'état prévu (entraînement + inférence) et sur observations éparses (inférence seulement, guidage).
- Chiffres : 0,25° (~30 km), 13 niveaux ; observations < 0,96 % des points ; perte ≤ 24 h d'échéance vs ERA5.

### 3.12 Météo générative : GenCast et SEEDS
- **GenCast** [vérifié] : I. Price et al., « Probabilistic weather forecasting with machine learning », ***Nature* 637(8044), 84–90** (en ligne 4 déc. 2024, numéro 2025), DOI 10.1038/s41586-024-08252-9 (Crossref + https://pmc.ncbi.nlm.nih.gov/articles/PMC11666454/). Diffusion conditionnelle (cadre EDM), graph-transformer sur maillage icosaédrique (41 162 nœuds). **Meilleur que ENS sur 97,2 % de 1 320 cibles** (Nature ; le préprint arXiv:2312.15796 indique 97,4 %) ; 15 jours, 0,25°, pas de 12 h, > 80 variables ; ≈ 8 min par prévision sur un TPUv5. **Aucune contrainte physique explicite** (bruit échantillonné sur la sphère, perte pondérée par l'aire).
- **SEEDS** [vérifié] (« Li et al. ») : L. Li, R. Carver, I. Lopez-Gomez, F. Sha, J. Anderson, « Generative emulation of weather forecast ensembles with diffusion models », ***Science Advances* 10(13), eadk4489 (29 mars 2024)**, DOI 10.1126/sciadv.adk4489 (Crossref). arXiv:2306.14066 (titre arXiv différent : « SEEDS: Emulation of Weather Forecast Ensembles with Diffusion Models »). Émulation d'ensembles opérationnels par diffusion ; correction de biais, meilleure prévision d'extrêmes.

### 3.13 Autres travaux récents utiles
- **PISD** [vérifié] : D. Gallon, P. von Wurstemberger, P. Cheridito, A. Jentzen, « Physics-informed diffusion models in spectral space », arXiv:2602.09708 (v2 2 juin 2026). Diffusion latente sur représentations spectrales, contraintes et mesures imposées par mises à jour Adam à chaque pas (DPS) ; Poisson, Helmholtz, NS incompressible. https://arxiv.org/abs/2602.09708
- **Li, Biferale et al. 2024** [vérifié] : T. Li, L. Biferale, F. Bonaccorso, M. A. Scarpolini, M. Buzzicotti, « Synthetic Lagrangian turbulence by generative diffusion models », *Nature Machine Intelligence* 6(4), 393–403 (2024), DOI 10.1038/s42256-024-00810-0 (journal-ref arXiv:2307.08529, https://arxiv.org/abs/2307.08529). Trajectoires 3D à haut Re ; reproduit incréments, intermittence ; écarts sous l'échelle dissipative.
- **Revue** [vérifié] : L. Biferale, M. Buzzicotti, « Generative AI in Turbulence: Foundations, Applications, Validations and Benchmarks », arXiv:2610.35123 (26 oct. 2026), soumis à JFM Perspectives ; plaide pour une validation sur transfert d'énergie, fonctions de structure, queues de PDF, lois de conservation. La MHD n'y apparaît que comme « data layer » recommandée pour les bancs d'essai (§5.1) et via Martin et al. 2025 ; aucune métrique MHD spécifique. https://arxiv.org/abs/2610.35123

---

## 4. Contraintes dures et génération contrainte

### 4.1 Richter-Powell, Lipman, Chen (2022) — Neural Conservation Laws [vérifié]
- Réf. : « Neural Conservation Laws: A Divergence-Free Perspective », **NeurIPS 2022 (Advances in NeurIPS 35), pp. 38075–38088**, DOI 10.52202/068431-2759 (Crossref). arXiv:2210.01741.
- Méthode (https://ar5iv.labs.arxiv.org/html/2210.01741) : réseaux **divergence nulle par construction** via formes différentielles (d² = 0) : (a) *matrix-field* : divergence ligne à ligne d'un champ matriciel antisymétrique A (O(n²) fonctions composantes, une jacobienne de moins) ; (b) *vector-field* : A = J_b − J_bᵀ. Universels sur le tore (à un champ constant près). Coût quadratique en la dimension. Équation de continuité satisfaite exactement en paramétrant v = [ρ, ρu] ; Hodge en dimension jusqu'à 100.
- Contrainte : **dure, architecture**. Base théorique pour imposer ∇·B = 0 en 3D **[synthèse]**.

### 4.2 Fishman, Klarner, De Bortoli, Mathieu, Hutchinson (2023) — Diffusion sur domaines contraints [vérifié]
- Réf. : « Diffusion Models for Constrained Domains », **TMLR (juillet 2023)** (commentaire arXiv ; confirmé sur https://mlanthology.org/tmlr/2023/fishman2023tmlr-diffusion/). arXiv:2304.05364. https://arxiv.org/abs/2304.05364
- Méthode : variétés définies par **inégalités** ; deux bruitages : métrique de barrière logarithmique et mouvement brownien réfléchi. Applications robotique, protéines. Contrainte : **dure (support)**, inégalités seulement **[synthèse : non adapté directement à ∇·B = 0, contrainte d'égalité linéaire]**.

### 4.3 Liu, Chen, Theodorou, Tao (2023) — Mirror Diffusion Models [vérifié]
- Réf. : G.-H. Liu, T. Chen, E. Theodorou, M. Tao, « Mirror Diffusion Models for Constrained and Watermarked Generation », **NeurIPS 2023 (Advances in NeurIPS 36), pp. 42898–42917**, DOI 10.52202/075280-1858 (Crossref). arXiv:2310.01236.
- Méthode : diffusion dans l'espace dual non contraint via une application miroir ; retour au domaine contraint par l'inverse ; formes calculables pour simplexes et boules ℓ₂. Contrainte : **dure (convexe)**.

### 4.4 Christopher, Baek, Fioretto (2024) — Projected Diffusion Models (PDM) [vérifié ; complété : DOI 10.52202/079017-2834]
- Réf. : J. K. Christopher, S. Baek, F. Fioretto, « Constrained Synthesis with Projected Diffusion Models », **NeurIPS 2024**, DOI 10.52202/079017-2834 (https://mlanthology.org/neurips/2024/christopher2024neurips-constrained/). arXiv:2402.03559. https://arxiv.org/abs/2402.03559
- Méthode (https://arxiv.org/html/2402.03559v3) : projection après chaque pas de Langevin : x = P_C(x + γg + √(2γ)ε) ; garantie de faisabilité pour ensembles convexes (Corollaire 5.4) ; non convexe : projection « warm-started » (point intérieur), sans garantie formelle.
- Chiffres : microstructures (porosité) FID 30,7 ± 6,8 avec satisfaction exacte ; mouvement sous gravité : 0 violation (Lune, hors distribution) ; trajectoires 100 % de succès vs 77,1 % / 53,3 %. **Coût** (Tableau 2 de l'annexe, s/échantillon ; projection par point intérieur sur CPU pour le mouvement humain) : matériaux 26,89 (vs 18,51 cond.) ; physique 48,85 (vs 35,30) ; mouvement humain 682,40 (vs 13,79).
- Contrainte : **dure, échantillonnage**.

### 4.5 Ben-Hamu et al. (2024) — D-Flow [vérifié ; complété : PMLR 235:3462–3483]
- Réf. : H. Ben-Hamu, O. Puny, I. Gat, B. Karrer, U. Singer, Y. Lipman, « D-Flow: Differentiating through Flows for Controlled Generation », **ICML 2024, PMLR 235:3462–3483** (https://mlanthology.org/icml/2024/benhamu2024icml-dflow/). arXiv:2402.14017. https://arxiv.org/abs/2402.14017
- Méthode : optimise le bruit initial en rétropropageant à travers tout le flot. Contrainte : **douce, optimisation coûteuse** (baseline d'ECI : 28,774 s/échantillon, voir 4.6).

### 4.6 ECI — Cheng et al. (ICLR 2025) [corrigé : « incohérence interne ×310 vs ×4,9 » → ×310 cohérent, rapporté par échantillon (5,4 Go/128 vs 26,4 Go/2 ≈ ×313)]
- Réf. : C. Cheng, B. Han, D. C. Maddix, A. F. Ansari, A. Stuart, M. W. Mahoney, Y. Wang, « Gradient-Free Generation for Hard-Constrained Systems », **ICLR 2025**. arXiv:2412.01786. https://arxiv.org/abs/2412.01786 ; actes : https://proceedings.iclr.cc/paper_files/paper/2025/hash/f9d7d6c695bc983fcfb5b70a5fbdfd2f-Abstract-Conference.html
- Méthode (https://arxiv.org/html/2412.01786v2) : prior FFM + FNO ; à chaque pas : **E**xtrapolation u₁ = u_t + (1−t)v_θ(u_t) ; **C**orrection (valeurs imposées pour CI/CL ; décalage pour lois de conservation intégrales) ; **I**nterpolation u_{t′} = (1−t′)u₀ + t′û₁ ; M itérations de mélange (1–10). Satisfaction exacte prouvée si la correction est exacte. **Sans gradient**.
- Chiffres : CE = 0 partout (Tableau 3) ; Stokes CI MMSE 0,090×10⁻² vs 2,068×10⁻² (FFM non contraint) ; **0,065 s vs 28,774 s (D-Flow) ≈ ×440** (temps par échantillon) ; mémoire : texte « ×310 memory saving ». Le Tableau 4 donne la mémoire GPU **par lot** : 5,4 Go pour 128 échantillons (ECI-1) contre 26,4 Go pour 2 échantillons (D-Flow), soit ≈ 0,042 Go contre 13,2 Go **par échantillon** → ≈ ×313, **cohérent avec « ×310 »** (le rapport brut 26,4/5,4 ≈ ×4,9 ignore la taille de lot).
- Contrainte : **dure (contraintes linéaires / de valeur), échantillonnage, zéro-shot**.

### 4.7 PCFM — Utkarsh, Cai, Edelman, Gómez-Bombarelli, Rackauckas (NeurIPS 2025) [vérifié ; complété : DOI 10.52202/085713-5354]
- Réf. : « Physics-Constrained Flow Matching: Sampling Generative Models with Hard Constraints », **NeurIPS 2025** (Advances in NeurIPS 38), DOI 10.52202/085713-5354 (https://papers.nips.cc/paper_files/paper/2025/hash/eacce1f7d11e2c3a7568468e0eff5d33-Abstract-Conference.html). arXiv:2506.04171 (v1 4 juin 2025, v2 25 nov. 2025).
- Méthode (https://arxiv.org/html/2506.04171v2) : (1) tir vers τ = 1 ; (2) projection de Gauss–Newton u_proj = u₁ − Jᵀ(JJᵀ)⁻¹h(u₁) ; (3) retour par interpolant OT ; (4) correction relâchée (3–5 pas de gradient) ; (5) projection finale exacte (solveur de Newton par complément de Schur). Contraintes **non linéaires**.
- Chiffres (Tableau 3, MMSE ×10⁻²) : chaleur 0,241 (ECI 0,697, DiffusionPDE 4,49) ; NS 4,59 (ECI 5,23) ; réaction-diffusion 0,026 ; Burgers (CI) **0,052 vs ECI 10,0** (« up to 99.5% ») ; Burgers (CL) 0,335 vs D-Flow 0,224 (D-Flow meilleur). CE = 0 pour PCFM (« machine precision ») ; ECI garde CE ≠ 0 sur les contraintes non linéaires (Burgers CL, réaction-diffusion CL). Projection finale = 1–3 % du temps total.
- Contrainte : **dure, échantillonnage, zéro-shot**.

### 4.8 « Genuist et al. (2026) » — VÉRIFICATION [corrigé (précision) : « le résumé dit Kolmogorov flow, le texte décrit une turbulence en déclin » → le texte l'appelle aussi « Kolmogorov flow » (§1.3), mais l'écoulement simulé est non forcé, f = −αu]
- **L'article existe.** W. Genuist, É. Savin, F. Gatti, D. Clouteau, « **Divergence-Free Diffusion Models for Incompressible Fluid Flows** », **arXiv:2601.19368** (v1, 27 janv. 2026), physics.flu-dyn ; **préprint, pas de référence de journal**. https://arxiv.org/abs/2601.19368
- Méthode (https://arxiv.org/html/2601.19368) : diffusion à score autorégressive (base EDM), incompressibilité par **projecteur spectral de Leray**. Six variantes comparées (Tableau 1) : 𝒱 vanilla EDM ; **M** projection sur la variété (bruit, état, débruiteur — stricte) ; **D** Leray en sortie du débruiteur (stricte, architecture) ; **L** résidu de divergence type PINN (**douce**) ; SC projection a posteriori par trame (douce) ; **PC** projection progressive (stricte).
- Données : 2D périodique, Fourier-Galerkin 512², champs 256², ν = 5,0×10⁻⁴, L = 2π, 10 graines × 100 trames ; le texte (§1.3, §6) et le résumé l'appellent « Kolmogorov flow », mais le jeu de données est une turbulence en déclin **non forcée** avec frottement d'Ekman f = −αu, α = 3,75×10⁻⁴ (§2.3, Tableau A.3).
- Chiffres : déroulement court (Tableau 2, « Rollout predictions averaged metrics ») PC MSE 1,15×10⁻⁴, ε_div 0 ; 𝒱 MSE 1,41×10⁻⁴, ε_div 8,07×10⁻³ ; **L MSE 2,07×10⁻⁴, ε_div 5,21×10⁻³**. OOD « VS » (Fig. 10) : M MSE 1,44×10⁻³ (ε_div 0) ; L 2,62×10⁻³. **OOD Taylor–Green (Fig. 11) : L « achieves the best overall performance »** (MSE 4,53×10⁻⁴ vs 𝒱 1,49×10⁻³), mais avec ε_div 1,84×10⁻² ; PC est la seule à garder ε_div = 0.
- **Verdict sur l'affirmation du rapport antérieur** : partiellement exacte. Citation : « (L) performs poorly across all metrics, consistently under-performing both in in-distribution assessment and in the rollout evaluation » (§5.2.1). **Mais** sur le cas Taylor–Green hors distribution, la variante douce L est la meilleure. Conclusions (§6) : M le plus précis en distribution ; contraintes strictes meilleures près de la distribution et à court horizon ; contraintes plus souples ou modèles corrigés préférables en déroulement long et hors distribution ; **« no single strategy dominates »**. Toute citation doit garder cette nuance et préciser « préprint 2026 ». La comparaison porte sur la seule divergence (pas sur un résidu d'EDP complet).
- Travail antérieur des mêmes auteurs [vérifié] : « Autoregressive regularized score-based diffusion models for multi-scenarios fluid flow prediction », arXiv:2505.24145 (30 mai 2025) : **contrainte d'énergie** fondée sur des statistiques turbulentes, faible surcoût. https://arxiv.org/abs/2505.24145

### 4.9 PCDM — Li, Buzzicotti, Bonaccorso, Biferale (2026) [vérifié]
- Réf. : « Physics-Constrained Diffusion Model for Synthesis of 3D Turbulent Data », arXiv:2603.12834 (13 mars 2026), soumis à un journal. https://arxiv.org/abs/2603.12834
- Méthode (https://arxiv.org/html/2603.12834v1) : projection de Fourier (I − kkᵀ/|k|²) et û(0) → 0 appliquée à **l'estimée propre** 𝒱₀,θ ; bruit corrigé déduit de l'estimée projetée ; x_t et le bruit n'ont pas à être à divergence nulle.
- Données : **turbulence en rotation 3D**, DNS 256³ → 64³ (troncature de Galerkin), Ro ≈ 0,1.
- Chiffres : divergence nulle « at machine precision » ; **temps d'entraînement ≈ ×5 plus court** que DDPM-prog (8×10⁵ itérations ≈ 12 jours vs 4×10⁶ ≈ 56 jours, sur 4 GPU A100 ; Annexe D). Spectres et flatness : seulement en figure.
- Contrainte : **dure, architecture/échantillonnage**. Analogue 3D le plus proche de ce que MilaDy demande pour ∇·u = 0 et ∇·B = 0 **[synthèse]**.

### 4.10 « Project and Generate » — Li X. et al. (2026) [corrigé : « O(10⁻⁷) … chiffre non vérifié » → vérifié dans le Tableau 1]
- Réf. : X. Li, H. Zhang, R. Jiang, D. Chen, C. Lin, L. Han, Y. Qi, X. Guo, Y. Cheng, « Project and Generate: Divergence-Free Neural Operators for Incompressible Flows », arXiv:2603.24500 (25 mars 2026). https://arxiv.org/abs/2603.24500
- Méthode : projection spectrale de Helmholtz-Hodge (déterministe) ; pour le génératif, **mesure gaussienne de référence à divergence nulle** construite par poussée via le rotationnel de fonctions de courant + Leray → chemins de flow matching restant dans l'espace contraint. Résultats (Tableau 1, NS 2D périodique, Re = 1000, backbone FNO) : divergence du génératif contraint ≈ 4×10⁻⁷ (prédiction), 2×10⁻⁷ (court terme), 1,6×10⁻⁷ (long terme, t ∈ [201, 300]) → **O(10⁻⁷)** confirmé ; le flow matching non contraint diverge à long terme (« Inf », débordement numérique).

---

## 5. Génératif appliqué à la MHD, aux dynamos, à l'astrophysique (2022–2026)

Résultat principal de la recherche : **aucun modèle de diffusion ni de flow matching appliqué à des simulations de dynamo** (géodynamo, dynamo expérimentale VKS/DRESDYN, dynamo turbulente) **n'a été trouvé** (requêtes : « generative model dynamo », « diffusion model geodynamo », « flow matching MHD », « diffusion magnetohydrodynamics », « super-resolution MHD diffusion », « 3D MHD helicity diffusion »). Travaux les plus proches :

| Travail | Réf. vérifiée | Ce qui est généré | Contrainte ∇·B = 0 |
|---|---|---|---|
| **Kacmaz, Huerta, Haas (2025)** « Resolving Turbulent Magnetohydrodynamics: A Hybrid Operator-Diffusion Framework » | [vérifié] *Mach. Learn.: Sci. Technol.* 6(3), 035057 (2025), DOI 10.1088/2632-2153/ae054c ; arXiv:2507.02106 (https://arxiv.org/abs/2507.02106) | Évolution spatio-temporelle de MHD 2D incompressible résistive ; PINO (basses fréquences, pertes EDP **douces**) + diffusion conditionnelle (correction haute fréquence) | Dans le **solveur** (Dedalus) via potentiel vecteur A, B = ∇×A ; le modèle génératif n'impose pas de contrainte dure. Données : 128², Pm = 1, Re ∈ {100,…,10 000}, 1 000 simulations par Re. Erreur L2 relative moyennée : Re = 1000 : 0,2548 (PINO) → **0,1033** (PINO+diffusion) ; Re = 10 000 : 0,3914 → 0,2052 ; Re = 100 : 0,0072 → 0,0080 (légère dégradation). Spectres cinétique/magnétique en figure seulement ; **pas d'hélicité**. Seule baseline : leur PINO. (https://arxiv.org/html/2507.02106v2) |
| **Martin, Lübke, Li, Buzzicotti, Grauer, Biferale (2025)** | [vérifié] *ApJS* 277(2), 48 (2025), DOI 10.3847/1538-4365/adb432 (Crossref) ; arXiv:2412.12923 | Trajectoires de particules test (rayons cosmiques) dans une turbulence MHD 3D | Sans objet (trajectoires) |
| **da Silva, Kirk, Mathews, Muñoz-Jaramillo (2025)** « Diffusion Modeling of the Three-Dimensional Magnetic Field in the Sun's Corona » | [vérifié] arXiv:2510.01441 (1 oct. 2025), sans journal | Coefficients d'harmoniques sphériques G, H (degré 90, sortie 8 281) du champ potentiel ADAPT-WSA, conditionnés par la phase du cycle solaire S ∈ [0,1] | **Dure par représentation** : B = −∇V avec ∇×B ≈ 0, harmoniques satisfaisant Laplace → ∇·B = 0. DDPM T = 1000, DDIM 20 pas ; 27,3 M exemples augmentés ; **évaluation qualitative seulement**. (https://arxiv.org/html/2510.01441v1) |
| **Ramunno et al. (2024)** « Magnetogram-to-Magnetogram » | [vérifié] arXiv:2407.11659, conférence ESA SPAICE 2024 | Magnétogrammes LoS à +24 h (DDPM) | Non (2D, composante LoS) |
| **Xu D. et al. (2025)** « Exploring Magnetic Fields in Molecular Clouds through DDPM » | [vérifié] *ApJ* 980(1), 52 (2025), DOI 10.3847/1538-4357/ada8a0 (Crossref) ; arXiv:2410.07032 | Estimation de l'intensité de B à partir d'observables synthétiques | Non |
| **Galletti et al. (2026)** « A Shortcut to Statistically Steady-State Turbulence with Flow Matching » (modèle GyroFlow) | [corrigé : titre absent (« GyroFlow ») → titre arXiv complet ; G. Galletti, G. Gutenbrunner, W. Hornsby, L. Zanisi, N. Carey, S. Pamela, J. Brandstetter, F. Paischer] arXiv:2607.13022 (14 juil. 2026), préprint | États saturés de turbulence gyrocinétique (flow matching latent conditionné par paramètres adimensionnels) ; démarrage à chaud du solveur | Non mentionné |
| **Mudur & Finkbeiner (2022)** | [vérifié] arXiv:2211.12444 (atelier « Machine Learning and the Physical Sciences », NeurIPS 2022, selon le commentaire arXiv) | Champs de matière noire, poussière interstellaire | Non |
| **The Well** (Ohana, McCabe, Meyer, Morel et al.) | [vérifié ; complété : DOI 10.52202/079017-1430] NeurIPS 2024 Datasets & Benchmarks (https://proceedings.neurips.cc/paper_files/paper/2024/hash/4f9a5acd91ac76569f2fe291b1f4772b-Abstract.html) ; arXiv:2412.00568 | Jeu de données : MHD isotherme sans autogravité, 256³ et 64³, 100 trajectoires × 100 pas | — (jeu de données ; utile comme banc d'essai MHD 3D public **[synthèse]**) |

---

## 6. Réduction de modèle par apprentissage

### 6.1 Fukami & Taira (2023) ★ référence de l'offre [vérifié]
- **Réf. vérifiée** : K. Fukami, K. Taira, « Grasping extreme aerodynamics on a low-dimensional manifold », ***Nature Communications* 14, 6480 (14 oct. 2023)**, **DOI 10.1038/s41467-023-42213-6** (Crossref). arXiv:2305.08024.
- Détails (https://arxiv.org/html/2305.08024v2) : **Re = u∞c/ν = 100** ; **NACA 0012** ; α ∈ [20°, 60°] (20°, 30°, 40°, 50°, 60° ; le texte écrit « six different angles » mais n'en liste que cinq) ; rafales tourbillonnaires : G ∈ [−10, 10], L = 2R/c ∈ [0,5 ; 2], y₀/c ∈ [−0,5 ; 0,5], x₀/c = −2 ; entraînement de l'AE sur G ∈ [−4, 4]. 40 cas par angle (20 entraînement / 20 test), 1 200 instantanés par cas sur 10,2 temps convectifs, sous-domaine 240×120 ; **1,26×10⁵ trames** d'entraînement (100 cas avec rafale + 5 cas sans perturbation × 1 200 instantanés).
- **Autoencodeur augmenté par la portance** : encodeur CNN → **3 variables latentes** ; décodeur miroir ; MLP de portance sur le latent ; perte min ‖q − q̂‖₂ + β‖C_L − Ĉ_L‖₂, **β = 0,05** (courbe en L), tanh, Adam.
- Résultats : PCA « completely fails » à détecter le tourbillon ; l'AE standard a un SSIM plus élevé mais un latent moins structuré ; SSIM « over 90% » sur cas à deux tourbillons ; cas extrême α = 20°, G = 3,8 : portance **+714 % puis −656 % en 1,8 temps convectif** ; extrapolation à |G| > 4 (G = 6,4, −6,0) ; ξ₃ ≈ angle d'attaque effectif.
- Non dans le papier : nombre de capteurs de pression (seulement « a small number of sensors ») ; analyse phase-amplitude et contrôle = perspectives.
- Contrainte physique : **aucune contrainte EDP** ; la physique entre par l'**augmentation par une observable** (portance) qui organise le latent.

### 6.2 Solera-Rico et al. (2024) ★ référence de l'offre [corrigé : chiffres « du préprint seulement, la version publiée peut différer » → tous confirmés dans la version publiée (PMC10866995)]
- **Réf. vérifiée** : A. Solera-Rico, C. Sanmiguel Vila, M. Gómez-López, Y. Wang, A. Almashjary, S. T. M. Dawson, R. Vinuesa, « β-Variational autoencoders and transformers for reduced-order modelling of fluid flows », ***Nature Communications* 15, 1361 (14 fév. 2024)**, **DOI 10.1038/s41467-024-45578-4** (Crossref). arXiv:2304.03571.
- Chiffres (vérifiés dans la version publiée, https://pmc.ncbi.nlm.nih.gov/articles/PMC10866995/, identiques à arXiv:2304.03571v2) : écoulement 2D autour de **deux plaques colinéaires** ; cas périodique **Re = 40**, angle 90°, 1 000 champs ; cas chaotique **Re = 100**, angle 80°, 150 000 champs ; domaine 96c × 28c, 300×98 points.
  - Re = 40 : 2 modes POD = 98,4 % ; β-VAE (β = 0,001) E = 97,5 %, R₁₂ = 0,0015.
  - Re = 100 : **β = 0,05**, **d = 20** ; E = 89,8 % (entraînement) / 80,1 % (test) ; d = 10 : 82,0 % / 61,6 %. POD à 20 modes : 64,4 % ; **69 modes POD** nécessaires pour égaler le β-VAE (« over 69 modes » pour dépasser E = 90 %).
  - Dynamique : transformer (self-attention et easy-attention), délai 64 pas ; comparé à LSTM et KNF (Koopman with Non-linear Forcing) ; ROM β-VAE + transformer : **E = 78,1 % à t + t_c et 64,6 % à t + 10 t_c** (données non vues).
- Contrainte physique : **aucune** ; orthogonalité quasi-parfaite du latent par régularisation β.

### 6.3 Eivazi, Le Clainche, Hoyas, Vinuesa (2022) [corrigé : 87,36 % vs 32,41 % « non vérifié dans Eivazi » → confirmé dans Eivazi et al. (arXiv:2109.01514)]
- Réf. : « Towards extraction of orthogonal and parsimonious non-linear modes from turbulent flows », ***Expert Systems with Applications* 202, 117038 (2022)**, DOI 10.1016/j.eswa.2022.117038 (Crossref). arXiv:2109.01514.
- Apport : β-VAE + CNN, classement des modes par contribution ; écoulement turbulent dans un environnement urbain simplifié (LES). Chiffre cité par Solera-Rico et al. (arXiv:2304.03571v2, p. 2) : **87,36 % de l'énergie avec 5 variables latentes vs 32,41 % avec 5 modes POD**, confirmé dans Eivazi et al. (arXiv:2109.01514v1 : CNN-βVAE à 5 modes ; le CNN-AE non variationnel atteint 94,22 %).

### 6.4 Lusch, Kutz, Brunton (2018) [vérifié]
- Réf. : « Deep learning for universal linear embeddings of nonlinear dynamics », ***Nature Communications* 9, 4950 (2018)**, DOI 10.1038/s41467-018-07210-0 (Crossref). arXiv:1712.09707.
- Apport : autoencodeur dont le latent évolue linéairement (fonctions propres de Koopman) ; réseau auxiliaire paramétrant la fréquence pour les spectres continus (pendule, optique non linéaire, turbulence).

### 6.5 Champion, Lusch, Kutz, Brunton (2019) — SINDy-autoencodeur [vérifié]
- Réf. : « Data-driven discovery of coordinates and governing equations », ***PNAS* 116(45), 22445–22451 (2019)**, DOI 10.1073/pnas.1906995116 (Crossref). arXiv:1904.02107.
- Apport : apprentissage conjoint des coordonnées latentes (autoencodeur) et d'un modèle SINDy parcimonieux dans ce latent.

---

## 7. Tableau de synthèse : méthode → type de contrainte → dure/douce → coût

Les coûts chiffrés viennent des sources citées plus haut ; « [synthèse] » = estimation qualitative non chiffrée dans la source.

| Méthode | Où agit la contrainte | Type de contrainte | Dure / douce | Coût (chiffré si disponible) |
|---|---|---|---|---|
| FunDiff (fonction de courant ψ) | Architecture (décodeur) | ∇·u = 0 en 2D | Dure (exacte au calcul de dérivée près) | Une différentiation du décodeur [synthèse] ; coût d'entraînement non rapporté |
| FunDiff (Fourier [cos, sin]) | Architecture (embedding) | Périodicité | Dure | Négligeable [synthèse] |
| FunDiff (symétrie) | Architecture (4 évaluations du décodeur) | Symétries de réflexion | Dure | ×4 évaluations du décodeur [synthèse] |
| FunDiff / PIDM (résidu d'EDP) | Perte d'entraînement | Résidu d'EDP complet | Douce | PIDM : +23 % (mean) / +69 % (sample) de temps d'entraînement |
| Shu et al. 2023 | Conditionnement + guidage | Résidu de vorticité | Douce | Gradient du résidu à chaque pas |
| CoCoGen | Correction aux N derniers pas | Résidu discret | Douce | 4 évaluations d'opérateur suffisent pour Darcy (N = 3, M = 1) |
| DPS / DiffusionPDE / PISD | Guidage à l'échantillonnage | Observations + résidu | Douce | DPS : 1000 NFE, ≈ 95 s/image (FFHQ, 2080Ti) |
| Universal guidance | Guidage (forward/backward + k répétitions) | Toute fonction différentiable | Douce | k × (forward + backward de f) par pas [synthèse] |
| CFG | Conditionnement | Paramètres (Re, Rm…) | — (pas une contrainte) | 2 évaluations du réseau par pas [synthèse] |
| Neural Conservation Laws | Architecture | Divergence nulle / continuité | Dure | Quadratique en la dimension (évaluations de fonction) |
| Leray en sortie du débruiteur (Genuist « D », PCDM) | Architecture / estimée x̂₀ | ∇·u = 0 (et moyenne nulle) | Dure | FFT par pas ; PCDM : entraînement ≈ ×5 plus court que DDPM-prog |
| Leray sur la variété (Genuist « M ») | Bruit + état + débruiteur | ∇·u = 0 | Dure | FFT par pas [synthèse] |
| Pénalité PINN de divergence (Genuist « L ») | Perte | ∇·u = 0 | Douce | ε_div 5,21×10⁻³ en déroulement (non nul) |
| Projection a posteriori (Genuist « SC ») | Après chaque trame | ∇·u = 0 | Hors modèle (projection) | 1 projection par trame [synthèse] |
| PDM (Christopher et al.) | Projection après chaque pas de Langevin | Ensemble convexe (garanti) / non convexe | Dure (convexe) | 26,89 vs 18,51 s ; 682,40 vs 13,79 s selon la tâche |
| Mirror DM | Changement de variable (miroir) | Domaine convexe (simplexe, boule) | Dure | Faible si miroir analytique [synthèse] |
| Fishman et al. | Processus de bruitage (barrière / réflexion) | Inégalités | Dure | Non chiffré |
| D-Flow | Optimisation du bruit initial | Toute contrainte différentiable | Douce | 28,774 s/échantillon (Stokes, Tableau 4 d'ECI) |
| ECI | Correction à chaque pas (sans gradient) | CI/CL, conservation intégrale (linéaire) | Dure | 0,065 s/échantillon (≈ ×440 plus rapide que D-Flow) ; mémoire par échantillon ≈ ×310 plus faible |
| PCFM | Projection Gauss–Newton + projection finale | Non linéaire (conservation, CL, flux) | Dure | Projection finale = 1–3 % du temps total |
| Champ potentiel (da Silva et al.) | Représentation (coefficients harmoniques) | ∇·B = 0, ∇×B = 0 | Dure | Aucun surcoût [synthèse] |
| Potentiel vecteur A (Kacmaz : solveur seulement) | Données | ∇·B = 0 | Dure dans les données, pas dans le génératif | — |
| Fukami & Taira (portance) | Perte (observable auxiliaire) | Structure du latent | Douce (pas une contrainte EDP) | MLP auxiliaire [synthèse] |

---

## 8. Lacunes de la littérature pertinentes pour MilaDy [synthèse argumentée]

1. **Pas de génératif pour la dynamo.** Aucun modèle de diffusion ou de flow matching n'a été trouvé sur des simulations de dynamo (ni géodynamo, ni VKS, ni DRESDYN, ni dynamo turbulente 3D). Le travail MHD le plus proche (Kacmaz et al. 2025) est en **2D**, configuration où une dynamo auto-entretenue est exclue par les théorèmes anti-dynamo (Zeldovich) **[synthèse, connaissance générale non sourcée ici]**. Son modèle génératif n'impose pas ∇·B = 0 : seul le solveur le garantit.
2. **Pas de contrainte dure conjointe sur ∇·u = 0 et ∇·B = 0 en 3D dans un modèle génératif MHD.** Les briques existent séparément : Leray 3D en Fourier (PCDM, rotation 3D, 64³), réseaux à divergence nulle (Richter-Powell), fonction de courant (FunDiff, 2D seulement), potentiel scalaire (da Silva, champ potentiel seulement). Aucune n'a été appliquée à des champs MHD 3D générés. Le **potentiel vecteur A** (B = ∇×A) est la généralisation 3D directe de la fonction de courant de FunDiff ; il impose une **jauge** à choisir.
3. **Domaines non périodiques et conditions aux limites magnétiques.** La projection de Leray en Fourier suppose la périodicité (PCDM, Genuist). Les dynamos expérimentales (VKS, DRESDYN) sont en géométrie **cylindrique avec parois** et raccord à un champ extérieur. Aucune méthode trouvée ne traite une contrainte de divergence dure avec ces conditions. Pistes : décodeur fonctionnel (FunDiff, CoNFiLD) + potentiel vecteur ; PCFM/ECI pour les conditions aux limites.
4. **Pas de métriques MHD dans l'évaluation des modèles génératifs.** Aucun travail trouvé n'évalue l'**hélicité magnétique ou croisée**, la topologie des lignes de champ ou les bilans d'énergie magnétique. Kacmaz et al. montrent des spectres en figure, sans erreur chiffrée. La revue Biferale & Buzzicotti (2026) demande des validations orientées physique ; elle cite la turbulence MHD comme « data layer » de banc d'essai (§5.1) mais ne propose aucune métrique MHD.
5. **Conditionnement paramétrique et extrapolation.** Kohl et al. et Kacmaz et al. testent hors de la plage de Re d'entraînement ; Kacmaz : le modèle Re = 1000 appliqué à Re = 100 a une erreur > 0,85. **Aucun travail ne conditionne sur (Re, Rm) ou Pm ensemble**, ni n'étudie le franchissement du **seuil dynamo** (bifurcation) par un modèle génératif.
6. **Pas de comparaison systématique des stratégies sur des EDP couplées.** La comparaison la plus directe, Genuist et al. 2026 (préprint), porte sur la seule divergence en 2D hydrodynamique. Elle montre qu'**aucune stratégie ne domine** : stricte meilleure en distribution, douce parfois meilleure hors distribution (Taylor–Green). PCFM et ECI comparent des contraintes linéaires ou intégrales sur des EDP 1D/2D simples. Le livrable de l'offre (« comparative study […] for parameter-dependent MHD fields ») comble donc un manque réel.
7. **Écart de Jensen et coût.** Les pénalités résiduelles évaluées sur x̂₀ souffrent de l'écart de Jensen (DPS, PIDM). La variante « sample » de PIDM coûte +69 %. Les méthodes à projection (PCDM, ECI, PCFM) l'évitent pour les contraintes **linéaires** comme la divergence, ce qui plaide pour séparer : contraintes linéaires en dur (projection ou architecture), bilans d'énergie et résidus non linéaires en doux ou par projection de type PCFM.
8. **Lien avec la réduction de modèle et l'assimilation.** FunDiff, CoNFiLD et Solera-Rico/Fukami fournissent des latents compacts, mais aucun ne relie latent génératif et **dynamique réduite** pour les renversements de champ (objectif 1 de l'ANR). L'assimilation par diffusion (SDA, DiffDA) n'a pas été appliquée à la MHD.
9. **Données publiques MHD 3D.** The Well (MHD isotherme 64³/256³) peut servir de banc d'essai intermédiaire avant les données de dynamo du consortium (le code de simulation du consortium n'a pas été vérifié ici).

---

## 9. Points de vigilance (mis à jour après vérification)

- **FunDiff** : aucune valeur numérique de divergence, ni d'erreur de reconstruction Kolmogorov, dans le texte (figures seulement). Pas de coût GPU. Le corps du texte cite Fig. 3e pour la comparaison de divergence, alors que la légende de 3e parle de « PDE constraints » (signalé par la lecture PMC).
- **PIDM** : le gain « deux ordres de grandeur » sur Darcy est **visible en Fig. 2 seulement** ; ne pas inventer de MAE exacte.
- **ECI** : [corrigé] pas d'incohérence. « ×310 memory saving » est un rapport **par échantillon** : Tableau 4, 5,4 Go/128 échantillons contre 26,4 Go/2 échantillons ≈ ×313.
- **GenCast** : 97,2 % (Nature) vs 97,4 % (préprint arXiv) des 1 320 cibles ; citer la version Nature.
- **Genuist et al. 2026** : préprint non évalué par les pairs ; affirmation « pénalités douces moins performantes » **vraie en distribution et en déroulement, fausse sur Taylor–Green OOD** ; les auteurs l'appellent « Kolmogorov flow » (résumé et texte), mais l'écoulement est une turbulence en déclin non forcée avec frottement d'Ekman.
- **« Project and Generate »** (arXiv:2603.24500) : [corrigé] « O(10⁻⁷) » et divergence (« Inf ») du flow matching non contraint à Re = 1000 vérifiés dans le Tableau 1.
- **Kacmaz et al.** : le résumé mentionne statistiques non gaussiennes et corrélations croisées, mais je n'ai trouvé aucune métrique chiffrée correspondante dans le texte lu.
- **Solera-Rico et al.** : [corrigé] chiffres confirmés dans la version publiée via PMC (PMC10866995).
- **Eivazi et al.** : [corrigé] 87,36 % vs 32,41 % confirmé dans Eivazi et al. (arXiv:2109.01514v1).
- **Albergo, Boffi, Vanden-Eijnden** : [corrigé] *JMLR* 26(209):1–80, 2025 (page et .bib JMLR).
- **DDPM** : [corrigé] NeurIPS 2020 confirmé (ML Anthology).
- **Lipman et al.** : statut « spotlight » toujours [NON CONFIRMÉ] (voir section finale) ; ICLR 2023 confirmé.
- **Christopher et al. (PDM)** et **D-Flow** : [corrigé] lieux confirmés hors arXiv (PDM : DOI 10.52202/079017-2834 ; D-Flow : PMLR 235:3462–3483, ML Anthology).
- **Kerrigan et al.** : architecture FNO utilisée par ECI comme prior, détails internes de FFM non relus.
- **Fukami & Taira** : nombre de capteurs non précisé dans l'article ; lecture via arXiv v2 (journal-ref Nat. Commun. 14, 6480) ; le texte annonce « six » angles d'attaque mais en liste cinq.
- **Nature.com** bloque WebFetch (redirection idp.nature.com) : les métadonnées *Nature Communications* ont été vérifiées via Crossref et PMC.
- **FunDiff** : la phrase « relative L2 errors below 10% » (Burgers) n'existe que dans la version publiée (PMC), pas dans arXiv v2.

---

## 10. Index des identifiants (tous rouverts le 6 nov. 2026 : API arXiv, Crossref, actes, PMC)

| Article | Lieu | DOI / arXiv |
|---|---|---|
| Ho et al. 2020 DDPM | NeurIPS 2020 | arXiv:2006.11239 |
| Song et al. 2021 | ICLR 2021 (Oral) | arXiv:2011.13456 |
| Karras et al. 2022 EDM | NeurIPS 2022 | arXiv:2206.00364 |
| Ho & Salimans 2022 CFG | NeurIPS 2021 Workshop (version courte) | arXiv:2207.12598 |
| Chung et al. 2023 DPS | ICLR 2023 | arXiv:2209.14687 |
| Bansal et al. 2024 | ICLR 2024 | arXiv:2302.07121 |
| Lipman et al. 2023 | ICLR 2023 | arXiv:2210.02747 |
| Liu, Gong, Liu 2023 | ICLR 2023 | arXiv:2209.03003 |
| Albergo & Vanden-Eijnden 2023 | ICLR 2023 | arXiv:2209.15571 |
| Albergo, Boffi, Vanden-Eijnden 2025 | JMLR 26(209):1–80 | arXiv:2303.08797 |
| Tong et al. 2024 OT-CFM | TMLR 2024 | arXiv:2302.00482 |
| Kerrigan et al. 2024 FFM | AISTATS 2024, PMLR 238:3934–3942 | arXiv:2305.17209 |
| Lim et al. 2025 DDO | JMLR 26(158):1–62 | arXiv:2302.07400 |
| Wang et al. 2026 FunDiff | Nat. Commun. 17, 5749 | 10.1038/s41467-026-72292-0 ; arXiv:2506.07902 |
| Bastek et al. 2025 PIDM | ICLR 2025 | arXiv:2403.14404 |
| Huang et al. 2024 DiffusionPDE | NeurIPS 2024, pp. 130291–130323 | 10.52202/079017-4140 ; arXiv:2406.17763 |
| Shu et al. 2023 | J. Comput. Phys. 478, 111972 | 10.1016/j.jcp.2023.111972 ; arXiv:2211.14680 |
| Jacobsen et al. 2025 CoCoGen | SIAM J. Sci. Comput. 47(2), C399–C425 | 10.1137/24M1636071 ; arXiv:2312.10527 |
| Lienen et al. 2024 | ICLR 2024 | arXiv:2306.01776 |
| Kohl et al. 2026 | Neural Networks 199, 108641 | 10.1016/j.neunet.2026.108641 ; arXiv:2309.01745 |
| Gao et al. 2024 | CMAME 427, 117023 | 10.1016/j.cma.2024.117023 ; arXiv:2311.07896 |
| Du et al. 2024 CoNFiLD | Nat. Commun. 15, 10416 | 10.1038/s41467-024-54712-1 ; arXiv:2403.05940 |
| Rozet & Louppe 2023 SDA | NeurIPS 2023, pp. 40521–40541 | 10.52202/075280-1763 ; arXiv:2306.10574 |
| Huang et al. 2024 DiffDA | ICML 2024, PMLR 235:19798–19815 | arXiv:2401.05932 |
| Price et al. GenCast | Nature 637, 84–90 | 10.1038/s41586-024-08252-9 ; arXiv:2312.15796 |
| Li et al. 2024 SEEDS | Sci. Adv. 10(13), eadk4489 | 10.1126/sciadv.adk4489 ; arXiv:2306.14066 |
| Richter-Powell et al. 2022 | NeurIPS 2022, pp. 38075–38088 | 10.52202/068431-2759 ; arXiv:2210.01741 |
| Fishman et al. 2023 | TMLR 2023 | arXiv:2304.05364 |
| Liu et al. 2023 Mirror DM | NeurIPS 2023, pp. 42898–42917 | 10.52202/075280-1858 ; arXiv:2310.01236 |
| Christopher et al. 2024 PDM | NeurIPS 2024 | 10.52202/079017-2834 ; arXiv:2402.03559 |
| Ben-Hamu et al. 2024 D-Flow | ICML 2024, PMLR 235:3462–3483 | arXiv:2402.14017 |
| Cheng et al. 2025 ECI | ICLR 2025 | arXiv:2412.01786 |
| Utkarsh et al. 2025 PCFM | NeurIPS 2025 | 10.52202/085713-5354 ; arXiv:2506.04171 |
| Genuist et al. 2026 | préprint | arXiv:2601.19368 |
| Genuist et al. 2025 | préprint | arXiv:2505.24145 |
| Li T. et al. 2026 PCDM | préprint | arXiv:2603.12834 |
| Li X. et al. 2026 | préprint | arXiv:2603.24500 |
| Gallon et al. 2026 PISD | préprint | arXiv:2602.09708 |
| Kacmaz et al. 2025 | Mach. Learn.: Sci. Technol. 6, 035057 | 10.1088/2632-2153/ae054c ; arXiv:2507.02106 |
| Martin et al. 2025 | ApJS 277(2), 48 | 10.3847/1538-4365/adb432 ; arXiv:2412.12923 |
| da Silva et al. 2025 | préprint | arXiv:2510.01441 |
| Xu D. et al. 2025 | ApJ 980(1), 52 | 10.3847/1538-4357/ada8a0 ; arXiv:2410.07032 |
| Li T. et al. 2024 (Lagrangien) | Nat. Mach. Intell. 6, 393–403 | 10.1038/s42256-024-00810-0 ; arXiv:2307.08529 |
| Fukami & Taira 2023 | Nat. Commun. 14, 6480 | 10.1038/s41467-023-42213-6 ; arXiv:2305.08024 |
| Solera-Rico et al. 2024 | Nat. Commun. 15, 1361 | 10.1038/s41467-024-45578-4 ; arXiv:2304.03571 |
| Eivazi et al. 2022 | Expert Syst. Appl. 202, 117038 | 10.1016/j.eswa.2022.117038 ; arXiv:2109.01514 |
| Lusch et al. 2018 | Nat. Commun. 9, 4950 | 10.1038/s41467-018-07210-0 ; arXiv:1712.09707 |
| Champion et al. 2019 | PNAS 116(45), 22445–22451 | 10.1073/pnas.1906995116 ; arXiv:1904.02107 |
| Ohana et al. 2024 The Well | NeurIPS 2024 D&B | 10.52202/079017-1430 ; arXiv:2412.00568 |
| Galletti et al. 2026 (GyroFlow) | préprint | arXiv:2607.13022 |
| Ramunno et al. 2024 | ESA SPAICE 2024 | arXiv:2407.11659 |
| Mudur & Finkbeiner 2022 | atelier NeurIPS 2022 (ML4PS) | arXiv:2211.12444 |

---

## 11. Non confirmé

Aucune entrée bibliographique n'est introuvable. Les détails suivants n'ont pas pu être confirmés sur une source primaire :
- **Lipman et al. 2023, statut « spotlight »** [NON CONFIRMÉ] : OpenReview inaccessible (vérification anti-robot). ICLR 2023 est confirmé. Un miroir des listes ICLR 2023 indique « notable top 25 % ».
- **Bansal et al. 2024, « Roni » = « Soumyadip » Sengupta** [NON CONFIRMÉ] : les actes ICLR et arXiv divergent sur le prénom. L'identité n'a pas été établie formellement.
- **« Aucun génératif sur simulations de dynamo »** [NON CONFIRMÉ, affirmation négative] : rien de contraire trouvé (API arXiv : « diffusion AND dynamo AND generative », « flow matching AND magnetohydrodynamic », « score-based AND dynamo » ; recherche web), mais une absence ne peut pas être prouvée.
