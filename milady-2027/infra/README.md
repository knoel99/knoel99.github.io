# Déployer MilaDy : VM cloud GPU, cluster Slurm, portable

Ce guide explique, pas à pas, comment passer de `git clone` à une campagne de simulations MHD,
un entraînement et une évaluation, avec des données au format standard (MFF, compatible
The Well) et un catalogue central des résultats. L'architecture et les choix techniques sont
décrits dans [`ARCHITECTURE.md`](ARCHITECTURE.md) ; le contrat détaillé (format, schéma du
catalogue) dans [`../specs/infra.md`](../specs/infra.md).

| Cible | Pour quoi | Commande principale |
|---|---|---|
| **A. VM cloud GPU** (louée à l'heure) | campagnes 3D et entraînements sans accès à un centre de calcul | `sudo infra/deploy/bootstrap_vm.sh` |
| **B. Cluster Slurm** (Jean Zay, mésocentre, Slurm cloud) | grosses campagnes, multi-nœuds | `sbatch infra/slurm/…` — voir [`slurm/README-slurm.md`](slurm/README-slurm.md) |
| **C. Portable** (CPU) | développement, tests, petites grilles 2D/3D | `make setup && make smoke` |

Toutes les commandes se lancent **depuis la racine du dépôt**. `make help` liste les cibles.

---

## 1. Ce que l'on obtient

```
┌──────────────────────────── VM ou portable (docker compose) ────────────────────────────┐
│  db        PostgreSQL 16  — catalogue « milady » + base « mlflow »         127.0.0.1:5432 │
│  s3        MinIO          — buckets milady-data, milady-models, mlflow     127.0.0.1:9000 │
│                             (console web                                    127.0.0.1:9001)│
│  mlflow    MLflow 3       — suivi des entraînements                        127.0.0.1:5000 │
│  worker    image milady:cpu ou milady:gpu — simulations, entraînement, évaluation         │
│  jupyter   (facultatif)   — JupyterLab                                     127.0.0.1:8888 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

Les ports ne sont ouverts que sur `127.0.0.1` : depuis le portable, on y accède **par tunnel SSH**
(§2.4). Les mots de passe sont générés à l'installation dans `infra/docker/.env` (jamais commité).

## 2. Cible A — VM cloud avec GPU

### 2.1 Prérequis

1. Un compte chez un fournisseur proposant des VM GPU à l'heure (Scaleway, OVHcloud, AWS, Google
   Cloud, Azure, ou fournisseurs spécialisés GPU).
2. Une **clé SSH** (`ssh-keygen -t ed25519`) déclarée chez le fournisseur.
3. Une VM avec :
   - **Ubuntu 22.04 ou 24.04**, de préférence l'image « GPU / Deep Learning » du fournisseur
     (pilote NVIDIA préinstallé : le script installe le reste) ;
   - un GPU adapté à la taille des grilles (§6.2) ;
   - un disque de **100 à 200 Go** (images Docker ≈ 15 Go, plus les données si elles restent sur
     la VM ; avec un bucket S3 du fournisseur, 100 Go suffisent) ;
   - un pare-feu n'ouvrant que **SSH (22)**.

### 2.2 Installation en une commande (sur la VM)

```bash
ssh ubuntu@IP_DE_LA_VM
git clone https://github.com/knoel99/milady-2027.git && cd milady-2027
sudo infra/deploy/bootstrap_vm.sh            # options : --cpu, --no-smoke, --no-build
```

Le script (idempotent, relançable) :

1. installe les paquets de base et **Docker** depuis le dépôt officiel ;
2. si `nvidia-smi` voit un GPU : installe le **NVIDIA Container Toolkit** et le déclare à Docker ;
   si une carte NVIDIA est présente sans pilote : affiche la marche à suivre (installer le pilote
   avec `ubuntu-drivers install --gpgpu` puis redémarrer, ou recréer la VM avec une image GPU du
   fournisseur) et continue en CPU ;
3. génère `infra/docker/.env` avec des mots de passe aléatoires (`openssl rand`) ;
4. construit l'image (`milady:gpu`, CUDA 12.6, ou `milady:cpu`) et celle du serveur MLflow ;
5. démarre `db`, `s3` (création des buckets) et `mlflow`, et attend que leurs healthchecks soient verts ;
6. lance `make smoke` : simulation 3D minuscule → fichier MFF → S3 → catalogue → jeu de données →
   entraînement d'une itération (journalisé dans MLflow) → évaluation. Durée mesurée : 10 s.

Durée totale : **3 min mesurées** en CPU (`--cpu`, Docker déjà présent, construction de l'image à
froid ; 33 s pour une relance avec les images en cache, §11). Sur une VM GPU neuve, compter
5 à 20 minutes selon le débit réseau (installation de Docker, image GPU de plusieurs Go).

Derrière un proxy TLS d'entreprise ou de centre de calcul, donner son certificat **sur la même
ligne que `sudo`** (sudo ne transmet pas les variables d'environnement) :

```bash
sudo MILADY_BUILD_CACERT=/chemin/ca.pem infra/deploy/bootstrap_vm.sh
```

### 2.3 Autres façons d'installer

**Sans se connecter (cloud-init)** : à la création de la VM, coller
[`deploy/cloud-init.yaml`](deploy/cloud-init.yaml) dans le champ « user data » / « cloud-init »
de la console, après avoir vérifié l'URL du dépôt et l'utilisateur en tête du fichier. Suivi :
`ssh ubuntu@IP 'sudo tail -f /var/log/milady-bootstrap.log'`.

**Depuis le portable** (copie de votre arbre de travail, y compris des modifications non poussées) :

```bash
infra/deploy/deploy_remote.sh ubuntu@IP_DE_LA_VM                 # rsync + bootstrap
infra/deploy/deploy_remote.sh ubuntu@IP -i ~/.ssh/id_ed25519 -- --no-smoke
infra/deploy/deploy_remote.sh ubuntu@IP --git https://github.com/knoel99/milady-2027.git
```

Relancer la même commande met la VM à jour (les données et `.env` distants sont préservés).

**Dépôt privé** : sur la VM, `git clone git@github.com:knoel99/milady-2027.git` avec une clé de
déploiement en lecture seule (GitHub → Settings → Deploy keys), ou `deploy_remote.sh` (rsync, aucun
accès GitHub requis sur la VM).

### 2.4 Utiliser la VM

Après une nouvelle connexion SSH (pour que l'appartenance au groupe `docker` soit prise en compte) :

```bash
cd milady-2027
make ps                                                    # état des services
make sweep CONFIG=infra/configs/palier2_abc3d.yaml         # campagne (dans le conteneur de calcul)
make sweep CONFIG=infra/configs/palier2_abc3d.yaml SCHEDULER=docker   # un conteneur par simulation
make train CONFIG=infra/configs/train_fm3d.yaml            # entraînement (tous les GPU, torchrun)
make eval  CONFIG=infra/configs/train_fm3d.yaml            # évaluation (MODEL=<uuid> pour un modèle précis)
make shell                                                 # shell dans le conteneur de calcul
make logs SERVICE=mlflow                                   # journaux d'un service
```

Les longues campagnes se lancent dans `tmux` (installé) pour survivre à une déconnexion :
`tmux new -s milady`, puis `Ctrl-b d` pour se détacher et `tmux attach -t milady` pour revenir.

Interfaces web, depuis le portable :

```bash
ssh -N -L 5000:localhost:5000 -L 9001:localhost:9001 -L 8888:localhost:8888 ubuntu@IP_DE_LA_VM
```

puis <http://localhost:5000> (MLflow), <http://localhost:9001> (console MinIO, identifiants
`S3_ROOT_USER` / `S3_ROOT_PASSWORD` de `infra/docker/.env`), <http://localhost:8888> (JupyterLab
après `make jupyter`, jeton `JUPYTER_TOKEN`).

Catalogue en ligne de commande (dans le conteneur) :

```bash
make shell
python -m milady.catalog campaigns
python -m milady.catalog sims --campaign palier2_abc3d --param Rm__gt=8
python -m milady.catalog summary
```

### 2.5 Stocker les données chez le fournisseur plutôt que sur la VM

Par défaut, les fichiers vont dans MinIO, donc **sur le disque de la VM**. Pour qu'ils survivent à
la suppression de la VM, utiliser un bucket S3 du fournisseur : créer le bucket et une clé d'accès
dans la console, puis dans `infra/docker/.env` :

```bash
MILADY_STORAGE_URI=s3://mon-bucket-milady/data
MILADY_MODELS_URI=s3://mon-bucket-milady/models
MILADY_S3_ENDPOINT=https://s3.fr-par.scw.cloud     # point d'accès du fournisseur et de la région
MILADY_S3_ACCESS_KEY=<clé du fournisseur>
MILADY_S3_SECRET_KEY=<secret du fournisseur>
```

puis `make down && make up`. Ne pas modifier `S3_ACCESS_KEY` / `S3_SECRET_KEY` : ce sont les clés du
compte MinIO, toujours utilisé par MLflow pour ses artefacts (`make backup` les copie aussi vers le
bucket). Les clés du fournisseur ne sont données qu'aux conteneurs de calcul, jamais à MinIO.
Donner à cette clé des droits limités au seul bucket MilaDy (politique IAM du fournisseur).

## 3. Cible B — cluster Slurm

Voir [`slurm/README-slurm.md`](slurm/README-slurm.md) : image Apptainer construite depuis l'image
Docker (`make image-gpu && make sif`), tableau de jobs pour les simulations, `torchrun` multi-nœuds
pour l'entraînement, notes détaillées pour Jean Zay (comptes `projet@h100`, partitions, QoS,
`$WORK`/`$SCRATCH`, pas d'Internet sur les nœuds de calcul donc catalogue SQLite puis
synchronisation a posteriori avec `python -m milady.catalog ingest`).

## 4. Cible C — portable

### 4.1 Sans Docker (le plus léger)

Prérequis : Python 3.11, 3.12 ou 3.13 (verrou vérifié sous 3.13 ici, sous 3.12 dans l'image Docker),
le module `venv` (Debian/Ubuntu : `sudo apt install python3-venv`), `make`, 5 Go d'espace disque.
Ubuntu 22.04 n'a que Python 3.10 : y utiliser la pile Docker (§4.2) ou installer Python 3.12
(par exemple avec `uv python install 3.12`, puis `make setup PYTHON=…/python3.12`).

```bash
git clone https://github.com/knoel99/milady-2027.git && cd milady-2027
make setup                                # .venv + dépendances épinglées (torch CPU) + pip install -e .
source .venv/bin/activate
make smoke RUN=local                      # catalogue SQLite data/catalog.sqlite, fichiers dans data/store/
make test RUN=local
```

Chaîne complète en mode portable (vérifiée ici sur une campagne réduite à 4 simulations 12³ et un
entraînement de 6 itérations, §11 ; les campagnes réelles à 64³ demandent un GPU) :

```bash
make sweep CONFIG=infra/configs/palier2_tg3d.yaml          # simulations → MFF → data/store + catalogue
make train CONFIG=infra/configs/train_fm3d.yaml            # crée le jeu de données depuis la campagne, entraîne
make eval  CONFIG=infra/configs/train_fm3d.yaml            # dernier modèle « fm3d_tg3d » (ou MODEL=<uuid>)
python -m milady.catalog summary                           # moyenne/écart-type par modèle, métrique, paramètres
```

Pour un essai rapide, toute clé de la configuration d'entraînement se surcharge
(`TRAIN_ARGS="--set train.iters=10 data.kmax=3 …"`). Si `--set name=…` change le nom du modèle,
`make eval` ne le retrouve plus par son nom : passer `MODEL=<uuid>` (affiché en fin d'entraînement).

En mode portable, `MILADY_DB_URL` et `MILADY_STORAGE_URI` ne sont pas définis : le catalogue est
`data/catalog.sqlite` et le stockage `data/store/`. Sur un portable avec GPU NVIDIA :
`make setup GPU=1` (CUDA 12.6).

### 4.2 Avec Docker (même pile que la VM, sans GPU)

```bash
make env          # génère infra/docker/.env (mots de passe aléatoires) et data/
make image        # image milady:cpu (2 min à froid ; sinon construite au premier `make smoke`)
make up           # PostgreSQL + MinIO + MLflow
make smoke        # dans le conteneur worker (milady:cpu)
make down         # arrêt (les données restent dans les volumes Docker)
```

Docker Desktop (macOS, Windows/WSL2) convient ; prévoir 8 Go de RAM pour Docker.

## 5. Données et résultats

- **Fichiers** : un fichier MFF (HDF5, compatible The Well, attributs `milady_*`) par simulation, rangé
  sous `{MILADY_STORAGE_URI}/{campagne}/{uuid_simulation}/fields.h5`, avec somme SHA-256 au catalogue.
- **Catalogue** : campagnes, simulations (paramètres JSONB, statut, machine, temps de calcul), fichiers,
  diagnostics, jeux de données, modèles, évaluations, tâches ; vue `v_eval_summary`.
- **Suivi des entraînements** : MLflow (métriques, hyperparamètres, artefacts) ; `model.mlflow_run_id`
  relie le catalogue à MLflow.

## 6. Coûts : comment les estimer

Les prix varient selon le fournisseur, la région, le mode (à la demande, réservé, *spot* /
interruptible) et changent souvent : ce guide ne donne **aucun prix**, mais une méthode.

### 6.1 Formule

```
coût ≈ Σ_tâches (durée_h × nb_GPU × prix_horaire_GPU)       calcul (VM allumée = facturée, même inactive)
     + volume_disque_Go × prix_Go_mois × durée_mois          disques de la VM et instantanés
     + volume_objets_Go × prix_Go_mois × durée_mois           bucket S3
     + volume_sortant_Go × prix_Go_sortie                    téléchargements hors du fournisseur
```

Le prix horaire à utiliser est celui de **l'instance entière** (CPU, RAM et GPU inclus), relevé sur
la page de tarifs du fournisseur le jour de la location.

### 6.2 Mesurer avant d'extrapoler

1. Lancer une seule simulation représentative (même résolution, même durée simulée) et lire son
   temps de calcul au catalogue (`wall_time_s`) ;
2. heures GPU de la campagne ≈ `wall_time_s × nb_simulations / 3600` (1 GPU par simulation) ;
3. entraînement ≈ durée d'une époque × nombre d'époques × nombre de GPU ;
4. après coup, la consommation réelle se lit dans le catalogue :

```sql
-- heures GPU consommées par campagne
SELECT c.name, round(sum(s.wall_time_s * greatest(s.n_gpus, 1)) / 3600.0, 1) AS heures_gpu
FROM simulation s JOIN campaign c ON c.id = s.campaign_id
WHERE s.status = 'done' GROUP BY c.name ORDER BY heures_gpu DESC;
```

Ordre de grandeur de la mémoire GPU (calcul, pas mesure) : un état (u, B) en float32 sur une grille
N³ occupe 6 × N³ × 4 octets, soit ≈ 0,4 Go pour N = 256 et ≈ 3,2 Go pour N = 512 ; le schéma
RK4 pseudo-spectral garde une dizaine de tableaux de cette taille (étapes intermédiaires, FFT,
désaliasage). Compter quelques Go pour 256³ (un GPU de 24 Go suffit) et plusieurs dizaines de Go
pour 512³ (GPU de 80 Go). À vérifier avec `nvidia-smi` pendant la simulation de test.

### 6.3 Réduire la facture

- **Instances interruptibles (*spot*)** pour les tableaux de simulations : chaque simulation est
  indépendante et ré-exécutable (statut `failed` au catalogue → relancer la campagne) ;
- éteindre la VM entre deux campagnes **et la supprimer** quand elle ne sert plus (§8) ;
- garder les données dans un bucket S3 (moins cher qu'un disque de VM au Go) ;
- dimensionner le GPU sur la mémoire réellement nécessaire (§6.2) plutôt que sur le plus gros modèle.

## 7. Sauvegarde et restauration

```bash
make backup                                     # → ./backups (dumps PostgreSQL + miroir des buckets)
make backup BACKUP_TARGET=/mnt/disque-sauvegarde
BACKUP_S3_ENDPOINT=https://s3.fr-par.scw.cloud BACKUP_ACCESS_KEY=… BACKUP_SECRET_KEY=… \
  make backup BACKUP_TARGET=s3://mon-bucket/milady-sauvegardes
```

`infra/deploy/backup.sh` produit des dumps compressés `pg_dump -Fc` des bases `milady` et `mlflow`
(rotation : 14 derniers) et un miroir incrémental des buckets (`mc mirror`). À lancer **avant toute
suppression de VM**, et idéalement chaque nuit par `cron` (exemple dans l'en-tête du script).

Restauration sur une nouvelle machine (après `make env && make up`) :

```bash
C="docker compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env"
$C exec -T db pg_restore -U milady -d milady --clean --if-exists < backups/db/milady-AAAAMMJJTHHMMSSZ.dump
$C exec -T db pg_restore -U milady -d mlflow --clean --if-exists < backups/db/mlflow-AAAAMMJJTHHMMSSZ.dump
$C run --rm --no-deps -v "$PWD/backups:/backup" --entrypoint /bin/sh s3-init -c \
  'mc alias set src http://s3:9000 "$S3_ROOT_USER" "$S3_ROOT_PASSWORD" &&
   for b in milady-data milady-models mlflow; do mc mirror --overwrite "/backup/objects/$b" "src/$b"; done'
```

## 8. Arrêter de payer

Une VM **arrêtée** reste souvent facturée en partie (disque, adresse IP, parfois le GPU réservé,
selon le fournisseur). Pour arrêter réellement la facturation :

1. `make backup BACKUP_TARGET=…` vers un bucket ou le portable, et vérifier la sauvegarde ;
2. `make down` ;
3. dans la console du fournisseur : **supprimer la VM**, puis vérifier qu'il ne reste ni disque
   (volume) détaché, ni instantané, ni adresse IP réservée ;
4. le bucket S3 continue d'être facturé au Go-mois : supprimer ce qui n'est plus utile.

Astuce : programmer une alerte de budget dans la console du fournisseur.

## 9. Dépannage

| Symptôme | Cause probable et remède |
|---|---|
| `permission denied … docker.sock` | se reconnecter en SSH (groupe `docker` ajouté par le script), ou préfixer par `sudo` |
| `bootstrap` : « carte NVIDIA présente mais pilote absent » | `sudo ubuntu-drivers install --gpgpu && sudo reboot`, puis relancer le script ; ou image GPU du fournisseur |
| le conteneur ne voit pas le GPU | `sudo nvidia-ctk runtime configure --runtime=docker && sudo systemctl restart docker` ; tester `docker run --rm --gpus all milady:gpu nvidia-smi` |
| `CUDA error: no kernel image` ou pilote trop ancien | image CUDA 12.6 : pilote ≥ 525 ; GPU Blackwell : construire avec `BASE_IMAGE=…cuda13.0…` (en-tête de `Dockerfile.gpu`) |
| `make up` : un service reste `unhealthy` | `make logs SERVICE=<service>` ; `make ps` |
| PostgreSQL : authentification refusée après avoir régénéré `.env` | le mot de passe est fixé à la création du volume : remettre l'ancien `.env`, ou repartir de zéro (`docker compose … down -v` **efface les données**) |
| MLflow : `Invalid Host header` | ajouter le nom utilisé dans `MLFLOW_ALLOWED_HOSTS` (`.env`) |
| `pull access denied for minio/minio` | MinIO ne publie plus d'images communautaires : garder `pgsty/minio` (défaut), ou une autre image S3 via `MINIO_IMAGE`, ou un bucket du fournisseur (§2.5) |
| `pip` : `CERTIFICATE_VERIFY_FAILED` pendant `docker build` (proxy d'entreprise) | `make image MILADY_BUILD_CACERT=/chemin/ca.pem` (idem `image-gpu`, `image-mlflow`, `image-jupyter`) |
| disque plein | `docker system df` puis `docker image prune` ; déplacer les données vers un bucket (§2.5) |
| `make smoke` échoue | relancer avec `MILADY_SMOKE_DEBUG=1` ; l'étape en échec est nommée ; `make smoke RUN=local` isole Docker ; `python infra/deploy/smoke.py --allow-fallback` isole l'infrastructure (stockage, catalogue, MLflow) d'une panne du solveur, de l'entraînement ou des métriques |
| `bootstrap` derrière un proxy : `CERTIFICATE_VERIFY_FAILED` alors que `MILADY_BUILD_CACERT` est exporté | `sudo` efface l'environnement : `sudo MILADY_BUILD_CACERT=/chemin/ca.pem infra/deploy/bootstrap_vm.sh` |
| `make sweep` (Docker) : `Permission denied` sur `/opt/milady/data` | dépôt possédé par root : `make env` (ou `bootstrap_vm.sh`) donne `data/` à l'UID du conteneur ; sinon `sudo install -d -o 1000 -g 1000 data` |
| `make setup` : `ensurepip is not available` | `sudo apt install python3-venv` (ou `python3.12-venv`) |
| `make eval` : « préciser --model » | aucun modèle du nom de la configuration (`name:`) : passer `MODEL=<uuid>` (`python -m milady.catalog summary`) |
| journaux `torchrun` : `errno: 97 - Address family not supported` | avertissement sans conséquence (IPv6 absent) |
| port 5432/9000/5000 déjà utilisé | changer `DB_PORT`, `S3_PORT`, `MLFLOW_PORT` dans `.env` |

## 10. Sécurité

- Aucun secret dans le dépôt : `infra/docker/.env` (droits 600) est ignoré par git, seul
  `.env.example` est versionné ; les identifiants de sauvegarde passent par l'environnement.
- Ports liés à `127.0.0.1` (accès par tunnel SSH), y compris JupyterLab (8888, protégé en plus par le
  jeton `JUPYTER_TOKEN`) ; ne pas ouvrir 5432, 9000, 9001, 5000, 8888 sur Internet.
  Docker contourne le pare-feu `ufw` pour les ports publiés : ne jamais mettre `BIND_ADDR=0.0.0.0`
  sur une VM exposée ; pour un cluster Slurm du même réseau privé, l'adresse privée et un groupe de
  sécurité limité au sous-réseau (voir `slurm/README-slurm.md` §4).
- MinIO : un compte applicatif (`S3_ACCESS_KEY`, droits lecture/écriture) distinct du compte
  administrateur ; les clés d'un bucket du fournisseur (`MILADY_S3_ACCESS_KEY`) ne sont données
  qu'aux conteneurs de calcul, jamais à MinIO (§2.5).
- Mots de passe hors de la ligne de commande des processus (`ps`) : l'URI PostgreSQL de MLflow
  (`MLFLOW_BACKEND_STORE_URI`) et le jeton Jupyter (`JUPYTER_TOKEN`) passent par l'environnement
  du conteneur (`docker inspect` les montre toujours : réservé à root et au groupe `docker`).
- Conteneurs de calcul, Jupyter et MLflow sans root (UID de l'hôte, ou 10001 pour MLflow) ;
  PostgreSQL abandonne root au démarrage (image officielle) ; MinIO (image `pgsty/minio`) tourne en
  root dans son conteneur, sans port exposé hors de `127.0.0.1`.
- Mettre à jour : `git pull && make image image-mlflow && make up` (ou `make image-gpu`).

## 11. Ce qui a été testé, et combien de temps cela prend (CPU)

Mesures du 7 novembre 2026 sur une machine de test **sans GPU** (4 cœurs partagés avec d'autres
calculs, Ubuntu 24.04, Docker 29.9, Compose 5.6, accès Internet par un proxy TLS). Les durées sont
des temps « horloge » de la commande entière ; elles donnent un ordre de grandeur, pas une garantie.

**Portable, sans Docker** (venv Python 3.13, catalogue SQLite, stockage `file://`) :

| Commande | Durée | Résultat |
|---|---|---|
| `make setup` (venv neuf, dépendances épinglées, torch CPU 196 Mo) | 68 s | installation complète |
| `make smoke RUN=local` | 4 s | 10 étapes OK (simulation 16³ → MFF validé → Zarr → catalogue → jeu de données → 1 itération `fm3d` → évaluation → `eval_summary`) |
| `make test RUN=local` | 20 s | 61 réussis, 6 sautés (PostgreSQL, S3 et données E2 absents) |
| `make sweep CONFIG=<campagne TG 2×2, 12³>` | 4 s | 4 simulations `done`, fichiers MFF + sha256 au catalogue |
| `make train CONFIG=infra/configs/train_fm3d.yaml TRAIN_ARGS="--set … train.iters=6 data.kmax=3"` | 5 s | jeu de données créé depuis la campagne, modèle + évaluation rapide au catalogue |
| `make eval CONFIG=infra/configs/train_fm3d.yaml MODEL=<uuid>` | 2 s | 4 points évalués, `python -m milady.catalog summary` cohérent ; sans `MODEL`, le dernier modèle du nom de la configuration est retrouvé |

**Pile Docker complète** (PostgreSQL 16, MinIO, MLflow 3.17, conteneur `worker` CPU) :

| Commande | Durée | Résultat |
|---|---|---|
| `make env` | < 1 s | `.env` (droits 600, mots de passe aléatoires), `data/` à l'UID du conteneur |
| `make image MILADY_BUILD_CACERT=…` (à froid) | 2 min | image `milady:cpu` de 2,3 Go (dont 64 s d'installation pip) |
| `make image` (nouveau commit, dépendances inchangées) | 7 s | couches apt et pip réutilisées |
| `make up` (images présentes) | 14 s | `db`, `s3`, `mlflow` sains, `s3-init` terminé (code 0) |
| `make smoke` (dans un conteneur `worker` éphémère) | 10 s | 10 étapes OK ; objets dans MinIO, run MLflow `FINISHED`, lignes au catalogue |
| `docker compose … --profile cpu up -d worker` puis `docker compose … exec worker make smoke RUN=local` | 6 s | idem, depuis un `worker` permanent |
| `make sweep CONFIG=<campagne réduite>` | 10 s | 4 simulations dans le conteneur, fichiers dans `s3://milady-data/<campagne>/<uuid>/fields.h5` |
| `make sweep … SCHEDULER=docker SWEEP_ARGS="--force --indices 0,1"` | 9 s | un conteneur par simulation, tâches `docker` au catalogue |
| `make train …` (mêmes surcharges) | 10 s | run MLflow (86 paramètres, courbes de perte), points de contrôle dans `s3://milady-models` |
| `make eval … EVAL_ARGS="--out s3://milady-models/…/eval.json"` | 5 s | évaluations au catalogue, rapport JSON dans S3 |
| `make test` (dans le conteneur, PostgreSQL et MinIO de la pile) | 32 s | 66 réussis, 1 sauté (données E2) |
| `make backup BACKUP_TARGET=/tmp/…` | 1 s | `milady-*.dump`, `mlflow-*.dump`, miroir des 3 buckets |
| `docker compose … down -v` | 3 s | conteneurs, réseau et volumes supprimés |

Contrôles faits à la main après `make smoke` : `docker compose … exec db psql -U milady -d milady`
(tables `campaign`, `simulation`, `file`, `diagnostic`, `dataset`, `model`, `evaluation`, `job` et vue
`v_eval_summary` remplies ; base `mlflow` présente), `mc ls -r` sur les trois buckets (fichiers MFF,
points de contrôle, artefacts MLflow), API REST de MLflow (`/api/2.0/mlflow/runs/get` : run `FINISHED`,
métrique `loss`, artefact `checkpoint.pt`).

**Parcours d'un nouvel utilisateur** (copie propre du dépôt, sans `data/` ni `.env`, en root) :

| Commande | Durée | Résultat |
|---|---|---|
| `MILADY_BUILD_CACERT=… infra/deploy/bootstrap_vm.sh --cpu` (1er passage, image à froid) | 3 min 03 s | 7 étapes, test de fumée réussi, code 0 |
| même commande, 2e passage (images en cache) | 33 s | `.env` conservé, test de fumée réussi |
| `bootstrap_vm.sh --cpu --no-build --no-smoke` | 4 s | idempotent |

**Gabarits Slurm exécutés sans Slurm** (`MILADY_SIF=none`, venv, `$WORK`/`$SCRATCH` simulés,
`srun`/`scontrol` remplacés par des scripts factices) :

| Commande | Durée | Résultat |
|---|---|---|
| `SLURM_ARRAY_TASK_ID=i bash infra/slurm/gen_data.sbatch <campagne>` (4 éléments) | 2 s chacun | fichiers dans `$SCRATCH/milady/store`, catalogue SQLite `$WORK/milady/catalog.sqlite` |
| `GPUS_PER_NODE=2 bash infra/slurm/train.sbatch infra/configs/train_fm3d.yaml --set …` | 6 s | `torchrun` à 2 processus CPU (gloo), MLflow SQLite `$WORK/milady/mlflow.db` |
| `bash infra/slurm/eval.sbatch infra/configs/train_fm3d.yaml --model <uuid>` | 2 s | évaluations au catalogue du cluster |
| `python -m milady.sweep infra/configs/palier2_abc3d.yaml --scheduler slurm --dry-run` | 1 s | script `sbatch` rendu (`--array=0-36%16`), rien de soumis |

**Contrôles de la relecture** (même jour, après corrections) :

| Contrôle | Résultat |
|---|---|
| `make test` hors conteneur avec un PostgreSQL 16 de test | 66 réussis, 1 sauté (données E2) ; `schema.sql` ≡ `models.py`, `DEFAULT` compris |
| fichier MFF 3D relu avec les accès HDF5 de `WellDataset` (the_well 1.2.0) | champs identiques, conditions aux limites `PERIODIC` |
| 18 corruptions d'un fichier MFF (type, groupes, formes, NaN, masques, UUID…) | toutes signalées par `validate` (NaN au milieu d'une trajectoire : `--full`) |
| pile Docker (`up`, `make smoke` dans `worker`) | MLflow sous l'UID 10001, aucun mot de passe dans `ps`, ports sur `127.0.0.1` |
| `make jupyter` | 403 sans jeton ou avec un faux jeton, 200 avec `JUPYTER_TOKEN` |
| `gen_data.sbatch` (srun factice) : SIGTERM pendant la simulation, puis même indice resoumis | point de contrôle écrit, reprise à t = 113 puis fin `done` |
| section Docker de `bootstrap_vm.sh` dans un Ubuntu 24.04 jetable avec `docker.io` | `docker.io` retiré, `docker.sources` (deb822) lu par apt, `docker-ce` disponible |
| dépendances de l'image GPU (sans torch/CUDA) résolues pour Python 3.12 manylinux | 95 paquets, torch de l'image de base conservé |
| soumission depuis un venv léger de frontale (PyYAML, NumPy, SQLAlchemy ; `sbatch` factice) | tableau soumis, tâches enregistrées au catalogue |

## 12. Ce qui n'a pas pu être testé ici

- **GPU** : aucune carte sur la machine de test. Non exécutés : l'image `milady:gpu`
  (`Dockerfile.gpu` construit jusqu'à l'étape pip, corrigée ensuite, sans reconstruction complète),
  le NVIDIA Container Toolkit et l'étape 3 de `bootstrap_vm.sh`, le service `worker-gpu`, le solveur
  et l'entraînement sur CUDA (bf16, plusieurs GPU, NCCL), `make train NGPUS=4`. Aucun temps de calcul
  GPU n'est donc donné ; le mesurer d'abord :
  `python -m milady.sim.mhd3d bench --n 64 128 256 --device cuda --steps 50`.
- **Slurm réel** : pas d'ordonnanceur ici. `sbatch`, les tableaux de jobs, `srun` multi-nœuds,
  le rendez-vous `torchrun` entre nœuds et la remise en file après préemption n'ont pas été vus
  tourner. `gen_data.sbatch` lance la simulation dans une étape `srun` avec `--signal=TERM@120` :
  SIGTERM 120 s avant la limite, point de contrôle, puis reprise en resoumettant l'indice (chaîne
  SIGTERM → point de contrôle → reprise vérifiée ici avec un `srun` factice ; la livraison du signal par
  un vrai Slurm reste à observer une fois sur le cluster, avec `--time` court).
