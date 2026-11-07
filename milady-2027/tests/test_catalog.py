"""Tests du catalogue : SQLite en mémoire (toujours) et PostgreSQL (si un serveur est disponible).

PostgreSQL : ``MILADY_TEST_PG_URL`` (URL d'un compte autorisé à créer des bases, ex.
``postgresql://postgres:mdp@127.0.0.1:5432/postgres``) ; à défaut ``MILADY_DB_URL`` si c'est une URL
PostgreSQL. Chaque test crée une base temporaire puis la supprime.
"""

from __future__ import annotations

import os
import re
import uuid
from collections.abc import Iterator
from pathlib import Path

import numpy as np
import pytest
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError

from milady.catalog import models
from milady.catalog.api import Catalog, normalize_url

SCHEMA_SQL = Path(__file__).resolve().parents[1] / "infra" / "db" / "schema.sql"


def _pg_admin_url() -> str | None:
    url = os.environ.get("MILADY_TEST_PG_URL") or os.environ.get("MILADY_DB_URL", "")
    return url if url.startswith(("postgresql", "postgres:")) else None


@pytest.fixture()
def pg_database() -> Iterator[str]:
    """Base PostgreSQL temporaire (URL psycopg)."""
    admin = _pg_admin_url()
    if admin is None:
        pytest.skip("pas de PostgreSQL (MILADY_TEST_PG_URL)")
    psycopg = pytest.importorskip("psycopg")
    admin = normalize_url(admin).replace("postgresql+psycopg://", "postgresql://")
    name = f"milady_test_{uuid.uuid4().hex[:10]}"
    try:
        with psycopg.connect(admin, autocommit=True, connect_timeout=5) as conn:
            conn.execute(f'CREATE DATABASE "{name}"')
    except psycopg.Error as exc:
        pytest.skip(f"PostgreSQL injoignable ou création de base refusée : {exc}")
    base = admin.rsplit("/", 1)[0]
    try:
        yield f"{base}/{name}"
    finally:
        with psycopg.connect(admin, autocommit=True) as conn:
            conn.execute(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)')


def _apply_schema_sql(url: str) -> None:
    import psycopg

    with psycopg.connect(url, autocommit=True) as conn:
        sql = SCHEMA_SQL.read_text(encoding="utf-8")
        conn.execute(sql)
        conn.execute(sql)  # idempotent


