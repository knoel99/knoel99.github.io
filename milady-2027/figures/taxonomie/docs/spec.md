# Spec — figure « taxonomie »

## Structure (squelette)
**Une taxonomie (grille de cas étiquetée par ses dimensions, P13) + un zoom sur le cas qui piège (comparaison contrôlée, P3).**
Le principe unificateur est la dimension « vraie pour chaque échantillon / vraie pour la loi » : elle est l'en-tête de groupe des colonnes du panneau a et porte la couleur (bleu / orange) jusque dans le panneau b. Chaque colonne réutilise le même gabarit (en-tête, vignette dans un cadre identique, forme, exemples, mécanisme), seule la vignette change avec la classe. Le panneau b est un zoom (coin de zoom gris) de la vignette C4 : trois petits multiples sur les mêmes axes, où seul le mécanisme change.

## Concepts envisagés (design, standard : trois concepts, un retenu)

| Concept | Panneaux | Esquisse |
|---|---|---|
| A (retenu) | a : grille 4 colonnes C1–C4, groupées sous « vraie pour chaque échantillon » / « vraie pour la loi » ; b : zoom C4, trois lois de d*E*/d*t* côte à côte + rangée d'échantillons | Chaque colonne : badge, vignette d'espace d'états (points = échantillons, contrainte en couleur), forme, exemples MHD, case mécanisme. b : vraie / projection par échantillon (Dirac bleu) / correction en loi (orange), sous chaque loi la rangée d'échantillons (projetés vers 0 / repondérés). |
| B | a : tableau en 4 lignes ; b : les trois lois empilées verticalement sur un axe partagé | Lignes plus faciles pour les formules ; mais la description veut les lois « côte à côte », et l'empilement laisse b très haut et étroit. |
| C | a : carte 2D (local ↔ statistique, linéaire ↔ non linéaire) avec les classes placées comme des points ; b : identique à A | Joli mais faux : C3 n'est pas sur ces axes (une symétrie n'est ni « linéaire » ni « non linéaire » au même sens), la carte invente une structure (P13 « when not »). |

Notes (1–5) : lisible en 5 s / fidèle à la note / dessine l'état (P1) / comparaison contrôlée (P3) / explique (P4)
- A : 4 / 5 / 4 (points = échantillons, Dirac vs loi) / 5 / 5 → **retenu**
- B : 3 / 5 / 3 / 4 / 5
- C : 3 / 2 / 2 / 3 / 4

**Takeaway (one sentence):** chaque classe de contrainte appelle un mécanisme qui agit là où elle est vraie (chaque échantillon pour C1–C2, la loi pour C3–C4) ; projeter chaque échantillon sur le bilan d'énergie en loi (C4) donne un Dirac, la correction en loi garde la dispersion et recentre la moyenne.
**Size:** 183 mm × 80 mm (journal, double colonne)
**Hero:** none, taxonomie et lois de probabilité : aucun objet physique ; route flat (cases, vignettes géométriques et petits graphes qualitatifs, P1/P25/P30 « when not »). L'entrée visuelle est le panneau b (le cœur), aéré, sur fond orange très pâle.

## Panels
| Panel | Job (one line) | Position / share of the figure |
|---|---|---|
| a | Classer les contraintes C1–C4 et donner le mécanisme adapté à chacune, groupées par « vraie pour chaque échantillon / la loi » | gauche, x 0–112 mm (≈ 61 %) |
| b | Montrer pour C4 pourquoi la projection par échantillon est fausse et la correction en loi juste : trois lois de d*E*/d*t* sur les mêmes axes | droite, x 117–183 mm (≈ 36 %), toute la hauteur |

