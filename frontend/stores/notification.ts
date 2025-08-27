// frontend/stores/notification.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const message = ref<string | null>(null);
  const type = ref<'success' | 'error' | 'info' | null>(null);
  const duration = ref(3000); 

  let timeoutId: NodeJS.Timeout | null = null;

  const showNotification = (msg: string, notifType: 'success' | 'error' | 'info' = 'info', dur: number = 3000) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    message.value = msg;
    type.value = notifType;
    duration.value = dur;

    timeoutId = setTimeout(() => {
      clearNotification();
    }, duration.value);
  };

  const clearNotification = () => {
    message.value = null;
    type.value = null;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    message,
    type,
    showNotification,
    clearNotification,
  };
});