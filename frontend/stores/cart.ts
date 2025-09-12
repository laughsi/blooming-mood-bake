import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRuntimeConfig } from '#app'; 

export interface CartItem {
    cart_item_id?: string; 
    product_id: string; 
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

    const saveLocalCart = () => {
        if (process.client) {
        localStorage.setItem('localCartItems', JSON.stringify(items.value));
    }
    };

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

    const increaseQuantity = async (productId: string) => {
        const item = items.value.find(i => i.product_id === productId);
        if (!item || item.quantity >= item.stock) return;

        if (authStore.isLoggedIn) {
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
            item.quantity++;
            saveLocalCart();
        }
    };

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
            saveLocalCart(); 
            return { success: true, message: '상품이 삭제되었습니다.' };
        }
    };
    
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

    const initialize = async () => {
        if (authStore.isLoggedIn) {
            await fetchCartItems();
        } else {
            initializeLocalCart();
        }
    };
    
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