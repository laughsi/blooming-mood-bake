<template>
  <div class="w-full px-4 py-8">

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-100 p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p class="text-lg text-gray-600">총 주문 수</p>
          <p class="text-4xl font-bold text-primary">1,234</p>
        </div>
        <Icon name="lucide:clipboard-list" class="w-12 h-12 text-gray-400" />
      </div>

      <div class="bg-gray-100 p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p class="text-lg text-gray-600">총 수익</p>
          <p class="text-4xl font-bold text-green-500">₩ 56,789,000</p>
        </div>
        <Icon name="lucide:currency-krw" class="w-12 h-12 text-gray-400" />
      </div>

      <div class="bg-gray-100 p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <p class="text-lg text-gray-600">신규 사용자</p>
          <p class="text-4xl font-bold text-blue-500">87</p>
        </div>
        <Icon name="lucide:users" class="w-12 h-12 text-gray-400" />
      </div>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-textDark">최근 활동</h2>
      <ul class="divide-y divide-gray-200">
        <li class="py-3 flex justify-between items-center">
          <p class="text-gray-700">새로운 주문 #20240723-001이 접수되었습니다.</p>
          <span class="text-sm text-gray-500">10분 전</span>
        </li>
        <li class="py-3 flex justify-between items-center">
          <p class="text-gray-700">회원 김철수님(ID: chulsoo)이 가입했습니다.</p>
          <span class="text-sm text-gray-500">1시간 전</span>
        </li>
        <li class="py-3 flex justify-between items-center">
          <p class="text-gray-700">상품 "딸기 쇼트케이크" 재고가 5개 미만입니다.</p>
          <span class="text-sm text-gray-500">3시간 전</span>
        </li>
      </ul>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4 text-textDark">빠른 링크</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink to="/admin/orders" class="flex flex-col items-center justify-center p-4 bg-white rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Icon name="lucide:list-ordered" class="w-8 h-8 text-primary mb-2" />
          <span class="text-md font-medium text-textDark">주문 관리</span>
        </NuxtLink>
        <NuxtLink to="/admin/products" class="flex flex-col items-center justify-center p-4 bg-white rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Icon name="lucide:package" class="w-8 h-8 text-primary mb-2" />
          <span class="text-md font-medium text-textDark">상품 관리</span>
        </NuxtLink>
        <NuxtLink to="/admin/users" class="flex flex-col items-center justify-center p-4 bg-white rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Icon name="lucide:user-cog" class="w-8 h-8 text-primary mb-2" />
          <span class="text-md font-medium text-textDark">회원 관리</span>
        </NuxtLink>
        <NuxtLink to="/admin/reservations" class="flex flex-col items-center justify-center p-4 bg-white rounded-md hover:bg-gray-100 transition-colors duration-200">
          <Icon name="lucide:calendar" class="w-8 h-8 text-primary mb-2" />
          <span class="text-md font-medium text-textDark">예약 관리</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

definePageMeta({
  requiresAuth: true,
  middleware: [async (to, from) => {
    const auth = useAuthStore();
    if (!auth.isLoggedIn || !auth.isAdmin) {
      return navigateTo('/');
    }
  }]
});

useHead({
  title: '관리자 대시보드',
  meta: [
    { name: 'description', content: '사이트 관리자 대시보드입니다.' }
  ]
});
</script>

<style scoped>
</style>