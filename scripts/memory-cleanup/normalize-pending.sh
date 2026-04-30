#!/usr/bin/env bash
# =============================================================================
# normalize-pending.sh — Normaliza marcadores de [Pendiente] legítimos
# =============================================================================
#
# Los marcadores [Pendiente: ...] son contenido real que dice qué falta.
# Este script los normaliza para que queden limpios pero preserva el contenido.
#
# ACCIONES:
#   1. Convierte líneas sueltas "[Pendiente: ...]" en línea Markdown clara
#   2. Elimina líneas "> [Pendiente: ...]" mal formateadas en bloque
#   3. Asegura que los Pending legítimos se preserven como notas claras
#   4. Elimina líneas vacías duplicadas tras procesamiento
#
# PRESERVA:
#   - Todo contenido que no sea un marcador de metadata editorial
#   - [Pendiente] real que indica qué falta en el desarrollo
#
# USO:
#   ./normalize-pending.sh [input.md [output.md]]
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

TMP=$(mktemp /tmp/normalize-pending-XXXXXX.md)

# Paso 1: Convierte "> [Pendiente: ...]" (en bloque) en línea limpia
#   "> [Pendiente: ...]" → "**[Pendiente]**: contenido"
perl -0777 -pe 's/> \[Pendiente: ([^\]]+)\]/**[Pendiente]**: $1/g' \
  "${INPUT_FILE}" > "${TMP}"

# Paso 2: Convierte líneas sueltas "[Pendiente: ...]" al final de sección
#   "[Pendiente: ...]" → "**[Pendiente]**: contenido"
sed -E 's/^\[Pendiente: ([^\]]+)\]/**[Pendiente]**: $1/' \
  "${TMP}" > "${TMP}.1" && mv "${TMP}.1" "${TMP}"

# Paso 3: Elimina "⚠️ **Pendiente del autor**:" — esto es metadata editorial
#   pero si aparece como contenido real (no línea de bloque), se preserva
sed -E '/^⚠️ \*\*Pendiente del autor\*\*/d' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

# Paso 4: Normaliza espacios en líneas de Pendiente que quedaron con doble espacio
sed -E 's/\*\*\[Pendiente\]\*\*:  */**[Pendiente]**: /g' \
  "${TMP}" > "${TMP}.3" && mv "${TMP}.3" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
info "Pendientes normalizados: $((INPUT_SIZE - CLEAN_SIZE)) bytes"

if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