# ---------------------------------------------------------------------------------------------
# Scénario complet, joué sur chaque moteur
# ---------------------------------------------------------------------------------------------
def _workflow(cat: Catalog) -> None:
    camp = cat.create_campaign("palier2_abc3d", config_yaml="Rm: [8, 12]\n", description="ABC")
    assert cat.create_campaign("palier2_abc3d") == camp  # idempotent par nom

    sims = {}
    for rm in (8.0, 12.0, 16.0):
        sims[rm] = cat.register_simulation(
            "palier2_abc3d",
            "mhd3d_torch",
            {"Rm": rm, "Re": np.float32(50.0), "forcing": "ABC", "kinematic": True},
            {"shape": [32, 32, 32], "lengths": [6.283] * 3},
            code_version="0.1.0",
            git_commit="abc123",
            n_gpus=1,
            n_cpus=8,
        )
    s12 = sims[12.0]
    fixed = str(uuid.uuid4())
    assert cat.register_simulation(camp, "mhd3d_torch", {"Rm": 20.0}, {}, sim_id=fixed) == fixed
    assert cat.register_simulation(camp, "mhd3d_torch", {"Rm": 99.0}, {}, sim_id=fixed) == fixed  # reprise
    cat.update_simulation(fixed, status="failed", notes="NaN à t = 3")

    cat.update_simulation(s12, status="running")
    cat.update_simulation(s12, status="completed")  # synonyme de done
    sim = cat.get_simulation(s12)
    assert sim["status"] == "done" and sim["campaign"] == "palier2_abc3d"
    assert sim["started_at"].tzinfo is not None and sim["finished_at"] >= sim["started_at"]
    assert sim["wall_time_s"] is not None and sim["wall_time_s"] >= 0
    assert sim["parameters"]["Re"] == 50.0 and sim["grid"]["shape"] == [32, 32, 32]
    with pytest.raises(ValueError):
        cat.update_simulation(s12, status="exploded")
    with pytest.raises(ValueError):
        cat.update_simulation(s12, colonne_inconnue=1)
    with pytest.raises(KeyError):
        cat.update_simulation(str(uuid.uuid4()), status="done")

    # Fichiers : clé = URI ; un fichier réécrit est mis à jour.
    uri = f"s3://milady-data/palier2_abc3d/{s12}/fields.h5"
    fid = cat.register_file(s12, "fields", uri, "0" * 64, 1234, n_t=10, t_start=0.0, t_end=9.0)
    assert cat.register_file(s12, "fields", uri, "1" * 64, 2345, n_t=10, t_start=0.0, t_end=9.0) == fid
    assert cat.find_file(uri)["sha256"] == "1" * 64 and cat.find_file(uri)["size_bytes"] == 2345
    with pytest.raises(ValueError):
        cat.register_file(s12, "figure", uri + ".png", "", 0)
    fid8 = cat.register_file(sims[8.0], "fields", uri.replace(s12, sims[8.0]), "2" * 64, 10)
    fid16 = cat.register_file(sims[16.0], "fields", uri.replace(s12, sims[16.0]), "3" * 64, 10)

    # Diagnostics : remplacement à t égal, NaN → NULL.
    t = np.linspace(0, 9, 10)
    assert cat.add_diagnostics(s12, "magnetic_energy", t, np.exp(0.1 * t)) == 10
    cat.add_diagnostics(s12, "magnetic_energy", [9.0, 10.0], [42.0, float("nan")])
    tt, vv = cat.get_diagnostics(s12, "magnetic_energy")["magnetic_energy"]
    assert len(tt) == 11 and vv[9] == 42.0 and np.isnan(vv[10])

    # Requêtes par paramètres.
    assert {s["id"] for s in cat.query_simulations(campaign="palier2_abc3d", Rm__ge=12)} == {
        s12,
        sims[16.0],
        fixed,
    }
    assert [s["id"] for s in cat.query_simulations(status="done", Rm=12.0)] == [s12]
    assert len(cat.query_simulations(Rm__in=[8, 16])) == 2
    assert len(cat.query_simulations(forcing="ABC", kinematic=True)) == 3
    assert len(cat.query_simulations(Rm__lt=10, forcing="TG")) == 0
    assert cat.query_simulations(status="failed")[0]["notes"] == "NaN à t = 3"
    assert cat.query_simulations(campaign=camp, Rm=12.0)[0]["files"][0]["uri"] == uri
    with pytest.raises(KeyError):
        cat.query_simulations(campaign="inconnue")

    # Jeu de données figé.
    members = [(fid8, "train"), (fid16, "train"), (fid, "test")]
    ds = cat.register_dataset("abc3d_32", "1.0", members, description="palier 2")
    assert cat.register_dataset("abc3d_32", "1.0", list(reversed(members))) == ds
    with pytest.raises(ValueError):
        cat.register_dataset("abc3d_32", "1.0", members[:2])
    with pytest.raises(ValueError):
        cat.register_dataset("abc3d_32", "2.0", [(fid, "holdout")])
    assert {r["split"] for r in cat.dataset_files("abc3d_32")} == {"train", "test"}
    assert len(cat.dataset_files("abc3d_32", "1.0", split="train")) == 2

    # Modèles et évaluations ; vue v_eval_summary.
    m1 = cat.register_model(
        "fm3d",
        "unet3d",
        "vector_potential",
        {"lr": 2e-4, "width": np.int64(64)},
        dataset_id=ds,
        mlflow_run_id="run-1",
        git_commit="abc123",
    )
    m2 = cat.register_model("fm3d", "unet3d", "free", {"lr": 2e-4}, dataset_id=ds)
    cat.update_model(m1, checkpoint_uri="s3://milady-models/fm3d/run-1/last.pt")
    assert cat.get_model(m1)["checkpoint_uri"].endswith("last.pt")
    for seed, v in enumerate([0.10, 0.12, 0.14]):
        cat.add_evaluation(
            m1, {"Rm": 12.0, "Re": 50.0}, "energy_distance", v, 256, seed, details={"steps": 50}
        )
    cat.add_evaluation(m1, {"Re": 50.0, "Rm": 12.0}, "div_rel", 1e-7, 256, 0)  # ordre des clés indifférent
    cat.add_evaluation(m1, {"Rm": 14.0, "Re": 50.0}, "energy_distance", 0.3, 256, 0)
    cat.add_evaluation(m2, {"Rm": 12.0, "Re": 50.0}, "div_rel", 0.2, 256, 0)
    rows = cat.eval_summary(m1)
    ed12 = [r for r in rows if r["metric"] == "energy_distance" and r["parameters"]["Rm"] == 12.0]
    assert len(rows) == 3 and len(ed12) == 1
    assert ed12[0]["n_runs"] == 3 and ed12[0]["n_samples_total"] == 768
    assert ed12[0]["mean"] == pytest.approx(0.12) and ed12[0]["std"] == pytest.approx(0.02)
    single = [r for r in rows if r["parameters"]["Rm"] == 14.0][0]
    assert single["std"] is None and single["model_name"] == "fm3d"
    assert len(cat.eval_summary()) == 4

    # Tâches.
    job = cat.register_job("simulation", "slurm", "123456_7", simulation_id=s12)
    cat.update_job(job, status="running")
    cat.update_job(job, status="done", log_uri="file:///scratch/logs/123456_7.out")
    j = cat.get_job(job)
    assert j["status"] == "done" and j["started_at"] <= j["finished_at"]
    assert cat.query_jobs(scheduler="slurm", external_id="123456_7")[0]["id"] == job
    with pytest.raises(ValueError):
        cat.register_job("train", "kubernetes")
    with pytest.raises(ValueError):
        cat.register_job("eval", "local", simulation_id=s12, model_id=m1)
    tj = cat.register_job("train", "docker", model_id=m1, status="running")
    assert cat.get_job(tj)["started_at"] is not None

    counts = {c["name"]: c["counts"] for c in cat.list_campaigns()}
    assert counts["palier2_abc3d"] == {"queued": 2, "done": 1, "failed": 1}


