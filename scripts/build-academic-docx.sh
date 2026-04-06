#!/usr/bin/env bash
# =============================================================================
# build-academic-docx.sh — Genera memoria académica DAW en .docx y .pdf
# =============================================================================
#
# Combina los archivos Markdown de OUTPUTS/academic/ en orden establecido
# y produce un .docx mediante pandoc (local o Docker) y un .pdf como paso
# secundario (pandoc+LaTeX, pandoc HTML→weasyprint vía Docker, o skip).
#
# USO:
#   ./scripts/build-academic-docx.sh [opciones]
#
# OPCIONES:
#   --sections   Solo generar .docx (saltar PDF)
#   --pdf-only   Solo intentar generar PDF (asume .docx ya generado)
#   --dry-run    Mostrar qué haría sin ejecutar nada
#   --help, -h   Mostrar esta ayuda
#
# EJEMPLOS:
#   # Build completo (docx + pdf):
#   ./scripts/build-academic-docx.sh
#
#   # Solo docx (más rápido, sin PDF):
#   ./scripts/build-academic-docx.sh --sections
#
#   # Ver qué archivos se usarían sin ejecutar:
#   ./scripts/build-academic-docx.sh --dry-run
#
# REQUISITOS (uno de los dos):
#   - pandoc instalado localmente  (brew install pandoc)
#   - Docker instalado y corriendo (imagen pandoc/core:latest se descarga automáticamente)
#
# PIPELINE DE CONVERSIÓN:
#   Paso 1 — DOCX: pandoc local → pandoc/core:latest (Docker fallback)
#   Paso 2 — PDF:  pandoc+LaTeX local → pandoc/extra:latest (Docker, incluye LaTeX)
#                  → SKIP con aviso si nada disponible (PDF es opcional)
#
# NOTA TÉCNICA (G07 — shortcut documentado):
#   El template reference.docx es una copia del template Harvard del proyecto
#   hermano personal-brand-system. Fue copiado manualmente en lugar de generarse
#   con pandoc --print-default-data-file para preservar los estilos de párrafo
#   personalizados que produce mejor output visual. Si en el futuro se requiere
#   un template académico propio, regenerarlo con:
#     docker run --rm pandoc/core:latest --print-default-data-file reference.docx \
#       > OUTPUTS/academic/template/reference.docx
#
# OUTPUTS:
#   OUTPUTS/academic/dist/memoria-gerocultores.docx
#   OUTPUTS/academic/dist/memoria-gerocultores.pdf  (si es posible)
#
# =============================================================================

set -euo pipefail

# --------------- Constants ---------------------------------------------------
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACADEMIC_DIR="${REPO_ROOT}/OUTPUTS/academic"
DIST_DIR="${ACADEMIC_DIR}/dist"
TEMPLATE="${ACADEMIC_DIR}/template/reference.docx"
OUTPUT_DOCX="${DIST_DIR}/memoria-gerocultores.docx"
OUTPUT_PDF="${DIST_DIR}/memoria-gerocultores.pdf"

# Imagen Docker preferida para DOCX (pandoc/core es ligera y funciona en ARM64)
DOCKER_IMAGE_CORE="pandoc/core:latest"
# Imagen Docker para PDF con LaTeX (pandoc/extra incluye xelatex)
DOCKER_IMAGE_EXTRA="pandoc/extra:latest"

# --------------- Section Order -----------------------------------------------
# Orden de secciones hardcodeado según memory-template.md (ÍNDICE COMPLETO).
# Secciones no creadas aún se omiten automáticamente con un aviso.
# Añadir aquí el nombre del archivo cuando se genere cada sección nueva.
SECTION_ORDER=(
  "resumen-ejecutivo.md"
  "introduccion.md"
  "objetivos.md"
  "fundamentos-teoricos.md"            # Sección 2
  "contexto.md"                        # Sección 3
  "analisis-requisitos.md"             # Sección 4
  # "diseno-sistema.md"                # Sección 5 — PENDIENTE
  # "implementacion.md"                # Sección 6 — BLOQUEADA (requiere código)
  "coste-economico.md"                 # Sección 7
  "alternativas.md"                    # Sección 8
  # "pruebas.md"                       # Sección 9 — PENDIENTE
  "seguridad-rgpd.md"                  # Sección 10
  # "conclusiones.md"                  # Sección 11 — BLOQUEADA (requiere fin desarrollo)
  # "formacion-adicional.md"           # Sección 12 — PENDIENTE (info autor)
  "bibliografia.md"                    # Sección 13
  "recursos.md"                        # Sección 14
  "metodologia.md"                     # integrada como apéndice metodológico
)

