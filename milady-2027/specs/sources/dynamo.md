# Physique des dynamos et modèles jouets : base de faits vérifiés

## Bilan de vérification (contre-vérification indépendante du 2026-11-06)

- **Méthode** : toutes les références ont été recoupées avec Crossref (plus de 40 DOI) et l'API arXiv (25 identifiants). Les chiffres ont été relus dans le texte intégral : PDF arXiv des articles cités, plus les PDF auteurs ou éditeurs de VKS 2007 et 2009, Pétrélis & Fauve 2008, Pétrélis 2009, Gissinger 2010, Boisson 2012, Miralles 2013, Nore 2016 et 2018, Karlsruhe 2008 et du diaporama Ponty 2016. Les pages web SFEMaNS, GHOST, Dedalus, The Well, JETP et Math-Net.Ru ont aussi été ouvertes.
- **Gissinger 2012** : équations (1)–(3), points fixes M± et N±, valeurs propres de O et polynômes (13)–(14) recalculés numériquement : tous exacts. Le script RK4 de l'équipe, relancé, redonne les mêmes résultats (74 renversements à µ = 0,119, etc.).
- **Décompte** : 103 marques [vérifié] ; 5 entrées corrigées ; 4 entrées [NON CONFIRMÉ], regroupées au §9.
- **Corrections importantes** :
  1. Kaiser & Tilgner : le fichier disait qu'ils jugent la preuve de Cowling « incomplète ». En réalité, ils signalent que la preuve pour le système couplé (méridien ↔ azimutal, cas cinématique) manquait et **la fournissent**. Référence ajoutée : SIAM J. Appl. Math. 74(2), 571–597 (2014).
  2. Yin et al. (pseudo-vide) : 2021 → **2022**, J. Comput. Phys. **451**, 110866.
  3. Ponomarenko 1973 : pp. 775–779 → **775–778** (Crossref), avec titre et DOI 10.1007/BF00853190.
  4. Rädler & Brandenburg : « volume non revérifié » → PRE **67**, 026401 (2003), confirmé.
  5. Alexakis 2011 : « non relu » → résultat A = B ≃ 2C/5, γ ≃ 0,12 confirmé. **Piège ajouté** : son R_M vaut √3/η pour l'ABC 1:1:1.
- **Ajouts et précisions** : Pouquet 2019 (ESS **6**(3), 351–369, DOI). Riga : première tentative datée de 1986 ou 1987 selon la source ; 2×100 kW confirmé par Gailitis 2018. Gissinger : convergence vers O pour toute CI seulement si µ < 0,063. JHTDB : 1024 pas de temps confirmés (Lemoine 2022), mais forçage décrit différemment selon la source. VKS : 150 l ou environ 160 L de sodium.
- **Aucune erreur trouvée** dans les autres chiffres : Riga, Karlsruhe, VKS, Nore 2016 et 2018, Kreuzahler, Ponty 2005 et 2007, Bouya & Dormy, Archontis, Tobias, Krstulovic et The Well. Les coquilles signalées dans Gissinger 2012 (« µ > 1+ν », Γ = 0,1 en Fig. 11) sont bien dans l'arXiv v2.
- **Toujours non confirmé** (§9) : code « CUBBY » ; paramètres secondaires JHTDB (pages officielles en 503) ; débit Riga 0,67 m³/s ; lecture primaire de Galloway & Frisch (403) et valeur du taux de croissance maximal de l'ABC.

---

