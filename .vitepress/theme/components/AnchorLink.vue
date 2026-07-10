<script setup lang="ts">
import { ref } from "vue";
import { useClipboard } from "@vueuse/core";

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

const { copy: copyToClipboard } = useClipboard();
const isCopied = ref(false);

const handleClick = async (event: MouseEvent) => {
  event.preventDefault();
  const anchorId = props.href.startsWith("#") ? props.href : `#${props.href}`;
  const fullUrl = `${window.location.origin}${window.location.pathname}${anchorId}`;
  await copyToClipboard(fullUrl);
  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1000);
};
</script>

<template>
  <span :class="className">
    <a :href="href" class="symbol" @click="handleClick">
      <StateLayer />
      {{ symbol }}
    </a>
    <span v-if="isCopied" class="feedback">已复制</span>
  </span>
</template>

<style lang="scss">
@use "../styles/components/AnchorLink";
</style>
