# Spec — figure « flow-matching »

## Structure (squelette)
**Un principe, puis deux cas qui réutilisent ses glyphes.** Le panneau a pose le principe (chemins conditionnels + champ marginal) dans le plan espace-temps (*t*, *x*). Les panneaux b et c réutilisent exactement le même gabarit (même orientation, *t* de gauche à droite, même échelle de *x* pour a et b, mêmes glyphes : densité grise du bruit à gauche, densité bleue à droite, points d'échantillons) et ne changent que ce que le cas change : b ajoute **λ** (deux couleurs, même bruit), c agrandit une trajectoire de b (zoom) pour montrer les pas de Heun. Liens visibles : la loi bleue de a est la loi λ₂ de b (même couleur, même forme) ; la trajectoire de c est surlignée dans b (zoom).

## Concepts (design)
**A — Plan espace-temps (t, x), une coordonnée.** a : densité gaussienne verticale à gauche (*t* = 0), densité bimodale à droite (*t* = 1), ~34 segments gris entre paires indépendantes, grille de flèches du champ v(x, t), éventail de 7 chemins passant par un même point avec la flèche moyenne. b : même gabarit, mêmes 10 bruits (quantiles), trajectoires de l'EDO pour λ₁ (vermillon) et λ₂ (bleu), petit réseau v_θ(x, t, λ). c : zoom sur une trajectoire avec 4 pas de Heun (prédicteur pointillé, correcteur plein).
**B — Plans 2D empilés en vue oblique.** Plan *t* = 0 avec nuage isotrope 2D, plan *t* = 1 avec deux amas ±, segments 3D entre eux, flèches dans un plan intermédiaire ; b et c en vignettes.
**C — Un seul plan 2D (x¹, x²), t caché.** Nuage gaussien au centre, deux amas à gauche/droite, segments x₀ → x₁, champ v(·, t = ½) en flèches ; b : deux couleurs de λ ; c : trajectoire 2D avec pas.

| Critère | A | B | C |
|---|---|---|---|
| Message lisible en 5 s | oui : gauche bruit → droite données, croisements, flèches | moyen : 3D chargé | moyen : t invisible |
| Fidèle aux maths | oui, champ exact, t littéral | oui | partiel : v dépend de t, on n'en montre qu'une tranche |
| État du « signal » dessiné (P1) | densités aux deux bouts + champ | oui | oui |
| Lien abstraction / réalisation (P2), comparaison contrôlée (P3) | éventail par un point = « v moyenne les directions » ; b = λ₁ vs λ₂ sur le même gabarit | faible | moyen |
| Expliquer vs impressionner (P4) | explique | impressionne | explique à moitié |
| Défaut | « nuage isotrope » réduit à 1D (dit dans la légende) | P25 : 3D pour de la logique | croisements et moyenne peu lisibles |

**Retenu : A.** Le temps du flot est un axe littéral (P8), le croisement des chemins conditionnels contre le non-croisement des trajectoires marginales est visible, et la moyenne se lit sur un point. La perte d'isotropie visible est compensée par la légende (𝒩(0, I) en dimension D, une coordonnée tracée).

---

**Takeaway (one sentence):** le champ v(x, t) appris par flow matching moyenne les directions de chemins rectilignes bruit → données ; conditionné par λ, il transporte le même bruit vers des lois différentes ; on échantillonne en intégrant l'EDO en quelques pas de Heun.
**Size:** 136 mm × ≈ 106 mm
**Hero:** none, figure de concept mathématique sans objet physique ; route = flat (aplat, finition illustrée sans objet à ombrer). Le « héros » est le panneau a, plan espace-temps calculé.

## Panels
| Panel | Job (one line) | Position / share |
|---|---|---|
| a | Principe : bruit 𝒩(0, I) à t = 0, loi bimodale à t = 1, chemins rectilignes entre paires indépendantes, champ marginal v qui moyenne leurs directions | rangée du haut, pleine largeur, ≈ 52 % de la hauteur |
| b | Conditionnement : même bruit, même réseau v_θ(x, t, λ), deux λ → deux lois | rangée du bas, gauche, ≈ 62 % de la largeur |
| c | Échantillonnage : EDO intégrée par Heun en 4 pas, comparée à la trajectoire exacte | rangée du bas, droite, ≈ 38 % |

## Components
| Panel | Component | Label (exact text) | Look | Source |
|---|---|---|---|---|
| a | axe du temps du flot | « *t* », graduations « 0 », « 1 » | flèche fine encre | draw (`L.arrow`, `L.text`) |
| a | axe d'une coordonnée de l'état | « **x** » | flèche fine encre | draw |
| a | densité du bruit à t = 0 | « Loi de base », « 𝒩(0, *I*) » | profil gris rempli, vers la gauche | compute (numpy, `pdf_noise`) + `L.path` |
| a | échantillons x₀ | — | petits points gris sur l'axe t = 0 | compute (34 tirages, graine 7) |
| a | densité des données à t = 1 | « Loi des données », « *μ* » | profil bleu rempli, vers la droite | compute (`pdf_law2`) |
| a | échantillons x₁ | — | petits points bleus sur t = 1 | compute |
| a | chemins conditionnels | (ligne de clé) « Chemin conditionnel  **x**_{*t*} = (1 − *t*) **x**_{0} + *t* **x**_{1} » | 34 segments gris clair, fins (17 vers chaque mode) | compute (paires indépendantes) |
| a | vignettes 2D | « Loi de base », « 𝒩(0, *I*) », « Loi des données *μ* », « **B** → −**B** » | disques gris pâle : nuage isotrope gris ; deux amas bleus ±(0,85 ; 1,5), double flèche courbe entre eux, croix à l'origine | compute (numpy, graine 11) |
| a | éventail par un point | « **x**_{*t*} », « **x**_{0} », « **x**_{1} » + relation « **x**_{*t*} = (1 − *t*)**x**_{0} + *t* **x**_{1} » | 7 segments gris foncé passant par (t* = 0,4, x* = 0,3) | compute (quantiles du posterior p(x₁ ∣ x_t = x*)) |
| a | champ marginal | (ligne de clé) « Champ marginal » + relation « *v*(**x**, *t*) = 𝔼[**x**_{1} − **x**_{0} ∣ **x**_{*t*} = **x**] » | grille 9 × 12 de flèches courtes encre, opacité ∝ √p_t(x) ; flèche épaisse au point de l'éventail | compute (champ exact v*, formule gaussienne) |
| a | symétrie | « **B** → −**B** » (flèche dessinée) | double flèche courbe entre les deux amas de la vignette | draw (`L.arrow` both, bend) |
| b | en-têtes de colonnes | « Même bruit », « Même champ *v*_{θ}(**x**, *t*, **λ**) », « Lois cibles » | texte 7 pt sur une ligne de base commune au-dessus des trois colonnes | draw (`L.text`) — remplace le petit réseau du premier jet (glyphe générique, flèche qui ne pointait sur rien) |
| b | bruit commun | « Même bruit » | densité grise + 10 points aux quantiles | compute |
| b | trajectoires λ₁ / λ₂ | — | 10 + 10 courbes, vermillon / bleu, depuis les mêmes points | compute (RK4 sur v*) |
| b | lois cibles | « **λ**_{1} », « **λ**_{2} » (×2, un par mode) | profils vermillon (unimodal) et bleu (bimodal, = loi de a), étiquettes dans leur couleur | compute (`pdf_law1`, `pdf_law2`) |
| b | trajectoire suivie en c | — | courbe bleue épaissie, extrémités cerclées d'encre comme en c | compute |
| c | trajectoire exacte | (clé) « Exacte » | courbe bleu pâle épaisse | compute (RK4 fin) |
| c | pas de Heun | clé « Exacte », « Heun », « Prédicteur » ; « *h* » | points encre reliés (correcteur), segments tiretés (prédicteur d'Euler), cercles ouverts ; petite clé dans le coin vide | compute (Heun N = 4, h = 0,25) |
| c | EDO | « d**x**/d*t* = *v*_{θ}(**x**, *t*, **λ**) » | relation en titre de panneau | draw (texte) |

## Relations
| From | To | Kind | Drawn as |
|---|---|---|---|
| bruit (t = 0) | données (t = 1) | transport (temps du flot) | axe t orienté gauche → droite |
| x₀ | x₁ | chemin conditionnel | segments rectilignes |
| éventail | flèche v | moyenne | flèche épaisse au point de croisement |
| λ | lois cibles | conditionne | couleur (vermillon / bleu) des trajectoires, des profils et des étiquettes **λ**₁, **λ**₂ |
| trajectoire épaissie b | panneau c | même objet agrandi | même couleur, mêmes extrémités cerclées ; pas de lignes de zoom (elles traverseraient les profils cibles) — dit dans la légende |

## Conventions
- *t* (temps du flot, pas temps physique) croît de gauche à droite dans les trois panneaux ; *t* = 0 bruit, *t* = 1 données (convention de `specs/notations.md`).
- Une coordonnée de **x** en vertical ; même échelle verticale (mm par unité) en a et b.
- Gris = bruit et chemins conditionnels (contexte) ; encre = champ v et pas d'intégration ; bleu = loi des données de a = λ₂ ; vermillon = λ₁. Les étiquettes λ₁, λ₂ prennent leur couleur.
- Vecteurs en gras droit (**x**, **B**, **λ**), scalaires en italique (*t*, *v*, *h*), *v*_θ pour le champ appris (≠ vitesse physique **u**).

## Negative constraints
- Pas de trajectoires d'échantillonnage rectilignes dans b/c ; pas de chemins conditionnels courbes dans a.
- Pas de valeurs physiques de λ, pas de « Rm » sur la figure.
- Pas de phrase explicative sur la figure (tout dans `caption.md`).
- Pas de légende séparée hors de la figure ; deux petites clés seulement (ligne de clé de a, clé de c) pour des glyphes répétés.
