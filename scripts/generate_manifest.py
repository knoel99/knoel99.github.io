#!/usr/bin/env python3
"""Generate manifest.json from embassies.js + fragment files.

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
HISTORY_DIR = os.path.join(ROOT, "projects", "embassy", "data", "embassy_history")
FRAGMENTS_DIR = os.path.join(HISTORY_DIR, "_fragments")
OUTPUT = os.path.join(ROOT, "projects", "embassy", "data", "manifest.json")


def parse_embassies_js(path):
    js_code = f"const fs=require('fs'); const d=fs.readFileSync({json.dumps(path)},'utf8'); eval(d); process.stdout.write(JSON.stringify(EMBASSY_DATA));"
    result = subprocess.run(["node", "-e", js_code], capture_output=True, text=True)
    if result.returncode != 0:
        print("ERROR parsing embassies.js:", result.stderr, file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


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


def discover_consolidated_pairs(history_dir):
    available = set()
    if not os.path.isdir(history_dir):
        return available
    for fname in os.listdir(history_dir):
        if not fname.endswith(".json") or fname.startswith("_"):
            continue
        host_code = fname[:-5].upper()
        if len(host_code) != 2:
            continue
        try:
            with open(os.path.join(history_dir, fname), "r", encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, json.JSONDecodeError):
            continue
        embassies = data.get("embassies") if isinstance(data, dict) else None
        if not isinstance(embassies, dict):
            continue
        for guest_code, entry in embassies.items():
            if not isinstance(entry, dict):
                continue
            if not entry.get("addresses"):
                continue
            available.add(host_code + "_" + guest_code.upper())
    return available


def build_manifest(embassy_data, fragments):
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

    print("Scanning fragments...")
    fragments = discover_fragments(FRAGMENTS_DIR)
    print(f"  Found {len(fragments)} legacy fragment files")

    consolidated = discover_consolidated_pairs(HISTORY_DIR)
    print(f"  Found {len(consolidated)} pairs in consolidated host files")

    all_pairs = fragments | consolidated
    print(f"  Total unique pairs: {len(all_pairs)}")

    manifest = build_manifest(embassy_data, all_pairs)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))

    size_kb = os.path.getsize(OUTPUT) / 1024
    print(f"Wrote {OUTPUT} ({size_kb:.1f} KB)")
    print(f"  Countries: {len(manifest['countries'])}")
    print(f"  Embassy entries: {sum(len(v) for v in manifest['embassies'].values())}")
    print(f"  Fragments available: {len(manifest['fragments_available'])}")


if __name__ == "__main__":
    main()
