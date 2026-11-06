# Test de lecture (étape 10, review=own)

Lecture faite par l'agent lui-même, sur la vignette (360 px) puis sur le PNG à taille d'impression, avant de relire le brief. Limite : le lecteur n'est pas aveugle (il a conçu la figure) ; aucun lecteur indépendant n'a été lancé (review=own).

## Lecture à froid (ce que la figure affirme)
- Une chaîne de gauche à droite en cinq étages.
- a : trois paramètres de contrôle λ (Re, Rm, μ_r) conditionnent un champ de vitesse v_θ(z, t, λ) qui transporte un bruit gaussien z₀ en une loi latente z₁ bimodale, le long de trajectoires presque droites, t de 0 à 1 ; les deux modes correspondent à B et −B et sont échangés par une symétrie S.
- b : un décodeur à attention croisée, interrogé en un point x du domaine Ω, produit des potentiels (A_u, A_B) ; en 2D ce sont des cartes ψ et a ; leur rotationnel donne des lignes de champ fermées u et B.
- c : la cible est un écoulement VKS 3D (cylindre, turbines contrarotatives, deux cellules de recirculation, champ dipolaire axial qui se referme dehors) ; la flèche d'entrée est creuse et la puce « stage : 3 modes, MHD 2D » indique que le stage ne travaille pas sur VKS.
- d : on contrôle la loi de la dissipation ε sur l'ensemble : l'histogramme brut q_θ est décalé, une inclinaison ramène sa moyenne sur E[P] ; sur dE/dt = P − ε, une loi large de moyenne nulle est correcte (✓), un pic en zéro imposé par échantillon est faux (✗). Un retour « perte de stationnarité » remonte vers v_θ.
- e : les champs servent à des modèles réduits, à l'assimilation de données et aux statistiques de renversements (Rice, densité de D autour de 0).
- Bandeau : chaque classe de contrainte est traitée à son étage : C3 symétrie par équivariance, C1 divergence nulle par construction, C4 bilan d'énergie en loi.
- Ce qui est théorique / illustratif : rien n'est présenté comme mesuré (pas d'axes chiffrés).

## Score contre les idées clés du brief
| Idée clé | Verdict |
|---|---|
| 1. les paramètres pilotent un flow matching latent | transmis |
| 2. décodeur à potentiels ⇒ ∇·u = ∇·B = 0 exactes | transmis (« ∇× » + puce C1 « par construction ») ; « exactes » est porté par « par construction » |
| 3. B → −B imposée par équivariance | transmis (S, ±B, puce C3) |
| 4. bilan d'énergie en loi, pas par échantillon | transmis (✓ / ✗ sur P − ε, inclinaison, E[ε] = E[P]) |
| 5. usages : modèles réduits, assimilation, renversements | transmis |
| 6. chaque contrainte à son étage (C1, C3, C4) | transmis |
| 7. état du signal à chaque étage | transmis |

## Affirmations fausses ou interdites suggérées
- « Le modèle a produit ces champs VKS » : risque **partiel** dans le premier rendu (flèche grise pleine de b vers c). Correction : flèche d'entrée creuse en tirets, titre « Cible 3D : VKS », puce en tirets « stage : 3 modes, MHD 2D » juste dessous ; la légende le dit explicitement.
- « ε = P échantillon par échantillon » : non (barré).
- « Divergence approchée » : non.
- « L'association mode du haut = +B » pourrait être lue comme un fait : la légende la dit illustrative.
- « Cartes 2D puis cylindre 3D » : un lecteur peut se demander pourquoi les potentiels sont en 2D ; la légende explique que ψ, a sont le cas 2D (banc d'essai) de A_u, A_B.

## Corrections faites après la lecture
- flèche b → c creuse et en tirets (cible, non entraînée) ;
- « (entraînement) » retiré de l'arc (l'arc qui revient sur v_θ dit l'entraînement ; la légende le précise).
