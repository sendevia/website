<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useClipboard, useTimestamp, useDateFormat } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { isClient } from "../utils/env";

const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard, copied: isCopied } = useClipboard();

// 获取当前时间戳
const now = useTimestamp({ interval: 30000 });

// 计算发布时间和最后修改时间
const publishTime = computed(() => frontmatter.value?.date);
const lastUpdatedTime = computed(() => page.value?.lastUpdated);
const formattedPublishDate = computed(() =>
  publishTime.value ? useDateFormat(publishTime.value, "YYYY年M月D日").value : ""
);
const lastUpdatedRawTime = computed(() =>
  lastUpdatedTime.value ? useDateFormat(lastUpdatedTime.value, "YYYY-MM-DD HH:mm:ss").value : ""
);

// 格式化相对时间函数
function formatTimeAgo(date: string | number | Date) {
  const diff = new Date(date).getTime() - now.value; // 计算差值
  const absDiff = Math.abs(diff);

  // 定义时间单位阈值 (从大到小)
  const units = [
    { max: Infinity, val: 31536000000, name: "year" }, // 年
    { max: 31536000000, val: 2592000000, name: "month" }, // 月
    { max: 2592000000, val: 86400000, name: "day" }, // 天
    { max: 86400000, val: 3600000, name: "hour" }, // 时
    { max: 3600000, val: 60000, name: "minute" }, // 分
  ] as const;

  // 使用 Intl.RelativeTimeFormat 返回对应语言的格式
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" });

  for (const { val, name } of units) {
    if (absDiff >= val || (name === "minute" && absDiff >= 60000)) {
      // 超过该单位的基准值，则使用该单位
      // 例如：差值是 2小时 (7200000ms)，匹配到 hour (3600000ms)
      return rtf.format(Math.round(diff / val), name);
    }
  }
  return "刚刚";
}

// 最终显示的最后修改时间
const formattedLastUpdated = computed(() => {
  const uDate = lastUpdatedTime.value ? new Date(lastUpdatedTime.value) : null;
  const pDate = publishTime.value ? new Date(publishTime.value) : null;

  if (!uDate) return "";

  // 如果没有发布时间，或发布时间与修改时间极其接近（1分钟内），显示绝对日期
  if (!pDate || Math.abs(uDate.getTime() - pDate.getTime()) < 60000) {
    return useDateFormat(uDate, "YYYY年M月D日").value;
  }

  // 否则显示相对时间 (依赖 now.value，会自动更新)
  return `${formatTimeAgo(uDate)}编辑`;
});

// 图片查看器相关逻辑
const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });

// 打开图片查看器
function openImageViewer(index: number, event: MouseEvent) {
  const contentElement = document.querySelector("#article-content");
  if (contentElement) {
    const images = Array.from(contentElement.querySelectorAll("img"))
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
  }
}

// 关闭图片查看器
function closeImageViewer() {
  showImageViewer.value = false;
}

// 更新当前图片索引
function updateCurrentImageIndex(index: number) {
  currentImageIndex.value = index;
}

// 复制锚点链接函数
function copyAnchorLink(this: HTMLElement) {
  const anchor = this as HTMLAnchorElement;
  const href = anchor.getAttribute("href");
  const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;
  copyToClipboard(fullUrl);
  const label = anchor.querySelector("span.visually-hidden") as HTMLSpanElement;
  if (isCopied) {
    const originalText = label.textContent;
    label.textContent = "已复制";
    setTimeout(() => {
      label.textContent = originalText;
    }, 1000);
  }
}

// 自定义无序列表样式函数
function ulCustomBullets() {
  const listItems = document.querySelectorAll("ul li") as NodeListOf<HTMLElement>;
  listItems.forEach((li, index) => {
    const stableRotation = ((index * 137) % 360) - 180;
    const computedStyle = window.getComputedStyle(li);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const bulletTop = lineHeight / 2 - 8;
    li.style.setProperty("--random-rotation", `${stableRotation}deg`);
    li.style.setProperty("--bullet-top", `${bulletTop}px`);
  });
}

// 有序列表数字对齐函数
function olCountAttributes() {
  const orderedLists = document.querySelectorAll("ol") as NodeListOf<HTMLElement>;
  orderedLists.forEach((ol) => {
    const liCount = ol.querySelectorAll("li").length;
    const startAttr = ol.getAttribute("start");
    const startValue = startAttr ? parseInt(startAttr, 10) : 1;
    const effectiveCount = liCount + (startValue - 1);
    ol.removeAttribute("data-count-range");
    const digitCount = Math.max(1, Math.floor(Math.log10(effectiveCount)) + 1);
    const paddingValue = 24 + (digitCount - 1) * 10;
    ol.style.setProperty("padding-inline-start", `${paddingValue}px`);
  });
}

if (isClient()) {
  onMounted(() => {
    const anchors = document.querySelectorAll("a.title-anchor");
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", copyAnchorLink);
    });
    function setupImageClickListeners() {
      const contentElement = document.querySelector("#article-content");
      if (contentElement) {
        const images = contentElement.querySelectorAll("img") as NodeListOf<HTMLElement>;
        images.forEach((img, index) => {
          img.onclick = (event: MouseEvent) => openImageViewer(index, event);
        });
      }
    }
    ulCustomBullets();
    olCountAttributes();
    setupImageClickListeners();
    window.addEventListener("resize", ulCustomBullets);
    const observer = new MutationObserver(() => {
      ulCustomBullets();
      olCountAttributes();
      setupImageClickListeners();
    });
    const contentElement = document.querySelector("#article-content");
    if (contentElement) {
      observer.observe(contentElement, { childList: true, subtree: true, characterData: true });
    }
    onBeforeUnmount(() => {
      observer.disconnect();
      window.removeEventListener("resize", ulCustomBullets);
    });
  });
}
</script>

<template>
  <Header />
  <main id="article-content">
    <hgroup>
      <h1>{{ frontmatter.title || page.title }}</h1>
      <div>
        <hr />
        <h6 v-if="frontmatter.description">
          {{ frontmatter.description }}
        </h6>
      </div>
    </hgroup>
    <Content />
    <PrevNext />
  </main>
  <div id="article-aside">
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
  </div>
  <ImageViewer
    v-if="showImageViewer"
    :images="articleImages"
    :current-index="currentImageIndex"
    :origin-position="imageOriginPosition"
    @close="closeImageViewer"
    @update:current-index="updateCurrentImageIndex"
  />
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Article");
</style>
