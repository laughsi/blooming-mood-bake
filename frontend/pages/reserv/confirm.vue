<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">예약 확인</h1>
    <p class="text-center text-lg text-textDark mb-12">
      예약 상세 정보를 확인해주세요.
    </p>

    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-textDark">예약 상세</h2>

      <div v-if="loading" class="text-center py-8">
        <p class="text-lg text-gray-600">예약 정보를 불러오는 중입니다...</p>
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mt-4"></div>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-lg text-red-500">{{ error }}</p>
        <NuxtLink to="/reserv/lookup" class="mt-6 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold">
          예약 다시 조회하기
        </NuxtLink>
      </div>

      <div v-else-if="reservationList.length > 0 && !route.query.id">
        <h3 class="text-xl font-semibold mb-4 text-textDark">나의 예약 목록</h3>
        <ul class="space-y-4">
          <li v-for="res in reservationList" :key="res.id"
              class="bg-gray-50 p-4 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <p class="text-lg font-semibold text-primary">{{ formatDate(res.reservation_date) }} {{ formatTime(res.reservation_time) }}</p>
              <p class="text-gray-700">인원: {{ res.num_participants }}명, 상태:
                <span :class="{'text-green-600': res.status === 'confirmed', 'text-yellow-600': res.status === 'pending', 'text-red-600': res.status === 'cancelled'}" class="font-semibold">
                  {{ res.status === 'pending' ? '대기 중' : res.status === 'confirmed' ? '확정됨' : res.status === 'cancelled' ? '취소됨' : res.status }}
                </span>
              </p>
            </div>
            <NuxtLink :to="`/reserv/confirm?id=${res.id}&customerName=${route.query.customerName}&phoneNumber=${route.query.phoneNumber}`"
                      class="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300">
              상세 보기
            </NuxtLink>
          </li>
        </ul>
        <div class="pt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <NuxtLink to="/reservation" class="w-full sm:w-auto text-center block bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-semibold">
            새로운 예약하기
          </NuxtLink>
          <button @click="router.back()" class="w-full sm:w-auto bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300 font-semibold">
            뒤로가기
          </button>
        </div>
      </div>

      <div v-else-if="reservationDetails && route.query.id" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">예약 번호:</span>
          <span class="text-lg font-semibold text-primary break-all">{{ reservationDetails.id }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">예약 날짜:</span>
          <span class="text-gray-900">{{ formatDate(reservationDetails.reservation_date) }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">예약 시간:</span>
          <span class="text-gray-900">{{ formatTime(reservationDetails.reservation_time) }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">인원 수:</span>
          <span class="text-gray-900">{{ reservationDetails.num_participants }} 명</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">예약자 이름:</span>
          <span class="text-gray-900">{{ reservationDetails.customer_name }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">연락처:</span>
          <span class="text-gray-900">{{ reservationDetails.phone_number }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">예약 상태:</span>
          <span :class="{'text-green-600': reservationDetails.status === 'confirmed', 'text-yellow-600': reservationDetails.status === 'pending', 'text-red-600': reservationDetails.status === 'cancelled'}" class="font-semibold">
            {{ reservationDetails.status === 'pending' ? '대기 중' : reservationDetails.status === 'confirmed' ? '확정됨' : reservationDetails.status === 'cancelled' ? '취소됨' : reservationDetails.status }}
          </span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">추가 요청사항:</span>
          <span class="text-gray-900">{{ reservationDetails.notes }}</span>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
          <span class="font-medium text-gray-700">신청 일시:</span>
          <span class="text-gray-900">{{ new Date(reservationDetails.created_at).toLocaleString() }}</span>
        </div>

        <div class="pt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <NuxtLink to="/reservation" class="w-full sm:w-auto text-center block bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-semibold">
            새로운 예약하기
          </NuxtLink>
          <button @click="router.back()" class="w-full sm:w-auto bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-300 font-semibold">
            뒤로가기
          </button>
          <button
            v-if="['pending', 'confirmed'].includes(reservationDetails.status)"
            @click="confirmCancelReservation"
            :disabled="isCancelling"
            class="w-full sm:w-auto bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors duration-300 font-semibold"
          >
            <span v-if="isCancelling">취소 중...</span>
            <span v-else>예약 취소</span>
          </button>
          <button
            v-else
            disabled
            class="w-full sm:w-auto bg-gray-400 text-white py-3 px-4 rounded-md cursor-not-allowed font-semibold"
          >
            이미 취소되거나 완료된 예약
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-lg text-gray-600">조회된 예약이 없습니다.</p>
        <NuxtLink to="/reserv/lookup" class="mt-6 inline-block bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold">
          예약 다시 조회하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRuntimeConfig, useRouter } from '#app'; 
import { $fetch } from 'ofetch';
import { useAuthStore } from '@/stores/auth';
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

const route = useRoute();
const router = useRouter(); 
const config = useRuntimeConfig();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const reservationDetails = ref<Reservation | null>(null); 
const reservationList = ref<Reservation[]>([]); 
const loading = ref(true);
const error = ref<string | null>(null);
const isCancelling = ref(false); 

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

const fetchReservationData = async () => {
  loading.value = true;
  error.value = null;
  reservationDetails.value = null;
  reservationList.value = [];

  const reservationId = route.query.id as string;
  const customerName = route.query.customerName as string;
  const phoneNumber = route.query.phoneNumber as string;

  console.log('reserv/confirm.vue: fetchReservationData - Query Params:', { reservationId, customerName, phoneNumber });

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authStore.token) {
    headers['Authorization'] = `Bearer ${authStore.token}`;
  }

  try {
    if (reservationId) {
      const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/${reservationId}`, {
        method: 'GET',
        headers: headers,
        query: { 
          customerName: customerName,
          phoneNumber: phoneNumber,
        },
      });

      if (response.success && response.reservation) {
        reservationDetails.value = response.reservation;
        notificationStore.showNotification('예약 정보를 성공적으로 불러왔습니다.', 'success');
      } else {
        error.value = response.message || '예약 정보를 불러오는 데 실패했습니다.';
        notificationStore.showNotification(error.value, 'error');
      }
    } else if (customerName && phoneNumber) {
      const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/lookup`, {
        method: 'GET',
        query: {
          customerName: customerName,
          phoneNumber: phoneNumber,
        },
        headers: headers,
      });

      if (response.success && response.reservations) {
        if (response.reservations.length > 0) {
          reservationList.value = response.reservations;
          notificationStore.showNotification('예약 목록을 성공적으로 불러왔습니다.', 'success');
        } else {
          error.value = '해당 정보로 예약된 내역이 없습니다.';
          notificationStore.showNotification(error.value, 'info');
        }
      } else {
        error.value = response.message || '예약 목록을 불러오는 데 실패했습니다.';
        notificationStore.showNotification(error.value, 'error');
      }
    } else {
      error.value = '예약 정보를 조회할 수 없습니다. 예약 번호 또는 이름/연락처를 입력해주세요.';
      notificationStore.showNotification(error.value, 'warning');
      router.replace('/reserv/lookup');
    }
  } catch (err: any) {
    console.error('예약 정보 불러오기 에러:', err);
    error.value = err.data?.message || '예약 정보를 불러오는 중 오류가 발생했습니다.';
    notificationStore.showNotification(error.value, 'error');
    router.replace('/reserv/lookup');
  } finally {
    loading.value = false;
  }
};

const confirmCancelReservation = async () => {
  if (!reservationDetails.value || !reservationDetails.value.id) {
    notificationStore.showNotification('취소할 예약 정보가 없습니다.', 'error');
    return;
  }

  if (['cancelled', 'completed'].includes(reservationDetails.value.status)) {
    notificationStore.showNotification('이미 취소되었거나 완료된 예약입니다.', 'info');
    return;
  }

  if (confirm(`예약 코드 ${reservationDetails.value.id}를 정말로 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    cancelReservation(); 
  }
};

const cancelReservation = async () => {
  if (!reservationDetails.value || !reservationDetails.value.id) {
    notificationStore.showNotification('취소할 예약 정보가 없습니다.', 'error');
    return;
  }

  isCancelling.value = true;
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/${reservationDetails.value.id}/status`, {
      method: 'PUT',
      headers: headers,
      body: { 
        status: 'cancelled',
        customer_name: route.query.customerName, 
        phone_number: route.query.phoneNumber
      },
    });

    if (response.success) {
      notificationStore.showNotification('예약이 성공적으로 취소되었습니다.', 'success');
      await fetchReservationData(); 
    } else {
      console.error('예약 취소 실패 응답:', response.message || '알 수 없는 오류', response);
      notificationStore.showNotification(response.message || '예약 취소에 실패했습니다.', 'error');
    }
  } catch (err: any) {
    console.error('예약 취소 에러:', err);
    notificationStore.showNotification(err.data?.message || '예약 취소 중 오류가 발생했습니다.', 'error');
  } finally {
    isCancelling.value = false;
  }
};

onMounted(() => {
  fetchReservationData();
});

watch(
  () => route.query,
  () => {
    fetchReservationData();
  },
  { deep: true } 
);

useHead({
  title: '예약 확인',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 예약 상세 정보를 확인합니다.' }
  ]
});
</script>

<style scoped>
</style>