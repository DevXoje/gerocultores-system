<script setup lang="ts">
/**
 * AppShell.vue — Shared authenticated shell (navigation + page outlet wrapper).
 *
 * Reused by MainLayout so every protected route shares the same navigation frame.
 */
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'
import DashboardSidebar from '@/business/dashboard/presentation/organisms/DashboardSidebar.vue'
import AppBrandMark from '@/business/dashboard/presentation/molecules/AppBrandMark.vue'
import BottomNav from '@/ui/layouts/BottomNav.vue'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import IncidenceFormModal from '@/business/incidents/presentation/components/IncidenceFormModal.vue'
import { useCreateIncidenceModal } from '@/business/incidents/presentation/composables/useCreateIncidenceModal'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const isMobileNavOpen = ref(false)

const { showCreateIncidentModal, openIncidenceModal, closeIncidenceModal } =
  useCreateIncidenceModal()

const userName = computed(() => auth.user?.displayName ?? auth.user?.email ?? 'Cuidador/a')
const isIncidenceOpen = computed(() => showCreateIncidentModal.value)

watch(
  () => route.fullPath,
  () => {
    isMobileNavOpen.value = false
  }
)

async function handleSignOut(): Promise<void> {
  await auth.signOut()
  await router.push({ name: AUTH_ROUTES.LOGIN.name })
}

async function handleOpenIncidence(): Promise<void> {
  openIncidenceModal()
}

function handleOpenMobileNav(): void {
  isMobileNavOpen.value = true
}

function handleCloseMobileNav(): void {
  isMobileNavOpen.value = false
}
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__mobile-topbar">
      <button
        type="button"
        class="app-shell__mobile-toggle"
        aria-label="Abrir navegación principal"
        @click="handleOpenMobileNav"
      >
        <Bars3Icon class="app-shell__mobile-toggle-icon" aria-hidden="true" />
      </button>

      <AppBrandMark title="GeroCare" subtitle="Residencia" tone="light" />

      <div class="app-shell__mobile-actions">
        <slot name="header-actions" />
      </div>
    </header>

    <div
      class="app-shell__mobile-overlay"
      :class="{ 'app-shell__mobile-overlay--open': isMobileNavOpen }"
    >
      <button
        type="button"
        class="app-shell__mobile-backdrop"
        aria-label="Cerrar navegación principal"
        @click="handleCloseMobileNav"
      />

      <div class="app-shell__mobile-drawer">
        <button
          type="button"
          class="app-shell__mobile-close"
          aria-label="Cerrar navegación principal"
          @click="handleCloseMobileNav"
        >
          <XMarkIcon class="app-shell__mobile-close-icon" aria-hidden="true" />
        </button>

        <DashboardSidebar
          :user-name="userName"
          :is-incidence-open="isIncidenceOpen"
          @open-incidence="handleOpenIncidence"
          @sign-out="handleSignOut"
        />
      </div>
    </div>

    <aside class="app-shell__desktop-sidebar">
      <DashboardSidebar
        :user-name="userName"
        :is-incidence-open="isIncidenceOpen"
        @open-incidence="handleOpenIncidence"
        @sign-out="handleSignOut"
      />
    </aside>

    <div class="app-shell__content">
      <slot />
    </div>

    <BottomNav
      :is-incidence-open="isIncidenceOpen"
      @open-incidence="handleOpenIncidence"
      @open-more-menu="handleOpenMobileNav"
    />

    <IncidenceFormModal v-model="showCreateIncidentModal" @close="closeIncidenceModal" />
  </div>
</template>

<style scoped>
@reference "#/style.css";

.app-shell {
  @apply grid min-h-screen gap-5;
  grid-template-columns: minmax(0, 1fr);
}

.app-shell__mobile-topbar {
  @apply sticky top-0 z-30 flex items-center justify-between gap-3 px-4 pt-4;
}

.app-shell__mobile-toggle,
.app-shell__mobile-close {
  @apply flex h-11 w-11 items-center justify-center rounded-2xl border-none p-0;
  background: rgba(255, 255, 255, 0.92);
  color: #1b2437;
  box-shadow: 0 12px 24px rgba(215, 223, 240, 0.22);
}

.app-shell__mobile-toggle-icon,
.app-shell__mobile-close-icon {
  @apply h-6 w-6;
}

.app-shell__mobile-actions {
  @apply flex items-center justify-end;
}

.app-shell__mobile-overlay {
  @apply pointer-events-none fixed inset-0 z-50;
}

.app-shell__mobile-overlay--open {
  @apply pointer-events-auto;
}

.app-shell__mobile-backdrop {
  @apply absolute inset-0 border-none p-0 opacity-0;
  background: rgba(15, 23, 42, 0.36);
  transition: opacity 0.2s ease;
}

.app-shell__mobile-overlay--open .app-shell__mobile-backdrop {
  @apply opacity-100;
}

.app-shell__mobile-drawer {
  @apply absolute left-0 top-0 h-full w-[min(320px,calc(100vw-2rem))] max-w-full p-4;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}

.app-shell__mobile-overlay--open .app-shell__mobile-drawer {
  transform: translateX(0);
}

.app-shell__mobile-close {
  @apply absolute right-8 top-8 z-10;
}

.app-shell__desktop-sidebar {
  display: none;
}

.app-shell__content {
  @apply min-w-0 pb-24;
}

@media (min-width: 900px) {
  .app-shell {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  .app-shell__mobile-topbar,
  .app-shell__mobile-overlay {
    display: none;
  }

  .app-shell__desktop-sidebar {
    display: block;
  }

  .app-shell__content {
    @apply pb-0;
  }
}
</style>
