#!/usr/bin/env python3
# =============================================================================
# preprocess-images.py — Descarga y localiza imágenes para conversión DOCX/PDF
# =============================================================================
#
# Recibe un archivo markdown, resuelve todas las referencias de imagen
# (URLs remotas y rutas relativas), las descarga/copia a un cache local y
# reescribe el markdown con rutas relativas locales.
#
# USO:
#   ./scripts/preprocess-images.py <input.md> [output.md]
#
# Si no se especifica output, escribe en stdout.
#
# CACHE:
#   Las imágenes se cachean en .cache/images/ bajo el REPO_ROOT para evitar
#   descargas repetidas. URLs remotas usan hash SHA256 como nombre de archivo.
#
# =============================================================================

import sys
import os
import re
import hashlib
import shutil
import urllib.request
import urllib.error
from pathlib import Path
from urllib.parse import urlparse

# --------------- Paths --------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT  = SCRIPT_DIR.parent
INPUT_FILE = Path(sys.argv[1] if len(sys.argv) > 1 else "")
OUTPUT_ARG = Path(sys.argv[2] if len(sys.argv) > 2 else "")

if not INPUT_FILE.is_file():
    print(f"[ERROR] Archivo no encontrado: {INPUT_FILE}", file=sys.stderr)
    sys.exit(1)

INPUT_ABS   = INPUT_FILE.resolve()
INPUT_DIR   = INPUT_ABS.parent

CACHE_DIR   = REPO_ROOT / ".cache" / "images"
OUTPUT_MARKDOWN = CACHE_DIR.parent / "memoria-combined-images.md"  # .cache/memoria-combined-images.md
CACHE_REL   = "images"   # relativo a .cache/ (images/ es subdirectorio)

CACHE_DIR.mkdir(parents=True, exist_ok=True)

# --------------- Helpers ------------------------------------------------------

def url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]

def download_remote(url: str, dest: Path, timeout: int = 20) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            with open(dest, "wb") as f:
                shutil.copyfileobj(resp, f)
        return dest.stat().st_size > 0
    except Exception:
        return False

def resolve_path(img_url: str, base_dir: Path) -> Path:
    """Resuelve ruta local (relativa o absoluta) a Path absoluto."""
    if img_url.startswith(("http://", "https://")):
        return Path("")
    if img_url.startswith("/"):
        return Path(img_url)
    # Resolve relative path
    resolved = (base_dir / img_url).resolve()
    return resolved

def ext_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path or ""
    for ext in ["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff"]:
        if f".{ext}" in path.lower():
            return ext
    return "png"

# --------------- Process ------------------------------------------------------

IMAGE_RE = re.compile(r'!\[([^\]]*)\]\(([^)]+)\)')

processed   = 0
downloaded  = 0
local_copy  = 0
skipped     = 0

output_lines = []

with open(INPUT_ABS, encoding="utf-8") as f:
    for line in f:
        # Strip trailing newline only — preserve leading whitespace
        line = line.rstrip('\n')
        match = IMAGE_RE.search(line)
        if not match:
            output_lines.append(line)
            continue

        alt     = match.group(1)
        img_url = match.group(2)

        # Skip non-http(s) schemes (mailto:, etc.)
        parsed = urlparse(img_url)
        if parsed.scheme and parsed.scheme not in ("http", "https"):
            output_lines.append(line)
            continue

        new_url   = ""
        cache_key = ""

        if img_url.startswith(("http://", "https://")):
            # ---- Remote URL ----
            ext  = ext_from_url(img_url)
            h    = url_hash(img_url)
            dest = CACHE_DIR / f"{h}.{ext}"

            if dest.is_file() and dest.stat().st_size > 0:
                pass  # already cached
            elif download_remote(img_url, dest):
                downloaded += 1
            else:
                skipped += 1
                output_lines.append(line)
                print(f"  ⚠  No se pudo descargar: {img_url[:80]}", file=sys.stderr)
                continue

            new_url   = f"{CACHE_REL}/{h}.{ext}"
            cache_key = str(dest)

        else:
            # ---- Local path ----
            abs_src = resolve_path(img_url, INPUT_DIR)

            if not abs_src.is_file():
                skipped += 1
                print(f"  ⚠  Imagen local no encontrada: {abs_src}", file=sys.stderr)
                output_lines.append(line)
                continue

            ext  = abs_src.suffix.lstrip(".").lower() or "png"
            h    = hashlib.sha256(str(abs_src).encode()).hexdigest()[:16]
            dest = CACHE_DIR / f"{h}.{ext}"

            if not dest.is_file():
                shutil.copy2(abs_src, dest)
                local_copy += 1

            new_url   = f"{CACHE_REL}/{h}.{ext}"
            cache_key = str(dest)

        # Rewrite line with local path
        rewritten = IMAGE_RE.sub(f'![{alt}]({new_url})', line, count=1)
        output_lines.append(rewritten)
        processed += 1

# --------------- Write output -------------------------------------------------
output_content = "\n".join(output_lines) + "\n"
OUTPUT_MARKDOWN.write_text(output_content, encoding="utf-8")
print(f"  ✓  Salida: {OUTPUT_MARKDOWN}", file=sys.stderr)

# Summary
print(file=sys.stderr)
print(f"  ✓  Imágenes procesadas: {processed}  ({downloaded} descargadas, {local_copy} copiadas, {skipped} omitidas)", file=sys.stderr)
print(f"  ✓  Cache: {CACHE_DIR}", file=sys.stderr)