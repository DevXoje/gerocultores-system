<script setup lang="ts">
import { useAuthStore } from '@/business/auth/useAuthStore'
import { useRouter } from 'vue-router'

const store = useAuthStore()
const router = useRouter()

async function handleSignOut(): Promise<void> {
  await store.signOut()
  await router.push('/login')
}
</script>

<template>
  <div class="dashboard-page">
    <header class="dashboard-page__header">
      <h1 class="dashboard-page__title">Panel de control</h1>
      <div class="dashboard-page__user">
        <span class="dashboard-page__user-email">{{ store.user?.email }}</span>
        <button
          class="dashboard-page__signout"
          type="button"
          @click="handleSignOut"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
    <main class="dashboard-page__content">
      <p class="dashboard-page__placeholder">Bienvenido al sistema de gerocultores.</p>
    </main>
  </div>
</template>

<style scoped>
@reference "../style.css";

.dashboard-page {
  @apply min-h-screen flex flex-col bg-gray-50;
}

.dashboard-page__header {
  @apply flex items-center justify-between px-6 py-4 bg-white shadow-sm;
}

.dashboard-page__title {
  @apply text-xl font-semibold text-gray-900;
}

.dashboard-page__user {
  @apply flex items-center gap-4;
}

.dashboard-page__user-email {
  @apply text-sm text-gray-600;
}

.dashboard-page__signout {
  @apply text-sm font-medium text-red-600 hover:text-red-800 transition;
}

.dashboard-page__content {
  @apply flex-1 p-6;
}

.dashboard-page__placeholder {
  @apply text-gray-500 text-sm;
}
</style>
