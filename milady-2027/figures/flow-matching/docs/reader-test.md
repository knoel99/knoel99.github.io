# Reader test — own cold read (review=own)

Lecture de `figure/out/flow-matching-thumb.png` puis du PNG à taille d'impression, avant de relire le brief.

**Ce que la figure affirme (lecture à froid)**
- a : un nuage gaussien isotrope (gauche, t = 0) est relié à une loi à deux amas symétriques (droite, t = 1, « B → −B ») par des segments droits entre points tirés de part et d'autre ; les segments se croisent. Des flèches d'un champ v(x, t) remplissent le plan, plus foncées là où passe la masse. En un point x_t, plusieurs segments se croisent, vers les deux amas, et une flèche épaisse donne leur direction moyenne ; la clé l'écrit v = 𝔼[x₁ − x₀ | x_t = x].
- b : à partir des mêmes points de bruit et du même champ v_θ(x, t, λ), deux valeurs λ₁ (orange) et λ₂ (bleu) mènent à deux lois différentes (un pic central contre deux modes) ; les trajectoires sont courbes et ne se croisent pas pour une même couleur.
- c : on intègre dx/dt = v_θ par pas de taille h (Heun) ; les points de Heun suivent la trajectoire exacte, le prédicteur s'en écarte là où elle tourne.
- Nature : schéma théorique sur un exemple jouet (pas de mesure, pas d'échelle de performance revendiquée).

**Score contre les idées clés du brief**
| Idée clé | Verdict |
|---|---|
| 1 Loi de base gaussienne isotrope / loi à deux modes ±, clin d'œil B → −B | transmise |
| 2 Chemins rectilignes x_t = (1 − t)x₀ + t x₁ entre paires indépendantes | transmise (indépendance : visible par les croisements, dite dans la légende) |
| 3 Champ marginal qui moyenne les directions | transmise (éventail + flèche moyenne + clé) |
| 4 λ₁, λ₂ : deux lois à partir du même bruit, même champ | transmise |
| 5 Échantillonnage par EDO, Heun, quelques pas | transmise ; le détail prédicteur/correcteur demande la légende → partielle sans légende |
| 6 Chemins conditionnels croisés vs trajectoires marginales courbes sans croisement | transmise (a vs b) |

**Fausses affirmations ou « must-not » suggérés** : aucune trouvée. Risques résiduels : (i) un lecteur pourrait croire que l'éventail fait partie des 34 paires tirées — la légende précise qu'il est construit par le point marqué ; (ii) le lien entre la trajectoire épaissie de b et le panneau c n'est explicite que par la couleur et les extrémités cerclées — la légende le dit.

**Corrections faites à la suite** : aucune nouvelle modification de dessin ; les deux risques sont traités dans `caption.md`.
