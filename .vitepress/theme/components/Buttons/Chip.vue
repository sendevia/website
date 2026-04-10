<script setup lang="ts">
/** 标签按钮变体 */
interface Props {
  /** 按钮形态 */
  pattern?: "chip";
  /** 按钮变体类型 */
  variant?: "assist" | "filter" | "input" | "suggestion";
  /** 图标名称 */
  icon?: string;
  /** 交互状态 */
  state?: "hover" | "focus" | "focus-visible" | "active" | "none";
  /** 是否禁用 */
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  pattern: "chip",
  variant: "assist",
  state: "none",
  disabled: false,
});
defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button :class="[pattern, variant, { icon: !!icon }]" :state="state" :disabled="disabled" @click="$emit('click', $event)">
    <StateLayer :state="state" />
    <span v-if="icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../../styles/components/Buttons/Chip");
</style>
