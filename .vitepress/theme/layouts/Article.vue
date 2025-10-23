<script setup lang="ts">
import Header from "../components/Header.vue";
import PageIndicator from "../components/PageIndicator.vue";
import { onMounted } from "vue";

function copyAnchorLink(this: HTMLElement) {
  const anchor = this as HTMLAnchorElement;
  const href = anchor.getAttribute("href");
  const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
  navigator.clipboard.writeText(fullUrl);
}

  const hiddenSpan = anchor.querySelector<HTMLSpanElement>("span.visually-hidden");
  if (hiddenSpan) {
    const originalText = hiddenSpan.textContent;
    hiddenSpan.textContent = "已复制";
    setTimeout(() => {
      hiddenSpan.textContent = originalText;
    }, 1000);
  }
}

function ulCustomBullets() {
  const listItems = document.querySelectorAll("ul li");
  listItems.forEach((li, index) => {
    const stableRotation = ((index * 137) % 360) - 180;
    const computedStyle = window.getComputedStyle(li);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const bulletTop = lineHeight / 2 - 8;

    (li as HTMLElement).style.setProperty("--random-rotation", `${stableRotation}deg`);
    (li as HTMLElement).style.setProperty("--bullet-top", `${bulletTop}px`);
  });
}

if (typeof window !== "undefined") {
  onMounted(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a.title-anchor");
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", copyAnchorLink);
    });

    ulCustomBullets();

    window.addEventListener("resize", ulCustomBullets);

    const observer = new MutationObserver(() => {
      ulCustomBullets();
    });

    const contentElement = document.querySelector("#article-content");
    if (contentElement) {
      observer.observe(contentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  });
}
</script>

<template>
  <Header />
  <section id="article-content">
    <Content />
  </section>
  <section id="article-indicator">
    <PageIndicator />
  </section>
</template>

<style lang="scss">
@use "../styles/mixin";

section {
  &#article-content {
    display: flex;
    grid-column: 1 / 10;

    & > div {
      width: 100%;
    }

    *[class^="language-"] {
      position: relative;

      margin-inline: 24px;
      padding-block-end: 12px;

      button.copy {
        position: absolute;
        right: 0px;
        top: 0px;

        height: 42px;
        width: 42px;

        margin-block-start: 3px;
        margin-inline-end: 3px;
        padding: 0px;

        border: none;
        border-radius: var(--md-sys-shape-corner-small);

        background-color: var(--md-sys-color-surface-container-highest);

        cursor: pointer;
        opacity: 0;
        transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
        visibility: hidden;
        z-index: 11;

        &::before {
          @include mixin.material-symbols($name: "content_copy", $size: 24, $line-height: 42);

          color: var(--md-sys-color-on-surface);
        }
      }

      span.lang {
        position: absolute;
        right: 0px;
        top: 0px;

        margin-block-start: 3px;
        margin-inline-end: 6px;

        text-transform: uppercase;

        z-index: 10;
      }

      pre {
        margin: 0px;
        padding: 0px;
      }

      &:hover {
        button.copy {
          opacity: 1;
          visibility: visible;
        }
      }
    }

    .title-with-achor {
      position: relative;

      a.title-anchor {
        @include mixin.typescale-style("body-large");

        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 6px;

        position: absolute;
        left: -54px;
        top: 0px;

        width: 54px;

        padding-inline-end: 10px;

        color: var(--md-sys-color-on-surface);
        text-decoration: none;

        opacity: 0;
        transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);

        span:nth-of-type(1) {
          @include mixin.material-symbols($size: 24);

          display: block;

          height: 54px;
          width: 54px;

          line-height: 54px;
          text-align: center;

          border-radius: var(--md-sys-shape-corner-full);

          background-color: transparent;

          opacity: 0;
        }

        span.visually-hidden {
          @include mixin.typescale-style("label-medium");

          padding-block: 3px;
          padding-inline: 9px;

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
        margin-block-start: 18px;
        padding-block-end: 36px;

        line-height: 54px;

        a {
          text-decoration: none;
        }
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
        text-decoration: underline solid;
    }

    blockquote {
      margin-inline: 24px;
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
        padding-block-end: 7px;
      }

      & > {
        ul,
        ol {
          margin-inline: 0px;
        }
      }

      .task-list-item {
        margin: 0px;

        &::before {
          display: none;
        }
      }
    }

    code {
      @include mixin.typescale-style("body-large", $font-family: Source Code Pro);

      display: inline-block;

      min-height: 46px;
      width: 100%;

      padding-block: 24px;

      color: var(--shiki-light);
      text-indent: initial;
      vertical-align: middle;
      word-break: break-word;

      border-radius: var(--md-sys-shape-corner-small);

      background-color: var(--shiki-light-bg);

      overflow: initial;

      @media (prefers-color-scheme: dark) {
        color: var(--shiki-dark);

        background-color: var(--shiki-dark-bg);

        span {
          color: var(--shiki-dark);

          background-color: var(--shiki-dark-bg);
        }
      }

      &::selection {
        color: var(--md-sys-color-on-tertiary);

        background-color: var(--md-sys-color-tertiary);
      }

      span.line {
        display: inline-block;

        width: 100%;

        padding-inline: 24px;

        &.highlighted {
          background-color: var(--md-sys-color-surface-variant);

          span {
            background-color: var(--md-sys-color-surface-variant);
          }
        }

        span {
          @include mixin.typescale-style("body-large", $font-family: Source Code Pro);
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

    hr {
      margin-block: 24px;
      margin-inline-end: 24px;
    }

    p {
      position: relative;

      margin-inline: 24px;
      padding-block-end: 12px;

      code {
        @include mixin.typescale-style("body-large", $font-family: Source Code Pro);
        display: inline;

        min-width: max-content;

        padding: 0px;

        vertical-align: baseline;
      }

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
      margin-inline: 24px;
      padding-block-end: 12px;

      &.shiki {
        position: relative;
      }
    }

    strong {
      font-variation-settings: "wght" 700;
    }

    sup.footnote-ref {
      position: absolute;
      top: -10px;

      a[href] {
        @include mixin.typescale-style("label-small");

        text-decoration: none;
      }
    }

    table {
      margin-block-end: 12px;
      margin-inline: 24px;
      padding: 0px;

      width: calc(100% - 48px);
    }

    ul,
    ol {
      margin-inline: 24px;
      padding-block-end: 12px;

      li {
        @include mixin.typescale-style("body-large");

        position: relative;

        margin-block-end: 5px;

        vertical-align: middle;

        code {
          display: inline;
          padding: 0px;
        }

        ul {
          padding: 0px;
        }
      }
    }

    ol {
      padding-inline-start: 70ch;

      li {
        p {
          margin-inline: 0px;
        }
      }
    }

    ul {
      padding-inline-start: 20px;

      list-style-type: none;

      li {
        position: relative;

        &::before {
          content: "";

          display: inline-block;
          position: absolute;
          left: -20px;
          top: var(--bullet-top);

          height: 16px;
          width: 16px;

          background-color: var(--md-sys-color-on-surface);

          -webkit-mask: var(--via-svg-list-bullet) 0 0/100% no-repeat;
          mask: var(--via-svg-list-bullet) 0 0/100% no-repeat;

          transform: rotate(var(--random-rotation, 0deg));
        }
      }
    }
  }

  &#article-indicator {
    grid-column: 11 / 13;

    position: sticky;
    top: 120px;
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
}

@media screen and (max-width: 600px) {
}
</style>
