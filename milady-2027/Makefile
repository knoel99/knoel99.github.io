# Makefile MilaDy — point d'entrée unique pour installer, déployer et lancer les calculs.
#
#   make help                     liste des cibles
#   make setup                    portable : venv .venv + dépendances épinglées + pip install -e .
#   make env && make up           pile Docker (PostgreSQL, MinIO, MLflow) sur n'importe quelle machine
#   make smoke                    test de bout en bout (simulation → MFF → S3 → catalogue → entraînement → évaluation)
#   make sweep CONFIG=infra/configs/palier2_abc3d.yaml
#   make train CONFIG=infra/configs/train_fm3d.yaml [NGPUS=4]
#   make eval  CONFIG=infra/configs/train_fm3d.yaml [MODEL=<uuid>]
#
# Deux modes d'exécution, choisis automatiquement (forçables avec RUN=docker ou RUN=local) :
#   docker : si infra/docker/.env existe — les commandes Python tournent dans le conteneur
#            $(WORKER) (worker ou worker-gpu, lu dans .env) relié à db, s3 et mlflow ;
#   local  : sinon — venv .venv (make setup), catalogue SQLite et stockage ./data (mode portable),
#            ou cluster Slurm (voir infra/slurm/README-slurm.md).

SHELL := /bin/bash
.SHELLFLAGS := -euo pipefail -c
.DEFAULT_GOAL := help
MAKEFLAGS += --no-print-directory

ROOT       := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
COMPOSE_YML := $(ROOT)/infra/docker/docker-compose.yml
ENV_FILE   := $(ROOT)/infra/docker/.env
COMPOSE    := docker compose -f $(COMPOSE_YML) --env-file $(ENV_FILE)

PYTHON     ?= python3
VENV       ?= $(ROOT)/.venv
IMAGE      ?= milady
SIF        ?= $(ROOT)/milady.sif
CONFIG     ?=
SCHEDULER  ?= local
MODEL      ?=
EVAL_ARGS  ?=
TRAIN_ARGS ?=
SWEEP_ARGS ?=
BACKUP_TARGET ?= $(ROOT)/backups
GPU        ?= 0

# Valeur d'une variable de infra/docker/.env (vide si absente).
env_get = $(shell [ -f $(ENV_FILE) ] && sed -n 's/^$(1)=//p' $(ENV_FILE) | tail -n 1)

RUN    ?= $(if $(wildcard $(ENV_FILE)),docker,local)
WORKER ?= $(or $(call env_get,MILADY_WORKER),worker)
# UID/GID de l'utilisateur du conteneur : ceux de .env (propriétaire du dépôt), sinon l'utilisateur courant.
UID_   := $(or $(call env_get,MILADY_UID),$(shell id -u))
GID_   := $(or $(call env_get,MILADY_GID),$(shell id -g))
GIT_COMMIT ?= $(shell git -C $(ROOT) rev-parse --short=12 HEAD 2>/dev/null || true)
export GIT_COMMIT
# Certificat facultatif d'un proxy TLS pour pip pendant `docker build` (réseau d'entreprise/HPC).
MILADY_BUILD_CACERT ?=
export MILADY_BUILD_CACERT
comma := ,
BUILD_SECRET := $(if $(MILADY_BUILD_CACERT),--secret id=cacert$(comma)src=$(MILADY_BUILD_CACERT),)

ifeq ($(RUN),docker)
  PY := $(COMPOSE) run --rm $(WORKER) python
  # Nombre de GPU visibles dans le conteneur (0 → entraînement sur CPU, 1 processus).
  NGPUS ?= $(if $(filter worker-gpu,$(WORKER)),$(shell nvidia-smi -L 2>/dev/null | wc -l),1)
else
  PY := $(if $(wildcard $(VENV)/bin/python),$(VENV)/bin/python,$(PYTHON))
  NGPUS ?= $(shell nvidia-smi -L 2>/dev/null | wc -l | sed 's/^0$$/1/')
endif
NPROC := $(if $(filter 0,$(NGPUS)),1,$(NGPUS))

