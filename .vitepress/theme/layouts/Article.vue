<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useClipboard } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { useTimeFormatter } from "../composables/useTimeFormatter";
import { isClient } from "../utils/env";

const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });
const postStore = usePostStore();
const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard, copied: isCopied } = useClipboard();
const { formatDate, formatTimeAgo, useFormattedTime } = useTimeFormatter();

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

// 获取发布时间
const publishTime = computed(() => {
  return frontmatter.value?.date;
});

// 获取最后修改时间
const lastUpdatedTime = computed(() => {
  const val = page.value?.lastUpdated;
  if (!val) return undefined;
  return val;
});

// 格式化发布日期
const formattedPublishDate = useFormattedTime(() => publishTime.value, { format: "chinese" });

// 原始最后修改时间（本地ISO格式）
const lastUpdatedRawTime = useFormattedTime(() => lastUpdatedTime.value, { format: "iso" });

// 格式化最后修改时间（显示文本）
const formattedLastUpdated = computed(() => {
  const publishTimeValue = publishTime.value;
  const lastUpdateTimeValue = lastUpdatedTime.value;

  if (!lastUpdateTimeValue) return "";

  // 判定是否为发布即最后修改
  let isSameTime = false;
  if (publishTimeValue && lastUpdateTimeValue) {
    const publishDate = new Date(publishTimeValue);
    const lastUpdateDate = new Date(lastUpdateTimeValue);
    if (!isNaN(publishDate.getTime()) && !isNaN(lastUpdateDate.getTime())) {
      isSameTime = Math.abs(lastUpdateDate.getTime() - publishDate.getTime()) < 60000;
    }
  }

  if (isSameTime || !publishTimeValue) {
    return formatDate(lastUpdateTimeValue, "chinese");
  } else {
    return `${formatTimeAgo(lastUpdateTimeValue)}编辑`;
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
    <ButtonGroup v-if="frontmatter?.external_links" :links="frontmatter.external_links" />
    <PrevNext />
  </main>
  <div id="article-beside">
    <MaterialButton v-if="articleId" :color="'text'" :icon="'content_copy'" @click="copyShortLink">
      复制短链
    </MaterialButton>
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
