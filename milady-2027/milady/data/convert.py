"""Convertisseurs vers le format MFF 1.0, et squelette de l'extension SFEMaNS (Fourier × éléments finis).

- **E2** (``experiences/e2_donnees.py``) : fichiers ``eta_<η>_<split>.npz`` contenant les coefficients de
  Fourier (``numpy.fft.rfft2``, disposition ``[ky, kx]`` de ``mhd2d.py``) de la vorticité ω et du potentiel
  magnétique a pour 16 membres × n instantanés. Chaque fichier devient une simulation MFF 2D : champs
  ``velocity`` et ``magnetic_field`` (grille 32², disposition The Well ``[x, y]``), coefficients
  ``milady_spectral/{vorticity, magnetic_potential}`` (``rfftn`` sur ``[x, y]``), diagnostics par
  instantané (énergies, enstrophie, dissipation, hélicité croisée, max |∇·B|).
- **SFEMaNS** (``grid_type = "fourier_fe_axisym"``) : :func:`write_fourier_fe_mff` écrit des champs
  donnés par un maillage méridien (r, z) × des modes azimutaux m ; :func:`fourier_fe_to_grid` et
  :func:`fourier_fe_to_cartesian` les interpolent vers une grille régulière. La lecture des fichiers
  natifs de SFEMaNS n'est pas implémentée (données non publiques) : voir ``specs/format-donnees.md``.

Ligne de commande :

    python -m milady.data.convert e2 <dossier_npz> <sortie> [--catalog [URL]] [--store URI] [--limit N]
    python -m milady.data.convert validate <fichier> [...]
    python -m milady.data.convert info <fichier>
    python -m milady.data.convert zarr <fichier.h5> <uri.zarr>
"""

from __future__ import annotations

import argparse
import json
import os
import re
import socket
import sys
import time as _time
import uuid as _uuid
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Any

import h5py
import numpy as np

from milady import git_commit, storage
from milady.data import format as mff

__all__ = [
    "E2_DEFAULTS",
    "convert_e2",
    "convert_e2_file",
    "e2_physical",
    "fourier_fe_to_cartesian",
    "fourier_fe_to_grid",
    "main",
    "write_fourier_fe_mff",
]

# =============================================================================================
# E2 : MHD 2D forcée (experiences/e2_donnees.py, experiences/mhd2d.py)
# =============================================================================================
#: Valeurs de e2_donnees.py utilisées si meta.json est absent ou incomplet.
E2_DEFAULTS: dict[str, Any] = {
    "N": 32,
    "nu": 8e-3,
    "alpha": 0.02,
    "kf": [2.0, 3.0],
    "eps": 0.05,
    "dt": 1e-2,
    "intervalle": 1.0,
    "membres": 16,
    "t_burn": 30.0,
    "kmax": 10,
}
E2_NONDIM = (
    "Domaine [0, 2π)² périodique ; B en unités d'Alfvén (même unité que u) ; ν et η sans dimension "
    "(inverses de nombres de Reynolds construits sur la longueur 1 et la vitesse 1) ; forçage blanc en "
    "temps, d'injection moyenne eps_u (vorticité) et eps_b (potentiel), bande kf_min ≤ |k| ≤ kf_max ; "
    "frottement linéaire α aux grandes échelles."
)
_E2_NAME = re.compile(r"eta_(?P<eta>[0-9.]+)_(?P<split>[a-z]+)\.npz$")


