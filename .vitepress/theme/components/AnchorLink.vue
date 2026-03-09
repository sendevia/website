<script setup lang="ts">
import { ref } from "vue";
import { useAchorLink } from "../composables/useAnchorLink";

interface Props {
  /** 锚点链接地址 */
  href: string;
  /** 锚点显示的字符串 */
  symbol?: string;
  /** 锚点的类名称 */
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  symbol: "",
  className: "",
});

const isCopied = ref(false);
const { handleCopy } = useAchorLink(props.href, () => {
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1000);
});

/** 处理锚点点击事件 */
const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  handleCopy();
};
</script>

<template>
  <span :class="className">
    <a :href="href" class="symbol" @click="handleClick">{{ symbol }}</a>
    <span v-if="isCopied" class="feedback">已复制</span>
  </span>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/AnchorLink");
</style>
