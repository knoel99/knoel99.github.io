"""Tests du solveur MHD 3D (milady.sim.mhd3d), de l'exécution d'une simulation (milady.sim.run) et des
campagnes (milady.sweep).

1. ∇·u et ∇·B à la précision machine (float64) ;
2. bilan d'énergie dE/dt = injection − dissipation (à 1 % près ; mesuré ≈ 1e-5) et conservation
   exacte des invariants idéaux par les termes non linéaires tronqués ;
3. dynamo cinématique ABC à 16³ : λ < 0 à Rm = 6 et λ > 0 à Rm = 12 (seuil ≈ 8,9, voir E3) ;
4. reprise depuis un point de contrôle (solveur, puis simulation de campagne interrompue) ;
5. campagne : --dry-run, petite campagne locale (2 simulations 16³) jusqu'au catalogue SQLite et
   au stockage file://, tableau Slurm (sbatch simulé) ; campagne 2D (solveur des expériences).

Tous les tests tournent sur CPU en quelques secondes chacun.
"""

from __future__ import annotations

import json
import math
import os
import stat
import textwrap
from pathlib import Path

import numpy as np
import pytest
import torch

from milady.sim.mhd3d import MHD3D, MHD3DConfig, growth_rate_fit, smoke_run

torch.set_num_threads(min(2, os.cpu_count() or 1))


