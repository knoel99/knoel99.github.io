# Données, métriques d'évaluation et antériorité des contraintes « en loi »

Base de faits pour le stage M2 MilaDy (CEREA/ENPC, LISN) : modèles génératifs conditionnels de champs MHD/dynamo.
Recherche effectuée le 2026-11-06. Vérification indépendante effectuée le 2026-11-06 (voir bilan ci-dessous).

## Bilan de vérification

Méthode : chaque DOI a été réinterrogé dans l'API Crossref (70 DOI) et chaque identifiant arXiv dans l'API arXiv (59 identifiants). Les PDF des sources dont un contenu précis est cité ont été téléchargés et relus : The Well, PDEBench, Lemoine 2022, Sejdinovic 2013, Kolouri 2019, Lienen 2024, GenCFD, GenCast, Behme–Schnurr, WGS, Khalifa 2021, Gorham 2019, Tauberschmidt, Wu 2020, Guan 2023, Chattopadhyay v1 et v2, DySLIM, Tao 2013, Bastek, Botvinick-Greenhouse, Young 2002, Amrouche–Seloula 2011. Les pages éditeur ouvertes sont PMLR, JMLR, NeurIPS, ICLR, OpenReview, les pages de jeux de The Well et la notice HAL.

- **Entrées vérifiées sans changement : 132** (balises `[vérifié]`)
- **Entrées corrigées ou complétées : 27** (balises `[corrigé : …]`)
- **Entrées non confirmées : 5** (balises `[NON CONFIRMÉ]`, regroupées dans la section finale « Non confirmé »)

Corrections importantes :
1. **Sejdinovic et al. 2013** : la distance d'énergie n'est pas égale à la MMD. Elle vaut **D_E = 2 γ_k²**, soit deux fois la MMD au carré pour le noyau induit par la distance (éq. de la § 4, PDF l. 679).
2. **Projection de Leray (Tao 2013)** : la citation est fidèle au PDF arXiv, mais la formule imprimée P u := Δ⁻¹(∇×∇×u) a une **erreur de signe** avec le laplacien usuel. Comme ∇×∇× = ∇∇· − Δ, la bonne formule est **P = −Δ⁻¹∇×∇× = I − ∇Δ⁻¹∇·**. La remarque « revient à la même formule » était donc fausse.
3. **Tauberschmidt et al. (arXiv:2508.09156)** : l'article est **publié à ICLR 2026** (en-tête du PDF v3), alors que la fiche disait « sans venue ». Les expériences comprennent aussi Stokes (cavité entraînée), le guidage sur observations éparses et des images naturelles. La récompense est construite sur la moyenne des carrés des résidus faibles.
4. **WGS (Cai et al.)** : l'article est **publié dans SIAM J. Sci. Comput. 48(4):C708–C735 (2026)**, DOI 10.1137/24M1665271, alors que la fiche disait « aucune publication en revue ». Il contient aussi un exemple en d = 10.
5. **Botvinick-Greenhouse et al. 2023** : la matrice de Markov tirée d'une discrétisation upwind de l'équation de continuité appartient à Yang et al. 2023 (leur réf. 18). Botvinick-Greenhouse la **remplacent** par l'équation de Fokker–Planck stationnaire.
6. **Lienen et al. 2024** : les métriques sont en **§ 6.3**, pas en § 4. W2,R porte sur la **vitesse, la vorticité et la pression** normalisées, pas seulement sur la vitesse et la pression.
7. **Young 2002, limite à bruit nul** : la sélection de la mesure SRB par la limite à bruit nul n'est établie que dans le **cadre Axiom A** (Thm 1). Young écrit (§ 2.3) qu'il n'y a « no general result » au-delà, et que toutes les limites à bruit nul ne sont pas SRB. Les points de vigilance du § 3.6 ont été nuancés en conséquence.
8. **Versions publiées omises** :
   - Giorgini et al. : PRL 133:267302 (2024) ;
   - Giorgini : PRE 114:L012102 (2026) ;
   - Del Felice & Giorgini : Chaos 36:063143 (2026) ;
   - PINN-IMSM : Physica D 496:135326 (2026) ;
   - Oommen et al. : Proc. R. Soc. A 481:20240819 (2025) ;
   - Kohl et al. : Neural Networks 199:108641 (2026) ;
   - GenCFD : Nat. Commun. 17:9846 (2026), avec un nouveau titre et B. Raonić en premier auteur ;
   - Martin et al. : ApJS 277(2):48 (2025) ;
   - Chattopadhyay et al. : Environ. Data Sci. 2:e1 (2023) ;
   - Boffi & Vanden-Eijnden : MLST 4:035012 (2023).
9. **JHTDB mhd1024** : une seconde source qui utilise la base (Jafari, arXiv:2605.11305) donne un code pseudo-spectral, Re_λ ≈ 186, ν = η = 1,1×10⁻⁴ et un **forçage de Taylor–Green à k_f = 2**. Ce dernier point **contredit** le « random force » de Lemoine (2022). Cette divergence est signalée dans « Non confirmé ».
10. **Passées de « non confirmé » à « vérifié »** :
    - la venue ICLR 2024 de Universal Guidance (OpenReview) ;
    - Khalafi et al. à NeurIPS 2024 (DOI 10.52202/079017-0836, pp. 26543–26576) ;
    - Jiang et al. à NeurIPS 2023 (OpenReview) ;
    - l'erratum Christensen 2009 : PEPI 172:356, DOI 10.1016/j.pepi.2008.09.014, où E_kin du cas 1 vaut 30,773 ± 0,020 et non 30,733.
11. Corrections mineures :
    - les références à citer pour les jeux MHD de The Well sont [142, 149, 146, 150] ;
    - le nom de l'auteure est N. Seloula, et non « N. El Houda Seloula » ;
    - le titre complet de Peyré & Cuturi est donné ;
    - les métriques BSMSE et BSNMSE de The Well ont été ajoutées ;
    - la venue ICML 2023 de FP-Diffusion a été ajoutée.

**Légende**
- `[vérifié]` : source primaire ouverte par le vérificateur (API Crossref/arXiv, page éditeur, PDF) et concordante. Quand seul l'enregistrement bibliographique a été contrôlé, c'est précisé (« métadonnées »).
- `[corrigé : ancien → nouveau]` : erreur ou omission corrigée sur place.
- `[NON CONFIRMÉ]` : introuvable ou inaccessible dans une source primaire. Ces entrées sont regroupées dans la section finale.
- Les passages marqués **(synthèse)** ou **(dérivation)** sont des raisonnements de l'auteur de la fiche et non des faits sourcés. Les rédacteurs doivent les présenter comme tels.

---

## 1. Jeux de données

### 1.1 The Well (Ohana et al., NeurIPS 2024 Datasets & Benchmarks)

**Référence.** R. Ohana, M. McCabe, L. Meyer, R. Morel, F. J. Agocs, M. Beneitez, M. Berger, B. Burkhart, K. Burns, S. B. Dalziel, D. B. Fielding, D. Fortunato, J. A. Goldberg, K. Hirashima, Y.-F. Jiang, R. R. Kerswell, S. Maddu, J. Miller, P. Mukhopadhyay, S. S. Nixon, J. Shen, R. Watteaux, B. Régaldo-Saint Blancard, F. Rozet, L. H. Parker, M. Cranmer, S. Ho, « The Well: a Large-Scale Collection of Diverse Physics Simulations for Machine Learning », NeurIPS 2024, Track on Datasets and Benchmarks. arXiv:2412.00568 (v1 30/11/2024, v2 21/02/2025). https://arxiv.org/abs/2412.00568 ; PDF v2 : https://arxiv.org/pdf/2412.00568v2 `[vérifié]` (27 auteurs, dates et commentaire arXiv concordants)

Faits généraux (PDF v2) :
- 15 TB, 16 jeux de données (résumé ; § « Format »). `[vérifié]`
- Format HDF5, tableaux `(n_traj, n_steps, coord1, coord2, (coord3))` en fp32 ; champs scalaires, vectoriels et tensoriels distingués ; découpage aléatoire train/test/val = 0.8/0.1/0.1 × n_traj (§ « Format »). `[vérifié]`
- Tableau 1 : ligne `MHD | (x,y,z) | 64³ et 256³ | n_steps = 100 | n_traj = 100`. `[vérifié]`
- Tableau des tailles (annexe) : `MHD_256 : 4580 GB, 48 h, 64 C (cœurs), Fortran MPI` ; `MHD_64 : 72 GB` (pas de coût propre : sous-échantillonné). `[vérifié]`

