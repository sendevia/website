<script setup lang="ts">
interface Props {
  /** 按钮形态 */
  pattern?: "standard";
  /** 按钮变体类型 */
  variant?: "default" | "toggle";
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 按钮形状 */
  shape?: "round" | "square";
  /** 按钮颜色 */
  color?: "elevated" | "filled" | "tonal" | "outlined" | "text";
  /** 图标名称 */
  icon?: string;
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
  pattern: "standard",
  variant: "default",
  size: "s",
  shape: "round",
  color: "filled",
  state: "none",
  disabled: false,
});
defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <component :is="href ? 'a' : 'button'" :class="[pattern, variant, shape, size, color, { icon: !!icon }]" :state="state" :disabled="disabled" :href="href" :target="href ? target : undefined" @click="$emit('click', $event)">
    <StateLayer :state="state" />
    <span v-if="icon">{{ icon }}</span>
    <slot />
  </component>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../../styles/components/Buttons/Button");
</style>
