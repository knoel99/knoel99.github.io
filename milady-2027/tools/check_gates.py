#!/usr/bin/env python3
"""Contrôles d'ensemble du site MilaDy 2027 (à lancer depuis n'importe quel répertoire).

- chaque index.qmd a son index.html, plus récent que la source ;
- les balises KaTeX épinglées (SRI) sont présentes sur les pages qui ont des formules ;
- les modules de préparation ont toutes les sections du contrat et ≥ 10 exercices gradués ;
- tous les liens relatifs (href, src) des pages publiées pointent vers des fichiers existants ;
- les ancres internes (#id) existent dans la page visée ;
- aucun dossier index_files/ ni fichier .quarto n'est publié.
Sortie : « ok » et le nombre de pages, ou la liste des problèmes (code de sortie 1).
"""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
KATEX_SRI = 'integrity="sha384-QFFtAGzvvj+bfgCGxXJlNZZR1nXEZgvG8tDLCCY1F19xl20WlfTYgguB4VcNdxYk"'
PREP_SECTIONS = ["{#objectifs}", "{#prerequis}", "{#plan}", "{#exercices}", "{#lien-stage}", "{#plus-loin}", "{#sources}"]


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a and a["id"]:
            self.ids.add(a["id"])
        for key in ("href", "src"):
            if a.get(key):
                self.refs.append(a[key])


def parse(path):
    p = Links()
    p.feed(path.read_text(encoding="utf-8"))
    return p


def main():
    problems = []
    pages = sorted(q for q in ROOT.glob("**/index.qmd") if "figures" not in q.parts and "node_modules" not in q.parts)
    cache = {}
    for qmd in pages:
        rel = qmd.parent.relative_to(ROOT).as_posix() or "."
        html = qmd.with_name("index.html")
        if not html.is_file():
            problems.append(f"{rel}: index.html manquant")
            continue
        if html.stat().st_mtime + 1 < qmd.stat().st_mtime:
            problems.append(f"{rel}: index.html plus ancien que index.qmd (relancer tools/render.py)")
        text = html.read_text(encoding="utf-8")
        if 'class="math' in text and KATEX_SRI not in text:
            problems.append(f"{rel}: balises KaTeX non épinglées")
        src = qmd.read_text(encoding="utf-8")
        if rel.startswith("prep/") and rel != "prep":
            for sec in PREP_SECTIONS:
                if sec not in src:
                    problems.append(f"{rel}: section {sec} absente")
            ex = src.split("{#exercices}", 1)[-1].split("{#lien-stage}", 1)[0]
            n_ex = len(re.findall(r"^\d+\.\s+\*\*★", ex, flags=re.M))
            if n_ex < 10:
                problems.append(f"{rel}: {n_ex} exercices gradués (≥ 10 attendus)")
        if (qmd.parent / "index_files").exists():
            problems.append(f"{rel}: dossier index_files/ à supprimer")
        links = cache.setdefault(html, parse(html))
        for ref in links.refs:
            parts = urlsplit(ref)
            if parts.scheme or ref.startswith("//") or ref.startswith("mailto:"):
                continue
            target = html if not parts.path else (html.parent / parts.path).resolve()
            if parts.path and target.is_dir():
                target = target / "index.html"
            if not target.exists():
                problems.append(f"{rel}: lien cassé {ref}")
                continue
            if parts.fragment and target.suffix == ".html":
                tl = cache.setdefault(target, parse(target))
                if parts.fragment not in tl.ids:
                    problems.append(f"{rel}: ancre absente {ref}")
    if (ROOT / ".quarto").exists():
        problems.append(".quarto/ présent (ne pas publier)")
    if problems:
        print("\n".join(problems))
        return 1
    print(f"ok {len(pages)} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
