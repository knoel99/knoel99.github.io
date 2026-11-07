"""Interface Python du catalogue MilaDy (PostgreSQL en production, SQLite en mode portable).

    from milady.catalog.api import Catalog
    cat = Catalog()                                   # MILADY_DB_URL, sinon sqlite:///<racine>/data/catalog.sqlite
    camp = cat.create_campaign("palier2_abc3d", config_yaml=open(cfg).read())
    sim = cat.register_simulation(camp, "mhd3d_torch", {"Rm": 12.0}, {"shape": [64, 64, 64]})
    cat.update_simulation(sim, status="running")
    ...
    cat.register_file(sim, "fields", uri, sha256, size_bytes, n_t=50, t_start=0.0, t_end=49.0)
    cat.update_simulation(sim, status="done")
    cat.query_simulations(campaign="palier2_abc3d", status="done", Rm__gt=8.0)

Toutes les méthodes ouvrent leur propre transaction (sûres entre processus) ; les identifiants sont des
chaînes UUID. Les méthodes d'enregistrement sont idempotentes quand c'est naturel (campagne par nom,
fichier par URI, jeu de données par (nom, version), diagnostics par (simulation, nom, t)).
"""

from __future__ import annotations

import datetime as _dt
import json
import math
import os
import socket
from collections.abc import Iterable, Mapping, Sequence
from pathlib import Path
from typing import Any

import numpy as np
from sqlalchemy import Engine, and_, create_engine, delete, event, func, inspect, or_, select, text
from sqlalchemy.dialects import postgresql, sqlite
from sqlalchemy.orm import Session, selectinload, sessionmaker
from sqlalchemy.pool import StaticPool

from milady import project_root
from milady.catalog.models import (
    FILE_KINDS,
    JOB_STATUSES,
    SCHEDULERS,
    SIMULATION_STATUSES,
    SPLITS,
    VIEW_EVAL_SUMMARY_SQL,
    Base,
    Campaign,
    Dataset,
    DatasetMember,
    Diagnostic,
    Evaluation,
    File,
    Job,
    Model,
    Simulation,
    new_uuid,
    utcnow,
    v_eval_summary,
)

__all__ = ["Catalog", "default_url", "normalize_url"]

# Synonymes acceptés pour les statuts (les scripts d'ordonnanceurs parlent des langues différentes).
_STATUS_ALIASES = {
    "pending": "queued",
    "submitted": "submitted",
    "started": "running",
    "completed": "done",
    "success": "done",
    "succeeded": "done",
    "finished": "done",
    "error": "failed",
    "timeout": "failed",
    "canceled": "cancelled",
}
_OPS = ("eq", "ne", "lt", "le", "gt", "ge", "in")


# =============================================================================================
# Connexion
# =============================================================================================
def default_url() -> str:
    """URL par défaut : ``MILADY_DB_URL`` sinon ``sqlite:///<racine>/data/catalog.sqlite``."""
    env = os.environ.get("MILADY_DB_URL", "").strip()
    if env:
        return env
    return f"sqlite:///{project_root() / 'data' / 'catalog.sqlite'}"


def normalize_url(url: str) -> str:
    """Pilote psycopg 3 pour PostgreSQL (``postgresql://`` → ``postgresql+psycopg://``), ``$VAR`` développées."""
    url = os.path.expandvars(url)
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix) :]
    return url


def _jsonable(obj: Any) -> Any:
    """Copie sérialisable en JSON (numpy → Python, NaN/inf → None : JSONB refuse NaN)."""
    if isinstance(obj, Mapping):
        return {str(k): _jsonable(v) for k, v in obj.items()}
    if isinstance(obj, np.ndarray):
        return [_jsonable(x) for x in obj.tolist()]
    if isinstance(obj, (list, tuple, set)):
        return [_jsonable(x) for x in obj]
    if isinstance(obj, np.generic):
        obj = obj.item()
    if isinstance(obj, float) and not math.isfinite(obj):
        return None
    if isinstance(obj, (_dt.datetime, _dt.date)):
        return obj.isoformat()
    if isinstance(obj, Path):
        return str(obj)
    return obj


