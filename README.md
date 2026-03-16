# Visualiseur du marché de l'emploi US & France

Outil de recherche pour explorer visuellement les données professionnelles et l'exposition à l'IA, couvrant les marchés du travail **américain** (Bureau of Labor Statistics) et **français** (France Travail / ROME).

**Démo US : [karpathy.ai/jobs](https://karpathy.ai/jobs/)**

---

## Contenu

### Pipeline US (342 métiers)

Le BLS OOH couvre **342 métiers** couvrant l'ensemble de l'économie américaine, avec des données détaillées sur les tâches, l'environnement de travail, le niveau d'études, la rémunération et les projections d'emploi. Tout est scrapé et présenté dans un treemap interactif où la **surface** de chaque rectangle est proportionnelle au nombre d'emplois et la **couleur** affiche la métrique sélectionnée — basculez entre les projections BLS (outlook), le salaire médian, le niveau d'études et l'exposition IA.

### Pipeline français (1 584 métiers ROME)

Un pipeline parallèle analyse les **métiers français** du [répertoire ROME 4.0](https://francetravail.io/) de France Travail. Il utilise l'API France Travail (OAuth2) pour récupérer les données structurées de chaque métier : fiches métier, compétences, salaires, demandeurs d'emploi, offres et tensions de recrutement. Chaque métier est ensuite scoré pour l'exposition IA selon la même méthodologie, adaptée au contexte français.

---

## Architecture des données : de l'API à la visualisation

Cette section décrit le flux complet de chaque donnée — d'où elle vient, comment elle est transformée, et comment elle apparaît dans la visualisation finale.

### Étape 1 — Récupération des données brutes (`scrape_fr.py`)

Le script s'authentifie via OAuth2 auprès de l'API France Travail (`entreprise.francetravail.fr/connexion/oauth2/access_token`), obtient un token valide ~25 minutes, et effectue **6 appels API séquentiels** pour chacun des 1 584 métiers ROME. Le tout est sauvegardé dans un fichier JSON par métier (`html_fr/{slug}.json`).

| # | Endpoint API | Rate limit | Clé JSON sauvegardée | Contenu |
|---|---|---|---|---|
| 1 | `rome/v2/metiers/metier/{code}` | 1 req/s | `fiche` | Définition du métier, conditions d'accès à l'emploi (`accesEmploi`), liste des appellations |
| 2 | `rome/v2/competences/metier/{code}` | 1 req/s | `competences` | Savoirs, savoir-faire, savoir-être professionnels |
| 3 | `infotravail/v1/marche/salaires?codeRome={code}` | 10 req/s | `salaires` | Salaires par FAP (famille professionnelle) : SAL1 (débutant), SAL3 (expérimenté), médiane brute |
| 4 | `infotravail/v1/marche/demandeurs?codeRome={code}` | 10 req/s | `demandeurs` | Nombre de demandeurs d'emploi par catégorie (A, B, C, ABC, ABCDE…) |
| 5 | `infotravail/v1/marche/offres?codeRome={code}` | 10 req/s | `offres` | Nombre d'offres d'emploi par période |
| 6 | `infotravail/v1/marche/tensions?codeRome={code}` | 10 req/s | `tensions` | Indicateurs de tension : PERSPECTIVE (rang 1-5), intensité d'embauche, manque de main-d'oeuvre |

**Gestion des erreurs :** retry avec backoff exponentiel (2s, 4s, 8s) sur erreurs réseau, rafraîchissement automatique du token sur 401, attente du header `Retry-After` sur 429.

### Étape 2 — Conversion en Markdown (`process_fr.py`)

Chaque JSON brut est transformé en fichier Markdown lisible (`pages_fr/{slug}.md`) contenant : titre, code ROME, domaine, définition, conditions d'accès, compétences, et contextes de travail. Ces fichiers Markdown servent d'entrée au LLM pour le scoring (étape 4).

### Étape 3 — Extraction des statistiques (`make_csv_fr.py`)

Lit chaque `html_fr/{slug}.json` et extrait des champs structurés dans `occupations_fr.csv`. Voici la logique d'extraction précise pour chaque champ :

| Champ CSV | Chemin JSON source | Logique d'extraction |
|---|---|---|
| `salaire_median_annuel` | `salaires` → entrées FAP → `SAL3` ou `SAL1` | Moyenne des valeurs SAL3 (salaire expérimenté) de toutes les FAP rattachées au code ROME. Fallback sur SAL1 (débutant). Multiplié par 12 pour obtenir l'annuel. Arrondi à l'entier. |
| `salaire_median_horaire` | Dérivé de l'annuel | `salaire_annuel / 1607` (durée légale annuelle française). Format : 2 décimales. |
| `nombre_demandeurs` | `demandeurs` → entrées par catégorie | Recherche de l'entrée avec catégorie `ABC` (chiffre officiel DEFM = demandeurs d'emploi en fin de mois catégories A+B+C). Fallback : catégorie `A` seule. |
| `nombre_offres` | `offres` → entrées par période | Somme des `nbOffres` / `valeur` sur toutes les périodes retournées. |
| `tension_pct` | `tensions` → entrée `PERSPECTIVE` | Recherche de l'entrée dont le code contient `PERSPECTIVE` → valeur numérique (rang 1 à 5). Fallback : entrée `INT_EMB` (intensité d'embauche). |
| `tension_desc` | Dérivé de `tension_pct` | Mapping : 1→« Très défavorable », 2→« Défavorable », 3→« Neutre », 4→« Favorable », 5→« Très favorable » |
| `niveau_education` | `fiche.accesEmploi` | Parsing regex du texte d'accès au métier. Le niveau le plus élevé mentionné l'emporte : `bac+8\|doctorat` → `bac+5\|master\|ingénieur` → `bac+3\|licence` → `bac+2\|bts\|dut` → `bac` → `cap\|bep` → `sans diplôme`. |
| `description` | `fiche.definition` | Texte de définition du métier, tronqué à 200 caractères. |

