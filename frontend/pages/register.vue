<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          회원가입
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          블루밍무드베이킹에 오신 것을 환영합니다!
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="register">
        <div>
          <label for="login-id" class="sr-only">아이디</label>
          <input id="login-id" name="login_id" type="text" autocomplete="username" required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="아이디" v-model="loginId">
        </div>
        <div>
          <label for="reg-email-address" class="sr-only">이메일 주소</label>
          <input id="reg-email-address" name="email" type="email" autocomplete="email" required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="이메일 주소" v-model="email">
        </div>
        <div>
          <label for="reg-password" class="sr-only">비밀번호</label>
          <input id="reg-password" name="password" type="password" autocomplete="new-password" required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="비밀번호 (6자 이상)" v-model="password">
        </div>
        <div>
          <label for="confirm-password" class="sr-only">비밀번호 확인</label>
          <input id="confirm-password" name="confirm-password" type="password" autocomplete="new-password" required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="비밀번호 확인" v-model="confirmPassword">
        </div>
        <div>
          <label for="username" class="sr-only">이름</label>
          <input id="username" name="username" type="text" autocomplete="name"
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
            placeholder="이름 (선택 사항)" v-model="username">
        </div>

        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            회원가입
          </button>
        </div>
      </form>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">또는 소셜 계정으로 회원가입</span>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-3">
        <button @click="socialRegister('kakao')"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-yellow-400 hover:bg-yellow-500 transition-colors">
          <img src="/images/icons/kakao.jpg" alt="카카오 회원가입" class="h-5 mr-2">
          카카오 회원가입
        </button>
        <button @click="socialRegister('google')"
          class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <img src="/images/icons/google.jpg" alt="구글 회원가입" class="h-5 mr-2">
          구글 회원가입
        </button>
        <button @click="socialRegister('naver')"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
          <img src="/images/icons/naver.jpg" alt="네이버 회원가입" class="h-5 mr-2">
          네이버 회원가입
        </button>
      </div>

      <div class="mt-6 text-center text-sm">
        이미 계정이 있으신가요?
        <NuxtLink to="/login" class="font-medium text-primary hover:text-primary-dark">
          로그인
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRuntimeConfig } from '#app';
import { useRouter } from 'vue-router';

const loginId = ref(''); 
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const username = ref('');
const router = useRouter();
const config = useRuntimeConfig();

const register = async () => {
  console.log('register 메서드 시작');

  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.');
    console.error('비밀번호 불일치');
    return;
  }
  if (password.value.length < 6) {
    alert('비밀번호는 6자 이상이어야 합니다.');
    console.error('비밀번호 길이 부족');
    return;
  }

  try {
    console.log('백엔드 API 호출 시작:', `${config.public.apiBaseUrl}/auth/register`);
    console.log('전송 데이터:', { login_id: loginId.value, email: email.value, password: password.value, username: username.value });

    const response = await $fetch(`${config.public.apiBaseUrl}/auth/register`, {
      method: 'POST',
      body: {
        login_id: loginId.value,
        email: email.value,
        password: password.value,
        username: username.value
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('API 응답:', response);

    if (response && response.success) {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      router.push('/login');
    } else {
      alert('회원가입 실패: ' + (response?.message || '알 수 없는 오류'));
    }
  } catch (error: any) {
    console.error('회원가입 오류 상세:', error);
    alert('회원가입 중 오류가 발생했습니다: ' + (error.data?.message || error.message || ''));
  }
};

const socialRegister = (provider: 'kakao' | 'google' | 'naver') => {
  let authUrl = '';
  const publicConfig = config.public;

  switch (provider) {
    case 'kakao':
      authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${publicConfig.kakaoClientId}&redirect_uri=${publicConfig.kakaoRedirectUri}&scope=profile_nickname,profile_image,account_email`;
      break;
    case 'google':
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${publicConfig.googleClientId}&redirect_uri=${publicConfig.googleRedirectUri}&response_type=code&scope=openid%20profile%20email`;
      break;
    case 'naver':
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('naver_oauth_state', state);
      authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${publicConfig.naverClientId}&redirect_uri=${publicConfig.naverRedirectUri}&state=${state}`;
      break;
  }

  if (authUrl) {
    window.location.href = authUrl;
  }
};

useHead({
  title: '회원가입',
  meta: [
    { name: 'description', content: '블루밍무드베이킹에 회원가입하고 다양한 혜택을 누리세요.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-teal-500; }
.bg-primary-dark { @apply bg-teal-600; }
.text-primary { @apply text-teal-500; }
.text-primary-dark { @apply text-teal-600; }
</style>