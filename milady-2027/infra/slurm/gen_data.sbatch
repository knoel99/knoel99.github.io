#!/bin/bash
# Génération de données MilaDy sur Slurm : tableau de jobs, UNE simulation (1 GPU) par élément.
#
# Soumission normale (depuis la racine du dépôt) — le tableau est dimensionné par milady.sweep :
#   python -m milady.sweep infra/configs/palier2_abc3d.yaml --scheduler slurm
# Soumission manuelle (N simulations, au plus 16 en parallèle) :
#   sbatch --array=0-$((N-1))%16 infra/slurm/gen_data.sbatch infra/configs/palier2_abc3d.yaml
# Jean Zay (exemple H100 ; voir infra/slurm/README-slurm.md) :
#   sbatch --account=abc@h100 -C h100 --cpus-per-task=24 --array=0-63%16 \
#          infra/slurm/gen_data.sbatch infra/configs/palier2_abc3d.yaml
#
# Argument : fichier YAML de campagne. L'élément SLURM_ARRAY_TASK_ID du tableau choisit le point
# de paramètres (ordre du développement de la campagne par milady.sweep).
# Environnement : voir infra/slurm/env.sh (image Apptainer, $WORK/$SCRATCH, catalogue SQLite).
#
#SBATCH --job-name=milady-sim
#SBATCH --array=0-0
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --hint=nomultithread
#SBATCH --time=04:00:00
#SBATCH --output=%x-%A_%a.out
#SBATCH --error=%x-%A_%a.out
# SIGTERM 120 s avant la limite de temps, envoyé à l'étape srun (la simulation) : elle écrit son point
# de contrôle et s'arrête proprement (sans cette marge, Slurm n'accorde que KillWait, souvent 30 s).
#SBATCH --signal=TERM@120
# --- À adapter au centre de calcul (décommenter : « ##SBATCH » est ignoré par Slurm) ---------
##SBATCH --account=PROJET@h100          # Jean Zay : projet@cpu|v100|a100|h100 (echo $IDRPROJ)
##SBATCH --constraint=h100              # Jean Zay : h100 (gpu_p6), a100 (gpu_p5), v100-32g…
##SBATCH --qos=qos_gpu_h100-t3          # Jean Zay : -t3 ≤ 20 h (défaut), -t4 ≤ 100 h, -dev ≤ 2 h
##SBATCH --partition=gpu                # mésocentre / Slurm cloud : nom de la partition GPU
set -euo pipefail

CONFIG="${1:?usage : sbatch [--array=…] infra/slurm/gen_data.sbatch campagne.yaml [options de milady.sim.run]}"
shift
EXTRA_ARGS=("$@")

# Slurm exécute une copie de ce script : on retrouve le dépôt par MILADY_ROOT ou le dossier de soumission.
# shellcheck source=infra/slurm/env.sh
source "${MILADY_ROOT:-${SLURM_SUBMIT_DIR:-.}}/infra/slurm/env.sh"
milady_banner

TASK="${SLURM_ARRAY_TASK_ID:-0}"
echo "== simulation ${TASK} de ${CONFIG} ($(date -u +%FT%TZ))"
start=$(date +%s)

# La simulation écrit le fichier MFF dans MILADY_STORAGE_URI et s'enregistre au catalogue
# (MILADY_DB_URL) avec l'identifiant du job Slurm (SLURM_ARRAY_JOB_ID_SLURM_ARRAY_TASK_ID).
# Elle tourne dans une étape srun pour recevoir le signal de --signal (le shell du script batch, lui,
# n'est pas signalé). --cpus-per-task est redonné explicitement : depuis Slurm 22.05, srun n'hérite
# plus forcément de la valeur de sbatch. Après une interruption (statut « failed », note
# « interrupted » au catalogue), resoumettre le même indice reprend au dernier point de contrôle :
#   sbatch --array=<indices> infra/slurm/gen_data.sbatch <campagne.yaml>
# Hors Slurm (essai du gabarit : SLURM_ARRAY_TASK_ID=0 bash infra/slurm/gen_data.sbatch …), pas de srun.
launch=()
if [[ -n "${SLURM_JOB_ID:-}" ]] && command -v srun >/dev/null 2>&1; then
    launch=(srun --ntasks=1 --cpus-per-task="${SLURM_CPUS_PER_TASK:-1}")
fi
# shellcheck disable=SC2016  # bloc évalué dans l'étape srun
"${launch[@]}" bash -c '
    set -euo pipefail
    source "${MILADY_ROOT}/infra/slurm/env.sh"
    milady_run python -m milady.sim.run "$0" --index "$1" "${@:2}"
' "${CONFIG}" "${TASK}" "${EXTRA_ARGS[@]}"

echo "== terminé en $(( $(date +%s) - start )) s"
