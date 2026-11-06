Assumptions: mode=design (description technique fournie, pas d'image de référence), style=own (aplat sobre type Nature pour lecteurs physiciens et ML : bruit en gris neutre, données en deux teintes ± liées au signe de B, champ v en encre sombre), route=flat (aucun objet physique : nuages, chemins et champ calculés avec numpy, pas de 3D), depth=standard (demandé), review=own (demandé), web=off (demandé ; aucun objet réel à regarder), width=136 mm (1,5 colonne, demandé), format=journal, langue=français.

# Brief — figure « flow-matching »

- **Mode** : design. **Format** : journal (`figure.format = 'journal'`), largeur 136 mm (1,5 colonne), hauteur ≈ 105 mm.
- **Où** : module de préparation « modèles génératifs » du site MilaDy 2027 (stage M2 ANR MilaDy, dynamos MHD turbulentes), inséré pleine largeur dans la page.
- **Lecteur** : étudiant·e de M2 physique/mathématiques appliquées qui connaît les EDO et les lois gaussiennes, pas encore le flow matching.
- **Phrase à retenir** : le flow matching apprend un champ de vitesse *v*(**x**, *t*) qui moyenne les directions de chemins rectilignes tirés entre bruit et données ; conditionné par **λ**, ce même champ transporte le même bruit vers des lois différentes, et on échantillonne en intégrant l'EDO en quelques pas.

## Idées clés (critères de la demande d'abord, verbatim)
1. « loi de base gaussienne (nuage isotrope à t = 0) et loi des données (à t = 1, par exemple une loi à deux modes symétriques ±, clin d'œil à B → −B) »
2. « chemins conditionnels rectilignes x_t = (1 − t) x₀ + t x₁ entre paires (x₀, x₁) tirées indépendamment »
3. « champ de vitesse marginal v(x, t) qui moyenne ces directions (flèches) »
4. « conditionnement par un paramètre λ : deux valeurs λ₁, λ₂ donnent deux lois cibles différentes à partir du même bruit (le même champ v_θ(x, t, λ)) »
5. « échantillonnage par intégration de l'EDO dx/dt = v_θ(x, t, λ) avec un schéma de Heun (quelques pas) »
6. (ajout) Les chemins conditionnels se croisent ; les trajectoires du champ marginal ne se croisent pas (unicité des solutions de l'EDO) et sont courbes.

## Ce que la figure ne doit pas laisser croire
- que l'échantillonneur suit les chemins rectilignes (ce sont des cibles d'entraînement ; l'échantillonnage suit le champ marginal, courbe) ;
- que le couplage (x₀, x₁) est optimal (il est indépendant : les chemins se croisent) ;
- que les données jouets 1D sont des champs MHD réels (le « B → −B » est un clin d'œil) ;
- qu'un réseau a été entraîné : le champ dessiné est le champ marginal exact de la loi jouet (apprentissage parfait, v_θ = v*) ;
- que Heun est exact (l'écart à la trajectoire exacte reste visible) ;
- que λ₁, λ₂ sont des valeurs physiques précises (illustratif : λ₁ « sous le seuil », λ₂ « au-dessus », dans la légende seulement) ;
- qu'une seule coordonnée représente tout l'état : **x** ∈ ℝ^D, une coordonnée est tracée (dit dans la légende).

## Portée
Principe seulement : pas de perte d'entraînement dessinée (dans la légende), pas d'architecture détaillée, pas des contraintes C1/C2/C4 (figures « cadre » et « taxonomie ») ; seule la symétrie C3 apparaît en clin d'œil.

## Style
Choix propre : aplat sobre type Nature, axes espace-temps (*t* horizontal, une coordonnée de **x** vertical) dans les trois panneaux ; gris neutre pour le bruit et les chemins conditionnels (contexte), encre sombre pour le champ v (protagoniste du panneau a), bleu pour la loi des données / λ₂, vermillon pour λ₁. Densités et trajectoires calculées (numpy), pas dessinées à la main.
