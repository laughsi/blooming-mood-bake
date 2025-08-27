<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">예약하기</h1>
    <p class="text-center text-lg text-textDark mb-12">
      원하는 날짜와 시간을 선택하여 방문 예약을 진행해주세요.
    </p>

    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-textDark">예약 정보 입력</h2>
      <form @submit.prevent="submitReservation" class="space-y-6">
        <div>
          <label for="reservationDate" class="block text-sm font-medium text-gray-700">날짜</label>
          <input
            type="date"
            id="reservationDate"
            v-model="reservation.reservationDate"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          >
          <p v-if="errors.reservationDate" class="text-red-500 text-xs mt-1">{{ errors.reservationDate }}</p>
        </div>
        <div>
          <label for="reservationTime" class="block text-sm font-medium text-gray-700">시간</label>
          <div class="relative mt-1">
            <input
              type="text"
              id="reservationTimeDisplay"
              :value="formattedDisplayTime"
              @click="toggleTimePicker"
              readonly
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm cursor-pointer"
              placeholder="예: 오전 10시 30분"
              tabindex="0"
            >
            <div
              v-if="showTimePicker"
              ref="timePickerDropdown"
              class="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full flex space-x-1 p-2"
            >
              <select
                id="reservationTimeAmPm"
                v-model="selectedAmPm"
                class="block w-1/3 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                required
              >
                <option value="AM">오전</option>
                <option value="PM">오후</option>
              </select>
              <select
                id="reservationTimeHour"
                v-model="selectedHour"
                class="block w-1/3 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                required
              >
                <option value="" disabled>시</option>
                <option v-for="h in 12" :key="h" :value="h">{{ h }}시</option>
              </select>

              <select
                id="reservationTimeMinute"
                v-model="selectedMinute"
                class="block w-1/3 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary text-sm"
                required
              >
                <option value="" disabled>분</option>
                <option v-for="m in minutesOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}분</option>
              </select>
            </div>
          </div>
          <p v-if="errors.reservationTime" class="text-red-500 text-xs mt-1">{{ errors.reservationTime }}</p>
        </div>
        <div>
          <label for="numParticipants" class="block text-sm font-medium text-gray-700">인원 수</label>
          <input
            type="number"
            id="numParticipants"
            v-model.number="reservation.numParticipants"
            min="1"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            required
          >
          <p v-if="errors.numParticipants" class="text-red-500 text-xs mt-1">{{ errors.numParticipants }}</p>
        </div>
        <div>
          <label for="customerName" class="block text-sm font-medium text-gray-700">예약자 이름</label>
          <input
            type="text"
            id="customerName"
            v-model="reservation.customerName"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="이름을 입력해주세요"
            required
          >
          <p v-if="errors.customerName" class="text-red-500 text-xs mt-1">{{ errors.customerName }}</p>
        </div>
        <div>
          <label for="phoneNumber" class="block text-sm font-medium text-gray-700">연락처</label>
          <input
            type="tel"
            id="phoneNumber"
            v-model="reservation.phoneNumber"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="예: 010-1234-5678"
            required
          >
          <p v-if="errors.phoneNumber" class="text-red-500 text-xs mt-1">{{ errors.phoneNumber }}</p>
        </div>
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700">추가 요청사항 (선택)</label>
          <textarea
            id="notes"
            rows="4"
            v-model="reservation.notes"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="특별한 요청이 있다면 적어주세요."></textarea>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold"
        >
          <span v-if="loading">예약 신청 중...</span>
          <span v-else>예약 신청</span>
        </button>
        <NuxtLink
          to="/reserv/lookup"
          class="w-full text-center block bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-semibold mt-4"
        >
          예약 확인
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig, navigateTo } from '#app';
import { $fetch } from 'ofetch';

interface ReservationForm {
  reservationDate: string; 
  reservationTime: string;
  numParticipants: number;
  customerName: string; 
  phoneNumber: string;
  notes: string;
}

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const reservation = ref<ReservationForm>({
  reservationDate: '',
  reservationTime: '',
  numParticipants: 1,
  customerName: '',
  phoneNumber: '',
  notes: '',
});

const errors = ref({
  reservationDate: '',
  reservationTime: '',
  numParticipants: '',
  customerName: '',
  phoneNumber: '',
});

const loading = ref(false);

const selectedHour = ref<number | ''>('');
const selectedMinute = ref<number | ''>('');
const selectedAmPm = ref<'AM' | 'PM'>('AM'); 
const showTimePicker = ref(false); 
const timePickerDropdown = ref<HTMLElement | null>(null);

const minutesOptions = Array.from({ length: 6 }, (_, i) => i * 10); 

