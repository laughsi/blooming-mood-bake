<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          비밀번호 재설정
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          가입 시 사용한 이메일 주소를 입력해주세요.
          <br>비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="requestPasswordReset">
        <div>
          <label for="email-address" class="sr-only">이메일 주소</label>
          <input id="email-address" name="email" type="email" autocomplete="email" required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="이메일 주소" v-model="email">
        </div>

        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            비밀번호 재설정 링크 받기
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-sm">
        <NuxtLink to="/login" class="font-medium text-primary hover:text-primary-dark">
          로그인 페이지로 돌아가기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';

const email = ref('');
const router = useRouter();
const config = useRuntimeConfig();

const requestPasswordReset = async () => {
  if (!email.value) {
    alert('이메일 주소를 입력해주세요.');
    return;
  }

  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/auth/forgot-password`, {
      method: 'POST',
      body: { email: email.value },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response && response.success) {
      alert('비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.');
      router.push('/login'); 
    } else {
      alert('비밀번호 재설정 요청 실패: ' + (response?.message || '알 수 없는 오류'));
    }
  } catch (error: any) {
    console.error('비밀번호 재설정 요청 오류 상세:', error);
    alert('비밀번호 재설정 요청 중 오류가 발생했습니다: ' + (error.data?.message || error.message || ''));
  }
};

useHead({
  title: '비밀번호 재설정',
  meta: [
    { name: 'description', content: '비밀번호 재설정을 위한 이메일 인증 페이지입니다.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-teal-500; }
.bg-primary-dark { @apply bg-teal-600; }
.text-primary { @apply text-teal-500; }
.text-primary-dark { @apply text-teal-600; }
</style>