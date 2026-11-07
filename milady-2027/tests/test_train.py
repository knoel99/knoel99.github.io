"""Tests de l'entraînement 3D (milady.train) : représentation latente, contraintes dures, équivariance, une
époque sur des champs 8³ synthétiques, échantillonnage, catalogue, CLI d'évaluation et torchrun
(2 processus CPU).
"""

from __future__ import annotations

import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
import pytest
import torch

from milady.data import write_mff
from milady.eval import metrics as M
from milady.train import data as D
from milady.train import fm3d

ROOT = Path(__file__).resolve().parent.parent
N = 8


@pytest.fixture(autouse=True)
def _threads() -> None:
    torch.set_num_threads(2)


# ---------------------------------------------------------------------------------------------
# Données synthétiques : 2 fichiers MFF (Re = 20, 40) de 1 trajectoire × 4 instantanés 8³ = 8 champs
# ---------------------------------------------------------------------------------------------
def _write_synthetic(tmp: Path, kmax: float = 3.0) -> list[str]:
    space = D.FourierPotentialSpace(kmax)
    g = torch.Generator().manual_seed(0)
    x = 2 * np.pi * np.arange(N) / N
    uris = []
    for i, re in enumerate((20.0, 40.0)):
        lat = torch.randn(4, space.n_modes, space.n_channels, generator=g)
        lat = lat * (1.0 + i) / (1.0 + space.shell.float()[None, :, None]) ** 2
        f = space.decode(lat, N)
        fields = {k: v.numpy().reshape(1, 4, N, N, N, 3) for k, v in f.items()}
        params = {
            "Re": re,
            "Pm": 1.0,
            "nu": 0.5 / re,
            "eta": 0.5 / re,
            "U_ref": 1.0,
            "L_ref": 0.5,
            "mode": "dynamic",
            "forcing": "tg",
            "kf": 1,
            "forcing_amp": 0.1,
            "forcing_rule": "fixed",
        }
        path = tmp / f"sim{i}.h5"
        write_mff(
            path, fields, {"time": np.arange(4.0), "x": x, "y": x, "z": x}, params, meta={"code": "generated"}
        )
        uris.append(str(path))
    return uris


@pytest.fixture(scope="module")
def mff_files(tmp_path_factory: pytest.TempPathFactory) -> list[str]:
    return _write_synthetic(tmp_path_factory.mktemp("mff"))


def _small_cfg(tmp: Path, **over: object) -> dict:
    cfg = fm3d.default_config()
    cfg["name"] = "test_fm3d"
    cfg["data"].update(
        kmax=3, conditioning=[{"name": "Re", "transform": "log"}], cache_dir=str(tmp / "cache")
    )
    cfg["model"]["mlp"].update(width=64, depth=2, emb_dim=32, n_freq=4)
    cfg["train"].update(
        epochs=1,
        iters=None,
        batch_size=4,
        log_every=1,
        ckpt_every=0,
        val_every=0,
        num_threads=2,
        workdir=str(tmp / "runs"),
    )
    cfg["checkpoint"]["uri"] = str(tmp / "models")
    cfg["catalog"].update(enabled=True, url=f"sqlite:///{tmp / 'catalog.sqlite'}", required=True)
    cfg["eval"].update(after_train=True, n_samples=4, steps=4, max_points=2, n_ref=4)
    for key, val in over.items():
        section, name = key.split("__")
        cfg[section][name] = val
    return cfg


# ---------------------------------------------------------------------------------------------
# Représentation latente
# ---------------------------------------------------------------------------------------------
def test_modes_and_basis() -> None:
    m = D.half_ball_modes(4)
    assert len(m) == 128 and len({tuple(v) for v in m} | {tuple(-v) for v in m}) == 256  # aucun doublon ±m
    assert np.all(np.linalg.norm(m, axis=1) <= 4) and np.all(np.diff(np.sum(m**2, 1)) >= 0)
    k = m.astype(float)
    e1, e2 = D.craya_basis(k)
    for a, b in ((e1, k), (e2, k), (e1, e2)):
        assert np.abs(np.sum(a * b, 1)).max() < 1e-12
    assert np.allclose(np.linalg.norm(e1, axis=1), 1) and np.allclose(np.linalg.norm(e2, axis=1), 1)


