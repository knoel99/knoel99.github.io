"""Stockage des objets lourds (fichiers MFF, points de contrôle, figures) via fsspec.

Schémas d'URI pris en charge :

- ``file:///chemin/absolu`` ou simple chemin (``/scratch/...``, ``$SCRATCH/milady``, ``~/data``) : disque
  local ou système de fichiers parallèle d'un cluster HPC ($WORK, $SCRATCH) ;
- ``s3://bucket/clé`` : stockage objet S3 — MinIO du docker-compose, AWS S3, Scaleway, OVHcloud… ;
- tout autre protocole fsspec (``gs://``, ``az://``, ``https://``…) si le paquet correspondant est installé.

Configuration (variables d'environnement, jamais de secret dans le dépôt) :

- ``MILADY_STORAGE_URI``   : racine du stockage (défaut ``file://<racine>/data/store``) ;
- ``MILADY_S3_ENDPOINT``   : point d'accès S3 non AWS (``http://s3:9000`` pour MinIO, ``https://s3.fr-par.scw.cloud``…) ;
- ``AWS_ACCESS_KEY_ID`` / ``AWS_SECRET_ACCESS_KEY`` (/ ``AWS_SESSION_TOKEN``) : identifiants S3 ;
- ``AWS_DEFAULT_REGION`` ou ``AWS_REGION`` : région (défaut ``us-east-1``, valeur acceptée par MinIO).

Convention de rangement : ``{MILADY_STORAGE_URI}/{campagne}/{uuid_simulation}/{kind}.h5``
(voir :func:`simulation_uri`).
"""
from __future__ import annotations

import builtins
import hashlib
import os
import shutil
import uuid
from pathlib import Path
from typing import IO, Any

import fsspec

from milady import project_root

__all__ = [
    "DEFAULT_BUCKETS", "base_uri", "ensure_bucket", "exists", "filesystem", "get", "is_local", "join", "local_path",
    "ls", "open", "put", "rm", "sha256", "simulation_uri", "size", "split_uri", "storage_options",
]

#: Buckets créés par le docker-compose (données, modèles, artefacts MLflow).
DEFAULT_BUCKETS = ("milady-data", "milady-models", "mlflow")
_CHUNK = 8 * 2**20


# ---------------------------------------------------------------------------------------------
# URI
# ---------------------------------------------------------------------------------------------
def _expand(path: str) -> str:
    """Développe ``$VAR`` et ``~`` d'un chemin local (``$SCRATCH``, ``$WORK`` sur les clusters)."""
    return os.path.expanduser(os.path.expandvars(path))


def split_uri(uri: str | os.PathLike[str]) -> tuple[str, str]:
    """Sépare protocole et chemin : ``s3://b/k`` → ``("s3", "b/k")`` ; ``/a/b`` → ``("file", "/a/b")``."""
    s = os.fspath(uri)
    if "://" not in s:
        return "file", os.path.abspath(_expand(s))
    proto, rest = s.split("://", 1)
    proto = proto.lower()
    if proto in ("file", "local"):
        return "file", os.path.abspath(_expand(rest))
    if proto in ("s3a", "s3n"):
        proto = "s3"
    return proto, rest


def is_local(uri: str | os.PathLike[str]) -> bool:
    """Vrai pour un chemin local ou une URI ``file://``."""
    return split_uri(uri)[0] == "file"


def local_path(uri: str | os.PathLike[str]) -> Path:
    """Chemin local d'une URI ``file://`` ou d'un chemin (erreur pour une URI distante)."""
    proto, path = split_uri(uri)
    if proto != "file":
        raise ValueError(f"URI non locale : {uri}")
    return Path(path)


def base_uri() -> str:
    """Racine du stockage : ``MILADY_STORAGE_URI`` (variables ``$VAR`` développées) ou ``file://<racine>/data/store``."""
    env = os.environ.get("MILADY_STORAGE_URI", "").strip()
    if not env:
        return (project_root() / "data" / "store").as_uri()
    proto, path = split_uri(env)
    if proto == "file":
        return Path(path).as_uri()
    return f"{proto}://{path}".rstrip("/")


