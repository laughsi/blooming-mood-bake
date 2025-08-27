<template>
  <div class="w-full py-8 px-4">
    <h1 class="text-4xl md:text-4xl font-bold text-center mb-6 text-primary">사용자 상세 정보</h1>

    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">사용자 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="!user" class="text-center py-8">
      <p class="text-red-600">사용자 정보를 찾을 수 없습니다.</p>
      <NuxtLink to="/admin/users" class="text-primary hover:underline mt-4 block">목록으로 돌아가기</NuxtLink>
    </div>

    <div v-else class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">사용자번호</label>
          <p class="mt-1 text-lg text-textDark">{{ user.id }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">로그인 ID</label>
          <p class="mt-1 text-lg text-textDark">{{ user.login_id }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">사용자명</label>
          <input
            v-model="editableUser.username"
            type="text"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">이메일</label>
          <input
            v-model="editableUser.email"
            type="email"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-lg"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">역할</label>
          <select
            v-model="editableUser.isAdmin"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-lg"
          >
            <option :value="false">사용자</option>
            <option :value="true">관리자</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">상태</label>
          <select
            v-model="editableUser.status"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-lg"
          >
            <option value="active">활성화</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">가입일</label>
          <p class="mt-1 text-lg text-gray-700">{{ formatDate(user.created_at) }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">최근 업데이트</label>
          <p class="mt-1 text-lg text-gray-700">{{ user.updated_at ? formatDate(user.updated_at) : 'N/A' }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <button
          @click="resetChanges"
          class="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          되돌리기
        </button>
        <button
          @click="updateUser"
          :disabled="!hasChanges"
          class="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          정보 업데이트
        </button>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/admin/users" class="text-primary hover:underline">목록으로 돌아가기</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig } from '#app';

interface User {
  id: string;
  login_id: string;
  email: string;
  username?: string | null;
  is_admin: boolean;
  is_active: boolean; 
  created_at: string;
  updated_at?: string; 
  isAdmin: boolean;
  status: 'active' | 'inactive';
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const userId = ref(route.params.id as string);

const user = ref<User | null>(null);
const editableUser = ref<Partial<User>>({});
const loading = ref(true);

const hasChanges = computed(() => {
  if (!user.value) return false;
  return (
    editableUser.value.username !== user.value.username ||
    editableUser.value.email !== user.value.email ||
    editableUser.value.isAdmin !== user.value.is_admin || 
    (editableUser.value.status === 'active' ? true : false) !== user.value.is_active
  );
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string provided to formatDate:", dateString);
      return 'Invalid Date';
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Error';
  }
};

const fetchUser = async () => {
  loading.value = true;
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/users/${userId.value}`, { // userId.value 사용
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (response && response.success && response.user) {
      user.value = {
        ...response.user,
        isAdmin: response.user.is_admin,
        status: response.user.is_active ? 'active' : 'inactive',
      };
      editableUser.value = { ...user.value };
    } else {
      notificationStore.showNotification(response?.message || '사용자 정보를 찾을 수 없습니다.', 'error');
      user.value = null;
    }
  } catch (error: any) {
    console.error('사용자 정보 불러오기 실패:', error);
    notificationStore.showNotification(error.data?.message || '사용자 정보 불러오기 중 오류가 발생했습니다.', 'error');
    user.value = null;
  } finally {
    loading.value = false;
  }
};

const resetChanges = () => {
  if (user.value) {
    editableUser.value = { ...user.value };
  }
};

const updateUser = async () => {
  if (!user.value || !hasChanges.value) return;

  if (!confirm('정말로 사용자 정보를 업데이트 하시겠습니까?')) {
    return;
  }

  try {
    const payload = {
      username: editableUser.value.username,
      email: editableUser.value.email,
      is_admin: editableUser.value.isAdmin, 
      is_active: editableUser.value.status === 'active' 
    };

    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/users/${userId.value}`, { 
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (response && response.success && response.user) {
      notificationStore.showNotification('사용자 정보가 성공적으로 업데이트되었습니다.', 'success');
      user.value = {
        ...response.user,
        isAdmin: response.user.is_admin,
        status: response.user.is_active ? 'active' : 'inactive',
      };
      editableUser.value = { ...user.value };
    } else {
      notificationStore.showNotification(response?.message || '사용자 정보 업데이트에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('사용자 정보 업데이트 실패:', error);
    notificationStore.showNotification(error.data?.message || '사용자 정보 업데이트 중 오류가 발생했습니다.', 'error');
  }
};

onMounted(() => {
  if (userId.value) { 
    fetchUser();
  } else {
    notificationStore.showNotification('사용자 ID가 제공되지 않았습니다.', 'error');
    loading.value = false;
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      userId.value = newId as string; 
      fetchUser();
    }
  }
);


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
  title: '사용자 상세페이지',
  meta: [
    { name: 'description', content: '사용자 상세 정보를 보고 편집하는 관리자 페이지입니다.' }
  ]
});
</script>

<style scoped>
</style>