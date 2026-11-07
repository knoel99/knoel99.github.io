"""Exécute UNE simulation d'une campagne : solveur → fichier MFF → stockage → catalogue.

Usage ::

    python -m milady.sim.run infra/configs/palier2_abc3d.yaml --index 3 [--device cuda] [--dtype float32]

Étapes :

1. développe la campagne (``milady.sweep``) et retrouve le point ``index`` et son identifiant
   déterministe (le même que celui enregistré par ``milady.sweep``) ;
2. catalogue (``milady.catalog.api``) : campagne et simulation (idempotent), tâche (``MILADY_JOB_ID``
   fourni par ``milady.sweep``, ou tâche Slurm ``<job>_<tâche>``, ou nouvelle tâche), statut ``running`` ;
3. intègre : diagnostics tous les ``diag_every`` depuis t = 0, champs tous les ``every`` sur
   ]t_burn, t_burn + t_keep] ; point de contrôle ``.npz`` toutes les ``checkpoint_every_s`` secondes
   (et à la réception de SIGTERM : fin de temps Slurm, arrêt d'une instance interruptible), reprise
   automatique au lancement suivant (même indice) ;
4. écrit le fichier MFF (``milady.data.format.write_mff`` : champs u et B, diagnostics, coefficients
   spectraux en option), le valide, l'envoie au stockage (``milady.storage``) sous
   ``{output.uri}/{campagne}/{uuid}/fields.h5`` (option : copie Zarr ``fields.zarr``) ;
5. catalogue : fichier (URI, SHA-256, taille, n_t, t_start, t_end), séries de diagnostics (moyennes
   sur les trajectoires), statut ``done``, durée de calcul, hôte, résumé JSON (``notes``).

En cas d'erreur : statut ``failed`` (message dans ``notes``), point de contrôle conservé, code de
retour 1. Le catalogue est facultatif (``--no-catalog``, ou base injoignable : avertissement) : le
fichier MFF porte l'identifiant ``milady_uuid`` et s'enregistre a posteriori avec
``python -m milady.catalog ingest <uri>``.

Variables d'environnement : ``MILADY_DB_URL``, ``MILADY_STORAGE_URI`` (et S3), ``MILADY_WORKDIR``
(dossier de travail local, défaut ``$MILADY_DATA/work`` ou ``<racine>/data/work``), ``MILADY_JOB_ID``,
``MILADY_SCHEDULER``, ``MILADY_HOST``, ``MILADY_MHD2D_PATH`` (solveur 2D, défaut
``experiences/mhd2d.py``).
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import logging
import math
import os
import re
import shlex
import shutil
import signal
import socket
import sys
import threading
import time
import traceback
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from types import FrameType, ModuleType
from typing import Any

import numpy as np

from milady import __version__, git_commit, project_root, storage
from milady.sim import NONDIM_2D, NONDIM_3D
from milady.sweep import Campaign, SweepPoint, grid_spec, load_campaign, output_times, sweep_points

__all__ = ["main", "run_simulation"]

LOG = logging.getLogger("milady.sim.run")
_DEFAULT_FIELDS = ("velocity", "magnetic_field")


class Interrupted(Exception):
    """Signal d'arrêt reçu (SIGTERM/SIGINT) : point de contrôle puis sortie."""


