<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">예약 상세 (관리자)</h1>
    <p class="text-center text-lg text-textDark mb-12">
      특정 예약의 상세 정보를 확인하고 관리합니다.
    </p>

    <div v-if="pending" class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
      <p class="text-lg text-gray-500">예약 정보를 불러오는 중...</p>
    </div>

    <div v-else-if="error" class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
      <p class="text-lg text-red-500">
        예약 정보를 불러오는 데 실패했습니다: {{ error.message || '알 수 없는 오류' }}
      </p>
      <NuxtLink to="/admin/reservations" class="inline-block mt-4 text-primary hover:underline">
        관리자 예약 목록으로 돌아가기
      </NuxtLink>
    </div>

    <div v-else-if="reservationDetails" class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-4">
      <h2 class="text-2xl font-semibold mb-4 text-textDark">예약 상세 정보</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-medium text-gray-700">예약 번호:</p>
          <p class="text-lg font-semibold text-primary">{{ reservationDetails.id }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-700">예약자 이름:</p>
          <p class="text-lg text-textDark">{{ reservationDetails.customer_name }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-700">연락처:</p>
          <p class="text-lg text-textDark">{{ reservationDetails.phone_number }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-700">인원 수:</p>
          <p class="text-lg text-textDark">{{ reservationDetails.num_participants }}명</p>
        </div>
        <div>
          <p class="font-medium text-gray-700">예약 날짜:</p>
          <p class="text-lg text-textDark">{{ formatDate(reservationDetails.reservation_date) }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-700">예약 시간:</p>
          <p class="text-lg text-textDark">{{ formatTime(reservationDetails.reservation_time) }}</p>
        </div>

        <div>
          <p class="font-medium text-gray-700">예약 상태:</p>
          <p :class="statusClass(reservationDetails.status)" class="text-lg font-semibold">
            {{ reservationStatusMap[reservationDetails.status] || reservationDetails.status }}
          </p>
        </div>
        <div v-if="reservationDetails.notes" class="pb-2">
          <p class="font-medium text-gray-700">추가 요청사항:</p>
          <p class="text-lg text-textDark">{{ reservationDetails.notes }}</p>
        </div>
      </div>

      <div class="mt-6">
        <label for="status-select" class="block text-gray-700 text-sm font-bold mb-2">예약 상태 변경:</label>
        <select
          id="status-select"
          v-model="newStatus"
          @change="updateReservationStatus"
          class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="pending">대기 중</option>
          <option value="confirmed">확정됨</option>
          <option value="completed">완료됨</option>
          <option value="cancelled">취소됨</option>
        </select>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink to="/admin/reservations" class="inline-block bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 transition-colors duration-300 font-semibold mr-4">
          목록으로 돌아가기
        </NuxtLink>
      </div>
    </div>
    <div v-else class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto text-center">
      <p class="text-lg text-red-500">예약 정보를 찾을 수 없습니다.</p>
      <NuxtLink to="/admin/reservations" class="inline-block mt-4 text-primary hover:underline">
        관리자 예약 목록으로 돌아가기
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, navigateTo, useRuntimeConfig, useAsyncData } from '#app';
import { $fetch } from 'ofetch';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';

const route = useRoute();
const config = useRuntimeConfig();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

interface ReservationDetails {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string; 
  phone_number: string; 
  product_id: string | null;
  product_name: string | null;
  product_description: string | null;
  reservation_date: string;
  reservation_time: string;
  num_participants: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

const reservationStatusMap: Record<ReservationDetails['status'], string> = {
  pending: '대기 중',
  confirmed: '확정됨',
  completed: '완료됨',
  cancelled: '취소됨',
};

const statusClass = (status: ReservationDetails['status']) => {
  switch (status) {
    case 'pending': return 'text-yellow-800';
    case 'confirmed': return 'text-blue-800';
    case 'completed': return 'text-green-800';
    case 'cancelled': return 'text-red-800';
    default: return 'text-gray-800';
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


const reservationId = route.params.id as string;
const newStatus = ref<ReservationDetails['status']>('pending');

const { data: reservationDetails, pending, error, refresh } = await useAsyncData<ReservationDetails | null>(
  `admin-reservation-${reservationId}`,
  async () => {
    console.log('useAsyncData (Admin): 예약 ID 확인:', reservationId);

    if (!reservationId) {
      await navigateTo('/admin/reservations', { redirectCode: 302 });
      return null;
    }

    try {
      if (!authStore.isLoggedIn || !authStore.isAdmin) {
          notificationStore.showNotification('관리자 권한이 필요합니다.', 'error');
          await navigateTo('/admin/login', { redirectCode: 403 }); 
          return null;
      }
      if (!authStore.token) {
          notificationStore.showNotification('인증 토큰이 없습니다. 다시 로그인해주세요.', 'error');
          await navigateTo('/admin/login', { redirectCode: 401 }); 
          return null;
      }

      console.log(`useAsyncData (Admin): Fetching reservation details for ID: ${reservationId}`);
      const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/${reservationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`, 
        },
      });
      console.log('useAsyncData (Admin): API response for reservation details:', response);

      if (response.success && response.reservation) {
        newStatus.value = response.reservation.status; 
        return response.reservation;
      } else {
        notificationStore.showNotification(response.message || '예약 정보를 불러오지 못했습니다.', 'error');
        console.error('useAsyncData (Admin): 예약 정보 불러오기 실패:', response.message);
        throw new Error(response.message || '예약 정보를 찾을 수 없습니다.');
      }
    } catch (e: any) {
      console.error('useAsyncData (Admin): 예약 정보 불러오기 중 오류 발생:', e);
      notificationStore.showNotification(e.data?.message || '예약 정보를 불러오는 중 네트워크 오류가 발생했습니다.', 'error');
      throw e;
    }
  },
  {
    watch: [() => route.params.id],
    immediate: true,
  }
);

const updateReservationStatus = async () => {
  if (!reservationDetails.value || !newStatus.value) return;

  if (reservationDetails.value.status === newStatus.value) {
    notificationStore.showNotification('현재 상태와 동일합니다.', 'info');
    return;
  }

  try {
    const confirmUpdate = confirm(`예약 상태를 "${reservationStatusMap[newStatus.value]}"(으)로 변경하시겠습니까?`);
    if (!confirmUpdate) return;

    notificationStore.showNotification('예약 상태를 업데이트 중입니다...', 'info');

    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/admin/${reservationDetails.value.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: { status: newStatus.value },
    });

    if (response.success) {
      notificationStore.showNotification('예약 상태가 성공적으로 업데이트되었습니다.', 'success');
      refresh();
    } else {
      notificationStore.showNotification(response.message || '예약 상태 업데이트에 실패했습니다.', 'error');
    }
  } catch (e: any) {
    console.error('예약 상태 업데이트 오류:', e);
    notificationStore.showNotification(e.data?.message || '예약 상태 업데이트 중 네트워크 오류가 발생했습니다.', 'error');
  }
};

useHead({
  title: '예약 상세 (관리자)',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 관리자 예약 상세 페이지입니다.' }
  ]
});

onMounted(() => {
  if (reservationDetails.value) {
    newStatus.value = reservationDetails.value.status;
  }
});
</script>

<style scoped>
</style>