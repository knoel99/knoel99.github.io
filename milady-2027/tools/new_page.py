#!/usr/bin/env python3
"""Crée le squelette d'une page Quarto.

Usage (racine du site) :
    python3 tools/new_page.py prep/p1-calcul-vectoriel "Titre" "Sous-titre"
    python3 tools/new_page.py rapport "Rapport de stage" "Sous-titre"
    python3 tools/new_page.py en/rapport "Internship report" "Subtitle"   (page anglaise)
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from page_header import header  # noqa: E402

if len(sys.argv) != 4:
    sys.exit(__doc__)
rel, title, subtitle = sys.argv[1].strip("/"), sys.argv[2], sys.argv[3]
depth = 0 if rel in ("", ".") else len(Path(rel).parts)
up = "../" * depth
qmd = ROOT / rel / "index.qmd"
if qmd.exists():
    sys.exit(f"{qmd} existe déjà")
qmd.parent.mkdir(parents=True, exist_ok=True)
lang = "en" if Path(rel).parts[:1] == ("en",) else "fr"
first = "## Objectives {#objectifs}" if lang == "en" else "## Objectifs {#objectifs}"
qmd.write_text(header(title, subtitle, up, lang) + "\n" + first + "\n\n", encoding="utf-8")
print(qmd)
