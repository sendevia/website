<script setup lang="ts">
/**
 * Material 按钮组件
 */
import { computed, useSlots } from "vue";

/** 按钮尺寸 */
type Size = "xs" | "s" | "m" | "l" | "xl";
/** 按钮形状 */
type Shape = "round" | "square";
/** 按钮配色方案 */
type Color = "elevated" | "filled" | "tonal" | "outlined" | "text";
/** 按钮宽度预设 */
type Width = "narrow" | "normal" | "wide";
/** 按钮变体 */
type Variant = "default" | "assist" | "suggestion" | "filter" | "input";
/** 按钮状态（用于外部控制交互态样式） */
type ButtonState = "hover" | "focus" | "focus-visible" | "active" | "none";

/** MaterialButton 组件属性 */
interface Props {
  /** 按钮模式 */
  pattern?: "standard" | "chip" | "icon-button";
  /** 按钮变体 */
  variant?: Variant;
  /** 按钮尺寸 */
  size?: Size;
  /** 按钮形状 */
  shape?: Shape;
  /** 配色方案 */
  color?: Color;
  /** Material Icons 图标名称 */
  icon?: string;
  /** 宽度预设 */
  width?: Width;
  /** 链接地址（设置后渲染为 `<a>`） */
  href?: string;
  /** 链接打开方式 */
  target?: string;
  /** 强制指定按钮交互状态 */
  state?: ButtonState;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否选中（用于筛选/chip 模式） */
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pattern: "standard",
  variant: "default",
  size: "s",
  shape: "round",
  color: "filled",
  width: "normal",
  state: "none",
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const slots = useSlots();

/** 是否渲染为 `<a>` 链接 */
const isAnchor = computed((): boolean => props.pattern !== "chip" && !!props.href);

/** 映射到 StateLayer 支持的 state 类型 */
const layerState = computed((): "hover" | "focus" | "active" | "none" =>
  props.disabled ? "none" : props.state === "focus-visible" ? "focus" : props.state,
);

/** 计算 CSS class 列表 */
const classes = computed((): (string | Record<string, boolean>)[] => [
  props.pattern,
  props.variant,
  props.size,
  props.pattern === "icon-button" ? props.width : "",
  props.pattern !== "chip" ? props.shape : "",
  props.color,
  { icon: !!props.icon, selected: !!props.selected },
]);

/** 图标按钮且无文本内容时，使用 icon 名作为无障碍标签 */
const ariaLabel = computed((): string | undefined =>
  props.pattern === "icon-button" && !slots.default?.().length && props.icon
    ? props.icon
    : undefined,
);

/**
 * 点击事件处理
 * - 禁用状态下不触发 emit
 */
function handleClick(event: MouseEvent) {
  if (props.disabled) return;
  emit("click", event);
}
</script>

<template>
  <div class="MaterialButton">
    <component
      :is="isAnchor ? 'a' : 'button'"
      :class="classes"
      :type="isAnchor ? undefined : 'button'"
      :role="isAnchor ? 'button' : undefined"
      :aria-label="ariaLabel"
      :aria-disabled="isAnchor && disabled ? true : undefined"
      :disabled="!isAnchor && disabled ? true : undefined"
      :href="isAnchor && !disabled ? href : undefined"
      :target="isAnchor && href ? target : undefined"
      :tabindex="isAnchor && disabled ? -1 : undefined"
      @click="handleClick"
    >
      <StateLayer :state="layerState" />
      <span v-if="icon" class="icon" aria-hidden="true">{{ icon }}</span>
      <slot />
    </component>
  </div>
</template>

<style lang="scss">
@use "../styles/components/Buttons/Button";
@use "../styles/components/Buttons/Chip";
@use "../styles/components/Buttons/IconButton";
@use "../styles/components/Buttons/Main";
</style>
