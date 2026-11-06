# Spec — figure « vks »

## Structure (squelette)
**Un dispositif avec son signal, puis la lecture de basse dimension du signal** (setup → signal → espace des phases). Raison : la description donne un objet physique (a), une observable D(t) (b) et un modèle de basse dimension (c) ; le lecteur doit passer de l'objet au signal puis à la géométrie qui l'explique. Lien a → b : la polarité du dipôle (flèche **B** →/←) ; lien b ↔ c : l'axe D est partagé (mêmes niveaux ±D*, alignés horizontalement), les renversements et l'excursion portent les mêmes noms et la même couleur dans les deux panneaux.

## Concepts (design, notés)

| | C1 « héros unique » | C2 « paire u/B + axe D partagé » | C3 « coupes méridiennes plates » |
|---|---|---|---|
| Panneaux | a : un cylindre 3D avec écoulement **et** lignes de champ superposés (≈ 100 × 90 mm) ; b et c empilés à droite | a : deux vues 3D du même cylindre côte à côte, « écoulement moyen **u** » → (effet dynamo) → « champ moyen **B** » ; rangée du bas : b (série D(t), large) et c (plan (Q, D), D vertical) qui partagent l'axe D | a : deux coupes méridiennes (r, x) plates : lignes de courant + ⊙/⊗ ; lignes de champ ; b, c comme C2 |
| Lecture en 5 s | moyenne : boucles poloïdales bleues et lignes de champ vermillon se chevauchent dans le même plan | bonne : causalité gauche → droite (u engendre B), puis signal et modèle | bonne mais l'objet VKS (turbines, pales) est peu reconnaissable |
| Fidèle à la physique | oui | oui | oui (le plus exact) |
| État du signal (P1) | oui | oui : polarité de **B** reportée dans b, trajectoire de c issue de la même simulation que b | oui |
| Abstraction ↔ réalisation (P2) | faible (b, c sans lien d'axe) | forte : axe D partagé b ↔ c (P24), glyphes de polarité | forte |
| Expliquer / impressionner (P4) | explique, encombré | explique, héros soigné | explique, héros plat |
| **Choix** | | **retenu** | |

## Carte de spec

**Takeaway (one sentence):** deux turbines contrarotatives en fer doux brassent le sodium ; l'écoulement moyen (deux cellules toroïdales contrarotatives + recirculation poloïdale) engendre un dipôle axial qui se renverse au hasard, et le renversement relie ±(D*, Q*) en passant par le quadripôle.
**Size:** width 183 mm × height ≈ 116 mm
**Hero:** cylindre VKS (cuve, sodium, turbines à pales courbes, arbres), drawn in vector 3D (L.obliqueProj orthographique, L.cylinder3, L.circle3, polylignes 3D projetées) with the illustrated finish ; Blender absent, et un rendu photo jurerait avec les tracés plats de b et c.

### Panels
| Panel | Job (one line) | Position / share of the figure |
|---|---|---|
| a | l'objet : cuve de sodium, turbines contrarotatives, écoulement moyen **u** et le champ dipolaire **B** qu'il engendre | rangée du haut, pleine largeur (≈ 60 %) |
| b | le signal : D(t) alterne entre +D* et −D*, phases longues, basculements rapides, une excursion | bas gauche (≈ 2/3 de la largeur) |
| c | le modèle : plan (Q, D) avec ±(D*, Q*), points-cols, trajectoires de renversement par le quadripôle et l'excursion | bas droite, axe D aligné sur celui de b |

### Components
| Panel | Component | Label (exact text) | Look | Source |
|---|---|---|---|---|
| a | cuve + sodium (×2, même gabarit) | "sodium liquide" | cylindre 3D translucide gris argent, contour gris foncé, reflet | draw : `L.cylinder3`-like (corps + calottes via `circle3`), fini illustré |
| a | turbines (×2 par vue) | "turbine en fer doux" | disque gris fer foncé ; 8 pales courbes sur la face fluide (visibles sur la turbine droite) ; moyeu | draw : `L.cylinder3` (disque mince) + pales en polylignes 3D projetées (figure/parts.js) |
| a | arbres + flèches de rotation | "*F*_{1}", "*F*_{2}" | arbres gris ; flèche courbe grise autour de chaque arbre, sens opposés | draw : `L.cylinder3`, ellipse 3D + `L.chevron` |
| a | cellules toroïdales | "cellules toroïdales" | deux anneaux fléchés bleus (plans x = ±0,45 X), sens opposés ; arc arrière plus pâle | compute/draw : cercles 3D projetés |
| a | recirculation poloïdale | "recirculation poloïdale" | 4 boucles bleues dans le plan méridien y = 0, flèches | compute : lignes de niveau de ψ (make_data.py) |
| a | plan médian | "plan médian" | anneau mince + ellipse en tirets au plan x = 0 | draw |
| a | lignes de champ dipolaire | "dipôle axial" | lignes vermillon dans le plan y = 0, flèches → dedans, ← dehors | compute : lignes de niveau de Ψ = rA_φ (make_data.py) |
| a | flèche causale | "effet dynamo" | flèche grise entre les deux vues | draw : `L.connect` |
| a | titres des deux vues | "écoulement moyen **u**", "champ moyen **B**" | 7 pt gras, couleur de l'entité | text |
| b | série D(t) | "dipôle *D*", "temps *t*" | courbe vermillon (entité **B**), axes gris sans graduation, niveaux ±D* en tirets | compute : simulation Pétrélis–Fauve bruitée (make_data.py), fenêtre choisie |
| b | niveaux | "+*D*\*", "−*D*\*" | tirets gris prolongés jusqu'à c | compute |
| b | événements | "renversement", "excursion" | bandes grises pâles + étiquettes ; segments de courbe en couleur d'événement | compute |
| b | glyphes de polarité | — | mini-cylindre gris avec flèche vermillon → (+) / ← (−) | draw (même gabarit que a) |
| c | axes | "quadripôle *Q*", "dipôle *D*" | axes gris fléchés, D vertical aligné sur b | draw |
| c | points fixes | "+(*D*\*, *Q*\*)", "−(*D*\*, *Q*\*)" | disques pleins vermillon foncé | compute |
| c | points-cols | "point-col" | cercles ouverts | compute |
| c | variété lente | — | courbe grise fine fermée r(θ) | compute |
| c | trajectoires | "renversement", "excursion" | segments de la même simulation que b, mêmes couleurs que les événements de b, flèches | compute |

### Relations
| From | To | Kind | Drawn as |
|---|---|---|---|
| vue u | vue B | cause (effet dynamo) | flèche grise « effet dynamo » (`L.connect`) |
| turbine gauche/droite | cellule toroïdale de sa moitié | entraînement | même sens de flèche (implicite) |
| niveaux ±D* de b | points fixes de c | même valeur | tirets horizontaux continus de b à c |
| renversements de b | arcs de c | même événement | même couleur, même mot |
| excursion de b | boucle de c | même événement | même couleur, même mot |

### Conventions
- **u** bleu (#0072B2) partout (anneaux, boucles, titre) ; **B** et D vermillon (#D55E00) partout (lignes de champ, D(t), points fixes, titre).
- Événements : renversement = violet foncé (#5E3C99) ; excursion = ambre (#E69F00). Mêmes couleurs dans b et c.
- Cuve, turbines, arbres, axes : gris (contexte). Sodium : gris argent très pâle.
- Projection unique pour les deux vues de a (orthographique, azimut 22°, élévation 14°, verticales verticales).
- Le temps va de gauche à droite ; D vers le haut dans b et dans c (axe partagé).
- Aucune graduation chiffrée.

### Negative constraints
- aucun chiffre sur la figure ;
- pas d'aimant, pas de bobine ;
- la trajectoire de c ne passe pas par l'origine ;
- pas de légende-phrase sur la figure ; explications en légende.

## Recherche d'objets réels (étape 4)
web=off : pas de recherche d'images. Reconnaissable d'après [M07] : cuve cylindrique horizontale, turbines-disques à 8 pales courbes en retrait des fonds, arbres traversant les fonds, anneau mince au plan médian. docs/refs/ vide.