## Components
| Panel | Component | Label (exact text) | Look | Source |
|---|---|---|---|---|
| a | en-têtes de groupe | « Vraie pour chaque échantillon », « Vraie pour la loi » | texte 7 pt gras coloré (bleu / orange) + filet de couleur sous les deux colonnes du groupe | draw (`L.text`, `L.line`) ; note §1 colonne « Vraie pour » |
| a | badges de classe | « C1 » … « C4 » | pastille arrondie pleine (bleu C1–C2, orange C3–C4), texte blanc gras | draw (`L.rect`, `L.text`) |
| a | noms de classe | « Locale linéaire », « Locale non linéaire », « Symétrie », « Statistique en loi » | 7 pt gras, sombre | draw ; note §1 |
| a | vignette C1 | « *S* = ker *A* », « *P* » | cadre arrondi gris pâle ; droite bleue *S* ; 5 points gris foncé (échantillons) sur la droite ; un point creux hors de *S* avec flèche pointillée orthogonale (projection *P*) et coin droit | draw (primitives) ; Prop. 1–2 (projecteur orthogonal sur *S*) |
| a | vignette C2 | « écart de Jensen » | courbe bleue *c* = 0 ; points sur la courbe ; corde pointillée entre deux points, milieu (point creux = moyenne) hors de la courbe ; petite accolade entre milieu et courbe | draw ; Prop. 3 |
| a | vignette C3 | « *g* » | deux nuages gris (loi) images miroir l'un de l'autre de part et d'autre d'un axe miroir orange pointillé ; points d'échantillons différents dans chaque nuage (un échantillon n'est pas symétrique) ; flèche courbe double orange | draw ; Prop. 4, note §1 |
| a | vignette C4 | « d*E*/d*t* », « 0 » | mini-densité (même dessin que b, loi vraie) gris, ligne pointillée en 0, triangle orange de moyenne en 0, axe | compute (même `densities.json`) |
| a | formes | « *A***x** = 0 », « *c*(**x**) = 0 », « *g*_#μ = μ », « 𝔼_μ[𝓛φ] = 0 » | 7.5 pt, centré sous la vignette | note §1 colonne « Forme » |
| a | exemples | « ∇·**u** = 0, ∇·**B** = 0 », « Conditions aux limites », « Résidu d'EDP stationnaire », « **B** → −**B** », « Rotation *R*_π (VKS) », « Bilan d'énergie », « 𝔼[ε] = 𝔼[*P*] » | 6.5–7 pt gris foncé | description utilisateur + note §1 |
| a | mécanismes | « Potentiels ψ, **A** », « Projection de Leray », « Projection non linéaire », « Pénalité, guidage », « *v*_θ équivariant », « Loi de base invariante », « Perte de stationnarité », « Inclinaison exponentielle » | case arrondie teintée (bleu pâle / orange pâle) à filet de couleur, deux entrées séparées par un filet, flèche descendante depuis la colonne | description utilisateur + note §1 colonne « Mécanisme » |
| a | séparateur | « Mécanisme adapté » | petit texte gris + filet fin sur toute la largeur | draw |
| b | titre | « Bilan d'énergie (C4) » + « Allures illustratives » | 7 pt gras ; étiquette italique grise | draw |
| b | trois titres de colonnes | « Loi vraie », « Projection par échantillon », « Correction en loi » | 7 pt gras, sombre / bleu / orange | description utilisateur |
| b | loi vraie μ | « μ » | densité gaussienne, remplissage gris pâle, trait sombre | compute (`figure/data/make_densities.py`) |
| b | modèle avant correction | « *q*_θ » | densité gris clair, contour pointillé gris, moyenne décalée | compute (choix illustratif) |
| b | Dirac | « Dirac en 0 » | flèche verticale bleue en 0 (notation de δ), dépassant le cadre | draw (notation) ; Cor. 6 |
| b | loi corrigée | — | densité orange (I-projection de *q*_θ, calculée) | compute ; Prop. 7 |
| b | moyennes | « moyenne » | triangles sous l'axe ; gris en 𝔼_q, couleur en 0 ; flèche de recentrage | compute |
| b | échantillons | « Échantillons », « Poids *w*_i » | rangées de points sous chaque axe : μ (gris) ; *q*_θ (creux gris) → flèches convergeant vers un point bleu en 0 ; *q*_θ (orange, aire ∝ poids autonormalisés) | compute (quantiles + poids, `densities.json`) |
| b | axes | « 0 », « d*E*/d*t* » | axe horizontal, tic 0, pointillé vertical en 0 | draw |

## Relations
| From | To | Kind | Drawn as |
|---|---|---|---|
| vignette C4 | panneau b | zoom | coin de zoom gris pointillé (P9) |
| chaque colonne | sa case mécanisme | maps to | flèche descendante courte, couleur du groupe |
| échantillons de *q*_θ (b, milieu) | point en 0 | flow (projection de chaque échantillon) | flèches fines bleues convergentes |
| moyenne de *q*_θ (b, droite) | 0 | flow (recentrage) | flèche orange sous l'axe |

## Conventions
- Bleu (#0072B2) = vraie pour chaque échantillon / agit sur chaque échantillon ; orange (#E69F00, texte #B8740A) = vraie pour la loi / agit sur la loi. Gris = données et modèle (μ, *q*_θ, échantillons).
- Point plein gris foncé = un échantillon (même glyphe dans a et b). Point creux = sortie du modèle avant correction, ou moyenne.
- Les trois graphes de b partagent exactement les mêmes axes (même échelle, même 0) ; seul le mécanisme change.
- Vecteurs en gras droit (**u**, **B**, **x**, **A**) ; *v*_θ est le champ de vitesse du flot (pas en gras, notations.md).
- Pas de valeurs numériques sur les axes de b (qualitatif), sauf le 0.

## Negative constraints (must not appear)
- Aucun nombre inventé (β, variance, KL) sur la figure.
- Pas de d*E*/d*t* = 0 pour chaque échantillon présenté comme vrai.
- Pas de loi corrigée identique à μ (elle est proche, pas égale).
- Pas de symétrie dessinée sur les échantillons (seulement sur la loi).
- Pas de phrase sur la figure ; explications dans `docs/caption.md`.
