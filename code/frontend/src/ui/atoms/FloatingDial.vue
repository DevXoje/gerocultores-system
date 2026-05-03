<script setup lang="ts">
/**
 * FloatingDial.vue — Floating Action Button with radial menu.
 *
 * Provides quick-access options to register: Tarea, Incidencia, Residente.
 *
 * US-06: Registro de incidencia
 * US-09: Alta y gestión de residentes
 * US-14: Crear tarea
 *
 * Architecture (frontend-specialist.md §6):
 *   - Pure presentation atom.
 *   - BEM class names; Tailwind via @apply in <style scoped>.
 *   - CSS custom properties from style.css (--color-dial-*).
 */
import { ref, watch } from 'vue'
import {
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

interface DialOption {
  id: 'task' | 'incident' | 'resident'
  label: string
  icon: typeof ClipboardDocumentCheckIcon
  ariaLabel: string
}

const options: DialOption[] = [
  {
    id: 'task',
    label: 'Tarea',
    icon: ClipboardDocumentCheckIcon,
    ariaLabel: 'Crear nueva tarea',
  },
  {
    id: 'incident',
    label: 'Incidencia',
    icon: ExclamationTriangleIcon,
    ariaLabel: 'Registrar incidencia',
  },
  {
    id: 'resident',
    label: 'Residente',
    icon: UserPlusIcon,
    ariaLabel: 'Dar de alta residente',
  },
]

const isOpen = ref(false)

const emit = defineEmits<{
  (e: 'create-task'): void
  (e: 'create-incident'): void
  (e: 'create-resident'): void
  (e: 'update:modelValue', value: boolean): void
}>()

const props = defineProps<{
  modelValue: boolean
}>()

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val
  }
)

function toggle(): void {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value)
}

function close(): void {
  isOpen.value = false
  emit('update:modelValue', false)
}

function handleOption(action: 'task' | 'incident' | 'resident'): void {
  close()
  emit(`create-${action}`)
}
</script>

<template>
  <div class="floating-dial">
    <!-- Trigger button -->
    <button
      type="button"
      class="floating-dial__trigger"
      :aria-expanded="isOpen"
      aria-controls="dial-menu"
      aria-label="Menú de registro rápido"
      @click="toggle"
    >
      <XMarkIcon v-if="isOpen" class="floating-dial__trigger-icon" aria-hidden="true" />
      <PlusIcon v-else class="floating-dial__trigger-icon" aria-hidden="true" />
    </button>

    <!-- Radial menu -->
    <Transition name="dial-expand">
      <div
        v-if="isOpen"
        id="dial-menu"
        class="floating-dial__menu"
        role="menu"
        aria-label="Opciones de registro rápido"
      >
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="floating-dial__option"
          role="menuitem"
          :aria-label="option.ariaLabel"
          @click="handleOption(option.id)"
        >
          <component :is="option.icon" class="floating-dial__option-icon" aria-hidden="true" />
          <span class="floating-dial__option-label">{{ option.label }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "#/style.css";

/* ─── Backdrop ──────────────────────────────────────────────────────── */
.floating-dial__backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background-color: var(--color-dial-backdrop);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

/* ─── Trigger ───────────────────────────────────────────────────────── */
.floating-dial {
  position: relative;
  z-index: 50;
}

.floating-dial__trigger {
  @apply flex h-14 w-14 items-center justify-center rounded-full cursor-pointer border-none;
  background-color: var(--color-dial-fab-bg);
  color: var(--color-dial-fab-text);
  box-shadow: 0 18px 28px var(--color-dial-fab-shadow);
  transition: opacity 0.15s ease;
}

.floating-dial__trigger:hover {
  opacity: 0.85;
}

.floating-dial__trigger-icon {
  @apply w-5 h-5;
}

/* ─── Radial menu ───────────────────────────────────────────────────── */
.floating-dial__menu {
  position: absolute;
  bottom: calc(100% + 16px);
  right: 0;
  @apply flex flex-col gap-3 rounded-2xl border px-4 py-4;
  background-color: var(--color-dial-option-bg);
  border-color: rgba(219, 227, 243, 0.94);
  box-shadow: 0 18px 40px rgba(215, 223, 240, 0.28);
  min-width: 180px;
}

.floating-dial__option {
  @apply flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer border-none text-left;
  background: transparent;
  color: var(--color-dial-option-text);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.floating-dial__option:hover {
  background-color: var(--color-dial-option-hover-bg);
  border-color: var(--color-dial-option-hover-border);
  transform: translateX(-2px);
}

.floating-dial__option-icon {
  @apply w-5 h-5 flex-shrink-0;
  color: var(--color-primary);
}

.floating-dial__option-label {
  @apply text-sm font-medium;
  color: var(--color-dial-option-text);
}

/* ─── Transitions ──────────────────────────────────────────────────── */
.dial-fade-enter-active,
.dial-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dial-fade-enter-from,
.dial-fade-leave-to {
  opacity: 0;
}

.dial-expand-enter-active,
.dial-expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dial-expand-enter-from,
.dial-expand-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(8px);
}
</style>
