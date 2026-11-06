Assumptions: mode=design (description écrite, pas d'image de référence), style=own (schéma plat type Nature, pipeline gauche→droite avec états du signal calculés, lecteurs physiciens + apprentissage), route=vector3d (cylindre VKS dessiné avec les parties 3D de la bibliothèque, L.cylinder3/obliqueProj + illustrated finish ; Blender absent), depth=full (deux brouillons, choix, critique, test de lecture), review=own, web=off sauf références visuelles du cylindre VKS et des turbines, width=183 mm, format=journal, étiquettes en français.

# Brief — Figure 1 « cadre » (rapport de stage MilaDy)

- **Mode** : design (description technique écrite par l'appelant ; aucune figure de référence).
- **Format** : journal, double colonne, 183 mm de large ; hauteur visée ≈ 85 mm (≤ 247 mm).
- **Lecteur** : jury et encadrants du stage M2 (physiciens MHD/dynamo, statisticiens et spécialistes d'apprentissage) ; lecteur du rapport qui n'a pas lu la note théorique.
- **Phrase à retenir** : les paramètres physiques pilotent un flow matching dans un espace latent ; un décodeur qui produit des potentiels rend ∇·u = 0 et ∇·B = 0 exactes ; la symétrie B → −B est imposée par équivariance ; le bilan d'énergie est imposé en loi, pas échantillon par échantillon ; les champs générés alimentent réduction de modèle, assimilation et statistiques de renversements.

## Idées clés (critères de l'appelant d'abord, verbatim)
1. « les paramètres physiques pilotent un flow matching dans un espace latent »
2. « un décodeur qui produit des potentiels rend ∇·u = 0 et ∇·B = 0 exactes »
3. « la symétrie B → −B est imposée par équivariance »
4. « le bilan d'énergie est imposé en loi, pas échantillon par échantillon »
5. « les champs générés alimentent réduction de modèle, assimilation et statistiques de renversements »
6. Chaque contrainte est traitée à l'étage qui lui convient (taxonomie de la note : C1 par architecture, C3 par équivariance, C4 en loi).
7. Montrer l'état du signal à chaque étage : loi gaussienne → loi latente bimodale, potentiels → lignes de champ fermées, champs 3D, histogramme d'ensemble.

## Ce que la figure ne doit PAS laisser croire
- que le modèle a été entraîné ou validé sur VKS 3D (le stage valide sur des bancs d'essai simples : modèle à 3 modes, MHD 2D) ; le cylindre VKS est la cible visée ;
- que ε = P est imposé sur chaque échantillon (le bilan est une identité dE/dt = P − ε ; seule E[P − ε] = 0 est une contrainte) ;
- que ∇·u = ∇·B = 0 est approchée (pénalité) : elle est exacte par construction ;
- que la symétrie est imposée par augmentation de données ou par une contrainte par échantillon (c'est l'équivariance du champ de vitesse qui rend la loi invariante) ;
- que z₀ ou le temps t du flot sont un temps physique (t ∈ [0, 1] est le temps du flot) ;
- que les histogrammes ou courbes dessinés sont des résultats mesurés (ils sont illustratifs, calculés à partir de modèles jouets) ;
- que la formule de Rice demande d'intégrer en temps (elle ne demande que la loi stationnaire et F).

## Portée
Figure 1 du rapport : vue d'ensemble du cadre proposé. Les résultats chiffrés (E1, E2, E3), les preuves et la comparaison des cinq mécanismes de divergence vont dans les figures suivantes et dans le texte. Les explications, valeurs et nuances vont dans docs/caption.md.

## Style
Aucun style imposé. Choix : schéma plat type Nature, Arial 5–7 pt, une couleur par entité portée dans les étiquettes (λ vert, latent z violet, u bleu, B vermillon, énergie/loi ambre), contexte gris ; états du signal calculés (densités, lignes de courant, histogrammes) plutôt que des boîtes ; le cylindre VKS en 3D vectorielle (bibliothèque) avec le fini illustré. Raison : figure de cadre méthodologique pour physiciens, où la clarté de la chaîne et l'exactitude des marques de données priment.