def test_decode_divergence_free_float32() -> None:
    """Décodage u = ∇×A_u, B = ∇×A_B : divergence relative < 1e-6 en float32, jauge de Coulomb exacte."""
    space = D.FourierPotentialSpace(4)
    x = torch.randn(5, space.n_modes, space.n_channels) * 3.0
    a = space.potential_hat(x)
    assert a.dtype == torch.complex64
    kdota = (a * space.k.to(torch.float32)).sum(-1).abs().max().item()
    assert kdota < 1e-5 * a.abs().max().item()
    fields = space.decode(x, 12)
    for name in ("velocity", "magnetic_field"):
        f = fields[name]
        assert f.dtype == torch.float32 and f.shape == (5, 12, 12, 12, 3)
        assert M.divergence_relative(f.numpy()) < 1e-6


def test_encode_projects_and_roundtrips() -> None:
    space = D.FourierPotentialSpace(3)
    x = torch.randn(3, space.n_modes, space.n_channels, dtype=torch.float32)
    f = {k: v.double() for k, v in space.decode(x.double(), 10).items()}
    x2 = space.encode(f)
    assert torch.allclose(x2, x, atol=1e-5)
    # un gradient pur a un potentiel vecteur nul (projection de Leray implicite)
    X, Y, Z = np.meshgrid(*(2 * np.pi * np.arange(10) / 10,) * 3, indexing="ij")
    grad = np.stack([np.cos(X) * np.cos(Y), -np.sin(X) * np.sin(Y), 0 * Z], -1)[None]
    lat = space.encode({"velocity": grad, "magnetic_field": grad})
    assert lat.abs().max() < 1e-6
    with pytest.raises(ValueError):
        space.encode({"velocity": np.zeros((1, 6, 6, 6, 3)), "magnetic_field": np.zeros((1, 6, 6, 6, 3))})


def test_latent_budget_matches_grid_metrics() -> None:
    """Termes de bilan différentiables (latent, Parseval + grille sans repliement) = métriques sur grille."""
    space = D.FourierPotentialSpace(3)
    x = torch.randn(3, space.n_modes, space.n_channels) / (1 + space.shell.float()[None, :, None]) ** 2
    params = {
        "mode": "dynamic",
        "forcing": "tg",
        "kf": 1,
        "nu": 0.03,
        "eta": 0.02,
        "forcing_amp": 0.2,
        "forcing_rule": "fixed",
    }
    n = space.default_grid()
    fh = space.vector_modes(M.taylor_green_field((n, n, n)))
    t = space.budget_terms(
        x,
        torch.full((3,), 0.03),
        torch.full((3,), 0.02),
        forcing_hat=fh,
        injection=torch.full((3,), 0.2),
        production=True,
    )
    f = {k: v.double().numpy() for k, v in space.decode(x.double(), n).items()}
    ref = M.energy_budget(f["velocity"], f["magnetic_field"], params)
    for key in (
        "kinetic_energy",
        "magnetic_energy",
        "kinetic_dissipation",
        "magnetic_dissipation",
        "injection",
        "magnetic_production",
    ):
        np.testing.assert_allclose(t[key].numpy(), ref[key], rtol=2e-4, atol=1e-7)
    spec = space.shell_spectra(x)["velocity"].numpy()
    np.testing.assert_allclose(
        spec, M.energy_spectrum(f["velocity"], n_shells=4)[:, 1:], rtol=2e-4, atol=1e-8
    )


