# Spec — figure « plan-these »

## Structure (squelette)
**Grille feuille de route** : une table à deux dimensions nommées (P13) — colonnes = cinq paliers de bancs d'essai rangés par complexité croissante (gauche → droite), lignes = trois axes scientifiques — coiffée d'un escalier (les paliers, avec une vignette de chaque système) et suivie d'une frise de 36 mois. Pourquoi : le contenu est un produit croisé (chaque axe traverse chaque palier) ; une grille montre d'un coup où chaque axe devient nouveau et où il ne s'applique pas (cases vides signifiantes : axe 1 au palier 0, axe 3 au palier 1). La frise est un axe littéral du temps (P8). Les débouchés ferment la ligne à droite : axes → boîte à outils → débouchés.

## Concepts (design, standard : un retenu)
**A. Escalier + bandes + frise (retenu).** En haut, cinq marches grises montant vers la droite, une vignette par banc (série *D*(*t*) calculée, carte 2D de E2, cube du mode ABC de E3, cuve VKS, cylindre en précession). Au milieu, trois bandes teintées (bleu, orange, vert) traversent les colonnes, avec une étiquette courte à chaque palier où l'axe apporte quelque chose de nouveau ; trous signifiants. En bas, frise : années, barres par palier (même pastille numérotée que les marches), jalons (losanges d'article à la couleur de leur axe, carrés de version du code). À droite : boîte à outils MilaDy où arrivent les trois bandes, puis débouchés.
**B. Tableau.** Mêmes lignes et colonnes, cases remplies de texte, frise de Gantt classique dessous, vignettes dans l'en-tête de colonne. Plus complet, mais lu comme un tableau de texte (densité > 0,6 mot/cm²), aucune entrée visuelle, et le « vide » de certaines cases se perd dans le texte.
**C. Escalier temporel.** L'axe horizontal est le temps (36 mois) ; chaque marche couvre la période où le palier est étudié ; les axes sont des bandes au-dessous, sur la même échelle de temps. Une seule échelle horizontale, mais les paliers 0–1 (courts) deviennent illisibles, les recouvrements de paliers cassent l'escalier, et la complexité se confond avec la date.

| Critère | A | B | C |
|---|---|---|---|
| Message en 5 s (échelle + 3 axes + 36 mois) | 4 | 2 | 3 |
| Fidèle à la note et à la description | 5 | 5 | 3 (complexité ≠ date) |
| État du système dessiné, pas seulement des noms (P1) | 4 (vignettes de données réelles du stage) | 2 | 3 |
| Lien abstraction ↔ réalisation (P2) / comparaison (P3) | 4 (même gabarit de colonne pour chaque palier) | 3 | 2 |
| Expliquer plutôt qu'impressionner (P4) | 4 | 4 | 3 |
Retenu : **A**.

---

**Takeaway (one sentence):** la thèse monte une échelle de cinq bancs d'essai, du modèle à 3 modes à DRESDYN, et fait avancer à chaque palier trois axes (contraintes dures, contraintes en loi et symétries, seuil et renversements), en 36 mois jalonnés d'articles et de versions du code MilaDy, vers la réduction de modèle et l'assimilation.
**Size:** width 183 mm × height ≈ 120 mm
**Hero:** l'escalier des cinq bancs ; vignettes VKS, DRESDYN et boîte périodique en vector 3D (`L.cylinder3` avec ombrage, `L.circle3`, `L.obliqueBox` + faces cartographiées), illustrated finish activé ; vignettes 0 et 1 calculées (série et carte). Route vector3d (Blender absent ; à cette taille, 20 mm par vignette, le dessin vectoriel suffit et reste dans le style des parties plates).

## Panels
| Panel | Job (one line) | Position / share of the figure |
|---|---|---|
| (unique, sans lettre) | feuille de route : échelle, axes, calendrier, débouchés | toute la figure |
| — échelle | situer les cinq bancs par complexité, avec ce qu'ils sont | haut, ≈ 40 % |
| — bandes | dire ce que chaque axe devient à chaque palier | milieu, ≈ 30 % |
| — frise | quand, et quels jalons | bas, ≈ 25 % |
| — colonne droite | boîte à outils et débouchés | droite, ≈ 15 % de la largeur |