def _dumps(obj: Any) -> str:
    # Clés triées : en SQLite, l'égalité de deux objets JSON (GROUP BY de la vue) est l'égalité du texte.
    return json.dumps(_jsonable(obj), sort_keys=True, ensure_ascii=False)


def _float(v: Any) -> float | None:
    if v is None:
        return None
    v = float(v)
    return v if math.isfinite(v) else None


class _StdDevSamp:
    """Agrégat ``stddev_samp`` pour SQLite (algorithme de Welford ; NULL si moins de deux valeurs)."""

    def __init__(self) -> None:
        self.n, self.mean, self.m2 = 0, 0.0, 0.0

    def step(self, value: float | None) -> None:
        if value is None:
            return
        self.n += 1
        d = value - self.mean
        self.mean += d / self.n
        self.m2 += d * (value - self.mean)

    def finalize(self) -> float | None:
        return math.sqrt(self.m2 / (self.n - 1)) if self.n > 1 else None


def _sqlite_on_connect(dbapi_conn: Any, _record: Any) -> None:
    dbapi_conn.create_aggregate("stddev_samp", 1, _StdDevSamp)
    dbapi_conn.create_function("sqrt", 1, lambda x: math.sqrt(x) if x is not None and x >= 0 else None)
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA foreign_keys = ON")
    cur.close()


def _aware(v: Any) -> Any:
    """SQLite rend des datetimes naïfs : on les déclare UTC."""
    if isinstance(v, _dt.datetime) and v.tzinfo is None:
        return v.replace(tzinfo=_dt.UTC)
    return v


def _as_datetime(v: Any) -> _dt.datetime | None:
    if v is None or isinstance(v, _dt.datetime):
        return _aware(v)
    if isinstance(v, (int, float)):
        return _dt.datetime.fromtimestamp(v, _dt.UTC)
    return _aware(_dt.datetime.fromisoformat(str(v).replace("Z", "+00:00")))


def _row(obj: Any) -> dict[str, Any]:
    """Objet ORM → dictionnaire (colonnes seulement, datetimes en UTC)."""
    return {c.key: _aware(getattr(obj, c.key)) for c in inspect(obj).mapper.column_attrs}


def _status(value: str, allowed: tuple[str, ...], what: str) -> str:
    v = _STATUS_ALIASES.get(str(value).lower(), str(value).lower())
    if v not in allowed:
        raise ValueError(f"{what} {value!r} invalide (attendu : {', '.join(allowed)})")
    return v


