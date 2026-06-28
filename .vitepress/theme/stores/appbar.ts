/**
 * AppBar 状态存储
 * 管理搜索状态、滚动隐藏和查询等全局 UI 状态
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAppBarStore = defineStore("appbar", () => {
  // ─── 搜索状态 ───
  const isSearchActive = ref(false);
  const isSearchFocused = ref(false);
  const isSearchTyping = ref(false);
  const query = ref("");

  // ─── 滚动隐藏状态 ───
  const isHidden = ref(false);

  // ─── 搜索动作 ───
  function activate() {
    isSearchActive.value = true;
  }

  function deactivate() {
    isSearchActive.value = false;
    isSearchFocused.value = false;
    isSearchTyping.value = false;
  }

  function setFocus(focused: boolean) {
    isSearchFocused.value = focused;
  }

  function setTyping(typing: boolean) {
    isSearchTyping.value = typing;
  }

  function toggle() {
    if (isSearchActive.value) {
      deactivate();
    } else {
      activate();
    }
  }

  /** 清空搜索：清空查询、重置打字状态、停用搜索 */
  function clearSearch() {
    query.value = "";
    isSearchTyping.value = false;
    isSearchActive.value = false;
    isSearchFocused.value = false;
  }

  // ─── 滚动隐藏动作 ───
  function show() {
    isHidden.value = false;
  }

  function hide() {
    isHidden.value = true;
  }

  /** 重置所有 AppBar 状态 */
  function resetAll() {
    isHidden.value = false;
    clearSearch();
  }

  // ─── 计算属性（纯状态派生，无 DOM 依赖） ───
  /** 搜索是否有内容输入 */
  const hasQuery = computed(() => query.value.trim().length > 0);

  return {
    // 状态
    isSearchActive,
    isSearchFocused,
    isSearchTyping,
    query,
    isHidden,
    // 计算属性
    hasQuery,
    // 动作
    activate,
    deactivate,
    setFocus,
    setTyping,
    toggle,
    clearSearch,
    show,
    hide,
    resetAll,
  };
});
