#!/usr/bin/env bash
# Sauvegarde de la pile MilaDy : dumps PostgreSQL compressés (catalogue « milady » et « mlflow ») et
# miroir du stockage objet (buckets milady-data, milady-models, mlflow) vers une cible.
#
# Usage :
#   infra/deploy/backup.sh CIBLE [--keep N] [--no-objects]
#
# CIBLE :
#   /chemin/dossier       disque local ou volume monté (ex. disque bloc du fournisseur) ;
#   s3://bucket/préfixe   bucket d'un fournisseur S3 ; identifiants dans l'environnement :
#                           BACKUP_S3_ENDPOINT   (ex. https://s3.fr-par.scw.cloud)
#                           BACKUP_ACCESS_KEY, BACKUP_SECRET_KEY
#
# Options :
#   --keep N       (cible locale) ne conserver que les N derniers dumps par base (défaut 14)
#   --no-objects   dumps PostgreSQL seulement (pas de miroir S3)
#
# Résultat :
#   CIBLE/db/milady-AAAAMMJJTHHMMSSZ.dump, CIBLE/db/mlflow-….dump   (pg_dump -Fc, compressés)
#   CIBLE/objects/<bucket>/…                                       (mc mirror, incrémental)
# Restauration : voir infra/README.md, section « Sauvegarde et restauration ».
#
# Idempotent et incrémental : à lancer avant chaque arrêt de VM, ou par cron :
#   17 3 * * * cd ~/milady-2027 && infra/deploy/backup.sh s3://mon-bucket/milady >> backups.log 2>&1
set -euo pipefail

usage() { sed -n '2,24p' "$0"; }
[[ $# -ge 1 ]] || { usage; exit 2; }
case "$1" in -h|--help) usage; exit 0 ;; esac
TARGET="$1"; shift
KEEP=14
OBJECTS=1
while [[ $# -gt 0 ]]; do
    case "$1" in
        --keep) KEEP="$2"; shift ;;
        --no-objects) OBJECTS=0 ;;
        *) echo "Option inconnue : $1" >&2; exit 2 ;;
    esac
    shift
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${MILADY_ENV_FILE:-${REPO_ROOT}/infra/docker/.env}"
[[ -f "${ENV_FILE}" ]] || { echo "infra/docker/.env absent : rien à sauvegarder ici." >&2; exit 1; }
COMPOSE=(docker compose -f "${REPO_ROOT}/infra/docker/docker-compose.yml" --env-file "${ENV_FILE}")
env_get() { sed -n "s/^$1=//p" "${ENV_FILE}" | tail -n 1; }
PGUSER_="$(env_get POSTGRES_USER)"; PGUSER_="${PGUSER_:-milady}"
PGDB_="$(env_get POSTGRES_DB)"; PGDB_="${PGDB_:-milady}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"

# Dossier de travail : la cible elle-même si locale, sinon un dossier temporaire.
if [[ "${TARGET}" == s3://* ]]; then
    : "${BACKUP_S3_ENDPOINT:?définir BACKUP_S3_ENDPOINT pour une cible s3://}"
    : "${BACKUP_ACCESS_KEY:?définir BACKUP_ACCESS_KEY}"
    : "${BACKUP_SECRET_KEY:?définir BACKUP_SECRET_KEY}"
    WORK="$(mktemp -d)"
    trap 'rm -rf "${WORK}"' EXIT
    REMOTE=1
else
    mkdir -p "${TARGET}"
    WORK="$(cd "${TARGET}" && pwd)"
    REMOTE=0
fi
mkdir -p "${WORK}/db" "${WORK}/objects"

# --- 1. Dumps PostgreSQL ------------------------------------------------------------------------
"${COMPOSE[@]}" exec -T db pg_isready -U "${PGUSER_}" >/dev/null \
    || { echo "le service db ne répond pas (make up ?)" >&2; exit 1; }
for db in "${PGDB_}" mlflow; do
    out="${WORK}/db/${db}-${TS}.dump"
    echo "==> pg_dump ${db} → ${out}"
    # Format personnalisé (-Fc) compressé (-Z 6) : restauration sélective avec pg_restore.
    "${COMPOSE[@]}" exec -T db pg_dump -U "${PGUSER_}" -d "${db}" -Fc -Z 6 > "${out}.part"
    mv "${out}.part" "${out}"
    du -h "${out}" | awk '{print "    " $1}'
done
if [[ ${REMOTE} -eq 0 ]]; then
    # Rotation : on garde les KEEP derniers dumps de chaque base.
    for db in "${PGDB_}" mlflow; do
        # Noms horodatés sans caractère spécial : ls -t suffit pour trier.
        # shellcheck disable=SC2012
        mapfile -t old < <(ls -1t "${WORK}/db/${db}-"*.dump 2>/dev/null | tail -n "+$((KEEP + 1))")
        [[ ${#old[@]} -eq 0 ]] || rm -f -- "${old[@]}"
    done
fi

# --- 2. Miroir du stockage objet (mc, conteneur s3-init) ---------------------------------------
# Le conteneur mc rejoint le réseau compose (accès à http://s3:9000) ; la cible est montée sur /backup.
# shellcheck disable=SC2016  # développé dans le conteneur mc, pas ici
MC_SCRIPT='set -eu
mc alias set src http://s3:9000 "$S3_ROOT_USER" "$S3_ROOT_PASSWORD" >/dev/null
if [ -n "${DEST_URL:-}" ]; then
    mc alias set dst "$BACKUP_S3_ENDPOINT" "$BACKUP_ACCESS_KEY" "$BACKUP_SECRET_KEY" >/dev/null
    dest="dst/${DEST_URL#s3://}"
    if [ "$OBJECTS" = 1 ]; then
        for b in milady-data milady-models mlflow; do mc mirror --overwrite "src/$b" "$dest/objects/$b"; done
    fi
    mc mirror --overwrite /backup/db "$dest/db"
else
    if [ "$OBJECTS" = 1 ]; then
        for b in milady-data milady-models mlflow; do mc mirror --overwrite "src/$b" "/backup/objects/$b"; done
    fi
fi'
# Identifiants transmis au conteneur par leur nom (-e VAR) : jamais visibles dans la liste des processus.
export BACKUP_S3_ENDPOINT="${BACKUP_S3_ENDPOINT:-}" BACKUP_ACCESS_KEY="${BACKUP_ACCESS_KEY:-}" \
       BACKUP_SECRET_KEY="${BACKUP_SECRET_KEY:-}"
dest_url=""
[[ ${REMOTE} -eq 1 ]] && dest_url="${TARGET}"
echo "==> Miroir du stockage objet → ${TARGET}"
"${COMPOSE[@]}" run --rm --no-deps -T \
    --user "$(id -u):$(id -g)" \
    -e MC_CONFIG_DIR=/tmp/mc -e OBJECTS="${OBJECTS}" -e DEST_URL="${dest_url}" \
    -e BACKUP_S3_ENDPOINT -e BACKUP_ACCESS_KEY -e BACKUP_SECRET_KEY \
    -v "${WORK}:/backup" \
    --entrypoint /bin/sh s3-init -c "${MC_SCRIPT}"

echo "==> Sauvegarde terminée (${TS}) : ${TARGET}"
