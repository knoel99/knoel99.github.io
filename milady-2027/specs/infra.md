# Contrat d'infrastructure — calcul HPC / cloud pour MilaDy

Objectif : qu'un utilisateur puisse **cloner le dépôt et déployer en une commande** sur (1) une VM GPU louée dans le cloud, (2) un cluster HPC Slurm (IDRIS Jean Zay, mésocentres, Slurm cloud), (3) un portable (CPU), puis lancer les campagnes de simulation, d'entraînement et d'évaluation du stage et de la thèse, avec des données dans un format standard et un catalogue central des résultats.

Racine : le dossier `milady-2027/` (destiné à devenir le dépôt `knoel99/milady-2027`). Tout ce qui suit est relatif à cette racine.

## 1. Arborescence

```
Makefile                     cibles : setup, up, down, smoke, sweep, train, eval, backup, image, sif
infra/
  README.md                  guide de déploiement pas à pas (FR), coûts indicatifs, dépannage
  ARCHITECTURE.md            vue d'ensemble, schéma des flux, choix techniques justifiés
  env/requirements.txt       dépendances Python épinglées (CPU) ; requirements-gpu.txt (CUDA)
  docker/Dockerfile          image CPU (python:3.12-slim) ; Dockerfile.gpu (pytorch/pytorch:*-cuda*-runtime)
  docker/docker-compose.yml  services : db (PostgreSQL 16), s3 (MinIO), mlflow, worker (+ profil gpu), jupyter (profil optionnel)
  docker/.env.example        variables (mots de passe générés par bootstrap, jamais commités)
  deploy/bootstrap_vm.sh     VM Ubuntu 22.04/24.04 neuve : Docker, NVIDIA Container Toolkit si GPU, .env, compose up, smoke test
  deploy/cloud-init.yaml     même chose en user-data (création de VM par la console du fournisseur)
  deploy/deploy_remote.sh    depuis le portable : rsync/ssh vers une VM, puis bootstrap
  deploy/backup.sh           dump PostgreSQL + synchronisation du stockage objet vers un bucket ou un disque
  slurm/                     gabarits sbatch : gen_data.sbatch (tableau de jobs), train.sbatch (torchrun multi-GPU), eval.sbatch ; apptainer.def ; README Jean Zay
  configs/                   campagnes YAML : palier1_mhd2d.yaml, palier2_abc3d.yaml, palier2_tg3d.yaml ; train_fm3d.yaml
  db/schema.sql              schéma PostgreSQL (compatible SQLite pour le mode portable, via SQLAlchemy)
milady/                      paquet Python installable (pip install -e .)
  pyproject.toml (à la racine milady-2027/)
  milady/data/format.py      lecture/écriture du format MilaDy (HDF5, compatible The Well) + validation
  milady/data/schema.json    schéma JSON des métadonnées
  milady/data/convert.py     convertisseurs : E2 (npz) → format ; squelette SFEMaNS (Fourier × éléments finis)
  milady/catalog/models.py   modèle SQLAlchemy du catalogue (= db/schema.sql)
  milady/catalog/api.py      enregistrer une simulation, un fichier, un modèle, une évaluation ; requêtes
  milady/storage.py          stockage via fsspec : file://, s3:// (MinIO, AWS, Scaleway, OVH), chemins HPC
  milady/sim/mhd3d.py        solveur pseudo-spectral MHD 3D incompressible (PyTorch, CPU ou GPU)
  milady/sim/run.py          exécute une simulation d'une campagne, écrit le format, enregistre au catalogue
  milady/sweep.py            développe une campagne YAML en jobs (local, docker, slurm) et les soumet
  milady/train/fm3d.py       flow matching conditionnel de champs 3D, contraintes dures (potentiel vecteur) et perte de stationnarité ; DDP
  milady/eval/metrics.py     métriques physiques (divergence, spectres, hélicités, bilans) et distances entre lois
tests/                       pytest : format (aller-retour, validation), catalogue (SQLite), solveur (énergie, ∇·B), entraînement (une itération)
```

