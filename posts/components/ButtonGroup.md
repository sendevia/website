---
title: "Button group"
description: "按钮组组件"
color: "#42b883"
categories:
  - 组件
tags:
  - 按钮
date: 2026-02-25T21:20:00+08
---

# ButtonGroup 按钮组组件

`ButtonGroup` 是一个用于聚合多个 `MaterialButton` 的容器组件。它支持灵活的布局切换、统一的属性默认值配置以及全局事件委托监听。

## 核心特性

- **布局自适应**：支持水平（Horizontal）和垂直（Vertical）两种排列方式。
- **属性继承与覆盖**：可以在组级别设置默认的尺寸、颜色、图标等，也可以在具体的按钮项中进行个性化覆盖。
- **智能类型识别**：内置了对 `download` 和 `normal` 类型的样式及图标自动匹配逻辑。
- **事件委托**：支持统一监听 `@click` 事件，便捷获取点击的项信息及索引。

## 组件属性 (Props)

| 属性名      | 类型             | 默认值         | 可选值                              | 说明             |
| :---------- | :--------------- | :------------- | :---------------------------------- | :--------------- |
| `links`     | `ExternalLink[]` | `[]`           | -                                   | 按钮配置数组     |
| `layout`    | `string`         | `"horizontal"` | `"horizontal"`, `"vertical"`        | 布局方向         |
| `size`      | `string`         | `"s"`          | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"` | 默认按钮尺寸     |
| `color`     | `string`         | -              | -                                   | 默认按钮颜色样式 |
| `icon`      | `string`         | -              | -                                   | 默认按钮图标     |
| `target`    | `string`         | -              | -                                   | 默认链接打开方式 |
| `ariaLabel` | `string`         | -              | -                                   | 组的无障碍标签   |

## 组件事件 (Emits)

| 事件名   | 回调参数                                            | 说明                       |
| :------- | :-------------------------------------------------- | :------------------------- |
| `@click` | `(event: Event, item: ExternalLink, index: number)` | 当组内任意按钮被点击时触发 |

## 按钮配置项 (ExternalLink)

每一项 `links` 中的对象支持以下配置：

| 属性名      | 类型       | 说明                                                    |
| :---------- | :--------- | :------------------------------------------------------ |
| `label`     | `string`   | 按钮显示的文本内容                                      |
| `id`        | `string`   | (可选) 自定义标识符，方便在事件处理中识别               |
| `link`      | `string`   | (可选) 点击跳转的链接地址                               |
| `type`      | `string`   | (可选) 预设类型：`download` (充满色), `normal` (色调色) |
| `icon`      | `string`   | (可选) 覆盖组设置的图标                                 |
| `color`     | `string`   | (可选) 覆盖组设置的颜色                                 |
| `size`      | `string`   | (可选) 覆盖组设置的尺寸                                 |
| `target`    | `string`   | (可选) 覆盖组设置的打开方式                             |
| `ariaLabel` | `string`   | (可选) 按钮的无障碍标签                                 |
| `onClick`   | `Function` | (可选) 单体独立的点击回调函数                           |

## 使用示例

### 1. 基础用法 (水平排列)

```vue
<ButtonGroup
  :links="[
    { label: '查看详情', id: 'detail' },
    { label: '下载资源', id: 'download', type: 'download' },
  ]"
  @click="(e, item) => console.log('点击了:', item.id)"
/>
```

<ButtonGroup
:links="[
{ label: '查看详情', id: 'detail' },
{ label: '下载资源', id: 'download', type: 'download' }
]"
@click="(e, item) => console.log('点击了:', item.id)"
/>

### 2. 垂直排列与尺寸控制

```vue
<ButtonGroup
  layout="vertical"
  size="l"
  :links="[
    { label: '选项一', icon: 'settings' },
    { label: '选项二', icon: 'person' },
  ]"
/>
```

<ButtonGroup
  layout="vertical"
  size="l"
  :links="[
    { label: '选项一', icon: 'settings' },
    { label: '选项二', icon: 'person' }
  ]"
/>

### 3. 混合图标与文本

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

### 4. 链接跳转

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
