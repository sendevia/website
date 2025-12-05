<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useGlobalScroll } from "../composables/useGlobalScroll";
import { usePostStore, type PostData } from "../stores/posts";
import { useSearchStateStore } from "../stores/searchState";
import { useScreenWidthStore } from "../stores/screenWidth";
import { handleTabNavigation } from "../utils/tabNavigation";

const { isScrolled } = useGlobalScroll({ threshold: 100 });

const searchStateStore = useSearchStateStore();
const screenWidthStore = useScreenWidthStore();
const postsStore = usePostStore();

const { posts } = storeToRefs(postsStore);

const query = ref("");
const appbar = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const isTabFocusable = computed(() => !screenWidthStore.isAboveBreakpoint);

// 计算过滤后的文章，使用 PostData 类型
const filteredPosts = computed<PostData[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || !posts.value.length) return [];

  return posts.value.filter((post) => {
    return (
      post.title.includes(q) ||
      post.description.includes(q) ||
      post.date.includes(q) ||
      post.tags.some((t) => t.includes(q)) ||
      post.categories.some((t) => t.includes(q))
    );
  });
});

// 处理输入框焦点 (仅激活，不处理关闭)
const handleFocus = () => {
  if (!searchStateStore.isSearchActive) {
    searchStateStore.activate();
  }
  searchStateStore.setFocus(true);
};

// 处理输入框失焦 (只改变焦点状态，不关闭搜索，解决双击问题)
const handleBlur = () => {
  searchStateStore.setFocus(false);
};

// 处理输入
const handleInput = () => {
  const hasContent = query.value.trim().length > 0;
  searchStateStore.setTyping(hasContent);
  if (hasContent && !searchStateStore.isSearchActive) {
    searchStateStore.activate();
  }
};

// 清除搜索状态
const clearSearchState = () => {
  query.value = "";
  searchStateStore.setTyping(false);
  searchStateStore.deactivate();
  if (searchInput.value) {
    searchInput.value.blur();
  }
};

// 点击搜索结果
const handleResultClick = () => {
  setTimeout(() => {
    clearSearchState();
  }, 200);
};

// 处理外部点击
const handleDocumentClick = (event: Event) => {
  if (!searchStateStore.isSearchActive) return;

  const target = event.target as HTMLElement;
  const isClickInsideInput = searchInput.value && searchInput.value.contains(target);
  const isClickInsideResults = target.closest(".searchResult");

  if (!isClickInsideInput && !isClickInsideResults && query.value.trim() === "") {
    clearSearchState();
  }
};

// 监听状态自动聚焦
watch(
  () => searchStateStore.isSearchActive,
  async (isActive) => {
    if (isActive && searchInput.value) {
      await nextTick();
      setTimeout(() => {
        searchInput.value?.focus();
      }, 100);
    } else if (!isActive) {
      if (query.value !== "") {
        query.value = "";
        searchStateStore.setTyping(false);
      }
    }
  }
);

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (!searchStateStore.isSearchActive) return;
  const container = appbar.value;
  const items = container?.querySelectorAll(".searchInput, .item") || null;

  if (event.key === "Escape") {
    event.preventDefault();
    handleTabNavigation(container, items, true);
    clearSearchState();
  }

  if (event.key === "Tab") {
    event.preventDefault();
    handleTabNavigation(container, items, event.shiftKey);

    // 当搜索框没有内容时，Tab 键取消搜索激活状态
    if (query.value.trim() === "") {
      searchStateStore.deactivate();
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
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
    }"
    :tabindex="isTabFocusable ? 0 : -1"
  >
    <div class="action-area">
      <div class="leading-button">
        <MaterialButton color="text" icon="menu" size="xs" :tabindex="isTabFocusable ? 0 : -1" />
      </div>

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

      <div class="author-avatar" :tabindex="isTabFocusable ? 0 : -1">
        <img src="/assets/images/avatar.webp" alt="logo" />
      </div>
    </div>

    <div v-if="filteredPosts.length > 0" class="result-area">
      <a
        v-for="(post, index) in filteredPosts"
        :key="post.url"
        :href="post.url"
        class="item"
        :tabindex="isTabFocusable ? 0 : -1"
        @click="handleResultClick"
      >
        <div class="title">
          <h3>{{ post.title }}</h3>
          <p v-if="post.date" class="date">{{ post.date }}</p>
        </div>
        <p v-if="post.description" class="description">{{ post.description }}</p>
        <!-- 只有不是最后一项时才显示分割线 -->
        <hr v-if="index !== filteredPosts.length - 1" />
      </a>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/AppBar");
</style>