def join(base: str | os.PathLike[str], *parts: str) -> str:
    """Concatène des éléments de chemin à une URI ou un chemin (séparateur ``/`` dans tous les cas)."""
    out = os.fspath(base).rstrip("/")
    for p in parts:
        p = str(p).strip("/")
        if p:
            out = f"{out}/{p}"
    return out


def simulation_uri(campaign: str, simulation_id: str, kind: str = "fields", ext: str = ".h5",
                   base: str | None = None) -> str:
    """URI conventionnelle d'un fichier de simulation : ``{base}/{campagne}/{uuid}/{kind}{ext}``."""
    return join(base or base_uri(), campaign, simulation_id, f"{kind}{ext}")


# ---------------------------------------------------------------------------------------------
# Systèmes de fichiers
# ---------------------------------------------------------------------------------------------
def storage_options(uri: str | os.PathLike[str]) -> dict[str, Any]:
    """Options fsspec du protocole de ``uri`` (identifiants et point d'accès S3 lus dans l'environnement)."""
    proto, _ = split_uri(uri)
    if proto != "s3":
        return {}
    opts: dict[str, Any] = {}
    key, secret = os.environ.get("AWS_ACCESS_KEY_ID"), os.environ.get("AWS_SECRET_ACCESS_KEY")
    if key and secret:
        opts["key"], opts["secret"] = key, secret
        if os.environ.get("AWS_SESSION_TOKEN"):
            opts["token"] = os.environ["AWS_SESSION_TOKEN"]
    endpoint = os.environ.get("MILADY_S3_ENDPOINT") or os.environ.get("AWS_ENDPOINT_URL")
    region = os.environ.get("AWS_DEFAULT_REGION") or os.environ.get("AWS_REGION") or "us-east-1"
    opts["client_kwargs"] = {"region_name": region}
    if endpoint:
        opts["endpoint_url"] = endpoint
        # MinIO et la plupart des fournisseurs compatibles acceptent l'adressage par chemin
        # (http://hôte/bucket/clé), le seul qui marche sans DNS joker.
        opts["config_kwargs"] = {"s3": {"addressing_style": "path"}}
    return opts


def filesystem(uri: str | os.PathLike[str]) -> tuple[fsspec.AbstractFileSystem, str]:
    """Système de fichiers fsspec et chemin interne correspondant à ``uri``."""
    proto, path = split_uri(uri)
    if proto == "file":
        return fsspec.filesystem("file"), path
    return fsspec.filesystem(proto, **storage_options(uri)), path


def ensure_bucket(uri: str) -> None:
    """Crée le bucket S3 de ``uri`` s'il n'existe pas (sans effet pour les autres protocoles)."""
    proto, path = split_uri(uri)
    if proto != "s3":
        return
    fs, _ = filesystem(uri)
    bucket = path.split("/", 1)[0]
    try:
        if fs.exists(bucket):
            return
    except (PermissionError, OSError):
        pass
    try:
        fs.mkdir(bucket)
    except FileExistsError:
        pass
    fs.invalidate_cache(bucket)


# ---------------------------------------------------------------------------------------------
# Opérations
# ---------------------------------------------------------------------------------------------
def put(local: str | os.PathLike[str], uri: str) -> str:
    """Copie le fichier local ``local`` vers ``uri`` ; renvoie ``uri``.

    Écriture atomique en local (copie dans un fichier temporaire du même dossier puis renommage) :
    un job interrompu ne laisse jamais de fichier tronqué sous le nom final. En S3, l'objet n'apparaît
    qu'une fois l'envoi terminé ; le bucket est créé au besoin.
    """
    src = Path(local)
    if not src.is_file():
        raise FileNotFoundError(src)
    proto, path = split_uri(uri)
    if proto == "file":
        dst = Path(path)
        if dst.exists() and dst.resolve() == src.resolve():
            return uri
        dst.parent.mkdir(parents=True, exist_ok=True)
        tmp = dst.with_name(f".{dst.name}.{uuid.uuid4().hex[:8]}.part")
        try:
            shutil.copyfile(src, tmp)
            os.replace(tmp, dst)
        finally:
            tmp.unlink(missing_ok=True)
        return uri
    ensure_bucket(uri)
    fs, _ = filesystem(uri)
    fs.put_file(str(src), path)
    fs.invalidate_cache(path)
    return uri


