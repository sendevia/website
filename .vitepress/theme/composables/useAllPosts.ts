import { ref, onMounted } from "vue";

export interface PostItem {
  url: string;
  title: string;
  date?: string;
  content?: string;
}

export function useAllPosts(withContent = false) {
  const posts = ref<PostItem[]>([]);
  onMounted(async () => {
    // @ts-ignore
    const modules = import.meta.glob("../../../posts/*.md", { eager: true });
    posts.value = Object.entries(modules)
      .map(([path, mod]: any) => {
        const fm = mod?.frontmatter || {};
        return {
          url: "/posts/" + path.split("/").pop().replace(/\.md$/, ".html"),
          title: fm.title || mod.title || path.split("/").pop().replace(/\.md$/, ""),
          date: fm.date || "",
          content: withContent ? mod?.default?.toString() || "" : undefined,
        };
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  });
  return posts;
}
