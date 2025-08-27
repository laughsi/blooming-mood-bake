<template>
  <div class="w-full px-4 py-8">
    <h2 class="text-3xl font-bold mb-6 text-textDark">회원 정보 수정</h2>
    <form @submit.prevent="updateProfile" class="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div class="flex items-center gap-6">
        <img v-if="profileImageToDisplay" :src="profileImageToDisplay" alt="프로필 이미지" class="w-24 h-24 rounded-full object-cover shadow-sm border border-gray-200">
        <div v-else class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-6xl font-semibold">
          <Icon name="mdi:account-circle" class="text-gray-400" size="8rem" />
        </div>
        <div>
          <label for="profileImage" class="cursor-pointer bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors duration-200">
            이미지 선택
          </label>
          <input type="file" id="profileImage" @change="handleImageUpload" class="hidden" accept="image/*">
          <button v-if="tempProfileImageFile || authStore.user?.profile_image_url" @click="removeProfileImage" type="button" class="ml-2 text-sm text-red-500 hover:underline">이미지 제거</button>
          <p v-if="imageUploadError" class="text-red-500 text-sm mt-1">{{ imageUploadError }}</p>
        </div>
      </div>

      <div>
        <label for="login_id" class="block text-sm font-medium text-gray-700">아이디</label>
        <input type="text" id="login_id" :value="authStore.user?.login_id" disabled class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 bg-gray-100 cursor-not-allowed">
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
        <input type="email" id="email" v-model="form.email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
        <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label for="username" class="block text-sm font-medium text-gray-700">이름</label>
        <input type="text" id="username" v-model="form.username" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
        <p v-if="errors.username" class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
      </div>

      <div>
        <label for="phone_number" class="block text-sm font-medium text-gray-700">전화번호</label>
        <input type="tel" id="phone_number" v-model="form.phone_number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
        <p v-if="errors.phone_number" class="text-red-500 text-sm mt-1">{{ errors.phone_number }}</p>
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">주소</label>
        <input type="text" id="address" v-model="form.address" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
        <p v-if="errors.address" class="text-red-500 text-sm mt-1">{{ errors.address }}</p>
      </div>

      <div class="border-t pt-6 mt-6 border-gray-200">
        <h3 class="text-xl font-semibold mb-4 text-textDark">비밀번호 변경</h3>
        <p class="text-sm text-gray-600 mb-4">비밀번호를 변경하려면 아래 필드를 채워주세요. 비워두면 현재 비밀번호가 유지됩니다.</p>
        <div>
          <label for="current_password" class="block text-sm font-medium text-gray-700">현재 비밀번호</label>
          <input type="password" id="current_password" v-model="form.current_password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          <p v-if="errors.current_password" class="text-red-500 text-sm mt-1">{{ errors.current_password }}</p>
        </div>
        <div class="mt-4">
          <label for="new_password" class="block text-sm font-medium text-gray-700">새 비밀번호</label>
          <input type="password" id="new_password" v-model="form.new_password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          <p v-if="errors.new_password" class="text-red-500 text-sm mt-1">{{ errors.new_password }}</p>
        </div>
        <div class="mt-4">
          <label for="new_password_confirm" class="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
          <input type="password" id="new_password_confirm" v-model="form.new_password_confirm" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          <p v-if="errors.new_password_confirm" class="text-red-500 text-sm mt-1">{{ errors.new_password_confirm }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-8">
        <button type="button" @click="router.back()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200">취소</button>
        <button type="submit" :disabled="isSubmitting" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSubmitting ? '저장 중...' : '변경 사항 저장' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '~/stores/notification'; 
import { useRuntimeConfig } from '#app'; 

const authStore = useAuthStore();
const router = useRouter();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

definePageMeta({
  requiresAuth: true
});

const isImageRemoved = ref(false);

const profileImageToDisplay = computed(() => {
  if (isImageRemoved.value) {
    return null;
  }
  if (tempProfileImageUrl.value) {
    return tempProfileImageUrl.value;
  }
  
  // 백엔드에서 이미 절대 경로로 저장되므로, 그대로 사용
  if (authStore.user?.profile_image_url) {
    return authStore.user.profile_image_url;
  }

  return null;
});

const form = reactive({
  email: '',
  username: '',
  phone_number: '',
  address: '',
  current_password: '',
  new_password: '',
  new_password_confirm: '',
});

const errors = reactive({
  email: '',
  username: '',
  phone_number: '',
  address: '',
  current_password: '',
  new_password: '',
  new_password_confirm: '',
});

const tempProfileImageFile = ref<File | null>(null);
const tempProfileImageUrl = ref<string | null>(null);
const imageUploadError = ref<string | null>(null);

const isSubmitting = ref(false);

onMounted(() => {
  if (authStore.user) {
    form.email = authStore.user.email || '';
    form.username = authStore.user.username || '';
    form.phone_number = authStore.user.phone_number || '';
    form.address = authStore.user.address || '';
  }
});

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => errors[key] = '');

  if (!form.email) {
    errors.email = '이메일을 입력해주세요.';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '유효한 이메일 형식이 아닙니다.';
    isValid = false;
  }

  if (form.new_password || form.new_password_confirm) {
    if (!form.current_password) {
      errors.current_password = '비밀번호를 변경하려면 현재 비밀번호를 입력해야 합니다.';
      isValid = false;
    }
    if (form.new_password.length < 8) {
      errors.new_password = '새 비밀번호는 최소 8자 이상이어야 합니다.';
      isValid = false;
    }
    if (form.new_password !== form.new_password_confirm) {
      errors.new_password_confirm = '새 비밀번호가 일치하지 않습니다.';
      isValid = false;
    }
  }

  return isValid;
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      imageUploadError.value = 'JPG, PNG, GIF 형식의 이미지만 업로드할 수 있습니다.';
      tempProfileImageFile.value = null;
      tempProfileImageUrl.value = null;
      return;
    }
    if (file.size > maxSize) {
      imageUploadError.value = '이미지 파일 크기는 5MB를 초과할 수 없습니다.';
      tempProfileImageFile.value = null;
      tempProfileImageUrl.value = null;
      return;
    }

    tempProfileImageFile.value = file;
    tempProfileImageUrl.value = URL.createObjectURL(file);
    imageUploadError.value = null; 
    isImageRemoved.value = false; 
  } else {
    tempProfileImageFile.value = null;
    tempProfileImageUrl.value = null;
    imageUploadError.value = null;
  }
};