# =============================================================================================
# Adaptateurs de solveurs (interface commune)
# =============================================================================================
class Solver3D:
    """Adaptateur de :class:`milady.sim.mhd3d.MHD3D` pour la boucle de :func:`run_simulation`."""

    code = "mhd3d_torch"
    nondim = NONDIM_3D

    def __init__(
        self, campaign: Campaign, params: Mapping[str, Any], seed: int, device: str, dtype: str
    ) -> None:
        import torch

        from milady.sim.mhd3d import MHD3D, MHD3DConfig

        rt = campaign.runtime
        kw: dict[str, Any] = {
            "n": tuple(campaign.shape),
            "length": tuple(campaign.lengths),
            "mode": params["mode"],
            "nu": float(params["nu"]),
            "eta": float(params["eta"]),
            "kf": int(params["kf"]),
            "flow_amp": float(params["U_ref"]),
            "n_traj": int(rt.get("n_traj", 1)),
            "seed": seed,
            "device": device,
            "dtype": dtype,
        }
        if params["mode"] == "kinematic":
            kw["flow"] = params["flow"]
        else:
            kw["forcing"] = params["forcing"]
            kw["u0"] = params.get("u0", "laminar")
            kw["u0_amp"] = float(params.get("u0_amp", params["U_ref"]))
            kw["u_noise"] = float(params.get("u_noise", 0.0))
            if "forcing_amp" in params:
                kw["forcing_amp"] = float(params["forcing_amp"])
            if params["forcing"] == "random":
                kw["eps"] = float(params["eps"])
                kw["kf_band"] = (float(params["kf_min"]), float(params["kf_max"]))
        if all(k in params for k in ("abc_A", "abc_B", "abc_C")):
            kw["abc"] = (float(params["abc_A"]), float(params["abc_B"]), float(params["abc_C"]))
        for key in ("b0_amp", "b0_kwidth"):
            if key in params:
                kw[key] = float(params[key])
        for key in ("renorm_every", "project_every"):
            if key in params:
                kw[key] = int(params[key])
        if "renormalize" in params:
            kw["renormalize"] = bool(params["renormalize"])
        self.cfl = rt.get("cfl")
        self.sim = MHD3D(MHD3DConfig(**kw))
        self.coords = self.sim.coords
        self.torch_version = torch.__version__
        self.n_gpus = 1 if self.sim.device.type == "cuda" else 0

    @property
    def t(self) -> float:
        """Temps courant."""
        return self.sim.t

    def advance_to(self, t: float, dt: float) -> None:
        """Avance jusqu'à ``t`` (pas ≤ dt, CFL éventuel)."""
        self.sim.advance_to(t, dt, self.cfl)

    def fields(self) -> dict[str, np.ndarray]:
        """Champs physiques (n_traj, nx, ny, nz, 3) float32."""
        return self.sim.fields()

    def diagnostics(self) -> dict[str, np.ndarray]:
        """Diagnostics (n_traj,) par série."""
        return self.sim.diagnostics()

    def state(self) -> tuple[dict[str, np.ndarray], dict[str, Any]]:
        """État pour le point de contrôle."""
        return self.sim.state_dict()

    def restore(self, arrays: Mapping[str, np.ndarray], meta: Mapping[str, Any]) -> None:
        """Restaure l'état d'un point de contrôle (configuration physique identique exigée)."""
        mine = self.sim.cfg.to_dict()
        theirs = dict(meta.get("config", {}))
        for key in ("device", "dtype"):
            mine.pop(key, None)
            theirs.pop(key, None)
        if mine != theirs:
            raise ValueError("configuration du point de contrôle différente de celle de la campagne")
        self.sim.load_state_dict(arrays, meta)

    def info(self) -> dict[str, Any]:
        """Description du solveur pour les métadonnées du fichier."""
        cfg = self.sim.cfg
        return {
            "name": "milady.sim.mhd3d",
            "scheme": "pseudo-spectral (rfftn), désaliasage 2/3 (|m_i| ≤ (n_i−1)//3), RK4 à facteur intégrant "
            "(Lawson), projection de Leray de u et B",
            "mode": cfg.mode,
            "device": str(self.sim.device),
            "dtype": cfg.dtype,
            "torch_version": self.torch_version,
            "n_steps": self.sim.step_count,
            "seed": cfg.seed,
            "forcing_amp": self.sim.forcing_amp,
            "renormalized_b": bool(cfg.mode == "kinematic" and cfg.renormalize),
        }


