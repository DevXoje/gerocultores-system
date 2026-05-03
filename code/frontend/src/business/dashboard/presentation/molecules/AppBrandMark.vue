<script setup lang="ts">
import { HomeIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title: string
  subtitle: string
  tone?: 'dark' | 'light'
}>()
</script>

<template>
  <div class="app-brand-mark" :class="{ 'app-brand-mark--light': tone === 'light' }">
    <div class="app-brand-mark__icon-wrap">
      <HomeIcon class="app-brand-mark__icon" aria-hidden="true" />
    </div>
    <div class="app-brand-mark__copy">
      <span class="app-brand-mark__title">{{ title }}</span>
      <span class="app-brand-mark__subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.app-brand-mark {
  @apply flex items-center gap-3;
}

.app-brand-mark__icon-wrap {
  @apply flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl;
  background: linear-gradient(135deg, #69d2b0 0%, #4f8cff 100%);
}

.app-brand-mark__icon {
  @apply h-6 w-6;
  color: #0f2344;
}

.app-brand-mark__copy {
  @apply flex flex-col;
}

.app-brand-mark__title {
  @apply text-lg font-semibold;
}

.app-brand-mark__subtitle {
  @apply text-sm;
  color: rgba(247, 251, 255, 0.75);
}

.app-brand-mark--light .app-brand-mark__title {
  color: #1b2437;
}

.app-brand-mark--light .app-brand-mark__subtitle {
  color: #6d7690;
}
</style>
