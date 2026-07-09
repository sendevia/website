<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useScroll } from "@vueuse/core";

const scrollContainer = ref<HTMLElement | null>(null);
const { y } = useScroll(scrollContainer, { offset: { top: 500 } });
const isScrolled = computed(() => y.value > 500);

onMounted(() => {
  scrollContainer.value = document.querySelector(".content-flow");
});

function scrollToTop() {
  scrollContainer.value?.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <div class="ScrollToTop" :class="{ visible: isScrolled }">
    <MaterialButton
      pattern="icon-button"
      size="l"
      color="tonal"
      aria-label="滚动到顶部"
      @click="scrollToTop"
    >
      arrow_upward
    </MaterialButton>
  </div>
</template>

<style lang="scss" scoped>
@use "../styles/components/ScrollToTop";
</style>
