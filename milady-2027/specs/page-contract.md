# Contrat de page — site MilaDy 2027

Toutes les pages sont en **français**. Source Quarto `index.qmd`, page publiée `index.html` (rendue par `python3 tools/render.py <chemin>`).
Ne jamais éditer un `index.html` à la main.

## En-tête

Créer la page avec `python3 tools/new_page.py <chemin> "Titre" "Sous-titre"` : l'en-tête (KaTeX épinglé, barre supérieure, sommaire latéral, pied de page) est généré. Ne pas le modifier.

## Structure d'un module de préparation (`prep/<id>/index.qmd`)

1. `## Objectifs {#objectifs}` — 4 à 8 capacités vérifiables (« savoir calculer… », « savoir démontrer… »).
2. `## Prérequis {#prerequis}` — niveau de départ (L1, L2…), modules du site à lire avant (liens relatifs `../<id>/index.html`).
3. `## Plan de travail {#plan}` — tableau : séance, durée estimée, niveau (1 = fondations, 2 = cœur, 3 = proche de la recherche ; le niveau ne redescend jamais), contenu, exercices associés. Total d'heures indiqué.
4. Chapitres numérotés `## 1. Titre {#ch1}`, `## 2. … {#ch2}` … Chaque chapitre : motivation physique ou pratique en une ou deux phrases, définitions, résultats (énoncé + démonstration ou esquisse honnête), exemple chiffré, code Python exécutable, encadré récapitulatif.
5. `## Exercices {#exercices}` — au moins 8 exercices gradués ★ / ★★ / ★★★, chacun avec une solution complète (*Solution* : …). Au moins un exercice de code.
6. `## Lien avec le stage {#lien-stage}` — où ce module sert dans le stage MilaDy (renvoyer au rapport `../../rapport/index.html#…` et au sujet de thèse `../../these/index.html` quand c'est pertinent).
7. `## Pour aller plus loin {#plus-loin}` — 3 à 6 lectures commentées.
8. `## Sources {#sources}` — références complètes (auteurs, année, titre, revue/éditeur, DOI ou URL). Uniquement des références vérifiées.

## Encadrés (divs Quarto, classes définies dans `assets/paper.css`)

```markdown
::: def
[Définition 1.2 — Champ solénoïdal]{.tag}
Texte.
:::

:::: thm
[Théorème 1.3 — Décomposition de Helmholtz–Hodge]{.tag}
Énoncé.

::: proof
Démonstration. [∎]{.qed}
:::
::::

::: prop
[Proposition 2.1 — …]{.tag}
:::

::: ex
[Exemple 2.2 — …]{.tag}
:::

::: note
[Remarque]{.tag}
:::

::: key
[À retenir]{.tag}
Formule ou idée centrale.
:::

:::: recap
::: recap-title
Ce qu'il faut retenir — chapitre 2
:::
- point 1
- point 2
::::
```

Numérotation : `Définition <chapitre>.<n>` (un seul compteur par chapitre pour tous les types d'encadrés).

## Mathématiques

- KaTeX : `$…$` en ligne, `$$…$$` en bloc (une équation par bloc, phrases de liaison entre les blocs). Pas de `\label`/`\eqref` ; numéroter à la main avec `\tag{2.3}` si besoin.
- Notations communes : voir `specs/notations.md`. Vecteurs en gras droit `\mathbf{u}`, `\mathbf{B}` ; opérateurs `\nabla\cdot`, `\nabla\times`, `\Delta` ; moyenne spatiale `\langle\cdot\rangle` ; espérance `\mathbb{E}`.
- Pas de macro personnalisée (KaTeX sans préambule).

## Code

- Blocs ```` ```python ```` statiques (Quarto ne les exécute pas). Chaque bloc doit tourner tel quel en moins de 30 s sur un CPU avec NumPy, SciPy, Matplotlib, PyTorch (CPU). Le rédacteur exécute chaque bloc et recopie la sortie utile en commentaire (`# sortie : …`).
- Pas de données téléchargées sauf mention explicite.

## Figures

- Schémas conceptuels : SVG/PNG produits par la skill `schematic-figure` (dossier `figures/<nom>/`), insérés par `![Légende complète.](../../figures/<nom>/<nom>.png){width="100%" fig-alt="Description textuelle."}`.
- Graphiques de résultats : `experiences/figures/*.png` (matplotlib).

## Style d'écriture

- Phrases complètes, ton d'un cours écrit ; pas de style télégraphique ; une idée par paragraphe.
- Chaque chiffre de la littérature est sourcé (auteur, année) et figure dans les Sources.
- Distinguer clairement ce qui est **mesuré dans ce dépôt** (expériences `experiences/`), ce qui est **publié** (avec référence) et ce qui est **conjecturé**.
- Aucun fait inventé sur les encadrants, l'offre ou le projet MilaDy : ne citer que `research/*.md` vérifié ou l'offre elle-même.
