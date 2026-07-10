/**
 * 剥离 Markdown 标记，提取纯文本
 * @param md 原始 Markdown 内容
 * @returns 纯文本
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/---[\s\S]*?---/, "") // 移除 frontmatter
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/^#{1,6}\s+/gm, "") // 移除标题标记
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接 [text](url) → text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 图片 ![alt](url) → alt
    .replace(/[*_~`]/g, "") // 移除加粗/斜体/删除线/行内代码标记
    .replace(/<\/?[^>]+>/g, "") // 移除 HTML 标签
    .replace(/>\s*/g, "") // 移除 blockquote 标记
    .replace(/[\n\r]+/g, " ") // 换行转空格
    .replace(/\s+/g, " ") // 合并空白
    .trim();
}

/**
 * 在文本中查找关键词，返回前后各 contextChars 个字符的片段
 * @param text 搜索文本
 * @param keyword 关键词
 * @param contextChars 上下文截取字符数
 * @returns 包含高亮标记的片段，未找到返回 null
 */
export function extractSnippet(
  text: string,
  keyword: string,
  contextChars = 10,
): { before: string; match: string; after: string } | null {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) return null;

  const start = Math.max(0, idx - contextChars);
  const end = Math.min(text.length, idx + keyword.length + contextChars);

  return {
    before: `${start > 0 ? "…" : ""}${text.slice(start, idx)}`,
    match: text.slice(idx, idx + keyword.length),
    after: `${text.slice(idx + keyword.length, end)}${end < text.length ? "…" : ""}`,
  };
}
