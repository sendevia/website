---
title: "Button"
description: "基础按钮组件"
categories:
  - 组件
tags:
  - 按钮
date: 2026-04-11T00:13:57+08:00
---

# 基础按钮组件 MaterialButton - Button

- **2种变体**：`default` 和 `toggle`
- **5个大小**：`xs`, `s`, `m`, `l`, 还有 `xl`
- **2种形状**：`round` 和 `square`
- **5种颜色**：`elevated`, `filled`, `tonal`, `outlined`, 还有 `text`
- **智能渲染**：根据是否提供 `href` 属性，自动切换渲染为 `<a>` 或 `<button>` 标签。
- **自动属性透传**：可以像使用原生 `<a>` 或 `<button>` 标签一样传递属性和监听事件。
- **内置交互反馈**：提供 Material 风格的状态反馈。

::: center
<MaterialButton size="m" color="elevated">Elevated</MaterialButton>
<MaterialButton size="m" color="filled">Filled</MaterialButton>
<MaterialButton size="m" color="tonal">Tonal</MaterialButton>
<MaterialButton size="m" color="outlined">Outlined</MaterialButton>
<MaterialButton size="m" color="text">Text</MaterialButton>
:::

## 组件属性

| 属性名    | 类型                  | 默认值                     | 可选值                                                        | 说明                         |
| :-------- | :-------------------- | :------------------------- | :------------------------------------------------------------ | :--------------------------- |
| `pattern` | `string` { rowspan=9} | `"standard"` { colspan=2 } |                                                               | 按钮形态（可省略）           |
| `variant` |                       | `"default"`                | `"default"`, `"toggle"`                                       | 按钮变体类型                 |
| `size`    |                       | `"s"`                      | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"`                           | 按钮大小                     |
| `shape`   |                       | `"round"`                  | `"round"`, `"square"`                                         | 按钮形状                     |
| `color`   |                       | `"filled"`                 | `"elevated"`, `"filled"`, `"tonal"`, `"outlined"`, `"text"`   | 按钮颜色                     |
| `icon`    |                       | -                          | -                                                             | 图标名称（Material Symbols） |
| `href`    |                       | -                          | -                                                             | 链接地址                     |
| `target`  |                       | -                          | -                                                             | 链接打开方式                 |
| `state`   |                       | `"none"`                   | `"hover"`, `"focus"`, `"focus-visible"`, `"active"`, `"none"` | 交互状态                     |
| `disable` | `boolean`             | `false`                    | `true`, `false`                                               | 是否禁用                     |

组件示例

```vue
<MaterialButton variant="" size="" shape="" color="" icon="" href="" target="" state="" :disabled="">TEXT</MaterialButton>
```

## 样式全览

#### 按钮形状: round

| 颜色                     | XS                                                                                            | S                                                                                            | M                                                                                            | L                                                                                            | XL                                                                                            |
| :----------------------- | :-------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `elevated` { rowspan=2 } | <MaterialButton size="xs" shape="round" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="s" shape="round" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="m" shape="round" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="l" shape="round" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="xl" shape="round" color="elevated">Elevated</MaterialButton>            |
|                          | <MaterialButton size="xs" shape="round" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="s" shape="round" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="m" shape="round" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="l" shape="round" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="xl" shape="round" color="elevated" icon="add">Elevated</MaterialButton> |
| `filled` { rowspan=2 }   | <MaterialButton size="xs" shape="round" color="filled">Filled</MaterialButton>                | <MaterialButton size="s" shape="round" color="filled">Filled</MaterialButton>                | <MaterialButton size="m" shape="round" color="filled">Filled</MaterialButton>                | <MaterialButton size="l" shape="round" color="filled">Filled</MaterialButton>                | <MaterialButton size="xl" shape="round" color="filled">Filled</MaterialButton>                |
|                          | <MaterialButton size="xs" shape="round" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="s" shape="round" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="m" shape="round" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="l" shape="round" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="xl" shape="round" color="filled" icon="add">Filled</MaterialButton>     |
| `tonal` { rowspan=2 }    | <MaterialButton size="xs" shape="round" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="s" shape="round" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="m" shape="round" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="l" shape="round" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="xl" shape="round" color="tonal">Tonal</MaterialButton>                  |
|                          | <MaterialButton size="xs" shape="round" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="s" shape="round" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="m" shape="round" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="l" shape="round" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="xl" shape="round" color="tonal" icon="add">Tonal</MaterialButton>       |
| `outlined` { rowspan=2 } | <MaterialButton size="xs" shape="round" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="s" shape="round" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="m" shape="round" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="l" shape="round" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="xl" shape="round" color="outlined">Outlined</MaterialButton>            |
|                          | <MaterialButton size="xs" shape="round" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="s" shape="round" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="m" shape="round" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="l" shape="round" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="xl" shape="round" color="outlined" icon="add">Outlined</MaterialButton> |
| `text` { rowspan=2 }     | <MaterialButton size="xs" shape="round" color="text">Text</MaterialButton>                    | <MaterialButton size="s" shape="round" color="text">Text</MaterialButton>                    | <MaterialButton size="m" shape="round" color="text">Text</MaterialButton>                    | <MaterialButton size="l" shape="round" color="text">Text</MaterialButton>                    | <MaterialButton size="xl" shape="round" color="text">Text</MaterialButton>                    |
|                          | <MaterialButton size="xs" shape="round" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="s" shape="round" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="m" shape="round" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="l" shape="round" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="xl" shape="round" color="text" icon="add">Text</MaterialButton>         |

