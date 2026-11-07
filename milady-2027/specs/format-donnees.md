# Format de données MilaDy — MFF 1.0 (MilaDy Field Format)

Spécification de référence du format des résultats de simulation du projet (stage M2 puis thèse, palier 1 MHD 2D,
palier 2 MHD 3D, données SFEMaNS). Code de référence : `milady/data/format.py` (écriture, lecture, validation),
`milady/data/schema.json` (schéma JSON des métadonnées), `milady/data/convert.py` (convertisseurs). Contrat
d'ensemble : `specs/infra.md`, section 2.

## 1. Principes

1. **Compatible avec The Well.** Un fichier MFF sur grille régulière est un fichier HDF5 qui suit exactement la
   spécification de The Well (Ohana et al., NeurIPS 2024 Datasets & Benchmarks ; dépôt `PolymathicAI/the_well`,
   page `docs/data_format.md`) : mêmes groupes, mêmes formes, mêmes attributs. Le chargeur `WellDataset` de
   The Well lit nos champs sans modification, et nos outils lisent les jeux de données de The Well.
2. **Un fichier = une simulation** : une ou plusieurs trajectoires (membres d'ensemble, graines différentes) qui
   partagent les mêmes paramètres physiques et la même grille. L'identifiant `milady_uuid` du fichier est celui
   de la simulation au catalogue.
3. **Métadonnées MilaDy à part** : tout ajout porte le préfixe `milady_` (attributs racine, groupes
   `milady_diagnostics/`, `milady_spectral/`, `milady_fourier_fe/`). Un lecteur The Well les ignore.
4. **Simple précision** pour les champs (float32), comme The Well ; double précision pour les séries de
   diagnostics (bilans d'énergie), qui sont légères.
5. **Intégrité et reproductibilité** : somme SHA-256 calculée à l'écriture et stockée au catalogue ;
   provenance complète (code, version, commit git, commande, hôte, date, paramètres) dans le fichier.

## 2. Arborescence

Exemple réel : un fichier de l'expérience E2 (MHD 2D forcée, η = 0,008, partition d'entraînement), produit par
`python -m milady.data.convert e2` puis affiché par `python -m milady.data.convert info fichier.h5` (équivalent
lisible de `h5dump -H fichier.h5`). Les attributs sont notés `@nom`, les jeux de données `nom: type(forme)`.

```text
/
  @dataset_name = 'milady_e2_mhd2d'
  @grid_type = 'cartesian'
  @n_spatial_dims = 2
  @n_trajectories = 16
  @simulation_parameters = ['nu', 'eta', 'Pm', 'alpha', 'eps_u', 'eps_b', 'kf_min', 'kf_max']
  @nu = 0.008   @eta = 0.008   @Pm = 1.0   @alpha = 0.02   @eps_u = 0.05   @eps_b = 0.05   @kf_min = 2.0   @kf_max = 3.0
  @milady_format_version = '1.0'
  @milady_code = 'mhd2d_numpy'
  @milady_code_version = 'experiences/mhd2d.py'
  @milady_git_commit = '07efe3c19375-dirty'
  @milady_parameters = '{"Pm": 1.0, "alpha": 0.02, "eps_b": 0.05, "eps_u": 0.05, "eta": 0.008, ...}'
  @milady_nondimensionalization = "Domaine [0, 2π)² périodique ; B en unités d'Alfvén ..."
  @milady_created = '2026-11-07T08:03:03Z'
  @milady_host = 'vm'
  @milady_command = 'python -m milady.data.convert e2 donnees_e2 e2_mff'
  @milady_uuid = '3a3a3ddb-ab0c-47f0-bd08-b94f580880cb'
  @milady_split = 'train'   @milady_seed = 102   @milady_experiment = 'E2'
  @milady_source = 'eta_0.008000_train.npz'   @milady_source_sha256 = '0f323f00…'
  @milady_solver = '{"dt": 0.01, "members": 16, "sampling_interval": 1.0, "scheme": "...", "t_burn": 30.0}'
  dimensions/
    @spatial_dims = ['x', 'y']
    time: float32(150,)                @sample_varying = False
    x: float32(32,)                    @sample_varying = False  @time_varying = False
    y: float32(32,)                    @sample_varying = False  @time_varying = False
  boundary_conditions/
    x_periodic/
      @associated_dims = ['x']  @associated_fields = []  @bc_type = 'periodic'
      @sample_varying = False   @time_varying = False
      mask: bool(32,)                  vrai aux indices 0 et 31
      values: float32(2,)
    y_periodic/                        (idem pour y)
  scalars/
    @field_names = ['nu', 'eta', 'Pm', 'alpha', 'eps_u', 'eps_b', 'kf_min', 'kf_max',
                    'injection_rate_u', 'injection_rate_b']
    nu: float32()                      @sample_varying = False  @time_varying = False
    ...
    injection_rate_u: float32()        @sample_varying = False  @time_varying = False
  t0_fields/
    @field_names = []
  t1_fields/
    @field_names = ['velocity', 'magnetic_field']
    velocity: float32(16, 150, 32, 32, 2)        chunks=(1, 1, 32, 32, 2) gzip(4)
      @dim_varying = [True, True]  @sample_varying = True  @time_varying = True
    magnetic_field: float32(16, 150, 32, 32, 2)  chunks=(1, 1, 32, 32, 2) gzip(4)
      @dim_varying = [True, True]  @sample_varying = True  @time_varying = True
  t2_fields/
    @field_names = []
  milady_diagnostics/
    @field_names = ['kinetic_energy', 'magnetic_energy', 'enstrophy', 'mean_square_current',
                    'dissipation', 'cross_helicity', 'max_div_b']
    time: float64(150,)
    kinetic_energy: float64(16, 150)   @sample_varying = True  @time_varying = True
    ...
  milady_spectral/
    @field_names = ['vorticity', 'magnetic_potential']
    @transform = 'numpy.fft.rfftn'  @norm = 'backward'  @axes = [2, 3]
    @real_shape = [32, 32]  @spatial_dims = ['x', 'y']  @domain_lengths = [6.2832, 6.2832]
    @wavenumbers = 'k_i = 2π/L_i × numpy.fft.fftfreq(n_i, 1/n_i) ; dernier axe : numpy.fft.rfftfreq(n_i, 1/n_i)'
    vorticity: complex64(16, 150, 32, 17)        chunks=(1, 1, 32, 17) gzip(4)
      @tensor_order = 0  @physical_field = ''  @kmax = 10
      @sample_varying = True  @time_varying = True
      @description = 'ω = ∂x u_y − ∂y u_x = −Δψ ; u = (∂yψ, −∂xψ) ; état du solveur mhd2d.py'
    magnetic_potential: complex64(16, 150, 32, 17)
      ...
```

Pour une simulation 3D du palier 2 (grille 64³, 4 membres, 50 instantanés), la seule différence de structure est
`@n_spatial_dims = 3`, `@spatial_dims = ['x', 'y', 'z']`, un groupe `z_periodic/` et des champs
`velocity: float32(4, 50, 64, 64, 64, 3)` découpés en blocs `(1, 1, 64, 64, 64, 3)`.

## 3. Attributs racine

| Attribut | Type | Oblig. | Origine | Contenu |
|---|---|---|---|---|
| `dataset_name` | chaîne | oui | The Well | Nom de la collection (identique pour tous les fichiers d'un dossier lu par The Well) |
| `grid_type` | chaîne | oui | The Well | `cartesian`, `spherical` (The Well) ; `fourier_fe_axisym` (extension MilaDy, § 8) |
| `n_spatial_dims` | entier | oui | The Well | 1, 2 ou 3 ; = nombre de composantes des vecteurs |
| `n_trajectories` | entier | oui | The Well | Nombre de trajectoires B (premier axe des champs) |
| `simulation_parameters` | liste de chaînes | oui | The Well | Noms des paramètres **numériques** ; chacun est aussi un attribut racine (float64) et un scalaire de `scalars/` |
| `<paramètre>` | flottant | oui | The Well | Valeur du paramètre (ex. `@Rm = 12.0`) |
| `milady_format_version` | chaîne | oui | MilaDy | `"1.0"` |
| `milady_code` | chaîne | oui | MilaDy | `mhd3d_torch`, `mhd2d_numpy`, `induction3d_numpy`, `sfemans`, `latu`, `generated` (échantillons d'un modèle)… |
| `milady_code_version` | chaîne | non | MilaDy | Version du code (étiquette, version du paquet) |
| `milady_git_commit` | chaîne | non | MilaDy | Commit (7 à 40 car. hexadécimaux, suffixe `-dirty` si modifié) ; `MILADY_GIT_COMMIT` dans les images |
| `milady_parameters` | chaîne JSON | oui | MilaDy | **Tous** les paramètres, y compris non numériques : `{"Re": 100, "Rm": 12.0, "Pm": 0.12, "mu_r": 1.0, "forcing": "ABC"}` |
| `milady_nondimensionalization` | chaîne | non | MilaDy | Échelles de référence (longueur, vitesse, temps, unités d'Alfvén pour B) |
| `milady_created` | chaîne | oui | MilaDy | Date ISO 8601 UTC (`2026-11-07T08:03:03Z`) |
| `milady_host` | chaîne | non | MilaDy | Machine de calcul |
| `milady_command` | chaîne | non | MilaDy | Ligne de commande qui a produit le fichier |
| `milady_uuid` | chaîne UUID | oui | MilaDy | Identifiant de la simulation au catalogue (`simulation.id`) |
| `milady_<autre>` | chaîne / nombre / JSON | non | MilaDy | Métadonnées libres (`milady_split`, `milady_seed`, `milady_solver`…) ; les structures sont en JSON |

Les noms de paramètres sont des identifiants (`[A-Za-z_][A-Za-z0-9_]*`) distincts des attributs réservés de
The Well et sans préfixe `milady_`.

## 4. Groupes et jeux de données

### 4.1 `dimensions/`

`@spatial_dims` donne l'ordre des axes spatiaux des champs (`['x', 'y', 'z']`). `time` (float32, `(T,)`, attribut
`sample_varying`) et une coordonnée 1D par axe (float32, attributs `sample_varying` et `time_varying`, toujours
faux pour MilaDy). Coordonnées strictement croissantes ; temps commun à toutes les trajectoires. Sur un domaine
périodique `[0, L)`, les points sont `x_j = j L / n` (le point `L` n'est pas répété) : `L = n × Δx`.

### 4.2 `boundary_conditions/`

Un sous-groupe par condition, nommé `<dim>_<type>` (`x_periodic`, `z_wall`…), avec les attributs
`associated_dims`, `associated_fields`, `bc_type` ∈ {`periodic`, `wall`, `open`}, `sample_varying`,
`time_varying`, et les jeux `mask` (booléens, forme des dimensions associées, vrai là où la condition s'applique :
premier et dernier point pour une condition sur un axe) et `values` (float32, une valeur par point vrai du masque ;
sans objet et nul pour `periodic`). Par défaut `write_mff` écrit des conditions périodiques sur tous les axes
(cas de tous les domaines pseudo-spectraux du projet).

### 4.3 `scalars/`

`@field_names` liste tous les scalaires. Chaque paramètre numérique y figure (float32, forme `()`, constant).
Autres séries possibles : forme `()`, `(T,)` (`time_varying`), `(B,)` (`sample_varying`) ou `(B, T)`. E2 y range
les taux d'injection du forçage (`injection_rate_u`, `injection_rate_b`).

### 4.4 `t0_fields/`, `t1_fields/`, `t2_fields/`

Les trois groupes existent toujours (éventuellement vides), avec `@field_names` exhaustif. Formes :

| Groupe | Contenu | Forme (D = n_spatial_dims) |
|---|---|---|
| `t0_fields` | scalaires | `(B, T, n_1, …, n_D)` |
| `t1_fields` | vecteurs | `(B, T, n_1, …, n_D, D)` |
| `t2_fields` | tenseurs | `(B, T, n_1, …, n_D, D, D)` (+ `@symmetric`, `@antisymmetric`) |

Attributs de chaque champ : `dim_varying` (booléens, longueur D), `sample_varying`, `time_varying`. Un axe absent
(`dim_varying` faux, champ constant en temps ou commun aux trajectoires) est retiré de la forme, comme dans
The Well. En 2D, une composante hors plan (B_z d'une configuration 2,5D, potentiel `a` de A = a ẑ) est un champ
de `t0_fields`.

**Champs MilaDy standard** (noms imposés, groupe imposé, vérifiés par `validate`) :

| Nom | Groupe | Grandeur |
|---|---|---|
| `velocity` | `t1_fields` | vitesse **u** |
| `magnetic_field` | `t1_fields` | champ magnétique **B** en unités d'Alfvén (B/√(μ₀ρ), même unité que u) |
| `vector_potential` | `t1_fields` | potentiel vecteur **A**, B = ∇×A (jauge précisée dans `milady_nondimensionalization`) |
| `pressure` | `t0_fields` | pression (divisée par ρ) |

### 4.5 `milady_diagnostics/` (optionnel)

Séries temporelles légères, sur leur propre grille `time` (float64, souvent plus fine que celle des champs).
Chaque série : float64, forme `(T_d,)` ou `(B, T_d)`, attributs `sample_varying`, `time_varying`. Noms
recommandés (½⟨·⟩ = moyenne spatiale) :

| Nom | Définition |
|---|---|
| `kinetic_energy`, `magnetic_energy` | ½⟨\|u\|²⟩, ½⟨\|B\|²⟩ |
| `enstrophy`, `mean_square_current` | ⟨\|ω\|²⟩, ⟨\|j\|²⟩ |
| `dissipation_viscous`, `dissipation_ohmic`, `dissipation` | ν⟨\|ω\|²⟩, η⟨\|j\|²⟩, total (frottements compris) |
| `injection` | puissance injectée par le forçage |
| `kinetic_helicity`, `magnetic_helicity`, `cross_helicity` | ⟨u·ω⟩, ⟨A·B⟩, ⟨u·B⟩ |
| `max_div_b` | max \|∇·B\| (contrôle de la contrainte) |

Le catalogue en garde une copie (moyenne sur les trajectoires, table `diagnostic`) pour les requêtes rapides.

### 4.6 `milady_spectral/` (optionnel, domaines périodiques)

Coefficients `numpy.fft.rfftn` (normalisation `backward`) sur les axes spatiaux, dans la disposition des champs
physiques : forme `(B, T, n_1, …, n_D//2+1[, D…])`, complex64. Attributs du groupe : `transform`, `norm`, `axes`,
`real_shape`, `spatial_dims`, `domain_lengths`, `wavenumbers` (k_i = 2π/L_i × fftfreq, `rfftfreq` pour le
dernier axe). Attributs de chaque jeu : `tensor_order`, `physical_field` (nom du champ physique dont c'est la
transformée **complète** — `validate` vérifie alors `irfftn ≈ champ` sur un instantané — ou chaîne vide pour une
grandeur sans champ physique stocké, comme ω et a dans E2), `kmax` (troncature ou support spectral, −1 si
aucune), `description`. Intérêt : dérivées exactes, contraintes ∇·B = 0 et jauge de Coulomb k·Â = 0 vérifiables
mode par mode, représentation naturelle des modèles génératifs en base de Fourier.

## 5. Stockage physique

- **Types** : champs float32, coefficients spectraux complex64, diagnostics float64, coordonnées float32.
- **Blocs** : un pas de temps d'une trajectoire par bloc, `chunks = (1, 1, n_1, …, n_D, comp)` ; si un bloc
  dépasse 32 Mio (3D au-delà de ≈ 160³ × 3), l'axe x est coupé en deux jusqu'à passer sous ce seuil. La lecture
  d'un instantané ne décompresse que ses blocs, y compris depuis S3.
- **Compression** : `gzip` niveau 4 avec filtre `shuffle` (défaut, lisible partout) ou `lzf` (plus rapide) ou aucune.
- **Intégrité** : écriture dans un fichier temporaire du même dossier puis renommage atomique ; SHA-256 du fichier
  final renvoyé par `write_mff` et enregistré dans `file.sha256`.
- **Rangement** : `{MILADY_STORAGE_URI}/{campagne}/{uuid_simulation}/{kind}.h5` (`kind` = `fields`,
  `spectral`, `diagnostics`, `checkpoint`, `log`) ; `MILADY_STORAGE_URI` = `s3://milady-data` (MinIO, AWS,
  Scaleway, OVHcloud), `file:///…`, ou `$SCRATCH/milady` sur un cluster.
- **Taille indicative** : un fichier E2 d'entraînement (16 × 150 instantanés 32², u, B, spectres, diagnostics) fait
  50 Mio ; une trajectoire 3D 128³ de 100 instantanés (u, B) ≈ 5 Gio avant compression.

## 6. Variante Zarr (cloud)

Même hiérarchie en Zarr v3 (groupes, tableaux, attributs JSON identiques), même découpage en blocs, compression
Zarr par défaut (zstd). Elle sert à lire des morceaux de très gros fichiers depuis S3 sans téléchargement complet
ni bibliothèque HDF5 côté client. Conversion : `to_zarr("fields.h5", "s3://milady-data/c/<uuid>/fields.zarr")` ou
`python -m milady.data.convert zarr fields.h5 s3://…/fields.zarr`. `read_mff`, `validate` et `open_mff`
reconnaissent une URI qui finit par `.zarr`. Le fichier HDF5 reste la référence (somme SHA-256) ; la copie Zarr
est un dérivé reconstructible.

## 7. Interface Python et outils

```python
from milady.data import write_mff, read_mff, validate, open_mff, to_zarr

sha = write_mff("s3://milady-data/palier2/<uuid>/fields.h5",
                {"velocity": u, "magnetic_field": b},            # (B, T, nx, ny, nz, 3)
                {"time": t, "x": x, "y": y, "z": z},
                {"Rm": 12.0, "Re": 50.0, "forcing": "ABC"},
                meta={"code": "mhd3d_torch", "code_version": "0.1.0", "uuid": sim_id,
                      "nondimensionalization": "L = 2π, U = 1, B en unités d'Alfvén"},
                diagnostics={"time": t_fine, "magnetic_energy": eb},   # (B, T_d)
                spectral=True)                                   # rfftn de tous les champs
d = read_mff(uri, fields=["magnetic_field"], t=slice(-10, None), traj=0)
d["fields"]["magnetic_field"], d["coords"], d["params"], d["meta"], d["diagnostics"], d["scalars"]
assert validate(uri) == []
with open_mff(uri) as f:                                         # h5py.File (ou zarr.Group)
    b_last = f["t1_fields/magnetic_field"][0, -1]
```

Ligne de commande : `python -m milady.data.convert {e2, validate, info, zarr, sfemans}` ; catalogue :
`python -m milady.catalog ingest <uri>…` (enregistre des fichiers déjà écrits, par exemple après un tableau de jobs
Slurm dont les nœuds ne joignent pas la base).

**Validation** (`validate(path, well_only=False, full_scan=False)`) : attributs racine contre `schema.json`
(JSON Schema 2020-12, sous-schémas `$defs` pour chaque type de nœud), groupes obligatoires, `field_names`
exhaustifs, formes déduites de `sample_varying` / `time_varying` / `dim_varying`, float32, conditions aux limites
(masques, valeurs), paramètres présents à la racine, dans `scalars/` et égaux à `milady_parameters`, champs
standard dans leur groupe, diagnostics et spectres cohérents, valeurs finies sur le premier, le médian et le
dernier instantané de la première trajectoire. `full_scan=True` (en ligne de commande : `validate --full`)
vérifie les valeurs de toutes les trajectoires et de tous les instantanés, un bloc à la fois : à faire avant
de figer un jeu de données. `well_only=True` ne contrôle que la partie The Well (pour les fichiers de The Well
eux-mêmes).

## 8. Comparaison avec The Well

| Point | The Well (`docs/data_format.md`) | MFF 1.0 |
|---|---|---|
| Conteneur | HDF5, un fichier par jeu de paramètres, plusieurs trajectoires | identique ; variante Zarr en plus |
| Attributs racine | `dataset_name`, `grid_type`, `n_spatial_dims`, `n_trajectories`, `simulation_parameters` + un attribut par paramètre | identiques, plus les attributs `milady_*` |
| Paramètres non numériques | non prévus | dans `milady_parameters` (JSON) seulement |
| `dimensions/` | `spatial_dims`, `time`, coordonnées, `sample_varying` / `time_varying` | identique |
| `boundary_conditions/` | sous-groupes `associated_dims`, `associated_fields`, `bc_type`, `mask`, `values` | identique ; `bc_type` en minuscules (The Well les met en majuscules à la lecture) ; `values` nul pour `periodic` |
| `scalars/` | paramètres et séries, `float32(1)` | identique ; paramètres en float32 de forme `()` comme le générateur de données factices officiel (`the_well/utils/dummy_data.py`) |
| `t0/t1/t2_fields/` | `(B, T, W, H[, D][, D, D])` float32, `dim_varying`, `sample_varying`, `time_varying`, `symmetric`, `antisymmetric` | identique ; noms standard `velocity`, `magnetic_field`, `vector_potential`, `pressure` |
| Découpage, compression | non spécifiés | blocs d'un pas de temps, gzip 4 + shuffle |
| Diagnostics, spectres | absents | `milady_diagnostics/`, `milady_spectral/` |
| Provenance | absente | code, version, commit, commande, hôte, date, UUID du catalogue, SHA-256 au catalogue |
| Grilles | `cartesian`, `spherical` | idem, plus `fourier_fe_axisym` (non lisible par The Well) |

Conséquences pratiques : (1) un dossier de fichiers MFF cartésiens de même `dataset_name` et même résolution se
charge avec `WellDataset` de The Well (normalisation : calculer `stats.yaml` comme pour leurs jeux ; fichiers
rangés en `<base>/<dataset_name>/data/{train,valid,test}/*.hdf5` ou `*.h5`). Vérifié le 2026-11-07 en rejouant
sur un fichier MFF 3D tous les accès HDF5 de `the_well/data/datasets.py` (version 1.2.0 : passe de métadonnées,
`_reconstruct_fields`, `_reconstruct_scalars`, `_reconstruct_grids`, `_padding_bcs`) : champs relus à l'identique,
noms développés `velocity_x…z`, conditions aux limites `PERIODIC` sur les trois axes. Les trois groupes
`t0_fields`, `t1_fields`, `t2_fields` doivent exister même vides (le lecteur les parcourt tous) ; (2) `read_mff`
et `validate(..., well_only=True)` acceptent les fichiers de The Well (y compris `MHD_64` et `MHD_256`, utiles
comme données externes de MHD 3D) ; (3) The Well impose une résolution et un nom uniques par dossier : un jeu de
données MilaDy à résolutions multiples se range en un dossier par résolution.

## 9. Extension SFEMaNS : `grid_type = "fourier_fe_axisym"`

SFEMaNS (Guermond, Léorat, Nore, Ribeiro… ; simulations de dynamos de Von Kármán, VKS, précession) discrétise les
champs en **série de Fourier en azimut θ** et en **éléments finis de Lagrange sur le plan méridien (r, z)** :

    f(r, θ, z, t) = Σ_m [ f_m^c(r, z, t) cos(mθ) + f_m^s(r, z, t) sin(mθ) ],   m ∈ {m_0, …, m_{M−1}}.

Le format stocke ces coefficients **tels quels, sans interpolation** (une interpolation vers une grille cartésienne
dégraderait ∇·B = 0, les conditions de saut aux interfaces de perméabilité μ_r et la symétrie axiale).

```text
/
  @grid_type = 'fourier_fe_axisym'   @n_spatial_dims = 3   @n_trajectories = B
  @simulation_parameters, paramètres, milady_* : comme en § 3 (ex. Rm, Re, mu_r, sigma_r, Ro)
  dimensions/
    @spatial_dims = ['r', 'theta', 'z']
    time: float32(T,)                  @sample_varying = False
  boundary_conditions/                 vide : nœuds de bord dans les maillages
  scalars/                             paramètres (comme en § 4.3)
  t0_fields/ t1_fields/ t2_fields/     @field_names = [] (pas de grille tensorielle)
  milady_fourier_fe/
    @field_names = ['velocity', 'magnetic_field', 'pressure']
    @azimuthal_convention = 'f(r, θ, z) = Σ_m [ f_m^c cos(mθ) + f_m^s sin(mθ) ] ; indice 0 = cos, 1 = sin'
    @component_basis = 'cylindrical'   (composantes des vecteurs : r, θ, z)
    @n_modes = M
    modes: int32(M,)                   nombres d'onde azimutaux m (entiers ≥ 0, distincts)
    meshes/
      fluid/                           un sous-groupe par maillage (SFEMaNS : fluide, conducteur, vide…)
        @element_type = 'P2'           'P1' (3 nœuds) ou 'P2' (3 sommets puis 3 milieux d'arêtes)
        @n_nodes = N   @n_elements = E
        nodes: float64(N, 2)           coordonnées (r, z), r ≥ 0
        connectivity: int32(E, 6)      indices de nœuds, base 0, sens trigonométrique
        vertices: int32(N_v,)          (optionnel) indices des sommets, support des champs P1
        boundary_nodes: int32(N_b,)    (optionnel) nœuds du bord
        region: int32(E,)              (optionnel) numéro de sous-domaine (μ_r, σ par région)
      conductor/ ...
    fields/
      velocity: float32(B, T, M, 2, N_fluid, 3)       @mesh = 'fluid'  @node_set = 'all'  @tensor_order = 1
      magnetic_field: float32(B, T, M, 2, N_cond, 3)  @mesh = 'conductor'  @node_set = 'all'  @tensor_order = 1
      pressure: float32(B, T, M, 2, N_v)              @mesh = 'fluid'  @node_set = 'vertices'  @tensor_order = 0
        (axe 3 : 0 = cos, 1 = sin ; blocs (1, 1, 1, 2, N[, 3]) : un mode d'un instantané par bloc)
```

Règles : les champs vectoriels sont en composantes **cylindriques** ; les coefficients sin du mode m = 0 sont
nuls ; un champ porté par les sommets seulement (pression P1 d'une discrétisation P2/P1) déclare
`node_set = 'vertices'` et le maillage fournit `vertices` ; le potentiel scalaire du vide (formulation H–φ) est
un champ `t0`-like de son propre maillage. `validate` contrôle la cohérence des maillages (indices, nombre de
nœuds par élément, r ≥ 0), des modes et des formes.

**Outils** (`milady/data/convert.py`) :

- `write_fourier_fe_mff(path, meshes, modes, fields, time, params, meta=…)` écrit ce format à partir de tableaux ;
- `fourier_fe_to_grid(path, champ, r, θ, z)` évalue le champ sur une grille cylindrique régulière
  `(n_r, n_θ, n_z[, 3])` ; `fourier_fe_to_cartesian(path, champ, x, y, z)` sur une grille cartésienne, composantes
  cartésiennes (u_x = u_r cos θ − u_θ sin θ, u_y = u_r sin θ + u_θ cos θ), NaN hors du domaine. L'interpolation
  méridienne est linéaire par morceaux sur une triangulation de Delaunay des nœuds (exacte pour un champ affine
  en (r, z), approximation pour P2) ; la sommation de Fourier en θ est exacte. Pour l'apprentissage, on préférera
  souvent garder la représentation native (modes × nœuds), qui respecte la géométrie.
- Lecteur des fichiers natifs SFEMaNS : **non implémenté** (`read_sfemans_native` lève `NotImplementedError`) ;
  les données ne sont pas publiques. Quand elles seront accessibles, il devra produire les tableaux ci-dessus
  (un maillage par domaine, modes, coefficients cos/sin par nœud), sans interpolation.

## 10. Conversion des données E2

`python -m milady.data.convert e2 <dossier_npz> <sortie> [--catalog [URL]] [--store URI]` lit les
`eta_<η>_<split>.npz` de `experiences/e2_donnees.py` (coefficients `rfft2` de ω et a, disposition `[ky, kx]`,
16 membres × n instantanés regroupés par membre) et écrit un fichier MFF par fichier source :
u = (∂yψ, −∂xψ) avec ψ̂ = ω̂/k², B = (∂y a, −∂x a), transposés en disposition `[x, y]` ; temps
t_j = 30 + j (j = 1…n) ; paramètres ν, η, Pm, α, eps_u, eps_b, kf_min, kf_max ; taux d'injection dans `scalars/` ;
ω̂ et â (transformées de la disposition `[x, y]`) dans `milady_spectral/` ; diagnostics par instantané. Contrôle :
sur les fichiers réels, la dissipation moyenne vaut l'injection à 1 % près (bilan d'énergie en loi). Avec
`--catalog`, campagne `e2_mhd2d`, simulations, fichiers, diagnostics moyens et jeu de données `e2_mhd2d` v1.0
(train → train, ref → test) sont enregistrés ; la commande est idempotente.

## 11. Évolution du format

Version `milady_format_version = "1.0"`. Les versions 1.x n'ajoutent que des éléments optionnels (attributs
`milady_*`, groupes `milady_*`, noms de diagnostics) : un lecteur 1.0 lit tout fichier 1.x. Tout changement de
forme, de type ou de sens d'un élément existant passe à 2.0, avec un convertisseur dans `milady/data/convert.py`.
