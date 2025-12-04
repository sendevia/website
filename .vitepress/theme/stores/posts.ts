import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type PostData = {
  id: string;
  title: string;
  url: string;
  date: string;
  timestamp: number;
  description: string;
  impression?: string;
  tags: string[];
  categories: string[];
};

declare global {
  interface ImportMeta {
    glob: (pattern: string, options?: any) => Record<string, any>;
  }
}

const modules = import.meta.glob("../../../posts/**/*.md", { eager: true }) as Record<string, any>;

/**
 * 生成唯一ID
 */
const generateHashId = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

/**
 * 核心解析逻辑
 */
const parseModule = (filePath: string, mod: any): PostData => {
  // 优先获取 VitePress 编译后的 __pageData，其次是 standard frontmatter
  const pageData = mod.__pageData || {};
  const frontmatter = pageData.frontmatter || mod.frontmatter || {};

  // 日期处理
  const rawDate = frontmatter.date || pageData.lastUpdated;
  let dateStr = "";
  let timestamp = 0;

  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      dateStr = d.toISOString().split("T")[0];
      timestamp = d.getTime();
    }
  }

  const filename = filePath.split("/").pop() || "";
  const name = filename.replace(/\.mdx?$/, "");
  const url = `/posts/${encodeURIComponent(name)}`;

  // 摘要/内容提取
  const content = frontmatter.description || pageData.description || mod.excerpt;

  // 标签与分类处理
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : frontmatter.tags ? [frontmatter.tags] : [];
  const categories = Array.isArray(frontmatter.categories)
    ? frontmatter.categories
    : frontmatter.categories
    ? [frontmatter.categories]
    : [];

  return {
    id: generateHashId(filePath),
    title: frontmatter.title || pageData.title || name,
    description: content || "",
    impression: frontmatter.impression || "",
    date: dateStr,
    timestamp,
    url,
    tags,
    categories,
  };
};

/**
 * 文章列表管理
 */
export const usePostStore = defineStore("posts", () => {
  const _allPosts = Object.keys(modules)
    .map((filePath) => parseModule(filePath, modules[filePath]))
    .sort((a, b) => b.timestamp - a.timestamp);

  const posts = ref<PostData[]>(_allPosts);

  // 最新文章
  const latestPosts = computed(() => posts.value.slice(0, 5));

  // 获取所有唯一的 Tags
  const allTags = computed(() => {
    const tagSet = new Set<string>();
    posts.value.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  });

  // 获取所有唯一的 Categories
  const allCategories = computed(() => {
    const catSet = new Set<string>();
    posts.value.forEach((p) => p.categories.forEach((c) => catSet.add(c)));
    return Array.from(catSet);
  });

  // 根据 URL 获取文章
  const getPostByUrl = (url: string) => {
    // 移除 .html 后缀以防匹配失败
    const target = url.replace(/\.html$/, "");
    return posts.value.find((p) => p.url.replace(/\.html$/, "") === target);
  };

  // 根据 ID 获取文章
  const getPostById = (id: string) => {
    return posts.value.find((p) => p.id === id);
  };

  // 根据 Tag 获取文章列表
  const getPostsByTag = (tag: string) => {
    return posts.value.filter((p) => p.tags.includes(tag));
  };

  // 根据 Category 获取文章列表
  const getPostsByCategory = (category: string) => {
    return posts.value.filter((p) => p.categories.includes(category));
  };

  return {
    posts,
    latestPosts,
    allTags,
    allCategories,
    getPostByUrl,
    getPostById,
    getPostsByTag,
    getPostsByCategory,
  };
});
