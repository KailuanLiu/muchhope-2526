#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

echo "Installing root dependencies..."
cd "$ROOT_DIR"
npm install

echo "Installing backend dependencies..."
cd "$ROOT_DIR/apps/backend"
npm install

echo "Installing frontend dependencies..."
cd "$ROOT_DIR/apps/frontend"
npm install

# Copy example env files if real ones don't exist
echo "Creating .env files from examples if needed..."
if [ -f "$ROOT_DIR/apps/backend/.env.example" ] && [ ! -f "$ROOT_DIR/apps/backend/.env" ]; then
  cp "$ROOT_DIR/apps/backend/.env.example" "$ROOT_DIR/apps/backend/.env"
  echo "Created apps/backend/.env from .env.example"
fi

if [ -f "$ROOT_DIR/apps/frontend/.env.example" ] && [ ! -f "$ROOT_DIR/apps/frontend/.env.local" ]; then
  cp "$ROOT_DIR/apps/frontend/.env.example" "$ROOT_DIR/apps/frontend/.env.local"
  echo "Created apps/frontend/.env.local from .env.example"
fi

echo "Setup complete. Run './scripts/dev.sh' to start development servers."
