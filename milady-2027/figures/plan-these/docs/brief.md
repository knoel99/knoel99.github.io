Assumptions: mode=design (description technique fournie, pas d'image de référence), style=own (aplat sobre type Nature pour une figure de plan de recherche : grille « bancs d'essai × axes » surmontée d'un escalier et suivie d'une frise ; bancs en gris neutre, couleur réservée aux trois axes, clé reprise des figures sœurs du site — bleu = contraintes par échantillon (C1), orange = contraintes en loi (C3–C4) — et vert pour le seuil, comme le paramètre **λ** de la figure « cadre »), route=vector3d (les bancs VKS, DRESDYN et la boîte périodique sont des objets physiques : parties 3D de la bibliothèque, `cylinder3`, `obliqueBox`, `circle3`, en projection oblique ; Blender absent), depth=standard (demandé), review=own (demandé), web=off (demandé ; aucune image cherchée : géométries VKS et DRESDYN de mémoire et des fiches du projet, gardées schématiques), width=183 mm (double colonne, demandé), format=journal, langue=français.

# Brief — figure « plan-these »

- **Mode** : design. **Format** : journal (`figure.format = 'journal'`), largeur 183 mm (double colonne), hauteur ≈ 120 mm.
- **Où** : page « Sujet de thèse » du site MilaDy 2027 (`these/`, section plan expérimental), pleine largeur ; peut servir de figure de synthèse dans un dossier de candidature.
- **Lecteur** : encadrants, jury d'école doctorale, physicien·ne des dynamos ou spécialiste d'apprentissage qui découvre le projet ; connaît la MHD ou les modèles génératifs, pas forcément les deux.
- **Phrase à retenir** : la thèse monte une échelle de cinq bancs d'essai, du modèle à 3 modes à l'expérience DRESDYN, et fait avancer à chaque palier trois axes — contraintes dures, contraintes en loi et symétries, seuil et renversements — en 36 mois jalonnés d'articles et de versions du code MilaDy.

## Idées clés (critères de la demande d'abord, verbatim)
1. « Une échelle de bancs d'essai (de gauche à droite, complexité croissante) : palier 0 modèles réduits de renversements (Gissinger à 3 modes, DQVU de Bousquet et al. 2026) ; palier 1 MHD 2D périodique ; palier 2 dynamos 3D périodiques (écoulements ABC et Taylor–Green, codes pseudo-spectraux) ; palier 3 VKS en géométrie cylindrique (SFEMaNS, LATU, sauts de perméabilité, conditions de vide) ; palier 4 DRESDYN (cylindre en précession, HZDR). »
2. « Trois axes scientifiques qui traversent les paliers (bandes horizontales) : axe 1 contraintes dures 3D (potentiel vecteur, jauge, conditions aux limites), axe 2 contraintes en loi et symétries (stationnarité, B → −B), axe 3 seuil dynamo et renversements (formule de Rice, borne d'erreur près d'une bifurcation). »
3. « Une frise temporelle de 36 mois (année 1, 2, 3) sous l'échelle, avec des jalons (articles, code intégré à la boîte à outils MilaDy). »
4. « Débouchés : réduction de modèle, assimilation (TorchDA). »
5. (ajout) Les paliers 0, 1 et 2 prolongent les expériences du stage (E1, E2, E3) : le plan part d'acquis, pas de zéro.
6. (ajout) Un axe ne s'applique pas partout : l'axe 1 commence au palier 1 (le modèle à modes n'a pas de champ dont imposer la divergence) ; l'axe 3 saute le palier 1 (pas de dynamo en 2D, théorème de Zeldovich).

## Ce que la figure ne doit pas laisser croire
- que la hauteur des marches mesure quelque chose (c'est un rang de complexité, pas une valeur) ;
- que le calendrier est fixé par une source : c'est une proposition indicative, à discuter avec les encadrants (dit en légende) ;
- que la dynamo DRESDYN a déjà été observée, ou que la thèse la prédit à coup sûr (l'axe 3 y vise une prédiction du seuil) ;
- qu'un modèle a déjà été entraîné sur VKS ou DRESDYN (le stage s'arrête au palier 2, en version CPU) ;
- que les codes SFEMaNS et LATU sont développés dans la thèse (ce sont des sources de données des partenaires) ;
- que les vignettes des bancs sont des résultats de la thèse : ce sont des illustrations (série *D*(*t*) calculée sur le modèle de Gissinger, carte 2D et mode ABC tirés des données du stage, cuves dessinées) ;
- qu'une dynamo existe en MHD 2D.

## Portée
Vue d'ensemble du plan : quoi, dans quel ordre, quand, pour quoi. Les énoncés (propositions 1–9), les mécanismes du modèle (figure « cadre »), la taxonomie C1–C4 (figure « taxonomie ») et la physique de VKS (figure « vks ») sont ailleurs ; ici, seulement le nom de chaque contrainte au palier où elle devient nouvelle. Les risques, les métriques et la répartition entre partenaires vont dans le texte de la page.

## Style
Choisi par moi : aplat sobre de revue (Arial 5–7 pt, traits fins), grille lisible comme un tableau mais dessinée comme une feuille de route. Les bancs (contexte) sont en gris avec un fini illustré léger (ombrage des cylindres, cartes en niveaux de gris) ; la couleur saturée est réservée aux trois axes (le propos de la thèse). Clé de couleur alignée sur les figures sœurs « taxonomie » et « cadre » (bleu = par échantillon, orange = en loi, vert = paramètre de contrôle / seuil) pour que le lecteur du site passe d'une figure à l'autre sans réapprendre.
