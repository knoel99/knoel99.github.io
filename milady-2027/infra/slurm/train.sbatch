#!/bin/bash
# Entraînement MilaDy multi-GPU sur Slurm : torchrun (DDP) sur un ou plusieurs nœuds.
#
# Un lanceur torchrun par nœud (srun --ntasks-per-node=1), qui démarre GPUS_PER_NODE processus ;
# rendez-vous sur le premier nœud de l'allocation (MASTER_ADDR, MASTER_PORT).
#
# Exemples (depuis la racine du dépôt) :
#   sbatch infra/slurm/train.sbatch infra/configs/train_fm3d.yaml                 # 1 nœud, 4 GPU
#   sbatch --nodes=2 infra/slurm/train.sbatch infra/configs/train_fm3d.yaml       # 2 nœuds
#   Jean Zay H100 (4 GPU et 96 cœurs par nœud) :
#   sbatch --account=abc@h100 -C h100 --nodes=2 --gres=gpu:4 --cpus-per-task=96 \
#          infra/slurm/train.sbatch infra/configs/train_fm3d.yaml
#   Jean Zay A100 (8 GPU et 64 cœurs par nœud) : -C a100 --gres=gpu:8 --cpus-per-task=64
#
# Arguments : fichier YAML d'entraînement, puis options supplémentaires de milady.train.fm3d.
#
#SBATCH --job-name=milady-train
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --gres=gpu:4
#SBATCH --cpus-per-task=32
#SBATCH --hint=nomultithread
#SBATCH --time=20:00:00
#SBATCH --output=%x-%j.out
#SBATCH --error=%x-%j.out
# --- À adapter au centre de calcul ---------------------------------------------------------------
##SBATCH --account=PROJET@h100
##SBATCH --constraint=h100
##SBATCH --qos=qos_gpu_h100-t3
##SBATCH --partition=gpu
set -euo pipefail

CONFIG="${1:?usage : sbatch infra/slurm/train.sbatch config.yaml [options de milady.train.fm3d]}"
shift
EXTRA_ARGS=("$@")

# shellcheck source=infra/slurm/env.sh
source "${MILADY_ROOT:-${SLURM_SUBMIT_DIR:-.}}/infra/slurm/env.sh"
milady_banner

# --- Rendez-vous torchrun -------------------------------------------------------------------------
NNODES="${SLURM_NNODES:-1}"
GPUS_PER_NODE="${GPUS_PER_NODE:-${SLURM_GPUS_ON_NODE:-$(nvidia-smi -L 2>/dev/null | wc -l)}}"
[[ "${GPUS_PER_NODE}" -ge 1 ]] || GPUS_PER_NODE=1   # nœud sans GPU : 1 processus CPU
MASTER_ADDR="$(scontrol show hostnames "${SLURM_JOB_NODELIST}" | head -n 1)"
MASTER_PORT="${MASTER_PORT:-$(( 20000 + ${SLURM_JOB_ID:-0} % 20000 ))}"
export MASTER_ADDR MASTER_PORT NNODES GPUS_PER_NODE
# Journalisation NCCL minimale ; NCCL_DEBUG=INFO pour diagnostiquer un blocage inter-nœuds.
export NCCL_DEBUG="${NCCL_DEBUG:-WARN}"
# Cœurs CPU par processus (DataLoader, FFT CPU) : cœurs de la tâche / GPU du nœud.
export OMP_NUM_THREADS=$(( ${SLURM_CPUS_PER_TASK:-${GPUS_PER_NODE}} / GPUS_PER_NODE ))
[[ "${OMP_NUM_THREADS}" -ge 1 ]] || export OMP_NUM_THREADS=1

echo "== ${NNODES} nœud(s) × ${GPUS_PER_NODE} GPU ; maître ${MASTER_ADDR}:${MASTER_PORT}"

# Chaque tâche srun (une par nœud) lance torchrun avec son rang de nœud (SLURM_NODEID).
# Le bloc entre apostrophes est évalué sur chaque nœud (SLURM_NODEID y diffère).
# --cpus-per-task redonné à srun : depuis Slurm 22.05, srun n'hérite plus forcément de la valeur de
# sbatch, et la tâche (donc tous les processus torchrun du nœud) serait confinée sur 1 cœur.
# shellcheck disable=SC2016
srun --kill-on-bad-exit=1 --ntasks-per-node=1 --cpus-per-task="${SLURM_CPUS_PER_TASK:-1}" bash -c '
    set -euo pipefail
    source "${MILADY_ROOT}/infra/slurm/env.sh"
    milady_run python -m torch.distributed.run \
        --nnodes="${NNODES}" --nproc-per-node="${GPUS_PER_NODE}" --node-rank="${SLURM_NODEID}" \
        --master-addr="${MASTER_ADDR}" --master-port="${MASTER_PORT}" \
        -m milady.train.fm3d --config "$0" "${@}"
' "${CONFIG}" "${EXTRA_ARGS[@]}"
