<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useEventListener, useMutationObserver } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { isClient } from "../utils/env";
import { formatDate, formatRelativeTime } from "../utils/date";

const { page, frontmatter, lang } = useGlobalData();

const lastUpdated = computed(() => {
  const value = page.value?.lastUpdated;
  return value ? new Date(value) : null;
});

/** 计算最终显示的编辑时间文本 */
const formattedLastUpdated = computed(() => {
  return lastUpdated.value ? `编辑于 ${formatRelativeTime(lastUpdated.value, lang.value || "zh-CN")}` : "";
});

/** 格式化发布时间 */
const formattedPublishDate = computed(() => {
  return frontmatter.value?.date ? formatDate(frontmatter.value.date, { locale: lang.value || "zh-CN" }) : "";
});

/** 图片查看器状态 */
const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });
const articleContentRef = ref<HTMLElement | null>(null);

/**
 * 初始化查看器参数并打开
 * @param index 点击图片的索引
 * @param event 点击事件对象，用于计算动画起点
 */
const openImageViewer = (index: number, event: MouseEvent) => {
  const container = articleContentRef.value;
  if (!container) return;

  const images = Array.from(container.querySelectorAll("img"))
    .map((img) => img.src)
    .filter((src) => src && !src.includes("data:"));

  articleImages.value = images;
  currentImageIndex.value = index;

  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();
  imageOriginPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
  };
  showImageViewer.value = true;
};

/** 处理列表 Bullet 旋转和有序列表对齐 */
const enhanceDomStyles = () => {
  if (!articleContentRef.value) return;

  // 无序列表 Bullet 随机旋转
  articleContentRef.value.querySelectorAll("ul li").forEach((li, index) => {
    const el = li as HTMLElement;
    el.style.setProperty("--random-rotation", `${((index * 137) % 360) - 180}deg`);
    const lineHeight = parseFloat(window.getComputedStyle(el).lineHeight);
    el.style.setProperty("--bullet-top", `${lineHeight / 2 - 8}px`);
  });

  // 有序列表数字对齐
  articleContentRef.value.querySelectorAll("ol").forEach((ol) => {
    const el = ol as HTMLElement;
    const startValue = parseInt(el.getAttribute("start") || "1", 10);
    const totalItems = el.querySelectorAll("li").length + (startValue - 1);
    const digitCount = Math.max(1, Math.floor(Math.log10(totalItems)) + 1);
    el.style.setProperty("padding-inline-start", `${24 + (digitCount - 1) * 10}px`);
  });
};

/** 绑定文章图片点击监听 */
const bindImageEvents = () => {
  articleContentRef.value?.querySelectorAll("img").forEach((img, index) => {
    (img as HTMLElement).onclick = (e) => openImageViewer(index, e);
  });
};

if (isClient()) {
  useEventListener("resize", enhanceDomStyles);

  useMutationObserver(
    articleContentRef,
    () => {
      enhanceDomStyles();
      bindImageEvents();
    },
    { childList: true, subtree: true, characterData: true },
  );

  onMounted(() => {
    nextTick(() => {
      enhanceDomStyles();
      bindImageEvents();
    });
  });
}
</script>

<template>
  <Header />
  <main id="article-content" ref="articleContentRef">
    <Content />
    <PrevNext />
  </main>
  <aside id="article-aside">
    <ClientOnly>
      <div class="post-info">
        <p class="date-publish">发布于 {{ formattedPublishDate }}</p>
        <p v-if="formattedLastUpdated" class="date-update">
          {{ formattedLastUpdated }}
        </p>
      </div>
    </ClientOnly>
    <PageIndicator />
  </aside>
  <ImageViewer v-if="showImageViewer" :images="articleImages" :current-index="currentImageIndex" :origin-position="imageOriginPosition" @close="showImageViewer = false" @update:current-index="currentImageIndex = $event" />
</template>

<style lang="scss">
@use "../styles/layouts/Article";
</style>
