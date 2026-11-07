#!/usr/bin/env python3
"""Corrige les liens d'une page anglaise en/<P>/index.qmd traduite à partir de <P>/index.qmd.

Le traducteur garde les liens tels qu'ils sont dans la page française. Ce script :
- laisse inchangés les liens vers des pages (.html, dossiers) : le site anglais reproduit les chemins,
  donc le même lien relatif mène à la page anglaise homologue ;
- réécrit les liens vers des ressources (images, scripts, données, specs…) pour qu'ils pointent vers
  la ressource commune à partir de en/<P>/ ;
- remplace une image par sa variante anglaise quand elle existe (x.png → x-en.png) ;
- laisse les liens externes et les ancres internes intacts.
Usage : python3 tools/make_en.py <P> [<P> …]   (P = chemin de la page française, ex. prep/p1-calcul-vectoriel)
"""
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE_EXT = {".html", ""}
LINK = re.compile(r'(\]\()([^)\s]+)((?:\s+"[^"]*")?\))|((?:src|href|data-src)=")([^"]+)(")')


def fix_target(target: str, fr_dir: Path, en_dir: Path) -> str:
    if re.match(r"^[a-z]+:", target) or target.startswith(("#", "//", "mailto:")):
        return target
    path, _, frag = target.partition("#")
    if not path:
        return target
    # Idempotence : un lien déjà réécrit pointe, depuis en/<P>/, vers une ressource commune existante.
    already = (en_dir / path).resolve()
    try:
        inside = already.relative_to(ROOT)
        if already.is_file() and inside.parts[:1] != ("en",) and already.suffix not in (".html",):
            resolved = already
            if resolved.suffix.lower() in (".png", ".svg", ".jpg", ".jpeg", ".pdf") and not resolved.stem.endswith("-en"):
                v = resolved.with_name(resolved.stem + "-en" + resolved.suffix)
                if v.is_file():
                    resolved = v
            return os.path.relpath(resolved, en_dir) + ("#" + frag if frag else "")
    except ValueError:
        pass
    resolved = (fr_dir / path).resolve()
    try:
        rel_root = resolved.relative_to(ROOT)
    except ValueError:
        return target
    is_page = resolved.suffix in PAGE_EXT and (resolved.suffix == ".html" or resolved.is_dir())
    if is_page and resolved.name in ("index.html",) or (is_page and resolved.is_dir()):
        return target  # page : même chemin relatif côté anglais
    # ressource : variante anglaise si elle existe
    if resolved.suffix.lower() in (".png", ".svg", ".jpg", ".jpeg", ".pdf"):
        en_variant = resolved.with_name(resolved.stem + "-en" + resolved.suffix)
        if en_variant.is_file():
            resolved = en_variant
    new = os.path.relpath(resolved, en_dir)
    return new + ("#" + frag if frag else "")


def process(page: str) -> int:
    page = page.strip("/")
    fr_dir = (ROOT / page).resolve() if page not in ("", ".") else ROOT
    en_dir = ROOT / "en" / page if page not in ("", ".") else ROOT / "en"
    qmd = en_dir / "index.qmd"
    text = qmd.read_text(encoding="utf-8")
    m = re.match(r"---\n.*?\n---\n", text, flags=re.S)
    head, body = (text[: m.end()], text[m.end():]) if m else ("", text)
    n = 0

    def repl(mo):
        nonlocal n
        if mo.group(1):
            new = fix_target(mo.group(2), fr_dir, en_dir)
            n += new != mo.group(2)
            return mo.group(1) + new + mo.group(3)
        new = fix_target(mo.group(5), fr_dir, en_dir)
        n += new != mo.group(5)
        return mo.group(4) + new + mo.group(6)

    body = LINK.sub(repl, body)
    qmd.write_text(head + body, encoding="utf-8")
    print(f"en/{page}: {n} liens de ressources réécrits")
    return n


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for p in sys.argv[1:]:
        process(p)
