#!/usr/bin/env python3
"""
Régénère sessions.js à partir des pages HTML officielles de VivaTech.

Workflow « mise à jour automatique » :
  1. Sur https://vivatech.com/sessions, filtre le programme (officiel,
     partenaires, side events…) et enregistre la page rendue en .html
     dans ce dossier (ex. officialprogram.html, partners.html,
     side-events.html). Le menu « Enregistrer la page » du navigateur suffit.
  2. Lancer :  python3 build_sessions.py
  3. sessions.js est reconstruit (union dédupliquée de toutes les sessions
     trouvées, avec descriptifs). Committer et pousser.

Les données VivaTech sont streamées en JSON dans des blocs
  <script>self.__next_f.push([1,"...json échappé..."])</script>
Ce script décode ces blocs, en extrait chaque session, et écrit sessions.js.
"""
import json
import re
import glob
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# Ordre d'affichage des colonnes de la grille (scènes / arènes sur site).
# Toute « salle » absente de cette liste (side event hors site) n'aura pas de
# colonne : la session reste visible dans la vue Liste.
ARENA = [
    "Stage One", "VivaTech Theater", "Black Stage", "Purple Stage", "Red Stage",
    "Founders Arena", "Business Redefined Arena", "Future of Industries Arena",
    "Sovereignty Arena", "Executive Arena", "Investor Lounge", "Pitch Studio",
    "Workshop A", "Workshop B", "Discovery Stage", "VivaLounge", "Business Plaza",
]

# track officiel VivaTech -> clé de thème (code couleur)
TRACK_THEME = {
    "Artificial Intelligence": "ai",
    "Risk, Build, Scale": "scale",
    "Energy, Greentech & Mobility": "energy",
    "Health & Longevity": "health",
    "Productivity Reimagined": "productivity",
    "Tech Beyond the Obvious": "deeptech",
    "Sovereignty & Ethics": "sovereignty",
    "Cybersecurity & Defense": "cyber",
    "Creative Industries": "creative",
    "Tech Leaders Summit": "scale",
    "CMO Summit": "creative",
}
# repli quand aucun track : premier tag reconnu
TAG_THEME = {
    "Artificial Intelligence & Robotics": "ai",
    "DeepTech": "deeptech",
    "Sovereignty & GovTech": "sovereignty",
    "Growth & Startup & Investment": "scale",
    "Fintech & Banking & Compliance": "scale",
    "Media & Entertainment & Creators Economy": "creative",
    "Marketing & Advertising": "creative",
    "Luxury & Fashion & Cosmetics": "creative",
    "Gaming & Sports & Esports": "creative",
    "HR & EdTech & Future of Work": "productivity",
    "Healthcare & Wellness": "health",
    "Energy & Greentech": "energy",
    "Mobility & Smart Cities": "energy",
    "Food & Agriculture": "energy",
    "Cybersecurity & Defense": "cyber",
}

THEMES_JS = """const THEMES = {
  ai:           { label: "Intelligence artificielle",      color: "#7c3aed" },
  scale:        { label: "Risk, Build & Scale",            color: "#0066cc" },
  health:       { label: "Santé & Longévité",              color: "#0d9488" },
  productivity: { label: "Productivité réinventée",        color: "#ea580c" },
  energy:       { label: "Énergie, GreenTech & Mobilité",  color: "#16a34a" },
  sovereignty:  { label: "Souveraineté & Éthique",         color: "#4f46e5" },
  cyber:        { label: "Cybersécurité & Défense",        color: "#dc2626" },
  creative:     { label: "Industries créatives",           color: "#db2777" },
  deeptech:     { label: "Tech Beyond the Obvious",        color: "#0891b2" },
  other:        { label: "Autres sessions",                color: "#64748b" },
};"""

DAY_META = {
    "Dim.": "Dimanche", "Lun.": "Lundi", "Mar.": "Mardi", "Mer.": "Mercredi",
    "Jeu.": "Jeudi", "Ven.": "Vendredi", "Sam.": "Samedi",
}
WEEKDAY = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
WEEKDAY_SHORT = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."]
MONTH_FR = {6: "juin", 5: "mai", 7: "juillet"}


def decode_next(path):
    """Concatène et déséchappe tous les blocs self.__next_f.push([1,"..."])."""
    t = open(path, encoding="utf-8").read()
    parts = []
    marker = 'self.__next_f.push([1,'
    i = 0
    while True:
        j = t.find(marker, i)
        if j < 0:
            break
        k = j + len(marker)
        while k < len(t) and t[k] != '"':
            k += 1
        m = k + 1
        buf = []
        while m < len(t):
            c = t[m]
            if c == '\\':
                buf.append(t[m:m + 2]); m += 2; continue
            if c == '"':
                break
            buf.append(c); m += 1
        try:
            parts.append(json.loads('"' + ''.join(buf) + '"'))
        except Exception:
            pass
        i = m + 1
    return ''.join(parts)


