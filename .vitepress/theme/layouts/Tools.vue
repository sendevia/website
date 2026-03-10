<script setup lang="ts">
import MaterialSymbolDL from "../components/tools/MaterialSymbolDL.vue";
</script>

<template>
  <Header />
  <main class="ToolsLayout">
    <section id="msdl">
      <h1>图标字体URL拼接下载</h1>
      <MaterialSymbolDL />
    </section>
  </main>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Tools");
</style>
