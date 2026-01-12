<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useGlobalScroll } from "../composables/useGlobalScroll";
import { storeToRefs } from "pinia";
import { usePostStore, type PostData } from "../stores/posts";
import { useSearchStateStore } from "../stores/searchState";
import { useScreenWidthStore } from "../stores/screenWidth";
import { handleTabNavigation } from "../utils/tabNavigation";
import { useRoute } from "vitepress";

// 初始化 store 实例
const searchStateStore = useSearchStateStore();
const screenWidthStore = useScreenWidthStore();
const postsStore = usePostStore();

// 从 posts store 中解构出 posts 响应式数据
const { posts } = storeToRefs(postsStore);

// 初始化路由实例
const route = useRoute();

// DOM 元素引用
const scrollTarget = ref<HTMLElement | null>(null); // 滚动容器的 DOM 引用
const appbar = ref<HTMLElement | null>(null); // AppBar 自身的 DOM 引用
const searchInput = ref<HTMLInputElement | null>(null); // 搜索输入框的 DOM 引用

// 本地响应式状态
const query = ref(""); // 搜索输入框的绑定值
const isHidden = ref(false); // 控制 AppBar 是否隐藏的状态

// 使用 useGlobalScroll
const { scrollResult, isScrolled: globalIsScrolled } = useGlobalScroll({ threshold: 100 });
const { y, directions } = scrollResult;

// 计算属性
const isScrolled = computed(() => globalIsScrolled.value); // 使用 useGlobalScroll 的 isScrolled
const isTabFocusable = computed(() => !screenWidthStore.isAboveBreakpoint); // 判断当前屏幕宽度下，元素是否应该可被 Tab 键聚焦

// 工具函数：获取滚动容器
const getScrollContainer = () => document.querySelector<HTMLElement>(".content-flow");

/**
 * 监听滚动位置 y 的变化，控制 AppBar 的显示和隐藏。
 */
watch(y, (currentY) => {
  // 隐藏：当检测到向下滚动且滚动距离超过指定像素时
  if (directions.bottom && currentY > 300) {
    isHidden.value = true;
  }
  // 显示：当检测到向上滚动且当前 AppBar 处于隐藏状态时
  else if (directions.top && isHidden.value) {
    isHidden.value = false;
  }
  // 额外条件：如果滚动到非常靠近顶部，无论方向如何都确保显示 AppBar
  if (currentY <= 50) {
    isHidden.value = false;
  }
});

/**
 * 计算属性：根据当前搜索查询 `query` 过滤文章列表 `posts`。
 * 搜索范围包括文章标题、描述、日期、标签和分类。
 * @returns {PostData[]} 过滤后的文章列表。
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
      post.categories.some((t) => t.toLowerCase().includes(q))
  );
});

/**
 * 清除搜索状态：清空查询、取消打字状态、停用搜索模式并使输入框失焦。
 */
const clearSearchState = () => {
  query.value = "";
  searchStateStore.setTyping(false);
  searchStateStore.deactivate();
  searchInput.value?.blur();
};

/**
 * 重置 AppBar 状态：隐藏状态和搜索状态。
 */
const resetAppBarState = () => {
  isHidden.value = false;
  clearSearchState();
};

/**
 * 处理搜索输入框获得焦点事件。
 * 如果搜索未激活，则激活搜索模式并设置焦点状态。
 */
const handleFocus = () => {
  if (!searchStateStore.isSearchActive) searchStateStore.activate();
  searchStateStore.setFocus(true);
};

/**
 * 处理搜索输入框失去焦点事件。
 */
const handleBlur = () => {
  searchStateStore.setFocus(false);
};

/**
 * 处理搜索输入框的输入事件。
 * 根据输入内容更新打字状态，如果输入框有内容且搜索未激活，则激活搜索模式。
 */
const handleInput = () => {
  const hasContent = query.value.trim().length > 0;
  searchStateStore.setTyping(hasContent);
  if (hasContent && !searchStateStore.isSearchActive) {
    searchStateStore.activate();
  }
};

/**
 * 处理搜索结果点击事件。
 * 在短延迟后清除搜索状态，以允许导航发生。
 */
const handleResultClick = () => {
  setTimeout(clearSearchState, 200);
};

/**
 * 监听搜索激活状态的变化。
 * 如果搜索被激活，则在下一个 DOM 更新周期后，尝试使搜索输入框获得焦点。
 * 如果搜索被停用且 `query` 不为空，则清空 `query` 并重置打字状态。
 */
watch(
  () => searchStateStore.isSearchActive,
  async (isActive) => {
    if (isActive) {
      await nextTick(); // 确保 DOM 已更新
      setTimeout(() => searchInput.value?.focus(), 100); // 延迟聚焦以防其他 DOM 操作干扰
    } else if (query.value !== "") {
      query.value = "";
      searchStateStore.setTyping(false);
    }
  }
);

// 检查是否在搜索激活状态
const isSearchActive = computed(() => searchStateStore.isSearchActive);

