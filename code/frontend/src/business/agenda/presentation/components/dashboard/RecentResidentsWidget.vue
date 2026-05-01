<script setup lang="ts">
/**
 * RecentResidentsWidget — list of 3 resident names + "Ver todos" link.
 *
 * Phase 5 task 5.4
 * Uses existing useResidentes composable, shows top 3 by creation date.
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResidentes } from '@/business/residents/application/useResidentes'
import { RESIDENTS_ROUTES } from '@/business/residents/route-names'
import { UsersIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { residentes, isLoading, fetchResidentes } = useResidentes()

onMounted(() => {
  fetchResidentes()
})

// Top 3 most recently created residents (sorted by creadoEn desc)
const recentResidents = computed(() =>
  [...residentes.value]
    .sort((a, b) => {
      const dateA = a.creadoEn instanceof Date ? a.creadoEn : new Date(a.creadoEn)
      const dateB = b.creadoEn instanceof Date ? b.creadoEn : new Date(b.creadoEn)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 3)
)

function handleVerTodos(): void {
  router.push({ name: RESIDENTS_ROUTES.RESIDENTS_LIST.name })
}

function handleResidentClick(residenteId: string): void {
  router.push({
    name: RESIDENTS_ROUTES.RESIDENTE_DETAIL.name,
    params: { id: residenteId },
  })
}
</script>

<template>
  <article class="residents-widget">
    <header class="residents-widget__header">
      <UsersIcon class="residents-widget__icon" aria-hidden="true" />
      <h3 class="residents-widget__title">Residentes recientes</h3>
    </header>

    <div class="residents-widget__body">
      <p v-if="isLoading" class="residents-widget__status">Cargando...</p>
      <template v-else-if="recentResidents.length > 0">
        <ul class="residents-widget__list" aria-label="Lista de residentes">
          <li
            v-for="residente in recentResidents"
            :key="residente.id"
            class="residents-widget__item"
          >
            <button
              type="button"
              class="residents-widget__resident-btn"
              @click="handleResidentClick(residente.id)"
            >
              {{ residente.nombre }}
            </button>
          </li>
        </ul>
      </template>
      <p v-else class="residents-widget__status residents-widget__status--empty">
        Sin residentes registrados
      </p>
    </div>

    <footer class="residents-widget__footer">
      <button type="button" class="residents-widget__link" @click="handleVerTodos">
        Ver todos
      </button>
    </footer>
  </article>
</template>

<style scoped>
@reference "#/style.css";

.residents-widget {
  @apply flex flex-col gap-3 p-5 rounded-2xl;
  background-color: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
}

.residents-widget__header {
  @apply flex items-center gap-2;
}

.residents-widget__icon {
  @apply w-5 h-5;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.residents-widget__title {
  @apply text-sm font-semibold;
  font-family: var(--font-headline);
  color: var(--color-on-surface);
}

.residents-widget__body {
  @apply flex flex-col gap-1;
}

.residents-widget__status {
  @apply text-sm;
  color: var(--color-on-surface-variant);
}

.residents-widget__status--empty {
  @apply italic;
}

.residents-widget__list {
  @apply flex flex-col gap-1 list-none p-0 m-0;
}

.residents-widget__item {
  @apply p-0 m-0;
}

.residents-widget__resident-btn {
  @apply text-sm text-left cursor-pointer border-none bg-transparent p-0;
  color: var(--color-on-surface);
  transition: color 0.15s ease;
}

.residents-widget__resident-btn:hover {
  color: var(--color-primary);
}

.residents-widget__footer {
  @apply mt-auto pt-2;
}

.residents-widget__link {
  @apply text-sm font-medium cursor-pointer border-none bg-transparent;
  color: var(--color-primary);
  transition: opacity 0.15s ease;
}

.residents-widget__link:hover {
  opacity: 0.75;
}
</style>
