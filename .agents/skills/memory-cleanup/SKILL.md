---
name: memory-cleanup
description: >
  Limpia y prepara archivos de memoria académica para entrega.
  Trigger: Cuando se necesita generar una versión limpia de la memoria
  (memoria-combined.md → memoria-entregable.md) o cuando se pide
  hacer cleanup editorial de comentarios de agente.
license: MIT
metadata:
  author: gerocultores-system
  version: "1.0"
---

## Purpose

Limpiar archivos de memoria académica de comentarios editoriales, metadatos de agente y bloques de desarrollo para producir versiones limpias para entrega.

## Modelo de versiones de memoria

| Archivo | Rol | Estado |
|---------|-----|--------|
| `OUTPUTS/academic/dist/memoria-combined.md` | Working copy con comentarios de agente | WIP |
| `OUTPUTS/academic/dist/memoria-entregable.md` | Versión para entrega parcial — limpia, solo [Pendiente] legítimos | Para entrega |
| `OUTPUTS/academic/dist/memoria-final.md` | Versión final sin ningún comentario | Para entrega final |

## Comandos de cleanup

### Pipeline completo (recommended)
```bash
./scripts/memory-cleanup/run-all.sh
```
Genera `memoria-entregable.md` a partir de `memoria-combined.md` en 6 pasadas.

### Pasadas individuales (si necesitás debuggear)
```bash
./scripts/memory-cleanup/strip-agent-metadata.sh [input.md [output.md]]
./scripts/memory-cleanup/strip-calibration.sh [input.md [output.md]]
./scripts/memory-cleanup/strip-section-markers.sh [input.md [output.md]]
./scripts/memory-cleanup/strip-todo-blocks.sh [input.md [output.md]]
./scripts/memory-cleanup/normalize-pending.sh [input.md [output.md]]
./scripts/memory-cleanup/cleanup-blank-lines.sh [input.md [output.md]]
```

### Dry-run
```bash
./scripts/memory-cleanup/run-all.sh --dry-run
```
Muestra qué haría sin ejecutar nada.

### Input/output custom
```bash
./scripts/memory-cleanup/run-all.sh --input mi-borrador.md --output mi-entregable.md
```

## Qué hace cada pasada

| Script | Elimina |
|--------|---------|
| `strip-agent-metadata.sh` | `*Borrador generado:`, `*Fuentes:`, `*ADRs fuente:`, `*Engram topic key:`, `*Extensión aproximada:`, líneas de metadato de autor/proyecto/tutor |
| `strip-calibration.sh` | `[CALIBRADO DESDE EJEMPLO 1/2]`, `> **Nota para revisión**:`, `> **Notas para...`, `> **Antipatrón...` |
| `strip-section-markers.sh` | `> **Borrador**`, `> **Sección...**`, `> *Estado*:`, `> ---` decorativos |
| `strip-todo-blocks.sh` | `> [TODO]`, `> [⚠️]`, `> [❌]`, `> [🔲]`, `> [✅]`, `> [INCONSISTENCIA]` |
| `normalize-pending.sh` | Convierte `[Pendiente: ...]` en `**[Pendiente]**: ...` (los LEGÍTIMOS se preservan) |
| `cleanup-blank-lines.sh` | Normaliza whitespace, colapsa líneas en blanco múltiples |

## Qué se PRESERVA

- `[Pendiente: ...]` legítimos — son contenido real que indica qué falta
- `[URL_REPOSITORIO_GITHUB]` — placeholder real pendiente del autor
- Contenido de las secciones (todo lo que no sea metadata editorial)
- Encabezados Markdown (`#`, `##`, `###`)
- Tablas, diagramas, código
- Vínculos a ADRs, specs y otros documentos del proyecto

## Flags del run-all.sh

| Flag | Qué hace |
|------|----------|
| `--input <file>` | Archivo de entrada (default: memoria-combined.md) |
| `--output <file>` | Archivo de salida (default: memoria-entregable.md) |
| `--dry-run` | Muestra pipeline sin ejecutar |
| `--keep-temp` | Conserva /tmp/memoria-cleanup-XXXXXX para debug |

## Workflow completo de cleanup

```
memoria-combined.md (working copy con comentarios)
         │
         ▼
   run-all.sh ──→ memoria-entregable.md (para mañana)
         │
         │ (si queda contenido por pulir)
         ▼
   Subagente por sección (memory-cleanup skill)
         │
         ▼
   memoria-final.md (para entrega de junio)
```

## Agregar secciones faltantes

Si una sección no existe aún (ej: `pruebas.md`, `conclusiones.md`), el pipeline la omite con aviso. Los scripts ASSUME que los archivos de sección individual ya existen en `OUTPUTS/academic/`.

Para regenerar `memoria-combined.md` desde las secciones individuales:
```bash
./scripts/build-academic-docx.sh --dry-run
```
Eso muestra qué secciones están disponibles y en qué orden.

## Troubleshooting

**El pipeline falla con "Script no encontrado"**
→ Aplicar `chmod +x scripts/memory-cleanup/*.sh`

**El archivo limpio está vacío**
→ El input puede tener encoding raro; probar con `file input.md` y `iconv`

**Quedan líneas de metadata de agente**
→ Ejecutar `strip-agent-metadata.sh` individualmente para ver qué patrones detectaron