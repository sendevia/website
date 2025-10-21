<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useScreenWidth } from "../composables/useScreenWidth";

const { page, frontmatter } = useGlobalData();
const { isAboveBreakpoint: isMonitoring } = useScreenWidth(840);
const navRef = ref<HTMLElement | null>(null);
const indicator = ref({ top: "0px", left: "0px", width: "100%", height: "0px", opacity: 0 });
const headings = ref<Array<{ id: string; text: string; level: number }>>([]);
const headingsActiveId = ref<string>("");

let ro: ResizeObserver | null = null;
let mo: MutationObserver | null = null;
let pageIndicatorObserver: IntersectionObserver | null = null;
let pageIndicatorLockedId: string | null = null;
let pageIndicatorUnlockTimer: number | null = null;

const grouped = computed(() => headings.value || []);

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
}

function navigateTo(id: string) {
  onNavigate(id);
  scrollToId(id);
}

function onNavigate(id: string) {
  pageIndicatorLockedId = id;
  headingsActiveId.value = id;
  if (pageIndicatorUnlockTimer) {
    window.clearTimeout(pageIndicatorUnlockTimer);
  }
  pageIndicatorUnlockTimer = window.setTimeout(() => {
    pageIndicatorLockedId = null;
    pageIndicatorUnlockTimer = null;
  }, 1200);
}

function collectHeadings() {
  const nodes = Array.from(document.querySelectorAll("h1[id], h2[id]")) as HTMLElement[];
  headings.value = nodes.map((n) => ({ id: n.id, text: n.textContent?.trim() || n.id, level: +n.tagName.replace("H", "") }));
}

function createObserver() {
  if (pageIndicatorObserver) pageIndicatorObserver.disconnect();

  const visible = new Map<string, IntersectionObserverEntry>();

  pageIndicatorObserver = new IntersectionObserver(
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

      if (pageIndicatorLockedId) {
        headingsActiveId.value = pageIndicatorLockedId;
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

      if (bestId) headingsActiveId.value = bestId;
    },
    { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.5, 1] }
  );

  headings.value.forEach((h) => {
    const el = document.getElementById(h.id);
    if (el) pageIndicatorObserver?.observe(el);
  });
}

function updateIndicator() {
  const nav = navRef.value;
  if (!nav) return;

  const id = headingsActiveId.value;

  if (!id) {
    indicator.value.opacity = 0;
    return;
  }

  const spanBlock = nav.querySelector(`span[data-id="${CSS.escape(id)}"]`) as HTMLElement | null;

  if (!spanBlock || !spanBlock.offsetParent) {
    indicator.value.opacity = 0;
    return;
  }

  const conRect = nav.getBoundingClientRect();
  const spbRect = spanBlock.getBoundingClientRect();

  const left = `${spbRect.left - conRect.left}px`;
  const top = `${spbRect.top - conRect.top}px`;
  const width = `${spbRect.width}px`;
  const height = `${spbRect.height}px`;

  indicator.value = { top, left, width, height, opacity: 0.5 };
}

function toggleMonitoring(shouldMonitor: boolean) {
  if (shouldMonitor) {
    collectHeadings();
    createObserver();
    nextTick(() => updateIndicator());

    if ((window as any).ResizeObserver && navRef.value) {
      ro = new ResizeObserver(() => updateIndicator());
      ro.observe(navRef.value);
      navRef.value.querySelectorAll("[data-id]").forEach((el) => ro!.observe(el as Element));
    }

    if ((window as any).MutationObserver && navRef.value) {
      mo = new MutationObserver(() => {
        nextTick(() => {
          updateIndicator();
          if (ro && navRef.value) {
            navRef.value.querySelectorAll("[data-id]").forEach((el) => ro!.observe(el as Element));
          }
        });
      });
      mo.observe(navRef.value, { childList: true, subtree: true });
    }
  } else {
    pageIndicatorObserver?.disconnect();
    pageIndicatorObserver = null;

    if (ro) {
      ro.disconnect();
      ro = null;
    }

    if (mo) {
      mo.disconnect();
      mo = null;
    }

    indicator.value.opacity = 0;
  }
}

const resizeHandler = () => {
  if (isMonitoring.value) {
    collectHeadings();
    createObserver();
  }
};

