# Critique propre (étape 9), sur `figure/out/cadre.png` avant corrections

## Fidélité (P28) — chaque compte, sens, ordre, connexion
| Élément dessiné | Source | Verdict |
|---|---|---|
| λ = (Re, Rm, μ_r) : 3 curseurs | [D] | conforme |
| λ entre dans v_θ seulement (pas dans le décodeur) | [D] « v_θ(z, t, λ) » | conforme ; [D] ne dit pas si le décodeur est conditionné : non dessiné |
| z₀ ~ N(0, I) à t = 0, z₁ à t = 1, t de 0 à 1 | [D], [Not] (t = 1 : données) | conforme |
| trajectoires presque droites | [D] | droites exactes (couplage optimal 1D) ; la légende le dit |
| loi latente bimodale symétrique, modes ↔ ±B | [N] C3, E1 (deux polarités) | conforme ; l'association « mode du haut = +B » est illustrative (légende) |
| S agit par z → Sz, champ équivariant | [D], [N] Prop. 4 | conforme |
| décodeur : attention croisée, requête en x, sort (A_u, A_B) ; 2D : ψ, a | [D], [Not] | conforme |
| u = ∇×A_u, B = ∇×A_B ⇒ ∇·u = ∇·B = 0 exactes | [D], [N] Prop. 1 | conforme (puce C1 « par construction ») |
| lignes de champ = isolignes des potentiels, orientées par ∇^⊥ | [C] | conforme (même géométrie que les isolignes) |
| cylindre : 2 turbines coaxiales, 8 pales, contrarotation | [W] | conforme ; sens absolu arbitraire |
| écoulement : 2 cellules poloïdales, remontée axiale vers chaque turbine, convergence au plan médian | [W], [M] | conforme (vérifié au zoom : côté axe vers la turbine, côté paroi vers le plan médian) |
| B : dipôle axial, refermé à l'extérieur, montant à l'intérieur | [W] | conforme ; la composante azimutale (présente dans VKS) n'est pas dessinée → légende |
| ε : histogramme d'ensemble, moyenne ramenée sur E[P] | [D], [N] Prop. 7 | conforme |
| correction : inclinaison exponentielle OU perte de stationnarité à l'entraînement | [D], [N] Prop. 7 | conforme (flèche « inclinaison », arc de retour vers v_θ) |
| « pas par échantillon » montré sur P − ε (pic en 0 barré) | [N] Cor. 6 | conforme ; pas de pic sur l'histogramme de ε (il serait faux) |
| usages : modèles réduits, assimilation, Rice | [D], [N] Prop. 8 | conforme |
| pas d'entraînement sur VKS | brief | titre « Cible 3D : VKS » + puce « stage : 3 modes, MHD 2D » ; à garder lisible |

Aucune erreur de physique trouvée. Points de vigilance : association mode ↔ polarité et formes des histogrammes illustratives (à dire en légende).

## Problèmes relevés (rubrique style.md §4), avant correction
1. **Lisibilité** : texte médian 6 pt à 183 mm (gate : WARN) ; « λ » à 8,5 pt (> 8). Titres de panneaux 6,5 pt.
2. **Économie** : 67 mots, 0,51 mot/cm² (> 0,45) ; « (entraînement) » sur l'arc relève de la légende (l'arc qui revient vers v_θ dit déjà « entraînement »).
3. **Craft** : la descente de l'arc de retour frôle la fin du titre « Flow matching latent ».
4. **Craft** : la flèche « → » d'Arial est petite et basse dans la puce C3.
5. **Craft** : le repère « B » du panneau c a un long trait de rappel ; le rappel « Turbines contrarotatives » aussi.
6. **Liens** : les relations de flux ne sont pas déclarées (gate info) ; les déclarer.
7. **Prise du message** (« Cible ») : le cylindre reçoit la même flèche de flux que les autres étages ; le lecteur pressé peut croire que la chaîne a produit ces champs. Garder le titre « Cible » et la puce en tirets dessous ; le dire en légende.
8. **Craft** : les cartes 2D de b sont petites (10 mm) ; elles restent lisibles à 300 dpi, les isolignes ne sont plus en « spaghetti ».

