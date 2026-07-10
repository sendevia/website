<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { usePostStore, type PostData } from "../stores/posts";
import { useSearchStore } from "../stores/search";
import { useRoute, useRouter } from "vitepress";
import { extractSnippet } from "../utils/search";

const SEARCH_INPUT_ID = "search-overlay-input";
const RESULTS_ID = "search-overlay-results";
const STATUS_ID = "search-overlay-status";

const searchStore = useSearchStore();
const { isSearchActive, query } = storeToRefs(searchStore);
const postsStore = usePostStore();
const { posts } = storeToRefs(postsStore);
const router = useRouter();
const route = useRoute();

interface SearchResult extends PostData {
  snippet: { before: string; match: string; after: string } | null;
}

/** 搜索输入框的 DOM 引用 */
const searchInput = ref<HTMLInputElement | null>(null);

/** 结果列表容器 DOM 引用 */
const resultsContainer = ref<HTMLElement | null>(null);

/** 当前键盘高亮的结果索引（-1 表示无高亮） */
const activeIndex = ref(-1);

/** 打开覆盖层前处于焦点的元素，用于关闭后回退焦点 */
let previousActiveElement: Element | null = null;

/** 修剪后的搜索关键词 */
const trimmedQuery = computed(() => query.value.trim());

/** 小写化的搜索关键词，用于匹配 */
const searchQuery = computed(() => trimmedQuery.value.toLowerCase());

/** 搜索结果，包含匹配的上下文片段 */
const filteredPosts = computed<SearchResult[]>(() => {
  const q = searchQuery.value;
  if (!q) return [];

  return posts.value
    .filter(
      (post) =>
        post.date.toLowerCase().includes(q) ||
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.categories.some((t) => t.toLowerCase().includes(q)),
    )
    .map((post) => ({
      ...post,
      snippet: extractSnippet(post.content, q, 20),
    }));
});

/** 结果数量描述，用于 aria-live 播报 */
const resultCountMessage = computed(() => {
  const count = filteredPosts.value.length;
  if (count === 0 && trimmedQuery.value) return "未找到相关文章";
  if (count > 0) return `找到 ${count} 篇文章`;
  return "";
});

/** 判断两个路径是否指向同一页面 */
const isSamePath = (a: string, b: string) => a === b || a === b.replace(/\/$/, "");

/** 关闭搜索覆盖层并回退焦点 */
const closeOverlay = () => {
  activeIndex.value = -1;
  searchStore.clearSearch();
  const prev = previousActiveElement;
  previousActiveElement = null;
  nextTick(() => (prev as HTMLElement)?.focus?.());
};

/** 跳转到搜索结果页面，使用 W3C Text Fragments（#:~:text=）由浏览器原生处理标记与位置跳转 */
const navigateToResult = (post: PostData, keyword?: string) => {
  const samePage = isSamePath(route.path, post.url);

  if (!samePage && keyword) {
    sessionStorage.setItem("search:keyword", keyword);
    sessionStorage.setItem("search:url", post.url);
  }

  closeOverlay();

  if (samePage && keyword) {
    location.hash = ":~:text=" + encodeURIComponent(keyword);
  }
  if (!samePage) {
    router.go(post.url);
  }
};

/** 搜索结果点击 */
const handleResultClick = (post: SearchResult) => {
  navigateToResult(post, post.snippet ? trimmedQuery.value || undefined : undefined);
};

/**
 * 处理键盘导航：ArrowDown/ArrowUp 遍历结果，Enter 确认选择，Tab 焦点陷阱。
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!isSearchActive.value) return;
  const results = filteredPosts.value;

  switch (event.key) {
    case "Escape":
      event.preventDefault();
      closeOverlay();
      break;

    case "ArrowDown":
      event.preventDefault();
      if (results.length === 0) break;
      activeIndex.value = activeIndex.value < results.length - 1 ? activeIndex.value + 1 : 0;
      scrollResultIntoView();
      break;

    case "ArrowUp":
      event.preventDefault();
      if (results.length === 0) break;
      activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : results.length - 1;
      scrollResultIntoView();
      break;

    case "Enter":
    case " ":
      if (activeIndex.value < 0 || activeIndex.value >= results.length) break;
      event.preventDefault();
      navigateToResult(results[activeIndex.value], trimmedQuery.value || undefined);
      break;

    case "Tab": {
      event.preventDefault();
      const focusable = getFocusableElements();
      if (focusable.length === 0) break;
      const current = document.activeElement;
      const idx = focusable.indexOf(current as HTMLElement);
      const next = event.shiftKey
        ? idx <= 0
          ? focusable.length - 1
          : idx - 1
        : idx >= focusable.length - 1
          ? 0
          : idx + 1;
      focusable[next].focus();
      /** Tab 回到输入框时清除键盘高亮，避免 aria-activedescendant 指向旧结果 */
      if (next === 0) activeIndex.value = -1;
      break;
    }
  }
};

