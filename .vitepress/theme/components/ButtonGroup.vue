<script setup lang="ts">
interface ExternalLink {
  type: string;
  label: string;
  link: string;
}

interface Props {
  links?: ExternalLink[];
  size?: "xs" | "s" | "m" | "l" | "xl";
  layout?: "horizontal" | "vertical";
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  size: "s",
  layout: "horizontal",
});

const getButtonColor = (type: string) => {
  switch (type) {
    case "download":
      return "tonal";
    case "normal":
    default:
      return "tonal";
  }
};

const getButtonIcon = (type: string) => {
  switch (type) {
    case "download":
      return "download";
    case "normal":
      return "open_in_new";
    default:
      return "";
  }
};
</script>

<template>
  <div v-if="links && links.length > 0" class="ButtonGroup" :class="[props.size, props.layout]">
    <MaterialButton
      v-for="(item, index) in links"
      class="group"
      :class="props.layout"
      :key="index"
      :href="item.link"
      :size="props.size"
      :color="getButtonColor(item.type)"
      :icon="getButtonIcon(item.type)"
      :target="'_blank'"
    >
      {{ item.label }}
    </MaterialButton>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ButtonGroup");
</style>
