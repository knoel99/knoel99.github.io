#!/usr/bin/env python3
"""Test de fumée de bout en bout de l'infrastructure MilaDy (« make smoke »).

Chaîne vérifiée, en quelques dizaines de secondes sur CPU :

1. environnement (versions, GPU, variables de configuration, sans afficher de secret) ;
2. stockage (``milady.storage`` : aller-retour d'un petit fichier vers ``MILADY_STORAGE_URI``) ;
3. catalogue (``milady.catalog.api.Catalog`` : campagne, simulation, tâche) ;
4. simulation 3D minuscule (solveur ``milady.sim.mhd3d``) ;
5. fichier MFF (``milady.data.format`` : écriture, validation, relecture ; variante Zarr) ;
6. téléversement vers le stockage, enregistrement du fichier et des diagnostics au catalogue ;
7. jeu de données (``register_dataset``) ;
8. entraînement d'une itération (``milady.train.fm3d``), journalisé dans MLflow si
   ``MLFLOW_TRACKING_URI`` est défini, point de contrôle stocké ;
9. évaluation (divergence relative, énergie) enregistrée au catalogue, puis résumé ``eval_summary``.

Le script s'exécute tel quel dans le conteneur ``worker`` (PostgreSQL + MinIO + MLflow) ou en mode
portable (SQLite + ``./data/store``). Code de retour 0 si toutes les étapes obligatoires réussissent.

Les modules réels (solveur, entraînement, métriques) sont exigés : une panne de l'un d'eux fait
échouer l'étape. ``--allow-fallback`` autorise les remplacements de secours (champ ABC analytique,
petit réseau convolutif, divergence spectrale locale) pour tester l'infrastructure seule.

Usage : ``python infra/deploy/smoke.py [--n 16] [--keep] [--json rapport.json] [--allow-fallback]``
"""
from __future__ import annotations

import argparse
import importlib
import inspect
import json
import os
import platform
import socket
import sys
import tempfile
import time
import traceback
import urllib.request
import uuid
from collections.abc import Callable
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

REPO = Path(__file__).resolve().parents[2]
if str(REPO) not in sys.path:  # exécution possible sans « pip install -e . »
    sys.path.insert(0, str(REPO))


# ---------------------------------------------------------------------------------------------
# Petit moteur d'étapes
# ---------------------------------------------------------------------------------------------
@dataclass
class Step:
    """Résultat d'une étape du test."""

    name: str
    status: str = "pending"  # ok | fail | skip
    seconds: float = 0.0
    detail: str = ""


@dataclass
class Runner:
    """Exécute les étapes, mesure leur durée et collecte les erreurs sans interrompre le rapport."""

    steps: list[Step] = field(default_factory=list)
    context: dict[str, Any] = field(default_factory=dict)

    def run(self, name: str, fn: Callable[[], str | None], required: bool = True,
            needs: tuple[str, ...] = ()) -> bool:
        """Lance ``fn`` ; une exception marque l'étape en échec (ou « skip » si facultative).

        ``needs`` : étapes préalables ; si l'une n'a pas réussi, l'étape est sautée (l'échec est
        déjà compté sur l'étape préalable).
        """
        step = Step(name)
        self.steps.append(step)
        t0 = time.perf_counter()
        status = {s.name: s.status for s in self.steps}
        missing = [n for n in needs if status.get(n) != "ok"]
        try:
            if missing:
                raise SkipStep("prérequis non satisfait : " + ", ".join(missing))
            detail = fn()
            step.status, step.detail = "ok", detail or ""
        except SkipStep as exc:
            step.status, step.detail = "skip", str(exc)
        except Exception as exc:  # noqa: BLE001 — on veut un rapport complet
            step.status = "fail" if required else "skip"
            step.detail = f"{type(exc).__name__}: {exc}"
            if os.environ.get("MILADY_SMOKE_DEBUG") or required:
                traceback.print_exc()
        step.seconds = time.perf_counter() - t0
        mark = {"ok": "OK  ", "fail": "FAIL", "skip": "SKIP"}[step.status]
        print(f"[{mark}] {name:<22s} {step.seconds:6.2f} s  {step.detail}", flush=True)
        return step.status == "ok"

    @property
    def failed(self) -> list[Step]:
        """Étapes obligatoires en échec."""
        return [s for s in self.steps if s.status == "fail"]