## 2. Format de données MilaDy (« MFF », version 1.0)

Principe : **compatible avec le format HDF5 de The Well** (Ohana et al., NeurIPS 2024 Datasets & Benchmarks ; dépôt PolymathicAI/the_well, page « data format » à lire et suivre exactement) pour les grilles régulières, plus des **métadonnées MilaDy** dans des attributs préfixés `milady_`. Un fichier = une simulation (une ou plusieurs trajectoires de mêmes paramètres).

- Groupes et attributs de The Well : attributs racine (`dataset_name`, `grid_type`, `n_spatial_dims`, `n_trajectories`, `simulation_parameters` + un attribut par paramètre), groupes `dimensions/` (`time`, `x`, `y`, `z`), `boundary_conditions/`, `scalars/`, `t0_fields/` (scalaires), `t1_fields/` (vecteurs), `t2_fields/` (tenseurs), avec leurs attributs (`field_names`, `dim_varying`, `sample_varying`, `time_varying`…). Forme d'un champ vectoriel : `(n_trajectories, n_t, nx, ny, nz, 3)`.
- Champs MilaDy standard : `t1_fields/velocity` (**u**), `t1_fields/magnetic_field` (**B**, unités d'Alfvén) ; optionnels `t1_fields/vector_potential` (**A**), `t0_fields/pressure`.
- Attributs MilaDy (racine) : `milady_format_version` = "1.0", `milady_code` (`mhd3d_torch`, `mhd2d_numpy`, `sfemans`, `latu`…), `milady_code_version`, `milady_git_commit`, `milady_parameters` (JSON : Re, Rm, Pm, mu_r, forçage…), `milady_nondimensionalization` (texte), `milady_created`, `milady_host`, `milady_command`, `milady_uuid` (= identifiant au catalogue).
- Groupe optionnel `milady_spectral/` : coefficients de Fourier (rfftn) des champs, pour les domaines périodiques (dérivées exactes, plus compact).
- Groupe optionnel `milady_diagnostics/` : séries temporelles (énergie cinétique et magnétique, dissipation, injection, hélicités, max |∇·B|).
- Stockage : float32, découpage en blocs par pas de temps (`chunks=(1, 1, *spatial, comp)`), compression `gzip` niveau 4 (ou `lzf`) ; somme SHA-256 calculée à l'écriture et stockée au catalogue.
- Extension `grid_type = "fourier_fe_axisym"` (SFEMaNS) : nœuds méridiens (r, z), connectivité, modes azimutaux m, coefficients cos/sin par mode, sans interpolation ; outil d'interpolation vers une grille régulière cylindrique ou cartésienne pour l'apprentissage. Spécifié ici, implémentation en squelette documenté (les données SFEMaNS ne sont pas publiques).
- Variante cloud : la même hiérarchie en **Zarr** (lecture par morceaux depuis S3), via la même API.
- `milady.data.format.validate(path)` vérifie la conformité (groupes, formes, attributs, schéma JSON des métadonnées).

## 3. Catalogue (PostgreSQL ; SQLite en mode portable)

Tables (clés UUID, horodatages UTC, JSONB pour les paramètres) :
- `campaign` (id, name, description, config_yaml, created_at)
- `simulation` (id, campaign_id, code, code_version, git_commit, parameters JSONB, grid JSONB, status ∈ {queued, running, done, failed}, host, n_gpus, n_cpus, wall_time_s, started_at, finished_at, notes)
- `file` (id, simulation_id, kind ∈ {fields, spectral, diagnostics, checkpoint, log}, uri, format_version, size_bytes, sha256, n_t, t_start, t_end, created_at)
- `diagnostic` (simulation_id, name, t, value) — séries temporelles légères pour requêtes rapides
- `dataset` (id, name, version, description, created_at) + `dataset_member` (dataset_id, file_id, split ∈ {train, val, test})
- `model` (id, name, architecture, constraint_mechanism, hyperparams JSONB, dataset_id, mlflow_run_id, checkpoint_uri, git_commit, created_at)
- `evaluation` (id, model_id, parameters JSONB, metric, value, n_samples, seed, details JSONB, created_at)
- `job` (id, kind, scheduler ∈ {local, docker, slurm}, external_id, simulation_id ou model_id, status, submitted_at, started_at, finished_at, log_uri)
- vue `v_eval_summary` (moyenne et écart-type par modèle, métrique et paramètres).

MLflow (même PostgreSQL, base distincte ; artefacts dans S3) suit les entraînements ; `model.mlflow_run_id` relie les deux.

## 4. Stockage

- Objets lourds (fichiers MFF, points de contrôle, figures) : **S3** — MinIO dans le compose (bucket `milady-data`, `milady-models`, `mlflow`), ou un bucket du fournisseur (AWS S3, Scaleway, OVHcloud) en changeant `MILADY_STORAGE_URI` et les identifiants.
- Sur HPC : chemins `$SCRATCH` / `$WORK` (fichiers locaux), catalogue SQLite sur `$WORK` ou PostgreSQL distant joignable.
- Convention d'URI : `{MILADY_STORAGE_URI}/{campaign}/{simulation_uuid}/{kind}.h5`.

## 5. Déploiement

- **VM cloud GPU** : `git clone … && cd milady-2027 && sudo infra/deploy/bootstrap_vm.sh` ; installe Docker et le NVIDIA Container Toolkit si un GPU est détecté, génère `.env` (mots de passe aléatoires), construit l'image (`Dockerfile.gpu` si GPU), lance `db`, `s3`, `mlflow`, puis `make smoke` (simulation 3D minuscule → fichier MFF → catalogue → entraînement d'une itération → évaluation).
- **HPC Slurm** : `make sif` (Apptainer depuis l'image Docker ou `apptainer.def`), puis `python -m milady.sweep infra/configs/palier2_abc3d.yaml --scheduler slurm` (tableau de jobs), `sbatch infra/slurm/train.sbatch`. Notes pour Jean Zay (modules, partitions GPU, `$WORK`, `$SCRATCH`, pas d'Internet sur les nœuds de calcul).
- **Portable** : `make setup` (venv + `pip install -e .`), catalogue SQLite, stockage local `./data`.
- Aucun secret dans le dépôt ; `.env` et identifiants dans `.gitignore`.

