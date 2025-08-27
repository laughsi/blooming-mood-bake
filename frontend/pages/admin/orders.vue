<template>
  <div class="w-full px-4 py-8">
    <h1 class="text-4xl md:text-4xl font-bold text-center mb-6 text-primary">주문 관리</h1>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="주문 번호, 고객명 검색..."
          class="flex-1 px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @keyup.enter="fetchOrders"
        />
        <select
          v-model="filterStatus"
          class="px-4 py-2 border rounded-md focus:ring-primary focus:border-primary"
          @change="fetchOrders"
        >
          <option value="">모든 상태</option>
          <option value="pending">결제 대기</option>
          <option value="processing">처리 중</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
        <button
          @click="fetchOrders"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-200"
        >
          검색
        </button>
      </div>
    </div>

    <div class="bg-gray-100 p-6 rounded-lg shadow-md overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문 번호</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문 날짜</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세정보</th>
          </tr>
        </thead>
        <tbody class="bg-gray-100 divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">주문 정보를 불러오는 중...</td>
          </tr>
          <tr v-else-if="orders.length === 0">
            <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">주문 내역이 없습니다.</td>
          </tr>
          <tr v-else v-for="order in orders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-textDark">{{ order.orderNumber }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ order.customerName }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(order.orderDate) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₩{{ order.totalAmount.toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ orderStatusMap[order.status] }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink :to="`/admin/orders/${order.id}`" class="text-primary hover:text-primary-dark mr-3">상세</NuxtLink>
              <button @click="updateOrderStatus(order.id, 'cancelled')" class="text-red-600 hover:text-red-800">취소</button>
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
      <span class="text-gray-700">페이지 {{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification'; 
import { useRuntimeConfig } from '#app';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string; 
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const config = useRuntimeConfig();

const orders = ref<Order[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const totalPages = ref(1);

const orderStatusMap: Record<Order['status'], string> = {
  pending: '결제 대기',
  processing: '처리 중',
  completed: '완료',
  cancelled: '취소',
};

const statusClass = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
      params: {
        page: currentPage.value,
        search: searchQuery.value,
        status: filterStatus.value,
        limit: 10 
      }
    });

    if (response.success) {
      orders.value = response.orders;
      totalPages.value = response.pagination.totalPages;
    } else {
      notificationStore.showNotification(response.message || '주문 목록을 불러오지 못했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('주문 목록 불러오기 실패:', error);
    notificationStore.showNotification(error.data?.message || '주문 목록 불러오기 중 오류가 발생했습니다.', 'error');
  } finally {
    loading.value = false;
  }
};

const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed' | 'cancelled') => {
  if (!confirm(`${orderId}번 주문의 상태를 '${orderStatusMap[newStatus]}'으로 변경하시겠습니까?`)) {
    return;
  }
  try {
    const response: any = await $fetch(`${config.public.apiBaseUrl}/admin/orders/${orderId}/status`, {
      method: 'PUT', 
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: { status: newStatus },
    });

    if (response.success) {
      notificationStore.showNotification(`주문 ${orderId} 상태가 업데이트되었습니다.`, 'success');
      fetchOrders();
    } else {
      notificationStore.showNotification(response.message || '주문 상태 업데이트에 실패했습니다.', 'error');
    }
  } catch (error: any) {
    console.error('주문 상태 업데이트 실패:', error);
    notificationStore.showNotification(error.data?.message || '주문 상태 업데이트 중 오류가 발생했습니다.', 'error');
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchOrders();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchOrders();
  }
};

onMounted(() => {
  fetchOrders();
});

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
  title: '주문 관리',
  meta: [
    { name: 'description', content: '관리자를 위한 주문 관리 페이지입니다.' }
  ]
});
</script>

<style scoped>
</style>