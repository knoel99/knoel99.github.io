Assumptions: mode=design (description écrite + note théorique, pas d'image de référence), style=own (schéma conceptuel plat style Nature : deux teintes de rôle, bleu « par échantillon » et orange « en loi », sur gris neutres ; lecteurs physique + apprentissage), route=flat (taxonomie et lois de probabilité : aucun objet physique à rendre, cases et petits graphes sont le bon registre, P1/P30 « when not »), depth=standard (demandé), review=own (demandé), web=off (aucun objet réel dessiné : VKS n'apparaît que comme nom d'exemple), width=183 mm (demandé), format=journal (page web du rapport, insérée à 100 %), hauteur ≈ 80 mm.

# Brief — figure « taxonomie »

- **Mode** : design. **Format** : journal, double colonne 183 mm, hauteur ≈ 80 mm. Insérée dans la section « taxonomie » du rapport de stage (page Quarto, `width="100%"`).
- **Lecteur** : M2/doctorant ou encadrant en MHD et/ou en apprentissage génératif ; connaît ∇·**B** = 0 et le flow matching, n'a pas lu la note théorique.
- **Style** : choisi par moi (aucun style imposé) : schéma plat, cases et petits graphes qualitatifs, une teinte par rôle (bleu = contrainte vraie pour chaque échantillon et mécanisme qui agit sur chaque échantillon ; orange = contrainte vraie pour la loi et mécanisme qui agit sur la loi), gris pour le contexte (loi des données, modèle avant correction). Raison : la dimension « vraie pour chaque échantillon / vraie pour la loi » est le message ; la couleur doit la porter dans les deux panneaux.

## La phrase à retenir
Chaque classe de contrainte appelle un mécanisme qui agit là où la contrainte est vraie : sur chaque échantillon pour C1–C2, sur la loi pour C3–C4 ; projeter chaque échantillon sur une contrainte en loi (bilan d'énergie, C4) remplace la loi de d*E*/d*t* par un Dirac, alors qu'une correction en loi garde la dispersion et recentre la moyenne.

## Idées clés (critères de l'utilisateur d'abord, verbatim)
1. « Quatre classes en colonnes ou en lignes : C1 locales linéaires (∇·u = 0, ∇·B = 0, conditions aux limites linéaires) → architecture (potentiels, rotationnel) ou projection de Leray ; C2 locales non linéaires (résidu d'une EDP stationnaire) → projection non linéaire ou pénalité/guidage (écart de Jensen) ; C3 symétries (B → −B, rotation Rπ de VKS) → champ de vitesse équivariant, loi de base invariante ; C4 statistiques « en loi » (bilan d'énergie moyen E[ε] = E[P], identités de stationnarité E[𝓛φ] = 0) → perte de stationnarité ou inclinaison exponentielle. »
2. « Panneau de droite (le cœur) : pour C4, trois lois de dE/dt côte à côte : la loi vraie (étalée, moyenne nulle), la loi après projection de chaque échantillon sur dE/dt = 0 (un pic de Dirac : fausse), la loi après correction en loi (étalée, moyenne recentrée). »
3. « Courbes qualitatives clairement présentées comme illustratives (pas de valeurs inventées présentées comme mesures). »
4. C1 et C2 sont vraies pour chaque échantillon ; C3 et C4 seulement pour la loi (note théorique, §1, colonne « Vraie pour »).
5. La projection par échantillon et la correction en loi satisfont toutes deux 𝔼[d*E*/d*t*] = 0, mais seule la seconde garde une loi proche de μ (Corollaire 6, Proposition 7).
6. Pour une contrainte non linéaire, la pénalité sur la prédiction moyenne est biaisée : la moyenne de deux états admissibles n'est pas admissible (écart de Jensen, Proposition 3).

## Ce que la figure ne doit pas laisser croire
- Que les courbes du panneau b sont des mesures (E1/E2) : ce sont des allures illustratives, dites comme telles sur la figure et dans la légende.
- Que d*E*/d*t* = 0 vaut pour chaque instantané d'un écoulement turbulent stationnaire (c'est faux : seule la moyenne est nulle).
- Que la correction en loi redonne exactement μ (l'I-projection corrige la moyenne visée, pas toute la forme).
- Que la symétrie C3 est vraie pour chaque échantillon (un instantané n'est pas symétrique ; la loi l'est).
- Que le mécanisme « projection » est faux en général : il est exact pour C1 (et adapté à C2) ; il n'est faux que sur une contrainte en loi.
- Toute valeur numérique (β, variances, KL) sur la figure.

## Portée
Cette figure classe les contraintes et montre le piège central (C4). Les preuves (Propositions 1–7), les expériences E1/E2 et les chiffres vont dans le texte et la légende. La décomposition du flot optimal (Prop. 2) et la formule de Rice (Prop. 8) ne sont pas dans cette figure.
