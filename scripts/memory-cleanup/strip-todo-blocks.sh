#!/usr/bin/env bash
# =============================================================================
# strip-todo-blocks.sh — Elimina bloques de TODO y warnings editoriales
# =============================================================================
#
# Elimina patrones de TODO y warning:
#   - "> [TODO", "> [⚠️", "> [❌", "> [🔲"
#   - Bloques multilínea de warning que empiezan con estos marcadores
#   - Líneas sueltas "> [INCONSISTENCIA]" o similar
#   - Bloques "> *...*:" con contenido de alerta
#
# PRESERVA:
#   - "> [Pendiente: ...]" LEGÍTIMOS (no son TODO, son estado real)
#   - "> **Pendiente del autor**:" — esto es contenido real, preserva
#
# USO:
#   ./strip-todo-blocks.sh [input.md [output.md]]
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
info "Entrada: ${INPUT_FILE} (${INPUT_SIZE} bytes)"

TMP=$(mktemp /tmp/strip-todo-XXXXXX.md)

# Paso 1: Eliminar líneas "> [TODO" (empieza con corchete y TODO)
sed -E '/^> \[TODO/d' \
  "${INPUT_FILE}" > "${TMP}"

# Paso 2: Eliminar líneas "> [⚠️" (warning Unicode o ASCII)
sed -E '/^> \[⚠️/d' \
  "${TMP}" > "${TMP}.1" && mv "${TMP}.1" "${TMP}"

sed -E '/^> \[WARNING/d' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

# Paso 3: Eliminar líneas "> [❌" (error)
sed -E '/^> \[❌/d' \
  "${TMP}" > "${TMP}.3" && mv "${TMP}.3" "${TMP}"

# Paso 4: Eliminar líneas "> [🔲" (bloqueado)
sed -E '/^> \[🔲/d' \
  "${TMP}" > "${TMP}.4" && mv "${TMP}.4" "${TMP}"

# Paso 5: Eliminar líneas "> [✅" (completado — no debería haber en entregable)
sed -E '/^> \[✅/d' \
  "${TMP}" > "${TMP}.5" && mv "${TMP}.5" "${TMP}"

# Paso 6: Eliminar "> [INCONSISTENCIA]" líneas
sed -E '/^> \[INCONSISTENCIA/d' \
  "${TMP}" > "${TMP}.6" && mv "${TMP}.6" "${TMP}"

# Paso 7: Eliminar bloques multilínea "> **⚠️" o "> **WARNING"
perl -0777 -pe 's/> \*\*⚠️\*\*.*?(?=\n[^>]|\z)//gs' \
  "${TMP}" > "${TMP}.7" && mv "${TMP}.7" "${TMP}"

# Paso 8: Eliminar líneas "> **Critic" o similares multilínea
perl -0777 -pe 's/> \*\*Critic.*?(?=\n[^>]|\z)//gs' \
  "${TMP}" > "${TMP}.8" && mv "${TMP}.8" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
info "Bloques TODO/warnings removidos: $((INPUT_SIZE - CLEAN_SIZE)) bytes"

if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
