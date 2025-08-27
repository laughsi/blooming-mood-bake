// frontend/stores/cart.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig } from '#app'; 

export interface CartItem {
    cart_item_id?: string; // 백엔드에서만 사용
    product_id: string; // 상품 ID (고유 식별자)
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    stock: number;
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([]);
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    // 로컬 스토리지에서 장바구니 데이터를 불러와 상태를 초기화
    const initializeLocalCart = () => {
        if (process.client) {
        const savedCart = localStorage.getItem('localCartItems');
        if (savedCart) {
            try {
                items.value = JSON.parse(savedCart);
            } catch (e) {
                console.error('Failed to parse local cart items:', e);
                localStorage.removeItem('localCartItems');
                items.value = [];
            }
        }
    }
    };

    // 로컬 스토리지에 장바구니 데이터를 저장
    const saveLocalCart = () => {
        if (process.client) {
        localStorage.setItem('localCartItems', JSON.stringify(items.value));
    }
    };

    // 백엔드 또는 로컬 스토리지에서 장바구니 데이터 로드
    const fetchCartItems = async () => {
        if (authStore.isLoggedIn) {
            try {
                const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                });
                if (response.success) {
                    items.value = response.cartItems.map((item: any) => ({
                        cart_item_id: item.cart_item_id,
                        product_id: item.product_id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        imageUrl: item.imageUrl,
                        stock: item.stock,
                    }));
                }
            } catch (error) {
                console.error('장바구니 데이터 로드 실패:', error);
                items.value = [];
            }
        } else {
            initializeLocalCart();
        }
    };

    // 장바구니에 상품 추가 (백엔드/로컬 연동)
    const addItem = async (product: Omit<CartItem, 'quantity' | 'cart_item_id'>) => {
        if (authStore.isLoggedIn) {
            try {
                const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: { productId: product.product_id, quantity: 1 }
                });

                if (response.success && response.cartItem) {
                    const updatedCartItem = {
                        cart_item_id: response.cartItem.cart_item_id,
                        product_id: response.cartItem.product_id,
                        name: response.cartItem.name,
                        price: response.cartItem.price,
                        quantity: response.cartItem.quantity,
                        imageUrl: response.cartItem.imageUrl,
                        stock: response.cartItem.stock,
                    };
                    const existingItemIndex = items.value.findIndex(item => item.product_id === updatedCartItem.product_id);
                    if (existingItemIndex !== -1) {
                        items.value[existingItemIndex] = updatedCartItem;
                    } else {
                        items.value.push(updatedCartItem);
                    }
                    return { success: true, message: `${product.name}이(가) 장바구니에 추가되었습니다.` };
                }
                return { success: false, message: '장바구니 추가 실패: 서버 응답 오류' };
            } catch (error: any) {
                console.error('장바구니 추가 실패:', error);
                return { success: false, message: error.data?.message || '장바구니 추가 실패: 서버 오류' };
            }
        } else {
            // 비로그인 시 로컬에만 추가
            const existingItem = items.value.find(item => item.product_id === product.product_id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                items.value.push({ ...product, quantity: 1 });
            }
            saveLocalCart();
            return { success: true, message: `${product.name}이(가) 장바구니에 추가되었습니다.` };
        }
    };

    // 상품 수량 증가
    const increaseQuantity = async (productId: string) => {
        const item = items.value.find(i => i.product_id === productId);
        if (!item || item.quantity >= item.stock) return;

        if (authStore.isLoggedIn) {
            // 백엔드 API 호출
            try {
                const newQuantity = item.quantity + 1;
                const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart/${item.product_id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                    body: { quantity: newQuantity }
                });
                if (response.success) {
                    item.quantity = newQuantity;
                }
            } catch (error) {
                console.error('수량 증가 실패:', error);
            }
        } else {
            // 로컬 스토리지 업데이트
            item.quantity++;
            saveLocalCart();
        }
    };

    // 상품 수량 감소
    const decreaseQuantity = async (productId: string) => {
        const item = items.value.find(i => i.product_id === productId);
        if (!item) return;

        if (item.quantity > 1) {
            if (authStore.isLoggedIn) {
                try {
                    const newQuantity = item.quantity - 1;
                    const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart/${item.product_id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${authStore.token}`
                        },
                        body: { quantity: newQuantity }
                    });
                    if (response.success) {
                        item.quantity = newQuantity;
                    }
                } catch (error) {
                    console.error('수량 감소 실패:', error);
                }
            } else {
                item.quantity--;
                saveLocalCart();
            }
        } else {
            await removeItem(productId);
        }
    };

    // 상품 제거
    const removeItem = async (productId: string) => {
        if (authStore.isLoggedIn) {
            try {
                const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                });
                if (response.success) {
                    items.value = items.value.filter(i => i.product_id !== productId);
                    return { success: true, message: '상품이 삭제되었습니다.' };
                }
                return { success: false, message: '상품 삭제 실패' };
            } catch (error) {
                console.error('상품 제거 실패:', error);
                return { success: false, message: '상품 삭제 중 서버 오류가 발생했습니다.' };
            }
        } else {
            items.value = items.value.filter(i => i.product_id !== productId);
            saveLocalCart(); // 비로그인 시 삭제 후 로컬 스토리지에 저장
            return { success: true, message: '상품이 삭제되었습니다.' };
        }
    };
    
    // 장바구니 전체 비우기
    const clearCart = async () => {
        if (authStore.isLoggedIn) {
            try {
                const response = await $fetch<any>(`${config.public.apiBaseUrl}/cart`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`
                    },
                });
                if (response.success) {
                    items.value = [];
                }
            } catch (error) {
                console.error('장바구니 비우기 실패:', error);
            }
        } else {
            items.value = [];
            saveLocalCart();
        }
    };

    // 장바구니 초기화 (로그인 상태 변화 감지)
    const initialize = async () => {
        if (authStore.isLoggedIn) {
            // 로그인 상태로 전환 시 백엔드 데이터 로드
            await fetchCartItems();
        } else {
            // 비로그인 상태이거나, 로그아웃 시 로컬 데이터 로드
            initializeLocalCart();
        }
    };
    
    // isLoggedIn 상태 변화를 감시하여 initialize 함수 호출
    watch(() => authStore.isLoggedIn, (isLoggedIn) => {
      initialize();
      console.log('User login state changed, re-initializing cart.');
    }, { immediate: true });

    return {
        items,
        cartItems: computed(() => items.value),
        cartItemCount: computed(() => items.value.reduce((total, item) => total + item.quantity, 0)),
        cartTotalPrice: computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)),
        fetchCartItems,
        addItem,
        increaseQuantity,
        decreaseQuantity,
        removeItem,
        clearCart,
        initialize,
    };
});