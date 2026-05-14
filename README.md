# knoel99.github.io

Site portfolio personnel - [knoel99.github.io](https://knoel99.github.io/)

## Projets

| Projet | Description | Stack |
|---|---|---|
| [jobs-fr](https://knoel99.github.io/projects/jobs-fr/) | Treemap interactif des 1 584 metiers du repertoire ROME, colores par exposition a l'IA | D3.js, France Travail API |
| [embassy](https://knoel99.github.io/projects/embassy/) | Carte interactive des distances entre les ambassades des pays du G20 et les centres de pouvoir de chaque capitale | Folium, Python, Geopolitique |
| [deepseek-v4-paper](https://knoel99.github.io/projects/deepseek_v4_paper/) | Lecture guidee du paper DeepSeek-V4 : PDF original a gauche, resume reformule en francais a droite | PDF.js, MoE, LLM |
| [javascript](https://knoel99.github.io/projects/javascript/) | Guide profond de JavaScript : 10 chapitres des origines (1995) aux frameworks modernes, avec contexte historique, diagrammes SVG animes et tableaux comparatifs | Vanilla JS, SVG |

## Structure

```
index.html                          # Landing page (bio + liste des projets)
projects/
  jobs-fr/                          # Treemap exposition IA des metiers francais
    index.html
    data.json
  embassy/                          # Carte des ambassades G20
    index.html
    data/                           # Donnees historiques des ambassades (JSON)
  deepseek_v4_paper/                # Paper walkthrough DeepSeek-V4
    index.html
    sections/                       # Sections HTML du resume
  javascript/                       # Guide JavaScript : origines aux frameworks
    index.html
```

## Ajouter un projet

1. Creer un dossier `projects/mon-projet/` avec un `index.html`
2. Ajouter une carte dans `index.html` (un template commente est inclus dans le HTML)
