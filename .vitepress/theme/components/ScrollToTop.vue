<script setup lang="ts">
import { useGlobalScroll } from "../composables/useGlobalScroll";

const { isScrolled } = useGlobalScroll({ threshold: 500 });

function scrollToTop() {
  const container = document.getElementById("contentFlow");
  (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="ScrollToTop" :class="{ visible: isScrolled }">
    <span class="button" role="button" aria-label="Scroll to top" @click="scrollToTop"> arrow_upward </span>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ScrollToTop");
</style>
