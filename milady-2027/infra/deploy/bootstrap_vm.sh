#!/usr/bin/env bash
# Installation complète de MilaDy sur une VM Ubuntu 22.04 / 24.04 neuve (cloud GPU ou CPU).
#
# Usage (depuis le dépôt cloné) :
#   git clone https://github.com/knoel99/milady-2027.git && cd milady-2027
#   sudo infra/deploy/bootstrap_vm.sh [--cpu] [--no-smoke] [--no-build]
#
# Étapes (chacune idempotente : relancer le script ne casse rien) :
#   1. paquets système de base ;
#   2. Docker Engine + plugin compose depuis le dépôt officiel Docker ;
#   3. si nvidia-smi voit un GPU : NVIDIA Container Toolkit (dépôt officiel NVIDIA) ;
#      sinon, message explicite (installer le pilote ou choisir une image GPU du fournisseur) ;
#   4. infra/docker/.env avec mots de passe aléatoires (openssl rand), jamais écrasé ;
#   5. construction des images (milady:gpu ou milady:cpu, serveur MLflow) ;
#   6. démarrage de db (PostgreSQL), s3 (MinIO), mlflow et attente des healthchecks ;
#   7. make smoke (simulation minuscule → MFF → S3 → catalogue → entraînement → évaluation).
#
# Options :
#   --cpu        ignorer le GPU même s'il est présent (image CPU)
#   --no-smoke   ne pas lancer le test de fumée
#   --no-build   ne pas (re)construire les images (déjà construites)
#   -h, --help   cette aide
#
# Variables facultatives :
#   MILADY_BUILD_CACERT=/chemin/ca.pem   certificat d'un proxy TLS (construction des images)
set -euo pipefail

