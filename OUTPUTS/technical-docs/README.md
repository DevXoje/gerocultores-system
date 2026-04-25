# OUTPUTS/technical-docs — Documentación técnica

> README del proyecto, documentación de API, guía de despliegue.
> Generados por el Writer a partir de SPEC/ y DECISIONS/.

- **Diseño (Stitch ↔ repo)**: [design-source.md](design-source.md)

Pendiente de generación tras Fase 5 (stack definido) para el resto de artefactos técnicos.

---

## Audit Log — Lighthouse Performance

| Fecha | URL | Device | Score | LCP | TBT | CLS | Veredicto | Archivo |
|-------|-----|--------|-------|-----|-----|-----|-----------|---------|
| 2026-04-25 | https://gero-care--staging-o2g72gqa.web.app (staging) | Desktop | 60/100 | 3.9s ❌ | 0ms ✅ | 0 ✅ | **RNF-02 FAIL / RNF-04 PASS** | [lighthouse-performance-summary-2026-04-25.json](lighthouse-performance-summary-2026-04-25.json) |

### T-68 — Análisis (2026-04-25)

**Culpable principal**: Material Symbols Outlined (Google Fonts CDN) — **3,834 KB de transfer size** en una sola fuente tipográfica. Este recurso de fuente bloquea el render y causa LCP = 3.9s.

**Top 3 oportunidades de mejora**:
1. 🏆 **Reemplazar Material Symbols Outlined** por una librería de iconos más ligera (Heroicons, Phosphor) o usar un subset de fuente alojada localmente → ahorro estimado ~3.8 MB, reducción LCP a < 1.5s
2. **Cache headers para assets estáticos** — Firebase Hosting no aplica cache largo por defecto en algunos assets; configurar `cache-control: max-age=31536000` para JS/CSS/fonts versionados
3. **Tree-shaking del bundle JS** — `index-97dsNQv8.js` contiene ~94 KB de JS no utilizado (importaciones no usadas o dependencias no eliminadas en build)
