<script setup lang="ts">
/** 外部链接类型定义 */
interface ExternalLink {
  ariaLabel?: string;
  color?: string;
  icon?: string;
  label?: string;
  link?: string;
  size?: "xs" | "s" | "m" | "l" | "xl";
  target?: string;
  type?: string;
  onClick?: (e?: Event) => void;
}

/** 组件属性定义 */
interface Props {
  ariaLabel?: string;
  color?: string;
  icon?: string;
  layout?: "horizontal" | "vertical";
  links?: ExternalLink[];
  size?: "xs" | "s" | "m" | "l" | "xl";
  target?: string;
}

/** 组件属性默认值 */
const props = withDefaults(defineProps<Props>(), {
  layout: "horizontal",
  links: () => [],
  size: "s",
});

/** 组件事件定义 */
const emit = defineEmits<{
  (e: "click", event: Event, item: ExternalLink, index: number): void;
}>();

/**
 * 根据按钮类型获取对应的颜色
 * @param type 按钮类型
 * @returns 对应的颜色
 */
const getButtonColor = (type?: string): string => {
  switch (type) {
    case "download":
      return "filled";
    case "normal":
      return "tonal";
    default:
      return "text";
  }
};

/**
 * 根据按钮类型获取对应的图标
 * @param type 按钮类型
 * @returns 对应的图标名称
 */
const getButtonIcon = (type?: string): string => {
  switch (type) {
    case "download":
      return "download";
    case "normal":
      return "open_in_new";
    default:
      return "";
  }
};

/**
 * 处理按钮点击事件
 * @param e 事件对象
 * @param item 链接对象
 * @param index 索引
 */
const handleClick = (e: Event, item: ExternalLink, index: number) => {
  if (item.onClick) {
    item.onClick(e);
  }
  emit("click", e, item, index);
};
</script>

<template>
  <div class="ButtonGroup" :class="[props.size, props.layout]" :aria-label="props.ariaLabel">
    <MaterialButton
      v-for="(item, index) in links"
      :key="index"
      class="group"
      :class="props.layout"
      :href="item.link"
      :size="item.size || props.size"
      :color="item.color || props.color || getButtonColor(item.type)"
      :icon="item.icon || props.icon || getButtonIcon(item.type)"
      :target="item.target || props.target || (item.link ? '_blank' : undefined)"
      :aria-label="item.ariaLabel || props.ariaLabel || item.label"
      @click="handleClick($event, item, index)"
    >
      <template v-if="item.label">{{ item.label }}</template>
    </MaterialButton>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ButtonGroup");
</style>