def _e2_wavenumbers(n: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Nombres d'onde de ``mhd2d.py`` : tableaux ``(n, n//2+1)``, axe 0 = ky (fftfreq), axe 1 = kx (rfftfreq)."""
    k = np.fft.fftfreq(n, 1.0 / n)
    kr = np.fft.rfftfreq(n, 1.0 / n)
    kx, ky = np.meshgrid(kr, k)
    k2 = kx**2 + ky**2
    k2i = np.where(k2 > 0, 1.0 / np.maximum(k2, 1e-30), 0.0)
    return kx, ky, k2i


def e2_physical(w: np.ndarray, a: np.ndarray, n: int) -> dict[str, np.ndarray]:
    """Champs physiques (float64, disposition ``[..., x, y]``) à partir de ω̂ et â (disposition ``[..., ky, kx]``).

    Conventions de ``mhd2d.py`` : ψ̂ = ω̂/k², u = (∂yψ, −∂xψ), B = (∂y a, −∂x a), j = −Δa. Les tableaux
    physiques de ``irfft2`` sont indexés ``[y, x]`` ; on les transpose en ``[x, y]`` (convention The Well :
    axes dans l'ordre de ``dimensions@spatial_dims``).
    """
    kx, ky, k2i = _e2_wavenumbers(n)
    k2 = kx**2 + ky**2
    w = np.asarray(w, dtype=np.complex128)
    a = np.asarray(a, dtype=np.complex128)
    psi = w * k2i

    def phys(fh: np.ndarray) -> np.ndarray:
        return np.swapaxes(np.fft.irfft2(fh, s=(n, n)), -1, -2)

    return {
        "velocity": np.stack([phys(1j * ky * psi), phys(-1j * kx * psi)], axis=-1),
        "magnetic_field": np.stack([phys(1j * ky * a), phys(-1j * kx * a)], axis=-1),
        "vorticity": phys(w),
        "magnetic_potential": phys(a),
        "current": phys(k2 * a),
    }


def _max_div(v: np.ndarray, lengths: Sequence[float]) -> np.ndarray:
    """max |∇·v| par instantané (dérivées spectrales) ; v de forme ``(B, T, nx, ny, 2)``."""
    nx, ny = v.shape[2:4]
    kx = 2 * np.pi / lengths[0] * np.fft.fftfreq(nx, 1.0 / nx)[:, None]
    ky = 2 * np.pi / lengths[1] * np.fft.rfftfreq(ny, 1.0 / ny)[None, :]
    vh = np.fft.rfftn(v.astype(np.float64), axes=(2, 3))
    div = np.fft.irfftn(1j * kx * vh[..., 0] + 1j * ky * vh[..., 1], s=(nx, ny), axes=(2, 3))
    return np.abs(div).max(axis=(2, 3))


def _e2_meta(src_dir: Path) -> dict[str, Any]:
    meta = dict(E2_DEFAULTS)
    path = src_dir / "meta.json"
    if path.is_file():
        meta.update(json.loads(path.read_text(encoding="utf-8")))
    return meta


def _e2_seed(meta: Mapping[str, Any], eta: float, split: str) -> int | None:
    """Graine de e2_donnees.py : 100 + i (train) ou 200 + i (ref), i = rang de η dans eta_train + eta_test."""
    etas = list(meta.get("eta_train", [])) + list(meta.get("eta_test", []))
    for i, e in enumerate(etas):
        if abs(e - eta) <= 1e-9 * abs(eta):
            return (100 if split == "train" else 200) + i
    return None


def _existing_uuid(path: Path) -> str | None:
    try:
        with h5py.File(path, "r") as f:
            v = f.attrs.get("milady_uuid")
        return mff._py(v) if v is not None else None
    except OSError:
        return None


def convert_e2_file(
    npz: str | os.PathLike[str],
    out: str | os.PathLike[str],
    *,
    meta: Mapping[str, Any] | None = None,
    sim_id: str | None = None,
    max_members: int | None = None,
    max_snapshots: int | None = None,
) -> dict[str, Any]:
    """Convertit un fichier ``eta_<η>_<split>.npz`` de E2 en fichier MFF ; renvoie un résumé.

    Le résumé contient ``path``, ``sha256``, ``size_bytes``, ``uuid``, ``eta``, ``split``, ``params``,
    ``grid``, ``n_t``, ``t_start``, ``t_end`` et ``diagnostics_mean`` (séries moyennées sur les trajectoires,
    pour le catalogue). ``max_members`` / ``max_snapshots`` réduisent le fichier (tests rapides).
    """
    npz = Path(npz)
    meta = dict(meta) if meta is not None else _e2_meta(npz.parent)
    m = _E2_NAME.search(npz.name)
    split = m.group("split") if m else "unknown"
    with np.load(npz) as d:
        w, a = d["w"], d["a"]
        eta = float(d["eta"]) if "eta" in d else float(m.group("eta")) if m else float("nan")
        inj_u = float(d["inj_u"]) if "inj_u" in d else float("nan")
        inj_b = float(d["inj_b"]) if "inj_b" in d else float("nan")
    n = int(meta["N"])
    members = int(meta.get("membres", 16))
    if w.shape[0] % members:
        raise ValueError(f"{npz.name} : {w.shape[0]} instantanés non divisibles par {members} membres")
    n_snap = w.shape[0] // members
    # Disposition de e2_donnees.py : index = membre × n_snap + instantané (« regroupé par membre »).
    w = w.reshape(members, n_snap, n, n // 2 + 1)
    a = a.reshape(members, n_snap, n, n // 2 + 1)
    if max_members:
        w, a = w[:max_members], a[:max_members]
    if max_snapshots:
        w, a = w[:, :max_snapshots], a[:, :max_snapshots]
    n_traj, n_t = w.shape[:2]

    phys = e2_physical(w, a, n)
    x = 2 * np.pi * np.arange(n) / n
    t_burn, every = float(meta.get("t_burn", 30.0)), float(meta.get("intervalle", 1.0))
    time = t_burn + every * np.arange(1, n_t + 1)
    nu, alpha = float(meta["nu"]), float(meta["alpha"])
    kf = list(meta.get("kf", [2.0, 3.0]))
    eps = float(meta.get("eps", 0.05))
    params = {
        "nu": nu,
        "eta": eta,
        "Pm": nu / eta,
        "alpha": alpha,
        "eps_u": eps,
        "eps_b": eps,
        "kf_min": float(kf[0]),
        "kf_max": float(kf[1]),
    }

    u, b = phys["velocity"], phys["magnetic_field"]
    eu = 0.5 * np.mean(np.sum(u**2, -1), axis=(2, 3))
    eb = 0.5 * np.mean(np.sum(b**2, -1), axis=(2, 3))
    zw = np.mean(phys["vorticity"] ** 2, axis=(2, 3))
    jj = np.mean(phys["current"] ** 2, axis=(2, 3))
    diagnostics = {
        "kinetic_energy": eu,
        "magnetic_energy": eb,
        "enstrophy": zw,
        "mean_square_current": jj,
        "dissipation": nu * zw + eta * jj + 2 * alpha * (eu + eb),
        "cross_helicity": np.mean(np.sum(u * b, -1), axis=(2, 3)),
        "max_div_b": _max_div(b.astype(np.float32), [2 * np.pi, 2 * np.pi]),
    }
    spectral = {
        "vorticity": {
            "data": np.fft.rfftn(phys["vorticity"], axes=(2, 3)),
            "physical_field": "",
            "kmax": int(meta.get("kmax", n // 3)),
            "description": "ω = ∂x u_y − ∂y u_x = −Δψ ; u = (∂yψ, −∂xψ) ; état du solveur mhd2d.py",
        },
        "magnetic_potential": {
            "data": np.fft.rfftn(phys["magnetic_potential"], axes=(2, 3)),
            "physical_field": "",
            "kmax": int(meta.get("kmax", n // 3)),
            "description": "a (potentiel vecteur hors plan, A = a ẑ) ; B = (∂y a, −∂x a) = ∇×A",
        },
    }
    seed = _e2_seed(meta, eta, split)
    sim_id = sim_id or str(_uuid.uuid4())
    file_meta = {
        "uuid": sim_id,
        "code": "mhd2d_numpy",
        "code_version": "experiences/mhd2d.py",
        "git_commit": git_commit(),
        "nondimensionalization": E2_NONDIM,
        "split": split,
        "seed": -1 if seed is None else seed,
        "source": npz.name,
        "source_sha256": mff.sha256_file(npz),
        "solver": {
            "scheme": "pseudo-spectral, désaliasage 2/3, RK4 à facteur intégrant + Euler–Maruyama",
            "dt": float(meta.get("dt", 1e-2)),
            "t_burn": t_burn,
            "sampling_interval": every,
            "members": members,
        },
        "experiment": "E2",
    }
    out = Path(out)
    digest = mff.write_mff(
        out,
        {"velocity": u, "magnetic_field": b},
        {"time": time, "x": x, "y": x},
        params,
        meta=file_meta,
        scalars={"injection_rate_u": inj_u, "injection_rate_b": inj_b},
        diagnostics=diagnostics,
        spectral=spectral,
        dataset_name="milady_e2_mhd2d",
    )
    return {
        "path": str(out),
        "sha256": digest,
        "size_bytes": out.stat().st_size,
        "uuid": sim_id,
        "eta": eta,
        "split": split,
        "params": params,
        "grid": mff.grid_info(out),
        "n_t": int(n_t),
        "t_start": float(time[0]),
        "t_end": float(time[-1]),
        "time": time,
        "diagnostics_mean": {k: v.mean(axis=0) for k, v in diagnostics.items()},
    }


def convert_e2(
    src_dir: str | os.PathLike[str],
    out_dir: str | os.PathLike[str],
    *,
    catalog: Any = None,
    campaign: str = "e2_mhd2d",
    store: str | None = None,
    pattern: str = "eta_*.npz",
    limit: int | None = None,
    max_members: int | None = None,
    max_snapshots: int | None = None,
    overwrite: bool = False,
    verbose: bool = True,
) -> list[dict[str, Any]]:
    """Convertit tous les ``eta_*.npz`` de ``src_dir`` vers ``out_dir`` (idempotent).

    - un fichier déjà converti et valide est conservé (son identifiant est réutilisé) sauf ``overwrite`` ;
    - ``catalog`` (instance :class:`milady.catalog.api.Catalog`) : enregistre campagne, simulations,
      fichiers, diagnostics moyens et, si toute la collection est convertie sans réduction, le jeu de
      données ``e2_mhd2d`` v1.0 (train → train, ref → test) ;
    - ``store`` : URI de stockage (``s3://milady-data``…) où copier les fichiers selon la convention
      ``{store}/{campagne}/{uuid}/fields.h5`` ; sinon l'URI enregistrée est le fichier local.
    """
    src_dir, out_dir = Path(src_dir), Path(out_dir)
    files = sorted(src_dir.glob(pattern))
    if not files:
        raise FileNotFoundError(f"aucun fichier {pattern} dans {src_dir}")
    reduced = bool(limit or max_members or max_snapshots)
    if limit:
        files = files[:limit]
    meta = _e2_meta(src_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    camp_id = None
    if catalog is not None:
        import yaml

        camp_id = catalog.create_campaign(
            campaign,
            config_yaml=yaml.safe_dump(
                {"source": "experiences/e2_donnees.py", "meta": meta}, allow_unicode=True, sort_keys=False
            ),
            description="E2 : MHD 2D forcée, gamme de diffusivités magnétiques η (ν = 8e-3 fixé), grille 32².",
        )
    records = []
    for npz in files:
        m = _E2_NAME.search(npz.name)
        stem = f"e2_eta{m.group('eta')}_{m.group('split')}" if m else npz.stem
        out = out_dir / f"{stem}.h5"
        t0 = _time.time()
        sim_id = _existing_uuid(out) if out.is_file() else None
        reuse = out.is_file() and not overwrite and sim_id is not None and not mff.validate(out)
        if catalog is not None and sim_id is None:
            sim_id = str(_uuid.uuid4())
        if reuse:
            rec = {
                "path": str(out),
                "sha256": mff.sha256_file(out),
                "size_bytes": out.stat().st_size,
                "uuid": sim_id,
                "split": m.group("split") if m else "unknown",
                "reused": True,
            }
            if verbose:
                print(f"{npz.name} : déjà converti ({out.name})", flush=True)
        else:
            if catalog is not None and catalog.get_simulation(sim_id) is None:
                catalog.register_simulation(
                    camp_id,
                    "mhd2d_numpy",
                    {},
                    {},
                    code_version="experiences/mhd2d.py",
                    git_commit=git_commit(),
                    host=socket.gethostname(),
                    n_cpus=1,
                    sim_id=sim_id,
                    status="running",
                )
            rec = convert_e2_file(
                npz, out, meta=meta, sim_id=sim_id, max_members=max_members, max_snapshots=max_snapshots
            )
            if verbose:
                print(
                    f"{npz.name} → {out.name} : {rec['size_bytes'] / 2**20:.1f} Mio, "
                    f"{_time.time() - t0:.1f} s",
                    flush=True,
                )
        uri = out.resolve().as_uri()
        if store:
            uri = storage.simulation_uri(campaign, rec["uuid"], "fields", ".h5", base=store)
            storage.put(out, uri)
        rec["uri"] = uri
        if catalog is not None:
            if not rec.get("reused"):
                catalog.update_simulation(
                    rec["uuid"],
                    parameters=rec["params"],
                    grid=rec["grid"],
                    status="done",
                    wall_time_s=_time.time() - t0,
                )
            rec["file_id"] = (
                catalog.ingest_mff(uri, campaign=campaign)["file_id"]
                if rec.get("reused")
                else catalog.register_file(
                    rec["uuid"],
                    "fields",
                    uri,
                    rec["sha256"],
                    rec["size_bytes"],
                    n_t=rec["n_t"],
                    t_start=rec["t_start"],
                    t_end=rec["t_end"],
                )
            )
            if not rec.get("reused"):
                for name, series in rec["diagnostics_mean"].items():
                    catalog.add_diagnostics(rec["uuid"], name, rec["time"], series)
        records.append(rec)
    if catalog is not None and not reduced:
        split_map = {"train": "train", "ref": "test"}
        members = [(r["file_id"], split_map.get(r["split"], "test")) for r in records]
        file_ids = [fid for fid, _ in members]
        if all(isinstance(fid, str) for fid in file_ids):
            catalog.register_dataset(
                "e2_mhd2d",
                "1.0",
                members,
                description="E2 : instantanés MHD 2D 32² ; train = η d'entraînement, "
                "test = trajectoires de référence (η d'entraînement et η de test).",
            )
    for r in records:  # pas de tableaux dans la valeur de retour
        r.pop("time", None)
        r.pop("diagnostics_mean", None)
    return records


# =============================================================================================
# Extension SFEMaNS : grid_type = "fourier_fe_axisym"
# =============================================================================================
AZIMUTHAL_CONVENTION = (
    "f(r, θ, z) = Σ_m [ f_m^c(r, z) cos(mθ) + f_m^s(r, z) sin(mθ) ] ; indice 0 = cos, 1 = sin"
)


def write_fourier_fe_mff(
    path: str | os.PathLike[str],
    meshes: Mapping[str, Mapping[str, Any]],
    modes: Sequence[int],
    fields: Mapping[str, Mapping[str, Any]],
    time: Sequence[float],
    params: Mapping[str, Any],
    *,
    meta: Mapping[str, Any] | None = None,
    dataset_name: str = "milady_sfemans",
    compression: str | None = "gzip",
    compression_level: int = 4,
) -> str:
    """Écrit des champs « Fourier azimutal × éléments finis méridiens » (SFEMaNS) au format MFF ; renvoie le SHA-256.

    meshes : ``{nom: {"nodes": (n, 2) [r, z], "connectivity": (n_elem, 3|6) indices 0, "element_type": "P1"|"P2",
             "vertices": (n_v,) optionnel, "boundary_nodes": (n_b,) optionnel, "region": (n_elem,) optionnel}}``.
             SFEMaNS utilise des maillages distincts (fluide, conducteur, vide) : un nom par maillage.
    modes : nombres d'onde azimutaux m (entiers ≥ 0, ``len = M``).
    fields : ``{nom: {"data": (n_traj, n_t, M, 2, n_nodes[, 3]), "mesh": nom, "node_set": "all"|"vertices"}}`` ;
             axe 3 = (cos, sin) ; dernier axe des vecteurs = composantes cylindriques (r, θ, z).
    """
    path = Path(storage.local_path(path))
    path.parent.mkdir(parents=True, exist_ok=True)
    modes = np.asarray(modes, dtype=np.int32)
    M = len(modes)
    time = np.asarray(time, dtype=np.float64)
    n_traj = None
    for name, spec in fields.items():
        data = np.asarray(spec["data"])
        if n_traj is None:
            n_traj = data.shape[0]
        if data.shape[:4] != (n_traj, len(time), M, 2):
            raise ValueError(
                f"{name} : forme {data.shape}, attendu ({n_traj}, {len(time)}, {M}, 2, n_nœuds[, 3])"
            )
        if spec["mesh"] not in meshes:
            raise ValueError(f"{name} : maillage {spec['mesh']!r} inconnu")
    if n_traj is None:
        raise ValueError("au moins un champ est requis")
    tmp = path.with_name(f".{path.name}.{_uuid.uuid4().hex[:8]}.part")
    try:
        with h5py.File(tmp, "w") as f:
            numeric = {k: float(v) for k, v in params.items() if mff._is_number(v)}
            mff._set_attr(f, "simulation_parameters", list(numeric))
            for k, v in numeric.items():
                f.attrs[k] = v
            f.attrs["dataset_name"] = dataset_name
            f.attrs["grid_type"] = "fourier_fe_axisym"
            f.attrs["n_spatial_dims"] = 3
            f.attrs["n_trajectories"] = int(n_traj)
            for k, v in mff._milady_attrs(meta, params).items():
                f.attrs[k] = v
            g = f.create_group("dimensions")
            mff._set_attr(g, "spatial_dims", ["r", "theta", "z"])
            ds = g.create_dataset("time", data=time.astype(np.float32))
            ds.attrs["sample_varying"] = False
            g = f.create_group("boundary_conditions")
            g.attrs["milady_note"] = (
                "maillage non structuré : nœuds de bord dans milady_fourier_fe/meshes/*/boundary_nodes"
            )
            g = f.create_group("scalars")
            for k, v in numeric.items():
                ds = g.create_dataset(k, data=np.float32(v))
                ds.attrs["sample_varying"] = False
                ds.attrs["time_varying"] = False
            mff._set_attr(g, "field_names", list(numeric))
            for group in mff.TENSOR_GROUPS:
                mff._set_attr(f.create_group(group), "field_names", [])
            fe = f.create_group("milady_fourier_fe")
            mff._set_attr(fe, "field_names", list(fields))
            fe.attrs["azimuthal_convention"] = AZIMUTHAL_CONVENTION
            fe.attrs["component_basis"] = "cylindrical"
            fe.attrs["n_modes"] = M
            fe.create_dataset("modes", data=modes)
            gm = fe.create_group("meshes")
            for name, spec in meshes.items():
                mg = gm.create_group(name)
                nodes = np.asarray(spec["nodes"], dtype=np.float64)
                conn = np.asarray(spec["connectivity"], dtype=np.int32)
                mg.attrs["element_type"] = str(spec.get("element_type", "P1"))
                mg.attrs["n_nodes"] = int(nodes.shape[0])
                mg.attrs["n_elements"] = int(conn.shape[0])
                mg.create_dataset("nodes", data=nodes)
                mg.create_dataset("connectivity", data=conn)
                for opt in ("vertices", "boundary_nodes", "region"):
                    if spec.get(opt) is not None:
                        mg.create_dataset(opt, data=np.asarray(spec[opt], dtype=np.int32))
            gf = fe.create_group("fields")
            for name, spec in fields.items():
                data = np.asarray(spec["data"])
                ds = mff._create(gf, name, data, np.float32, compression, compression_level, lead=3)
                ds.attrs["mesh"] = str(spec["mesh"])
                ds.attrs["node_set"] = str(spec.get("node_set", "all"))
                ds.attrs["tensor_order"] = 1 if data.ndim == 6 else 0
                ds.attrs["sample_varying"] = True
                ds.attrs["time_varying"] = True
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)
    return mff.sha256_file(path)


def _fe_eval(
    path: str | os.PathLike[str],
    field: str,
    r: np.ndarray,
    z: np.ndarray,
    theta: np.ndarray,
    *,
    traj: int,
    t: int,
) -> np.ndarray:
    """Évalue un champ Fourier–EF aux points (r, θ, z) (tableaux de même forme) ; composantes cylindriques.

    Interpolation linéaire par morceaux sur une triangulation de Delaunay des nœuds (exacte pour des champs
    affines en (r, z) ; approximation d'ordre 2 pour des éléments P2) ; NaN hors du domaine méridien.
    """
    from scipy.interpolate import LinearNDInterpolator

    with mff.open_mff(path) as f:
        fe = f["milady_fourier_fe"]
        node = fe["fields"][field]
        mesh = fe["meshes"][mff._py(node.attrs["mesh"])]
        nodes = np.asarray(mesh["nodes"][()])
        if mff._py(node.attrs.get("node_set", "all")) == "vertices":
            nodes = nodes[np.asarray(mesh["vertices"][()])]
        modes = np.asarray(fe["modes"][()])
        vals = np.asarray(node[traj, t], dtype=np.float64)  # (M, 2, n[, 3])
    M = len(modes)
    comps = vals.shape[3] if vals.ndim == 4 else 1
    table = np.moveaxis(vals.reshape(M, 2, nodes.shape[0], comps), 2, 0).reshape(nodes.shape[0], -1)
    pts = np.stack([np.ravel(r), np.ravel(z)], axis=-1)
    coef = LinearNDInterpolator(nodes, table)(pts).reshape(-1, M, 2, comps)
    th = np.ravel(theta)[:, None]
    basis_c, basis_s = np.cos(modes[None, :] * th), np.sin(modes[None, :] * th)
    out = np.einsum("pmc,pm->pc", coef[:, :, 0], basis_c) + np.einsum("pmc,pm->pc", coef[:, :, 1], basis_s)
    out = out.reshape(*np.shape(r), comps)
    return out[..., 0] if vals.ndim == 3 else out


def fourier_fe_to_grid(
    path: str | os.PathLike[str],
    field: str,
    r: Sequence[float],
    theta: Sequence[float],
    z: Sequence[float],
    *,
    traj: int = 0,
    t: int = 0,
) -> np.ndarray:
    """Interpole un champ Fourier–EF sur une grille cylindrique régulière ``(nr, nθ, nz[, 3])`` (composantes r, θ, z)."""
    R, TH, Z = np.meshgrid(
        np.asarray(r, float), np.asarray(theta, float), np.asarray(z, float), indexing="ij"
    )
    return _fe_eval(path, field, R, Z, TH, traj=traj, t=t)


def fourier_fe_to_cartesian(
    path: str | os.PathLike[str],
    field: str,
    x: Sequence[float],
    y: Sequence[float],
    z: Sequence[float],
    *,
    traj: int = 0,
    t: int = 0,
) -> np.ndarray:
    """Interpole un champ Fourier–EF sur une grille cartésienne ``(nx, ny, nz[, 3])`` (composantes x, y, z ; NaN hors domaine)."""
    X, Y, Z = np.meshgrid(np.asarray(x, float), np.asarray(y, float), np.asarray(z, float), indexing="ij")
    R, TH = np.hypot(X, Y), np.arctan2(Y, X)
    out = _fe_eval(path, field, R, Z, TH, traj=traj, t=t)
    if out.ndim == 4:
        ur, ut, uz = out[..., 0], out[..., 1], out[..., 2]
        c, s = np.cos(TH), np.sin(TH)
        out = np.stack([ur * c - ut * s, ur * s + ut * c, uz], axis=-1)
    return out


def read_sfemans_native(*_: Any, **__: Any) -> None:
    """Lecture des fichiers natifs de SFEMaNS (« suites » Fortran) : non implémentée.

    Les données SFEMaNS ne sont pas publiques ; quand elles seront accessibles, ce lecteur devra produire
    les tableaux attendus par :func:`write_fourier_fe_mff` (maillages par domaine, modes, coefficients
    cos/sin par nœud) sans interpolation. Voir ``specs/format-donnees.md``, section SFEMaNS.
    """
    raise NotImplementedError(
        "lecteur SFEMaNS natif à écrire quand les données seront disponibles "
        "(voir specs/format-donnees.md) ; utiliser write_fourier_fe_mff avec des tableaux"
    )


# =============================================================================================
# Ligne de commande
# =============================================================================================
def main(argv: Sequence[str] | None = None) -> int:
    """Point d'entrée de ``python -m milady.data.convert``."""
    ap = argparse.ArgumentParser(prog="python -m milady.data.convert", description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("e2", help="convertit les .npz de E2 en fichiers MFF")
    p.add_argument("source", help="dossier des eta_*.npz (et meta.json)")
    p.add_argument("sortie", help="dossier de sortie des fichiers .h5")
    p.add_argument("--pattern", default="eta_*.npz")
    p.add_argument("--limit", type=int, default=None, help="nombre maximal de fichiers")
    p.add_argument("--max-members", type=int, default=None, help="trajectoires gardées par fichier")
    p.add_argument("--max-snapshots", type=int, default=None, help="instantanés gardés par trajectoire")
    p.add_argument(
        "--catalog",
        nargs="?",
        const="",
        default=None,
        help="enregistre au catalogue (URL SQLAlchemy ; sans valeur : MILADY_DB_URL ou SQLite par défaut)",
    )
    p.add_argument("--campaign", default="e2_mhd2d")
    p.add_argument(
        "--store", default=None, help="URI de stockage où copier les fichiers (ex. s3://milady-data)"
    )
    p.add_argument("--overwrite", action="store_true")
    p = sub.add_parser("validate", help="valide des fichiers MFF")
    p.add_argument("files", nargs="+")
    p.add_argument("--well-only", action="store_true", help="contrôle seulement la partie The Well")
    p.add_argument(
        "--full",
        action="store_true",
        help="valeurs finies vérifiées sur tous les instantanés (lecture complète)",
    )
    p = sub.add_parser("info", help="affiche l'arborescence d'un fichier (façon h5dump -H)")
    p.add_argument("file")
    p = sub.add_parser("zarr", help="copie un fichier MFF HDF5 en Zarr (local ou s3://)")
    p.add_argument("h5")
    p.add_argument("uri")
    p.add_argument("--overwrite", action="store_true")
    p = sub.add_parser("sfemans", help="(squelette) conversion de données SFEMaNS natives")
    p.add_argument("source")
    p.add_argument("sortie")
    args = ap.parse_args(argv)

    if args.cmd == "e2":
        catalog = None
        if args.catalog is not None:
            from milady.catalog.api import Catalog

            catalog = Catalog(args.catalog or None)
        recs = convert_e2(
            args.source,
            args.sortie,
            catalog=catalog,
            campaign=args.campaign,
            store=args.store,
            pattern=args.pattern,
            limit=args.limit,
            max_members=args.max_members,
            max_snapshots=args.max_snapshots,
            overwrite=args.overwrite,
        )
        print(json.dumps([{k: r.get(k) for k in ("uri", "uuid", "split", "sha256")} for r in recs], indent=1))
        return 0
    if args.cmd == "validate":
        bad = 0
        for path in args.files:
            errs = mff.validate(path, well_only=args.well_only, full_scan=args.full)
            print(f"{path} : {'conforme' if not errs else f'{len(errs)} problème(s)'}")
            for e in errs:
                print(f"  - {e}")
            bad += bool(errs)
        return 1 if bad else 0
    if args.cmd == "info":
        print(mff.describe(args.file))
        return 0
    if args.cmd == "zarr":
        print(mff.to_zarr(args.h5, args.uri, overwrite=args.overwrite))
        return 0
    if args.cmd == "sfemans":
        try:
            read_sfemans_native(args.source, args.sortie)
        except NotImplementedError as exc:
            print(f"non implémenté : {exc}", file=sys.stderr)
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