def extract_sessions(full):
    dec = json.JSONDecoder()
    guid = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    starts = [m.start() for m in re.finditer(r'\{"id":"' + guid + '","uid":"', full)]
    out = {}
    for s in starts:
        try:
            obj, _ = dec.raw_decode(full, s)
        except Exception:
            continue
        if isinstance(obj, dict) and isinstance(obj.get("time"), dict) and obj["time"].get("startDate"):
            out.setdefault(obj["id"], obj)
    return out


def theme_for(o):
    if o.get("tracks"):
        return TRACK_THEME.get(o["tracks"][0], "other")
    for tg in (o.get("tags") or []):
        if tg in TAG_THEME:
            return TAG_THEME[tg]
    return "other"


def clean(s):
    return " ".join((s or "").split()).strip()


def kind_for(o, src):
    if "side" in src and not o.get("official_session"):
        return "side"
    if o.get("partner_session") and not o.get("official_session"):
        return "partner"
    return "official"


def tomin(h):
    a, b = h.split(":")
    return int(a) * 60 + int(b)


def hm(m):
    return f"{m // 60:02d}:{m % 60:02d}"


def main():
    files = sorted(glob.glob(os.path.join(HERE, "*.html")))
    files = [f for f in files if os.path.basename(f) != "index.html"]
    if not files:
        raise SystemExit("Aucun fichier HTML VivaTech trouvé dans " + HERE)

    alls = {}
    for f in files:
        for sid, o in extract_sessions(decode_next(f)).items():
            if sid not in alls:
                o["_src"] = os.path.basename(f)
                alls[sid] = o
    print(f"{len(files)} fichiers, {len(alls)} sessions uniques")

    rows = []
    for o in alls.values():
        tm = o["time"]
        room = (tm.get("room") or {}).get("name") or "—"
        sp = []
        for p in (o.get("speakers") or [])[:6]:
            if not isinstance(p, dict):
                continue
            nm = " ".join(x for x in [(p.get("firstname") or "").strip(),
                                      (p.get("lastname") or "").strip()] if x).strip()
            co = (p.get("company") or "").strip()
            sp.append(f"{nm} ({co})" if co else nm)
        rows.append({
            "day": tm["startDate"][:10], "start": tm["startDate"][11:16],
            "end": tm["endDate"][11:16], "stage": room, "venue": room,
            "theme": theme_for(o), "kind": kind_for(o, o["_src"]),
            "title": clean(o.get("title")), "speakers": sp,
            "desc": clean(o.get("description")),
        })
    rows.sort(key=lambda r: (r["day"], tomin(r["start"]), r["stage"]))

    used = {r["stage"] for r in rows if r["stage"] in ARENA}
    stages = [s for s in ARENA if s in used]

    days = []
    for d in sorted({r["day"] for r in rows}):
        dr = [r for r in rows if r["day"] == d]
        arena = [r for r in dr if r["stage"] in stages]
        y, mo, dd = map(int, d.split("-"))
        import datetime
        wd = datetime.date(y, mo, dd).weekday()
        label = f"{WEEKDAY_SHORT[wd]} {dd}"
        full = f"{WEEKDAY[wd]} {dd} {MONTH_FR.get(mo, '')}".strip()
        mn = min(tomin(r["start"]) for r in dr)
        mx = max(tomin(r["end"]) for r in dr)
        note = "Programme officiel" if arena else "Side events"
        days.append({"id": d, "label": label, "full": full,
                     "hours": f"{hm(mn)} – {hm(mx)}", "note": note})

    header = (
        "/* ============================================================================\n"
        "   VivaTech 2026 — programme officiel + side events\n"
        "   ----------------------------------------------------------------------------\n"
        "   Fichier GÉNÉRÉ par build_sessions.py à partir des pages HTML officielles\n"
        "   VivaTech (https://vivatech.com/sessions). Ne pas éditer à la main :\n"
        "   déposer les nouvelles pages .html dans ce dossier puis relancer le script.\n\n"
        "   Champs : day, start, end, stage (= salle/scène), venue, theme (clé THEMES),\n"
        "   kind (\"official\" | \"partner\" | \"side\"), title, speakers[], desc.\n"
        "   ========================================================================== */"
    )
    days_js = "const DAYS = [\n" + "".join(
        f'  {{ id: "{d["id"]}", label: "{d["label"]}", full: "{d["full"]}", '
        f'hours: "{d["hours"]}", note: "{d["note"]}" }},\n' for d in days) + "];"
    stages_js = (
        "// Scènes / arènes sur site (ordre des colonnes de la grille).\n"
        "// Les side events hors site n'ont pas de colonne : ils sont en vue Liste.\n"
        "const STAGES = [\n  " +
        ", ".join(json.dumps(s, ensure_ascii=False) for s in stages) + ",\n];")
    sess_js = (f"// Programme complet VivaTech 2026 ({len(rows)} sessions). theme = clé de THEMES.\n"
               "const SESSIONS = [\n" +
               ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in rows) + "\n];")

    out = "\n\n".join([header, days_js, stages_js, THEMES_JS, sess_js]) + "\n"
    open(os.path.join(HERE, "sessions.js"), "w", encoding="utf-8").write(out)
    print(f"sessions.js écrit : {len(rows)} sessions, {len(days)} jours, {len(stages)} scènes")


if __name__ == "__main__":
    main()
