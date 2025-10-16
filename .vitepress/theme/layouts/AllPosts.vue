<script setup lang="ts">
import { useAllPosts } from "../composables/useAllPosts";
import { computed } from "vue";

const postsRef = useAllPosts(true);
const postsList = computed(() => postsRef.value ?? []);
</script>

<template>
  <div class="page-allposts" aria-labelledby="all-posts-heading">
    <h1 id="allposts-heading">所有文章</h1>
    <section class="posts-list">
      <div class="posts-card" v-for="post in postsList" :key="post.url">
        <h2 class="post-title">
          <a :href="post.url">{{ post.title }}</a>
        </h2>
        <div class="post-meta">
          <span v-if="post.date" :datetime="post.date">{{ post.date }}</span>
        </div>
        <p v-if="post.description" class="post-desc">{{ post.description }}</p>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
@use "../styles/mixin";

.page-allposts {
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
