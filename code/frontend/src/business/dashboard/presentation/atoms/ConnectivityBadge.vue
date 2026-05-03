<script setup lang="ts">
defineProps<{
  isOnline: boolean
}>()
</script>

<template>
  <div
    class="connectivity-badge"
    :class="{ 'connectivity-badge--online': isOnline }"
    :aria-label="isOnline ? 'Conectado' : 'Sin conexión'"
  >
    <span class="connectivity-badge__dot" aria-hidden="true" />
    <span class="connectivity-badge__label">{{ isOnline ? 'Conectado' : 'Sin conexión' }}</span>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.connectivity-badge {
  @apply inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium;
  background-color: #dfe5ef;
  color: #37445f;
}

.connectivity-badge--online {
  background-color: #d9efdf;
  color: #0f5a2c;
}

.connectivity-badge__dot {
  @apply h-2.5 w-2.5 rounded-full;
  background-color: currentColor;
}
</style>
