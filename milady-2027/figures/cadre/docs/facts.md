# Facts — figure « cadre »

Sources : [D] description technique de l'appelant ; [N] note théorique `specs/theorie-brief.md` ; [Not] `specs/notations.md` ; [W] références web lues pour l'objet réel (Gissinger et al., arXiv:0804.1923 ; Boisson et al., NJP 14, 013044, 2012 ; Miralles et al., arXiv:1504.03879) ; [M] mémoire, non vérifiée ; [C] calcul de `figure/data/make_data.py`.

## Enregistrement géométrique : cylindre VKS (dessiné en 3D vectorielle)
- Cylindre intérieur de rayon R ; turbines coaxiales à z = ±0,90 R (VKS2 : écart 371 mm, R = 206 mm → 185,5/206 = 0,90) [W].
- Turbines : disques de rayon 0,75 R (154 mm) en fer doux, 8 pales de hauteur 0,20 R (41,2 mm) tournées vers le plan médian [W]. Courbure des pales (TM73, ≈ 24°) [M] : dessinée légèrement courbe, sans prétention de mesure.
- Contrarotation : les deux turbines tournent en sens opposés [W]. Sens absolu : non spécifié → flèches opposées, sens arbitraire.
- Écoulement moyen : éjection radiale centrifuge au niveau de chaque disque, retour le long de la paroi vers le plan médian, convergence radiale dans le plan médian, puis remontée le long de l'axe vers chaque turbine : deux cellules poloïdales [W, M]. Rotation différentielle (toroïdale) contrarotative, cisaillement fort dans le plan médian [W].
- Champ dynamo VKS : composante poloïdale dominée par un dipôle axial, plus une composante azimutale [W]. Dessin : dipôle axial seul (lignes poloïdales), refermées à l'extérieur.
- Axe : vertical dans le dessin (comme les esquisses numériques de Gissinger et al.) ; l'orientation de l'installation réelle n'est pas un enjeu du schéma [W].
- Ce qui est devant quoi : paroi avant du cylindre (verre teinté, translucide) devant le plan méridien ; turbine du haut devant le haut du plan, turbine du bas derrière le bas du plan (vue légèrement plongeante, élévation 20°).
- Inconnu / laissé vague : couche de sodium au repos, anneau médian, moteurs (non dessinés).

## Modèles calculés [C] (illustratifs)
- Flot latent : base N(0, 1) → mélange symétrique ½N(−1,55 ; 0,30²) + ½N(1,55 ; 0,30²) ; couplage optimal 1D (carte monotone) → trajectoires droites. Avec couplage indépendant, l'écart maximal à la corde vaut 0,47 (trajectoires en S près de 0) : la figure montre le cas « presque droit » visé par [D].
- Potentiels 2D : sommes de Fourier aléatoires périodiques (|k| ≤ 3 pour ψ, ≤ 4 pour a), u = ∇^⊥ψ = (∂_yψ, −∂_xψ) [Not] ; |∇·u| discret = 2·10⁻¹⁵.
- VKS : fonction de courant de Stokes ψ = r²(1 − r²) sin(πz/h), u_r = −r⁻¹∂_zψ, u_z = r⁻¹∂_rψ ; u_z > 0 sur l'axe pour z > 0 (vers la turbine), u_r < 0 dans le plan médian (convergence).
- Dipôle : noyau uniformément aimanté (rayon 0,8 R) ; dehors, lignes r = L sin²θ.
- Loi de ε : ε ~ Gamma(7, ·), moyenne brute 1,14 E[P] ; inclinaison exponentielle exacte e^{−βε} → moyenne 1,00 E[P] ; ESS/N = 0,89. P − ε ~ N(0 ; 0,28²) (identité dE/dt = P − ε, variance non nulle, Corollaire 6 [N]).
- Usages : trois modes de Fourier ; ensemble de 7 trajectoires resserré à 3 observations ; densité de D = même mélange bimodal que le latent.

## Chaînes à l'écran (chaque chaîne est citée ici)