#### 按钮形状: square

| 颜色                     | XS                                                                                             | S                                                                                             | M                                                                                             | L                                                                                             | XL                                                                                             |
| :----------------------- | :--------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `elevated` { rowspan=2 } | <MaterialButton size="xs" shape="square" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="s" shape="square" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="m" shape="square" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="l" shape="square" color="elevated">Elevated</MaterialButton>            | <MaterialButton size="xl" shape="square" color="elevated">Elevated</MaterialButton>            |
|                          | <MaterialButton size="xs" shape="square" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="s" shape="square" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="m" shape="square" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="l" shape="square" color="elevated" icon="add">Elevated</MaterialButton> | <MaterialButton size="xl" shape="square" color="elevated" icon="add">Elevated</MaterialButton> |
| `filled` { rowspan=2 }   | <MaterialButton size="xs" shape="square" color="filled">Filled</MaterialButton>                | <MaterialButton size="s" shape="square" color="filled">Filled</MaterialButton>                | <MaterialButton size="m" shape="square" color="filled">Filled</MaterialButton>                | <MaterialButton size="l" shape="square" color="filled">Filled</MaterialButton>                | <MaterialButton size="xl" shape="square" color="filled">Filled</MaterialButton>                |
|                          | <MaterialButton size="xs" shape="square" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="s" shape="square" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="m" shape="square" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="l" shape="square" color="filled" icon="add">Filled</MaterialButton>     | <MaterialButton size="xl" shape="square" color="filled" icon="add">Filled</MaterialButton>     |
| `tonal` { rowspan=2 }    | <MaterialButton size="xs" shape="square" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="s" shape="square" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="m" shape="square" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="l" shape="square" color="tonal">Tonal</MaterialButton>                  | <MaterialButton size="xl" shape="square" color="tonal">Tonal</MaterialButton>                  |
|                          | <MaterialButton size="xs" shape="square" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="s" shape="square" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="m" shape="square" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="l" shape="square" color="tonal" icon="add">Tonal</MaterialButton>       | <MaterialButton size="xl" shape="square" color="tonal" icon="add">Tonal</MaterialButton>       |
| `outlined` { rowspan=2 } | <MaterialButton size="xs" shape="square" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="s" shape="square" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="m" shape="square" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="l" shape="square" color="outlined">Outlined</MaterialButton>            | <MaterialButton size="xl" shape="square" color="outlined">Outlined</MaterialButton>            |
|                          | <MaterialButton size="xs" shape="square" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="s" shape="square" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="m" shape="square" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="l" shape="square" color="outlined" icon="add">Outlined</MaterialButton> | <MaterialButton size="xl" shape="square" color="outlined" icon="add">Outlined</MaterialButton> |
| `text` { rowspan=2 }     | <MaterialButton size="xs" shape="square" color="text">Text</MaterialButton>                    | <MaterialButton size="s" shape="square" color="text">Text</MaterialButton>                    | <MaterialButton size="m" shape="square" color="text">Text</MaterialButton>                    | <MaterialButton size="l" shape="square" color="text">Text</MaterialButton>                    | <MaterialButton size="xl" shape="square" color="text">Text</MaterialButton>                    |
|                          | <MaterialButton size="xs" shape="square" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="s" shape="square" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="m" shape="square" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="l" shape="square" color="text" icon="add">Text</MaterialButton>         | <MaterialButton size="xl" shape="square" color="text" icon="add">Text</MaterialButton>         |