## Scores avant correction (1–5)
| Panneau | Lit à taille finale | Message | Fidèle | Correct | Liens | Économie | Craft |
|---|---|---|---|---|---|---|---|
| a | 4 | 5 | 5 | 5 | 4 | 4 | 4 |
| b | 4 | 5 | 5 | 5 | 4 | 5 | 4 |
| c | 4 | 4 | 4 | 5 | 4 | 5 | 4 |
| d | 4 | 5 | 5 | 5 | 4 | 4 | 4 |
| e | 4 | 4 | 5 | 5 | 4 | 5 | 4 |

## Corrections faites (vérifiées sur le rendu)
1. « λ » 8 pt ; titres 7 pt ; puces et étiquettes de d, e, a passées de 5,6 à 6 pt. Le gate garde un WARN « texte petit » (médiane 6 pt à 183 mm) : la largeur 183 mm est imposée et 5–7 pt est la règle Nature ; tout reste lisible à 100 %.
2. « (entraînement) » retiré de l'arc → légende ; 65 mots, 0,49 mot/cm² (au bord de la plage 0,20–0,45 ; le reste est fait d'équations et de noms d'objets).
3. Descente de l'arc décalée de 10 pt à droite : plus de contact avec le titre a.
4. « → » remplacé par « ↦ » (glyphe de taille normale).
5. « B » rapproché de sa boucle ; turbines étiquetées par la turbine du bas, rappel plus court ; flèches de rotation déplacées autour des arbres (elles traversaient les cellules).
6. Relations déclarées ; le gate a alors détecté deux flèches de flux disparues (un commentaire avait avalé la fin d'une ligne) : rétablies.
7. Flèche b → c creuse et en tirets (cible non entraînée), assortie à la puce en tirets.

## Scores après correction (1–5)
| Panneau | Lit à taille finale | Message | Fidèle | Correct | Liens | Économie | Craft |
|---|---|---|---|---|---|---|---|
| a | 4 | 5 | 5 | 5 | 5 | 5 | 5 |
| b | 4 | 5 | 5 | 5 | 5 | 5 | 4 |
| c | 4 | 4 | 5 | 5 | 4 | 5 | 4 |
| d | 4 | 5 | 5 | 5 | 5 | 4 | 5 |
| e | 4 | 4 | 5 | 5 | 4 | 5 | 4 |

## Contrôle indépendant (relecture à froid puis vérification physique)
1. **c, ∇·B visuel** : la boucle dipolaire extérieure (L = 3,2 R) était coupée par le cadre de la station c ; ses deux bouts ouverts au bord du panneau d se lisaient comme une ligne de champ qui s'arrête, contraire au message ∇·B = 0. Lignes reprises en r₀ = 0,50 ; 0,57 ; 0,64 R (L ≤ 2,05 R) : les trois boucles se referment en entier dans la station, et ne traversent plus la turbine du haut.
2. **c, rappel de B** : posé sur la boucle extérieure (il ne croise plus aucune boucle).
3. **c, reflet du verre** : la bande blanche passait au centre des cellules poloïdales (r ≈ 0,7 R) et coupait chaque ligne de courant ; déplacée près de la paroi gauche et dessinée sous les lignes de courant.
4. **Arc de retour** : le trait vertical en tirets frôlait la lettre « d » (0,6 mm) ; écarté d'un millimètre.
5. **Légende, a** : « en grande dimension elles ne sont que presque droites » était inexact : en 1D, le flot à couplage indépendant a les mêmes extrémités que la carte optimale mais des trajectoires courbées ; la rectitude tient au couplage, pas à la dimension. Phrase corrigée.
Vérifié conforme : sens des cellules VKS (montée le long de l'axe vers chaque turbine, éjection radiale, retour à la paroi, convergence au plan médian), contrarotation, B montant dans le noyau et redescendant dehors, orientation des isolignes ψ → u et a → B (u = (∂_yψ, −∂_xψ)), sens de l'inclinaison (moyenne brute 1,14 → 1,00), loi de dE/dt centrée en 0, taxonomie C1/C3/C4 de la note, orthographe.
