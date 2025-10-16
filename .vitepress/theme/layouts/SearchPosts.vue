<script setup lang="ts">
import { ref, computed } from "vue";
import { useAllPosts, type Post } from "../composables/useAllPosts";

const postsRef = useAllPosts(true);
const query = ref("");

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
</script>

<template>
  <main class="page-search" aria-labelledby="search-heading">
    <h1 id="search-heading" class="visually-hidden">搜索文章</h1>
    <input id="post-search" v-model="query" placeholder="搜索文章..." class="search-input" />
    <section>
      <h6 v-if="!query">请输入关键词以搜索文章。</h6>
      <div v-else>
        <div class="search-result" v-if="filteredPosts.length">
          <article v-for="post in filteredPosts" :key="post.url" class="search-item">
            <h2 class="result-title">
              <a :href="post.url">{{ post.title }}</a>
            </h2>
            <p v-if="post.date" :datetime="post.date">{{ post.date }}</p>
            <p v-if="post.description" class="result-desc">{{ post.description }}</p>
          </article>
        </div>
        <p v-else>没有找到相关文章。</p>
      </div>
    </section>
  </main>
</template>

<style lang="scss">
@use "../styles/mixin";

.page-search {
  display: flex;
  flex-direction: column;
  gap: 16px;
  grid-column: 1 / 13;

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