### Étape 4 — Scoring IA par LLM (`score_fr.py`)

Chaque métier est envoyé à un LLM (Gemini Flash par défaut, via OpenRouter) avec un prompt système de ~900 mots en français qui définit l'échelle de scoring :

**Entrée LLM :** Le Markdown de `pages_fr/{slug}.md` (priorité), ou à défaut le JSON brut tronqué à 8 000 caractères, préfixé du titre et du code ROME.

**Sortie LLM :** Un objet JSON `{"exposure": <0-10>, "rationale": "<2-3 phrases>"}` sauvegardé dans `scores_fr.json`.

**Échelle de scoring :**

| Score | Niveau | Signal clé | Exemples |
|-------|--------|------------|----------|
| 0-1 | Minimale | Travail physique en environnement imprévisible | Couvreur, maçon, éboueur |
| 2-3 | Faible | Principalement physique/relationnel, IA sur tâches périphériques | Électricien, plombier, pompier |
| 4-5 | Modérée | Mix physique + intellectuel | Infirmier, policier, vétérinaire |
| 6-7 | Élevée | Principalement intellectuel, IA déjà utile | Enseignant, comptable, journaliste |
| 8-9 | Très élevée | Quasi-entièrement sur ordinateur | Développeur, graphiste, traducteur |
| 10 | Maximale | Traitement routinier d'information, entièrement numérique | Opérateur de saisie, télévendeur |

**Heuristique clé du prompt :** Si le travail peut être entièrement réalisé depuis un bureau sur un ordinateur — écrire, coder, analyser, communiquer — alors l'exposition est intrinsèquement élevée (7+).

**Note importante :** Le prompt évalue l'exposition *technique*, pas la vitesse d'adoption. Le droit du travail français (CDI, conventions collectives, CSE) ralentit l'impact organisationnel sans changer l'exposition technique.

Le scoring est asynchrone avec concurrence configurable (défaut : 5 requêtes parallèles), checkpoint toutes les 10 réponses, et retry avec backoff sur erreurs 429/502/503.

### Étape 5 — Fusion des données (`build_site_data_fr.py`)

Fusionne trois sources dans `site_fr/data.json` :

```
occupations_fr.json  ──→  métadonnées (titre, code_rome, domaine, sous-domaine, catégorie, URL)
occupations_fr.csv   ──→  stats marché (salaire, demandeurs, offres, tension, éducation, description)
scores_fr.json       ──→  scoring IA (exposure 0-10, rationale)
```

**Schéma final de `site_fr/data.json`** (un objet par métier) :