.PHONY: help setup env up down ps logs shell jupyter smoke sweep train eval backup image image-gpu \
        sif test lock clean check-config check-env

help: ## Affiche cette aide
	@echo "MilaDy — cibles disponibles (mode courant : RUN=$(RUN), WORKER=$(WORKER)) :"
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-11s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------------------------------------
# Installation
# ---------------------------------------------------------------------------------------------
setup: ## Portable/cluster : crée .venv et installe les dépendances épinglées (GPU=1 pour CUDA)
	@command -v $(PYTHON) >/dev/null || { echo "Python introuvable ($(PYTHON))"; exit 1; }
	@$(PYTHON) -c 'import sys; assert sys.version_info >= (3, 11), "Python >= 3.11 requis"'
	@[ -x $(VENV)/bin/python ] || $(PYTHON) -m venv $(VENV)
	$(VENV)/bin/python -m pip install --upgrade pip
	$(VENV)/bin/python -m pip install -r $(ROOT)/infra/env/$(if $(filter 1,$(GPU)),requirements-gpu.txt,requirements.txt)
	$(VENV)/bin/python -m pip install --no-deps -e $(ROOT)
	@mkdir -p $(ROOT)/data/store
	@echo "OK. Activer : source .venv/bin/activate ; test : make smoke RUN=local"

env: ## Génère infra/docker/.env avec des mots de passe aléatoires (jamais écrasé s'il existe)
	@$(ROOT)/infra/deploy/gen_env.sh $(if $(filter 1,$(GPU)),--gpu,)

check-env:
	@[ -f $(ENV_FILE) ] || { echo "infra/docker/.env absent : lancer 'make env' (ou bootstrap_vm.sh)"; exit 1; }

check-config:
	@[ -n "$(CONFIG)" ] || { echo "Préciser CONFIG=chemin/vers/campagne.yaml"; exit 1; }
	@[ -f "$(CONFIG)" ] || [ -f "$(ROOT)/$(CONFIG)" ] || { echo "Fichier introuvable : $(CONFIG)"; exit 1; }

# ---------------------------------------------------------------------------------------------
# Pile Docker
# ---------------------------------------------------------------------------------------------
up: check-env ## Démarre db, s3 (+ buckets), mlflow et attend les healthchecks
	$(COMPOSE) build mlflow
	$(COMPOSE) up -d --wait db s3 mlflow
	@$(COMPOSE) ps --all
	@echo "Services prêts. MLflow : http://localhost:$(or $(call env_get,MLFLOW_PORT),5000) (tunnel SSH sur une VM)."

down: check-env ## Arrête tous les conteneurs (les volumes de données sont conservés)
	$(COMPOSE) --profile cpu --profile gpu --profile jupyter down

ps: check-env ## État des services
	$(COMPOSE) --profile cpu --profile gpu --profile jupyter ps --all

logs: check-env ## Journaux des services (SERVICE=mlflow pour un seul)
	$(COMPOSE) logs --tail=200 $(SERVICE)

shell: check-env ## Shell interactif dans le conteneur de calcul
	$(COMPOSE) run --rm $(WORKER) bash

jupyter: check-env ## Lance JupyterLab (port 8888, jeton JUPYTER_TOKEN de .env)
	$(COMPOSE) --profile jupyter up -d --build jupyter
	@echo "JupyterLab : http://localhost:$(or $(call env_get,JUPYTER_PORT),8888)/lab?token=<JUPYTER_TOKEN>"

# ---------------------------------------------------------------------------------------------
# Calculs
# ---------------------------------------------------------------------------------------------
smoke: ## Test de bout en bout minuscule (quelques dizaines de secondes sur CPU)
	$(PY) infra/deploy/smoke.py

sweep: check-config ## Campagne de simulations : make sweep CONFIG=… [SCHEDULER=local|docker|slurm]
	$(PY) -m milady.sweep $(CONFIG) --scheduler $(SCHEDULER) $(SWEEP_ARGS)

