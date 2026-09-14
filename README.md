# knoel99.github.io

Portfolio — [knoel99.github.io](https://knoel99.github.io/)

La plupart des projets vivent dans leur propre dépôt GitHub Pages. Ce dépôt contient la landing, des redirects pour les anciennes URLs `/projects/...`, et une page autonome : [Architecture de Grok Bot](https://knoel99.github.io/projects/grok-bot/).

## Projets

| Projet | Repo | URL |
|---|---|---|
| Architecture de Grok Bot | (ce dépôt, `projects/grok-bot/`) | [live](https://knoel99.github.io/projects/grok-bot/) |
| VivaTech 2026 | [vivatech-2026](https://github.com/knoel99/vivatech-2026) | [live](https://knoel99.github.io/vivatech-2026/) |
| GPU | [gpu](https://github.com/knoel99/gpu) | [live](https://knoel99.github.io/gpu/) |
| Exposition des métiers FR à l'IA | [jobs-fr](https://github.com/knoel99/jobs-fr) | [live](https://knoel99.github.io/jobs-fr/) |
| G20 Embassy Distance Map | [ambassy](https://github.com/knoel99/ambassy) | [live](https://knoel99.github.io/ambassy/) |
| DeepSeek V4 Paper Walkthrough FR | [deepseek-v4-paper](https://github.com/knoel99/deepseek-v4-paper) | [live](https://knoel99.github.io/deepseek-v4-paper/) |
| Comprendre JavaScript | [javascript-guide](https://github.com/knoel99/javascript-guide) | [live](https://knoel99.github.io/javascript-guide/) |
| Concepts JavaScript | [js-concepts](https://github.com/knoel99/js-concepts) | [live](https://knoel99.github.io/js-concepts/) |

## Structure

```
index.html                 # Landing (bio + cartes)
assets/                    # Logos des cartes
projects/grok-bot/         # Page autonome (HTML + CSS inline)
projects/<ancien-slug>/    # Redirects vers les nouvelles routes
  index.html
```

## Ajouter un projet

1. Créer un repo public `knoel99/<nom>` avec un `index.html` à la racine et un fichier `.nojekyll`
2. Activer GitHub Pages (Settings → Pages → Deploy from branch `main` / root)
3. Ajouter une carte dans `index.html` pointant vers `https://knoel99.github.io/<nom>/`
