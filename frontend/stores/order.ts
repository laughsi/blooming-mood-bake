import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig } from '#app';
import { useCartStore } from './cart'; 
import type { CartItem } from './cart'; 

export interface OrderItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    stock: number;
}

export interface Order {
    order_id: string;
    user_id: string;
    status: string; 
    totalPrice: number;
    items: OrderItem[];
    createdAt: string; 
}

export const useOrderStore = defineStore('order', () => {
    const orders = ref<Order[]>([]);
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const cartStore = useCartStore(); 

    const fetchOrders = async () => {
        if (!authStore.isLoggedIn) {
            orders.value = [];
            return;
        }
        try {
            const response = await $fetch<any>(`${config.public.apiBaseUrl}/orders`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                },
            });
            if (response.success) {
                orders.value = response.orders.map((order: any) => ({
                    order_id: order.order_id,
                    user_id: order.user_id,
                    status: order.status,
                    totalPrice: order.totalPrice,
                    createdAt: order.createdAt,
                    items: order.items,
                }));
            }
        } catch (error) {
            orders.value = [];
        }
    };
    
    const placeOrder = async () => { 
        if (!authStore.isLoggedIn) {
            return { success: false, message: '로그인 후 주문할 수 있습니다.' };
        }

        const itemsToOrder = cartStore.items;
        if (itemsToOrder.length === 0) {
            return { success: false, message: '주문할 상품이 없습니다.' };
        }
        
        try {
            const orderItemsPayload = itemsToOrder.map(item => ({
                product_id: item.product_id,
                price: item.price,
                quantity: item.quantity,
            }));

            const response = await $fetch<any>(`${config.public.apiBaseUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: { items: orderItemsPayload }
            });

            if (response.success && response.order) {
                await fetchOrders(); 
                await cartStore.clearCart(); 
                return { success: true, message: '주문이 성공적으로 완료되었습니다.', order: response.order };
            }
            return { success: false, message: '주문 실패: 서버 응답 오류' };
        } catch (error: any) {
            return { success: false, message: error.data?.message || '주문 실패: 서버 오류' };
        }
    };
    
    const cancelOrder = async (orderId: string) => {
        if (!authStore.isLoggedIn) {
            return { success: false, message: '로그인 후 주문을 취소할 수 있습니다.' };
        }
        try {
            const response = await $fetch<any>(`${config.public.apiBaseUrl}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                },
            });
            if (response.success) {
                const orderIndex = orders.value.findIndex(o => o.order_id === orderId);
                if (orderIndex !== -1) {
                    orders.value[orderIndex].status = 'cancelled';
                }
                return { success: true, message: '주문이 성공적으로 취소되었습니다.' };
            }
            return { success: false, message: '주문 취소 실패: 서버 응답 오류' };
        } catch (error: any) {
            return { success: false, message: error.data?.message || '주문 취소 실패: 서버 오류' };
        }
    };

    watch(() => authStore.isLoggedIn, (isLoggedIn) => {
        if (isLoggedIn) {
            fetchOrders();
        } else {
            orders.value = [];
        }
    }, { immediate: true });

    return {
        orders,
        fetchOrders,
        placeOrder,
        cancelOrder,
        totalOrders: computed(() => orders.value.length)
    };
});