<template>
  <textarea :value="modelValue"
            @input="handleInput"
            :placeholder="placeholder"
            :required="required"
            :disabled="disabled"
            :rows="rows"
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-textDark resize-y">
  </textarea>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  required: false,
  disabled: false,
  rows: 3,
});

const emit = defineEmits(['update:modelValue']);

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};
</script>

<style scoped>
</style>