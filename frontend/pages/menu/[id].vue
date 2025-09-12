<template>
  <div class="container mx-auto px-4 py-12">
    <div v-if="pending" class="text-center py-20">
      <p class="text-gray-500">메뉴 정보를 불러오는 중입니다... ⏳</p>
    </div>
    <div v-else-if="error" class="text-center py-20">
      <p class="text-red-500">메뉴를 불러오는 데 실패했습니다. 🚫</p>
    </div>
    <div v-else-if="menuItem && menuItem.success && menuItem.product" class="flex flex-col lg:flex-row items-start gap-12 max-w-6xl mx-auto">
      <div class="lg:w-1/2 w-full flex flex-col items-center">
        <img :src="menuItem.product.imageUrl" :alt="menuItem.product.name" class="w-full rounded-lg shadow-xl object-cover aspect-square">
      </div>

      <div class="lg:w-1/2 w-full flex flex-col justify-between p-4">
        <div>
          <h1 class="text-4xl md:text-4xl font-bold text-primary mb-2">{{ menuItem.product.name }}({{ menuItem.product.category_name }})</h1>

          <div class="text-lg flex items-center gap-2 mb-6 text-2xl">
            <span>{{ formattedPrice }}</span>
            <span v-if="formattedPrice !== '별도 문의'">원</span>
          </div>
          <hr class="border-t border-gray-300 mb-6" />

          <div class="mb-6">
            <h3 class="text-2xl font-semibold mb-2 text-primary">상품 설명</h3>
            <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{{ menuItem.product.description }}</p>
          </div>
          
          <div class="text-sm text-gray-500 mb-2">
            <p>재고 수량: {{ menuItem.product.stock }}개</p>
          </div>
          <hr class="border-t border-gray-300 mb-8" />
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <button @click="buyNow" 
            :disabled="menuItem.product.stock === 0"
            class="w-full bg-secondary text-textLight font-bold py-4 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
            구매하기
          </button>
          
          <button @click="addToCart" 
            :disabled="menuItem.product.stock === 0"
            class="w-full bg-primary text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
            장바구니
          </button>

          <button @click="goBack" class="w-full bg-gray-300 text-gray-800 font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-400 transition-all duration-300 text-lg">
            뒤로 가기
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-20">
      <p class="text-gray-500">해당 메뉴를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData, useRuntimeConfig, navigateTo } from '#app';
import { $fetch } from 'ofetch';
import { useCartStore } from '~/stores/cart';
import { useNotificationStore } from '~/stores/notification';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const API_URL = config.public.apiBaseUrl;

const cartStore = useCartStore();
const notificationStore = useNotificationStore();

const menuId = route.params.id as string;

const { data: menuItem, pending, error } = await useAsyncData(`menuItem-${menuId}`, () =>
  $fetch(`${API_URL}/products/${menuId}`)
);

const formattedPrice = computed(() => {
  if (menuItem.value && menuItem.value.product && typeof menuItem.value.product.price === 'number') {
    const priceValue = menuItem.value.product.price;
    if (priceValue === 0) {
      return '별도 문의';
    }
    return priceValue.toLocaleString();
  }
  return '가격 정보 없음';
});

const buyNow = async () => {
  if (!menuItem.value || !menuItem.value.product) {
    notificationStore.showNotification('상품 정보를 불러오는 데 실패했습니다.', 'error');
    return;
  }
  
  if (menuItem.value.product.stock === 0) {
    notificationStore.showNotification('품절된 상품입니다.', 'warning');
    return;
  }

  const result = await cartStore.addItem({
    product_id: menuItem.value.product.id,
    name: menuItem.value.product.name,
    price: menuItem.value.product.price,
    imageUrl: menuItem.value.product.imageUrl,
    stock: menuItem.value.product.stock,
    quantity: 1, // 
  });

  if (result.success) {
    notificationStore.showNotification('구매 페이지로 이동합니다.', 'info');
    navigateTo('/order');
  } else {
    notificationStore.showNotification(result.message, 'error');
  }
};

const addToCart = async () => {
  if (!menuItem.value || !menuItem.value.product) {
    notificationStore.showNotification('상품 정보를 불러오는 데 실패했습니다.', 'error');
    return;
  }
  
  if (menuItem.value.product.stock === 0) {
    notificationStore.showNotification('품절된 상품입니다.', 'warning');
    return;
  }

  const result = await cartStore.addItem({
    product_id: menuItem.value.product.id,
    name: menuItem.value.product.name,
    price: menuItem.value.product.price,
    imageUrl: menuItem.value.product.imageUrl,
    stock: menuItem.value.product.stock,
    quantity: 1,
  });

  if (result.success) {
    notificationStore.showNotification(result.message, 'success');
  } else {
    notificationStore.showNotification(result.message, 'error');
  }
};

const goBack = () => {
  router.back();
};
</script>
<style scoped></style>