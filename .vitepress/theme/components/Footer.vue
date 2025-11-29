<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";

const { site, page, theme } = useGlobalData();
const siteVersion = theme.value.siteVersion;
</script>

<template>
  <footer class="main-layout-footer">
    <hr />
    <div id="main-layout-footer-description">
      <div id="main-layout-footer-description-topic">
        <img src="/assets/images/avatar.webp" alt="logo" />
        <div>
          <h3>{{ page.title }}</h3>
          <p>来自 {{ site.title }}</p>
        </div>
      </div>
      <div id="main-layout-footer-description-theme">
        <p>
          使用
          <a href="https://github.com/sendevia/vitepress-theme" target="_blank">sendevia's material theme</a>
          主题
        </p>
        <a :href="'https://github.com/sendevia/website/tags/v' + siteVersion" target="_blank"> 版本：{{ siteVersion }}</a>
      </div>
      <div id="main-layout-footer-description-beian">
        <div id="main-layout-footer-beian-gongan">
          <img src="/assets/images/beian.png" loading="eager" />
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=23020002230215" target="_blank"
            >黑公网安备23020002230215</a
          >
        </div>
        <div id="main-layout-footer-Registration-icp">
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
