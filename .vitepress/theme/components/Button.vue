<script setup lang="ts">
interface Props {
  shape?: "round" | "square";
  size?: "xs" | "s" | "m" | "l" | "xl";
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  icon?: string;
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

const props = withDefaults(defineProps<Props>(), {
  shape: "round",
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
    :class="[props.shape, props.size, props.color, props.icon ? 'icon' : '']"
    :target="props.target"
  >
    <span v-if="props.icon">
      {{ props.icon }}
    </span>
    <slot></slot>
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Button");
</style>
