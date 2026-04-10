<script setup lang="ts">
interface Props {
  /** 按钮形态 */
  pattern?: "icon-button";
  /** 按钮变体类型 */
  variant?: "default" | "toggle";
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 按钮形状 */
  shape?: "round" | "square";
  /** 按钮颜色 */
  color?: "filled" | "tonal" | "outlined" | "standard";
  /** 按钮宽度 */
  width?: "normal" | "narrow" | "wide";
  /** 链接地址 */
  href?: string;
  /** 链接打开方式 */
  target?: string;
  /** 交互状态 */
  state?: "hover" | "focus" | "focus-visible" | "active" | "none";
  /** 是否禁用 */
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  pattern: "icon-button",
  variant: "default",
  size: "s",
  shape: "round",
  color: "filled",
  width: "normal",
  state: "none",
  disabled: false,
});
defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <component :is="href ? 'a' : 'button'" :class="[pattern, variant, size, shape, color, width]" :state="state" :disabled="disabled" :href="href" :target="href ? target : undefined" @click="$emit('click', $event)">
    <StateLayer :state="state" />
    <slot />
  </component>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../../styles/components/Buttons/IconButton");
</style>
