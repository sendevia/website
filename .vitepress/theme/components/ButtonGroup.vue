<script setup lang="ts">
/**
 * 按钮组配置项定义
 */
interface GroupItem {
  /** ARIA 标签 */
  ariaLabel?: string;
  /** 按钮颜色 */
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  /** 图标名称 */
  icon?: string;
  /** 按钮文本 */
  label?: string;
  /** 链接地址 */
  link?: string;
  /** 按钮大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 链接打开方式 */
  target?: string;
  /** 预设类型 */
  type?: string;
  /** 点击事件回调 */
  onClick?: (e: Event) => void;
}

/**
 * 按钮组组件属性
 */
interface Props {
  /** 按钮配置列表 */
  links?: GroupItem[];
  /** 布局方向 */
  layout?: "horizontal" | "vertical";
  /** 默认大小 */
  size?: "xs" | "s" | "m" | "l" | "xl";
  /** 默认颜色 */
  color?: "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";
  /** 默认图标 */
  icon?: string;
  /** 默认链接目标 */
  target?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  layout: "horizontal",
  size: "s",
});

const emit = defineEmits<{
  (e: "click", event: Event, item: GroupItem, index: number): void;
}>();

/** 预设类型的配置映射 */
const PRESETS: Record<string, { color: Props["color"]; icon: string }> = {
  download: { color: "filled", icon: "download" },
  normal: { color: "tonal", icon: "open_in_new" },
};

/**
 * 处理按钮点击
 */
const handleClick = (e: Event, item: GroupItem, index: number) => {
  item.onClick?.(e);
  emit("click", e, item, index);
};
</script>

<template>
  <div class="ButtonGroup" :class="[size, layout]" :aria-label="ariaLabel">
    <MaterialButton
      v-for="(item, index) in links"
      :key="index"
      :class="[layout, { group: links.length > 1 }]"
      :href="item.link"
      :size="item.size || size"
      :color="item.color || color || (item.type ? PRESETS[item.type]?.color : undefined) || 'text'"
      :icon="item.icon || icon || (item.type ? PRESETS[item.type]?.icon : undefined)"
      :target="item.target || target"
      :title="item.ariaLabel || ariaLabel"
      :aria-label="item.ariaLabel || ariaLabel"
      @click="handleClick($event, item, index)"
    >
      <slot :item="item" :index="index">
        {{ item.label }}
      </slot>
    </MaterialButton>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ButtonGroup");
</style>
