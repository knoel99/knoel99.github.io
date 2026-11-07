# Faits — figure « vks »

Sources : [M07] Monchaux et al., PRL 98, 044502 (2007) « Generation of a magnetic field by dynamo action in a turbulent flow of liquid sodium » ; [B07] Berhanu et al., EPL 77, 59001 (2007) « Magnetic field reversals in an experimental turbulent dynamo » ; [PF08] Pétrélis & Fauve, J. Phys. Condens. Matter 20, 494203 (2008) ; [PF09] Pétrélis, Fauve, Dormy & Valet, PRL 102, 144503 (2009) ; [G12] Gissinger, Eur. Phys. J. B 85, 137 (2012) ; [GDF10] Gissinger, Dormy & Fauve, EPL 90, 49001 (2010) ; [T] note théorique du projet (specs/theorie-brief.md). « mémoire » = connu de la littérature mais non revérifié ici (web=off) : aucune de ces valeurs n'est affichée sur la figure.

## Fiche géométrique (avant tout dessin)

| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Cuve | cylindre d'axe horizontal (axe x du dessin), rempli de sodium liquide ; proportions longueur/diamètre ≈ 1,27 (diamètre intérieur ≈ 412 mm, longueur ≈ 524 mm) | [M07], mémoire |
| Turbines | deux disques coaxiaux aux deux extrémités, rayon ≈ 0,75 R, en retrait des fonds de cuve (écart entre disques ≈ 371 mm, soit ± 0,90 R du plan médian) ; 8 pales courbes sur la face tournée vers le fluide, hauteur ≈ 0,2 R | [M07], mémoire |
| Matériau des turbines | fer doux (ferromagnétique) dans la campagne de 2006 qui a produit la dynamo ; pas de dynamo avec des turbines en acier inoxydable | [M07] |
| Arbres et moteurs | un arbre par turbine, qui traverse le fond de cuve ; moteurs non dessinés | [M07] |
| Rotation | contrarotation : vecteurs rotation opposés (gauche +x, droite −x sur le dessin) ; fréquences F₁ (gauche), F₂ (droite) ; dynamo de [M07] en contrarotation exacte F₁ = F₂ ; renversements de [B07] pour F₁ ≠ F₂ | [M07], [B07] |
| Sens de courbure des pales par rapport à la rotation | turbines identiques face à face : la gauche est l'image de la droite par la rotation R_π autour d'un diamètre ((x, y, z) → (−x, y, −z)), donc courbure opposée autour de +x dans le repère du dessin et même sens de courbure par rapport à sa propre rotation pour les deux turbines (symétrie R_π de VKS, [T] C3) ; le sens « + » ou « − » n'est pas affirmé | [M07], [T] ; sens ± inconnu → non affirmé |
| Anneau du plan médian | anneau mince fixé à la paroi dans le plan médian (diamètre intérieur ≈ 0,85 × 2R) ; dessiné comme un anneau fin | [M07], mémoire |
| Couche de sodium au repos autour du cylindre | omise du dessin (indiquée en légende) | [M07], mémoire |
| Écoulement toroïdal | rotation azimutale entraînée par chaque turbine : deux cellules toroïdales contrarotatives, chacune dans la moitié de sa turbine, séparées par une couche de cisaillement au plan médian | description de l'appelant, [M07] |
| Écoulement poloïdal | pompage centrifuge : le fluide est aspiré vers chaque turbine le long de l'axe, éjecté radialement par la turbine, revient le long de la paroi vers le plan médian, puis converge vers l'axe dans le plan médian ; deux cellules poloïdales (une par moitié), donc quatre boucles dans un plan méridien | description de l'appelant, [M07] |
| Forme des boucles poloïdales | lignes de niveau calculées de ψ(r, x) = r²(1 − r²/R²) sin(πx/X), X = position des turbines (fonction de courant de Stokes) : u_x > 0 près de l'axe pour x > 0, u_x < 0 près de la paroi, u_r < 0 au plan médian, u_r > 0 contre la turbine | calculé (figure/data/make_data.py), qualitatif |
| Champ moyen | dipôle axial : lignes de champ axiales dans le sodium, refermées à l'extérieur de la cuve ; polarité « + » = **B** dans le sens +x à l'intérieur | description de l'appelant, [M07] |
| Forme des lignes de champ | lignes de niveau du flux Ψ = r A_φ d'une distribution de courants azimutaux répartie dans le volume de sodium (densité ∝ r, r ≤ 0,95 R, |x| ≤ 0,9 R) : champ quasi uniforme dedans, dipolaire dehors | calculé (figure/data/make_data.py), qualitatif |
| Ordre de dessin (3D) | paroi arrière et fond droit (face intérieure) → turbine droite (face à pales visible) → pales de la turbine gauche → boucles poloïdales (plan méridien y = 0) → disque de la turbine gauche (dos, opaque : il cache la partie des boucles gauches située derrière lui) → rubans toroïdaux (moitié avant) → paroi avant translucide et contour | géométrie de la projection orthographique (azimut 22°, élévation 14°) |

