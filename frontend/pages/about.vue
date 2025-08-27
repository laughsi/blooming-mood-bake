<template>
  <div class="about-page">
    <section class="w-full px-4 py-12">
      <h1 class="text-4xl md:text-5xl font-bold text-center mb-10 text-primary">블루밍무드베이킹 이야기</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        <div class="order-2 md:order-1">
          <img src="/images/about-interior-1.jpg" alt="카페 내부" class="w-full h-auto rounded-xl shadow-lg">
        </div>
        <div class="order-1 md:order-2">
          <h2 class="text-3xl text-center font-semibold text-secondary mb-4">일상 속 작은 행복</h2>
          <p class="text-lg text-center text-textDark leading-relaxed mb-4">
            블루밍무드베이킹은 바쁜 일상 속에서 잠시 멈춰서 자신을 위한 시간을 가질 수 있는 공간을 만들고자 시작되었습니다.
            신선하고 건강한 재료로 만든 브런치와 향기로운 커피 한 잔으로, 고객님들의 하루에 작은 행복과 활력을 더하는 것이 저희의 목표입니다.
          </p>
          <p class="text-lg text-center text-textDark leading-relaxed">
            모든 메뉴는 정성을 다해 직접 만들며, 따뜻하고 아늑한 분위기에서 편안하게 머무르실 수 있도록 공간 하나하나에 마음을 담았습니다.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
        <div>
          <h2 class="text-3xl text-center font-semibold text-secondary mb-4">신선함과 맛에 대한 고집</h2>
          <p class="text-lg text-center text-textDark leading-relaxed mb-4">
            저희는 매일 아침 엄선된 신선한 채소와 최상급 식재료만을 사용합니다.
            오랜 시간 연구하고 개발한 레시피로 누구나 만족할 수 있는 깊은 맛을 선사하며,
            바리스타가 직접 로스팅한 원두로 추출한 커피는 당신의 미각을 깨울 것입니다.
          </p>
          <p class="text-lg text-center text-textDark leading-relaxed">
            블루밍무드베이킹에서 맛과 건강, 그리고 행복을 동시에 경험해보세요.
          </p>
        </div>
        <div>
          <img src="/images/about-food-ingredients.jpg" alt="신선한 재료" class="w-full h-auto rounded-xl shadow-lg">
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '카페 소개',
});
</script>

<style scoped>
</style>