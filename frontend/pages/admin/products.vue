<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-4xl md:text-4xl font-bold text-center mb-6 text-primary">상품 관리</h1>
    <div v-if="$route.path === '/admin/products'" class="bg-gray-100 p-6 rounded-lg shadow-md mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="상품명, 카테고리 검색..."
        class="flex-1 px-4 py-2 border rounded-md focus:ring-primary focus:border-primary w-full md:w-auto"
        @keyup.enter="fetchProducts"
      />
      <select
        v-model="filterCategory"
        class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary w-full md:w-auto"
        @change="fetchProducts" >
        <option value="">모든 카테고리</option>
        <option value="브런치">브런치</option>
        <option value="음료">음료</option>
        <option value="디저트">디저트</option>
      </select>
      <NuxtLink to="/admin/products/new" class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200 w-full md:w-auto text-center">
        +  새 상품 추가
      </NuxtLink>
    </div>

    <div v-if="$route.path === '/admin/products'">
      <div class="bg-gray-100 p-6 rounded-lg shadow-md overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-white">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메뉴 상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품 이미지</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세정보</th>
            </tr>
          </thead>
          <tbody class="bg-gray-100 divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">상품 정보를 불러오는 중...</td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">상품이 없습니다.</td>
            </tr>
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="product.isAvailable"
                      @change="updateProductStatus(product.id, 'is_available', $event.target.checked)"
                      class="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span class="text-xs text-gray-900">판매중</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="product.isMonthlyMenu"
                      @change="updateProductStatus(product.id, 'is_monthly_menu', $event.target.checked)"
                      class="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span class="text-xs text-gray-900">이달의 메뉴</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :checked="product.isSignatureMenu"
                      @change="updateProductStatus(product.id, 'is_signature_menu', $event.target.checked)"
                      class="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span class="text-xs text-gray-900">시그니처 메뉴</span>
                  </label>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-textDark">
                <div class="flex items-center">
                  <template v-if="product.imageUrl">
                    <img :src="product.imageUrl" :alt="product.name + ' 상품 이미지'" class="w-12 h-12 object-cover rounded-md mr-4">
                  </template>
                  <template v-else>
                    <div class="w-12 h-12 bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-500 text-xs">NO IMG</div>
                  </template>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span class="text-sm">{{ product.name }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ product.category_name || product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₩{{ formatPrice(product.price) }}원</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span :class="stockClass(product.stock)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ product.stock > 0 ? product.stock : '재고 없음' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="statusClass(product.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ productStatusMap[String(product.status)] || String(product.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <NuxtLink :to="`/admin/products/edit/${product.id}`" class="text-primary hover:text-primary-dark mr-3">수정</NuxtLink>
                <button @click="deleteProduct(product.id, product.name)" class="text-red-600 hover:text-red-800">삭제</button>
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
        <span class="text-gray-700">페이지 {{ currentPage }} / {{ totalPages > 0 ? totalPages : 1 }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
    
    <NuxtPage v-else /> 
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig, useRoute, navigateTo } from '#app';
import { $fetch } from 'ofetch'; 

interface Product {
  id: string | number; 
  name: string;
  description: string | null; 
  category_id: number; 
  category_name: string; 
  price: number;
  stock: number;
  imageUrl: string | null;
  status: boolean | string; 
  isMonthlyMenu: boolean; // 이달의 메뉴 상태
  isSignatureMenu: boolean; // 시그니처 메뉴 상태
  isAvailable: boolean; // 판매 여부 상태
  created_at?: string; 
  updated_at?: string; 
}

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();
const route = useRoute();

const products = ref<Product[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterCategory = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalProducts = ref(0);

const productStatusMap: Record<string, string> = { 
  'true': '판매중',
  'false': '판매중지', 
  'active': '판매중',
  'inactive': '판매중지',
  'sold_out': '품절',
};

const stockClass = (stock: number) => {
  if (stock <= 0) return 'bg-red-100 text-red-800';
  if (stock < 10) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};

const statusClass = (status: Product['status']) => {
  if (status === true || status === 'true' || status === 'active') {
    return 'bg-green-100 text-green-800';
  } else if (status === false || status === 'false' || status === 'inactive') {
    return 'bg-gray-100 text-gray-800';
  } else if (status === 'sold_out') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800'; 
};

const formatPrice = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0'; 
  }
  return Math.floor(price).toLocaleString(); 
};

const fetchProducts = async () => {
  if (route.path !== '/admin/products') {
    loading.value = false;
    return;
  }

  loading.value = true;
  try {
    if (!authStore.token) {
        notificationStore.showNotification('로그인이 필요합니다.', 'error');
        loading.value = false;
        navigateTo('/login'); 
        return; 
    }

    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/products`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      params: {
        page: currentPage.value,
        search: searchQuery.value,
        category: filterCategory.value, 
        limit: 10
      }
    });

    if (response.success) {
      products.value = response.products.map((p: any) => ({
        ...p,
        isAvailable: p.status, // 백엔드의 status를 isAvailable에 매핑
        isMonthlyMenu: p.is_monthly_menu,
        isSignatureMenu: p.is_signature_menu,
      }));
      currentPage.value = response.pagination.currentPage;
      totalPages.value = response.pagination.totalPages;
      totalProducts.value = response.pagination.totalProducts; 

      if (totalPages.value === 0 && totalProducts.value === 0) {
        totalPages.value = 1;
      }
    } else {
      notificationStore.showNotification(response.message || '상품 목록을 불러오지 못했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('상품 목록 불러오기 실패:', error);
    if (error.response?.status === 401 || error.statusCode === 401) { 
        notificationStore.showNotification('로그인 세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
        authStore.logout(); 
        navigateTo('/login'); 
    } else {
        notificationStore.showNotification(error.response?._data?.message || '상품 목록 불러오기 중 오류가 발생했습니다.', 'error');
    }
  } finally {
    loading.value = false;
  }
};

const updateProductStatus = async (productId: string | number, field: string, value: boolean) => {
  try {
    const token = authStore.token;
    if (!token) {
      notificationStore.showNotification('인증 토큰이 없습니다. 다시 로그인해주세요.', 'error');
      authStore.logout();
      navigateTo('/auth/login');
      return;
    }

    const payload: any = {
      [field]: value
    };

    const response = await $fetch(`${config.public.apiBaseUrl}/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.success) {
      notificationStore.showNotification('상품 상태가 성공적으로 업데이트되었습니다.', 'success');
      // 로컬 데이터 즉시 업데이트
      const productIndex = products.value.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        if (field === 'is_available') {
           products.value[productIndex].isAvailable = value;
           products.value[productIndex].status = value; // status도 함께 업데이트
        } else if (field === 'is_monthly_menu') {
           products.value[productIndex].isMonthlyMenu = value;
        } else if (field === 'is_signature_menu') {
           products.value[productIndex].isSignatureMenu = value;
        }
      }
    } else {
      notificationStore.showNotification(response.message || '상품 상태 업데이트에 실패했습니다.', 'error');
      // 업데이트 실패 시 UI를 원래 상태로 되돌립니다.
      fetchProducts();
    }
  } catch (error: any) {
    console.error('상품 상태 업데이트 오류:', error);
    notificationStore.showNotification(error.response?._data?.message || '상품 상태 업데이트 중 오류가 발생했습니다.', 'error');
    // 업데이트 실패 시 UI를 원래 상태로 되돌립니다.
    fetchProducts();
  }
};

