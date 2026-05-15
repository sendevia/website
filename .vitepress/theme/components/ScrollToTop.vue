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
    <MaterialButton pattern="icon-button" size="l" color="tonal" aria-label="滚动到顶部" @click="scrollToTop">arrow_upward</MaterialButton>
  </div>
</template>

<style lang="scss" scoped>
@use "../styles/components/ScrollToTop";
</style>
