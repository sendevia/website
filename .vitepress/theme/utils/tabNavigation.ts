/**
 * 处理容器内的 Tab 键导航
 * @param container 包含可聚焦元素的容器，规定选择范围
 * @param items 容器内的可聚焦元素列表
 * @param isShiftKey 是否按下了 Shift 键（用于反向导航）
 * @param isESCKey 是否按下了 Esc 键（用于取消内容焦点）
 */
export const handleTabNavigation = (
  container: HTMLElement | null,
  items: NodeListOf<Element> | null,
  isShiftKey?: boolean,
  isESCKey?: boolean
): void => {
  if (!container || !items || items.length === 0) return;

  const currentFocused = document.activeElement as HTMLElement;
  const itemsArray = Array.from(items) as HTMLElement[];

  // 检查当前焦点是否在容器范围内
  const isInContainer = container.contains(currentFocused);
  const currentIndex = isInContainer ? itemsArray.indexOf(currentFocused) : -1;

  if (isShiftKey) {
    // Shift + Tab: 反向切换
    const nextIndex = currentIndex <= 0 ? itemsArray.length - 1 : currentIndex - 1;
    itemsArray[nextIndex].focus();
  } else {
    // Tab: 正向切换
    const nextIndex = currentIndex < itemsArray.length - 1 ? currentIndex + 1 : 0;
    itemsArray[nextIndex].focus();
  }

  // 取消焦点
  if (isESCKey) {
    currentFocused.blur();
  }
};
