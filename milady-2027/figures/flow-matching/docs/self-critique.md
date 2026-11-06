# Self-critique — figure « flow-matching » (review=own, depth=standard)

## Faithfulness pass (P28) — every count, polarity, direction, order
| Item | Drawn | Source / check | OK |
|---|---|---|---|
| Sens du temps du flot | t = 0 à gauche (bruit), t = 1 à droite (données), dans a, b, c | `specs/notations.md` (t = 1 : données) | ✓ |
| Loi de base | 𝒩(0, 1) en profil ; nuage isotrope 𝒩(0, I₂) en vignette | demande, note §0 | ✓ |
| Loi des données | deux modes ±1,5 de même poids, 17 + 17 échantillons | demande (« deux modes symétriques ± ») | ✓ (premier jet : tirage 22/12 déséquilibré → corrigé) |
| Chemins conditionnels | segments rectilignes entre paires indépendantes ; ils se croisent | demande, note §0 | ✓ |
| Champ marginal | v* exact = 𝔼[x₁ − x₀ ∣ x_t = x], flèches tangentes (1, v) ; signe vérifié en (0,07 ; 2,75) : v = −1,32, flèche vers le bas | note §0 | ✓ |
| Éventail | 7 chemins par (0,4 ; 0,3), 5 vers +, 2 vers − (poids a posteriori 0,72 / 0,28) ; flèche moyenne v* = 0,61, moyenne des 7 pentes 0,59 | calcul | ✓ |
| Symétrie | amas ±(0,85 ; 1,5), réflexion x ↦ −x, double flèche entre eux | note §1, C3 | ✓ |
| Conditionnement | mêmes 10 bruits pour λ₁ et λ₂ ; deux lois symétriques ; trajectoires d'un même λ sans croisement | demande, unicité EDO | ✓ |
| Heun | 4 pas, h = 0,25 ; prédicteur Euler x̃ = xₙ + h k₁ (tirets), correcteur xₙ₊₁ = xₙ + h(k₁ + k₂)/2 (trait plein) | définition du schéma | ✓ |
| Lien b → c | même trajectoire (x₀ = 0,126, λ₂), extrémités cerclées d'encre dans les deux panneaux | choix | ✓ (lien faible, voir plus bas) |

## Problems found and what was done
1. Premier jet : petit réseau v_θ dans b avec une flèche courbe qui finissait dans le vide (marque qui ne pointe sur rien, glyphe générique). → Supprimé ; remplacé par trois en-têtes de colonne « Même bruit » / « Même champ v_θ(x, t, λ) » / « Lois cibles », qui disent la comparaison contrôlée.
2. Têtes des flèches du champ pleinement opaques alors que les fûts s'estompaient (`L.arrow` n'applique `opacity` qu'au fût). → Chaque flèche dans un groupe à opacité.
3. Échantillon de la loi bimodale déséquilibré (22/12) pour une loi symétrique. → Échantillon stratifié 17/17.
4. Étiquettes du panneau b et l'axe t sortaient de la page (gate FAIL). → Hauteur 123 mm, panneaux re-calés.
5. Gate WARN texte petit (6 pt à 136 mm). → Étiquettes à 7 pt (indices à 5 pt), clé de a mesurée et centrée.
6. Panneau c : appels « Trajectoire exacte / Heun / Euler » dont un pointait sur l'endroit où courbe exacte et segment de Heun se confondent (ambigu). → Petite clé de trois styles dans le coin vide ; « Prédicteur » au lieu de « Euler » (un lecteur aurait pu lire un second schéma comparé).
7. Étiquette « v » sur la flèche moyenne : coupait un chemin de l'éventail. → Supprimée (la clé définit la flèche) ; halo blanc sous la flèche moyenne pour la détacher des chemins foncés.
8. « B → −B » : la flèche Unicode de Liberation Sans était minuscule. → Flèche dessinée entre « B » et « −B ».
9. Axes de b et c décalés de 2 mm ; formule de c hors de la ligne d'en-têtes de b. → Alignés.

## Rubric (1–5)
| Panel | Reads | Takeaway | Faithful | Correct | Links | Economy | Craft |
|---|---|---|---|---|---|---|---|
| a | 5 | 5 | 5 | 5 | 4 | 4 | 4 |
| b | 5 | 5 | 5 | 5 | 4 | 5 | 5 |
| c | 4 | 4 | 5 | 5 | 4 | 5 | 5 |

Below 5, kept deliberately:
- a / Links 4 : les vignettes 2D ne sont reliées aux profils que par la position et le sens vertical commun ; la légende dit que la seconde coordonnée est illustrative. Des traits de projection alourdiraient le panneau.
- a / Economy 4 : trois relations sur la figure (x_t, v, EDO) au lieu d'une ou deux (P19) ; gardées car c'est une figure de cours qui définit les objets.
- a / Craft 4 : flèches du champ petites (2,6 mm) et assez horizontales (rapport d'aspect t/x) ; la moitié basse du plan est dense en traits gris clairs.
- b, c / Links 4 : pas de lignes de zoom de b vers c (elles traverseraient les profils cibles) ; le lien repose sur la couleur, la forme et les extrémités cerclées, et sur la légende.
- c / Reads 4, Takeaway 4 : écarts Heun / exacte / prédicteur de 1 à 4 mm seulement ; k₁, k₂ et la formule du correcteur ne sont que dans la légende.