# --- Arguments --------------------------------------------------------------------------------
FORCE_CPU=0
RUN_SMOKE=1
DO_BUILD=1
while [[ $# -gt 0 ]]; do
    case "$1" in
        --cpu) FORCE_CPU=1 ;;
        --no-smoke) RUN_SMOKE=0 ;;
        --no-build) DO_BUILD=0 ;;
        -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
        *) echo "Option inconnue : $1 (voir --help)" >&2; exit 2 ;;
    esac
    shift
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${REPO_ROOT}/infra/docker/.env"
COMPOSE=(docker compose -f "${REPO_ROOT}/infra/docker/docker-compose.yml" --env-file "${ENV_FILE}")
OWNER="${SUDO_USER:-$(id -un)}"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m[attention]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[erreur]\033[0m %s\n' "$*" >&2; exit 1; }

[[ "$(id -u)" -eq 0 ]] || die "lancer avec sudo : sudo $0 $*"
[[ -f "${REPO_ROOT}/infra/docker/docker-compose.yml" ]] || die "dépôt incomplet : ${REPO_ROOT}"

# --- 0. Système -------------------------------------------------------------------------------
# shellcheck disable=SC1091
. /etc/os-release
if [[ "${ID:-}" != "ubuntu" ]]; then
    warn "système ${PRETTY_NAME:-inconnu} : script prévu pour Ubuntu 22.04/24.04 (on continue)."
elif [[ "${VERSION_ID:-}" != "22.04" && "${VERSION_ID:-}" != "24.04" ]]; then
    warn "Ubuntu ${VERSION_ID} non testé (22.04 et 24.04 le sont) : on continue."
fi
CODENAME="${UBUNTU_CODENAME:-${VERSION_CODENAME:-}}"
export DEBIAN_FRONTEND=noninteractive

# --- 1. Paquets de base -----------------------------------------------------------------------
log "1/7 Paquets système de base"
apt-get update -y
apt-get install -y --no-install-recommends \
    ca-certificates curl gnupg git make openssl rsync jq pciutils htop tmux unzip python3 python3-yaml

# --- 2. Docker (dépôt officiel) ---------------------------------------------------------------
log "2/7 Docker Engine + compose"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "Docker déjà installé : $(docker --version) ; $(docker compose version)"
else
    # Procédure de https://docs.docker.com/engine/install/ubuntu/ (vérifiée le 2026-11-07).
    # a) Paquets concurrents (docker.io d'Ubuntu, podman-docker…) : ils empêchent l'installation de
    #    docker-ce. « apt-get remove » (et non purge) conserve /var/lib/docker (images, volumes).
    mapfile -t conflicts < <(dpkg-query -W -f='${binary:Package} ${db:Status-Status}\n' \
        docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc \
        2>/dev/null | awk '$2 == "installed" {print $1}')
    if [[ ${#conflicts[@]} -gt 0 ]]; then
        warn "paquets incompatibles avec Docker CE, retirés : ${conflicts[*]}"
        apt-get remove -y "${conflicts[@]}"
    fi
    # b) Clé GPG et dépôt officiels, au format deb822 de la documentation actuelle.
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    rm -f /etc/apt/sources.list.d/docker.list   # ancienne syntaxe d'une ligne : pas de source en double
    printf '%s\n' \
        "Types: deb" \
        "URIs: https://download.docker.com/linux/ubuntu" \
        "Suites: ${CODENAME}" \
        "Components: stable" \
        "Architectures: $(dpkg --print-architecture)" \
        "Signed-By: /etc/apt/keyrings/docker.asc" \
        > /etc/apt/sources.list.d/docker.sources
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
# systemd absent (WSL, conteneur) : Docker est supposé déjà lancé.
has_systemd() { command -v systemctl >/dev/null 2>&1 && [[ -d /run/systemd/system ]]; }
if has_systemd; then
    systemctl enable --now docker
fi
docker info >/dev/null 2>&1 || die "le démon Docker ne répond pas (systemctl status docker)"
if [[ "${OWNER}" != "root" ]] && ! id -nG "${OWNER}" | tr ' ' '\n' | grep -qx docker; then
    usermod -aG docker "${OWNER}"
    echo "Utilisateur ${OWNER} ajouté au groupe docker (effectif à la prochaine connexion SSH)."
fi

# --- 3. GPU NVIDIA ----------------------------------------------------------------------------
log "3/7 GPU NVIDIA"
GPU=0
if [[ ${FORCE_CPU} -eq 1 ]]; then
    echo "--cpu : GPU ignoré."
elif command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L >/dev/null 2>&1; then
    GPU=1
    nvidia-smi -L
    nvidia-smi --query-gpu=driver_version,memory.total --format=csv,noheader | head -n 1
    if ! command -v nvidia-ctk >/dev/null 2>&1; then
        # Procédure de la documentation NVIDIA (install-guide, dépôt « stable », vérifiée le 2026-11-07).
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey \
            | gpg --dearmor --yes -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -fsSL https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list \
            | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' \
            > /etc/apt/sources.list.d/nvidia-container-toolkit.list
        apt-get update -y
        apt-get install -y nvidia-container-toolkit
    else
        echo "NVIDIA Container Toolkit déjà installé : $(nvidia-ctk --version | head -n 1)"
    fi
    # Déclare le runtime nvidia dans /etc/docker/daemon.json (idempotent). Docker n'est redémarré que
    # si le fichier a changé : relancer le script n'interrompt pas les conteneurs en cours.
    daemon_before="$(sha256sum /etc/docker/daemon.json 2>/dev/null || true)"
    nvidia-ctk runtime configure --runtime=docker
    if [[ "$(sha256sum /etc/docker/daemon.json 2>/dev/null || true)" != "${daemon_before}" ]]; then
        if has_systemd; then systemctl restart docker; else warn "redémarrer le démon Docker à la main"; fi
    else
        echo "Runtime nvidia déjà déclaré à Docker : pas de redémarrage."
    fi
elif lspci 2>/dev/null | grep -qi nvidia; then
    warn "carte NVIDIA présente mais pilote absent (nvidia-smi ne répond pas)."
    cat >&2 <<'MSG'
  Deux solutions :
    a) installer le pilote puis redémarrer la VM, et relancer ce script :
         sudo apt-get install -y ubuntu-drivers-common && sudo ubuntu-drivers install --gpgpu
         sudo reboot
    b) recréer la VM avec une image « GPU / Deep Learning » du fournisseur (pilote NVIDIA
       préinstallé), c'est le plus simple.
  On continue en mode CPU (image milady:cpu) en attendant.
MSG
else
    echo "Aucun GPU NVIDIA détecté : mode CPU. (Pour une VM GPU, choisir une image du fournisseur"
    echo "avec pilote NVIDIA préinstallé, ou installer le pilote : ubuntu-drivers install --gpgpu.)"
fi
WORKER=worker
[[ ${GPU} -eq 1 ]] && WORKER=worker-gpu

# --- 4. Fichier .env --------------------------------------------------------------------------
log "4/7 Configuration infra/docker/.env"
if [[ ${GPU} -eq 1 ]]; then
    "${REPO_ROOT}/infra/deploy/gen_env.sh" --gpu --owner "${OWNER}"
else
    "${REPO_ROOT}/infra/deploy/gen_env.sh" --cpu --owner "${OWNER}"
fi
# Le conteneur de calcul choisi ici prime sur une valeur antérieure (ex. passage CPU → GPU).
sed -i "s/^MILADY_WORKER=.*/MILADY_WORKER=${WORKER}/" "${ENV_FILE}"
# Provenance : commit du dépôt (lu en tant que propriétaire pour éviter « dubious ownership »).
GIT_COMMIT="$(sudo -u "${OWNER}" git -C "${REPO_ROOT}" rev-parse --short=12 HEAD 2>/dev/null || true)"
export GIT_COMMIT

# Données locales (dépôt monté dans les conteneurs) : data/ appartient à l'UID du conteneur.
CUID="$(sed -n 's/^MILADY_UID=//p' "${ENV_FILE}" | tail -n 1)"
CGID="$(sed -n 's/^MILADY_GID=//p' "${ENV_FILE}" | tail -n 1)"
install -d -o "${CUID:-1000}" -g "${CGID:-1000}" "${REPO_ROOT}/data"

# --- 5. Images ----------------------------------------------------------------------------------
log "5/7 Construction des images (${WORKER}, mlflow)"
if [[ ${DO_BUILD} -eq 1 ]]; then
    # Via le Makefile (docker build) : accepte MILADY_BUILD_CACERT, mêmes noms d'images que compose.
    if [[ ${GPU} -eq 1 ]]; then
        make -C "${REPO_ROOT}" image-gpu image-mlflow
    else
        make -C "${REPO_ROOT}" image image-mlflow
    fi
else
    echo "--no-build : construction sautée."
fi
if [[ ${GPU} -eq 1 ]]; then
    echo "Vérification de l'accès GPU depuis un conteneur :"
    "${COMPOSE[@]}" run --rm --no-deps "${WORKER}" nvidia-smi -L \
        || die "le conteneur ne voit pas le GPU (vérifier nvidia-ctk runtime configure, puis redémarrer Docker)"
fi

# --- 6. Services --------------------------------------------------------------------------------
log "6/7 Démarrage de db, s3, mlflow (attente des healthchecks)"
"${COMPOSE[@]}" up -d --wait --wait-timeout 300 db s3 mlflow
"${COMPOSE[@]}" ps --all

# --- 7. Test de fumée -------------------------------------------------------------------------
if [[ ${RUN_SMOKE} -eq 1 ]]; then
    log "7/7 Test de fumée (make smoke)"
    make -C "${REPO_ROOT}" smoke RUN=docker WORKER="${WORKER}"
else
    log "7/7 Test de fumée sauté (--no-smoke) ; plus tard : make smoke"
fi

# --- Résumé -------------------------------------------------------------------------------------
IP="$(curl -fsS -m 3 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')"
cat <<EOF

MilaDy est prêt sur cette machine (conteneur de calcul : ${WORKER}).

Depuis votre portable, ouvrir un tunnel SSH vers les interfaces web (ports liés à 127.0.0.1) :
  ssh -N -L 5000:localhost:5000 -L 9001:localhost:9001 -L 8888:localhost:8888 ${OWNER}@${IP}
  MLflow : http://localhost:5000     console MinIO : http://localhost:9001
  (identifiants MinIO : S3_ROOT_USER / S3_ROOT_PASSWORD dans ${ENV_FILE})

Commandes utiles (dans ${REPO_ROOT}) :
  make sweep CONFIG=infra/configs/palier2_abc3d.yaml     campagne de simulations
  make train CONFIG=infra/configs/train_fm3d.yaml        entraînement
  make backup BACKUP_TARGET=s3://mon-bucket/sauvegardes  sauvegarde (avant d'éteindre !)
  make down                                              arrêt des services

FACTURATION : une VM GPU arrêtée (« stopped ») peut rester facturée (disque, IP, parfois le GPU
selon le fournisseur). Après sauvegarde, SUPPRIMER la VM (voir infra/README.md, « Arrêter de payer »).
EOF
