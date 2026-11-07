# Parties dessinées à la main — figure « plan-these »

- **Flèche de rotation 3D** (`rotArrow` dans `figure.js`) : arc de cercle autour d'un axe quelconque projeté, avec pointe pleine. `L.arrow` ne suit pas une ellipse projetée ; aucune partie de la bibliothèque ne dessine une rotation autour d'un axe 3D (turbines, précession).
- **Projection orthographique par azimut/élévation** (`orthoProj`) : `L.obliqueProj` prend les vecteurs d'axes ; une fabrique « az, el » serait utile pour les objets tournés (cuve VKS, DRESDYN).
- **Turbine à pales** (VKS) : disque `L.circle3` + 8 pales en `polygon` ; pas de partie « impeller » dans `engine/`.
- **Cylindre en précession sur plateau** (DRESDYN) : composé de `L.cylinder3` (plateau, montants, cylindre incliné) ; pas de partie dédiée.
- **Champ échantillonné sur les faces d'un cube** : boucle de quadrilatères via `faces.k.quad` avec échantillonnage bilinéaire périodique (`bilinP`) ; une option `fn(u, v)` de `L.obliqueBox` pour peindre une carte sur une face éviterait la boucle.
- **Pastille de texte à largeur mesurée** (`pill`) et **feuille de route en bandes** : pas de partie « roadmap / Gantt » dans `engine/`.
