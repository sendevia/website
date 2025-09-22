<template>
  <footer class="main-layout-footer">
    <hr spec="wave" />
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
          <a href="" target="_blank">sendevia's material theme</a>
          主题
        </p>
        <a href="/" target="_blank"> 版本：{{ siteVersion }}</a>
        <p>构建日期：{{ buildDate }}</p>
      </div>
      <div id="main-layout-footer-description-beian">
        <div id="main-layout-footer-beian-gongan">
          <img src="/assets/images/beian.png" loading="eager" />
          <a href="https://beian.mps.gov.cn/#/query/webSearch?code=23020002230215" target="_blank">黑公网安备23020002230215</a>
        </div>
        <div id="main-layout-footer-Registration-icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">黑ICP备2024016516号-1</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";
const { site, page } = useGlobalData();

import { ref } from "vue";
// @ts-ignore
const siteVersion = __SITE_VERSION__;

const buildDate = ref("");
if (typeof window !== "undefined") {
  fetch("/index.html", { method: "HEAD" })
    .then((res) => {
      const date = res.headers.get("last-modified");
      buildDate.value = date ? new Date(date).toLocaleString() : new Date().toLocaleString();
    })
    .catch(() => {
      buildDate.value = new Date().toLocaleString();
    });
} else {
  buildDate.value = new Date().toLocaleString();
}
</script>