# --------------- Flags -------------------------------------------------------
SKIP_PDF=false
PDF_ONLY=false
DRY_RUN=false

for arg in "$@"; do
  case "$arg" in
    --sections)  SKIP_PDF=true ;;
    --pdf-only)  PDF_ONLY=true ;;
    --dry-run)   DRY_RUN=true ;;
    --help|-h)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed '/^!/d'
      exit 0
      ;;
    *)
      echo "[ERROR] Opción desconocida: $arg" >&2
      echo "        Usa --help para ver las opciones disponibles." >&2
      exit 1
      ;;
  esac
done

# --------------- Helpers -----------------------------------------------------
info()    { echo "  ✓  $*"; }
warn()    { echo "  ⚠  $*" >&2; }
error()   { echo "  ✗  $*" >&2; }
section() { echo ""; echo "──────────────────────────────────────────"; echo "  $*"; echo "──────────────────────────────────────────"; }

# --------------- Validate environment ----------------------------------------
section "🔍 Detectando entorno"

# Check template
if [[ ! -f "${TEMPLATE}" ]]; then
  error "Template no encontrado: ${TEMPLATE}"
  error ""
  error "Para regenerar el template por defecto:"
  error "  docker run --rm pandoc/core:latest --print-default-data-file reference.docx \\"
  error "    > OUTPUTS/academic/template/reference.docx"
  exit 1
fi
info "Template encontrado: ${TEMPLATE} ($(du -sh "${TEMPLATE}" | cut -f1))"

# Ensure dist directory exists
if [[ "${DRY_RUN}" == false ]]; then
  mkdir -p "${DIST_DIR}"
fi
info "Directorio de salida: ${DIST_DIR}"

# --------------- Detect conversion engine ------------------------------------
PANDOC_BIN=""
USE_DOCKER=false

if command -v pandoc &>/dev/null; then
  PANDOC_BIN="$(command -v pandoc)"
  info "pandoc local detectado: ${PANDOC_BIN} ($(pandoc --version | head -1))"
elif command -v docker &>/dev/null; then
  USE_DOCKER=true
  info "pandoc no encontrado localmente → usando Docker (${DOCKER_IMAGE_CORE})"
  if [[ "${DRY_RUN}" == false ]]; then
    # Pull silently if not present
    if ! docker image inspect "${DOCKER_IMAGE_CORE}" &>/dev/null 2>&1; then
      echo "  ↓  Descargando imagen Docker ${DOCKER_IMAGE_CORE} (solo la primera vez)..."
      docker pull "${DOCKER_IMAGE_CORE}" >/dev/null 2>&1 && info "Imagen lista: ${DOCKER_IMAGE_CORE}" || {
        error "No se pudo descargar ${DOCKER_IMAGE_CORE}. Verifica tu conexión a internet."
        exit 3
      }
    else
      info "Imagen Docker ya disponible: ${DOCKER_IMAGE_CORE}"
    fi
  fi
else
  error "Ni pandoc ni Docker están disponibles."
  error ""
  error "Instala uno de los dos:"
  error "  • pandoc (recomendado): brew install pandoc"
  error "  • Docker Desktop:       https://www.docker.com/products/docker-desktop/"
  exit 2
fi

# --------------- Collect sections --------------------------------------------
section "📄 Recopilando secciones"

AVAILABLE_FILES=()
MISSING_FILES=()

for section_file in "${SECTION_ORDER[@]}"; do
  full_path="${ACADEMIC_DIR}/${section_file}"
  if [[ -f "${full_path}" ]]; then
    AVAILABLE_FILES+=("${full_path}")
    info "Incluida: ${section_file}"
  else
    MISSING_FILES+=("${section_file}")
    warn "Pendiente (omitida): ${section_file}"
  fi
