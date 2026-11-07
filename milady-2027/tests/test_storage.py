"""Tests du stockage : ``file://`` et chemins locaux (toujours), ``s3://`` sur un serveur compatible S3.

Serveur S3 de test, par ordre de préférence :

1. ``MILADY_TEST_S3_ENDPOINT`` (+ ``AWS_ACCESS_KEY_ID`` / ``AWS_SECRET_ACCESS_KEY``), ex. le MinIO du compose ;
2. un conteneur MinIO lancé par le test (``docker run <image> server /data``) si Docker est disponible ;
   image : ``MILADY_TEST_MINIO_IMAGE`` ou ``MINIO_IMAGE``, défaut celle du docker-compose (``minio/minio``
   n'est plus téléchargeable : fork communautaire ``pgsty/minio``) ;
3. un serveur ``moto`` en mémoire si le paquet est installé ;
sinon les tests S3 sont ignorés (skip).
"""

from __future__ import annotations

import os
import shutil
import socket
import subprocess
import time
import uuid
from collections.abc import Iterator
from pathlib import Path

import numpy as np
import pytest

from milady import storage

#: Image MinIO par défaut (même que infra/docker/docker-compose.yml).
MINIO_IMAGE = "pgsty/minio:RELEASE.2026-08-04T00-00-00Z"


# ---------------------------------------------------------------------------------------------
# Local
# ---------------------------------------------------------------------------------------------
def test_base_uri_and_join(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MILADY_STORAGE_URI", raising=False)
    monkeypatch.setenv("MILADY_ROOT", str(tmp_path))
    assert storage.base_uri() == (tmp_path / "data" / "store").as_uri()
    monkeypatch.setenv("SCRATCH", str(tmp_path / "scratch"))
    monkeypatch.setenv("MILADY_STORAGE_URI", "$SCRATCH/milady")  # convention HPC
    assert storage.base_uri() == (tmp_path / "scratch" / "milady").as_uri()
    monkeypatch.setenv("MILADY_STORAGE_URI", "s3://milady-data/")
    assert storage.base_uri() == "s3://milady-data"
    assert (
        storage.join("s3://milady-data", "/camp/", "id", "fields.h5") == "s3://milady-data/camp/id/fields.h5"
    )
    assert storage.simulation_uri("camp", "1234", "fields") == "s3://milady-data/camp/1234/fields.h5"
    assert storage.split_uri("file:///a/b") == ("file", "/a/b")
    assert storage.split_uri("s3a://b/k") == ("s3", "b/k")
    assert storage.is_local("/x/y") and not storage.is_local("s3://b/k")
    with pytest.raises(ValueError):
        storage.local_path("s3://b/k")
    assert storage.storage_options("file:///x") == {}


def _roundtrip(base: str, tmp_path: Path) -> None:
    """put / exists / size / sha256 / open / get / ls / rm sur une base d'URI quelconque."""
    src = tmp_path / "src.bin"
    payload = os.urandom(300_000)
    src.write_bytes(payload)
    uri = storage.join(base, "camp", str(uuid.uuid4()), "fields.h5")
    assert not storage.exists(uri)
    assert storage.put(src, uri) == uri
    assert storage.exists(uri) and storage.size(uri) == len(payload)
    import hashlib

    assert storage.sha256(uri) == hashlib.sha256(payload).hexdigest()
    with storage.open(uri, "rb") as f:
        f.seek(1000)
        assert f.read(10) == payload[1000:1010]
    dst = storage.get(uri, tmp_path / "back" / "copy.bin")
    assert Path(dst).read_bytes() == payload
    note = storage.join(uri.rsplit("/", 1)[0], "notes.txt")
    with storage.open(note, "w") as f:
        f.write("bonjour")
    with storage.open(note, "r") as f:
        assert f.read() == "bonjour"
    listing = storage.ls(uri.rsplit("/", 1)[0])
    assert [u.rsplit("/", 1)[1] for u in listing] == ["fields.h5", "notes.txt"]
    storage.rm(uri.rsplit("/", 1)[0], recursive=True)
    assert not storage.exists(uri)
    storage.rm(uri)  # absent : sans effet


def test_local_roundtrip(tmp_path: Path) -> None:
    _roundtrip((tmp_path / "store").as_uri(), tmp_path)
    _roundtrip(str(tmp_path / "plain"), tmp_path)  # chemin sans schéma (HPC)
    # Copie sur soi-même : sans effet ; pas de fichier temporaire laissé.
    f = tmp_path / "same.bin"
    f.write_bytes(b"x")
    storage.put(f, f.as_uri())
    storage.get(f.as_uri(), f)
    assert f.read_bytes() == b"x" and not list(tmp_path.glob(".*.part"))
    with pytest.raises(FileNotFoundError):
        storage.put(tmp_path / "absent", (tmp_path / "x").as_uri())


def test_mff_on_local_store(tmp_path: Path) -> None:
    from milady.data import read_mff, validate, write_mff

    uri = storage.simulation_uri("c", str(uuid.uuid4()), base=(tmp_path / "store").as_uri())
    x = np.linspace(0, 1, 4, endpoint=False)
    sha = write_mff(
        uri, {"velocity": np.ones((1, 2, 4, 4, 2))}, {"time": [0.0, 1.0], "x": x, "y": x}, {"nu": 0.1}
    )
    assert storage.sha256(uri) == sha and validate(uri) == []
    assert read_mff(uri)["fields"]["velocity"].shape == (1, 2, 4, 4, 2)


# ---------------------------------------------------------------------------------------------
# S3 (MinIO, moto, ou serveur fourni)
# ---------------------------------------------------------------------------------------------
def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _wait_http(url: str, timeout: float = 60.0) -> bool:
    import urllib.request

    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)  # adresse locale de test
            return True
        except Exception as exc:  # noqa: BLE001
            if getattr(exc, "code", None) is not None:  # réponse HTTP (403…) : le serveur répond
                return True
            time.sleep(0.5)
    return False


