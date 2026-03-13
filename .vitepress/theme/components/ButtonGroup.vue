<script setup lang="ts">
/** 外部链接类型定义 */
interface ExternalLink {
  /** ARIA 标签 */
  ariaLabel?: string;
  /** 按钮颜色 */
  color?: string;
  /** 图标名称（使用 Material Symbols 图标字体） */
  icon?: string;
  /** 按钮文本 */
  label?: string;
  /** 链接地址 */
  link?: string;
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 链接打开方式 */
  target?: string;
  /** 按钮类型 */
  type?: string;
  /* 点击事件回调 */
  onClick?: (e?: Event) => void;
}

/** 组件属性定义 */
interface Props {
  /** ARIA 标签 */
  ariaLabel?: string;
  /** 按钮颜色 */
  color?: string;
  /** 图标名称（使用 Material Symbols 图标字体） */
  icon?: string;
  /** 按钮组布局 */
  layout?: "horizontal" | "vertical";
  /** 链接地址 */
  links?: ExternalLink[];
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 链接打开方式 */
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
      :title="item.ariaLabel || props.ariaLabel"
      :aria-label="item.ariaLabel || props.ariaLabel"
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
