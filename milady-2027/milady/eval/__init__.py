"""Évaluation des modèles génératifs MilaDy : métriques physiques et distances entre lois.

``milady.eval.metrics`` : divergence relative, spectres E_u(k) et E_B(k) en couronnes, hélicités
cinétique / magnétique / croisée, bilans d'énergie (injection, dissipations, production magnétique) et
leurs résidus en loi, distance d'énergie (Székely), Wasserstein tranché ; évaluation d'un modèle entraîné
avec enregistrement au catalogue.

Ligne de commande : ``python -m milady.eval --config infra/configs/train_fm3d.yaml [--model <uuid>]``
(équivalent à ``python -m milady.eval.metrics``).
"""

from __future__ import annotations

from milady.eval.metrics import (
    compare_ensembles,
    divergence_relative,
    energy_budget,
    energy_distance,
    energy_spectrum,
    features,
    helicities,
    sliced_wasserstein,
)

__all__ = [
    "compare_ensembles",
    "divergence_relative",
    "energy_budget",
    "energy_distance",
    "energy_spectrum",
    "features",
    "helicities",
    "sliced_wasserstein",
]