| Champ | Type | Origine | Utilisation dans la vue |
|-------|------|---------|------------------------|
| `title` | string | occupations_fr.json | Libellé dans le rectangle et le tooltip |
| `slug` | string | occupations_fr.json | Clé de jointure entre les 3 sources |
| `code_rome` | string | occupations_fr.json | Affiché dans le tooltip (ex : « Code ROME : M1805 ») |
| `domain_code` | string | occupations_fr.json | Regroupement niveau 1 du treemap (14 domaines A-N) |
| `domain_name` | string | occupations_fr.json | Libellé du domaine dans le breadcrumb et le tooltip |
| `subdomain_code` | string | occupations_fr.json | Regroupement niveau 2 (ex : M18, K11) |
| `subdomain_name` | string | occupations_fr.json | Libellé du sous-domaine |
| `category` | string | occupations_fr.json | Slug de catégorie |
| `pay` | int \| null | CSV `salaire_median_annuel` | **Couche couleur « Salaire médian »** + statistiques barre latérale |
| `demandeurs` | int \| null | CSV `nombre_demandeurs` | **Surface des rectangles** (proportionnelle) + total dans la barre latérale |
| `offres` | int \| null | CSV `nombre_offres` | Affiché dans le tooltip |
| `tension` | int \| null | CSV `tension_pct` | **Couche couleur « Tension marché »** + axe Y du scatter |
| `tension_desc` | string | CSV `tension_desc` | Libellé dans le tooltip (ex : « Favorable ») |
| `education` | string | CSV `niveau_education` | **Couche couleur « Études »** + statistiques barre latérale |
| `exposure` | float \| null | scores_fr.json | **Couche couleur « Exposition IA »** + axe X du scatter + toutes les stats sidebar |
| `exposure_rationale` | string | scores_fr.json | Texte explicatif dans le tooltip |
| `description` | string | CSV `description` | Non affiché actuellement (réservé pour usage futur) |
| `url` | string | occupations_fr.json | Lien cliquable → fiche France Travail |

### Étape 6 — Visualisation (`site_fr/index.html`)

Le site charge `data.json` et propose deux vues interactives avec quatre couches couleur.

#### Vue Treemap

