<script setup lang="ts">
import MaterialSymbolDL from "../components/tools/MaterialSymbolDL.vue";
</script>

<template>
  <Header />
  <main class="ToolsLayout">
    <section id="msdl">
      <hgroup>
        <h1>Material Symbol URL 拼接下载</h1>
        <div class="description">
          <div class="text">
            <p>
              在这里你可以将多个 Material Symbol 图标名称拼接到谷歌字体 API
              中并一键下载，这样得到的是经过分割的体积大幅减小的字体文件。
            </p>
          </div>
          <div class="icons">
            <p><span>add</span> 添加新的图标</p>
            <p><span>download</span> 下载生成的字体文件</p>
            <p><span>content_copy</span> 复制生成的 URL</p>
            <p><span>clear_all</span> 清空所有图标</p>
            <p><span>close</span> 移除单个图标</p>
          </div>
        </div>
      </hgroup>
      <MaterialSymbolDL />
    </section>

    <section class="empty">
      <hgroup>
        <h1>更多工具正在开发中...</h1>
      </hgroup>
    </section>
  </main>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/layouts/Tools");
</style>
