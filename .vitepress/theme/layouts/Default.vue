<script setup lang="ts">
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";
import { argbFromHex } from "@material/material-color-utilities";
import { generateColorPalette } from "../utils/colorPalette";
import { onMounted, nextTick, computed, ref, watch } from "vue";
import { useRoute } from "vitepress";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";

const { site, page, frontmatter, theme } = useGlobalData();
const route = useRoute();
const postStore = usePostStore();

const isTransitioning = ref(false);
const currentRoutePath = ref(route.path);
const pendingRoutePath = ref<string | null>(null);
const isRedirecting = ref(false);

let redirectTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 检查并执行重定向
 * 返回 true 表示正在处理重定向
 */
function checkAndRedirect(path: string): boolean {
  if (isRedirecting.value) return true;
  if (!path.startsWith("/p/")) return false;

  const match = path.match(/^\/p\/([a-zA-Z0-9]+)\/?$/);
  if (match) {
    const id = match[1];
    const post = postStore.getPostById(id);

    if (post) {
      isRedirecting.value = true;

      if (typeof document !== "undefined") {
        document.title = `跳转中 | ${site.value.title}`;
      }

      redirectTimer = setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.replace(post.url);
        }
      }, 100);

      return true;
    }
  }
  return false;
}

let currentPaletteTask: Promise<void> | null = null;
let isProcessingPalette = false;

async function updatePalette() {
  if (isRedirecting.value || route.path.startsWith("/p/")) return;

  if (isProcessingPalette) return;
  isProcessingPalette = true;

  currentPaletteTask = (async () => {
    try {
      await nextTick();
      const defaultColor = theme.value.defaultColor;
      const defaultArgb = argbFromHex(defaultColor);
      await generateColorPalette(defaultArgb);

      const el = document.querySelector(".Header .image");
      if (el) {
        const colorAttr = el.getAttribute("impression-color");
        if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
          const argb = argbFromHex(colorAttr);
          await generateColorPalette(argb);
        }
      }
    } finally {
      isProcessingPalette = false;
      currentPaletteTask = null;
    }
  })();
}

const layoutMap = {
  article: ArticleLayout,
} as const;

type LayoutKey = keyof typeof layoutMap;

const currentLayout = computed(() => {
  if (isRedirecting.value) return null;
  if (frontmatter.value.home) return null;
  if (page.value.isNotFound) return NotFoundLayout;
  const key = (frontmatter.value.layout ?? "article") as LayoutKey;
  return layoutMap[key] ?? ArticleLayout;
});

watch(
  () => route.path,
  (newPath, oldPath) => {
    if (checkAndRedirect(newPath)) {
      return;
    }

    // 如果之前是重定向状态，清理状态
    if (isRedirecting.value) {
      isRedirecting.value = false;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        redirectTimer = null;
      }
    }

    if (newPath !== oldPath && !isTransitioning.value && oldPath !== undefined) {
      isTransitioning.value = true;
      pendingRoutePath.value = newPath;
    }
  },
  { immediate: true }
);

function onAfterEnter() {
  if (isRedirecting.value) return;
  isTransitioning.value = false;
  currentRoutePath.value = route.path;
  pendingRoutePath.value = null;
  updatePalette();
}

function onBeforeLeave() {
  if (isRedirecting.value) return;
  isTransitioning.value = true;
}

if (typeof window !== "undefined") {
  onMounted(() => {
    if (!route.path.startsWith("/p/")) {
      updatePalette();
    }
  });
}
</script>

<template>
  <div class="MainLayout">
    <div v-if="isRedirecting">
      <h1>Redirecting...</h1>
    </div>

    <template v-else>
      <NavBar />
      <AppBar />
      <Transition name="layout" mode="out-in" @before-leave="onBeforeLeave" @after-enter="onAfterEnter">
        <div class="content-flow" :key="route.path">
          <main v-if="frontmatter.home" class="home-content">
            <hgroup class="title">
              <h1>{{ site.title }}</h1>
              <h6>{{ site.description }}</h6>
            </hgroup>
            <ArticleMasonry />
          </main>
          <component v-else :is="currentLayout" />
          <ScrollToTop />
          <Footer />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Default");
</style>
