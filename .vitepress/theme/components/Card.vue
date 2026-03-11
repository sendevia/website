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
}

const props = withDefaults(defineProps<Props>(), {
  variant: "feed",
  size: "m",
  color: "filled",
  impression: () => [],
  downloadable: false,
});
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" class="MaterialCard" :class="[props.variant, props.size, props.color]">
    <div class="content">
      <StateLayer />
      <div v-if="(props.impression && props.impression.length > 0) || props.title" class="impression-area">
        <div class="tips-container">
          <div v-if="props.date" class="tips date">
            <h6>{{ props.date }}发布</h6>
          </div>
          <div v-if="props.downloadable" class="tips download">
            <h6>可下载资源</h6>
          </div>
        </div>

        <div v-if="props.impression && props.impression.length > 0" class="image-container">
          <img
            v-for="(imgUrl, index) in props.impression.slice(0, 2)"
            :key="index"
            :src="imgUrl"
            :alt="props.title + ' cover ' + (index + 1)"
          />
        </div>
      </div>

      <div v-if="props.description || props.title || props.date" class="supporting-area">
        <h4 v-if="props.title">{{ props.title }}</h4>
        <p v-if="props.description">{{ props.description }}</p>
      </div>
    </div>
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Card");
</style>