## 6. Solveur 3D et entraînement (palier 2 de la thèse)

- `milady/sim/mhd3d.py` : MHD incompressible 3D pseudo-spectrale périodique (PyTorch, `torch.fft`, CPU/GPU, float32/float64), désaliasage 2/3, RK4 à facteur intégrant ; écoulement imposé (cinématique, ABC ou Taylor–Green) ou dynamique complète forcée (forçage ABC ou Taylor–Green) ; ∇·u = ∇·B = 0 préservés par projection ; diagnostics (énergies, dissipation, injection, hélicités, max |∇·B|). Tests : bilan d'énergie, divergence à la précision machine, reproduction du seuil cinématique ABC (≈ 8,9) à basse résolution.
- `milady/train/fm3d.py` : flow matching conditionnel par (Rm, Re…) ; représentation par potentiel vecteur dans la base de Fourier tronquée (divergence nulle exacte, jauge de Coulomb k·Â = 0) ; perte de stationnarité optionnelle (estimateur sans biais par deux demi-lots) ; symétrie B → −B optionnelle ; `torchrun` / DDP ; journalisation MLflow ; points de contrôle vers S3.
- `milady/eval/metrics.py` : divergence relative, spectres E_u(k) et E_B(k), hélicités, résidus de bilans, distance d'énergie entre lois.
