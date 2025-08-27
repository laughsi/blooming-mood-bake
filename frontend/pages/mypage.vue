<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">마이페이지</h1>
    <p class="text-center text-lg text-textDark mb-12">
      환영합니다, <span v-if="authStore.user">{{ authStore.user.username || authStore.user.email }}</span>님! 이곳에서 정보를 관리하고 활동 내역을 확인하세요.
    </p>

    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
      <nav class="flex-shrink-0 w-full md:w-1/4">
        <ul class="space-y-4">
          <li><NuxtLink to="/mypage/profile" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200" active-class="text-primary font-bold">회원 정보</NuxtLink></li>
          <li><NuxtLink to="/mypage/orders" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200" active-class="text-primary font-bold">주문 내역</NuxtLink></li>
          <li><NuxtLink to="/mypage/reservations" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200" active-class="text-primary font-bold">예약 내역</NuxtLink></li>
          <li><NuxtLink to="/mypage/reviews" class="block text-lg font-semibold text-textDark hover:text-primary transition-colors duration-200" active-class="text-primary font-bold">내 리뷰</NuxtLink></li>
          <li><button @click="confirmDeleteAccount" class="block w-full text-left text-lg font-semibold text-red-600 hover:text-red-700 transition-colors duration-200">회원 탈퇴</button></li>
        </ul>
      </nav>

      <div class="flex-grow w-full md:w-3/4">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig } from '#app'; 

const authStore = useAuthStore();
const router = useRouter();
const config = useRuntimeConfig();

definePageMeta({
  requiresAuth: true 
});

const logout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    await authStore.logout();
    alert('로그아웃 되었습니다.');
    router.push('/login');
  }
};

const confirmDeleteAccount = async () => {
  if (!authStore.user) {
    alert('로그인된 사용자 정보가 없습니다.');
    return;
  }

  const confirmation = confirm('정말로 회원 탈퇴하시겠습니까? 모든 정보가 삭제되며 되돌릴 수 없습니다.');
  if (!confirmation) {
    return;
  }

  try {
    await $fetch(`${config.public.apiBaseUrl}/user/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}` 
      }
    });

    alert('회원 탈퇴가 성공적으로 처리되었습니다.');
    await authStore.logout(); 
    router.push('/'); 
  } catch (error: any) {
    console.error('회원 탈퇴 실패:', error);
    alert('회원 탈퇴 중 오류가 발생했습니다: ' + (error.data?.message || '알 수 없는 오류'));
  }
};

useHead({
  title: '마이페이지',
  meta: [
    { name: 'description', content: '회원 정보, 주문 내역, 예약 내역 등을 관리할 수 있는 마이페이지입니다.' }
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