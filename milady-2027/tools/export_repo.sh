#!/usr/bin/env bash
# Exporte le dossier milady-2027/ du dépôt knoel99.github.io vers le dépôt dédié knoel99/milady-2027,
# en conservant l'historique des commits qui touchent ce dossier (git subtree split).
#
# Usage (depuis la racine du dépôt knoel99.github.io) :
#   milady-2027/tools/export_repo.sh [URL_DU_DEPOT] [BRANCHE_SOURCE]
#   URL par défaut : https://github.com/knoel99/milady-2027.git ; branche source : la branche courante.
# Ensuite, sur GitHub : Settings → Pages → Build and deployment → Deploy from a branch → main / (root).
set -euo pipefail

URL="${1:-https://github.com/knoel99/milady-2027.git}"
SRC="${2:-$(git rev-parse --abbrev-ref HEAD)}"
TMP_BRANCH="milady-2027-export"

cd "$(git rev-parse --show-toplevel)"
if [ ! -d milady-2027 ]; then
  echo "Dossier milady-2027/ introuvable à la racine du dépôt." >&2
  exit 1
fi

echo "Découpage de l'historique de milady-2027/ depuis la branche ${SRC}…"
git branch -D "${TMP_BRANCH}" >/dev/null 2>&1 || true
git subtree split --prefix=milady-2027 "${SRC}" -b "${TMP_BRANCH}"

echo "Envoi vers ${URL} (branche main)…"
git push "${URL}" "${TMP_BRANCH}:main"
git branch -D "${TMP_BRANCH}" >/dev/null

echo "Terminé. Activez GitHub Pages : Settings → Pages → Deploy from a branch → main / (root)."
echo "Le site sera publié à https://knoel99.github.io/milady-2027/ (quelques minutes après l'activation)."
