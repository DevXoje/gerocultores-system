<script setup lang="ts">
defineProps<{
  initials: string
}>()
</script>

<template>
  <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
</template>

<style scoped>
@reference "#/style.css";

.user-avatar {
  @apply flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold;
  background: rgba(255, 255, 255, 0.16);
}
</style>
