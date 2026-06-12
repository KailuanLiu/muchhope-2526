#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

echo "Building frontend..."
cd "$ROOT_DIR/apps/frontend"
npm run build

echo "Starting production servers..."
cd "$ROOT_DIR"
npm run start