def _budget_run(cfg: MHD3DConfig, n_steps: int, dt: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    sim = MHD3D(cfg)
    E, inj, diss = [], [], []
    for _ in range(n_steps):
        d = sim.diagnostics()
        E.append(d["kinetic_energy"] + d["magnetic_energy"])
        inj.append(d["injection"])
        diss.append(d["kinetic_dissipation"] + d["magnetic_dissipation"])
        sim.step(dt)
    return np.array(E), np.array(inj), np.array(diss)


# =============================================================================================
# 1. Divergence
# =============================================================================================
@pytest.mark.parametrize("forcing", ["random", "tg"])
def test_divergence_machine_precision(forcing: str) -> None:
    cfg = MHD3DConfig(
        n=16,
        mode="dynamic",
        nu=0.02,
        eta=0.02,
        forcing=forcing,
        kf=1,
        eps=0.5,
        kf_band=(1.0, 3.0),
        u0="random",
        u0_amp=1.0,
        b0_amp=0.3,
        n_traj=2,
        seed=3,
    )
    sim = MHD3D(cfg)
    for _ in range(4):
        sim.advance_to(sim.t + 0.1, dt=0.01)
    d = sim.diagnostics()
    # Échelle : |∇u| ~ k_max u_rms ; précision machine float64 ~ 1e-16.
    scale_u = float(np.max(d["u_rms"])) * sim.kmax_norm
    scale_b = float(np.max(d["b_rms"])) * sim.kmax_norm
    assert np.all(d["max_div_u"] < 1e-12 * scale_u), d["max_div_u"]
    assert np.all(d["max_div_b"] < 1e-12 * scale_b), d["max_div_b"]


def test_divergence_without_projection_and_float32() -> None:
    # Forme en rotationnel : ∇·(∇×E) = 0 mode par mode, même sans projection de B.
    cfg = MHD3DConfig(n=16, mode="kinematic", flow="tg", kf=1, eta=0.1, b0_amp=1.0, project_every=0, seed=1)
    sim = MHD3D(cfg)
    sim.advance_to(2.0, dt=0.05)
    assert sim.diagnostics()["max_div_b"][0] < 1e-12
    # float32 : précision ~1e-7 relative.
    sim32 = MHD3D(
        MHD3DConfig(
            n=16,
            mode="dynamic",
            nu=0.05,
            eta=0.05,
            forcing="abc",
            b0_amp=0.5,
            u0="random",
            dtype="float32",
            seed=2,
        )
    )
    sim32.advance_to(0.5, dt=0.02)
    d = sim32.diagnostics()
    assert d["max_div_b"][0] < 1e-5 * d["b_rms"][0] * sim32.kmax_norm
    assert d["max_div_u"][0] < 1e-5 * d["u_rms"][0] * sim32.kmax_norm


# =============================================================================================
# 2. Bilan d'énergie
# =============================================================================================
@pytest.mark.parametrize("forcing,kf", [("tg", 1), ("abc", 2)])
def test_energy_budget(forcing: str, kf: int) -> None:
    dt = 5e-3
    cfg = MHD3DConfig(
        n=16,
        mode="dynamic",
        nu=0.05,
        eta=0.08,
        forcing=forcing,
        kf=kf,
        forcing_amp=0.5,
        u0="random",
        u0_amp=1.0,
        b0_amp=0.5,
        seed=1,
    )
    E, inj, diss = _budget_run(cfg, 60, dt)
    dEdt = (E[2:] - E[:-2]) / (2 * dt)  # différences centrées, erreur O(dt²)
    rhs = (inj - diss)[1:-1]
    rel = np.abs(dEdt - rhs) / np.maximum(np.abs(rhs), 1e-12)
    assert np.all(np.abs(rhs) > 0.05), "régime transitoire attendu (dE/dt non nul)"
    assert rel.max() < 0.01, rel.max()
    # Écart à l'échelle des termes du bilan : bien meilleur que 1 %.
    assert (np.abs(dEdt - rhs) / np.maximum(inj, diss)[1:-1]).max() < 1e-3


def test_ideal_invariants_conserved() -> None:
    """ν = η = 0, sans forçage : énergie, hélicité croisée et hélicité magnétique conservées (Galerkin 2/3)."""
    cfg = MHD3DConfig(
        n=16, mode="dynamic", nu=1e-12, eta=0.0, forcing="none", u0="random", u0_amp=1.0, b0_amp=0.7, seed=4
    )
    sim = MHD3D(cfg)
    d0 = sim.diagnostics()
    sim.advance_to(0.2, dt=2e-3)
    d1 = sim.diagnostics()
    e0 = d0["kinetic_energy"] + d0["magnetic_energy"]
    e1 = d1["kinetic_energy"] + d1["magnetic_energy"]
    assert abs(e1 - e0) / e0 < 1e-8
    assert abs(d1["cross_helicity"] - d0["cross_helicity"]) < 1e-8 * e0
    assert abs(d1["magnetic_helicity"] - d0["magnetic_helicity"]) < 1e-8 * e0
    # Échange réel d'énergie entre u et B (la dynamique n'est pas triviale).
    assert abs(d1["magnetic_energy"] - d0["magnetic_energy"]) > 1e-4 * e0


def test_random_forcing_injection() -> None:
    """Forçage blanc : la part d'Itô de l'injection vaut ε ; la puissance moyenne réalisée en est proche."""
    cfg = MHD3DConfig(
        n=16,
        mode="dynamic",
        nu=0.05,
        eta=0.05,
        forcing="random",
        eps=0.2,
        kf_band=(1.0, 2.5),
        u0="zero",
        b0_amp=0.1,
        n_traj=4,
        seed=5,
    )
    sim = MHD3D(cfg)
    sim.diagnostics()  # remise à zéro du cumul
    sim.advance_to(0.05, dt=1e-3)  # u ≈ 0 : ⟨u·Δu⟩ ≈ 0, l'injection est ≈ ε
    inj = sim.diagnostics()["injection"]
    assert np.all(np.abs(inj - 0.2) < 0.05), inj


# =============================================================================================
# 3. Dynamo cinématique ABC
# =============================================================================================
def _abc_growth(rm: float, n: int = 16, t_total: float = 60.0) -> float:
    sim = MHD3D(MHD3DConfig(n=n, mode="kinematic", flow="abc", eta=1.0 / rm, b0_amp=1.0, seed=0))
    ts, logs = [], []
    while sim.t < t_total - 1e-9:
        sim.advance_to(sim.t + 1.0, dt=0.05)
        ts.append(sim.t)
        logs.append(float(sim.diagnostics()["log_b_rms"][0]))
    return growth_rate_fit(ts, logs, t_min=t_total / 2)


def test_kinematic_abc_threshold() -> None:
    lam6, lam12 = _abc_growth(6.0), _abc_growth(12.0)
    # Repères E3 (32³) : λ(6) ≈ −0,046, λ(12) ≈ +0,0077 ; seuil ≈ 8,9.
    assert lam6 < -0.01, lam6
    assert lam12 > 0.002, lam12


# =============================================================================================
# 4. Point de contrôle et reprise
# =============================================================================================
@pytest.mark.parametrize("mode", ["dynamic", "kinematic"])
def test_checkpoint_restart_bitwise(tmp_path: Path, mode: str) -> None:
    cfg = MHD3DConfig(
        n=16,
        mode=mode,
        nu=0.03,
        eta=0.04,
        forcing="random",
        eps=0.3,
        flow="abc",
        u0="random",
        b0_amp=0.2,
        n_traj=2,
        seed=11,
        renorm_every=3,
    )
    ref = MHD3D(cfg)
    for _ in range(14):
        ref.step(0.01)
    a = MHD3D(cfg)
    for _ in range(7):
        a.step(0.01)
    path = a.save_checkpoint(tmp_path / "ck.npz", extra={"note": np.arange(3)}, extra_meta={"k": 1})
    del a
    b, extra, extra_meta = MHD3D.load_checkpoint(path)
    assert extra_meta == {"k": 1} and np.array_equal(extra["note"], np.arange(3))
    for _ in range(7):
        b.step(0.01)
    assert b.step_count == ref.step_count and math.isclose(b.t, ref.t)
    assert torch.equal(b.bh, ref.bh)
    if mode == "dynamic":
        assert torch.equal(b.uh, ref.uh)
    np.testing.assert_array_equal(b.log_b, ref.log_b)


def _write_campaign(path: Path, name: str, extra_runtime: str = "", sweep: str = "Rm: [6, 12]") -> Path:
    path.write_text(
        textwrap.dedent(f"""\
        name: {name}
        description: campagne de test
        code: mhd3d_torch
        grid: {{N: 16, domain: 2pi}}
        fixed: {{mode: kinematic, flow: abc}}
        sweep:
          {sweep}
        runtime: {{dt: 0.05, t_burn: 0.5, t_keep: 1.0, every: 0.25, diag_every: 0.25, n_traj: 2,
                   dtype: float64, device: cpu, checkpoint_every_s: 0{extra_runtime}}}
        resources: {{gpus: 0, cpus: 1, time: "00:10:00"}}
        output: {{format: mff, uri: "${{MILADY_STORAGE_URI}}", spectral: true}}
        """),
        encoding="utf-8",
    )
    return path


@pytest.fixture()
def milady_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> dict[str, Path]:
    """Catalogue SQLite, stockage file:// et dossiers de travail temporaires."""
    paths = {
        "db": tmp_path / "catalog.sqlite",
        "store": tmp_path / "store",
        "work": tmp_path / "work",
        "sweeps": tmp_path / "sweeps",
    }
    monkeypatch.setenv("MILADY_DB_URL", f"sqlite:///{paths['db']}")
    monkeypatch.setenv("MILADY_STORAGE_URI", paths["store"].as_uri())
    monkeypatch.setenv("MILADY_WORKDIR", str(paths["work"]))
    monkeypatch.setenv("MILADY_SWEEP_DIR", str(paths["sweeps"]))
    monkeypatch.setenv("OMP_NUM_THREADS", "1")
    for var in (
        "MILADY_JOB_ID",
        "SLURM_JOB_ID",
        "SLURM_ARRAY_JOB_ID",
        "SLURM_ARRAY_TASK_ID",
        "MILADY_SCHEDULER",
    ):
        monkeypatch.delenv(var, raising=False)
    return paths


def test_run_resume_after_interruption(
    tmp_path: Path, milady_env: dict[str, Path], monkeypatch: pytest.MonkeyPatch
) -> None:
    from milady.catalog.api import Catalog
    from milady.data.format import read_mff
    from milady.sim import run as simrun

    cfg = _write_campaign(tmp_path / "c.yaml", "test_resume")
    # Référence sans interruption (autre stockage, sans catalogue).
    monkeypatch.setenv("MILADY_STORAGE_URI", (tmp_path / "ref").as_uri())
    ref = simrun.run_simulation(cfg, 1, use_catalog=False)
    monkeypatch.setenv("MILADY_STORAGE_URI", milady_env["store"].as_uri())

    # Interruption simulée (comme un SIGTERM de fin de temps Slurm) à t = 1.
    original = simrun.Solver3D.advance_to

    def interrupted(self: simrun.Solver3D, t: float, dt: float) -> None:
        if t > 1.0 + 1e-9:
            raise simrun.Interrupted("signal SIGTERM (simulé)")
        original(self, t, dt)

    monkeypatch.setattr(simrun.Solver3D, "advance_to", interrupted)
    with pytest.raises(simrun.Interrupted):
        simrun.run_simulation(cfg, 1)
    ck = milady_env["work"] / "test_resume" / ref["sim_id"] / "checkpoint.npz"
    assert ck.is_file()
    cat = Catalog()
    sim = cat.query_simulations(campaign="test_resume")[0]
    assert sim["status"] == "failed" and json.loads(sim["notes"])["interrupted"] is True

    monkeypatch.setattr(simrun.Solver3D, "advance_to", original)
    out = simrun.run_simulation(cfg, 1)
    assert out["sim_id"] == ref["sim_id"]
    a, b = read_mff(out["uri"]), read_mff(ref["uri"])
    for name in ("velocity", "magnetic_field"):
        np.testing.assert_array_equal(a["fields"][name], b["fields"][name])
    np.testing.assert_allclose(a["diagnostics"]["log_b_rms"], b["diagnostics"]["log_b_rms"], rtol=0, atol=0)
    sim = cat.query_simulations(campaign="test_resume")[0]
    assert sim["status"] == "done" and not ck.exists()


# =============================================================================================
# 5. Campagnes
# =============================================================================================
def test_shipped_campaigns_expand() -> None:
    from milady.sweep import load_campaign, sweep_points

    root = Path(__file__).resolve().parents[1] / "infra" / "configs"
    expected = {"palier1_mhd2d": 11, "palier2_abc3d": 37, "palier2_tg3d": 12}
    for name, n in expected.items():
        camp = load_campaign(root / f"{name}.yaml")
        pts = sweep_points(camp)
        assert len(pts) == n
        assert len({p.sim_id for p in pts}) == n
        assert [p.sim_id for p in sweep_points(load_campaign(root / f"{name}.yaml"))] == [
            p.sim_id for p in pts
        ]
    tg = sweep_points(load_campaign(root / "palier2_tg3d.yaml"))
    p = tg[-1].params  # Re = 200, Pm = 2
    assert (
        math.isclose(p["Rm"], 400.0)
        and math.isclose(p["nu"], 0.5 / 200)
        and math.isclose(p["eta"], 0.5 / 400)
    )
    abc = sweep_points(load_campaign(root / "palier2_abc3d.yaml"))
    assert math.isclose(abc[2].params["eta"], 1 / 6)  # Rm = 6 : η = 1/Rm (convention E3)


def test_sweep_dry_run(
    tmp_path: Path, milady_env: dict[str, Path], capsys: pytest.CaptureFixture[str]
) -> None:
    from milady.sweep import main

    cfg = _write_campaign(tmp_path / "c.yaml", "test_dry")
    assert main([str(cfg), "--scheduler", "local", "--dry-run"]) == 0
    out = capsys.readouterr().out
    assert out.count("milady.sim.run") == 2 and "Rm=6" in out and "Rm=12" in out
    assert main([str(cfg), "--scheduler", "slurm", "--dry-run", "--max-parallel", "4"]) == 0
    out = capsys.readouterr().out
    assert "#SBATCH --array=0-1%4" in out and "#SBATCH --time=00:10:00" in out and "--gres" not in out
    assert not milady_env["db"].exists() and not milady_env["store"].exists()


def test_sweep_local_to_catalog_and_storage(
    tmp_path: Path, milady_env: dict[str, Path], capsys: pytest.CaptureFixture[str]
) -> None:
    from milady import storage
    from milady.catalog.api import Catalog
    from milady.data.format import read_mff, validate
    from milady.sweep import main

    cfg = _write_campaign(tmp_path / "c.yaml", "test_local")
    assert main([str(cfg), "--scheduler", "local", "--max-parallel", "2"]) == 0
    cat = Catalog()
    sims = cat.query_simulations(campaign="test_local")
    assert len(sims) == 2 and {s["status"] for s in sims} == {"done"}
    assert sorted(s["parameters"]["Rm"] for s in sims) == [6.0, 12.0]
    for s in sims:
        assert s["wall_time_s"] and s["wall_time_s"] > 0
        (f,) = s["files"]
        assert f["kind"] == "fields" and f["uri"].startswith(milady_env["store"].as_uri())
        assert storage.exists(f["uri"]) and storage.sha256(f["uri"]) == f["sha256"]
        assert f["size_bytes"] == storage.size(f["uri"]) and f["n_t"] == 4
        assert validate(f["uri"]) == []
        data = read_mff(f["uri"])
        assert data["fields"]["magnetic_field"].shape == (2, 4, 16, 16, 16, 3)
        assert data["meta"]["uuid"] == s["id"]
        diag = cat.get_diagnostics(s["id"])
        assert {"kinetic_energy", "magnetic_energy", "max_div_b", "growth_rate_fit"} <= set(diag)
        assert np.max(diag["max_div_b"][1]) < 1e-12
    jobs = [j for j in cat.query_jobs(scheduler="local") if j["simulation_id"] in {s["id"] for s in sims}]
    assert len(jobs) == 2 and {j["status"] for j in jobs} == {"done"} and all(j["log_uri"] for j in jobs)
    # Relance : idempotente (tout est fait).
    capsys.readouterr()
    assert main([str(cfg), "--scheduler", "local"]) == 0
    assert "rien à exécuter" in capsys.readouterr().out
    assert len(cat.query_jobs(scheduler="local")) == 2


def test_sweep_slurm_with_fake_sbatch(
    tmp_path: Path, milady_env: dict[str, Path], monkeypatch: pytest.MonkeyPatch
) -> None:
    from milady.catalog.api import Catalog
    from milady.sim.run import run_simulation
    from milady.sweep import main

    bindir = tmp_path / "bin"
    bindir.mkdir()
    record = tmp_path / "sbatch_args.txt"
    fake = bindir / "sbatch"
    fake.write_text(f'#!/bin/bash\nset -euo pipefail\necho "$@" > {record}\necho 4242\n', encoding="utf-8")
    fake.chmod(fake.stat().st_mode | stat.S_IEXEC)
    monkeypatch.setenv("PATH", f"{bindir}{os.pathsep}{os.environ['PATH']}")
    cfg = _write_campaign(tmp_path / "c.yaml", "test_slurm")
    assert main([str(cfg), "--scheduler", "slurm", "--max-parallel", "1"]) == 0
    args = record.read_text().split()
    script = Path(args[1])
    assert args[0] == "--parsable" and script.is_file()
    text = script.read_text()
    assert "#SBATCH --array=0-1%1" in text and "milady.sim.run" in text and "--gres" not in text
    frozen = Path(args[2]) if Path(args[2]).is_absolute() else None
    assert frozen is None or frozen.is_file()
    cat = Catalog()
    jobs = {j["external_id"]: j for j in cat.query_jobs(scheduler="slurm")}
    assert set(jobs) == {"4242_0", "4242_1"} and {j["status"] for j in jobs.values()} == {"submitted"}
    # Exécution de l'élément 0 du tableau, comme sur un nœud de calcul.
    monkeypatch.setenv("SLURM_JOB_ID", "4243")
    monkeypatch.setenv("SLURM_ARRAY_JOB_ID", "4242")
    monkeypatch.setenv("SLURM_ARRAY_TASK_ID", "0")
    out = run_simulation(cfg, 0)
    job = {j["external_id"]: j for j in cat.query_jobs(scheduler="slurm")}["4242_0"]
    assert job["status"] == "done" and job["simulation_id"] == out["sim_id"]


def test_campaign_2d_experiences_solver(tmp_path: Path, milady_env: dict[str, Path]) -> None:
    from milady.catalog.api import Catalog
    from milady.data.format import read_mff, validate
    from milady.sim.run import run_simulation

    cfg = tmp_path / "c2d.yaml"
    cfg.write_text(
        textwrap.dedent("""\
        name: test_2d
        code: mhd2d_numpy
        grid: {N: 16, domain: 2pi}
        fixed: {nu: 8.0e-3, alpha: 0.02, kf_min: 2.0, kf_max: 3.0, eps_u: 0.05, eps_b: 0.05}
        sweep: {eta: [4.0e-3, 1.6e-2]}
        runtime: {dt: 0.01, t_burn: 0.1, t_keep: 0.1, every: 0.05, n_traj: 3, checkpoint_every_s: 0}
        resources: {gpus: 0, cpus: 1}
        output: {uri: "${MILADY_STORAGE_URI}"}
        """),
        encoding="utf-8",
    )
    out = run_simulation(cfg, 1)
    assert validate(out["uri"]) == []
    d = read_mff(out["uri"])
    assert d["fields"]["velocity"].shape == (3, 2, 16, 16, 2)
    assert math.isclose(d["params"]["Pm"], 0.5) and d["meta"]["code"] == "mhd2d_numpy"
    assert np.max(d["diagnostics"]["max_div_b"]) < 1e-12
    assert Catalog().query_simulations(campaign="test_2d", status="done")[0]["id"] == out["sim_id"]


def test_smoke_run_writes_valid_mff(tmp_path: Path) -> None:
    from milady.data.format import validate, write_mff

    out = smoke_run(n=16, n_t=3, device="cpu")
    path = tmp_path / "smoke.h5"
    write_mff(
        path,
        out["fields"],
        out["coords"],
        out["params"],
        meta={"code": out["code"]},
        diagnostics=out["diagnostics"],
    )
    assert validate(path) == []


def test_sweep_docker_with_fake_compose(
    tmp_path: Path, milady_env: dict[str, Path], monkeypatch: pytest.MonkeyPatch
) -> None:
    """Ordonnanceur docker : enregistrement dans un « conteneur », puis une simulation par conteneur.

    ``docker compose`` est remplacé (MILADY_COMPOSE) par un script qui exécute la commande du conteneur
    sur place, avec ses options ``-e`` : on vérifie toute la chaîne de pilotage sans image Docker.
    """
    import sys

    from milady.catalog.api import Catalog
    from milady.sweep import main

    fake = tmp_path / "fake-compose"
    fake.write_text(
        textwrap.dedent(f"""\
        #!/bin/bash
        # Simule « docker compose run --rm -T [-e K=V]… SERVICE CMD… » en exécutant CMD sur place.
        set -euo pipefail
        [ "$1" = run ] || {{ echo "attendu : run" >&2; exit 2; }}
        shift
        envs=()
        while [ $# -gt 0 ]; do
          case "$1" in
            --rm|-T) shift ;;
            -e) envs+=("$2"); shift 2 ;;
            *) break ;;
          esac
        done
        shift                      # nom du service (worker)
        [ "$1" = python ] && shift
        exec env "${{envs[@]}}" {sys.executable} "$@"
        """),
        encoding="utf-8",
    )
    fake.chmod(fake.stat().st_mode | stat.S_IEXEC)
    monkeypatch.setenv("MILADY_COMPOSE", str(fake))
    monkeypatch.setenv("MILADY_WORKER", "worker")
    cfg = _write_campaign(tmp_path / "c.yaml", "test_docker")
    assert main([str(cfg), "--scheduler", "docker", "--indices", "1"]) == 0
    cat = Catalog()
    sims = {s["parameters"]["Rm"]: s for s in cat.query_simulations(campaign="test_docker")}
    assert sims[12.0]["status"] == "done" and sims[12.0]["files"]
    assert 6.0 not in sims  # indice 0 non retenu : ni enregistré ni exécuté
    jobs = cat.query_jobs(scheduler="docker")
    assert len(jobs) == 1 and jobs[0]["status"] == "done" and jobs[0]["simulation_id"] == sims[12.0]["id"]
