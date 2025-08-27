// plugins/auth.ts
import { useAuthStore } from '@/stores/auth';

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore(); 
  
  await authStore.initializeAuth();
  console.log('[Auth Plugin] Auth initialized. LoggedIn:', authStore.isLoggedIn, 'Admin:', authStore.isAdmin);
});