<script setup lang="ts">
import { ref, computed } from "vue";
import { useAllPosts } from "../composables/useAllPosts";

const posts = useAllPosts(true);
const query = ref("");

const filteredPosts = computed(() => {
  if (!query.value) return posts.value;
  const q = query.value.toLowerCase();
  return posts.value.filter((post) => post.title.toLowerCase().includes(q) || (post.content && post.content.toLowerCase().includes(q)));
});
</script>

<template>
  <div class="page-search">
    <input v-model="query" placeholder="搜索文章..." class="search-input" />
    <div class="search-result" v-if="filteredPosts.length">
      <div v-for="post in filteredPosts" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <span v-if="post.date"> - {{ post.date }}</span>
      </div>
    </div>
    <p v-else>没有找到相关文章。</p>
  </div>
</template>

<style lang="scss">
@use "../styles/mixin";

.page-search {
  display: flex;
  flex-direction: column;
  gap: 16px;

  padding: 24px;

  width: 100%;

  .search-input {
    @include mixin.typescale-style("title-medium");

    padding: 8px 12px;

    height: 48px;

    color: var(--md-sys-color-on-surface-bright);

    border-radius: var(--md-sys-shape-corner-extra-large);
    border: none;
    outline: none;

    background-color: var(--md-sys-color-surface-container-high);
  }

  .search-result {
    display: flex;
    flex-direction: column;
    gap: 12px;

    a {
      @include mixin.typescale-style("body-large");

      color: var(--md-sys-color-primary);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    span {
      @include mixin.typescale-style("body-medium");

      color: var(--md-sys-color-on-surface-variant);
    }
  }
}
</style>
