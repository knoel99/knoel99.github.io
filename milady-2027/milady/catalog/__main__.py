"""Ligne de commande du catalogue : ``python -m milady.catalog <commande>``.

    init                         crée tables, index et vue (idempotent)
    ingest <uri>… [--campaign C] enregistre des fichiers MFF déjà écrits (ex. après un tableau de jobs Slurm)
    campaigns                    campagnes et nombre de simulations par statut
    sims [--campaign C] [--status S] [--param Rm__gt=8 …]
    summary [--model ID]         vue v_eval_summary
L'URL vient de ``--url``, sinon de ``MILADY_DB_URL``, sinon ``sqlite:///<racine>/data/catalog.sqlite``.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from typing import Any

from milady.catalog.api import Catalog


def _value(text: str) -> Any:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def main(argv: Sequence[str] | None = None) -> int:
    """Point d'entrée."""
    ap = argparse.ArgumentParser(prog="python -m milady.catalog", description=__doc__.split("\n\n")[0])
    ap.add_argument("--url", default=None, help="URL SQLAlchemy du catalogue")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("init")
    p = sub.add_parser("ingest")
    p.add_argument("uris", nargs="+")
    p.add_argument("--campaign", default="default")
    p.add_argument("--kind", default="fields")
    sub.add_parser("campaigns")
    p = sub.add_parser("sims")
    p.add_argument("--campaign")
    p.add_argument("--status")
    p.add_argument(
        "--param", action="append", default=[], help="filtre nom[__op]=valeur (op : gt, ge, lt, le, ne, in)"
    )
    p = sub.add_parser("summary")
    p.add_argument("--model")
    args = ap.parse_args(argv)

    cat = Catalog(args.url)
    out: Any
    if args.cmd == "init":
        out = {"url": repr(cat), "status": "ok"}
    elif args.cmd == "ingest":
        out = [{"uri": u, **cat.ingest_mff(u, campaign=args.campaign, kind=args.kind)} for u in args.uris]
    elif args.cmd == "campaigns":
        out = cat.list_campaigns()
    elif args.cmd == "sims":
        filters = dict(item.split("=", 1) for item in args.param)
        out = cat.query_simulations(args.campaign, args.status, **{k: _value(v) for k, v in filters.items()})
    else:
        out = cat.eval_summary(args.model)
    print(json.dumps(out, indent=1, ensure_ascii=False, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
