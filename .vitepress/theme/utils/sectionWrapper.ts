import type MarkdownIt from "markdown-it";

/**
 * 将连续的标题块包裹为独立的 section（headline-block），便于样式与交互处理
 * @param mdit - MarkdownIt 实例
 */
export function wrapHeadingsAsSections(mdit: MarkdownIt): void {
  if (!mdit || !mdit.core || !mdit.core.ruler) {
    console.warn("Invalid MarkdownIt instance provided");
    return;
  }

  mdit.core.ruler.before("inline", "group_sections", (state) => {
    const tokens = state.tokens;
    const newTokens: any[] = [];
    let inSection = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === "heading_open") {
        // 如果已经在 section 中，先关闭前一个 section
        if (inSection) {
          newTokens.push({
            type: "section_wrapper_close",
            tag: "div",
            nesting: -1,
            level: 0,
          });
        }

        // 打开新的 section
        newTokens.push({
          type: "section_wrapper_open",
          tag: "div",
          nesting: 1,
          attrs: [["class", "headline-block"]],
          level: 0,
        });

        newTokens.push(token);
        inSection = true;
      } else if (token.type === "heading_close") {
        newTokens.push(token);
      } else {
        // 其他 token 根据是否在 section 中决定是否添加
        newTokens.push(token);
      }
    }

    // 如果循环结束后仍在 section 中，关闭最后一个 section
    if (inSection) {
      newTokens.push({
        type: "section_wrapper_close",
        tag: "div",
        nesting: -1,
        level: 0,
      });
    }

    state.tokens = newTokens;
  });
}
