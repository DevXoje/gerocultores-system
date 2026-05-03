<script setup lang="ts">
/**
 * AuthLayout.vue — Layout wrapper for unauthenticated routes (login, register).
 *
 * Intentionally minimal: no shell chrome, no notification polling.
 * Injected by the router for routes under the auth group.
 */
</script>

<template>
  <RouterView />
</template>
