<!-- Stitch: projects/16168255182252500555 — Resident Detail - Eleanor Vance (US-05) -->
<!-- Export: OUTPUTS/design-exports/US-05-resident-detail__resident-detail-eleanor-vance__20260328.png -->
<script setup lang="ts">
/**
 * ResidenteView — Detail view for a single resident.
 *
 * Shows name, photo, room, age, medical info, and care notes.
 * Fetches from GET /api/residentes/:id via useResidente().
 *
 * US-05: Consulta de ficha de residente
 */
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResidente } from '@/business/residents/presentation/composables/useResidente'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'

const route = useRoute()
const router = useRouter()
const { residente, loading, error, fetchResidente } = useResidente()

const residenteId = computed<string>(() => route.params.id as string)

onMounted(() => {
  fetchResidente(residenteId.value)
})

function goBack(): void {
  router.back()
}

/**
 * Calculates age in years from an ISO 8601 date string.
 */
function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mesActual = hoy.getMonth()
  const mesNacimiento = nacimiento.getMonth()
  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
  ) {
    edad -= 1
  }
  return edad
}

/**
 * Formats an ISO 8601 date string to a short localized date.
 */
function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="residente-view">
    <!-- Back navigation -->
    <div class="residente-view__nav">
      <button type="button" class="residente-view__back-btn" @click="goBack">
        <span class="residente-view__back-icon" aria-hidden="true">←</span>
        Volver a residentes
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="residente-view__error" role="alert">
      <span class="residente-view__error-icon" aria-hidden="true">⚠</span>
      <span class="residente-view__error-message">{{ error }}</span>
      <button type="button" class="residente-view__retry-btn" @click="fetchResidente(residenteId)">
        Reintentar
      </button>
    </div>

    <!-- Loading skeleton -->
    <div
      v-else-if="loading"
      class="residente-view__skeleton"
      aria-busy="true"
      aria-label="Cargando ficha del residente"
    >
      <div class="residente-view__skeleton-header">
        <div class="residente-view__skeleton-avatar" />
        <div class="residente-view__skeleton-info">
          <div class="residente-view__skeleton-line residente-view__skeleton-line--wide" />
          <div class="residente-view__skeleton-line residente-view__skeleton-line--medium" />
          <div class="residente-view__skeleton-line residente-view__skeleton-line--narrow" />
        </div>
      </div>
      <div class="residente-view__skeleton-body">
        <template v-for="n in 4" :key="n">
          <div class="residente-view__skeleton-card">
            <div class="residente-view__skeleton-line residente-view__skeleton-line--narrow" />
            <div class="residente-view__skeleton-line residente-view__skeleton-line--wide" />
            <div class="residente-view__skeleton-line residente-view__skeleton-line--medium" />
          </div>
        </template>
      </div>
    </div>

    <!-- Resident detail -->
    <div v-else-if="residente" class="residente-view__content">
      <!-- Profile header -->
      <header class="residente-view__header">
        <div class="residente-view__avatar-wrapper">
          <img
            v-if="residente.foto"
            :src="residente.foto"
            :alt="`Foto de ${residente.nombre} ${residente.apellidos}`"
            class="residente-view__avatar"
          />
          <div v-else class="residente-view__avatar-placeholder" aria-hidden="true">
            <span class="residente-view__avatar-initials">
              {{ residente.nombre.charAt(0) }}{{ residente.apellidos.charAt(0) }}
            </span>
          </div>
        </div>

        <div class="residente-view__identity">
          <h1 class="residente-view__name">{{ residente.nombre }} {{ residente.apellidos }}</h1>
          <div class="residente-view__meta">
            <span class="residente-view__meta-item">
              <span class="residente-view__meta-icon" aria-hidden="true">🏠</span>
              Habitación {{ residente.habitacion }}
            </span>
            <span class="residente-view__meta-item">
              <span class="residente-view__meta-icon" aria-hidden="true">🎂</span>
              {{ calcularEdad(residente.fechaNacimiento) }} años ({{
                formatFecha(residente.fechaNacimiento)
              }})
            </span>
          </div>
          <span
            class="residente-view__badge"
            :class="
              residente.archivado
                ? 'residente-view__badge--archivado'
                : 'residente-view__badge--activo'
            "
          >
            {{ residente.archivado ? 'Archivado' : 'Activo' }}
          </span>
        </div>
      </header>

      <!-- Medical info grid -->
      <section class="residente-view__section" aria-labelledby="residente-medica-titulo">
        <h2 id="residente-medica-titulo" class="residente-view__section-title">
          Información médica
        </h2>

        <div class="residente-view__grid">
          <!-- Diagnostics -->
          <div class="residente-view__card">
            <h3 class="residente-view__card-label">Diagnósticos</h3>
            <p class="residente-view__card-value">
              {{ residente.diagnosticos ?? 'Sin información registrada.' }}
            </p>
          </div>

          <!-- Allergies -->
          <div class="residente-view__card">
            <h3 class="residente-view__card-label">Alergias</h3>
            <p class="residente-view__card-value">
              {{ residente.alergias ?? 'Sin alergias conocidas.' }}
            </p>
          </div>

          <!-- Medication -->
          <div class="residente-view__card residente-view__card--full">
            <h3 class="residente-view__card-label">Medicación activa</h3>
            <p class="residente-view__card-value">
              {{ residente.medicacion ?? 'Sin medicación activa registrada.' }}
            </p>
          </div>

          <!-- Preferences / care notes -->
          <div class="residente-view__card residente-view__card--full">
            <h3 class="residente-view__card-label">Preferencias y observaciones</h3>
            <p class="residente-view__card-value">
              {{ residente.preferencias ?? 'Sin preferencias registradas.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Quick links — US-05 CA-5 -->
      <section class="residente-view__section" aria-labelledby="residente-acciones-titulo">
        <h2 id="residente-acciones-titulo" class="residente-view__section-title">
          Acciones rápidas
        </h2>
        <div class="residente-view__quick-links">
          <RouterLink
            :to="{ name: RESIDENTS_ROUTES.RESIDENTE_INCIDENCIAS.name, params: { id: residenteId } }"
            class="residente-view__quick-link"
          >
            <span class="residente-view__quick-link-icon" aria-hidden="true">📋</span>
            <span class="residente-view__quick-link-label">Ver historial de incidencias</span>
            <span class="residente-view__quick-link-arrow" aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </section>

      <!-- Record metadata -->
      <footer class="residente-view__footer">
        <span class="residente-view__meta-item">
          Creado: {{ formatFecha(residente.creadoEn) }}
        </span>
        <span class="residente-view__meta-item">
          Actualizado: {{ formatFecha(residente.actualizadoEn) }}
        </span>
      </footer>
    </div>

    <!-- Empty state (should not happen normally) -->
    <div v-else class="residente-view__empty">No se encontró información para este residente.</div>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

/* ── Root ───────────────────────────────────────────────────────────────── */
.residente-view {
  @apply max-w-4xl mx-auto px-4 py-6 min-h-screen;
}

/* ── Navigation ─────────────────────────────────────────────────────────── */
.residente-view__nav {
  @apply mb-6;
}

.residente-view__back-btn {
  @apply inline-flex items-center gap-2 text-sm font-medium text-gray-600
    hover:text-gray-900 transition-colors;
}

.residente-view__back-icon {
  @apply text-base;
}

/* ── Error ──────────────────────────────────────────────────────────────── */
.residente-view__error {
  @apply flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200
    text-red-800;
}

.residente-view__error-icon {
  @apply text-lg flex-shrink-0;
}

.residente-view__error-message {
  @apply flex-1 text-sm;
}

.residente-view__retry-btn {
  @apply text-sm font-medium underline hover:no-underline;
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
.residente-view__skeleton {
  @apply space-y-6;
}

.residente-view__skeleton-header {
  @apply flex items-start gap-4;
}

.residente-view__skeleton-avatar {
  @apply w-24 h-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0;
}

.residente-view__skeleton-info {
  @apply flex-1 space-y-2 pt-2;
}

.residente-view__skeleton-line {
  @apply h-4 rounded bg-gray-200 animate-pulse;
}

.residente-view__skeleton-line--wide {
  @apply w-3/4;
}

.residente-view__skeleton-line--medium {
  @apply w-1/2;
}

.residente-view__skeleton-line--narrow {
  @apply w-1/4;
}

.residente-view__skeleton-body {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.residente-view__skeleton-card {
  @apply p-4 rounded-lg border border-gray-100 space-y-2;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.residente-view__header {
  @apply flex items-start gap-6 mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100;
}

.residente-view__avatar-wrapper {
  @apply flex-shrink-0;
}

.residente-view__avatar {
  @apply w-24 h-24 rounded-full object-cover border-2 border-gray-200;
}

.residente-view__avatar-placeholder {
  @apply w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center
    border-2 border-indigo-200;
}

.residente-view__avatar-initials {
  @apply text-2xl font-semibold text-indigo-700 select-none;
}

.residente-view__identity {
  @apply flex-1 min-w-0;
}

.residente-view__name {
  @apply text-2xl font-bold text-gray-900 mb-2 leading-tight;
}

.residente-view__meta {
  @apply flex flex-wrap gap-4 mb-3;
}

.residente-view__meta-item {
  @apply inline-flex items-center gap-1.5 text-sm text-gray-600;
}

.residente-view__meta-icon {
  @apply text-base;
}

.residente-view__badge {
  @apply inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold;
}

.residente-view__badge--activo {
  @apply bg-green-100 text-green-800;
}

.residente-view__badge--archivado {
  @apply bg-gray-100 text-gray-600;
}

/* ── Section ────────────────────────────────────────────────────────────── */
.residente-view__section {
  @apply mb-8;
}

.residente-view__section-title {
  @apply text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200;
}

/* ── Grid / Cards ───────────────────────────────────────────────────────── */
.residente-view__grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.residente-view__card {
  @apply p-4 bg-white rounded-lg border border-gray-100 shadow-sm;
}

.residente-view__card--full {
  @apply sm:col-span-2;
}

.residente-view__card-label {
  @apply text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5;
}

.residente-view__card-value {
  @apply text-sm text-gray-800 leading-relaxed whitespace-pre-wrap;
}

/* ── Quick Links ────────────────────────────────────────────────────────── */
.residente-view__quick-links {
  @apply flex flex-col gap-2;
}

.residente-view__quick-link {
  @apply inline-flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100
    shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200
    transition-colors no-underline w-full sm:w-auto;
}

.residente-view__quick-link-icon {
  @apply text-base flex-shrink-0;
}

.residente-view__quick-link-label {
  @apply flex-1;
}

.residente-view__quick-link-arrow {
  @apply text-indigo-400 text-base flex-shrink-0;
}

/* ── Footer ─────────────────────────────────────────────────────────────── */
.residente-view__footer {
  @apply flex flex-wrap gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100;
}

/* ── Empty ──────────────────────────────────────────────────────────────── */
.residente-view__empty {
  @apply text-center py-16 text-gray-500 text-sm;
}
</style>