**Surface des rectangles :** Chaque rectangle a une surface proportionnelle au champ `demandeurs` (nombre de demandeurs d'emploi catégories ABC). Les métiers sans donnée de demandeurs reçoivent une valeur de 1. L'algorithme utilisé est le **squarified treemap** (Bruls, Huizing & van Wijk) qui optimise le ratio d'aspect de chaque rectangle pour maximiser la lisibilité.

**Hiérarchie et drill-down à 3 niveaux :**

| Niveau | Contenu affiché | Clé de regroupement | Données agrégées |
|--------|-----------------|---------------------|------------------|
| 0 | 14 domaines ROME (A-N) | `domain_code` | Somme des demandeurs, moyenne pondérée de la métrique active, nombre de métiers |
| 1 | Sous-domaines d'un domaine | `subdomain_code` | Idem, filtré au domaine sélectionné |
| 2 | Métiers individuels | — | Données brutes du métier |

Navigation : clic pour descendre, fil d'Ariane ou touche Échap pour remonter.

**Les 4 couches couleur (sélecteur « Couche ») :**

Chaque mode colorie les rectangles selon une métrique différente. Aux niveaux agrégés (domaines, sous-domaines), la couleur reflète la **moyenne pondérée par les demandeurs** de tous les métiers du groupe.

| Couche | Champ source | Plage de valeurs | Échelle de couleur | Interprétation |
|--------|-------------|------------------|--------------------|--------------------|
| **Tension marché** | `tension` | 1-5 (entier) | Rouge (1 = très défavorable) → Vert (5 = très favorable) | Perspectives d'emploi selon France Travail. Équivalent FR du BLS Outlook. Un score de 5 signifie que les employeurs peinent à recruter (favorable au candidat). |
| **Salaire médian** | `pay` | 20 000 € – 120 000 € | Échelle logarithmique. Vert (bas salaire) → Rouge (haut salaire) | Le salaire brut annuel moyen issu des données de marché. L'échelle log évite que les très hauts salaires n'écrasent les différences entre métiers courants. |
| **Niveau d'études** | `education` | 8 niveaux ordonnés | Vert (Sans diplôme) → Rouge (Doctorat) | Le niveau le plus élevé mentionné dans le texte « accès au métier » de la fiche ROME. Niveaux : Sans diplôme, CAP/BEP, Bac, Bac (Baccalauréat), Bac+2 (BTS/DUT), Bac+3 (Licence), Bac+5 (Master/Ingénieur), Bac+8 (Doctorat). |
| **Exposition IA** | `exposure` | 0-10 (entier) | Dégradé propre : vert foncé (0) → jaune (5) → orange → rouge vif (10) | Score LLM mesurant l'exposition technique à l'IA. Utilise un dégradé dédié (différent du vert-rouge des autres couches) pour refléter l'échelle spécifique 0-10. |

**Fonction de contraste :** Les couches Tension, Salaire et Études utilisent une fonction `boostContrast` (courbe de puissance exposant 0.55) qui amplifie les différences autour du point médian pour améliorer la lisibilité visuelle. La couche Exposition utilise son propre dégradé bilinéaire.

#### Vue Scatter (« Exposition vs Tension »)

Un diagramme en colonnes où :
- **Axe X** = score d'exposition IA (une colonne par score 0, 1, 2… 10)
- **Largeur de colonne** = proportionnelle au total des demandeurs ayant ce score
- **Au sein de chaque colonne**, les métiers sont empilés verticalement, triés par tension décroissante, avec une hauteur proportionnelle à leurs demandeurs
- **Couleur** = la couche active (pas forcément la tension — si vous sélectionnez « Salaire », les rectangles du scatter seront colorés par salaire)

#### Barre latérale (statistiques contextuelles)

Toutes les statistiques se recalculent dynamiquement en fonction du niveau de drill-down (global, domaine, ou sous-domaine).

| Bloc | Calcul | Formule |
|------|--------|---------|
| **Demandeurs d'emploi** | Total des demandeurs dans le périmètre | `Σ d.demandeurs` |
| **Exposition moyenne pondérée** | Moyenne pondérée par les demandeurs | `Σ(exposure × demandeurs) / Σ(demandeurs)`, échelle 0-10 |
| **Histogramme exposition** | Distribution des demandeurs par score 0-10 | 11 barres verticales, hauteur = `count / max(counts)`, couleur = score d'exposition |
| **Répartition par paliers** | 5 paliers d'exposition | Minimale (0-1), Faible (2-3), Modérée (4-5), Élevée (6-7), Très élevée (8-10). Pour chaque palier : nombre de demandeurs + % du total |
| **Exposition par salaire** | Exposition moyenne par tranche salariale | 5 tranches : <25K€, 25-35K€, 35-50K€, 50-75K€, 75K€+. Pour chaque : `Σ(exposure × demandeurs) / Σ(demandeurs)` des métiers dans la tranche |
| **Exposition par études** | Exposition moyenne par niveau d'études | 5 groupes : CAP/BEP, Bac, Bac+2, Bac+3, Bac+5/8. Même calcul pondéré |
| **Masse salariale exposée** | Masse salariale totale des métiers très exposés | `Σ(demandeurs × pay)` pour les métiers où `exposure ≥ 7`. Affiché en Md€ (milliards) ou T€ (milliers de milliards) |

#### Tooltip (info-bulle au survol)

Au survol d'un rectangle, le tooltip affiche :

- **Agrégat (domaine/sous-domaine) :** code, nombre de métiers, exposition moyenne, total demandeurs et offres, invite « Cliquer pour explorer les métiers »
- **Métier individuel :** code ROME, barre de progression de l'exposition, salaire médian formaté en €, demandeurs, offres, tension (score/5 + libellé), formation requise, texte de justification LLM, clic → ouvre la fiche France Travail

---

## Correspondance des couches US / France

| Couche | Source US (BLS) | Source FR (France Travail) | Différence clé |
|--------|-----------------|---------------------------|----------------|
| **Perspectives** | Outlook (% croissance projetée 2024-2034) | Tension PERSPECTIVE (rang 1-5) | US = projection à 10 ans en %. FR = indicateur qualitatif instantané |
| **Salaire** | Median pay annuel/horaire ($) | Brut annuel moyen (€), moyenne des FAP | US = médiane BLS exacte. FR = moyenne sur FAP multiples |
| **Études** | Entry-level education (8 niveaux BLS) | Parsing texte « accès au métier » (7 niveaux) | US = champ structuré BLS. FR = extraction par regex depuis texte libre |
| **Volume d'emploi** | Employment 2024 (nombre de postes) | DEFM catégories ABC (demandeurs d'emploi) | US = emplois existants. FR = demandeurs, pas emplois occupés |
| **Exposition IA** | Gemini Flash via OpenRouter | Idem, prompt adapté au contexte français | Même méthodologie, mêmes ancres de calibration |

---

## Coloriage par LLM

