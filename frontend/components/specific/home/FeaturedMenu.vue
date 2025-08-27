<template>
  <section class="w-full px-4 py-12">
    <h2 class="text-4xl font-bold text-center mb-4 text-primary">Menu Of Month</h2>
    <p class="text-center text-lg text-textDark mb-10 max-w-3xl mx-auto">
      매월 새롭게 선보이는 블루밍무드베이킹의 특별한 메뉴들을 만나보세요.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <div v-for="item in monthlyMenuItems" :key="item.id" class="flex flex-col items-center">
        <div class="block cursor-pointer" @click="openDetail(item)">
          <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
          </div>
          <div class="mt-4 text-center">
            <h4 class="text-xl text-textDark">{{ item.name }}</h4>
            <p class="text-lg font-bold text-primary mt-2">
              <span v-if="item.price && !isNaN(parseInt(item.price.replace(',', '')))">
                {{ item.price }}원
              </span>
              <span v-else>
                {{ item.price }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-4xl font-bold text-center mb-4 text-primary mt-16">Signeture Menu</h2>
    <p class="text-center text-lg text-textDark mb-10 max-w-3xl mx-auto">
      블루밍무드베이킹의 시그니처 메뉴로 특별한 브런치를 즐겨보세요.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div v-for="item in featuredItems" :key="item.id" class="flex flex-col items-center">
        <div class="block cursor-pointer" @click="openDetail(item)">
          <div class="relative w-full rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <img :src="item.imageUrl" :alt="item.name" class="w-full aspect-square object-cover">
          </div>
          <div class="mt-4 text-center">
            <h4 class="text-xl text-textDark">{{ item.name }}</h4>
            <p class="text-lg font-bold text-primary mt-2">
              <span v-if="item.price && !isNaN(parseInt(item.price.replace(',', '')))">
                {{ item.price }}원
              </span>
              <span v-else>
                {{ item.price }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-12">
      <NuxtLink to="/menu" class="bg-secondary text-textLight font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300">
        전체 메뉴 보기
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const monthlyMenuItems = ref([
  { id: 5, name: '프렌치 토스트', description: '달콤한 메이플 시럽과 계절 과일이 어우러진 프렌치 토스트', price: '13,000', imageUrl: '/images/menu-french-toast.jpg' },
  { id: 6, name: '쉬림프 로제 파스타', description: '신선한 새우와 부드러운 로제 소스가 어우러진, 풍미 가득한 파스타', price: '18,000', imageUrl: '/images/brunch-shrimp-rose-pasta.jpg'},
  { id: 7, name: '주문제작 케이크', description: '원하는 디자인과 맛으로 세상에 단 하나뿐인 특별한 케이크를 만들어 드립니다.', price: '별도 문의', imageUrl: '/images/dessert-custom-cake.jpg'},
  { id: 8, name: '생화 케이크', description: '화려한 생화로 장식되어 특별한 날을 더욱 빛내줄 미니 케이크', price: '50,000', imageUrl: '/images/menu-fresh-flower-cake.jpg'},
]);

const featuredItems = ref([
  { id: 1, name: '프렌치 토스트', description: '달콤한 메이플 시럽과 계절 과일이 어우러진 프렌치 토스트', price: '13,000', imageUrl: '/images/menu-french-toast.jpg' },
  { id: 2, name: '쉬림프 로제 파스타', description: '신선한 새우와 부드러운 로제 소스가 어우러진, 풍미 가득한 파스타', price: '18,000', imageUrl: '/images/brunch-shrimp-rose-pasta.jpg'},
  { id: 3, name: '주문제작 케이크', description: '원하는 디자인과 맛으로 세상에 단 하나뿐인 특별한 케이크를 만들어 드립니다.', price: '별도 문의', imageUrl: '/images/dessert-custom-cake.jpg'},
  { id: 4, name: '생화 케이크', description: '화려한 생화로 장식되어 특별한 날을 더욱 빛내줄 미니 케이크', price: '50,000', imageUrl: '/images/menu-fresh-flower-cake.jpg'},
]);


// alert 창을 띄우는 함수 추가
const openDetail = (item: any) => {
  alert(`"${item.name}" 상세 보기 (모달 구현 예정)`);
};
</script>

<style scoped>
</style>