// 상품 삭제
const deleteProduct = async (productId: string | number, productName: string | number) => { 
  if (!confirm(`${productName} 상품을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
    return;
  }
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (response.success) {
      notificationStore.showNotification('상품이 성공적으로 삭제되었습니다.', 'success');
      fetchProducts();
    } else {
      notificationStore.showNotification(response.message || '상품 삭제에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('상품 삭제 실패:', error);
    if (error.response?.status === 401 || error.statusCode === 401) {
      notificationStore.showNotification('로그인 세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
      authStore.logout();
      navigateTo('/login');
    } else {
      notificationStore.showNotification(error.response?._data?.message || '상품 삭제 중 오류가 발생했습니다.', 'error');
    }
  }
};

const nextPage = () => {
  if (currentPage.value < (totalPages.value > 0 ? totalPages.value : 1)) {
    currentPage.value++;
    fetchProducts();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchProducts();
  }
};

onMounted(() => {
  if (route.path === '/admin/products') {
    fetchProducts(); 
  }
});

watch([searchQuery, filterCategory], () => {
  currentPage.value = 1; 
  fetchProducts();
});

watch(() => route.path, (newPath, oldPath) => {
  const isReturningFromSubRoute = oldPath && oldPath.startsWith('/admin/products/') && newPath === '/admin/products';
  if (newPath === '/admin/products' || isReturningFromSubRoute) {
    fetchProducts();
  }
});

definePageMeta({
  requiresAuth: true,
});

useHead({
  title: '상품 관리',
  meta: [
    { name: 'description', content: '관리자를 위한 상품 관리 페이지입니다.' }
  ]
});
</script>

<style scoped>
</style>