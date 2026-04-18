#!/usr/bin/env bash
# entrypoint.sh — arranca Firebase Emulator y garantiza el export al parar.
#
# Estrategia de export:
#   Usamos el Emulator Hub REST API (puerto 4400, endpoint /_admin/export) para
#   triggear el export desde el propio proceso del emulador.
#
# Por qué SNAPSHOT_DIR en vez de DATA_DIR directamente:
#   HubExport.exportAll() hace rmSync(exportPath, {recursive:true}) antes de
#   mover el tmpDir al exportPath. Esto requiere permisos de escritura en el
#   *directorio padre* de exportPath. El bind-mount root (/emulator_data) es
#   propiedad del host (uid 501) y su padre es / (root). Para evitar EACCES,
#   exportamos a un subdirectorio (/emulator_data/snapshot) cuyo padre es el
#   bind-mount, sobre el que el usuario firebase (uid 1001) sí tiene escritura.
#
# Al importar, pasamos el mismo SNAPSHOT_DIR.

set -euo pipefail

DATA_DIR="/emulator_data"
SNAPSHOT_DIR="${DATA_DIR}/snapshot"
HUB_PORT=4400

# Asegura que el directorio snapshot existe (en el primer arranque no existe)
mkdir -p "$SNAPSHOT_DIR"

echo "[entrypoint] Starting Firebase Emulators..."

# Importa desde SNAPSHOT_DIR si existe el metadata; si no, arranca limpio.
if [ -f "${SNAPSHOT_DIR}/firebase-export-metadata.json" ]; then
  IMPORT_FLAG="--import=${SNAPSHOT_DIR}"
  echo "[entrypoint] Found existing snapshot — importing from ${SNAPSHOT_DIR}"
else
  IMPORT_FLAG=""
  echo "[entrypoint] No snapshot found — starting with empty state"
fi

firebase emulators:start \
  --only firestore,auth \
  --project gerocultores-system \
  ${IMPORT_FLAG} &

FIREBASE_PID=$!

# Función de shutdown: exporta via Hub API y termina limpiamente
shutdown() {
  echo "[entrypoint] Received shutdown signal — exporting emulator data via Hub API..."

  RESULT=$(curl -s -o /tmp/export_result.txt -w "%{http_code}" \
    -X POST "http://localhost:${HUB_PORT}/_admin/export" \
    -H "Content-Type: application/json" \
    -d "{\"path\":\"${SNAPSHOT_DIR}\",\"initiatedBy\":\"entrypoint\"}")

  if [ "$RESULT" = "200" ] || [ "$RESULT" = "201" ]; then
    echo "[entrypoint] Export succeeded (HTTP $RESULT) → ${SNAPSHOT_DIR}"
  else
    echo "[entrypoint] Export response HTTP $RESULT: $(cat /tmp/export_result.txt 2>/dev/null)"
  fi

  echo "[entrypoint] Stopping emulators..."
  kill "$FIREBASE_PID" 2>/dev/null || true
  wait "$FIREBASE_PID" 2>/dev/null || true
  echo "[entrypoint] Done."
  exit 0
}

trap shutdown SIGTERM SIGINT

# Espera a que el proceso de Firebase termine (o reciba señal)
wait "$FIREBASE_PID"
