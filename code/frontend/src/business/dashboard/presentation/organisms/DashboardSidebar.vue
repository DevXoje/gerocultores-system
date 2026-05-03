<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DASHBOARD_ROUTES } from '@/business/dashboard/route-names'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import { TURNO_ROUTES } from '@/business/turno/route-names'
import { TASKS_ROUTES } from '@/views/route-names'
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'
import AppBrandMark from '@/business/dashboard/presentation/molecules/AppBrandMark.vue'
import SidebarNavLink from '@/business/dashboard/presentation/molecules/SidebarNavLink.vue'
import SidebarUserProfile from '@/business/dashboard/presentation/molecules/SidebarUserProfile.vue'

const props = defineProps<{
  userName: string
  isIncidenceOpen?: boolean
}>()

const emit = defineEmits<{
  signOut: []
  openIncidence: []
}>()

const route = useRoute()

const navItems = [
  {
    label: 'Dashboard',
    to: { name: DASHBOARD_ROUTES.name },
    routeName: DASHBOARD_ROUTES.name,
    icon: Squares2X2Icon,
  },
  {
    label: 'Tareas',
    to: { name: TASKS_ROUTES.name },
    routeName: TASKS_ROUTES.name,
    icon: ClipboardDocumentListIcon,
  },
  {
    label: 'Residentes',
    to: { name: RESIDENTS_ROUTES.RESIDENTS_LIST.name },
    routeName: RESIDENTS_ROUTES.RESIDENTS_LIST.name,
    icon: UserGroupIcon,
  },
  {
    label: 'Turno',
    to: { name: TURNO_ROUTES.DETAIL.name },
    routeName: TURNO_ROUTES.DETAIL.name,
    icon: ClockIcon,
  },
] as const

function isActive(routeName: string): boolean {
  return route.name === routeName
}

function openIncidence(): void {
  emit('openIncidence')
}

const userInitials = computed(() => {
  const pieces = props.userName.split(/\s+/).filter(Boolean)
  return pieces
    .slice(0, 2)
    .map((piece) => piece.charAt(0).toUpperCase())
    .join('')
})
</script>

<template>
  <aside class="dashboard-sidebar">
    <AppBrandMark title="GeroCare" subtitle="Residencia" />

    <nav class="dashboard-sidebar__nav" aria-label="Navegación principal">
      <SidebarNavLink
        v-for="item in navItems"
        :key="item.routeName"
        :label="item.label"
        :icon="item.icon"
        :to="item.to"
        :is-active="isActive(item.routeName)"
      />

      <button
        type="button"
        class="dashboard-sidebar__incidence-btn"
        :class="{ 'dashboard-sidebar__incidence-btn--active': props.isIncidenceOpen }"
        @click="openIncidence"
      >
        <ExclamationTriangleIcon class="dashboard-sidebar__incidence-icon" aria-hidden="true" />
        <span>Incidencias</span>
      </button>
    </nav>

    <div class="dashboard-sidebar__footer">
      <SidebarUserProfile :user-name="userName" :initials="userInitials" job-title="Gerocultora" />
      <button type="button" class="dashboard-sidebar__signout" @click="emit('signOut')">
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>

<style scoped>
@reference "#/style.css";

.dashboard-sidebar {
  @apply flex h-full flex-col gap-8 rounded-[28px] px-5 py-6;
  background-color: #12213f;
  background-image:
    linear-gradient(180deg, rgba(18, 33, 63, 0.98) 0%, rgba(14, 26, 49, 0.98) 100%),
    radial-gradient(circle at top, rgba(108, 160, 255, 0.18), transparent 48%);
  color: #f2f6ff;
  box-shadow: 0 28px 50px rgba(20, 30, 56, 0.24);
}

.dashboard-sidebar__nav {
  @apply flex flex-1 flex-col gap-2;
}

.dashboard-sidebar__footer {
  @apply flex flex-col gap-4 border-t pt-5;
  border-color: rgba(255, 255, 255, 0.12);
}

.dashboard-sidebar__signout {
  @apply rounded-2xl border-none px-4 py-3 text-left text-sm font-medium;
  background-color: #22355c;
  color: #f2f6ff;
  transition: background-color 0.15s ease;
}

.dashboard-sidebar__signout:hover {
  background-color: #2b406c;
}

.dashboard-sidebar__incidence-btn {
  @apply flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium border-none cursor-pointer;
  color: rgba(247, 251, 255, 0.78);
  background-color: transparent;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.dashboard-sidebar__incidence-btn:hover {
  background-color: #22355c;
  color: #f2f6ff;
  transform: translateX(1px);
}

.dashboard-sidebar__incidence-btn--active {
  background-color: #24488f;
  color: #f2f6ff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.dashboard-sidebar__incidence-icon {
  @apply h-5 w-5 shrink-0;
}
</style>
