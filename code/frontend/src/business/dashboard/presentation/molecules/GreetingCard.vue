<script setup lang="ts">
defineProps<{
  greeting: string
  subtitle: string
}>()
</script>

<template>
  <div class="greeting-card">
    <span class="greeting-card__icon" aria-hidden="true">☀</span>
    <div class="greeting-card__copy">
      <h1 class="greeting-card__title">{{ greeting }}</h1>
      <p class="greeting-card__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.greeting-card {
  @apply flex items-center gap-3 rounded-2xl px-4 py-3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 255, 0.88));
}

.greeting-card__icon {
  @apply flex h-11 w-11 items-center justify-center rounded-2xl text-xl;
  background-color: rgba(255, 176, 32, 0.12);
}

.greeting-card__copy {
  @apply flex flex-col;
}

.greeting-card__title {
  @apply text-2xl font-semibold;
  color: #1b2437;
}

.greeting-card__subtitle {
  @apply text-sm;
  color: #6d7690;
}
</style>
