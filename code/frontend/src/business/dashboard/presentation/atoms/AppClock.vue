<script setup lang="ts">
defineProps<{
  formattedDate: string
  formattedTime: string
}>()
</script>

<template>
  <div class="app-clock">
    <p class="app-clock__date">{{ formattedDate }}</p>
    <p class="app-clock__time">{{ formattedTime }}</p>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.app-clock {
  @apply flex flex-col;
}

.app-clock__date {
  @apply text-sm;
  color: #6d7690;
}

.app-clock__time {
  @apply text-4xl font-semibold leading-none;
  color: #1b2437;
  font-variant-numeric: tabular-nums;
}
</style>
