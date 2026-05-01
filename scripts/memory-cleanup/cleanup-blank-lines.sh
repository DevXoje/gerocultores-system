#!/usr/bin/env bash
# =============================================================================
# cleanup-blank-lines.sh — Normalización final de líneas en blanco y whitespace
# =============================================================================
#
# Normaliza whitespace final para que el documento quede limpio para entrega.
# Se ejecuta SIEMPRE como ÚLTIMO paso del pipeline de cleanup.
#
# ACCIONES:
#   1. Elimina espacios en blanco al final de cada línea
#   2. Elimina líneas que solo contienen espacios en blanco
#   3. Colapsa 3+ líneas en blanco en exactamente 2 (separación de párrafos)
#   4. Asegura que el archivo termine con una línea en blanco
#
# USO:
#   ./cleanup-blank-lines.sh [input.md [output.md]]
#   Debe ejecutarse AL FINAL del pipeline, después de todos los strip scripts.
#
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACADEMIC_DIST="${REPO_ROOT}/OUTPUTS/academic/dist"
DEFAULT_INPUT="${ACADEMIC_DIST}/memoria-combined.md"
DEFAULT_OUTPUT="${ACADEMIC_DIST}/memoria-entregable.md"

INPUT_FILE="${1:-${DEFAULT_INPUT}}"
OUTPUT_FILE="${2:--}"

info()  { echo "  ✓  $*"; }
warn()  { echo "  ⚠  $*" >&2; }
error() { echo "  ✗  $*" >&2; }

if [[ ! -f "${INPUT_FILE}" ]]; then
  error "Archivo no encontrado: ${INPUT_FILE}"
  exit 1
fi

INPUT_SIZE=$(wc -c < "${INPUT_FILE}")
INPUT_LINES=$(wc -l < "${INPUT_FILE}")
info "Entrada: ${INPUT_FILE} (${INPUT_SIZE} bytes, ${INPUT_LINES} líneas)"

TMP=$(mktemp /tmp/cleanup-blank-XXXXXX.md)

# Paso 1: Eliminar espacios en blanco al final de cada línea
sed -E 's/[[:space:]]+$//' \
  "${INPUT_FILE}" > "${TMP}"

# Paso 2: NO eliminar líneas en blanco — solo eliminar espacios en blanco residuales
#   Las líneas en blanco son separación de párrafos y deben mantenerse
#   Se colapsan en el paso siguiente si hay 3+ consecutivas

# Paso 3: Colapsar 3+ líneas en blanco en exactamente 2 (máximo 1 línea vacía entre párrafos)
perl -0777 -pe 's/\n{3,}/\n\n/g' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

# Paso 4: Asegurar que el archivo termine con exactamente una línea en blanco
awk '{print}' "${TMP}" > "${TMP}.3"
printf '\n' >> "${TMP}.3"
mv "${TMP}.3" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
CLEAN_LINES=$(wc -l < "${TMP}")
info "Normalizado: ${CLEAN_SIZE} bytes, ${CLEAN_LINES} líneas"

if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