/** 获取覆盖层内所有可聚焦元素 */
const getFocusableElements = (): HTMLElement[] => {
  const inner = document.querySelector(".inner");
  if (!inner) return [];
  return Array.from(
    inner.querySelectorAll<HTMLElement>(
      'input, button, a[href]:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
    ),
  );
};

/** 滚动当前高亮结果到可见区域 */
const scrollResultIntoView = () => {
  const el = resultsContainer.value?.children[activeIndex.value] as HTMLElement | undefined;
  el?.scrollIntoView({ block: "nearest" });
};

/** 当前高亮结果的 id，用于 aria-activedescendant */
const activeDescendantId = computed(() => {
  if (activeIndex.value < 0) return undefined;
  return `search-result-${activeIndex.value}`;
});

/** 延迟聚焦定时器 */
let focusTimer: ReturnType<typeof setTimeout> | null = null;

/** 监听搜索激活状态，控制输入框聚焦 */
watch(
  () => isSearchActive.value,
  (active) => {
    if (active) {
      previousActiveElement = document.activeElement;
      nextTick(() => {
        focusTimer = setTimeout(() => searchInput.value?.focus(), 100);
      });
    } else if (focusTimer) {
      clearTimeout(focusTimer);
      focusTimer = null;
    }
  },
);

/** 页面切换时重置搜索状态 */
watch(
  () => route.path,
  () => searchStore.clearSearch(),
);

/** 全局键盘事件 */
useEventListener(document, "keydown", handleKeydown);
</script>

<template>
  <Teleport to="body">
    <Transition name="search-overlay" type="transition" mode="in-out">
      <div
        v-if="isSearchActive"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文章"
        class="SearchOverlay"
        @click.self="closeOverlay"
      >
        <div class="inner">
          <div class="topbar">
            <label :for="SEARCH_INPUT_ID" class="visually-hidden">搜索文章</label>
            <input
              :id="SEARCH_INPUT_ID"
              ref="searchInput"
              v-model="query"
              type="search"
              placeholder="搜索文章"
              class="search-input"
              autocomplete="off"
              :aria-controls="RESULTS_ID"
              :aria-activedescendant="activeDescendantId"
              :aria-label="`搜索文章，共 ${filteredPosts.length} 条结果`"
              @input="activeIndex = -1"
            />
            <MaterialButton
              pattern="icon-button"
              color="text"
              aria-label="关闭搜索"
              @click="closeOverlay"
              >close</MaterialButton
            >
          </div>

          <div :id="STATUS_ID" class="visually-hidden" aria-live="polite" aria-atomic="true">
            {{ resultCountMessage }}
          </div>

          <div
            v-if="filteredPosts.length > 0"
            :id="RESULTS_ID"
            ref="resultsContainer"
            role="listbox"
            aria-label="搜索结果列表"
            class="result-area"
          >
            <a
              :key="post.url"
              :href="post.url"
              :id="`search-result-${index}`"
              role="option"
              :aria-selected="activeIndex === index"
              class="result-items"
              v-for="(post, index) in filteredPosts"
              @click.prevent="handleResultClick(post)"
              @mouseenter="activeIndex = index"
              @focus="activeIndex = index"
            >
              <span class="result-index" aria-hidden="true">{{ index + 1 }}</span>
              <div class="title">
                <div class="chips">
                  <div v-if="post.date" class="segments date">
                    <span class="item">{{ post.date }}</span>
                  </div>
                  <div v-if="post.categories.length > 0" class="segments categories">
                    <span :key="item" v-for="item in post.categories" class="item">
                      {{ item }}
                    </span>
                  </div>
                  <div v-if="post.tags.length > 0" class="segments tags">
                    <span :key="item" v-for="item in post.tags" class="item">
                      {{ item }}
                    </span>
                  </div>
                </div>
                <h3>{{ post.title }}</h3>
                <p v-if="post.snippet" class="snippet">
                  <span class="snippet-context">{{ post.snippet.before }}</span>
                  <mark class="snippet-match">{{ post.snippet.match }}</mark>
                  <span class="snippet-context">{{ post.snippet.after }}</span>
                </p>
              </div>
            </a>
          </div>

          <div
            v-else-if="query.length > 0 && filteredPosts.length === 0"
            role="status"
            class="no-results"
          >
            <span class="icon" aria-hidden="true">search_off</span>
            <p class="label">未找到相关文章</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
@use "../styles/components/SearchOverlay";
</style>