# =============================================================================================
# Catalogue
# =============================================================================================
class Catalog:
    """Catalogue des campagnes, simulations, fichiers, jeux de données, modèles, évaluations et tâches.

    ``url`` : URL SQLAlchemy (``postgresql://user:mdp@hôte:5432/milady``, ``sqlite:///chemin.sqlite``,
    ``sqlite://`` en mémoire) ; défaut ``MILADY_DB_URL`` puis ``sqlite:///<racine>/data/catalog.sqlite``.
    ``create=True`` crée les tables et la vue manquantes (sans toucher aux tables existantes : en production
    PostgreSQL, le schéma vient de ``infra/db/schema.sql``).
    """

    def __init__(self, url: str | None = None, *, echo: bool = False, create: bool = True) -> None:
        self.url = normalize_url(url or default_url())
        kwargs: dict[str, Any] = {"echo": echo, "json_serializer": _dumps, "pool_pre_ping": True}
        self.is_sqlite = self.url.startswith("sqlite")
        if self.is_sqlite:
            # Délai d'attente long : plusieurs jobs d'un tableau Slurm peuvent écrire en même temps.
            kwargs["connect_args"] = {"timeout": 120, "check_same_thread": False}
            path = self.url.split(":///", 1)[1] if ":///" in self.url else ""
            if path in ("", ":memory:"):
                kwargs["poolclass"] = StaticPool
            else:
                Path(path).expanduser().parent.mkdir(parents=True, exist_ok=True)
        self.engine: Engine = create_engine(self.url, **kwargs)
        if self.is_sqlite:
            event.listen(self.engine, "connect", _sqlite_on_connect)
        self._session = sessionmaker(self.engine, expire_on_commit=False)
        if create:
            self.create_schema()

    def __repr__(self) -> str:
        return f"Catalog({self.engine.url.render_as_string(hide_password=True)!r})"

    def close(self) -> None:
        """Ferme les connexions du moteur."""
        self.engine.dispose()

    def create_schema(self) -> None:
        """Crée les tables, index, contraintes et la vue ``v_eval_summary`` absents (idempotent)."""
        Base.metadata.create_all(self.engine)
        with self.engine.begin() as conn:
            if "v_eval_summary" not in inspect(conn).get_view_names():
                conn.execute(text(VIEW_EVAL_SUMMARY_SQL))

    def session(self) -> Session:
        """Session SQLAlchemy brute (requêtes libres) ; à utiliser avec ``with cat.session() as s``."""
        return self._session()

    # -- utilitaires internes -----------------------------------------------------------------
    def _campaign_id(self, s: Session, campaign: str) -> str:
        found = s.scalar(
            select(Campaign.id).where(or_(Campaign.name == campaign, Campaign.id == _maybe_uuid(campaign)))
        )
        if found is None:
            raise KeyError(f"campagne inconnue : {campaign!r}")
        return found

    def _upsert(
        self, s: Session, model: type, rows: list[dict[str, Any]], keys: Sequence[str], update: Sequence[str]
    ) -> None:
        dialect = self.engine.dialect.name
        ins = postgresql.insert if dialect == "postgresql" else sqlite.insert if dialect == "sqlite" else None
        if ins is None:  # autre base : suppression puis insertion
            for r in rows:
                s.execute(delete(model).where(and_(*[getattr(model, k) == r[k] for k in keys])))
            s.execute(model.__table__.insert(), rows)
            return
        stmt = ins(model)
        stmt = stmt.on_conflict_do_update(
            index_elements=list(keys), set_={c: getattr(stmt.excluded, c) for c in update}
        )
        s.execute(stmt, rows)

    # -- campagnes ------------------------------------------------------------------------------
    def create_campaign(self, name: str, config_yaml: str = "", description: str = "") -> str:
        """Crée la campagne ``name`` et renvoie son identifiant ; si elle existe, renvoie l'existant (inchangé)."""
        with self._session.begin() as s:
            found = s.scalar(select(Campaign.id).where(Campaign.name == name))
            if found:
                return found
            c = Campaign(name=name, config_yaml=config_yaml or "", description=description or "")
            s.add(c)
            s.flush()
            return c.id

    def list_campaigns(self) -> list[dict[str, Any]]:
        """Campagnes et nombre de simulations par statut."""
        with self._session() as s:
            out = []
            for c in s.scalars(select(Campaign).order_by(Campaign.created_at)):
                d = _row(c)
                d["counts"] = dict(
                    s.execute(
                        select(Simulation.status, func.count())
                        .where(Simulation.campaign_id == c.id)
                        .group_by(Simulation.status)
                    ).all()
                )
                out.append(d)
            return out

    # -- simulations ----------------------------------------------------------------------------
    def register_simulation(
        self,
        campaign_id: str,
        code: str,
        parameters: Mapping[str, Any],
        grid: Mapping[str, Any],
        code_version: str = "",
        git_commit: str = "",
        host: str = "",
        n_gpus: int = 0,
        n_cpus: int = 0,
        *,
        sim_id: str | None = None,
        status: str = "queued",
        notes: str = "",
    ) -> str:
        """Enregistre une simulation et renvoie son identifiant (``sim_id`` imposé possible, ex. ``milady_uuid``).

        ``campaign_id`` : identifiant ou nom de campagne. Si ``sim_id`` existe déjà, renvoie ``sim_id`` sans
        rien modifier (reprise d'un job relancé).
        """
        with self._session.begin() as s:
            camp = self._campaign_id(s, campaign_id)
            if sim_id is not None:
                sim_id = str(_uuid_str(sim_id))
                if s.get(Simulation, sim_id) is not None:
                    return sim_id
            sim = Simulation(
                id=sim_id or new_uuid(),
                campaign_id=camp,
                code=code,
                code_version=code_version or "",
                git_commit=git_commit or "",
                parameters=_jsonable(dict(parameters)),
                grid=_jsonable(dict(grid)),
                status=_status(status, SIMULATION_STATUSES, "statut"),
                host=host or socket.gethostname(),
                n_gpus=int(n_gpus),
                n_cpus=int(n_cpus),
                notes=notes or "",
            )
            s.add(sim)
            s.flush()
            return sim.id

    def update_simulation(self, sim_id: str, **fields: Any) -> None:
        """Met à jour des colonnes d'une simulation.

        Passer ``status="running"`` fixe ``started_at`` (s'il n'est pas donné) ; ``"done"``/``"failed"`` fixe
        ``finished_at`` et, si possible, ``wall_time_s``. ``parameters``/``grid`` remplacent le JSON entier.
        """
        allowed = {c.key for c in inspect(Simulation).column_attrs} - {"id", "created_at"}
        unknown = set(fields) - allowed
        if unknown:
            raise ValueError(f"colonnes inconnues pour simulation : {sorted(unknown)}")
        with self._session.begin() as s:
            sim = s.get(Simulation, _uuid_str(sim_id))
            if sim is None:
                raise KeyError(f"simulation inconnue : {sim_id}")
            now = utcnow()
            if "status" in fields:
                fields["status"] = _status(fields["status"], SIMULATION_STATUSES, "statut")
                if fields["status"] == "running":
                    fields.setdefault("started_at", sim.started_at or now)
                elif fields["status"] in ("done", "failed"):
                    fields.setdefault("finished_at", now)
            for key in ("started_at", "finished_at"):
                if key in fields:
                    fields[key] = _as_datetime(fields[key])
            for key in ("parameters", "grid"):
                if key in fields:
                    fields[key] = _jsonable(dict(fields[key]))
            for k, v in fields.items():
                setattr(sim, k, v)
            if "wall_time_s" not in fields and sim.started_at and sim.finished_at and sim.wall_time_s is None:
                sim.wall_time_s = (_aware(sim.finished_at) - _aware(sim.started_at)).total_seconds()

    def get_simulation(self, sim_id: str) -> dict[str, Any] | None:
        """Simulation (avec campagne et fichiers) ou ``None``."""
        with self._session() as s:
            sim = s.scalar(
                select(Simulation)
                .where(Simulation.id == _maybe_uuid(sim_id))
                .options(selectinload(Simulation.files), selectinload(Simulation.campaign))
            )
            return _sim_dict(sim) if sim is not None else None

    def query_simulations(
        self, campaign: str | None = None, status: str | None = None, **param_filters: Any
    ) -> list[dict[str, Any]]:
        """Simulations filtrées par campagne (nom ou id), statut et valeurs de paramètres.

        Filtres de paramètres : ``Rm=12.0`` (égalité ; tolérance relative 1e-9 pour les nombres),
        ``Rm__gt=8``, ``__ge``, ``__lt``, ``__le``, ``__ne``, ``Rm__in=[8, 12]`` ; chaînes et booléens par égalité.
        Chaque résultat contient les colonnes de la simulation, ``campaign`` (nom) et ``files``.
        """
        stmt = select(Simulation).options(selectinload(Simulation.files), selectinload(Simulation.campaign))
        with self._session() as s:
            if campaign is not None:
                stmt = stmt.where(Simulation.campaign_id == self._campaign_id(s, campaign))
            if status is not None:
                stmt = stmt.where(Simulation.status == _status(status, SIMULATION_STATUSES, "statut"))
            for key, val in param_filters.items():
                name, op = key, "eq"
                if "__" in key and key.rsplit("__", 1)[1] in _OPS:
                    name, op = key.rsplit("__", 1)
                stmt = stmt.where(_param_clause(Simulation.parameters[name], op, val))
            stmt = stmt.order_by(Simulation.created_at, Simulation.id)
            return [_sim_dict(sim) for sim in s.scalars(stmt).unique()]

    # -- fichiers -------------------------------------------------------------------------------
    def register_file(
        self,
        sim_id: str,
        kind: str,
        uri: str,
        sha256: str,
        size_bytes: int,
        n_t: int | None = None,
        t_start: float | None = None,
        t_end: float | None = None,
        format_version: str = "1.0",
    ) -> str:
        """Enregistre un fichier (clé : son URI) et renvoie son identifiant ; un fichier réécrit est mis à jour."""
        if kind not in FILE_KINDS:
            raise ValueError(f"type de fichier {kind!r} invalide (attendu : {', '.join(FILE_KINDS)})")
        values = {
            "simulation_id": _uuid_str(sim_id),
            "kind": kind,
            "sha256": sha256 or "",
            "size_bytes": int(size_bytes or 0),
            "n_t": None if n_t is None else int(n_t),
            "t_start": _float(t_start),
            "t_end": _float(t_end),
            "format_version": format_version,
        }
        with self._session.begin() as s:
            f = s.scalar(select(File).where(File.uri == uri))
            if f is None:
                f = File(uri=uri, **values)
                s.add(f)
            else:
                for k, v in values.items():
                    setattr(f, k, v)
            s.flush()
            return f.id

    def find_file(self, uri: str) -> dict[str, Any] | None:
        """Fichier enregistré sous ``uri`` ou ``None``."""
        with self._session() as s:
            f = s.scalar(select(File).where(File.uri == uri))
            return _row(f) if f is not None else None

    # -- diagnostics ----------------------------------------------------------------------------
    def add_diagnostics(self, sim_id: str, name: str, t: Iterable[float], values: Iterable[float]) -> int:
        """Ajoute (ou remplace, à t égal) les points d'une série temporelle ; renvoie le nombre de points.

        Une seule valeur par (simulation, nom, t) : pour plusieurs trajectoires, enregistrer la moyenne sous
        ``name`` et, si besoin, chaque trajectoire sous ``name[i]``.
        """
        t = np.asarray(list(t) if not isinstance(t, np.ndarray) else t, dtype=np.float64).ravel()
        v = np.asarray(
            list(values) if not isinstance(values, np.ndarray) else values, dtype=np.float64
        ).ravel()
        if t.shape != v.shape:
            raise ValueError(f"t et values de longueurs différentes ({t.size} ≠ {v.size})")
        sid = _uuid_str(sim_id)
        rows = [
            {"simulation_id": sid, "name": name, "t": float(ti), "value": _float(vi)} for ti, vi in zip(t, v)
        ]
        with self._session.begin() as s:
            for i in range(0, len(rows), 5000):
                self._upsert(s, Diagnostic, rows[i : i + 5000], ("simulation_id", "name", "t"), ("value",))
        return len(rows)

    def get_diagnostics(
        self, sim_id: str, name: str | None = None
    ) -> dict[str, tuple[np.ndarray, np.ndarray]]:
        """Séries ``{nom: (t, valeurs)}`` d'une simulation (triées par t)."""
        stmt = select(Diagnostic.name, Diagnostic.t, Diagnostic.value).where(
            Diagnostic.simulation_id == _uuid_str(sim_id)
        )
        if name is not None:
            stmt = stmt.where(Diagnostic.name == name)
        out: dict[str, list[tuple[float, float]]] = {}
        with self._session() as s:
            for n, t, v in s.execute(stmt.order_by(Diagnostic.name, Diagnostic.t)):
                out.setdefault(n, []).append((t, np.nan if v is None else v))
        return {n: (np.array([p[0] for p in pts]), np.array([p[1] for p in pts])) for n, pts in out.items()}

    # -- jeux de données ------------------------------------------------------------------------
    def register_dataset(
        self, name: str, version: str, members: Sequence[tuple[str, str]], description: str = ""
    ) -> str:
        """Enregistre le jeu de données (nom, version) avec ses fichiers ``[(file_id, split)]`` ; renvoie son id.

        Une version publiée est figée : la réenregistrer avec les mêmes membres renvoie l'existant, avec
        d'autres membres lève ``ValueError`` (créer une nouvelle version).
        """
        wanted = {(_uuid_str(fid), split) for fid, split in members}
        for _, split in wanted:
            if split not in SPLITS:
                raise ValueError(f"partition {split!r} invalide (attendu : {', '.join(SPLITS)})")
        with self._session.begin() as s:
            ds = s.scalar(select(Dataset).where(Dataset.name == name, Dataset.version == version))
            if ds is not None:
                have = {
                    (m.file_id, m.split)
                    for m in s.scalars(select(DatasetMember).where(DatasetMember.dataset_id == ds.id))
                }
                if have != wanted:
                    raise ValueError(f"jeu de données {name} v{version} déjà publié avec d'autres membres")
                return ds.id
            ds = Dataset(name=name, version=version, description=description or "")
            s.add(ds)
            s.flush()
            s.add_all(
                DatasetMember(dataset_id=ds.id, file_id=fid, split=split) for fid, split in sorted(wanted)
            )
            return ds.id

    def dataset_files(
        self, name: str, version: str | None = None, split: str | None = None
    ) -> list[dict[str, Any]]:
        """Fichiers d'un jeu de données (dernière version si ``version`` est omise), avec leur partition."""
        with self._session() as s:
            q = select(Dataset).where(Dataset.name == name)
            if version is not None:
                q = q.where(Dataset.version == version)
            ds = s.scalars(q.order_by(Dataset.created_at.desc())).first()
            if ds is None:
                raise KeyError(f"jeu de données inconnu : {name} {version or ''}")
            q = (
                select(File, DatasetMember.split)
                .join(DatasetMember, DatasetMember.file_id == File.id)
                .where(DatasetMember.dataset_id == ds.id)
            )
            if split is not None:
                q = q.where(DatasetMember.split == split)
            return [
                {**_row(f), "split": sp, "dataset_id": ds.id} for f, sp in s.execute(q.order_by(File.uri))
            ]

    # -- modèles et évaluations -----------------------------------------------------------------
    def register_model(
        self,
        name: str,
        architecture: str,
        constraint_mechanism: str,
        hyperparams: Mapping[str, Any],
        dataset_id: str | None = None,
        mlflow_run_id: str | None = None,
        checkpoint_uri: str | None = None,
        git_commit: str = "",
    ) -> str:
        """Enregistre un modèle entraîné et renvoie son identifiant."""
        with self._session.begin() as s:
            m = Model(
                name=name,
                architecture=architecture or "",
                constraint_mechanism=constraint_mechanism or "",
                hyperparams=_jsonable(dict(hyperparams or {})),
                dataset_id=_uuid_str(dataset_id) if dataset_id else None,
                mlflow_run_id=mlflow_run_id,
                checkpoint_uri=checkpoint_uri,
                git_commit=git_commit or "",
            )
            s.add(m)
            s.flush()
            return m.id

    def update_model(self, model_id: str, **fields: Any) -> None:
        """Met à jour des colonnes d'un modèle (ex. ``checkpoint_uri`` en fin d'entraînement)."""
        allowed = {c.key for c in inspect(Model).column_attrs} - {"id", "created_at"}
        if set(fields) - allowed:
            raise ValueError(f"colonnes inconnues pour model : {sorted(set(fields) - allowed)}")
        with self._session.begin() as s:
            m = s.get(Model, _uuid_str(model_id))
            if m is None:
                raise KeyError(f"modèle inconnu : {model_id}")
            if "hyperparams" in fields:
                fields["hyperparams"] = _jsonable(dict(fields["hyperparams"]))
            for k, v in fields.items():
                setattr(m, k, v)

    def get_model(self, model_id: str) -> dict[str, Any] | None:
        """Modèle ou ``None``."""
        with self._session() as s:
            m = s.get(Model, _uuid_str(model_id))
            return _row(m) if m is not None else None

    def add_evaluation(
        self,
        model_id: str,
        parameters: Mapping[str, Any],
        metric: str,
        value: float,
        n_samples: int,
        seed: int,
        details: Mapping[str, Any] | None = None,
    ) -> str:
        """Enregistre une mesure ``metric = value`` du modèle aux paramètres physiques ``parameters``."""
        with self._session.begin() as s:
            e = Evaluation(
                model_id=_uuid_str(model_id),
                parameters=_jsonable(dict(parameters or {})),
                metric=metric,
                value=_float(value),
                n_samples=int(n_samples),
                seed=int(seed),
                details=_jsonable(dict(details)) if details is not None else None,
            )
            s.add(e)
            s.flush()
            return e.id

    def eval_summary(self, model_id: str | None = None) -> list[dict[str, Any]]:
        """Lignes de la vue ``v_eval_summary`` : moyenne, écart-type, min, max par modèle, métrique et paramètres."""
        stmt = select(v_eval_summary)
        if model_id is not None:
            stmt = stmt.where(v_eval_summary.c.model_id == _uuid_str(model_id))
        stmt = stmt.order_by(v_eval_summary.c.model_name, v_eval_summary.c.metric)
        with self.engine.connect() as conn:
            rows = [dict(r._mapping) for r in conn.execute(stmt)]
        for r in rows:
            if isinstance(r.get("parameters"), str):  # vue SQLite sans type déclaré
                r["parameters"] = json.loads(r["parameters"])
            for k in ("mean", "std", "min", "max"):
                r[k] = None if r[k] is None else float(r[k])
        return sorted(
            rows, key=lambda r: (r["model_name"], r["metric"], json.dumps(r["parameters"], sort_keys=True))
        )

    # -- tâches ---------------------------------------------------------------------------------
    def register_job(
        self,
        kind: str,
        scheduler: str,
        external_id: str = "",
        simulation_id: str | None = None,
        model_id: str | None = None,
        status: str = "queued",
        log_uri: str = "",
    ) -> str:
        """Enregistre une tâche (``kind`` libre : simulation, train, eval, convert, smoke…) ; renvoie son id."""
        if scheduler not in SCHEDULERS:
            raise ValueError(f"ordonnanceur {scheduler!r} invalide (attendu : {', '.join(SCHEDULERS)})")
        if simulation_id and model_id:
            raise ValueError("une tâche porte sur une simulation ou un modèle, pas les deux")
        status = _status(status, JOB_STATUSES, "statut de tâche")
        with self._session.begin() as s:
            job = Job(
                kind=kind,
                scheduler=scheduler,
                external_id=str(external_id or ""),
                simulation_id=_uuid_str(simulation_id) if simulation_id else None,
                model_id=_uuid_str(model_id) if model_id else None,
                status=status,
                log_uri=log_uri or "",
            )
            if status == "running":
                job.started_at = utcnow()
            s.add(job)
            s.flush()
            return job.id

    def update_job(self, job_id: str, **fields: Any) -> None:
        """Met à jour une tâche ; ``status`` fixe ``started_at`` / ``finished_at`` comme pour les simulations."""
        allowed = {c.key for c in inspect(Job).column_attrs} - {"id"}
        if set(fields) - allowed:
            raise ValueError(f"colonnes inconnues pour job : {sorted(set(fields) - allowed)}")
        with self._session.begin() as s:
            job = s.get(Job, _uuid_str(job_id))
            if job is None:
                raise KeyError(f"tâche inconnue : {job_id}")
            if "status" in fields:
                fields["status"] = _status(fields["status"], JOB_STATUSES, "statut de tâche")
                if fields["status"] == "running":
                    fields.setdefault("started_at", job.started_at or utcnow())
                elif fields["status"] in ("done", "failed", "cancelled"):
                    fields.setdefault("finished_at", utcnow())
            if "scheduler" in fields and fields["scheduler"] not in SCHEDULERS:
                raise ValueError(f"ordonnanceur {fields['scheduler']!r} invalide")
            for key in ("submitted_at", "started_at", "finished_at"):
                if key in fields:
                    fields[key] = _as_datetime(fields[key])
            for k, v in fields.items():
                setattr(job, k, v)

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        """Tâche ou ``None``."""
        with self._session() as s:
            job = s.get(Job, _uuid_str(job_id))
            return _row(job) if job is not None else None

    def query_jobs(
        self, status: str | None = None, scheduler: str | None = None, external_id: str | None = None
    ) -> list[dict[str, Any]]:
        """Tâches filtrées (statut, ordonnanceur, identifiant externe Slurm)."""
        stmt = select(Job)
        if status is not None:
            stmt = stmt.where(Job.status == _status(status, JOB_STATUSES, "statut de tâche"))
        if scheduler is not None:
            stmt = stmt.where(Job.scheduler == scheduler)
        if external_id is not None:
            stmt = stmt.where(Job.external_id == str(external_id))
        with self._session() as s:
            return [_row(j) for j in s.scalars(stmt.order_by(Job.submitted_at))]

    # -- ingestion d'un fichier MFF existant ----------------------------------------------------
    def ingest_mff(
        self, uri: str, campaign: str = "default", kind: str = "fields", diagnostics: bool = True
    ) -> dict[str, str]:
        """Enregistre un fichier MFF déjà écrit (local, ``s3://`` ou ``.zarr``) d'après ses métadonnées.

        Utile sur HPC quand les nœuds de calcul ne joignent pas la base : les jobs n'écrivent que des
        fichiers, puis ``python -m milady.catalog ingest <uri>…`` les enregistre depuis la frontale.
        La simulation reçoit l'identifiant ``milady_uuid`` du fichier ; idempotent. Renvoie
        ``{"simulation_id": …, "file_id": …}``.
        """
        from milady import storage
        from milady.data import format as mff

        with mff.open_mff(uri) as f:
            attrs = mff._attrs(f)
            grid = mff.grid_info(f)
            diag: dict[str, tuple[np.ndarray, np.ndarray]] = {}
            if diagnostics and "milady_diagnostics" in f:
                g = f["milady_diagnostics"]
                td = np.asarray(g["time"][()])
                for name in mff._str_list(g.attrs.get("field_names", [])):
                    vals = np.asarray(g[name][()], dtype=np.float64)
                    diag[name] = (td, vals.mean(axis=0) if vals.ndim == 2 else vals)
        params = (
            json.loads(attrs["milady_parameters"])
            if "milady_parameters" in attrs
            else {p: attrs.get(p) for p in mff._str_list(attrs.get("simulation_parameters", []))}
        )
        sim_id = attrs.get("milady_uuid") or new_uuid()
        camp = self.create_campaign(campaign)
        created = self.get_simulation(sim_id) is None
        self.register_simulation(
            camp,
            attrs.get("milady_code", "unknown"),
            params,
            grid,
            code_version=attrs.get("milady_code_version", ""),
            git_commit=attrs.get("milady_git_commit", ""),
            host=attrs.get("milady_host", ""),
            sim_id=sim_id,
            status="done",
        )
        if mff._is_zarr(uri):
            sha, size = "", 0
        else:
            sha, size = storage.sha256(uri), storage.size(uri)
        file_id = self.register_file(
            sim_id,
            kind,
            uri,
            sha,
            size,
            n_t=grid.get("n_t"),
            t_start=grid.get("t_start"),
            t_end=grid.get("t_end"),
            format_version=attrs.get("milady_format_version", "1.0"),
        )
        if created:
            for name, (td, vals) in diag.items():
                self.add_diagnostics(sim_id, name, td, vals)
        return {"simulation_id": sim_id, "file_id": file_id}


