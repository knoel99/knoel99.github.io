# Auto-critique (review=own, depth=standard)

## Passe de fidélité (P28) — chaque choix contre la note / la description
| Choix dessiné | Vérification | Verdict |
|---|---|---|
| C1, C2 sous « Vraie pour chaque échantillon » ; C3, C4 sous « Vraie pour la loi » | note §1, colonne « Vraie pour » | conforme |
| C1 : échantillons sur une droite *S*, projection orthogonale *P* (angle droit) | Prop. 2 (projecteur orthogonal sur *S*), Leray = projecteur L² sur les champs solénoïdaux | conforme |
| C1 mécanisme : « Potentiels **B** = ∇×**A** », « Projection de Leray » | description + Prop. 1 | conforme |
| C2 : la moyenne (point creux) de deux points admissibles tombe hors de *c* = 0 | Prop. 3 (c(𝔼[x₁∣x_t]) ≠ 𝔼[c(x₁)∣x_t] = 0) | conforme |
| C3 : deux nuages images miroirs ; échantillons NON appariés | note §1 « vraie pour : la loi » ; un instantané n'est pas symétrique | conforme |
| C3 mécanisme : « *v*_θ équivariant », « Loi de base invariante » | Prop. 4 | conforme ; *v*_θ non gras (notations.md) |
| C4 : 𝔼_μ[ℒφ] = 0 ; « Bilan d'énergie », 𝔼[ε] = 𝔼[*P*] | description, Prop. 5 | conforme |
| b, loi vraie : étalée, moyenne 0 | description | conforme (calculée) |
| b, projection : Dirac en 0, variance 0 | description, Cor. 6 | conforme |
| b, correction : étalée, moyenne recentrée en 0, proche mais pas égale à μ | description, Prop. 7 (I-projection de *q*_θ, pas de μ) | conforme (calculée) |
| Poids *w*_i décroissants vers la droite | *q*_θ est décalé à droite, β < 0 | conforme (calculé) |
| Aucun nombre sur les axes de b | brief, P29 | conforme ; « Allures illustratives » sur la figure |

Écart conscient : l'exemple C1 dit « Conditions aux limites » sans « linéaires homogènes » (place dans la colonne de 25,5 mm) ; l'en-tête « Locale linéaire » et la légende portent la précision.

## Grille (style.md §4), notes 1–5
| Critère | a | b | Raison d'une note < 5 |
|---|---|---|---|
| 1. Lisible à la taille finale | 4 | 4 | étiquettes 7 pt à 183 mm (plafond maison 8 pt, la largeur est imposée) ; petits multiples de 19,5 mm |
| 2. Message | 4 | 5 | a est un tableau : il se lit, il ne se voit pas d'un coup ; la teinte bleu/orange porte le groupe |
| 3. Fidèle | 4 | 5 | « Conditions aux limites » sans « linéaires » |
| 4. Correct | 5 | 5 | |
| 5. Liens | 5 | 5 | clé de couleur partagée, coin de zoom C4 → b, glyphe « point = échantillon » commun |
| 6. Économie | 4 | 4 | 0,64 mot/cm² (> 0,45) : densité inhérente à une taxonomie dont l'utilisateur fixe le contenu ; les pastilles 𝔼/Var de b répètent en symboles ce que montrent les triangles et le Dirac |
| 7. Facture | 5 | 4 | anneaux de l'entonnoir (b, milieu) légèrement jointifs au centre |

## Problèmes relevés puis corrigés
1. Rangées d'échantillons en points : chevauchement au centre et rangée « poids » illisible → tiges (masses de Dirac pondérées), *N* = 7.
2. Flèche de recentrage sous l'axe de b-droite trop petite (1,8 mm) → supprimée (les deux triangles suffisent).
3. Coin de zoom vers une zone vide → coin vers le graphe « Loi vraie ».
4. « **B** → −**B** » : flèche minuscule dans la police → « ↦ ».
5. Point de C2 confondu avec la barre de l'écart de Jensen → points déplacés.
6. Triangles sans nom → étiquette « moyenne » (une fois) ; « d*E*/d*t* » gardé une seule fois (axe partagé).
7. μ non identifiable dans b-milieu et b-droite → étiquette « μ » sur la référence pointillée.

## WARN du gate laissés
- « text is small » : largeur 183 mm imposée ; à 183 mm aucune taille ≤ 8 pt (plafond journal) ne passe le seuil (8,6 pt).
- « 0,64 mot/cm² » : chaque chaîne nomme une chose ou est une formule (aucune phrase) ; le contenu C1–C4 (formes, exemples, mécanismes) est demandé verbatim.