def test_physical_parameters_at_new_condition() -> None:
    fixed = {
        "mode": "dynamic",
        "forcing": "tg",
        "kf": 2,
        "U_ref": 1.0,
        "L_ref": 0.5,
        "forcing_rule": "laminar",
    }
    p = D.physical_parameters({"Re": 70.0, "Pm": 1.5}, fixed)
    assert (
        p["nu"] == pytest.approx(0.5 / 70)
        and p["Rm"] == pytest.approx(105.0)
        and p["eta"] == pytest.approx(0.5 / 105)
    )
    assert p["forcing_amp"] == pytest.approx(p["nu"] * 3 * 4)  # ν |k|², |k|² = 3 k_f² pour TG
    # un seul paramètre conditionnant : l'autre groupe vient des valeurs fixes (Pm prioritaire)
    q = D.physical_parameters({"Re": 50.0}, {**fixed, "Pm": 2.0, "Rm": 999.0, "nu": 1.0})
    assert q["Rm"] == pytest.approx(100.0) and q["nu"] == pytest.approx(0.01)
    assert D.param_value({"eta": 0.1, "U_ref": 1.0, "L_ref": 1.0}, "Rm") == pytest.approx(10.0)
    spec = D.CondSpec("Re").fit([20.0, 40.0])
    assert spec.normalize(20.0) == 0.0 and spec.normalize(40.0) == 1.0
    assert spec.denormalize(spec.normalize(28.3)) == pytest.approx(28.3)


# ---------------------------------------------------------------------------------------------
# Réseaux : équivariance exacte
# ---------------------------------------------------------------------------------------------
@pytest.mark.parametrize("arch", ["mlp", "transformer"])
def test_equivariance_exact(arch: str) -> None:
    space = D.FourierPotentialSpace(3, symmetric_b=True)
    torch.manual_seed(0)
    cfg = {
        "architecture": arch,
        "symmetry_b_sign": True,
        "mlp": {"width": 32, "depth": 2, "emb_dim": 16, "n_freq": 4},
        "transformer": {
            "d_model": 16,
            "depth": 2,
            "heads": 2,
            "modes_per_token": 4,
            "emb_dim": 16,
            "n_freq": 4,
        },
    }
    field = fm3d.build_field(cfg, space, 2)
    assert isinstance(field, fm3d.SignSymmetrized)
    for p in field.parameters():  # poids non nuls (l'initialisation adaLN-Zero rendrait le test trivial)
        torch.nn.init.normal_(p, std=0.2)
    s = space.sign
    assert s[:4].eq(1).all() and s[4:].eq(-1).all()  # A_u inchangé, A_B → −A_B
    x, t, c = torch.randn(6, space.n_modes, space.n_channels), torch.rand(6), torch.rand(6, 2)
    v, vs = field(x, t, c), field(s * x, t, c)
    assert v.abs().max() > 0
    assert torch.equal(vs, s * v)  # égalité exacte, bit à bit
    # la loi générée est symétrique : z ↦ S z donne S x exactement
    z = torch.randn(4, space.n_modes, space.n_channels)
    with torch.no_grad():
        a = fm3d.heun_sample(field, z, c[:4], steps=3)
        b = fm3d.heun_sample(field, s * z, c[:4], steps=3)
    assert torch.equal(b, s * a)


def test_stationarity_loss_gradient() -> None:
    space = D.FourierPotentialSpace(3, symmetric_b=True)
    space.std.mul_(0.1)
    spec = D.CondSpec("Re").fit([20.0, 40.0])
    fixed = {
        "mode": "dynamic",
        "forcing": "tg",
        "kf": 1,
        "U_ref": 1.0,
        "L_ref": 0.5,
        "Pm": 1.0,
        "forcing_rule": "laminar",
    }
    field = fm3d.build_field(
        {
            "architecture": "mlp",
            "symmetry_b_sign": True,
            "mlp": {"width": 32, "depth": 1, "emb_dim": 16, "n_freq": 4},
        },
        space,
        1,
    )
    for balance in ("total", "kinetic", "magnetic"):
        loss = fm3d.FlowMatchingLoss(
            field,
            space,
            [spec],
            fixed,
            {"enabled": True, "n_cond": 2, "n_per": 4, "steps": 2, "balance": balance},
        )
        st = loss.stationarity_loss()
        field.zero_grad()
        st.backward()
        grads = [p.grad for p in field.parameters() if p.grad is not None]
        assert math.isfinite(float(st.detach())) and grads and all(torch.isfinite(g).all() for g in grads)
    with pytest.raises(ValueError):  # bilan total sans u généré
        fm3d.FlowMatchingLoss(
            field, D.FourierPotentialSpace(3, ("magnetic_field",)), [spec], fixed, {"enabled": True}
        )


