// frontend/pages/menu.vue
<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-10 text-primary">Brunch & Beverage Menu</h1>

    <nav class="flex justify-center space-x-6 mb-8">
      <button @click="filterByCategory('')"
              :class="{'bg-primary text-white': selectedCategory === '', 'bg-gray-200 text-textDark': selectedCategory !== ''}"
              class="px-5 py-2 rounded-full font-semibold transition-colors duration-200">
        전체
      </button>
      <button v-for="category in categories"
              :key="category.id"
              @click="filterByCategory(category.name)"
              :class="{'bg-primary text-white': selectedCategory === category.name, 'bg-gray-200 text-textDark': selectedCategory !== category.name}"
              class="px-5 py-2 rounded-full font-semibold transition-colors duration-200">
        {{ category.name }}
      </button>
    </nav>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p class="mt-6 text-gray-600 text-lg">메뉴를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="error" class="text-center py-20 text-red-500 font-semibold">
      <p>메뉴를 불러오는 데 실패했습니다: {{ error }}</p>
      <button @click="fetchProducts" class="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200">
        다시 시도
      </button>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-20 text-gray-500">
      <p class="text-xl">등록된 메뉴가 없습니다.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <div v-for="product in products" :key="product.id" class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
        <div class="relative w-full h-56">
          <img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :alt="product.name"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
            이미지 없음
          </div>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ product.name }}</h3>
          <p class="text-sm text-gray-500 mb-4">{{ product.category_name }}</p>
          <p class="text-2xl font-bold text-primary mb-2">{{ product.price.toLocaleString() }}원</p>
          <p v-if="product.stock === 0" class="text-red-500 font-medium">품절</p>
          <p v-else class="text-gray-600 font-medium">재고: {{ product.stock }}개</p>
          
          <div class="mt-4 flex items-center justify-between">
            <button
              @click="addToCart(product)"
              :disabled="product.stock === 0"
              class="w-full bg-primary text-white py-2 px-4 rounded-full font-semibold text-sm transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              장바구니 담기
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center mt-12 space-x-2">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        이전
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        :class="['px-4 py-2 border rounded-full font-semibold transition-colors duration-200', currentPage === page ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-200']"
      >
        {{ page }}
      </button>
      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border rounded-full text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useNotificationStore } from '~/stores/notification';
import { useCartStore } from '~/stores/cart';

// 인터페이스 정의 (타입 안정성을 위해)
interface Product {
  id: string; // uuid는 문자열
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category_name: string;
  is_available: boolean;
  is_monthly_menu: boolean;
  is_signature_menu: boolean;
}

interface Category {
  id: string; // uuid는 문자열
  name: string;
}

const config = useRuntimeConfig();
const notificationStore = useNotificationStore();
const cartStore = useCartStore();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const currentPage = ref(1);
const totalPages = ref(1);
const selectedCategory = ref('');

// 상품 목록을 불러오는 함수
const fetchProducts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    params.append('page', currentPage.value.toString());
    params.append('limit', '8');
    if (selectedCategory.value) {
      params.append('category', selectedCategory.value);
    }
    
    const response = await $fetch<any>(`${config.public.apiBaseUrl}/products?${params.toString()}`);
    
    if (response.success) {
      products.value = response.products.filter((p: Product) => p.is_available);
      currentPage.value = response.pagination.currentPage;
      totalPages.value = response.pagination.totalPages;
    } else {
      error.value = response.message || '상품 정보를 불러오는 데 실패했습니다.';
    }
  } catch (err: any) {
    console.error('API 호출 중 오류 발생:', err);
    error.value = err.message || '서버 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
};

// 카테고리 목록을 불러오는 함수
const fetchCategories = async () => {
  try {
    const response = await $fetch<any>(`${config.public.apiBaseUrl}/categories`);
    if (response.success) {
      categories.value = response.categories;
    }
  } catch (err: any) {
    console.error('카테고리 목록을 불러오는 데 실패했습니다:', err);
  }
};

const filterByCategory = (categoryName: string) => {
  selectedCategory.value = categoryName;
  currentPage.value = 1; // 필터 변경 시 첫 페이지로 이동
  fetchProducts(); // 새로운 필터로 상품 재요청
};

// 페이지 변경 함수
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
};

// 장바구니에 상품 추가 (pinia 스토어 사용)
const addToCart = async (product: Product) => {
  const result = await cartStore.addItem({
    product_id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    stock: product.stock,
  });

  if (result.success) {
    notificationStore.showNotification(result.message, 'success');
  } else {
    notificationStore.showNotification(result.message, 'error');
  }
};

// 컴포넌트 마운트 시 데이터 로딩
onMounted(() => {
  fetchCategories();
  fetchProducts();
});

useHead({
  title: '메뉴',
  meta: [
    { name: 'description', content: '신선한 브런치와 향긋한 커피, 편안한 공간에서 즐기는 특별한 시간.' }
  ],
})
</script>

<style scoped>
</style>