def get(uri: str, local: str | os.PathLike[str]) -> str:
    """Télécharge ``uri`` vers le chemin local ``local`` (dossiers créés, écriture atomique) ; renvoie ce chemin."""
    dst = Path(local)
    dst.parent.mkdir(parents=True, exist_ok=True)
    proto, path = split_uri(uri)
    if proto == "file" and Path(path).resolve() == dst.resolve():
        return str(dst)
    tmp = dst.with_name(f".{dst.name}.{uuid.uuid4().hex[:8]}.part")
    try:
        if proto == "file":
            shutil.copyfile(path, tmp)
        else:
            fs, _ = filesystem(uri)
            fs.get_file(path, str(tmp))
        os.replace(tmp, dst)
    finally:
        tmp.unlink(missing_ok=True)
    return str(dst)


def open(uri: str | os.PathLike[str], mode: str = "rb", **kwargs: Any) -> IO[Any]:  # noqa: A001 (API voulue)
    """Ouvre ``uri`` comme un fichier (à utiliser avec ``with``) ; dossiers/bucket créés en écriture.

    En lecture S3, l'objet est lu par blocs (pas de téléchargement complet) : ``h5py.File(storage.open(u))``
    ne lit que les morceaux nécessaires.
    """
    proto, path = split_uri(uri)
    writing = any(c in mode for c in "wax+")
    if proto == "file":
        if writing:
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        return builtins.open(path, mode, **kwargs)
    if writing:
        ensure_bucket(os.fspath(uri))
    fs, _ = filesystem(uri)
    return fs.open(path, mode, **kwargs)


def exists(uri: str | os.PathLike[str]) -> bool:
    """Vrai si l'objet ou le dossier ``uri`` existe (faux aussi si le bucket est absent ou inaccessible)."""
    fs, path = filesystem(uri)
    try:
        fs.invalidate_cache(path)
        return bool(fs.exists(path))
    except (FileNotFoundError, PermissionError):
        return False


def size(uri: str | os.PathLike[str]) -> int:
    """Taille en octets de l'objet ``uri``."""
    fs, path = filesystem(uri)
    return int(fs.size(path))


def sha256(uri: str | os.PathLike[str]) -> str:
    """Somme SHA-256 (hexadécimale) du contenu de ``uri``, lue par blocs de 8 Mio."""
    h = hashlib.sha256()
    with open(uri, "rb") as f:
        while chunk := f.read(_CHUNK):
            h.update(chunk)
    return h.hexdigest()


def ls(uri: str | os.PathLike[str]) -> list[str]:
    """Liste le contenu du dossier ``uri`` (URI complètes, triées)."""
    proto, path = split_uri(uri)
    fs, _ = filesystem(uri)
    fs.invalidate_cache(path)
    names = sorted(fs.ls(path, detail=False))
    if proto == "file":
        return [Path(n).as_uri() for n in names]
    return [f"{proto}://{n}" for n in names]


def rm(uri: str | os.PathLike[str], recursive: bool = False) -> None:
    """Supprime l'objet (ou, avec ``recursive=True``, le dossier) ``uri`` ; sans effet s'il est absent."""
    fs, path = filesystem(uri)
    try:
        fs.rm(path, recursive=recursive)
    except FileNotFoundError:
        pass
    fs.invalidate_cache(path)
