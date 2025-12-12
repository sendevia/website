<script setup lang="ts">
import { onBeforeMount, onMounted } from "vue";

onBeforeMount(() => {
  document.title = "";
});

onMounted(() => {
  document.title = "404";
});
</script>

<template>
  <div class="notfound">
    <div id="notfound-information">
      <h1>(⊙x⊙;)</h1>
      <div>
        <h2>你的网页遇到问题，不需要刷新。</h2>
        <h2>我们不收集任何信息，你只需 <a href="/">返回本站首页</a>。</h2>
      </div>
      <h4>1000% 完成</h4>
    </div>
    <div id="notfound-qrcode">
      <span></span>
      <div>
        <p>所访问页面不存在或已失效，请检查链接是否正确。</p>
        <p>终止代码：404_NOT_FOUND</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/NotFound");
</style>