# =============================================================================================
# Fonctions auxiliaires
# =============================================================================================
def _uuid_str(v: Any) -> str:
    import uuid

    return str(uuid.UUID(str(v)))


def _maybe_uuid(v: Any) -> str | None:
    """UUID normalisé, ou ``None`` si ``v`` n'en est pas un (évite une erreur de type en PostgreSQL)."""
    try:
        return _uuid_str(v)
    except (ValueError, TypeError, AttributeError):
        return None


def _param_clause(elem: Any, op: str, val: Any) -> Any:
    if op == "in":
        vals = list(val)
        if all(isinstance(x, str) for x in vals):
            return elem.as_string().in_(vals)
        return or_(*[_param_clause(elem, "eq", x) for x in vals])
    if isinstance(val, (bool, np.bool_)):
        col = elem.as_boolean()
        val = bool(val)
    elif isinstance(val, (int, float, np.integer, np.floating)):
        col = elem.as_float()
        val = float(val)
        if op == "eq":
            return func.abs(col - val) <= 1e-9 * max(abs(val), 1e-300)
        if op == "ne":
            return func.abs(col - val) > 1e-9 * max(abs(val), 1e-300)
    else:
        col = elem.as_string()
        val = str(val)
    import operator

    return getattr(operator, op)(col, val)  # eq, ne, lt, le, gt, ge


def _sim_dict(sim: Simulation) -> dict[str, Any]:
    d = _row(sim)
    d["campaign"] = sim.campaign.name if sim.campaign is not None else None
    d["files"] = [_row(f) for f in sim.files]
    return d
