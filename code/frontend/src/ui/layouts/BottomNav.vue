<script setup lang="ts">
import {
  HomeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import { DASHBOARD_ROUTES } from '@/business/dashboard/route-names'
import { TASKS_ROUTES } from '@/views/route-names'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'

defineProps<{
  isIncidenceOpen?: boolean
}>()

const emit = defineEmits<{
  openIncidence: []
  openMoreMenu: []
}>()

function handleOpenIncidence(): void {
  emit('openIncidence')
}

function handleOpenMoreMenu(): void {
  emit('openMoreMenu')
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Navegación principal">
    <RouterLink
      :to="{ name: DASHBOARD_ROUTES.name }"
      class="bottom-nav__item"
      active-class="bottom-nav__item--active"
    >
      <HomeIcon class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Inicio</span>
    </RouterLink>

    <RouterLink
      :to="{ name: TASKS_ROUTES.name }"
      class="bottom-nav__item"
      active-class="bottom-nav__item--active"
    >
      <CalendarDaysIcon class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Tareas</span>
    </RouterLink>

    <div class="bottom-nav__fab-slot">
      <button
        type="button"
        class="bottom-nav__fab"
        :class="{ 'bottom-nav__fab--active': isIncidenceOpen }"
        aria-label="Nueva incidencia"
        @click="handleOpenIncidence"
      >
        <PlusIcon class="bottom-nav__fab-icon" aria-hidden="true" />
      </button>
    </div>

    <RouterLink
      :to="{ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name }"
      class="bottom-nav__item"
      active-class="bottom-nav__item--active"
    >
      <UserGroupIcon class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Residentes</span>
    </RouterLink>

    <button
      type="button"
      class="bottom-nav__item bottom-nav__item--btn"
      aria-label="Más opciones"
      @click="handleOpenMoreMenu"
    >
      <EllipsisHorizontalIcon class="bottom-nav__icon" aria-hidden="true" />
      <span class="bottom-nav__label">Más</span>
    </button>
  </nav>
</template>

<style scoped>
@reference "#/style.css";

.bottom-nav {
  @apply fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around px-2;
  background: #fff;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow:
    0 -1px 0 rgba(0, 0, 0, 0.06),
    0 -4px 16px rgba(0, 0, 0, 0.06);
}

.bottom-nav__item {
  @apply flex flex-col items-center justify-center gap-0.5 flex-1 h-full border-none bg-transparent p-0 no-underline;
  color: #8fa3be;
  transition: color 0.15s ease;
  cursor: pointer;
  min-width: 0;
}

.bottom-nav__item--active,
.bottom-nav__item:hover {
  color: #1d4ed8;
}

.bottom-nav__item--btn {
  @apply flex flex-col items-center justify-center;
}

.bottom-nav__icon {
  @apply h-6 w-6 shrink-0;
}

.bottom-nav__label {
  @apply text-[10px] font-medium leading-none;
}

.bottom-nav__fab-slot {
  @apply relative flex flex-col items-center justify-end shrink-0;
  width: 72px;
  height: 64px;
}

.bottom-nav__fab {
  @apply absolute flex items-center justify-center rounded-full border-none p-0;
  width: 52px;
  height: 52px;
  bottom: 10px;
  background: #1d4ed8;
  box-shadow: 0 4px 16px rgba(29, 78, 216, 0.38);
  transition:
    background 0.15s ease,
    transform 0.15s ease;
  cursor: pointer;
}

.bottom-nav__fab:hover,
.bottom-nav__fab:active {
  background: #1e40af;
  transform: scale(0.96);
}

.bottom-nav__fab--active {
  background: #dc2626;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.38);
}

.bottom-nav__fab-icon {
  @apply h-6 w-6 text-white;
}

@media (min-width: 900px) {
  .bottom-nav {
    display: none;
  }
}
</style>
