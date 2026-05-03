<script setup lang="ts">
defineProps<{
  label: string
  meta?: string | null
}>()
</script>

<template>
  <div class="turno-status-card">
    <span class="turno-status-card__icon" aria-hidden="true">☼</span>
    <div class="turno-status-card__copy">
      <p class="turno-status-card__label">{{ label }}</p>
      <p v-if="meta" class="turno-status-card__meta">{{ meta }}</p>
    </div>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.turno-status-card {
  @apply flex items-center gap-3 rounded-2xl px-4 py-3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 255, 0.88));
}

.turno-status-card__icon {
  @apply flex h-11 w-11 items-center justify-center rounded-2xl text-xl;
  background-color: rgba(77, 132, 255, 0.12);
}

.turno-status-card__copy {
  @apply flex flex-col;
}

.turno-status-card__label {
  @apply text-sm font-semibold;
  color: #24488f;
}

.turno-status-card__meta {
  @apply text-sm;
  color: #6d7690;
}
</style>
