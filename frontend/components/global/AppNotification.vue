<template>
  <Transition name="fade">
    <div
      v-if="notificationStore.message"
      :class="notificationClasses"
      class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center"
    >
      <Icon :name="iconName" class="w-6 h-6 mr-2" />
      <span>{{ notificationStore.message }}</span>
      <button @click="notificationStore.clearNotification" class="ml-4 text-white">
        <Icon name="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notification';

const notificationStore = useNotificationStore();

const notificationClasses = computed(() => {
  switch (notificationStore.type) {
    case 'success':
      return 'bg-green-500 text-white';
    case 'error':
      return 'bg-red-500 text-white';
    case 'info':
    default:
      return 'bg-blue-500 text-white';
  }
});

const iconName = computed(() => {
  switch (notificationStore.type) {
    case 'success':
      return 'lucide:check-circle';
    case 'error':
      return 'lucide:x-circle';
    case 'info':
    default:
      return 'lucide:info';
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>