train: check-config ## Entraînement (torchrun, NGPUS processus) : make train CONFIG=… [NGPUS=n]
	$(PY) -m torch.distributed.run --standalone --nnodes=1 --nproc-per-node=$(NPROC) \
	  -m milady.train.fm3d --config $(CONFIG) $(TRAIN_ARGS)

eval: ## Évaluation d'un modèle : make eval CONFIG=… [MODEL=<uuid du catalogue>]
	$(PY) -m milady.eval $(if $(CONFIG),--config $(CONFIG),) $(if $(MODEL),--model $(MODEL),) $(EVAL_ARGS)

test: ## Tests pytest (courts)
	$(PY) -m pytest -q -m "not slow" tests

# ---------------------------------------------------------------------------------------------
# Images et conteneurs
# ---------------------------------------------------------------------------------------------
image: ## Construit l'image CPU milady:cpu
	docker build -f $(ROOT)/infra/docker/Dockerfile -t $(IMAGE):cpu \
	  --build-arg MILADY_UID=$(UID_) --build-arg MILADY_GID=$(GID_) --build-arg GIT_COMMIT=$(GIT_COMMIT) $(BUILD_SECRET) $(ROOT)

image-gpu: ## Construit l'image GPU milady:gpu (CUDA 12.6)
	docker build -f $(ROOT)/infra/docker/Dockerfile.gpu -t $(IMAGE):gpu \
	  --build-arg MILADY_UID=$(UID_) --build-arg MILADY_GID=$(GID_) --build-arg GIT_COMMIT=$(GIT_COMMIT) $(BUILD_SECRET) $(ROOT)

sif: ## Image Apptainer milady.sif (depuis milady:gpu si présente, sinon apptainer.def)
	@command -v apptainer >/dev/null || { echo "apptainer introuvable (voir infra/slurm/README-slurm.md)"; exit 1; }
	@if docker image inspect $(IMAGE):gpu >/dev/null 2>&1; then \
	  echo "Conversion de l'image Docker $(IMAGE):gpu → $(SIF)"; \
	  apptainer build --force $(SIF) docker-daemon://$(IMAGE):gpu; \
	else \
	  echo "Image Docker absente : construction depuis infra/slurm/apptainer.def"; \
	  cd $(ROOT) && apptainer build --force --fakeroot $(SIF) infra/slurm/apptainer.def; \
	fi
	@ls -lh $(SIF)

# ---------------------------------------------------------------------------------------------
# Exploitation
# ---------------------------------------------------------------------------------------------
backup: check-env ## Sauvegarde : pg_dump + miroir S3 vers BACKUP_TARGET (dossier ou s3://…)
	$(ROOT)/infra/deploy/backup.sh $(BACKUP_TARGET)

lock: ## Régénère les verrous infra/env/requirements*.txt (nécessite uv)
	@command -v uv >/dev/null || { echo "installer uv : pip install uv"; exit 1; }
	cd $(ROOT)/infra/env && uv pip compile requirements.in --universal --python-version 3.11 \
	  --default-index https://pypi.org/simple --index https://download.pytorch.org/whl/cpu \
	  --index-strategy unsafe-best-match --no-header --no-annotate -o requirements.lock.tmp
	@echo "Comparer infra/env/requirements.lock.tmp avec requirements.txt puis reporter les versions (garder l'en-tête)."
	cd $(ROOT)/infra/env && uv pip compile requirements-gpu.in --python-version 3.12 \
	  --python-platform x86_64-manylinux_2_28 --default-index https://pypi.org/simple \
	  --index https://download.pytorch.org/whl/cu126 --index-strategy unsafe-best-match \
	  --no-header --no-annotate -o requirements-gpu.lock.tmp

clean: ## Supprime caches et fichiers de construction (jamais data/, ni les volumes Docker)
	find $(ROOT) -type d \( -name __pycache__ -o -name .pytest_cache -o -name .mypy_cache -o -name .ruff_cache \) \
	  -not -path '*/.venv/*' -prune -exec rm -rf {} +
	rm -rf $(ROOT)/build $(ROOT)/dist $(ROOT)/*.egg-info $(ROOT)/infra/env/*.lock.tmp