# ---------------------------------------------------------------------------------------------
# Entraînement d'une époque, échantillonnage, catalogue, évaluation
# ---------------------------------------------------------------------------------------------
def test_train_one_epoch_sample_and_catalog(mff_files: list[str], tmp_path: Path) -> None:
    from milady.catalog.api import Catalog

    cfg = _small_cfg(tmp_path)
    res = fm3d.train(cfg, files=mff_files)
    assert res["finished"] and res["steps"] == 2 and res["total"] == 2  # 8 champs, lots de 4
    assert math.isfinite(res["metrics"]["loss"])
    ckpt = Path(res["checkpoint_uri"])
    assert ckpt.name == "final.pt" and ckpt.exists() and (ckpt.parent / "last.pt").exists()
    assert (ckpt.parent / "metrics.jsonl").read_text().count("\n") == 2

    cat = Catalog(cfg["catalog"]["url"])
    row = cat.get_model(res["model_id"])
    assert row["checkpoint_uri"] == str(ckpt) and row["architecture"] == "fm3d-mlp"
    assert row["constraint_mechanism"] == "vector_potential_fourier+b_sign_equivariant"
    assert cat.query_jobs(status="done") and fm3d.latest_model_id(cat, "test_fm3d") == res["model_id"]
    summary = cat.eval_summary(res["model_id"])
    metrics = {r["metric"] for r in summary}
    assert {"div_rel_u", "div_rel_b", "residu_bilan_total", "dist_energie", "err_spectre_b_log10"} <= metrics
    assert all(r["mean"] < 1e-6 for r in summary if r["metric"].startswith("div_rel"))

    model, mid = fm3d.load_model(res["model_id"], device="cpu", catalog=cat)
    assert mid == res["model_id"] and [s.name for s in model.cond_specs] == ["Re"]
    out = model.sample_fields({"Re": 28.0}, 3, seed=1, steps=4, grid=N)
    assert set(out) == {"velocity", "magnetic_field"} and out["velocity"].shape == (3, N, N, N, 3)
    for f in out.values():
        assert np.isfinite(f).all() and M.divergence_relative(f) < 1e-6
    again = model.sample_fields({"Re": 28.0}, 3, seed=1, steps=4, grid=N)
    np.testing.assert_array_equal(again["magnetic_field"], out["magnetic_field"])  # graine reproductible

    # CLI d'évaluation sur le point de contrôle (sans catalogue), rapport JSON
    rep = tmp_path / "rep.json"
    assert (
        M.main(
            [
                "--model",
                str(ckpt),
                "--params",
                "Re=30",
                "--n-samples",
                "4",
                "--steps",
                "2",
                "--no-catalog",
                "--reference",
                *mff_files,
                "--out",
                str(rep),
            ]
        )
        == 0
    )
    report = json.loads(rep.read_text())
    assert (
        report["results"][0]["point"] == {"Re": 30.0}
        and "dist_energie" not in report["results"][0]["metrics"]
    )

    # reprise : même run, 2 itérations de plus
    cfg2 = _small_cfg(tmp_path, train__iters=4)
    cfg2["eval"]["after_train"] = False
    res2 = fm3d.train(cfg2, files=mff_files, run_name=res["run_name"])
    assert res2["steps"] == 4 and res2["model_id"] == res["model_id"]


