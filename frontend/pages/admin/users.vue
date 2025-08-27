<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-4xl md:text-4xl font-bold text-center mb-6 text-primary">사용자 관리</h1>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="사용자 ID, 이름, 이메일 검색..."
          class="flex-1 px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @keyup.enter="fetchUsers"
        />
        <select
          v-model="filterRole"
          class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @change="fetchUsers"
        >
          <option value="">모든 역할</option>
          <option value="user">사용자</option>
          <option value="admin">관리자</option>
        </select>
        <select
          v-model="filterStatus"
          class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @change="fetchUsers"
        >
          <option value="">모든 상태</option>
          <option value="active">활성화</option>
          <option value="inactive">비활성</option>
        </select>
        <button
          @click="fetchUsers"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
        >
          검색
        </button>
      </div>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리자권한</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세정보</th>
          </tr>
        </thead>
        <tbody class="bg-gray-100 divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">사용자 정보를 불러오는 중...</td>
          </tr>
          <tr v-else-if="users.length === 0">
            <td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">사용자가 없습니다.</td>
          </tr>
          <tr v-else v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-textDark">{{ user.login_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ user.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="roleClass(user.isAdmin)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ user.isAdmin ? '관리자' : '사용자' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="toggleUserStatus(user.id, user.status)"
                :class="statusClass(user.status)"
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-75"
              >
                {{ userStatusMap[user.status] || user.status }}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(user.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                v-if="user.isAdmin"
                @click="updateUserRole(user.id, false)"
                class="text-purple-600 hover:text-purple-800"
              >
                해제
              </button>
              <button
                v-else
                @click="updateUserRole(user.id, true)"
                class="text-indigo-600 hover:text-indigo-800"
              >
                부여
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/admin/edit/${user.id}`" class="text-primary hover:text-primary-dark mr-3">편집</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-between items-center mt-6">
      <button
        @click="prevPage"
        :disabled="currentPage <= 1"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>
      <span class="text-gray-700">페이지 {{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig } from '#app';
import { useRouter, useRoute } from 'vue-router'; 

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

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute(); 

const users = ref<User[]>([]);
const loading = ref(true);
const searchQuery = ref(route.query.search as string || ''); 
const filterRole = ref(route.query.role as string || '');  
const filterStatus = ref(route.query.status as string || '');
const currentPage = ref(parseInt(route.query.page as string) || 1);
const totalPages = ref(1);

const userStatusMap: Record<User['status'], string> = {
  active: '활성화',
  inactive: '비활성',
};

const roleClass = (isAdmin: boolean) => {
  return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
};

const statusClass = (status: User['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'inactive':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string provided to formatDate:", dateString);
      return 'Invalid Date';
    }
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Error';
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', currentPage.value.toString());
    queryParams.append('limit', '10'); 

    if (searchQuery.value) {
      queryParams.append('search', searchQuery.value);
    }
    if (filterRole.value) {
      queryParams.append('role', filterRole.value);
    }
    if (filterStatus.value) {
      queryParams.append('status', filterStatus.value);
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    console.log('백엔드에서 받은 응답 전체 (response):', response);

    if (response && response.success) {
      if (response.users) {
        users.value = response.users.map((user: any) => ({
          ...user,
          isAdmin: user.is_admin, 
          status: user.is_active ? 'active' : 'inactive', 
        }));
        totalPages.value = response.pagination?.totalPages || 1;
        console.log('사용자 데이터 성공적으로 설정:', users.value);

        router.push({
          query: {
            page: currentPage.value.toString(),
            search: searchQuery.value || undefined,
            role: filterRole.value || undefined,
            status: filterStatus.value || undefined,
          },
        }, { replace: true });

      } else {
        console.error("백엔드 응답에 users 데이터가 없습니다.", response);
        notificationStore.showNotification('사용자 목록 응답 데이터 누락.', 'error');
      }
    } else {
      notificationStore.showNotification(response?.message || '사용자 목록을 불러오지 못했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('사용자 목록 불러오기 실패:', error);
    notificationStore.showNotification(error.data?.message || '사용자 목록 불러오기 중 네트워크 또는 서버 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const toggleUserStatus = async (userId: string, currentStatus: 'active' | 'inactive') => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const confirmMessage = `${userId}번 사용자를 '${userStatusMap[newStatus]}' 상태로 변경하시겠습니까?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: { is_active: newStatus === 'active' },
    });

    if (response.success) {
      notificationStore.showNotification(`사용자 ${userId} 상태가 ${userStatusMap[newStatus]}으로 업데이트되었습니다.`, 'success');
      fetchUsers();
    } else {
      notificationStore.showNotification(response.message || '사용자 상태 업데이트에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('사용자 상태 업데이트 실패:', error);
    notificationStore.showNotification(error.data?.message || '사용자 상태 업데이트 중 오류가 발생했습니다.', 'error');
  }
};

const updateUserRole = async (userId: string, targetIsAdmin: boolean) => {
  const action = targetIsAdmin ? '부여' : '회수';
  const confirmMessage = `${userId}번 사용자에게 관리자 권한을 ${action}하시겠습니까?`;

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: { is_admin: targetIsAdmin },
    });

    if (response.success) {
      notificationStore.showNotification(`사용자 ${userId}의 관리자 권한이 ${action}되었습니다.`, 'success');
      fetchUsers(); 
    } else {
      notificationStore.showNotification(response.message || '사용자 역할 업데이트에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('사용자 역할 업데이트 실패:', error);
    notificationStore.showNotification(error.data?.message || '사용자 역할 업데이트 중 오류가 발생했습니다.', 'error');
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchUsers();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchUsers();
  }
};

onMounted(() => {
  fetchUsers();
});

watch(
  () => route.query,
  (newQuery) => {
    const newPage = parseInt(newQuery.page as string) || 1;
    const newSearch = newQuery.search as string || '';
    const newRole = newQuery.role as string || '';
    const newStatus = newQuery.status as string || '';

    if (
      newPage !== currentPage.value ||
      newSearch !== searchQuery.value ||
      newRole !== filterRole.value ||
      newStatus !== filterStatus.value
    ) {
      currentPage.value = newPage;
      searchQuery.value = newSearch;
      filterRole.value = newRole;
      filterStatus.value = newStatus;
      fetchUsers();
    }
  },
  { deep: true } 
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
  title: '사용자 관리',
  meta: [
    { name: 'description', content: '관리자를 위한 사용자 관리 페이지입니다.' }
  ]
});
</script>

<style scoped>
</style>