<template>
  <div class="w-full px-4 py-8">
    <div class="bg-gray-100 p-8 rounded-xl shadow-2xl mx-auto border border-gray-200">
      <form @submit.prevent="updateProduct" v-if="product">
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
              v-model="product.category_name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              required
            >
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
          <div class="flex items-center space-x-4 mb-2">
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
              새 이미지 선택
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
            @click="navigateTo('/admin/products')"
            class="px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-bold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-400 transition-all duration-200"
          >
            상품 수정
          </button>
        </div>
      </form>
      <div v-else class="text-center py-8">
        상품 정보를 불러오는 중...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, navigateTo, useRuntimeConfig } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';
import { useNotificationStore } from '~/stores/notification';
import { $fetch } from 'ofetch';

interface Product {
  id: string | number | null;
  name: string;
  category_name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string | null;
  status: boolean;
  isMonthlyMenu: boolean;
  isSignatureMenu: boolean;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
}

const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const productId = route.params.id;
const config = useRuntimeConfig();

const product = ref<Product | null>(null);
const categories = ref<Category[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const newImageFile = ref<File | null>(null);
const imagePreviewUrl = ref<string | null>(null);
const selectedImageName = ref<string | null>(null);

const fetchProduct = async () => {
  try {
    const token = authStore.token;
    if (!token) {
      notificationStore.showNotification('인증 토큰이 없습니다. 다시 로그인해주세요.', 'error');
      authStore.logout();
      navigateTo('/auth/login');
      return;
    }

    const data: any = await $fetch(`${config.public.apiBaseUrl}/admin/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (data.success && data.product) {
      product.value = {
        ...data.product,
        id: data.product.id,
        name: data.product.name,
        category_name: data.product.category_name,
        price: data.product.price,
        stock: data.product.stock,
        description: data.product.description,
        imageUrl: data.product.imageUrl,
        status: data.product.status,
        isMonthlyMenu: data.product.is_monthly_menu,
        isSignatureMenu: data.product.is_signature_menu,
        isAvailable: data.product.status,
      };
      
      // 기존 이미지 URL을 미리보기로 설정
      imagePreviewUrl.value = product.value.imageUrl;
      if (product.value.imageUrl) {
        selectedImageName.value = '기존 이미지';
      }
    } else {
      notificationStore.showNotification(data.message || '상품 정보를 불러오는 데 실패했습니다.', 'error');
      navigateTo('/admin/products');
    }
  } catch (error) {
    console.error('상품 정보 불러오기 오류:', error);
    let errorMessage = '상품 정보를 불러오는 중 오류가 발생했습니다.';
    if (error.response && error.response.status === 404) {
      errorMessage = '상품을 찾을 수 없습니다.';
    } else if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    notificationStore.showNotification(errorMessage, 'error');
    navigateTo('/admin/products');
  }
};

const fetchCategories = async () => {
  try {
    const token = authStore.token;
    const data: any = await $fetch(`${config.public.apiBaseUrl}/categories`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (data.categories) {
      categories.value = data.categories;
    }
  } catch (error) {
    console.error('카테고리 불러오기 오류:', error);
    notificationStore.showNotification('카테고리 목록을 불러오지 못했습니다.', 'error');
  }
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    newImageFile.value = file;
    selectedImageName.value = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    // 파일 선택이 취소된 경우
    newImageFile.value = null;
    if (product.value?.imageUrl) {
        // 기존 이미지가 있다면 다시 표시
        imagePreviewUrl.value = product.value.imageUrl;
        selectedImageName.value = '기존 이미지';
    } else {
        // 기존 이미지가 없다면 초기화
        imagePreviewUrl.value = null;
        selectedImageName.value = null;
    }
  }
};

const confirmRemoveImage = () => {
  if (confirm('이미지를 삭제하시겠습니까?')) {
    removeImage();
    notificationStore.showNotification('이미지가 삭제되었습니다.', 'info');
  }
};

const removeImage = () => {
  newImageFile.value = null;
  imagePreviewUrl.value = null;
  selectedImageName.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const updateProduct = async () => {
  try {
    if (!product.value) return;

    const token = authStore.token;
    if (!token) {
      notificationStore.showNotification('인증 토큰이 없습니다. 다시 로그인해주세요.', 'error');
      authStore.logout();
      navigateTo('/auth/login');
      return;
    }

    const formData = new FormData();
    formData.append('name', product.value.name);
    formData.append('category', product.value.category_name);
    formData.append('price', product.value.price.toString());
    formData.append('stock', product.value.stock.toString());
    formData.append('description', product.value.description);
    
    // 체크박스 값 추가
    formData.append('is_monthly_menu', product.value.isMonthlyMenu.toString());
    formData.append('is_signature_menu', product.value.isSignatureMenu.toString());
    formData.append('is_available', product.value.isAvailable.toString());

    if (newImageFile.value) {
        formData.append('image', newImageFile.value);
    } else if (imagePreviewUrl.value === null) {
        // 이미지를 삭제한 경우를 명시적으로 서버에 전달
        formData.append('image', 'null');
    }

    const data: any = await $fetch(`${config.public.apiBaseUrl}/admin/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    notificationStore.showNotification('상품이 성공적으로 수정되었습니다!', 'success');
    navigateTo('/admin/products');

  } catch (error) {
    console.error('상품 수정 오류:', error);
    notificationStore.showNotification(error.response?._data?.message || '상품 수정에 실패했습니다.', 'error');
  }
};

onMounted(() => {
  fetchProduct();
  fetchCategories();
});
</script>

<style scoped>
/* 추가적인 스타일이 필요하면 여기에 작성 */
</style>