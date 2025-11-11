---
title: "Markdown Extension Examples"
description: "This page demonstrates some of the built-in markdown extensions provided by VitePress."
color: ""
impression: ""
categories:
tags:
date: 2007-08-31T00:00:00Z

---

# Markdown Extension Examples

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## Syntax Highlighting

VitePress provides Syntax Highlighting powered by [Shiki](https://github.com/shikijs/shiki), with additional features like line-highlighting:

**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## Material Buttons

MaterialButton 组件是一个遵循 Material Design 3 规范的按钮组件，支持多种样式和功能。

### 属性列表

| 属性 | 类型 | 默认值 | 可选值 | 描述 |
|------|------|--------|--------|------|
| `text` | `string` | - | 任意字符串 | 按钮显示的文本内容 |
| `href` | `string` | - | 任意URL | 如果提供，按钮将渲染为链接 |
| `icon` | `string` | - | Material Icons 名称 | 按钮左侧的图标 |
| `size` | `string` | `"s"` | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"` | 按钮尺寸 |
| `shape` | `string` | `"round"` | `"round"`, `"square"` | 按钮形状 |
| `color` | `string` | `"filled"` | `"elevated"`, `"filled"`, `"tonal"`, `"outlined"`, `"standard"`, `"text"` | 按钮颜色样式 |
| `target` | `string` | `"_blank"` | `"_blank"`, `"_self"`, `"_parent"`, `"_top"` | 链接打开方式 |

### 尺寸规格

| 尺寸 | 高度 | 内边距 | 字体大小 | 图标大小 |
|------|------|--------|----------|----------|
| `xs` | 32px | 12px | label-large | 20px |
| `s` | 40px | 16px | label-large | 20px |
| `m` | 56px | 24px | title-medium | 24px |
| `l` | 96px | 48px | headline-small | 32px |
| `xl` | 136px | 64px | headline-large | 40px |

### 使用示例

**Input**

```md
<!-- 基础按钮 -->
<MaterialButton text="默认按钮" />

<!-- 带图标按钮 -->
<MaterialButton text="带图标按钮" icon="favorite" />

<!-- 链接按钮 -->
<MaterialButton text="链接按钮" href="https://example.com" />

<!-- 不同尺寸 -->
<MaterialButton text="大号按钮" size="l" />
<MaterialButton text="小号按钮" size="xs" />

<!-- 不同形状 -->
<MaterialButton text="方形按钮" shape="square" />

<!-- 不同颜色样式 -->
<MaterialButton text="轮廓按钮" color="outlined" />
<MaterialButton text="强调按钮" color="tonal" />
<MaterialButton text="提升按钮" color="elevated" />
<MaterialButton text="文本按钮" color="text" />

<!-- 组合使用 -->
<MaterialButton text="带图标链接" href="/" icon="home" target="_self" />
```

**Output**

<!-- 基础按钮 -->
<MaterialButton text="默认按钮" />

<!-- 带图标按钮 -->
<MaterialButton text="带图标按钮" icon="favorite" />

<!-- 链接按钮 -->
<MaterialButton text="链接按钮" href="https://example.com" />

<!-- 不同尺寸 -->
<MaterialButton text="大号按钮" size="l" />
<MaterialButton text="小号按钮" size="xs" />

<!-- 不同形状 -->
<MaterialButton text="方形按钮" shape="square" />

<!-- 不同颜色样式 -->
<MaterialButton text="轮廓按钮" color="outlined" />
<MaterialButton text="强调按钮" color="tonal" />
<MaterialButton text="提升按钮" color="elevated" />
<MaterialButton text="文本按钮" color="text" />

<!-- 组合使用 -->
<MaterialButton text="带图标链接" href="/" icon="home" target="_self" />

## More

Check out the documentation for the [full list of markdown extensions](https://vitepress.dev/guide/markdown).
