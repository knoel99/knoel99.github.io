#!/usr/bin/env python3
"""Régénère l'en-tête YAML de toutes les pages (ou de celles données) à partir de tools/page_header.py.

Le titre et le sous-titre existants sont conservés ; la langue est déduite du chemin (en/… → anglais).
Usage : python3 tools/refresh_headers.py [chemin …]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))
from page_header import header  # noqa: E402


def refresh(qmd: Path) -> None:
    text = qmd.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n", text, flags=re.S)
    if not m:
        print(f"{qmd}: pas d'en-tête YAML")
        return
    yaml = m.group(1)
    title = re.search(r'^title:\s*"(.*)"\s*$', yaml, flags=re.M)
    sub = re.search(r'^subtitle:\s*"(.*)"\s*$', yaml, flags=re.M)
    rel = qmd.parent.relative_to(ROOT)
    depth = 0 if str(rel) == "." else len(rel.parts)
    lang = "en" if rel.parts[:1] == ("en",) else "fr"
    new = header(title.group(1) if title else "", sub.group(1) if sub else "", "../" * depth, lang)
    qmd.write_text(new + text[m.end():], encoding="utf-8")
    print(f"{rel}: en-tête régénéré ({lang})")


if __name__ == "__main__":
    targets = [ROOT / a / "index.qmd" for a in sys.argv[1:]] or sorted(
        q for q in ROOT.glob("**/index.qmd") if "figures" not in q.parts and "node_modules" not in q.parts)
    for q in targets:
        refresh(q)
