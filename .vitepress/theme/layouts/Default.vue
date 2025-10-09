<script setup lang="ts">
import AllPostsLayout from "./AllPosts.vue";
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";
import SearchPostsLayout from "./SearchPosts.vue";
import Footer from "../components/Footer.vue";
import Sidebar from "../components/Sidebar.vue";
import { argbFromHex } from "@material/material-color-utilities";
import { generateColorPalette } from "../utils/colorPalette";
import { onMounted, nextTick, computed } from "vue";
import { useRoute } from "vitepress";
import { useGlobalData } from "../composables/useGlobalData";

const { site, page, frontmatter, theme } = useGlobalData();

/**
 * 获取图片主色调（取图片左上角像素点的颜色）
 * @param url 图片地址
 * @returns Promise<number | null> 返回 ARGB 颜色值，获取失败返回 null
 */
async function getImageMainColor(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const argb = (255 << 24) | (r << 16) | (g << 8) | b;
      resolve(argb >>> 0);
    };
    img.onerror = () => resolve(null);
  });
}

/**
 * 根据头图动态更新调色板
 */
async function updatePalette() {
  await nextTick();
  const el = document.getElementById("header-impression-image");
  const defaultColor = theme.value.defaultColor;

  if (!el) {
    await generateColorPalette(argbFromHex(defaultColor));
    return;
  }

  const colorAttr = el.getAttribute("impression-color");
  if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
    const argb = argbFromHex(colorAttr);
    await generateColorPalette(argb);
    return;
  }

  const style = window.getComputedStyle(el);
  const bg = style.backgroundImage;
  const match = bg.match(/url\(["']?(.*?)["']?\)/);
  const url = match?.[1] || null;
  let argb: number | null = null;
  if (url) {
    argb = await getImageMainColor(url);
  }
  await generateColorPalette(argb ?? argbFromHex(defaultColor));
}

const layoutMap = {
  article: ArticleLayout,
  posts: AllPostsLayout,
  search: SearchPostsLayout,
} as const;

type LayoutKey = keyof typeof layoutMap;

const currentLayout = computed(() => {
  if (frontmatter.value.home) return null;
  if (page.value.isNotFound) return NotFoundLayout;
  const key = (frontmatter.value.layout ?? "article") as LayoutKey;
  return layoutMap[key] ?? ArticleLayout;
});

const route = useRoute();

onMounted(updatePalette);

function onAfterEnter() {
  updatePalette();
}
</script>

<template>
  <div id="layout">
    <Sidebar />
    <div id="layout-content-flow">
      <Transition name="layout-content" mode="out-in" @after-enter="onAfterEnter">
        <div id="layout-content-filler" :key="route.path">
          <div id="layout-home-title" v-if="frontmatter.home">
            <img src="/assets/images/avatar.webp" alt="avatar" />
            <div>
              <h1>{{ site.title }}</h1>
              <p>{{ site.description }}</p>
            </div>
          </div>
          <component v-else :is="currentLayout" />
        </div>
      </Transition>
      <Footer />
    </div>
  </div>
</template>

<style lang="scss">
@use "sass:meta";
@use "sass:string";
@use "../styles/mixin";

#layout {
  display: grid;
  grid-template-columns: 96px auto;

  position: relative;

  height: 100%;

  z-index: 1;
  transition: var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);

  #layout-content-flow {
    display: grid;
    align-content: space-between;
    align-items: start;
    gap: 24px;
    grid-column: 3;
    grid-template-columns: repeat(12, minmax(72px, 100vw));
    justify-content: center;

    position: relative;

    padding-block-end: 68px;
    padding-inline: 4vw;

    width: 100%;

    overflow: overlay;
    scroll-behavior: smooth;
    scroll-padding-top: 120px;
    scrollbar-width: thin;
    transition: var(--md-sys-motion-duration-medium1) var(--md-sys-motion-easing-emphasized);

    #layout-content-filler {
      display: flex;
      flex-flow: column wrap;
      grid-column: 1 / 13;

      height: 100%;

      padding: 24px;

      &::before,
      &::after {
        content: "";
        flex-basis: 100%;
        width: 0;
        order: 2;
      }

      #layout-home-title {
        display: flex;
        align-items: center;
        gap: 42px;
        justify-content: center;

        width: 100%;

        h1 {
          @include mixin.typescale-style("display-large");

          grid-column: span 9;
        }

        h6 {
          grid-column: span 9;

          text-align: end;
        }

        img {
          grid-column: 11 / span 2;
          grid-row: 2 / span 2;

          height: 120px;
          width: 120px;

          -webkit-mask: var(--via-svg-mask) no-repeat 0 / 100%;
          mask: var(--via-svg-mask) no-repeat 0 / 100%;
        }
      }

      div.card[spec="feed"] {
        width: calc(50% - 12px);

        border-radius: var(--md-sys-shape-corner-extra-large-increased);

        &:nth-child(2n + 4),
        &[size="large"] {
          margin-inline-end: 12px;

          order: 1;
        }

        &:nth-child(2n + 3),
        &[size="small"] {
          margin-inline-start: 12px;

          order: 2;
        }

        & > a {
          width: 100%;

          color: var(--md-sys-color-on-surface);
          text-decoration: none;
        }
      }

      article {
        width: 100%;

        section {
          &:nth-of-type(1) {
            .title-with-achor {
              position: relative;

              a.title-anchor {
                @include mixin.typescale-style("body-large");

                display: flex;
                align-items: center;
                flex-direction: column;
                gap: 3px;

                position: absolute;
                left: -55px;
                top: 0px;

                height: 40px;
                width: 40px;

                color: var(--md-sys-color-on-surface);

                opacity: 0;
                transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);

                span:nth-of-type(1) {
                  @include mixin.material-symbols($size: 24);

                  display: block;

                  height: 40px;
                  width: 40px;

                  text-align: center;
                  line-height: 40px;

                  border-radius: var(--md-sys-shape-corner-full);

                  background-color: transparent;

                  opacity: 0;
                }

                span.visually-hidden {
                  @include mixin.typescale-style("label-medium");

                  padding-block: 3px;
                  padding-inline: 6px;

                  word-break: keep-all;

                  border-radius: var(--md-sys-shape-corner-small);

                  background-color: var(--md-sys-color-surface-container-low);

                  opacity: 0;
                  visibility: hidden;
                }
              }

              h1,
              h2,
              h3,
              h4,
              h5,
              h6 {
                margin-block: 24px 12px;
              }

              &:hover {
                a.title-anchor {
                  opacity: 1;

                  span:nth-of-type(1) {
                    opacity: 1;
                  }

                  &:hover {
                    span:nth-of-type(1):hover {
                      background-color: var(--md-sys-color-surface-container-low);

                      + span.visually-hidden {
                        opacity: 1;
                        visibility: visible;
                      }
                    }
                  }
                }
              }
            }

            a {
              text-decoration: none;
            }

            hr {
              margin-block: 12px;
            }

            p {
              margin-block: 12px;

              em {
                display: inline-block;

                font-style: normal;

                transform: skewX(-10deg);
              }

              s {
                opacity: 0.5;
              }

              strong {
                font-variation-settings: "wght" 700;
              }

              img {
                max-width: 100%;

                border-radius: var(--md-sys-shape-corner-small);
              }
            }

            pre {
              @include mixin.typescale-style("body-large");

              overflow: auto;
            }

            ul,
            ol {
              padding-inline-start: 20px;

              li {
                @include mixin.typescale-style("body-large");

                position: relative;

                margin-block-end: 5px;

                vertical-align: middle;

                p a:has(img) {
                  max-width: 100%;

                  img {
                    max-width: 100%;
                  }
                }
              }
            }

            ol {
              padding-inline-start: 70ch;
            }

            ul {
              list-style-type: none;

              li::before {
                content: "";

                display: inline-block;

                position: absolute;
                left: -21px;
                top: 4.5px;

                height: 18px;
                width: 18px;

                background-color: var(--md-sys-color-on-surface);

                -webkit-mask: var(--via-svg-list-bullet) 0 0/100% no-repeat;
                mask: var(--via-svg-list-bullet) 0 0/100% no-repeat;
              }

              li > p::before {
                display: none;
              }
            }

            p a,
            li a {
              display: inline-flex;

              position: relative;

              text-indent: initial;
              text-decoration: underline dashed;

              overflow: hidden;

              &::before {
                content: "";

                display: block;

                position: absolute;
                bottom: 0px;

                height: 100%;
                width: 0%;

                background-color: var(--md-sys-color-primary);

                opacity: 0.2;
                transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
              }

              &:hover {
                text-decoration: underline solid;

                &::before {
                  width: 100%;
                }
              }
            }

            blockquote {
              margin-block-end: 12px;
              margin-inline: 0px;
              padding-block-start: 12px;

              color: var(--md-sys-color-on-tertiary-container);

              border-inline-start: 6px solid var(--md-sys-color-inverse-on-surface);

              blockquote {
                margin-inline: 24px;
              }

              p {
                margin-inline: 24px;
                margin-block: 0px;
                padding-block-end: 12px;
              }

              ul,
              ol {
                margin-inline: 24px;
                padding-block-end: 7px;
              }

              .task-list-item {
                margin: 0px;

                &::before {
                  display: none;
                }
              }
            }

            details {
              margin: 0.5vh 0px;

              border-radius: var(--md-sys-shape-corner-small);

              overflow: hidden;
              transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);

              img {
                display: block;
              }

              summary {
                @include mixin.typescale-style("body-large");

                display: flex;
                align-items: center;
                flex-direction: row;
                flex-wrap: nowrap;
                gap: 12px;

                padding: 12px;

                cursor: pointer;
                list-style: none;
                transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);

                &::before {
                  @include mixin.material-symbols("expand_more");

                  transform: rotateZ(-90deg);
                  transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
                }
              }

              &:hover {
                background-color: var(--md-sys-color-inverse-on-surface);
              }

              &[open] {
                border-radius: var(--md-sys-shape-corner-extra-large);

                summary {
                  &:focus-visible {
                    border-radius: var(--md-sys-shape-corner-extra-large-top);
                  }

                  &::before {
                    transform: rotateZ(0deg);
                  }
                }
              }
            }

            table {
              margin-block-end: 12px;
              margin-inline: 24px;
              padding: 0px;

              width: calc(100% - 48px);
            }
          }
        }
      }
    }

    #layout-scrolltop {
      display: flex;
      align-items: center;
      justify-content: center;
      grid-column: 11/13;

      position: sticky;
      bottom: 72px;
      right: 0px;

      height: 100%;
      width: 100%;

      opacity: 0;
      transition: var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-standard);
      visibility: hidden;
      z-index: 21;

      #layout-scrolltop-desktop {
        @include mixin.material-symbols($size: 24);

        position: relative;

        height: 84px;
        min-width: 84px;
        width: 84px;

        color: var(--md-sys-color-outline);

        border-radius: var(--md-sys-shape-corner-full);
        border: 1px solid var(--md-sys-color-outline-variant);

        background-color: var(--md-sys-color-surface-container-low);

        cursor: pointer;
        overflow: hidden;
      }
    }
  }

  @media screen and (max-width: 1600px) {
    $columns: 9;

    #layout-content-flow {
      grid-template-columns: repeat($columns, 1fr);
      padding-inline: 6vw;

      #layout-content-filler {
        grid-column: span $columns;
      }

      #layout-scrolltop {
        grid-column: $columns;
      }

      hr {
        grid-column: span $columns;
      }

      .layout-footer {
        grid-column: span $columns;
      }
    }

    &[spec="article"] {
      #layout-content-flow {
        #layout-content-filler {
          grid-template-columns: minmax(50vw, 70%) minmax(300px, 30%);
        }

        .layout-quicklinks {
          &[spec="previous"] {
            grid-column: 1 string.unquote("/") calc(($columns + 1) / 2);
          }

          &[spec="next"] {
            grid-column: calc(($columns + 1) / 2) string.unquote("/") $columns;
          }
        }
      }
    }

    &[spec="feed"] {
      #layout-content-flow {
        & > {
          h1,
          h6 {
            grid-column: span calc($columns - 2);
          }

          img {
            grid-column: calc($columns - 1) / calc($columns + 1);
          }
        }

        #layout-search {
          grid-column: span $columns;
        }
      }
    }
  }

  @media screen and (max-width: 1200px) {
    $columns: 6;

    #layout-content-flow {
      grid-template-columns: repeat($columns, 1fr);

      padding-inline: 24px;

      #layout-content-filler {
        grid-column: span $columns;
      }

      #layout-scrolltop {
        grid-column: $columns;
      }

      hr {
        grid-column: span $columns;
      }

      .layout-footer {
        grid-column: span $columns;
      }
    }

    &[spec="article"] {
      #layout-content-flow {
        #layout-content-filler {
          grid-template-columns: auto;

          section:nth-child(2) {
            display: none;
          }
        }

        .layout-quicklinks {
          &[spec="previous"],
          &[spec="next"] {
            grid-column: span calc($columns / 2);
          }
        }
      }
    }

    &[spec="feed"] {
      #layout-content-flow {
        & > {
          h1,
          h6 {
            grid-column: span calc($columns - 1);
          }

          img {
            grid-column: $columns;
          }
        }
      }
    }
  }

  @media screen and (max-width: 840px) {
    $columns: 4;

    grid-template-columns: 0px auto;
    grid-template-rows: auto 80px;

    #layout-content-flow {
      grid-template-columns: repeat($columns, 1fr);

      padding-block: 64px;
      padding-inline: 42px;

      #layout-content-filler {
        grid-column: span $columns;
      }

      #layout-scrolltop {
        grid-column: $columns;

        bottom: 0px;
      }

      hr {
        grid-column: span $columns;
      }

      .layout-footer {
        grid-column: span $columns;
      }
    }

    &[spec="article"] {
      #layout-content-flow {
        .layout-quicklinks {
          &[spec="previous"],
          &[spec="next"] {
            grid-column: span calc($columns / 2);
          }
        }
      }
    }

    &[spec="feed"] {
      #layout-content-flow {
        & > {
          h1 {
            @include mixin.typescale-style("display-medium");

            grid-column: span calc($columns - 1);

            margin-inline-start: 12px;
          }

          h6 {
            grid-column: span $columns;

            margin-inline-start: 12px;
          }

          img {
            grid-column: $columns;
            grid-row: 1;
          }
        }

        #layout-content-filler {
          &::before,
          &::after {
            order: 1;
          }

          div.card[spec="feed"] {
            width: 100%;

            &:nth-child(2n + 4),
            &[size="large"] {
              margin-inline-end: 0px;

              order: 1;
            }

            &:nth-child(2n + 3),
            &[size="small"] {
              margin-inline-start: 0px;

              order: 1;
            }
          }
        }
      }
    }
  }

  @media screen and (max-width: 600px) {
    $columns: 4;

    #layout-content-flow {
      padding-inline: 12px;
    }

    &[spec="article"] {
      #layout-content-flow {
        #layout-content-filler [role="doc-endnotes"]ol {
          margin-inline: 0px;
          padding-inline: 0px;
        }

        .layout-quicklinks {
          &[spec="previous"],
          &[spec="next"] {
            grid-column: span $columns;
          }
        }
      }
    }
  }
}
</style>
