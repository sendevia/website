<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGlobalData } from "../composables/useGlobalData";

const { page, frontmatter, theme } = useGlobalData();
const seed = ref(1);
const defaultImpression = theme.value.defaultImpression;

if (typeof window !== "undefined") {
  onMounted(() => {
    seed.value = Date.now();
  });
}
</script>

<template>
  <header class="Header">
    <div class="container">
      <span class="headline">{{ frontmatter.title ? frontmatter.title : page.title }}</span>
      <span class="subtitle">{{ frontmatter.description }}</span>
      <div class="impression">
        <svg width="0" height="0">
          <filter class="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="5" :seed="seed" result="noise" />
            <feColorMatrix type="saturate" values="0" result="desaturatedNoise" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 1" />
              <feFuncG type="discrete" tableValues="0 1" />
              <feFuncB type="discrete" tableValues="0 1" />
              <feFuncA type="discrete" tableValues="1 1" />
            </feComponentTransfer>
          </filter>
        </svg>
        <div class="noise"></div>
        <div
          class="image"
          :style="{
            backgroundImage: frontmatter.impression ? `url('${frontmatter.impression}')` : `url('${defaultImpression}')`,
          }"
          :impression-color="frontmatter.color"
          loading="lazy"
        ></div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Header");
</style>
