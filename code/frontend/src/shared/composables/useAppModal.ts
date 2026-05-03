import { ref } from 'vue'

export function useAppModal<TContext = undefined>() {
  const isOpen = ref(false)
  const context = ref<TContext | undefined>(undefined)

  function openModal(nextContext?: TContext): void {
    context.value = nextContext
    isOpen.value = true
  }

  function closeModal(): void {
    isOpen.value = false
  }

  function resetContext(): void {
    context.value = undefined
  }

  return {
    isOpen,
    context,
    openModal,
    closeModal,
    resetContext,
  }
}
