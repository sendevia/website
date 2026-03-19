import type MarkdownIt from "markdown-it";

/**
 * 解析 `%icon_name%` 语法并将其转换为 Material Symbol 图标
 * @param md - MarkdownIt 实例
 */
export function symbol(md: MarkdownIt): void {
  md.inline.ruler.before("emphasis", "material_symbol", (state, silent) => {
    const max = state.posMax;
    const start = state.pos;

    // 检查是否以 '%' 开始 (ASCII 0x25)
    if (state.src.charCodeAt(start) !== 0x25) return false;

    let pos = start + 1;
    let found = false;

    // 寻找结束的 '%'
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      // 过滤空格等以确保这确实是个图标名，避免与平常的%文本混合
      if (ch === 0x20 || ch === 0x0a) {
        break; // 不允许空格或换行
      }
      if (ch === 0x25) {
        found = true;
        break;
      }
      pos++;
    }

    // 若没有找到闭合的 % 或者 %% 中间没有内容则跳过
    if (!found || pos === start + 1) return false;

    // 创建 token 供渲染
    if (!silent) {
      const content = state.src.slice(start + 1, pos);
      const [iconName, size] = content.split(":");
      const token = state.push("html_inline", "", 0);

      let styleAttr = "";
      if (size) {
        styleAttr = ` style="--size: ${size}"`;
      }

      token.content = `<span class="inline-symbol"${styleAttr}>${iconName}</span>`;
    }

    state.pos = pos + 1;
    return true;
  });
}
