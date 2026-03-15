<script setup lang="ts">
/**
 * 按钮组件
 */
defineOptions({
  inheritAttrs: false,
});

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
  /** 链接地址，存在时渲染为 <a> 标签 */
  href?: string;
  /** 链接打开方式 */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** 手动指定状态，通常由父组件控制 */
  currentState?: "hover" | "focus" | "active" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "button",
  shape: (props) => (props.variant === "button" ? "round" : "square"),
  size: "s",
  color: "filled",
  target: "_blank",
  currentState: "none",
});
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="$attrs"
    :href="href"
    :class="['MaterialButton', props.variant, props.shape, props.size, props.color, { icon: !!props.icon }]"
    :target="href ? props.target : undefined"
    :type="!href ? ($attrs.type as any) || 'button' : undefined"
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
