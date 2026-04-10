---
title: "Chip"
description: "标签按钮组件"
categories:
  - 组件
tags:
  - 按钮
date: 2026-04-11T01:11:46+08:00
---

# 标签按钮组件 MaterialButton - Chip

- **4种变体**：`assist`, `filter`, `input` 和 `suggestion`
- **内置交互反馈**：提供 Material 风格的状态反馈。

::: center
<MaterialButton pattern="chip" variant="assist">Assist</MaterialButton>
<MaterialButton pattern="chip" variant="filter">Filter</MaterialButton>
<MaterialButton pattern="chip" variant="input">Input</MaterialButton>
<MaterialButton pattern="chip" variant="suggestion">Suggestion</MaterialButton>
:::

## 组件属性

| 属性名    | 类型                  | 默认值                 | 可选值                                                        | 说明                         |
| :-------- | :-------------------- | :--------------------- | :------------------------------------------------------------ | :--------------------------- |
| `pattern` | `string` { rowspan=4} | `"chip"` { colspan=2 } |                                                               | 按钮形态（不可省略）         |
| `variant` |                       | `"assist"`             | `"assist"`, `"filter"`, `"input"`, `"suggestion"`             | 按钮变体类型                 |
| `icon`    |                       | -                      | -                                                             | 图标名称（Material Symbols） |
| `state`   |                       | `"none"`               | `"hover"`, `"focus"`, `"focus-visible"`, `"active"`, `"none"` | 交互状态                     |
| `disable` | `boolean`             | `false`                | `true`, `false`                                               | 是否禁用                     |

## 样式全览

| 变体         | 示例 { colspan=2 }                                                              |                                                                       |
| :----------- | :------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `assist`     | <MaterialButton pattern="chip" variant="assist">Assist</MaterialButton>         | <MaterialButton pattern="chip" icon="add">Assist</MaterialButton>     |
| `filter`     | <MaterialButton pattern="chip" variant="filter">Filter</MaterialButton>         | <MaterialButton pattern="chip" icon="add">Filter</MaterialButton>     |
| `input`      | <MaterialButton pattern="chip" variant="input">Input</MaterialButton>           | <MaterialButton pattern="chip" icon="add">Input</MaterialButton>      |
| `suggestion` | <MaterialButton pattern="chip" variant="suggestion">Suggestion</MaterialButton> | <MaterialButton pattern="chip" icon="add">Suggestion</MaterialButton> |
