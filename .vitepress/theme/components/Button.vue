<script setup lang="ts">
interface Props {
  href?: string;
  icon?: string;
  text?: string;
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  shape?: "round" | "square";
  size?: "xs" | "s" | "m" | "l" | "xl";
  target?: "_blank" | "_self" | "_parent" | "_top";
}

const props = withDefaults(defineProps<Props>(), {
  color: "filled",
  shape: "round",
  size: "s",
  target: "_blank",
});
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    class="MaterialButton"
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
