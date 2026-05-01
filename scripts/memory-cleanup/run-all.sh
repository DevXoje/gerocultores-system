#!/usr/bin/env bash
# =============================================================================
# run-all.sh — Pipeline completo de cleanup de memoria académica
# =============================================================================
#
# Ejecuta todos los scripts de cleanup en secuencia para producir la versión
# limpia de la memoria académica.
#
# ORDEN DE PASADAS:
#   1. strip-agent-metadata.sh   — metadatos de agente
#   2. strip-calibration.sh      — notas de calibración y revisión editorial
#   3. strip-section-markers.sh  — marcadores de sección y estado
#   4. strip-todo-blocks.sh      — bloques TODO y warnings
#   5. normalize-pending.sh      — normaliza marcadores [Pendiente] legítimos
#   6. cleanup-blank-lines.sh    — normalización final de whitespace
#
# INPUT:
#   OUTPUTS/academic/dist/memoria-combined.md (por defecto)
#
# OUTPUT:
#   OUTPUTS/academic/dist/memoria-entregable.md (por defecto)
#
# OPciones:
#   --input <file>    Archivo de entrada (default: memoria-combined.md)
#   --output <file>  Archivo de salida (default: memoria-entregable.md)
#   --dry-run         Muestra qué haría sin ejecutar
#   --keep-temp       No borra archivos temporales intermedios
#   --version         Añade sufijo de fecha y hora a los archivos generados
#                     (formato: YYYYMMDD-HHMMSS)
#
# EJEMPLO:
#   ./run-all.sh                           # genera memoria-entregable.md
#   ./run-all.sh --input mi-borrador.md     # input personalizado
#   ./run-all.sh --output mi-entregable.md  # output personalizado
#   ./run-all.sh --dry-run                  # ver qué haría
#   ./run-all.sh --version                  # genera con sufijo fecha (para versionado)
#
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ACADEMIC_DIST="${REPO_ROOT}/OUTPUTS/academic/dist"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DEFAULT_INPUT="${ACADEMIC_DIST}/memoria-combined.md"
DEFAULT_OUTPUT="${ACADEMIC_DIST}/memoria-entregable.md"

INPUT_FILE="${DEFAULT_INPUT}"
OUTPUT_FILE="${DEFAULT_OUTPUT}"
DRY_RUN=false
KEEP_TEMP=false
VERSION_SUFFIX=""

# --------------- Parse args -------------------------------------------------
for arg in "$@"; do
  case "${arg}" in
    --input)
      INPUT_FILE="${2:-${DEFAULT_INPUT}}"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="${2:-${DEFAULT_OUTPUT}}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --keep-temp)
      KEEP_TEMP=true
      shift
      ;;
    --version)
      VERSION_SUFFIX="$(date '+%Y%m%d-%H%M%S')"
      shift
      ;;
    --help|-h)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed '/^!/d'
      exit 0
      ;;
    *)
      echo "[ERROR] Opción desconocida: ${arg}" >&2
      echo "        Usa --help para ver las opciones." >&2
      exit 1
      ;;
  esac
done

# --------------- Helpers -----------------------------------------------------
info()    { echo "  ✓  $*"; }
warn()    { echo "  ⚠  $*" >&2; }
error()   { echo "  ✗  $*" >&2; }
section() {
  echo ""
  echo "──────────────────────────────────────────"
  echo "  $*"
  echo "──────────────────────────────────────────"
}

# --------------- Validate ---------------------------------------------------
section "🔍 Validando entorno"

if [[ ! -f "${INPUT_FILE}" ]]; then
  error "Archivo de entrada no encontrado: ${INPUT_FILE}"
  exit 1
fi

INPUT_SIZE=$(wc -c < "${INPUT_FILE}")
info "Entrada:  ${INPUT_FILE} (${INPUT_SIZE} bytes)"