watch([selectedHour, selectedMinute, selectedAmPm], () => {
  if (selectedHour.value !== '' && selectedMinute.value !== '') {
    let hour = selectedHour.value;
    if (selectedAmPm.value === 'PM' && hour !== 12) {
      hour += 12;
    } else if (selectedAmPm.value === 'AM' && hour === 12) {
      hour = 0;
    }
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(selectedMinute.value).padStart(2, '0');
    reservation.value.reservationTime = `${formattedHour}:${formattedMinute}`;
  } else {
    reservation.value.reservationTime = ''; 
  }
}, { immediate: true });

const formattedDisplayTime = computed(() => {
  if (selectedHour.value === '' || selectedMinute.value === '') {
    return '';
  }
  const ampm = selectedAmPm.value === 'AM' ? '오전' : '오후';
  const hour = selectedHour.value === 0 ? 12 : selectedHour.value; 
  const minute = String(selectedMinute.value).padStart(2, '0');
  return `${ampm} ${hour}시 ${minute}분`;
});

const toggleTimePicker = () => {
  showTimePicker.value = !showTimePicker.value;
};

const handleClickOutside = (event: MouseEvent) => {
  const inputElement = document.getElementById('reservationTimeDisplay');
  if (
    showTimePicker.value &&
    inputElement && !inputElement.contains(event.target as Node) &&
    timePickerDropdown.value && !timePickerDropdown.value.contains(event.target as Node)
  ) {
    showTimePicker.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);

  if (authStore.isLoggedIn && authStore.user) {
    try {
      const response: any = await $fetch(`${config.public.apiBaseUrl}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
        },
      });
      if (response.success && response.user) {
        reservation.value.customerName = response.user.username || '';
        reservation.value.phoneNumber = response.user.phone_number || '';
      }
    } catch (error) {
      console.error('사용자 정보 불러오기 실패:', error);
      notificationStore.showNotification('사용자 정보를 불러오는 데 실패했습니다. 직접 입력해주세요.', 'warning');
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const validateForm = () => {
  let isValid = true;
  errors.value = {
    reservationDate: '',
    reservationTime: '',
    numParticipants: '',
    customerName: '',
    phoneNumber: '',
  };

  if (!reservation.value.reservationDate) {
    errors.value.reservationDate = '날짜를 선택해주세요.';
    isValid = false;
  }
  if (selectedHour.value === '' || selectedMinute.value === '') {
    errors.value.reservationTime = '시간을 선택해주세요.';
    isValid = false;
  }

  if (reservation.value.numParticipants < 1) {
    errors.value.numParticipants = '인원 수는 1명 이상이어야 합니다.';
    isValid = false;
  }
  if (!reservation.value.customerName.trim()) {
    errors.value.customerName = '예약자 이름을 입력해주세요.';
    isValid = false;
  }
  const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
  if (!reservation.value.phoneNumber.trim() || !phoneRegex.test(reservation.value.phoneNumber)) {
    errors.value.phoneNumber = '유효한 연락처를 입력해주세요 (예: 010-1234-5678).';
    isValid = false;
  }

  return isValid;
};

const submitReservation = async () => {
  if (!validateForm()) {
    notificationStore.showNotification('필수 입력 사항을 확인해주세요.', 'error');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      user_id: authStore.user?.id || null,
      product_id: null,
      reservation_date: reservation.value.reservationDate,
      reservation_time: reservation.value.reservationTime,
      num_participants: reservation.value.numParticipants,
      notes: reservation.value.notes || null,
      customerName: reservation.value.customerName,
      phoneNumber: reservation.value.phoneNumber,
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations`, {
      method: 'POST',
      headers: headers,
      body: payload,
    });

    console.log('백엔드 예약 신청 응답:', response);
    if (response.success) {
      notificationStore.showNotification('예약이 성공적으로 신청되었습니다!', 'success');
      const reservationId = response.reservation.id;

      console.log('추출된 예약 ID:', reservationId);

      if (reservationId) {
        navigateTo({
          path: '/reserv/confirm',
          query: {
            id: reservationId
          }
        });
      } else {
        console.error('백엔드 응답에 예약 ID가 포함되어 있지 않습니다.');
        notificationStore.showNotification('예약은 완료되었으나, 예약 정보를 가져오는데 문제가 발생했습니다.', 'error');
        navigateTo('/reservation');
      }

    } else {
      console.error('예약 신청 실패 응답:', response.message || '알 수 없는 오류', response);
      notificationStore.showNotification(response.message || '예약 신청에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('예약 신청 에러:', error);
    notificationStore.showNotification(error.data?.message || '예약 신청 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

useHead({
  title: '예약하기',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 방문 예약을 진행할 수 있습니다.' }
  ]
});
</script>

<style scoped>
</style>
