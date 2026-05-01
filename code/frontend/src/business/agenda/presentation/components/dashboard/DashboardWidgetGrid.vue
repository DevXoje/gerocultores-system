<script setup lang="ts">
/**
 * DashboardWidgetGrid — responsive 3-card grid layout for the dashboard hub.
 *
 * Phase 5 task 5.1
 * Stitch reference: Caregiver Dashboard
 */
</script>

<template>
  <section class="widget-grid" aria-label="Resumen del panel">
    <slot />
  </section>
</template>

<style scoped>
@reference "#/style.css";

.widget-grid {
  @apply grid grid-cols-1 gap-4;
  /* Tablet: 2 columns */
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  /* Desktop: 3 columns */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
