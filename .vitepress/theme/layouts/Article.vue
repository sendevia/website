<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });

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

if (typeof window !== "undefined") {
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
    <PrevNext />
  </main>
  <div id="article-indicator">
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
