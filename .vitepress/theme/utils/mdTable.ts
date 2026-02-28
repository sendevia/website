import type MarkdownIt from "markdown-it";
type StateBlock = any;

/**
 * 一个简易的 markdown-it 表格插件
 * @param mdit MarkdownIt 实例
 */
export const table = (mdit: MarkdownIt) => {
  // 禁用原有的表格规则
  mdit.disable("table");

  /** 表格块解析规则 */
  const tableBlock = (state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean => {
    let nextLine = startLine;
    let lineText = state.getLines(nextLine, nextLine + 1, 0, false).trim();

    // 检查是否包含表格分隔符
    if (!lineText.includes("|")) return false;

    const rows: string[] = [];
    while (nextLine < endLine) {
      lineText = state.getLines(nextLine, nextLine + 1, 0, false).trim();
      if (!lineText.includes("|") && lineText !== "") break;
      if (lineText !== "") rows.push(lineText);
      nextLine++;
    }

    if (rows.length < 1) return false;

    if (silent) return true;

    const token = state.push("simple_table", "table", 0);
    token.map = [startLine, nextLine];
    token.content = rows.join("\n");

    state.line = nextLine;
    return true;
  };

  mdit.block.ruler.before("paragraph", "simple_table", tableBlock);

  // 渲染逻辑
  mdit.renderer.rules.simple_table = (tokens, idx) => {
    const content = tokens[idx].content;
    const lines = content.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) return "";

    let html = "<table>\n";

    // 检查第二行是否是分隔行
    const hasSeparator = lines.length > 1 && /^[|:\-\s]+$/.test(lines[1]) && lines[1].includes("-");

    let headerLines: string[] = [];
    let bodyLines: string[] = [];

    if (hasSeparator) {
      headerLines = [lines[0]];
      bodyLines = lines.slice(2);
    } else {
      // 如果没有分隔行，用第一行作为表头
      headerLines = [lines[0]];
      bodyLines = lines.slice(1);
    }

    // 分割单元格并清理首尾空的装饰管线
    const getCells = (line: string) => {
      const cells = line.split("|");
      if (cells.length > 0 && cells[0].trim() === "") cells.shift();
      if (cells.length > 0 && cells[cells.length - 1].trim() === "") cells.pop();
      return cells.map((c) => c.trim());
    };

    // 解析单元格中的属性
    const parseAttributes = (cellContent: string) => {
      const attrRegex = /\{([^{}]+)\}\s*$/;
      const match = cellContent.match(attrRegex);
      const attrs: Record<string, string> = {};
      let cleanedContent = cellContent;

      if (match) {
        cleanedContent = cellContent.replace(attrRegex, "").trim();
        const attrString = match[1];
        const parts = attrString.split(/\s+/);
        parts.forEach((part) => {
          const [key, value] = part.split("=");
          if (key && (key === "colspan" || key === "rowspan")) {
            attrs[key] = value || "1";
          }
        });
      }
      return { cleanedContent, attrs };
    };

    // 渲染表头
    if (headerLines.length > 0) {
      html += "<thead>\n";
      headerLines.forEach((line) => {
        html += "<tr>\n";
        getCells(line).forEach((cell) => {
          const { cleanedContent, attrs } = parseAttributes(cell);
          const attrStr = Object.entries(attrs)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join("");
          html += `<th${attrStr}>${mdit.renderInline(cleanedContent)}</th>\n`;
        });
        html += "</tr>\n";
      });
      html += "</thead>\n";
    }

    // 渲染表体
    if (bodyLines.length > 0) {
      html += "<tbody>\n";
      bodyLines.forEach((line) => {
        html += "<tr>\n";
        getCells(line).forEach((cell) => {
          const { cleanedContent, attrs } = parseAttributes(cell);
          const attrStr = Object.entries(attrs)
            .map(([k, v]) => ` ${k}="${v}"`)
            .join("");
          html += `<td${attrStr}>${mdit.renderInline(cleanedContent)}</td>\n`;
        });
        html += "</tr>\n";
      });
      html += "</tbody>\n";
    }

    html += "</table>";
    return html;
  };
};
