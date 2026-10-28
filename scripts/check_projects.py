import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

TEXT_TOKENS = (
    "grok-bot",
    "vivatech",
    "deepseek",
    "javascript-guide",
    "js-concepts",
)

# The bare word GPU is not a token, because the compute card may say GPU.
GPU_URLS = (
    "github.com/knoel99/gpu",
    "knoel99.github.io/gpu",
)

REDIRECTS = (
    ("jobs-fr", "jobs-fr"),
    ("ambassy", "ambassy"),
    ("embassy", "ambassy"),
)

BANNED_PATHS = (
    "assets/js-logo.svg",
    "assets/deepseek-logo.svg",
    "assets/grok-bot-preview.svg",
)

_SLUG = r"[a-z0-9]+(?:-[a-z0-9]+)*"
_URL = re.compile(r"https://[^\s<>)\"']+")
_SEPARATOR = re.compile(r":?-{3,}:?")


def _boundary(value):
    if value in (ord("/"), ord('"'), ord("'"), ord("`")):
        return True
    return chr(value).isspace()


def _has_bounded_url(data, needle):
    start = 0
    while True:
        index = data.find(needle, start)
        if index < 0:
            return False
        after = index + len(needle)
        if after == len(data) or _boundary(data[after]):
            return True
        start = index + 1


def _tokens_in(data):
    found = []
    for token in TEXT_TOKENS:
        if token.encode("ascii") in data:
            found.append(token)
    for token in GPU_URLS:
        if _has_bounded_url(data, token.encode("ascii")):
            found.append(token)
    return found


def _live_slug(url):
    parts = urlsplit(url.strip())
    if parts.scheme != "https" or parts.netloc != "knoel99.github.io":
        return None
    if parts.query or parts.fragment:
        return None
    match = re.fullmatch(r"/(" + _SLUG + r")/", parts.path)
    if match is None:
        return None
    return match.group(1)


def _repo_slug(url):
    parts = urlsplit(url.strip())
    if parts.scheme != "https" or parts.netloc != "github.com":
        return None
    if parts.query or parts.fragment:
        return None
    match = re.fullmatch(r"/knoel99/(" + _SLUG + r")", parts.path)
    if match is None:
        return None
    return match.group(1)


def _cell_slug(cell, parse):
    found = []
    for url in _URL.findall(cell):
        slug = parse(url)
        if slug is not None:
            found.append(slug)
    if len(found) == 1:
        return found[0]
    return None


def _local_src(src):
    src = src.strip()
    if not src or src.startswith("http"):
        return None
    src = src.split("#", 1)[0].split("?", 1)[0]
    if src.startswith("./"):
        src = src[2:]
    if src.startswith("/"):
        src = src[1:]
    return src


