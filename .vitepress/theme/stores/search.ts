/**
 * 搜索状态存储
 * 管理搜索覆盖层的全局状态
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useSearchStore = defineStore("search", () => {
  const isSearchActive = ref(false);
  const query = ref("");

  function activate() {
    isSearchActive.value = true;
  }

  function toggle() {
    isSearchActive.value = !isSearchActive.value;
  }

  /** 清空搜索：重置查询、停用覆盖层 */
  function clearSearch() {
    query.value = "";
    isSearchActive.value = false;
  }

  return {
    isSearchActive,
    query,
    activate,
    toggle,
    clearSearch,
  };
});
