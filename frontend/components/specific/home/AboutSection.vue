<template>
  <section class="w-full px-4 py-12">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="lg:order-2">
        <img src="/images/cafe-interior-2.jpg" alt="카페 내부" class="w-full h-auto rounded-xl shadow-lg">
      </div>
      <div class="lg:order-1 text-center lg:text-left">
        <h3 class="text-3xl md:text-4xl text-center font-bold mb-6 text-primary">
          About Us
        </h3>
        <p class="text-lg text-textDark text-center leading-relaxed mb-6">
          따스한 햇살이 비치는 공간에서, 갓 구운 빵과 향긋한 커피가 주는 작은 여유.
          블루밍무드베이킹은 당신의 바쁜 일상에 잠시 쉼표를 찍어드리는 도심 속 작은 안식처입니다.
        </p>
        <p class="text-lg text-textDark text-center leading-relaxed mb-8">
          최고급 스페셜티 원두와 신선한 제철 재료만을 고집하며,
          모든 메뉴에 정성을 담아 고객님의 오감을 만족시키는 경험을 선사합니다.
        </p>
        <div class="text-center mt-12">
          <NuxtLink to="/about" class="inline-block bg-accent text-textLight font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
            카페 이야기 더 보기
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>