@pytest.fixture(scope="module")
def s3_endpoint() -> Iterator[dict[str, str]]:
    """Point d'accès S3 de test et identifiants."""
    env = os.environ.get("MILADY_TEST_S3_ENDPOINT")
    if env:
        yield {
            "endpoint": env,
            "key": os.environ.get("AWS_ACCESS_KEY_ID", "test"),
            "secret": os.environ.get("AWS_SECRET_ACCESS_KEY", "testtest"),
        }
        return
    key, secret = "miladytest", "miladytest-secret"
    if shutil.which("docker") and os.environ.get("MILADY_TEST_DOCKER", "1") == "1":
        port = _free_port()
        name = f"milady-test-minio-{uuid.uuid4().hex[:8]}"
        run = subprocess.run(
            [
                "docker",
                "run",
                "-d",
                "--rm",
                "--name",
                name,
                "-p",
                f"127.0.0.1:{port}:9000",
                "-e",
                f"MINIO_ROOT_USER={key}",
                "-e",
                f"MINIO_ROOT_PASSWORD={secret}",
                os.environ.get("MILADY_TEST_MINIO_IMAGE", os.environ.get("MINIO_IMAGE", MINIO_IMAGE)),
                "server",
                "/data",
            ],
            capture_output=True,
            text=True,
            timeout=300,
            check=False,
        )
        if run.returncode == 0:
            try:
                if _wait_http(f"http://127.0.0.1:{port}/minio/health/live"):
                    yield {"endpoint": f"http://127.0.0.1:{port}", "key": key, "secret": secret}
                    return
            finally:
                subprocess.run(["docker", "rm", "-f", name], capture_output=True, timeout=60, check=False)
    try:
        from moto.server import ThreadedMotoServer
    except ImportError:
        pytest.skip("aucun serveur S3 de test (MILADY_TEST_S3_ENDPOINT, Docker + MinIO ou moto)")
    port = _free_port()
    server = ThreadedMotoServer(ip_address="127.0.0.1", port=port)
    server.start()
    try:
        yield {"endpoint": f"http://127.0.0.1:{port}", "key": key, "secret": secret}
    finally:
        server.stop()


@pytest.fixture()
def s3_env(s3_endpoint: dict[str, str], monkeypatch: pytest.MonkeyPatch) -> Iterator[str]:
    """Variables d'environnement S3 positionnées ; renvoie un bucket de test vide (supprimé à la fin)."""
    pytest.importorskip("s3fs")
    monkeypatch.setenv("MILADY_S3_ENDPOINT", s3_endpoint["endpoint"])
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", s3_endpoint["key"])
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", s3_endpoint["secret"])
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")
    bucket = f"milady-test-{uuid.uuid4().hex[:10]}"
    yield f"s3://{bucket}"
    try:
        storage.rm(f"s3://{bucket}", recursive=True)
    except Exception:  # noqa: BLE001 (nettoyage au mieux)
        pass


@pytest.mark.s3
def test_s3_roundtrip(s3_env: str, tmp_path: Path) -> None:
    opts = storage.storage_options(s3_env)
    assert opts["endpoint_url"] and opts["config_kwargs"]["s3"]["addressing_style"] == "path"
    storage.ensure_bucket(s3_env)
    storage.ensure_bucket(s3_env)  # idempotent
    _roundtrip(s3_env, tmp_path)


@pytest.mark.s3
def test_s3_mff_hdf5_zarr_and_catalog(s3_env: str, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Fichier MFF écrit directement en S3, lu par blocs, copié en Zarr S3, enregistré au catalogue."""
    from milady.catalog.api import Catalog
    from milady.data import read_mff, to_zarr, validate, write_mff

    monkeypatch.setenv("MILADY_STORAGE_URI", s3_env)
    sim_id = str(uuid.uuid4())
    uri = storage.simulation_uri("palier1", sim_id)
    assert uri == f"{s3_env}/palier1/{sim_id}/fields.h5"
    x = 2 * np.pi * np.arange(16) / 16
    rng = np.random.default_rng(0)
    b = rng.normal(size=(2, 5, 16, 16, 16, 3)).astype(np.float32)
    sha = write_mff(
        uri,
        {"magnetic_field": b},
        {"time": np.arange(5.0), "x": x, "y": x, "z": x},
        {"Rm": 10.0},
        meta={"code": "mhd3d_torch", "uuid": sim_id},
        spectral=True,
    )
    assert storage.sha256(uri) == sha and validate(uri) == []
    d = read_mff(uri, t=slice(3, 5), traj=1)
    np.testing.assert_array_equal(d["fields"]["magnetic_field"], b[1:2, 3:5])

    zuri = storage.simulation_uri("palier1", sim_id, "fields", ".zarr")
    local = tmp_path / "local.h5"
    storage.get(uri, local)
    to_zarr(local, zuri)
    assert validate(zuri) == []
    dz = read_mff(zuri, fields=["magnetic_field"], t=slice(3, 5), traj=1)
    np.testing.assert_array_equal(dz["fields"]["magnetic_field"], b[1:2, 3:5])

    cat = Catalog("sqlite://")
    out = cat.ingest_mff(uri, campaign="palier1")
    assert out["simulation_id"] == sim_id
    assert cat.get_simulation(sim_id)["files"][0]["sha256"] == sha