class _Cards(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.slugs = []
        self.bad = []
        self.local_srcs = []
        self._depth = 0

    def handle_starttag(self, tag, attrs):
        attr = {name: value or "" for name, value in attrs}
        if tag == "a" and "project-card" in attr.get("class", "").split():
            self._depth += 1
            href = attr.get("href", "").strip()
            slug = _live_slug(href) if href else None
            if slug is None:
                self.bad.append(href if href else "missing-href")
            else:
                self.slugs.append(slug)
        if tag == "img" and self._depth:
            local = _local_src(attr.get("src", ""))
            if local is not None:
                self.local_srcs.append(local)

    def handle_endtag(self, tag):
        if tag == "a" and self._depth:
            self._depth -= 1


def _parse_cards(html):
    parser = _Cards()
    parser.feed(html)
    parser.close()
    return parser.slugs, parser.bad, parser.local_srcs


def _separator(line):
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(_SEPARATOR.fullmatch(cell) for cell in cells)


def _parse_readme(markdown):
    lines = markdown.splitlines()
    start = None
    for index, line in enumerate(lines):
        if line.strip() == "## Projets":
            start = index + 1
            break
    if start is None:
        return [], ["missing-heading"], []

    table = []
    for number, line in enumerate(lines[start:], start + 1):
        if line.startswith("## "):
            break
        if line.lstrip().startswith("|"):
            table.append((number, line))
    if not table:
        return [], ["missing-table"], []

    slugs = []
    bad = []
    mismatches = []
    for number, line in table[1:]:
        if _separator(line):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if len(cells) < 3:
            bad.append(f"row {number}")
            continue
        repo = _cell_slug(cells[1], _repo_slug)
        live = _cell_slug(cells[2], _live_slug)
        if repo is None or live is None:
            bad.append(f"row {number}")
            continue
        if repo != live:
            mismatches.append((repo, live))
            continue
        slugs.append(repo)
    return slugs, bad, mismatches


def _duplicate_lines(slugs, side):
    counts = {}
    for slug in slugs:
        counts[slug] = counts.get(slug, 0) + 1
    lines = []
    seen = set()
    for slug in slugs:
        if counts[slug] > 1 and slug not in seen:
            seen.add(slug)
            lines.append(f"duplicate {slug} {side}")
    return lines


def _scanned_files(root):
    files = []
    for name in ("index.html", "README.md"):
        path = root / name
        if path.is_file():
            files.append(path)
    for folder in ("assets", "projects"):
        base = root / folder
        if not base.is_dir():
            continue
        files.extend(sorted(path for path in base.rglob("*") if path.is_file()))
    return files


def _removed(root):
    order = {token: index for index, token in enumerate(TEXT_TOKENS + GPU_URLS)}
    hits = []
    seen = set()
    for path in _scanned_files(root):
        rel = path.relative_to(root).as_posix()
        sources = [("-", rel.encode("utf-8"))]
        sources.extend(
            (str(number), line)
            for number, line in enumerate(path.read_bytes().splitlines(), 1)
        )
        for line_no, data in sources:
            for token in _tokens_in(data):
                key = (token, rel, line_no)
                if key in seen:
                    continue
                seen.add(key)
                hits.append(key)
    hits.sort(key=lambda item: (order[item[0]], item[1], -1 if item[2] == "-" else int(item[2])))
    return [f"removed {token} {rel} {line_no}" for token, rel, line_no in hits]


def _redirect_findings(root):
    projects = root / "projects"
    if projects.is_dir():
        got = sorted(entry.name for entry in projects.iterdir() if entry.is_dir())
    else:
        got = []
    expected = {name for name, _target in REDIRECTS}
    lines = []
    if set(got) != expected:
        lines.append("redirect-set got=" + ",".join(got))
    for folder, target in REDIRECTS:
        rel = f"projects/{folder}/index.html"
        path = root / rel
        if not path.is_file():
            lines.append(f"redirect-target {rel} missing")
            continue
        want = f"https://knoel99.github.io/{target}/".encode("ascii")
        if want not in path.read_bytes():
            lines.append(f"redirect-target {rel} {want.decode('ascii')}")
    return lines


def _under_root(root, rel):
    if not rel or "\\" in rel:
        return False
    parts = Path(rel).parts
    if not parts or ".." in parts:
        return False
    return (root / rel).is_file()


def _asset_findings(root, local_srcs):
    base = root / "assets"
    files = []
    if base.is_dir():
        files = sorted(
            path.relative_to(root).as_posix()
            for path in base.rglob("*")
            if path.is_file()
        )
    referenced = []
    seen = set()
    for src in local_srcs:
        if src not in seen:
            seen.add(src)
            referenced.append(src)
    lines = []
    for src in referenced:
        if not _under_root(root, src):
            lines.append(f"missing-asset {src}")
    ref_set = set(referenced)
    for rel in files:
        if rel not in ref_set:
            lines.append(f"unreferenced-asset {rel}")
    present = set(files) | ref_set
    for rel in BANNED_PATHS:
        if rel in present:
            lines.append(f"banned-path {rel}")
    return lines


def check(root):
    root = Path(root)
    findings = []
    index = root / "index.html"
    readme = root / "README.md"

    if not index.is_file():
        cards, card_bad, local_srcs = [], ["index.html missing"], []
    else:
        try:
            html = index.read_text(encoding="utf-8")
        except UnicodeError:
            cards, card_bad, local_srcs = [], ["index.html encoding"], []
        else:
            cards, card_bad, local_srcs = _parse_cards(html)

    if not readme.is_file():
        rows, readme_bad, mismatches = [], ["README.md missing"], []
    else:
        try:
            text = readme.read_text(encoding="utf-8")
        except UnicodeError:
            rows, readme_bad, mismatches = [], ["README.md encoding"], []
        else:
            rows, readme_bad, mismatches = _parse_readme(text)

    if cards != rows:
        findings.append(
            "order-mismatch cards=" + ",".join(cards) + " rows=" + ",".join(rows)
        )
    findings.extend(_duplicate_lines(cards, "cards"))
    findings.extend(_duplicate_lines(rows, "readme"))
    for repo, live in mismatches:
        findings.append(f"row-mismatch {repo} {live}")
    for item in card_bad:
        findings.append(f"unparseable card {item}")
    for item in readme_bad:
        findings.append(f"unparseable readme {item}")
    findings.extend(_removed(root))
    findings.extend(_redirect_findings(root))
    findings.extend(_asset_findings(root, local_srcs))

    if findings:
        return 1, tuple(findings)
    return 0, ("ok", *cards)


def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]
    if argv:
        print("no-arguments")
        return 1
    code, lines = check(Path(__file__).resolve().parent.parent)
    for line in lines:
        print(line)
    return code


if __name__ == "__main__":
    sys.exit(main())
