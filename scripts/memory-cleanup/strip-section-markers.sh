#!/usr/bin/env bash
# =============================================================================
# strip-section-markers.sh — Elimina marcadores de sección y estado editorial
# =============================================================================
#
# Elimina patrones de marcado editorial de sección:
#   - "> **Borrador** — ..."
#   - "> **Sección de la memoria...**"
#   - Cabeceras de bloque > que solo tienen metadatos de sección
#   - Líneas sueltas "> ---" (separadores de bloque)
#   - "> *Estado*: ..." en cualquier forma
#
# USO:
#   ./strip-section-markers.sh [input.md [output.md]]
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

TMP=$(mktemp /tmp/strip-section-XXXXXX.md)

# Paso 1: Eliminar líneas "> **Borrador**" y "> **Sección..."
sed -E '/^> \*\*Borrador\*\* /d' \
  "${INPUT_FILE}" > "${TMP}"

sed -E '/^> \*\*Sección/d' \
  "${TMP}" > "${TMP}.1" && mv "${TMP}.1" "${TMP}"

# Paso 2: Eliminar líneas de estado "> *Estado*:" en cualquier formato
sed -E '/^> \*Estado\*:/d' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

sed -E '/^> \*Estado\*\*/d' \
  "${TMP}" > "${TMP}.3" && mv "${TMP}.3" "${TMP}"

# Paso 3: Eliminar separadores sueltos "> ---" que solo son decoración de bloque
sed -E '/^> ---$/d' \
  "${TMP}" > "${TMP}.4" && mv "${TMP}.4" "${TMP}"

# Paso 4: Eliminar "> *..." líneas de metadato genéricas en bloque de cabecera
#   Solo elimina líneas que empiezan con "> *" y tienen menos de 80 chars
#   (son líneas de descripción/estado, no contenido real)
awk '
  /^> \*.*$/ {
    line = substr($0, 3)
    if (length(line) < 80) next
  }
  { print }
' "${TMP}" > "${TMP}.5" && mv "${TMP}.5" "${TMP}"

# Paso 5: Eliminar líneas "> **Autor**" sueltas (si no se eliminaron antes)
sed -E '/^> \*\*Autor\*\*/d' \
  "${TMP}" > "${TMP}.6" && mv "${TMP}.6" "${TMP}"

# Paso 6: Eliminar líneas de longitud "> **Longitud**" sueltas
sed -E '/^> \*\*Longitud\*\*/d' \
  "${TMP}" > "${TMP}.7" && mv "${TMP}.7" "${TMP}"

# Paso 7: Eliminar líneas de metadato de bloque残留 "> **Campo**:" (Autor, Proyecto,
#   Centro, Ciclo, Generado, etc.) que no fueron capturadas por los pasos anteriores
sed -E '/^> \*\*Autor\*\*/d;
        /^> \*\*Proyecto\*\*/d;
        /^> \*\*Centro\*\*/d;
        /^> \*\*Ciclo\*\*/d;
        /^> \*\*Generado\*\*/d;
        /^> \*\*Tutor\*\*/d;
        /^> \*\*Longitud orientativa\*\*/d' \
  "${TMP}" > "${TMP}.8" && mv "${TMP}.8" "${TMP}"

# Paso 8: Eliminar líneas sueltas "> **Autor**: ..." en formato con dos puntos
sed -E '/^> \*\*Autor\*\*:/d' \
  "${TMP}" > "${TMP}.9" && mv "${TMP}.9" "${TMP}"

# Paso 9: Eliminar líneas "> Autor: Jose Vilches Sánchez" (formato plano)
sed -E '/^> Autor:/d' \
  "${TMP}" > "${TMP}.10" && mv "${TMP}.10" "${TMP}"

# Paso 10: Eliminar líneas "> ADRs de referencia:" o similar en bloque de cabecera
sed -E '/^> ADRs de referencia/d' \
  "${TMP}" > "${TMP}.11" && mv "${TMP}.11" "${TMP}"

# Paso 11: Eliminar líneas "> Estado: ..." (Estado sin asteriscos bold)
sed -E '/^> Estado:/d' \
  "${TMP}" > "${TMP}.12" && mv "${TMP}.12" "${TMP}"

# Paso 12: Eliminar notas de expansióon "> - Añadir párrafo...", "> - Ampliar...",
#   "> - Describir brevemente...", "> - Incluir un párrafo..." multilínea
perl -0777 -pe 's/^> - Añadir[^\n]*\n(?:> - [^\n]*\n)*//gm' \
  "${TMP}" > "${TMP}.13" && mv "${TMP}.13" "${TMP}"

# Paso 13: Eliminar líneas sueltas de nota "> **Nota para revisión**" residual
sed -E '/^> \*\*Nota para revisión\*\*/d' \
  "${TMP}" > "${TMP}.14" && mv "${TMP}.14" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
info "Marcadores de sección removidos: $((INPUT_SIZE - CLEAN_SIZE)) bytes"

if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
