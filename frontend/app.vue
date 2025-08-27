<template>
  <div class="min-h-screen bg-background text-textDark font-sans">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Brunch Cafe - 일상의 여유를 선물하는 곳',
  meta: [
    { name: 'description', content: '신선한 브런치와 향긋한 커피, 편안한 공간에서 즐기는 특별한 시간.' }
  ],
})
</script>

<style scoped>
</style>