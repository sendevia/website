<script setup lang="ts">
import MaterialSymbolDL from "../components/tools/MaterialSymbolDL.vue";
</script>

<template>
  <Header />
  <main class="ToolsLayout"></main>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Tools");
</style>