## Série temporelle et plan (D, Q)

| Élément | Ce qui est dessiné | Source |
|---|---|---|
| Modèle | forme normale de Pétrélis–Fauve : dA/dt = μA + νĀ − |A|²A + bruit, A = D + iQ (μ = 1 + 0,2i, ν = 0,5, bruit blanc complexe) ; points fixes stables ±(D*, Q*) dominés par le dipôle, points-cols dominés par le quadripôle | [PF08], [PF09] ; paramètres choisis par moi (qualitatif) |
| Renversement | glissement de phase par-dessus le point-col : D traverse 0 avec Q ≠ 0, lent au départ, rapide ensuite | [PF09], [GDF10] |
| Sens de parcours | les deux renversements successifs tournent dans le même sens dans le plan (D, Q) (+ → − par Q > 0, − → + par Q < 0) | conséquence du modèle (terme μ_i) |
| Excursion | la phase s'approche du point-col sans le franchir : D chute vers 0 puis revient à la même polarité | [B07] (excursions observées), [PF09] |
| Durées | phases longues et irrégulières, basculements brefs (VKS : renversement de l'ordre de la seconde, phases de quelques secondes à quelques minutes) | [B07], mémoire ; non affiché |
| Symétrie | (D, Q) → (−D, −Q) laisse le modèle invariant (**B** → −**B**) | [T] taxonomie C3, [PF09] |

## Étiquettes affichées (registre ; chaînes telles que rendues, balisage entre parenthèses)

| Chaîne à l'écran | Source |
|---|---|
| "écoulement moyen u" (u en gras bleu) | description de l'appelant |
| "champ moyen B" (B en gras vermillon) | description de l'appelant |
| "sodium liquide" | [M07] |
| "turbine en fer doux" | [M07] |
| "pales courbes" | description de l'appelant, [M07] |
| "F1" , "F2" (F italique, indice 1, 2 : fréquences de rotation des turbines) | [B07] |
| "B" (gras vermillon, bout de la ligne de champ axiale) | notation du projet (specs/notations.md) |
| "cellules toroïdales" | description de l'appelant |
| "recirculation poloïdale" | description de l'appelant |
| "plan médian" | description de l'appelant |
| "effet dynamo" | [M07] |
| "dipôle axial" | description de l'appelant |
| "dipôle D" (D italique) | description de l'appelant |
| "D" (axe de c) | description de l'appelant |
| "quadripôle Q" (Q italique) | description de l'appelant |
| "temps t" (t italique) | — |
| "+D∗" , "−D∗" (niveaux des points fixes) | modèle [PF09] |
| "+(D∗, Q∗)" , "−(D∗, Q∗)" | description de l'appelant |
| "renversement" | [B07] |
| "excursion" | [B07] |
| "point-col" | [PF09] |

Glyphe sans texte : petit cylindre gris avec flèche vermillon → (D > 0), ← (D < 0), ← | → (quadripôle : champ axial opposé dans chaque moitié, [GDF10]). Expliqué en légende.
