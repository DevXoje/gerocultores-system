# ADR-09 — Reorganización de componentes: `components` → `ui` + Atomic Design

- **Estado**: ACCEPTED
- **Fecha**: 2026-05-01
- **Contexto**: La carpeta `src/components` es un cajón de sastre que mezcla UI genérica con componentes de dominio específico. Se busca alinearla con la arquitectura DDD ya establecida en `business/` y adoptar Atomic Design para la capa UI.

## Contexto

La estructura actual de `src/` es:

```
src/
├── components/          # ← Problema: mix de responsabilidades
│   ├── TaskCard/        # belongs to agenda domain
│   ├── dialogs/         # generic UI, should be in ui/
│   └── OfflineBanner.vue # generic UI atom
├── business/            # ✓ DDD por bounded context
│   └── agenda/
│       ├── domain/
│       ├── application/
│       └── presentation/components/  # ya existe, correcto
├── composables/
├── views/
└── infrastructure/
```

**Problemas detectados:**
1. `components/TaskCard/` debería vivir en `business/agenda/presentation/components/TaskCard` — está acoplado al dominio agenda
2. `components/dialogs/AppDialog.vue` y `OfflineBanner.vue` son UI genérica, no dominio-específicos — belong en una capa UI compartida
3. `components/` no tiene organización interna — todo vive plano

## Opciones consideradas

### Opción A — Renombrar `components` → `ui` y clasificar con Atomic Design

```
src/
├── ui/                   # ← Capa UI compartida (antes components/)
│   ├── atoms/            # Button, Badge, Icon, OfflineBanner, Input
│   ├── molecules/        # AppDialog, SearchBar, FormField
│   └── organisms/       # compositions de atoms+molecules
├── business/             # DDD — lógica de dominio
│   └── {bc}/
│       ├── domain/
│       ├── application/
│       └── presentation/
│           └── components/  # Componentes DE dominio específico
```

**Pro:** Separación clara entre UI genérica y componentes de dominio. Atomic Design дает jerarquía visual clara.
**Contra:** Requiere mover archivos y actualizar imports.

### Opción B — Mover TODO a `business/` y eliminar `components/`

```
src/
├── business/
│   ├── agenda/presentation/components/TaskCard/
│   └── shared/presentation/  # UI compartida (atoms, molecules)
```

**Contra:** Profundiza la estructura. `shared` también es un cajón de sastre. Atomic Design necesita un home explícito.

### Opción C — Dejar `components/` como `ui/` sin Atomic Design

Solo renombrar sin categorizar internamente.

**Contra:** No resuelve el problema de organización. El nombre `ui` ayuda pero no estructura.

## Decisión

**Opción A** — Renombrar `components` → `ui` con clasificación Atomic Design.

**Reglas de clasificación:**

| Componente | Destino | Razón |
|------------|---------|-------|
| `OfflineBanner.vue` | `ui/atoms/` | UI primitiva, sin dominio, reutilizable |
| `AppDialog.vue` | `ui/molecules/` | Composición UI genérica |
| `TaskCard/` | `business/agenda/presentation/components/TaskCard` | Depende de dominio (`TareaResponse`, estados) |

**Regla general:**
- Si un componente necesita imports de `domain/` → pertenece a `business/{bc}/presentation/components/`
- Si es UI pura reutilizable sin dependencia de dominio → `ui/atoms` o `ui/molecules`

## Consecuencias

- **Positivo:** Arquitectura consistente con DDD + Atomic Design. Cada cosa en su lugar.
- **Positivo:** `TaskCard` ya tiene `business/agenda/presentation/` como destino natural
- **Negativo:** Migration de imports (TaskCard se mueve, AppDialog se renombra a `ui/molecules/AppDialog.vue`)
- **Pendiente:** Clasificar los `components/` restantes de cada bounded context cuando se creen

## Referencias

- `code/frontend/AGENTS.md` — Arquitectura DDD (sección 3)
- `SPEC/entities.md` — entidades de dominio
- ADR-01b — Stack Vue 3 + Vite + Tailwind