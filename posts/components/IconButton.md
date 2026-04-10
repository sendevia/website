---
title: "Icon Button"
description: "图标按钮组件"
categories:
  - 组件
tags:
  - 按钮
date: 2026-04-11T00:25:31+08:00
---

# 图标按钮组件 MaterialButton - Icon Button

- **2种变体**：`default` 和 `toggle`
- **5个大小**：`xs`, `s`, `m`, `l`, 还有 `xl`
- **2种形状**：`round` 和 `square`
- **4种颜色**：`filled`, `tonal`, `outlined`, 还有 `text`
- **3种宽度**：`normal`, `narrow` 和 `wide`
- **智能渲染**：根据是否提供 `href` 属性，自动切换渲染为 `<a>` 或 `<button>` 标签。
- **自动属性透传**：可以像使用原生 `<a>` 或 `<button>` 标签一样传递属性和监听事件。
- **内置交互反馈**：提供 Material 风格的状态反馈。

::: center
<MaterialButton pattern="icon-button" size="m" color="filled">add</MaterialButton>
<MaterialButton pattern="icon-button" size="m" color="tonal">add</MaterialButton>
<MaterialButton pattern="icon-button" size="m" color="outlined">add</MaterialButton>
<MaterialButton pattern="icon-button" size="m" color="text">add</MaterialButton>
:::

## 组件属性

| 属性名    | 类型                  | 默认值                        | 可选值                                                        | 说明                 |
| :-------- | :-------------------- | :---------------------------- | :------------------------------------------------------------ | :------------------- |
| `pattern` | `string` { rowspan=9} | `"icon-button"` { colspan=2 } |                                                               | 按钮形态（不可省略） |
| `variant` |                       | `"default"`                   | `"default"`, `"toggle"`                                       | 按钮变体类型         |
| `size`    |                       | `"s"`                         | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"`                           | 按钮大小             |
| `shape`   |                       | `"round"`                     | `"round"`, `"square"`                                         | 按钮形状             |
| `color`   |                       | `"filled"`                    | `"elevated"`, `"filled"`, `"tonal"`, `"outlined"`, `"text"`   | 按钮颜色             |
| `width`   |                       | `"normal"`                    | `"normal"`, `"narrow"`, `"wide"`                              | 按钮宽度             |
| `href`    |                       | -                             | -                                                             | 链接地址             |
| `target`  |                       | -                             | -                                                             | 链接打开方式         |
| `state`   |                       | `"none"`                      | `"hover"`, `"focus"`, `"focus-visible"`, `"active"`, `"none"` | 交互状态             |
| `disable` | `boolean`             | `false`                       | `true`, `false`                                               | 是否禁用             |

组件示例

```vue
<MaterialButton pattern="icon-button" variant="" size="" shape="" color="" width="" href="" target="" state="" :disabled="">ICON_NAME</MaterialButton>
```

## 样式全览

#### 按钮形状: round

| 颜色       | XS                                                                                                  | S                                                                                                  | M                                                                                                  | L                                                                                                  | XL                                                                                                  |
| :--------- | :-------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `filled`   | <MaterialButton pattern="icon-button" size="xs" shape="round" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="s" shape="round" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="m" shape="round" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="l" shape="round" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="xl" shape="round" color="filled">add</MaterialButton>   |
| `tonal`    | <MaterialButton pattern="icon-button" size="xs" shape="round" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="s" shape="round" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="m" shape="round" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="l" shape="round" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="xl" shape="round" color="tonal">add</MaterialButton>    |
| `outlined` | <MaterialButton pattern="icon-button" size="xs" shape="round" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="s" shape="round" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="m" shape="round" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="l" shape="round" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="xl" shape="round" color="outlined">add</MaterialButton> |
| `text`     | <MaterialButton pattern="icon-button" size="xs" shape="round" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="s" shape="round" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="m" shape="round" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="l" shape="round" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="xl" shape="round" color="text">add</MaterialButton>     |

#### 按钮形状: square

| 颜色       | XS                                                                                                   | S                                                                                                   | M                                                                                                   | L                                                                                                   | XL                                                                                                   |
| :--------- | :--------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `filled`   | <MaterialButton pattern="icon-button" size="xs" shape="square" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="s" shape="square" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="m" shape="square" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="l" shape="square" color="filled">add</MaterialButton>   | <MaterialButton pattern="icon-button" size="xl" shape="square" color="filled">add</MaterialButton>   |
| `tonal`    | <MaterialButton pattern="icon-button" size="xs" shape="square" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="s" shape="square" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="m" shape="square" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="l" shape="square" color="tonal">add</MaterialButton>    | <MaterialButton pattern="icon-button" size="xl" shape="square" color="tonal">add</MaterialButton>    |
| `outlined` | <MaterialButton pattern="icon-button" size="xs" shape="square" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="s" shape="square" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="m" shape="square" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="l" shape="square" color="outlined">add</MaterialButton> | <MaterialButton pattern="icon-button" size="xl" shape="square" color="outlined">add</MaterialButton> |
| `text`     | <MaterialButton pattern="icon-button" size="xs" shape="square" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="s" shape="square" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="m" shape="square" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="l" shape="square" color="text">add</MaterialButton>     | <MaterialButton pattern="icon-button" size="xl" shape="square" color="text">add</MaterialButton>     |
