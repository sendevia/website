<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const visible = ref(false);
let container: HTMLElement | Window = window;

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return overflowY === "auto" || overflowY === "scroll" || el.scrollHeight > el.clientHeight;
}

function detectContainer() {
  const el = document.getElementById("layout-content-flow");
  if (el && isScrollable(el)) return el;
  return window;
}

function onScroll() {
  try {
    const y = container === window ? window.scrollY || window.pageYOffset : (container as HTMLElement).scrollTop;
    visible.value = y > 240;
  } catch (e) {
    visible.value = false;
  }
}

function scrollToTop() {
  if (container === window) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
  }
}

onMounted(() => {
  container = detectContainer();
  const target: any = container;
  target.addEventListener("scroll", onScroll, { passive: true });
  if (container !== window) window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  const target: any = container;
  target.removeEventListener("scroll", onScroll);
  if (container !== window) window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div id="layout-scrolltop" :class="{ visible: visible }" @click="scrollToTop">
    <span id="scrolltop-button" role="button" aria-label="Scroll to top"> arrow_upward </span>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/mixin";

#layout-scrolltop {
  display: flex;
  align-items: center;
  grid-column: 11/13;
  justify-content: center;

  position: sticky;
  bottom: 72px;
  right: 0px;

  height: 100%;
  width: 100%;

  -moz-user-select: none;
  opacity: 0;
  transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
  user-select: none;
  visibility: hidden;
  z-index: 21;

  #scrolltop-button {
    @include mixin.material-symbols($size: 24, $line-height: 84);

    position: relative;

    height: 84px;
    width: 84px;

    color: var(--md-sys-color-outline);
    text-align: center;

    border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid var(--md-sys-color-outline-variant);

    background-color: var(--md-sys-color-surface-container-low);

    cursor: pointer;
    overflow: hidden;
    transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);

    &:hover {
      background-color: var(--md-sys-color-surface-container-high);
    }
  }

  &.visible {
    opacity: 1;
    visibility: visible;
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
}

@media screen and (max-width: 600px) {
}
</style>
