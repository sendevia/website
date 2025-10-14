<script setup lang="ts">
import Header from "../components/Header.vue";
import PageIndicator from "../components/PageIndicator.vue";
import { onMounted, onBeforeUnmount, ref } from "vue";

function copyAnchorLink(this: HTMLElement) {
  const anchor = this as HTMLAnchorElement;
  const href = anchor.getAttribute("href");
  const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;
  navigator.clipboard.writeText(fullUrl);

  const hiddenSpan = anchor.querySelector<HTMLSpanElement>("span.visually-hidden");
  if (hiddenSpan) {
    const originalText = hiddenSpan.textContent;
    hiddenSpan.textContent = "已复制";
    setTimeout(() => {
      hiddenSpan.textContent = originalText;
    }, 1000);
  }
}

const headings = ref<Array<{ id: string; text: string; level: number }>>([]);
const activeId = ref<string>("");

let observer: IntersectionObserver | null = null;
let lockedId: string | null = null;
let unlockTimer: number | null = null;

function onNavigate(id: string) {
  lockedId = id;
  activeId.value = id;
  if (unlockTimer) {
    window.clearTimeout(unlockTimer);
  }
  unlockTimer = window.setTimeout(() => {
    lockedId = null;
    unlockTimer = null;
  }, 1200);
}

function collectHeadings() {
  if (typeof window === "undefined") return;
  const nodes = Array.from(document.querySelectorAll("h1[id], h2[id]")) as HTMLElement[];
  headings.value = nodes.map((n) => ({ id: n.id, text: n.textContent?.trim() || n.id, level: +n.tagName.replace("H", "") }));
}

function createObserver() {
  if (observer) observer.disconnect();

  const visible = new Map<string, IntersectionObserverEntry>();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = (entry.target as HTMLElement).id;
        if (entry.isIntersecting) {
          visible.set(id, entry);
        } else {
          visible.delete(id);
        }
      });

      if (visible.size === 0) return;

      if (lockedId) {
        activeId.value = lockedId;
        return;
      }

      let bestId: string | null = null;
      let bestScore = -Infinity;
      visible.forEach((entry, id) => {
        const ratio = entry.intersectionRatio || 0;
        const top = entry.boundingClientRect.top;
        const score = ratio * 10000 - top;
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      });

      if (bestId) activeId.value = bestId;
    },
    { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] }
  );

  headings.value.forEach((h) => {
    const el = document.getElementById(h.id);
    if (el) observer?.observe(el);
  });
}

const resizeHandler = () => {
  collectHeadings();
  createObserver();
};

if (typeof window !== "undefined") {
  onMounted(() => {
    collectHeadings();
    createObserver();

    const anchors = document.querySelectorAll<HTMLAnchorElement>("a.title-anchor");
    anchors.forEach((anchor) => {
      anchor.addEventListener("click", copyAnchorLink);
    });

    window.addEventListener("resize", resizeHandler);

    window.addEventListener("hashchange", () => {
      collectHeadings();
      createObserver();
    });
    window.addEventListener("popstate", () => {
      collectHeadings();
      createObserver();
    });
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    observer = null;

    window.removeEventListener("resize", resizeHandler);
    window.removeEventListener("hashchange", () => {
      collectHeadings();
      createObserver();
    });

    window.removeEventListener("popstate", () => {
      collectHeadings();
      createObserver();
    });

    if (unlockTimer) {
      window.clearTimeout(unlockTimer);
      unlockTimer = null;
    }
  });
}
</script>

<template>
  <Header />
  <section>
    <Content />
  </section>
  <section>
    <PageIndicator :headings="headings" :activeId="activeId" @navigate="onNavigate" />
  </section>
</template>

<style lang="scss">
@use "../styles/mixin";

section {
  &:nth-of-type(1) {
    display: flex;
    grid-column: 1 / 10;

    margin-inline-start: 24px;

    & > div {
      width: 100%;
    }

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

  &:nth-of-type(2) {
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
