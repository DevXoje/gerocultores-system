#!/usr/bin/env bash
# Levanta los emuladores de Firebase via Docker (sin necesidad de Java/Firebase CLI local).
# Uso: ./start_emulators.sh [--build] [--down]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "${1:-}" in
  --down)
    docker compose -f "$SCRIPT_DIR/docker-compose.emulators.yml" down
    ;;
  --build)
    docker compose -f "$SCRIPT_DIR/docker-compose.emulators.yml" up --build -d
    ;;
  *)
    docker compose -f "$SCRIPT_DIR/docker-compose.emulators.yml" up -d
    ;;
esac

echo ""
echo "  Firebase Emulators:"
echo "  - Auth:      http://localhost:9099"
echo "  - Firestore: http://localhost:8080"
echo "  - UI:        http://localhost:4000"
