# Library gaps — figure « cadre »

- **Turbine à pales (impeller)** : aucune partie de la bibliothèque ne dessine un disque à pales courbes dans une vue oblique. Dessiné dans `figure/parts.js` (`vks`) sur `L.obliqueProj` + `L.cylinder3` (disque) + quadrilatères projetés pour les 8 pales, triés en profondeur. Candidat : `L.impeller3(p, P, c, axis, r, {blades, height, curvature, side})`.
- **Cylindre de verre avec coupe méridienne** : `L.cylinder3` est opaque (corps = enveloppe convexe). Pour un récipient translucide montrant un plan méridien, il a fallu peindre à la main face arrière, contenu, puis face avant translucide. Candidat : `L.glassCylinder3(..., {contents(g)})` qui ordonne arrière / contenu / avant.
- **Lignes de champ orientées sur une carte** : pas de partie « isolignes + chevrons » ; `potentialMap` / `fieldLines` dans `parts.js` (contours calculés avec matplotlib, chevrons via `L.chevron`).
- **Flèche courbe de rotation autour d'un axe en 3D** : faite avec un arc d'ellipse projeté + `L.chevron` (`rot` dans `vks`).
- **`L.blockArrow` sans option `dash`** : le contour en tirets de la flèche creuse a été posé avec `setAttribute('stroke-dasharray', …)`.
