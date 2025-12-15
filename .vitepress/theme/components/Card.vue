<script setup lang="ts">
interface Props {
  variant?: "feed";
  size?: "s" | "m" | "l";
  color?: "elevated" | "filled" | "outlined";
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  category?: string[];
  impression?: string[];
  href?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "feed",
  size: "m",
  color: "filled",
  impression: () => [],
});
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
        <p v-if="props.description">{{ props.description }}</p>
      </div>
    </div>
  </component>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Card");
</style>
