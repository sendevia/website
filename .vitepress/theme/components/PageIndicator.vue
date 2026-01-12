<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useClipboard } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";
import { useScreenWidthStore } from "../stores/screenWidth";
import { isClient } from "../utils/env";

const { page, frontmatter } = useGlobalData();
const { copy: copyToClipboard, copied: isCopied } = useClipboard();
const screenWidthStore = useScreenWidthStore();
const pageIndicator = ref<HTMLElement | null>(null);
const indicator = ref({ top: "0px", left: "0px", width: "100%", height: "0px", opacity: 0 });
const headings = ref<Array<{ id: string; text: string; level: number }>>([]);
const headingsActiveId = ref<string>("");
const postStore = usePostStore();

let ro: ResizeObserver | null = null;
let mo: MutationObserver | null = null;
let pageIndicatorObserver: IntersectionObserver | null = null;
let pageIndicatorLockedId: string | null = null;
let pageIndicatorUnlockTimer: number | null = null;

const grouped = computed(() => headings.value || []);

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
}

function navigateTo(id: string) {
  onNavigate(id);
  scrollToId(id);
}

function onNavigate(id: string) {
  pageIndicatorLockedId = id;
  headingsActiveId.value = id;
  if (pageIndicatorUnlockTimer) {
    window.clearTimeout(pageIndicatorUnlockTimer);
  }
  pageIndicatorUnlockTimer = window.setTimeout(() => {
    pageIndicatorLockedId = null;
    pageIndicatorUnlockTimer = null;
  }, 1200);
}

function collectHeadings() {
  const nodes = Array.from(document.querySelectorAll("h1[id], h2[id]")) as HTMLElement[];
  headings.value = nodes.map((n) => ({ id: n.id, text: n.textContent?.trim() || n.id, level: +n.tagName.replace("H", "") }));
}

function createObserver() {
  if (pageIndicatorObserver) pageIndicatorObserver.disconnect();

  const visible = new Map<string, IntersectionObserverEntry>();

  pageIndicatorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visible.set(id, entry);
        } else {
          visible.delete(id);
        }
      });

      if (visible.size === 0) return;

      if (pageIndicatorLockedId) {
        headingsActiveId.value = pageIndicatorLockedId;
        return;
      }

      let bestId: string | null = null;
      let bestScore = -Infinity;
      visible.forEach((entry, id) => {
        const ratio = entry.intersectionRatio || 0;
        const top = entry.boundingClientRect.top;
        const score = ratio * 10000 - top;
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      });

      if (bestId) headingsActiveId.value = bestId;
    },
    { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] }
  );

  headings.value.forEach((h) => {
    const el = document.getElementById(h.id);
    if (el) pageIndicatorObserver?.observe(el);
  });
}

function updateIndicator() {
  const nav = pageIndicator.value;
  if (!nav) return;

  const id = headingsActiveId.value;

  if (!id) {
    indicator.value.opacity = 0;
    return;
  }

  const spanBlock = nav.querySelector(`span[data-id="${CSS.escape(id)}"]`) as HTMLElement | null;

  if (!spanBlock || !spanBlock.offsetParent) {
    indicator.value.opacity = 0;
    return;
  }

  const conRect = nav.getBoundingClientRect();
  const spbRect = spanBlock.getBoundingClientRect();

  const left = `${spbRect.left - conRect.left}px`;
  const top = `${spbRect.top - conRect.top}px`;
  const width = `${spbRect.width}px`;
  const height = `${spbRect.height}px`;

  indicator.value = { top, left, width, height, opacity: 0.5 };
}

