#!/usr/bin/env python3
"""Generate manifest.json from embassies.js + _progress.json + fragment files.

The manifest is a lightweight index (~10 KB) used by the front-end to render
the initial map without loading the full embassies.js (85 KB) or any fragment
files.  Fragment data (historical addresses) is loaded on demand.

Usage:
    python scripts/generate_manifest.py
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBASSY_JS = os.path.join(ROOT, "projects", "embassy", "data", "embassies.js")
PROGRESS_JSON = os.path.join(ROOT, "projects", "embassy", "data", "embassy_history", "_progress.json")
FRAGMENTS_DIR = os.path.join(ROOT, "projects", "embassy", "data", "embassy_history", "_fragments")
HISTORY_DIR = os.path.join(ROOT, "projects", "embassy", "data", "embassy_history")
OUTPUT = os.path.join(ROOT, "projects", "embassy", "data", "manifest.json")


def parse_embassies_js(path):
    js_code = f"const fs=require('fs'); const d=fs.readFileSync({json.dumps(path)},'utf8'); eval(d); process.stdout.write(JSON.stringify(EMBASSY_DATA));"
    result = subprocess.run(["node", "-e", js_code], capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR parsing embassies.js:", result.stderr, file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def load_progress(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def discover_fragments(fragments_dir):
    available = set()
    if not os.path.isdir(fragments_dir):
        return available
    for fname in os.listdir(fragments_dir):
        if fname.endswith(".json"):
            stem = fname[:-5]
            if "_" in stem:
                available.add(stem)
    return available


def discover_host_files(history_dir, progress):
    available = {}
    for code in progress.get("names", {}):
        lc = code.lower()
        fpath = os.path.join(history_dir, lc + ".json")
        if os.path.isfile(fpath):
            available[code] = fpath
    return available


def build_manifest(embassy_data, progress, fragments, host_files):
    manifest = {"countries": {}, "embassies": {}, "fragments_available": sorted(fragments)}

    for item in embassy_data:
        code_upper = item["code"].upper()

        manifest["countries"][code_upper] = {
            "name": item["name"],
            "capital": item.get("capital", ""),
            "powerCenter": item.get("powerCenter", ""),
            "lat": item["lat"],
            "lon": item["lon"],
            "avgDist": item.get("avgDist"),
            "closest": item.get("closest"),
            "farthest": item.get("farthest"),
        }

        manifest["embassies"][code_upper] = {}
        for emb in item.get("embassies", []):
            emb_upper = emb["code"].upper()
            manifest["embassies"][code_upper][emb_upper] = {
                "name": emb["name"],
                "lat": emb["lat"],
                "lon": emb["lon"],
                "dist": emb["dist"],
                "rank": emb["rank"],
                "total": emb["total"],
                "color": emb["color"],
            }

    return manifest


def main():
    print("Parsing", EMBASSY_JS)
    embassy_data = parse_embassies_js(EMBASSY_JS)

    print("Loading", PROGRESS_JSON)
    progress = load_progress(PROGRESS_JSON)

    print("Scanning fragments...")
    fragments = discover_fragments(FRAGMENTS_DIR)
    print(f"  Found {len(fragments)} fragments")

    print("Scanning host country files...")
    host_files = discover_host_files(HISTORY_DIR, progress)
    print(f"  Found {len(host_files)} host files:", ", ".join(sorted(host_files.keys())))

    manifest = build_manifest(embassy_data, progress, fragments, host_files)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"Wrote {OUTPUT} ({size_kb:.1f} KB)")
    print(f"  Countries: {len(manifest['countries'])}")
    print(f"  Embassy entries: {sum(len(v) for v in manifest['embassies'].values())}")
    print(f"  Fragments available: {len(manifest['fragments_available'])}")


if __name__ == "__main__":
    main()
