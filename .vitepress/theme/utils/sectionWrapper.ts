import type MarkdownIt from "markdown-it";

/**
 * 将连续的标题块包裹为独立的 section（headline-block），便于样式与交互处理
 */
export function wrapHeadingsAsSections(md: MarkdownIt): void {
  md.core.ruler.before("inline", "group_sections", (state) => {
    const tokens = state.tokens;
    const newTokens: any[] = [];
    let currentSectionTokens: any[] = [];
    let inSection = false;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === "heading_open") {
        if (inSection) {
          newTokens.push({
            type: "section_wrapper_close",
            tag: "div",
            nesting: -1,
            level: 0,
          });
        }

        newTokens.push({
          type: "section_wrapper_open",
          tag: "div",
          nesting: 1,
          attrs: [["class", "headline-block"]],
          level: 0,
        });

        newTokens.push(token);
        inSection = true;
        currentSectionTokens = [token];
      } else if (token.type === "heading_close") {
        newTokens.push(token);
        currentSectionTokens.push(token);
      } else {
        if (inSection) {
          newTokens.push(token);
          currentSectionTokens.push(token);
        } else {
          newTokens.push(token);
        }
      }
    }

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