*Recherche effectuée le 2026-11-06 pour le dossier MilaDy (stage M2 CEREA/ENPC–LISN). Les faits ci-dessous ont été lus dans la source primaire (PDF arXiv, version éditeur ou HAL, page d'auteur), puis recoupés avec les métadonnées Crossref (api.crossref.org) pour les références bibliographiques.*

Conventions :
- **[src]** : URL réellement ouverte (texte intégral lu, sauf mention « abstract seul »).
- **⚠** : divergence entre sources ou coquille probable dans la source. Ne pas « corriger » sans le signaler.
- Les numéros d'équations et de figures renvoient à l'article cité.
- Tout ce qui n'a pas pu être vérifié se trouve dans la section finale 9 (« Non confirmé ») ; le §7 regroupe les divergences entre sources.
- **[vérifié]**, **[corrigé : ancien → nouveau]**, **[NON CONFIRMÉ]** : marques posées par le vérificateur indépendant (contre-vérification du 2026-11-06).

---

## 0. Chiffres clés (résumé)

| Grandeur | Valeur | Source |
|---|---|---|
| Pm du sodium | « about 10⁻⁵ » ; Pm = µ0σν = 0,82×10⁻⁵ à 120 °C (ν = 6,78×10⁻⁷ m²/s, ρ = 932 kg/m³, σ = 9,6×10⁶ S/m) | Monchaux 2009 ; Nore 2018 §2.1 [vérifié] |
| Riga, 1re auto-excitation | 11 nov. 1999, 2150 tr/min, 205 °C, taux de croissance p₂ = 0,0315 ± 0,0009 s⁻¹, f₂ = 1,326 Hz | Gailitis 2000 [vérifié ; date du 11 nov. 1999 confirmée par Gailitis 2008] |
| Karlsruhe, design | 52 générateurs de spin, R = 0,85 m, H = 0,71 m, a = 0,21 m ; Rm critique de conception < 10 ; V̇ = 115–143 m³/h | Müller 2008 ; Rädler & Brandenburg [vérifié] |
| VKS, seuil (2007) | Rm_c ≈ 31 (ajustement linéaire de ⟨B_y⟩, B_rms) ; R′m ≈ 35 (ajustement linéaire de ⟨B²⟩) ; ~40 G à 30 % au-dessus du seuil | Monchaux 2007 PRL [vérifié] |
| VKS, Re maximal | Re jusqu'à 5×10⁶ ; Rm maximal = 49 (120 °C) ; 300 kW de puissance moteur | Monchaux 2007 ; Berhanu 2007 [vérifié] |
| Modèle de Gissinger (renversements chaotiques) | µ = 0,119, ν = 0,1, Γ = 0,9 ; crise à µ_c ≈ 0,11928 | Gissinger 2012 EPJB [vérifié] |
| ABC 1:1:1, fenêtres dynamo | 8,9 < Rm < 17,5 (fermée) ; Rm > 27 (ouverte), avec Rm = 1/η | Archontis 2003, citant Galloway & Frisch 1984 [vérifié dans Archontis 2003 ; source primaire inaccessible] |
| Ponomarenko | Rm_c = 17,7 (instabilité convective, rayon pris comme échelle) | Gailitis & Freibergs 1976, cité par Gailitis 2008 [vérifié dans Gailitis 2008] |
| Taylor–Green, faible Pm | Rm_c = 30 (Pm = 1) → 226 (Pm = 0,3) → ≈ 200 (Pm = 0,2) → ≈ 150 en LES (10⁻² ≤ Pm ≤ 10⁻¹) | Ponty 2005 PRL [vérifié] |

---

## 1. Dynamos de laboratoire

### 1.1 Riga (Lettonie) : écoulement de type Ponomarenko

**Gailitis, Lielausis, Dement'ev, Platacis, Cifersons, Gerbeth, Gundrum, Stefani, Christen, Hänel, Will (2000).** « Detection of a flow induced magnetic field eigenmode in the Riga dynamo facility ». *Phys. Rev. Lett.* **84**, 4365–4368. DOI 10.1103/PhysRevLett.84.4365. arXiv:physics/9912026. [vérifié]
[src] https://arxiv.org/pdf/physics/9912026 ; métadonnées : https://api.crossref.org/works/10.1103/PhysRevLett.84.4365

- **Apport** : première détection d'un mode propre magnétique auto-excité dans une expérience de métal liquide. Campagne du 6 au 11 novembre 1999. Le mode croît lentement pendant environ 15 s et décroît à rotation légèrement réduite. Les taux de croissance et les fréquences mesurés concordent avec les prédictions numériques.
- **Géométrie (Fig. 1)** : D1 = 0,25 m (tube hélicoïdal central), D2 = 0,43 m (retour), D3 = 0,80 m (sodium au repos), L = 2,91 m. Vitesse dans le tube central « up to the order of 15 m/s ». Sodium total : 2 m³. Débit jusqu'à 0,6 m³/s, assuré par une hélice entraînée par **deux moteurs de 55 kW**.
- **Physique** : seul le mode azimutal m = 1 joue un rôle aux Rm accessibles. On attend un champ alternatif de basse fréquence, en rotation lente autour de l'axe.
- **Conductivité** : σ ≈ 10⁷ (Ωm)⁻¹ à 100 °C, donc µ0σ ≈ 10 s/m². Pour Rm_c = 10, il faudrait L·v = 1 m²/s.
- **Chiffres de l'auto-excitation** (2150 tr/min, T = 205 °C, ajustement à 2 modes sur 1500 points pris toutes les 10 ms) :
  - mode amplifié : A₁ = 0,476 mT, p₁ = −0,0012 ± 0,0003 s⁻¹, f₁ = 0,995 Hz ;
  - mode auto-excité : **A₂ = 0,133 mT, p₂ = 0,0315 ± 0,0009 s⁻¹, f₂ = 1,326 Hz**.
  - À 1980 tr/min : f = 1,1 s⁻¹ et taux de décroissance p = −0,3 s⁻¹.
  - L'installation pourrait dépasser le seuil d'environ 20 % en Rm.

**Gailitis et al. (2001).** « Magnetic field saturation in the Riga dynamo experiment ». *Phys. Rev. Lett.* **86**, 3024–3027. DOI 10.1103/PhysRevLett.86.3024. arXiv:physics/0010047. [vérifié]
[src] https://arxiv.org/pdf/physics/0010047

- **Apport** : 2e campagne (22–25 juillet 2000), à plus basse température (σ plus grande). C'est la première étude du régime saturé à Riga.
- **Croissance spontanée** : sans excitation externe, le champ croît exponentiellement vers t = 130 s, à 1920 min⁻¹. La saturation intervient vers t = 240 s.
- **Accord avec les prédictions** : décalage d'environ 10 % sur le taux de croissance et d'environ 5 % sur la fréquence. Les parois en acier, non modélisées, augmentent Rm_c d'environ 8 % selon des calculs 1D.
- **État marginal** : à 157 °C et 1840 min⁻¹, un mode décroît « extrêmement lentement ».
- **Saturation** :
  - B_r atteint 7 mT ; B_z est estimé à environ 30 mT dans la dynamo.
  - Lois (Ωc − 1840 min⁻¹)^β avec β = 0,417 (H2), 0,275 (H4), 0,216 (H6), 0,205 (bobine).
  - Pertes ohmiques estimées à environ 10 kW. La puissance moteur hors dynamo suit Ω³.

**Gailitis, Gerbeth, Gundrum, Lielausis, Platacis, Stefani (2008).** « History and results of the Riga dynamo experiments ». *C. R. Physique* **9**, 721–728. DOI 10.1016/j.crhy.2008.07.004. arXiv:0807.0305. [vérifié]
[src] https://arxiv.org/pdf/0807.0305

- **Historique** : première tentative en 1986 avec un « labyrinthe hélicoïdal », sans auto-excitation observée [vérifié ; ⚠ le PRL 2000 et Gailitis et al. 2018 (J. Plasma Phys. 84, 735840301, arXiv:1801.01749) datent cette tentative de 1987]. Installation à Salaspils entre 1995 et 1999. Huit campagnes au total, dont février–mars 2005 et juillet 2007.
- **Champs mesurés** : en 2005, B passe de 27 mT à 2000 tr/min à 120 mT à 2500 tr/min au capteur haut.
- ⚠ Fig. 1 de cet article : « Two 100 kW motors ». Le PRL 2000 indique « two 55 kW motors » (motorisation probablement changée entre les deux). [vérifié ; Gailitis et al. 2018 écrit « two DC-motors, which can be driven up to 200 kW »]

### 1.2 Karlsruhe : dynamo à deux échelles (Roberts–Busse)

**Stieglitz & Müller (2001).** « Experimental demonstration of a homogeneous two-scale dynamo ». *Phys. Fluids* **13**(3), 561–564. DOI 10.1063/1.1331315. [vérifié : métadonnées et résumé Crossref]
[src] métadonnées et résumé : https://api.crossref.org/works/10.1063/1.1331315 ; page éditeur https://pubs.aip.org/aip/pof/article/13/3/561/450962 (texte intégral payant, non lu)

- **Apport** : réalisation expérimentale du concept de Busse (1975), qui reprend l'écoulement périodique de G.O. Roberts avec une seconde échelle pour un domaine fini. Le résumé confirme l'action dynamo, sans donner de chiffres.

**Müller, Stieglitz, Busse, Tilgner (2008).** « The Karlsruhe two-scale dynamo experiment ». *C. R. Physique* **9**, 729–740. DOI 10.1016/j.crhy.2008.07.005. [vérifié]
[src] https://comptes-rendus.academie-sciences.fr/physique/item/10.1016/j.crhy.2008.07.005.pdf

- **Critère de Busse** : Re_mC·Re_mH > 4π²(H/a)[1 + 1,149(H/R)²], avec Re_mH = u_H a/λ et Re_mC = u_C a/λ.
- **Optimisation** : Rm critique « less than 10 », soit V̇_C = V̇_H = 115–143 m³/h. Paramètres : Z = 52 générateurs de vortex, a = 0,21 m, h = 0,19 m, r = 0,055 m, R/H = 1,21, χ = 3,7 tours.
- **Matériaux et fonctionnement** : module en inox ; 120 °C < T < 125 °C ; λ ≈ 0,1 m²/s. Trois boucles indépendantes, chacune avec une pompe MHD de débit jusqu'à 150 m³/h (deux boucles hélicoïdales, une axiale). Champ ambiant inférieur à 0,5 G.
- **Résultats** :
  - champ saturé stationnaire de type dipôle ; deux états dipolaires quasi équivalents (bifurcation imparfaite) ;
  - à V̇ = 115 m³/h : B_Y moyen = 260 G, RMS = 0,58 G, soit environ 0,2 % de fluctuations ;
  - part de la dissipation Joule dans la dissipation totale proche de 50 % aux plus forts débits ;
  - vitesse axiale réduite d'environ 17 % au-delà de V̇_H ≈ 106 m³/h.

**Rädler & Brandenburg (2003)**, théorie du champ moyen pour le module de Karlsruhe. arXiv:physics/0208023 ; *Phys. Rev. E* **67**(2), 026401 (2003), DOI 10.1103/PhysRevE.67.026401. [corrigé : « publication annoncée, volume non revérifié » → référence confirmée par Crossref et par le journal-ref arXiv]
[src] https://arxiv.org/pdf/physics/0208023

- **Dimensions** : R = 0,85 m, H = 0,71 m, a = 0,21 m, h = 0,19 m, r₁/a = 0,25, r₂/a = 0,5, η = 0,1 m²/s.
- **Historique** : premier fonctionnement réussi en **décembre 1999**, « quelques semaines » après Riga.
- **Lien avec Roberts** : l'écoulement de Roberts est périodique en x et y (période 2a) et indépendant de z.

### 1.3 VKS (von Kármán Sodium, CEA Cadarache)

**Monchaux, Berhanu, Bourgoin, Moulin, Odier, Pinton, Volk, Fauve, Mordant, Pétrélis, Chiffaudel, Daviaud, Dubrulle, Gasquet, Marié, Ravelet (2007).** « Generation of a magnetic field by dynamo action in a turbulent flow of liquid sodium ». *Phys. Rev. Lett.* **98**, 044502. DOI 10.1103/PhysRevLett.98.044502. arXiv:physics/0701075 (16 auteurs). [vérifié]
[src] https://www.phys.ens.fr/~petrelis/pdf/P1PRL_98_044502.pdf

- **Apport** : première dynamo dans un écoulement fortement turbulent, où les fluctuations et l'écoulement moyen ont des énergies comparables.
- **Géométrie** :
  - disques de rayon 154,5 mm, distants de 371 mm, dans un cylindre de diamètre intérieur 2R = 412 mm et de longueur 524 mm ;
  - 8 pales courbes de hauteur 41,2 mm ;
  - jusqu'à 26 Hz, avec 300 kW de puissance moteur disponible ;
  - huile à 110–160 °C ;
  - sodium au repos dans une enveloppe de diamètre intérieur 578 mm ; volume total de sodium : 150 l ;
  - anneau dans le plan médian, d'épaisseur 5 mm (diamètre intérieur, voir ⚠ ci-dessous).
- **Nombres sans dimension** : Re = K R² Ω/ν avec K ≈ 0,6 (efficacité des turbines) ; Re jusqu'à 5×10⁶ ; Rm = K µ0 σ R² Ω ≈ 49 au maximum (120 °C).
- **Seuil** :
  - avec disques en **inox** : pas de dynamo jusqu'à 26 Hz ;
  - avec **disques en fer doux** : dynamo au-dessus de Rm ≈ 30 ;
  - ajustements linéaires de ⟨B_y⟩ ou B_i,rms : **Rm_c ≈ 31** ;
  - ajustement linéaire de ⟨B²⟩ : **R′m ≈ 35** (valeur pertinente pour une fourche supercritique) ;
  - pas d'hystérésis ;
  - seuils cinématiques fondés sur l'écoulement moyen : Rm_c ≈ 43 à 150 selon les CL.
- **Champ** :
  - B_y (tangent au cylindre) passe d'une valeur proche du champ terrestre à environ 40 G quand Rm passe de 19 à 40 ;
  - fluctuations de 3 à 8 G à 30 % au-dessus du seuil ;
  - la loi d'échelle ⟨B²⟩ ∝ (ρ/µ0σ²R²)(Rm − Rm_c)/Rm_c regroupe les données à différentes températures.
- **Puissance** : à 30 % au-dessus du seuil, la dissipation ohmique représente un surcoût de 15–20 % sur une puissance d'entraînement d'environ 100 kW.
- **Fer** : seuil environ 20 % plus haut lors du premier run (aimantation), puis reproductible. L'axisymétrie exclut une dynamo de type Herzenberg (rotor).
- ⚠ Anneau : « inner diameter 175 mm » dans le PRL 2007, mais « inner radius 175 mm » dans Berhanu 2007 et « inner diameter of 350 mm » dans Monchaux 2009. Le PRL contient probablement une coquille. [vérifié dans les trois textes]

**Berhanu, Monchaux, Fauve, Mordant, Pétrélis, Chiffaudel, Daviaud, Dubrulle, Marié, Ravelet, Bourgoin, Odier, Pinton, Volk (2007).** « Magnetic field reversals in an experimental turbulent dynamo ». *EPL* **77**, 59001. DOI 10.1209/0295-5075/77/59001. arXiv:physics/0701076. [vérifié]
[src] https://arxiv.org/pdf/physics/0701076

- **Apport** : premiers renversements B → −B observés en laboratoire. Hiérarchie de temps semblable à celle du champ terrestre. Des excursions sont aussi observées. Renversements et excursions coïncident avec des minima de la puissance mécanique.
- **Paramètres** :
  - sodium : σ = 10⁷ Ω⁻¹m⁻¹, ρ = 930 kg/m³, fusion à 98 °C ; environ 160 L (⚠ le PRL 2007 donne 150 l) ;
  - cuve en cuivre de rayon 289 mm et de longueur 604 mm ; cylindre interne R = 206 mm ;
  - Re_i = 2πK R² F_i/ν ≤ 5×10⁶ ; Rm_i = 2πK µ0 σ R² F_i jusqu'à 49 à 120 °C.
- **Seuil en contra-rotation exacte** : dynamo pour **F > environ 17 Hz (Rm = 31)**.
- **Régime de renversements (Fig. 3)** :
  - F1 = 16 Hz, F2 = 22 Hz, T = 123 °C ;
  - ⟨T+⟩ = 120 s, ⟨T−⟩ = 50 s ; durée d'un renversement τ ≈ 5 s, contre un temps intégral d'environ 0,05 s et un temps ohmique τη ≈ 0,4 s ;
  - suivi pendant 45 min, soit 54 000 temps de forçage ; fluctuations rms d'environ 20 % ;
  - décroissance exponentielle à environ 0,8 s⁻¹ avant le renversement, puis dépassement (overshoot) après ;
  - chute de puissance de plus de 20 % (20 kW sur 90 kW) ;
  - Rm1 = Rm2 = 42,5 correspond à 22–22 Hz.

**Monchaux et al. (2009).** « The von Kármán Sodium experiment: Turbulent dynamical dynamos ». *Phys. Fluids* **21**, 035108. DOI 10.1063/1.3085724. HAL hal-00492266 (pas d'arXiv trouvé). [vérifié ; 15 auteurs selon Crossref : Monchaux, Berhanu, Aumaître, Chiffaudel, Daviaud, Dubrulle, Ravelet, Fauve, Mordant, Pétrélis, Bourgoin, Odier, Pinton, Plihon, Volk]
[src] https://www.phys.ens.fr/~petrelis/pdf/Monchaux2009_PoF.pdf

- **Apport** : bifurcation supercritique, mode neutre principalement **axisymétrique** en forçage Rπ-symétrique. Régimes dynamiques (renversements, oscillations) en forçage asymétrique. Dynamique de basse dimension malgré la turbulence.
- **Définitions** : Re = K 2π R² F/ν et Rm = K µ0 σ 2π R² F, avec F = (F1 + F2)/2 et K = 0,6. Moteurs jusqu'à environ 27 Hz, 300 kW.
- **Turbines** en fer doux pur, de perméabilité relative µr ≈ 100.
- **Seuils** :
  - +w : F = 16 Hz, soit Rm_c = 32 ; −w/o : F = 18 Hz, soit Rm_c ≈ 43 ;
  - puissance consommée de 40 à 150 kW selon la configuration ;
  - K₊ = 0,6 ou K₋ = 0,7 selon le sens des pales ;
  - meilleur ajustement : B_θ ∝ (Rm − 32)^0,77.
- **Pm** : « about 10⁻⁵ for sodium ».

**Boisson, Aumaître, Bonnefoy, Bourgoin, Daviaud, Dubrulle, Odier, Pinton, Plihon, Verhille (2012).** « Symmetry and couplings in stationary Von Kármán sodium dynamos ». *New J. Phys.* **14**, 013044. DOI 10.1088/1367-2630/14/1/013044. [vérifié]
[src] https://perso.ens-lyon.fr/nicolas.plihon/Publis/Boisson_NJP_14_013044.pdf (résumé et début lus)

- **Dispositif** : 40 sondes 3D ; configurations fer/fer et fer/inox.
- **Résultats** :
  - (i) pas de dynamo sans au moins une turbine en fer tournant à plus de 15 Hz ;
  - (ii) dynamo dipolaire, essentiellement axisymétrique ;
  - (iii) dépendance à l'écoulement entre les turbines.
- **Interprétation** : superposition de deux dynamos à une turbine, couplées non linéairement. La forme normale ressemble au modèle de Pétrélis et al. 2009.

**Miralles, Bonnefoy, Bourgoin, Odier, Pinton, Plihon, Verhille, Boisson, Daviaud, Dubrulle (2013).** « Dynamo threshold detection in the von Kármán sodium experiment ». *Phys. Rev. E* **88**, 013002. DOI 10.1103/PhysRevE.88.013002. [vérifié]
[src] https://perso.ensta-paris.fr/~boisson/papiers/PhysRevE.88.013002.pdf

- **Apport** : estimation du seuil sous le seuil, par ralentissement critique (relaxation après impulsions magnétiques) et par divergence de la susceptibilité.
- **Nouvelle définition** : Rm = µ0 σ 2π F R_imp R_o, avec R_imp = 154,5 mm et R_o = 289 mm. Elle diffère de l'ancienne définition à facteur K (note 1 de l'article), d'où des Rm_c numériquement différents.
- **Conditions** : Pm de l'ordre de 10⁻⁵, Re > 10⁶, fluctuations d'ordre 1, moteurs jusqu'à environ 25 Hz, 300 kW.
- **Seuils** : Rm_c ≃ 44 (fer/fer, pales courbes) ; Rm_c = 68 en sens « scooping ». D'autres configurations (Rm_c = 70, 60) apparaissent en Table I.

### 1.4 Simulations : rôle des turbines ferromagnétiques

**Giesecke, Stefani, Gerbeth (2010).** « Role of soft-iron impellers on the mode selection in the von Kármán–sodium dynamo experiment ». *Phys. Rev. Lett.* **104**, 044503. DOI 10.1103/PhysRevLett.104.044503. arXiv:0907.0123. [vérifié]
[src] https://arxiv.org/pdf/0907.0123v2

- **Méthode** : induction cinématique avec une distribution localisée de µr en forme de turbine, plus un petit effet α.
- **Résultats** :
  - le fer doux favorise le mode axisymétrique m = 0 ;
  - µr maximal = 60, en accord avec des mesures µr ≈ 65–70 sur une turbine de type VKS ;
  - la condition « champ tangentiel nul » aux couvercles, qui imite µr infini, n'est pas justifiée pour ces turbines ;
  - rappel : Rm_c ≈ 32 expérimental ; les prédictions axisymétriques antérieures donnaient m = 1.

**Nore, Castanon Quiroz, Cappanera, Guermond (2016).** « Direct numerical simulation of the axial dipolar dynamo in the Von Kármán Sodium experiment ». *EPL* **114**, 65002. DOI 10.1209/0295-5075/114/65002. [vérifié]
[src] https://www.math.uh.edu/~lcappan/PUBLICATIONS/Nore_castanon_cappanera_guermond_EPL_2016.pdf

- **Apport** : première DNS MHD non linéaire du VKS avec les turbines représentées (SFEMaNS, pseudo-pénalisation). Le seuil baisse quand µr des turbines augmente. Dipôle axial essentiellement axisymétrique, avec une composante azimutale concentrée dans les turbines.
- **Table 2 (Re = 500)** :

| µr^imp | Rm_c famille 0 | Rm_c famille 1 | Pm_c famille 0 | Pm_c famille 1 |
|---|---|---|---|---|
| 5 | 240 ± 5 | 147 ± 1 | ≈ 0,48 | ≈ 0,29 |
| 50 | 130 ± 2 | 138 ± 2 | ≈ 0,26 | ≈ 0,28 |
| 100 | 82 ± 2 | 144 ± 2 | ≈ 0,16 | ≈ 0,29 |

- µr effectif des turbines TM73 estimé à environ 65.

**Nore, Castanon Quiroz, Cappanera, Guermond (2018).** « Numerical simulation of the von Kármán sodium dynamo experiment ». *J. Fluid Mech.* **854**, 164–195. DOI 10.1017/jfm.2018.582. [vérifié]
[src] https://www.math.uh.edu/~lcappan/PUBLICATIONS/Nore_etal_VKS_JFM_2018.pdf

- **Données expérimentales VKS2 rappelées (§2.1)** :
  - R_cyl = 206 mm ; cuivre R_in = 289 mm, R_out = 330 mm ;
  - disques R_b = 155 mm, épaisseur 20 mm ; pales de 41 mm, épaisseur 5 mm, courbure 24° ; distance entre disques 370 mm (rapport d'aspect 1,8) ;
  - environ 150 l de sodium à 120 °C ; **Pm = µ0σν = 0,82×10⁻⁵** ;
  - dynamo observée pour **16 Hz ≤ f ≤ 22 Hz**, soit 6,3×10⁶ ≤ Re = 2πf R²_cyl/ν ≤ 8,7×10⁶ et **52 ≤ Rm_c = µ0σ2πf R²_cyl ≤ 71** (définition sans K) ;
  - turbines en fer doux de µr de l'ordre de 50 ; pas de dynamo avec turbines inox.
- ⚠ Le texte indique aussi « Both containers have a total height H = 412 mm », alors que le PRL 2007 donne une longueur de 524 mm (la simulation néglige le fluide derrière les turbines).
- **Équations adimensionnées** : voir §4.2. Le terme ∇×((1/σr)∇×(B/µr)) apparaît dans l'induction. CL « ferromagnétique parfaite » H×n = 0, appelée aussi **pseudo-vide**.
- **Table 3 (Re = 1,5×10³)** :
  - H×n = 0 : µr = 1 → Rm_c = 190 ± 10 ; µr = 5 → 170 ± 5 ; µr = 50 → 90 ± 5 ;
  - CL vide : µr = 1 → 310 ± 30 ; µr = 50 → 130 ± 10.
- **Table 4 (µr = 50, H×n = 0)** :

| Re | 5×10² | 1,5×10³ | 2,5×10³ | 5×10³ | 10⁴ | 10⁵ |
|---|---|---|---|---|---|---|
| Rm_c | 135 ± 5 | 90 ± 5 | 84 ± 5 | 75 ± 5 | 70 ± 5 | 70 ± 5 |
| Pm_c | ≈ 0,27 | ≈ 0,06 | ≈ 0,034 | ≈ 0,015 | 7,5×10⁻³ | 7×10⁻⁴ |

- **Conclusion** : Rm_c∞ ≈ 70, dans l'intervalle expérimental [52, 71]. Les hautes Re sont traitées par une viscosité entropique (LES).

**Kreuzahler, Ponty, Plihon, Homann, Grauer (2017).** « Dynamo enhancement and mode selection triggered by high magnetic permeability ». *Phys. Rev. Lett.* **119**, 234501. DOI 10.1103/PhysRevLett.119.234501. arXiv:1706.00260. [vérifié]
[src] https://arxiv.org/pdf/1706.00260

- **Méthode** : MHD complète, pseudo-spectrale Fourier ; turbines par pénalisation ; sauts de µr gérés par un filtre « sharpened raised cosine » ; CL périodiques pour b ; boîte (3π)³ à **384³** points.
- **Définitions** : Re = ΩR_d R_c/ν = 10,125/ν et Rm = µ0σΩR_d R_c.
- **Résultats** :
  - pour µr = 1, Rm_c augmente avec la turbulence puis sature pour Re > 1000 ;
  - à Re = 1500, Rm_c ≈ 740 pour µr = 1 ;
  - à Rm = 500 (sous ce seuil), dynamos pour µr ≥ 12 (« full impeller ») ; dynamos aussi pour µr > 8 dans la configuration Fig. 1 ;
  - mode axisymétrique moyen auto-généré au-delà d'un seuil en µr.
- Calculs sur GENCI (IDRIS/CINES/TGCC).

### 1.5 Revue comparative des expériences

**Pétrélis, Mordant, Fauve (2007).** « On the magnetic fields generated by experimental dynamos ». *Geophys. Astrophys. Fluid Dyn.* **101**, 289–323. DOI 10.1080/03091920701523410. arXiv:0709.0234. [vérifié]
[src] https://arxiv.org/pdf/0709.0234

- Revue des expériences de Riga, Karlsruhe et VKS. Rappel de la dynamo de Ponomarenko (§3.3 ci-dessous). Le cylindre conducteur au repos est essentiel (invariance galiléenne et en repère tournant de l'induction).

---

## 2. Renversements et modèles de basse dimension

### 2.1 Pétrélis & Fauve (2008) : couplage dipôle–quadrupôle, forme normale

**Pétrélis & Fauve (2008).** « Chaotic dynamics of the magnetic field generated by dynamo action in a turbulent flow ». *J. Phys.: Condens. Matter* **20**, 494203. DOI 10.1088/0953-8984/20/49/494203. [vérifié]
[src] https://www.phys.ens.fr/~petrelis/pdf/petrelisjcm2008.pdf

- **Hypothèse** : B = dipôle D + quadrupôle Q, avec A = D + iQ. L'invariance B → −B impose A → −A, d'où :
  Ȧ = µA + νĀ + β₁A³ + β₂A²Ā + β₃AĀ² + β₄Ā³.
- **Réduction** : avec β₁r ≈ β₃r ≈ β₄r ≈ 0, β₂r = −1, A = R e^{i(θ+θ₀)} et ν e^{−2iθ₀} = ρ réel :
  **θ̇ = µᵢ − ρ sin 2θ** (éq. 5).
- **Analyse** :
  - forçage symétrique (F1 = F2) : µᵢ = 0, deux dipôles stables ;
  - µᵢ < ρ : quatre points fixes (deux stables θ_c et π + θ_c, deux instables) avec 2θ_c = arcsin(µᵢ/ρ) ;
  - à µᵢ = ρ : **bifurcation nœud-col**, puis cycle limite (renversements périodiques) pour µᵢ > ρ.
- **Rôle du bruit** : juste sous le seuil, le bruit turbulent provoque des renversements aléatoires.

### 2.2 Pétrélis, Fauve, Dormy, Valet (2009) : application au géodynamo

**Pétrélis, Fauve, Dormy, Valet (2009).** « Simple mechanism for reversals of Earth's magnetic field ». *Phys. Rev. Lett.* **102**, 144503. DOI 10.1103/PhysRevLett.102.144503. arXiv:0806.3756. [vérifié]
[src] https://www.phys.ens.fr/~petrelis/pdf/renversementsPRL2009.pdf et https://ar5iv.labs.arxiv.org/html/0806.3756 (équations)

- **Équations** :
  - éq. (2) : Ȧ = µA + νĀ + γ₁A³ + γ₂A²Ā + γ₃AĀ² + γ₄Ā³ ;
  - éq. (3) : θ̇ = α₀ + Σ_{n≥1}(α_n cos 2nθ + β_n sin 2nθ) ;
  - **éq. (4) : θ̇ = α₀ + α₁ sin(2θ) + Δ ζ(t)**, avec ζ un bruit blanc gaussien ; dipôle D = R cos(θ + θ₀).
- **Statistique des polarités** :
  - éq. (5) : P[T] ∝ exp(−T/⟨T⟩) ;
  - éq. (6) : ⟨T⟩ = π/√(α₁² − α₀²) · exp[2|α₁| (2(α₁ + α₀)/α₁)^{3/2} / (3Δ²)].
- **Paramètres (Fig. 2)** : α₁ = −185 Myr⁻¹, α₀/α₁ = −0,9, θ₀ = 0,3, Δ/√|α₁| = 0,2, d'où **⟨T⟩ ≈ 170 kyr**.
  ⚠ Les signes moins sont perdus dans l'extraction texte du PDF éditeur ; les valeurs sont prises sur ar5iv. [vérifié : le PDF arXiv v3 donne aussi α₁ = −185 Myr⁻¹, α₀/α₁ = −0,9, Δ/√|α₁| = 0,2]
- **Interprétation** : le modèle explique le dépassement (overshoot) après un renversement, absent des excursions. Validité liée à **Pm petit**.

### 2.3 Gissinger, Dormy, Fauve (2010) : morphologie des renversements

**Gissinger, Dormy, Fauve (2010).** « Morphology of field reversals in turbulent dynamos ». *EPL* **90**, 49001. DOI 10.1209/0295-5075/90/49001. [vérifié]
[src] https://www.phys.ens.fr/~gissinger/pdf/Gissinger_etal2010.pdf

- **Simulations** : DNS en sphère, avec Rm = µ0σa·max|v|, Pm = νµ0σ et Re = Rm/Pm.
  - Pm ≈ 1 : le dipôle axial renverse en présence d'un fort dipôle équatorial (Rm = 300, Pm = 1, C = 2) ;
  - **Pm < 0,5** : les renversements impliquent surtout dipôle axial et quadrupôle axial, couplés par une brisure de symétrie de l'écoulement ;
  - à Re = 330, la corrélation r entre dipôle et quadrupôle passe de 0,4 à 0,9 quand Pm descend de 1 à 0,3.
- **Modèle à 3 modes (éq. 3–5)**, ⚠ avec les rôles de D et Q inversés par rapport à l'article de 2012 :
  - Ḋ = µD − VQ
  - Q̇ = −νQ + VD
  - V̇ = Γ − V + QD
- **Symétrie Rπ** : D → −D, Q → Q, V → −V. Γ ≠ 0 traduit un forçage qui brise Rπ (turbines à vitesses différentes) ; pour Γ = 0 (C = 1), pas d'état stationnaire stable à dipôle axial dominant.
- Figures 5–6 obtenues avec **µ = 0,119, ν = 0,1, Γ = 0,9**.
- Le modèle est déterministe : pas besoin de bruit externe. Les deux attracteurs ±B se connectent par une crise.

### 2.4 Gissinger (2012) : modèle à 3 modes (Q, D, V), référence pour la simulation

**Gissinger (2012).** « A new deterministic model for chaotic reversals ». *Eur. Phys. J. B* **85**(4), 137. DOI 10.1140/epjb/e2012-20799-5. **arXiv:1109.6569** (v2 du 2 mars 2012). [vérifié : texte intégral arXiv v2 relu ; équations (1)–(14) recontrôlées]
[src] texte intégral : https://arxiv.org/pdf/1109.6569 ; équations recoupées sur https://ar5iv.labs.arxiv.org/html/1109.6569 ; métadonnées : https://api.crossref.org/works/10.1140/epjb/e2012-20799-5

**Équations exactes (éq. 1–3)** :

```
dQ/dt = µ Q − V D        (1)   [vérifié]
dD/dt = −ν D + V Q       (2)
dV/dt = Γ − V + Q D      (3)
```

- **Propriétés** :
  - µ, ν, Γ réels ; non-linéarités quadratiques ; les signes relatifs garantissent des solutions bornées ;
  - divergence du champ de vecteurs = µ − ν − 1. ⚠ L'article écrit « dissipative for µ > 1+ν », alors qu'une divergence négative correspond à µ < 1 + ν : coquille probable. [vérifié : la phrase figure bien dans l'arXiv v2 ; la divergence vaut bien µ − ν − 1]
- **Symétrie** : **(D, Q, V) → (−D, −Q, V)**, image de B → −B. Elle est « crucial[e] » pour les renversements.
- **Interprétation (§4)** : D = dipôle, Q = quadrupôle, V = mode de vitesse qui brise la symétrie miroir équatoriale, forcé par Γ. Le terme QD dans (3) représente la force de Lorentz. V ne change pas de signe lors des renversements.
- **Modèles voisins** : Rikitake (sans amortissement de V) ; Nozières (troncature MHD) ; Proctor & Hughes (Γ = 0). Γ ≠ 0 est crucial.

**Point fixe trivial O et stabilité** :
- O : Q = 0, D = 0, V = Γ (éq. 4).
- Valeurs propres (éq. 5–6) : λ₁,₂ = (µ−ν)/2 ± ½√((µ+ν)² − 4Γ²) et λ₃ = −1.
- µ + ν > 2Γ : valeurs propres réelles. µ + ν < 2Γ : valeurs complexes et bifurcation de Hopf pour µ > ν. Point de codimension 2 en µ = ν = Γ.

**Points fixes non triviaux** :
- **M±**, qui existent si √(µν) − Γ > 0 :
  Q = ±√(ν − Γ√(ν/µ)), D = ±√(µ − Γ√(µ/ν)), V = +√(µν) (éq. 7–9).
- **N±** :
  Q = ±√(ν + Γ√(ν/µ)), D = ∓√(µ + Γ√(µ/ν)) (signe de D opposé à celui de Q), V = −√(µν) (éq. 10–12).
- Polynômes caractéristiques (éq. 13–14) :
  - M± : λ³ + λ²(1 + ν − µ) + λΓ(ν − µ)/√(µν) + 4µν − 4Γ√(µν) = 0 ;
  - N± : même forme avec −λΓ(ν − µ)/√(µν) et +4Γ√(µν).
  [vérifié : points fixes M±, N± et polynômes (13)–(14) recalculés numériquement à partir de la jacobienne, résidus nuls, coefficients identiques]

**Scénario en µ (Γ = 0,9, ν = 0,1 fixés)** :
- µ > 0,2 : solutions stationnaires N±.
- µ < 0,2 : orbite périodique autour de chaque N.
- **µ < 0,138** : cascade de doublements de période (diagramme de bifurcation tracé pour µ de 0,15 à 0,1, Fig. 2).
- **Crise de fusion d'attracteurs à µ_c ≈ 0,11928** :
  - pas de renversement après un temps d'intégration t > 1×10⁵ (texte : « t > 1.10⁵ ») ;
  - renversements observés pour µ = 0,119275 ;
  - temps d'attente moyen τ ∼ (µ − µ_c)^{−γ} avec γ ≃ 1/2, mais « difficile de conclure », car le résultat est très sensible à µ_c ;
  - chaque τ est moyenné sur une série de 1000 renversements.
- **µ = 0,119** : renversements chaotiques, avec un exposant de Lyapunov λ ≃ 0,1 (inchangé par la crise). Ces renversements n'existent que si O est un foyer instable.
- **µ = 0,12** : chaos autour d'un seul point fixe, sans renversement (Fig. 3).
- **µ = 0,101** : renversements **non chaotiques** (Fig. 7).
- **µ ≤ ν** : O devient linéairement stable (bistabilité, bifurcation « strongly subcritical ») ; le système ne converge vers O quelle que soit la CI que pour **µ < 0,063**. [vérifié ; précision ajoutée]
- **0,065 < µ < 0,1** : intermittence entre le voisinage d'un point fixe et une orbite instable autour de O.
- **µ = 0,065** : renversements asymétriques malgré la symétrie des équations.

**Autres régimes** :
- µ = ν = 0,35, Γ = 0,1 : quatre points fixes non triviaux (Fig. 9).
- µ = 0,3, ν = 0,2, Γ = 5 : intermittence exotique (Fig. 10).

**Comparaison avec les données terrestres** :
- Fig. 11 : SINT2000, 2 derniers Myr. Fig. 12 : CK95.
- Distribution des temps d'attente : quantifiée aux temps courts (orbites périodiques instables), **poissonienne** aux temps longs, P(τ) = e^{−τ/⟨τ⟩}/⟨τ⟩ (éq. 17).
- PDF de D bimodale, avec une probabilité très faible en 0.
- Overshoot après les renversements ; excursions présentes.
- Prédiction : quand D passe par 0 pendant un renversement, Q augmente fortement (transfert dipôle → quadrupôle).
- ⚠ La légende de la Fig. 11 indique « µ = 0,119, ν = 0,1 et **Γ = 0,1** », alors que le texte et les autres figures utilisent Γ = 0,9 (coquille probable). [vérifié dans l'arXiv v2]

**Notes pour la simulation (E1)** :
1. Conventions : EPJB 2012 met µ sur Q ; EPL 2010 met µ sur D. Les deux systèmes sont identiques à l'échange D ↔ Q près. Citer la convention utilisée.
2. Le régime de référence (µ, ν, Γ) = (0,119 ; 0,1 ; 0,9) est très proche de µ_c ≈ 0,11928 : les temps d'attente sont très sensibles à µ et à la précision numérique.
3. **Vérification numérique interne** (calcul de l'équipe, pas un fait publié) :
   - réglages : RK4, dt = 0,01, t ∈ [0 ; 2×10⁴], transitoire de 500 retiré, condition initiale (Q, D, V) = (0,1 ; 0,1 ; 0) ; un renversement est compté quand D franchit ±0,5 avec changement de signe ;
   - **µ = 0,119** : 74 renversements, D ∈ [−2,95 ; 3,13] ;
   - µ = 0,12 et 0,15 : 0 renversement ;
   - µ = 0,25 : point fixe D = −1,293, V = −0,158, conforme aux formules N± (√(0,25 + 0,9√2,5) = 1,2935 ; −√0,025 = −0,158) ;
   - µ = 0,101 : 1036 renversements ;
   - µ = 0,065 : convergence vers O avec cette CI, ce qui illustre la bistabilité.
   - Script : `/tmp/claude-0/-home-user-knoel99-github-io/7f944193-0bd4-5776-8423-148e13f15fcf/scratchpad/scripts/gissinger_check.py`.
   - [vérifié : script relancé tel quel par le vérificateur ; mêmes résultats pour µ = 0,119 (74 ; D ∈ [−2,947 ; 3,133]), 0,12 (0), 0,15 (0), 0,25 (D = −1,293, V = −0,158), 0,101 (1036), 0,065 (O)]

---

## 3. Dynamos cinématiques de référence

### 3.1 Écoulement ABC (Arnold–Beltrami–Childress), A = B = C = 1

- **Forme utilisée par Bouya & Dormy** :
  u = (A sin z + C cos y) e_x + (B sin x + A cos z) e_y + (C sin y + B cos x) e_z, sur un domaine **2π-périodique**.
- **Induction** : ∂B/∂t = ∇×(u×B) − Rm⁻¹ ∇×∇×B, donc **Rm = 1/η** avec u d'amplitude O(1) (A = B = C = 1).
  [src] Bouya & Dormy (2013) « Revisiting the ABC flow dynamo », *Phys. Fluids* **25**, 037103, DOI 10.1063/1.4795546, arXiv:1206.5186 : https://arxiv.org/pdf/1206.5186 [vérifié]
- **Forme d'Archontis et al.** : u_ABC = A(0, sin kx, cos kx) + B(cos ky, 0, sin ky) + C(sin kz, cos kz, 0), avec la même équation en 1/Re_m et une périodicité 2π. Pour A = B = C = k = 1 (« normal » ABC) :
  > « two windows of dynamo action […]: A closed one in the interval Re_m = 8.9–17.5, and an open one for magnetic Reynolds numbers above 27 (Galloway et al. 1984) ».

  Le maximum du taux de croissance dans la 1re fenêtre est atteint à Re_m = 12 (cité de Galanti et al. 1993, valeur du taux non donnée).
  [src] Archontis, Dorch, Nordlund (2003) *A&A* **397**, 393–399, DOI 10.1051/0004-6361:20021568, arXiv:astro-ph/0204208 : https://arxiv.org/pdf/astro-ph/0204208 [vérifié : citation exacte retrouvée p. 2 ; mis en ligne le 17/12/2002, numéro de janvier 2003]
- **Bouya & Dormy (2013)**, résultats :
  - deux coudes dans σ(Rm) : **Rm1 ∈ [24,05 ; 24,10]**, croisement de valeurs propres situé dans la fenêtre stable signalée par Galloway & Frisch près de Rm ≈ 20, et **Rm2 ∈ [215,0 ; 215,4]**, coalescence au-delà de laquelle la valeur propre dominante devient réelle ;
  - pulsation ω = Im λ ≈ 0,53 dans la 1re fenêtre (Arnold & Korkina 1983) et ≈ 0,13 dans la 2e (Galloway & Frisch 1986) ;
  - le mode de la 1re fenêtre possède toutes les symétries « paires » du groupe de l'ABC (24 éléments) ;
  - σ ≈ 0,1 à **Rm = 25 000** (résolution jusqu'à 1024³), sans asymptote atteinte ;
  - exposant de Lyapunov de l'écoulement ≈ 0,055 ; h_line ≈ 0,09 ;
  - la conservation de ∇·B est assurée par le schéma spectral.
  - [vérifié : tous les chiffres Bouya & Dormy ci-dessus retrouvés dans arXiv:1206.5186]
- **Références primaires** (métadonnées vérifiées) :
  - V.I. Arnol'd, E.I. Korkina (1983), « Growth of the magnetic field in three-dimensional steady flow of incompressible fluid », *Vestnik Moskov. Univ. Ser. 1 Mat. Mekh.* n° 3, 43–46. Résumé : expérience numérique de type Galerkin avec environ 20 000 harmoniques, à des nombres de Reynolds de l'ordre de 60 ; croissance exponentielle dans une gamme de Reynolds, puis décroissance. [src] https://mathnet.ru/eng/vmumm3491 [vérifié]
  - D. Galloway, U. Frisch (1984), « A numerical investigation of magnetic field generation in a flow with chaotic streamlines », *Geophys. Astrophys. Fluid Dyn.* **29**, 13–18, DOI 10.1080/03091928408248180. [src] https://api.crossref.org/works/10.1080/03091928408248180 [vérifié : métadonnées]
  - D. Galloway, U. Frisch (1986), « Dynamo action in a family of flows with chaotic streamlines », *Geophys. Astrophys. Fluid Dyn.* **36**(1), 53–83, DOI 10.1080/03091928608208797. [src] https://api.crossref.org/works/10.1080/03091928608208797 (texte intégral inaccessible, 403) [vérifié : métadonnées ; texte intégral toujours 403]
- **Alexakis (2011)**, « Searching for the fastest dynamo: Laminar ABC flows », *Phys. Rev. E* **84**, 026321, DOI 10.1103/PhysRevE.84.026321, arXiv:1105.3692. [vérifié]
  - Note de Bouya & Dormy : le cas 1:1:1 a de très petites régions chaotiques et n'est sans doute pas optimal.
  - A = B ≃ 2C/5 (et permutations) donne la dynamo la plus rapide, avec γ ≃ 0,12 au plus grand R_M examiné. [corrigé : « non relu, donnerait » → confirmé dans le résumé et le texte de arXiv:1105.3692]
  - ⚠ Convention : Alexakis normalise par U = √(A² + B² + C²), soit R_M = √3/η pour l'ABC 1:1:1 (et non 1/η). Son « R_M = 33,3, fenêtre sans dynamo » correspond à 1/η ≈ 19, cohérent avec la fenêtre 8,9–17,5. [ajout du vérificateur]

### 3.2 Écoulement de G.O. Roberts (1972)

**G.O. Roberts (1972).** « Dynamo action of fluid motions with two-dimensional periodicity ». *Phil. Trans. R. Soc. Lond. A* **271**(1216), 411–454. DOI 10.1098/rsta.1972.0015. [vérifié]
[src] résumé : https://api.crossref.org/works/10.1098/rsta.1972.0015

- **Énoncé du résumé** : les mouvements spatialement périodiques dont les trois composantes ne dépendent que de (y, z) sont étudiés. Le mouvement **u = (cos y − cos z, sin z, sin y)** est une dynamo du premier ordre, pour presque toutes les résistivités. Trois autres mouvements, qui ne sont pas des dynamos du premier ordre, donnent des champs croissants en version multi-échelle.
- **Lien avec Karlsruhe** : la forme « stream function ∝ sin(πx/a) sin(πy/a), u_z ∝ sin(πx/a) sin(πy/a) » est utilisée par Rädler & Brandenburg (§1.2) pour décrire l'écoulement de Roberts à la base de l'expérience.

### 3.3 Dynamo de Ponomarenko

- **Référence** : Yu. B. Ponomarenko (1973), « Theory of the hydromagnetic generator », *J. Appl. Mech. Tech. Phys.* **14**(6), 775–778, DOI 10.1007/BF00853190 (Crossref ; original non consulté). [corrigé : pages 775–779 → 775–778 selon Crossref ; Gailitis 2008 et Monchaux 2007 écrivent 775–779]
- **Modèle** : cylindre conducteur rigide de rayon R, en rotation solide Ω et en translation V, en contact glissant avec un milieu infini de même conductivité.
- **Seuil** :
  - Gailitis & Freibergs (1976), *Magnetohydrodynamics* **12**, 127–129 : **Rm_c = 17,7** pour l'instabilité convective, « with the radius taken as the defining length scale » [src : arXiv:0807.0305] [vérifié dans Gailitis 2008 ; réf. [10] = *Magnetohydrodynamics* 12 (1976) 127–129] ;
  - l'ajout d'un retour axial coaxial rend l'instabilité absolue (Gailitis & Freibergs 1980, *Magnetohydrodynamics* **16**, 116–121). [vérifié dans Gailitis 2008, réf. [10]–[11]]
- ⚠ **Définitions divergentes de ce 17,7** :
  - Pétrélis, Mordant, Fauve (2007) : Rm_c = µ0σR√((RΩ)² + V²) = 17,7 au nombre de Rossby optimal Ro = V/(RΩ) = 1,3 ; bifurcation de Hopf, onde progressive. [src] https://arxiv.org/pdf/0709.0234 [vérifié]
  - Dobler, Frick, Stepanov (2003), arXiv:astro-ph/0301222 : Rm = U r₀/η = 17,7, avec U la vitesse longitudinale seule. [src] https://arxiv.org/pdf/astro-ph/0301222 [vérifié ; publié dans *Phys. Rev. E* **67**, 056309 (2003), DOI 10.1103/PhysRevE.67.056309]

### 3.4 Théorèmes anti-dynamo

- **Cowling (1933)** : « The magnetic field of sunspots », *MNRAS* **94**, 39–48. DOI 10.1093/mnras/94.1.39 (Crossref : publié le 10 novembre 1933 ; certaines sources citent 1934). [vérifié]
  - **Énoncé (Tobias)** : « An axisymmetric field vanishing at infinity can not be maintained by dynamo action ». [vérifié, §2.4.3]
  - **Idée de preuve** : un écoulement non axisymétrique génère immédiatement un champ non axisymétrique, donc on se restreint au cas axisymétrique. Pour le potentiel poloïdal A : d/dt ∫ ½ s²A² dV = −η ∫ |∇(sA)|² dV, donc la partie poloïdale décroît, puis la partie toroïdale, privée de source.
  - **Version cartésienne** : aucun champ s'annulant à l'infini et indépendant de z ne peut être engendré par effet dynamo.
  - [src] Tobias, « The turbulent dynamo », arXiv:1907.03685 (§2.4.3) : https://arxiv.org/pdf/1907.03685 ; publié dans *J. Fluid Mech.* **912**, P1 (2021), DOI 10.1017/jfm.2020.1055 (Crossref). [vérifié]
  - Kaiser & Tilgner (2014), « The axisymmetric antidynamo theorem revisited », *SIAM J. Appl. Math.* **74**(2), 571–597, DOI 10.1137/130928376, arXiv:1210.7122 : ils notent qu'avant leur travail « a proof of the axisymmetric theorem using the full (coupled) set of dynamo equations is still missing » (couplage méridien ↔ azimutal du problème **cinématique**), puis **le démontrent** (décroissance exponentielle, ponctuelle et inconditionnelle). [corrigé : « soutiennent que la preuve reste incomplète » → ils comblent cette lacune ; texte relu]
- **Zel'dovich (1957)** : « The magnetic field in the two-dimensional motion of a conducting turbulent liquid », *JETP* **4**(3), 460 (original *ZhETF* **31**). [src] https://ns.jetp.ras.ru/cgi-bin/r/index/e/4/3/p460?a=list (métadonnées seules) [vérifié : métadonnées ; mars 1957 ; la page JETP donne l'original *ZhETF* **31**(3), 154]
  - **Énoncé (Tobias §2.4.3)** : les théorèmes de Bullard & Gellman (1954), Backus (1958) et, en cartésien, Zel'dovich (1957) montrent qu'un champ de vitesse doit avoir ses trois composantes pour agir comme dynamo ; un écoulement plan (purement poloïdal) ne peut pas être une dynamo. Exigence minimale : un champ tridimensionnel et un écoulement non plan.
- **Borne de Backus (1958)** : condition nécessaire sur Rm dans un domaine fini, en lien avec le bilan d'énergie magnétique (Tobias éq. 2.29). Énoncé exact non recopié ici. [vérifié : éq. (2.29), §2.4.4 de Tobias]

---

## 4. Équations MHD, bilans, invariants, conditions aux limites

### 4.1 Forme dimensionnelle (Tobias, arXiv:1907.03685, éq. 2.1–2.6) [vérifié]

- ∂u/∂t + u·∇u = −(1/ρ)∇p + (1/ρ) j×B + ν∇²u + F/ρ
- ∂B/∂t = ∇×(u×B) − ∇×(η∇×B), avec ∇·B = 0
- j = (1/µ)∇×B et η = (µσ)⁻¹. Si η est constant : ∂B/∂t = ∇×(u×B) + η∇²B.

### 4.2 Formes adimensionnées

- **SFEMaNS (Nore et al. 2018, éq. 2.1a–d)** : [vérifié]
  - ∂_t u = −(∇×u)×u + (1/Re)Δu − ∇p + f
  - ∂_t B = ∇×(u×B) − (1/Rm)∇×((1/σr)∇×(B/µr))
  - ∇·u = 0, ∇·B = 0, avec f = (∇×H)×B et H = B/(µ0µr)
  - Échelle d'Alfvén B = U√(ρµ0) avec U = ωR_cyl ; **Rm = µ0σ0R²_cyl ω**, **Re = R²_cyl ω/ν** ; L_ref = R_cyl.
- **Ponty et al. (2005), éq. (1–2)** : [vérifié]
  - ∂v/∂t + v·∇v = −∇P + j×B + ν∇²v + F
  - ∂B/∂t + v·∇B = B·∇v + η∇²B
  - ∇·v = 0, ∇·B = 0, avec v normalisé par la vitesse rms et B en unités d'Alfvén (j = ∇×B).
  - Définitions : R_V = UL/ν (U rms, L intégrale), R_M = P_M R_V = UL/η, P_M = ν/η.

### 4.3 Bilan d'énergie

- **Tobias éq. (2.11–2.12)**, sans terme de surface, cas incompressible : [vérifié]
  - d/dt ∫ B²/(2µ) dV = −∫ u·(j×B) dV − ηµ ∫ j² dV
  - d/dt ∫ ρu²/2 dV = +∫ u·(j×B) dV − ∫ 2νρ S² dV
  - L'échange cinétique ↔ magnétique se fait par le travail de la force de Lorentz.
- **Avec forçage** (dérivé de (2.1) en ajoutant u·F ; dérivation de l'équipe, à présenter comme telle ; [vérifié : cohérente avec (2.11)–(2.12)]) :
  d/dt (E_K + E_M) = ∫ u·F dV − ∫ 2νρ S² dV − ηµ ∫ j² dV.
  En domaine périodique, ∫ 2νρ S² = νρ ∫ |ω|². [vérifié par le calcul : identité ∫ 2 S:S = ∫ |ω|² pour un champ solénoïdal périodique]

### 4.4 Hélicités et invariants idéaux (3D)

- **Hydrodynamique idéale** : E_k = ½∫ρu·u dV et **H_k = ∫ρu·ω dV** (hélicité cinétique) sont conservées (Moreau 1961 ; Moffatt 1969). [src : Tobias éq. 2.10] [vérifié]
- **MHD idéale 3D** : invariants **E_T = E_V + E_M**, **H_M = ⟨A·B⟩** (B = ∇×A) et **H_C = ⟨u·B⟩** (hélicité croisée) (Woltjer 1960 ; Pouquet 1996 ; Blackman 2015). Dans ce cadre, H_k n'est plus conservée. [src] Pouquet, Rosenberg, Stawarz, Marino (2019), « Helicity dynamics, inverse and bi-directional cascades in fluid and MHD turbulence: A brief review », *Earth and Space Science* **6**(3), 351–369, DOI 10.1029/2018EA000432, arXiv:1807.03239 : https://arxiv.org/pdf/1807.03239 [vérifié ; complété : volume, pages et DOI ajoutés d'après Crossref]
- **Cascades** : l'énergie totale cascade vers les petites échelles ; **H_M subit une cascade inverse** vers les grandes échelles (même revue, §3.3). [vérifié]

### 4.5 MHD 2D : formulation (ψ, a), équivalente à (ω, a)

[src] Krstulovic, Brachet, Pouquet (2011), « Alfvén waves and ideal two-dimensional Galerkin truncated magnetohydrodynamics », *Phys. Rev. E* **84**, 016410, DOI 10.1103/PhysRevE.84.016410, arXiv:1101.1078 : https://arxiv.org/pdf/1101.1078 [vérifié : éq. (1)–(6), (9)–(11), (16)–(17) relues]

- **Variables** : u = ∇×(ψ ẑ), b = ∇×(a ẑ), ∇·u = ∇·b = 0, crochet {f, g} = ∂ₓf ∂ᵧg − ∂ₓg ∂ᵧf.
- **Équations idéales** :
  - (1) ∂ψ/∂t = ∇⁻²[{ψ, ∇²ψ} − {a, ∇²a}]
  - (2) ∂a/∂t = {ψ, a}
  - (3) équivalent : ∂a/∂t + u·∇a = 0, donc a est advecté comme un scalaire passif ; la force de Lorentz j×b brise la conservation de la vorticité.
- **Avec dissipation (forme usuelle)** : ∂ω/∂t + u·∇ω = b·∇j + ν∇²ω + (rot f)_z et ∂a/∂t + u·∇a = η∇²a, avec j = −∇²a et ω = −∇²ψ (le signe dépend des conventions). Les termes dissipatifs ne figurent pas dans KBP (cas idéal) : vérifier les signes dans le code. [vérifié par le calcul : avec u = ∇×(ψẑ), ω_z = −∇²ψ et j_z = −∇²a ; forme standard, non tirée d'une source]
- **Invariants idéaux** :
  - énergie E = ½∫(|u|² + |b|²) d²x ;
  - infinité de Casimirs C = ∫[f(a) + ∇²ψ g(a)] d²x ;
  - f(a) = a², g = 0 donne **A = ⟨a²⟩** (potentiel quadratique, défini positif) ;
  - f = 0, g(a) = −a donne **H_c = ∫b·u d²x** (hélicité croisée) ;
  - en troncature de Galerkin, seuls les invariants quadratiques (E, H_c, A) restent conservés ;
  - équilibre absolu : αE + βA + γH_c.
- **Condition initiale classique d'Orszag–Tang** (éq. 16–17) : ψ = 2(cos k₀x + cos k₀y), a = 2 cos k₀x + cos 2k₀y, avec k₀ = 1, E_u = E_b = 2 à t = 0 et u_rms ≈ b_rms ≈ 2.
- **Cascades** : en 2D, « the purely magnetic invariant, A², is positive definite » (Pouquet et al. 2019, §3.5). [vérifié]
  - Le sens des cascades (directe ou inverse) du potentiel magnétique et de l'énergie cinétique dépend du rapport des taux d'injection ε_M/ε_V ; les points critiques diffèrent légèrement pour les deux (Seshasayanan & Alexakis 2016, cités au même §3.5).
  - À faible forçage magnétique, l'énergie cinétique subit une cascade inverse.
  - Ne pas affirmer une cascade inverse de A sans préciser le forçage.

### 4.6 Conditions aux limites magnétiques

- **Sauts à une interface** (Tobias éq. 2.7) : [n·B] = 0, [n×B] = µ j_S, [n×E] = 0, [n·E] = ρ_S/ε. [vérifié]
- **Isolant extérieur** (j_ext = 0) : B est continu (µ constant) et se raccorde à un champ potentiel extérieur ; B = O(|x|⁻³) à l'infini.
  - SFEMaNS résout B dans le conducteur et un potentiel scalaire dans l'isolant. Le couplage passe par une méthode de pénalité intérieure, avec un contrôle de ∇·B en norme de Sobolev négative (Nore 2018 §2.2).
- **Conducteur parfait statique** (Tobias éq. 2.8) [vérifié] : n·B = 0 et n×j = 0. En cartésien sur z = cte : ∂B_x/∂z = ∂B_y/∂z = B_z = 0 ; en sphérique : B_r = ∂(rB_θ)/∂r = ∂(rB_φ)/∂r = 0.
- **Pseudo-vide** :
  - composante tangentielle de B nulle sur la frontière (champ normal) [src] Yin, Yang, Ma, Cai, Zhang (2022), *J. Comput. Phys.* **451**, 110866, arXiv:2009.02171, DOI 10.1016/j.jcp.2021.110866 : https://www.arxiv.org/pdf/2009.02171v2 [corrigé : année 2021 → 2022 (volume 451, février 2022, selon Crossref ; le DOI garde « 2021 »)] ;
  - adoptée en premier par Kageyama & Sato (1995) ; simple pour les méthodes locales mais peut donner des solutions « quite different » de la CL isolante (Harder & Hansen 2005 ; Jackson et al. 2014, cités par Yin) [vérifié] ;
  - dans SFEMaNS : H×n = 0, appelée « perfect ferromagnetic » ou pseudo-vide ; elle imite des parois de µr infini (Giesecke 2010).
- **Impact quantitatif (Nore 2018, Table 3)** : à Re = 1,5×10³ et µr = 50, Rm_c = 90 ± 5 en pseudo-vide contre 130 ± 10 en vide, soit environ 40 % de plus. [vérifié : « we observe a 40 % increase » ; pour µr = 1, 190 → 310, soit « approximately 60 % »]

---

## 5. Codes et jeux de données

### 5.1 SFEMaNS (Spectral/Finite Elements for Maxwell and Navier–Stokes)

- **Méthode** : décomposition de Fourier en azimut ; éléments finis de Lagrange (Hood–Taylor P1–P2) dans la section méridienne. Les problèmes linéaires de chaque mode de Fourier sont découplés (parallélisme MPI) ; partitionnement METIS ; algèbre linéaire PETSc.
- **Physique** : B dans les conducteurs, potentiel scalaire dans l'isolant, pénalité intérieure aux interfaces σ/µ discontinues. Turbines représentées par pseudo-pénalisation. LES par **viscosité entropique**.
- **Validation** : solutions manufacturées et comparaisons avec d'autres codes MHD. [src] Nore et al. 2018 §2.2. [vérifié]
- **Documentation v5.3** (Doxygen, 17 août 2021) : https://people.tamu.edu/~guermond/SFEMaNS/html/doc_intro.html
  - modes NST, MXW, MHD et FHD (ferrohydrodynamique) ; domaines axisymétriques en (r, θ, z) ;
  - licence **GNU GPL v3 ou ultérieure** (page about.html). [vérifié : pages doc_intro.html et about.html, générées le 17 août 2021, version 5.3]
- **Références méthodologiques** (Crossref vérifié) :
  - Guermond, Laguerre, Léorat, Nore (2007), « An interior penalty Galerkin method for the MHD equations in heterogeneous domains », *J. Comput. Phys.* **221**(1), 349–369, DOI 10.1016/j.jcp.2006.06.045 [vérifié] ;
  - Guermond, Laguerre, Léorat, Nore (2009), « Nonlinear magnetohydrodynamics in axisymmetric heterogeneous domains using a Fourier/finite element technique and an interior penalty method », *J. Comput. Phys.* **228**(8), 2739–2757, DOI 10.1016/j.jcp.2008.12.026 [vérifié] ;
  - Guermond, Léorat, Luddens, Nore, **Ribeiro** (2011), « Effects of discontinuous magnetic permeability on magnetodynamic problems », *J. Comput. Phys.* **230**(16), 6299–6319, DOI 10.1016/j.jcp.2011.04.026 [vérifié] ;
  - application connexe : Nore, Léorat, Guermond, Luddens (2011), « Nonlinear dynamo action in a precessing cylindrical container », *Phys. Rev. E* **84**, 016317, DOI 10.1103/PhysRevE.84.016317 [vérifié].

### 5.2 Codes pseudo-spectraux (Ponty et collaborateurs, GHOST, Dedalus)

- **Ponty et al. 2005** : code pseudo-spectral 3D périodique, Runge–Kutta explicite d'ordre 2, désaliasage avec dernier nombre d'onde k = N/3, résolutions de 64³ à 512³. Trois approches : DNS, modèle LAMHD (α-modèle Lagrangien moyenné) et LES avec viscosité turbulente spectrale ν(k, t) = 0,27[1 + 3,58(k/K_c)⁸]√(E_V(K_c, t)/K_c). [vérifié : éq. (4) et §méthodes de Ponty 2005]
- **Diaporama de Y. Ponty** (école AGAT 2016, « Periodic box simulations and tools ») : mentionne les codes **MIRA (P. Mininni)** et **LaTu (Holger Homann)**, ce dernier avec une décomposition en crayons (p3dfft) et une parallélisation MPI + multithreading. [src] https://casoca.oca.eu/images/LAGRANGE/EcolesThematiques/agat2016/pdf/Yannick_Ponty_12.pdf [vérifié]
- **GHOST** (« Geophysical High-Order Suite for Turbulence ») :
  - pseudo-spectral, domaines périodiques 2D/3D ; MHD compressible et incompressible, Hall-MHD, Boussinesq tournant ou stratifié, etc. ;
  - MPI + OpenMP, CUDA ; Fortran 90/95 ; mise à l'échelle annoncée jusqu'à 100 000 cœurs ; dépôt https://github.com/pmininni/GHOST ;
  - [src] https://wp.df.uba.ar/mininni/ghost [vérifié ; la page renvoie bien vers github.com/pmininni/GHOST]
  - Référence : Mininni, Rosenberg, Reddy, Pouquet (2011), « A hybrid MPI–OpenMP scheme for scalable parallel pseudospectral computations for fluid turbulence », *Parallel Computing* **37**(6–7), 316–326, DOI 10.1016/j.parco.2011.05.004. [vérifié]
- **Dedalus** : « solves differential equations using spectral methods », en Python, libre et open source. [src] https://dedalus-project.org/ [vérifié]
  - Référence : Burns, Vasil, Oishi, Lecoanet, Brown (2020), « Dedalus: A flexible framework for numerical simulations with spectral methods », *Phys. Rev. Research* **2**, 023068, DOI 10.1103/PhysRevResearch.2.023068. [vérifié]

### 5.3 Jeux de données MHD publics

- **JHTDB « Forced MHD turbulence » (mhd1024)** :
  - DNS de la MHD incompressible 3D, domaine 2π périodique, **1024³** ;
  - Pm = 1 avec ν = 1,1×10⁻⁴ ;
  - forçage Taylor–Green stationnaire f = f₀[sin(k_f x)cos(k_f y)cos(k_f z) eₓ − cos(k_f x)sin(k_f y)cos(k_f z) e_y] avec f₀ = 0,25 et k_f = 2 ;
  - ε_u = 1,1×10⁻², ε_b = 2ε_u ; Re_λ^u ≈ 186, Re_λ^b ≈ 144 ; ⟨b²⟩/⟨u²⟩ = 1,1 ;
  - [src] Kuzzay, Alexandrova, Matteini (2019), *Phys. Rev. E* **99**, 053202, DOI 10.1103/PhysRevE.99.053202, arXiv:1812.06031 : https://arxiv.org/pdf/1812.06031 [vérifié : §III.A de l'article]
  - 1024 pas de temps stockés après l'état stationnaire : confirmé par Lemoine (2022), arXiv:2210.01038, annexe B [vérifié]. ⚠ Lemoine décrit un forçage par « an external random force », alors que Kuzzay écrit « steady Taylor-Green body force » : divergence à trancher sur la page officielle.
  - Page officielle https://turbulence.pha.jhu.edu/Forced_MHD_turbulence.aspx : toujours 503 lors de la contre-vérification, README-MHD.pdf aussi (voir §9).
- **The Well (PolymathicAI)**, jeux **MHD_64** et MHD_256 :
  - MHD **compressible isotherme** sans autogravité (milieu interstellaire diffus) ;
  - généré en 256³, puis sous-échantillonné en 64³ par filtre passe-bas idéal ;
  - 10 CI × 10 combinaisons de paramètres = 100 trajectoires ; 100 pas de temps (Δt = 0,01, t ∈ [0, 1]) ;
  - Mₛ ∈ {0,5 ; 0,7 ; 1,5 ; 2,0 ; 7,0}, M_A ∈ {0,7 ; 2,0} ; CL périodiques ; environ 71,6 Go (MHD_64) ;
  - simulations d'origine : Burkhart et al. (2020) *ApJ* **905**(1), 14 (catalogue CATS), DOI 10.3847/1538-4357/abc484 [vérifié] ;
  - [src] https://huggingface.co/datasets/polymathic-ai/MHD_64/blob/main/README.md [vérifié : tous les chiffres ci-dessus retrouvés dans le README]
  - Article : Ohana et al. (2024), « The Well: a Large-Scale Collection of Diverse Physics Simulations for Machine Learning », *NeurIPS 2024 (Advances in Neural Information Processing Systems 37)*, 44989–45037, arXiv:2412.00568 (Crossref). [vérifié ; DOI 10.52202/079017-1430]
  - ⚠ Compressible et non dynamo : peu adapté aux contraintes ∇·u = 0 de l'offre, mais utile comme banc ML.

---

## 6. Dynamo Taylor–Green à faible Pm

**Ponty, Mininni, Montgomery, Pinton, Politano, Pouquet (2005).** « Numerical study of dynamo action at low magnetic Prandtl numbers ». *Phys. Rev. Lett.* **94**, 164502. DOI 10.1103/PhysRevLett.94.164502. arXiv:physics/0410046. [vérifié : texte, Table I et éq. (1)–(4) relus]
[src] https://arxiv.org/pdf/physics/0410046

- **Forçage Taylor–Green (éq. 3)** : F_TG(k₀) = 2F [sin(k₀x)cos(k₀y)cos(k₀z), −cos(k₀x)sin(k₀y)cos(k₀z), 0]ᵀ, avec **k₀ = 2** (k_f = k₀√3).
  - Rotation différentielle et hélicité locales, mais hélicité nette nulle dans la boîte 2π ; petites échelles statistiquement non hélicitaires.
  - Analogie avec les expériences de Maryland, Cadarache et Wisconsin.
- **Résultats** :
  - dynamos de P_M = 1 à P_M = 10⁻² ;
  - **R_M^c = 30 à P_M = 1** ; **70 à P_M = 0,5** ; **226 à P_M = 0,3** ; puis légère baisse, **≈ 200 à P_M = 0,2** (DNS) ;
  - LAMHD : plateau au-dessus de 250 jusqu'à P_M = 0,09 (surestimation systématique) ;
  - **LES : R_M^c ≈ 150 constant pour 10⁻² ≤ P_M ≤ 10⁻¹** ;
  - spectre de Kazantsev k^{3/2} en phase linéaire.
- **Table I (extraits)** : code, N, R_V, L, R_M^c, 1/P_M^c

| Code | N | R_V | L | R_M^c | 1/P_M^c |
|---|---|---|---|---|---|
| DNS | 64 | 30,5 | 2,15 | 28,8 | 1,06 |
| DNS | 64 | 128 | 1,9 | 62,5 | 2,05 |
| DNS | 256 | 675 | 1,35 | 226,4 | 2,98 |
| DNS | 512 | 874,3 | 1,31 | 192,6 | 4,54 |
| LAMHD | 512 | 3052,3 | 1,22 | 276,4 | 11,05 |
| LES | 128 | 2236,3 | 1,37 | 151,9 | 14,72 |
| LES | 512 | 12550 | 1,42 | 154,6 | 81,19 |

**Ponty, Mininni, Pinton, Politano, Pouquet (2007).** « Dynamo action at low magnetic Prandtl numbers: mean flow versus fully turbulent motions ». *New J. Phys.* **9**, 296. DOI 10.1088/1367-2630/9/8/296. arXiv:physics/0601105. [vérifié]
[src] https://arxiv.org/pdf/physics/0601105

- **Dynamo cinématique sur l'écoulement moyen TG** : **deux branches**, croissance positive pour R_M,kin ∈ [22, 51], puis pour R_M,kin > R_M^c3, où **R_M^c3 ≈ 158** (à ±15 % près). L_kin ≈ π, U_kin ≈ 3,0.
- **Seuil dynamique** :
  - à faible R_V, il se situe dans la fenêtre basse ;
  - pour **R_V > 200**, il se situe au voisinage immédiat de la branche haute ;
  - en turbulence développée, il est bien approché par le seuil cinématique de la branche haute calculé sur l'écoulement moyen.
- **Rappel des auteurs** : le seuil laminaire est multiplié par environ 8 quand l'instationnarité se développe (travaux antérieurs). [vérifié : « eightfold increase »]

---

## 7. Divergences et réserves (le non confirmé est regroupé au §9)

1. **Fenêtres ABC « 8,9 < Rm < 17,5 » et « > 27 »** : confirmées dans Archontis et al. 2003, qui les attribuent à « Galloway et al. 1984 » [vérifié dans Archontis 2003]. Cohérentes avec Alexakis 2011, une fois sa normalisation R_M = √3/η prise en compte [vérifié]. Bouya & Dormy placent le croisement de modes à Rm1 ∈ [24,05 ; 24,10], « in the stable window reported by Galloway and Frisch [1986] near Rm = 20 » [vérifié]. La lecture directe de Galloway & Frisch et la valeur du taux de croissance maximal restent non confirmées (voir §9).
2. **Arnold & Korkina** : année 1983 (Math-Net.Ru : Vestnik Moskov. Univ. Ser. 1 Mat. Mekh., n° 3, 43–46, reçu le 26/11/1982) ; le diaporama de Galloway (MREP60) écrit « Arnold and Korkina (1984) ». [vérifié]
3. **Stieglitz & Müller 2001** : texte intégral payant, non lu. Les chiffres de Karlsruhe proviennent de Müller et al. 2008 (C. R. Physique) et de Rädler & Brandenburg. [vérifié : métadonnées et résumé Crossref]
4. **Rädler & Brandenburg** : *Phys. Rev. E* **67**, 026401 (2003), DOI 10.1103/PhysRevE.67.026401. [vérifié : correction reportée au §1.2]
5. **Riga** : motorisation de 2×55 kW (PRL 2000) contre 2×100 kW (C. R. Physique 2008) ; Gailitis et al. 2018 : « two DC-motors, which can be driven up to 200 kW ». Première tentative datée de 1986 (2008) ou de 1987 (PRL 2000 et JPP 2018). Débit « 0,6 m³/s » dans le PRL 2000. [vérifié dans les trois textes]
6. **VKS** [vérifié] :
   - trois définitions de Rm coexistent : K µ0σR²Ω avec K = 0,6 (2007–2009) ; µ0σ2πF R_imp R_o (Miralles 2013) ; µ0σ2πf R²_cyl sans K (Nore 2018, qui donne 52–71) ;
   - les valeurs 31, 32, 35, 44 et 52–71 ne sont donc pas directement comparables ;
   - diamètre ou rayon de l'anneau : voir §1.3 ; volume de sodium 150 l (PRL 2007) ou environ 160 L (Berhanu 2007).
7. **Gissinger 2012** [vérifié dans arXiv:1109.6569v2] :
   - « dissipative for µ > 1+ν » (coquille probable : la divergence µ − ν − 1 est négative pour µ < 1 + ν) ;
   - Γ = 0,1 dans la légende de la Fig. 11 (coquille probable) ;
   - « t > 1.10⁵ » lu comme 1×10⁵ ;
   - exposant γ ≃ 1/2 donné avec réserve par l'auteur.
   - La version éditeur (EPJB) n'a pas été consultée : les coquilles n'y sont peut-être pas.
8. **Pétrélis et al. 2009** : α₁ = −185 Myr⁻¹, α₀/α₁ = −0,9, θ₀ = 0,3, Δ/√|α₁| = 0,2, confirmés à la fois sur ar5iv et dans le PDF arXiv v3. [vérifié]
9. **Théorème de Zel'dovich** : énoncé exact non lu dans l'original (seulement les métadonnées JETP) ; formulation reprise de Tobias §2.4.3. [vérifié : métadonnées et formulation de Tobias]
10. **Hélicités** : la phrase « l'hélicité cinétique n'est pas invariante en MHD » est une déduction standard, cohérente avec Tobias (« In the presence of a magnetic field these quantities are no longer conserved ») et Pouquet et al. 2019 (liste des invariants MHD sans H_V). [vérifié]
11. **JHTDB MHD** : paramètres principaux confirmés via Kuzzay et al. 2019 ; 1024 pas de temps confirmés via Lemoine 2022 ; nature du forçage divergente (Taylor–Green stationnaire chez Kuzzay, « external random force » chez Lemoine). Le reste est au §9.

---

## 8. URLs consultées (sources primaires)

**Expériences**
- Riga 2000 : https://arxiv.org/pdf/physics/9912026
- Riga 2001 : https://arxiv.org/pdf/physics/0010047
- Riga, historique 2008 : https://arxiv.org/pdf/0807.0305
- Riga 2018 (J. Plasma Phys.) : https://arxiv.org/pdf/1801.01749
- Karlsruhe 2008 : https://comptes-rendus.academie-sciences.fr/physique/item/10.1016/j.crhy.2008.07.005.pdf
- Rädler & Brandenburg : https://arxiv.org/pdf/physics/0208023
- VKS PRL 2007 : https://www.phys.ens.fr/~petrelis/pdf/P1PRL_98_044502.pdf
- Berhanu 2007 : https://arxiv.org/pdf/physics/0701076
- Monchaux 2009 : https://www.phys.ens.fr/~petrelis/pdf/Monchaux2009_PoF.pdf
- Boisson 2012 : https://perso.ens-lyon.fr/nicolas.plihon/Publis/Boisson_NJP_14_013044.pdf
- Miralles 2013 : https://perso.ensta-paris.fr/~boisson/papiers/PhysRevE.88.013002.pdf

**Simulations VKS**
- Giesecke 2010 : https://arxiv.org/pdf/0907.0123v2
- Nore 2016 : https://www.math.uh.edu/~lcappan/PUBLICATIONS/Nore_castanon_cappanera_guermond_EPL_2016.pdf
- Nore 2018 : https://www.math.uh.edu/~lcappan/PUBLICATIONS/Nore_etal_VKS_JFM_2018.pdf
- Kreuzahler 2017 : https://arxiv.org/pdf/1706.00260

**Renversements**
- Pétrélis & Fauve 2008 : https://www.phys.ens.fr/~petrelis/pdf/petrelisjcm2008.pdf
- Pétrélis et al. 2009 : https://www.phys.ens.fr/~petrelis/pdf/renversementsPRL2009.pdf et https://ar5iv.labs.arxiv.org/html/0806.3756
- Gissinger et al. 2010 : https://www.phys.ens.fr/~gissinger/pdf/Gissinger_etal2010.pdf
- Gissinger 2012 : https://arxiv.org/pdf/1109.6569 et https://ar5iv.labs.arxiv.org/html/1109.6569

**Dynamos cinématiques**
- ABC : https://arxiv.org/pdf/1206.5186 ; https://arxiv.org/pdf/astro-ph/0204208 ; https://mathnet.ru/eng/vmumm3491
- Ponomarenko : https://arxiv.org/pdf/0709.0234 ; https://arxiv.org/pdf/astro-ph/0301222

**Théorie MHD et conditions aux limites**
- Tobias : https://arxiv.org/pdf/1907.03685
- Pouquet et al. 2019 : https://arxiv.org/pdf/1807.03239
- Krstulovic et al. 2011 : https://arxiv.org/pdf/1101.1078
- Pseudo-vide : https://www.arxiv.org/pdf/2009.02171v2

**Taylor–Green**
- Ponty 2005 : https://arxiv.org/pdf/physics/0410046
- Ponty 2007 : https://arxiv.org/pdf/physics/0601105

**Codes et données**
- SFEMaNS : https://people.tamu.edu/~guermond/SFEMaNS/html/doc_intro.html
- GHOST : https://wp.df.uba.ar/mininni/ghost
- Dedalus : https://dedalus-project.org/
- Diaporama Ponty : https://casoca.oca.eu/images/LAGRANGE/EcolesThematiques/agat2016/pdf/Yannick_Ponty_12.pdf
- JHTDB via Kuzzay : https://arxiv.org/pdf/1812.06031
- The Well : https://huggingface.co/datasets/polymathic-ai/MHD_64/blob/main/README.md

**Métadonnées**
- Crossref : https://api.crossref.org/works/<DOI> pour chaque DOI cité.

**Ajoutées lors de la contre-vérification**
- Métadonnées arXiv (API export.arxiv.org) pour les 25 identifiants arXiv cités : titres, auteurs, DOI et journal-ref concordent.
- Riga 2018 (JPP 84, 735840301) : https://arxiv.org/pdf/1801.01749
- Alexakis 2011 : https://arxiv.org/pdf/1105.3692
- Kaiser & Tilgner 2014 : https://arxiv.org/pdf/1210.7122
- Diaporama Galloway (MREP60) : https://mhd.ens.fr/MREP60/ols/Galloway.pdf
- Lemoine 2022 (JHTDB, 1024 pas de temps) : https://arxiv.org/pdf/2210.01038
- Arnold & Korkina : https://www.mathnet.ru/eng/vmumm3491
- Ponomarenko 1973 : https://api.crossref.org/works/10.1007/BF00853190
- SFEMaNS, licence : https://people.tamu.edu/~guermond/SFEMaNS/html/about.html
- The Well, README brut : https://huggingface.co/datasets/polymathic-ai/MHD_64/raw/main/README.md

---

## 9. Non confirmé

*Entrées que ni le chercheur ni le vérificateur n'ont pu confirmer dans une source primaire ouverte. Ne pas les utiliser sans nouvelle vérification.*

1. **Code « CUBBY » de Ponty** [NON CONFIRMÉ] : aucune source trouvée (recherche web refaite par le vérificateur, sans résultat). Les sources ouvertes ne citent que **MIRA** (Mininni) et **LaTu** (Homann) dans le diaporama de Ponty (AGAT 2016) ; Kreuzahler 2017 et Ponty 2005 ne nomment pas leur code.
2. **JHTDB MHD, paramètres secondaires** [NON CONFIRMÉ] : intervalle t ∈ [0 ; 2,56], η = 1,1×10⁻⁴ indépendamment de Pm = 1, et échelle d'injection (L = π/2 chez Kuzzay, « stirring scale equal to 0.5 in units of the size of the simulation box » chez Lemoine). La page officielle (turbulence.pha.jhu.edu) et README-MHD.pdf (turbulence.idies.jhu.edu) répondent toujours 503 ou présentent un certificat auto-signé.
3. **Riga, débit 0,67 m³/s** [NON CONFIRMÉ] : valeur attribuée à une page HZDR non relue ; seul le « 0,6 m³/s » du PRL 2000 est vérifié.
4. **ABC 1:1:1, lecture primaire des fenêtres et taux de croissance maximal** [NON CONFIRMÉ] : Galloway & Frisch 1984 (GAFD 29, 13–18) et 1986 (GAFD 36, 53–83) restent inaccessibles (tandfonline : 403). Les bornes 8,9 / 17,5 / 27 ne sont donc vérifiées que via Archontis 2003. La **valeur** du taux de croissance maximal de la 1re fenêtre (atteint vers Re_m ≈ 12 selon Archontis, d'après Galanti et al. 1993) n'est pas connue.

