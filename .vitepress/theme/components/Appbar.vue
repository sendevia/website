<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useGlobalScroll } from "../composables/useGlobalScroll";
import { useAllPosts, type Post } from "../composables/useAllPosts";
import { useSearchState } from "../composables/useSearchState";
import { useScreenWidth } from "../composables/useScreenWidth";
import { handleTabNavigation } from "../utils/tabNavigation";

const { frontmatter } = useGlobalData();
const { isScrolled } = useGlobalScroll({ threshold: 100 });
const { isSearchActive, isSearchTyping, deactivateSearch, setSearchFocus, setSearchTyping } = useSearchState();
const { isAboveBreakpoint } = useScreenWidth(840);

const isHome = computed(() => frontmatter.value.home === true);
const postsRef = useAllPosts(true);
const query = ref("");
const appbar = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const isTabFocusable = computed(() => !isAboveBreakpoint.value);

// 计算过滤后的文章
const filteredPosts = computed<Post[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q || !postsRef.value) return [];

  return postsRef.value.filter((post) => {
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

const handlePopState = () => {
  if (isSearchActive.value) clearSearchState();
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("popstate", handlePopState);
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
@use "../styles/mixin";

.appbar {
  display: flex;
  align-items: center;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: space-between;

  position: fixed;
  top: -64px;
  right: 0px;

  height: 64px;
  width: calc(100% - 96px);

  padding-inline: 4px;

  color: var(--md-sys-color-on-surface);

  background-color: var(--md-sys-color-surface);

  overflow: hidden;
  transition: var(--md-sys-motion-spring-slow-effect-duration) var(--md-sys-motion-spring-slow-effect);
  z-index: 998;

  .actionArea {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;

    position: relative;

    height: 64px;
    width: 100%;

    .leadingButton {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      justify-content: center;

      position: absolute;
      left: 0px;

      height: 48px;
      width: 48px;

      margin-inline: 4px 8px;

      opacity: 1;
      transition: opacity var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
      z-index: 0;

      MaterialButton:focus-visible {
        @include mixin.focus-ring($thickness: 2);
      }
    }

    .searchInput {
      @include mixin.typescale-style("title-medium");

      flex-grow: 1;

      height: 56px;
      min-width: 0px;

      margin-inline-start: 0px;
      padding-block: 0px;
      padding-inline: 24px;

      color: var(--md-sys-color-on-surface-variant);
      text-overflow: ellipsis;

      border: none;
      border-radius: var(--md-sys-shape-corner-full);

      background-color: var(--md-sys-color-surface-container);

      transition: margin var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
      z-index: 1;

      &:focus-visible {
        @include mixin.focus-ring($thickness: 2);
      }
    }

    .authorAvatar {
      display: flex;
      align-content: center;
      flex-direction: column;
      flex-shrink: 0;
      flex-wrap: wrap;
      justify-content: center;

      height: 48px;
      width: 48px;

      overflow: hidden;
      z-index: 0;

      img {
        height: 32px;
        width: 32px;

        object-fit: cover;
        -webkit-mask: var(--via-svg-mask) no-repeat 0 / 100%;
        mask: var(--via-svg-mask) no-repeat 0 / 100%;
      }
    }
  }

  .searchResult {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 8px;

    position: absolute;
    top: 64px;

    width: 100%;

    padding-inline: 24px;
    padding-block-start: 12px;

    overflow: scroll;

    .item {
      width: 100%;

      text-decoration: none;

      border-radius: var(--md-sys-shape-corner-medium);

      .description {
        margin-block-end: 12px;
      }

      &:focus-visible {
        @include mixin.focus-ring($thickness: 2, $offset: 4);
      }
    }
  }

  &.searching {
    top: 0px;

    height: 100%;

    padding: 12px;

    .actionArea {
      .leadingButton {
        opacity: 0;
        transition: opacity var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
      }

      .searchInput {
        margin-inline-start: 0px;

        transition: margin var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
      }
    }
  }

  &.scroll {
    background-color: var(--md-sys-color-surface-container);

    .searchInput {
      background-color: var(--md-sys-color-surface-container-highest);
    }
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
  .appbar {
    top: 0;

    width: 100%;

    opacity: 1;
    visibility: visible;

    .actionArea {
      .searchInput {
        margin-inline-start: 56px;
      }
    }

    .searchResult {
      height: calc(100% - (80px + 64px));
    }
  }
}

@media screen and (max-width: 600px) {
}
</style>
