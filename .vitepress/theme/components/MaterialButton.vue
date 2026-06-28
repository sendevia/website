<script setup lang="ts">
import { computed } from "vue";

interface Props {
  pattern?: "standard" | "chip" | "icon-button";
  variant?: string;
  size?: string;
  shape?: string;
  color?: string;
  icon?: string;
  width?: string;
  href?: string;
  target?: string;
  state?: "hover" | "focus" | "focus-visible" | "active" | "none";
  disabled?: boolean;
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

defineEmits<{
  click: [event: MouseEvent];
}>();

const isAnchor = computed(() => !!(props.pattern !== "chip" && props.href));
</script>

<template>
  <div class="MaterialButton">
    <component
      :is="isAnchor ? 'a' : 'button'"
      :class="[
        pattern,
        variant,
        size,
        pattern === 'icon-button' ? width : '',
        pattern !== 'chip' ? shape : '',
        color,
        { icon: !!icon, selected },
      ]"
      :state="disabled ? 'none' : state"
      :disabled="!isAnchor && disabled ? true : undefined"
      :href="isAnchor ? href : undefined"
      :target="isAnchor && href ? target : undefined"
      @click="$emit('click', $event)"
    >
      <StateLayer :state="disabled ? 'none' : state" />
      <span v-if="icon">{{ icon }}</span>
      <slot />
    </component>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/Buttons/Button");
@include meta.load-css("../styles/components/Buttons/Chip");
@include meta.load-css("../styles/components/Buttons/IconButton");
@include meta.load-css("../styles/components/Buttons/main");
</style>
