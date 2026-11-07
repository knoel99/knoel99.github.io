# Critique personnelle — figure « plan-these »

## Passe 1 (brouillon 0, `docs/draft0.png`), problèmes notés avant toute correction
1. **DRESDYN** : la flèche de précession et l'axe en tirets montent dans l'étiquette « précession, HZDR » (collision) ; le cylindre montre son fond bas comme une ouverture (lu comme un seau) ; un seul montant visible. Rubrique craft 2, correct 3.
2. **Flèche « complexité croissante »** : diagonale flottante qui s'arrête au milieu de la figure (x ≈ 96 mm), sans lien avec les marches ; étiquette coincée entre la flèche et « Modèles réduits ». Craft 2.
3. **Contremarches 3 et 4** : grands aplats gris vides (17–20 mm de haut) ; le coin haut-gauche est vide aussi. Lecture 3.
4. **Boîte à outils** : grand cadre vide (24 × 34 mm) avec une icône et deux mots ; rien ne dit que chaque axe y apporte quelque chose. Liens 3.
5. **Cube ABC** : faces pixelisées (24 × 24 cellules, plus proche voisin), lu comme du bruit plutôt qu'un mode lisse. Correct 3 (P23 : un champ lisse doit avoir l'air lisse).
6. **Étiquettes E1–E3** posées sur les marches et en-tête « E1–E3 : stage M2 » : deux endroits pour une idée.
7. Jalons au-dessus du bandeau des années, loin de la graduation du bas : lisibles grâce aux limites d'années, à garder sous surveillance.
8. Vignettes petites (17 mm) pour un héros : l'escalier est le point d'entrée, il mérite plus de place.

## Corrections (brouillon 1 → version finale), vérifiées dans le rendu
1. DRESDYN redessiné : vue choisie pour que le couvercle supérieur soit visible (cylindre lu comme un tambour), étrier à deux montants (arrière, cylindre, avant), flèche de précession en haut de l'axe vertical en tirets, rotation propre sur le couvercle ; plus de collision (le nom est descendu sur la contremarche).
2. Flèche « complexité croissante » parallèle à l'escalier, sur toute la largeur des paliers, au-dessus des vignettes ; étiquette au-dessus de la flèche, sans croisement.
3. Noms des paliers sur les contremarches (pastille + nom gras + codes) : les aplats gris portent l'information et les vignettes passent de 17 à 21 mm.
4. Boîte à outils : un module par axe, à la couleur de l'axe, à la hauteur de la bande qui y entre ; même glyphe que « version du code » dans la frise.
5. Cube ABC : échantillonnage bilinéaire périodique, 48 × 48 cellules par face ; flèches de périodicité en *x* (sortie par le bord arrière droit, rentrée par le bord avant gauche).
6. Une seule rangée « Acquis du stage » (E1, E2, E3 sous les paliers 0, 1, 2) remplace les étiquettes sur les marches et l'en-tête.
7. Jalons reliés au bandeau des années par une tige courte.
8. Étiquettes secondaires portées de 6 à 6,5 pt ; « cinq paliers » et « cylindrique » retirés (redondants avec l'escalier et la vignette).

## Passe de fidélité (P28) : comptes, ordres, sens, liens
- 5 paliers, dans l'ordre de la description (0 Gissinger/DQVU, 1 MHD 2D, 2 ABC/Taylor–Green, 3 VKS SFEMaNS/LATU, 4 DRESDYN précession/HZDR) : conforme.
- 3 axes, dans l'ordre 1 dures, 2 en loi et symétries, 3 seuil et renversements ; contenu de chaque case conforme à la grille de `facts.md` ; trous : axe 1 × palier 0, axe 3 × palier 1 : conformes.
- E1 → palier 0, E2 → palier 1, E3 → palier 2 ([T] §3) : conforme.
- Série *D*(*t*) : 3 changes de signe nets dans la fenêtre calculée : conforme au modèle (Γ = 0,9 > crise 0,86–0,87).
- VKS : 2 turbines coaxiales, 8 pales chacune, côté fluide, contrarotation (arcs de sens opposés autour du même axe), arbre de chaque côté : conforme à la fiche. Pales dessinées droites (les vraies sont courbes) : simplification signalée dans la fiche.
- DRESDYN : rotation propre + précession autour d'un axe vertical, cylindre de rapport 1 : conforme ; étrier et angle de 60° : schématiques (mémoire, web=off), non affichés.
- Calendrier : barres 1–6, 1–9, 6–20, 15–33, 24–34, rédaction 31–36 ; articles mois 10 (orange), 22 (bleu), 33 (vert) ; code mois 16 et 30 ; soutenance 36 : conforme à `facts.md` (proposé).
- Relations : 3 bandes → 3 modules (F.drew), boîte → débouchés (L.connect) : présentes, dans le bon sens (gate).

## Notes (rubrique style.md §4, 1–5)
| Critère | Note | Raison |
|---|---|---|
| Lisible à la taille finale | 4 | 6,5–7,5 pt à 183 mm : lisible imprimé ; sur une page web étroite, les pastilles restent à ~11 px (WARN du gate) |
| Message | 5 | escalier + trois bandes + frise lisibles sur la vignette de 360 px |
| Fidèle | 5 | tous les éléments de la description ; « codes pseudo-spectraux » en légende |
| Correct | 4 | DRESDYN et pales VKS schématiques (pas de référence visuelle, web=off) |
| Liens | 5 | couleur d'axe → bande → module → losange d'article ; pastilles numérotées marche ↔ barre |
| Économie | 4 | 0,56 mot/cm² (au-dessus de la calibration 0,20–0,45) : chaque mot est un nom exigé par la description |
| Facture | 4 | triangle blanc au-dessus de l'escalier, à gauche (inhérent à la forme en escalier) |

WARN du gate gardés : texte « petit » (format revue 5–7 pt respecté), densité (voir Économie), chiffres blancs sur leurs pastilles foncées signalés « sur art chargé » (c'est leur propre fond, contraste élevé).
