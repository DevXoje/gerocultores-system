#!/usr/bin/env bash
# =============================================================================
# preprocess-images.sh — Descarga y localiza imágenes para conversión DOCX/PDF
# =============================================================================
#
# Recibe un archivo markdown, resuelve todas las referencias de imagen
# (URLs remotas y rutas relativas), las descarga/copia a un cache local y
# reescribe el markdown con rutas relativas locales.
#
# USO:
#   ./scripts/preprocess-images.sh <input.md> [output.md]
#
# Si no se especifica output, escribe en stdout.
#
# CACHE:
#   Las imágenes se cachean en .cache/images/ bajo el REPO_ROOT para evitar
#   descargas repetidas. URLs remotas usan hash SHA256 como nombre de archivo.
#
# =============================================================================

set -euo pipefail

# --------------- Paths -------------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT_FILE="$1"
OUTPUT_FILE="${2:-}"

if [[ ! -f "${INPUT_FILE}" ]]; then
  echo "[ERROR] Archivo no encontrado: ${INPUT_FILE}" >&2
  exit 1
fi

INPUT_ABS="$(readlink -f "${INPUT_FILE}")"
INPUT_DIR="$(dirname "${INPUT_ABS}")"
CACHE_DIR="${REPO_ROOT}/.cache/images"
DIST_DIR="${REPO_ROOT}/OUTPUTS/academic/dist"
CACHE_REL="../../.cache/images"   # ruta relativa desde dist/ al cache

# --------------- Helpers ------------------------------------------------------
url_hash() {
  printf '%s' "$1" | shasum -a 256 | cut -c1-16
}

download_remote() {
  local url="$1"
  local dest="$2"
  local err

  if command -v curl &>/dev/null; then
    err=$(curl -fsSL --max-time 20 -o "${dest}" "${url}" 2>&1)
  elif command -v wget &>/dev/null; then
    err=$(wget -q -O "${dest}" --timeout=20 "${url}" 2>&1)
  else
    return 1
  fi
  [[ -s "${dest}" ]] && return 0 || return 1
}

# Resolve image path to absolute, handling ../ etc.
resolve_path() {
  local img_url="$1"
  local base_dir="$2"

  case "${img_url}" in
    https://*|http://*)
      echo ""  # empty = remote
      ;;
    ../*)
      # Resolve relative path from INPUT_DIR
      local resolved="${base_dir}/${img_url}"
      # Normalize .. and .
      local parts segments=()
      IFS='/' read -ra parts <<< "${resolved}"
      for part in "${parts[@]}"; do
        case "${part}" in
          ..)  unset 'segments[${#segments[@]}-1]' ;;
          .|'') ;;
          *)   segments+=("${part}") ;;
        esac
      done
      local result=""
      for seg in "${segments[@]}"; do result="${result}/${seg}"; done
      echo "${result:-/}"
      ;;
    /*)
      echo "${img_url}"  # absolute path
      ;;
    *)
      echo "${base_dir}/${img_url}"  # relative to input dir
      ;;
  esac
}

# --------------- Setup --------------------------------------------------------
mkdir -p "${CACHE_DIR}"
rm -f "${CACHE_DIR}/README.md" 2>/dev/null || true

# File to hold processing summary
SUMMARY_FILE=$(mktemp /tmp/preprocess-images-XXXXXX.summary)

# --------------- Process markdown line by line --------------------------------
process_file() {
  local input="$1"
  local output="$2"

  local img_count=0
  local downloaded=0
  local local_copy=0
  local skipped=0

  while IFS= read -r line || [[ -n "${line}" ]]; do
    # Match markdown image: ![alt](url)
    if [[ "${line}" =~ !\[([^\]]*)\]\(([^)]+)\) ]]; then
      local alt="${BASH_REMATCH[1]}"
      local img_url="${BASH_REMATCH[2]}"

      # Skip non-http(s) schemes (mailto:, etc.)
      if [[ "${img_url}" =~ ^[a-z]+: ]] && [[ ! "${img_url}" =~ ^https?:// ]]; then
        echo "${line}"
        continue
      fi

      local cached_path=""
      local new_url=""

      if [[ "${img_url}" =~ ^https?:// ]]; then
        # ---- Remote URL ----
        local ext
        case "${img_url}" in
          *.png)  ext="png" ;;
          *.jpg)  ext="jpg" ;;
          *.jpeg) ext="jpg" ;;
          *.gif)  ext="gif" ;;
          *.webp) ext="webp" ;;
          *.bmp)  ext="bmp" ;;
          *.tiff) ext="tiff" ;;
          *)      ext="png" ;;
        esac

        local hash=$(url_hash "${img_url}")
        local dest="${CACHE_DIR}/${hash}.${ext}"

        if [[ -f "${dest}" && -s "${dest}" ]]; then
          :  # already cached
        else
          if download_remote "${img_url}" "${dest}"; then
            downloaded=$((downloaded + 1))
          else
            skipped=$((skipped + 1))
            echo "${line}"  # leave original if download fails
            continue
          fi
        fi

        new_url="${CACHE_REL}/${hash}.${ext}"
        img_count=$((img_count + 1))

      else
        # ---- Local path ----
        local abs_src=$(resolve_path "${img_url}" "${INPUT_DIR}")

        if [[ ! -f "${abs_src}" ]]; then
          warn "Imagen local no encontrada: ${abs_src} (referenciada desde ${img_url})"
          skipped=$((skipped + 1))
          echo "${line}"
          continue
        fi

        # Determine extension
        local ext="${abs_src##*.}"
        [[ "${ext}" == "${abs_src}" ]] && ext="png"
        ext=$(echo "${ext}" | tr '[:upper:]' '[:lower:]')

        # Hash of absolute source path for cache name
        local hash=$(url_hash "${abs_src}")
        local dest="${CACHE_DIR}/${hash}.${ext}"

        if [[ ! -f "${dest}" ]]; then
          cp "${abs_src}" "${dest}"
          local_copy=$((local_copy + 1))
        fi

        new_url="${CACHE_REL}/${hash}.${ext}"
        img_count=$((img_count + 1))
      fi

      # Output rewritten line
      echo "![${alt}](${new_url})"

    else
      echo "${line}"
    fi

  done < "${input}" > "${output}"

  # Save summary
  {
    echo "processed=${img_count}"
    echo "downloaded=${downloaded}"
    echo "local_copy=${local_copy}"
    echo "skipped=${skipped}"
  } > "${SUMMARY_FILE}"
}

# --------------- Run ----------------------------------------------------------
OUTPUT_TMP=$(mktemp /tmp/preprocess-images-XXXXXX.md)
process_file "${INPUT_FILE}" "${OUTPUT_TMP}"

if [[ -n "${OUTPUT_FILE}" ]]; then
  mv "${OUTPUT_TMP}" "${OUTPUT_FILE}"
  echo "  ✓  Salida: ${OUTPUT_FILE}" >&2
else
  cat "${OUTPUT_TMP}"
  rm -f "${OUTPUT_TMP}"
fi

# Report
source "${SUMMARY_FILE}"
rm -f "${SUMMARY_FILE}"
echo "" >&2
echo "  ✓  Imágenes procesadas: ${processed} (${downloaded} descargadas, ${local_copy} copiadas, ${skipped} omitidas)" >&2
echo "  ✓  Cache: ${CACHE_DIR}" >&2