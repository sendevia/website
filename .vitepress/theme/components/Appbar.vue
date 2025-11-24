<script setup lang="ts">
// todo: 优化输入状态的处理
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useGlobalScroll } from "../composables/useGlobalScroll";
import { useAllPosts, type Post } from "../composables/useAllPosts";
import { handleTabNavigation } from "../utils/tabNavigation";

const { frontmatter } = useGlobalData();
const { isScrolled } = useGlobalScroll({ threshold: 100 });

const isHome = computed(() => frontmatter.value.home === true);

const appbar = document.querySelector(".appbar") as HTMLInputElement;
const isSearching = ref(false);
const postsRef = useAllPosts(true);
const query = ref("");
const isTyping = ref(false);

// 计算过滤后的文章列表
const filteredPosts = computed<Post[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return (postsRef.value ?? []).filter((post) => {
    const inTitle = post.title?.toLowerCase().includes(q) ?? false;
    const inDesc = post.description?.toLowerCase().includes(q) ?? false;
    const inContent = post.content?.toLowerCase().includes(q) ?? false;
    const inDate = post.date?.toLowerCase().includes(q) ?? false;
    return inTitle || inDesc || inContent || inDate;
  });
});

// 处理搜索输入框焦点事件
const handleFocus = () => {
  isSearching.value = true;
};

// 处理搜索输入框失焦事件
const handleBlur = () => {
  if (filteredPosts.value.length === 0) {
    isSearching.value = false;
  }
};

// 处理搜索结果链接点击后事件
const handleResultClick = () => {
  setTimeout(() => {
    clearSearchState();
  }, 200);
};

// 清除搜索状态并取消焦点
const clearSearchState = () => {
  isSearching.value = false;
  query.value = "";
  const searchInput = document.querySelector(".searchInput") as HTMLInputElement;
  if (searchInput) {
    searchInput.blur();
  }
};

// 处理按键事件
const handleKeydown = (event: KeyboardEvent) => {
  const container = document.querySelector(".appbar") as HTMLElement;
  const items = container?.querySelectorAll(".searchInput, .item");

  if (event.key === "Escape" && isSearching.value) {
    event.preventDefault();
    handleTabNavigation(container, items, event.key === "Escape");
    clearSearchState();
  }

  if (event.key === "Tab" && isSearching.value && query.value.trim() !== "") {
    event.preventDefault();
    handleTabNavigation(container, items, event.shiftKey);
  }
};

// 监听页面点击事件，用于处理外部点击
const handleDocumentClick = (event: Event) => {
  const target = event.target as HTMLElement;

  // 如果点击的是appbar外部且不是搜索结果
  if (appbar && !appbar.contains(target) && !target.closest(".searchResult")) {
    // 没有搜索结果时，可点击空白处退出搜索
    // 有搜索结果时，只有点击文章链接后才会退出搜索
    if (filteredPosts.value.length === 0) {
      clearSearchState();
    }
  }
};

// 处理移动端返回导航（未验证）
const handlePopState = () => {
  if (isSearching.value) {
    clearSearchState();
  }
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
  <div class="appbar" :class="{ scroll: isScrolled, homeLayout: isHome, searching: isSearching, typing: isTyping }">
    <div class="actionArea">
      <div class="leadingButton">
        <MaterialButton color="text" icon="menu" size="xs" />
      </div>
      <input v-model="query" placeholder="搜索文章" class="searchInput" @focus="handleFocus" @blur="handleBlur" />
      <div class="authorAvatar">
        <img src="/assets/images/avatar.webp" alt="logo" />
      </div>
    </div>
    <div v-if="filteredPosts.length" class="searchResult">
      <a v-for="post in filteredPosts" :key="post.url" :href="post.url" class="item" @click="handleResultClick">
        <div class="title">
          <h3>{{ post.title }}</h3>
          <p v-if="post.date" class="date">{{ post.date }}</p>
        </div>
        <p v-if="post.description" class="description">{{ post.description }}</p>
        <hr v-if="filteredPosts.indexOf(post) !== filteredPosts.length - 1" />
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

  height: 64px;
  width: 100%;

  padding-inline: 4px;

  color: var(--md-sys-color-on-surface);

  background-color: var(--md-sys-color-surface);

  opacity: 0;
  overflow: hidden;
  transition: var(--md-sys-motion-spring-slow-effect-duration) var(--md-sys-motion-spring-slow-effect);
  visibility: hidden;
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

      margin-inline-start: 56px;
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
    height: 100%;

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

    opacity: 1;
    visibility: visible;

    .searchResult {
      height: calc(100% - (80px + 64px));
    }
  }
}

@media screen and (max-width: 600px) {
}
</style>
