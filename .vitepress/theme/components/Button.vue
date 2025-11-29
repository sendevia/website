<script setup lang="ts">
interface Props {
  text?: string;
  href?: string;
  icon?: string;
  size?: "xs" | "s" | "m" | "l" | "xl";
  shape?: "round" | "square";
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  target?: "_blank" | "_self" | "_parent" | "_top";
}

const props = withDefaults(defineProps<Props>(), {
  size: "s",
  shape: "round",
  color: "filled",
  target: "_blank",
});
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    class="md-button"
    :class="[props.shape, props.size, props.color, props.icon ? 'icon' : '']"
  >
    <span v-if="props.icon">
      {{ props.icon }}
    </span>
    {{ props.text }}
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Button");
</style>
