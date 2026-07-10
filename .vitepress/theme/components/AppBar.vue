<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAppBarStore } from "../stores/appbar";
import { useSearchStore } from "../stores/search";
import { useScreenWidth } from "../composables/useScreenWidth";

const appBarStore = useAppBarStore();
const searchStore = useSearchStore();
const { isHidden } = storeToRefs(appBarStore);
const { isAboveBreakpoint } = useScreenWidth();

const isTabFocusable = computed(() => !isAboveBreakpoint.value);

/** 点击搜索图标按钮时激活搜索覆盖层 */
const handleSearchButtonClick = () => {
  searchStore.activate();
};
</script>

<template>
  <div class="AppBar" :class="{ hidden: isHidden }" :tabindex="isTabFocusable ? 0 : -1">
    <MaterialButton
      pattern="icon-button"
      size="s"
      color="filled"
      width="narrow"
      class="action-btn"
      :tabindex="isTabFocusable ? 0 : -1"
      @click="handleSearchButtonClick"
      >search</MaterialButton
    >
  </div>
</template>

<style lang="scss">
@use "../styles/components/AppBar";
</style>