Le dépôt inclut des scrapers, parsers et un pipeline pour écrire des prompts LLM personnalisés qui scorent et colorient les métiers selon n'importe quel critère. Vous écrivez un prompt, le LLM score chaque métier, et le treemap se colorie en conséquence. La couche « Exposition IA » en est un exemple — elle estime dans quelle mesure l'IA actuelle va transformer chaque métier. Vous pourriez écrire un prompt différent pour toute autre question — exposition à la robotique humanoïde, risque de délocalisation, impact climatique — et relancer le pipeline pour obtenir un autre coloriage.

**Ce que « l'exposition IA » n'est PAS :**
- **Pas une prédiction de disparition.** Un développeur à 9/10 ne signifie pas que le métier disparaît : la demande peut *augmenter* avec les gains de productivité.
- **Pas un indice de vitesse d'adoption.** Le droit du travail français (CDI, conventions collectives, CSE) ralentit l'adoption mais ne change pas l'exposition technique.
- **Pas ajusté pour les protections sociales.** Les scores US et FR utilisent les mêmes ancres de calibration.
- Les scores sont des **estimations approximatives** par LLM (Gemini Flash via OpenRouter), pas des prédictions rigoureuses.

---

## Fichiers principaux

### US

| Fichier | Description |
|---------|-------------|
| `occupations.json` | Liste maîtresse des 342 métiers avec titre, URL, catégorie, slug |
| `occupations.csv` | Stats résumées : salaire, éducation, nombre d'emplois, projections de croissance |
| `scores.json` | Scores d'exposition IA (0-10) avec justifications pour les 342 métiers |
| `prompt.md` | Toutes les données dans un seul fichier, conçu pour être collé dans un LLM |
| `html/` | Pages HTML brutes du BLS (source de vérité, ~40 Mo) |
| `pages/` | Versions Markdown propres de chaque page de métier |
| `site/` | Site web statique (treemap) |

### France

| Fichier | Description |
|---------|-------------|
| `occupations_fr.json` | Liste des 1 584 métiers ROME avec titre, code ROME, domaine/sous-domaine, slug, URL |
| `html_fr/` | Un JSON brut par métier (6 endpoints API fusionnés). Source de vérité |
| `pages_fr/` | Descriptions Markdown de chaque métier (entrée du LLM) |
| `occupations_fr.csv` | Statistiques extraites : salaire, éducation, demandeurs, offres, tension |
| `scores_fr.json` | Scores d'exposition IA (0-10) avec justifications |
| `site_fr/data.json` | Fusion finale de toutes les sources (chargé par le site) |
| `site_fr/index.html` | Site web statique : treemap + scatter, 4 couches couleur, drill-down 3 niveaux |
| `prompt_fr.md` | Toutes les données dans un seul fichier pour analyse LLM |

---

## Prompt LLM

[`prompt.md`](prompt.md) (US) et [`prompt_fr.md`](prompt_fr.md) (France) regroupent toutes les données dans des fichiers uniques conçus pour être collés dans un LLM. Cela permet d'avoir une conversation fondée sur les données concernant l'impact de l'IA sur le marché du travail sans avoir besoin d'exécuter de code.

---

## Installation

```
uv sync
uv run playwright install chromium
```

Variables requises dans `.env` :
```
# Pipeline US (OpenRouter pour le scoring LLM)
OPENROUTER_API_KEY=votre_clé_ici

# Pipeline français (API France Travail)
FRANCE_TRAVAIL_CLIENT_ID=votre_client_id
FRANCE_TRAVAIL_CLIENT_SECRET=votre_client_secret
```

Inscrivez-vous sur [francetravail.io](https://francetravail.io/) pour obtenir les credentials de l'API France Travail.

## Utilisation

### Pipeline US

```bash
uv run python scrape.py           # Scraper les pages BLS
uv run python process.py          # Générer le Markdown depuis le HTML
uv run python make_csv.py         # Générer le CSV résumé
uv run python score.py            # Scorer l'exposition IA
uv run python build_site_data.py  # Construire les données du site
cd site && python -m http.server 8000
```

### Pipeline français

```bash
uv run python scrape_fr.py           # Scraper l'API France Travail (6 endpoints × 1584 métiers)
uv run python process_fr.py          # Générer le Markdown depuis les JSON
uv run python make_csv_fr.py         # Extraire les stats dans le CSV
uv run python score_fr.py            # Scorer l'exposition IA (async, ~5 req parallèles)
uv run python build_site_data_fr.py  # Fusionner CSV + scores + hiérarchie ROME
uv run python make_prompt_fr.py      # Générer le prompt LLM complet
cd site_fr && python -m http.server 8001
```
