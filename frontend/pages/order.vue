<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">결제하기</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <div class="md:col-span-2 space-y-8">
        
        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-700">주문 상품 정보</h2>
          <div v-for="item in cartStore.items" :key="item.product_id" class="flex items-center space-x-4 py-3 border-b last:border-b-0">
            <img :src="item.imageUrl" :alt="item.name" class="w-20 h-20 object-cover rounded-lg">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">{{ item.quantity }}개</p>
              <p class="font-bold text-gray-900">{{ formatCurrency(item.price * item.quantity) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-700">주문자 정보</h2>
          <form class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">이름</label>
                <input type="name" id="name" v-model="orderForm.name" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">휴대폰 번호</label>
                <input type="phone" id="phone" v-model="orderForm.phone" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">이메일</label>
              <input type="email" id="email" v-model="orderForm.email" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
            </div>
          </form>
        </div>

        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-700">배송정보</h2>
          <form class="space-y-4">
            <div class="flex items-center space-x-8 mb-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="deliveryMethod" value="pickup" class="form-radio text-primary h-4 w-4 mr-2" />
                <span class="text-gray-700">픽업 및 식사</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="deliveryMethod" value="delivery" class="form-radio text-primary h-4 w-4 mr-2" />
                <span class="text-gray-700">배송</span>
              </label>
            </div>

            <div v-if="deliveryMethod === 'delivery'" class="space-y-4">
              <div>
                <label for="recipient" class="block text-sm font-medium text-gray-700">받으실분</label>
                <input type="text" id="recipient" v-model="orderForm.recipient" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="address" class="block text-sm font-medium text-gray-700">받으실곳</label>
                <input type="text" id="address" v-model="orderForm.address" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="recipientPhone" class="block text-sm font-medium text-gray-700">휴대폰 번호</label>
                <input type="text" id="recipientPhone" v-model="orderForm.recipientPhone" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="notes" class="block text-sm font-medium text-gray-700">남기실말씀</label>
                <textarea id="notes" v-model="orderForm.notes" rows="3" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2"></textarea>
              </div>
            </div>
            
            <div v-else class="space-y-4">
              <p class="text-gray-600">픽업 및 식사 장소: 경북 울진군 북면 부구2길 25</p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="pickupDate" class="block text-sm font-medium text-gray-700">픽업 날짜</label>
                  <input type="date" id="pickupDate" v-model="orderForm.pickupDate" 
                        class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
                </div>
                <div>
                  <label for="pickupHour" class="block text-sm font-medium text-gray-700">픽업 시간</label>
                  <select id="pickupHour" v-model="orderForm.pickupHour"
                          class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
                    <option value="">선택</option>
                    <option v-for="hour in availableHours" :key="hour" :value="hour">{{ hour }}시</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div class="space-y-8">
        
        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-700">주문 요약</h2>
          <div class="space-y-2 text-gray-600">
            <div class="flex justify-between">
              <span>상품 가격</span>
              <span>{{ formatCurrency(cartStore.cartTotalPrice) }}</span>
            </div>
            <div class="flex justify-between">
              <span>배송비</span>
              <span>{{ formatCurrency(deliveryFee) }}</span>
            </div>
            <div class="flex justify-between font-bold text-gray-800 border-t pt-2">
              <span>총 주문금액</span>
              <span>{{ formatCurrency(cartStore.cartTotalPrice + deliveryFee) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold mb-4 text-gray-700">결제 수단</h2>
          <div class="space-y-2">
            <label class="flex items-center space-x-2">
              <input type="radio" name="paymentMethod" value="card" v-model="orderForm.paymentMethod" class="form-radio text-primary">
              <span class="text-gray-700">신용카드</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="paymentMethod" value="bank" v-model="orderForm.paymentMethod" class="form-radio text-primary">
              <span class="text-gray-700">무통장입금</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" name="paymentMethod" value="account_transfer" v-model="orderForm.paymentMethod" class="form-radio text-primary">
              <span class="text-gray-700">계좌이체</span>
            </label>
          </div>
          
          <div v-if="orderForm.paymentMethod === 'bank'" class="mt-6 space-y-4">
            <p class="text-sm text-gray-500">무통장 입금의 경우 입금확인 후부터 배송단계가 진행됩니다.</p>
            <div>
              <label for="depositorName" class="block text-sm font-medium text-gray-700">입금자명</label>
              <input type="text" id="depositorName" v-model="orderForm.depositorName" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
            </div>
            <div>
              <label for="depositBank" class="block text-sm font-medium text-gray-700">입금은행</label>
              <select id="depositBank" v-model="orderForm.depositBank" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
                <option value="">선택하세요</option>
                <option value="bank">국민은행 52490201437549 김건일</option>
                </select>
            </div>
            
            <div class="space-y-2">
              <p class="block text-sm font-medium text-gray-700 mb-2">현금영수증/세금계산서 발행</p>
              <label class="flex items-center space-x-2">
                <input type="radio" name="receiptType" value="none" v-model="orderForm.receiptType" class="form-radio text-primary">
                <span class="text-gray-700">신청 안함</span>
              </label>
              <label class="flex items-center space-x-2">
                <input type="radio" name="receiptType" value="tax_invoice" v-model="orderForm.receiptType" class="form-radio text-primary">
                <span class="text-gray-700">세금계산서</span>
              </label>
            </div>
            
            <div v-if="orderForm.receiptType === 'tax_invoice'" class="space-y-4 mt-4">
              <div>
                <label for="businessNumber" class="block text-sm font-medium text-gray-700">사업자번호</label>
                <input type="text" id="businessNumber" v-model="orderForm.businessNumber" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="companyName" class="block text-sm font-medium text-gray-700">회사명</label>
                <input type="text" id="companyName" v-model="orderForm.companyName" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="representative" class="block text-sm font-medium text-gray-700">대표자명</label>
                <input type="text" id="representative" v-model="orderForm.representative" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="businessType" class="block text-sm font-medium text-gray-700">업태</label>
                <input type="text" id="businessType" v-model="orderForm.businessType" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="businessCategory" class="block text-sm font-medium text-gray-700">종목</label>
                <input type="text" id="businessCategory" v-model="orderForm.businessCategory" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
              <div>
                <label for="businessAddress" class="block text-sm font-medium text-gray-700">사업장 주소</label>
                <input type="text" id="businessAddress" v-model="orderForm.businessAddress" class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 px-3 py-2">
              </div>
            </div>
          </div>
          
          <div class="mt-6 space-y-2">
            <label class="flex items-center space-x-2">
              <input type="checkbox" v-model="agreeAll" class="form-checkbox text-primary rounded">
              <span class="text-gray-700 font-semibold">전체 동의</span>
            </label>
            <label class="flex items-center space-x-2 ml-4 text-sm text-gray-500">
              <input type="checkbox" v-model="agreePrivacy" class="form-checkbox text-primary rounded">
              <span>개인정보 수집 및 이용 동의 <a href="#" class="text-blue-500 hover:underline">약관보기</a></span>
            </label>
            <label class="flex items-center space-x-2 ml-4 text-sm text-gray-500">
              <input type="checkbox" v-model="agreeTerms" class="form-checkbox text-primary rounded">
              <span>구매조건 확인 및 결제진행에 동의</span>
            </label>
          </div>

          <button 
            @click="placeOrder" 
            :disabled="!isFormValid"
            class="mt-6 w-full py-3 px-4 rounded-lg font-bold text-white transition-colors duration-300"
            :class="{'bg-primary hover:bg-primary-dark': isFormValid, 'bg-gray-400 cursor-not-allowed': !isFormValid}"
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { useRuntimeConfig } from '#app';

const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();

// 주문 폼 데이터
const orderForm = ref({
  name: '', 
  phone: '', 
  email: '', 
  paymentMethod: 'card',
  // 배송 정보
  deliveryMethod: 'pickup', // 기본값은 픽업으로 설정
  recipient: '',
  address: '',
  recipientPhone: '',
  notes: '',
  pickupDate: null,
  pickupHour: '',
  // 무통장 입금 정보
  depositorName: '',
  depositBank: '',
  receiptType: 'none',
  businessNumber: '',
  companyName: '',
  representative: '',
  businessType: '',
  businessCategory: '',
  businessAddress: '',
  cartItems: cartStore.items
});

const deliveryMethod = ref(orderForm.value.deliveryMethod);

// `onMounted` 훅을 사용하여 페이지 로드 시 라우터 쿼리 파라미터에서 `deliveryMethod` 값을 가져옴
onMounted(() => {
  if (route.query.deliveryMethod) {
    deliveryMethod.value = route.query.deliveryMethod;
  }

  if (authStore.user) {
    orderForm.value.name = authStore.user.username || '';
    orderForm.value.phone = authStore.user.phone_number || '';
    orderForm.value.email = authStore.user.email || '';
  }
});

// 배송비 계산
const deliveryFee = computed(() => {
  return deliveryMethod.value === 'delivery' ? 5000 : 0;
});

// 약관 동의
const agreePrivacy = ref(false);
const agreeTerms = ref(false);
const agreeAll = computed({
  get() {
    return agreePrivacy.value && agreeTerms.value;
  },
  set(value) {
    agreePrivacy.value = value;
    agreeTerms.value = value;
  }
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  // 공통 필수 필드
  let isValid = orderForm.value.name && orderForm.value.phone && orderForm.value.email;

  // 배송 방식에 따른 추가 유효성 검사
  if (deliveryMethod.value === 'delivery') {
    isValid = isValid && orderForm.value.recipient && orderForm.value.address && orderForm.value.recipientPhone;
  } else { // pickup
    isValid = isValid && orderForm.value.pickupDate && orderForm.value.pickupHour;
  }

  // 결제 방식에 따른 추가 유효성 검사
  if (orderForm.value.paymentMethod === 'bank') {
    isValid = isValid && orderForm.value.depositorName && orderForm.value.depositBank;
    if (orderForm.value.receiptType === 'tax_invoice') {
      isValid = isValid && orderForm.value.businessNumber && orderForm.value.companyName && orderForm.value.representative && orderForm.value.businessType && orderForm.value.businessCategory && orderForm.value.businessAddress;
    }
  }

  // 약관 동의
  isValid = isValid && agreePrivacy.value && agreeTerms.value;

  return isValid;
});

const availableHours = ref(Array.from({ length: 12 }, (_, i) => i + 9));

// 숫자 포맷팅을 위한 헬퍼 함수
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

// 결제하기 버튼 클릭 시 호출될 함수
const placeOrder = async () => {
  if (!isFormValid.value) return;
  
  try {
    const orderData = {
      ...orderForm.value,
      deliveryMethod: deliveryMethod.value, // deliveryMethod를 orderForm에 추가
      deliveryFee: deliveryFee.value,
      totalPrice: cartStore.cartTotalPrice + deliveryFee.value,
    };

    if (deliveryMethod.value === 'pickup') {
      const date = orderForm.value.pickupDate;
      const hour = orderForm.value.pickupHour;
      if (date && hour) {
        orderData.pickupTime = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
      }
    }

    const response = await $fetch(`${config.public.apiBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: orderData
    });

    if (response.success) {
      alert('주문이 성공적으로 완료되었습니다.');
      cartStore.clearCart();
      router.push('/order-complete');
    } else {
      alert(response.message || '주문 실패');
    }
  } catch (error) {
    console.error('주문 실패:', error);
    alert('주문 처리 중 오류가 발생했습니다.');
  }
};

if (cartStore.cartItemCount === 0) {
  router.push('/cart');
}

useHead({
  title: '결제하기',
  meta: [
    { name: 'description', content: '주문 상품을 확인하고 결제를 진행합니다.' }
  ]
});
</script>