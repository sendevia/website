<script setup lang="ts">
interface Props {
  /** 卡片变体 */
  variant?: "feed";
  /** 卡片大小 */
  size?: "s" | "m" | "l";
  /** 卡片颜色 */
  color?: "elevated" | "filled" | "outlined";
  /** 内容标题 */
  title?: string;
  /** 内容描述 */
  description?: string;
  /** 内容发布时间 */
  date?: string;
  /** 内容标签 */
  tags?: string[];
  /** 内容分类 */
  category?: string[];
  /** 内容题图 */
  impression?: string[];
  /** 跳转链接 */
  href?: string;
  /** 内容有资源可下载 */
  downloadable?: boolean;
  /** 是否为草稿 */
  draft?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: "feed",
  size: "m",
  color: "filled",
  impression: () => [],
  downloadable: false,
});
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" class="MaterialCard" :class="[variant, size, color]">
    <div class="content">
      <StateLayer />
      <div v-if="(impression && impression.length > 0) || title" class="impression-area">
        <div class="tips-container">
          <div v-if="draft" class="tips draft">
            <h6>草稿</h6>
          </div>
          <div v-if="date" class="tips date">
            <h6>{{ date }}发布</h6>
          </div>
          <div v-if="downloadable" class="tips download">
            <h6>可下载资源</h6>
          </div>
        </div>

        <div v-if="impression && impression.length > 0" class="image-container">
          <img v-for="(imgUrl, index) in impression.slice(0, 2)" :key="index" :src="imgUrl" :alt="title + ' cover ' + (index + 1)" />
        </div>
      </div>

      <div v-if="description || title || date" class="supporting-area">
        <h4 v-if="title">{{ title }}</h4>
        <p v-if="description">{{ description }}</p>
      </div>
    </div>
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Card");
</style>
