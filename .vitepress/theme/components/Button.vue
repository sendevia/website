<script setup lang="ts">
/**
 * MD3E 按钮组件
 * 包含变体：标准按钮（button）和标签（chip）
 * https://m3.material.io/components/buttons/specs
 * https://m3.material.io/components/chips/specs
 */
import { computed, inject, useAttrs } from "vue";
import { BUTTON_GROUP_KEY } from "../composables/useButtonGroup";
import type { ButtonColor, ButtonShape, ButtonSize, ButtonVariant } from "../composables/useButtonGroup";

defineOptions({ inheritAttrs: false });

interface Props {
  /** 组件变体 */
  variant?: ButtonVariant;
  /** 按钮形状 */
  shape?: ButtonShape;
  /** 按钮大小 */
  size?: ButtonSize;
  /** 按钮颜色 */
  color?: ButtonColor;
  /** 图标名称（使用 Material Symbols 图标字体） */
  icon?: string;
  /** 链接地址，存在时渲染为 <a> 标签 */
  href?: string;
  /** 链接打开方式 */
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** 手动指定状态，通常由父组件控制 */
  currentState?: "hover" | "focus" | "active" | "none";
  /** 是否禁用 */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  target: "_blank",
  currentState: "none",
});

/** 注入父级 ButtonGroup 的上下文（若存在） */
const group = inject(BUTTON_GROUP_KEY, undefined);
const attrs = useAttrs();

/** 实际变体：自身 prop > 组级默认 > fallback */
const resolvedVariant = computed<ButtonVariant>(() => props.variant ?? group?.variant ?? "button");
/** 实际尺寸：自身 prop > 组级默认 > fallback */
const resolvedSize = computed<ButtonSize>(() => props.size ?? group?.size ?? "s");
/** 实际颜色：自身 prop > 组级默认 > fallback */
const resolvedColor = computed<ButtonColor>(() => props.color ?? group?.color ?? "filled");
/** 实际形状：自身 prop > 组级默认 > 按变体决定 */
const resolvedShape = computed<ButtonShape>(
  () => props.shape ?? group?.shape ?? (resolvedVariant.value === "chip" ? "square" : "round"),
);

/** data-group-value：由 ButtonGroup 数组驱动时注入，或插槽模式由外部指定 */
const groupValue = computed(() => attrs["data-group-value"] as string | undefined);

/** 当前按钮是否处于选中态 */
const selected = computed(() => (group?.selectionMode && groupValue.value ? group.isSelected(groupValue.value) : false));

/** 实际交互状态：选中时强制为 active，否则使用传入值 */
const resolvedState = computed(() => (selected.value ? "active" : props.currentState));

/** 点击处理：若在有 selectionMode 的组内，委托给 group.toggle */
function handleClick() {
  if (group?.selectionMode && groupValue.value) {
    group.toggle(groupValue.value);
  }
}
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    v-bind="$attrs"
    :href="href"
    :class="[
      'MaterialButton',
      resolvedVariant,
      resolvedShape,
      resolvedSize,
      resolvedColor,
      { icon: !!props.icon, selected },
    ]"
    :target="href ? props.target : undefined"
    :type="!href ? ($attrs.type as any) || 'button' : undefined"
    :disabled="disabled"
    @click="handleClick"
  >
    <StateLayer :currentState="resolvedState" />
    <span v-if="props.icon">{{ props.icon }}</span>
    <slot />
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Button");
</style>
