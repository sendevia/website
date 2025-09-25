<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";
import AllPostsLayout from "./AllPosts.vue";
import ArticleLayout from "./Article.vue";
import Footer from "../components/Footer.vue";
import NotFoundLayout from "./NotFound.vue";
import SearchPostsLayout from "./SearchPosts.vue";
import Sidebar from "../components/Sidebar.vue";
const { site, page, frontmatter } = useGlobalData();
</script>

<template>
  <div id="main-layout">
    <Sidebar />
    <div id="main-layout-content-flow">
      <div id="main-layout-content-filler">
        <div v-if="frontmatter.home">
          <h1>{{ site.title }}</h1>
          <p>{{ site.description }}</p>
        </div>
        <AllPostsLayout v-else-if="frontmatter.layout === 'posts'" />
        <SearchPostsLayout v-else-if="frontmatter.layout === 'search'" />
        <NotFoundLayout v-else-if="page.isNotFound" />
        <ArticleLayout v-else />
      </div>
      <Footer />
    </div>
  </div>
</template>
