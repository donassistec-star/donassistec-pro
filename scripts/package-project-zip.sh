#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/backups"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
PACKAGE_MODE="clean"
INCLUDE_ENV="false"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/package-project-zip.sh [--full] [--include-env]

Opcoes:
  --full         Inclui node_modules, dist e outros artefatos locais.
  --include-env  Inclui arquivos .env no pacote.
  -h, --help     Mostra esta ajuda.

Padrao:
  Gera um zip "limpo" para migracao, excluindo arquivos temporarios,
  dependencias instaladas, logs, backups antigos e a pasta .git.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full)
      PACKAGE_MODE="full"
      shift
      ;;
    --include-env)
      INCLUDE_ENV="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Opcao invalida: $1" >&2
      echo >&2
      usage >&2
      exit 1
      ;;
  esac
done

mkdir -p "${OUTPUT_DIR}"

PACKAGE_NAME="donassistec-project-${PACKAGE_MODE}-${STAMP}"
TEMP_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"
ZIP_PATH="${OUTPUT_DIR}/${PACKAGE_NAME}.zip"

cleanup() {
  rm -rf "${TEMP_DIR}"
}

trap cleanup EXIT

mkdir -p "${TEMP_DIR}"

RSYNC_ARGS=(
  -rlptD
  --no-owner
  --no-group
  --exclude ".git"
  --exclude ".codex"
  --exclude ".idea"
  --exclude ".vscode"
  --exclude "phpmyadmin/sessions"
  --exclude "logs"
  --exclude "backups"
  --exclude "deploy"
  --exclude "*.log"
  --exclude ".DS_Store"
)

if [[ "${PACKAGE_MODE}" != "full" ]]; then
  RSYNC_ARGS+=(
    --exclude "node_modules"
    --exclude "backend/node_modules"
    --exclude "dist"
    --exclude "dist-ssr"
    --exclude "backend/dist"
    --exclude "build"
    --exclude ".pm2"
    --exclude "coverage"
    --exclude "public/DonAssistec.apk"
    --exclude "backend/uploads/*"
  )
fi

if [[ "${INCLUDE_ENV}" != "true" ]]; then
  RSYNC_ARGS+=(
    --exclude ".env"
    --exclude ".env.local"
    --exclude ".env.database"
    --exclude ".env.*.local"
    --exclude "backend/.env"
  )
fi

rsync "${RSYNC_ARGS[@]}" "${ROOT_DIR}/" "${TEMP_DIR}/"

if [[ "${PACKAGE_MODE}" != "full" ]]; then
  mkdir -p "${TEMP_DIR}/backend/uploads"
  if [[ -f "${ROOT_DIR}/backend/uploads/.gitkeep" ]]; then
    cp "${ROOT_DIR}/backend/uploads/.gitkeep" "${TEMP_DIR}/backend/uploads/.gitkeep"
  fi
fi

(
  cd "${OUTPUT_DIR}"
  zip -rq "${ZIP_PATH}" "${PACKAGE_NAME}"
)

FILE_SIZE="$(du -sh "${ZIP_PATH}" | awk '{print $1}')"

echo "Pacote criado com sucesso:"
echo "${ZIP_PATH}"
echo "Tamanho: ${FILE_SIZE}"
echo "Modo: ${PACKAGE_MODE}"
echo "Arquivos .env incluidos: ${INCLUDE_ENV}"