def _load_mhd2d() -> ModuleType:
    """Charge ``experiences/mhd2d.py`` (solveur 2D des expériences, réutilisé tel quel)."""
    path = Path(os.environ.get("MILADY_MHD2D_PATH") or project_root() / "experiences" / "mhd2d.py")
    if not path.is_file():
        raise FileNotFoundError(f"solveur 2D introuvable : {path} (MILADY_MHD2D_PATH)")
    spec = importlib.util.spec_from_file_location("milady_experiences_mhd2d", path)
    assert spec is not None and spec.loader is not None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class Solver2D:
    """Adaptateur du solveur MHD 2D forcé des expériences (``experiences/mhd2d.py``, classe ``MHD2D``).

    Même suite d'appels que ``experiences/e2_donnees.py`` (estimation de l'injection puis pas de temps
    fixes) : à graine égale, les instantanés sont ceux de E2. Le forçage étant blanc en temps, le
    pas est fixe (``runtime.dt``) et les instants de sortie doivent en être des multiples.
    """

    code = "mhd2d_numpy"
    nondim = NONDIM_2D

    def __init__(
        self, campaign: Campaign, params: Mapping[str, Any], seed: int, device: str, dtype: str
    ) -> None:
        from milady.data.convert import e2_physical

        self._phys = e2_physical
        mod = _load_mhd2d()
        rt = campaign.runtime
        self.n = int(campaign.shape[0])
        self.dt = float(rt["dt"])
        self.m = mod.MHD2D(
            n=self.n,
            nu=float(params["nu"]),
            eta=float(params["eta"]),
            alpha=float(params["alpha"]),
            kf=(float(params["kf_min"]), float(params["kf_max"])),
            eps_u=float(params["eps_u"]),
            eps_b=float(params["eps_b"]),
            batch=int(rt.get("n_traj", 1)),
            seed=seed,
        )
        inj_u, inj_b = self.m.injection_rate(dt=self.dt, n_draw=400)
        self.injection = float(inj_u + inj_b)
        self._t = 0.0
        self.steps = 0
        self.seed = seed
        x = 2 * np.pi * np.arange(self.n) / self.n
        self.coords = {"x": x, "y": x.copy()}
        self.n_gpus = 0

    @property
    def t(self) -> float:
        """Temps courant."""
        return self._t

    def advance_to(self, t: float, dt: float) -> None:
        """Avance de pas fixes ``runtime.dt`` jusqu'à ``t`` (multiple de dt exigé)."""
        n = round((t - self._t) / self.dt)
        if n < 0 or abs(n * self.dt - (t - self._t)) > 1e-6 * self.dt:
            raise ValueError(f"t = {t} n'est pas atteint par des pas de {self.dt} depuis {self._t}")
        for _ in range(n):
            self.m.step(self.dt)
        self.steps += n
        self._t = float(t)
        if not (np.isfinite(self.m.w).all() and np.isfinite(self.m.a).all()):
            raise FloatingPointError(f"état non fini à t = {t}")

    def fields(self) -> dict[str, np.ndarray]:
        """Champs physiques (n_traj, nx, ny, 2) float32, axes [x, y]."""
        phys = self._phys(self.m.w, self.m.a, self.n)
        return {k: phys[k].astype(np.float32) for k in _DEFAULT_FIELDS}

    def diagnostics(self) -> dict[str, np.ndarray]:
        """Énergies, enstrophie, ⟨j²⟩, dissipation, injection (constante d'Itô), hélicité croisée, max |∇·B|."""
        d = self.m.diagnostics()
        phys = self._phys(self.m.w, self.m.a, self.n)
        u, b = phys["velocity"], phys["magnetic_field"]
        k = np.fft.fftfreq(self.n, 1.0 / self.n)
        kr = np.fft.rfftfreq(self.n, 1.0 / self.n)
        bh = np.fft.rfftn(b, axes=(1, 2))
        div = np.fft.irfftn(
            1j * k[:, None] * bh[..., 0] + 1j * kr[None, :] * bh[..., 1], s=(self.n, self.n), axes=(1, 2)
        )
        n_traj = u.shape[0]
        return {
            "kinetic_energy": np.asarray(d["Eu"], np.float64),
            "magnetic_energy": np.asarray(d["Eb"], np.float64),
            "enstrophy": np.asarray(d["enstrophie"], np.float64),
            "mean_square_current": np.asarray(d["j2"], np.float64),
            "dissipation": np.asarray(d["dissipation"], np.float64),
            "injection": np.full(n_traj, self.injection),
            "cross_helicity": np.mean(np.sum(u * b, -1), axis=(1, 2)),
            "max_div_b": np.abs(div).max(axis=(1, 2)),
        }

    def state(self) -> tuple[dict[str, np.ndarray], dict[str, Any]]:
        """État (ω̂, â, générateur aléatoire) pour le point de contrôle."""
        return (
            {"w": self.m.w, "a": self.m.a},
            {"t": self._t, "steps": self.steps, "rng": self.m.rng.bit_generator.state, "seed": self.seed},
        )

    def restore(self, arrays: Mapping[str, np.ndarray], meta: Mapping[str, Any]) -> None:
        """Restaure l'état d'un point de contrôle."""
        if int(meta.get("seed", self.seed)) != self.seed or arrays["w"].shape != self.m.w.shape:
            raise ValueError("point de contrôle d'une autre simulation 2D")
        self.m.w = np.asarray(arrays["w"]).copy()
        self.m.a = np.asarray(arrays["a"]).copy()
        self.m.rng.bit_generator.state = meta["rng"]
        self._t = float(meta["t"])
        self.steps = int(meta["steps"])

    def info(self) -> dict[str, Any]:
        """Description du solveur pour les métadonnées du fichier."""
        return {
            "name": "experiences/mhd2d.py (MHD2D)",
            "scheme": "pseudo-spectral 2D en potentiels (ω, a), désaliasage 2/3, RK4 à facteur intégrant + "
            "Euler–Maruyama (forçage blanc)",
            "dt": self.dt,
            "n_steps": self.steps,
            "seed": self.seed,
            "injection_rate": self.injection,
        }


_SOLVERS: dict[str, Callable[..., Any]] = {"mhd3d_torch": Solver3D, "mhd2d_numpy": Solver2D}


