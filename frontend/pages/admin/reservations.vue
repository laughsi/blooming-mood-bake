<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-4xl md:text-4xl font-bold text-center mb-6 text-primary">예약 관리</h1>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="고객명, 예약 코드 검색..."
          class="flex-1 px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @keyup.enter="fetchReservations"
        />
        <input
          type="date"
          v-model="filterDate"
          class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @change="fetchReservations"
        />
        <select
          v-model="filterStatus"
          class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @change="fetchReservations"
        >
          <option value="">모든 상태</option>
          <option value="pending">대기 중</option>
          <option value="confirmed">확정됨</option>
          <option value="completed">완료됨</option>
          <option value="cancelled">취소됨</option>
        </select>
        <button
          @click="fetchReservations"
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 코드</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 날짜</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약 시간</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">인원</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세정보</th>
          </tr>
        </thead>
        <tbody class="bg-gray-100 divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">예약 정보를 불러오는 중...</td>
          </tr>
          <tr v-else-if="reservations.length === 0">
            <td colspan="8" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">예약 내역이 없습니다.</td>
          </tr>
          <tr v-else v-for="reservation in reservations" :key="reservation.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-textDark">{{ reservation.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ reservation.customer_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ reservation.phone_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(reservation.reservation_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatTime(reservation.reservation_time) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ reservation.num_participants }}명</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(reservation.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ reservationStatusMap[reservation.status] }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink :to="`/admin/reserv/${reservation.id}`" class="text-primary hover:text-primary-dark mr-3">상세</NuxtLink>
              <button v-if="reservation.status === 'pending'" @click="updateReservationStatus(reservation.id, 'confirmed')" class="text-green-600 hover:text-green-800 mr-3">확정</button>
              <button v-if="reservation.status !== 'cancelled'" @click="updateReservationStatus(reservation.id, 'cancelled')" class="text-red-600 hover:text-red-800 mr-3">취소</button>
              <button @click="deleteReservation(reservation.id)" class="text-gray-600 hover:text-gray-800">삭제</button>
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
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig, navigateTo } from '#app';
import { $fetch } from 'ofetch';

interface Reservation {
  id: string;
  user_id: number | null;
  customer_name: string;
  phone_number: string;
  product_id: string | null;
  product_name: string | null;
  reservation_date: string;
  reservation_time: string;
  num_participants: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const reservations = ref<Reservation[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterDate = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);

const reservationStatusMap: Record<Reservation['status'], string> = {
  pending: '대기 중',
  confirmed: '확정됨',
  completed: '완료됨',
  cancelled: '취소됨',
};

const statusClass = (status: Reservation['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
};

const formatTime = (timeString: string) => {
  if (!timeString) return '-';
  const [hourStr, minuteStr] = timeString.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);

  const ampm = hour < 12 ? '오전' : '오후';
  if (hour > 12) {
    hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }

  return `${ampm} ${hour}시 ${String(minute).padStart(2, '0')}분`;
};

const fetchReservations = async () => {
  loading.value = true;
  try {
    if (!authStore.token) {
      console.error('토큰이 없어 API 요청을 보낼 수 없습니다. 로그인 상태를 확인하세요.');
      notificationStore.showNotification('로그인이 필요합니다.', 'error');
      loading.value = false;
      navigateTo('/login');
      return;
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/admin`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      params: {
        page: currentPage.value,
        search: searchQuery.value,
        date: filterDate.value,
        status: filterStatus.value,
        limit: 10
      }
    });

    if (response.success) {
      reservations.value = response.reservations;
      totalPages.value = response.pagination.totalPages;
      if (totalPages.value === 0 && reservations.value.length === 0) {
        totalPages.value = 1;
      }
    } else {
      notificationStore.showNotification(response.message || '예약 목록을 불러오지 못했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('예약 목록 불러오기 실패:', error);
    notificationStore.showNotification(error.data?.message || '예약 목록 불러오기 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const updateReservationStatus = async (
  reservationId: string,
  newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
) => {
  if (!confirm(`${reservationId}코드 에약의 상태를 '${reservationStatusMap[newStatus]}'으로 변경하시겠습니까?`)) {
    return;
  }
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/admin/${reservationId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: { status: newStatus },
    });

    if (response.success) {
      notificationStore.showNotification(`예약코드 ${reservationId} 상태가 업데이트되었습니다.`, 'success');
      fetchReservations();
    } else {
      notificationStore.showNotification(response.message || '예약 상태 업데이트에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('예약 상태 업데이트 실패:', error);
    notificationStore.showNotification(error.data?.message || '예약 상태 업데이트 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const deleteReservation = async (reservationId: string) => {
  if (!confirm(`예약 코드 ${reservationId}를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }

  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (response.success) {
      notificationStore.showNotification(`예약 코드 ${reservationId}가 성공적으로 삭제되었습니다.`, 'success');
      fetchReservations();
    } else {
      notificationStore.showNotification(response.message || '예약 삭제에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('예약 삭제 실패:', error);
    notificationStore.showNotification(error.data?.message || '예약 삭제 중 오류가 발생했습니다.', 'error');
  }
};


const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchReservations();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchReservations();
  }
};

onMounted(() => {
  fetchReservations();
});

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
  title: '예약 관리',
  meta: [
    { name: 'description', content: '관리자를 위한 예약 관리 페이지입니다.' }
  ]
});
</script>

<style scoped>
</style>