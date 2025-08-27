<template>
  <footer class="bg-secondary text-textLight py-8 mt-12 relative overflow-hidden"> <div class="container mx-auto px-4 text-center">
      <p class="text-lg font-semibold mb-2">블루밍무드베이킹</p>
      <p class="text-sm">&copy; {{ new Date().getFullYear() }} 블루밍무드베이킹. All rights reserved.</p>
      <div class="flex justify-center space-x-4 mt-4">
        <a href="#" class="hover:text-primary transition-colors duration-200">개인정보처리방침</a>
        <a href="#" class="hover:text-primary transition-colors duration-200">이용약관</a>
        <a href="#" class="hover:text-primary transition-colors duration-200">오시는 길</a>
      </div>
      <div class="mt-4">
        <a href="https://www.instagram.com/gunil_flicker/" target="_blank" rel="noopener noreferrer" class="mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
//
</script>

<style scoped>
</style>