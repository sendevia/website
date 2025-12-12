<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { isClient } from "../utils/env";

const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });
const { page, frontmatter } = useGlobalData();
const postStore = usePostStore();

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

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullUrl);
    }
  } catch (err) {
    console.error("复制失败:", err);
  }
};

// 格式化时间戳
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${year}年${month}月${day}日${hours}时${minutes}分`;
};

// 计算时间差
const formatTimeAgo = (diffMs: number): string => {
  if (diffMs <= 0) return "刚刚";

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears}年前`;
  } else if (diffMonths > 0) {
    return `${diffMonths}个月前`;
  } else if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`;
  } else {
    return `${diffSeconds}秒前`;
  }
};

// 获取发布时间戳
const publishTimestamp = computed(() => {
  const dateStr = frontmatter.value?.date;
  if (!dateStr) return 0;
  const timestamp = new Date(dateStr).getTime();
  return isNaN(timestamp) ? 0 : timestamp;
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
  if (!publishTimestamp.value) return "";
  return formatTimestamp(publishTimestamp.value);
});

// 格式化最后修改时间
const formattedLastUpdated = computed(() => {
  const publishTs = publishTimestamp.value;
  const lastUpdateTs = lastUpdatedTimestamp.value;

  if (!lastUpdateTs) return "";

  // 判定是否为发布即最后修改
  const isSameTime = !publishTs || Math.abs(lastUpdateTs - publishTs) < 60000;

  if (isSameTime) {
    return formatTimestamp(lastUpdateTs);
  } else {
    const timeSinceUpdate = Date.now() - lastUpdateTs;
    const timeAgo = formatTimeAgo(timeSinceUpdate);
    return `于${timeAgo}编辑`;
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

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl);
  }

  const hiddenSpan = anchor.querySelector<HTMLSpanElement>("span.visually-hidden");
  if (hiddenSpan) {
    const originalText = hiddenSpan.textContent;
    hiddenSpan.textContent = "已复制";
    setTimeout(() => {
      hiddenSpan.textContent = originalText;
    }, 1000);
  }
}

function ulCustomBullets() {
  const listItems = document.querySelectorAll("ul li");
  listItems.forEach((li, index) => {
    const stableRotation = ((index * 137) % 360) - 180;
    const computedStyle = window.getComputedStyle(li);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const bulletTop = lineHeight / 2 - 8;

    (li as HTMLElement).style.setProperty("--random-rotation", `${stableRotation}deg`);
    (li as HTMLElement).style.setProperty("--bullet-top", `${bulletTop}px`);
  });
}

function olCountAttributes() {
  const orderedLists = document.querySelectorAll("ol");
  orderedLists.forEach((ol) => {
    const liCount = ol.querySelectorAll("li").length;
    const startAttr = ol.getAttribute("start");
    const startValue = startAttr ? parseInt(startAttr, 10) : 1;
    const effectiveCount = liCount + (startValue - 1);

    ol.removeAttribute("data-count-range");

    const digitCount = Math.max(1, Math.floor(Math.log10(effectiveCount)) + 1);
    const paddingValue = 24 + (digitCount - 1) * 10;

    (ol as HTMLElement).style.setProperty("padding-inline-start", `${paddingValue}px`);
  });
}

if (isClient()) {
  onMounted(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a.title-anchor");
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", copyAnchorLink);
    });

    function setupImageClickListeners() {
      const contentElement = document.querySelector("#article-content");
      if (contentElement) {
        const images = contentElement.querySelectorAll("img");
        images.forEach((img, index) => {
          (img as HTMLImageElement).onclick = (event: MouseEvent) => openImageViewer(index, event);
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
      <p class="date-update">{{ formattedLastUpdated }}</p>
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
