<!-- Stitch: projects/16168255182252500555 — Admin Users Management View (US-10) -->
<script setup lang="ts">
/**
 * UsersView — Admin view for managing gerocultor accounts.
 *
 * Displays a table of all users with controls to:
 * - Change role (admin / gerocultor)
 * - Disable a user account
 *
 * The currently logged-in user cannot disable their own account.
 * All data-fetching and mutations are delegated to useUsers().
 */
import { onMounted, computed } from 'vue'
import { useUsers } from '../composables/useUsers'
import { useAuthStore } from '@/business/auth/useAuthStore'
import type { UserRole } from '../../domain/entities/user.types'

const { users, loading, error, fetchUsers, updateRole, disableUser } = useUsers()
const authStore = useAuthStore()

const currentUid = computed<string | null>(() => authStore.user?.uid ?? null)

onMounted(fetchUsers)

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'gerocultor', label: 'Gerocultor' },
]

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

async function handleRoleChange(uid: string, event: Event): Promise<void> {
  const target = event.target as HTMLSelectElement
  await updateRole(uid, target.value as UserRole)
}

async function handleDisable(uid: string): Promise<void> {
  await disableUser(uid)
}
</script>

<template>
  <div class="users-view">
    <header class="users-view__header">
      <h1 class="users-view__title">Gestión de cuentas</h1>
      <p class="users-view__subtitle">Administra los usuarios gerocultores del sistema.</p>
    </header>

    <!-- Error state -->
    <div v-if="error" class="users-view__error" role="alert">
      <span class="users-view__error-icon" aria-hidden="true">⚠</span>
      <span class="users-view__error-message">{{ error }}</span>
      <button type="button" class="users-view__retry-btn" @click="fetchUsers">
        Reintentar
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-else-if="loading" class="users-view__skeleton" aria-busy="true" aria-label="Cargando usuarios">
      <template v-for="n in 5" :key="n">
        <div class="users-view__skeleton-row">
          <div class="users-view__skeleton-cell users-view__skeleton-cell--wide" />
          <div class="users-view__skeleton-cell users-view__skeleton-cell--wide" />
          <div class="users-view__skeleton-cell" />
          <div class="users-view__skeleton-cell users-view__skeleton-cell--narrow" />
          <div class="users-view__skeleton-cell users-view__skeleton-cell--narrow" />
          <div class="users-view__skeleton-cell users-view__skeleton-cell--narrow" />
        </div>
      </template>
    </div>

    <!-- Users table -->
    <div v-else class="users-view__table-wrapper">
      <table class="users-view__table">
        <thead class="users-view__thead">
          <tr class="users-view__tr">
            <th class="users-view__th" scope="col">Nombre</th>
            <th class="users-view__th" scope="col">Email</th>
            <th class="users-view__th" scope="col">Rol</th>
            <th class="users-view__th" scope="col">Estado</th>
            <th class="users-view__th" scope="col">Creado</th>
            <th class="users-view__th" scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="userItem in users" :key="userItem.uid">
            <tr class="users-view__tr">
              <td class="users-view__td">
                <span class="users-view__display-name">
                  {{ userItem.displayName ?? '—' }}
                </span>
              </td>
              <td class="users-view__td">
                <span class="users-view__email">{{ userItem.email }}</span>
              </td>
              <td class="users-view__td">
                <select
                  class="users-view__role-select"
                  :value="userItem.role"
                  :aria-label="`Cambiar rol de ${userItem.displayName ?? userItem.email}`"
                  @change="handleRoleChange(userItem.uid, $event)"
                >
                  <template v-for="opt in ROLE_OPTIONS" :key="opt.value">
                    <option :value="opt.value">{{ opt.label }}</option>
                  </template>
                </select>
              </td>
              <td class="users-view__td">
                <span
                  class="users-view__badge"
                  :class="userItem.active ? 'users-view__badge--active' : 'users-view__badge--inactive'"
                >
                  {{ userItem.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="users-view__td">
                <time class="users-view__date" :datetime="userItem.createdAt">
                  {{ formatDate(userItem.createdAt) }}
                </time>
              </td>
              <td class="users-view__td">
                <button
                  v-if="userItem.uid !== currentUid"
                  type="button"
                  class="users-view__disable-btn"
                  :disabled="!userItem.active"
                  :aria-label="`Desactivar cuenta de ${userItem.displayName ?? userItem.email}`"
                  @click="handleDisable(userItem.uid)"
                >
                  Desactivar
                </button>
                <span v-else class="users-view__self-label">Tú</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <p v-if="users.length === 0" class="users-view__empty">
        No hay usuarios registrados.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ── Root ───────────────────────────────────────────────────────────────── */
.users-view {
  padding: 1.5rem;
  max-width: 72rem;
  margin-left: auto;
  margin-right: auto;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.users-view__header {
  margin-bottom: 1.5rem;
}

/* ── Error ──────────────────────────────────────────────────────────────── */
.users-view__error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
.users-view__skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Table wrapper ──────────────────────────────────────────────────────── */
.users-view__table-wrapper {
  overflow-x: auto;
}

.users-view__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

/* ── Actions ────────────────────────────────────────────────────────────── */
.users-view__disable-btn {
  font-size: 0.75rem;
  min-height: 36px;
  min-width: 44px;
}

/* ── Empty state ────────────────────────────────────────────────────────── */
.users-view__empty {
  padding: 2rem 1rem;
  text-align: center;
  font-size: 0.875rem;
}
</style>
