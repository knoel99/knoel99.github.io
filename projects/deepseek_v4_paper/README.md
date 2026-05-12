# DeepSeek V4 - Paper Walkthrough FR

Lecture guidee du paper DeepSeek-V4 : PDF original a gauche, resume reformule en francais pour ingenieurs generalistes a droite.

## Dev local

Ouvrir avec un serveur HTTP (requis car `fetch()` ne marche pas en `file://`) :

```bash
# A la racine du repo
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080/projects/deepseek_v4_paper/

## Generer les sections

```bash
# 1. Creer et activer un venv
python3 -m venv .venv
source .venv/bin/activate

# 2. Installer les dependances
pip install -r ../../scripts/requirements.txt

# 3. Configurer l'API
cp ../../.env.example ../../.env
# Editer .env avec ta clef Z.AI

# 4a. Tester une seule section
python ../../scripts/generate_summaries.py --test-section 01-introduction

# 4b. Generer toutes les sections
python ../../scripts/generate_summaries.py
```

Les sections sont generees dans `sections/` et doivent etre commitees pour etre servies par GitHub Pages.

## Structure

```
projects/deepseek_v4_paper/
  index.html              # Split-view PDF + summaries
  deepseek_v4.pdf         # Paper original
  sections/
    metadata.json         # Index des sections (pages PDF, titres)
    01-introduction.html  # Summary genere par le script
    ...
```

## GitHub Pages

Aucune action requise. Le site est servi en HTTPS, `fetch()` fonctionne nativement. Le `python3 -m http.server` n'est utile qu'en local.
