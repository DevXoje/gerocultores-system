#!/usr/bin/env bash
# =============================================================================
# strip-agent-metadata.sh — Elimina metadatos de agente de archivos de memoria
# =============================================================================
#
# Elimina patrones de metadato que generan los agentes escritores:
#   - "*Borrador generado: ...", "*Generado: ..."
#   - "*Fuentes:", "*ADRs fuente:", "*Engram topic key:"
#   - "*Extensión aproximada: ..."
#   - Líneas de estado "Estado: BORRADOR", "Estado: ..." en bloque >
#
# USO:
#   ./strip-agent-metadata.sh [input.md [output.md]]
#   ./strip-agent-metadata.sh                  # usa默认值 (memoria-combined.md)
#   ./strip-agent-metadata.sh custom.md        # input personalizado
#   ./strip-agent-metadata.sh in.md out.md     # ambos personalizados
#
# OUTPUT:
#   stdout + archivo de salida (o stdout si no se especifica output)
#
# =============================================================================

set -euo pipefail

# --------------- Paths -------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACADEMIC_DIST="${REPO_ROOT}/OUTPUTS/academic/dist"
DEFAULT_INPUT="${ACADEMIC_DIST}/memoria-combined.md"
DEFAULT_OUTPUT="${ACADEMIC_DIST}/memoria-entregable.md"

INPUT_FILE="${1:-${DEFAULT_INPUT}}"
OUTPUT_FILE="${2:--}"

# --------------- Helpers -----------------------------------------------------
info()  { echo "  ✓  $*"; }
warn()  { echo "  ⚠  $*" >&2; }
error() { echo "  ✗  $*" >&2; }

# --------------- Validate input ---------------------------------------------
if [[ ! -f "${INPUT_FILE}" ]]; then
  error "Archivo no encontrado: ${INPUT_FILE}"
  exit 1
fi

INPUT_SIZE=$(wc -c < "${INPUT_FILE}")
info "Entrada: ${INPUT_FILE} (${INPUT_SIZE} bytes)"

# --------------- Strip patterns ---------------------------------------------
TMP=$(mktemp /tmp/strip-agent-XXXXXX.md)

# Paso 1: Eliminar líneas de metadato de agente que empiezan con asterisco
#   "*Borrador generado: ..."
#   "*Fuentes: ..."
#   "*ADRs fuente: ..."
#   "*Engram topic key: ..."
#   "*Extensión aproximada: ..."
#   "*Generado: ..."
sed -E '/^\*Borrador generado:/d' \
  "${INPUT_FILE}" \
  > "${TMP}"

sed -E '/^\*Fuentes:/d' \
  "${TMP}" > "${TMP}.1" && mv "${TMP}.1" "${TMP}"

sed -E '/^\*ADRs fuente:/d' \
  "${TMP}" > "${TMP}.2" && mv "${TMP}.2" "${TMP}"

sed -E '/^\*Engram topic key:/d' \
  "${TMP}" > "${TMP}.3" && mv "${TMP}.3" "${TMP}"

sed -E '/^\*Extensión aproximada:/d' \
  "${TMP}" > "${TMP}.4" && mv "${TMP}.4" "${TMP}"

sed -E '/^\*Generado:/d' \
  "${TMP}" > "${TMP}.5" && mv "${TMP}.5" "${TMP}"

# Paso 2: Eliminar líneas de estado "Estado: ..." en bloque de cabecera
#   Estas aparecen como "> **Estado**: BORRADOR — ..."
sed -E '/^> \*\*Estado\*\*:/d' \
  "${TMP}" > "${TMP}.6" && mv "${TMP}.6" "${TMP}"

# Paso 3: Eliminar líneas de autor "Autor: ..." en bloque de cabecera
sed -E '/^> \*\*Autor\*\*/d' \
  "${TMP}" > "${TMP}.7" && mv "${TMP}.7" "${TMP}"

# Paso 4: Eliminar líneas de proyecto "Proyecto: ..." en bloque de cabecera
sed -E '/^> \*\*Proyecto\*\*/d' \
  "${TMP}" > "${TMP}.8" && mv "${TMP}.8" "${TMP}"

# Paso 5: Eliminar líneas de tutor "Tutor: ..." en bloque de cabecera
sed -E '/^> \*\*Tutor\*\*/d' \
  "${TMP}" > "${TMP}.9" && mv "${TMP}.9" "${TMP}"

# Paso 6: Eliminar líneas de centro "Centro: ..." en bloque de cabecera
sed -E '/^> \*\*Centro\*\*/d' \
  "${TMP}" > "${TMP}.10" && mv "${TMP}.10" "${TMP}"

# Paso 7: Eliminar líneas de ciclo "Ciclo: ..." en bloque de cabecera
sed -E '/^> \*\*Ciclo\*\*/d' \
  "${TMP}" > "${TMP}.11" && mv "${TMP}.11" "${TMP}"

CLEAN_SIZE=$(wc -c < "${TMP}")
info "Metadatos removidos: $((INPUT_SIZE - CLEAN_SIZE)) bytes"

# --------------- Output ------------------------------------------------------
if [[ "${OUTPUT_FILE}" == "-" ]]; then
  cat "${TMP}"
else
  cp "${TMP}" "${OUTPUT_FILE}"
  info "Salida: ${OUTPUT_FILE}"
fi

rm -f "${TMP}"