const removeProfileImage = () => {
  tempProfileImageFile.value = null;
  tempProfileImageUrl.value = null;
  isImageRemoved.value = true; 
};

const updateProfile = async () => {
  if (!validateForm()) {
    notificationStore.showNotification('폼 입력에 오류가 있습니다. 다시 확인해주세요.', 'error');
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('email', form.email);
    formData.append('username', form.username);
    formData.append('phone_number', form.phone_number);
    formData.append('address', form.address);

    if (form.current_password && form.new_password) {
      formData.append('current_password', form.current_password);
      formData.append('new_password', form.new_password);
    }

    if (tempProfileImageFile.value) {
      formData.append('profile_image', tempProfileImageFile.value);
    } else if (isImageRemoved.value) {
      formData.append('profile_image', 'REMOVE');
    }

    await authStore.updateUserProfile(formData); 

    notificationStore.showNotification('회원 정보가 성공적으로 업데이트되었습니다!', 'success');
    router.push('/mypage/profile'); 
  } catch (error: any) {
    console.error('회원 정보 수정 실패:', error);
    notificationStore.showNotification(error.data?.message || error.message || '회원 정보 수정에 실패했습니다.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

useHead({
  title: '회원 정보 수정',
  meta: [
    { name: 'description', content: '회원 정보를 수정하는 페이지입니다.' }
  ]
});
</script>

<style scoped>
.bg-primary { @apply bg-orange-400; } 
.bg-primary-dark { @apply bg-orange-500; } 
.text-primary { @apply text-orange-400; }
.text-primary-dark { @apply text-orange-500; }
</style>