def test_train_transformer_with_stationarity(mff_files: list[str], tmp_path: Path) -> None:
    cfg = _small_cfg(tmp_path, train__iters=2)
    cfg["catalog"]["enabled"] = False
    cfg["eval"]["after_train"] = False
    cfg["model"].update(
        architecture="transformer",
        transformer={"d_model": 16, "depth": 1, "heads": 2, "modes_per_token": 8, "emb_dim": 16, "n_freq": 4},
    )
    cfg["stationarity"].update(enabled=True, n_cond=2, n_per=2, steps=2)
    res = fm3d.train(cfg, files=mff_files)
    assert res["finished"] and "loss_stationarity" in res["metrics"] and res["model_id"] is None
    model, _ = fm3d.load_model(res["checkpoint_uri"])
    assert model.field.base.n_tokens == math.ceil(61 / 8)


def test_finetune_anchor_limits_drift(mff_files: list[str], tmp_path: Path) -> None:
    """Réglage fin par perte de stationnarité : l'ancrage garde les poids près du modèle de départ."""
    base_cfg = _small_cfg(tmp_path / "base", train__iters=2)
    base_cfg["catalog"]["enabled"] = False
    base_cfg["eval"]["after_train"] = False
    base = fm3d.train(base_cfg, files=mff_files)
    ref = fm3d.load_checkpoint(base["checkpoint_uri"])["field_state"]

    def drift(anchor: float, sub: str) -> float:
        cfg = _small_cfg(tmp_path / sub, train__iters=3, train__lr=1e-2, train__init_from=base["checkpoint_uri"])
        cfg["catalog"]["enabled"] = False
        cfg["eval"]["after_train"] = False
        cfg["stationarity"].update(enabled=True, n_cond=2, n_per=2, steps=2, beta=10.0, anchor=anchor, beta_warmup=2)
        res = fm3d.train(cfg, files=mff_files)
        assert res["finished"]
        new = fm3d.load_checkpoint(res["checkpoint_uri"])["field_state"]
        return float(sum(((new[k].float() - ref[k].float()) ** 2).sum() for k in ref if ref[k].is_floating_point()))

    assert drift(1e6, "ancre") < 0.5 * drift(0.0, "libre")


def test_smoke_step() -> None:
    out = fm3d.smoke_step(torch.randn(2, 3, 12, 12, 12))
    assert math.isfinite(out["loss"]) and out["div_rel"] < 1e-6 and out["kmax"] == 4.0 and out["state_dict"]


def test_torchrun_two_cpu_processes(mff_files: list[str], tmp_path: Path) -> None:
    """``torchrun`` à 2 processus CPU (gloo, DDP) : une itération, point de contrôle final du rang 0."""
    cfg = tmp_path / "cfg.yaml"
    cfg.write_text(
        "name: ddp_test\n"
        "data: {kmax: 2, conditioning: [{name: Re, transform: log}]}\n"
        "model: {mlp: {width: 32, depth: 1, emb_dim: 16, n_freq: 4}}\n"
        "train: {iters: 1, batch_size: 2, log_every: 1, ckpt_every: 0, val_every: 0}\n"
        "eval: {after_train: false}\n",
        encoding="utf-8",
    )
    env = {
        **os.environ,
        "PYTHONPATH": os.pathsep.join([str(ROOT), os.environ.get("PYTHONPATH", "")]),
        "MILADY_MODELS_URI": str(tmp_path / "models"),
        "OMP_NUM_THREADS": "1",
    }
    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "torch.distributed.run",
            "--standalone",
            "--nnodes=1",
            "--nproc-per-node=2",
            "-m",
            "milady.train.fm3d",
            "--config",
            str(cfg),
            "--files",
            *mff_files,
            "--no-catalog",
            "--run-name",
            "ddp",
            "--device",
            "cpu",
        ],
        cwd=tmp_path,
        env=env,
        capture_output=True,
        text=True,
        timeout=300,
        check=False,
    )
    assert proc.returncode == 0, proc.stdout[-2000:] + proc.stderr[-4000:]
    result = json.loads([line for line in proc.stdout.splitlines() if line.startswith("{")][-1])
    assert result["finished"] and result["steps"] == 1
    assert "2 processus" in proc.stderr
    payload = fm3d.load_checkpoint(str(tmp_path / "models" / "ddp_test" / "ddp" / "final.pt"))
    assert payload["meta"]["world_size"] == 2 and payload["step"] == 1
