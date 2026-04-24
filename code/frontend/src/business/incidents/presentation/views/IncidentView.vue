<!-- Stitch: projects/16168255182252500555 — New Incident Form - Serenity Care (US-06) -->
<!-- OUTPUTS/design-exports/US-06-incident__new-incident-form-serenity-care__20260328.png -->
<script setup lang="ts">
/**
 * IncidentView — Full-page view for registering a new incident.
 *
 * US-06: Registro de incidencia
 *
 * Architecture:
 *   - Wraps IncidenceForm component.
 *   - Fetches the residents list from the infrastructure layer via a local composable.
 *   - On successful submission → navigates back to dashboard.
 *   - On cancellation → navigates back.
 *   - preselectedResidenteId and preselectedTareaId come from optional route query params.
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import IncidenceForm from '../components/IncidenceForm.vue'
import { getResidentes } from '../../../residents/infrastructure/residentes.api'
import type { ResidenteDTO } from '../../../residents/domain/entities/residente.types'
import { DASHBOARD_ROUTES } from '@/views/route-names'

// ─── Router ──────────────────────────────────────────────────────────────────

const router = useRouter()
const route = useRoute()

// ─── Query params (optional pre-fill) ───────────────────────────────────────

const preselectedResidenteId = computed<string | undefined>(() => {
  const val = route.query.residenteId
  return typeof val === 'string' ? val : undefined
})

const preselectedTareaId = computed<string | null>(() => {
  const val = route.query.tareaId
  return typeof val === 'string' ? val : null
})

// ─── Residents list ──────────────────────────────────────────────────────────

const residents = ref<ResidenteDTO[]>([])
const loadingResidents = ref(false)
const residentsError = ref<string | null>(null)

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Error desconocido al cargar residentes'
}

async function fetchResidents(): Promise<void> {
  loadingResidents.value = true
  residentsError.value = null
  try {
    residents.value = await getResidentes()
  } catch (e: unknown) {
    residentsError.value = toErrorMessage(e)
  } finally {
    loadingResidents.value = false
  }
}

onMounted(() => {
  fetchResidents()
})

// ─── Handlers ────────────────────────────────────────────────────────────────

function onSubmitted(): void {
  router.push({ name: DASHBOARD_ROUTES.name })
}

function onCancelled(): void {
  router.back()
}
</script>

<template>
  <div class="incident-view">
    <!-- Header / back nav -->
    <header class="incident-view__header">
      <button type="button" class="incident-view__back-btn" @click="onCancelled">
        <span class="material-symbols-outlined incident-view__back-icon" aria-hidden="true">
          arrow_back
        </span>
        Volver
      </button>
      <h1 class="incident-view__title">Registrar Incidencia</h1>
    </header>

    <!-- Loading residents -->
    <div
      v-if="loadingResidents"
      class="incident-view__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="incident-view__spinner" aria-hidden="true" />
      <span>Cargando residentes…</span>
    </div>

    <!-- Residents load error -->
    <div v-else-if="residentsError" class="incident-view__error" role="alert">
      <span class="material-symbols-outlined incident-view__error-icon" aria-hidden="true">
        error
      </span>
      <p class="incident-view__error-msg">{{ residentsError }}</p>
      <button type="button" class="incident-view__retry-btn" @click="fetchResidents">
        Reintentar
      </button>
    </div>

    <!-- Form -->
    <main v-else class="incident-view__content" aria-label="Formulario de incidencia">
      <IncidenceForm
        :residents="residents"
        :preselected-residente-id="preselectedResidenteId"
        :preselected-tarea-id="preselectedTareaId"
        @submitted="onSubmitted"
        @cancelled="onCancelled"
      />
    </main>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

/* ─── Page shell ────────────────────────────────────────────────────────────── */
.incident-view {
  @apply min-h-screen flex flex-col;
  background-color: var(--color-surface);
}

/* ─── Header ─────────────────────────────────────────────────────────────────── */
.incident-view__header {
  @apply flex items-center gap-4 px-6 py-4;
  background-color: var(--color-surface-container-lowest);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.incident-view__back-btn {
  @apply inline-flex items-center gap-1 text-sm font-medium cursor-pointer border-none bg-transparent;
  color: var(--color-on-surface-variant);
  transition: color 0.15s ease;
  min-height: 44px;
  padding: 0 0.5rem;

  &:hover {
    color: var(--color-on-surface);
  }
}

.incident-view__back-icon {
  font-size: 1.25rem;
}

.incident-view__title {
  @apply text-lg font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

/* ─── Content ────────────────────────────────────────────────────────────────── */
.incident-view__content {
  @apply flex flex-col items-center px-4 py-8 flex-1;
}

/* ─── Loading ────────────────────────────────────────────────────────────────── */
.incident-view__loading {
  @apply flex items-center justify-center gap-3 py-16 text-sm;
  color: var(--color-on-surface-variant);
}

.incident-view__spinner {
  @apply inline-block h-5 w-5 rounded-full border-2 border-t-transparent;
  border-color: var(--color-primary);
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Error ──────────────────────────────────────────────────────────────────── */
.incident-view__error {
  @apply flex flex-col items-center gap-3 py-16 text-center;
}

.incident-view__error-icon {
  font-size: 2rem;
  color: var(--color-error);
}

.incident-view__error-msg {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.incident-view__retry-btn {
  @apply rounded-full px-4 py-2 text-sm font-medium cursor-pointer border-none;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
}
</style>
