<template>
  <div class="w-full px-4 py-8">
    <div class="bg-gray-100 p-8 rounded-xl shadow-2xl mx-auto border border-gray-200">
      <form @submit.prevent="createProduct">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">상품명</label>
            <input
              type="text"
              id="name"
              v-model="product.name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              placeholder="상품명을 입력하세요"
              required
            />
          </div>
          <div>
            <label for="category" class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
            <select
              id="category"
              v-model="product.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              required
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="price" class="block text-sm font-semibold text-gray-700 mb-2">가격 (원)</label>
            <input
              type="number"
              id="price"
              v-model.number="product.price"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              placeholder="예: 15000"
              min="0"
              required
            />
          </div>
          <div>
            <label for="stock" class="block text-sm font-semibold text-gray-700 mb-2">재고 수량</label>
            <input
              type="number"
              id="stock"
              v-model.number="product.stock"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              placeholder="예: 100"
              min="0"
              required
            />
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-6 mb-6">
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <input
              id="is_available"
              type="checkbox"
              v-model="product.isAvailable"
              class="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors duration-200"
            />
            <span class="text-sm font-medium text-gray-900">판매중</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <input
              id="is_monthly_menu"
              type="checkbox"
              v-model="product.isMonthlyMenu"
              class="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors duration-200"
            />
            <span class="text-sm font-medium text-gray-900">이달의 메뉴</span>
          </label>
          <label class="flex items-center space-x-2 cursor-pointer select-none">
            <input
              id="is_signature_menu"
              type="checkbox"
              v-model="product.isSignatureMenu"
              class="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors duration-200"
            />
            <span class="text-sm font-medium text-gray-900">시그니처 메뉴</span>
          </label>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">상품 이미지</label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              id="image-upload"
              ref="fileInput"
              @change="handleImageUpload"
              class="hidden"
              accept="image/*"
            />
            <button
              type="button"
              @click="triggerFileInput"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
            >
              파일 선택
            </button>
            <span v-if="selectedImageName" class="text-sm text-gray-600 truncate">{{ selectedImageName }}</span>
          </div>
          
          <div v-if="imagePreviewUrl" class="mt-4 flex items-center space-x-4">
            <img :src="imagePreviewUrl" alt="이미지 미리보기" class="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-md" />
            <button
              type="button"
              @click="confirmRemoveImage"
              class="text-red-500 font-bold hover:text-red-700 transition-colors duration-200"
            >
              [ 이미지 삭제 ]
            </button>
          </div>
        </div>

        <div class="mb-8">
          <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">상품 설명</label>
          <textarea
            id="description"
            v-model="product.description"
            rows="5"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            placeholder="상품에 대한 자세한 설명을 입력하세요."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="cancel"
            class="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-bold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-400"
          >
            <span v-if="loading">저장 중...</span>
            <span v-else>상품 저장</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useRuntimeConfig, navigateTo } from '#app';
import { $fetch } from 'ofetch';

interface NewProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  isAvailable: boolean;
  isMonthlyMenu: boolean;
  isSignatureMenu: boolean;
}

interface Category {
  id: string;
  name: string;
}

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const product = ref<NewProduct>({
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  isAvailable: true,
  isMonthlyMenu: false,
  isSignatureMenu: false,
});

const categories = ref<Category[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImageFile = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);
const selectedImageName = ref<string | null>(null);
const loading = ref(false);

const fetchCategories = async () => {
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/categories`);
    if (response && Array.isArray(response.categories)) {
      categories.value = response.categories;
    }
  } catch (error: any) {
    console.error('카테고리 목록을 불러오는 중 오류 발생:', error);
    notificationStore.showNotification('카테고리 목록을 불러오는 데 실패했습니다.', 'error');
  }
};

onMounted(() => {
  fetchCategories();
});

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    selectedImageFile.value = file;
    selectedImageName.value = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    removeImage();
  }
};

const confirmRemoveImage = () => {
  if (confirm('이미지를 삭제하시겠습니까?')) {
    removeImage();
    notificationStore.showNotification('이미지가 삭제되었습니다.', 'info');
  }
};

const removeImage = () => {
  selectedImageFile.value = null;
  imagePreviewUrl.value = null;
  selectedImageName.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const createProduct = async () => {
  if (!authStore.token) {
    notificationStore.showNotification('로그인 상태가 아닙니다. 다시 로그인해주세요.', 'error');
    navigateTo('/login');
    return;
  }

  loading.value = true;
  const formData = new FormData();
  formData.append('name', product.value.name);
  formData.append('category', product.value.category);
  formData.append('price', product.value.price.toString());
  formData.append('stock', product.value.stock.toString());
  formData.append('description', product.value.description);
  formData.append('is_available', product.value.isAvailable.toString());
  formData.append('is_monthly_menu', product.value.isMonthlyMenu.toString());
  formData.append('is_signature_menu', product.value.isSignatureMenu.toString());

  if (selectedImageFile.value) {
    formData.append('image', selectedImageFile.value); 
  }

  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      body: formData,
    });

    if (response.success) {
      notificationStore.showNotification('새 상품이 성공적으로 등록되었습니다!', 'success');
      navigateTo('/admin/products');
    } else {
      notificationStore.showNotification(response.message || '상품 등록에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('상품 등록 에러:', error);
    notificationStore.showNotification(error.data?.message || '상품 등록 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  if (confirm('작성을 취소하고 상품 목록으로 돌아가시겠습니까?')) {
    navigateTo('/admin/products');
  }
};

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
  title: '새 상품 추가',
  meta: [
    { name: 'description', content: '관리자를 위한 새 상품 추가 페이지입니다.' }
  ]
});
</script>

<style scoped>
/* 추가적인 스타일이 필요하면 여기에 작성 */
</style>