---
title: "关于 Jekylmt"
description: "一个简洁美观的 Jekyll 主题"
color: "#0084ff"
impression: "/assets/images/131559307_p0.webp"
categories:
  - 博客主题
tags:
  - readme
date: 2026-02-25T21:44:00+08
external_links:
  - type: download
    icon: rocket_launch
    label: 使用主题模板
    link: https://github.com/new?template_name=jekylmt&template_owner=sendevia
  - type: normal
    icon: code
    label: Github 仓库
    link: https://github.com/sendevia/jekylmt
  - type: normal
    icon: arrow_outward
    label: 在线 Demo
    link: https://jekylmt.sendevia.top
---

# 关于主题

不太擅长介绍，既然这个页面存在了，就简单写一下吧。 这是一个遵循 Material3 设计，并且使用了 Material Web 项目，轻量化的 Jekyll 主题。

由于 M3 的设计太好看了，一直想亲自动手设计一款使用这种设计的前端项目，作为练手，这个主题便诞生了。

我借助 Material Foundation 的 [material-color-utilities](https://github.com/material-foundation/material-color-utilities) 实现了 monet 取色。

你可以在每篇文章的头信息 `impression` 配置中指定头图，并通过 `color` 配置指定颜色来让主题生成调色板。

这个主题的参考来源主要是 [material.io](https://material.io) 官网，其次是 Google 提供的设计规范。

代码高亮支持的语言可以在 [rouge-ruby](https://rouge-ruby.github.io/docs/file.Languages.html) 的网站上找到。

# 主题截图

![桌面端第一张亮色截图](/assets/images/26/jekylmt_1.webp#light)
![桌面端第一张暗色截图](/assets/images/26/jekylmt_2.webp#dark)
![桌面端第二张亮色截图](/assets/images/26/jekylmt_3.webp#light)
![桌面端第二张暗色截图](/assets/images/26/jekylmt_4.webp#dark)
![移动端第一张亮色截图](/assets/images/26/jekylmt_5.webp#light)
![移动端第一张暗色截图](/assets/images/26/jekylmt_6.webp#dark)
![移动端第二张亮色截图](/assets/images/26/jekylmt_7.webp#light)
![移动端第二张暗色截图](/assets/images/26/jekylmt_8.webp#dark)

# 主要功能

1. Material 3 风格；
2. 支持根据提供的 HEX 颜色动态生成调色板并应用颜色主题；
3. 支持多种 Material 3 样式的组件；
4. 响应式布局。

# 头信息

下面是所有头信息的详解：

| name { colspan=2 }         |               | description      | type                  | default                                   |
| -------------------------- | ------------- | ---------------- | --------------------- | ----------------------------------------- |
| 文章相关 { rowspan=9 }     | title         | 文章标题         | text { rowspan=5 }    | 使用 `_config.yml` 中的配置 { rowspan=5 } |
|                            | description   | 文章简介         |                       |                                           |
|                            | author        | 文章作者         |                       |                                           |
|                            | color         | 文章主题颜色     |                       |                                           |
|                            | impression    | 文章头图         |                       |                                           |
|                            | categories    | 目录分类         | list { rowspan=2 }    | 未定义 { rowspan=2 }                      |
|                            | tags          | 文章标签         |                       |                                           |
|                            | published     | 是否发布文章     | boolean { rowspan=2 } | true { rowspan=2 }                        |
|                            | toc           | 是否生成文章目录 |                       |                                           |
| 页面导航相关 { rowspan=3 } | segment_icon  | 导航栏中的图标   | text { rowspan=2 }    | - { rowspan=3 }                           |
|                            | segment_title | 导航栏中的标题   |                       |                                           |
|                            | navigation    | 是否在导航中显示 | boolean               |                                           |
