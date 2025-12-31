---
title: "Markdown 扩展示例"
description: "本页面展示了 VitePress 提供的一些内置 markdown 扩展功能。"
color: ""
impression: ""
categories:
tags:
date: time

---

# 语法高亮

VitePress 提供由 [Shiki](https://github.com/shikijs/shiki) 驱动的语法高亮功能，并附带行高亮等额外特性：

**输入**

````md
```js{4}
export default {
  data () {
    return {
      msg: '已高亮显示！'
    }
  }
}
```
````

**输出**

```js{4}
export default {
  data () {
    return {
      msg: '已高亮显示！'
    }
  }
}
```

# 自定义容器

**输入**

```md
::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::
```

**输出**

::: info
这是一个信息框。
:::

::: tip
这是一个提示。
:::

::: warning
这是一个警告。
:::

::: danger
这是一个危险警告。
:::

::: details
这是一个详情块。
:::

# 组件使用范例

以下是项目中可用组件的使用示例：

### MaterialButton 组件 (Button.vue)

MaterialButton 组件是一个通用的按钮组件，支持多种样式和功能。

#### 属性列表

| 属性 | 类型 | 默认值 | 可选值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `shape` | `string` | `"round"` | `"round"`, `"square"` | 按钮形状 |
| `size` | `string` | `"s"` | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"` | 按钮尺寸 |
| `color` | `string` | `"filled"` | `"elevated"`, `"filled"`, `"tonal"`, `"outlined"`, `"standard"`, `"text"` | 按钮颜色样式 |
| `icon` | `string` | - | Material Icons 名称 | 按钮图标 |
| `href` | `string` | - | 任意URL | 如果提供，按钮将渲染为链接 |
| `target` | `string` | `"_blank"` | `"_blank"`, `"_self"`, `"_parent"`, `"_top"` | 链接打开方式 |

#### 使用示例

```vue
<!-- 基础按钮 -->
<MaterialButton>点击我</MaterialButton>

<!-- 带图标按钮 -->
<MaterialButton icon="favorite">收藏</MaterialButton>

<!-- 链接按钮 -->
<MaterialButton href="https://example.com" target="_blank">访问网站</MaterialButton>

<!-- 不同尺寸 -->
<MaterialButton size="xs">超小按钮</MaterialButton>
<MaterialButton size="l">大按钮</MaterialButton>

<!-- 不同形状 -->
<MaterialButton shape="square">方形按钮</MaterialButton>

<!-- 不同颜色样式 -->
<MaterialButton color="outlined">轮廓按钮</MaterialButton>
<MaterialButton color="tonal">强调按钮</MaterialButton>
<MaterialButton color="elevated">提升按钮</MaterialButton>
<MaterialButton color="text">文本按钮</MaterialButton>
```

### Card 组件 (Card.vue)

Card 组件用于展示内容卡片，支持多种变体和样式。

#### 属性列表

| 属性 | 类型 | 默认值 | 可选值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `variant` | `string` | `"feed"` | `"feed"` | 卡片变体 |
| `size` | `string` | `"m"` | `"s"`, `"m"`, `"l"` | 卡片尺寸 |
| `color` | `string` | `"filled"` | `"elevated"`, `"filled"`, `"outlined"` | 卡片颜色样式 |
| `title` | `string` | - | 任意字符串 | 卡片标题 |
| `description` | `string` | - | 任意字符串 | 卡片描述 |
| `date` | `string` | - | 日期字符串 | 发布日期 |
| `tags` | `string[]` | - | 字符串数组 | 标签列表 |
| `category` | `string[]` | - | 字符串数组 | 分类列表 |
| `impression` | `string[]` | `[]` | 图片URL数组 | 印象图片 |
| `href` | `string` | - | 任意URL | 卡片链接 |
| `downloadable` | `boolean` | `false` | `true`, `false` | 是否可下载 |

#### 使用示例

```vue
<!-- 基础卡片 -->
<Card 
  title="文章标题"
  description="这是一段文章描述，简要介绍文章内容。"
  date="2023-10-01"
/>
```

```vue
<!-- 带图片卡片 -->
<Card 
  title="项目展示"
  description="展示一个有趣的项目"
  impression="['/assets/images/project1.jpg', '/assets/images/project2.jpg']"
  href="/projects/example"
/>
```

```vue
<!-- 可下载资源卡片 -->
<Card 
  title="资源下载"
  description="包含可下载的文件资源"
  downloadable
  tags="['资源', '下载']"
  category="['教程']"
/>
```

```vue
<!-- 不同样式卡片 -->
<Card 
  title="轮廓样式"
  description="使用轮廓样式的卡片"
  color="outlined"
/>
```

### ButtonGroup 组件 (ButtonGroup.vue)

ButtonGroup 组件用于将多个按钮组合在一起，支持水平和垂直布局。

#### 属性列表

| 属性 | 类型 | 默认值 | 可选值 | 描述 |
| ---- | ---- | ---- | ---- | ---- |
| `links` | `ExternalLink[]` | `[]` | 链接对象数组 | 按钮链接列表 |
| `size` | `string` | `"s"` | `"xs"`, `"s"`, `"m"`, `"l"`, `"xl"` | 按钮尺寸 |
| `layout` | `string` | `"horizontal"` | `"horizontal"`, `"vertical"` | 布局方向 |

#### ExternalLink 类型

```typescript
interface ExternalLink {
  type: string;    // 链接类型：'download' 或 'normal'
  label: string;   // 按钮标签文本
  link: string;    // 链接地址
}
```

#### 使用示例

```vue
<!-- 水平按钮组 -->
<ButtonGroup
  :links="[
    { type: 'normal', label: '查看文档', link: '/docs' },
    { type: 'download', label: '下载资源', link: '/downloads/file.zip' },
    { type: 'normal', label: 'GitHub', link: 'https://github.com/example' }
  ]"
  size="m"
  layout="horizontal"
/>

<!-- 垂直按钮组 -->
<ButtonGroup
  :links="[
    { type: 'normal', label: '选项一', link: '/option1' },
    { type: 'normal', label: '选项二', link: '/option2' },
    { type: 'normal', label: '选项三', link: '/option3' }
  ]"
  size="s"
  layout="vertical"
/>

<!-- 不同尺寸按钮组 -->
<ButtonGroup
  :links="[
    { type: 'download', label: '小尺寸下载', link: '/download' }
  ]"
  size="xs"
/>

<ButtonGroup
  :links="[
    { type: 'normal', label: '大尺寸按钮', link: '/large' }
  ]"
  size="xl"
/>
```

# 更多信息

查看 [完整 markdown 扩展列表](https://vitepress.dev/guide/markdown) 的文档。
