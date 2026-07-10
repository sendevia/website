<script setup lang="ts">
import ToolCard from "../components/Tools/ToolCard.vue";
</script>

<template>
  <Header />
  <main class="ToolsLayout">
    <ToolCard id="msdl" />
  </main>
</template>

<style lang="scss">
@use "../styles/layouts/Tools";
</style>
