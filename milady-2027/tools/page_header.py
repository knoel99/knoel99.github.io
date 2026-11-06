#!/usr/bin/env python3
"""Front matter commun des pages (Quarto). Utilisé par tools/new_page.py.

Le chemin relatif vers la racine dépend de la profondeur de la page :
index.qmd (racine) → "", rapport/index.qmd → "../", prep/p1-x/index.qmd → "../../".
"""

KATEX = "https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.js"


def header(title: str, subtitle: str, up: str) -> str:
    return f'''---
title: "{title}"
subtitle: "{subtitle}"
lang: fr
format:
  html:
    theme: none
    minimal: true
    toc: false
    anchor-sections: false
    html-math-method:
      method: katex
      url: "{KATEX}"
    highlight-style: github
    embed-resources: false
    css: {up}assets/paper.css
    include-in-header:
      - text: |
          <meta name="color-scheme" content="light dark">
          <script>(function(){{try{{var t=localStorage.getItem("milady-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}}catch(e){{}}}})();</script>
    include-before-body:
      - text: |
          <a class="skip" href="#main">Aller au contenu</a>
          <header class="topbar">
            <button type="button" class="tb-btn" id="toc-toggle" aria-controls="sidetoc" aria-expanded="false"><span aria-hidden="true">☰</span><span class="tb-label">Sommaire</span></button>
            <a class="brand" href="{up}index.html">MilaDy<span class="brand-sub"> · 2027</span></a>
            <span class="tb-title" id="tb-title"></span>
            <button type="button" class="tb-btn" id="theme-toggle"><span aria-hidden="true">◐</span><span class="tb-label">Thème</span></button>
          </header>
          <div class="layout">
          <nav class="sidetoc" id="sidetoc" aria-label="Sommaire"></nav>
          <main class="paper" id="main">
    include-after-body:
      - text: |
          </main>
          </div>
          <footer class="foot"><p><a href="{up}index.html">← Accueil</a> · <a href="{up}prep/index.html">Préparation</a> · <a href="{up}encadrants/index.html">Encadrants</a> · <a href="{up}rapport/index.html">Rapport de stage</a> · <a href="{up}these/index.html">Sujet de thèse</a> · <a href="{up}experiences/index.html">Expériences</a></p></footer>
          <script defer src="{up}assets/theme.js"></script>
---
'''