def test_sqlite_memory_workflow() -> None:
    cat = Catalog("sqlite://")
    _workflow(cat)
    cat.close()


def test_sqlite_file_default_url(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MILADY_DB_URL", raising=False)
    monkeypatch.setenv("MILADY_ROOT", str(tmp_path))
    cat = Catalog()
    assert cat.url == f"sqlite:///{tmp_path / 'data' / 'catalog.sqlite'}"
    camp = cat.create_campaign("c")
    cat.close()
    cat2 = Catalog()  # réouverture : rien n'est recréé ni perdu
    assert cat2.create_campaign("c") == camp
    monkeypatch.setenv("MILADY_DB_URL", f"sqlite:///{tmp_path / 'autre.sqlite'}")
    assert Catalog().url.endswith("autre.sqlite")


def test_sqlite_constraints_enforced() -> None:
    """Les CHECK et clés étrangères tiennent même si l'on contourne l'API."""
    cat = Catalog("sqlite://")
    camp = cat.create_campaign("c")
    sim = cat.register_simulation(camp, "x", {}, {})
    with cat.engine.begin() as conn, pytest.raises(IntegrityError):
        conn.execute(text("UPDATE simulation SET status = 'bizarre' WHERE id = :i"), {"i": sim})
    with cat.engine.begin() as conn, pytest.raises(IntegrityError):
        conn.execute(
            text(
                "INSERT INTO file (id, simulation_id, kind, uri, format_version, size_bytes, sha256, "
                "created_at) VALUES ('a', :s, 'image', 'u', '1.0', 0, '', '2026-01-01')"
            ),
            {"s": sim},
        )
    with cat.engine.begin() as conn, pytest.raises(IntegrityError):
        conn.execute(
            text("INSERT INTO diagnostic (simulation_id, name, t, value) VALUES ('absent', 'e', 0, 1)")
        )


def test_ingest_mff(tmp_path: Path) -> None:
    from milady.data import write_mff

    sim_id = str(uuid.uuid4())
    x = np.linspace(0, 2 * np.pi, 8, endpoint=False)
    path = tmp_path / "f.h5"
    sha = write_mff(
        path,
        {"magnetic_field": np.ones((2, 4, 8, 8, 8, 3))},
        {"time": np.arange(4.0), "x": x, "y": x, "z": x},
        {"Rm": 9.0, "forcing": "TG"},
        meta={"code": "mhd3d_torch", "uuid": sim_id},
        diagnostics={"magnetic_energy": np.ones((2, 4)) * [[1.0], [3.0]]},
    )
    cat = Catalog("sqlite://")
    out = cat.ingest_mff(str(path), campaign="hpc")
    assert out["simulation_id"] == sim_id
    assert cat.ingest_mff(path.as_uri(), campaign="hpc")["simulation_id"] == sim_id  # même simulation
    sim = cat.get_simulation(sim_id)
    assert sim["status"] == "done" and sim["parameters"] == {"Rm": 9.0, "forcing": "TG"}
    assert sim["grid"]["shape"] == [8, 8, 8] and sim["grid"]["bc"] == ["periodic"]
    assert {f["sha256"] for f in sim["files"]} == {sha} and sim["files"][0]["n_t"] == 4
    _, v = cat.get_diagnostics(sim_id)["magnetic_energy"]
    np.testing.assert_allclose(v, 2.0)  # moyenne sur les trajectoires


def test_cli(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    from milady.catalog.__main__ import main

    url = f"sqlite:///{tmp_path / 'c.sqlite'}"
    assert main(["--url", url, "init"]) == 0
    cat = Catalog(url)
    camp = cat.create_campaign("cli")
    cat.register_simulation(camp, "x", {"Rm": 3.0}, {})
    capsys.readouterr()
    assert main(["--url", url, "sims", "--campaign", "cli", "--param", "Rm__gt=2"]) == 0
    assert '"Rm": 3.0' in capsys.readouterr().out


# ---------------------------------------------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------------------------------------------
@pytest.mark.postgres
def test_postgres_schema_sql_workflow(pg_database: str) -> None:
    """Base créée par infra/db/schema.sql (comme le docker-compose), puis API complète."""
    _apply_schema_sql(pg_database)
    cat = Catalog(pg_database)
    _workflow(cat)
    with cat.engine.connect() as conn:  # index GIN et requête JSONB native
        assert "ix_simulation_parameters" in {i["name"] for i in inspect(conn).get_indexes("simulation")}
        n = conn.execute(
            text("""SELECT count(*) FROM simulation WHERE parameters @> '{"forcing": "ABC"}'""")
        ).scalar()
        assert n == 3
    cat.close()


@pytest.mark.postgres
def test_postgres_create_all_workflow(pg_database: str) -> None:
    """Base vide : le schéma est créé par SQLAlchemy (create_all + vue)."""
    cat = Catalog(pg_database)
    _workflow(cat)
    cat.close()


def _columns(conn, table: str) -> dict[str, tuple[str, bool, str | None]]:
    return {
        c["name"]: (str(c["type"]).split("(")[0].upper(), bool(c["nullable"]), c.get("default"))
        for c in inspect(conn).get_columns(table)
    }


@pytest.mark.postgres
def test_schema_sql_matches_models(pg_database: str) -> None:
    """schema.sql et models.py décrivent exactement les mêmes colonnes, contraintes, index et vue."""
    import psycopg
    from sqlalchemy import create_engine

    _apply_schema_sql(pg_database)
    other = pg_database.rsplit("/", 1)[0] + "/" + pg_database.rsplit("/", 1)[1] + "_orm"
    admin = pg_database.rsplit("/", 1)[0] + "/postgres"
    with psycopg.connect(admin, autocommit=True) as conn:
        conn.execute(f'CREATE DATABASE "{other.rsplit("/", 1)[1]}"')
    try:
        Catalog(other).close()
        e1, e2 = create_engine(normalize_url(pg_database)), create_engine(normalize_url(other))
        with e1.connect() as c1, e2.connect() as c2:
            i1, i2 = inspect(c1), inspect(c2)
            assert set(i1.get_table_names()) == set(i2.get_table_names()) == set(models.Base.metadata.tables)
            assert i1.get_view_names() == i2.get_view_names() == ["v_eval_summary"]
            for table in models.Base.metadata.tables:
                assert _columns(c1, table) == _columns(c2, table), table
                assert {
                    c["name"]: re.sub(r"\s+", " ", c["sqltext"]) for c in i1.get_check_constraints(table)
                } == {
                    c["name"]: re.sub(r"\s+", " ", c["sqltext"]) for c in i2.get_check_constraints(table)
                }, table
                assert {i["name"] for i in i1.get_indexes(table)} == {
                    i["name"] for i in i2.get_indexes(table)
                }, table
                assert sorted(
                    str(fk["referred_table"]) + str(fk["options"]) for fk in i1.get_foreign_keys(table)
                ) == sorted(
                    str(fk["referred_table"]) + str(fk["options"]) for fk in i2.get_foreign_keys(table)
                ), table
            query = text(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'v_eval_summary' "
                "ORDER BY ordinal_position"
            )
            assert [r[0] for r in c1.execute(query)] == [r[0] for r in c2.execute(query)]
        e1.dispose()
        e2.dispose()
    finally:
        with psycopg.connect(admin, autocommit=True) as conn:
            conn.execute(f'DROP DATABASE IF EXISTS "{other.rsplit("/", 1)[1]}" WITH (FORCE)')