# Verify all scripts exist
SCRIPTS=(
  "strip-agent-metadata.sh"
  "strip-calibration.sh"
  "strip-section-markers.sh"
  "strip-todo-blocks.sh"
  "normalize-pending.sh"
  "cleanup-blank-lines.sh"
)

for script in "${SCRIPTS[@]}"; do
  if [[ ! -x "${SCRIPT_DIR}/${script}" ]]; then
    error "Script no encontrado o no ejecutable: ${SCRIPT_DIR}/${script}"
    error "Aplica: chmod +x ${SCRIPT_DIR}/*.sh"
    exit 1
  fi
done
info "Todos los scripts presentes y ejecutables"

# Ensure output dir
mkdir -p "$(dirname "${OUTPUT_FILE}")"

# --------------- Dry run -----------------------------------------------------
if [[ "${DRY_RUN}" == true ]]; then
  echo ""
  section "🔍 DRY RUN — Pipeline de cleanup"
  echo "  Scripts que se ejecutarían (en orden):"
  for script in "${SCRIPTS[@]}"; do
    echo "    → ${script}"
  done
  echo ""
  echo "  Archivo de entrada:  ${INPUT_FILE}"
  echo "  Archivo de salida:   ${OUTPUT_FILE}"
  echo "  Directorio temporal: /tmp/memoria-cleanup-XXXXXX"
  exit 0
fi

# --------------- Pipeline ---------------------------------------------------
section "🧹 Pipeline de cleanup — ejecutando"

TMPDIR=$(mktemp -d /tmp/memoria-cleanup-XXXXXX)
info "Directorio temporal: ${TMPDIR}"

# Pipe: input → script1 → script2 → ... → output
CURRENT="${INPUT_FILE}"
STEP=1

echo ""
echo "  Ejecución paso a paso:"
echo ""

for script in "${SCRIPTS[@]}"; do
  NEXT="${TMPDIR}/step-${STEP}.md"
  echo "  ${STEP}. ${script}"
  
  if "${SCRIPT_DIR}/${script}" "${CURRENT}" "${NEXT}"; then
    CURRENT="${NEXT}"
    STEP=$((STEP + 1))
  else
    warn "Script falló: ${script}"
    warn "Limpiando directorio temporal..."
    rm -rf "${TMPDIR}"
    exit 1
  fi
done

section "📄 Resultado"

# Añadir sufijo de versión si se pidió (YYYYMMDD-HHMMSS)
if [[ -n "${VERSION_SUFFIX}" ]]; then
  # Extraer dirname, basename y extensión del OUTPUT_FILE
  OUTPUT_DIR="$(dirname "${OUTPUT_FILE}")"
  OUTPUT_BASENAME="$(basename "${OUTPUT_FILE}" .md)"
  OUTPUT_FILE="${OUTPUT_DIR}/${OUTPUT_BASENAME}-${VERSION_SUFFIX}.md"
  info "Versión con sufijo: $(basename "${OUTPUT_FILE}")"
fi

# Copy final result to output
cp "${CURRENT}" "${OUTPUT_FILE}"
OUTPUT_SIZE=$(wc -c < "${OUTPUT_FILE}")
OUTPUT_LINES=$(wc -l < "${OUTPUT_FILE}")
info "Salida:   ${OUTPUT_FILE}"
info "  Tamaño: ${OUTPUT_SIZE} bytes | ${OUTPUT_LINES} líneas"
info "  Reducción: $((INPUT_SIZE - OUTPUT_SIZE)) bytes"
info "  Pasadas: ${#SCRIPTS[@]}"

# Cleanup temp dir
if [[ "${KEEP_TEMP}" == false ]]; then
  rm -rf "${TMPDIR}"
  info "Directorio temporal eliminado"
else
  info "Directorio temporal conservado: ${TMPDIR}"
fi

section "✅ Pipeline completado"
echo ""
echo "  Para revisar el resultado:"
echo "    cat ${OUTPUT_FILE}"
echo ""
