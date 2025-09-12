<template>
  <section class="w-full px-4 py-8">
    <h2 class="text-4xl font-bold text-center mb-4 text-primary">Menu Of Month</h2>
    <p class="text-center text-lg text-textDark mb-8 max-w-3xl mx-auto">
      매월 새롭게 선보이는 블루밍무드베이킹의 특별한 메뉴들을 만나보세요.
    </p>

    <div v-if="pendingMonthly" class="text-center py-10">
      <p class="text-gray-500">이달의 메뉴를 불러오는 중입니다... ⏳</p>
    </div>
    <div v-else-if="monthlyError" class="text-center py-10">
      <p class="text-red-500">이달의 메뉴를 불러오는 데 실패했습니다. 다시 시도해 주세요. 🚫</p>
    </div>
    <div v-else-if="monthlyMenuItems && monthlyMenuItems.length > 0" class="relative flex items-center">
      <button 
        @click="scrollMonthly(-1)" 
        :class="{'opacity-0 pointer-events-none': monthlyMenuItems.length <= 4}"
        class="p-2 bg-white rounded-full shadow-md z-10 transition-opacity mt-[-4rem]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-textDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div 
        ref="monthlyCarousel" 
        :class="{'justify-center': monthlyMenuItems.length <= 4}"
        class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        <div 
          v-for="item in monthlyMenuItems" 
          :key="item.id" 
          class="snap-start flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
          
          <a v-if="item.price === 0" href="https://forms.gle/RJ7hyFEcygY2CiRN8" target="_blank" rel="noopener noreferrer" class="block">
            <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
            </div>
            <div class="mt-4 text-center">
              <h4 class="text-xl text-textDark">{{ item.name }}</h4>
              <p class="text-lg font-bold text-primary mt-2">
                {{ getPriceText(item.price) }}
              </p>
            </div>
          </a>
          <NuxtLink v-else :to="`/menu/${item.id}`" class="block">
            <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
            </div>
            <div class="mt-4 text-center">
              <h4 class="text-xl text-textDark">{{ item.name }}</h4>
              <p class="text-lg font-bold text-primary mt-2">
                {{ getPriceText(item.price) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <button 
        @click="scrollMonthly(1)" 
        :class="{'opacity-0 pointer-events-none': monthlyMenuItems.length <= 4}"
        class="p-2 bg-white rounded-full shadow-md z-10 transition-opacity mt-[-4rem]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-textDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <div v-else class="text-center py-10">
      <p class="text-gray-500">아직 등록된 이달의 메뉴가 없습니다.</p>
    </div>

    <h2 class="text-4xl font-bold text-center mb-4 text-primary mt-12">Signeture Menu</h2>
    <p class="text-center text-lg text-textDark mb-8 max-w-3xl mx-auto">
      블루밍무드베이킹의 시그니처 메뉴로 특별한 브런치를 즐겨보세요.
    </p>

    <div v-if="pendingFeatured" class="text-center py-10">
      <p class="text-gray-500">시그니처 메뉴를 불러오는 중입니다... ⏳</p>
    </div>
    <div v-else-if="featuredError" class="text-center py-10">
      <p class="text-red-500">시그니처 메뉴를 불러오는 데 실패했습니다. 다시 시도해 주세요. 🚫</p>
    </div>
    <div v-else-if="featuredItems && featuredItems.length > 0" class="relative flex items-center">
      <button 
        @click="scrollFeatured(-1)" 
        :class="{'opacity-0 pointer-events-none': featuredItems.length <= 4}"
        class="p-2 bg-white rounded-full shadow-md z-10 transition-opacity mt-[-4rem]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-textDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div 
        ref="featuredCarousel" 
        :class="{'justify-center': featuredItems.length <= 4}"
        class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar">
        <div 
          v-for="item in featuredItems" 
          :key="item.id" 
          class="snap-start flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2">
          
          <a v-if="item.price === 0" href="https://forms.gle/RJ7hyFEcygY2CiRN8" target="_blank" rel="noopener noreferrer" class="block">
            <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
            </div>
            <div class="mt-4 text-center">
              <h4 class="text-xl text-textDark">{{ item.name }}</h4>
              <p class="text-lg font-bold text-primary mt-2">
                {{ getPriceText(item.price) }}
              </p>
            </div>
          </a>
          <NuxtLink v-else :to="`/menu/${item.id}`" class="block">
            <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
            </div>
            <div class="mt-4 text-center">
              <h4 class="text-xl text-textDark">{{ item.name }}</h4>
              <p class="text-lg font-bold text-primary mt-2">
                {{ getPriceText(item.price) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
      
      <button 
        @click="scrollFeatured(1)" 
        :class="{'opacity-0 pointer-events-none': featuredItems.length <= 4}"
        class="p-2 bg-white rounded-full shadow-md z-10 transition-opacity mt-[-4rem]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-textDark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    <div v-else class="text-center py-10">
      <p class="text-gray-500">아직 등록된 시그니처 메뉴가 없습니다.</p>
    </div>

    <div class="text-center mt-10">
      <NuxtLink to="/menu" class="bg-secondary text-textLight font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300">
        전체 메뉴 보기
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app';
import { ref } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

const config = useRuntimeConfig();
const API_URL = config.public.apiBaseUrl;

const { data: monthlyMenuItems, pending: pendingMonthly, error: monthlyError } = await useAsyncData('monthly-menu', () =>
  $fetch(`${API_URL}/products/main/monthly-menu`)
);

const { data: featuredItems, pending: pendingFeatured, error: featuredError } = await useAsyncData('signature-menu', () =>
  $fetch(`${API_URL}/products/main/signature-menu`)
);

const monthlyCarousel = ref<HTMLElement | null>(null);
const featuredCarousel = ref<HTMLElement | null>(null);

const scrollMonthly = (direction: number) => {
  if (monthlyCarousel.value) {
    const itemElement = monthlyCarousel.value.querySelector('.snap-start') as HTMLElement;
    if (itemElement) {
      const itemWidth = itemElement.offsetWidth;
      // 한 아이템씩 부드럽게 스크롤
      monthlyCarousel.value.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
    }
  }
};

const scrollFeatured = (direction: number) => {
  if (featuredCarousel.value) {
    const itemElement = featuredCarousel.value.querySelector('.snap-start') as HTMLElement;
    if (itemElement) {
      const itemWidth = itemElement.offsetWidth;
      // 한 아이템씩 부드럽게 스크롤
      featuredCarousel.value.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
    }
  }
};

const getPriceText = (price: any) => {
  if (price === 0) {
    return '별도 문의';
  }
  if (typeof price === 'number') {
    return `${price.toLocaleString()}원`;
  }
  return price;
};
</script>

<style scoped>
.relative {
  position: relative;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>