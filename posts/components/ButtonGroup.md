---
title: "Button group"
description: "按钮组组件是一个用于聚合多个 MaterialButton 的容器组件。"
categories:
  - 组件
tags:
  - 按钮
date: 2026-03-15T20:00:00+08
---

<script setup>
import { ref } from "vue";
const align = ref("center");
</script>

# 按钮组组件 `ButtonGroup`

聚合多个 `Button` 形成功能单元，支持单选 / 多选 / 必选状态管理，两种布局变种，以及数组驱动配置。

# 展示

<div style="display:flex;flex-direction:column;gap:16px;align-items:center;padding:24px 0">
  <ButtonGroup variant="standard" selectionMode="single" :modelValue="'b'" :buttons="[
    { value: 'a', label: '全部', icon: 'apps' },
    { value: 'b', label: '图片', icon: 'images' },
    { value: 'c', label: '视频', icon: 'movie' },
  ]" />
  <ButtonGroup variant="connected" color="outlined" :buttons="[
    { value: 'left',   icon: 'format_align_left' },
    { value: 'center', icon: 'format_align_center' },
    { value: 'right',  icon: 'format_align_right' },
  ]" selectionMode="required" :modelValue="'center'" />
</div>

# 组件属性

| Prop            | 类型                                                  | 默认值       | 说明                                                                      |
| --------------- | ----------------------------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `variant`       | `"standard""connected"`                               | `"standard"` | 布局变种                                                                  |
| `selectionMode` | `"single""multi""required"`                           | —            | 选择模式，不传则无选中行为                                                |
| `modelValue`    | `string string[]`                                     | —            | 受控选中值（`v-model`），single 下为 string，multi/required 下为 string[] |
| `buttons`       | `ButtonConfig[]`                                      | —            | 数组驱动配置，不传则使用默认插槽                                          |
| `buttonVariant` | `"button""chip"`                                      | —            | 组内按钮默认变体                                                          |
| `size`          | `"xs""s""m""l""xl"`                                   | —            | 组内按钮默认尺寸                                                          |
| `color`         | `"elevated""filled""tonal""outlined""standard""text"` | —            | 组内按钮默认颜色                                                          |
| `shape`         | `"round""square"`                                     | —            | 组内按钮默认形状                                                          |

# 组件事件

| 事件                | 参数              | 说明                                       |
| ------------------- | ----------------- | ------------------------------------------ |
| `update:modelValue` | `string string[]` | 选中值变更，配合 `v-model` 使用            |
| `change`            | `string`          | 任意按钮被切换时触发，携带该按钮的 `value` |

# 配置项定义

`ButtonConfig` 类型（用于 `buttons` prop 数组中的每一项）：

| 字段       | 类型            | 说明                                 |
| ---------- | --------------- | ------------------------------------ |
| `value`    | `string`        | **必填**，唯一标识，用于选中状态追踪 |
| `label`    | `string`        | 按钮文字                             |
| `icon`     | `string`        | Material Symbols 图标名              |
| `size`     | `ButtonSize`    | 覆盖组级尺寸                         |
| `color`    | `ButtonColor`   | 覆盖组级颜色                         |
| `shape`    | `ButtonShape`   | 覆盖组级形状                         |
| `variant`  | `ButtonVariant` | 覆盖组级变体                         |
| `disabled` | `boolean`       | 是否禁用                             |
| `href`     | `string`        | 链接地址                             |
| `target`   | `string`        | 链接打开方式                         |

# 使用示例

**数组配置 + 单选（standard）**

```vue
<ButtonGroup
  variant="standard"
  selectionMode="single"
  v-model="activeTab"
  :buttons="[
    { value: 'all', label: '全部', icon: 'apps' },
    { value: 'image', label: '图片', icon: 'image' },
    { value: 'video', label: '视频', icon: 'movie' },
  ]"
/>
```

<ButtonGroup
  variant="standard"
  selectionMode="single"
  v-model="activeTab"
  :buttons="[
    { value: 'all', label: '全部', icon: 'apps' },
    { value: 'image', label: '图片', icon: 'image' },
    { value: 'video', label: '视频', icon: 'movie' },
  ]"
/>

**连体多选（connected）**

```vue
<ButtonGroup
  variant="connected"
  selectionMode="multi"
  color="outlined"
  v-model="formats"
  :buttons="[
    { value: 'bold', icon: 'format_bold' },
    { value: 'italic', icon: 'format_italic' },
    { value: 'under', icon: 'format_underlined' },
  ]"
/>
```

<ButtonGroup
  variant="connected"
  selectionMode="multi"
  color="outlined"
  v-model="formats"
  :buttons="[
    { value: 'bold', icon: 'format_bold' },
    { value: 'italic', icon: 'format_italic' },
    { value: 'under', icon: 'format_underlined' },
  ]"
/>

**插槽 + 必选（required）**

```vue
<script setup>
const align = ref("center");
</script>

<template>
  <ButtonGroup variant="connected" selectionMode="required" color="tonal" v-model="align">
    <Button data-group-value="left" icon="format_align_left" />
    <Button data-group-value="center" icon="format_align_center" />
    <Button data-group-value="right" icon="format_align_right" />
  </ButtonGroup>
</template>
```

<ButtonGroup variant="connected" selectionMode="required" color="tonal" v-model="align">
  <Button data-group-value="left" icon="format_align_left" />
  <Button data-group-value="center" icon="format_align_center" />
  <Button data-group-value="right" icon="format_align_right" />
</ButtonGroup>

**覆盖单个按钮样式**

```vue
<ButtonGroup
  color="tonal"
  size="s"
  :buttons="[
    { value: 'a', label: '默认色' },
    { value: 'b', label: '强调色', color: 'filled' },
    { value: 'c', label: '危险', color: 'outlined' },
  ]"
/>
```

<ButtonGroup
  color="tonal"
  size="s"
  :buttons="[
    { value: 'a', label: '默认色' },
    { value: 'b', label: '强调色', color: 'filled' },
    { value: 'c', label: '危险', color: 'outlined' },
  ]"
/>
