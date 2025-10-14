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
  grid-column: 1 / 13;

  .posts-card a {
    @include mixin.typescale-style("headline-small");
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
}

@media screen and (max-width: 600px) {
}
</style>