function toggleMonitoring(shouldMonitor: boolean) {
  if (shouldMonitor) {
    collectHeadings();
    createObserver();
    nextTick(() => updateIndicator());

    if ((window as any).ResizeObserver && pageIndicator.value) {
      ro = new ResizeObserver(() => updateIndicator());
      ro.observe(pageIndicator.value);
      pageIndicator.value.querySelectorAll("[data-id]").forEach((el) => ro!.observe(el as Element));
    }

    if ((window as any).MutationObserver && pageIndicator.value) {
      mo = new MutationObserver(() => {
        nextTick(() => {
          updateIndicator();
          if (ro && pageIndicator.value) {
            pageIndicator.value.querySelectorAll("[data-id]").forEach((el) => ro!.observe(el as Element));
          }
        });
      });
      mo.observe(pageIndicator.value, { childList: true, subtree: true });
    }
  } else {
    pageIndicatorObserver?.disconnect();
    pageIndicatorObserver = null;

    if (ro) {
      ro.disconnect();
      ro = null;
    }

    if (mo) {
      mo.disconnect();
      mo = null;
    }

    indicator.value.opacity = 0;
  }
}

const resizeHandler = () => {
  if (screenWidthStore.isAboveBreakpoint) {
    collectHeadings();
    createObserver();
  }
};

// 计算文章ID
const articleId = computed(() => {
  const relativePath = page.value?.relativePath;
  if (!relativePath) return "";
  const path = relativePath.replace(/\.md$/, "");
  const lookupUrl = path.startsWith("/") ? path : `/${path}`;
  const post = postStore.getPostByUrl(lookupUrl);
  return post?.id || "";
});

const shortLink = computed(() => {
  if (!articleId.value) return "";
  return `/p/${articleId.value}`;
});

const copyShortLink = async () => {
  if (!shortLink.value) return;
  await copyToClipboard(`${window.location.origin}${shortLink.value}`);
};

if (isClient()) {
  onMounted(() => {
    screenWidthStore.init();

    toggleMonitoring(screenWidthStore.isAboveBreakpoint);

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("resize", updateIndicator, { passive: true });
    window.addEventListener("hashchange", () => {
      if (screenWidthStore.isAboveBreakpoint) {
        collectHeadings();
        createObserver();
      }
    });
    window.addEventListener("popstate", () => {
      if (screenWidthStore.isAboveBreakpoint) {
        collectHeadings();
        createObserver();
      }
    });

    nextTick(() => updateIndicator());
  });

  onBeforeUnmount(() => {
    pageIndicatorObserver?.disconnect();
    pageIndicatorObserver = null;

    window.removeEventListener("resize", resizeHandler);
    window.removeEventListener("resize", updateIndicator);
    window.removeEventListener("hashchange", () => {
      collectHeadings();
      createObserver();
    });
    window.removeEventListener("popstate", () => {
      collectHeadings();
      createObserver();
    });

    if (pageIndicatorUnlockTimer) {
      window.clearTimeout(pageIndicatorUnlockTimer);
      pageIndicatorUnlockTimer = null;
    }

    if (ro) {
      ro.disconnect();
      ro = null;
    }

    if (mo) {
      mo.disconnect();
      mo = null;
    }
  });

  watch(
    () => screenWidthStore.isAboveBreakpoint,
    (newValue) => {
      toggleMonitoring(newValue);
    }
  );

  watch(
    () => headingsActiveId.value,
    () => {
      if (screenWidthStore.isAboveBreakpoint) {
        nextTick(() => updateIndicator());
      }
    }
  );

  watch(
    () => grouped.value,
    () => {
      if (screenWidthStore.isAboveBreakpoint) {
        nextTick(() => updateIndicator());
      }
    }
  );
}
</script>

<template>
  <div ref="pageIndicator" class="PageIndicator">
    <div class="label">
      <p class="text">在此页上</p>
      <p class="icon">link</p>
      <p class="article-id" title="复制短链" v-if="articleId" @click="copyShortLink">
        {{ isCopied ? `已复制` : articleId }}
      </p>
    </div>
    <h3>{{ frontmatter.title ? frontmatter.title : page.title }}</h3>

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
      <span v-for="h in grouped" :key="h.id" :data-id="h.id" :class="[{ active: h.id === headingsActiveId }]">
        <a
          :href="`#${h.id}`"
          @click.prevent="navigateTo(h.id)"
          role="link"
          :aria-current="h.id === headingsActiveId ? 'true' : undefined"
          >{{ h.text }}</a
        >
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/PageIndicator");
</style>
