<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useScroll } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { usePostStore, type PostData } from "../stores/posts";
import { useAppBarStore } from "../stores/appbar";
import { useScreenWidth } from "../composables/useScreenWidth";
import { handleTabNavigation } from "../utils/tabNavigation";
import { useRoute } from "vitepress";

const appBarStore = useAppBarStore();
const { isSearchActive, isSearchTyping, isHidden, query } = storeToRefs(appBarStore);
const { isAboveBreakpoint } = useScreenWidth();
const postsStore = usePostStore();
const { posts } = storeToRefs(postsStore);

/** 初始化路由实例 */
const route = useRoute();

/** DOM 元素引用 */
const scrollTarget = ref<HTMLElement | null>(null); // 滚动容器的 DOM 引用
const appbar = ref<HTMLElement | null>(null); // AppBar 自身的 DOM 引用
const searchInput = ref<HTMLInputElement | null>(null); // 搜索输入框的 DOM 引用

const scrollContainer = ref<HTMLElement | null>(null);
const { y, directions } = useScroll(scrollContainer, { offset: { top: 100 } });
const isScrolled = computed(() => y.value > 100);
const isTabFocusable = computed(() => !isAboveBreakpoint.value);

/** 获取滚动容器 */
const getScrollContainer = () => document.querySelector<HTMLElement>(".content-flow");

/**
 * 监听滚动位置 y 的变化，控制 AppBar 的显示和隐藏。
 */
watch(y, (currentY) => {
  if (directions.bottom && currentY > 300) {
    appBarStore.hide();
  } else if (directions.top && isHidden.value) {
    appBarStore.show();
  }
  if (currentY <= 50) {
    appBarStore.show();
  }
});

/**
 * 计算属性：根据当前搜索查询过滤文章列表。
 * 搜索范围包括文章标题、描述、日期、标签和分类。
 */
const filteredPosts = computed<PostData[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || !posts.value.length) return [];

  return posts.value.filter(
    (post) =>
      post.date.toLowerCase().includes(q) ||
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.categories.some((t) => t.toLowerCase().includes(q)),
  );
});

/**
 * 清除搜索并让输入框失焦。
 */
const clearSearchAndBlur = () => {
  appBarStore.clearSearch();
  searchInput.value?.blur();
};

/**
 * 处理搜索输入框获得焦点事件。
 * 移动端（低于断点）点击输入框直接激活搜索覆盖层。
 */
const handleFocus = () => {
  appBarStore.setFocus(true);
  if (!isAboveBreakpoint.value && !isSearchActive.value) {
    appBarStore.activate();
  }
};

/**
 * 处理搜索输入框失去焦点事件。
 */
const handleBlur = () => {
  appBarStore.setFocus(false);
};

/**
 * 处理搜索输入框的输入事件。
 */
const handleInput = () => {
  const hasContent = query.value.trim().length > 0;
  appBarStore.setTyping(hasContent);
  if (hasContent && !isSearchActive.value) {
    appBarStore.activate();
  }
};

/**
 * 处理搜索结果点击事件。
 */
const handleResultClick = () => {
  setTimeout(clearSearchAndBlur, 200);
};

/** 延迟聚焦定时器 */
let focusTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 监听搜索激活状态的变化，控制输入框聚焦和查询清理。
 */
watch(
  () => isSearchActive.value,
  async (active) => {
    if (active) {
      await nextTick();
      focusTimer = setTimeout(() => searchInput.value?.focus(), 100);
    } else {
      if (focusTimer) {
        clearTimeout(focusTimer);
        focusTimer = null;
      }
      if (query.value !== "") {
        query.value = "";
        appBarStore.setTyping(false);
      }
    }
  },
);

/**
 * 检查点击是否在搜索区域（输入框或结果列表）内。
 */
const isClickInsideSearchArea = (target: HTMLElement): boolean => {
  const inInput = searchInput.value?.contains(target);
  const inResults = appbar.value?.querySelector(".result-area")?.contains(target);
  return !!(inInput || inResults);
};

/**
 * 处理全局文档点击事件：点击搜索区域外且无输入时关闭搜索。
 */
const handleDocumentClick = (event: Event) => {
  if (!isSearchActive.value) return;

  const target = event.target as HTMLElement;

  if (isClickInsideSearchArea(target) || query.value.trim() !== "") {
    return;
  }

  clearSearchAndBlur();
};

/**
 * 处理全局键盘事件：Escape 关闭搜索，Tab 自定义导航。
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!isSearchActive.value) return;

  const container = appbar.value;
  const items = container?.querySelectorAll<HTMLElement>(".search-input, .result-items") || null;

  if (event.key === "Escape") {
    event.preventDefault();
    handleTabNavigation(container, items, true);
    clearSearchAndBlur();
  } else if (event.key === "Tab") {
    event.preventDefault();
    handleTabNavigation(container, items, event.shiftKey);
    if (query.value.trim() === "") {
      appBarStore.deactivate();
    }
  }
};

/** 页面切换时重置状态并重新绑定滚动容器 */
watch(
  () => route.path,
  async () => {
    appBarStore.resetAll();

    await nextTick();

    const newTarget = getScrollContainer();
    if (newTarget) {
      scrollTarget.value = newTarget;
      newTarget.scrollTop = 0;
    } else {
      scrollTarget.value = null;
    }
  },
);

const addEventListeners = () => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
};

const removeEventListeners = () => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
};

const initializeAppBar = () => {
  const newTarget = getScrollContainer();
  if (newTarget) {
    scrollTarget.value = newTarget;
    scrollContainer.value = newTarget;
  }
  addEventListeners();
};

const cleanupAppBar = () => {
  removeEventListeners();
  appBarStore.resetAll();
};

onMounted(() => {
  initializeAppBar();
});

onUnmounted(() => {
  cleanupAppBar();
});
</script>

<template>
  <div
    ref="appbar"
    class="AppBar"
    :class="{
      scroll: isScrolled,
      searching: isSearchActive,
      typing: isSearchTyping,
      hidden: isHidden,
    }"
    :tabindex="isTabFocusable ? 0 : -1"
  >
    <div class="action-area">
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        placeholder="搜索文章"
        class="search-input"
        :tabindex="isTabFocusable ? 0 : -1"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />
    </div>

    <div class="result-area" v-if="isSearchActive && filteredPosts.length > 0">
      <a
        :key="post.url"
        :href="post.url"
        :tabindex="isTabFocusable ? 0 : -1"
        class="result-items"
        v-for="(post, index) in filteredPosts"
        @click="handleResultClick"
      >
        <span class="result-index">{{ index + 1 }}</span>
        <div class="title">
          <div class="chips">
            <div v-if="post.date" class="segments date">
              <p class="item">{{ post.date }}</p>
            </div>
            <div v-if="post.categories.length > 0" class="segments categories">
              <p :key="item" v-for="item in post.categories" class="item">
                {{ item }}
              </p>
            </div>
            <div v-if="post.tags.length > 0" class="segments tags">
              <p :key="item" v-for="item in post.tags" class="item">
                {{ item }}
              </p>
            </div>
          </div>
          <h3>{{ post.title }}</h3>
        </div>
      </a>
    </div>

    <div class="no-results" v-else-if="isSearchActive && query.length > 0 && filteredPosts.length === 0">
      <span class="icon">search_off</span>
      <p class="label">未找到相关文章。</p>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/AppBar");
</style>
