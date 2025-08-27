<template>
  <div class="w-full py-8 px-4">
    <h2 class="text-3xl font-bold mb-6 text-textDark">회원 정보</h2>
    <div v-if="authStore.user" class="space-y-4">
      <div class="flex items-center gap-4">
        <img v-if="authStore.user.profile_image_url" :src="authStore.user.profile_image_url" alt="프로필 이미지" class="w-24 h-24 rounded-full object-cover shadow-sm">
        <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-6xl font-semibold">
          <Icon name="mdi:account-circle" class="text-gray-400" size="8rem" />
        </div>
        <div class="flex-1">
          <p class="text-lg"><span class="font-semibold">아이디:</span> {{ authStore.user.login_id }}</p>
          <p class="text-lg"><span class="font-semibold">이메일:</span> {{ authStore.user.email }}</p>
          <p class="text-lg"><span class="font-semibold">이름:</span> {{ authStore.user.username || '' }}</p>
          <p class="text-lg"><span class="font-semibold">권한:</span> {{ authStore.user.isAdmin ? '관리자' : '사용자' }}</p>
        </div>
      </div>
      <p class="text-lg"><span class="font-semibold">전화번호:</span> {{ authStore.user.phone_number || '-' }}</p>
      <p class="text-lg"><span class="font-semibold">주소:</span> {{ authStore.user.address || '-' }}</p>
      <NuxtLink to="/mypage/edit-profile" class="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200">
        정보 수정
      </NuxtLink>
    </div>
    <div v-else>
      <p>사용자 정보를 불러오는 중...</p>
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
  middleware: ['auth']
});

useHead({
  title: '회원 정보',
  meta: [
    { name: 'description', content: '회원 정보를 확인하고 수정하는 페이지입니다.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-orange-400; } 
.bg-primary-dark { @apply bg-orange-500; } 
.text-primary { @apply text-orange-400; }
.text-primary-dark { @apply text-orange-500; }
</style>