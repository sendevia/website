<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useGlobalScroll } from "../composables/useGlobalScroll";
import { useAllPosts, type Post } from "../composables/useAllPosts";
import { useSearchState } from "../composables/useSearchState";
import { useScreenWidthStore } from "../stores/screenWidth";
import { handleTabNavigation } from "../utils/tabNavigation";

const { frontmatter } = useGlobalData();
const { isScrolled } = useGlobalScroll({ threshold: 100 });
const { isSearchActive, isSearchTyping, deactivateSearch, setSearchFocus, setSearchTyping } = useSearchState();
const screenWidthStore = useScreenWidthStore();
const isHome = computed(() => frontmatter.value.home === true);
const articlesRef = useAllPosts(true);
const query = ref("");
const appbar = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const isTabFocusable = computed(() => !screenWidthStore.isAboveBreakpoint);

// 计算过滤后的文章
const filteredPosts = computed<Post[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || !articlesRef.value) return [];

  return articlesRef.value.filter((post) => {
    const { title = "", description = "", content = "", date = "" } = post;
    return (
      title.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      content.toLowerCase().includes(q) ||
      date.toLowerCase().includes(q)
    );
  });
});

// 处理输入框焦点 (仅激活，不处理关闭)
const handleFocus = () => {
  if (!isSearchActive.value) {
    isSearchActive.value = true;
  }
  setSearchFocus(true);
};

// 处理输入框失焦 (只改变焦点状态，不关闭搜索，解决双击问题)
const handleBlur = () => {
  setSearchFocus(false);
};

// 处理输入
const handleInput = () => {
  const hasContent = query.value.trim().length > 0;
  setSearchTyping(hasContent);
  if (hasContent && !isSearchActive.value) {
    isSearchActive.value = true;
  }
};

// 清除搜索状态
const clearSearchState = () => {
  query.value = "";
  setSearchTyping(false);
  deactivateSearch();
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
  if (!isSearchActive.value) return;

  const target = event.target as HTMLElement;
  const isClickInsideInput = searchInput.value && searchInput.value.contains(target);
  const isClickInsideResults = target.closest(".searchResult");

  if (!isClickInsideInput && !isClickInsideResults && query.value.trim() === "") {
    clearSearchState();
  }
};

// 监听状态自动聚焦
watch(isSearchActive, async (isActive) => {
  if (isActive && searchInput.value) {
    await nextTick();
    setTimeout(() => {
      searchInput.value?.focus();
    }, 100);
  } else if (!isActive) {
    if (query.value !== "") {
      query.value = "";
      setSearchTyping(false);
    }
  }
});

// 键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (!isSearchActive.value) return;
  const container = appbar.value;
  const items = container?.querySelectorAll(".searchInput, .item") || null;

  if (event.key === "Escape") {
    event.preventDefault();
    handleTabNavigation(container, items, true);
    clearSearchState();
  }

  if (event.key === "Tab" && query.value.trim() !== "") {
    event.preventDefault();
    handleTabNavigation(container, items, event.shiftKey);
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
    class="appbar"
    :class="{
      scroll: isScrolled,
      homeLayout: isHome,
      searching: isSearchActive,
      typing: isSearchTyping,
    }"
    :tabindex="isTabFocusable ? 0 : -1"
  >
    <div class="actionArea">
      <div class="leadingButton">
        <MaterialButton color="text" icon="menu" size="xs" :tabindex="isTabFocusable ? 0 : -1" />
      </div>

      <input
        ref="searchInput"
        v-model="query"
        placeholder="搜索文章"
        class="searchInput"
        :tabindex="isTabFocusable ? 0 : -1"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
      />

      <div class="authorAvatar" :tabindex="isTabFocusable ? 0 : -1">
        <img src="/assets/images/avatar.webp" alt="logo" />
      </div>
    </div>

    <div v-if="filteredPosts.length > 0" class="searchResult">
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
