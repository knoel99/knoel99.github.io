# MilaDy sur un cluster Slurm (Jean Zay, mésocentres, Slurm dans le cloud)

Ce dossier contient les gabarits pour lancer les campagnes MilaDy sur un supercalculateur :

| Fichier | Rôle |
|---|---|
| `env.sh` | environnement commun (image Apptainer, `$WORK`/`$SCRATCH`, catalogue, MLflow), fonction `milady_run` |
| `gen_data.sbatch` | **tableau de jobs** : une simulation par élément, 1 GPU chacune |
| `train.sbatch` | entraînement **multi-GPU / multi-nœuds** : un `torchrun` par nœud, rendez-vous `MASTER_ADDR:MASTER_PORT` |
| `eval.sbatch` | évaluation d'un modèle (1 GPU) |
| `apptainer.def` | définition de l'image Apptainer (base `docker://pytorch/pytorch`) |

Principe : **les calculs tournent dans une image Apptainer (`.sif`) identique à l'image Docker de la VM
cloud**, le dépôt étant monté sur `/opt/milady` (le commit du dépôt monté, et non celui de la construction
de l'image, est enregistré dans les fichiers et au catalogue). Sur la frontale, seule la soumission des
campagnes demande un petit environnement Python (§1). Les résultats sont reproductibles d'une cible à
l'autre.

## 1. Démarrage rapide (tout cluster Slurm avec Apptainer)

```bash
# Sur la frontale (nœud de connexion)
cd $WORK                       # ou un dossier de travail sur un système de fichiers partagé
git clone https://github.com/knoel99/milady-2027.git && cd milady-2027

# Image : voir §3 (construite ailleurs puis copiée, ou tirée d'un registre)
ls milady.sif

# Python léger sur la frontale pour soumettre (une fois) : milady.sweep appelle `sbatch`, absent de
# l'image, il tourne donc HORS du conteneur. PyYAML, NumPy et SQLAlchemy suffisent (pas de torch).
# Python >= 3.11 requis : si `python3 --version` est plus ancien (RHEL 9 : 3.9), charger d'abord un
# module Python récent du centre (`module avail python`, nom exact à adapter).
python3 -m venv .venv-front && .venv-front/bin/pip install pyyaml numpy sqlalchemy "psycopg[binary]"
.venv-front/bin/pip install --no-deps -e .         # (ou `make setup`, plus lourd : torch CPU compris)

# Campagne de simulations (le développement YAML → tableau de jobs est fait par milady.sweep)
.venv-front/bin/python -m milady.sweep infra/configs/palier2_abc3d.yaml --scheduler slurm

# Ou à la main : N simulations, au plus 16 simultanées
sbatch --array=0-63%16 infra/slurm/gen_data.sbatch infra/configs/palier2_abc3d.yaml

# Entraînement sur 2 nœuds de 4 GPU, puis évaluation
sbatch --nodes=2 --gres=gpu:4 infra/slurm/train.sbatch infra/configs/train_fm3d.yaml
sbatch infra/slurm/eval.sbatch infra/configs/train_fm3d.yaml

squeue --me                    # suivi ; journaux : milady-sim-<job>_<tâche>.out dans le dossier de soumission
```

Les scripts se soumettent **depuis la racine du dépôt** (Slurm exécute une copie du script : le dépôt
est retrouvé par `SLURM_SUBMIT_DIR` ou par la variable `MILADY_ROOT`).

Ne pas lancer `milady.sweep --scheduler slurm` dans `apptainer exec` : `sbatch` n'existe pas dans
l'image, et la racine du dépôt y vaut `/opt/milady`, chemin que les jobs ne trouveraient pas sur l'hôte.

**Fin de temps limite et reprise.** `gen_data.sbatch` lance la simulation dans une étape `srun` et
demande `--signal=TERM@120` : 120 s avant la limite, la simulation reçoit SIGTERM, écrit son point de
contrôle (dans `$MILADY_DATA/work/…`, sur `$SCRATCH`) et s'arrête (statut `failed`, note
`interrupted` au catalogue). Resoumettre les mêmes indices reprend au dernier point de contrôle :
`.venv-front/bin/python -m milady.sweep <campagne.yaml> --scheduler slurm` ne resoumet que les
simulations non terminées (`--indices 3,7` pour en choisir).

