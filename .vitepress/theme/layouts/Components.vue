<template>
  <Header />
  <main class="ComponentsLayout">
    <ArticleMasonry preset-category="组件" />
  </main>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Components");
</style>
