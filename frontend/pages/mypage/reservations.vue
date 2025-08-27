<template>
  <div class="w-full py-8 px-4">
    <h2 class="text-3xl font-bold text-center mb-8 text-primary">나의 예약 내역</h2>

    <div v-if="loading" class="text-center py-8">
      <p class="text-lg text-gray-600">예약 내역을 불러오는 중입니다...</p>
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mt-4"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-xl text-red-500">{{ error }}</p>
      <NuxtLink to="/" class="mt-6 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold">
        홈으로 돌아가기
      </NuxtLink>
    </div>

    <div v-else-if="reservations.length === 0" class="text-center py-8">
      <p class="text-xl text-gray-700">아직 예약 내역이 없습니다.</p>
      <NuxtLink to="/reservation" class="mt-6 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold">
        새로운 예약하기
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div v-for="res in reservations" :key="res.id"
           class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 class="text-xl font-semibold mb-3 text-primary">예약 일시: {{ formatDate(res.reservation_date) }} {{ formatTime(res.reservation_time) }}</h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">예약 번호:</span> {{ res.id }}</div>
          <div><span class="font-medium">예약자:</span> {{ res.customer_name }}</div>
          <div><span class="font-medium">연락처:</span> {{ res.phone_number }}</div>
          <div><span class="font-medium">인원:</span> {{ res.num_participants }}명</div>
          <div class="md:col-span-2"><span class="font-medium">추가 요청사항:</span> {{ res.notes || '-' }}</div>
          <div class="md:col-span-2">
            <span class="font-medium">예약 상태:</span>
            <span :class="{'text-green-600': res.status === 'confirmed', 'text-yellow-600': res.status === 'pending', 'text-red-600': res.status === 'cancelled', 'font-semibold': true}">
              {{ formatStatus(res.status) }}
            </span>
          </div>
          <div class="md:col-span-2"><span class="font-medium">신청 일시:</span> {{ new Date(res.created_at).toLocaleString('ko-KR') }}</div>
        </div>

        <div class="mt-6 flex flex-wrap gap-3 justify-end">
          <NuxtLink :to="`/reserv/confirm?id=${res.id}`"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300">
            상세 보기
          </NuxtLink>
          <button
            v-if="['pending', 'confirmed'].includes(res.status)"
            @click="confirmCancelReservation(res)" :disabled="isCancelling === res.id"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
          >
            <span v-if="isCancelling === res.id">취소 중...</span>
            <span v-else>예약 취소</span>
          </button>
          <button
            v-else
            disabled
            class="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
          >
            취소 불가
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig } from '#app';
import { $fetch } from 'ofetch';
import { useNotificationStore } from '@/stores/notification';

interface Reservation {
  id: string; 
  user_id: string | null;
  product_id: string | null; 
  reservation_date: string; 
  reservation_time: string; 
  num_participants: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  customer_name: string; 
  phone_number: string; 
  created_at: string;
  updated_at: string;
}

const authStore = useAuthStore();
const config = useRuntimeConfig();
const notificationStore = useNotificationStore();

const reservations = ref<Reservation[]>([]); 
const loading = ref(true);
const error = ref<string | null>(null);
const isCancelling = ref<string | null>(null); 

definePageMeta({
  requiresAuth: true,
  middleware: ['auth']
});

useHead({
  title: '나의 예약 내역',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 나의 예약 내역을 확인하는 페이지입니다.' }
  ]
});

const fetchUserReservations = async () => {
  if (!authStore.isLoggedIn || !authStore.currentUser?.id) {
    error.value = '로그인 정보가 없습니다. 다시 로그인 해주세요.';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const userId = authStore.currentUser.id;
    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`, 
      },
    });

    if (response.success && Array.isArray(response.data)) {
      reservations.value = response.data;
      console.log('사용자 예약 내역:', reservations.value);
    } else if (response.success && response.data === null) {
      reservations.value = [];
      console.log('예약 내역이 없습니다.');
    }
    else {
      error.value = response.message || '예약 내역을 불러오는 데 실패했습니다.';
      notificationStore.showNotification(error.value, 'error');
      console.error('예약 내역 API 응답 오류:', response);
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '네트워크 오류가 발생했습니다.';
    notificationStore.showNotification(error.value, 'error');
    console.error('예약 내역 불러오기 에러:', err);
  } finally {
    loading.value = false;
  }
};

const confirmCancelReservation = async (reservation: Reservation) => { 
  if (['cancelled', 'completed'].includes(reservation.status)) {
    notificationStore.showNotification('이미 취소되었거나 완료된 예약입니다.', 'info');
    return;
  }

  if (confirm(`예약 번호 ${reservation.id}를 정말로 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    await cancelReservation(reservation);
  }
};

const cancelReservation = async (reservation: Reservation) => { 
  isCancelling.value = reservation.id; 
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/${reservation.id}/status`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({ 
        status: 'cancelled',
        customer_name: reservation.customer_name, 
        phone_number: reservation.phone_number,  
      }),
    });

    if (response.success) {
      notificationStore.showNotification('예약이 성공적으로 취소되었습니다.', 'success');
      await fetchUserReservations(); 
    } else {
      console.error('예약 취소 실패 응답:', response.message || '알 수 없는 오류', response);
      notificationStore.showNotification(response.message || '예약 취소에 실패했습니다.', 'error');
    }
  } catch (err: any) {
    console.error('예약 취소 에러:', err);
    notificationStore.showNotification(err.data?.message || '예약 취소 중 오류가 발생했습니다.', 'error');
  } finally {
    isCancelling.value = null; 
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

const formatStatus = (status: string) => {
  switch (status) {
    case 'pending': return '대기 중';
    case 'confirmed': return '확정됨';
    case 'completed': return '완료됨';
    case 'cancelled': return '취소됨';
    default: return status;
  }
};

onMounted(() => {
  fetchUserReservations();
});
</script>

<style scoped>
.text-primary { @apply text-orange-500; } 
.bg-primary { @apply bg-orange-500; }
.hover\:bg-primary-dark { @apply hover:bg-orange-600; }
.border-primary { @apply border-orange-500; }
.text-textDark { @apply text-gray-800; }
</style>