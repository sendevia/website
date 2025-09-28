<script setup lang="ts">
import { ref } from "vue";

import { useGlobalData } from "../composables/useGlobalData";
const { site, page } = useGlobalData();

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
        <a :href="'https://github.com/sendevia/website/tags/v' + siteVersion" target="_blank"> 版本：{{ siteVersion }}</a>
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

<style lang="scss">
@use "sass:meta";
@use "../styles/mixin";

.main-layout-footer {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 12px;
  grid-column: span 12;
  justify-content: space-around;

  margin-inline: 12px;
  padding-block-end: 18px;

  color: var(--md-sys-color-on-surface-variant);

  a {
    text-decoration: none;
  }

  #main-layout-footer-description {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    gap: 6px;

    #main-layout-footer-description-topic {
      display: flex;
      align-items: center;
      flex-direction: row;
      gap: 12px;

      img {
        height: 50px;
        width: 50px;

        -webkit-mask: var(--via-svg-mask) no-repeat 0 / 100%;
        mask: var(--via-svg-mask) no-repeat 0 / 100%;
      }

      h3 {
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
    }

    #main-layout-footer-description-theme {
      @include mixin.typescale-style("body-large");

      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    #main-layout-footer-description-beian {
      @include mixin.typescale-style("body-large");

      display: flex;
      flex-wrap: wrap;
      gap: 6px;

      #main-layout-footer-beian-gongan {
        display: inline-flex;
        align-items: center;
        gap: 5px;

        img {
          height: 16px;
          width: 16px;
        }
      }
    }
  }

  #main-layout-footer-social-media {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-end;
  }
}
</style>
