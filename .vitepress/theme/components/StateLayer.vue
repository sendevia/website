<script setup lang="ts">
/**
 * 状态层组件
 */
import { ref, computed } from "vue";
import { useParentElement, useElementHover, useEventListener } from "@vueuse/core";

interface Props {
  /** 悬停状态背景色 */
  hoverColor?: string;
  /** 聚焦状态背景色 */
  focusColor?: string;
  /** 激活状态背景色 */
  activeColor?: string;
  /** 是否启用悬停效果 */
  hoverEnabled?: boolean;
  /** 是否启用聚焦效果 */
  focusEnabled?: boolean;
  /** 是否启用激活效果 */
  activeEnabled?: boolean;
  /** 指定状态 */
  currentState?: "hover" | "focus" | "active" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  hoverColor: "var(--md-sys-state-hover-state-layer)",
  focusColor: "var(--md-sys-state-focus-state-layer)",
  activeColor: "var(--md-sys-state-pressed-state-layer)",
  hoverEnabled: true,
  focusEnabled: true,
  activeEnabled: true,
  currentState: "none",
});

// 获取父元素
const parent = useParentElement();
// 自动检测悬停状态
const isHovered = useElementHover(parent);
// 聚焦和激活状态
const isFocused = ref(false);
const isActive = ref(false);

// 监听父元素的聚焦与点击事件
useEventListener(parent, "focus", () => (isFocused.value = true));
useEventListener(parent, "blur", () => (isFocused.value = false));
useEventListener(parent, "mousedown", () => (isActive.value = true));
useEventListener(parent, "mouseup", () => (isActive.value = false));
useEventListener(parent, "mouseleave", () => (isActive.value = false));

/** 计算当前应该显示的背景色 */
const computedBackgroundColor = computed(() => {
  // 外部组件指定的强制状态
  if (props.currentState !== "none") {
    const map = {
      hover: props.hoverEnabled ? props.hoverColor : "transparent",
      focus: props.focusEnabled ? props.focusColor : "transparent",
      active: props.activeEnabled ? props.activeColor : "transparent",
      none: "transparent",
    };
    return map[props.currentState] || "transparent";
  }

  // 自动检测的状态
  if (isActive.value && props.activeEnabled) return props.activeColor;
  if (isFocused.value && props.focusEnabled) return props.focusColor;
  if (isHovered.value && props.hoverEnabled) return props.hoverColor;

  return "transparent";
});
</script>

<template>
  <div class="StateLayer" aria-hidden="true" :style="{ backgroundColor: computedBackgroundColor }"></div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/StateLayer");
</style>