class SkipStep(Exception):
    """Étape sautée volontairement (dépendance absente, service non configuré)."""


def _mask(url: str) -> str:
    """Masque le mot de passe d'une URL de connexion."""
    if "://" in url and "@" in url:
        scheme, rest = url.split("://", 1)
        creds, host = rest.rsplit("@", 1)
        user = creds.split(":", 1)[0]
        return f"{scheme}://{user}:***@{host}"
    return url


def _optional_module(name: str) -> Any | None:
    """Importe un module facultatif ; ``None`` s'il n'existe pas encore."""
    try:
        return importlib.import_module(name)
    except ModuleNotFoundError as exc:
        if exc.name and (exc.name == name or name.startswith(exc.name + ".")):
            return None
        raise


def _call_with_supported(fn: Callable[..., Any], **kwargs: Any) -> Any:
    """Appelle ``fn`` avec les seuls arguments nommés qu'elle accepte (adaptation souple d'API)."""
    sig = inspect.signature(fn)
    if any(p.kind is inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values()):
        return fn(**kwargs)
    return fn(**{k: v for k, v in kwargs.items() if k in sig.parameters})


# ---------------------------------------------------------------------------------------------
# Champs de secours (si le solveur 3D n'est pas disponible)
# ---------------------------------------------------------------------------------------------
def spectral_grid(n: int) -> tuple[np.ndarray, tuple[np.ndarray, np.ndarray, np.ndarray]]:
    """Grille périodique [0, 2π)^3 et nombres d'onde entiers (indexation ij)."""
    x = 2 * np.pi * np.arange(n) / n
    k = np.fft.fftfreq(n, d=1.0 / n)
    kx, ky, kz = np.meshgrid(k, k, k, indexing="ij")
    return x, (kx, ky, kz)


def divergence_rel(v: np.ndarray) -> float:
    """Divergence relative spectrale max|∇·v| / max|∇v| d'un champ (n, n, n, 3) périodique."""
    n = v.shape[0]
    _, (kx, ky, kz) = spectral_grid(n)
    vh = [np.fft.fftn(v[..., i]) for i in range(3)]
    div = np.real(np.fft.ifftn(1j * (kx * vh[0] + ky * vh[1] + kz * vh[2])))
    grad = max(float(np.abs(np.real(np.fft.ifftn(1j * kk * vh[i]))).max())
               for i in range(3) for kk in (kx, ky, kz))
    return float(np.abs(div).max() / max(grad, 1e-30))


def analytic_fields(n: int, n_t: int, rng: np.random.Generator) -> dict[str, Any]:
    """Écoulement ABC (A = B = C = 1) et champ magnétique aléatoire à divergence nulle.

    B = ∇ × A avec A aléatoire à spectre décroissant ; amplitude ∝ exp(γ t) (croissance fictive)
    pour obtenir une série temporelle non triviale. Renvoie champs, coordonnées et diagnostics.
    """
    x, (kx, ky, kz) = spectral_grid(n)
    X, Y, Z = np.meshgrid(x, x, x, indexing="ij")
    u = np.stack([np.sin(Z) + np.cos(Y), np.sin(X) + np.cos(Z), np.sin(Y) + np.cos(X)], axis=-1)
    k2 = kx**2 + ky**2 + kz**2
    filt = np.where(k2 > 0, np.exp(-k2 / 8.0), 0.0)
    ah = [np.fft.fftn(rng.standard_normal((n, n, n))) * filt for _ in range(3)]
    bh = [1j * (ky * ah[2] - kz * ah[1]), 1j * (kz * ah[0] - kx * ah[2]), 1j * (kx * ah[1] - ky * ah[0])]
    b0 = np.stack([np.real(np.fft.ifftn(c)) for c in bh], axis=-1)
    b0 *= 1e-2 / np.sqrt((b0**2).sum(-1).mean())
    t = np.linspace(0.0, 0.2 * (n_t - 1), n_t)
    gamma = 0.5
    velocity = np.repeat(u[None, None], n_t, axis=1).astype(np.float32)
    magnetic = np.stack([b0 * np.exp(gamma * ti) for ti in t])[None].astype(np.float32)
    e_kin = 0.5 * (velocity[0] ** 2).sum(-1).mean(axis=(1, 2, 3))
    e_mag = 0.5 * (magnetic[0] ** 2).sum(-1).mean(axis=(1, 2, 3))
    return {
        "fields": {"velocity": velocity, "magnetic_field": magnetic},
        "coords": {"time": t.astype(np.float64), "x": x, "y": x, "z": x},
        "diagnostics": {"energy_kinetic": e_kin.astype(np.float64),
                        "energy_magnetic": e_mag.astype(np.float64)},
        "code": "smoke_analytic_abc",
    }