# =============================================================================================
# Catalogue « au mieux »
# =============================================================================================
class CatalogLink:
    """Accès au catalogue qui, sauf ``strict``, se désactive (avertissement) à la première erreur."""

    def __init__(self, enabled: bool, strict: bool) -> None:
        self.strict = strict
        self.cat: Any = None
        if not enabled:
            return
        try:
            from milady.catalog.api import Catalog

            self.cat = Catalog()
        except Exception as exc:  # noqa: BLE001 — base injoignable : on continue sans catalogue
            self._fail("connexion", exc)

    @property
    def ok(self) -> bool:
        """Vrai si le catalogue est utilisable."""
        return self.cat is not None

    def _fail(self, what: str, exc: BaseException) -> None:
        if self.strict:
            raise exc
        LOG.warning(
            "catalogue indisponible (%s : %s) ; la simulation continue sans catalogue "
            "(enregistrer ensuite avec `python -m milady.catalog ingest <uri>`)",
            what,
            exc,
        )
        self.cat = None

    def call(self, method: str, *args: Any, **kwargs: Any) -> Any:
        """Appelle ``Catalog.<method>`` ; renvoie ``None`` si le catalogue est désactivé ou en erreur."""
        if self.cat is None:
            return None
        try:
            return getattr(self.cat, method)(*args, **kwargs)
        except Exception as exc:  # noqa: BLE001
            self._fail(method, exc)
            return None


def _job_external_id() -> tuple[str, str]:
    """(ordonnanceur, identifiant externe) de la tâche courante."""
    if os.environ.get("SLURM_JOB_ID"):
        array = os.environ.get("SLURM_ARRAY_JOB_ID")
        task = os.environ.get("SLURM_ARRAY_TASK_ID")
        return "slurm", f"{array}_{task}" if array and task else os.environ["SLURM_JOB_ID"]
    sched = os.environ.get("MILADY_SCHEDULER", "local")
    return (
        sched if sched in ("local", "docker", "slurm") else "local"
    ), f"{socket.gethostname()}:{os.getpid()}"


def _attach_job(link: CatalogLink, sim_id: str) -> str | None:
    """Tâche du catalogue associée à cette exécution (créée si besoin), passée à l'état ``running``."""
    job_id = os.environ.get("MILADY_JOB_ID") or None
    sched, ext = _job_external_id()
    if job_id is None and sched == "slurm" and link.ok and hasattr(link.cat, "query_jobs"):
        # (scheduler, external_id) : requête servie par l'index ix_job_external.
        for job in link.call("query_jobs", scheduler="slurm", external_id=ext) or []:
            if job.get("simulation_id") == sim_id:
                job_id = job["id"]
    if job_id is None:
        job_id = link.call(
            "register_job", "simulation", sched, external_id=ext, simulation_id=sim_id, status="running"
        )
    else:
        link.call(
            "update_job", job_id, status="running", **({"external_id": ext} if sched != "local" else {})
        )
    return job_id


# =============================================================================================
# Outils
# =============================================================================================
_ENV_RE = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-([^}]*))?\}|\$([A-Za-z_][A-Za-z0-9_]*)")


def expand_env(text: str) -> str:
    """Développe ``$VAR``, ``${VAR}`` et ``${VAR:-défaut}`` (variables absentes → chaîne vide ou défaut)."""

    def repl(m: re.Match[str]) -> str:
        name = m.group(1) or m.group(3)
        val = os.environ.get(name, "")
        return val if val else (m.group(2) or "")

    return _ENV_RE.sub(repl, text)


def output_base(campaign: Campaign) -> str:
    """Racine de stockage des fichiers : ``output.uri`` développée, sinon ``milady.storage.base_uri()``."""
    raw = campaign.output.get("uri")
    uri = expand_env(str(raw)).strip() if raw else ""
    if not uri:
        return storage.base_uri()
    proto, path = storage.split_uri(uri)
    return Path(path).as_uri() if proto == "file" else uri.rstrip("/")


def _workdir(campaign: Campaign, sim_id: str, override: str | None) -> Path:
    if override:
        base = Path(override)
    elif os.environ.get("MILADY_WORKDIR"):
        base = Path(os.path.expandvars(os.environ["MILADY_WORKDIR"])).expanduser()
    elif os.environ.get("MILADY_DATA"):
        base = Path(os.path.expandvars(os.environ["MILADY_DATA"])).expanduser() / "work"
    else:
        base = project_root() / "data" / "work"
    path = base / campaign.name / sim_id
    path.mkdir(parents=True, exist_ok=True)
    return path


def _host() -> str:
    node = socket.gethostname()
    tag = os.environ.get("MILADY_HOST", "").strip()
    return f"{tag}:{node}" if tag and tag != node else node


def _set_threads(campaign: Campaign) -> int:
    """Fils de calcul CPU de torch : OMP_NUM_THREADS, SLURM_CPUS_PER_TASK, resources.cpus, sinon défaut torch."""
    try:
        import torch
    except ImportError:
        return 1
    sources = (
        os.environ.get("OMP_NUM_THREADS"),
        os.environ.get("SLURM_CPUS_PER_TASK"),
        min(int(campaign.resources.get("cpus") or 0), os.cpu_count() or 1) or None,
    )
    for src in sources:
        if src:
            try:
                n = max(1, int(src))
            except ValueError:
                continue
            torch.set_num_threads(n)
            break
    return torch.get_num_threads()


