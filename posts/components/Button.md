---
title: "Button"
description: "基础按钮组件"
categories:
  - 组件
tags:
  - 按钮
date: 2026-03-15T19:33:00+08
draft: true
---

# 按钮组件 - MaterialButton

`MaterialButton` 是一个符合 Material Design 3 Expressive 规范的基础交互组件。它支持多种变体、尺寸和形状，并且能够自动透传所有 HTML 属性和事件监听器。

## 核心特性

- **高度可定制**：支持多种变体（Button, Chip）、形状（Round, Square）和颜色主题。
- **自动属性透传**：通过 `v-bind="$attrs"`，可以像使用原生 `button` 或 `a` 标签一样传递属性和监听事件。
- **智能渲染**：根据是否提供 `href` 属性，自动切换渲染为 `<a>` 标签或 `<button>` 标签。
- **内置交互反馈**：集成 `StateLayer`，提供 Material 风格的悬停、聚焦和激活状态反馈。

## 组件属性 (Props)

| 属性名         | 类型     | 默认值                                                  | 可选值                                                                    | 说明                           |
| :------------- | :------- | :------------------------------------------------------ | :------------------------------------------------------------------------ | :----------------------------- |
| `variant`      | `string` | `"button"`                                              | `"button"`, `"chip"`                                                      | 组件变体                       |
| `shape`        | `string` | `"button"`变体默认`"round"`，`"chip"`变体默认`"square"` | `"round"`, `"square"`                                                     | 按钮形状                       |
| `size`         | `string` | `"s"`                                                   | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"`                                       | 按钮尺寸                       |
| `color`        | `string` | `"filled"`                                              | `"elevated"`, `"filled"`, `"tonal"`, `"outlined"`, `"standard"`, `"text"` | 颜色变体                       |
| `icon`         | `string` | -                                                       | -                                                                         | 图标名称（Material Symbols）   |
| `href`         | `string` | -                                                       | -                                                                         | 链接地址（提供时渲染为 `<a>`） |
| `target`       | `string` | `"_blank"`                                              | `"_blank"`, `"_self"`, etc.                                               | 链接打开方式                   |
| `currentState` | `string` | `"none"`                                                | `"hover"`, `"focus"`, `"active"`, `"none"`                                | 手动强制指定状态               |

## 组件事件 (Events)

由于启用了属性透传，组件支持所有原生 HTML 事件。

| 事件名        | 说明                   |
| :------------ | :--------------------- |
| `@click`      | 点击事件               |
| `@mouseenter` | 鼠标进入事件           |
| `@mousedown`  | 鼠标按下事件           |
| `...`         | 其他标准鼠标及键盘事件 |

## 使用示例

### 1. 样式与配置全览

下表展示了 `MaterialButton` 在不同属性组合下的视觉表现。

| 变体     | 形状     | 大小 | 颜色       | 图标    | 内容         | 演示                                                                                 |
| :------- | :------- | :--- | :--------- | :------ | :----------- | :----------------------------------------------------------------------------------- |
| `button` | `round`  | `s`  | `filled`   | -       | Filled       | <MaterialButton color="filled" size="s">Filled</MaterialButton>                      |
| `button` | `round`  | `s`  | `tonal`    | -       | Tonal        | <MaterialButton color="tonal" size="s">Tonal</MaterialButton>                        |
| `button` | `round`  | `s`  | `outlined` | -       | Outlined     | <MaterialButton color="outlined" size="s">Outlined</MaterialButton>                  |
| `button` | `round`  | `s`  | `elevated` | -       | Elevated     | <MaterialButton color="elevated" size="s">Elevated</MaterialButton>                  |
| `button` | `round`  | `s`  | `text`     | -       | Text         | <MaterialButton color="text" size="s">Text</MaterialButton>                          |
| `button` | `round`  | `s`  | `filled`   | `home`  | 发送         | <MaterialButton icon="home" color="filled" size="s">发送</MaterialButton>            |
| `button` | `round`  | `s`  | `tonal`    | `build` | -            | <MaterialButton icon="build" color="tonal" size="s" />                               |
| `button` | `round`  | `xs` | `filled`   | -       | Extra Small  | <MaterialButton size="xs" color="filled">Extra Small</MaterialButton>                |
| `button` | `square` | `l`  | `filled`   | -       | Large Square | <MaterialButton size="l" shape="square" color="filled">Large Square</MaterialButton> |
| `button` | `round`  | `xl` | `filled`   | `add`   | Extra Large  | <MaterialButton size="xl" icon="add" color="filled">Extra Large</MaterialButton>     |
| `chip`   | `square` | `s`  | `filled`   | -       | Chip Button  | <MaterialButton variant="chip" color="filled" size="s">Chip Button</MaterialButton>  |

### 4. 手动状态控制

通过 `currentState` 属性，可以强制按钮显示特定的交互状态（如在演示或联动显示时）。

```vue
<MaterialButton currentState="hover">强制悬停状态</MaterialButton>
<MaterialButton currentState="active" color="tonal">强制激活状态</MaterialButton>
```

<div>
  <MaterialButton currentState="hover">强制悬停状态</MaterialButton>
  <MaterialButton currentState="active" color="tonal">强制激活状态</MaterialButton>
</div>

### 5. 事件绑定示例

您可以像使用普通按钮一样绑定事件。

### 6. 链接模式

当提供 `href` 时，组件会渲染为 `<a>` 标签。

```vue
<MaterialButton href="https://google.com" target="_blank" icon="open_in_new">访问 Google</MaterialButton>
```

<MaterialButton href="https://google.com" target="_blank" icon="open_in_new">访问 Google</MaterialButton>