def solver_fields(n: int, n_t: int) -> dict[str, Any] | None:
    """Simulation minuscule avec ``milady.sim.mhd3d`` si le module expose une API reconnue."""
    mod = _optional_module("milady.sim.mhd3d")
    if mod is None:
        return None
    for name in ("smoke_run", "tiny_run", "run_small", "quick_run"):
        fn = getattr(mod, name, None)
        if callable(fn):
            out = _call_with_supported(fn, n=n, n_t=n_t, device="cpu")
            if isinstance(out, dict) and "fields" in out and "coords" in out:
                out.setdefault("code", "mhd3d_torch")
                out.setdefault("diagnostics", {})
                return out
    return None


# ---------------------------------------------------------------------------------------------
# Test principal
# ---------------------------------------------------------------------------------------------
def main(argv: list[str] | None = None) -> int:
    """Point d'entrée : exécute toutes les étapes et renvoie le code de retour."""
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--n", type=int, default=16, help="résolution de la grille (n³), défaut 16")
    ap.add_argument("--n-t", type=int, default=3, help="nombre de pas de temps écrits, défaut 3")
    ap.add_argument("--keep", action="store_true", help="conserver les fichiers temporaires locaux")
    ap.add_argument("--json", type=Path, default=None, help="écrire le rapport JSON dans ce fichier")
    ap.add_argument("--allow-fallback", action="store_true",
                    help="autoriser les remplacements de secours si solveur, entraînement ou métriques échouent")
    args = ap.parse_args(argv)

    run_id = time.strftime("%Y%m%dT%H%M%S") + "-" + uuid.uuid4().hex[:6]
    campaign_name = f"smoke-{run_id}"
    workdir = Path(tempfile.mkdtemp(prefix="milady-smoke-"))
    rng = np.random.default_rng(12345)
    r = Runner()
    ctx = r.context

    print(f"== Test de fumée MilaDy {run_id} (dossier temporaire {workdir})", flush=True)

    # 1. Environnement ----------------------------------------------------------------------
    def step_env() -> str:
        import torch

        import milady

        ctx["torch"] = torch
        ctx["device"] = "cuda" if torch.cuda.is_available() else "cpu"
        ctx["n_gpus"] = torch.cuda.device_count()
        ctx["git_commit"] = milady.git_commit() if hasattr(milady, "git_commit") else ""
        ctx["host"] = os.environ.get("MILADY_HOST") or socket.gethostname()
        db = os.environ.get("MILADY_DB_URL", "(défaut SQLite)")
        st = os.environ.get("MILADY_STORAGE_URI", "(défaut ./data/store)")
        print(f"       python {platform.python_version()}  torch {torch.__version__}  "
              f"device {ctx['device']} ({ctx['n_gpus']} GPU)  milady {milady.__version__}")
        print(f"       MILADY_DB_URL={_mask(db)}  MILADY_STORAGE_URI={st}  "
              f"MILADY_S3_ENDPOINT={os.environ.get('MILADY_S3_ENDPOINT', '-')}  "
              f"MLFLOW_TRACKING_URI={os.environ.get('MLFLOW_TRACKING_URI', '-')}")
        return f"commit {ctx['git_commit'] or '?'}"

    r.run("environnement", step_env)

    # 2. Stockage ---------------------------------------------------------------------------
    def step_storage() -> str:
        from milady import storage

        ctx["storage"] = storage
        base = storage.base_uri()
        ctx["base_uri"] = base
        probe = workdir / "probe.bin"
        payload = rng.bytes(4096)
        probe.write_bytes(payload)
        uri = storage.join(base, "_smoke", run_id, "probe.bin")
        storage.put(str(probe), uri)
        if not storage.exists(uri):
            raise RuntimeError(f"objet introuvable après put : {uri}")
        back = workdir / "probe_back.bin"
        storage.get(uri, str(back))
        if back.read_bytes() != payload:
            raise RuntimeError("contenu différent après aller-retour")
        with storage.open(uri, "rb") as fh:
            if fh.read(16) != payload[:16]:
                raise RuntimeError("lecture partielle incorrecte")
        return uri

    r.run("stockage", step_storage)

    # 3. Catalogue --------------------------------------------------------------------------
    def step_catalog() -> str:
        from milady.catalog.api import Catalog

        cat = Catalog(None)
        ctx["cat"] = cat
        ctx["campaign_id"] = cat.create_campaign(
            campaign_name, config_yaml=f"name: {campaign_name}\nkind: smoke\n",
            description="Test de fumée automatique (infra/deploy/smoke.py)")
        return f"campagne {campaign_name} ({ctx['campaign_id']})"

    r.run("catalogue", step_catalog)

    # 4. Simulation -------------------------------------------------------------------------
    def step_simulation() -> str:
        cat = ctx["cat"]
        params = {"Rm": 10.0, "Re": 1.0, "A": 1.0, "B": 1.0, "C": 1.0}
        grid = {"type": "cartesian", "n": [args.n] * 3, "L": [2 * np.pi] * 3, "periodic": True}
        ctx["params"] = params
        t0 = time.perf_counter()
        out = None
        try:
            out = solver_fields(args.n, args.n_t)
        except Exception as exc:  # repli sur le champ analytique si autorisé
            if not args.allow_fallback:
                raise
            print(f"       solveur 3D indisponible ({type(exc).__name__}: {exc}) : champ analytique")
        if out is None:
            if not args.allow_fallback:
                raise RuntimeError("milady.sim.mhd3d.smoke_run introuvable (--allow-fallback : champ analytique)")
            out = analytic_fields(args.n, args.n_t, rng)
        ctx["sim"] = out
        ctx["wall"] = time.perf_counter() - t0
        if isinstance(out.get("params"), dict):  # paramètres physiques réels du solveur
            params = {k: float(v) for k, v in out["params"].items() if isinstance(v, (int, float))}
            ctx["params"] = params
        sim_id = cat.register_simulation(
            ctx["campaign_id"], out["code"], params, grid, code_version="smoke",
            git_commit=ctx.get("git_commit", ""), host=ctx.get("host", ""),
            n_gpus=int(ctx.get("n_gpus", 0)), n_cpus=os.cpu_count() or 1)
        ctx["sim_id"] = sim_id
        ctx["job_id"] = cat.register_job("simulation", "local", external_id=str(os.getpid()),
                                         simulation_id=sim_id, status="running")
        cat.update_simulation(sim_id, status="running")
        b_last = np.asarray(out["fields"]["magnetic_field"])[0, -1]
        ctx["div_rel"] = divergence_rel(b_last.astype(np.float64))
        return f"{out['code']}  n={args.n}  n_t={args.n_t}  div_rel(B)={ctx['div_rel']:.1e}"

    r.run("simulation", step_simulation, needs=("environnement", "catalogue"))

    # 5. Format MFF -------------------------------------------------------------------------
    def step_format() -> str:
        from milady.data import format as mff

        out = ctx["sim"]
        path = workdir / "fields.h5"
        meta = {
            "code": out["code"], "code_version": "smoke", "git_commit": ctx.get("git_commit", ""),
            "uuid": ctx["sim_id"], "host": ctx.get("host", ""), "command": " ".join(sys.argv),
            "nondimensionalization": "unités d'Alfvén, longueur L/2π (test de fumée)",
        }
        sha = mff.write_mff(str(path), out["fields"], out["coords"], ctx["params"], meta=meta,
                            diagnostics=out.get("diagnostics") or None, dataset_name="milady_smoke")
        errors = mff.validate(str(path))
        if errors:
            raise RuntimeError("validate() : " + " ; ".join(errors[:5]))
        back = mff.read_mff(str(path))
        for name, arr in out["fields"].items():
            got = np.asarray(back["fields"][name])
            if got.shape != np.asarray(arr).shape:
                raise RuntimeError(f"forme relue {got.shape} ≠ {np.asarray(arr).shape} pour {name}")
            if not np.allclose(got, arr, rtol=1e-6, atol=1e-7):
                raise RuntimeError(f"valeurs relues différentes pour {name}")
        ctx["mff_path"], ctx["sha256"] = path, sha
        return f"{path.name} {path.stat().st_size / 1024:.0f} Kio  sha256 {sha[:12]}…"

    r.run("format MFF", step_format, needs=("simulation",))

    def step_zarr() -> str:
        from milady.data import format as mff

        if not hasattr(mff, "to_zarr"):
            raise SkipStep("to_zarr absent")
        zpath = workdir / "fields.zarr"
        mff.to_zarr(str(ctx["mff_path"]), str(zpath))
        back = mff.read_mff(str(zpath))
        shape = np.asarray(back["fields"]["magnetic_field"]).shape
        return f"{zpath.name} relu, B {shape}"

    r.run("variante Zarr", step_zarr, required=False, needs=("format MFF",))

    # 6. Téléversement + catalogue ----------------------------------------------------------
    def step_register() -> str:
        storage, cat = ctx["storage"], ctx["cat"]
        out = ctx["sim"]
        uri = storage.join(ctx["base_uri"], campaign_name, ctx["sim_id"], "fields.h5")
        storage.put(str(ctx["mff_path"]), uri)
        t = np.asarray(out["coords"]["time"], dtype=float)
        ctx["file_id"] = cat.register_file(
            ctx["sim_id"], "fields", uri, ctx["sha256"], ctx["mff_path"].stat().st_size,
            n_t=len(t), t_start=float(t[0]), t_end=float(t[-1]), format_version="1.0")
        for name, values in (out.get("diagnostics") or {}).items():
            values = np.asarray(values, dtype=float)
            if values.shape == t.shape:
                cat.add_diagnostics(ctx["sim_id"], name, t, values)
        cat.update_simulation(ctx["sim_id"], status="done", wall_time_s=float(ctx["wall"]))
        cat.update_job(ctx["job_id"], status="done")
        found = cat.query_simulations(campaign=campaign_name)
        if not any(str(s.get("id")) == str(ctx["sim_id"]) for s in found):
            raise RuntimeError("simulation absente de query_simulations()")
        ctx["fields_uri"] = uri
        return uri

    r.run("téléversement+catalogue", step_register, needs=("stockage", "format MFF"))

    # 7. Jeu de données ---------------------------------------------------------------------
    def step_dataset() -> str:
        ctx["dataset_id"] = ctx["cat"].register_dataset(
            f"smoke-{run_id}", "0.0.1", [(ctx["file_id"], "train")],
            description="jeu de données du test de fumée")
        return str(ctx["dataset_id"])

    r.run("jeu de données", step_dataset, needs=("téléversement+catalogue",))

    # 8. Entraînement (une itération) -------------------------------------------------------
    def step_train() -> str:
        torch = ctx["torch"]
        fm3d = _optional_module("milady.train.fm3d")
        hook = getattr(fm3d, "smoke_step", None) if fm3d is not None else None
        b = torch.as_tensor(np.asarray(ctx["sim"]["fields"]["magnetic_field"])[0], dtype=torch.float32)
        x1 = b.permute(0, 4, 1, 2, 3).contiguous()  # (n_t, 3, n, n, n)
        if callable(hook):
            info = _call_with_supported(hook, data=x1, device=ctx["device"], workdir=str(workdir))
            loss = float(info["loss"]) if isinstance(info, dict) else float(info)
            model_state = info.get("state_dict", {}) if isinstance(info, dict) else {}
            arch = "fm3d"
        elif not args.allow_fallback:
            raise RuntimeError("milady.train.fm3d.smoke_step introuvable (--allow-fallback : réseau de secours)")
        else:
            torch.manual_seed(0)
            net = torch.nn.Sequential(torch.nn.Conv3d(4, 8, 3, padding=1, padding_mode="circular"),
                                      torch.nn.SiLU(),
                                      torch.nn.Conv3d(8, 3, 3, padding=1, padding_mode="circular"))
            opt = torch.optim.Adam(net.parameters(), lr=1e-3)
            x0 = torch.randn_like(x1)
            tt = torch.rand(x1.shape[0], 1, 1, 1, 1)
            xt = (1 - tt) * x0 + tt * x1
            inp = torch.cat([xt, tt.expand(-1, 1, *xt.shape[2:])], dim=1)
            loss_t = ((net(inp) - (x1 - x0)) ** 2).mean()
            opt.zero_grad()
            loss_t.backward()
            opt.step()
            loss, model_state, arch = loss_t.item(), net.state_dict(), "smoke_conv3d"
        ckpt = workdir / "checkpoint.pt"
        torch.save({"state_dict": model_state, "loss": loss}, ckpt)
        storage = ctx["storage"]
        models_base = os.environ.get("MILADY_MODELS_URI") or storage.join(ctx["base_uri"], "_models")
        ckpt_uri = storage.join(models_base, "smoke", run_id, "checkpoint.pt")
        storage.put(str(ckpt), ckpt_uri)
        run_id_mlflow = None
        tracking = os.environ.get("MLFLOW_TRACKING_URI")
        if tracking:
            import mlflow

            if tracking.startswith("http"):
                urllib.request.urlopen(tracking.rstrip("/") + "/health", timeout=10).read()
            mlflow.set_experiment(os.environ.get("MLFLOW_EXPERIMENT_NAME", "milady") + "-smoke")
            with mlflow.start_run(run_name=f"smoke-{run_id}") as active:
                mlflow.log_params({"architecture": arch, "n": args.n, "dataset_id": ctx["dataset_id"]})
                mlflow.log_metric("loss", loss, step=0)
                mlflow.log_artifact(str(ckpt))
                run_id_mlflow = active.info.run_id
        ctx["model_id"] = ctx["cat"].register_model(
            f"smoke-{run_id}", arch, "none", {"lr": 1e-3, "iterations": 1},
            dataset_id=ctx["dataset_id"], mlflow_run_id=run_id_mlflow, checkpoint_uri=ckpt_uri,
            git_commit=ctx.get("git_commit", ""))
        mlf = f"  MLflow run {run_id_mlflow[:8]}" if run_id_mlflow else "  (MLflow non configuré)"
        return f"{arch} loss={loss:.3e}{mlf}"

    r.run("entraînement (1 it.)", step_train, needs=("jeu de données",))

    # 9. Évaluation -------------------------------------------------------------------------
    def step_eval() -> str:
        cat = ctx["cat"]
        metrics = _optional_module("milady.eval.metrics")
        b_last = np.asarray(ctx["sim"]["fields"]["magnetic_field"], dtype=np.float64)[0, -1]
        div = None
        if metrics is not None:
            fn = getattr(metrics, "divergence_relative", None) or getattr(metrics, "relative_divergence", None)
            if callable(fn):
                try:
                    div = float(fn(b_last))
                except Exception:  # convention de forme différente : repli si autorisé
                    if not args.allow_fallback:
                        raise
                    div = None
        if div is None:
            if not args.allow_fallback:
                raise RuntimeError("milady.eval.metrics.divergence_relative introuvable (--allow-fallback)")
            div = divergence_rel(b_last)
        energy = float(0.5 * (b_last**2).sum(-1).mean())
        for metric, value in (("div_rel", div), ("energy_magnetic", energy)):
            cat.add_evaluation(ctx["model_id"], ctx["params"], metric, value, 1, 0,
                               details={"source": "smoke", "run": run_id})
        summary = cat.eval_summary(ctx["model_id"])
        if not summary:
            raise RuntimeError("eval_summary() vide")
        return f"div_rel={div:.1e}  E_B={energy:.2e}  ({len(summary)} ligne(s) de résumé)"

    r.run("évaluation", step_eval, needs=("entraînement (1 it.)",))

    # Rapport -------------------------------------------------------------------------------
    if not args.keep:
        import shutil

        shutil.rmtree(workdir, ignore_errors=True)
    report = {"run": run_id, "campaign": campaign_name, "steps": [asdict(s) for s in r.steps],
              "ok": not r.failed}
    if args.json:
        args.json.write_text(json.dumps(report, indent=1, ensure_ascii=False), encoding="utf-8")
    if r.failed:
        print(f"== ÉCHEC du test de fumée : {', '.join(s.name for s in r.failed)}", flush=True)
        return 1
    print(f"== Test de fumée réussi ({sum(s.seconds for s in r.steps):.1f} s). Campagne : {campaign_name}",
          flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
