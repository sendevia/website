<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useClipboard, useDateFormat, useTimeAgo, useEventListener, useMutationObserver } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { isClient } from "../utils/env";

/** 全局状态与剪贴板 */
const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard } = useClipboard();

/** 时间处理逻辑 */
const publishTime = computed(() => frontmatter.value?.date);
const lastUpdatedTime = computed(() => page.value?.lastUpdated);
const formattedPublishDate = computed(() =>
  publishTime.value ? useDateFormat(publishTime.value, "YYYY年M月D日").value : ""
);
const lastUpdatedRawTime = computed(() =>
  lastUpdatedTime.value ? useDateFormat(lastUpdatedTime.value, "YYYY-MM-DD HH:mm:ss").value : ""
);

/**
 * 相对时间显示配置
 */
const timeAgo = useTimeAgo(
  computed(() => lastUpdatedTime.value || 0),
  {
    messages: {
      justNow: "刚刚",
      invalid: "未知时间",
      past: (n: string) => `${n}前`,
      future: (n: string) => `${n}后`,
      month: (n: number) => `${n}个月`,
      year: (n: number) => `${n}年`,
      day: (n: number) => `${n}天`,
      week: (n: number) => `${n}周`,
      hour: (n: number) => `${n}小时`,
      minute: (n: number) => `${n}分钟`,
      second: (n: number) => `${n}秒`,
    } as any,
  }
);

/** 计算最终显示的编辑时间文本 */
const formattedLastUpdated = computed(() => {
  if (!lastUpdatedTime.value) return "";
  const uDate = new Date(lastUpdatedTime.value).getTime();
  const pDate = publishTime.value ? new Date(publishTime.value).getTime() : null;

  // 如果没有发布时间，或修改时间与发布时间在1分钟内，显示绝对日期
  if (!pDate || Math.abs(uDate - pDate) < 60000) {
    return useDateFormat(uDate, "YYYY年M月D日").value;
  }
  return `${timeAgo.value}编辑`;
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

/**
 * 复制锚点链接到剪贴板
 */
const handleAnchorClick = (event: MouseEvent) => {
  const anchor = (event.target as HTMLElement).closest("a.title-anchor") as HTMLAnchorElement;
  if (!anchor) return;

  const href = anchor.getAttribute("href");
  const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;
  copyToClipboard(fullUrl);

  const label = anchor.querySelector("span.visually-hidden");
  if (label) {
    const originalText = label.textContent;
    label.textContent = "已复制";
    setTimeout(() => {
      label.textContent = originalText;
    }, 1000);
  }
};

/**
 * 处理列表 Bullet 旋转和有序列表对齐
 */
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

/**
 * 绑定文章图片点击监听
 */
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
    { childList: true, subtree: true, characterData: true }
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
  <main id="article-content" ref="articleContentRef" @click="handleAnchorClick">
    <hgroup>
      <h1>{{ frontmatter.title || page.title }}</h1>
      <div v-if="frontmatter.description">
        <hr />
        <h6>{{ frontmatter.description }}</h6>
      </div>
    </hgroup>
    <Content />
    <PrevNext />
  </main>
  <aside id="article-aside">
    <div class="post-info">
      <p class="date-publish" v-if="formattedPublishDate">发布于 {{ formattedPublishDate }}</p>
      <ClientOnly>
        <p class="date-update" :title="lastUpdatedRawTime" v-if="formattedLastUpdated">
          {{ formattedLastUpdated }}
        </p>
      </ClientOnly>
    </div>
    <ButtonGroup v-if="frontmatter?.external_links" :links="frontmatter.external_links" size="m" layout="vertical" />
    <PageIndicator />
  </aside>
  <ImageViewer
    v-if="showImageViewer"
    :images="articleImages"
    :current-index="currentImageIndex"
    :origin-position="imageOriginPosition"
    @close="showImageViewer = false"
    @update:current-index="currentImageIndex = $event"
  />
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Article");
</style>
