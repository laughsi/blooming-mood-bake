<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">로그인</h1>
    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-md mx-auto">
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="login_id" class="block text-sm font-medium text-gray-700">아이디</label>
          <input
            type="text"
            id="login_id"
            v-model="loginId"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>
        <button
          type="submit"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          로그인
        </button>
      </form>
      <div class="mt-6 text-center text-sm">
        <NuxtLink to="/register" class="font-medium text-primary hover:text-primary-dark">회원가입</NuxtLink> |
        <NuxtLink to="/forgot-password" class="font-medium text-primary hover:text-primary-dark">비밀번호 찾기</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 

const loginId = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  const result = await authStore.login(loginId.value, password.value);
  if (result.success) {
    alert(result.message);
    router.push('/');
  } else {
    alert(result.message);
  }
};

useHead({
  title: '로그인',
  meta: [
    { name: 'description', content: '브런치 카페 웹사이트 로그인 페이지입니다.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-teal-500; }
.bg-primary-dark { @apply bg-teal-600; }
.text-primary { @apply text-teal-500; }
.text-primary-dark { @apply text-teal-600; }
</style>