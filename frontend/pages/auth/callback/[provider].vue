<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="text-center p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">로그인 처리 중...</h2>
      <p class="text-gray-600">잠시만 기다려 주세요.</p>
      <div class="mt-6 loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRuntimeConfig } from '#app';
import { useState } from '#app';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const error = ref<string | null>(null);

const isLoggedIn = useState<boolean>('isLoggedIn');

onMounted(async () => {
  const provider = route.params.provider as string;
  const code = route.query.code as string;
  const state = route.query.state as string;
  const errorParam = route.query.error as string; 

  if (errorParam) {
    error.value = `소셜 로그인 오류: ${errorParam}`;
    setTimeout(() => router.push('/login'), 3000);
    return;
  }

  if (!code) {
    error.value = '인증 코드를 받지 못했습니다.';
    setTimeout(() => router.push('/login'), 3000);
    return;
  }

  if (provider === 'naver') {
    const storedState = localStorage.getItem('naver_oauth_state');
    if (state !== storedState) {
      error.value = '네이버 로그인 State 검증 실패.';
      localStorage.removeItem('naver_oauth_state');
      setTimeout(() => router.push('/login'), 3000);
      return;
    }
    localStorage.removeItem('naver_oauth_state');
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/social/${provider}/callback`, {
      method: 'POST',
      body: { code, state }, 
    });

    if (response && response.token) { 
      localStorage.setItem('authToken', response.token);
      alert(`${provider} 로그인 성공!`);
      router.push('/mypage'); 
    } else {
      error.value = `로그인 실패: ${response?.message || '알 수 없는 오류'}`;
      setTimeout(() => router.push('/login'), 3000);
    }
  } catch (err: any) {
    console.error(`소셜 로그인 (${provider}) 처리 중 오류 발생:`, err);
    error.value = `소셜 로그인 처리 중 오류가 발생했습니다: ${err.data?.message || err.message || ''}`;
    setTimeout(() => router.push('/login'), 3000);
  }
});

useHead({
  title: '로그인 처리 중...',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
});
</script>

<style scoped>
.loader {
  border-top-color: theme('colors.primary'); 
  border-right-color: theme('colors.primary');
  border-bottom-color: theme('colors.primary');
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>