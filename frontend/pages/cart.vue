<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">장바구니</h1>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p class="mt-4 text-gray-500">장바구니를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="!cartStore.cartItemCount" class="text-center py-20">
      <p class="text-xl text-gray-500">장바구니가 비어있습니다.</p>
      <NuxtLink to="/menu"
        class="mt-6 inline-block bg-primary text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-primary-dark transition-colors duration-300">
        메뉴 보러 가기
      </NuxtLink>
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-8">
      <div class="lg:w-3/4">
        <ul class="space-y-6">
          <li v-for="item in cartStore.cartItems" :key="item.product_id"
            class="flex items-center bg-gray-100 p-4 rounded-lg shadow-md">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name"
              class="w-20 h-20 object-cover rounded-md mr-4" />
            <div v-else
              class="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md mr-4 text-xs text-gray-500 font-medium text-center p-1">
              이미지<br />없음
            </div>

            <div class="flex-grow">
              <h3 class="text-lg font-semibold text-gray-800">{{ item.name }}</h3>
              <p class="text-gray-600">{{ item.price.toLocaleString() }}원</p>
            </div>
            <div class="flex items-center space-x-2">
              <button @click="cartStore.decreaseQuantity(item.product_id)"
                class="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200">-</button>
              <span class="font-medium w-6 text-center">{{ item.quantity }}</span>
              <button @click="cartStore.increaseQuantity(item.product_id)"
                class="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors duration-200"
                :disabled="item.quantity >= item.stock">+</button>
            </div>
            <button @click="handleRemoveItem(item.product_id)"
              class="ml-4 text-red-500 hover:text-red-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        </ul>
      </div>

      <div class="lg:w-1/4 bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">결제 정보</h2>
        <div class="flex justify-between text-gray-700 mb-2">
          <span>총 상품 금액</span>
          <span>{{ cartStore.cartTotalPrice.toLocaleString() }}원</span>
        </div>
        <div class="flex justify-between text-gray-700 mb-4 border-b pb-4">
          <span>배송비</span>
          <span>{{ deliveryFee.toLocaleString() }}원</span>
        </div>
        <div class="flex justify-between text-xl font-bold text-gray-800 mb-4 border-b pb-4">
          <span>총 결제 금액</span>
          <span>{{ cartTotalWithFee.toLocaleString() }}원</span>
        </div>

        <div class="mb-4 mt-4">
          <div class="flex items-center justify-between space-x-4">
            <label class="flex items-center cursor-pointer">
              <input type="radio" v-model="deliveryMethod" value="pickup" class="form-radio text-primary h-4 w-4 mr-2" />
              <span class="text-gray-700">픽업 및 식사</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input type="radio" v-model="deliveryMethod" value="delivery" class="form-radio text-primary h-4 w-4 mr-2" />
              <span class="text-gray-700">배송</span>
            </label>
          </div>
        </div>
        <NuxtLink 
          :to="{ path: '/order', query: { deliveryMethod: deliveryMethod } }"
          class="mt-6 block w-full bg-primary text-white font-semibold py-3 rounded-lg shadow text-center hover:bg-primary-dark transition-colors duration-300">
          주문하기
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '~/stores/cart';
import { useNotificationStore } from '~/stores/notification';
import { useRuntimeConfig } from '#app';

const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;

const loading = ref(true);
const deliveryMethod = ref('pickup'); // 'pickup' 또는 'delivery'

// 배송비 계산
const deliveryFee = computed(() => {
  return deliveryMethod.value === 'delivery' ? 5000 : 0;
});

// 총 결제 금액 계산 (상품 금액 + 배송비)
const cartTotalWithFee = computed(() => {
  return cartStore.cartTotalPrice + deliveryFee.value;
});

const handleRemoveItem = async (productId: string) => {
  const result = await cartStore.removeItem(productId);
  if (result.success) {
    notificationStore.showNotification(result.message, 'success');
  } else {
    notificationStore.showNotification(result.message, 'error');
  }
};

onMounted(() => {
  cartStore.initialize();
  loading.value = false;
});

useHead({
  title: '장바구니',
  meta: [
    { name: 'description', content: '장바구니에 담긴 상품을 확인하고 주문하세요.' }
  ],
});
</script>

<style scoped>
</style>