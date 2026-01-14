<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute } from "vitepress";
import { useTitle, useMutationObserver } from "@vueuse/core";
import { argbFromHex } from "@material/material-color-utilities";
import { generateColorPalette } from "../utils/colorPalette";
import { getFormattedRandomPhrase } from "../utils/phrases";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { isClient } from "../utils/env";
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";

/** 全局数据与路由状态 */
const { site, page, frontmatter, theme } = useGlobalData();
const route = useRoute();
const postStore = usePostStore();
const isRedirecting = ref(false);
const pageTitle = useTitle();
const randomGreeting = ref(getFormattedRandomPhrase());

/** 布局映射表 */
const layoutMap = {
  article: ArticleLayout,
} as const;

type LayoutKey = keyof typeof layoutMap;

/**
 * 计算当前应该渲染的布局组件
 * @returns {Component | null} 布局组件或空
 */
const currentLayout = computed(() => {
  if (isRedirecting.value) return null;
  if (frontmatter.value.home) return null;
  if (page.value.isNotFound) return NotFoundLayout;
  const key = (frontmatter.value.layout ?? "article") as LayoutKey;
  return layoutMap[key] ?? ArticleLayout;
});

/**
 * 检查路径是否符合短链格式并执行重定向
 * @param {string} path 待检测的路径
 * @returns {boolean} 是否正在执行重定向
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
      if (isClient()) {
        pageTitle.value = `跳转中 | ${site.value.title}`;
        window.location.replace(post.url);
      }
      return true;
    }
  }
  return false;
}

let isProcessingPalette = false;

/**
 * 根据当前页面环境更新 Material Design 全局色板
 * 逻辑：优先尝试从 Header 的 impression-color 属性提取，否则使用主题默认色
 */
async function updatePalette() {
  if (isRedirecting.value || route.path.startsWith("/p/")) return;
  if (isProcessingPalette) return;

  isProcessingPalette = true;
  try {
    await nextTick();

    // 基础色：来自主题配置
    const defaultColor = theme.value.defaultColor;
    const defaultArgb = argbFromHex(defaultColor);

    // 尝试寻找文章头部的动态色彩属性
    const el = document.querySelector(".Header div.carousel-container");
    const colorAttr = el?.getAttribute("impression-color");

    if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
      await generateColorPalette(argbFromHex(colorAttr));
    } else {
      await generateColorPalette(defaultArgb);
    }
  } finally {
    isProcessingPalette = false;
  }
}

/**
 * 监听 Header 元素的属性变化
 * 当文章轮播图切换导致 impression-color 改变时，实时更新色板
 */
if (isClient()) {
  useMutationObserver(
    // 明确指定 querySelector 返回的是 HTMLElement 类型
    () => document.querySelector<HTMLElement>(".Header div.carousel-container"),
    () => updatePalette(),
    {
      attributes: true,
      attributeFilter: ["impression-color"],
    }
  );
}

/** 处理短链重定向 */
watch(
  () => route.path,
  (newPath) => {
    if (!checkAndRedirect(newPath)) {
      isRedirecting.value = false;
    }
  },
  { immediate: true }
);

/** 进入首页时更新随机问候语 */
watch(
  () => frontmatter.value.home,
  (isHome) => {
    if (isHome) {
      randomGreeting.value = getFormattedRandomPhrase();
    }
  }
);

/** 进入后更新色板 */
function onAfterEnter() {
  if (!isRedirecting.value) updatePalette();
}

onMounted(() => {
  if (isClient() && !route.path.startsWith("/p/")) {
    updatePalette();
  }
});
</script>

<template>
  <div class="MainLayout">
    <template v-if="!isRedirecting">
      <NavBar />
      <AppBar />
      <Transition name="layout" mode="out-in" @after-enter="onAfterEnter">
        <div class="content-flow" :key="route.path">
          <main v-if="frontmatter.home" class="home-content">
            <ClientOnly>
              <div class="avatar-box">
                <h3>
                  {{ randomGreeting }}
                </h3>
                <img src="/assets/images/avatar_transparent.png" alt="" />
                <span></span>
              </div>
            </ClientOnly>
            <hgroup class="title">
              <h1>欢迎访问 {{ site.title }}</h1>
              <h4>这是一个{{ site.description }}</h4>
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
