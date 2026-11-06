# Passe critique (faite par moi-même, review=own)

## Fidélité (P28) : chaque compte, polarité, sens, ordre, connexion
| Élément | Dessin | Contrôle |
|---|---|---|
| Nombre de turbines | 2, une à chaque extrémité, en retrait des fonds | conforme [M07] |
| Pales | 8 par turbine, courbes, sur la face fluide | conforme [M07] ; sens de courbure vs rotation non fixé (inconnu, gardé vague) |
| Contrarotation | flèches grises opposées (gauche : rotation +x, droite : −x) | conforme |
| Cellules toroïdales | rubans de sens opposés, chacun dans le sens de sa turbine | conforme |
| Recirculation poloïdale | 4 boucles ; le long de l'axe vers la turbine, radialement vers la paroi le long de la turbine, retour le long de la paroi vers le plan médian, retour vers l'axe au plan médian | conforme à la description de l'appelant (flèches vérifiées sur zoom) |
| Champ | dipôle axial, **B** selon +x dedans, retour −x dehors (flèches au plan médian) | conforme ; source qualitative (caption) |
| Causalité | flèche « effet dynamo » de **u** vers **B** (F.relate + L.connect, vérifiée par le gate) | conforme |
| D(t) | − → + (excursion) → − ; plateaus longs, basculements brefs | conforme à la demande |
| Polarité des glyphes de b | ← pour D < 0, → pour D > 0, même convention que a (D > 0 ⇔ **B** selon +x) | conforme |
| Excursion | revient à la même polarité, ne croise pas 0 | conforme |
| Plan (Q, D) | ±(D*, Q*) symétriques ; renversements traversant D = 0 avec Q ≠ 0 ; pas de passage par l'origine | conforme |
| Sens de parcours | les deux renversements tournent dans le même sens (− → + par Q < 0, + → − par Q > 0) | conforme au modèle (μ_i > 0) |
| Axe D partagé | mêmes pixels pour ±D* dans b et c, tirets continus | mesuré : même fonction Y(d) pour b et c |
| Chiffres | aucun | conforme |

## Problèmes relevés et suites
1. Nuage bruité des phases stationnaires dans c illisible (gribouillis) → remplacé par une tache douce (moyenne et covariance des échantillons, 2σ). Fait.
2. Excursion de c en zigzag, confondue avec le renversement → tracée en aller-retour le long de la courbe lente jusqu'à la phase atteinte ; dit dans la légende. Fait.
3. Flèches de rotation des arbres sans pointe (pointe tombée sur l'arc arrière) → arc avant seul, pointe visible. Fait.
4. Lignes de champ ondulées (boucles de courant discrètes) → distribution volumique plus fine + lissage gaussien. Fait.
5. Repère « dipôle axial » pointant dans le vide → ancré sur un point de la ligne de champ calculée. Fait.
6. Étiquettes 6 pt petites pour 183 mm → 7 pt, titres 8 pt. Fait (le gate garde un WARN : à 183 mm imposé, seul > 8 pt l'éteindrait, ce qui dépasse la charte).
7. Leaders « pales courbes » et « cellules toroïdales » traversent le reflet blanc de la cuve : inévitable pour viser un objet intérieur à travers la paroi transparente ; visuellement sans gêne. Gardé.
8. Rubans toroïdaux et boucles poloïdales se recouvrent au milieu de la cuve (projection d'un écoulement 3D) : rubans translucides, boucles plus fines ; lisible à la taille d'impression. Gardé.

## Grille (style.md §4), 1–5
| | Lisible | Message | Fidèle | Correct | Liens | Économie | Facture |
|---|---|---|---|---|---|---|---|
| a | 4 | 5 | 4 | 4 | 5 | 5 | 4 |
| b | 5 | 5 | 5 | 4 | 5 | 5 | 4 |
| c | 4 | 4 | 4 | 5 | 5 | 5 | 4 |