## Components
| Panel | Component | Label (exact text) | Look (type, colour role, 2D/3D) | Source |
|---|---|---|---|---|
| échelle | marches 0–4 | pastilles "0"…"4" | blocs gris clair, arête supérieure plus foncée, pastille gris foncé à chiffre blanc | draw (`L.rect`, `L.circle`) |
| échelle | vignette 0 | "Modèles réduits" / "Gissinger, DQVU" ; "E1" | série *D*(*t*) encre sombre, ligne 0 en tirets | compute (`make_data.py`, [G12]) |
| échelle | vignette 1 | "MHD 2D" / "périodique" ; "E2" | carte *j* en niveaux de gris + isolignes de *a* | compute (données E2), `L.pixelImage` |
| échelle | vignette 2 | "Dynamos 3D" / "périodiques" / "ABC, Taylor–Green" ; "E3" | cube oblique, |**B**| du mode ABC sur 3 faces, flèches de périodicité | compute (données E3) + draw (`L.obliqueBox`, faces) |
| échelle | vignette 3 | "VKS" / "SFEMaNS, LATU" | cuve translucide, 2 turbines gris foncé à 8 pales, flèches de contrarotation | draw (`L.cylinder3`, `L.circle3`) d'après la fiche |
| échelle | vignette 4 | "DRESDYN" / "précession, HZDR" | cylindre incliné, axe de précession vertical, plateau, deux flèches de rotation | draw (`L.cylinder3`, `L.circle3`) d'après la fiche |
| échelle | flèche diagonale | "complexité croissante" | trait gris fin parallèle à l'escalier | draw |
| bandes | en-têtes de ligne | "Axe 1" / "Contraintes dures 3D", etc. | texte, "Axe k" en gras à la couleur de l'axe | draw |
| bandes | bandes | — | teinte claire de l'axe, bord gauche net, extrémité droite en flèche vers la boîte à outils | draw |
| bandes | stations | voir facts.md (grille) | pastille blanche bord coloré, texte foncé de la teinte | draw |
| bandes | trous | "sans objet", "pas de dynamo 2D" | tirets fins gris, italique gris | draw |
| droite | boîte à outils | "Boîte à outils MilaDy" | cadre gris arrondi, glyphe « code » (carré) | draw |
| droite | débouchés | "Débouchés", "Réduction de modèle", "Assimilation (TorchDA)" | deux mini-glyphes gris (cartes → modes ; ensemble resserré sur observations) | draw |
| frise | années | "Année 1/2/3" | bandeau à trois segments gris alternés | draw |
| frise | barres de palier | pastilles 0–4, "rédaction" | barres grises fines | draw (calendrier proposé) |
| frise | jalons | légende "article", "version du code", "soutenance" | losanges couleur d'axe, carrés gris foncé, drapeau | draw |
| frise | graduation | "0"…"36", "mois" | ticks tous les 6 mois | draw |

## Relations
| From | To | Kind | Drawn as |
|---|---|---|---|
| bande axe 1, 2, 3 (fin) | boîte à outils | flow | pointe de bande (chevron) entrant dans la boîte (`F.drew`) |
| boîte à outils | débouchés | flow | flèche grise (`L.connect`) |
| marche k | barre k de la frise | identité | même pastille numérotée (pas de trait) |
| article (frise) | axe (bandes) | identité | même couleur |
| version du code (frise) | boîte à outils | identité | même glyphe carré |

## Conventions
- Gauche → droite = complexité croissante (échelle) et temps (frise) ; les deux sont des axes séparés, la frise a sa graduation.
- Bleu `#0072B2` = axe 1 (contraintes par échantillon, C1) ; orange `#E69F00` = axe 2 (en loi, C3–C4) ; vert `#009E73` = axe 3 (seuil, paramètre de contrôle) : clé des figures « taxonomie » et « cadre ».
- Bancs, frise, boîte à outils : gris neutres (contexte, P16).
- Vecteurs en gras (**u**, **B**, **A**), scalaires et paramètres en italique (*a*, *D*, *Rm*, *Po*), notations de `specs/notations.md`.

## Negative constraints (must not appear)
- aucun résultat de thèse affiché comme acquis (pas de *Rm*_c chiffré, pas de courbe d'erreur) ;
- pas de dates calendaires (mois relatifs seulement) ;
- pas de champ **B** coloré en vermillon dans les vignettes (la couleur est réservée aux axes) ;
- pas de phrase sur la figure ; explications dans `caption.md`.