**MHD_64 / MHD_256** (PDF v2, § 3.1.7 et annexe C.7 ; pages https://polymathic-ai.org/the_well/datasets/MHD_64/ et https://polymathic-ai.org/the_well/datasets/MHD_256/) :
- Physique : turbulence MHD **compressible isotherme**, sans auto-gravité (« such as found in the diffuse ISM »). `[vérifié]`
- Schéma : « third-order-accurate hybrid essentially non-oscillatory (ENO) scheme » pour les **équations de la MHD idéale** (annexe C.7) : `[vérifié]`
  - ∂ρ/∂t + ∇·(ρv) = 0 (éq. 21)
  - ∂(ρv)/∂t + ∇·[ρvv + (p + B²/8π) I − BB/4π] = f (éq. 22)
  - ∂B/∂t − ∇×(v×B) = 0 (éq. 23)
  - Équation d'état isotherme p = c_s² ρ ; forçage f : « random large-scale solenoidal driving at a wave number k ≈ 2.5 (i.e., 1/2.5 of the box size), with continuous driving ».
  - La page web du jeu donne une forme simplifiée sans forçage ni facteurs 4π (∂(ρv)/∂t + ∇·(ρvv − BB) + ∇p = 0).
- Conditions aux limites : périodiques ; grille cartésienne uniforme ; conditions initiales « uniform IC » (pages web). `[vérifié]`
- Paramètres de contrôle (annexe C.7 : « Ms ≡ |v|/cs, and MA ≡ |v|/⟨vA⟩ … ⟨·⟩ signifies averages over the entire simulation box ») : nombre de Mach sonique M_s et nombre de Mach d'Alfvén M_A. `[vérifié]`
  - Valeurs : **M_s ∈ {0.5, 0.7, 1.5, 2.0, 7.0}**, **M_A ∈ {0.7, 2.0}**, soit 10 combinaisons × 10 conditions initiales = **100 trajectoires** (pages web : « 10 Initial conditions x 10 combination of parameters »).
  - Annexe C.7 : régime sous-alfvénique M_A ≈ 0.7 (champ fort) ou super-alfvénique M_A = 2.0. Dans les runs super-alfvéniques, « the initial Alfvén Mach number … is 7.0, but after the small-scale dynamo saturates, the final M_A value is around 2 ».
- Temps : 100 pas stockés, Δt = 0.01 (unités arbitraires), t ∈ [0, 1] (pages web). `[vérifié]`
- Résolution : générées en 256³ ; MHD_64 = sous-échantillonnage en 64³ « after anti-aliasing with an ideal low-pass filter ». `[vérifié]`
- Champs : densité (scalaire), vitesse (vecteur), champ magnétique (vecteur). `[vérifié]`
- Tailles : MHD_256 = 4,58 TB (page) / 4580 GB (tableau) ; MHD_64 = 71,6 GB (page) / 72 GB (tableau). `[vérifié]`
- Coût : 48 h par simulation sur 64 cœurs CPU (Fortran + MPI) ; annexe C.7 : « On 64 CPU cores, it takes 48 hours per simulation ». `[vérifié]`
- Expert du domaine : Blakesley Burkhart (CCA, Flatiron Institute & Rutgers University). Références à citer (annexe C.7) : [142] Cho & Lazarian 2003, MNRAS 345:325–339 ; [149] Burkhart, Falceta-Gonçalves, Kowal, Lazarian 2009, ApJ 693:250–266 ; [146] Portillo & Finkbeiner 2018, ApJ 862:119 ; [150] CATS (Burkhart et al. 2020, voir § 1.4). Les pages web ne demandent que CATS. `[corrigé : « CATS et Cho & Lazarian 2003 » → liste complète [142, 149, 146, 150] de l'annexe C.7]`
- Métriques suggérées par la page MHD_256 : « Power spectrum, two points correlation function ». `[vérifié]`
- Lignes de base : `[vérifié]`
  - Tableau 2, VRMSE en un pas sur le jeu de test, pour MHD_64 : FNO 0.3605, TFNO 0.3561, U-net 0.1798, **CNextU-net 0.1633**. La page web affiche « 3561 » pour TFNO : c'est une coquille.
  - Tableau 3, VRMSE moyen par fenêtre 6:12 / 13:30, pour MHD_64 : FNO 1.24/1.61, TFNO 1.25/1.81, U-net 1.65/4.66, CNextU-net 1.30/2.23.
  - Les valeurs supérieures à 1 sont pires que la prédiction de la moyenne. Légendes des tableaux : « predicting the mean value of the target field results in a score of 1 ».
- **Remarque pour le stage (synthèse)** : ces jeux sont paramétrés en (M_s, M_A), pas en (Re, Rm). Les équations résolues sont idéales, avec une dissipation purement numérique. Pour une étude paramétrique en Re/Rm, il faut produire ses propres données ou utiliser d'autres bases. L'annexe C.7 mentionne une dynamo à petite échelle dans les runs super-alfvéniques.

**Métriques fournies par The Well** (PDF v2, annexe E.3) : `[corrigé : ajout de BSMSE/BSNMSE ; la Fig. 6 utilise BSNMSE]`
- Erreurs ponctuelles :
  - MSE et RMSE ;
  - NMSE = ⟨|u−v|²⟩/(⟨|u|²⟩+ε), avec ε = 10⁻⁷, et NRMSE ;
  - VMSE = ⟨|u−v|²⟩/(⟨|u−ū|²⟩+ε), et **VRMSE** = √VMSE. On a VRMSE(u, ū) ≈ 1 : prédire la moyenne spatiale donne 1 ;
  - L∞.
- Métriques spectrales :
  - **BSMSE_B** = ⟨|u_B − v_B|²⟩, où u_B = F⁻¹[F[u] 1_B] et B est l'une de 3 bandes de nombres d'onde réparties uniformément en échelle log ;
  - **BSNMSE_B** = ⟨|u_B − v_B|²⟩/⟨|v_B|²⟩, normalisée par l'énergie de la bande. C'est elle qu'utilise la Fig. 6 : « we divide the isotropic power spectrum into three bins whose boundaries are evenly distributed in log space and evaluate the growth of RMSE per bin normalized by the true bin energy ».

Autres jeux de The Well avec champ magnétique : `post_neutron_star_merger` (« general relativistic equations of ideal magnetohydrodynamics », code νbhlight). Tableau des tailles : 110 GB. `[vérifié]`

### 1.2 PDEBench (Takamoto et al., NeurIPS 2022 D&B)

**Référence.** M. Takamoto, T. Praditia, R. Leiteritz, D. MacKinlay, F. Alesiani, D. Pflüger, M. Niepert, « PDEBench: An Extensive Benchmark for Scientific Machine Learning », NeurIPS 2022 Datasets and Benchmarks Track. arXiv:2210.07182 (v1 13/10/2022 ; v7 26/08/2024). https://arxiv.org/abs/2210.07182 `[vérifié]`

- Tableau 1 (11 lignes) : `[vérifié]`
  - advection 1D (1024, 200 pas, 10 000 échantillons) ;
  - Burgers 1D (1024, 200, 10 000) ;
  - diffusion-réaction 1D (1024, 200, 10 000) et 2D (128², 100, 1000) ;
  - diffusion-sorption 1D (1024, 100, 10 000) ;
  - Navier–Stokes compressible 1D (1024, 100, 10 000), 2D (512², 21, 1000) et 3D (128³, 21, 100) ;
  - Navier–Stokes incompressible 2D (256², 1000, 1000) ;
  - Darcy 2D stationnaire (128², 10 000) ;
  - eaux peu profondes 2D (128², 100, 1000).
  - **Aucun jeu MHD.**
- Métriques (§ 4 et annexe B) : `[vérifié]`
  - RMSE ;
  - nRMSE = ‖u_pred − u_true‖₂ / ‖u_true‖₂ ;
  - erreur max ;
  - **cRMSE**, l'écart sur une quantité conservée ;
  - **bRMSE**, l'erreur au bord ;
  - **fRMSE** dans l'espace de Fourier par bandes : « Low: kmin = 0, kmax = 4, Middle: kmin = 5, kmax = 12, and High: kmin = 13, kmax = ∞ » (annexe B, éq. 5). En multi-D, on intègre |F[u_pred − u_true](k)|² sur la coordonnée angulaire puis on somme en k.
- Lignes de base : FNO, U-Net, PINN, méthode inverse par gradient (résumé). `[vérifié]`

### 1.3 JHTDB : turbulence MHD forcée 1024³ (« mhd1024 »)

- Faits vérifiés dans une source primaire qui utilise la base : M. Lemoine, « First-principles Fermi acceleration in magnetized turbulence », Phys. Rev. Lett. 129, 215101 (2022), DOI 10.1103/PhysRevLett.129.215101, arXiv:2210.01038, **annexe B** (PDF relu) `[vérifié]` :
  - « direct numerical simulation of **incompressible MHD** on a **periodic grid containing 1 024³ cells**, sampled on **1 024 time steps** » ;
  - « visco-resistive, with magnetic Reynolds number at the Taylor scale ≃ 140, and magnetic Prandtl number unity » ;
  - snapshots archivés « after the simulation has reached a statistically stationary state » ;
  - forçage : « external random force acting on velocity fluctuations on a stirring scale equal to 0.5 in units of the size of the simulation box » ;
  - « There is no guide field ».
- Seconde source qui utilise la base : A. Jafari, « Non-Dynamic Alignment in Magnetohydrodynamic Turbulence », arXiv:2605.11305 (2026), § 3.1.1, PDF lu. Selon elle, il s'agit d'une simulation « forced, periodic, pseudospectral full-MHD … with no imposed uniform guide field », avec « Taylor-scale Reynolds number Re_λ ≃ 186 », « ν = η = 1.1 × 10⁻⁴ », « Taylor–Green forcing at k_f = 2 » et Re_b = b′L_b/η = 764. `[corrigé : ajout d'une seconde source ; le type de forçage diverge de Lemoine, voir « Non confirmé »]`
- Référence de la base citée par Lemoine ([42]) : G. Eyink, E. Vishniac, C. Lalescu, H. Aluie, K. Kanov, K. Bürger, R. Burns, C. Meneveau, A. Szalay, « Flux-freezing breakdown in high-conductivity magnetohydrodynamic turbulence », Nature 497(7450):466–469 (2013), https://doi.org/10.1038/nature12128 `[vérifié]`.
- Article de référence du cluster JHTDB : Y. Li, E. Perlman, M. Wan, Y. Yang, C. Meneveau, R. Burns, S. Chen, A. Szalay, G. Eyink, « A public turbulence database cluster and applications to study Lagrangian evolution of velocity increments in turbulence », J. Turbulence 9, N31 (2008), https://doi.org/10.1080/14685240802376389 `[vérifié]`.
- Le README officiel (https://turbulence.idies.jhu.edu/docs/mhd/README-MHD.pdf) renvoie toujours HTTP 503 (WebFetch), et la chaîne TLS du serveur échoue avec curl. Voir « Non confirmé ».

### 1.4 CATS (Catalogue for Astrophysical Turbulence Simulations)

B. Burkhart, S. M. Appel, S. Bialy, J. Cho, A. J. Christensen, D. Collins, C. Federrath, D. B. Fielding, D. Finkbeiner, A. S. Hill, J. C. Ibáñez-Mejía, M. R. Krumholz, A. Lazarian, M. Li, P. Mocz, M.-M. Mac Low, J. Naiman, S. K. N. Portillo, B. Shane, Z. Slepian, Y. Yuan, « The Catalogue for Astrophysical Turbulence Simulations (CATS) », ApJ 905(1):14 (2020), https://doi.org/10.3847/1538-4357/abc484 ; arXiv:2010.11227 `[vérifié]`.
- Contenu (résumé arXiv) : simulations MHD de turbulence en boîte produites avec les codes publics athena++, arepo, enzo et flash ; produits d'observation synthétiques (cubes HI turbulents) ; spectres de puissance et fonctions de corrélation à 3 points pour une partie des données. Site : www.mhdturbulence.com. Les pages MHD de The Well renvoient à CATS comme article associé. `[vérifié]`

### 1.5 Benchmarks numériques de dynamo (valeurs de référence, pas des jeux de données ML)

- U. R. Christensen, J. Aubert, P. Cardin, E. Dormy, S. Gibbons, G. A. Glatzmaier, E. Grote, Y. Honkura, C. Jones, M. Kono, M. Matsushima, A. Sakuraba, F. Takahashi, A. Tilgner, J. Wicht, K. Zhang, « A numerical dynamo benchmark », Phys. Earth Planet. Inter. 128(1–4):25–34 (2001), https://doi.org/10.1016/S0031-9201(01)00275-8 `[vérifié]`. Erratum : « Erratum to “A numerical dynamo benchmark” », PEPI 172:356 (2009), https://doi.org/10.1016/j.pepi.2008.09.014. Sa notice HAL insu-00447063 a été lue via l'API HAL : « Table 4 … contains a typographical error. In case 1 the correct value for the kinetic energy Ekin is 30.773 ± 0.020 (not 30.733 ± 0.020) ». `[corrigé : erratum « trouvé par recherche mais non ouvert » → référence complète et contenu vérifiés]`
- C. A. Jones, P. Boronski, A. S. Brun, G. A. Glatzmaier, T. Gastine, M. S. Miesch, J. Wicht, « Anelastic convection-driven dynamo benchmarks », Icarus 216(1):120–135 (2011), https://doi.org/10.1016/j.icarus.2011.08.014 `[vérifié]`.
- H. Matsui et al. (37 auteurs, dont J.-L. Guermond), « Performance benchmarks for a next generation numerical dynamo model », Geochem. Geophys. Geosyst. 17(5):1586–1607 (2016), https://doi.org/10.1002/2015GC006159 `[vérifié]` (37 auteurs comptés dans Crossref).

### 1.6 Autres travaux génératifs MHD (données produites, utiles comme comparaison)

- S. Kacmaz, E. A. Huerta, R. Haas, « Resolving Turbulent Magnetohydrodynamics: A Hybrid Operator-Diffusion Framework », Mach. Learn.: Sci. Technol. 6, 035057 (2025), DOI 10.1088/2632-2153/ae054c, arXiv:2507.02106 `[vérifié]`.
  - Il s'agit de MHD **2D incompressible résistive**. La méthode combine un PINO et une diffusion conditionnelle pour les résidus haute fréquence.
  - L'ensemble d'entraînement couvre **Re ∈ {100, 250, 500, 750, 1000, 3000, 10000}**.
  - Le modèle reproduit les distributions spectrales d'énergie de la vitesse et du champ magnétique à Re = 1000 et 3000 (résumé).
  - La disponibilité publique des données n'a pas été vérifiée : voir « Non confirmé ».
- J. Martin, J. Lübke, T. Li, M. Buzzicotti, R. Grauer, L. Biferale, « Generation of Cosmic-Ray Trajectories by a Diffusion Model Trained on Test Particles in 3D Magnetohydrodynamic Turbulence », ApJS 277(2):48 (2025), https://doi.org/10.3847/1538-4365/adb432, arXiv:2412.12923. Métriques : incréments de vitesse, transport spatial, statistiques de courbure. `[corrigé : « accepté ApJS selon le commentaire arXiv » → publié ApJS 277(2):48, 2025]`
- C. Pedersen, L. Zanna, J. Bruna, « Thermalizer: Stable autoregressive neural emulation of spatiotemporal chaos », arXiv:2503.18731, ICML 2025 (poster, OpenReview) `[vérifié]`.
  - Un modèle de diffusion entraîné sur la **mesure invariante** sert d'estimateur implicite du score. Il permet de « thermaliser » (débruiter) en ligne un émulateur autorégressif.
  - L'horizon de stabilité est allongé « by an order of magnitude » (résumé).

---

## 2. Métriques pour modèles génératifs de champs physiques

### 2.1 Erreurs déterministes (référence, peu adaptées à la génération)
VRMSE et NRMSE (The Well, § 1.1), nRMSE/cRMSE/bRMSE/fRMSE (PDEBench, § 1.2). **(synthèse)** Pour des échantillons d'une loi, ces erreurs point à point sont dominées par la variance intrinsèque. Il faut les remplacer par des distances entre lois et des statistiques physiques (§ 2.2–2.8).

### 2.2 Spectres d'énergie et « erreur spectrale »
- Ouvrages de référence : U. Frisch, *Turbulence: The Legacy of A. N. Kolmogorov*, CUP (1995), https://doi.org/10.1017/CBO9781139170666 `[vérifié]` ; D. Biskamp, *Magnetohydrodynamic Turbulence*, CUP (2003), https://doi.org/10.1017/CBO9780511535222 `[vérifié]`.
- Variantes publiées de l'erreur spectrale :
  - The Well : BSNMSE par bande (3 bandes log-uniformes), normalisée par l'énergie vraie de la bande (annexe E.3 et Fig. 6, arXiv:2412.00568v2) `[vérifié]`.
  - PDEBench : fRMSE low/mid/high (bandes k ∈ [0,4], [5,12], [13,∞), annexe B) `[vérifié]`.
  - Lienen et al. (ICLR 2024) : distance L2 entre **log-spectres d'énergie cinétique turbulente** (TKE), puis W₂ entre ensembles d'échantillons (« W2,TKE »), § 6.3 éq. (7) et annexe E (voir § 2.6) `[corrigé : § 4 → § 6.3]`.
  - Chattopadhyay & Hassanzadeh : régularisation spectrale (§ 3.5).
  - GenCast (Price et al., Nature 637(8044):84–90, 2025, https://doi.org/10.1038/s41586-024-08252-9 ; arXiv:2312.15796) : comparaison des spectres de puissance spatiaux des échantillons à ERA5 (Fig. 2, panneaux g et m) `[vérifié]`.
- G. Kohl, L.-W. Chen, N. Thuerey, « Benchmarking Autoregressive Conditional Diffusion Models for Turbulent Flow Simulation », Neural Networks 199:108641 (2026), https://doi.org/10.1016/j.neunet.2026.108641, arXiv:2309.01745 : évalue « accuracy, posterior sampling, spectral behavior, and temporal stability » sur 3 cas 2D (incompressible, transsonique, turbulence isotrope). `[corrigé : arXiv seul → publié dans Neural Networks 199:108641 (2026)]`
- V. Oommen, A. Bora, Z. Zhang, G. E. Karniadakis, « Integrating neural operators with diffusion models improves spectral representation in turbulence modeling », Proc. R. Soc. A 481(2309):20240819 (2025), https://doi.org/10.1098/rspa.2024.0819, arXiv:2409.08477 : diffusion conditionnée par un opérateur neuronal pour corriger le biais spectral ; validé sur un jet à grand Re et sur de la vélocimétrie Schlieren. `[corrigé : arXiv seul → publié Proc. R. Soc. A 481:20240819 (2025)]`

### 2.3 PDF d'incréments, fonctions de structure, flatness
- Cadre K41 et intermittence : Frisch (1995), ci-dessus.
- MHD : H. Politano, A. Pouquet, « von Kármán–Howarth equation for magnetohydrodynamics and its consequences on third-order longitudinal structure and correlation functions », Phys. Rev. E 57(1):R21–R24 (1998), https://doi.org/10.1103/PhysRevE.57.R21 `[vérifié]` (métadonnées ; lois exactes d'ordre 3 pour les variables d'Elsässer : contenu non relu).
- Usage pour un modèle de diffusion : T. Li, L. Biferale, F. Bonaccorso, M. A. Scarpolini, M. Buzzicotti, « Synthetic Lagrangian turbulence by generative diffusion models », Nat. Mach. Intell. 6(4):393–403 (2024), https://doi.org/10.1038/s42256-024-00810-0, arXiv:2307.08529 `[vérifié]`.
  - Le résumé dit que le modèle reproduit « the fat-tail distribution for velocity increments, the anomalous power law, and the increased intermittency around the dissipative scale ».
  - Des écarts subsistent sous l'échelle dissipative (accélération, flatness).

### 2.4 Hélicités (cinétique, magnétique, croisée)
Définitions usuelles : H_K = ∫ u·ω dV ; H_M = ∫ A·B dV (B = ∇×A) ; H_C = ∫ u·B dV.
- H. K. Moffatt, « The degree of knottedness of tangled vortex lines », J. Fluid Mech. 35(1):117–129 (1969), https://doi.org/10.1017/S0022112069000991 `[vérifié]`.
- L. Woltjer, « A theorem on force-free magnetic fields », PNAS 44(6):489–491 (1958), https://doi.org/10.1073/pnas.44.6.489 `[vérifié]` (invariant ∫A·B en MHD idéale ; métadonnées).
- M. A. Berger, G. B. Field, « The topological properties of magnetic helicity », J. Fluid Mech. 147:133–148 (1984), https://doi.org/10.1017/S0022112084002019 `[vérifié]`. Résumé lu via Crossref : « There exists no absolute measure of the helicity within a subvolume of space if that subvolume is not bounded by a magnetic surface. However, a topologically meaningful and gauge-invariant relative measure of helicity for such volumes is presented here ».
- H. K. Moffatt, R. L. Ricca, « Helicity and the Călugăreanu invariant », Proc. R. Soc. Lond. A 439(1906):411–429 (1992), https://doi.org/10.1098/rspa.1992.0159 `[vérifié]`.
- **(synthèse, appuyée par le résumé de Berger & Field)** H_M n'est invariante de jauge que si le volume est borné par une surface magnétique (B·n = 0 au bord). Si un flux sort du domaine borné, il faut utiliser l'hélicité relative. `[vérifié]`

### 2.5 Divergence (∇·B, ∇·u)
- Effet d'un ∇·B ≠ 0 numérique : J. U. Brackbill, D. C. Barnes, « The Effect of Nonzero ∇·B on the numerical solution of the magnetohydrodynamic equations », J. Comput. Phys. 35(3):426–430 (1980), https://doi.org/10.1016/0021-9991(80)90079-0 `[vérifié]` ; G. Tóth, « The ∇·B=0 Constraint in Shock-Capturing Magnetohydrodynamics Codes », J. Comput. Phys. 161(2):605–652 (2000), https://doi.org/10.1006/jcph.2000.6519 `[vérifié]`.
- **(synthèse)** Métrique adimensionnée possible : ‖∇·B‖₂ / (‖∇B‖₂) ou ‖∇·B‖₂ · Δx / ‖B‖₂. Elle doit être calculée avec **le même opérateur discret** que celui de la projection (spectral ou différences finies), sinon l'erreur de troncature domine.

### 2.6 Distances entre lois
- **MMD** : A. Gretton, K. M. Borgwardt, M. J. Rasch, B. Schölkopf, A. Smola, « A Kernel Two-Sample Test », JMLR 13(25):723–773 (2012), https://jmlr.org/papers/v13/gretton12a.html `[vérifié]`. γ_k²(P,Q) = E k(Z,Z′) + E k(W,W′) − 2E k(Z,W) (forme rappelée par Sejdinovic et al. 2013, éq. (3.3), PDF relu) `[vérifié]`.
- **Distance d'énergie (Székely)** : G. J. Székely, M. L. Rizzo, « Energy statistics: A class of statistics based on distances », J. Stat. Plan. Inference 143(8):1249–1272 (2013), https://doi.org/10.1016/j.jspi.2013.03.018 `[vérifié]`. Définition D_E(P,Q) = 2E‖Z−W‖₂ − E‖Z−Z′‖₂ − E‖W−W′‖₂ (éq. 2.3 de Sejdinovic et al.) `[vérifié]`.
- **Lien MMD ↔ distance d'énergie** : D. Sejdinovic, B. Sriperumbudur, A. Gretton, K. Fukumizu, « Equivalence of distance-based and RKHS-based statistics in hypothesis testing », Ann. Statist. 41(5):2263–2291 (2013), https://doi.org/10.1214/13-AOS1140, arXiv:1207.6076 (PDF relu). Pour un « distance kernel » k induit par la semi-métrique ρ, on a **D_{E,ρ}(P,Q) = 2 γ_k²(P,Q)** : la distance d'énergie vaut deux fois le carré de la MMD. `[corrigé : « la MMD … coïncide exactement avec la distance d'énergie » → D_E = 2·MMD² (égalité à un facteur 2 près, MMD au carré)]`
- **Wasserstein** : C. Villani, *Optimal Transport: Old and New*, Grundlehren der math. Wiss., Springer (2009), https://doi.org/10.1007/978-3-540-71050-9 `[vérifié]` ; G. Peyré, M. Cuturi, « Computational Optimal Transport: With Applications to Data Science », Found. Trends Mach. Learn. 11(5–6):355–607 (2019), https://doi.org/10.1561/2200000073 `[corrigé : titre abrégé → titre complet avec sous-titre]`.
- **Sliced Wasserstein** : `[vérifié]`
  - Références : J. Rabin, G. Peyré, J. Delon, M. Bernot, « Wasserstein Barycenter and Its Application to Texture Mixing », SSVM 2011, LNCS pp. 435–446 (2012), https://doi.org/10.1007/978-3-642-24785-9_37 ; N. Bonneel, J. Rabin, G. Peyré, H. Pfister, « Sliced and Radon Wasserstein Barycenters of Measures », J. Math. Imaging Vis. 51(1):22–45 (2015), https://doi.org/10.1007/s10851-014-0506-3.
  - Définition : SW_p(μ,ν) = (∫_{S^{d−1}} W_p^p(Rμ(·,θ), Rν(·,θ)) dθ)^{1/p}, via la transformée de Radon. On la calcule par Monte Carlo sur les directions θ, avec des problèmes de transport 1D en forme close.
  - Source de la définition : Kolouri, Nadjahi, Şimşekli, Badeau, Rohde, « Generalized Sliced Wasserstein Distances », arXiv:1902.00434, éq. (7) (PDF relu).
- **Divergence de Sinkhorn** (entre OT et MMD) : J. Feydy, T. Séjourné, F.-X. Vialard, S. Amari, A. Trouvé, G. Peyré, « Interpolating between Optimal Transport and MMD using Sinkhorn Divergences », arXiv:1810.08278 `[vérifié]`. Utilisée comme métrique d'évaluation dans DySLIM (Fig. 1b, Lorenz 63 ; DySLIM cite Genevay et al. 2018) `[vérifié]`.
- **KID** (MMD sur descripteurs) : Bińkowski, Sutherland, Arbel, Gretton, « Demystifying MMD GANs », ICLR 2018, arXiv:1801.01401 `[vérifié]`.
- Usages en turbulence générative :
  - Lienen, Lüdke, Hansen-Palmus, Günnemann, « From Zero to Turbulence: Generative Modeling for 3D Flow Simulation », ICLR 2024, arXiv:2306.01776 (PDF relu, § 6.3 et annexe E). L'article propose deux métriques nouvelles :
    - **W2,TKE** : W₂ entre ensembles, avec pour coût la distance L2 entre log-spectres TKE, calculée par blocs (éq. 7, 9, 10) ;
    - **W2,R** : W₂ entre ensembles de valeurs normalisées de **vitesse, vorticité et pression** par cellule. Les régions homogènes sont obtenues par k-means sur des approximations gaussiennes des marginales de vitesse (éq. 8).
    - Motivation : les métriques de type FID reposent sur des plongements appris, et la distance euclidienne est inadaptée aux champs turbulents.
    - `[corrigé : « § 4 » → « § 6.3 » ; « vitesse+pression » → « vitesse, vorticité et pression »]`
  - GenCFD : Molinaro, Lanthaler, Raonić et al., « Generative AI for fast and accurate statistical computation of fluids », arXiv:2409.18359, § 6.9 relu. `[corrigé : arXiv seul → version publiée : B. Raonić, R. Molinaro, S. Lanthaler et al. (ordre des auteurs modifié), « Generative AI for efficient statistical computation of fluids », Nat. Commun. 17:9846 (2026), https://doi.org/10.1038/s41467-026-76390-x]` Le § 6.9 de la version arXiv définit :
    - l'erreur L2 sur la moyenne, e_μ (éq. 78) ;
    - l'erreur L2 sur l'écart-type, e_σ, normalisée (éq. 79) ;
    - la **W_s 1-point** sur M points, calculée via les fonctions de répartition inverses (éq. 80) ;
    - le CRPS d'ensemble (éq. 81–83).

### 2.7 Scores probabilistes (CRPS, energy score)
- J. E. Matheson, R. L. Winkler, « Scoring Rules for Continuous Probability Distributions », Manag. Sci. 22(10):1087–1096 (1976), https://doi.org/10.1287/mnsc.22.10.1087 `[vérifié]`.
- T. Gneiting, A. E. Raftery, « Strictly Proper Scoring Rules, Prediction, and Estimation », JASA 102(477):359–378 (2007), https://doi.org/10.1198/016214506000001437 `[vérifié]` (métadonnées ; référence standard pour CRPS et energy score multivarié, citée comme telle par GenCast § E.2.1 ; contenu non relu).
- H. Hersbach, « Decomposition of the Continuous Ranked Probability Score for Ensemble Prediction Systems », Weather Forecast. 15(5):559–570 (2000), https://doi.org/10.1175/1520-0434(2000)015<0559:DOTCRP>2.0.CO;2 `[vérifié]`.
- C. A. T. Ferro, « Fair scores for ensemble forecasts », Q. J. R. Meteorol. Soc. 140(683):1917–1923 (2014), https://doi.org/10.1002/qj.2270 `[vérifié]`.
- Estimateur d'ensemble utilisé dans GenCast (arXiv:2312.15796, annexe E.2.1, éq. E1, relu) : `[vérifié]`
  - CRPS = (1/M)Σ_m |x_m − y| − (1/(2M²)) Σ_{m,m′} |x_m − x_m′|, moyenné sur les points de grille pondérés a_i et sur les dates.
  - GenCast utilise l'estimateur « traditionnel » et non le « fair CRPS ».
  - Chiffre clé : GenCast est « significantly more skillful (p < 0.05) than ENS's on **97.4%** of our **1320** variable, lead time, and vertical level combinations » (Fig. 3).

### 2.8 Métriques topologiques
**Homologie persistante (fondements)**
- H. Edelsbrunner, D. Letscher, A. Zomorodian, « Topological Persistence and Simplification », Discrete Comput. Geom. 28(4):511–533 (2002), https://doi.org/10.1007/s00454-002-2885-2 `[vérifié]`.
- A. Zomorodian, G. Carlsson, « Computing Persistent Homology », Discrete Comput. Geom. 33(2):249–274 (2005), https://doi.org/10.1007/s00454-004-1146-y `[vérifié]`.
- D. Cohen-Steiner, H. Edelsbrunner, J. Harer, « Stability of Persistence Diagrams », Discrete Comput. Geom. 37(1):103–120 (2007), https://doi.org/10.1007/s00454-006-1276-5 `[vérifié]` (stabilité des diagrammes : base pour utiliser bottleneck/Wasserstein entre diagrammes comme métrique).
- R. J. Adler, O. Bobrowski, M. S. Borman, E. Subag, S. Weinberger, « Persistent homology for random fields and complexes », IMS Collections 6:124–143 (2010), https://doi.org/10.1214/10-IMSCOLL609 `[vérifié]`.
- H. Adams et al., « Persistence Images: A Stable Vector Representation of Persistent Homology », JMLR 18(8):1–35 (2017), arXiv:1507.06217 `[vérifié]`.
- Logiciel : C. Maria, J.-D. Boissonnat, M. Glisse, M. Yvinec, « The Gudhi Library: Simplicial Complexes and Persistent Homology », ICMS 2014, LNCS pp. 167–174, https://doi.org/10.1007/978-3-662-44199-2_28 `[vérifié]`.

**Applications à des champs physiques**
- M. Kramár, R. Levanger, J. Tithof, B. Suri, M. Xu, M. Paul, M. F. Schatz, K. Mischaikow, « Analysis of Kolmogorov flow and Rayleigh–Bénard convection using persistent homology », Physica D 334:82–98 (2016), https://doi.org/10.1016/j.physd.2016.02.003 `[vérifié]`.
- P. Pranav, H. Edelsbrunner, R. van de Weygaert, G. Vegter, M. Kerber, B. J. T. Jones, M. Wintraecken, « The topology of the cosmic web in terms of persistent Betti numbers », MNRAS 465(4):4281–4310 (2017), https://doi.org/10.1093/mnras/stw2862 `[vérifié]`.
- **MHD** : I. Makarenko, A. Shukurov, R. Henderson, L. F. S. Rodrigues, P. Bushby, A. Fletcher, « Topological signatures of interstellar magnetic fields – I. Betti numbers and persistence diagrams », MNRAS 475(2):1843–1858 (2018), https://doi.org/10.1093/mnras/stx3337, arXiv:1708.04558 `[vérifié]`.
  - La TDA (nombres de Betti, diagrammes de persistance) est appliquée à la densité d'une simulation MHD du milieu interstellaire multiphase **avec action dynamo**.
  - La TDA est « sensitive to all statistical moments ».
  - Elle détecte l'effet du champ magnétique au-delà de l'analyse de corrélation : le champ rend l'ISM plus homogène, avec moins de nuages isolés et de cavités (résumé).
- I. Makarenko, P. Bushby, A. Fletcher, R. Henderson, N. Makarenko, A. Shukurov, « Topological data analysis and diagnostics of compressible magnetohydrodynamic turbulence », J. Plasma Phys. 84(4):735840403 (2018), https://doi.org/10.1017/S0022377818000752 `[vérifié]`.
- R. Henderson, I. Makarenko, P. Bushby, A. Fletcher, A. Shukurov, « Statistical Topology and the Random Interstellar Medium », JASA 115(530):625–635 (2020), https://doi.org/10.1080/01621459.2019.1647841 `[vérifié]`.
- B. A. Carreras, I. Llerena, L. Garcia, I. Calvo, « Topological characterization of flow structures in resistive pressure-gradient-driven turbulence », Phys. Rev. E 78, 066402 (2008), arXiv:0811.3548 `[vérifié]` (le PDF emploie les nombres de Betti et ne contient aucune occurrence de « persistence »).

**TDA comme métrique de modèles génératifs**
- V. Khrulkov, I. Oseledets, « Geometry Score: A Method For Comparing Generative Adversarial Networks », ICML 2018, arXiv:1802.02664 `[vérifié]`.
- S. Barannikov et al., « Manifold Topology Divergence: a Framework for Comparing Data Manifolds », NeurIPS 2021, arXiv:2106.04024 `[vérifié]`.

**Topologie magnétique : points nuls, squelette, connectivité**
- C. E. Parnell, J. M. Smith, T. Neukirch, E. R. Priest, « The structure of three-dimensional magnetic neutral points », Phys. Plasmas 3(3):759–770 (1996), https://doi.org/10.1063/1.871810 `[vérifié]`.
- J. M. Greene, « Locating three-dimensional roots by a bisection method », J. Comput. Phys. 98(2):194–198 (1992), https://doi.org/10.1016/0021-9991(92)90137-N `[vérifié]`.
- A. L. Haynes, C. E. Parnell, « A trilinear method for finding null points in a three-dimensional vector space », Phys. Plasmas 14(8):082107 (2007), https://doi.org/10.1063/1.2756751 `[vérifié]`.
- A. L. Haynes, C. E. Parnell, « A method for finding three-dimensional magnetic skeletons », Phys. Plasmas 17(9):092903 (2010), https://doi.org/10.1063/1.3467499 `[vérifié]`.
- V. S. Titov, G. Hornig, P. Démoulin, « Theory of magnetic connectivity in the solar corona », J. Geophys. Res. 107(A8) (2002), https://doi.org/10.1029/2001JA000278 `[vérifié]` (le résumé décrit les tubes de flux « strongly squashed », d'où le facteur de compression « squashing factor » Q).

### 2.9 Batterie d'évaluation proposée (synthèse)
Pour chaque condition (paramètres p) et N échantillons générés vs N de référence :
1. statistiques 1-point : W₁ 1-point (GenCFD), moyenne/écart-type ;
2. spectres E_u(k), E_B(k), hélicité spectrale, erreur log-spectrale par bandes (The Well / PDEBench / Lienen) ;
3. PDF d'incréments δ_ℓu, δ_ℓB et flatness F(ℓ) (Frisch ; Li et al. 2024) ;
4. invariants intégrés : énergie, H_K, H_M (jauge de Coulomb, domaine périodique), H_C, puis distance entre leurs lois (CRPS ou W₁) ;
5. ‖∇·B‖ normalisée (même opérateur discret) ;
6. distances globales : MMD/énergie (liées par D_E = 2·MMD², Sejdinovic 2013), sliced-W₂ sur champs ou descripteurs ;
7. topologie : diagrammes de persistance de |B|, |ω| ou J·B (distance de Wasserstein entre diagrammes, stabilité Cohen-Steiner) ; nombre et type de points nuls (Haynes–Parnell).

---

## 3. Antériorité : imposer une contrainte physique sur la **loi** générée

### 3.0 Énoncé de l'idée et socle mathématique
Idée à situer : « la contrainte en loi d'un état statistiquement stationnaire est la forme faible de l'équation de Liouville / Fokker–Planck stationnaire, E_μ[F·∇φ + (σ²/2)Δφ] = 0 pour toute fonction test φ ; le bilan d'énergie est le cas φ = énergie ; on l'impose à un modèle génératif conditionnel par inclinaison exponentielle à l'échantillonnage (I-projection) ou par une perte de discrepance de stationnarité ».

Faits établis :
- **Critère générateur ↔ invariance.** `[vérifié]`
  - Citation : « a probability measure µ on R^d is invariant … for the Feller process X … if and only if ∫ Af(x) µ(dx) = 0 holds for all f in a core of the generator A ». C'est le Thm 3.37 de Liggett, *Continuous Time Markov Processes* (2010), cité par A. Behme, A. Schnurr, « A criterion for invariant measures of Itô processes based on the symbol », Bernoulli 21(3):1697–1718, 2015, DOI 10.3150/14-BEJ618, arXiv:1310.4333 (§ 1, PDF relu).
  - Les mêmes auteurs notent que, pour des processus de Markov généraux, la **nécessité** tient toujours (Ethier–Kurtz, Prop. 9.2). La **suffisance** demande en revanche des hypothèses supplémentaires (Echeverría 1982 ; Bhatt–Karandikar 1993).
  - Une mesure qui vérifie seulement la condition est dite « infinitesimal invariant ».
  - P. Echeverría, « A criterion for invariant measures of Markov processes », Z. Wahrscheinlichkeitstheorie verw. Gebiete 61(1):1–16 (1982), https://doi.org/10.1007/BF00537221 `[vérifié]` (métadonnées ; texte non consulté).
  - S. N. Ethier, T. G. Kurtz, *Markov Processes: Characterization and Convergence*, Wiley (1986), https://doi.org/10.1002/9780470316658 `[vérifié]`.
  - V. Bogachev, N. Krylov, M. Röckner, S. Shaposhnikov, *Fokker–Planck–Kolmogorov Equations*, AMS Math. Surveys Monogr. 207 (2015), https://doi.org/10.1090/surv/207 `[vérifié]` (référence [1] de WGS pour la forme faible, contrôlé dans la bibliographie de WGS).
- **Forme faible exacte (publiée).** `[vérifié]`
  - Pour dX = b dt + √2 σ dW, avec D = σσᵀ : ⟨L*φ, p⟩ = 0 ∀φ ∈ C_c^∞, où **L*φ = b·∇φ + D:∇∇φ** est « the infinitesimal generator of the stochastic process ». Source : Cai, Cao, Huang, Zhou, WGS, éq. (1), (2), (6) (PDF relu).
  - Avec un bruit additif isotrope dX = F dt + s dW, on a D = s²/2 et L*φ = F·∇φ + (s²/2)Δφ : c'est exactement la formule de l'idée.
- **Cas déterministe et dissipatif (σ = 0).** L. S. Young, « What Are SRB Measures, and Which Dynamical Systems Have Them? », J. Stat. Phys. 108(5–6):733–754 (2002), https://doi.org/10.1023/A:1019762724717 (texte relu, PDF de l'auteure). Ce que dit le texte :
  - « SRB measures are the invariant measures most compatible with volume when volume is not preserved » ;
  - près d'un attracteur, l'application est souvent contractante en volume, « ruling out the possibility of an invariant measure equivalent to volume » ;
  - la mesure SRB a une densité le long des directions instables mais est « usually singular with respect to Lebesgue measure » dans la direction stable ;
  - le support d'un attracteur réellement contractant est de mesure de Lebesgue nulle ;
  - la mesure SRB est la **limite à bruit nul** des petites perturbations aléatoires (Thm 1 (iv)), **dans le cadre Axiom A seulement**. Hors de ce cadre, Young écrit (§ 2.3) : « it is conceivable that under suitable conditions, SRB measures are stochastically stable … but as of now there is no general result to that effect. Evidently, not all zero-noise limits are SRB ».
  - `[corrigé : ajout de la restriction Axiom A et de la réserve du § 2.3]`
  - **(synthèse)** Conséquence : pour la turbulence et la dynamo, on s'attend à ce que l'équation de Liouville n'ait pas de solution-densité. Seule la **forme faible** (tests φ) a donc un sens, ce qui plaide pour la formulation proposée.
- **Non-unicité.** DySLIM (PDF relu, note 4 du § 3) : « We note that invariant measures may not be unique ». `[vérifié]`
  - **(synthèse)** E_μ[F·∇φ] = 0 ∀φ est satisfait par toute mesure invariante (points fixes, orbites périodiques instables). La contrainte de stationnarité ne sélectionne donc pas la mesure physique.
  - Il faut la combiner à un terme d'attache aux données, ou passer par la limite à faible bruit. Cette sélection n'est garantie qu'en cadre Axiom A (Young 2002, Thm 1 et § 2.3).
  - Botvinick-Greenhouse et al. modélisent d'ailleurs avec Fokker–Planck (D > 0) plutôt qu'avec l'équation de continuité (contribution 1 de leur introduction) `[vérifié]`.
- **Bilan d'énergie comme cas particulier (dérivation, non sourcée).** `[vérifié : calcul refait, aucune source]`
  - Pour Navier–Stokes/MHD incompressible forcé : F(u,B) = (−P[(u·∇)u − (∇×B)×B] + νΔu + f, ∇×(u×B) + ηΔB).
  - Avec φ = E = ½∫(|u|²+|B|²) et un bruit nul : F·∇φ = dE/dt = ∫u·f − ν∫|∇u|² − η∫|∇B|² (domaine périodique).
  - Le vérificateur a refait le calcul : ∫u·(u·∇)u = 0 ; le terme de Lorentz ∫u·((∇×B)×B) et le terme d'induction ∫B·∇×(u×B) = −∫u·((∇×B)×B) s'annulent.
  - La condition E_μ[F·∇E] = 0 s'écrit donc « injection moyenne = dissipation moyenne ».
  - Avec un forçage stochastique blanc de covariance Q, s'y ajoute le terme d'Itô (s²/2)·tr(Q), qui est le taux d'injection du bruit.
  - Avec φ = H_M (domaine périodique, sans forçage magnétique), on obtient E_μ[−2η ∫ J·B] = 0.
  - **Ces formules restent des dérivations à rédiger par les auteurs. Aucune source ne les énonce sous cette forme.**

### 3.1 (a) I-projection et maximum d'entropie → inclinaison exponentielle
- E. T. Jaynes, « Information Theory and Statistical Mechanics », Phys. Rev. 106(4):620–630 (1957), https://doi.org/10.1103/PhysRev.106.620 `[vérifié]`.
- I. Csiszár, « I-Divergence Geometry of Probability Distributions and Minimization Problems », Ann. Probab. 3(1):146–158 (1975), https://doi.org/10.1214/aop/1176996454 `[vérifié]`. Métadonnées et résumé lus via Crossref : « The minimum discrimination information problem is viewed as that of projecting a PD onto a convex set of PD's … existence theorems for and characterizations of the minimizing PD ». Texte intégral non accessible.
- Énoncé vérifié dans Khalifa et al. (ICLR 2021, § 2.1 et annexe A.1, PDF relu) `[vérifié]` :
  - pour C = {c : E_c[φ_i] = μ̄_i} non vide, le problème p = argmin_{c∈C} KL(c‖a) a une solution unique **p(x) ∝ a(x) 1[x∈X_C] exp(Σ_i λ_i φ_i(x))** (forme famille exponentielle, Thm 1(A)) ;
  - l'identité de Pythagore KL(c‖a) = KL(c‖p) + KL(p‖a) vaut ∀c ∈ C (Thm 1(C)) ;
  - le Thm 1 reformule la Remarque 3.1 (p. 444) et le Thm 3.2 (p. 442) de Csiszár & Shields (2004), qui supposent X fini ; « generalizations to infinite (countable and/or continuous) X spaces are possible, see (Csiszar, 1975) » ;
  - le cas a = uniforme redonne le MaxEnt de Jaynes.
- Calcul pratique des λ (Khalifa et al., Algorithme 1) `[vérifié]` :
  - échantillonner x_j ~ a ;
  - calculer les poids w_j = exp(λ·φ(x_j)) et les moments auto-normalisés μ̂(λ) = Σ w_j φ(x_j)/Σ w_j ;
  - ajuster λ par SGD sur ‖μ̄ − μ̂(λ)‖².
  - **(synthèse)** C'est un échantillonnage préférentiel auto-normalisé, applicable tel quel à un générateur de champs.
- **Précédent en simulation moléculaire** : J. W. Pitera, J. D. Chodera, « On the Use of Experimental Observations to Bias Simulated Ensembles », J. Chem. Theory Comput. 8(10):3445–3451 (2012), https://doi.org/10.1021/ct300112v `[vérifié]` (métadonnées ; biais MaxEnt d'un ensemble simulé pour reproduire des moyennes expérimentales : contenu non relu).

### 3.2 (b) Discrepance de Stein et approche par le générateur
- A. D. Barbour, « Stein's method and Poisson process convergence », J. Appl. Probab. 25(A):175–184 (1988), https://doi.org/10.2307/3214155 `[vérifié]` ; A. D. Barbour, « Stein's method for diffusion approximations », Probab. Theory Relat. Fields 84(3):297–322 (1990), https://doi.org/10.1007/BF01197887 `[vérifié]`.
- J. Gorham, L. Mackey, « Measuring Sample Quality with Stein's Method », Advances in NeurIPS 28 (NIPS 2015), https://proceedings.neurips.cc/paper/2015/hash/698d51a19d8a121ce581499d7b701668-Abstract.html (page ouverte ; le BibTeX officiel n'a pas de pages) ; arXiv:1506.03039 `[vérifié]`. Mesure calculable : sup, sur une classe de fonctions test, de l'écart entre les espérances sous l'échantillon et sous la cible.
- J. Gorham, A. B. Duncan, S. J. Vollmer, L. Mackey, « Measuring sample quality with diffusions », Ann. Appl. Probab. 29(5):2884–2928 (2019), https://doi.org/10.1214/19-AAP1467, arXiv:1611.06972 (§ 2.1 relu) `[vérifié]` :
  - « generator method construction of Barbour and Götze » : si Z_t est un processus de Feller de mesure invariante P, son générateur A vérifie E_P[(Au)(Z)] = 0 ;
  - l'opérateur de Stein de diffusion est (T g)(x) = (1/p(x))⟨∇, p(x)(a(x)+c(x)) g(x)⟩ (éq. 8) ;
  - il dépend de P **« only through ∇ log p »**.
- Q. Liu, J. Lee, M. Jordan, « A Kernelized Stein Discrepancy for Goodness-of-fit Tests », ICML 2016, PMLR 48:276–284, https://proceedings.mlr.press/v48/liub16.html `[vérifié]`.
- K. Chwialkowski, H. Strathmann, A. Gretton, « A Kernel Test of Goodness of Fit », ICML 2016, PMLR 48:2606–2615, https://proceedings.mlr.press/v48/chwialkowski16.html `[vérifié]`.
- **Différence avec l'idée (synthèse)** :
  - Les discrepances de Stein classiques testent un échantillon Q contre une **cible P connue via son score**, et construisent un générateur ad hoc qui laisse P invariante.
  - Dans l'idée MilaDy, la densité cible est inconnue, mais le **générateur physique A (EDP) est connu**. On teste si la loi générée est invariante pour A, au moyen d'une « discrepance de stationnarité » sup_φ |E_μθ[Aφ]|.
  - C'est la forme qu'utilisent WAN (en min-max) et WGS (avec des fonctions test aléatoires), voir § 3.3.

### 3.3 (c) Apprendre la dynamique ou la loi via la mesure invariante
- **Yang et al. 2023** : Y. Yang, L. Nurbekyan, E. Negrini, R. Martin, M. Pasha, « Optimal Transport for Parameter Identification of Chaotic Dynamics via Invariant Measures », SIAM J. Appl. Dyn. Syst. 22(1):269–310 (2023), https://doi.org/10.1137/21M1421337, arXiv:2104.15138 `[vérifié]`.
  - La distance de Wasserstein sert d'écart entre mesures physiques.
  - Les mesures sont approchées comme points fixes d'opérateurs de Perron–Frobenius discrétisés par EDP. D'après Botvinick-Greenhouse et al., il s'agit de la matrice de Markov d'une discrétisation volumes finis upwind de l'équation de continuité.
- **Botvinick-Greenhouse, Martin, Yang 2023** : « Learning dynamics on invariant measures using PDE-constrained optimization », Chaos 33(6):063152, https://doi.org/10.1063/5.0149673, arXiv:2301.05193 (PDF relu). `[corrigé : la « matrice de Markov issue d'une discrétisation volumes finis upwind de l'équation de continuité » est l'approche antérieure de Yang et al. (leur réf. 18) ; Botvinick-Greenhouse et al. la remplacent par l'équation de Fokker–Planck stationnaire]`
  - L'apprentissage d'EDO/EDS à partir de mesures invariantes y est reformulé en **optimisation sous contrainte EDP**.
  - Le modèle direct est l'**équation de Fokker–Planck** stationnaire. Elle remplace l'équation de continuité de Yang et al. et se réduit à elle quand D = 0.
  - Tests : Van der Pol, Lorenz-63, propulseur à effet Hall, température.
- **Jiang, Lu, Orlova, Willett 2023** : « Training neural operators to preserve invariant measures of chaotic attractors », NeurIPS 2023 (OpenReview : « NeurIPS 2023 poster »), arXiv:2306.01187 `[vérifié]`. Deux approches : (1) une perte de transport optimal entre statistiques choisies par expertise ; (2) un apprentissage contrastif sans connaissance a priori, presque aussi bon.
- **DySLIM** : Y. Schiff, Z. Y. Wan, J. B. Parker, S. Hoyer, V. Kuleshov, F. Sha, L. Zepeda-Núñez, « DySLIM: Dynamics Stable Learning by Invariant Measure for Chaotic Systems », ICML 2024, PMLR 235:43649–43684, https://proceedings.mlr.press/v235/schiff24b.html, arXiv:2402.04467 (PDF relu) `[vérifié]`.
  - Objectif régularisé L_λD(θ) = L(θ) + λ D(μ*, μ*_θ) (éq. 9), avec **D = MMD** (Gretton 2012), en versions conditionnelle et inconditionnelle.
  - La mesure invariante est approchée par déroulement des trajectoires.
  - Systèmes : Lorenz 63, Kuramoto–Sivashinsky, écoulement de Kolmogorov.
  - Coût supplémentaire : « quadratically on the batch size » (note 3).
  - Code : github.com/google-research/swirl-dynamics.
- **WGS, l'antériorité la plus proche de la « perte de discrepance de stationnarité »** : Z. Cai, Y. Cao, Y. Huang, X. Zhou, « Weak Generative Sampler to Efficiently Sample Invariant Distribution of Stochastic Differential Equation », **SIAM J. Sci. Comput. 48(4):C708–C735 (2026)**, https://doi.org/10.1137/24M1665271 ; arXiv:2405.19256 (v1 29/05/2024, v2 05/06/2025), PDF relu. `[corrigé : « aucune publication en revue trouvée » → publié SIAM J. Sci. Comput. 48(4):C708–C735 (2026) ; ajout de l'exemple d = 10]`
  - perte « randomized weak loss » : **min_θ E_{φ∼P} ( E_{z∼ρ} [L*φ(G_θ(z))] )²** (éq. 8–10), L*φ = b·∇φ + D:∇∇φ ;
  - fonctions test : noyaux gaussiens, centres adaptatifs liés aux échantillons générés ; la randomisation évite le min-max (éq. 7) ;
  - générateur : normalizing flow (Real NVP), mais « neither the computationally intensive calculation of the Jacobian determinant nor the invertibility » ne sont requis ;
  - exemples : 2D unimodal (§ 4.1), 2D bistable (§ 4.2), Lorenz (§ 4.3), problème en **d = 10** (§ 4.4), problèmes de dimension **d = 40 et d = 100** (§ 4.5).
  - Antécédent min-max : Y. Zang, G. Bao, X. Ye, H. Zhou, « Weak adversarial networks for high-dimensional partial differential equations », J. Comput. Phys. 411:109409 (2020), https://doi.org/10.1016/j.jcp.2020.109409 `[vérifié]`.
- **PINN-IMSM** : Y. Chen, S. Das, W. Guo, X. Zhong, « Physics-informed machine learning for reconstruction of dynamical systems with invariant measure score matching », Physica D 496:135326 (2026), https://doi.org/10.1016/j.physd.2026.135326 ; arXiv:2601.12675 (19/01/2026). `[corrigé : arXiv seul → publié Physica D 496:135326 (2026)]`
  - La densité invariante vérifie l'équation de Fokker–Planck stationnaire, écrite avec le score. Le score est appris par denoising score matching.
  - Un PINN reconstruit ensuite la dérive.
  - Les essais vont jusqu'à 5 dimensions : Van der Pol, nageur actif, Lorenz-63, Lorenz-96.
- **Score et dynamique de Langevin effective** (Giorgini et coll.) : `[corrigé : versions publiées ajoutées]`
  - L. T. Giorgini, K. Deck, T. Bischoff, A. Souza, « Response Theory via Generative Score Modeling », PRL 133(26):267302 (2024), https://doi.org/10.1103/PhysRevLett.133.267302, arXiv:2402.01029. Combine modèle de score et théorème de fluctuation-dissipation généralisé.
  - L. T. Giorgini, « Score-Based Modeling of Effective Langevin Dynamics », PRE 114(1):L012102 (2026), https://doi.org/10.1103/6qpv-lqmt, arXiv:2505.01895.
  - L. T. Giorgini, « Score-based stochastic reduced-order models of barotropic quasi-geostrophic turbulence », arXiv:2609.34028 (2026) `[vérifié]` (pas de version publiée trouvée).
  - G. Del Felice, L. T. Giorgini, « Integrating score-based generative modeling and neural ODEs for accurate representation of multiscale chaotic dynamics », Chaos 36(6):063143 (2026), https://doi.org/10.1063/5.0326565, arXiv:2511.03862. Équation de Langevin dont la dérive est informée par un score (KGMM) pour reproduire la mesure invariante, plus une NODE pour le forçage rapide.
- Thermalizer (Pedersen, Zanna, Bruna, ICML 2025), § 1.6. `[vérifié]`

### 3.4 (d) Guidage, inclinaison (« tilting ») et alignement à l'échantillonnage
- **Classifier guidance** : P. Dhariwal, A. Nichol, « Diffusion Models Beat GANs on Image Synthesis », NeurIPS 2021, arXiv:2105.05233 `[vérifié]` (FID 2.97 ImageNet 128², 4.59 en 256², 7.72 en 512², résumé).
- **Universal guidance** : A. Bansal, H.-M. Chu, A. Schwarzschild, S. Sengupta, M. Goldblum, J. Geiping, T. Goldstein, « Universal Guidance for Diffusion Models », ICLR 2024 (OpenReview : « ICLR 2024 poster » ; aussi CVPR Workshops 2023), arXiv:2302.07121. `[corrigé : venue « selon l'offre, non confirmée » → ICLR 2024 confirmé sur OpenReview]`
- **DPS** : H. Chung, J. Kim, M. T. McCann, M. L. Klasky, J. C. Ye, « Diffusion Posterior Sampling for General Noisy Inverse Problems », ICLR 2023, arXiv:2209.14687 `[vérifié]`.
- **TDS (twisted SMC)** : L. Wu, B. L. Trippe, C. A. Naesseth, D. M. Blei, J. P. Cunningham, « Practical and Asymptotically Exact Conditional Sampling in Diffusion Models », NeurIPS 2023, arXiv:2306.17775 `[vérifié]`. SMC avec « twisting », asymptotiquement exact ; gains empiriques « with as few as two particles ».
- **FK steering** : R. Singhal, Z. Horvitz, R. Teehan, M. Ren, Z. Yu, K. McKeown, R. Ranganath, « A General Framework for Inference-time Scaling and Steering of Diffusion Models », ICML 2025, PMLR 267:55810–55827, https://proceedings.mlr.press/v267/singhal25b.html, arXiv:2501.06848 `[vérifié]`. Des particules en interaction sont ré-échantillonnées selon des potentiels (récompenses intermédiaires). Un modèle de 0,8 B paramètres piloté par FK dépasse un modèle de 2,6 B affiné (résumé).
- **Adjoint Matching** : C. Domingo-Enrich, M. Drozdzal, B. Karrer, R. T. Q. Chen, « Adjoint Matching: Fine-tuning Flow and Diffusion Generative Models with Memoryless Stochastic Optimal Control », ICLR 2025, arXiv:2409.08861 `[vérifié]`.
  - Venue : en-tête « Published as a conference paper at ICLR 2025 » du PDF https://proceedings.iclr.cc/paper_files/paper/2025/file/852f50969a9e523ec41d26f2f68bd456-Paper-Conference.pdf.
  - L'affinage par récompense y est vu comme un problème de contrôle optimal stochastique.
  - Un calendrier de bruit « memoryless » est nécessaire.
  - La cible est la loi inclinée par la récompense (confirmé par Tauberschmidt et al., § 3.3).
- **Inclinaison par résidu EDP faible (antériorité importante)** : J. Tauberschmidt, S. Fellenz, S. J. Vollmer, A. B. Duncan, « Physics-Constrained Fine-Tuning of Flow-Matching Models for Generation and Inverse Problems », **ICLR 2026** (en-tête du PDF v3, 30/06/2026), arXiv:2508.09156, PDF relu. `[corrigé : « 2025, sans venue indiquée » → ICLR 2026 ; liste des expériences complétée ; forme exacte du résidu]`
  - Méthode : affinage post-entraînement d'un modèle de flow matching vers la loi inclinée **p_r(x) ∝ e^{λ r(x)} p(x)** (§ 3 « Method »), réalisé par Adjoint Matching (§ 3.3).
  - Récompense (§ 3.1 « Reward ») : elle est construite sur le résidu **en forme faible** R_weak(x, α) = (1/N_test) Σ_i ⟨L_α x, ψ⁽ⁱ⁾⟩²_{L²(Ω)}. Les ψ⁽ⁱ⁾ sont des noyaux polynomiaux locaux à support compact, dont les centres et les échelles sont tirés au hasard.
  - Expériences : Darcy (§ 4.1), guidage sur observations éparses (§ 4.2), élasticité linéaire plane (§ 4.3), Helmholtz (§ 4.4), Stokes en cavité entraînée (§ 4.5), images naturelles (§ 4.6). Un prédicteur de paramètres latents sert pour les problèmes inverses.
  - **Différence avec l'idée MilaDy (synthèse)** :
    - Dans Tauberschmidt et al., le résidu est calculé **sur chaque échantillon** : l'EDP stationnaire doit être satisfaite champ par champ, et le résidu sert de récompense. Les poids λ_x, λ_α sont des hyperparamètres.
    - Dans l'idée MilaDy, la contrainte E_μ[Aφ] = 0 est **linéaire en la loi**, puisqu'elle traduit la stationnarité statistique d'une dynamique chaotique. Aucun échantillon ne la vérifie seul. λ est le multiplicateur de l'I-projection, fixé par la contrainte.
    - Vollmer et Duncan sont aussi coauteurs de Gorham et al. 2019 (opérateurs de Stein de diffusion).
- **Contraintes distributionnelles (moments) sur un générateur pré-entraîné : antériorité directe de l'I-projection appliquée à un modèle génératif** : M. Khalifa, H. Elsahar, M. Dymetman, « A Distributional Approach to Controlled Text Generation », ICLR 2021, arXiv:2012.11635, PDF relu `[vérifié]`.
  - L'article combine des contraintes « pointwise » et « distributional » E[φ_i] = μ̄_i.
  - Il minimise la KL vers le modèle initial, ce qui donne une solution EBM explicite (famille exponentielle).
  - Cette solution est ensuite distillée par « distributional policy gradient ».
  - Les auteurs le présentent comme « to our knowledge, the first model with such generality ».
- **Diffusion sous contraintes de loi** : S. Khalafi, D. Ding, A. Ribeiro, « Constrained Diffusion Models via Dual Training », Advances in NeurIPS 37, pp. 26543–26576 (2024), https://doi.org/10.52202/079017-0836, arXiv:2408.15094. `[corrigé : DOI et pages « non vérifiés » → confirmés par Crossref ; OpenReview « NeurIPS 2024 poster »]`
  - L'entraînement est posé comme une optimisation de loi sous contraintes (KL) vers des lois cibles.
  - L'algorithme est dual (lagrangien).
  - La loi optimale est un mélange.
- **Inclinaison exponentielle + contraintes de moments + FK steering pour un émulateur de simulations (le plus proche sur le mécanisme)** : J. Mun, « Multifidelity Computer Model Emulation Via Diffusion Model Steering and Targeted Maximum Likelihood », arXiv:2608.30096 (31/08/2026) `[vérifié]`.
  - L'article cherche « the exponentially tilted high-resolution distribution that minimizes KL divergence from the biased baseline, subject to moment constraints derived from low-resolution simulations ».
  - La base est un modèle de diffusion par score.
  - Les inclinaisons sont exécutées « at inference time » par FK steering.
- **Contraintes de moments dans l'échantillonneur** : Z. Yao, D. Paulin, « Training-Free Generative Sampling via Moment-Matched Score Smoothing », arXiv:2605.14276 (2026) `[vérifié]`. Il s'agit d'un système de particules dont la limite stationnaire est une densité de Gibbs–Boltzmann obtenue par **inclinaison exponentielle**, avec une moyenne et une covariance égales aux moments empiriques.
- C. McDonald, P. Bartlett, « Internal Guidance as a Sampling Method for Tilted Diffusion Models », arXiv:2610.29086 (2026) `[vérifié]` : « Reward guidance methods sample an exponential tilt of a base density ».

### 3.5 (e) Contraintes statistiques et spectrales pour la turbulence et le climat
- **Antériorité directe « contrainte statistique sur un générateur de turbulence »** : J.-L. Wu, K. Kashinath, A. Albert, D. Chirila, Prabhat, H. Xiao, « Enforcing statistical constraints in generative adversarial networks for modeling chaotic dynamical systems », J. Comput. Phys. 406:109209 (2020), https://doi.org/10.1016/j.jcp.2019.109209, arXiv:1905.06841 (PDF relu, § 2.2) `[vérifié]`.
  - Perte : L_c(D,G) = L(D,G) + λ d(Σ(p_data), Σ(p_G)) (éq. 4), où Σ est la **covariance** estimée sur les échantillons.
  - La distance d retenue est la norme de Frobenius. La KL symétrisée, la distance riemannienne et la JBLD ont aussi été comparées.
  - Cas d'étude : convection de Rayleigh–Bénard simulée par Boltzmann sur réseau.
  - Le temps d'entraînement est réduit « by up to 80% » (résumé).
  - Le papier note que Σ(p_data) « can also be estimated from the governing equation ».
- **Contrainte globale de bilan (enstrophie) dans une perte** : Y. Guan, A. Subel, A. Chattopadhyay, P. Hassanzadeh, « Learning physics-constrained subgrid-scale closures in the small-data regime for stable and accurate LES », Physica D 443:133568 (2023), https://doi.org/10.1016/j.physd.2022.133568, arXiv:2201.07347 `[vérifié]`. L'article compare trois approches, dont des « loss functions that enforce a **global enstrophy-transfer conservation** (EnsCon) », en régime « 40x fewer samples ». Voir aussi Guan, Chattopadhyay, Subel, Hassanzadeh, « Stable a posteriori LES of 2D turbulence using convolutional neural networks… », J. Comput. Phys. 458:111090 (2022), https://doi.org/10.1016/j.jcp.2022.111090 `[vérifié]`.
- **Régularisation spectrale** : A. Chattopadhyay, P. Hassanzadeh, arXiv:2304.07029 `[vérifié]`.
  - Titre v1 : « Long-term instabilities of deep learning-based digital twins of the climate system: The cause and a solution ».
  - Titre v2 : « Challenges of learning multi-scale dynamics with AI weather models: Implications for stability and one solution » (auteurs v2 : Chattopadhyay, Y. Q. Sun, Hassanzadeh).
  - Cause identifiée : le **biais spectral**.
  - Remède FouRKS (PDF v2, § 5.4.1 relu) : un terme μ(θ) = Σ_t ‖ X̂(t+Δt)|_{k_x ≥ k_T} − Ĥ[N(X(t),θ)]|_{k_x ≥ k_T} ‖² sur les coefficients de Fourier zonaux, avec λ = 0,8 et k_T = 30 (QG) ou 40 (ERA5), plus un intégrateur RK4 différentiable.
  - Le résumé v2 annonce « hundreds of years of time-integration ».
- A. Chattopadhyay, J. Pathak, E. Nabizadeh, W. Bhimji, P. Hassanzadeh, « Long-term stability and generalization of observationally-constrained stochastic data-driven models for geophysical turbulence », Environ. Data Sci. 2:e1 (2023), https://doi.org/10.1017/eds.2022.30, arXiv:2205.04601 : VAE stochastique, QG à 2 couches, transfert vers des observations bruitées. `[corrigé : arXiv seul → publié Environ. Data Sci. 2:e1 (2023)]`
- FourCastNet : J. Pathak et al., arXiv:2202.11214 `[vérifié]`. Le résumé ne mentionne **aucune contrainte spectrale ou statistique** : c'est un émulateur AFNO déterministe à 0,25°. À citer comme contexte, pas comme antériorité de contrainte en loi.
- **Contraintes par échantillon (pour contraste)** :
  - J.-H. Bastek, W. Sun, D. M. Kochmann, « Physics-Informed Diffusion Models », ICLR 2025, arXiv:2403.14404 (PDF relu § 3) `[vérifié]`.
    - Le résidu d'EDP est traité comme une « virtual observable », évaluée sur x̂₀ = E[x₀|x_t].
    - Les auteurs notent que R(E[x₀|x_t]) ≠ E[R(x₀)|x_t] et proposent un échantillonnage DDIM.
    - Le résidu est réduit « by up to two orders of magnitude » (résumé).
    - C'est une contrainte sur **chaque échantillon**.
  - J. Richter-Powell, Y. Lipman, R. T. Q. Chen, « Neural Conservation Laws: A Divergence-Free Perspective », NeurIPS 2022, arXiv:2210.01741 `[vérifié]` : champs à divergence nulle par construction (formes différentielles), universels.
  - A. T. Mohan, N. Lubbers, M. Chertkov, D. Livescu, « Embedding hard physical constraints in neural network coarse-graining of three-dimensional turbulence », Phys. Rev. Fluids 8(1):014604 (2023), https://doi.org/10.1103/PhysRevFluids.8.014604, arXiv:2002.00021 `[vérifié]` : incompressibilité imposée dans le CNN (contrainte dure), meilleure conservation locale de la masse en turbulence 3D.
- **Fokker–Planck dans les modèles de diffusion eux-mêmes (ne pas confondre)** :
  - C.-H. Lai et al., « FP-Diffusion: Improving Score-based Diffusion Models by Enforcing the Underlying Score Fokker-Planck Equation », ICML 2023 (OpenReview), arXiv:2210.04296. L'article impose l'EDP de Fokker–Planck du **processus de bruitage** au score appris, et non une stationnarité physique. `[corrigé : ajout de la venue ICML 2023]`
  - Z. Shen et al., « Self-Consistency of the Fokker-Planck Equation », COLT 2022, arXiv:2206.00860 `[vérifié]`.
  - N. M. Boffi, E. Vanden-Eijnden, « Probability flow solution of the Fokker–Planck equation », Mach. Learn.: Sci. Technol. 4(3):035012 (2023), https://doi.org/10.1088/2632-2153/ace2aa, arXiv:2206.04642. Résolution d'EDP de Fokker–Planck **dépendantes du temps** par flot de probabilité. `[corrigé : arXiv seul → publié MLST 4:035012 (2023)]`

### 3.6 Bilan : ce qui est publié, ce qui semble nouveau

| Brique de l'idée | Déjà publié (preuve) |
|---|---|
| Invariance ⟺ E_μ[Aφ] = 0 pour φ dans un cœur | Oui : Liggett Thm 3.37 via Behme–Schnurr 2015 ; Echeverría 1982 ; Ethier–Kurtz 1986. Suffisance délicate hors Feller. |
| Forme faible du Fokker–Planck stationnaire comme **perte d'un générateur d'échantillons** | **Oui** : WGS (Cai et al., SIAM J. Sci. Comput. 2026), perte E_φ(E_z[L*φ(G_θ(z))])², fonctions test gaussiennes aléatoires, d ≤ 100 ; min-max WAN (Zang et al. 2020). |
| Apprendre via la mesure invariante (OT, MMD, contrainte EDP) | Oui : Yang et al. 2023, Botvinick-Greenhouse et al. 2023, Jiang et al. 2023, DySLIM 2024, PINN-IMSM 2026. |
| I-projection / MaxEnt → inclinaison exponentielle sur un **générateur pré-entraîné** | Oui : Khalifa et al. 2021 (langage) ; Pitera–Chodera 2012 (ensembles moléculaires) ; Khalafi et al. 2024 (diffusion, contraintes en KL). |
| Inclinaison exponentielle sous contraintes de moments, réalisée **à l'inférence** dans un modèle de diffusion par FK steering, pour des sorties de **simulations** | Oui, très récent : Mun (arXiv:2608.30096, août 2026) ; outils : TDS 2023, FK steering 2025, adjoint matching. |
| Contraintes statistiques (covariance, spectre, bilan global) sur un générateur ou émulateur de turbulence | Oui : Wu et al. 2020 (covariance, GAN) ; Guan et al. 2023 (EnsCon) ; Chattopadhyay–Hassanzadeh (spectre) ; Lienen 2024 / GenCFD (évaluation en loi). |
| Contrainte sur chaque échantillon (résidu EDP, ∇·u = 0) | Oui : Bastek et al. 2025, Richter-Powell et al. 2022, Mohan et al. 2023 (FunDiff, Fukami–Taira : traités ailleurs). |
| Inclinaison exponentielle d'un modèle de flow matching par un **résidu EDP en forme faible** (récompense par échantillon) via Adjoint Matching | **Oui** : Tauberschmidt, Fellenz, Vollmer, Duncan, ICLR 2026 (arXiv:2508.09156). |

(Tableau relu contre les entrées vérifiées ci-dessus ; WGS et Tauberschmidt mis à jour.) `[corrigé : venues de WGS et Tauberschmidt mises à jour dans le tableau]`

**Ce qui semble nouveau (synthèse, sous réserve d'une veille complémentaire ; aucune publication trouvée combinant ces éléments) :** voir aussi « Non confirmé ».
1. Prendre comme fonctionnelle de contrainte le **générateur physique d'une EDP de champs** (Navier–Stokes/MHD, F(u,B) avec projection de Leray, éventuellement forçage stochastique) et non une EDS de petite dimension. WGS s'arrête à d = 100, PINN-IMSM à 5 et Botvinick-Greenhouse aux systèmes de faible dimension.
2. Appliquer la contrainte **par condition** dans un modèle génératif **conditionnel paramétrique** (Re, Rm, propriétés matériaux), avec des multiplicateurs λ(Re, Rm) d'inclinaison. Les travaux cités sont inconditionnels ou à condition non physique.
3. Choisir des fonctions test **physiquement interprétables** en plus des noyaux génériques :
   - l'énergie, qui donne le bilan injection = dissipation ;
   - les hélicités, qui donnent les bilans d'hélicité ;
   - l'énergie par bande spectrale, qui donne un bilan échelle par échelle.
   - Le bilan d'énergie apparaît alors comme le cas φ = E de la même identité.
   - Contrairement à Mun 2026 ou Khalifa 2021, les moments cibles ne sont pas des données externes. Ce sont des **identités** (E_μ[Aφ] = 0) qui n'exigent aucune valeur cible.
4. Combiner les deux voies sur des champs 3D MHD/dynamo : la **perte de discrepance de stationnarité à l'entraînement** (type WGS ou KSD avec générateur connu) et l'**I-projection à l'échantillonnage** (pondération exponentielle via SMC/FK).

**Points de vigilance à écrire dans le rapport (synthèse)**
- La contrainte est **nécessaire mais pas suffisante**, à cause de la non-unicité des mesures invariantes (DySLIM). Sans bruit, la sélection de la mesure physique par la limite à bruit nul n'est établie qu'en cadre Axiom A. Young (2002, § 2.3) précise qu'il n'existe « no general result » au-delà, et que toutes les limites à bruit nul ne sont pas SRB. Il faut donc garder l'attache aux données. `[corrigé : nuance Axiom A ajoutée]`
- Liouville en régime dissipatif : la mesure SRB est en général singulière dans les directions stables (Young 2002). On s'attend donc à ce qu'il n'y ait pas de densité, et la forme faible est la formulation naturelle.
- Coût : Aφ exige F(u) sur chaque échantillon (dérivées spatiales, pression non locale via Leray) et ∇φ (dérivée fonctionnelle). C'est simple pour φ quadratique (énergie, hélicités).
- Pour une contrainte linéaire en la loi (E_μ[g] = 0 avec g = Aφ), l'I-projection donne exactement p* ∝ p_θ exp(λ g) (Khalifa Thm 1, cadre fini ; Csiszár 1975 pour le continu).
- Différence avec les discrepances de Stein classiques : elles exigent le score de la cible (Gorham et al. 2019 : T dépend de P « only through ∇ log p »). Ici, la cible est inconnue et c'est le générateur qui est connu.

---

## 4. Projection de Leray, Helmholtz–Hodge, potentiel vecteur

### 4.1 Références de cours et articles
- J. Leray, « Sur le mouvement d'un liquide visqueux emplissant l'espace », Acta Math. 63:193–248 (1934), https://doi.org/10.1007/BF02547354 `[vérifié]`.
- A. J. Chorin, « Numerical solution of the Navier-Stokes equations », Math. Comp. 22(104):745–762 (1968), https://doi.org/10.1090/S0025-5718-1968-0242392-2 `[vérifié]` (méthode de projection).
- V. Girault, P.-A. Raviart, *Finite Element Methods for Navier-Stokes Equations*, Springer Series in Computational Mathematics (1986), https://doi.org/10.1007/978-3-642-61623-5 `[vérifié]`.
- F. Boyer, P. Fabrie, *Mathematical Tools for the Study of the Incompressible Navier-Stokes Equations and Related Models*, Applied Mathematical Sciences, Springer (2013), https://doi.org/10.1007/978-1-4614-5975-0 `[vérifié]`.
- H. Bhatia, G. Norgard, V. Pascucci, P.-T. Bremer, « The Helmholtz-Hodge Decomposition—A Survey », IEEE TVCG 19(8):1386–1404 (2013), https://doi.org/10.1109/TVCG.2012.316 `[vérifié]` (métadonnées seules ; contenu non relu).
- Définition de la projection de Leray : T. Tao, « Localisation and compactness properties of the Navier–Stokes global regularity problem », Anal. PDE 6(1):25–107 (2013), https://doi.org/10.2140/apde.2013.6.25, arXiv:1108.1165 (p. 18 relue, image de la page contrôlée). `[corrigé : la remarque « revient à la même formule » était fausse ; signe corrigé]`
  - Texte de Tao : « P u := Δ⁻¹(∇ × ∇ × u). If u is square-integrable, then P u is the orthogonal projection of u onto the space of square-integrable divergence-free vector fields ».
  - **Attention au signe.** Avec le laplacien usuel (celui de u_t = Δu chez Tao), ∇×∇×u = ∇(∇·u) − Δu, donc Δ⁻¹(∇×∇×u) = ∇Δ⁻¹∇·u − u = −P u.
  - La formule correcte est **P u = −Δ⁻¹(∇×∇×u) = u − ∇Δ⁻¹(∇·u)**. La même erreur de signe affecte sa loi de Biot–Savart (17), qui doit se lire u = −Δ⁻¹(∇×ω).
  - **(synthèse)** En Fourier, sur domaine périodique : P̂(k) = I − k kᵀ/|k|².

### 4.2 Potentiel vecteur en domaine borné (énoncés vérifiés)
Source : C. Amrouche, N. Seloula (Nour El Houda Seloula), « L^p-theory for vector potentials and Sobolev's inequalities for vector fields », C. R. Math. Acad. Sci. Paris 349(9–10):529–534 (2011), https://doi.org/10.1016/j.crma.2011.04.008, PDF relu (https://comptes-rendus.academie-sciences.fr/mathematique/item/10.1016/j.crma.2011.04.008.pdf). `[corrigé : « N. El Houda Seloula » → « N. Seloula » (nom de famille Seloula)]` Le cas hilbertien (p = 2) est celui de C. Amrouche, C. Bernardi, M. Dauge, V. Girault, « Vector potentials in three-dimensional non-smooth domains », Math. Methods Appl. Sci. 21(9):823–864 (1998), https://doi.org/10.1002/(SICI)1099-1476(199806)21:9<823::AID-MMA976>3.0.CO;2-B `[vérifié]`.

Cadre : Ω ⊂ R³ borné, connexe, de classe C^{1,1}, bord Γ de composantes connexes Γ_0 (extérieur), …, Γ_I ; J « coupures » Σ_j rendant Ω° = Ω \ ∪Σ_j simplement connexe (Ω pas forcément simplement connexe). `[vérifié]`
- **Thm 3.1 (sans condition au bord)** : u ∈ H^p(div, Ω) vérifie div u = 0 et ⟨u·n, 1⟩_{Γ_i} = 0 pour 0 ≤ i ≤ I **si et seulement si** u = curl ψ₀ avec ψ₀ ∈ W^{1,p}(Ω). On peut choisir div ψ₀ = 0 (jauge de Coulomb), avec ‖ψ₀‖_{W^{1,p}} ≤ C‖u‖_{L^p}. `[vérifié]`
- **Thm 3.2 (condition normale sur le potentiel)** : sous les mêmes conditions (1), il existe un **unique** ψ avec u = curl ψ, **div ψ = 0** dans Ω, **ψ·n = 0 sur Γ**, ⟨ψ·n, 1⟩_{Σ_j} = 0 (1 ≤ j ≤ J). `[vérifié]`
- **Thm 3.4 (condition tangentielle sur le potentiel)** : si div u = 0, **u·n = 0 sur Γ** et ⟨u·n, 1⟩_{Σ_j} = 0, il existe un **unique** ψ avec u = curl ψ, **div ψ = 0**, **ψ × n = 0 sur Γ**, ⟨ψ·n, 1⟩_{Γ_i} = 0 (0 ≤ i ≤ I). `[vérifié]`
- Noyaux (champs harmoniques) : K_T (div = curl = 0, v·n = 0) de dimension J ; K_N (div = curl = 0, v × n = 0) de dimension I ; K_T = {0} si J = 0 et K_N = {0} si Γ = Γ_0 (§ 1). `[vérifié]`
- **(synthèse, usage pour le stage)** :
  - En périodique, on prend B = ∇×A avec ∇·A = 0, ce qui est trivial en Fourier : Â = i k × B̂/|k|², le mode k = 0 étant traité à part. Le vérificateur a refait le calcul : i k × (i k × Â) = |k|² Â quand k·Â = 0.
  - En domaine borné (dynamo de type VKS/SFEMaNS), le choix ψ·n = 0 (Thm 3.2) vaut pour un B quelconque à flux nul par composante de bord.
  - Le choix ψ × n = 0 (Thm 3.4) exige B·n = 0 au bord, ce qui correspond à une paroi parfaitement conductrice idéalisée, et un flux nul à travers les coupures.
  - Un modèle génératif qui sort A garantit exactement ∇·B = 0. Les conditions de bord de B se traduisent alors en conditions sur A selon ce cadre.
  - L'hélicité magnétique ∫A·B dépend de la jauge si B·n ≠ 0 (Berger & Field 1984, résumé vérifié, § 2.4).

---

## 5. Non confirmé / limites

- **JHTDB mhd1024, README officiel** (https://turbulence.idies.jhu.edu/docs/mhd/README-MHD.pdf ; https://turbulence.pha.jhu.edu/Forced_MHD_turbulence.aspx) `[NON CONFIRMÉ]`
  - Le README renvoie HTTP 503 via WebFetch, et curl échoue sur la chaîne TLS du serveur, même avec le bundle CA du proxy.
  - Un extrait de moteur de recherche (non vérifié) indique un solveur pseudo-spectral en formulation d'Elsasser, une échelle de Kolmogorov ≈ 3,3×10⁻³ (vitesse) et 2,8×10⁻³ (magnétique), des échelles intégrales de 0,56 (vitesse) et 0,35 (magnétique), une moyenne sur t = 0 à 2,56, et un forçage à k = 2 d'amplitude 0,25.
  - Seul le code pseudo-spectral est corroboré par une source primaire (Jafari 2026).
  - **Divergence non résolue sur le forçage** : Lemoine (2022) écrit « external random force acting on velocity fluctuations on a stirring scale equal to 0.5 », alors que Jafari (2026) écrit « Taylor–Green forcing at k_f = 2 ». Les deux sont compatibles sur l'échelle (k = 2, soit la moitié de la boîte), mais pas sur la nature aléatoire ou Taylor–Green du forçage.
  - Les nombres de Reynolds publiés diffèrent selon la définition : Rm_λ ≃ 140 (Lemoine), Re_λ ≃ 186 et Re_b = 764 (Jafari). Il faut trancher avec le README avant toute citation.
- **Gorham & Mackey 2015, pages des actes NeurIPS** : « 226–234 », vu sur une fiche bibliographique. Le BibTeX officiel NeurIPS a un champ `pages` vide, et DBLP était inaccessible (anti-bot). `[NON CONFIRMÉ]`
- **Kacmaz et al. 2025** : disponibilité publique des données non vérifiée. `[NON CONFIRMÉ]`
- **Caractère « nouveau » des quatre points du § 3.6** `[NON CONFIRMÉ]`
  - La recherche de l'agent n'a trouvé aucune publication combinant générateur d'EDP de champs, modèle génératif conditionnel paramétrique et inclinaison exponentielle. Elle portait sur l'API arXiv avec les combinaisons « Stein discrepancy / invariant measure / Liouville / stationary Fokker–Planck / exponential tilting / moment constraints / diffusion model / turbulence / MHD », et sur une recherche web étendue.
  - Le vérificateur n'a pas trouvé non plus de telle combinaison au fil des contrôles. Ce n'est pas une preuve d'absence : il faut refaire une veille (Google Scholar, OpenReview ICLR/NeurIPS 2026–2027) avant la rédaction finale.
- **Énoncé « continu » de l'I-projection (Csiszár 1975)** : seul le résumé de Csiszár 1975 a été lu (existence et caractérisation de la projection sur un convexe). La forme explicite p ∝ a·exp(λ·φ) n'est vérifiée que dans le cadre fini (Khalifa Thm 1 / Csiszár & Shields 2004). L'extension au cas continu (champs) repose sur la mention « generalizations … are possible » de Khalifa, sans énoncé lu. `[NON CONFIRMÉ]`

Limites de contenu (références existantes, métadonnées vérifiées, texte non relu) : Echeverría 1982, Bhatia et al. 2013, Gneiting & Raftery 2007, Politano & Pouquet 1998, Pitera & Chodera 2012, Woltjer 1958. Les formules et interprétations citées « via » d'autres sources sont signalées comme telles dans le corps du texte.