/**
 * 检查点击是否在搜索区域内
 */
const isClickInsideSearchArea = (target: HTMLElement): boolean => {
  const isClickInsideInput = searchInput.value?.contains(target);
  const isClickResultArea = appbar.value?.closest(".result-area");
  return !!(isClickInsideInput || isClickResultArea);
};

/**
 * 处理全局文档点击事件。
 * 如果点击发生在搜索输入框或搜索结果区域之外，且搜索查询为空，则关闭搜索状态。
 * @param {Event} event 点击事件对象。
 */
const handleDocumentClick = (event: Event) => {
  if (!isSearchActive.value) return;

  const target = event.target as HTMLElement;

  // 如果点击在搜索区域内或查询不为空，则不关闭搜索状态
  if (isClickInsideSearchArea(target) || query.value.trim() !== "") {
    return;
  }

  clearSearchState();
};

/**
 * 处理全局键盘按下事件。
 * 主要用于处理 Escape 键关闭搜索和 Tab 键导航。
 * @param {KeyboardEvent} event 键盘事件对象。
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (!isSearchActive.value) return;

  const container = appbar.value;
  // 获取所有可聚焦的元素：搜索输入框和每个搜索结果项
  const items = container?.querySelectorAll<HTMLElement>(".search-input, .result-items") || null;

  if (event.key === "Escape") {
    event.preventDefault();
    handleTabNavigation(container, items, true); // 将焦点移回输入框或 Appbar
    clearSearchState();
  } else if (event.key === "Tab") {
    event.preventDefault();
    handleTabNavigation(container, items, event.shiftKey); // 处理自定义 Tab 导航
    // 如果 Tab 键导致焦点离开搜索区域且查询为空，则关闭搜索
    if (query.value.trim() === "") {
      searchStateStore.deactivate();
    }
  }
};

// 监听路由变化，处理页面切换后的状态重置和滚动绑定
watch(
  () => route.path,
  async () => {
    // 重置 AppBar 状态
    resetAppBarState();

    // 等待 DOM 更新，确保新的 .content-flow 元素已渲染
    await nextTick();

    // 重新获取滚动容器并赋值给 scrollTarget
    const newTarget = getScrollContainer();
    if (newTarget) {
      scrollTarget.value = newTarget;
      newTarget.scrollTop = 0;
    } else {
      scrollTarget.value = null;
    }
  }
);

// 事件处理函数引用（用于清理）
const eventHandlers = {
  click: handleDocumentClick,
  keydown: handleKeydown,
} as const;

// 添加事件监听器
const addEventListeners = () => {
  document.addEventListener("click", eventHandlers.click);
  document.addEventListener("keydown", eventHandlers.keydown);
};

// 移除事件监听器
const removeEventListeners = () => {
  document.removeEventListener("click", eventHandlers.click);
  document.removeEventListener("keydown", eventHandlers.keydown);
};

// 初始化函数
const initializeAppBar = () => {
  screenWidthStore.init();

  // 初始化滚动容器
  const newTarget = getScrollContainer();
  if (newTarget) {
    scrollTarget.value = newTarget;
  }

  // 添加事件监听器
  addEventListeners();
};

// 清理函数
const cleanupAppBar = () => {
  // 移除事件监听器
  removeEventListeners();
  // 重置状态
  resetAppBarState();
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
      searching: searchStateStore.isSearchActive,
      typing: searchStateStore.isSearchTyping,
      hidden: isHidden,
    }"
    :tabindex="isTabFocusable ? 0 : -1"
  >
    <div class="action-area">
      <input
        ref="searchInput"
        v-model="query"
        placeholder="搜索文章"
        class="search-input"
        :tabindex="isTabFocusable ? 0 : -1"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />

      <div class="author-avatar" tabindex="-1">
        <img src="/assets/images/avatar.webp" alt="作者头像" />
      </div>
    </div>

    <div class="result-area" v-if="searchStateStore.isSearchActive && filteredPosts.length > 0">
      <a
        :key="post.url"
        :href="post.url"
        :tabindex="isTabFocusable ? 0 : -1"
        class="result-items"
        v-for="post in filteredPosts"
        @click="handleResultClick"
      >
        <div class="title">
          <h3>{{ post.title }}</h3>
          <div class="chips">
            <p class="segments date item" v-if="post.date">{{ post.date }}</p>
            <div class="segments categories" v-if="post.categories.length > 0">
              <p class="item" v-for="item in post.categories">{{ item }}</p>
            </div>
            <div class="segments tags" v-if="post.tags.length > 0">
              <p class="item" v-for="item in post.tags">{{ item }}</p>
            </div>
          </div>
        </div>
        <!-- <p class="description" v-if="post.description">{{ post.description }}</p> -->
      </a>
    </div>

    <div class="no-results" v-else-if="searchStateStore.isSearchActive && query.length > 0 && filteredPosts.length === 0">
      <span class="icon">search_off</span>
      <p class="label">未找到相关文章。</p>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/AppBar");
</style>
