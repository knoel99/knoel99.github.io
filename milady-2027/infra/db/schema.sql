-- =============================================================================================
-- Catalogue MilaDy — schéma PostgreSQL 16 (version 1.0)
--
-- Équivalent exact du modèle SQLAlchemy milady/catalog/models.py (mêmes tables, colonnes, contraintes
-- CHECK et index ; tests/test_catalog.py vérifie la concordance). En mode portable (SQLite), le même
-- schéma est créé par SQLAlchemy (Catalog(create=True)) ; ce fichier sert à PostgreSQL :
--   - automatiquement au premier démarrage du service « db » du docker-compose
--     (montage dans /docker-entrypoint-initdb.d/) ;
--   - à la main :  psql "$MILADY_DB_URL" -v ON_ERROR_STOP=1 -f infra/db/schema.sql
-- Idempotent : CREATE … IF NOT EXISTS, CREATE OR REPLACE VIEW. Identifiants UUID, horodatages UTC
-- (timestamptz), paramètres en JSONB. MLflow utilise une base distincte (pas de table ici).
--
-- Évolutions : CREATE TABLE IF NOT EXISTS ne modifie pas une table existante. Tant que le schéma est
-- en version 1.0, toute modification se fait à l'identique ici et dans models.py (le test de
-- concordance compare colonnes, types, DEFAULT, contraintes et index). Dès qu'une base de production
-- contient des résultats à garder, passer par des migrations Alembic (voir l'en-tête de
-- milady/catalog/models.py) plutôt que par des ALTER TABLE à la main.
-- =============================================================================================

BEGIN;

