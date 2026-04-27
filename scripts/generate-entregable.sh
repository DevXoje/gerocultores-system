#!/usr/bin/env bash
# =============================================================================
# generate-entregable.sh — Genera versión limpia de la memoria académica
# =============================================================================
#
# Limpia memoria-combined.md de comentarios de автор (HTML, reference-style,
# bloques ENTREGABLE) y produce memoria-entregable.md lista para entregar.
#
# PATRONES DE COMENTARIOS ELIMINADOS:
#   1. HTML-style comments:       <!-- ... -->
#   2. Reference-style comments:   [//]: # (comment)
#   3. ENTREGABLE block markers:   <!-- ENTREGABLE:START --> ... <!-- ENTREGABLE:END -->
#   4. Líneas en blanco tras limpiar comentarios
#
# USO:
#   ./scripts/generate-entregable.sh [input.md [output.md]]
#   ./scripts/generate-entregable.sh                  # usa默认值
#   ./scripts/generate-entregable.sh custom.md        # input personalizado
#   ./scripts/generate-entregable.sh in.md out.md     # ambos personalizados
#
# OUTPUTS:
#   OUTPUTS/academic/dist/memoria-entregable.md
#
# =============================================================================

set -euo pipefail

# --------------- Paths -------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACADEMIC_DIST="${REPO_ROOT}/OUTPUTS/academic/dist"
DEFAULT_INPUT="${ACADEMIC_DIST}/memoria-combined.md"
DEFAULT_OUTPUT="${ACADEMIC_DIST}/memoria-entregable.md"

INPUT_FILE="${1:-${DEFAULT_INPUT}}"
OUTPUT_FILE="${2:-${DEFAULT_OUTPUT}}"

# --------------- Helpers -----------------------------------------------------
info()  { echo "  ✓  $*"; }
warn()  { echo "  ⚠  $*" >&2; }
error() { echo "  ✗  $*" >&2; }

section() {
  echo ""
  echo "──────────────────────────────────────────"
  echo "  $*"
  echo "──────────────────────────────────────────"
}

# --------------- Validate input ---------------------------------------------
section "🔍 Validando archivos"

if [[ ! -f "${INPUT_FILE}" ]]; then
  error "Archivo de entrada no encontrado: ${INPUT_FILE}"
  exit 1
fi

INPUT_SIZE=$(wc -c < "${INPUT_FILE}")
INPUT_LINES=$(wc -l < "${INPUT_FILE}")
info "Entrada:  ${INPUT_FILE}"
info "  Tamaño: ${INPUT_SIZE} bytes | ${INPUT_LINES} líneas"

# --------------- Clean comments ----------------------------------------------
section "🧹 Limpiando comentarios"

TMP_CLEAN=$(mktemp /tmp/memoria-clean-XXXXXX.md)

# Paso 1: Eliminar bloques ENTREGABLE (deben ir primero, son multilínea)
# Esto elimina la línea ENTREGABLE:START, todo lo que hay hasta ENTREGABLE:END, y la línea ENTREGABLE:END
sed -E '/<!-- ?ENTREGABLE:START ?-->/,/<!-- ?ENTREGABLE:END ?-->/d' "${INPUT_FILE}" > "${TMP_CLEAN}"

# Paso 2: Eliminar comentarios HTML <!-- ... -->
#   - Usa -E para ERE
#   - \ ? antes y después de -- para permitir espacios opcionales
#   - .* matching any char incl newlines (con ; como separador de dirección)
sed -E 's/<!--.*-->//g' "${TMP_CLEAN}" > "${TMP_CLEAN}.html" && mv "${TMP_CLEAN}.html" "${TMP_CLEAN}"

# Paso 3: Eliminar reference-style comments [//]: # (comment) en líneas propias
#   - Solo elimina líneas donde ESTE patrón es lo ÚNICO que tiene la línea
#   -BSD sed no soporta \s ni \b — se usan clases de caracteres POSIX
sed -E '/^[[:space:]]*\[[-]\{2\}\]:[[:space:]]#.*$/d' "${TMP_CLEAN}" > "${TMP_CLEAN}.ref" && mv "${TMP_CLEAN}.ref" "${TMP_CLEAN}"

# Paso 4: Normalizar saltos de línea (múltiples líneas en blanco → una sola)
#   - Primero elimina espacios/tillas finales de cada línea
#   - Luego colapsa 2+ líneas en blanco en una sola
sed -E '/^[[:space:]]*$/d' "${TMP_CLEAN}" > "${TMP_CLEAN}.blank" && mv "${TMP_CLEAN}.blank" "${TMP_CLEAN}"

# También eliminar líneas que solo tienen espacios:
sed -E 's/^[[:space:]]*$//g' "${TMP_CLEAN}" > "${TMP_CLEAN}.ws" && mv "${TMP_CLEAN}.ws" "${TMP_CLEAN}"

# Consolidar líneas en blanco múltiples
perl -0777 -pe 's/\n{3,}/\n\n/g' "${TMP_CLEAN}" > "${TMP_CLEAN}.nl" && mv "${TMP_CLEAN}.nl" "${TMP_CLEAN}"

CLEAN_SIZE=$(wc -c < "${TMP_CLEAN}")
CLEAN_LINES=$(wc -l < "${TMP_CLEAN}")
info "Limpia:   ${CLEAN_SIZE} bytes | ${CLEAN_LINES} líneas"

# --------------- Compare ------------------------------------------------------
section "⚖️  Comparando"

if [[ "${CLEAN_SIZE}" -eq 0 ]]; then
  warn "El archivo limpio está vacío — posible problema en el regex o archivo de entrada."
  warn "Revisa ${INPUT_FILE} manualmente."
  rm -f "${TMP_CLEAN}"
  exit 1
fi

SIZE_DIFF=$((INPUT_SIZE - CLEAN_SIZE))
SIZE_PCT=$((100 - (CLEAN_SIZE * 100 / INPUT_SIZE)))
info "Diferencia: -${SIZE_DIFF} bytes (~${SIZE_PCT}% removido)"

if [[ "${CLEAN_SIZE}" -eq "${INPUT_SIZE}" ]]; then
  warn "El archivo limpio es idéntico al de entrada — no había comentarios que limpiar."
  warn "¿Estás seguro de que el archivo de entrada contiene comentarios?"
elif [[ "${SIZE_PCT}" -gt 30 ]]; then
  warn "Se removió más del 30% del archivo — verifica que no se eliminó contenido válido."
fi

# --------------- Write output -------------------------------------------------
cp "${TMP_CLEAN}" "${OUTPUT_FILE}"
rm -f "${TMP_CLEAN}"

OUTPUT_SIZE=$(wc -c < "${OUTPUT_FILE}")
info "Salida:   ${OUTPUT_FILE}"
info "  Tamaño: ${OUTPUT_SIZE} bytes"

# --------------- Summary ------------------------------------------------------
section "✅ Script completado"
echo ""
echo "  Archivo de entrada:  ${INPUT_FILE}"
echo "  Archivo de salida:   ${OUTPUT_FILE}"
echo "  Bytes removidos:     ${SIZE_DIFF} (~${SIZE_PCT}%)"
echo ""
echo "  Patrones eliminados:"
echo "    1. Bloques <!-- ENTREGABLE:START/END -->"
echo "    2. Comentarios HTML <!-- ... -->"
echo "    3. Comentarios [//]: # (reference-style)"
echo "    4. Líneas en blanco redundantes"
echo ""
