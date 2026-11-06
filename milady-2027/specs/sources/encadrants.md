# Encadrants et projet ANR MilaDy : base de faits

## Bilan de vérification

*Contre-vérification indépendante faite le 6 novembre 2026. Chaque DOI (63) a été résolu dans l'API Crossref, chaque identifiant arXiv (31) dans l'API arXiv, chaque notice HAL citée dans l'API HAL. La page ANR, les pages de Cheng et de Lucor, les PDF des offres (stage 2027, stage 2026, postdoc, M2 Nore–Lucor), les deux CV de Ponty, le texte intégral de Bousquet et al. 2026 et le texte arXiv de Kreuzahler et al. 2017 ont été ouverts. Les abstracts APS absents de Crossref ont été lus via OpenAlex.*

- **Vérifiées : environ 125 entrées** (135 marqueurs « [vérifié] », dont 5 dans la section finale et 4 sur des ajouts). Auteurs, années, revues, volumes, pages et DOI concordent avec Crossref pour les 63 DOI. Les chiffres de Bousquet 2026 (Re = 1594, Rm = 531, asymétrie 0,058, μ_r = 16, 2000 snapshots), les définitions de Re et Rm et les contraintes de régression (A_uvv + A_vvu = 0 ; X²·f(X,p) = 0) ont été relus dans l'article.
- **Corrigées : 4 entrées.**
- **Non confirmées : 12 points**, regroupés dans la section finale « 9. Non confirmé ».
- **Ajouts : 5** (préprint Bousquet–Nore–Lucor 2026, thèse Quattromini co-dirigée par Nore, équipe COMET, doctorant Qiyao Zhou, contenu de Cappanera 2016).

**Corrections importantes**
1. Botez et al., PRFluids 11, 083701 : « 2026-10-07 » → **publié le 14 août 2026** (reçu le 27 avril 2026). La date du 7 octobre est celle de la notice HAL.
2. Tensor-Var (ICML 2025) : le titre publié est **« Tensor-Var: Efficient Four-Dimensional Variational Data Assimilation »** (PMLR 267:70649–70679), et non « … in Tensor Product Feature Space » (titre de la page de Cheng). Les 8 auteurs sont maintenant listés.
3. Jaber et al. 2025 (JMLMC) : titre « with (marginal) coverage guarantees » → « with marginal coverage guarantees ».
4. Postdoc MilaDy sur la page de Lucor : l'annonce « Starting in April/May 2026 » **n'est plus affichée**. Elle se trouve dans un bloc commenté du code source, ce qui suggère que l'offre est close. Le PDF de l'offre reste en ligne.

**Compléments utiles pour les rédacteurs** : Nore a co-dirigé une thèse en GNN et assimilation de données (Quattromini, 2024), et la matrice §6 est mise à jour en conséquence. Le préprint Research Square de juin 2026 (autoencodeurs polynomiaux initialisés par la POD) prolonge CPC 2025. Le postdoc OCA s'appelle très probablement **Hiroshi Horii** : HAL le rattache à l'OCA, et « Hiiro » serait une coquille du CV. Aucune publication de Ponty en apprentissage automatique n'a été trouvée, ce qui est confirmé.

---

*Collecte : 6 novembre 2026. Toutes les URL citées ont été ouvertes pendant la collecte (pages HTML, PDF, API HAL `api.archives-ouvertes.fr`, API Crossref `api.crossref.org`, API arXiv `export.arxiv.org`). Les pages `hal.science` et `lisn.upsaclay.fr` sont protégées par un anti-bot : leurs notices ont donc été lues via l'API HAL. Les pages APS (journals.aps.org) ont renvoyé une erreur 403. Ce document est une base de faits pour les rédacteurs, pas un texte final.*

---

## 0. Points essentiels

