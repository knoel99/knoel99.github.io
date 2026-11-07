"""MilaDy : modèles génératifs conditionnels sous contraintes physiques pour des champs MHD paramétriques.

Sous-paquets et modules :

- ``milady.data``    : format de données MFF 1.0 (HDF5 compatible The Well, variante Zarr), validation,
                       convertisseurs (E2 → MFF, squelette SFEMaNS) ;
- ``milady.catalog`` : catalogue SQL des campagnes, simulations, fichiers, jeux de données, modèles,
                       évaluations et tâches (PostgreSQL en production, SQLite en mode portable) ;
- ``milady.storage`` : stockage des objets lourds via fsspec (``file://``, chemins HPC, ``s3://``) ;
- ``milady.sim``, ``milady.train``, ``milady.eval``, ``milady.sweep`` : solveur, entraînement, évaluation,
  campagnes (voir ``specs/infra.md``).

Les sous-modules ne sont pas importés ici : ``import milady`` reste léger (pas de torch, h5py ni SQLAlchemy).
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

__version__ = "0.1.0"

__all__ = ["__version__", "git_commit", "project_root"]


def project_root() -> Path:
    """Racine du projet (dossier qui contient ``pyproject.toml``, ``milady/`` et ``infra/``).

    Ordre de résolution : variable d'environnement ``MILADY_ROOT`` ; dossier parent du paquet s'il
    ressemble au dépôt (installation éditable ``pip install -e .``) ; à défaut, le répertoire courant.
    Sert de base aux valeurs par défaut du catalogue (``data/catalog.sqlite``) et du stockage
    (``data/store``).
    """
    env = os.environ.get("MILADY_ROOT")
    if env:
        return Path(os.path.expandvars(env)).expanduser().resolve()
    here = Path(__file__).resolve().parent.parent
    if (here / "pyproject.toml").is_file() or (here / "infra").is_dir():
        return here
    return Path.cwd().resolve()


def git_commit(path: str | os.PathLike[str] | None = None) -> str:
    """Identifiant du commit git courant (12 caractères, suffixe ``-dirty`` si l'arbre est modifié).

    Ordre : variable ``MILADY_GIT_COMMIT`` (fixée à la construction des images Docker/Apptainer, où
    ``.git`` est absent), puis ``git rev-parse`` dans ``path`` (défaut : racine du projet). Renvoie
    une chaîne vide si rien n'est disponible : la provenance ne doit jamais faire échouer un calcul.
    """
    env = os.environ.get("MILADY_GIT_COMMIT")
    if env:
        return env.strip()
    cwd = Path(path) if path is not None else project_root()
    try:
        head = subprocess.run(["git", "rev-parse", "--short=12", "HEAD"], cwd=cwd, capture_output=True,
                              text=True, timeout=5, check=True).stdout.strip()
        dirty = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"], cwd=cwd,
                               capture_output=True, text=True, timeout=10, check=True).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return ""
    return f"{head}-dirty" if dirty else head
