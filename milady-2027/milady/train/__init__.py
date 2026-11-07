"""Entraînement des modèles génératifs MilaDy (palier 2 : champs MHD 3D).

- ``milady.train.data`` : fichiers MFF → représentation latente « potentiel vecteur de Fourier » (jauge de
  Coulomb, base de Craya–Herring, normalisation par mode), conditionnement, jeux de données ;
- ``milady.train.fm3d`` : flow matching conditionnel sous contraintes dures (divergence nulle, symétrie
  B → −B), perte de stationnarité, DDP, points de contrôle, MLflow, catalogue.

Usage : ``python -m milady.train.fm3d --config infra/configs/train_fm3d.yaml`` (voir ``make train``).
Les sous-modules ne sont pas importés ici (``import milady.train`` reste léger) ; les noms usuels sont
accessibles à la demande : ``from milady.train import load_model``.
"""

from __future__ import annotations

from importlib import import_module
from typing import Any

__all__ = ["FourierPotentialSpace", "GenerativeModel", "load_model", "smoke_step", "train"]

_LAZY = {
    "FourierPotentialSpace": "milady.train.data",
    "GenerativeModel": "milady.train.fm3d",
    "load_model": "milady.train.fm3d",
    "smoke_step": "milady.train.fm3d",
    "train": "milady.train.fm3d",
}


def __getattr__(name: str) -> Any:
    """Import paresseux des noms publics (torch n'est chargé qu'à la première utilisation)."""
    if name in _LAZY:
        return getattr(import_module(_LAZY[name]), name)
    raise AttributeError(f"module 'milady.train' has no attribute {name!r}")
