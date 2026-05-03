<script setup lang="ts">
import UserAvatar from '@/business/dashboard/presentation/atoms/UserAvatar.vue'

defineProps<{
  userName: string
  initials: string
  jobTitle: string
}>()
</script>

<template>
  <div class="sidebar-user-profile">
    <UserAvatar :initials="initials" />
    <div class="sidebar-user-profile__copy">
      <span class="sidebar-user-profile__name">{{ userName }}</span>
      <span class="sidebar-user-profile__role">{{ jobTitle }}</span>
    </div>
  </div>
</template>

<style scoped>
@reference "#/style.css";

.sidebar-user-profile {
  @apply flex items-center gap-3;
}

.sidebar-user-profile__copy {
  @apply flex min-w-0 flex-col;
}

.sidebar-user-profile__name {
  @apply truncate text-sm font-medium;
}

.sidebar-user-profile__role {
  @apply text-xs;
  color: rgba(247, 251, 255, 0.66);
}
</style>
