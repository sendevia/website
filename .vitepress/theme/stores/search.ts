/**
 * 搜索状态存储
 * 管理搜索覆盖层的全局状态
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useSearchStore = defineStore("search", () => {
  const isSearchActive = ref(false);
  const isSearchFocused = ref(false);
  const query = ref("");

  function activate() {
    isSearchActive.value = true;
  }

  function deactivate() {
    isSearchActive.value = false;
    isSearchFocused.value = false;
  }

  function setFocus(focused: boolean) {
    isSearchFocused.value = focused;
  }

  function toggle() {
    if (isSearchActive.value) {
      deactivate();
    } else {
      activate();
    }
  }

  /** 清空搜索：重置查询、停用覆盖层 */
  function clearSearch() {
    query.value = "";
    isSearchFocused.value = false;
    isSearchActive.value = false;
  }

  /** 重置所有搜索状态 */
  function resetAll() {
    clearSearch();
  }

  return {
    isSearchActive,
    isSearchFocused,
    query,
    activate,
    deactivate,
    setFocus,
    toggle,
    clearSearch,
    resetAll,
  };
});
