# knoel99.github.io

Portfolio — [knoel99.github.io](https://knoel99.github.io/)

La plupart des projets vivent dans leur propre dépôt GitHub Pages. Ce dépôt contient la landing et des redirects pour d'anciennes URLs `/projects/...`.

## Projets

| Projet | Repo | URL |
|---|---|---|
| Exposition des métiers FR à l'IA | [jobs-fr](https://github.com/knoel99/jobs-fr) | [live](https://knoel99.github.io/jobs-fr/) |
| G20 Embassy Distance Map | [ambassy](https://github.com/knoel99/ambassy) | [live](https://knoel99.github.io/ambassy/) |

## Structure

```
index.html
assets/
projects/jobs-fr/
projects/ambassy/
projects/embassy/
scripts/check_projects.py
```

## Ajouter un projet

1. Créer un repo public `knoel99/<nom>` avec un `index.html` à la racine et un fichier `.nojekyll`
2. Activer GitHub Pages (Settings → Pages → Deploy from branch `main` / root)
3. Ajouter une carte dans `index.html` pointant vers `https://knoel99.github.io/<nom>/`. Un logo local reprend la classe `logo-preview` et `assets/<nom>-logo.svg`. Une capture reprend la carte jobs-fr.
4. Ajouter une ligne au tableau Projets. Le lien repo et le lien live utilisent le même slug, dans le même ordre que les cartes.
5. Depuis n'importe quel répertoire, lancer `python3 scripts/check_projects.py`. La sortie commence par `ok`, puis les slugs. Le code de sortie est 0.
