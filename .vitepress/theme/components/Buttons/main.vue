<script setup lang="ts">
import { computed } from "vue";
import StandardButton from "./Button.vue";
import ChipButton from "./Chip.vue";
import IconButton from "./IconButton.vue";

// 禁用自动继承，通过 v-bind 手动控制透传
defineOptions({
  inheritAttrs: false,
});

/** 父级按钮传入属性 */
interface Props {
  /** 按钮变体类型 */
  pattern?: "standard" | "chip" | "icon-button";
}

const props = defineProps<Props>();

/**
 * 动态计算当前所需要渲染的子组件
 * 根据 pattern 的不同选用最优变体组件
 */
const currentComponent = computed<any>(() => {
  switch (props.pattern) {
    case "chip":
      return ChipButton;
    case "icon-button":
      return IconButton;
    case "standard":
    default:
      return StandardButton;
  }
});
</script>

<template>
  <div class="MaterialButton">
    <component :is="currentComponent" v-bind="$attrs">
      <slot />
    </component>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../../styles/components/Buttons/main");
</style>
