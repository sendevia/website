<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { isClient } from "../utils/env";

const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });
const postStore = usePostStore();
const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard, copied: isCopied } = useClipboard();

// 计算当前文章 ID
const articleId = computed(() => {
  const relativePath = page.value?.relativePath;
  if (!relativePath) return "";

  const path = relativePath.replace(/\.md$/, "");
  const lookupUrl = path.startsWith("/") ? path : `/${path}`;

  const post = postStore.getPostByUrl(lookupUrl);
  return post?.id || "";
});

// 生成短链
const shortLink = computed(() => {
  if (!articleId.value) return "";
  return `/p/${articleId.value}`;
});

// 复制短链到剪贴板
const copyShortLink = async () => {
  if (!shortLink.value) return;

  const fullUrl = `${window.location.origin}${shortLink.value}`;
  await copyToClipboard(fullUrl);
};

// 时间处理工具函数
const formatDate = (timestamp: number, format: "chinese" | "iso" = "chinese"): string => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  if (format === "iso") {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${year}年${month}月${day}日${hours}时${minutes}分`;
};

// 计算时间差
const formatTimeAgo = (diffMs: number): string => {
  if (diffMs <= 0) return "刚刚";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const timeUnits = [
    { value: years, unit: "年前" },
    { value: months, unit: "个月前" },
    { value: days, unit: "天前" },
    { value: hours, unit: "小时前" },
    { value: minutes, unit: "分钟前" },
    { value: seconds, unit: "秒前" },
  ];

  for (const { value, unit } of timeUnits) {
    if (value > 0) return `${value}${unit}`;
  }

  return "刚刚";
};

// 获取发布时间戳
const publishTimestamp = computed(() => {
  const dateStr = frontmatter.value?.date;
  if (!dateStr) return 0;
  const ts = new Date(dateStr).getTime();
  return isNaN(ts) ? 0 : ts;
});

// 获取最后修改时间戳
const lastUpdatedTimestamp = computed(() => {
  const val = page.value?.lastUpdated;
  if (!val) return 0;
  if (typeof val === "number") return val;
  const ts = new Date(val).getTime();
  return isNaN(ts) ? 0 : ts;
});

// 格式化发布日期
const formattedPublishDate = computed(() => {
  return formatDate(publishTimestamp.value, "chinese");
});

// 原始最后修改时间（本地ISO格式）
const lastUpdatedRawTime = computed(() => {
  return formatDate(lastUpdatedTimestamp.value, "iso");
});

// 格式化最后修改时间（显示文本）
const formattedLastUpdated = computed(() => {
  const publishTs = publishTimestamp.value;
  const lastUpdateTs = lastUpdatedTimestamp.value;

  if (!lastUpdateTs) return "";

  // 判定是否为发布即最后修改
  const isSameTime = !publishTs || Math.abs(lastUpdateTs - publishTs) < 60000;

  if (isSameTime) {
    return formatDate(lastUpdateTs, "chinese");
  } else {
    return `于${formatTimeAgo(Date.now() - lastUpdateTs)}编辑`;
  }
});

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

function closeImageViewer() {
  showImageViewer.value = false;
}

function updateCurrentImageIndex(index: number) {
  currentImageIndex.value = index;
}

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
      observer.observe(contentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
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
    <Content />
    <MaterialButton v-if="articleId" :text="'复制短链'" :color="'outlined'" @click="copyShortLink" />
    <PrevNext />
  </main>
  <div id="article-beside">
    <div class="post-info">
      <p class="date-publish" v-if="formattedPublishDate">发布于 {{ formattedPublishDate }}</p>
      <p class="date-update" :title="lastUpdatedRawTime">{{ formattedLastUpdated }}</p>
      <p class="id" v-if="articleId">文章ID {{ articleId }}</p>
    </div>
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