done

echo ""
echo "  Total: ${#AVAILABLE_FILES[@]} secciones disponibles, ${#MISSING_FILES[@]} pendientes"

if [[ ${#AVAILABLE_FILES[@]} -eq 0 ]]; then
  error "No se encontró ninguna sección en ${ACADEMIC_DIR}/"
  error "Verifica que existan archivos .md en esa carpeta."
  exit 1
fi

# --------------- Dry run exit ------------------------------------------------
if [[ "${DRY_RUN}" == true ]]; then
  echo ""
  section "🔍 DRY RUN — Nada se ejecutó"
  echo "  Motor de conversión: $([ "${USE_DOCKER}" == true ] && echo "Docker (${DOCKER_IMAGE_CORE})" || echo "pandoc local")"
  echo "  Template:            ${TEMPLATE}"
  echo "  Salida DOCX:         ${OUTPUT_DOCX}"
  echo "  Salida PDF:          ${OUTPUT_PDF} ($([ "${SKIP_PDF}" == true ] && echo "SKIP" || echo "intentar"))"
  echo ""
  echo "  Secciones que se combinarían (en orden):"
  for f in "${AVAILABLE_FILES[@]}"; do
    echo "    - $(basename "${f}")"
  done
  exit 0
fi

# --------------- Build DOCX --------------------------------------------------
if [[ "${PDF_ONLY}" == false ]]; then
  section "📝 Generando DOCX"

  # Build path arrays relative to REPO_ROOT for Docker
  REL_FILES=()
  for f in "${AVAILABLE_FILES[@]}"; do
    REL_FILES+=("${f#${REPO_ROOT}/}")
  done
  REL_TEMPLATE="${TEMPLATE#${REPO_ROOT}/}"
  REL_OUTPUT="${OUTPUT_DOCX#${REPO_ROOT}/}"

  if [[ "${USE_DOCKER}" == false ]]; then
    # --- Local pandoc ---
    pandoc \
      "${AVAILABLE_FILES[@]}" \
      --from=markdown \
      --to=docx \
      --reference-doc="${TEMPLATE}" \
      --output="${OUTPUT_DOCX}" \
      --toc \
      --toc-depth=3 \
      --metadata title="Memoria Académica — gerocultores-system" \
      --metadata author="Jose Vilches Sánchez"
  else
    # --- Docker fallback ---
    # pandoc/core usa pandoc como entrypoint — no añadir "pandoc" como primer arg.
    # Montamos el repo root en /data y usamos -w /data para que las rutas relativas funcionen.
    # -u $(id -u):$(id -g) evita que los archivos de salida sean propiedad de root.
    docker run --rm \
      -v "${REPO_ROOT}:/data" \
      -w /data \
      -u "$(id -u):$(id -g)" \
      "${DOCKER_IMAGE_CORE}" \
        "${REL_FILES[@]}" \
        --from=markdown \
        --to=docx \
        --reference-doc="${REL_TEMPLATE}" \
        --output="${REL_OUTPUT}" \
        --toc \
        --toc-depth=3 \
        --metadata title="Memoria Académica — gerocultores-system" \
        --metadata author="Jose Vilches Sánchez"
  fi

  # Verify output
  if [[ -f "${OUTPUT_DOCX}" ]] && [[ -s "${OUTPUT_DOCX}" ]]; then
    info "DOCX generado: ${OUTPUT_DOCX}"
    info "  Tamaño: $(du -sh "${OUTPUT_DOCX}" | cut -f1)"
  else
    error "Error al generar DOCX — archivo no encontrado o vacío: ${OUTPUT_DOCX}"
    exit 3
  fi
fi

# --------------- Build PDF ---------------------------------------------------
if [[ "${SKIP_PDF}" == false ]]; then
  section "📕 Generando PDF"

  PDF_OK=false
  # Archivo temporal combinado (md-to-pdf solo acepta un archivo de entrada)
  TMP_COMBINED_MD="$(mktemp /tmp/memoria-gerocultores-XXXXXX.md)"
  TMP_COMBINED_PDF="${TMP_COMBINED_MD%.md}.pdf"

  # Concatenar todas las secciones en el archivo temporal
  first=true
  for f in "${AVAILABLE_FILES[@]}"; do
    if [[ "${first}" == true ]]; then
      first=false
    else
      printf "\n\n---\n\n" >> "${TMP_COMBINED_MD}"
    fi
    cat "${f}" >> "${TMP_COMBINED_MD}"
  done

  # --------------------------------------------------------------------------
  # NOTA TÉCNICA (G07 — shortcut documentado):
  # La generación de PDF usa md-to-pdf (npx) + Chrome/Chromium instalado en el
  # host (vía Puppeteer headless). Esto es más robusto en ARM64 Mac que el stack
  # pandoc+LaTeX porque evita la dependencia de TeX (~3 GB con MacTeX).
  # Chrome se detecta en orden: sistema macOS (/Applications/...), luego PATH.
  # Si Chrome no está instalado, se intentan los fallbacks LaTeX/Docker.
  # --------------------------------------------------------------------------

  # Detectar Chrome / Chromium en el sistema
  CHROME_EXEC=""
  CHROME_LOCATIONS=(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
  )
  for chrome_path in "${CHROME_LOCATIONS[@]}"; do
    if [[ -x "${chrome_path}" ]]; then
      CHROME_EXEC="${chrome_path}"
      break
    fi
  done
  # Also check PATH for chromium or google-chrome
  if [[ -z "${CHROME_EXEC}" ]]; then
    for bin in chromium google-chrome chromium-browser; do
      if command -v "${bin}" &>/dev/null; then
        CHROME_EXEC="$(command -v "${bin}")"
        break
      fi
    done
  fi

  # Intento 1: md-to-pdf + Chrome/Chromium (mejor resultado visual en ARM64 Mac)
  if [[ -n "${CHROME_EXEC}" ]] && command -v npx &>/dev/null; then
    info "Generando PDF con md-to-pdf + Chrome..."
    info "  Chrome: ${CHROME_EXEC}"
    # md-to-pdf outputs PDF next to the input file (same name, .pdf extension)
    LAUNCH_OPTS="{\"executablePath\": \"${CHROME_EXEC}\"}"
    PDF_OPTS='{"format": "A4", "margin": {"top": "2.5cm", "bottom": "2.5cm", "left": "2.5cm", "right": "2.5cm"}}'
    npx md-to-pdf "${TMP_COMBINED_MD}" \
      --launch-options "${LAUNCH_OPTS}" \
      --pdf-options "${PDF_OPTS}" \
      --document-title "Memoria Académica — gerocultores-system" \
      2>/dev/null && PDF_OK=true || warn "md-to-pdf falló, probando fallbacks..."

    if [[ "${PDF_OK}" == true ]] && [[ -f "${TMP_COMBINED_PDF}" ]]; then
      cp "${TMP_COMBINED_PDF}" "${OUTPUT_PDF}"
      rm -f "${TMP_COMBINED_PDF}"
    fi

  # Intento 2: pandoc local con xelatex (si existe)
  elif command -v pandoc &>/dev/null && command -v xelatex &>/dev/null; then
    info "Generando PDF con pandoc + xelatex..."
    pandoc \
      "${AVAILABLE_FILES[@]}" \
      --from=markdown \
      --to=pdf \
      --pdf-engine=xelatex \
      --output="${OUTPUT_PDF}" \
      --toc \
      --toc-depth=3 \
      --metadata title="Memoria Académica — gerocultores-system" \
      --metadata author="Jose Vilches Sánchez" \
      --variable geometry:margin=2.5cm \
      --variable fontsize=11pt \
      --variable lang=es 2>/dev/null && PDF_OK=true || warn "xelatex falló."

  # Intento 3: Docker con pandoc/extra:latest (incluye LaTeX — ~500 MB)
  elif command -v docker &>/dev/null && docker image inspect "${DOCKER_IMAGE_EXTRA}" &>/dev/null 2>&1; then
    info "Generando PDF vía Docker (${DOCKER_IMAGE_EXTRA})..."
    REL_FILES_PDF=()
    for f in "${AVAILABLE_FILES[@]}"; do
      REL_FILES_PDF+=("${f#${REPO_ROOT}/}")
    done
    REL_OUTPUT_PDF="${OUTPUT_PDF#${REPO_ROOT}/}"
    docker run --rm \
      -v "${REPO_ROOT}:/data" \
      -w /data \
      -u "$(id -u):$(id -g)" \
      "${DOCKER_IMAGE_EXTRA}" \
        "${REL_FILES_PDF[@]}" \
        --from=markdown \
        --to=pdf \
        --pdf-engine=xelatex \
        --output="${REL_OUTPUT_PDF}" \
        --toc \
        --toc-depth=3 \
        --metadata title="Memoria Académica — gerocultores-system" \
        --metadata author="Jose Vilches Sánchez" \
        --variable geometry:margin=2.5cm \
        --variable fontsize=11pt \
        --variable lang=es 2>/dev/null && PDF_OK=true || warn "Docker pandoc/extra falló."

  # Intento 4: LibreOffice (convierte DOCX → PDF)
  elif command -v libreoffice &>/dev/null && [[ -f "${OUTPUT_DOCX}" ]]; then
    info "Generando PDF con LibreOffice desde .docx..."
    libreoffice --headless --convert-to pdf \
      --outdir "${DIST_DIR}" \
      "${OUTPUT_DOCX}" 2>/dev/null && PDF_OK=true || warn "LibreOffice falló."
  fi

  # Limpiar temp files
  rm -f "${TMP_COMBINED_MD}" "${TMP_COMBINED_PDF}" 2>/dev/null || true

  if [[ "${PDF_OK}" == true ]] && [[ -f "${OUTPUT_PDF}" ]] && [[ -s "${OUTPUT_PDF}" ]]; then
    info "PDF generado: ${OUTPUT_PDF}"
    info "  Tamaño: $(du -sh "${OUTPUT_PDF}" | cut -f1)"
  else
    warn "No se pudo generar el PDF automáticamente."
    warn ""
    warn "Opciones para generarlo manualmente:"
    warn "  1. (Recomendado en macOS) Instala Chrome + usa npx:"
    warn "       # Chrome ya debe estar en /Applications/Google Chrome.app"
    warn "       ./scripts/build-academic-docx.sh --pdf-only"
    warn ""
    warn "  2. Descarga pandoc/extra de Docker (~500 MB) y ejecuta:"
    warn "       docker pull pandoc/extra:latest"
    warn "       ./scripts/build-academic-docx.sh --pdf-only"
    warn ""
    warn "  3. Abre el .docx generado en Word/LibreOffice y exporta a PDF."
    warn ""
    warn "  4. Instala pandoc + LaTeX localmente:"
    warn "       brew install pandoc && brew install --cask mactex-no-gui"
    warn "       ./scripts/build-academic-docx.sh"
    warn ""
    warn "  ℹ El .docx SÍ fue generado y es el documento principal de entrega."
  fi
fi

# --------------- Summary -----------------------------------------------------
section "✅ Pipeline completado"

echo "  Secciones incluidas (${#AVAILABLE_FILES[@]}):"
for f in "${AVAILABLE_FILES[@]}"; do
  echo "    ✓ $(basename "${f}")"
done

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
  echo ""
  echo "  Secciones pendientes (${#MISSING_FILES[@]}) — añadir a OUTPUTS/academic/ cuando estén listas:"
  for f in "${MISSING_FILES[@]}"; do
    echo "    ○ ${f}"
  done
fi

echo ""
echo "  Archivos de salida:"
[[ -f "${OUTPUT_DOCX}" ]] && echo "    ✓ ${OUTPUT_DOCX} ($(du -sh "${OUTPUT_DOCX}" | cut -f1))"
[[ -f "${OUTPUT_PDF}"  ]] && echo "    ✓ ${OUTPUT_PDF}  ($(du -sh "${OUTPUT_PDF}" | cut -f1))"
[[ ! -f "${OUTPUT_PDF}" ]] && [[ "${SKIP_PDF}" == false ]] && echo "    ○ ${OUTPUT_PDF}  (no generado — ver advertencias arriba)"
echo ""
