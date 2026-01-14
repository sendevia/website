<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useClipboard, useIntersectionObserver, useResizeObserver, useEventListener, useTimeoutFn } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { useScreenWidthStore } from "../stores/screenWidth";
import { isClient } from "../utils/env";

/** 全局数据与状态 */
const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard, copied: isCopied } = useClipboard();
const screenWidthStore = useScreenWidthStore();
const postStore = usePostStore();

/** 响应式引用 */
const pageIndicator = ref<HTMLElement | null>(null);
const headings = ref<Array<{ id: string; text: string; level: number }>>([]);
const headingsActiveId = ref<string>("");
const indicator = ref({ top: "0px", left: "0px", width: "100%", height: "0px", opacity: 0 });

/** 点击导航时临时禁用滚动监听更新 */
const isLocked = ref(false);
const { start: lockTimer } = useTimeoutFn(
  () => {
    isLocked.value = false;
  },
  1200,
  { immediate: false }
);

/** 计算文章 ID 与短链 */
const articleId = computed(() => {
  const path = page.value?.relativePath?.replace(/\.md$/, "");
  if (!path) return "";
  const lookupUrl = path.startsWith("/") ? path : `/${path}`;
  return postStore.getPostByUrl(lookupUrl)?.id || "";
});

const shortLink = computed(() => (articleId.value ? `/p/${articleId.value}` : ""));

/** 复制短链到剪贴板 */
const copyShortLink = async () => {
  if (!shortLink.value) return;
  await copyToClipboard(`${window.location.origin}${shortLink.value}`);
};

/** 收集页面中的 h1 和 h2 标题 */
const collectHeadings = () => {
  if (!isClient()) return;
  const nodes = Array.from(document.querySelectorAll("h1[id], h2[id]")) as HTMLElement[];
  headings.value = nodes.map((n) => ({
    id: n.id,
    text: n.textContent?.trim() || n.id,
    level: +n.tagName.replace("H", ""),
  }));
};

/** 更新指示器（高亮边框）的位置和尺寸 */
const updateIndicator = () => {
  const container = pageIndicator.value;
  const id = headingsActiveId.value;
  if (!container || !id) {
    indicator.value.opacity = 0;
    return;
  }

  const activeElement = container.querySelector(`span[data-id="${CSS.escape(id)}"]`) as HTMLElement | null;
  if (!activeElement || !activeElement.offsetParent) {
    indicator.value.opacity = 0;
    return;
  }

  const conRect = container.getBoundingClientRect();
  const elRect = activeElement.getBoundingClientRect();

  indicator.value = {
    top: `${elRect.top - conRect.top}px`,
    left: `${elRect.left - conRect.left}px`,
    width: `${elRect.width}px`,
    height: `${elRect.height}px`,
    opacity: 0.5,
  };
};

/**
 * 导航到指定标题并锁定监听
 * @param id 标题 ID
 */
const navigateTo = (id: string) => {
  isLocked.value = true;
  headingsActiveId.value = id;
  lockTimer(); // 启动/重置计时器

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
};

/** 多标题可见性观察 */
const visibleMap = new Map<string, number>();
if (isClient()) {
  // 监听所有标题元素的进入/退出
  watch(
    headings,
    (newHeadings) => {
      newHeadings.forEach((h) => {
        const el = document.getElementById(h.id);
        if (!el) return;

        useIntersectionObserver(
          el,
          ([entry]) => {
            if (entry.isIntersecting) {
              // 存储分数：交集比例 * 权重 - 距离顶部距离
              const score = entry.intersectionRatio * 10000 - entry.boundingClientRect.top;
              visibleMap.set(h.id, score);
            } else {
              visibleMap.delete(h.id);
            }

            // 非锁定状态下更新活动 ID
            if (!isLocked.value && visibleMap.size > 0) {
              const bestId = [...visibleMap.entries()].reduce((a, b) => (a[1] > b[1] ? a : b))[0];
              headingsActiveId.value = bestId;
            }
          },
          { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] }
        );
      });
    },
    { immediate: true }
  );

  /** 监听容器及其子元素尺寸变化 */
  useResizeObserver(pageIndicator, updateIndicator);

  /** 窗口事件监听 */
  useEventListener("resize", updateIndicator);
  useEventListener(["hashchange", "popstate"], () => {
    if (screenWidthStore.isAboveBreakpoint) collectHeadings();
  });
}

/** 状态同步监听 */
watch(
  () => screenWidthStore.isAboveBreakpoint,
  (val) => {
    if (val) {
      collectHeadings();
      nextTick(updateIndicator);
    } else {
      indicator.value.opacity = 0;
    }
  }
);

watch(headingsActiveId, () => {
  if (screenWidthStore.isAboveBreakpoint) nextTick(updateIndicator);
});

onMounted(() => {
  if (isClient()) {
    screenWidthStore.init();
    if (screenWidthStore.isAboveBreakpoint) {
      collectHeadings();
      nextTick(updateIndicator);
    }
  }
});
</script>

<template>
  <div ref="pageIndicator" class="PageIndicator">
    <div class="label">
      <p class="text">在此页上</p>
      <p class="icon">link</p>
      <p class="article-id" :title="isCopied ? '已复制' : '复制短链'" v-if="articleId" @click="copyShortLink">
        {{ isCopied ? "已复制" : articleId }}
      </p>
    </div>
    <h3 class="article-title">{{ frontmatter.title || page.title }}</h3>
    <div
      class="indicator"
      :style="{
        top: indicator.top,
        left: indicator.left,
        width: indicator.width,
        height: indicator.height,
        opacity: indicator.opacity,
      }"
      aria-hidden="true"
    ></div>
    <div class="indicator-container">
      <span v-for="h in headings" :key="h.id" :data-id="h.id" :class="{ active: h.id === headingsActiveId }">
        <a
          :href="`#${h.id}`"
          @click.prevent="navigateTo(h.id)"
          :aria-current="h.id === headingsActiveId ? 'true' : undefined"
        >
          {{ h.text }}
        </a>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/PageIndicator");
</style>
