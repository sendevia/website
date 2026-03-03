import type MarkdownIt from "markdown-it";

/** 锚点配置项 */
interface AnchorOptions {
  /** 锚点层级，例如 [1, 2, 3] 代表 h1, h2, h3 */
  levels?: number[];
  /** 锚点显示的字符串 */
  symbol?: string;
  /** 锚点的类名称 */
  class?: string;
}

/**
 * 为标题添加可复制的锚点链接，将同时生成两种锚点：
 *  1. 标题行内锚点
 *  2. 组件锚点
 * @param mdit - MarkdownIt 实例
 * @param options - 锚点配置项
 */
export function anchor(mdit: MarkdownIt, options: AnchorOptions = {}): void {
  const { levels = [1, 2, 3, 4, 5, 6], symbol = "link", class: className = "AnchorLink" } = options;

  // 在 core 规则中拦截 tokens，在每个 heading 后添加 AnchorLink 组件以及行内锚点
  mdit.core.ruler.push("add_anchor_links", (state) => {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // 在 heading_close 处进行处理，此时 heading_open 和 inline 都在前面
      if (token.type === "heading_close") {
        const level = parseInt(token.tag.slice(1));
        if (!levels.includes(level)) continue;

        const headingOpenToken = tokens[i - 2];
        const inlineToken = tokens[i - 1];
        const idAttr = headingOpenToken?.attrGet("id");

        if (idAttr) {
          // 移除默认渲染的锚点（VitePress 默认会添加 header-anchor）
          if (inlineToken && inlineToken.children) {
            let anchorStartIndex = -1;
            let anchorEndIndex = -1;

            for (let j = 0; j < inlineToken.children.length; j++) {
              const child = inlineToken.children[j];
              // 查找带有 header-anchor 类名的 link_open
              if (child.type === "link_open" && child.attrGet("class")?.includes("header-anchor")) {
                anchorStartIndex = j;
              }
              // 找到对应的 link_close
              if (anchorStartIndex !== -1 && child.type === "link_close") {
                anchorEndIndex = j;
                break;
              }
            }

            // 如果找到了默认锚点，将其从 children 中移除
            if (anchorStartIndex !== -1 && anchorEndIndex !== -1) {
              inlineToken.children.splice(anchorStartIndex, anchorEndIndex - anchorStartIndex + 1);
            }
          }

          // 添加标题行内锚点
          if (inlineToken && inlineToken.children) {
            const inlineAnchor = new state.Token("html_inline", "", 0);
            inlineAnchor.content = `<a href="#${idAttr}" class="${className} inline">${symbol}</a>`;
            // 将行内锚点添加到标题文本的末端
            inlineToken.children.push(inlineAnchor);
          }

          // 添加 AnchorLink 组件
          const anchorToken = new state.Token("html_block", "", 0);
          anchorToken.content = `<AnchorLink href="#${idAttr}" symbol="${symbol}" className="${className} normal" />`;
          // 将组件插入到 heading_close 之后
          tokens.splice(i + 1, 0, anchorToken);
          i++; // 跳过新插入的 token
        }
      }
    }
  });
}
