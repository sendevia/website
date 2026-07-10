/**
 * AppBar 状态存储
 * 管理滚动隐藏状态
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppBarStore = defineStore("appbar", () => {
  const isHidden = ref(false);

  function show() {
    isHidden.value = false;
  }

  function hide() {
    isHidden.value = true;
  }

  function resetAll() {
    isHidden.value = false;
  }

  return {
    isHidden,
    show,
    hide,
    resetAll,
  };
});
