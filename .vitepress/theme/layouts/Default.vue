<script setup lang="ts">
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";
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

      let logColor = defaultColor;

      const el = document.getElementById("header-impression-image");
      if (el) {
        const colorAttr = el.getAttribute("impression-color");
        if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
          const argb = argbFromHex(colorAttr);
          await generateColorPalette(argb);
          logColor = colorAttr;
        }
      }

      // 最后输出最终使用的颜色
      console.log(
        `%c ${logColor} `,
        `padding: 3px 4px; border-radius: 6px; color: #fff; background: ${logColor}; font-weight: bold; text-shadow: 0px 1px black;`
      );
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
  onMounted(() => {
    updatePalette();
  });
}
</script>

<template>
  <div id="layout">
    <NavBar />
    <AppBar />
    <Transition name="layout-content" mode="out-in" @before-leave="onBeforeLeave" @after-enter="onAfterEnter">
      <div id="layout-content-flow" :key="route.path">
        <div id="layout-home-title" v-if="frontmatter.home">
          <div>
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
@include meta.load-css("../styles/layouts/Default");
</style>
