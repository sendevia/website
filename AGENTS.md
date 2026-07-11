# AGENTS.md — sendevia 个人网站

## 架构

这是一个基于 **Vitepress 2.0** 并使用自定义主题搭建的个人博客，而非普通的 Vitepress 文档站点。

技术栈：Vue 3 + Vitepress 2 + TypeScript + VueUse + Pinia + SCSS

- **每个变量/函数都需要简短的 TSDoc 注释**
- **确保代码简洁无冗余、运行高效、性能优秀并且命名符合项目规范，同时需要使用 Vue SFC 的特性、约定与风格编写所有组件**
- **内容**：位于 `posts/` 目录下的 Markdown 文章，带有 frontmatter。启用了简洁 URL——`posts/index.md` 会被重写为 `/`
- **静态资源**：`public/`
- **自定义主题**：完全位于 `.vitepress/theme/` 目录中——包含布局、组件、组合式函数、状态管理、样式、工具函数。主题入口：`.vitepress/theme/index.ts`
- **必须优先查 VueUse 是否存在现成模块，禁止再造轮子。** `@vueuse/core` 提供了 200+ 组合式函数，涵盖几乎所有常见场景。在手工实现任何底层功能前，先在 `node_modules/.pnpm/@vueuse+core` 或[官方文档](https://vueuse.org/guide/) 中确认是否存在对应模块
- **状态管理**：Pinia 状态管理模块位于 `.vitepress/theme/stores/`。`posts.data.ts` 是一个 Vitepress 数据加载器，用于读取所有 `posts/**/*.md` 文件的 frontmatter
- **SCSS**：自定义样式位于 `.vitepress/theme/styles/`。Sass 模块在 `types/scss.d.ts` 中声明。SCSS 与 Vue SFC 分离

## 命令

| 命令                     | 用途                                                 |
| ------------------------ | ---------------------------------------------------- |
| `npm run docs:dev`       | 本地开发服务器                                       |
| `npm run docs:build`     | 生产构建 → `.vitepress/dist/`                        |
| `npm run docs:build-cf`  | 使用 `git fetch --unshallow` 构建（用于 Cloudflare） |
| `npm run docs:preview`   | 本地预览生产构建结果                                 |
| `npm run lint`           | Stylelint + ESLint + Prettier 全量检查与自动修复     |
| `npm run lint:style`     | 仅运行 Stylelint 修复 SCSS 属性排序                  |
| `npm run format`         | 自动格式化全部源文件                                 |
| `npm run update-version` | **危险操作**：更新版本、提交、打标签并推送到远程仓库 |

最终阶段必须只运行 `npm run lint` 除错。

## 前端规范

### W3C/无障碍规范

所有 Vue 组件必须遵循 W3C 标准和无障碍最佳实践：

1. **语义化 HTML** — 使用 `<button>`、`<nav>`、`<main>`、`<section>`、`<article>`、`<header>` 等语义元素，避免 `div` 模拟
2. **ARIA 属性** — 正确使用 `aria-label`、`aria-current`、`aria-expanded`、`aria-controls`、`role` 等
3. **表单关联** — `<label>` 必须通过 `for`/`id` 或包裹方式关联 `<input>`
4. **表单验证** — 使用 `aria-invalid`、`aria-describedby` 关联错误提示
5. **键盘导航** — 支持 Tab 键序、`Enter`/`Space` 激活、`Escape` 关闭、`Arrow` 选择
6. **焦点管理** — 模态/弹层需 `focus-trap`，关闭后焦点回退；禁用元素 `tabindex="-1"`
7. **图片** — 装饰性图用 `aria-hidden="true"`，信息图必须有 `alt` 描述
8. **状态反馈** — 加载/进度/错误需 `role="alert"`、`aria-live="polite"`
9. **设备无关** — 不依赖单一交互方式（鼠标/触摸/键盘），`@mouseover` 需配合 `@focus`
10. **缩放适配** — 不使用固定 px 宽度阻止文字缩放，使用 rem/em/% 单位
11. **运动偏好** — 动画需尊重 `prefers-reduced-motion`，使用 `@media` 查询降级

### 命名规范

1. **组件名** — `PascalCase`：`NavRail.vue`、`MaterialButton.vue`
2. **组件 Props/Emits** — `camelCase`：`modelValue`、`fabLabel`、`hoverEnabled`
3. **响应式变量** (`ref`/`computed`/`reactive`/`useStorage`) — `camelCase`：`activeSection`、`isAnimating`、`defaultPalette`
4. **纯常量** (编译期确定, `const` + 字面量/冻结对象) — `UPPER_CASE`：`NAV_ITEMS`、`CHARACTERS`、`CACHE_MAX`
5. **函数** — `camelCase`：`updateTheme()`、`handleClick()`
6. **模板引用** (`ref` 模板变量) — `camelCase`：`labelFabEl`、`inputEl`
7. **HTML class (SCSS 嵌套)** — 根 class 使用组件名的 `PascalCase`，子元素使用简短描述性 `kebab-case`，通过 SCSS 嵌套表示层级：
   - 根：`class="OverviewPage"`、`class="MainLayout"`
   - 子：`class="topbar"`、`class="hero"`、`class="card-header"`
   - 不使用 BEM 双下划线（`card__header`），不写冗余的完整前缀。
8. **CSS 自定义属性** — `--kebab-case`：`--label-width`、`--md-sys-color-primary`
9. **SCSS Mixin** — `kebab-case`：`@include typescale-style`、`@include focus-ring`
10. **类型/接口** — `PascalCase`：`NavItem`、`ExtractResult`、`ButtonState`
11. **文件/目录** — `kebab-case`：`colorPalette.ts`、`overview-page.vue`（组件名除外）

## SCSS 设计令牌规范

编写样式时**必须优先使用 `.vitepress/theme/styles/Tokens.scss` 设计令牌与 `.vitepress/theme/styles/Mixin.scss` Mixin**，禁止硬编码等价数值：

- **圆角** — 使用 `var(--md-sys-shape-corner-*)` 令牌
- **颜色** — 使用 `var(--md-sys-color-*)` 语义色令牌
- **排版** — 引用 `mixin` 并使用 `@include Mixin.typescale-style("body-large")`，设置 `font-*`、`letter-spacing`、`line-height`；禁止手动写字号行高
- **动效** — 使用 `var(--md-sys-motion-*)` 令牌
- **文件头部** — 若使用了 `Mixin`，在文件顶部加 `@use "../Mixin";`（路径根据文件位置调整）
- **属性排序自动化** — 项目使用 Stylelint + stylelint-order 自动排序 CSS 属性，规则见 `.stylelintrc.json`。运行 `npm run lint` 或 `npm run lint:style` 即可自动修复。

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
