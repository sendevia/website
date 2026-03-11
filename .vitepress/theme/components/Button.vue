<script setup lang="ts">
interface Props {
  /** 组件变体 */
  variant?: "button" | "chip";
  /** 按钮形状 */
  shape?: "round" | "square";
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 按钮颜色 */
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  /** 图标名称（使用 Material Symbols 图标字体） */
  icon?: string;
  /** 链接地址 */
  href?: string;
  /** 链接打开方式 */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** 指定状态 */
  currentState?: "hover" | "focus" | "active" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "button",
  shape: (props) => (props.variant === "button" ? "round" : "square"),
  size: "s",
  color: "filled",
  target: "_blank",
});
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    class="MaterialButton"
    :class="[props.variant, props.shape, props.size, props.color, props.icon ? 'icon' : '']"
    :target="props.target"
  >
    <StateLayer :currentState="props.currentState" />
    <span v-if="props.icon">
      {{ props.icon }}
    </span>
    <slot />
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Button");
</style>
