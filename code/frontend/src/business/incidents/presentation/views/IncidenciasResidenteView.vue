<!-- Stitch: projects/16168255182252500555 — Incidents Log - Serenity Care (US-07) -->
<script setup lang="ts">
/**
 * IncidenciasResidenteView — Incident history for a single resident.
 *
 * Placeholder view for US-07: Historial de incidencias de un residente.
 * Full implementation is pending per the backlog.
 *
 * US-07: Historial de incidencias de un residente
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const residenteId = computed<string>(() => route.params.id as string)

function goBack(): void {
  router.back()
}
</script>

<template>
  <div class="incidencias-residente-view">
    <!-- Back navigation -->
    <div class="incidencias-residente-view__nav">
      <button type="button" class="incidencias-residente-view__back-btn" @click="goBack">
        <span class="incidencias-residente-view__back-icon" aria-hidden="true">←</span>
        Volver a la ficha
      </button>
    </div>

    <!-- Placeholder content -->
    <div class="incidencias-residente-view__placeholder">
      <span class="incidencias-residente-view__placeholder-icon" aria-hidden="true">📋</span>
      <h1 class="incidencias-residente-view__title">Historial de incidencias</h1>
      <p class="incidencias-residente-view__subtitle">
        Residente ID: <code class="incidencias-residente-view__code">{{ residenteId }}</code>
      </p>
      <p class="incidencias-residente-view__note">
        Funcionalidad en desarrollo — US-07
      </p>
    </div>
  </div>
</template>

<style scoped>
@reference "../../../../style.css";

/* ── Root ───────────────────────────────────────────────────────────────── */
.incidencias-residente-view {
  @apply max-w-4xl mx-auto px-4 py-6 min-h-screen;
}

/* ── Navigation ─────────────────────────────────────────────────────────── */
.incidencias-residente-view__nav {
  @apply mb-6;
}

.incidencias-residente-view__back-btn {
  @apply inline-flex items-center gap-2 text-sm font-medium text-gray-600
    hover:text-gray-900 transition-colors;
}

.incidencias-residente-view__back-icon {
  @apply text-base;
}

/* ── Placeholder ────────────────────────────────────────────────────────── */
.incidencias-residente-view__placeholder {
  @apply flex flex-col items-center justify-center py-20 gap-4 text-center;
}

.incidencias-residente-view__placeholder-icon {
  @apply text-5xl;
}

.incidencias-residente-view__title {
  @apply text-2xl font-bold text-gray-900;
}

.incidencias-residente-view__subtitle {
  @apply text-sm text-gray-600;
}

.incidencias-residente-view__code {
  @apply font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-700;
}

.incidencias-residente-view__note {
  @apply text-xs text-gray-400 mt-2;
}
</style>
