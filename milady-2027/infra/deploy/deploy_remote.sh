#!/usr/bin/env bash
# Déploie MilaDy sur une VM distante depuis le portable : copie du dépôt (rsync) ou clone git sur la
# VM, puis lancement de bootstrap_vm.sh par SSH.
#
# Usage :
#   infra/deploy/deploy_remote.sh utilisateur@hôte [options] [-- options de bootstrap_vm.sh]
#
# Options :
#   -i CLÉ          clé SSH privée (sinon agent / ~/.ssh/config)
#   -p PORT         port SSH (défaut 22)
#   --dir DOSSIER   dossier distant (défaut : ~/milady-2027)
#   --git URL       cloner/mettre à jour depuis cette URL sur la VM au lieu de copier l'arbre local
#   --branch B      branche pour --git (défaut : main)
#   --sync-only     copier seulement, sans lancer bootstrap_vm.sh
#   -h, --help      cette aide
#
# Exemples :
#   infra/deploy/deploy_remote.sh ubuntu@51.15.0.10
#   infra/deploy/deploy_remote.sh ubuntu@51.15.0.10 -i ~/.ssh/id_ed25519 -- --no-smoke
#   infra/deploy/deploy_remote.sh ubuntu@gpu-vm --git https://github.com/knoel99/milady-2027.git
#
# La copie exclut les secrets (tout fichier .env, dont infra/docker/.env : la VM génère les siens),
# les données (data/), les environnements virtuels et les images Apptainer. Relancer le script met la
# VM à jour (idempotent).
set -euo pipefail

usage() { sed -n '2,24p' "$0"; }

[[ $# -ge 1 ]] || { usage; exit 2; }
case "$1" in -h|--help) usage; exit 0 ;; esac
TARGET="$1"; shift

SSH_OPTS=(-o ServerAliveInterval=30 -o StrictHostKeyChecking=accept-new)
REMOTE_DIR="milady-2027"
GIT_URL=""
BRANCH="main"
SYNC_ONLY=0
BOOTSTRAP_ARGS=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -i) SSH_OPTS+=(-i "$2"); shift ;;
        -p) SSH_OPTS+=(-p "$2"); shift ;;
        --dir) REMOTE_DIR="$2"; shift ;;
        --git) GIT_URL="$2"; shift ;;
        --branch) BRANCH="$2"; shift ;;
        --sync-only) SYNC_ONLY=1 ;;
        --) shift; BOOTSTRAP_ARGS=("$@"); break ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Option inconnue : $1 (voir --help)" >&2; exit 2 ;;
    esac
    shift
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck disable=SC2029  # les arguments sont volontairement développés côté portable
ssh_run() { ssh "${SSH_OPTS[@]}" "${TARGET}" "$@"; }

echo "==> Connexion à ${TARGET}"
# shellcheck disable=SC2016  # développé sur la VM
ssh_run 'echo "   $(hostname) : $(. /etc/os-release && echo "$PRETTY_NAME"), $(nproc) CPU, $(free -g | awk "/Mem:/{print \$2}") Go RAM"; command -v nvidia-smi >/dev/null && nvidia-smi -L || echo "   (pas de nvidia-smi)"'

if [[ -n "${GIT_URL}" ]]; then
    echo "==> Clone / mise à jour git sur la VM (${GIT_URL}, ${BRANCH})"
    # Les variables sont développées ici (côté portable) : guillemets simples dans la commande distante.
    ssh_run "set -euo pipefail
        command -v git >/dev/null || { sudo apt-get update -y && sudo apt-get install -y git make; }
        if [ -d '${REMOTE_DIR}/.git' ]; then
            git -C '${REMOTE_DIR}' fetch --tags origin
            git -C '${REMOTE_DIR}' checkout '${BRANCH}'
            git -C '${REMOTE_DIR}' pull --ff-only
        else
            git clone --branch '${BRANCH}' '${GIT_URL}' '${REMOTE_DIR}'
        fi"
else
    echo "==> Copie de l'arbre local vers ${TARGET}:${REMOTE_DIR} (rsync)"
    ssh_run "command -v rsync >/dev/null || { sudo apt-get update -y && sudo apt-get install -y rsync make; }; mkdir -p '${REMOTE_DIR}'"
    # Les fichiers exclus ne sont ni copiés ni supprimés côté VM (--delete ne touche pas aux exclus).
    # Motifs ancrés (« /data/ ») : le paquet milady/data/ doit, lui, être copié.
    rsync -az --delete --info=stats1 \
        -e "ssh ${SSH_OPTS[*]}" \
        --exclude '/.venv/' --exclude '/.venv-front/' --exclude '/data/' --exclude '/backups/' \
        --exclude '/mlruns/' --exclude '.env' --exclude '/*.sif' --exclude '*.tar' \
        --exclude '__pycache__/' --exclude '.pytest_cache/' --exclude '.quarto/' \
        --exclude 'node_modules/' \
        "${REPO_ROOT}/" "${TARGET}:${REMOTE_DIR}/"
fi

if [[ ${SYNC_ONLY} -eq 1 ]]; then
    echo "==> --sync-only : bootstrap non lancé. Sur la VM : cd ${REMOTE_DIR} && sudo infra/deploy/bootstrap_vm.sh"
    exit 0
fi

echo "==> bootstrap_vm.sh ${BOOTSTRAP_ARGS[*]:-} (sudo sur la VM ; mot de passe éventuel demandé)"
# -t : pseudo-terminal pour sudo et l'affichage en direct.
ssh -t "${SSH_OPTS[@]}" "${TARGET}" "cd '${REMOTE_DIR}' && sudo infra/deploy/bootstrap_vm.sh ${BOOTSTRAP_ARGS[*]:-}"

host="${TARGET#*@}"
cat <<EOF

==> Déploiement terminé. Interfaces web par tunnel SSH :
    ssh -N -L 5000:localhost:5000 -L 9001:localhost:9001 ${TARGET}
    puis http://localhost:5000 (MLflow) et http://localhost:9001 (console MinIO).
    Commandes : ssh ${TARGET} 'cd ${REMOTE_DIR} && make sweep CONFIG=infra/configs/palier2_abc3d.yaml'
    Ne pas oublier : make backup puis supprimer la VM ${host} pour arrêter la facturation.
EOF
