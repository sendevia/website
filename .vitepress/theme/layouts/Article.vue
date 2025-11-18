<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const showImageViewer = ref(false);
const currentImageIndex = ref(0);
const articleImages = ref<string[]>([]);
const imageOriginPosition = ref({ x: 0, y: 0, width: 0, height: 0 });

function openImageViewer(index: number, event: MouseEvent) {
  const contentElement = document.querySelector("#article-content");
  if (contentElement) {
    const images = Array.from(contentElement.querySelectorAll("img"))
      .map((img) => img.src)
      .filter((src) => src && !src.includes("data:"));

    articleImages.value = images;
    currentImageIndex.value = index;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    imageOriginPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      width: rect.width,
      height: rect.height,
    };

    showImageViewer.value = true;
  }
}

function closeImageViewer() {
  showImageViewer.value = false;
}

function updateCurrentImageIndex(index: number) {
  currentImageIndex.value = index;
}

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

function olCountAttributes() {
  const orderedLists = document.querySelectorAll("ol");
  orderedLists.forEach((ol) => {
    const liCount = ol.querySelectorAll("li").length;
    const startAttr = ol.getAttribute("start");
    const startValue = startAttr ? parseInt(startAttr, 10) : 1;
    const effectiveCount = liCount + (startValue - 1);

    ol.removeAttribute("data-count-range");

    const digitCount = Math.max(1, Math.floor(Math.log10(effectiveCount)) + 1);
    const paddingValue = 24 + (digitCount - 1) * 10;

    (ol as HTMLElement).style.setProperty("padding-inline-start", `${paddingValue}px`);
  });
}

if (typeof window !== "undefined") {
  onMounted(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>("a.title-anchor");
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", copyAnchorLink);
    });

    function setupImageClickListeners() {
      const contentElement = document.querySelector("#article-content");
      if (contentElement) {
        const images = contentElement.querySelectorAll("img");
        images.forEach((img, index) => {
          (img as HTMLImageElement).onclick = (event: MouseEvent) => openImageViewer(index, event);
        });
      }
    }

    ulCustomBullets();
    olCountAttributes();
    setupImageClickListeners();

    window.addEventListener("resize", ulCustomBullets);

    const observer = new MutationObserver(() => {
      ulCustomBullets();
      olCountAttributes();
      setupImageClickListeners();
    });

    const contentElement = document.querySelector("#article-content");
    if (contentElement) {
      observer.observe(contentElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    onBeforeUnmount(() => {
      observer.disconnect();
      window.removeEventListener("resize", ulCustomBullets);
    });
  });
}
</script>

<template>
  <Header />
  <section id="article-content">
    <Content />
    <PrevNext />
  </section>
  <section id="article-indicator">
    <PageIndicator />
  </section>
  <ImageViewer
    v-if="showImageViewer"
    :images="articleImages"
    :current-index="currentImageIndex"
    :origin-position="imageOriginPosition"
    @close="closeImageViewer"
    @update:current-index="updateCurrentImageIndex"
  />
</template>

<style lang="scss">
@use "../styles/mixin";

