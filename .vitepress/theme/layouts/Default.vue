<script setup lang="ts">
import AllPostsLayout from "./AllPosts.vue";
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";
import SearchPostsLayout from "./SearchPosts.vue";
import Footer from "../components/Footer.vue";
import Sidebar from "../components/Sidebar.vue";
import ScrollToTop from "../components/ScrollToTop.vue";
import { argbFromHex } from "@material/material-color-utilities";
import { generateColorPalette } from "../utils/colorPalette";
import { onMounted, nextTick, computed, ref, watch } from "vue";
import { useRoute } from "vitepress";
import { useGlobalData } from "../composables/useGlobalData";

const { site, page, frontmatter, theme } = useGlobalData();
const route = useRoute();

const isTransitioning = ref(false);
const currentRoutePath = ref(route.path);
const pendingRoutePath = ref<string | null>(null);

let currentPaletteTask: Promise<void> | null = null;
let isProcessingPalette = false;

async function updatePalette() {
  if (isProcessingPalette) {
    return;
  }

  isProcessingPalette = true;

  currentPaletteTask = (async () => {
    try {
      await nextTick();

      const defaultColor = theme.value.defaultColor;
      const defaultArgb = argbFromHex(defaultColor);

      await generateColorPalette(defaultArgb);

      const el = document.getElementById("header-impression-image");
      if (el) {
        const colorAttr = el.getAttribute("impression-color");
        if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
          const argb = argbFromHex(colorAttr);
          await generateColorPalette(argb);
          return;
        }
      }
    } finally {
      isProcessingPalette = false;
      currentPaletteTask = null;
    }
  })();

  currentPaletteTask.catch((error) => {
    console.warn("Palette update failed:", error);
  });
}

const layoutMap = {
  article: ArticleLayout,
  posts: AllPostsLayout,
  search: SearchPostsLayout,
} as const;

type LayoutKey = keyof typeof layoutMap;

const currentLayout = computed(() => {
  if (frontmatter.value.home) return null;
  if (page.value.isNotFound) return NotFoundLayout;
  const key = (frontmatter.value.layout ?? "article") as LayoutKey;
  return layoutMap[key] ?? ArticleLayout;
});

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && !isTransitioning.value) {
      isTransitioning.value = true;
      pendingRoutePath.value = newPath;
    }
  },
  { immediate: true }
);

function onAfterEnter() {
  isTransitioning.value = false;
  currentRoutePath.value = route.path;
  pendingRoutePath.value = null;
  updatePalette();
}

function onBeforeLeave() {
  isTransitioning.value = true;
}

if (typeof window !== "undefined") {
  onMounted(updatePalette);
}
</script>

<template>
  <div id="layout">
    <Sidebar />
    <Transition name="layout-content" mode="out-in" @before-leave="onBeforeLeave" @after-enter="onAfterEnter">
      <div id="layout-content-flow" :key="route.path">
        <div id="layout-home-title" v-if="frontmatter.home">
          <img src="/assets/images/avatar.webp" alt="avatar" />
          <div>
            <h1>{{ site.title }}</h1>
            <p>{{ site.description }}</p>
          </div>
        </div>
        <component v-else :is="currentLayout" />
        <ScrollToTop />
        <Footer />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@use "../styles/mixin";

#layout {
  display: grid;
  grid-template-columns: 96px auto;

  position: relative;

  height: 100%;

  z-index: 1;

  #layout-content-flow {
    display: grid;
    align-content: space-between;
    align-items: start;
    gap: 24px;
    grid-column: 2;
    grid-template-columns: repeat(12, minmax(60px, 72px));
    justify-content: center;

    position: relative;

    padding-block-end: 68px;
    padding-block-start: 12px;

    width: 100%;

    overflow: overlay;
    scroll-behavior: smooth;
    scroll-padding-top: 120px;
    scrollbar-width: thin;

    #layout-content-filler {
      display: flex;
      flex-flow: column wrap;
      grid-column: 1 / 13;

      height: 100%;

      padding: 24px;
    }

    #layout-home-title {
      display: flex;
      align-items: center;
      gap: 42px;
      grid-column: 1 / 13;
      justify-content: center;

      width: 100%;

      h1 {
        @include mixin.typescale-style("display-large");

        grid-column: span 9;
      }

      h6 {
        grid-column: span 9;

        text-align: end;
      }

      img {
        grid-column: 11 / span 2;
        grid-row: 2 / span 2;

        height: 120px;
        width: 120px;

        -webkit-mask: var(--via-svg-mask) no-repeat 0 / 100%;
        mask: var(--via-svg-mask) no-repeat 0 / 100%;
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  #layout #layout-content-flow {
    grid-template-columns: repeat(12, minmax(60px, 72px));

    padding-inline: 12px;
  }
}

@media screen and (max-width: 1200px) {
  #layout #layout-content-flow {
    grid-template-columns: repeat(8, 1fr);

    width: 100%;
  }
}

@media screen and (max-width: 840px) {
  #layout {
    grid-template-columns: 0px auto;
    grid-template-rows: auto 80px;

    #layout-content-flow {
      grid-template-columns: repeat(6, 1fr);

      padding-block: 64px;
      padding-inline: 42px;
    }
  }
}

@media screen and (max-width: 600px) {
  #layout #layout-content-flow {
    grid-template-columns: repeat(4, 1fr);

    padding-inline: 12px;
  }
}
</style>
