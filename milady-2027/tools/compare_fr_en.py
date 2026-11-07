#!/usr/bin/env python3
"""Contrôle de parité structurelle entre une page française et sa traduction anglaise.

Compare : ancres des titres {#id} (mêmes ids, même ordre), nombre de formules ($ et $$),
d'encadrés (:::), de blocs de code, d'images, de widgets, de tableaux, d'exercices gradués (★).
Usage : python3 tools/compare_fr_en.py <P> [<P> …]   (P = chemin de la page française)
Code de sortie 1 si un écart est trouvé.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def body(path: Path) -> str:
    t = path.read_text(encoding="utf-8")
    m = re.match(r"---\n.*?\n---\n", t, flags=re.S)
    return t[m.end():] if m else t


def maths(t: str) -> list:
    """Suite des formules, normalisée : \\text{…} retiré, virgule décimale {,} → point, espaces retirés."""
    no_code = re.sub(r"```.*?```", "", t, flags=re.S)
    out = re.findall(r"\$\$(.*?)\$\$", no_code, flags=re.S)
    rest = re.sub(r"\$\$.*?\$\$", "", no_code, flags=re.S)
    out += re.findall(r"(?<![\\$])\$([^$\n]+?)\$", rest)
    norm = []
    for m in out:
        m = re.sub(r"\\(?:text|textrm|mbox|textit|textbf|operatorname)\{[^{}]*\}", "", m)
        m = m.replace("{,}", ".").replace(",\\!", ".")
        norm.append(re.sub(r"\s+", "", m))
    return norm


def stats(t: str) -> dict:
    no_code = re.sub(r"```.*?```", "", t, flags=re.S)
    return {
        "ancres": re.findall(r"^#{2,4} .*?\{#([\w-]+)", t, flags=re.M),
        "formules $$": len(re.findall(r"\$\$", no_code)) // 2,
        "formules $": len(re.findall(r"(?<![\$\\])\$(?!\$)", re.sub(r"\$\$.*?\$\$", "", no_code, flags=re.S))) // 2,
        "encadrés": len(re.findall(r"^:{3,}\s*\w", t, flags=re.M)),
        "blocs de code": len(re.findall(r"^```", t, flags=re.M)) // 2,
        "images": len(re.findall(r"!\[", t)),
        "widgets": len(re.findall(r'data-widget="', t)),
        "lignes de tableau": len(re.findall(r"^\|", t, flags=re.M)),
        "exercices ★": len(re.findall(r"^\d+\.\s+\*\*★", t, flags=re.M)),
    }


def main(pages):
    bad = 0
    for p in pages:
        p = p.strip("/")
        fr = ROOT / (p if p not in ("", ".") else "") / "index.qmd"
        en = ROOT / "en" / (p if p not in ("", ".") else "") / "index.qmd"
        if not en.is_file():
            print(f"{p}: page anglaise absente")
            bad += 1
            continue
        a, b = stats(body(fr)), stats(body(en))
        diffs = []
        for k in a:
            if a[k] != b[k]:
                if k == "ancres":
                    missing = [x for x in a[k] if x not in b[k]]
                    extra = [x for x in b[k] if x not in a[k]]
                    diffs.append(f"ancres manquantes {missing} en trop {extra}" if (missing or extra) else "ordre des ancres différent")
                else:
                    diffs.append(f"{k} FR={a[k]} EN={b[k]}")
        ma, mb = maths(body(fr)), maths(body(en))
        sa, sb = sorted(ma), sorted(mb)
        if sa != sb:
            only_fr = [x for x in set(ma) - set(mb)][:4]
            only_en = [x for x in set(mb) - set(ma)][:4]
            diffs.append(f"formules différentes : {len(set(ma) ^ set(mb))} (ex. FR {only_fr} / EN {only_en})")
        print(f"{p}: " + ("parité OK" if not diffs else "ÉCARTS : " + " ; ".join(diffs)))
        bad += bool(diffs)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or ["."]))
