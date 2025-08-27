<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <AppFooter />
    <AppNotification /> </div>
</template>

<script setup lang="ts">
</script>

<style>
body {
  font-family: 'Pretendard', sans-serif;
  @apply bg-background text-textDark;
}
</style>