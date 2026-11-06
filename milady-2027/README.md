# milady-2027

Ressources préparatoires, rapport de stage prospectif et proposition de sujet de thèse pour le stage M2 **« Physics-Constrained Generative AI Modelling of Parametric Dynamical Systems »** (projet ANR MilaDy, ANR-25-CE51-0077 ; CEREA/ENPC et LISN, 2027).

**Site** : <https://knoel99.github.io/milady-2027/>

> Ce site est un projet indépendant. Il n'est ni produit ni validé par l'École nationale des ponts et chaussées, le LISN, l'Observatoire de la Côte d'Azur, l'ANR ou les encadrants du stage. L'offre de référence est le PDF publié par les encadrants : <https://scheng2024.github.io/stage_milady_2027.pdf>. Le rapport de stage est **prospectif** : il est écrit comme s'il concluait le stage, mais ses résultats numériques proviennent uniquement des expériences à petite échelle (CPU) de ce dépôt, décrites et reproductibles dans `experiences/`.

## Ce que contient le site

- **Accueil** (`index.html`) : l'offre (faits officiels), le projet MilaDy, le parcours en trois étapes.
- **Préparation** (`prep/`) : 8 modules gradués du niveau licence 1 au niveau M2 recherche (calcul vectoriel et Fourier, mécanique des fluides et turbulence, MHD et effet dynamo, systèmes dynamiques et mesures invariantes, probabilités et transport optimal, apprentissage profond, diffusion et flow matching, contraintes physiques). Chaque module : objectifs, plan de travail, cours avec démonstrations, code Python exécuté, exercices corrigés ★/★★/★★★, sources.
- **Encadrants** (`encadrants/`) : travaux de S. Cheng, D. Lucor, C. Nore et Y. Ponty, pistes de thèse et choix argumenté.
- **Rapport de stage** (`rapport/`) : état de l'art, formulation (taxonomie des contraintes, propositions démontrées), méthodes, expériences E1–E3 et résultats, discussion, ouverture vers la thèse.
- **Sujet de thèse** (`these/`) : piste retenue, partie théorique, plan expérimental planifié et évalué (paliers, métriques, risques, calendrier).
- **Expériences** (`experiences/`) : code, résultats JSON et graphiques.
- **Schémas** (`figures/`) : figures conceptuelles dessinées avec la skill [schematic-figure](https://lgwrightlab.github.io/schematic-figure/) (sources `figure.js`, brief, spec, légende ; sorties SVG/PDF/PNG).

## Reproduire les expériences

Python 3.11+ avec NumPy, SciPy, Matplotlib et PyTorch (CPU suffit).

```bash
cd experiences
python3 e1_gissinger.py            # E1 : loi invariante du modèle de renversements de Gissinger (≈ 1 h CPU)
python3 e2_donnees.py              # E2 : instantanés MHD 2D forcée (≈ 30 min)
python3 e2_mhd2d.py                # E2 : 5 mécanismes de contrainte + volet « en loi » (≈ 1 h)
python3 e3_abc.py                  # E3 : dynamo cinématique ABC, taux de croissance en fonction de Rm (≈ 20 min)
python3 figures.py                 # graphiques
```

Chaque script accepte `--quick` (version réduite, quelques minutes).

## Construire le site

Prérequis : [Quarto](https://quarto.org) 1.7.32, Python 3, Node.js (vérification KaTeX).

```bash
python3 tools/new_page.py prep/<id> "Titre" "Sous-titre"   # squelette d'une page
python3 tools/render.py --all                              # rendu Quarto + KaTeX épinglé (SRI)
NODE_PATH=<node_modules avec katex@0.19.0> node tools/check_katex.mjs $(find . -name index.html)
python3 tools/check_gates.py                               # sections, exercices, liens, ancres
```

Contrats : `specs/page-contract.md` (structure des pages), `specs/notations.md`, `specs/theorie-brief.md` (énoncés communs au rapport et à la thèse).

## Structure

```
index.qmd|html            accueil
prep/<id>/index.qmd|html  modules de préparation
encadrants/               travaux des encadrants, pistes de thèse
rapport/                  rapport de stage
these/                    sujet de thèse
experiences/              code, resultats/*.json, figures/*.png
figures/<nom>/            schémas (figure/figure.js, docs/, figure/out/)
assets/                   paper.css, theme.js (repris de knoel99/master-mva)
specs/                    contrats
tools/                    rendu et contrôles
```

## Dépôt dédié

Ce dossier est autonome : il peut devenir la racine d'un dépôt `knoel99/milady-2027` (GitHub Pages sur `main`, racine). Depuis le dépôt `knoel99.github.io` :

```bash
git subtree split --prefix=milady-2027 -b milady-2027-export
git push git@github.com:knoel99/milady-2027.git milady-2027-export:main
```

## Licence

Code et textes : Apache 2.0 (`LICENSE`). Les textes officiels cités (offre, résumé ANR) restent la propriété de leurs auteurs. KaTeX (MIT) est chargé depuis jsDelivr.
