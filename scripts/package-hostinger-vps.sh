#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
PACKAGE_NAME="hostinger-vps-full-${STAMP}"
PACKAGE_DIR="${ROOT_DIR}/deploy/${PACKAGE_NAME}"
ZIP_PATH="${PACKAGE_DIR}.zip"

mkdir -p "${PACKAGE_DIR}"

rsync -rlptD \
  --no-owner \
  --no-group \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "dist/.vite" \
  --exclude "deploy" \
  --exclude "logs" \
  --exclude ".env" \
  --exclude ".env.local" \
  --exclude "backend/.env" \
  --exclude "backend/node_modules" \
  --exclude "backend/database" \
  --exclude "backend/donassistec-backend@1.0.0" \
  --exclude "backend/tsx" \
  --exclude ".codex" \
  --exclude ".vscode" \
  --exclude ".idea" \
  --exclude "*.log" \
  "${ROOT_DIR}/" "${PACKAGE_DIR}/"

cp "${ROOT_DIR}/README_HOSTINGER_VPS.md" "${PACKAGE_DIR}/README-HOSTINGER-VPS.md"

(
  cd "${ROOT_DIR}/deploy"
  zip -r "${ZIP_PATH}" "${PACKAGE_NAME}" >/dev/null
)

echo "${ZIP_PATH}"
