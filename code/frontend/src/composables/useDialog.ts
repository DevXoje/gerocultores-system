import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface UseDialogOptions {
  /** Si se provee, modo controlado (el padre pasa open) */
  open?: Ref<boolean>
  /** Si true, no cierra con backdrop click ni Escape */
  persistent?: boolean
  onClose?: () => void
  onSubmit?: (data: unknown) => void
}

export interface UseDialogReturn {
  open: Ref<boolean>
  isOpen: ComputedRef<boolean>
  openDialog: () => void
  closeDialog: () => void
  submit: (data: unknown) => void
}

export function useDialog(options: UseDialogOptions = {}): UseDialogReturn {
  const { open, onClose, onSubmit } = options

  // Modo controlado vs no-controlado
  const isInternalOpen = ref(false)

  const openRef = open ?? isInternalOpen

  const isOpen = computed(() => openRef.value)

  function openDialog() {
    openRef.value = true
  }

  function closeDialog() {
    openRef.value = false
    onClose?.()
  }

  function submit(data: unknown) {
    onSubmit?.(data)
    closeDialog()
  }

  return {
    open: openRef,
    isOpen,
    openDialog,
    closeDialog,
    submit,
  }
}
