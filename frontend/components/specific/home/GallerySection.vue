<template>
  <section class="w-full px-4 py-12">
    <h3 class="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">Gallery & instagram</h3>
    <p class="text-center text-lg text-textDark mb-12 max-w-3xl mx-auto">
      블루밍무드베이킹의 아름다운 순간들을 만나보세요. 매일 업데이트되는 새로운 메뉴와 풍경을 인스타그램에서 확인하실 수 있습니다.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="image in galleryImages" :key="image.id"
           class="relative overflow-hidden rounded-xl shadow-md cursor-pointer group">
        <img :src="image.src" :alt="image.alt"
             class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110 aspect-square">
        <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p class="text-white text-lg font-semibold">{{ image.alt }}</p>
        </div>
      </div>
    </div>

    <div class="text-center mt-12">
      <a href="https://www.instagram.com/gunil_flicker/" target="_blank" rel="noopener noreferrer"
         class="inline-block bg-secondary text-textLight font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300">
        인스타그램 방문하기
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
const galleryImages = ref([
  { id: 1, src: '/images/gallery/gallery-1.jpg', alt: '카페 외관' },
  { id: 2, src: '/images/gallery/gallery-2.jpg', alt: '브런치 플레이트' },
  { id: 3, src: '/images/gallery/gallery-3.jpg', alt: '커피 한 잔' },
  { id: 4, src: '/images/gallery/gallery-4.jpg', alt: '디저트와 테이블' },
  { id: 5, src: '/images/gallery/gallery-5.jpg', alt: '창가 자리' },
  { id: 6, src: '/images/gallery/gallery-6.jpg', alt: '바리스타' },
  { id: 7, src: '/images/gallery/gallery-7.jpg', alt: '포장된 브런치' },
  { id: 8, src: '/images/gallery/gallery-8.jpg', alt: '아침 햇살' },
]);
</script>

<style scoped>
</style>