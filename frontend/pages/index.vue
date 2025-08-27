<template>
  <div class="home-page">
    <HeroSection />
    <section class="w-full px-4 py-12">
      <FeaturedMenu />
    </section>
    <AboutSection />
    <GallerySection />
    <section class="bg-gray-100container mx-auto px-4 py-12 text-center">
      <h2 class="text-4xl font-bold text-center mb-8 text-primary">Address</h2>
      <p class="text-lg text-textDark mb-4">
        울진군 북면 부구리 231-8, 블루밍무드베이킹
      </p>
      <p class="text-lg text-textDark mb-8">
        영업시간: 매일 오전 8시 - 오후 10시 (Last Order 9시 30분)
      </p>
      <a href="https://maps.google.com/?q=울진군 북면 부구리 231-8" target="_blank" rel="noopener noreferrer"
         class="inline-block bg-primary text-textLight font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300">
        지도에서 보기
      </a>
    </section>
  </div>
</template>

<script setup lang="ts">
import HeroSection from '@/components/specific/home/HeroSection.vue';
import FeaturedMenu from '@/components/specific/home/FeaturedMenu.vue';
import AboutSection from '@/components/specific/home/AboutSection.vue';
import GallerySection from '@/components/specific/home/GallerySection.vue';

useHead({
  title: '블루밍무드베이킹',
});
</script>

<style scoped>
</style>