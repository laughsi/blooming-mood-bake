<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

definePageMeta({
  requiresAuth: true
});

router.replace('/mypage/profile');

</script>

<template>
  <div></div>
</template>