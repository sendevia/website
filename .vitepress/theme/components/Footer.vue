<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";

const { theme } = useGlobalData();
const siteVersion = theme.value.siteVersion;
</script>

<template>
  <footer class="Footer">
    <div class="info">
      <p>使用<a href="https://github.com/sendevia/website" target="_blank">sendevia's material theme</a>主题</p>
      <p>
        版本<a :href="'https://github.com/sendevia/website/releases/tag/' + siteVersion" target="_blank">{{ siteVersion }}</a>
      </p>
      <a href="https://beian.miit.gov.cn/" rel="noreferrer" target="_blank">黑ICP备2024016516号</a>
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=23020002230215" rel="noreferrer" target="_blank">黑公网安备23020002230215号</a>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "../styles/components/Footer";
</style>
