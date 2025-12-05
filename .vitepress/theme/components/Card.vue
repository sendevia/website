<script setup lang="ts">
import { ref } from "vue";

interface Props {
  category?: string[];
  date?: string;
  description?: string;
  href?: string;
  impression?: string[];
  tags?: string[];
  title?: string;
  color?: "elevated" | "filled" | "outlined";
  size?: "s" | "m" | "l";
  variant?: "feed";
}

const props = withDefaults(defineProps<Props>(), {
  color: "filled",
  size: "m",
  variant: "feed",
  impression: () => [],
});

const isSwapped = ref(false);
let touchStartX = 0;

// 是否有多张图片
const hasMultipleImages = () => props.impression && props.impression.length >= 2;

// 处理开始触摸
const handleTouchStart = (e: TouchEvent) => {
  if (!hasMultipleImages()) return;
  touchStartX = e.touches[0].clientX;
};

// 处理结束触摸
const handleTouchEnd = (e: TouchEvent) => {
  if (!hasMultipleImages()) return;
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;

  // 滑动距离超过 50px 视为有效
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      isSwapped.value = true;
    } else {
      isSwapped.value = false;
    }
  }
};
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" class="MaterialCard" :class="[props.variant, props.size, props.color]">
    <div class="content">
      <div v-if="(props.impression && props.impression.length > 0) || props.title" class="impression-area">
        <div class="title-container">
          <div v-if="props.title" class="title">
            <h4>{{ props.title }}</h4>
            <h6>{{ props.date }}发布</h6>
          </div>
        </div>

        <div
          v-if="props.impression && props.impression.length > 0"
          class="image-container"
          :class="{ swapped: isSwapped }"
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
        >
          <img
            v-for="(imgUrl, index) in props.impression.slice(0, 2)"
            :key="index"
            :src="imgUrl"
            :alt="props.title + ' cover ' + (index + 1)"
          />
        </div>
      </div>

      <div v-if="props.description || props.title || props.date" class="supporting-area">
        <p v-if="props.description">{{ props.description }}</p>
      </div>
    </div>
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Card");
</style>
