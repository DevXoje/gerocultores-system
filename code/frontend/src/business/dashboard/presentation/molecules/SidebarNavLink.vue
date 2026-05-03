<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{
  label: string
  icon: Component
  to: RouteLocationRaw
  isActive: boolean
}>()
</script>

<template>
  <RouterLink :to="to" class="sidebar-nav-link" :class="{ 'sidebar-nav-link--active': isActive }">
    <component :is="icon" class="sidebar-nav-link__icon" aria-hidden="true" />
    <span>{{ label }}</span>
  </RouterLink>
</template>

<style scoped>
@reference "#/style.css";

.sidebar-nav-link {
  @apply flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium no-underline;
  color: rgba(247, 251, 255, 0.78);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.sidebar-nav-link:hover {
  background-color: #22355c;
  color: #f2f6ff;
  transform: translateX(1px);
}

.sidebar-nav-link--active {
  background-color: #24488f;
  color: #f2f6ff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.sidebar-nav-link__icon {
  @apply h-5 w-5 shrink-0;
}
</style>
