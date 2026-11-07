-- Initialisation de PostgreSQL pour MilaDy (exécuté une seule fois, à la création du volume, par
-- l'image officielle postgres via /docker-entrypoint-initdb.d/, connecté à la base POSTGRES_DB).
--
-- Bases :
--   milady  catalogue des campagnes, simulations, fichiers, jeux de données, modèles, évaluations
--           (créée par l'image à partir de POSTGRES_DB ; recréée ici si on a choisi un autre nom) ;
--           les tables sont créées par infra/db/schema.sql (exécuté juste après ce fichier, par
--           ordre alphabétique) ou, à défaut, par milady.catalog (SQLAlchemy, create_all) ;
--   mlflow  métadonnées du serveur MLflow (tables créées par MLflow au premier démarrage).
--
-- Idempotent : peut être rejoué à la main sans erreur :
--   docker compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env \
--     exec -T db psql -U milady -d postgres -f /docker-entrypoint-initdb.d/init.sql

SELECT 'CREATE DATABASE milady'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'milady')\gexec

SELECT 'CREATE DATABASE mlflow'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow')\gexec

-- Horodatages en UTC dans les deux bases (le catalogue stocke des timestamptz UTC).
ALTER DATABASE milady SET timezone TO 'UTC';
ALTER DATABASE mlflow SET timezone TO 'UTC';

-- Extension utile au catalogue (gen_random_uuid est natif depuis PostgreSQL 13 ; pg_trgm sert
-- aux recherches textuelles sur les noms de campagnes et de modèles).
\connect milady
CREATE EXTENSION IF NOT EXISTS pg_trgm;
