#!/bin/bash
# Évaluation MilaDy sur Slurm (1 GPU) : échantillonnage du modèle, métriques physiques et
# distances entre lois, résultats enregistrés au catalogue (table evaluation).
#
# Exemples (depuis la racine du dépôt) :
#   sbatch infra/slurm/eval.sbatch infra/configs/train_fm3d.yaml
#   sbatch infra/slurm/eval.sbatch infra/configs/train_fm3d.yaml --model 3f2c…   # identifiant catalogue
#   Jean Zay : sbatch --account=abc@h100 -C h100 --cpus-per-task=24 infra/slurm/eval.sbatch …
#
# Arguments : fichier YAML (celui de l'entraînement), puis options de milady.eval.
#
#SBATCH --job-name=milady-eval
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --hint=nomultithread
#SBATCH --time=02:00:00
#SBATCH --output=%x-%j.out
#SBATCH --error=%x-%j.out
# --- À adapter au centre de calcul ---------------------------------------------------------------
##SBATCH --account=PROJET@h100
##SBATCH --constraint=h100
##SBATCH --qos=qos_gpu_h100-dev          # Jean Zay : file « dev » (≤ 2 h) pour des évaluations courtes
##SBATCH --partition=gpu
set -euo pipefail

CONFIG="${1:?usage : sbatch infra/slurm/eval.sbatch config.yaml [options de milady.eval]}"
shift
EXTRA_ARGS=("$@")

# shellcheck source=infra/slurm/env.sh
source "${MILADY_ROOT:-${SLURM_SUBMIT_DIR:-.}}/infra/slurm/env.sh"
milady_banner

milady_run python -m milady.eval --config "${CONFIG}" "${EXTRA_ARGS[@]}"
