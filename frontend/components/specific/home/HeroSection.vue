<template>
  <section class="relative h-[600px] md:h-[700px] overflow-hidden">
    <TransitionGroup name="fade" tag="div" class="absolute inset-0 w-full h-full">
      <img v-for="(image, index) in heroImages" :key="image.src"
           :src="image.src" :alt="image.alt"
           v-show="currentImageIndex === index"
           class="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 transition-opacity duration-1000 ease-in-out">
    </TransitionGroup>

    <button @click="prevImage"
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full z-20
                   hover:bg-opacity-75 transition-colors focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <button @click="nextImage"
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full z-20
                   hover:bg-opacity-75 transition-colors focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-textLight px-4">
    </div>

    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
      <span v-for="(image, index) in heroImages" :key="image.src + '_dot'"
            @click="currentImageIndex = index"
            :class="['block w-3 h-3 rounded-full bg-white cursor-pointer transition-all duration-300',
                     currentImageIndex === index ? 'opacity-100 scale-125' : 'opacity-50']">
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 슬라이드쇼에 사용할 이미지 경로들 (public 폴더 기준)
const heroImages = [
  { src: '/images/menu-egg-benedict.jpg', alt: '에그 베네딕트' },
  { src: '/images/menu-avocado-toast.jpg', alt: '아보카도 토스트' },
  { src: '/images/brunch-mushroom-cream-pasta.jpg', alt: '머쉬룸 크림 파스타' },
  { src: '/images/brunch-classic-beef-burger.jpg', alt: '클래식 비프 버거' },
  { src: '/images/brunch-chicken-avocado-sandwich.jpg', alt: '치킨 아보카도 샌드위치' },
  { src: '/images/brunch-croissant-sandwich.jpg', alt: '크루아상 샌드위치' },
  { src: '/images/menu-americano.jpg', alt: '아메리카노' },
  { src: '/images/menu-latte.jpg', alt: '카페 라떼' },
  { src: '/images/menu-grapefruit-ade.jpg', alt: '자몽 에이드' },
  { src: '/images/menu-fruit-roll-cake.jpg', alt: '과일 롤 케이크' },
  { src: '/images/menu-animal-mini-cake.jpg', alt: '동물 미니 케이크' },
  { src: '/images/menu-lucky-turtle-slice-cake.jpg', alt: '조각 케이크' },
  { src: '/images/menu-babyblue-bottle-cake.jpg', alt: '보틀 케이크' },
  { src: '/images/menu-party-cupcake.jpg', alt: '컵 케이크' }
];

const currentImageIndex = ref(0);
let intervalId: NodeJS.Timeout | null = null; 

const startSlideshow = () => {
  if (heroImages.length > 1) {
    intervalId = setInterval(() => {
      nextImage();
    }, 5000);
  }
};

const stopSlideshow = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const nextImage = () => {
  stopSlideshow(); 
  currentImageIndex.value = (currentImageIndex.value + 1) % heroImages.length;
  startSlideshow(); 
};

const prevImage = () => {
  stopSlideshow(); 
  currentImageIndex.value = (currentImageIndex.value - 1 + heroImages.length) % heroImages.length;
  startSlideshow(); 
};

onMounted(() => {
  startSlideshow();
});

onUnmounted(() => {
  stopSlideshow();
});

</script>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}
.delay-200 { animation-delay: 0.2s; }
.delay-400 { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

</style>