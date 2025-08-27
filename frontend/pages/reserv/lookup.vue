<template>
  <div class="w-full py-16 px-4">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8 text-primary">예약 조회</h1>
    <p class="text-center text-lg text-textDark mb-12">
      예약자 이름과 연락처를 입력하여 예약 정보를 조회해주세요.
    </p>

    <div class="bg-gray-100 p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-textDark">예약 정보 입력</h2>
      <form @submit.prevent="lookupReservation" class="space-y-6">
        <div>
          <label for="customerNameLookup" class="block text-sm font-medium text-gray-700">예약자 이름</label>
          <input
            type="text"
            id="customerNameLookup"
            v-model="lookupForm.customerName"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="이름을 입력해주세요"
            required
          >
          <p v-if="errors.customerName" class="text-red-500 text-xs mt-1">{{ errors.customerName }}</p>
        </div>
        <div>
          <label for="phoneNumberLookup" class="block text-sm font-medium text-gray-700">연락처</label>
          <input
            type="tel"
            id="phoneNumberLookup"
            v-model="lookupForm.phoneNumber"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="예: 010-1234-5678"
            required
          >
          <p v-if="errors.phoneNumber" class="text-red-500 text-xs mt-1">{{ errors.phoneNumber }}</p>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors duration-300 font-semibold"
        >
          <span v-if="loading">조회 중...</span>
          <span v-else>예약 조회</span>
        </button>
        <NuxtLink
          to="/reservation"
          class="w-full text-center block bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-300 font-semibold mt-4"
        >
          새로운 예약하기
        </NuxtLink>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig, navigateTo } from '#app';
import { $fetch } from 'ofetch';

const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const lookupForm = ref({
  customerName: '',
  phoneNumber: '',
});

const errors = ref({
  customerName: '',
  phoneNumber: '',
});

const loading = ref(false);

const validateForm = () => {
  let isValid = true;
  errors.value = {
    customerName: '',
    phoneNumber: '',
  };

  if (!lookupForm.value.customerName.trim()) {
    errors.value.customerName = '예약자 이름을 입력해주세요.';
    isValid = false;
  }
  const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
  if (!lookupForm.value.phoneNumber.trim() || !phoneRegex.test(lookupForm.value.phoneNumber)) {
    errors.value.phoneNumber = '유효한 연락처를 입력해주세요 (예: 010-1234-5678).';
    isValid = false;
  }

  return isValid;
};

const lookupReservation = async () => {
  if (!validateForm()) {
    notificationStore.showNotification('필수 입력 사항을 확인해주세요.', 'error');
    return;
  }

  loading.value = true;
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/reservations/lookup`, {
      method: 'GET',
      query: {
        customerName: lookupForm.value.customerName,
        phoneNumber: lookupForm.value.phoneNumber,
      },
    });

    if (response.success && response.reservations && response.reservations.length > 0) {
      notificationStore.showNotification('예약 정보를 찾았습니다!', 'success');
      navigateTo({
        path: '/reserv/confirm',
        query: {
          customerName: lookupForm.value.customerName,
          phoneNumber: lookupForm.value.phoneNumber,
        }
      });
    } else {
      console.error('예약 조회 실패 응답:', response.message || '알 수 없는 오류', response);
      notificationStore.showNotification(response.message || '해당 정보로 예약된 내역을 찾을 수 없습니다.', 'error');
    }
  } catch (error: any) {
    console.error('예약 조회 에러:', error);
    notificationStore.showNotification(error.data?.message || '예약 조회 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

useHead({
  title: '예약 조회',
  meta: [
    { name: 'description', content: '블루밍무드베이킹 예약 정보를 이름과 연락처로 조회합니다.' }
  ]
});
</script>

<style scoped>
</style>
