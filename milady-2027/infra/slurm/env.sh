# shellcheck shell=bash
# Environnement commun aux gabarits Slurm MilaDy (sourcé par gen_data.sbatch, train.sbatch, eval.sbatch).
# Ne pas exécuter directement : `source infra/slurm/env.sh` dans un script Slurm.
#
# Toutes les variables sont surchargeables avant `sbatch` (Slurm transmet l'environnement de
# soumission par défaut) ou dans ~/.config/milady/slurm.env (lu s'il existe) :
#
#   MILADY_ROOT          dépôt cloné (défaut : dossier de soumission SLURM_SUBMIT_DIR)
#   MILADY_SIF           image Apptainer/Singularity ; défaut : $SINGULARITY_ALLOWED_DIR/milady.sif
#                        (Jean Zay), sinon $MILADY_ROOT/milady.sif ; « none » → pas de conteneur
#                        (venv MILADY_VENV ou module Python du centre)
#   MILADY_VENV          venv à activer quand MILADY_SIF=none (défaut : $MILADY_ROOT/.venv)
#   MILADY_MODULES       modules à charger (défaut : « singularity » si la commande module existe
#                        et qu'aucun apptainer/singularity n'est dans le PATH)
#   MILADY_DATA          racine des données (défaut : $SCRATCH/milady, sinon $WORK/milady, sinon
#                        $MILADY_ROOT/data)
#   MILADY_STATE         catalogue et suivi persistants (défaut : $WORK/milady, sinon $MILADY_ROOT/data)
#   MILADY_DB_URL        catalogue (défaut : sqlite:///$MILADY_STATE/catalog.sqlite ; PostgreSQL
#                        possible seulement si les nœuds de calcul le joignent)
#   MILADY_STORAGE_URI   stockage des fichiers MFF (défaut : file://$MILADY_DATA/store)
#   MLFLOW_TRACKING_URI  suivi (défaut : sqlite:///$MILADY_STATE/mlflow.db ; pas d'Internet sur
#                        les nœuds de calcul de Jean Zay)

if [[ -f "${HOME}/.config/milady/slurm.env" ]]; then
    # shellcheck disable=SC1091
    source "${HOME}/.config/milady/slurm.env"
fi

export MILADY_ROOT="${MILADY_ROOT:-${SLURM_SUBMIT_DIR:-$(pwd)}}"

# --- Modules et moteur de conteneurs ------------------------------------------------------------
if [[ -z "${MILADY_MODULES+x}" ]]; then
    MILADY_MODULES=""
    if ! command -v apptainer >/dev/null 2>&1 && ! command -v singularity >/dev/null 2>&1 \
        && command -v module >/dev/null 2>&1; then
        MILADY_MODULES="singularity"   # Jean Zay : « module load singularity »
    fi
fi
if [[ -n "${MILADY_MODULES}" ]] && command -v module >/dev/null 2>&1; then
    module purge
    # shellcheck disable=SC2086
    module load ${MILADY_MODULES}
fi
if command -v apptainer >/dev/null 2>&1; then
    MILADY_CONTAINER_CMD="apptainer"
elif command -v singularity >/dev/null 2>&1; then
    MILADY_CONTAINER_CMD="singularity"
else
    MILADY_CONTAINER_CMD=""
fi

if [[ -z "${MILADY_SIF:-}" ]]; then
    if [[ -n "${SINGULARITY_ALLOWED_DIR:-}" && -f "${SINGULARITY_ALLOWED_DIR}/milady.sif" ]]; then
        MILADY_SIF="${SINGULARITY_ALLOWED_DIR}/milady.sif"
    else
        MILADY_SIF="${MILADY_ROOT}/milady.sif"
    fi
fi
export MILADY_SIF

# --- Données, catalogue, suivi ------------------------------------------------------------------
if [[ -z "${MILADY_DATA:-}" ]]; then
    if [[ -n "${SCRATCH:-}" ]]; then MILADY_DATA="${SCRATCH}/milady"
    elif [[ -n "${WORK:-}" ]]; then MILADY_DATA="${WORK}/milady"
    else MILADY_DATA="${MILADY_ROOT}/data"; fi
