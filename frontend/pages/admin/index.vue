<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">관리자 페이지</h1>
    <p class="text-center text-lg text-textDark mb-12">
      환영합니다, <span v-if="authStore.user">{{ authStore.user.username || authStore.user.login_id }}</span>님! 이곳에서 사이트의 모든 기능을 관리하세요.
    </p>

    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <nav class="flex-shrink-0 w-full md:w-1/4">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">관리 메뉴</h2>
        <ul class="space-y-4">
          <li>
            <NuxtLink to="/admin/dashboard" exact-active-class="text-primary font-bold" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200">
              대시보드
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/users" active-class="text-primary font-bold" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200">
              사용자 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/orders" active-class="text-primary font-bold" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200">
              주문 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/reservations" active-class="text-primary font-bold" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200">
              예약 관리
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/products" active-class="text-primary font-bold" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200">
              상품 관리
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex-grow w-full md:w-3/4">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore(); 

definePageMeta({
  requiresAuth: true, 
  requiresAdmin: true 
});

onMounted(() => {
  if (!authStore.isLoggedIn) {
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }
  if (!authStore.isAdmin) {
    alert('관리자 권한이 없습니다.');
    router.push('/');
  }
});

const logout = async () => {
  if (confirm('관리자 계정에서 로그아웃 하시겠습니까?')) {
    await authStore.logout(); 
    alert('로그아웃 되었습니다.');
    router.push('/login'); 
  }
};

useHead({
  title: '관리자 페이지',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 관리자 페이지입니다.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-teal-500; }
.bg-primary-dark { @apply bg-teal-600; }
.text-primary { @apply text-teal-500; }
.text-primary-dark { @apply text-teal-600; }

.router-link-exact-active {
  @apply text-primary font-bold;
}
</style>