if (typeof window !== "undefined") {
  onMounted(() => {
    toggleMonitoring(isMonitoring.value);

    window.addEventListener("resize", resizeHandler);
    window.addEventListener("resize", updateIndicator, { passive: true });
    window.addEventListener("hashchange", () => {
      if (isMonitoring.value) {
        collectHeadings();
        createObserver();
      }
    });
    window.addEventListener("popstate", () => {
      if (isMonitoring.value) {
        collectHeadings();
        createObserver();
      }
    });

    nextTick(() => updateIndicator());
  });

  onBeforeUnmount(() => {
    pageIndicatorObserver?.disconnect();
    pageIndicatorObserver = null;

    window.removeEventListener("resize", resizeHandler);
    window.removeEventListener("resize", updateIndicator);
    window.removeEventListener("hashchange", () => {
      collectHeadings();
      createObserver();
    });
    window.removeEventListener("popstate", () => {
      collectHeadings();
      createObserver();
    });

    if (pageIndicatorUnlockTimer) {
      window.clearTimeout(pageIndicatorUnlockTimer);
      pageIndicatorUnlockTimer = null;
    }

    if (ro) {
      ro.disconnect();
      ro = null;
    }

    if (mo) {
      mo.disconnect();
      mo = null;
    }
  });

  watch(isMonitoring, (newValue) => {
    toggleMonitoring(newValue);
  });

  watch(
    () => headingsActiveId.value,
    () => {
      if (isMonitoring.value) {
        nextTick(() => updateIndicator());
      }
    }
  );

  watch(
    () => grouped.value,
    () => {
      if (isMonitoring.value) {
        nextTick(() => updateIndicator());
      }
    }
  );
}
</script>

<template>
  <div class="page-indicator" aria-label="页面目录" ref="navRef">
    <p>在此页上</p>
    <h3>{{ frontmatter.title ? frontmatter.title : page.title }}</h3>

    <div
      class="indicator"
      :style="{ top: indicator.top, left: indicator.left, width: indicator.width, height: indicator.height, opacity: indicator.opacity }"
      aria-hidden="true"
    ></div>

    <div class="indicator-container">
      <span v-for="h in grouped" :key="h.id" :data-id="h.id" :class="[{ active: h.id === headingsActiveId }]">
        <a :href="`#${h.id}`" @click.prevent="navigateTo(h.id)" role="link" :aria-current="h.id === headingsActiveId ? 'true' : undefined">{{ h.text }}</a>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/mixin";

.page-indicator {
  position: relative;

  user-select: none;
  -moz-user-select: none;

  p {
    @include mixin.typescale-style("label-small");

    margin-inline-start: 18px;

    z-index: 1;
  }

  h3 {
    margin-inline-start: 18px;
    padding-block-end: 18px;

    font-variation-settings: "wght" 600;
    z-index: 1;
  }

  .indicator {
    position: absolute;

    outline: 1px solid var(--md-sys-color-primary);
    border-radius: var(--md-sys-shape-corner-extra-large);

    pointer-events: none;
    transition: var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
    z-index: 1;
  }

  .indicator-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;

    z-index: 0;

    span {
      position: relative;

      width: 100%;

      border-radius: var(--md-sys-shape-corner-extra-large);

      transition: background-color var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);

      &::after {
        content: "";

        display: block;

        position: absolute;
        left: 0px;
        top: 0px;

        height: 100%;

        border-radius: var(--md-sys-shape-corner-extra-large);

        background-color: transparent;

        transition: width var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          heigh var(--md-sys-motion-spring-default-spatial-duration) var(--md-sys-motion-spring-default-spatial),
          background-color var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
        z-index: -1;
      }

      a {
        @include mixin.typescale-style("label-large");

        width: 100%;

        padding-block: 9px;
        padding-inline: 18px;

        color: var(--md-sys-color-on-surface);
        font-variation-settings: "wght" 200;
        text-decoration: none;

        border-radius: var(--md-sys-shape-corner-extra-large);

        &:focus-visible {
          outline: 2px solid var(--md-sys-color-primary);
          outline-offset: 2px;

          background-color: var(--md-sys-color-surface-container);

          transition: background-color var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
          z-index: 1;
        }
      }

      &.active {
        & > a {
          color: var(--md-sys-color-primary);
          font-variation-settings: "wght" 700;

          &:focus-visible {
            color: var(--md-sys-color-on-primary);

            background-color: var(--md-sys-color-primary);
          }
        }

        &:hover {
          background-color: var(--md-sys-color-surface-container);
        }
      }

      &:not(.active) {
        &::after {
          width: 50%;
        }

        &:hover::after {
          width: 100%;

          background-color: var(--md-sys-color-surface-container);
        }
      }
    }
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
  .page-indicator {
    display: none;
  }
}

@media screen and (max-width: 600px) {
}
</style>
