<template>
  <button :type="type"
          :class="['transition-all duration-300 transform', buttonClasses]"
          :disabled="disabled"
          @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
});

const emit = defineEmits(['click']);

const buttonClasses = computed(() => {
  const classes = [];

  if (props.variant === 'primary') {
    classes.push('bg-primary text-textLight hover:bg-opacity-90 shadow-lg');
  } else if (props.variant === 'secondary') {
    classes.push('bg-secondary text-textLight hover:bg-opacity-90 shadow-md');
  } else if (props.variant === 'accent') {
    classes.push('bg-accent text-textLight hover:bg-opacity-90 shadow-md');
  } else if (props.variant === 'outline') {
    classes.push('border border-primary text-primary hover:bg-primary hover:text-textLight shadow-sm');
  } else if (props.variant === 'text') {
    classes.push('text-primary hover:text-secondary');
  }

  if (props.size === 'sm') {
    classes.push('px-4 py-2 text-sm rounded-lg');
  } else if (props.size === 'md') {
    classes.push('px-6 py-3 text-base rounded-full');
  } else if (props.size === 'lg') {
    classes.push('px-8 py-4 text-lg rounded-full');
  }

  if (props.disabled) {
    classes.push('opacity-50 cursor-not-allowed');
  } else {
    classes.push('hover:scale-105');
  }

  return classes.join(' ');
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<style scoped>
</style>