# OUTPUTS/design-exports — Capturas y exports desde Stitch

> Binarios versionados en git: mockups, variantes y referencias visuales exportadas desde **Google Stitch**.
> Convención de nombres y política de actualización: [ADR-05](../../DECISIONS/ADR-05-stitch-design-source.md).

## Formatos

| Formato | Uso |
|---------|-----|
| **WebP** o **PNG** | Preferido para pantallas y componentes. |
| **PDF** | Opcional para anexos de memoria DAW o revisiones imprimibles. |

Comprimir imágenes razonablemente antes de commitear (evitar PNG sin optimizar de resolución excesiva).

## Nombres de archivo

Seguir exactamente el patrón del ADR-05:

`US-XX-short-slug__stitch-screen-label__YYYYMMDD.ext`

- Si varias revisiones el mismo día, usar sufijo `_r2`, `_r3`, etc. antes de la extensión, o cambiar la fecha si corresponde a otro día.

## Política de actualización

1. **Por defecto**: ante cambio relevante de diseño en Stitch, **añadir un archivo nuevo** (nueva fecha o `_rN`) y actualizar [design-source.md](../technical-docs/design-source.md).
2. **Reemplazar** un archivo existente conservando el mismo nombre solo si se anota en `design-source.md` el motivo y la fecha (caso excepcional).

Así se mantiene historial claro para tribunal y para comparar versiones.

## Privacidad y secretos

- Solo **datos ficticios** en capturas (nombres de residentes, DNI, datos clínicos reales prohibidos).
- No incluir **API keys**, tokens ni fragmentos de `.env` en exports ni en metadatos visibles.

## Git LFS

Si el tamaño total de esta carpeta crece de forma sostenida, valorar [Git LFS](https://git-lfs.com/) para imágenes/PDF y documentar la decisión en una actualización de ADR-05 o en un ADR posterior.

## Índice maestro

La tabla Stitch ↔ archivo local ↔ US/SPEC vive en [../technical-docs/design-source.md](../technical-docs/design-source.md).
