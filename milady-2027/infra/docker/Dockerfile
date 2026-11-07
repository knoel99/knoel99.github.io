# syntax=docker/dockerfile:1.7
# Image CPU du projet MilaDy (portable, VM sans GPU, intégration continue).
#
# Construction (depuis la racine du dépôt) :
#   docker build -f infra/docker/Dockerfile -t milady:cpu .
#   ou : make image
#
# Options :
#   --build-arg MILADY_UID=$(id -u) --build-arg MILADY_GID=$(id -g)
#       aligne l'utilisateur du conteneur sur l'utilisateur de l'hôte (fichiers écrits
#       dans le dépôt monté en volume) ;
#   --build-arg WITH_JUPYTER=1      ajoute JupyterLab (service « jupyter » du compose) ;
#   --build-arg GIT_COMMIT=$(git rev-parse --short=12 HEAD)
#       grave le commit dans l'image (provenance des fichiers MFF, pas de .git dans l'image) ;
#   --secret id=cacert,src=/chemin/ca.pem
#       certificat d'un proxy TLS d'entreprise/HPC pour pip (facultatif).

FROM python:3.12.15-slim-trixie

ARG MILADY_UID=1000
ARG MILADY_GID=1000
ARG WITH_JUPYTER=0
ARG GIT_COMMIT=""

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    MILADY_ROOT=/opt/milady \
    MILADY_GIT_COMMIT=${GIT_COMMIT} \
    MPLBACKEND=Agg

# Outils système minimaux : git (provenance), make (cibles du Makefile), curl (contrôles),
# client PostgreSQL (psql/pg_dump pour l'administration du catalogue depuis le worker).
RUN apt-get update \
 && apt-get install -y --no-install-recommends git make curl ca-certificates postgresql-client tini \
 && rm -rf /var/lib/apt/lists/*

# Utilisateur non root.
RUN groupadd --gid "${MILADY_GID}" milady \
 && useradd --uid "${MILADY_UID}" --gid "${MILADY_GID}" --create-home --shell /bin/bash milady

WORKDIR /opt/milady

# 1) Dépendances épinglées d'abord (couche mise en cache tant que le verrou ne change pas).
COPY infra/env/requirements.txt /tmp/requirements.txt
RUN --mount=type=secret,id=cacert,required=false \
    if [ -f /run/secrets/cacert ]; then export PIP_CERT=/run/secrets/cacert; fi \
 && pip install -r /tmp/requirements.txt \
 && if [ "${WITH_JUPYTER}" = "1" ]; then pip install "jupyterlab==4.6.4"; fi

# 2) Code du projet, installé en mode éditable : un dépôt monté sur /opt/milady
#    (docker-compose) remplace le code sans reconstruire l'image.
COPY --chown=milady:milady . /opt/milady
RUN --mount=type=secret,id=cacert,required=false \
    if [ -f /run/secrets/cacert ]; then export PIP_CERT=/run/secrets/cacert; fi \
 && pip install --no-deps -e . \
 && mkdir -p /opt/milady/data \
 && chown -R milady:milady /opt/milady \
 && python -c "import milady, numpy, h5py, torch; print('milady', milady.__version__, 'torch', torch.__version__)"

USER milady

# tini : transmet les signaux (arrêt propre des simulations) et récolte les zombies.
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["python", "-c", "import milady; print('Image MilaDy prête (CPU). Exemple : make smoke')"]