def _resolve_device(requested: str | None, campaign: Campaign) -> str:
    dev = requested or str(campaign.runtime.get("device", "auto"))
    if campaign.code != "mhd3d_torch":
        return "cpu"
    if dev == "auto":
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    return dev


class _RunState:
    """Séries accumulées pendant la simulation (sauvegardées dans le point de contrôle)."""

    def __init__(self) -> None:
        self.next_event = 0
        self.diag_t: list[float] = []
        self.diag: dict[str, list[np.ndarray]] = {}
        self.snap_t: list[float] = []
        self.snaps: dict[str, list[np.ndarray]] = {}
        self.wall_before = 0.0  # secondes de calcul des sessions précédentes (reprise)

    def add_diag(self, t: float, values: Mapping[str, np.ndarray]) -> None:
        self.diag_t.append(t)
        for k, v in values.items():
            self.diag.setdefault(k, []).append(np.asarray(v, np.float64))

    def add_snap(self, t: float, fields: Mapping[str, np.ndarray]) -> None:
        self.snap_t.append(t)
        for k, v in fields.items():
            self.snaps.setdefault(k, []).append(np.asarray(v, np.float32))

    def arrays(self) -> dict[str, np.ndarray]:
        out = {"run/diag_t": np.asarray(self.diag_t), "run/snap_t": np.asarray(self.snap_t)}
        for k, v in self.diag.items():
            out[f"run/diag/{k}"] = np.stack(v)
        for k, v in self.snaps.items():
            out[f"run/snap/{k}"] = np.stack(v)
        return out

    def load(self, arrays: Mapping[str, np.ndarray], meta: Mapping[str, Any]) -> None:
        self.next_event = int(meta["next_event"])
        self.wall_before = float(meta.get("wall_time_s", 0.0))
        self.diag_t = [float(t) for t in arrays["run/diag_t"]]
        self.snap_t = [float(t) for t in arrays["run/snap_t"]]
        self.diag = {k[len("run/diag/") :]: list(v) for k, v in arrays.items() if k.startswith("run/diag/")}
        self.snaps = {k[len("run/snap/") :]: list(v) for k, v in arrays.items() if k.startswith("run/snap/")}


def _save_checkpoint(path: Path, solver: Any, run: _RunState, sim_id: str, wall: float) -> None:
    from milady.sim.mhd3d import save_npz_checkpoint

    arrays, meta = solver.state()
    payload = {f"solver/{k}": v for k, v in arrays.items()}
    payload.update(run.arrays())
    save_npz_checkpoint(
        path,
        payload,
        {
            "solver": meta,
            "sim_id": sim_id,
            "next_event": run.next_event,
            "wall_time_s": wall,
            "code": solver.code,
        },
    )


def _try_resume(path: Path, solver: Any, run: _RunState, sim_id: str) -> bool:
    from milady.sim.mhd3d import load_npz_checkpoint

    arrays, meta = load_npz_checkpoint(path)
    if meta.get("sim_id") != sim_id or meta.get("code") != solver.code:
        LOG.warning("point de contrôle %s ignoré : autre simulation", path)
        return False
    solver_arrays = {k[len("solver/") :]: v for k, v in arrays.items() if k.startswith("solver/")}
    solver.restore(solver_arrays, meta["solver"])
    run.load(arrays, meta)
    return True


