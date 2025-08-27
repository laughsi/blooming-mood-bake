// middleware/auth.ts
import { useAuthStore } from '@/stores/auth';
import { navigateTo } from '#app';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // 1. 로그인된 사용자가 '/login' 페이지에 접근하려 할 때
  if (to.path === '/login' && authStore.isLoggedIn) {
    console.log('[Auth Middleware] Logged in user trying to access /login. Redirecting to /');
    return navigateTo('/');
  }

  // 2. 페이지가 로그인을 요구하지만 사용자가 로그인되지 않은 경우
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    console.log('[Auth Middleware] Access denied: Login required for', to.path);
    return navigateTo('/login'); // 로그인 페이지로 리다이렉트
  }

  // 3. 페이지가 관리자 권한을 요구하지만 사용자가 관리자가 아닌 경우
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    console.log('[Auth Middleware] Access denied: Admin privileges required for', to.path);
    return navigateTo('/'); 
  }

});