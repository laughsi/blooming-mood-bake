<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeModal">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-scale-in" @click.stop>
      <div class="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
        <slot name="header">
          <h3 class="text-2xl font-bold text-primary">모달 제목</h3>
        </slot>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="mb-6 max-h-96 overflow-y-auto">
        <slot name="body">
          <p class="text-textDark">모달 내용이 여기에 표시됩니다.</p>
        </slot>
      </div>

      <div class="flex justify-end pt-4 border-t border-gray-200">
        <slot name="footer">
          <BaseButton @click="closeModal" variant="secondary" size="sm">닫기</BaseButton>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue'; 

interface Props {
  modelValue?: boolean; 
  isOpen?: boolean; 
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'close']);

const isOpen = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : (props.isOpen || false),
  set: (value) => {
    emit('update:modelValue', value);
    if (!value) emit('close');
  }
});

const closeModal = () => {
  isOpen.value = false;
};
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}
</style>