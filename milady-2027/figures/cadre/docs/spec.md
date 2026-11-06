# Spec — figure « cadre »

## Structure (squelette)
**Pipeline** (chaîne causale gauche → droite) : paramètres λ → transport latent (flow matching) → décodeur à potentiels → champs générés → contrôle en loi → usages. Raison : le message est une chaîne de traitement où chaque contrainte est traitée à un étage précis ; l'ordre de lecture doit suivre l'ordre causal (P8), et chaque étage montre l'état du signal (P1). Un retour unique (perte de stationnarité, en tirets gris) relie le contrôle en loi au champ de vitesse v_θ (P11). Les classes de contraintes de la note (C1, C3, C4) sont alignées sous l'étage où elles sont imposées (P2 : mapping taxonomie ↔ mécanisme).

## Concepts

**Concept A — « Chaîne à cinq stations, bandeau des contraintes ».** Panneaux a–e côte à côte sur une seule rangée (λ + transport latent | décodeur | champs VKS | loi | usages), flèches de flux entre stations, un arc de retour en tirets au-dessus (perte de stationnarité → v_θ). Sous la rangée, un bandeau de puces alignées : C3 sous a, C1 sous b, « cible, non entraînée » sous c, C4 sous d. Format large 183 × ~85 mm.

**Concept B — « Générateur en haut, sorties en bas ».** Rangée 1 : panneau a large = générateur complet (λ, flot latent, décodeur, cartes 2D ψ, a → u, B : le banc d'essai MHD 2D). Rangée 2 : b = cylindre VKS en héros agrandi (cadre en tirets « cible 3D »), c = loi de ε, d = usages. Une flèche de renvoi passe de la fin de la rangée 1 au début de la rangée 2. Format 183 × ~105 mm.

**Concept C — « Grille des contraintes ».** Tableau C1–C4 (lignes) × {forme, vraie pour, mécanisme} avec un petit glyphe par case, et la chaîne générative réduite à une bande en tête. Format 183 × ~90 mm.

| Critère (1–5) | A | B | C |
|---|---|---|---|
| Message lisible en 5 s | 4 | 4 | 2 |
| Fidèle à la physique de la note | 5 | 4 (renvoi 2D → 3D ambigu) | 5 |
| État du signal dessiné (P1) | 5 | 5 | 2 |
| Mapping abstraction ↔ réalisation (P2) | 4 (bandeau C1/C3/C4 aligné) | 3 | 4 |
| Explique plutôt qu'impressionne (P4) | 5 | 4 (héros VKS agrandi : risque de suggérer un résultat VKS) | 5 |
| **Total** | **23** | **20** | **18** |

Gardés pour les deux brouillons : **A** et **B**. C est écarté (taxonomie sans état du signal ; c'est le rôle d'un tableau dans le texte).

## Spec card (concept A ; B réutilise les mêmes composants)

**Takeaway (one sentence):** les paramètres physiques pilotent un flow matching latent ; un décodeur à potentiels rend ∇·u = ∇·B = 0 exactes ; B → −B est imposée par équivariance ; le bilan d'énergie est imposé en loi ; les champs alimentent modèles réduits, assimilation et statistiques de renversements.
**Size:** 183 mm × ~85 mm
**Hero:** cylindre VKS (champs u, B générés, cible visée), drawn with vector 3D library parts (L.obliqueProj, L.cylinder3, L.circle3) and the illustrated finish; route vector3d because Blender is not installed and the hero must stay in the same flat register as the computed signal glyphs.

### Panels
| Panel | Job (one line) | Position / share |
|---|---|---|
| a | λ conditionne v_θ ; le bruit z₀ ~ N(0, I) est transporté en z₁ par des trajectoires presque droites ; symétrie z → Sz | gauche, ~30 % |
| b | le décodeur fonctionnel interrogé en x sort des potentiels ; le rotationnel donne des champs à divergence nulle exacte | ~24 % |
| c | les champs 3D générés u, B dans le cylindre VKS (cible) | ~19 % |
| d | l'ensemble des échantillons vérifie E[ε] = E[P] en loi (inclinaison exponentielle), pas par échantillon | ~17 % |
| e | trois usages en aval | droite, ~10 % |

### Components
| Panel | Component | Label (exact text) | Look | Source |
|---|---|---|---|---|
| a | curseurs de contrôle | « λ », « Re », « Rm », « μ_r », « Paramètres de contrôle » | trois glissières, vert λ | draw (L.rect, L.circle) |
| a | densité gaussienne à t = 0 | « z₀ ~ N(0, I) », « Bruit » | profil latéral, gris-violet | compute (numpy) |
| a | densité bimodale à t = 1 | « z₁ » | profil latéral violet, deux modes symétriques | compute (mélange symétrique) |
| a | trajectoires du flot | « v_θ(z, t, λ) » | ~20 polylignes violettes, presque droites | compute (EDO du flot marginal, v* exact pour cible gaussienne-mélange) |
| a | axe de symétrie | « z → Sz ⇔ B → −B » | tirets gris + double flèche | draw |
| a | polarités | « +B », « −B » | petites flèches vermillon ↑ ↓ près des modes | draw |
| a | axe du temps du flot | « t = 0 », « t = 1 » | axe fin | draw |
| b | jetons latents | « z₁ » | colonne de carrés violets | draw (cs.js box) |
| b | point de requête | « x » | point noir sur domaine Ω | draw |
| b | attention croisée | « Attention croisée » | bloc arrondi | draw (cs.js box) |
| b | sortie | « A_u, A_B » | texte coloré | draw |
| b | cartes de potentiels 2D | « ψ », « a » | pixelImage + isolignes | compute (champ de Fourier aléatoire, spectre en k⁻²) |
| b | lignes de champ | « u », « B » | isolignes orientées (chevrons) bleu / vermillon | compute (isolignes de ψ, a ; sens de ∇^⊥) |
| b | opérateur | « ∇× » | flèche | draw |
| b | badge | « ∇·u = ∇·B = 0 » | texte | draw |
| c | cylindre + turbines | « Turbines contrarotatives » | cylinder3 translucide, disques à pales | draw (vector 3D) |
| c | lignes de courant poloïdales | « u » | demi-plan méridien gauche, bleu | compute (fonction de courant de Stokes à deux cellules) |
| c | lignes de champ dipolaires | « B » | demi-plan méridien droit, vermillon, refermées dehors | compute (Biot–Savart d'un solénoïde fini) |
| c | rotation | — | arcs fléchés opposés en haut et en bas | draw |
| d | histogramme ε | « ε », « q_θ », « inclinée » | histogramme gris (brut) + ambre (après inclinaison) | compute (échantillons gamma, inclinaison exacte) |
| d | repère | « E[P] » | trait vertical | draw |
| d | comparaison P − ε | « en loi », « par échantillon » | deux mini-histogrammes, ✓/✗ | compute |
| e | modèles réduits | « Modèles réduits » | trois vignettes de modes | compute |
| e | assimilation | « Assimilation de données » | ensemble + observations | compute |
| e | renversements | « Renversements (Rice) », « ν₀ = E[\|Ḋ\| δ(D)] » | densité bimodale de D, bande D ≈ 0 | compute (même mélange) |
| bandeau | puces de contraintes | « C3 symétrie : équivariance », « C1 ∇· = 0 : par construction », « C4 bilan : en loi », « Cible visée » / « Stage : 3 modes, MHD 2D » | puces arrondies | draw |

### Relations
| From | To | Kind | Drawn as |
|---|---|---|---|
| λ | v_θ | conditionnement | ligne verte fléchée |
| z₁ (fin du flot) | décodeur | flux | flèche noire |
| décodeur | champs VKS | flux | flèche noire |
| champs | loi | flux (ensemble) | flèche noire |
| loi | usages | flux | flèche noire |
| loi | v_θ | retour (perte de stationnarité à l'entraînement) | arc gris en tirets au-dessus |

### Conventions
- Temps du flot t de gauche à droite (0 → 1) ; chaîne causale de gauche à droite.
- Couleurs : λ vert #009E73 ; latent z violet #6C4BA0 ; u bleu #0072B2 ; B vermillon #D55E00 ; énergie / loi ambre #E69F00 ; contexte gris. Les symboles prennent la couleur de leur entité.
- Même glyphe pour la loi bimodale (latent) et la densité de D (Rice) : même forme, rappel de la symétrie.
- Vecteurs en gras : **u**, **B** ; λ en gras (vecteur de paramètres).

### Negative constraints
- Pas de chiffres de performance, pas d'axes gradués inventés.
- Pas de « entraîné sur VKS » ; le panneau c porte « cible ».
- Pas de pic ε = P sur l'histogramme de ε (la projection par échantillon s'illustre sur P − ε).
- Pas de phrase sur la figure.
