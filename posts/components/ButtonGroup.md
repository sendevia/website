---
title: "Button group"
description: "按钮组组件"
categories:
  - 组件
tags:
  - 按钮
date: 2026-03-15T20:00:00+08
---

# 按钮组组件 # ButtonGroup

`ButtonGroup` 是一个用于聚合多个 `MaterialButton` 的容器组件。它支持灵活的布局切换、统一的属性默认值配置以及便捷的配置式生成。

## 核心特性

- **布局自适应**：支持水平（Horizontal）和垂直（Vertical）两种排列方式，自动处理子按钮的圆角过渡。
- **属性继承**：支持在组级别设置默认的尺寸、颜色、图标等，简化重复配置。
- **类型预设**：内置 `download` 和 `normal` 类型，自动匹配 Material 风格的颜色与图标。
- **配置驱动**：通过简单的数组配置即可生成复杂的按钮组合。

## 组件属性 (Props)

| 属性名      | 类型          | 默认值         | 可选值                              | 说明             |
| :---------- | :------------ | :------------- | :---------------------------------- | :--------------- |
| `links`     | `GroupItem[]` | `[]`           | -                                   | 按钮项配置数组   |
| `layout`    | `string`      | `"horizontal"` | `"horizontal"`, `"vertical"`        | 布局方向         |
| `size`      | `string`      | `"s"`          | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"` | 默认按钮尺寸     |
| `color`     | `string`      | -              | -                                   | 默认按钮颜色变体 |
| `icon`      | `string`      | -              | -                                   | 默认按钮图标     |
| `target`    | `string`      | -              | -                                   | 默认链接打开方式 |
| `ariaLabel` | `string`      | -              | -                                   | 容器的无障碍标签 |

## 组件事件 (Emits)

| 事件名   | 回调参数                                         | 说明                       |
| :------- | :----------------------------------------------- | :------------------------- |
| `@click` | `(event: Event, item: GroupItem, index: number)` | 当组内任意按钮被点击时触发 |

## 配置项定义 (GroupItem)

| 属性名      | 类型       | 说明                                                    |
| :---------- | :--------- | :------------------------------------------------------ |
| `label`     | `string`   | 按钮显示的文本内容                                      |
| `link`      | `string`   | (可选) 跳转链接。提供时渲染为 `<a>`                     |
| `type`      | `string`   | (可选) 预设类型：`download` (下载), `normal` (通用跳转) |
| `icon`      | `string`   | (可选) 图标名称                                         |
| `color`     | `string`   | (可选) 颜色变体                                         |
| `size`      | `string`   | (可选) 按钮尺寸                                         |
| `target`    | `string`   | (可选) 打开方式                                         |
| `ariaLabel` | `string`   | (可选) 无障碍标签                                       |
| `onClick`   | `Function` | (可选) 独立的点击回调                                   |

## 使用示例

### 1. 混合图标与文本

```vue
<ButtonGroup
  size="m"
  :links="[
    { id: 'prev', icon: 'chevron_left', ariaLabel: '上一页' },
    { id: 'index', label: '1 / 5', color: 'tonal' },
    { id: 'next', icon: 'chevron_right', ariaLabel: '下一页' },
  ]"
/>
```

<ButtonGroup
  size="m"
  :links="[
    { id: 'prev', icon: 'chevron_left', ariaLabel: '上一页' },
    { id: 'index', label: '1 / 5', color: 'tonal' },
    { id: 'next', icon: 'chevron_right', ariaLabel: '下一页' }
  ]"
/>

### 2. 链接跳转

```vue
<ButtonGroup
  target="_blank"
  :links="[
    { label: 'GitHub', link: 'https://github.com', icon: 'code' },
    { label: '首页', link: '/', icon: 'home' },
  ]"
/>
```

<ButtonGroup
  target="_blank"
  :links="[
    { label: 'GitHub', link: 'https://github.com', icon: 'code' },
    { label: '首页', link: '/', icon: 'home' }
  ]"
/>
