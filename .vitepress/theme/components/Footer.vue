<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";

const { site, page, theme } = useGlobalData();
const siteVersion = theme.value.siteVersion;
</script>

<template>
  <footer class="Footer">
    <hr />
    <div class="description-area">
      <div class="topic">
        <img src="/assets/images/avatar.webp" alt="logo" />
        <div>
          <h3>{{ page.title }}</h3>
          <p>来自 {{ site.title }}</p>
        </div>
      </div>
      <div class="theme-info">
        <p>
          使用
          <a href="https://github.com/sendevia/website" target="_blank">sendevia's material theme</a>
          主题
        </p>
        <a :href="'https://github.com/sendevia/website/releases/tag/' + siteVersion" target="_blank">
          版本：{{ siteVersion }}</a
        >
      </div>
      <div class="beian-info">
        <div>
          <a href="https://beian.miit.gov.cn/" target="_blank">黑ICP备2024016516号-1</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Footer");
</style>
