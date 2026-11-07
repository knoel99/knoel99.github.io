#!/usr/bin/env bash
# Génère infra/docker/.env à partir de infra/docker/.env.example, avec des mots de passe aléatoires.
#
# Usage : infra/deploy/gen_env.sh [--gpu|--cpu] [--owner UTILISATEUR]
#   --gpu / --cpu    force le conteneur de calcul (worker-gpu / worker) ; défaut : détection nvidia-smi
#   --owner U        utilisateur propriétaire du dépôt (UID/GID du conteneur) ; défaut : $SUDO_USER
#                    ou l'utilisateur courant
#
# Idempotent : si .env existe déjà, il n'est JAMAIS écrasé (les mots de passe sont déjà inscrits
# dans les volumes PostgreSQL et MinIO) ; seules les variables absentes sont ajoutées.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXAMPLE="${REPO_ROOT}/infra/docker/.env.example"
TARGET="${REPO_ROOT}/infra/docker/.env"

worker=""
owner="${SUDO_USER:-$(id -un)}"
while [[ $# -gt 0 ]]; do
    case "$1" in
        --gpu) worker="worker-gpu" ;;
        --cpu) worker="worker" ;;
        --owner) owner="$2"; shift ;;
        -h|--help) sed -n '2,11p' "$0"; exit 0 ;;
        *) echo "Option inconnue : $1" >&2; exit 2 ;;
    esac
    shift
done

# Détection du GPU si non imposée.
if [[ -z "${worker}" ]]; then
    if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L >/dev/null 2>&1; then
        worker="worker-gpu"
    else
        worker="worker"
    fi
fi

# Secret aléatoire alphanumérique (sans caractère spécial : il est inséré dans des URL).
rand() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex "${1:-24}"
    else
        head -c "${1:-24}" /dev/urandom | od -An -tx1 | tr -d ' \n'
    fi
}

uid="$(id -u "${owner}")"
gid="$(id -g "${owner}")"
if [[ "${uid}" -eq 0 ]]; then
    # Les conteneurs tournent sans root : dépôt possédé par root → UID/GID 1000 dans le conteneur
    # (bootstrap_vm.sh donne alors data/ à l'UID 1000).
    echo "Propriétaire root : conteneurs en UID/GID 1000 (cloner le dépôt avec un utilisateur normal est préférable)."
    uid=1000
    gid=1000
fi
host="$(hostname -s 2>/dev/null || hostname)"

if [[ -f "${TARGET}" ]]; then
    echo ".env existe déjà (${TARGET}) : conservé tel quel."
    # Complète seulement les variables nouvelles du modèle (mise à jour du dépôt).
    added=0
    while IFS= read -r line; do
        [[ "${line}" =~ ^([A-Z_][A-Z0-9_]*)= ]] || continue
        key="${BASH_REMATCH[1]}"
        if ! grep -q "^${key}=" "${TARGET}"; then
            value="${line#*=}"
            [[ "${value}" == "change-me" ]] && value="$(rand 24)"
            printf '%s=%s\n' "${key}" "${value}" >> "${TARGET}"
            echo "  variable ajoutée : ${key}"
            added=$((added + 1))
        fi
    done < "${EXAMPLE}"
    [[ ${added} -eq 0 ]] || echo "  ${added} variable(s) ajoutée(s)."
    exit 0
fi

umask 077
tmp="$(mktemp "${TARGET}.XXXXXX")"
trap 'rm -f "${tmp}"' EXIT
{
    echo "# Généré par infra/deploy/gen_env.sh le $(date -u +%Y-%m-%dT%H:%M:%SZ) — NE PAS COMMITER."
    while IFS= read -r line; do
        if [[ "${line}" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            case "${key}" in
                MILADY_WORKER) value="${worker}" ;;
                MILADY_UID) value="${uid}" ;;
                MILADY_GID) value="${gid}" ;;
                MILADY_HOST) value="${host}" ;;
            esac
            [[ "${value}" == "change-me" ]] && value="$(rand 24)"
            printf '%s=%s\n' "${key}" "${value}"
        else
            printf '%s\n' "${line}"
        fi
    done < "${EXAMPLE}"
} > "${tmp}"
mv "${tmp}" "${TARGET}"
trap - EXIT
chmod 600 "${TARGET}"
# Le propriétaire du dépôt doit pouvoir lire .env (make sans sudo).
if [[ "$(id -u)" -eq 0 && "${owner}" != "root" ]]; then
    chown "$(id -u "${owner}"):$(id -g "${owner}")" "${TARGET}"
fi
echo "Créé : ${TARGET} (conteneur de calcul : ${worker}, UID ${uid})."
