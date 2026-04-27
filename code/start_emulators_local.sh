#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# start_emulators_local.sh
# Levanta Firebase Emulator Suite usando Firebase CLI local (sin Docker).
#
# Uso:
#   ./start_emulators_local.sh       — arranca emuladores en segundo plano
#   ./start_emulators_local.sh --down  — para los emuladores
#   ./start_emulators_local.sh --logs  — muestra los logs en tiempo real
#
# Requiere: Firebase CLI >= 11 + Java (para Firestore emulator)
# Instalar Firebase CLI: npm install -g firebase-tools
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR" && pwd)"

# ── Colores para la salida ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[info]${NC}  $*"; }
log_warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
log_error() { echo -e "${RED}[error]${NC} $*"; }

# ── Funciones ────────────────────────────────────────────────────────────────

start_emulators() {
  log_info "Arrancando Firebase Emulator Suite (local)..."

  # Verificar que Firebase CLI está instalado
  if ! command -v firebase &> /dev/null; then
    log_error "Firebase CLI no encontrado. Instálalo con: npm install -g firebase-tools"
    exit 1
  fi

  # Verificar Java (requerido para Firestore emulator)
  if ! command -v java &> /dev/null; then
    log_warn "Java no encontrado. El emulador de Firestore podría no funcionar."
  fi

  # Detener cualquier emulador previo en estos puertos
  log_info "Limpiando puertos 4000 (hub), 9099 (auth), 8080 (firestore)..."
  lsof -ti :4000 -ti :9099 -ti :8080 2>/dev/null | xargs kill -9 2>/dev/null || true

  log_info "Iniciando emuladores desde $PROJECT_DIR ..."

  # ── Importar datos si existe emulator_data ───────────────────────────────────
  if [ -d "$PROJECT_DIR/emulator_data" ] && [ -f "$PROJECT_DIR/emulator_data/firebase-export-metadata.json" ]; then
    log_info "Importando datos desde emulator_data/ ..."
    IMPORT_FLAG="--import=$PROJECT_DIR/emulator_data"
  else
    log_info "emulator_data/ no encontrado o sin datos — se ejecutarán seeds después"
    IMPORT_FLAG=""
  fi

  # ── Iniciar emuladores ───────────────────────────────────────────────────────
  nohup firebase emulators:start \
    --project=gero-care \
    --only=auth,firestore \
    $IMPORT_FLAG \
    --export-on-exit="$PROJECT_DIR/emulator_data" \
    > "$PROJECT_DIR/.emulators.log" 2>&1 &

  EMULATOR_PID=$!
  echo "$EMULATOR_PID" > "$PROJECT_DIR/.emulators.pid"

  log_info "Emulator hub PID: $EMULATOR_PID"
  log_info ""

  # ── Esperar a que los emuladores estén listos ───────────────────────────────
  log_info "Esperando a que los emuladores estén listos..."
  for i in {1..30}; do
    if curl -s http://127.0.0.1:9099 > /dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  # ── Ejecutar seeds si no hay datos importados ────────────────────────────────
  if [ ! -d "$PROJECT_DIR/emulator_data" ]; then
    log_info "Ejecutando seeds de datos..."

    # Residente seed data
    cat << 'SEED_SCRIPT' > "$PROJECT_DIR/.seed_run.sh"
#!/usr/bin/env bash
set -e
SEED_DELAY=5
for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:8080 > /dev/null 2>&1; then
    break
  fi
  sleep 1
done
cd "$(dirname "$0")/code/api"
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_PROJECT_ID=gero-care
npx tsx seeds/seed-tareas.ts 2>/dev/null || true
SEED_SCRIPT

    chmod +x "$PROJECT_DIR/.seed_run.sh"
    nohup "$PROJECT_DIR/.seed_run.sh" > "$PROJECT_DIR/.seed.log" 2>&1 &
  fi

  log_info "  Firebase Emulators (local):"
  log_info "  - Emulator UI:   http://localhost:4000/emulators"
  log_info "  - Auth:          http://localhost:9099"
  log_info "  - Firestore:     http://localhost:8080"
  log_info ""
  log_info "  Para detener: ./start_emulators_local.sh --down"
  log_info ""
  log_info "Los emuladores están corriendo en background (pid $EMULATOR_PID)."
  log_info "Este script no bloquea — puedes abrir otra terminal para el frontend."
}

stop_emulators() {
  log_info "Deteniendo Firebase Emulators..."

  # Matar por PID si existe el archivo
  if [ -f "$PROJECT_DIR/.emulators.pid" ]; then
    local pid=$(cat "$PROJECT_DIR/.emulators.pid")
    kill "$pid" 2>/dev/null && log_info "Proceso $pid matado." || log_warn "Proceso $pid no encontrado."
    rm -f "$PROJECT_DIR/.emulators.pid"
  fi

  # Matar cualquier proceso firebase emulators:start
  pkill -f "firebase emulators:start" 2>/dev/null && log_info "Procesos firebase emulators detenidos." || log_warn "No había procesos de emuladores corriendo."

  # Limpiar puertos
  lsof -ti :4000 -ti :9099 -ti :8080 2>/dev/null | xargs kill -9 2>/dev/null || true

  log_info "Emuladores detenidos."
}

# ── Main ─────────────────────────────────────────────────────────────────────

show_logs() {
  if [ -f "$PROJECT_DIR/.emulators.log" ]; then
    tail -f "$PROJECT_DIR/.emulators.log"
  else
    log_warn "No se encontró el log. ¿Los emuladores están corriendo?"
  fi
}

case "${1:-}" in
  --down)
    stop_emulators
    ;;
  --logs)
    show_logs
    ;;
  *)
    start_emulators
    ;;
esac