- **MilaDy** = « Modélisation par apprentissage automatique des dynamos turbulentes » / « Machine learning modelling for turbulent Dynamos », **ANR-25-CE51-0077**, comité CE51 (« Sciences de l'ingénierie et des procédés », AAPG 2025). Coordinatrice : **Caroline Nore (LISN)**. Partenaires : LISN, Lagrange (OCA, Nice), CEREA (ENPC). Aide ANR : **560 612 €**. Début **janvier 2026**, durée **48 mois**. Source : https://anr.fr/Projet-ANR-25-CE51-0077 [vérifié]
- Les deux objectifs officiels : (i) étudier les **inversions de champ magnétique** et les dynamos « explosives » (burst), avec des ROM capables d'identifier les phases précurseur / inversion / rebond ; (ii) **optimiser DRESDYN** (cylindre en précession, HZDR) avec des **ROM paramétriques** (rapport de fréquences précession/rotation). Le résumé cite **TorchDA**, le logiciel de S. Cheng. [vérifié]
- Le stage 2027 fait suite à un stage 2026 du même consortium, « Physics-aware Representation Learning for Turbulent Dynamo Data » (compression, régression latente, apprentissage contrastif). Le stage 2027 passe au **génératif** : diffusion et flow matching conditionnels, contraintes physiques. La thèse serait **co-encadrée par S. Cheng et D. Lucor** (https://scheng2024.github.io/opportunities/). [vérifié]
- Premières publications rattachées à MilaDy : **Bousquet, Ponty, Botez, Plihon, Nore, PRFluids 11, 063703 (2026)**, sur les inversions dans VKS (POD sur 2000 snapshots, modèle de Galerkin réduit **DQVU** identifié par PySINDy sous contraintes), et **Botez, Giesecke, Nore, Cappanera, Stefani, PRFluids 11, 083701 (2026)**, sur la dynamo cinématique de précession pour DRESDYN. [vérifié]
- **Données** : SFEMaNS (Guermond et Nore ; méthode hybride Fourier azimutal + éléments finis méridiens, sauts de perméabilité, pénalisation, viscosité entropique) et le second solveur « LATU » (pseudo-spectral Fourier + pénalisation, Kreuzahler, Ponty et al. 2017). Les données de Bousquet et al. 2026 ne sont **pas publiques** (« available from the authors upon reasonable request »). [vérifié]
- Liens entre encadrants : Cheng a été doctorant de Lucor (2017–2020, avec EDF R&D). Lucor et Nore co-encadrent R. Bousquet (VAE/POD). Nore et Ponty publient ensemble sur les inversions VKS. Cheng et Lucor ont été éditeurs invités du même numéro spécial de *Computer Physics Communications*, « Advances in Physics-Aware Machine Learning ». [vérifié]

---

## 1. Projet ANR MilaDy

### 1.1 Fiche d'identité

| Champ | Valeur | Source |
|---|---|---|
| Titre FR | Modélisation par apprentissage automatique des dynamos turbulentes – MilaDy [vérifié] | https://anr.fr/Projet-ANR-25-CE51-0077 |
| Titre EN | Machine learning modelling for turbulent Dynamos – MilaDy [vérifié] | Page EN de l'ANR : https://anr.fr/en/funded-projects-and-impact/funded-projects/project/funded/project/b2d9d3668f92a3b9fbbf7866072501ef-8f0bea4141/?tx_anrprojects_funded%5Bcontroller%5D=Funded&cHash=f7b87490b7ffc2a2a9c7dc94387c163f |
| Référence | ANR-25-CE51-0077 [vérifié] | page ANR ; page « Research » de Cheng (https://scheng2024.github.io/research/) |
| Instrument | ANR PRC (projet de recherche collaborative) [vérifié] | page d'accueil de Cheng (https://scheng2024.github.io/) : « MILADY — ANR PRC (2025–2029) » |
| Comité | CE51 – Sciences de l'ingénierie et des procédés, 2025 [vérifié] | page ANR |
| Coordination | Caroline Nore (LISN) [vérifié] | page ANR |
| Partenaires | LISN (Laboratoire Interdisciplinaire des Sciences du Numérique) ; LAGRANGE, Observatoire de la Côte d'Azur, Nice ; CEREA, École nationale des ponts et chaussées [vérifié] | page ANR |
| Rôle de Cheng | « Co-Investigator » [vérifié] | https://scheng2024.github.io/research/ |
| Aide ANR | 560 612 € [vérifié] | page ANR |
| Début / durée | janvier 2026, 48 mois [vérifié] | page ANR |
| Variante de la référence | « Grant No. ANR-25-CE51-0077-02 » (remerciements de Bousquet et al. 2026) [vérifié ; même numéro dans les métadonnées Crossref « funder » de Bousquet 2026 et de Botez 2026] | https://perso.ens-lyon.fr/nicolas.plihon/Publis/Bousquet_PRF_11.pdf |

**Résumé officiel (FR, verbatim, page ANR) :** [vérifié : texte identique, mot pour mot, à la page ANR]
> La magnétohydrodynamique (MHD) étudie les interactions entre les fluides électriquement conducteurs et les champs magnétiques, essentielles pour des applications industrielles et la compréhension de phénomènes comme l'effet dynamo (DyE). Ce dernier implique l'amplification de bruits magnétiques dans des fluides turbulents, comme dans les étoiles ou les noyaux planétaires, ce qui le rend rare et complexe à reproduire. Seules trois expériences, dont celle de Cadarache en France, ont réussi à obtenir un DyE avec du sodium liquide. L'expérience DRESDYN en cours en Allemagne vise à reproduire le DyE à l'aide d'un cylindre en précession.
> La simulation du DyE est difficile en raison du couplage non linéaire entre les équations de Navier-Stokes et l'équation d'induction, rendant les simulations numériques directes (DNS) très coûteuses en temps calcul. Les modèles réduits (ROM) sont utiles pour simplifier ces simulations, tandis que l'apprentissage automatique (ML) présente un potentiel pour traiter les dynamiques à haute dimension, bien que la capture des événements rares reste un défi. L'assimilation de données (DA) avec ML devient plus accessible, notamment grâce à la plateforme TorchDA.
> MilaDy vise à faire progresser la recherche en MHD avec deux objectifs principaux : (i) Étudier les inversions de champ magnétique et les phénomènes de dynamo « explosive » grâce à des méthodes basées sur les données pour identifier les caractéristiques clés et développer des ROMs qui reproduisent les dynamiques observées. Le projet étudie si le ML peut améliorer la compréhension des inversions magnétiques et créer des modèles plus rapides qui identifient les phases comme le précurseur, l'inversion et le rebond. (ii) Optimiser le dispositif DRESDYN avec des ROMs paramétriques pour explorer les conditions du DyE, telles que les ratios de fréquences précession/rotation. Les ROMs permettent une exploration efficace des paramètres, aidant les expérimentateurs à gérer ces systèmes complexes.

**Formulations clés du résumé EN (verbatim)** : « burst dynamo phenomena » ; « faster surrogate models that distinguish phases like precursor, reversal, and recovery » ; « precession-to-spin frequency ratios » ; « thanks in particular to the TorchDA framework ». [vérifié]

**Description de MilaDy par Cheng** (https://scheng2024.github.io/research/) : « MilaDy combines machine learning and numerical simulation to study turbulent magnetohydrodynamic dynamos […] investigates magnetic-field reversals, rare dynamical events and the influence of physical parameters. At CEREA/ENPC, our research focuses on physics-aware representation learning and reduced-order modelling of three-dimensional velocity and magnetic fields, connecting learned representations to data assimilation. » [vérifié]

**Description dans le CV de Ponty (2026)** (https://c2pu.oca.eu/images/LAGRANGE/pages_perso/ponty/pdf/cv-2pages-2026.pdf) : « 2026 (février) – 2030 Contrat ANR : MiLaDy ; Machine Learning modeling for turbulent Dynamos coordinatrice C. Nore LISN (Saclay) /Y. Ponty (OCA)/ S. Cheng (CEREA, ENPC). Duration: 48 months (550k€). » Le même CV mentionne aussi : « février 2026 - … Encadrement de Hiroshi Hiiro Postdoc ANR Projet MiLady ». [vérifié : citations exactes du CV]

### 1.2 Offres liées au projet

**a) Stage M2 2027 (l'offre cible)** [vérifié : PDF ouvert le 6/11/2026 ; la page Opportunities de Lucor pointe vers une copie locale pdf/stage_milady_2027.pdf], https://scheng2024.github.io/stage_milady_2027.pdf (également sur https://perso.lisn.upsaclay.fr/lucor/opportunities.html) :
- Titre : « Physics-Constrained Generative AI Modelling of Parametric Dynamical Systems (with potential PhD position) ».
- Le contexte mentionne explicitement « abrupt reversals of the magnetic field polarity » et « large 3D datasets that are difficult to store, interpret, and reuse for modelling and data assimilation ».
- Contraintes visées : « energy balance and divergence-free conditions ». Paramètres : « Reynolds number, magnetic Reynolds number, material properties… ». Sorties : « 3D fields that can serve as input for reduced-order models or data assimilation frameworks developed elsewhere in the project ».
- Méthodes : « diffusion or flow matching ». Contraintes imposées « through model design, training losses, or sampling procedures ». Métriques : « energy spectra, helicity, divergence control, and topology preservation ».
- Livrables : étude comparative, code intégré à la « MilaDy project toolbox ». Thèse financée possible.
- Pratique : 5–6 mois à partir du printemps 2027, ENPC Champs-sur-Marne, 1–2 jours de télétravail par semaine. Candidature à sibo.cheng@enpc.fr et didier.lucor@cnrs.fr.
- Page « Opportunities » de Cheng : « The PhD student will be co-supervised by Sibo Cheng and Didier Lucor », collaboration CEREA (ENPC) – LISN (https://scheng2024.github.io/opportunities/).

**b) Stage M2 précédent (printemps 2026)** [vérifié : PDF ouvert], « Physics-aware Representation Learning for Turbulent Dynamo Data (leading to a potential PhD position within the project) », https://stages.phys.ens.psl.eu/OffresPDF/Offre-30818.pdf :
- Données : « 3D simulation outputs from dynamo configurations used in two experiments in Cadarache (France) and in Dresden (Germany) ».
- Méthodes : architectures encodeur–décodeur convolutionnelles ou à attention ; « latent-space regression so that the reduced representation correlates with physical parameters » ; « contrastive learning » ; mêmes métriques physiques (spectres, hélicité, divergence, topologie).
- Paramètres listés : « Reynolds number, magnetic Reynolds number, material properties, precession rate, or geometry ».
- Références : Fukami & Taira 2023 (Nature Communications 14, 6480, DOI 10.1038/s41467-023-42213-6 [vérifié]) ; Brandstetter, Worrall, Welling 2022 (arXiv:2202.03376) ; Bousquet, Nore, Lucor 2025 (CPC).
- Contacts : Cheng, Lucor, Nore, Ponty.

**c) Postdoc LISN de 24 mois** [vérifié : PDF ouvert, il n'était pas bloqué], https://perso.lisn.upsaclay.fr/lucor/pdf/postdoc_milady_LISN.pdf :
- Titre : « Turbulent Dynamos Reduced-Order Modeling via Machine learning ». Contacts : « Pr. UPS C. Nore » et « DR CNRS D. Lucor ».
- Objectifs : pROM interprétables pour les inversions et les bursts ; optimisation de DRESDYN (« precession, rotation, geometry »).
- Méthodes : approches spectrales linéaires combinées à des (v)AE ; (v)AE informés par la physique par régression latente sur les paramètres, apprentissage contrastif temporel ou paramétrique, invariants physiques ; dynamique réduite contrainte dans l'espace latent (LSTM pour les petits jeux de données, transformers pour les grands).
- Contexte : dynamo « rare in liquid metals, occurs only in 3D turbulent regimes at low magnetic Prandtl number (Pm) » ; DNS « typically restricted to Pm~1 regimes ».
- Salaire : 3 131,32 € à 3 569,85 € brut par mois. Poste soumis à la **PPST** (protection du potentiel scientifique et technique, autorisation MESR préalable).
- Références : Bousquet, Nore, Lucor 2025 ; Bousquet et al. 2024 ; Yang & Schmid 2025, JFM 1011:A30 (inversions en convection 2D, réseaux complexes). DOI 10.1017/jfm.2025.371 [vérifié]
- Page de Lucor : « Starting in April/May 2026 […] funded by the MILADY ANR in collaboration with colleagues from the Lagrange lab (Nice) and CEREA lab (ENPC, EDF R&D) » (https://perso.lisn.upsaclay.fr/lucor/opportunities.html). [corrigé : présenté comme une annonce affichée → ce paragraphe se trouve désormais dans un bloc commenté (<!-- … -->) du code source de opportunities.html et n'est plus affiché, ce qui suggère que l'offre est close]
- Annonce publique du postdoc par Sibo Cheng sur la liste ml-news, 24 janvier 2026 : https://groups.google.com/g/ml-news/c/lr8uwyCAl_M [vérifié : message de Sibo Cheng, 24 janv. 2026, PDF du postdoc joint]

**d) Antécédent, stage M2 Nore–Lucor « Machine learning analysis of local energy transfers in turbulence »** (sans date dans le PDF ; listé sur la page de Lucor avec les offres du printemps 2022), https://perso.lisn.upsaclay.fr/lucor/pdf/M2Stage_Nore_Lucor.pdf : analyse de données 3D SFEMaNS de l'expérience von Kármán du CEA-SPEC, clustering non supervisé, détection d'événements rares et extrêmes. [vérifié : PDF ouvert ; il parle de « our massively parallel research code SFEMaNS » ; l'entrée correspondante est dans un bloc commenté de la page de Lucor]

### 1.3 Publications déjà rattachées à MilaDy dans HAL (champ `anrProjectReference_s`)

Requête : https://api.archives-ouvertes.fr/search/?q=anrProjectReference_s:%22ANR-25-CE51-0077%22 (3 résultats) [vérifié : 3 résultats le 6/11/2026] :
1. Bousquet, Ponty, Botez, Plihon, Nore, *Magnetic field reversals in numerical simulations of the von Kármán sodium experiment*, PRFluids 11, 063703 (2026), DOI 10.1103/9tx2-1m13 (hal-05668081). Détails en §4. [vérifié]
2. Botez, Giesecke, Nore, Cappanera, Stefani, *Impact of boundary conditions on onset and symmetry of precession-driven dynamos*, PRFluids 11, 083701 (2026), DOI 10.1103/rx1h-5zxp (hal-05782992). Détails en §4. [vérifié]
3. J. Barré, H. Horii, *Large deviations, gradient flows and fluctuating hydrodynamics for fractional diffusion* (hal-05796131, 2026), qui remercie aussi deux autres projets ANR. Lien thématique faible. HAL rattache H. Horii à l'Observatoire de la Côte d'Azur et à l'Université Côte d'Azur. [vérifié]

Aucune publication MilaDy de Cheng ou de Lucor sur les dynamos n'a été trouvée à cette date (recherche arXiv `au:Cheng_Sibo`, recherche HAL). [vérifié : arXiv `au:Cheng_Sibo` ou `au:Lucor` avec `abs:dynamo` ou `abs:magnetohydrodynamic` → 0 résultat le 6/11/2026]

---

## 2. Sibo Cheng (ENPC, CEREA)

### 2.1 Parcours et thèmes
Sources : https://scheng2024.github.io/ , /cv/ , /research/ , /people/
- **Poste** : « Tenure-Track Junior Professor (Chaire de Professeur Junior) at ENPC, Institut Polytechnique de Paris », au CEREA, depuis 2024. Également « Honorary Research Fellow » à l'Imperial College London. [vérifié]
- **Avant** : Research Associate au Data Science Institute de l'Imperial College London (2020–2024), avec Rossella Arcucci. [vérifié]
- **Doctorat** : Université Paris-Saclay, 2020, « under the supervision of Didier Lucor, working on error covariance specification in data assimilation in collaboration with EDF R&D ». Selon la page de Lucor : arrivé en 12/2017, docteur en 11/2020 ; diplômé de l'École Centrale de Nantes et de l'UCLouvain (https://perso.lisn.upsaclay.fr/lucor/people.html). [vérifié]
- **Thèmes déclarés** : assimilation de données et problèmes inverses ; modélisation réduite et en espace latent ; scientific ML (réseaux neuronaux couplés aux modèles physiques, simulation différentiable, opérateurs neuronaux) ; « Generative modelling: probabilistic forecasting and field reconstruction using conditional generative models » ; applications aux incendies, à la pollution de l'air et aux systèmes géophysiques. [vérifié]
- **Projets** : Hi! PARIS Fellowship 2026–2030 (PI ; « Differentiable Digital Twin for Wildfire Prediction & Control ») ; **OFML**, ANR JCJC **ANR-25-CE56-0198**, 2025–2029 (PI ; incendies et lutte) ; **MilaDy** (Co-I) ; **QWERTY**, PEPR FORESTT ANR-25-PEFO-0008 (Co-I). [vérifié]
- **Logiciels** : **TorchDA** (assimilation de données avec réseaux profonds, CPC) ; **PyTorchFire** (automate cellulaire différentiable sur GPU, EMS 2025). [vérifié : Environmental Modelling & Software 188, 106401 (2025)]
- **Responsabilités éditoriales** : « Executive Guest Editor, Computer Physics Communications, special issue “Advances in Physics-Aware Machine Learning” » (2024–2025) ; responsable du thème « Data Assimilation », groupe SAMA de l'IPSL (2025–2027). [vérifié]
- **Doctorants en lien avec le génératif** : Zhiwei Zhang (2026–, « Multi-fidelity Air Pollution Field Reconstruction via Generative AI and Data Assimilation ») ; Wenbo Yu (2025–, « Self-Supervised Representation Learning for Data Assimilation ») ; Lisa Achard (2025–, directeurs principaux Lucor et Zeyu Fu, « Generative Multimodal Fusion and Uncertainty Quantification… »). [vérifié] Ajout : Qiyao Zhou (2025–, Université Paris-Saclay, directeur principal Pierre Joli, « Reduced-order and inverse modeling for fluid dynamics »), premier auteur du préprint arXiv:2608.11435 cité plus bas. [vérifié, ajout]
- **Collaborateurs principaux déclarés** : M. Bocquet, R. Arcucci, D. Lucor, N. Chen, L. Xu, X. Zhu. [vérifié]

### 2.2 Publications pertinentes pour l'offre (vérifiées)

Les références viennent de la page Publications (https://scheng2024.github.io/publications/), vérifiées via Crossref et arXiv (DOI indiqués). « * » marque l'auteur correspondant, comme sur la page de Cheng.

1. **Cheng S., Quilodrán-Casas C., Ouala S., Farchi A., Liu C., Tandeo P., Fablet R., Lucor D., Iooss B., Brajard J., Xiao D., Janjic T., Ding W., Guo Y., Carrassi A., Bocquet M., Arcucci R. (2023).** *Machine Learning With Data Assimilation and Uncertainty Quantification for Dynamical Systems: A Review.* IEEE/CAA Journal of Automatica Sinica **10(6), 1361–1387**. DOI **10.1109/JAS.2023.123537** ; arXiv:2303.10462. [vérifié]
   Apport : revue présentée comme « the first overview » du croisement ML / DA / UQ (identification de systèmes, surrogates réduits, spécification des covariances d'erreur, correction d'erreur de modèle). Co-écrite avec Lucor.
2. **Cheng S., Chen J., Anastasiou C., Angeli P., Matar O.K., Guo Y.-K., Pain C.C., Arcucci R. (2022).** *Generalised Latent Assimilation in Heterogeneous Reduced Spaces with Machine Learning Surrogate Models.* Journal of Scientific Computing **94(1), 11**. DOI **10.1007/s10915-022-02059-4** ; arXiv:2204.03497. [vérifié]
   Apport : la GLA fait de l'assimilation variationnelle dans l'espace latent avec des fonctions surrogates locales qui relient espace encodé et espace des observations, ce qui permet des opérateurs d'observation non linéaires. Une borne supérieure de l'écart entre fonction de coût surrogate et fonction de coût originale est donnée. Chiffre (abstract arXiv) : surrogate « nearly 1000 times faster than the CFD simulation » (écoulement diphasique liquide–liquide).
3. **Cheng S., Prentice I.C., Huang Y., Jin Y., Guo Y.-K., Arcucci R. (2022).** *Data-driven surrogate model with latent data assimilation: Application to wildfire forecasting.* Journal of Computational Physics **464, 111302**. DOI **10.1016/j.jcp.2022.111302**. [vérifié]
   Apport : surrogate réduit et assimilation latente (LA) pour la prévision d'incendies.
4. **Cheng S.\*, Liu C., Guo Y., Arcucci R.** *Efficient deep data assimilation with sparse observations and time-varying sensors.* Journal of Computational Physics **496, 112581**. Daté 2024 par Crossref, 2023 sur la page de Cheng. DOI **10.1016/j.jcp.2023.112581** ; arXiv:2310.16187. [vérifié]
   Apport : **VIVID** (« Voronoi-tessellation Inverse operator for VariatIonal Data assimilation »). Un opérateur inverse appris (Voronoï + CNN) est intégré à la fonction de coût variationnelle ; il gère des capteurs épars, non structurés et variables dans le temps, et se couple à la POD.
5. **Cheng S.\*, Zhuang Y., Kahouadji L., Liu C., Chen J., Matar O.K., Arcucci R. (2024).** *Multi-domain encoder–decoder neural networks for latent data assimilation in dynamical systems.* Computer Methods in Applied Mechanics and Engineering **430, 117201**. DOI **10.1016/j.cma.2024.117201**. [vérifié]
   Apport : assimilation latente entre domaines physiques hétérogènes (encodeurs et décodeurs multi-domaines).
6. **Cheng S.\*, Guo Y., Arcucci R. (2023).** *A Generative Model for Surrogates of Spatial-Temporal Wildfire Nowcasting.* IEEE Transactions on Emerging Topics in Computational Intelligence **7(5), 1420–1430**. DOI **10.1109/TETCI.2023.3298535** ; arXiv:2308.02810. [vérifié]
   Apport : **VQ-VAE 3D** qui génère des séquences spatio-temporelles d'incendies inédites (Chimney fire), conditionnées par la végétation et la pente. Les données générées servent à entraîner un surrogate. C'est un précédent de génération conditionnelle de champs.
7. **Zhuang Y., Cheng S., Duraisamy K. (2025).** *Spatially-aware diffusion models with cross-attention for global field reconstruction with sparse observations.* Computer Methods in Applied Mechanics and Engineering **435, 117623**. DOI **10.1016/j.cma.2024.117623** ; arXiv:2409.00230. [vérifié]
   Apport : diffusion à score avec encodage de conditions (observations éparses + champ interpolé) et cross-attention, capteurs mobiles arbitraires, benchmark sur des EDP stationnaires et instationnaires. Résultat (abstract) : la diffusion l'emporte en conditions bruitées, la méthode déterministe en conditions non bruitées ; l'échantillonnage d'ensemble sert à des corrections fondées sur la covariance. C'est **la référence la plus proche de l'offre** côté Cheng.
8. **Yu W., Ghosh A., Finn T.S., Arcucci R., Bocquet M., Cheng S.\* (2026).** *A probabilistic approach to wildfire spread prediction using a denoising diffusion surrogate model.* Geoscientific Model Development **19(2), 1027–1054**. DOI **10.5194/gmd-19-1027-2026** (https://gmd.copernicus.org/articles/19/1027/2026/) ; arXiv:2507.00761. [vérifié]
   Apport : surrogate de diffusion conditionnelle avec échantillonnage d'ensemble, comparé à une régression supervisée de même architecture. Il fait mieux en MSE, SSIM et FID, et sur le score « hit rate (HR) », introduit comme mesure de vérification sensible à l'incertitude. Données : automate cellulaire probabiliste (Chimney 2016, Ferguson 2018). L'arXiv le présente comme « the first denoising diffusion model for predicting wildfire spread ».
9. **Cheng S.\*, Min J., Liu C., Arcucci R.** *TorchDA: A Python package for performing data assimilation with deep learning forward and transformation functions.* Computer Physics Communications **306, 109359**. Daté 2025 par Crossref, 2024 sur la page de Cheng. DOI **10.1016/j.cpc.2024.109359** ; arXiv:2409.00244. [vérifié]
   Apport : KF, EnKF, 3D-Var et 4D-Var avec des réseaux profonds comme modèle de transition et opérateur d'observation (tests sur Lorenz 63 et shallow water). **Cité dans le résumé ANR de MilaDy.**
10. **Zhou H., Cheng S.\*, Arcucci R. (2024).** *Multi-fidelity physics constrained neural networks for dynamical systems.* Computer Methods in Applied Mechanics and Engineering **420, 116758**. DOI **10.1016/j.cma.2024.116758** ; arXiv:2402.02031. [vérifié]
    Apport : **MSPCNN**. Un autoencodeur multi-fidélité place les différentes fidélités dans un espace latent commun, ce qui permet d'évaluer les contraintes physiques en basse fidélité (moindre coût d'entraînement). Tests sur Burgers 2D et shallow water.
11. **Wang H., Zhou H., Cheng S.\*** *Dynamical system prediction from sparse observations using deep neural networks with Voronoi tessellation and physics constraint.* Computer Methods in Applied Mechanics and Engineering **432, 117339** (2025 sur la page de Cheng, 2024 selon Crossref). DOI **10.1016/j.cma.2024.117339** ; arXiv:2409.00458. [vérifié]
    Apport : **DSOVT** (Voronoï + CED-LSTM ou ConvLSTM) avec contraintes physiques dans la perte, pour la prédiction à partir d'observations éparses et variables dans le temps (SST réelle, shallow water).
12. **Gong H.-L., Li H., Xiao D., Cheng S.\* (2024).** *Reactor field reconstruction from sparse and movable sensors using Voronoi tessellation-assisted convolutional neural networks.* Nuclear Science and Techniques **35(5), 43**. DOI **10.1007/s41365-024-01400-w**. [vérifié]
13. **Cheng S.\*, Bocquet M., Ding W., Finn T.S., et al., Arcucci R. (2025).** *Machine learning for modelling unstructured grid data in computational physics: A review.* Information Fusion **123, 103255**. DOI **10.1016/j.inffus.2025.103255** ; arXiv:2502.09346. [vérifié]
    Intérêt : les sorties SFEMaNS sont sur maillage éléments finis non structuré dans le plan méridien (voir §4.1).
14. **Xue X., ten Eikelder M.F.P., Gao M., Cheng X., Yang Y., He Y., Wang S., Cheng S., Hu Y., Coveney P.V. (2026).** *Fast-forward prediction of lattice Boltzmann dynamics with physics-informed neural operators.* Nature Communications **17(1), 9243** (en ligne le 29 juillet 2026). DOI **10.1038/s41467-026-75730-1** (https://www.nature.com/articles/s41467-026-75730-1). [vérifié]
    Apport : opérateur neuronal qui prédit l'évolution LBE sur de grands sauts de temps. Il intègre des contraintes de « moment-matching » et l'équivariance globale, et il est invariant à la discrétisation (entraînement grossier, inférence fine).
15. **Opérateurs de Koopman et dynamique latente (conférences ML)** :
    - Cheng X., He Y., Yang Y., Xue X., Cheng S., Giles D., Tang X., Hu Y., *Learning Chaos In A Linear Way*, ICLR 2025 (https://openreview.net/forum?id=Llh6CinTiy ; arXiv:2503.14702). **PFNN** : autoencodeur et opérateur linéaire qui respectent contraction et invariance de la mesure. [vérifié : « ICLR 2025 Poster » sur OpenReview]
    - Yang Y., Cheng X., Giles D., Cheng S., He Y., Xue X., Chen B., Hu Y., *Tensor-Var: Efficient Four-Dimensional Variational Data Assimilation*, ICML 2025, PMLR 267:70649–70679. [corrigé : titre « Tensor-Var: Variational Data Assimilation in Tensor Product Feature Space » (repris de la page de Cheng) → « Tensor-Var: Efficient Four-Dimensional Variational Data Assimilation » (titre publié, proceedings.mlr.press/v267)]
    - Cheng X., Yuan W., Yang Y., Zhang Y., Cheng S., He Y., Sun Z., *Information Shapes Koopman Representation*, ICLR 2026, **Oral** (« top 1.2% » selon la page de Cheng) ; arXiv:2510.13025. [vérifié : « ICLR 2026 Oral » sur OpenReview ; le « top 1.2% » vient seulement de la page de Cheng]
16. **Cheng S.\*, Lucor D., Argaud J.-P. (2021).** *Observation data compression for variational assimilation of dynamical systems.* Journal of Computational Science **53, 101405**. DOI **10.1016/j.jocs.2021.101405** ; arXiv:2106.05427. Publication commune Cheng–Lucor (thèse). [vérifié]

**Préprints 2026 pertinents (arXiv, non publiés à la date de collecte)** :
- Bocquet M., Finn T.S., Cheng S., *Accounting for model error in ensemble variational data assimilation through learned generative dynamics*, arXiv:2610.17333. **IEnKF-G** : un modèle de prévision génératif stochastique remplace l'erreur de modèle gaussienne additive dans un 4D-Var à contrainte faible. Tests sur Lorenz 63 stochastique et Lorenz 96 multi-échelle ; gains substantiels sous observation partielle. [vérifié]
- Zhou Q., Zhu X., Joli P., Cong Y., Cheng S., *Variational Parameter Calibration with Physics-Aware Latent-Space Surrogates*, arXiv:2608.11435. Surrogate différentiable paramètres → champs via un espace latent, avec supervision observable pour que les latents portent l'information des paramètres. Constat : « reconstruction accuracy alone is insufficient for inverse modeling ». [vérifié]
- Zhang Z. et al. (dont Cheng S.), *When Latent Dynamics Meet Data Assimilation: A Benchmark of Koopman-Type Representations*, arXiv:2611.03916. Compare 7 méthodes sur 5 systèmes ; compromis entre flexibilité de représentation et tractabilité de l'optimisation. [vérifié]
- Sabnis A.A. et al. (dont Cheng S.), *From Deterministic to Generative Deep Learning for Urban Air Quality Reconstruction from Sparse Observations*, arXiv:2607.25687. Cadre de diffusion multi-polluants (NO2, O3, PM2.5, PM10) à Paris, évalué sur 9 à 28 stations. [vérifié]
- Zhou Y., Lin C., Kikumoto H., Ooka R., Cheng S., *Rooftop wind field reconstruction using sparse sensors: From deterministic to generative learning methods*, Building and Environment 296, 114480 (2026) d'après la page de Cheng ; arXiv:2603.13077. Kriging comparé à UNet, ViTAE et CWGAN sur données PIV ; gain jusqu'à 32,7 % en SSIM par rapport au krigeage. [vérifié : DOI 10.1016/j.buildenv.2026.114480]

---

## 3. Didier Lucor (LISN, CNRS)

### 3.1 Parcours et thèmes
Sources : https://perso.lisn.upsaclay.fr/lucor/ et /people.html
- « CNRS research director at the LISN lab », membre du groupe **DATAFLOT** (« DAta science, TrAnsition, FLuid instabiLity, contrOl & Turbulence ») du département de mécanique. Directeur adjoint du LISN de 2022 à 2025. [vérifié]
- MSc et PhD en mathématiques appliquées, **Brown University (2004)** ; deux ans de postdoc au département d'Ocean Engineering du **MIT** ; dix ans à l'**Institut d'Alembert** (Sorbonne Université), puis LIMSI, qui a fusionné en 2021 avec le LRI pour former le LISN. [vérifié]
- Thèmes déclarés : « stochastic modeling and computational mechanics, with emphasis on: physics-informed statistical learning, reduced-order modeling, uncertainty quantification, data assimilation, sensitivity analysis and robust optimization ». Applications : modélisation de la turbulence, transferts thermiques, interaction fluide–structure, biomécanique, écoulements environnementaux, énergie. [vérifié]
- Position sur le ML physique (page d'accueil) : « generalization errors of those models are considerably improved if some "physics information" (in the form of invariant, first principles, symmetries, etc...) is included/enforced ». [vérifié]
- Éditeur invité du numéro spécial de **Computer Physics Communications** « Advances in physics aware machine learning » (même numéro que Cheng). [vérifié ; sur la page d'accueil de Lucor ce paragraphe est désormais dans un bloc commenté, non affiché ; le rôle de Cheng figure sur son CV]
- Encadrements liés : Sibo Cheng (thèse EDF–LIMSI, 2017–2020) ; Rémi Bousquet (M2 LISN 2022, puis co-auteur des travaux VAE/POD avec Nore) ; Lisa Achard (2025–, cotutelle avec Exeter, co-encadrée par le CEREA). [vérifié]

### 3.2 Publications pertinentes (vérifiées, Crossref ou HAL ou arXiv)

1. **Bousquet R., Nore C., Lucor D. (2025).** *AutoEncoders latent space interpretability in the light of proper orthogonal decomposition: Machine learning of periodically forced fluid flows.* Computer Physics Communications **315, 109728** (octobre 2025). DOI **10.1016/j.cpc.2025.109728** ; hal-05407939 (résumé lu via l'API HAL : https://api.archives-ouvertes.fr/search/?q=halId_s:hal-05407939&fl=abstract_s). Aucune version arXiv trouvée. [vérifié]
   Apport : AE et VAE sur des champs de vitesse de Navier-Stokes (cylindre oscillant, étude paramétrique ; écoulement de von Kármán).
   - Augmenter la régularisation des VAE dégrade la reconstruction, ce qui montre une limite du prior gaussien.
   - Les AE s'entraînent de façon robuste ; les VAE montrent une « sharper transition between non-learning and learning regimes ».
   - Organisation latente reliée aux modes POD ; **analyse de symétrie et relations d'équivariance latent ↔ physique**, mieux préservées par les VAE ; interprétation par clustering des coefficients temporels POD.
   - C'est **la référence de base de MilaDy côté représentation**, citée dans le postdoc et le stage 2026.
2. **Bousquet R., Chaffard O., Creff M., Lucor D., Nore C. (2024).** *Large scale analysis of three-dimensional turbulent von Kármán swirling flows.* Physics of Fluids **36(10), 105133**. DOI **10.1063/5.0227495** ; hal-04723526. [vérifié ; l'abstract porte « Re>104 » dans Crossref, HAL et sur la page AIP (exposant perdu) : la lecture 10⁴ est cohérente mais l'exposant n'a pas été vu typographié]
   Apport : LES (« scheme-consistency preserving large eddy simulations model ») à plusieurs Re ; POD sur les champs 3D-3C. Corrobore numériquement « for the first time » un état métastable pour **Re > 10⁴** : structure axisymétrique à une cellule qui brise la symétrie **Rπ** (rotation de π autour d'un axe radial), avec fluctuations intermittentes du moment cinétique. Puis POD des modes de Fourier azimutaux (2D-3C). L'exposant de « Re>104 » est perdu dans les métadonnées et lu comme 10⁴ sur la page AIP (https://pubs.aip.org/aip/pof/article/36/10/105133/3317096).
3. **Lucor D., Agrawal A., Sergent A. (2022).** *Simple computational strategies for more effective physics-informed neural networks modeling of turbulent natural convection.* Journal of Computational Physics **456, 111022**. DOI **10.1016/j.jcp.2022.111022**. Préprint : arXiv:2103.03565 (« Physics-aware deep neural networks for surrogate modeling of turbulent natural convection »). [vérifié pour la référence ; chiffres : voir ci-dessous]
   Apport : PINNs pour Rayleigh–Bénard turbulent (cavités rugueuses ou lisses) à partir de données DNS de température ; technique de « padding » des points de collocation ; **relaxation de la contrainte d'incompressibilité** pour faciliter l'optimisation.
   Chiffres (abstract du **préprint** arXiv, à revérifier dans la version JCP) : Ra = 2·10⁹, erreurs relatives L2 de 0,3 % à 4 % sur environ 0,5 milliard de points DNS, entraînement avec 1,6 % des points. [vérifié dans l'abstract arXiv ; NON CONFIRMÉ dans la version JCP, dont l'abstract est inaccessible (ScienceDirect 403, absent de Crossref et d'OpenAlex)]
4. **Volk M.-C., Sergent A., Lucor D., Mommert M., Bauer C., Wagner C. (2025).** *A PINN methodology for temperature field reconstruction in the PIV measurement plane: Case of Rayleigh–Bénard convection.* International Communications in Heat and Mass Transfer **167, 109284**. DOI **10.1016/j.icheatmasstransfer.2025.109284**. [vérifié]
5. **Sundar R., Lucor D., Sarkar S. (2025).** *Sequential learning based PINNs to overcome temporal domain complexities in unsteady flow past flapping wings.* Journal of Fluids and Structures **139, 104421**. DOI **10.1016/j.jfluidstructs.2025.104421** ; arXiv:2503.15679. Apport : décomposition temporelle et transfert d'apprentissage pour l'intégration longue des PINNs. [vérifié]
6. **Sundar R., Majumdar D., Lucor D., Sarkar S. (2024).** *Physics-informed neural networks modelling for systems with moving immersed boundaries: Application to an unsteady flow past a plunging foil.* Journal of Fluids and Structures **125, 104066**. DOI **10.1016/j.jfluidstructs.2024.104066**. [vérifié]
7. **Cai J., Angeli P.-E., Martinez J.-M., Damblin G., Lucor D. (2024).** *Revisiting Tensor Basis Neural Network for Reynolds stress modeling: Application to plane channel and square duct flows.* Computers & Fluids **275, 106246**. DOI **10.1016/j.compfluid.2024.106246** ; arXiv:2403.11746. Apport : réseaux qui respectent les invariances galiléenne et rotationnelle ; transfert d'apprentissage vers des Re_τ non vus. [vérifié ; précision : le transfert d'apprentissage sert au conduit carré]
8. **Jaber E., Blot V., Brunel N., Chabridon V., Remy E., Iooss B., Lucor D., Mougeot M., Leite A. (2025).** *Conformal approach to Gaussian process surrogate evaluation with marginal coverage guarantees.* Journal of Machine Learning for Modeling and Computing **6(3), 37–68**. DOI **10.1615/JMachLearnModelComput.2025054687**. Utile pour évaluer l'incertitude de générateurs ou surrogates. [corrigé : « with (marginal) coverage guarantees » → « with marginal coverage guarantees » (titre Crossref ; la page de Lucor et l'arXiv donnent « With Coverage Guarantees »)]
9. **El Garroussi S., Ricci S., De Lozzo M., Goutal N., Lucor D.** *Tackling random fields non-linearities with unsupervised clustering of polynomial chaos expansion in latent space: application to global sensitivity analysis of river flooding.* Stochastic Environmental Research and Risk Assessment **36(3), 693–718** (en ligne en 2021). DOI **10.1007/s00477-021-02060-7**. Combine PCE et espace latent. [vérifié]
10. **Nony B.X., Rochoux M.C., Jaravel T., Lucor D. (2023).** *Reduced-order modeling for parameterized large-eddy simulations of atmospheric pollutant dispersion.* SERRA **37(6), 2117–2144**. DOI **10.1007/s00477-023-02383-7**. ROM paramétrique sur LES. [vérifié]
11. **Lucor D., Meyers J., Sagaut P. (2007).** *Sensitivity analysis of large-eddy simulations to subgrid-scale-model parametric uncertainty using polynomial chaos.* Journal of Fluid Mechanics **585, 255–279**. DOI **10.1017/S0022112007006751**. Chaos polynomial appliqué à la LES. [vérifié]
12. **Lucor D., Karniadakis G.E. (2004).** *Adaptive Generalized Polynomial Chaos for Nonlinear Random Oscillators.* SIAM J. Sci. Comput. **26(2), 720–735**. DOI **10.1137/S1064827503427984**. Et **Lucor D., Karniadakis G.E. (2004)**, *Noisy Inflows Cause a Shedding-Mode Switching in Flow Past an Oscillating Cylinder*, PRL **92(15), 154501**, DOI **10.1103/PhysRevLett.92.154501**. [vérifié]
- Publications récentes en optimisation robuste et fusion de données (DOI lus sur la page d'accueil de Lucor) : Zhou H., Wang Z., Lucor D., Sauret E., *New Bayesian optimisation framework for robust multi-objective design: decoupling performance and uncertainty*, RESS **274**, 112359 (2026), DOI 10.1016/j.ress.2026.112359 ; Jaber E., Remy E., Chabridon V., Mougeot M., Lucor D., *Fusion of heterogeneous data for robust degradation prognostics*, RESS **274**, 112435 (2026), DOI 10.1016/j.ress.2026.112435. [vérifié ; titres et volume 274 ajoutés d'après Crossref]
- Communs avec Cheng : la revue IEEE/CAA JAS 2023 (§2.2 n°1) et JCS 2021 (§2.2 n°16) ; Cheng et al., *A graph clustering approach to localization…*, Mathematical Geosciences 53(8), 1751–1780 (2021) ; deux articles SERRA (2019, 2020), d'après les pages de publications des deux auteurs. [vérifié : Math. Geosci. DOI 10.1007/s11004-021-09951-z ; SERRA 33(11-12), 2033–2051 (2019), DOI 10.1007/s00477-019-01743-6 ; SERRA 35(5), 1019–1038 (en ligne en 2020), DOI 10.1007/s00477-020-01933-7]
- Ajout (préprint, sans financement MilaDy indiqué) : **Bousquet R., Faucheu A., Dumas L., Nore C., Lucor D. (2026).** *Polynomial autoencoders with quantifiable errors for nonlinear fluid flow reconstruction.* Research Square, déposé le 19 juin 2026, DOI 10.21203/rs.3.rs-10008570/v1. Autoencodeurs à activations polynomiales apprenables, initialisés pour être exactement équivalents à la POD ; l'initialisation POD accélère l'entraînement d'un ordre de grandeur (cylindre oscillant). Suite directe de CPC 2025. [vérifié, ajout]

---

## 4. Caroline Nore (LISN, Université Paris-Saclay)

### 4.1 Positionnement et outil SFEMaNS
- Statut : « Pr. UPS C. Nore » dans le PDF du postdoc MilaDy (https://perso.lisn.upsaclay.fr/lucor/pdf/postdoc_milady_LISN.pdf) ; « Pr. Caroline Nore (LISN) » dans l'offre de stage. Coordinatrice de MilaDy (page ANR). [vérifié] Affiliation HAL des articles MilaDy : LISN, équipe **COMET** (plus DATAFLOT pour CPC 2025). [vérifié, ajout]
- **SFEMaNS** (documentation v5.3 : https://people.tamu.edu/~guermond/SFEMaNS/html/doc_intro.html). Les en-têtes du code créditent J.-L. Guermond et C. Nore (constat de la recherche web, en-têtes non ouverts directement). [NON CONFIRMÉ pour les en-têtes ; en revanche l'offre M2 Nore–Lucor parle de « our massively parallel research code SFEMaNS » : vérifié]
  - Équations : Navier-Stokes incompressible (Re), chaleur, Maxwell en domaine conducteur avec perméabilité μ^c et conductivité σ (Rm), avec conditions de saut à travers une interface de perméabilité discontinue Σ_μ, et potentiel scalaire φ dans le vide (H = ∇φ). Modes : NST, MXW (cinématique), MHD (force de Lorentz), FHD (ferrofluides, force de Kelvin). [vérifié]
  - Discrétisation : « cylindrical coordinates (r,θ,z) and assumes a priori that the computational domain is axi-symmetric. The approximation method consists of using a Fourier decomposition in the azimuthal direction and Lagrange finite elements in the meridian section ». [vérifié]
  - Extensions : « Stabilization method, called entropy viscosity, for problems with large kinetic Reynolds numbers », géométrie non axisymétrique, multiphasique, « Magnetic permeability depending of the time and the azimuthal direction », approximation quasi-statique. [vérifié]
  - Conséquence pour l'apprentissage : les données sont une **représentation hybride (modes de Fourier m) × (maillage EF non structuré méridien)**, et pas une grille cartésienne. [vérifié : découle de la documentation]
- Viscosité entropique (non co-écrit par Nore) : Guermond J.-L., Pasquetti R., Popov B. (2011), *Entropy viscosity method for nonlinear conservation laws*, JCP **230(11), 4248–4267**, DOI 10.1016/j.jcp.2010.11.043 (Crossref). [vérifié]

### 4.2 Publications pertinentes (vérifiées, HAL ou Crossref)

Liste HAL complète (82 documents [vérifié le 6/11/2026]) : https://api.archives-ouvertes.fr/search/?q=authFullName_s:%22Caroline%20Nore%22

1. **Nore C., Castanon Quiroz D., Cappanera L., Guermond J.-L. (2016).** *Direct numerical simulation of the axial dipolar dynamo in the Von Karman Sodium experiment.* EPL **114, 65002**. DOI **10.1209/0295-5075/114/65002** ; hal-02365015. [vérifié]
   Apport : « For the first time », DNS MHD non linéaire complète de VKS avec les deux turbines contrarotatives représentées. Le seuil dynamo **diminue quand la perméabilité magnétique des turbines augmente**. Deux familles magnétiques sont en compétition à faible Re et fusionnent à Re plus élevé. Le fer doux favorise un **dipôle axial essentiellement axisymétrique**, comme dans l'expérience.
2. **Nore C., Castanon Quiroz D., Cappanera L., Guermond J.-L. (2018).** *Numerical simulation of the von Kármán sodium dynamo experiment.* Journal of Fluid Mechanics **854, 164–195**. DOI **10.1017/jfm.2018.582** (résumé lu via Crossref). [vérifié]
   Apport : turbines en fer doux représentées par une **pseudo-pénalisation** ; LES à haut Re ; spectre de type Kolmogorov ; tourbillons hélicoïdaux aux extrémités des pales ; couche de cisaillement équatoriale ondulée (3 vortex radiaux co-rotatifs).
   - Rm_c diminue quand μ augmente (Re fixé) et quand Re augmente (μ fixé), d'où la conjecture que Rm_c tend vers une constante quand Re → ∞.
   - Dynamo en dipôle axial essentiellement axisymétrique ; mécanisme spéculatif proposé.
3. **Bousquet R., Ponty Y., Botez V., Plihon N., Nore C. (2026).** *Magnetic field reversals in numerical simulations of the von Kármán sodium experiment.* Physical Review Fluids **11(6), 063703** (reçu le 19/01/2026, publié le 18/06/2026). DOI **10.1103/9tx2-1m13** ; hal-05668081. Texte intégral : https://perso.ens-lyon.fr/nicolas.plihon/Publis/Bousquet_PRF_11.pdf [vérifié : PDF ouvert ; dates, paramètres, définitions de Re et Rm, contraintes (10)–(11), problème (12), Tables I–II et disponibilité des données relus dans le texte]
   - **Deux solveurs** : LATU (réf. [22] = Kreuzahler et al. 2017) et SFEMaNS (réf. [23] = Nore et al. 2018). Turbines par pénalisation (réf. [28] Pasquetti et al. 2008) ; μ_r(x,t) variable pour des turbines en fer doux non axisymétriques (disque + 8 pales courbes).
   - Paramètres de forçage : asymétrie (F1 − F2)/(F1 + F2) ; Re = 2πF R_cyl R_imp/ν ; Rm = 2πF R_cyl R_imp μ0σ.
   - Simulation de référence (géométrie LATU) : **Re = 1594, Rm = 531, asymétrie = 0,058, μ_r = 16 dans les turbines** (1 ailleurs), σ_r = 1. Une forte asymétrie (≈ 1/4) déclenche des inversions périodiques.
   - « a conductive surrounding medium was found to be necessary for these inversions to occur » (dans la gamme explorée).
   - Mécanisme en **5 étapes** : dipôle, affaiblissement près de la turbine rapide, état quadrupolaire, affaiblissement près de la turbine lente, dipôle inversé. Il s'interprète comme deux dipôles localisés, un par turbine.
   - **POD sur 2000 snapshots** de u et H : 4 modes axisymétriques dominants, ψ_D (dipôle), ψ_Q (quadrupôle), φ_V (zonal, Rπ-antisymétrique) et φ_U (Rπ-symétrique). Signature m = 8 des pales ; modes POD n = 3, 4 (m = 2) associés aux vortex de Kelvin–Helmholtz.
   - **Modèle de Galerkin DQVU** obtenu par projection des équations MHD, qui se réduit au modèle DQV déjà connu. Coefficients identifiés par **régression de Galerkin contrainte avec PySINDy**, sous deux contraintes : quadratique Navier-Stokes A_uvv + A_vvu = 0, et conservation statistique du 3e moment X²·f(X,p) = 0. Dérivées temporelles calculées avec un filtre de Savitzky–Golay. DQVU reproduit la distribution **bimodale asymétrique** de V, ce que DQV ne fait pas. Coefficients donnés en annexe (Tables I et II).
   - **Données non publiques** (« available from the authors upon reasonable request »). Calcul : GENCI et OPAL (Université Côte d'Azur).
4. **Botez V., Giesecke A., Nore C., Cappanera L., Stefani F. (2026).** *Impact of boundary conditions on onset and symmetry of precession-driven dynamos.* Physical Review Fluids **11(8), 083701** (reçu le 27/04/2026, publié le 14/08/2026). DOI **10.1103/rx1h-5zxp** ; hal-05782992 (résumé lu via l'API HAL, Crossref et OpenAlex ; PDF bloqué par l'anti-bot). [corrigé : « 2026-10-07 » (date de la notice HAL) → publié le 14 août 2026 (Crossref, numéro d'août 2026)]
   Apport : dynamo **cinématique** de précession en cylindre, dans une « narrow range of Poincaré numbers where dynamo action is most likely », à partir de champs de vitesse moyennés en temps.
   - Deux familles de modes : quadrupolaire centro-symétrique à plus haute fréquence, dipolaire centro-antisymétrique à plus basse fréquence.
   - Les conditions « vanishing-tangential-field » simplifiées **sous-estiment systématiquement Rm_c**. Des parois conductrices ou perméables peuvent favoriser ou supprimer la dynamo.
   - Application directe à **DRESDYN**.
5. **Botez V., Bousquet R., Nore C. (2025).** *Large scale analysis of the von Kármán sodium experiment using proper orthogonal decomposition.* Magnetohydrodynamics **61(1/2), 13–24**. DOI **10.22364/mhd.61.1-2.2** (https://mhd.sal.lv/contents/2025/1/MG.61.1.2.R.html). [vérifié]
   Apport : POD de simulations VKS en phases de croissance et de saturation. En croissance, dipôle axial avec structures secondaires issues de l'effet α. En saturation, la rétroaction magnétique **brise la symétrie du champ de vitesse** même en contrarotation exacte.
6. **Creff M., Faller H., Dubrulle B., Guermond J.-L., Nore C. (2024).** *Tracking dynamo mechanisms from local energy transfers: Application to the von Kármán sodium dynamo.* Physics of Plasmas **31(2), 022306**. DOI **10.1063/5.0174251**.
   Apport : bilans d'énergie locaux en espace, en échelle et en temps, avec un filtrage applicable aux **maillages non structurés**. Pour des turbines en acier, la dynamo vient des transferts dans le volume et près des turbines ; pour le fer doux, surtout de la rotation des pales. Précurseurs de dissipation anormale et de dynamo rapide. C'est un outil de **métrique physique** pour des champs générés. Thèse associée : M. Creff, *Rôle des transferts d'énergie dans l'effet dynamo : application à l'écoulement de von Kármán*, Université Paris-Saclay, 21/12/2023, dir. C. Nore et B. Dubrulle (tel-04477539 ; https://api.archives-ouvertes.fr/search/?q=halId_s:tel-04477539). [vérifié]
7. **Nore C., Léorat J., Guermond J.-L., Luddens F. (2011).** *Nonlinear dynamo action in a precessing cylindrical container.* Physical Review E **84(1), 016317**. DOI **10.1103/PhysRevE.84.016317** ; arXiv:1102.1846. Apport : démonstration numérique (code MHD) que la **précession peut déclencher l'effet dynamo** dans un cylindre. [vérifié]
8. **Cappanera L., Guermond J.-L., Léorat J., Nore C. (2016).** *Two spinning ways for precession dynamo.* Physical Review E **93(4), 043113**. DOI **10.1103/PhysRevE.93.043113**. [vérifié ; résumé lu via OpenAlex]
   Apport : angle spin–précession fixé à π/2 ; deux configurations, « axial spin » (axe du cylindre parallèle au spin) et « equatorial spin » (axe perpendiculaire). La centro-symétrie de l'écoulement se brise quand Re augmente, plus efficacement en spin équatorial ; l'écoulement moyen tend vers une contre-rotation par rapport à l'axe de spin. En spin équatorial, l'écoulement instationnaire asymétrique entretient une dynamo (régimes linéaire et non linéaire), à champ surtout dipolaire ; en spin axial, le champ est surtout quadrupolaire. Loi d'échelle de l'énergie cinétique moyenne en fonction de Re (spin axial). [ajout]
9. **Nore C., Guermond J.-L., Laguerre R., Léorat J., Luddens F. (2012).** *Nonlinear dynamo in a short Taylor–Couette setup.* Physics of Fluids **24(9), 094106**. DOI **10.1063/1.4752756**.
   Apport : dynamo dans un Taylor–Couette court avec force volumique. Seuil comparable aux géométries sphériques ; dynamo linéaire en dipôle équatorial tournant ; régime non linéaire avec dipôle incliné dont la composante axiale présente des **inversions apériodiques**. [vérifié]
10. **Giesecke A., Nore C., Stefani F., Gerbeth G., Léorat J., Herreman W., Luddens F., Guermond J.-L. (2012).** *Influence of high-permeability discs in an axisymmetric model of the Cadarache dynamo experiment.* New Journal of Physics **14, 053005**. DOI **10.1088/1367-2630/14/5/053005** ; arXiv:1112.1780.
    Chiffre : Rm_c(μ) − Rm_c(μ→∞) ∼ μ^(−1/2) (effet de peau dans les disques). Un mode toroïdal axisymétrique localisé dans les disques domine à grand μ. Les conditions pseudo-vide idéalisées (H×n = 0) ne permettent pas de retrouver ce rôle des disques. [vérifié]
11. **Laguerre R., Nore C., Ribeiro A., Léorat J., Guermond J.-L., Plunian F. (2008).** *Impact of Impellers on the Axisymmetric Magnetic Mode in the VKS2 Dynamo Experiment.* PRL **101(10), 104501**. DOI **10.1103/PhysRevLett.101.104501** ; arXiv:0805.2805. Chiffre (abstract) : Rm_c observé ≈ 32, atteignable avec des conditions aux limites ferromagnétiques et un effet α des turbines. [vérifié]
12. **Méthodes numériques (fondements de SFEMaNS)** :
    - Guermond, Laguerre, Léorat, Nore (2007), *An interior penalty Galerkin method for the MHD equations in heterogeneous domains*, JCP **221, 349–369**, DOI 10.1016/j.jcp.2006.06.045.
    - Guermond, Laguerre, Léorat, Nore (2009), *Nonlinear magnetohydrodynamics in axisymmetric heterogeneous domains using a Fourier/finite element technique and an interior penalty method*, JCP **228, 2739–2757**, DOI 10.1016/j.jcp.2008.12.026.
    - Guermond, Léorat, Luddens, Nore, Ribeiro (2011), *Effects of discontinuous magnetic permeability on magnetodynamic problems*, JCP **230, 6299–6319**, DOI 10.1016/j.jcp.2011.04.026.
    Toutes trois tirées de HAL. [vérifié : métadonnées Crossref identiques]
- Autres : Nore, Léorat, Guermond, Giesecke (2015), *Mean-field model of the von Karman sodium dynamo experiment using soft iron impellers*, PRE **91, 013008**, DOI 10.1103/PhysRevE.91.013008 ; Stefani, Albrecht, Gerbeth, Giesecke, Gundrum, Herault, Nore, Steglich (2015), *Towards a precession driven dynamo experiment*, Magnetohydrodynamics **51, 275–284**, DOI 10.22364/mhd.51.2.11 (DRESDYN) ; Giesecke et al. (2010), *Electromagnetic induction in non-uniform domains*, GAFD **104(5-6), 505–529**, DOI 10.1080/03091929.2010.507202. [vérifié : 3 références]
- Contexte DRESDYN, sans Nore comme co-auteur : Giesecke A., Vogt T., Gundrum T., Stefani F. (2018), *Nonlinear Large Scale Flow in a Precessing Cylinder and Its Ability To Drive Dynamo Action*, PRL **120(2), 024502**, DOI 10.1103/PhysRevLett.120.024502 (Crossref). [vérifié]
- Autres axes de Nore, peu liés à l'offre : batteries à métaux liquides (instabilité de Tayler, JFM 771, 2015 ; metal pad roll, PRL 126, 184501, 2021), ferrofluides, électrovortex. [vérifié : Herreman, Nore, Cappanera, Guermond, JFM 771, 79–114 (2015), DOI 10.1017/jfm.2015.159 ; Nore, Cappanera, Guermond, Weier, Herreman, PRL 126, 184501 (2021), DOI 10.1103/PhysRevLett.126.184501]
- **Thèses dirigées pertinentes (HAL)** : F. Luddens (2012, avec Guermond, MHD et dynamo) ; L. Cappanera (2015, stabilisation non linéaire de la MHD) ; M. Creff (2023, avec Dubrulle, transferts d'énergie et dynamo VKS). Requête : https://api.archives-ouvertes.fr/search/?q=director_s:%22Caroline%20Nore%22 [vérifié]
- **Ajout, thèse en apprentissage automatique co-dirigée par Nore** : M. Quattromini, *Graph Neural Networks pour la mécanique des fluides : assimilation de données et optimisation*, soutenue le 13/12/2024 (tel-04964013), co-direction C. Nore, S. Cherubini, O. Semeraro et M. A. Bucci. Nore a donc déjà co-dirigé une thèse en ML et assimilation de données. [vérifié, ajout]

---

## 5. Yannick Ponty (Observatoire de la Côte d'Azur, Lagrange, CNRS)

### 5.1 Parcours
Sources : CV 2026 en deux pages (https://c2pu.oca.eu/images/LAGRANGE/pages_perso/ponty/pdf/cv-2pages-2026.pdf) et CV long (https://c2pu.oca.eu/images/LAGRANGE/pages_perso/ponty/pdf/cv-Yannick-Ponty.pdf). Le miroir lagrange.oca.eu a un certificat TLS expiré et n'a pas été utilisé.
- Directeur de recherche CNRS depuis octobre 2014 (section 10, puis 12) au laboratoire J.-L. Lagrange (UMR 7293), OCA, Nice. Responsable de l'équipe « Turbulence Fluide et Plasma » depuis octobre 2025 (déjà de 2011 à 2021). Membre extérieur de l'équipe CASTOR d'INRIA. [vérifié]
- CR CNRS de 2000 à 2014 ; Research Fellow au groupe MHD de l'Université d'Exeter de 1997 à 2000 ; thèse en 1997 (« Textures convectives dans un fluide en rotation et effet dynamo dans un écoulement chaotique ») ; HDR en 2012 (« Rôle de la turbulence sur l'effet dynamo et l'induction magnétique », tel-00922148). [vérifié]
- Mots-clés déclarés : « Magnétohydrodynamique (MHD), Effet Dynamo, Turbulence, HPC (High Performance Computing), Contrôle Optimale ». « 30 publications avec comité de lecture », dont deux couvertures de PRL et une « Editor Suggestion ». [vérifié]
- Encadrement : co-encadrement de la thèse de S. Kreuzahler (Bochum, avec R. Grauer, 2012–2015) sur la **pénalisation pour VKS** ; postdoc MilaDy depuis février 2026 ; stagiaire M1 2025 sur le HPC avec Kokkos. [vérifié]

### 5.2 Publications pertinentes (vérifiées, HAL, Crossref ou arXiv)

Liste HAL : https://api.archives-ouvertes.fr/search/?q=authFullName_s:%22Yannick%20Ponty%22 (30 documents [vérifié le 6/11/2026]).

1. **Ponty Y., Mininni P.D., Montgomery D.C., Pinton J.-F., Politano H., Pouquet A. (2005).** *Numerical study of dynamo action at low magnetic Prandtl numbers.* PRL **94, 164502**. DOI **10.1103/PhysRevLett.94.164502** ; arXiv:physics/0410046 ; hal-00133225. [vérifié]
   Apport : forçage Taylor–Green, approche combinant DNS, modèle lagrangien moyenné et LES. Chiffres (abstract) : dynamos observées « from P_M=1 down to P_M=10⁻² » ; Rm_c augmente fortement avec P_M⁻¹ puis sature ; spectre de **Kazantsev k^(3/2)** en phase linéaire.
2. **Ponty Y., Plunian F. (2011).** *Transition from Large-Scale to Small-Scale Dynamo.* PRL **106, 154502**. DOI **10.1103/PhysRevLett.106.154502** ; arXiv:2004.11028. [vérifié ; préprint arXiv déposé en 2020, avec la référence PRL 2011]
   Apport : forçage hélical de type Roberts (lien avec Karlsruhe). Le seuil est contrôlé par les longues échelles de temps ; effet α généralisé ∼ **O(Rm⁻¹)** au-delà du seuil, ce qui indique une prise de relais par la dynamo petite échelle.
3. **Ponty Y., Laval J.-P., Dubrulle B., Daviaud F., Pinton J.-F. (2007).** *Subcritical Dynamo Bifurcation in the Taylor-Green Flow.* PRL **99(22), 224501** (couverture). DOI **10.1103/PhysRevLett.99.224501** ; arXiv:0707.2498. Bifurcation **sous-critique**, hystérésis liée aux changements hydrodynamiques induits par la force de Lorentz. [vérifié]
4. **Ponty Y., Mininni P.D., Pinton J.-F., Politano H., Pouquet A. (2007).** *Dynamo action at low magnetic Prandtl numbers: mean flow versus fully turbulent motions.* New Journal of Physics **9, 296**. DOI **10.1088/1367-2630/9/8/296**. [vérifié]
5. **Alexakis A., Ponty Y. (2008).** *Effect of the Lorentz force on on-off dynamo intermittency.* PRE **77, 056308**. DOI **10.1103/PhysRevE.77.056308** ; arXiv:0710.0063. [vérifié]
   Apport : forçage ABC près du seuil, **intermittence on-off**. À grand Re, la durée des phases « on » suit une **loi de puissance** ; à petit Re, la force de Lorentz supprime le bruit (écoulement périodique « laminaire »). Directement lié aux **bursts et événements rares** de MilaDy.
6. **Kreuzahler S., Schulz D., Homann H., Ponty Y., Grauer R. (2014).** *Numerical study of impeller-driven von Kármán flows via a volume penalization method.* New Journal of Physics **16(10), 103001**. DOI **10.1088/1367-2630/16/10/103001**. [vérifié]
7. **Kreuzahler S., Ponty Y., Plihon N., Homann H., Grauer R. (2017).** *Dynamo Enhancement and Mode Selection Triggered by High Magnetic Permeability.* PRL **119(23), 234501** (couverture). DOI **10.1103/PhysRevLett.119.234501** ; arXiv:1706.00260.
   - Méthode (texte arXiv) : « standard Fourier pseudospectral method on a regular Cartesian grid », turbines et parois par **pénalisation**, filtre « sharpened raised cosine » contre le phénomène de Gibbs aux sauts de μ, boîte périodique **(3π)³ avec 384³ points**, cylindre de rayon 3,0 et de hauteur 6,0, μ_r de 1 à 16.
   - Résultat : mode dynamo axisymétrique auto-généré au-delà d'un seuil de perméabilité.
   - Ce code est le **solveur « LATU »** de Bousquet et al. 2026 (réf. [22]). [vérifié : Bousquet 2026 écrit « LATU [22] », et [22] = Kreuzahler et al. 2017 ; texte arXiv v4 relu]
8. **Homann H., Ponty Y., Krstulovic G., Grauer R. (2014).** *Structures and Lagrangian statistics of the Taylor–Green dynamo.* New Journal of Physics **16(7), 075014**. DOI **10.1088/1367-2630/16/7/075014**. [vérifié]
9. **Mannix P.M., Ponty Y., Marcotte F. (2022).** *Systematic Route to Subcritical Dynamo Branches.* PRL **129(2), 024502** (Editor's Suggestion). DOI **10.1103/PhysRevLett.129.024502** ; arXiv:2112.11376. Optimisation non linéaire d'une perturbation d'amplitude finie qui identifie les **branches dynamo sous-critiques** et leurs perturbations critiques sans connaître le mécanisme d'amplification (approche adjointe ou d'optimisation). [vérifié]
10. **Ponty Y., Politano H., Pouquet A. (2025).** *Intermittency assessed through a model of kurtosis–skewness relation in MHD in fast dynamo regimes.* Journal of Plasma Physics **91(2), E69**. DOI **10.1017/S0022377825000169**.
    Chiffres (abstract HAL) : DNS avec forçages Taylor–Green et ABC jusqu'à **3,14 × 10⁵ temps de retournement** ; lois K(S) ∼ S^α avec 0,2 ≲ α ≲ 3,0 ; α ≈ 2,5 avec le modèle de She–Lévêque. Utile comme **métrique statistique d'ordre élevé** pour valider des champs générés. [vérifié ; précision : la plage 0,2 ≲ α ≲ 3,0 porte sur la dissipation]
11. **Pouquet A., Marino R., Politano H., Ponty Y., Rosenberg D. (2025).** *Intermittency in fluid and magnetohydrodynamics (MHD) turbulence analyzed through the prism of moment scaling predictions of multifractal models.* Nonlinear Processes in Geophysics **32, 243–259**. DOI **10.5194/npg-32-243-2025**. [vérifié ; numéro 3]
12. **Bousquet R., Ponty Y., Botez V., Plihon N., Nore C. (2026)**, PRFluids **11, 063703**, voir §4.2 n°3. Ponty le classe parmi ses « 5 Publications significatives » (CV 2026). [vérifié]
- Également : Ponty Y. (2008), *Course 6 Numerical modeling of liquid metal dynamo experiments*, Les Houches, pp. 359–382, DOI 10.1016/S0924-8099(08)80010-8 (Crossref) ; Ponty, Politano, Pinton (2004), *Simulation of Induction at Low Magnetic Prandtl Number*, PRL **92, 144503**, DOI 10.1103/PhysRevLett.92.144503 ; Ponty et al. (2008), *Linear and non-linear features of the Taylor-Green dynamo*, C. R. Physique **9, 749–756**, DOI 10.1016/j.crhy.2008.07.007. [vérifié : 3 références]
- **ML / IA** : aucune publication de Ponty sur l'apprentissage automatique n'a été trouvée (HAL, Crossref, arXiv). Ses compétences proches de l'offre sont l'optimisation non linéaire et le contrôle optimal (Mannix 2022, mot-clé « Contrôle Optimale »), le HPC (Kokkos), les statistiques d'intermittence et les codes pseudo-spectraux avec pénalisation. [vérifié : arXiv `au:Ponty_Y` avec `abs:learning` ou `abs:neural` → 0 ; HAL idem → 0]

---

## 6. Matrice des compétences (synthèse pour les rédacteurs) [revu : Nore complétée (CPC 2025, thèse Quattromini)]

| Compétence requise par l'offre | Cheng | Lucor | Nore | Ponty |
|---|---|---|---|---|
| Diffusion et génératif conditionnel | Zhuang 2025 ; Yu 2026 GMD ; VQ-VAE 2023 ; IEnKF-G 2026 (préprint) | (thèse Achard, génératif, en cours) | – | – |
| Espace latent, ROM, interprétabilité | GLA 2022 ; LDA ; Koopman (ICLR 2025, 2026) | AE/VAE vs POD (CPC 2025) ; AE polynomiaux (préprint 2026) ; ROM LES | AE/VAE vs POD (CPC 2025, co-autrice) ; POD de VKS (PoF 2024, MHD 2025) ; Galerkin DQVU (2026) | DQVU (2026) |
| Contraintes physiques dans les pertes | MSPCNN 2024 ; DSOVT 2025 ; LBM Nat Commun 2026 | PINNs pour Rayleigh–Bénard (JCP 2022, ICHMT 2025) ; TBNN avec invariances | – | – |
| Assimilation de données | TorchDA ; VIVID ; revue JAS 2023 | revue JAS 2023 ; thèse de Cheng (covariances) | co-direction de la thèse Quattromini (GNN, DA, 2024) | – |
| UQ | revue JAS 2023 | gPC (SISC 2004, JFM 2007) ; prédiction conforme (JMLMC 2025) | – | – |
| Données MHD et dynamo 3D | – | (co-auteur VKS 2024, 2025) | SFEMaNS : VKS, précession/DRESDYN, Taylor–Couette | LATU (pseudo-spectral + pénalisation) ; Taylor–Green, ABC, Roberts |
| Physique des inversions et événements rares | – | – | inversions VKS (2026) et Taylor–Couette (2012) | on-off (2008), sous-critique (2007, 2022) |
| Métriques physiques | – | – | transferts d'énergie locaux (Creff 2024) | kurtosis–skewness, intermittence (2025) |

---

## 7. Pistes de sujets de thèse (intersection des 4 encadrants)

*Ce sont des propositions de rédaction. Les verrous et risques sont déduits des sources citées ; ils ne sont pas énoncés tels quels par les encadrants.*

*Vérification : les pistes sont des propositions et ne se vérifient pas comme des faits. Les références et chiffres qu'elles citent (Re = 1594, Rm = 531, μ_r = 16, 2000 snapshots, fenêtre « étroite » en Poincaré, 3,14×10⁵ temps de retournement, FunDiff = Wang et al. 2026 cité dans l'offre 2027) renvoient à des entrées vérifiées ci-dessus. [vérifié]*

### Piste A : Générateur conditionnel de champs MHD 3D paramétriques dans un espace latent structuré physiquement
- **Énoncé** : apprendre p(u, H | Re, Rm, μ_r, asymétrie de forçage) pour VKS par une diffusion latente ou un flow matching latent. L'autoencodeur est contraint par les symétries (Rπ, équivariance latent ↔ physique), régressé sur les paramètres et éventuellement aligné sur les modes POD.
- **Verrou** : généraliser hors des quelques points (Re, Rm, μ) simulés ; préserver ∇·(μ_r H) = 0 et ∇·u = 0 après décodage ; préserver les symétries ; représentation Fourier × éléments finis non structurés.
- **Prolonge** : Bousquet, Nore, Lucor 2025 (CPC) ; Bousquet et al. 2024 (PoF) ; stage MilaDy 2026 (régression latente, contrastif) ; Zhuang, Cheng, Duraisamy 2025 (diffusion conditionnelle) ; Zhou et al. 2024 (MSPCNN) ; Zhou et al. 2026 (préprint, surrogates latents « physics-aware » pour la calibration).
- **Données** : SFEMaNS VKS (Nore et al. 2016, 2018 : balayages en μ et Re ; Creff et al. 2024 : turbines acier ou fer doux) ; LATU (Kreuzahler et al. 2017, μ_r de 1 à 16).
- **Risques** : peu de points paramétriques, car chaque DNS MHD coûte cher (le résumé ANR parle de DNS « très coûteuses ») ; volumétrie 3D ; données non publiques (accès via le consortium) ; tension reconstruction/régularisation déjà observée pour les VAE (Bousquet 2025).

### Piste B : Génération et prévision probabiliste d'inversions magnétiques et d'événements rares, guidées par modèle réduit
- **Énoncé** : modèle génératif temporel (diffusion autorégressive ou conditionnée sur l'état) produisant des ensembles de trajectoires de champs au voisinage des inversions. Il est guidé à l'échantillonnage (« universal guidance ») par le modèle DQVU ou par des contraintes de Galerkin, pour estimer probabilités, temps d'attente et phases précurseur / inversion / rebond.
- **Verrou** : rareté des événements (peu d'inversions par simulation), statistiques à queue lourde (lois de puissance des phases « on »), cohérence entre champ 3D généré et dynamique réduite, calibration probabiliste.
- **Prolonge** : Bousquet et al. 2026 (PRFluids : DQVU, POD sur 2000 snapshots, identification sous contraintes) ; Alexakis & Ponty 2008 (on-off) ; Ponty et al. 2007 et Mannix et al. 2022 (sous-criticité) ; Nore et al. 2012 (inversions apériodiques en Taylor–Couette) ; Yu et al. 2026 GMD (ensembles par diffusion, score HR) ; Cheng X. et al., ICLR 2025 (invariance de la mesure).
- **Données** : simulations d'inversions LATU et SFEMaNS de Bousquet 2026 (Re = 1594, Rm = 531, μ_r = 16, couche conductrice externe) ; DNS ABC et Taylor–Green de Ponty pour l'intermittence.
- **Risques** : longues séries temporelles nécessaires (coût) ; le modèle DQVU ne reproduit qu'imparfaitement la distribution de Q (Bousquet 2026) ; les métriques d'événements rares sont difficiles à valider statistiquement.

### Piste C : Assimilation de données latente avec a priori génératif pour la reconstruction de dynamos à partir de mesures éparses
- **Énoncé** : reconstruire des états 3D (u, H) à partir d'observations éparses synthétiques, de type sondes magnétiques simulées, en combinant un a priori génératif (diffusion conditionnelle) et une assimilation variationnelle ou d'ensemble latente (GLA, TorchDA, IEnKF-G).
- **Verrou** : a posteriori multimodal (polarité ± du dipôle, d'où des a posteriori non gaussiens), opérateur d'observation non linéaire, dimension, consistance physique de l'analyse.
- **Prolonge** : Cheng et al. 2022 (GLA) ; Cheng et al. 2024 (VIVID) ; Cheng et al. 2025 (TorchDA, cité par l'ANR) ; Bocquet, Finn, Cheng 2026 (IEnKF-G) ; Zhang et al. 2026 (benchmark Koopman-LDA) ; Cheng et al. 2023 (revue avec Lucor) ; Jaber et al. 2025 (couverture conforme).
- **Données** : sorties SFEMaNS et LATU sous-échantillonnées ; benchmarks intermédiaires Lorenz et shallow water (déjà dans TorchDA).
- **Risques** : pas de données expérimentales VKS ou DRESDYN identifiées comme accessibles (non vérifié) ; il faudrait sans doute des observations synthétiques ; coût de l'échantillonnage par diffusion dans une boucle d'assimilation.

### Piste D : Surrogate génératif paramétrique pour l'exploration de DRESDYN (précession)
- **Énoncé** : générer des champs de vitesse moyens ou fluctuants conditionnés par le nombre de Poincaré, Re et les propriétés de paroi, puis estimer Rm_c et la symétrie du mode dominant. On peut le faire par un solveur cinématique (SFEMaNS MXW) appliqué aux champs générés, ou par une tête de prédiction. Le cadre est une optimisation bayésienne robuste sous incertitude.
- **Verrou** : la fenêtre en Poincaré où la dynamo est probable est « étroite » (Botez 2026) ; transitions brusques entre états hydrodynamiques ; forte sensibilité de Rm_c aux conditions électromagnétiques (pseudo-vide ou vide réel, parois conductrices ou perméables).
- **Prolonge** : Botez et al. 2026 (PRFluids 083701) ; Nore et al. 2011 (PRE) ; Cappanera et al. 2016 (PRE) ; Stefani et al. 2015 ; Giesecke et al. 2018 ; Zhou, Wang, Lucor, Sauret 2026 (RESS, optimisation bayésienne robuste) ; Zhou et al. 2026 (préprint, calibration variationnelle latente).
- **Données** : simulations hydrodynamiques de précession et champs moyennés de Botez et al. (SFEMaNS, avec HZDR). L'objectif (ii) de l'ANR vise explicitement des « ROMs paramétriques » pour DRESDYN.
- **Risques** : peu de configurations simulées ; propagation de l'erreur du générateur dans un problème aux valeurs propres sensible ; dépendance au calendrier DRESDYN (le résumé ANR parle d'une expérience « en cours » et le postdoc d'un succès « uncertain »).

### Piste E : Contraintes dures dans les modèles génératifs sur maillages hybrides Fourier–éléments finis
- **Énoncé** : formuler la diffusion ou le flow matching dans l'espace des fonctions (de type FunDiff) ou sur la représentation SFEMaNS (modes m × EF méridiens), en imposant exactement ∇·B = 0 (potentiels vecteur ou décomposition poloïdale–toroïdale), les conditions d'interface aux sauts de μ et les conditions de vide, et en contrôlant le bilan d'énergie (projection à l'échantillonnage ou perte).
- **Verrou** : maillages non structurés, discontinuités de μ (conditions H×n et μH·n), zones pénalisées (turbines) ; compromis entre contrainte dure et qualité d'échantillon.
- **Prolonge** : Guermond, Nore et al. 2007, 2009, 2011 (JCP : pénalisation intérieure, perméabilité discontinue) ; Giesecke et al. 2012 (rôle des conditions aux limites) ; Cheng et al. 2025 (revue sur les maillages non structurés) ; Xue et al. 2026 (Nat Commun : contraintes de moments, invariance à la discrétisation) ; Lucor et al. 2022 (relaxation de l'incompressibilité dans les PINNs).
- **Données** : sorties natives SFEMaNS ; validation préalable sur EDP simples, comme le demande l'offre.
- **Risques** : coût d'implémentation sur maillages non structurés ; les contraintes dures peuvent dégrader la diversité des échantillons ; intégration logicielle avec un code Fortran (la recherche web liste des pages de documentation de sources `.f90`, par exemple `main_8f90_source.html` ; non ouvertes).

### Piste F (transversale) : Bancs d'essai et métriques physiques pour générateurs MHD, de Taylor–Green et ABC à VKS
- **Énoncé** : construire une échelle de benchmarks (EDP simples, puis dynamos périodiques Taylor–Green, ABC et Roberts sur les codes de Ponty, puis VKS et précession sur SFEMaNS et LATU) et une batterie de métriques : spectres (dont Kazantsev k^(3/2)), hélicité, divergence, topologie, transferts d'énergie locaux (Creff 2024), relations kurtosis–skewness (Ponty 2025), couverture conforme (Jaber 2025), score HR (Yu 2026).
- **Verrou** : définir des métriques discriminantes et invariantes au maillage ; coût des diagnostics 3D.
- **Prolonge** : Ponty et al. 2005, 2007 ; Ponty & Plunian 2011 ; Ponty et al. 2025 (JPP) ; Creff et al. 2024 ; stage 2026 (métriques identiques).
- **Données** : DNS périodiques en boîte cartésienne, plus simples à apprendre ; séries longues jusqu'à 3,14×10⁵ temps de retournement (Ponty 2025).
- **Risques** : sujet plus méthodologique, avec un risque d'apport « benchmark » jugé incrémental ; il vaut mieux l'adosser à A ou B.

---

## 8. Sources principales ouvertes

- ANR, page FR : https://anr.fr/Projet-ANR-25-CE51-0077
- ANR, page EN : https://anr.fr/en/funded-projects-and-impact/funded-projects/project/funded/project/b2d9d3668f92a3b9fbbf7866072501ef-8f0bea4141/?tx_anrprojects_funded%5Bcontroller%5D=Funded&cHash=f7b87490b7ffc2a2a9c7dc94387c163f
- Offre de stage 2027 : https://scheng2024.github.io/stage_milady_2027.pdf
- Stage 2026 : https://stages.phys.ens.psl.eu/OffresPDF/Offre-30818.pdf
- Postdoc LISN : https://perso.lisn.upsaclay.fr/lucor/pdf/postdoc_milady_LISN.pdf
- Stage M2 Nore–Lucor : https://perso.lisn.upsaclay.fr/lucor/pdf/M2Stage_Nore_Lucor.pdf
- Annonce ml-news : https://groups.google.com/g/ml-news/c/lr8uwyCAl_M
- Cheng : https://scheng2024.github.io/ ; /research/ ; /publications/ ; /cv/ ; /people/ ; /opportunities/
- Lucor : https://perso.lisn.upsaclay.fr/lucor/ ; /publications.html ; /people.html ; /opportunities.html
- Ponty : https://c2pu.oca.eu/images/LAGRANGE/pages_perso/ponty/pdf/cv-2pages-2026.pdf ; https://c2pu.oca.eu/images/LAGRANGE/pages_perso/ponty/pdf/cv-Yannick-Ponty.pdf
- SFEMaNS : https://people.tamu.edu/~guermond/SFEMaNS/html/doc_intro.html
- Bousquet et al. 2026, texte intégral : https://perso.ens-lyon.fr/nicolas.plihon/Publis/Bousquet_PRF_11.pdf
- Kreuzahler et al. 2017, texte arXiv : https://arxiv.org/pdf/1706.00260v4
- GMD 2026 : https://gmd.copernicus.org/articles/19/1027/2026/
- Nature Communications 2026 : https://www.nature.com/articles/s41467-026-75730-1
- Magnetohydrodynamics 2025 : https://mhd.sal.lv/contents/2025/1/MG.61.1.2.R.html
- Physics of Fluids 2024 : https://pubs.aip.org/aip/pof/article/36/10/105133/3317096
- API HAL : https://api.archives-ouvertes.fr/search/ (requêtes par halId_s, authFullName_s, anrProjectReference_s, director_s)
- API Crossref : https://api.crossref.org/works (requêtes par DOI ou par titre et auteur)
- API arXiv : https://export.arxiv.org/api/query (requêtes par id_list, ti:, au:)
- Ajoutées pendant la contre-vérification : API OpenAlex (`api.openalex.org`, abstracts APS) ; PMLR v267 (https://proceedings.mlr.press/v267/) ; API OpenReview (statut ICLR) ; code source des pages Opportunities et d'accueil de Lucor ; texte arXiv de Kreuzahler 2017 (v4).

---

## 9. Non confirmé

*Points restés ouverts après la contre-vérification du 6 novembre 2026. Les points résolus pendant cette vérification sont listés à la fin.*

- **Date de début et montant de MilaDy** [NON CONFIRMÉ : divergence entre sources, chacune vérifiée] : l'ANR indique 560 612 €, janvier 2026, 48 mois ; le CV de Ponty indique « 550k€ » et « 2026 (février) – 2030 » ; la page d'accueil de Cheng indique « 2025–2029 » et sa page Research « Start: 2026 ». Retenir les valeurs de l'ANR.
- **Suffixe « -02 »** [NON CONFIRMÉ] : « ANR-25-CE51-0077-02 » figure dans les remerciements de Bousquet 2026 et dans les métadonnées Crossref « funder » de Bousquet 2026 et de Botez 2026. C'est probablement un numéro de convention partenaire, mais le partenaire n'est pas identifié.
- **Nom du postdoc MilaDy à l'OCA** [NON CONFIRMÉ, mais probable] : le CV de Ponty écrit « Hiroshi Hiiro ». La notice HAL hal-05796131, financée par ANR-25-CE51-0077, a pour co-auteur « Hiroshi Horii », que HAL rattache à l'Observatoire de la Côte d'Azur et à l'Université Côte d'Azur. « Hiiro » est donc vraisemblablement une coquille du CV, mais aucune page de l'OCA ne le confirme.
- **Recrutement du postdoc LISN** [NON CONFIRMÉ] : identité non trouvée. L'annonce est désormais en commentaire dans la page de Lucor, ce qui suggère que le poste est pourvu ou l'offre close.
- **MaDICS** [NON CONFIRMÉ] : aucune page MaDICS mentionnant MilaDy (recherche web refaite le 6/11/2026).
- **Page de l'offre 2026 sur le site du LISN** [NON CONFIRMÉ] : page non ouverte. Le contenu est vérifié dans le PDF de l'ENS (Offre-30818), qui indique « in spring 2026 ».
- **Article de Botez, Bousquet, Nore au Journal of Computational Physics (2026, « In press, 559 »)** [NON CONFIRMÉ] : absent de Crossref (recherche par auteurs depuis 2025) et de HAL. Seule la version Magnetohydrodynamics 61 (2025) est confirmée.
- **Statut de Caroline Nore** : « Pr. UPS » dans le PDF du postdoc et « Pr. Caroline Nore » dans les offres de stage [vérifié dans ces documents] ; page institutionnelle non ouverte [NON CONFIRMÉ].
- **Chiffres de Lucor et al. 2022** (Ra = 2·10⁹, erreurs de 0,3 à 4 %, 1,6 % des données) [NON CONFIRMÉ dans la version JCP] : vérifiés seulement dans l'abstract du préprint arXiv:2103.03565.
- **Chiffres de Botez et al. 2026** (nombre de Poincaré, Rm_c) [NON CONFIRMÉ] : PDF inaccessible (anti-bot HAL, APS), aucun chiffre extrait. L'abstract est vérifié.
- **Crédit des en-têtes de SFEMaNS à Guermond et Nore** [NON CONFIRMÉ] : en-têtes non vus (la page main.f90 de la documentation ne les montre pas). Le rattachement du code à l'équipe de Nore est en revanche vérifié : « our massively parallel research code SFEMaNS » (offre M2 Nore–Lucor) et articles JCP 2007, 2009 et 2011.
- **Disponibilité des données expérimentales VKS ou DRESDYN pour l'assimilation** [NON CONFIRMÉ].

**Points résolus pendant la contre-vérification** :
- Rattachement de Nore à l'équipe COMET du LISN : confirmé par les structures HAL des trois articles MilaDy et de CPC 2025 [vérifié].
- Cappanera et al. 2016 (PRE 93, 043113) : résumé lu via OpenAlex et ajouté au §4.2 n°8 [vérifié].
- Ponty & Plunian 2011 : l'abstract arXiv:2004.11028 porte la référence PRL 106, 154502 (2011) ; contenu conservé [vérifié].
- Absence de publication de Ponty en apprentissage automatique : recherches arXiv et HAL refaites, 0 résultat. Ne pas lui attribuer de travaux en IA [vérifié].
