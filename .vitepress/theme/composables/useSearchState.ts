import { ref } from "vue";

const isSearchActive = ref(false);
const isSearchFocused = ref(false);
const isSearchTyping = ref(false);

export function useSearchState() {
  const activateSearch = () => {
    isSearchActive.value = true;
  };

  const deactivateSearch = () => {
    isSearchActive.value = false;
    isSearchFocused.value = false;
    isSearchTyping.value = false;
  };

  const setSearchFocus = (focused: boolean) => {
    isSearchFocused.value = focused;
  };

  const setSearchTyping = (typing: boolean) => {
    isSearchTyping.value = typing;
  };

  return {
    isSearchActive,
    isSearchFocused,
    isSearchTyping,
    activateSearch,
    deactivateSearch,
    setSearchFocus,
    setSearchTyping,
  };
}
