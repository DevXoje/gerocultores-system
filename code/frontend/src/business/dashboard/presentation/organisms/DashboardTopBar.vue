<script setup lang="ts">
import AppClock from '@/business/dashboard/presentation/atoms/AppClock.vue'
import ConnectivityBadge from '@/business/dashboard/presentation/atoms/ConnectivityBadge.vue'
import GreetingCard from '@/business/dashboard/presentation/molecules/GreetingCard.vue'
import TurnoStatusCard from '@/business/dashboard/presentation/molecules/TurnoStatusCard.vue'

defineProps<{
  formattedDate: string
  formattedTime: string
  turnoLabel: string | null
  turnoMeta: string | null
  isOnline: boolean
}>()
</script>

<template>
  <header class="dashboard-top-bar">
    <div class="dashboard-top-bar__lead">
      <GreetingCard greeting="Buenos días" subtitle="Vamos a por un gran día" />
      <TurnoStatusCard v-if="turnoLabel" :label="turnoLabel" :meta="turnoMeta" />
    </div>

    <div class="dashboard-top-bar__status">
      <div class="dashboard-top-bar__clock-card">
        <AppClock :formatted-date="formattedDate" :formatted-time="formattedTime" />
      </div>
      <ConnectivityBadge :is-online="isOnline" />
    </div>
  </header>
</template>

<style scoped>
@reference "#/style.css";

.dashboard-top-bar {
  @apply flex flex-col gap-4 rounded-[28px] border px-6 py-5;
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(222, 229, 242, 0.9);
  box-shadow: 0 22px 45px rgba(214, 223, 240, 0.28);
  backdrop-filter: blur(18px);
}

.dashboard-top-bar__lead {
  @apply flex flex-col gap-3;
}

.dashboard-top-bar__status {
  @apply flex flex-col gap-3;
}

.dashboard-top-bar__clock-card {
  @apply flex items-center gap-3 rounded-2xl px-4 py-3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 255, 0.88));
}

@media (min-width: 900px) {
  .dashboard-top-bar {
    @apply flex-row items-stretch justify-between;
  }

  .dashboard-top-bar__lead {
    @apply flex-row items-stretch;
  }

  .dashboard-top-bar__status {
    @apply items-end;
  }

  .dashboard-top-bar__clock-card {
    min-width: 240px;
  }
}
</style>
