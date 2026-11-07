"""``python -m milady.eval`` : évaluation d'un modèle.

Cible ``make eval`` et gabarit ``infra/slurm/eval.sbatch``.

Mêmes options que ``python -m milady.eval.metrics`` (voir ``--help``).
"""

from __future__ import annotations

import sys

from milady.eval.metrics import main

if __name__ == "__main__":
    sys.exit(main())
