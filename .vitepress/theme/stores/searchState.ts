import { defineStore } from "pinia";
import { ref, watch } from "vue";

/**
 * 搜索状态管理
 */
export const useSearchStateStore = defineStore("searchState", () => {
  // 响应式状态
  const isSearchActive = ref<boolean>(false);
  const isSearchFocused = ref<boolean>(false);
  const isSearchTyping = ref<boolean>(false);

  /**
   * 激活搜索
   */
  function activate() {
    isSearchActive.value = true;
  }

  /**
   * 停用搜索
   */
  function deactivate() {
    isSearchActive.value = false;
    isSearchFocused.value = false;
    isSearchTyping.value = false;
  }

  /**
   * 设置搜索焦点状态
   * @param focused - 是否获得焦点
   */
  function setFocus(focused: boolean) {
    isSearchFocused.value = focused;
    // 当获得焦点时，自动激活搜索
    if (focused && !isSearchActive.value) {
      isSearchActive.value = true;
    }
  }

  /**
   * 设置搜索输入状态
   * @param typing - 是否正在输入
   */
  function setTyping(typing: boolean) {
    isSearchTyping.value = typing;
  }

  /**
   * 切换搜索状态
   */
  function toggle() {
    if (isSearchActive.value) {
      deactivate();
    } else {
      activate();
    }
  }

  // 监听 isSearchFocused 变化，当获得焦点时，自动激活搜索
  watch(isSearchFocused, (focused) => {
    if (focused && !isSearchActive.value) {
      isSearchActive.value = true;
    }
  });

  return {
    // 状态
    isSearchActive,
    isSearchFocused,
    isSearchTyping,

    // 方法
    activate,
    deactivate,
    setFocus,
    setTyping,
    toggle,
  };
});