# =============================================================================================
# Simulation
# =============================================================================================
def run_simulation(
    config: str | os.PathLike[str] | Campaign,
    index: int,
    *,
    device: str | None = None,
    dtype: str | None = None,
    use_catalog: bool = True,
    strict_catalog: bool = False,
    resume: bool = True,
    workdir: str | None = None,
    keep_workdir: bool = False,
) -> dict[str, Any]:
    """Exécute la simulation ``index`` de la campagne ``config`` (voir la docstring du module).

    Renvoie un résumé : ``sim_id``, ``status``, ``uri``, ``sha256``, ``size_bytes``, ``wall_time_s``,
    ``n_t``, ``growth_rate`` (3D), énergies finales… Lève l'exception d'origine en cas d'échec
    (après avoir marqué la simulation ``failed`` et sauvegardé un point de contrôle).
    """
    campaign = config if isinstance(config, Campaign) else load_campaign(config)
    points = sweep_points(campaign)
    if not 0 <= index < len(points):
        raise IndexError(f"indice {index} hors de [0, {len(points) - 1}] pour {campaign.name}")
    point: SweepPoint = points[index]
    sim_id, params = point.sim_id, point.params
    rt = campaign.runtime
    seed = int(params["seed"]) if "seed" in params else index
    dev = _resolve_device(device, campaign)
    dt_name = dtype or str(rt.get("dtype", "float32"))
    n_threads = _set_threads(campaign)
    host = _host()
    wd = _workdir(campaign, sim_id, workdir)
    ckpt = wd / "checkpoint.npz"
    base = output_base(campaign)
    ckpt_uri = storage.join(base, campaign.name, sim_id, "checkpoint.npz")
    LOG.info("simulation %d/%d de %s : %s", index, len(points) - 1, campaign.name, sim_id)
    LOG.info("paramètres : %s", json.dumps(params, ensure_ascii=False))

    link = CatalogLink(use_catalog, strict_catalog)
    commit = git_commit()
    if link.ok:
        camp_id = link.call(
            "create_campaign", campaign.name, config_yaml=campaign.text, description=campaign.description
        )
        if camp_id is not None:
            link.call(
                "register_simulation",
                camp_id,
                campaign.code,
                params,
                grid_spec(campaign),
                code_version=__version__,
                git_commit=commit,
                host=host,
                sim_id=sim_id,
            )
    job_id = _attach_job(link, sim_id) if link.ok else None
    link.call(
        "update_simulation",
        sim_id,
        status="running",
        host=host,
        n_cpus=n_threads,
        n_gpus=1 if dev.startswith("cuda") else 0,
        code_version=__version__,
        git_commit=commit,
    )

    # Arrêt propre sur SIGTERM (fin de temps Slurm, préemption, docker stop) : point de contrôle.
    def _on_signal(signum: int, _frame: FrameType | None) -> None:
        raise Interrupted(f"signal {signal.Signals(signum).name}")

    previous: dict[int, Any] = {}
    if threading.current_thread() is threading.main_thread():
        previous = {s: signal.signal(s, _on_signal) for s in (signal.SIGTERM,)}
    solver: Any = None
    run = _RunState()
    t_wall0 = time.monotonic()
    try:
        solver = _SOLVERS[campaign.code](campaign, params, seed, dev, dt_name)
        if resume and not ckpt.is_file() and rt.get("checkpoint_to_storage") and storage.exists(ckpt_uri):
            storage.get(ckpt_uri, ckpt)
        if resume and ckpt.is_file():
            try:
                if _try_resume(ckpt, solver, run, sim_id):
                    LOG.info("reprise depuis %s à t = %.4g", ckpt, solver.t)
            except (ValueError, KeyError) as exc:
                LOG.warning("point de contrôle illisible ou incompatible (%s) : départ de t = 0", exc)
                solver = _SOLVERS[campaign.code](campaign, params, seed, dev, dt_name)
                run = _RunState()

        snap_times, diag_times = output_times(rt)
        snap_set = {round(t, 9) for t in snap_times}
        diag_set = {round(t, 9) for t in diag_times}
        events = sorted(snap_set | diag_set)
        wanted = list(campaign.output.get("fields") or _DEFAULT_FIELDS)
        dt = float(rt["dt"])
        ck_every = float(rt.get("checkpoint_every_s", 900))
        last_ck = time.monotonic()
        report_every = max(1, len(events) // 20)
        for k in range(run.next_event, len(events)):
            te = events[k]
            solver.advance_to(te, dt)
            if te in diag_set:
                run.add_diag(te, solver.diagnostics())
            if te in snap_set:
                f = solver.fields()
                run.add_snap(te, {name: f[name] for name in wanted})
            run.next_event = k + 1
            if k % report_every == 0 or k == len(events) - 1:
                d = {n: float(np.mean(v[-1])) for n, v in run.diag.items()} if run.diag else {}
                LOG.info(
                    "t = %-9.4g  E_u = %.4g  E_B = %.4g  ln‖B‖ = %.4g  max|∇·B| = %.1e  (%.0f s)",
                    te,
                    d.get("kinetic_energy", math.nan),
                    d.get("magnetic_energy", math.nan),
                    d.get("log_b_rms", math.nan),
                    d.get("max_div_b", math.nan),
                    time.monotonic() - t_wall0,
                )
            if ck_every > 0 and time.monotonic() - last_ck >= ck_every and k < len(events) - 1:
                _save_checkpoint(ckpt, solver, run, sim_id, run.wall_before + time.monotonic() - t_wall0)
                if rt.get("checkpoint_to_storage"):
                    storage.put(ckpt, ckpt_uri)
                last_ck = time.monotonic()
        wall = run.wall_before + time.monotonic() - t_wall0
        summary = _finalize(
            campaign, point, solver, run, link, wd, base, wall, host, seed, index, dev, dt_name
        )
        link.call(
            "update_simulation", sim_id, status="done", wall_time_s=wall, notes=json.dumps(summary["notes"])
        )
        if job_id:
            link.call("update_job", job_id, status="done")
        if not keep_workdir:
            shutil.rmtree(wd, ignore_errors=True)
        if rt.get("checkpoint_to_storage") and not rt.get("keep_checkpoint"):
            try:
                storage.rm(ckpt_uri)
            except Exception as exc:  # noqa: BLE001 — nettoyage facultatif
                LOG.debug("point de contrôle distant non supprimé : %s", exc)
        LOG.info("terminé en %.1f s : %s", wall, summary["uri"])
        return summary
    except BaseException as exc:
        wall = run.wall_before + time.monotonic() - t_wall0
        if solver is not None and run.next_event > 0:
            try:
                _save_checkpoint(ckpt, solver, run, sim_id, wall)
                if rt.get("checkpoint_to_storage"):
                    storage.put(ckpt, ckpt_uri)
                LOG.info("point de contrôle sauvegardé : %s (relancer le même indice pour reprendre)", ckpt)
            except Exception as ck_exc:  # noqa: BLE001
                LOG.warning("point de contrôle impossible : %s", ck_exc)
        tail = "".join(traceback.format_exception_only(type(exc), exc)).strip()
        note = {
            "error": tail[-2000:],
            "interrupted": isinstance(exc, (Interrupted, KeyboardInterrupt)),
            "t_reached": float(solver.t) if solver is not None else 0.0,
            "checkpoint": str(ckpt),
        }
        link.call("update_simulation", sim_id, status="failed", wall_time_s=wall, notes=json.dumps(note))
        if job_id:
            link.call("update_job", job_id, status="failed")
        raise
    finally:
        for s, h in previous.items():
            signal.signal(s, h)
        if link.cat is not None:
            link.cat.close()


def _finalize(
    campaign: Campaign,
    point: SweepPoint,
    solver: Any,
    run: _RunState,
    link: CatalogLink,
    wd: Path,
    base: str,
    wall: float,
    host: str,
    seed: int,
    index: int,
    device: str,
    dtype: str,
) -> dict[str, Any]:
    """Écrit, valide et envoie le fichier MFF ; enregistre fichier et diagnostics au catalogue."""
    from milady.data.format import to_zarr, validate, write_mff

    sim_id, params = point.sim_id, point.params
    snap_t = np.asarray(run.snap_t, np.float64)
    diag_t = np.asarray(run.diag_t, np.float64)
    fields = {name: np.stack(v, axis=1) for name, v in run.snaps.items()}  # (n_traj, n_t, *spatial, D)
    diags = {name: np.stack(v, axis=1) for name, v in run.diag.items()}  # (n_traj, n_td)
    t_burn = float(campaign.runtime.get("t_burn", 0.0))
    keep = diag_t >= t_burn - 1e-9

    notes: dict[str, Any] = {
        "campaign": campaign.name,
        "index": index,
        "seed": seed,
        "device": device,
        "dtype": dtype,
    }
    if "log_b_rms" in diags:
        from milady.sim.mhd3d import growth_rate_fit

        lam = [
            growth_rate_fit(diag_t, diags["log_b_rms"][i], t_min=t_burn)
            for i in range(diags["log_b_rms"].shape[0])
        ]
        notes["growth_rate"] = float(np.nanmean(lam))
        notes["growth_rate_per_traj"] = lam
    for name in ("kinetic_energy", "magnetic_energy", "injection", "max_div_b"):
        if name in diags:
            series = diags[name][:, keep] if keep.any() else diags[name]
            notes[f"{name}_mean"] = (
                float(np.mean(series)) if name != "max_div_b" else float(np.max(diags[name]))
            )
    if "kinetic_dissipation" in diags and keep.any():
        diss = diags["kinetic_dissipation"][:, keep] + diags["magnetic_dissipation"][:, keep]
        inj = diags["injection"][:, keep]
        notes["dissipation_mean"] = float(np.mean(diss))
        if abs(float(np.mean(inj))) > 0:
            notes["balance_residual"] = float((np.mean(inj) - np.mean(diss)) / np.mean(inj))
    elif "dissipation" in diags and keep.any():
        notes["dissipation_mean"] = float(np.mean(diags["dissipation"][:, keep]))
        notes["balance_residual"] = float(
            (np.mean(diags["injection"][:, keep]) - notes["dissipation_mean"])
            / np.mean(diags["injection"][:, keep])
        )

    meta = {
        "uuid": sim_id,
        "code": solver.code,
        "code_version": __version__,
        "git_commit": git_commit(),
        "nondimensionalization": solver.nondim,
        "host": host,
        "command": " ".join(shlex.quote(a) for a in sys.argv) or "milady.sim.run.run_simulation",
        "campaign": campaign.name,
        "campaign_index": index,
        "seed": seed,
        "solver": solver.info(),
        "runtime": {k: campaign.runtime[k] for k in sorted(campaign.runtime)},
        "wall_time_s": round(wall, 3),
        "summary": {k: v for k, v in notes.items() if k not in ("campaign", "index", "seed")},
    }
    out = campaign.output
    local = wd / "fields.h5"
    sha = write_mff(
        local,
        fields,
        {"time": snap_t, **solver.coords},
        params,
        meta=meta,
        diagnostics={"time": diag_t, **diags},
        spectral=bool(out.get("spectral", False)),
        dataset_name=str(out.get("dataset_name") or f"milady_{campaign.name}"),
    )
    errors = validate(local)
    if errors:
        raise RuntimeError("fichier MFF non conforme : " + " ; ".join(errors[:10]))
    size = local.stat().st_size
    uri = storage.join(base, campaign.name, sim_id, "fields.h5")
    storage.put(local, uri)
    LOG.info("fichier MFF : %s (%.1f Mo, sha256 %s…)", uri, size / 2**20, sha[:12])
    files = [{"kind": "fields", "uri": uri, "sha256": sha, "size_bytes": size}]
    fmt = str(out.get("format", "mff")).lower()
    if "zarr" in fmt:
        zuri = storage.join(base, campaign.name, sim_id, "fields.zarr")
        to_zarr(local, zuri)
        files.append({"kind": "fields", "uri": zuri, "sha256": "", "size_bytes": 0})
    n_t, t0, t1 = len(snap_t), float(snap_t[0]), float(snap_t[-1])
    for f in files:
        link.call(
            "register_file",
            sim_id,
            f["kind"],
            f["uri"],
            f["sha256"],
            f["size_bytes"],
            n_t=n_t,
            t_start=t0,
            t_end=t1,
            format_version="1.0",
        )
    if campaign.runtime.get("keep_checkpoint"):
        ck = wd / "checkpoint.npz"
        from milady.sim.mhd3d import save_npz_checkpoint

        arrays, smeta = solver.state()
        save_npz_checkpoint(
            ck,
            {f"solver/{k}": v for k, v in arrays.items()},
            {"solver": smeta, "sim_id": sim_id, "code": solver.code, "final": True},
        )
        ck_uri = storage.join(base, campaign.name, sim_id, "checkpoint.npz")
        storage.put(ck, ck_uri)
        link.call(
            "register_file",
            sim_id,
            "checkpoint",
            ck_uri,
            storage.sha256(ck_uri),
            ck.stat().st_size,
            n_t=1,
            t_start=t1,
            t_end=t1,
            format_version="npz",
        )
    for name, vals in diags.items():
        link.call("add_diagnostics", sim_id, name, diag_t, np.mean(vals, axis=0))
    if "growth_rate" in notes and math.isfinite(notes["growth_rate"]):
        link.call("add_diagnostics", sim_id, "growth_rate_fit", [float(diag_t[-1])], [notes["growth_rate"]])
    notes.update({"uri": uri, "sha256": sha, "size_bytes": size, "wall_time_s": wall})
    return {
        "sim_id": sim_id,
        "status": "done",
        "uri": uri,
        "sha256": sha,
        "size_bytes": size,
        "n_t": n_t,
        "t_start": t0,
        "t_end": t1,
        "wall_time_s": wall,
        "params": params,
        "notes": notes,
        "growth_rate": notes.get("growth_rate"),
        "files": files,
    }


# =============================================================================================
# Ligne de commande
# =============================================================================================
def main(argv: Sequence[str] | None = None) -> int:
    """Point d'entrée de ``python -m milady.sim.run``."""
    ap = argparse.ArgumentParser(
        prog="python -m milady.sim.run", description="Exécute une simulation d'une campagne MilaDy."
    )
    ap.add_argument("config", help="campagne YAML")
    ap.add_argument("--index", type=int, required=True, help="indice de la simulation dans la campagne")
    ap.add_argument("--device", default=None, help="cpu, cuda, cuda:1 ou auto (défaut : runtime.device)")
    ap.add_argument("--dtype", default=None, choices=["float32", "float64"], help="défaut : runtime.dtype")
    ap.add_argument("--workdir", default=None, help="dossier de travail (défaut : MILADY_WORKDIR…)")
    ap.add_argument("--no-catalog", action="store_true", help="n'écrit pas au catalogue (fichier seulement)")
    ap.add_argument("--require-catalog", action="store_true", help="erreur fatale si le catalogue échoue")
    ap.add_argument("--no-resume", action="store_true", help="ignore un point de contrôle existant")
    ap.add_argument("--keep-workdir", action="store_true", help="garde le dossier de travail local")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args(argv)
    logging.basicConfig(
        level=logging.WARNING if args.quiet else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%H:%M:%S",
    )
    try:
        summary = run_simulation(
            args.config,
            args.index,
            device=args.device,
            dtype=args.dtype,
            use_catalog=not args.no_catalog,
            strict_catalog=args.require_catalog,
            resume=not args.no_resume,
            workdir=args.workdir,
            keep_workdir=args.keep_workdir,
        )
    except Interrupted as exc:
        LOG.error("interrompu (%s) : point de contrôle conservé, relancer le même indice pour reprendre", exc)
        return 143
    except Exception:
        LOG.exception("échec de la simulation %d", args.index)
        return 1
    print(
        json.dumps(
            {
                k: summary[k]
                for k in ("sim_id", "status", "uri", "sha256", "size_bytes", "wall_time_s", "growth_rate")
            },
            ensure_ascii=False,
        ),
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
