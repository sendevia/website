# AGENTS.md — sendevia 网站

## 架构

这是一个基于 **Vitepress 2.0** 并使用自定义主题搭建的个人博客，而非普通的 Vitepress 文档站点。

- **内容**：位于 `posts/` 目录下的 Markdown 文章，带有 frontmatter。启用了简洁 URL——`posts/index.md` 会被重写为 `/`。
- **自定义主题**：完全位于 `.vitepress/theme/` 目录中——包含布局、组件、组合式函数、状态管理、样式、工具函数。主题入口：`.vitepress/theme/index.ts`。
- **状态管理**：Pinia 状态管理模块位于 `.vitepress/theme/stores/`。`posts.data.ts` 是一个 Vitepress 数据加载器，用于读取所有 `posts/**/*.md` 文件的 frontmatter。
- **SCSS**：自定义样式位于 `.vitepress/theme/styles/`。Sass 模块在 `types/scss.d.ts` 中声明。SCSS 与 Vue SFC 分离。
- **静态资源**：`public/`（构建时直接复制到输出目录）。

## 命令

| 命令                     | 用途                                                 |
| ------------------------ | ---------------------------------------------------- |
| `npm run docs:dev`       | 本地开发服务器                                       |
| `npm run docs:build`     | 生产构建 → `.vitepress/dist/`                        |
| `npm run docs:build-cf`  | 使用 `git fetch --unshallow` 构建（用于 Cloudflare） |
| `npm run docs:preview`   | 本地预览生产构建结果                                 |
| `npm run update-version` | **危险操作**：更新版本、提交、打标签并推送到远程仓库 |
| `npm run lint`           | ESLint 代码检查                                      |
| `npm run typecheck`      | vue-tsc 类型检查（不输出文件）                       |

建议顺序：先 `lint`，再 `typecheck`。两个命令都无自动修复功能，需手动修复。

## 草稿文章

草稿通过 frontmatter 中的 `draft: true` 控制。`posts.data.ts` 中的数据加载器仅在开发模式（`NODE_ENV === "development"`）下显示草稿。生产构建时会隐藏它们。

## 版本管理

版本格式为 `YY.M.Commits`（例如 `26.4.405`）。`update-version` 脚本执行以下操作：

1. 统计当前提交数量，加 1
2. 替换 `package.json` 中的 `version` 字段
3. 提交、打标签并推送到 `origin/master`

Docker CI 工作流从 `package.json` 中读取版本作为镜像标签。

## Docker 与 CI

- **Dockerfile**：两阶段构建——Node 构建阶段克隆仓库、安装依赖、运行 `docs:build`；最终镜像使用 Caddy 提供 dist 服务。
- **docker-build.yml**：构建并推送多架构（amd64、arm64）镜像到 Docker Hub 和 GHCR。仅在 `master` 分支上推送并修改了 `package.json`、`Dockerfile` 或工作流本身时触发。
- **opencode.yml**：响应 issues/PR 中的 `/oc` 或 `/opencode` 注释。请勿随意修改。

## 规范

- 使用 Vue 3 + TypeScript + SCSS + VueUse + Pinia。优先使用 VueUse 实现功能。
- Vue 文件：**仅包含 TypeScript 和模板**。SCSS 放入 `.vitepress/theme/styles/`。
- 组件使用 PascalCase；函数/常量/变量使用 camelCase；HTML class/id 使用 kebab-case。
- 每个变量/函数都需要简短的 JSDoc 注释。
- `components/` 中的组件应具备可扩展性。
- 代码应精简，无重复实现。
- 回复和文档使用 **中文**。
