<template>
  <input :type="type"
         :value="modelValue"
         @input="handleInput"
         :placeholder="placeholder"
         :required="required"
         :disabled="disabled"
         :min="min"
         :max="max"
         class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-textDark">
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number; 
  type?: string; 
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number; 
  max?: string | number; 
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<style scoped>
</style>