section {
  &#article-content {
    display: flex;
    flex-direction: column;
    grid-column: 1 / 10;

    & > div {
      width: 100%;
    }

    *[class^="language-"] {
      position: relative;

      margin-block-end: 12px;

      border-radius: var(--md-sys-shape-corner-large-increased);

      overflow: hidden;

      button.copy {
        position: absolute;
        right: 0px;
        top: 0px;

        height: 42px;
        width: 42px;

        margin-block-start: 6px;
        margin-inline-end: 6px;
        padding: 0px;

        border: none;
        border-radius: var(--md-sys-shape-corner-extra-large);

        background-color: transparent;

        cursor: pointer;
        opacity: 0;
        transition: border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial),
          opacity var(--md-sys-motion-spring-default-effect-duration) var(--md-sys-motion-spring-default-effect);
        visibility: hidden;
        z-index: 2;

        &::before {
          @include mixin.material-symbols($name: "content_copy", $size: 18, $line-height: 42);

          color: var(--md-ref-palette-neutral90);
        }

        &:active {
          border-radius: var(--md-sys-shape-corner-large);
        }

        &:focus-visible {
          @include mixin.focus-ring($thickness: 2, $z-index: 3);

          outline-color: var(--md-ref-palette-neutral90) !important;
        }
      }

      span.lang {
        @include mixin.typescale-style("body-medium", $font-family: Source Code Pro, $font-variation-settings: "wght" 700);

        position: absolute;
        right: 0px;
        top: 0px;

        margin-block-start: 6px;
        margin-inline-end: 9px;

        color: var(--md-ref-palette-neutral50);
        text-transform: uppercase;

        transition: color var(--md-sys-motion-spring-default-effect-duration) var(--md-sys-motion-spring-default-effect);
        z-index: 1;
      }

      pre.shiki {
        grid-column: 2/3;
        grid-row: 1;

        margin: 0px;
        padding-block: 15px;

        overflow: overlay;
        z-index: 0;

        code {
          padding: 0px;
        }
      }

      div.line-numbers-wrapper {
        grid-column: 1/2;
        grid-row: 1;

        width: max-content;

        padding-block: 15px;
        padding-inline: 12px;

        text-align: right;
        vertical-align: middle;

        color: var(--md-ref-palette-neutral-variant50);

        border-right: 1px solid var(--md-ref-palette-neutral-variant50);
        background-color: var(--md-ref-palette-neutral10);

        user-select: none;
        -moz-user-select: none;
        z-index: 0;

        span {
          @include mixin.typescale-style("body-large", $font-family: Source Code Pro);
        }
      }

      &.line-numbers-mode {
        display: grid;
        grid-template-columns: max-content auto;
      }

      &:hover {
        span.lang {
          opacity: 0;
          visibility: hidden;
        }

        button.copy {
          opacity: 1;
          visibility: visible;

          &:hover {
            background-color: var(--md-ref-palette-neutral10);

            &::before {
              color: var(--md-ref-palette-neutral90);
            }
          }
        }
      }
    }

    .custom-block {
      display: grid;
      column-gap: 12px;
      grid-template-columns: 24px auto;

      position: relative;

      margin-block-end: 12px;
      padding-block: 12px;
      padding-inline: 12px;

      border-radius: var(--md-sys-shape-corner-large-increased);

      z-index: 0;

      &::before {
        @include mixin.material-symbols($size: 24);

        grid-column: 1;
      }

      p.custom-block-title {
        grid-column: 2;

        margin: 0px;
        padding: 0px;

        font-variation-settings: "wght" 700;

        user-select: none;
        -moz-user-select: none;
      }

      > * {
        grid-column: 2 / 3;

        margin-inline: 0px;
        padding-block: 0px;
      }

      &.details {
        display: block;
        transition: background-color var(--md-sys-motion-spring-slow-effect-duration) var(--md-sys-motion-spring-slow-effect);

        padding: 0px;

        &::before {
          display: none;
        }

        summary {
          @include mixin.typescale-style("body-large");

          display: grid;
          column-gap: 12px;
          grid-template-columns: 24px auto;

          padding-block: 12px;
          padding-inline: 12px;

          font-variation-settings: "wght" 700;

          border-radius: var(--md-sys-shape-corner-large-increased);

          cursor: pointer;
          transition: var(--md-sys-motion-spring-slow-spatial-standard-duration)
            var(--md-sys-motion-spring-slow-spatial-standard);
          user-select: none;
          -moz-user-select: none;

          &::before {
            @include mixin.material-symbols("expand_more");

            font-variation-settings: "wght" 500;

            transform: rotateZ(-90deg);
            transition: var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
          }

          &:focus-visible {
            @include mixin.focus-ring($thickness: 3);
          }
        }

        :not(summary) {
          margin-inline: 12px;
        }

        img {
          display: block;
        }

        &:hover {
          background-color: var(--md-sys-color-inverse-on-surface);
        }

        &[open] {
          padding-block-end: 12px;

          background-color: var(--md-sys-color-inverse-on-surface);

          summary {
            padding-block-end: 12px;

            &::before {
              transform: rotateZ(0deg);
            }
          }
        }
      }

      &.info {
        color: var(--md-sys-color-on-blue-container);

        background-color: var(--md-sys-color-blue-container);

        &::before {
          content: "info";

          color: var(--md-sys-color-on-blue-container);
        }
      }

      &.tip {
        color: var(--md-sys-color-on-green-container);

        background-color: var(--md-sys-color-green-container);

        &::before {
          content: "lightbulb_2";

          color: var(--md-sys-color-on-green-container);
        }
      }

      &.warning {
        color: var(--md-sys-color-on-yellow-container);

        background-color: var(--md-sys-color-yellow-container);

        &::before {
          content: "brightness_alert";

          color: var(--md-sys-color-on-yellow-container);
        }
      }

      &.danger {
        color: var(--md-sys-color-on-red-container);

        background-color: var(--md-sys-color-red-container);

        &::before {
          content: "dangerous";

          color: var(--md-sys-color-on-red-container);
        }
      }
    }

    .headline-block {
      position: relative;

      padding-block-end: 12px;
      padding-inline-start: 24px;

      a.title-anchor {
        @include mixin.typescale-style("body-large");

        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 6px;

        position: absolute;
        left: -54px;
        top: 0px;

        height: 54px;
        width: 54px;

        color: var(--md-sys-color-on-surface);
        text-decoration: none;

        border-radius: var(--md-sys-shape-corner-full);

        opacity: 0;
        transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
        user-select: none;
        -moz-user-select: none;

        &:focus-visible {
          @include mixin.focus-ring($thickness: 2, $z-index: 2);

          opacity: 1;

          span:nth-of-type(1) {
            opacity: 1;
          }
        }

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
        padding-block-end: 12px;

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
      position: relative;

      margin-inline: 0px;
      padding-inline-start: 24px;

      color: var(--md-sys-color-on-tertiary-container);

      &::before {
        content: "";

        display: block;

        position: absolute;
        left: calc(24px / 2 - 3px);

        height: 100%;
        width: 6px;

        border-radius: var(--md-sys-shape-corner-small);

        background-color: var(--md-sys-color-inverse-on-surface);
      }

      blockquote {
        margin-inline: 12px;
      }

      p {
        margin-block: 12px;
        margin-inline: 0px;
        padding-block-end: 0px;
      }

      .task-list-container {
        padding-block-end: 0px;
        padding-inline: 0px;

        li.task-list-item {
          display: grid;
          align-items: center;
          gap: 12px;
          grid-template-columns: 20px auto;

          input.task-list-item-checkbox[type="checkbox"] {
            &::before {
              @include mixin.material-symbols("check_box_outline_blank", $size: 20);

              font-variation-settings: "FILL" 1;
            }

            appearance: none;

            grid-column: 1 / 2;

            margin: 0px;

            height: 20px;
            width: 20px;

            &:checked {
              &::before {
                @include mixin.material-symbols("check_box", $size: 20);
              }
            }
          }

          &::before {
            display: none;
          }
        }
      }

      & > {
        ul,
        ol {
          margin-inline: 0px;
        }
      }
    }

    code {
      @include mixin.typescale-style("body-large", $font-family: Source Code Pro);

      display: inline-block;

      width: max-content;

      padding-block: 24px;

      text-indent: initial;
      vertical-align: baseline;
      word-break: break-word;

      border-radius: var(--md-sys-shape-corner-small);

      overflow: initial;

      &::selection {
        color: var(--md-sys-color-on-tertiary);

        background-color: var(--md-sys-color-tertiary);
      }

      span.line {
        display: inline-block;

        width: 100%;

        padding-inline: 12px;

        &.highlighted {
          background-color: var(--md-ref-palette-neutral10);

          span {
            background-color: var(--md-ref-palette-neutral10);
          }
        }

        span {
          @include mixin.typescale-style("body-large", $font-family: Source Code Pro);
        }
      }
    }

    hr {
      margin-block-end: 24px;
      margin-block-start: 12px;
    }

    p {
      position: relative;

      margin-block-start: 12px;
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
        width: calc(50% - 6px);

        margin-inline: 3px;

        border-radius: var(--md-sys-shape-corner-medium);

        cursor: pointer;
        transition: border-radius var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);

        &:hover {
          border-radius: var(--md-sys-shape-corner-extra-large);
        }
      }
    }

    pre {
      padding-block-end: 12px;

      overflow: overlay;

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
    }

    ul,
    ol {
      padding-block-end: 12px;

      li {
        @include mixin.typescale-style("body-large");

        position: relative;

        margin-block-start: 12px;

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
      li {
        &::marker {
          font-variation-settings: "wght" 700;
        }

        p {
          margin-inline: 0px;
          padding-block: 0px;
        }
      }
    }

    ul {
      padding-inline-start: 24px;

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
    grid-column: 10 / 13;

    position: sticky;
    top: 120px;
  }
}

@media screen and (max-width: 1600px) {
  section {
    &#article-content {
      grid-column: 1 / 10;
    }

    &#article-indicator {
      grid-column: 10 / 13;
    }
  }
}

@media screen and (max-width: 1200px) {
  section {
    &#article-content {
      grid-column: 1 / 7;
    }

    &#article-indicator {
      grid-column: 7 / 9;
    }
  }
}

@media screen and (max-width: 840px) {
  section {
    &#article-content {
      grid-column: 1 / 7;
    }

    &#article-indicator {
      grid-column: 5 / 7;
    }
  }
}

@media screen and (max-width: 600px) {
  section {
    &#article-content {
      grid-column: 1 / 5;
    }

    &#article-indicator {
      grid-column: 3 / 5;
    }
  }
}
</style>
