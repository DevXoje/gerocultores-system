import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/business/auth/useAuthStore'
import { AUTH_ROUTES } from '@/business/auth/route-names'
import { useTurno } from '@/business/turno/presentation/composables/useTurno'

export function useDashboardPage() {
  const router = useRouter()
  const auth = useAuthStore()
  const showCreateModal = ref(false)
  const now = ref(new Date())
  const isOnline = ref(navigator.onLine)
  const { turnoActivo, cargarTurnoActivo } = useTurno()
  let clockTimer: ReturnType<typeof setInterval> | null = null

  const nombreUsuario = computed(() => auth.user?.displayName ?? auth.user?.email ?? 'Cuidador/a')

  const fechaHoy = computed(() =>
    now.value.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  )

  const formattedDate = computed(() =>
    now.value.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  )

  const formattedTime = computed(() =>
    now.value.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  )

  const turnoLabel = computed(() => {
    const tipoTurno = turnoActivo.value?.tipoTurno
    if (tipoTurno === 'manyana') return 'Turno de mañana'
    if (tipoTurno === 'tarde') return 'Turno de tarde'
    if (tipoTurno === 'noche') return 'Turno de noche'
    return null
  })

  const turnoMeta = computed(() => {
    const inicio = turnoActivo.value?.inicio
    if (!inicio) return null

    return `Inicio ${inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  })

  function signOut(): void {
    auth.signOut()
    router.push({ name: AUTH_ROUTES.LOGIN.name })
  }

  function openCreateModal(): void {
    showCreateModal.value = true
  }

  function closeCreateModal(): void {
    showCreateModal.value = false
  }

  function handleConnectivityChange(): void {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    cargarTurnoActivo()
    clockTimer = setInterval(() => {
      now.value = new Date()
    }, 60_000)

    window.addEventListener('online', handleConnectivityChange)
    window.addEventListener('offline', handleConnectivityChange)
  })

  onUnmounted(() => {
    if (clockTimer !== null) {
      clearInterval(clockTimer)
    }

    window.removeEventListener('online', handleConnectivityChange)
    window.removeEventListener('offline', handleConnectivityChange)
  })

  return {
    fechaHoy,
    formattedDate,
    formattedTime,
    isOnline,
    nombreUsuario,
    showCreateModal,
    turnoLabel,
    turnoMeta,
    signOut,
    openCreateModal,
    closeCreateModal,
  }
}