- **Apptainer / Singularity** : non installés ici ; `make sif`, `apptainer.def` et la fonction
  `milady_run` en mode conteneur (`--nv`, montages) ne sont pas testés.
- **Jean Zay** : les options (`projet@h100`, `-C h100`, QoS, `idrcontmgr`, absence d'Internet sur
  les nœuds) viennent de la documentation IDRIS, sans exécution.
- **Fournisseurs cloud** : aucune VM louée. Non testés : `cloud-init.yaml` (seulement analysé comme
  YAML), `deploy_remote.sh` (rsync/SSH vers une VM), une installation de Docker sur une Ubuntu sans
  Docker (ici Docker était déjà présent : l'étape 2 a été sautée), Ubuntu 22.04, les buckets S3 de
  fournisseurs (AWS, Scaleway, OVHcloud : seul MinIO a servi) et `make backup` vers `s3://…`.
- **Grandeur réelle** : les campagnes `palier2_abc3d` (37 simulations 64³) et `palier2_tg3d`
  (12 simulations 64³) et un entraînement complet (`train_fm3d.yaml`, 200 époques) n'ont pas été
  lancés : seules des versions réduites l'ont été.
- **Jupyter** : `make jupyter` a été vérifié pendant le développement (jeton exigé), pas lors de ce
  passage d'intégration.
