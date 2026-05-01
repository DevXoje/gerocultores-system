#!/usr/bin/env bash
# =============================================================================
# strip-calibration.sh — Elimina notas de calibración y revisiones editoriales
# =============================================================================
#
# Elimina patrones de revisión editorial:
#   - "[CALIBRADO DESDE EJEMPLO 1]", "[CALIBRADO DESDE EJEMPLO 2]"
#   - "> **Nota para revisión**: ..."
#   - "> **Nota para ampliar a versión final**: ..."
#   - "> **Notas para la versión final**: ..."
#   - Bloques de comentario "> **Notas para..." multilínea
#   - "⚠️ Antipatrón a evitar" y sus párrafos asociados
#   - Líneas con "> *Descripción*:" en bloques de cabecera
#
# USO:
#   ./strip-calibration.sh [input.md [output.md]]
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

TMP=$(mktemp /tmp/strip-calibration-XXXXXX.md)

# Paso 1: Eliminar líneas [CALIBRADO DESDE...]
sed -E '/\[CALIBRADO DESDE /d' \
  "${INPUT_FILE}" > "${TMP}"

# Paso 2: Eliminar "> **Nota para revisión**:" y siguientes líneas hasta encontrar línea vacía
#   Usa perl por la multilínea (sed no maneja patrones que cruzan líneas fácilmente)
perl -0777 -pe 's/> \*\*Nota para revisión\*\*[:：].*?(?=\n[^>]|\z)//gs' \
  "${TMP}" > "${TMP}.1" && mv "${TMP}.1" "${TMP}"

# Paso 3: Eliminar "> **Notas para la versión final**:" multilínea
perl -0777 -pe 's/> \*\*Notas para (la )?versión final\*\*[:：].*?(?=\n[^>]|\z)//gs' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

# Paso 4: Eliminar líneas "> **Notas para ampliar..."
sed -E '/^> \*\*Notas para ampliar/d' \
  "${TMP}" > "${TMP}.3" && mv "${TMP}.3" "${TMP}"

# Paso 5: Eliminar líneas "> *Descripción*:"
sed -E '/^> \*\*\*Descripción\*\*\*:/d' \
  "${TMP}" > "${TMP}.4" && mv "${TMP}.4" "${TMP}"

# Paso 6: Eliminar líneas sueltas "> *Longitud"
sed -E '/^> \*\*Longitud mínima/d' \
  "${TMP}" > "${TMP}.5" && mv "${TMP}.5" "${TMP}"

sed -E '/^> \*\*Longitud recomendada/d' \
  "${TMP}" > "${TMP}.6" && mv "${TMP}.6" "${TMP}"

# Paso 7: Eliminar líneas de fuente "> *Fuentes"
sed -E '/^> \*Fuentes?\*:/d' \
  "${TMP}" > "${TMP}.7" && mv "${TMP}.7" "${TMP}"

# Paso 8: Eliminar líneas "> *Longitud orientativa"
sed -E '/^> \*Longitud orientativa/d' \
  "${TMP}" > "${TMP}.8" && mv "${TMP}.8" "${TMP}"

# Paso 9: Eliminar "> ⚠️ **Antipatrón..." hasta la siguiente línea que no empiece con ">"
perl -0777 -pe 's/> ⚠️ \*\*Antipatrón.*?(?=\n[^>]|\z)//gs' \
  "${TMP}" > "${TMP}.9" && mv "${TMP}.9" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
info "Patrones de calibración removidos: $((INPUT_SIZE - CLEAN_SIZE)) bytes"

if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
