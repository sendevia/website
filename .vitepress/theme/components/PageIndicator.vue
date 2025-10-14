<script setup lang="ts">
import { ref, computed, toRefs, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useGlobalData } from "../composables/useGlobalData";

const { page, frontmatter } = useGlobalData();
const props = defineProps<{ headings: Array<{ id: string; text: string; level: number }>; activeId: string }>();
const emit = defineEmits<{
  (e: "navigate", id: string): void;
}>();
const { headings, activeId } = toRefs(props);
const grouped = computed(() => headings.value || []);
const navRef = ref<HTMLElement | null>(null);
const indicator = ref({ top: "0px", left: "0px", width: "100%", height: "0px", opacity: 0 });

let ro: ResizeObserver | null = null;
let mo: MutationObserver | null = null;

function scrollToId(id: string) {
  if (typeof window === "undefined") return;

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
}

function navigateTo(id: string) {
  emit("navigate", id);
  scrollToId(id);
}

function updateIndicator() {
  if (typeof window === "undefined") return;

  const nav = navRef.value;
  if (!nav) return;

  const id = activeId.value as unknown as string;

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

if (typeof window !== "undefined") {
  onMounted(() => {
    window.addEventListener("resize", updateIndicator, { passive: true });

    nextTick(() => updateIndicator());

    if ((window as any).ResizeObserver) {
      ro = new ResizeObserver(() => updateIndicator());
      if (navRef.value) {
        ro.observe(navRef.value);
        navRef.value.querySelectorAll("[data-id]").forEach((el) => ro!.observe(el as Element));
      }
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
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", updateIndicator);

    if (ro) {
      ro.disconnect();
      ro = null;
    }

    if (mo) {
      mo.disconnect();
      mo = null;
    }
  });

  watch(
    () => activeId.value,
    () => {
      nextTick(() => updateIndicator());
    }
  );

  watch(
    () => grouped.value,
    () => {
      nextTick(() => updateIndicator());
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
      <span v-for="h in grouped" :key="h.id" :data-id="h.id" :class="[{ active: h.id === activeId }]">
        <a :href="`#${h.id}`" @click.prevent="navigateTo(h.id)" role="link" :aria-current="h.id === activeId ? 'true' : undefined">{{ h.text }}</a>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/mixin";

.page-indicator {
  .indicator {
    position: absolute;

    border: 1px solid var(--md-sys-color-primary);
    border-radius: var(--md-sys-shape-corner-extra-extra-large);

    pointer-events: none;
    transition: var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
  }

  p {
    @include mixin.typescale-style("label-small");

    margin-inline-start: 18px;
  }

  h3 {
    margin-inline-start: 18px;
    padding-block-end: 18px;

    font-variation-settings: "wght" 600;
  }

  .indicator-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;

    span {
      width: 100%;

      border-radius: var(--md-sys-shape-corner-extra-extra-large);

      a {
        @include mixin.typescale-style("label-large");

        width: 100%;

        padding-inline: 18px;
        padding-block: 9px;

        color: var(--md-sys-color-on-surface);
        font-variation-settings: "wght" 200;
        text-decoration: none;

        transition: var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);
      }

      &.active > a {
        color: var(--md-sys-color-primary);
        font-variation-settings: "wght" 700;
      }

      &:hover {
        background-color: var(--md-sys-color-surface-dim);
      }
    }
  }
}
</style>