fi
if [[ -z "${MILADY_STATE:-}" ]]; then
    if [[ -n "${WORK:-}" ]]; then MILADY_STATE="${WORK}/milady"; else MILADY_STATE="${MILADY_ROOT}/data"; fi
fi
mkdir -p "${MILADY_DATA}/store" "${MILADY_STATE}"
export MILADY_DATA MILADY_STATE
export MILADY_DB_URL="${MILADY_DB_URL:-sqlite:///${MILADY_STATE}/catalog.sqlite}"
export MILADY_STORAGE_URI="${MILADY_STORAGE_URI:-file://${MILADY_DATA}/store}"
export MLFLOW_TRACKING_URI="${MLFLOW_TRACKING_URI:-sqlite:///${MILADY_STATE}/mlflow.db}"
export MILADY_HOST="${MILADY_HOST:-${SLURM_CLUSTER_NAME:-$(hostname -s)}}"
export PYTHONUNBUFFERED=1
# Fils OpenMP/BLAS = cœurs réservés par tâche (évite la sur-souscription).
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-${SLURM_CPUS_PER_TASK:-1}}"

# --- Exécution ----------------------------------------------------------------------------------
# Provenance : commit du dépôt monté, lu sur l'hôte. L'image peut avoir été construite à un autre
# commit (variable MILADY_GIT_COMMIT figée dans l'image Docker) : on la remplace à chaque exécution.
milady_host_commit() {
    local c
    c="$(git -C "${MILADY_ROOT}" -c safe.directory='*' rev-parse --short=12 HEAD 2>/dev/null)" || return 0
    if git -C "${MILADY_ROOT}" -c safe.directory='*' -c core.fsmonitor=false diff --quiet HEAD -- 2>/dev/null; then
        echo "${c}"
    else
        echo "${c}-dirty"
    fi
}

# milady_run CMD… : exécute CMD dans l'image (dépôt monté sur /opt/milady, GPU via --nv) ou, à
# défaut, dans le venv / l'environnement courant. Le dossier courant est la racine du dépôt.
milady_run() {
    if [[ "${MILADY_SIF}" != "none" ]]; then
        if [[ -z "${MILADY_CONTAINER_CMD}" ]]; then
            echo "apptainer/singularity introuvable ; MILADY_SIF=none pour utiliser un venv" >&2
            return 1
        fi
        if [[ ! -f "${MILADY_SIF}" ]]; then
            echo "Image introuvable : ${MILADY_SIF} (voir infra/slurm/README-slurm.md)" >&2
            return 1
        fi
        local binds="${MILADY_ROOT}:/opt/milady,${MILADY_DATA},${MILADY_STATE}"
        # Commit vide (git absent sur le nœud) : le code Python le relit dans le dépôt monté.
        local commit
        commit="$(milady_host_commit)"
        # --nv : pilote et bibliothèques CUDA de l'hôte ; sans GPU, simple avertissement.
        "${MILADY_CONTAINER_CMD}" exec --nv --bind "${binds}" --pwd /opt/milady \
            --env "PYTHONNOUSERSITE=1,MILADY_ROOT=/opt/milady,MILADY_GIT_COMMIT=${commit}" \
            "${MILADY_SIF}" "$@"
    else
        if [[ -f "${MILADY_VENV:-${MILADY_ROOT}/.venv}/bin/activate" ]]; then
            # shellcheck disable=SC1091
            source "${MILADY_VENV:-${MILADY_ROOT}/.venv}/bin/activate"
        fi
        (cd "${MILADY_ROOT}" && "$@")
    fi
}

milady_banner() {
    echo "== MilaDy / Slurm : job ${SLURM_JOB_ID:-?}${SLURM_ARRAY_TASK_ID:+[${SLURM_ARRAY_TASK_ID}]} sur $(hostname)"
    echo "   dépôt   : ${MILADY_ROOT}"
    echo "   image   : ${MILADY_SIF} (${MILADY_CONTAINER_CMD:-aucun moteur})"
    echo "   données : ${MILADY_STORAGE_URI}"
    echo "   catalogue : ${MILADY_DB_URL%%\?*}   suivi : ${MLFLOW_TRACKING_URI}"
    command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi -L || true
}
