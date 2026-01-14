/**
 * 再包装的全局数据
 */

import { useData } from "vitepress";

export function useGlobalData() {
  const { site, page, frontmatter, theme } = useData();
  return { site, page, frontmatter, theme };
}
