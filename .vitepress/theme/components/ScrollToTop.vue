<script setup lang="ts">
import { useGlobalScroll } from "../composables/useGlobalScroll";

const { isScrolled } = useGlobalScroll({ threshold: 500 });

function scrollToTop() {
  const container = document.querySelector(".content-flow");
  (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="ScrollToTop" :class="{ visible: isScrolled }">
    <MaterialButton size="l" color="elevated" icon="arrow_upward" aria-label="Scroll to top" @click="scrollToTop" />
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ScrollToTop");
</style>
