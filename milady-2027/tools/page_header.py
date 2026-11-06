#!/usr/bin/env python3
"""Front matter commun des pages (Quarto), en français ou en anglais.

`up` est le chemin relatif vers la racine du site (où vivent assets/) :
index.qmd → "", rapport/index.qmd → "../", prep/p1-x/index.qmd → "../../",
en/prep/p1-x/index.qmd → "../../../". Les pages anglaises vivent sous en/ avec les mêmes chemins.
"""

KATEX = "https://cdn.jsdelivr.net/npm/katex@0.19.0/dist/katex.min.js"

UI = {
    "fr": {"skip": "Aller au contenu", "contents": "Sommaire", "theme": "Thème", "home": "← Accueil",
           "prep": "Préparation", "sup": "Encadrants", "report": "Rapport de stage", "thesis": "Sujet de thèse",
           "exp": "Expériences", "interactive": "Schémas interactifs"},
    "en": {"skip": "Skip to content", "contents": "Contents", "theme": "Theme", "home": "← Home",
           "prep": "Preparation", "sup": "Supervisors", "report": "Internship report", "thesis": "PhD proposal",
           "exp": "Experiments", "interactive": "Interactive diagrams"},
}


def header(title: str, subtitle: str, up: str, lang: str = "fr") -> str:
    u = UI[lang]
    home = up + ("en/" if lang == "en" else "")   # racine de la langue
    return f'''---
title: "{title}"
subtitle: "{subtitle}"
lang: {lang}
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
          <a class="skip" href="#main">{u["skip"]}</a>
          <header class="topbar">
            <button type="button" class="tb-btn" id="toc-toggle" aria-controls="sidetoc" aria-expanded="false"><span aria-hidden="true">☰</span><span class="tb-label">{u["contents"]}</span></button>
            <a class="brand" href="{home}index.html">MilaDy<span class="brand-sub"> · 2027</span></a>
            <span class="tb-title" id="tb-title"></span>
            <button type="button" class="tb-btn" id="theme-toggle"><span aria-hidden="true">◐</span><span class="tb-label">{u["theme"]}</span></button>
          </header>
          <div class="layout">
          <nav class="sidetoc" id="sidetoc" aria-label="{u["contents"]}"></nav>
          <main class="paper" id="main">
    include-after-body:
      - text: |
          </main>
          </div>
          <footer class="foot"><p><a href="{home}index.html">{u["home"]}</a> · <a href="{home}prep/index.html">{u["prep"]}</a> · <a href="{home}encadrants/index.html">{u["sup"]}</a> · <a href="{home}rapport/index.html">{u["report"]}</a> · <a href="{home}these/index.html">{u["thesis"]}</a> · <a href="{home}interactifs/index.html">{u["interactive"]}</a> · <a href="{home}experiences/index.html">{u["exp"]}</a></p></footer>
          <script defer src="{up}assets/theme.js"></script>
---
'''
