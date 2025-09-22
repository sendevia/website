import { useData } from "vitepress";

export function useGlobalData() {
  const { site, page, frontmatter, theme } = useData();
  return { site, page, frontmatter, theme };
}
