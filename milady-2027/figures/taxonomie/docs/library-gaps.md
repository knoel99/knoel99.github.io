# Library gaps
- Graphe de loi avec masses de Dirac pondérées (« stem plot » d'une mesure empirique) et flèche de Dirac : dessinés à la main avec `L.line`, `L.circle`, `L.arrow`. `L.density` ne gère ni la flèche δ ni les tiges ; une pièce `L.empiricalMeasure(p, xs, ws, …)` servirait aux figures de lois.
- Vignettes d'espace d'états (sous-espace + projection orthogonale avec angle droit, variété + écart de Jensen, loi miroir) : primitives seules ; aucune pièce de la bibliothèque ne couvre ces glyphes conceptuels de géométrie des lois.
