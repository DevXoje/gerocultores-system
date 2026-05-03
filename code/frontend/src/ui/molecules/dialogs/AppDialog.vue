<script setup lang="ts">
const modelValue = defineModel<boolean>({ default: false })

const props = defineProps<{
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  persistent?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: unknown]
}>()

function closeDialog() {
  modelValue.value = false
  emit('close')
}

function handleBackdropClick() {
  if (!props.persistent) {
    closeDialog()
  }
}
</script>

<template>
  <Teleport to="body">
    <dialog
      class="app-dialog"
      :class="[`app-dialog--${size}`]"
      :open="modelValue"
      aria-modal="true"
      :aria-labelledby="title ? 'app-dialog-title' : undefined"
      @click.self="handleBackdropClick"
    >
      <div class="app-dialog__container">
        <header class="app-dialog__header">
          <h2 v-if="title" id="app-dialog-title" class="app-dialog__title">{{ title }}</h2>
          <button
            v-if="!persistent"
            class="app-dialog__close"
            aria-label="Cerrar"
            @click="closeDialog"
          >
            ✕
          </button>
        </header>

        <div class="app-dialog__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="app-dialog__footer">
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
@reference "#/style.css";

.app-dialog {
  display: none;
}

.app-dialog[open] {
  display: flex;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.app-dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.app-dialog[open] {
  animation: scaleIn 200ms ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.app-dialog__container {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-dialog--sm .app-dialog__container {
  max-width: 400px;
}
.app-dialog--md .app-dialog__container {
  max-width: 560px;
}
.app-dialog--lg .app-dialog__container {
  max-width: 800px;
}
.app-dialog--full .app-dialog__container {
  max-width: 100%;
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.app-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.app-dialog__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0;
}

.app-dialog__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  border-radius: 4px;
  transition: background-color 0.15s;
}

.app-dialog__close:hover {
  background-color: var(--color-surface-container-high);
}

.app-dialog__body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.app-dialog__footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