-- Campagne : ensemble de simulations décrit par un fichier YAML (infra/configs/*.yaml).
CREATE TABLE IF NOT EXISTS campaign (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    description  TEXT         NOT NULL DEFAULT '',
    config_yaml  TEXT         NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (name)
);

-- Jeu de données versionné (liste figée de fichiers répartis en train / val / test).
CREATE TABLE IF NOT EXISTS dataset (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    version      VARCHAR(32)  NOT NULL,
    description  TEXT         NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT uq_dataset_name_version UNIQUE (name, version)
);

-- Modèle génératif entraîné ; mlflow_run_id relie à l'exécution MLflow, checkpoint_uri au stockage S3.
CREATE TABLE IF NOT EXISTS model (
    id                    UUID         NOT NULL DEFAULT gen_random_uuid(),
    name                  VARCHAR(200) NOT NULL,
    architecture          VARCHAR(200) NOT NULL DEFAULT '',
    constraint_mechanism  VARCHAR(200) NOT NULL DEFAULT '',
    hyperparams           JSONB        NOT NULL DEFAULT '{}'::jsonb,
    dataset_id            UUID,
    mlflow_run_id         VARCHAR(64),
    checkpoint_uri        TEXT,
    git_commit            VARCHAR(64)  NOT NULL DEFAULT '',
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (dataset_id) REFERENCES dataset (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS ix_model_name    ON model (name);
CREATE INDEX IF NOT EXISTS ix_model_dataset ON model (dataset_id);

-- Simulation : un code, un jeu de paramètres, une grille.
CREATE TABLE IF NOT EXISTS simulation (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    campaign_id   UUID         NOT NULL,
    code          VARCHAR(64)  NOT NULL,
    code_version  VARCHAR(64)  NOT NULL DEFAULT '',
    git_commit    VARCHAR(64)  NOT NULL DEFAULT '',
    parameters    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    grid          JSONB        NOT NULL DEFAULT '{}'::jsonb,
    status        VARCHAR(16)  NOT NULL DEFAULT 'queued',
    host          VARCHAR(255) NOT NULL DEFAULT '',
    n_gpus        INTEGER      NOT NULL DEFAULT 0,
    n_cpus        INTEGER      NOT NULL DEFAULT 0,
    wall_time_s   DOUBLE PRECISION,
    started_at    TIMESTAMPTZ,
    finished_at   TIMESTAMPTZ,
    notes         TEXT         NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT ck_simulation_status CHECK (status IN ('queued', 'running', 'done', 'failed')),
    CONSTRAINT ck_simulation_resources CHECK (n_gpus >= 0 AND n_cpus >= 0),
    FOREIGN KEY (campaign_id) REFERENCES campaign (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_simulation_campaign   ON simulation (campaign_id);
CREATE INDEX IF NOT EXISTS ix_simulation_status     ON simulation (status);
-- Requêtes sur les paramètres : parameters @> '{"Rm": 12.0}', parameters ? 'mu_r'…
CREATE INDEX IF NOT EXISTS ix_simulation_parameters ON simulation USING gin (parameters);

-- Séries temporelles légères (énergies, dissipation, hélicités, max |div B|) pour les requêtes rapides.
CREATE TABLE IF NOT EXISTS diagnostic (
    simulation_id  UUID             NOT NULL,
    name           VARCHAR(64)      NOT NULL,
    t              DOUBLE PRECISION NOT NULL,
    value          DOUBLE PRECISION,
    PRIMARY KEY (simulation_id, name, t),
    FOREIGN KEY (simulation_id) REFERENCES simulation (id) ON DELETE CASCADE
);

-- Une mesure d'une métrique pour un modèle, à paramètres physiques et graine donnés.
CREATE TABLE IF NOT EXISTS evaluation (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    model_id    UUID             NOT NULL,
    parameters  JSONB            NOT NULL DEFAULT '{}'::jsonb,
    metric      VARCHAR(100)     NOT NULL,
    value       DOUBLE PRECISION,
    n_samples   INTEGER          NOT NULL DEFAULT 0,
    seed        INTEGER          NOT NULL DEFAULT 0,
    details     JSONB,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT ck_evaluation_n_samples CHECK (n_samples >= 0),
    FOREIGN KEY (model_id) REFERENCES model (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_evaluation_model_metric ON evaluation (model_id, metric);

-- Fichier produit par une simulation (MFF, points de contrôle, journaux), repéré par son URI
-- ({MILADY_STORAGE_URI}/{campagne}/{uuid_simulation}/{kind}.h5).
CREATE TABLE IF NOT EXISTS file (
    id              UUID             NOT NULL DEFAULT gen_random_uuid(),
    simulation_id   UUID             NOT NULL,
    kind            VARCHAR(16)      NOT NULL,
    uri             TEXT             NOT NULL,
    format_version  VARCHAR(16)      NOT NULL DEFAULT '1.0',
    size_bytes      BIGINT           NOT NULL DEFAULT 0,
    sha256          VARCHAR(64)      NOT NULL DEFAULT '',
    n_t             INTEGER,
    t_start         DOUBLE PRECISION,
    t_end           DOUBLE PRECISION,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT ck_file_kind CHECK (kind IN ('fields', 'spectral', 'diagnostics', 'checkpoint', 'log')),
    CONSTRAINT ck_file_size CHECK (size_bytes >= 0),
    FOREIGN KEY (simulation_id) REFERENCES simulation (id) ON DELETE CASCADE,
    UNIQUE (uri)
);
CREATE INDEX IF NOT EXISTS ix_file_simulation ON file (simulation_id);
CREATE INDEX IF NOT EXISTS ix_file_kind       ON file (kind);

-- Tâche soumise à un ordonnanceur ; porte sur une simulation ou un modèle (ou aucun : tableau de jobs).
CREATE TABLE IF NOT EXISTS job (
    id             UUID         NOT NULL DEFAULT gen_random_uuid(),
    kind           VARCHAR(32)  NOT NULL,
    scheduler      VARCHAR(16)  NOT NULL,
    external_id    VARCHAR(128) NOT NULL DEFAULT '',
    simulation_id  UUID,
    model_id       UUID,
    status         VARCHAR(16)  NOT NULL DEFAULT 'queued',
    submitted_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    started_at     TIMESTAMPTZ,
    finished_at    TIMESTAMPTZ,
    log_uri        TEXT         NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    CONSTRAINT ck_job_scheduler CHECK (scheduler IN ('local', 'docker', 'slurm')),
    CONSTRAINT ck_job_status CHECK (status IN ('queued', 'submitted', 'running', 'done', 'failed', 'cancelled')),
    CONSTRAINT ck_job_target CHECK (simulation_id IS NULL OR model_id IS NULL),
    FOREIGN KEY (simulation_id) REFERENCES simulation (id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES model (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS ix_job_status     ON job (status);
CREATE INDEX IF NOT EXISTS ix_job_external   ON job (scheduler, external_id);
-- Clés étrangères indexées : tâches d'une simulation ou d'un modèle, et ON DELETE SET NULL sans balayage.
CREATE INDEX IF NOT EXISTS ix_job_simulation ON job (simulation_id);
CREATE INDEX IF NOT EXISTS ix_job_model      ON job (model_id);

-- Appartenance d'un fichier à un jeu de données, avec sa partition.
CREATE TABLE IF NOT EXISTS dataset_member (
    dataset_id  UUID       NOT NULL,
    file_id     UUID       NOT NULL,
    split       VARCHAR(8) NOT NULL,
    PRIMARY KEY (dataset_id, file_id),
    CONSTRAINT ck_dataset_member_split CHECK (split IN ('train', 'val', 'test')),
    FOREIGN KEY (dataset_id) REFERENCES dataset (id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_dataset_member_file ON dataset_member (file_id);

-- Synthèse des évaluations : moyenne et écart-type (sur les graines) par modèle, métrique et paramètres.
-- Même requête que VIEW_EVAL_SUMMARY_SQL dans milady/catalog/models.py.
CREATE OR REPLACE VIEW v_eval_summary AS
SELECT e.model_id                AS model_id,
       m.name                    AS model_name,
       m.constraint_mechanism    AS constraint_mechanism,
       e.metric                  AS metric,
       e.parameters              AS parameters,
       COUNT(e.value)            AS n_runs,
       AVG(e.value)              AS mean,
       STDDEV_SAMP(e.value)      AS std,
       MIN(e.value)              AS min,
       MAX(e.value)              AS max,
       SUM(e.n_samples)          AS n_samples_total
FROM evaluation e
JOIN model m ON m.id = e.model_id
GROUP BY e.model_id, m.name, m.constraint_mechanism, e.metric, e.parameters;

COMMENT ON TABLE campaign       IS 'Campagne de simulations (configuration YAML)';
COMMENT ON TABLE simulation     IS 'Simulation : code, paramètres physiques (JSONB), grille, statut, ressources';
COMMENT ON TABLE file           IS 'Fichier produit (MFF 1.0, point de contrôle, journal), URI et SHA-256';
COMMENT ON TABLE diagnostic     IS 'Séries temporelles légères (moyenne sur les trajectoires)';
COMMENT ON TABLE dataset        IS 'Jeu de données versionné et figé';
COMMENT ON TABLE dataset_member IS 'Fichiers d''un jeu de données et partition (train, val, test)';
COMMENT ON TABLE model          IS 'Modèle génératif entraîné (lien MLflow et point de contrôle)';
COMMENT ON TABLE evaluation     IS 'Mesure d''une métrique physique ou statistique d''un modèle';
COMMENT ON TABLE job            IS 'Tâche soumise (local, docker, slurm)';
COMMENT ON VIEW  v_eval_summary IS 'Moyenne et écart-type des évaluations par modèle, métrique et paramètres';

COMMIT;
