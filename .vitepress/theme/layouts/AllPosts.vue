<script setup lang="ts">
import { useAllPosts } from "../composables/useAllPosts";

const posts = useAllPosts();
</script>

<template>
  <div class="page-all-posts">
    <h1>所有文章</h1>
    <div class="posts-card" v-for="post in posts" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span v-if="post.date"> - {{ post.date }}</span>
    </div>
  </div>
</template>

<style lang="scss">
@use "../styles/mixin";

.page-all-posts {
  .posts-card a {
    @include mixin.typescale-style("headline-small");
  }
}
</style>