**Cœurs par tâche.** Depuis Slurm 22.05, `srun` n'hérite plus forcément du `--cpus-per-task` de
`sbatch` : les gabarits le redonnent explicitement à `srun` (sinon toute l'étape, y compris les
processus `torchrun` d'un nœud, serait confinée sur un seul cœur).

Réglages : toutes les variables de `env.sh` (`MILADY_SIF`, `MILADY_DATA`, `MILADY_DB_URL`…) peuvent
être exportées avant `sbatch` ou écrites une fois pour toutes dans `~/.config/milady/slurm.env` :

```bash
mkdir -p ~/.config/milady
cat > ~/.config/milady/slurm.env <<'EOF'
MILADY_SIF=$WORK/milady-2027/milady.sif
MILADY_DATA=$SCRATCH/milady
EOF
```

Les options `#SBATCH` des gabarits sont **génériques** (1 GPU, 8 cœurs, 4 h pour une simulation ;
1 nœud de 4 GPU, 20 h pour l'entraînement) : compte, partition, contrainte et QoS **sont à adapter
au centre** — en ligne de commande (`sbatch --account=… -C …`) plutôt qu'en modifiant les fichiers.

## 2. Jean Zay (IDRIS)

Informations vérifiées le 2026-11-07 dans la documentation de l'IDRIS (liens en fin de section). Elles
évoluent : relire la documentation avant une campagne importante.

### Compte et heures

- Chaque travail doit indiquer le projet **et le type d'heures** : `--account=<projet>@cpu`,
  `@v100`, `@a100` ou `@h100` ; `<projet>` est la valeur de `$IDRPROJ` (`idrproj` liste vos projets).
- Les heures GPU s'obtiennent par une demande DARI (accès dynamique ou régulier) ; un stage passe
  normalement par le projet de l'équipe d'accueil.

### Partitions GPU et options Slurm

| Nœuds | Option | CPU / nœud | GPU / nœud | Durée max. |
|---|---|---|---|---|
| V100 16/32 Go (4 GPU) | par défaut (`-C v100-16g` ou `-C v100-32g` pour forcer) | 40 | 4 | 100 h |
| V100 32 Go (8 GPU) | `--partition=gpu_p2` (`gpu_p2s`, `gpu_p2l`) | 24 | 8 | 100 h |
| A100 80 Go (8 GPU, 52 nœuds) | `-C a100` | 64 (AMD) | 8 | 20 h |
| H100 80 Go (4 GPU, 364 nœuds) | `-C h100` | 96 | 4 | 100 h |

- Avant tout module sur A100 / H100 : `module load arch/a100` ou `module load arch/h100` (inutile avec
  l'image Apptainer, qui contient sa propre pile CUDA ; utile si l'on utilise les modules PyTorch de l'IDRIS).
- Durée par défaut : **10 minutes** — toujours préciser `--time`.
- Un travail sur plus d'un nœud est en **mode exclusif** : les nœuds entiers sont facturés.
- `--hint=nomultithread` est utilisé dans les exemples de l'IDRIS (et dans nos gabarits).

### QoS (qualité de service)

| Partition | QoS par défaut (≤ 20 h) | Longue (≤ 100 h) | Développement (≤ 2 h) |
|---|---|---|---|
| V100 | `qos_gpu-t3` | `qos_gpu-t4` (16 GPU max. par travail) | `qos_gpu-dev` |
| A100 | `qos_gpu_a100-t3` | — (pas de QoS > 20 h sur A100) | `qos_gpu_a100-dev` |
| H100 | `qos_gpu_h100-t3` | `qos_gpu_h100-t4` (16 GPU max. par travail) | `qos_gpu_h100-dev` |

Les QoS `-dev` sont limitées à 10 travaux (en cours ou en attente) par utilisateur et 32 GPU.
Le nombre d'éléments d'un tableau exécutés simultanément se limite avec `%` : `--array=0-199%16`.

Exemples :

```bash
# Simulations : 1 GPU H100 et 1/4 du nœud (24 cœurs) par simulation
sbatch --account=abc@h100 -C h100 --cpus-per-task=24 --time=10:00:00 \
       --array=0-63%16 infra/slurm/gen_data.sbatch infra/configs/palier2_abc3d.yaml
# Entraînement : 2 nœuds H100 complets
sbatch --account=abc@h100 -C h100 --nodes=2 --gres=gpu:4 --cpus-per-task=96 --time=20:00:00 \
       infra/slurm/train.sbatch infra/configs/train_fm3d.yaml
# Test rapide en file de développement
sbatch --account=abc@h100 -C h100 --qos=qos_gpu_h100-dev --time=00:30:00 \
       infra/slurm/eval.sbatch infra/configs/train_fm3d.yaml
```

### Espaces disques

| Variable | Usage pour MilaDy | Caractéristiques |
|---|---|---|
| `$HOME` | configuration (`~/.config/milady/slurm.env`) | 3 Go, sauvegardé |
| `$WORK` | dépôt cloné, image `.sif`, **catalogue SQLite** et base MLflow (`$WORK/milady/`) | quota par projet (5 To par défaut), non sauvegardé |
| `$SCRATCH` | **fichiers MFF** des campagnes (`$SCRATCH/milady/store`) | SSD rapide, fichiers inutilisés **effacés après 30 jours** |
| `$STORE` | archivage long terme des jeux de données finaux | non accessible depuis les nœuds de calcul |

Après une campagne : copier les fichiers à garder de `$SCRATCH` vers `$WORK`/`$STORE`, ou vers le
stockage S3 du projet (§5).

### Conteneurs : Singularity sur Jean Zay

- Le moteur disponible est **Singularity** (`module load singularity`) ; Docker et Podman ne le sont pas.
  `env.sh` charge ce module automatiquement s'il ne trouve ni `apptainer` ni `singularity`.
- **Construction depuis un fichier `.def` impossible** (ni root ni `fakeroot`) : construire l'image
  ailleurs (§3), ou depuis une frontale à partir d'un registre public :
  `singularity build milady.sif docker://ghcr.io/knoel99/milady:gpu` (lancer depuis `$WORK`/`$SCRATCH` ;
  la mémoire est limitée sur les frontales : préférer un nœud `prepost` pour les grosses images).
- Une image n'est utilisable sur les nœuds de calcul qu'après copie dans l'espace autorisé :
  `idrcontmgr cp milady.sif` (puis `idrcontmgr ls`) ; `env.sh` prend alors
  `$SINGULARITY_ALLOWED_DIR/milady.sif` par défaut. Cet espace est limité à 20 conteneurs.
- Jupyter et TensorBoard ne se lancent pas depuis un conteneur sur Jean Zay : utiliser le JupyterHub de
  l'IDRIS pour l'analyse interactive.

### Pas d'Internet sur les nœuds de calcul

Les nœuds de calcul de Jean Zay n'ont **aucun accès à Internet** (téléchargements à faire depuis les
frontales ou les nœuds de pré/post-traitement). Conséquences pour MilaDy :

- **catalogue** : SQLite sur `$WORK` (`MILADY_DB_URL=sqlite:///$WORK/milady/catalog.sqlite`, valeur par
  défaut de `env.sh`). Le catalogue attend jusqu'à 120 s un verrou libre : plusieurs simulations d'un
  tableau peuvent y écrire. En cas de verrous récalcitrants sur le système de fichiers parallèle, ne
  garder que l'écriture des fichiers MFF dans les jobs, puis enregistrer **a posteriori** depuis la
  frontale : `python -m milady.catalog ingest $SCRATCH/milady/store/<campagne>/*/fields.h5 --campaign <campagne>` ;
- **suivi MLflow** : base SQLite locale (`MLFLOW_TRACKING_URI=sqlite:///$WORK/milady/mlflow.db`), à
  consulter avec `mlflow ui --backend-store-uri sqlite:///…/mlflow.db` (depuis le portable après copie,
  ou le JupyterHub de l'IDRIS) ;
- **synchronisation vers l'infrastructure cloud** (PostgreSQL + S3 de la VM) : voir §5.

Sources (documentation IDRIS, consultée le 2026-11-07) :
[partitions GPU et QoS](http://www.idris.fr/docs/jean-zay/slurm/slurm_partitions_gpu),
[comptes multi-projets et `--account`](http://www.idris.fr/docs/jean-zay/gestion-compte/multi-projets),
[espaces disques](http://www.idris.fr/docs/jean-zay/environnement/espaces-disques),
[conteneurs Singularity](http://www.idris.fr/docs/jean-zay/environnement/conteneurs),
[nouvel utilisateur — pas d'Internet sur les nœuds de calcul](http://www.idris.fr/docs/jean-zay/nouvel-utilisateur),
[parallélisme de données PyTorch](http://www.idris.fr/docs/jean-zay/intelligence_artificielle/distribution_parallelisme/data-parallelism-pytorch),
[tableaux de jobs](http://www.idris.fr/docs/jean-zay/slurm/exec_jobarray).

### Note sur le lancement multi-GPU

La documentation de l'IDRIS lance PyTorch DDP avec `srun` (une tâche Slurm par GPU) et la bibliothèque
`idr_torch`. Nos gabarits lancent **un `torchrun` par nœud** (une tâche Slurm par nœud), ce qui marche à
l'identique dans un conteneur et sur tout cluster ; `torchrun` fixe `RANK`, `LOCAL_RANK`, `WORLD_SIZE`,
`MASTER_ADDR` et `MASTER_PORT` pour chaque processus. Les deux approches sont équivalentes pour DDP.

## 3. Construire l'image `.sif`

| Situation | Commande |
|---|---|
| Machine avec Docker et Apptainer (VM cloud, portable Linux) | `make image-gpu && make sif` → `milady.sif` |
| Apptainer seul, avec `--fakeroot` | `apptainer build --fakeroot milady.sif infra/slurm/apptainer.def` |
| Image publiée dans un registre | `apptainer build milady.sif docker://ghcr.io/knoel99/milady:gpu` |
| Jean Zay | construire ailleurs puis `scp milady.sif jean-zay:$WORK/milady-2027/` et `idrcontmgr cp milady.sif` |

Publier l'image dans le registre GitHub (une fois, depuis une machine avec Docker) :

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u <utilisateur> --password-stdin   # jeton avec write:packages
docker tag milady:gpu ghcr.io/knoel99/milady:gpu && docker push ghcr.io/knoel99/milady:gpu
```

L'image fait plusieurs Go (pile CUDA) : la construire sur `$WORK` ou `$SCRATCH`, jamais dans `$HOME`.

## 4. Autres clusters

### Mésocentres (Slurm + Apptainer)

Même procédure ; à adapter : `--partition` (nom de la partition GPU, `sinfo -s`), `--account` si
demandé, type de GPU (`--gres=gpu:a100:1` ou `--constraint`), variables de disques (`$WORK`/`$SCRATCH`
n'existent pas partout : fixer `MILADY_DATA` et `MILADY_STATE`). Si Apptainer n'est pas installé :
`MILADY_SIF=none` et un venv (`make setup GPU=1`) ou les modules Python du centre. Si les nœuds de
calcul joignent un serveur PostgreSQL, `MILADY_DB_URL=postgresql://…` remplace SQLite.

### Slurm dans le cloud

Pour plusieurs nœuds GPU loués à la demande : AWS ParallelCluster, Google Cloud HPC Toolkit (Cluster
Toolkit), Azure CycleCloud, ou les clusters Slurm « clé en main » de fournisseurs GPU. Les gabarits
fonctionnent sans modification (`--partition` à adapter) ; les nœuds ayant Internet, on peut viser
directement la pile de la VM (catalogue PostgreSQL et S3) :

```bash
export MILADY_DB_URL=postgresql://milady:<mdp>@<ip-privée-vm>:5432/milady
export MILADY_STORAGE_URI=s3://milady-data MILADY_S3_ENDPOINT=http://<ip-privée-vm>:9000
export MLFLOW_TRACKING_URI=http://<ip-privée-vm>:5000
```

(la VM doit alors publier ses ports sur le réseau privé : `BIND_ADDR=<ip-privée>` dans `infra/docker/.env`,
avec un pare-feu limité au sous-réseau du cluster).

## 5. Rapatrier les résultats vers l'infrastructure centrale

Depuis la frontale (qui a accès à Internet) ou après copie sur le portable :

```bash
# 1. Fichiers MFF vers le stockage S3 du projet (mc, rclone ou aws s3 sync)
mc alias set milady https://<point-d-accès-s3> <clé> <secret>
mc mirror $SCRATCH/milady/store/palier2_abc3d milady/milady-data/palier2_abc3d
# 2. Enregistrement dans le catalogue central (idempotent : relançable). Le shell ne développe pas
#    les jokers s3:// : on liste les objets avec mc find.
export MILADY_DB_URL=postgresql://milady:<mdp>@<hôte>:5432/milady
export MILADY_S3_ENDPOINT=https://<point-d-accès-s3> AWS_ACCESS_KEY_ID=<clé> AWS_SECRET_ACCESS_KEY=<secret>
python -m milady.catalog ingest --campaign palier2_abc3d \
  $(mc find milady/milady-data/palier2_abc3d --name fields.h5 | sed 's#^milady/#s3://#')
```

`ingest` lit les métadonnées du fichier (`milady_uuid`, paramètres, code, commit, diagnostics) : les
identifiants restent les mêmes que dans le catalogue SQLite du cluster.
