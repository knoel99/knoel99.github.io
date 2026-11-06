# Parts dessinées hors bibliothèque (figure/parts.js)

- **Turbine à pales courbes (impeller) en 3D** : disque (`L.cylinder3`) + 8 pales courbes en polygones 3D projetés, triées par profondeur. Aucune pièce « impeller / turbine de pompe » dans la bibliothèque (`L.wheel3` a des rayons ajourés, pas des pales debout sur une face).
- **Flèche de rotation autour d'un axe en 3D** (`ringArc`) et **ruban fléché toroïdal** (`ribbonArc`) : arc d'un cercle 3D découpé en partie avant/arrière avec une pointe ; la bibliothèque n'a pas de flèche courbe 3D autour d'un axe.
- **Cuve transparente** (`vesselBack` / `vesselFront`) : `L.cylinder3` en deux passes (volume coloré derrière le contenu, fond proche translucide + contour + reflet devant) ; une option « glass / phantom » de `cylinder3` qui peint le contenu entre deux couches éviterait ce découpage.
- **Boucles poloïdales** : lignes de niveau analytiques d'une fonction de courant de Stokes dans un plan méridien, tracées par le projecteur.
- **Glyphe de polarité** (petit cylindre + flèche du dipôle) : composé de `L.rect`, `L.line`, `L.arrow`.
