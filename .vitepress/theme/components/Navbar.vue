<script setup lang="ts">
import { computed } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useScreenWidth } from "../composables/useScreenWidth";

const { page, theme } = useGlobalData();
const { isAboveBreakpoint } = useScreenWidth(840);

const navSegment = computed(() => {
  const items = theme.value.navSegment;
  if (Array.isArray(items) && items.length > 0) return items;
});

function isActive(link: string) {
  const current = page.value.relativePath.replace(/(\/index)?\.md$/, "");
  const target = link.replace(/\/$/, "").replace(/\.html$/, "");
  return current === target.replace(/^\//, "") || (target === "" && current === "index");
}
</script>

<template>
  <nav :class="isAboveBreakpoint ? 'rail' : 'bar'">
    <a href="/search" class="fab">
      <span>search</span>
    </a>
    <div class="destinations">
      <div class="segment" v-for="item in navSegment" :key="item.link" :class="isActive(item.link) ? 'active' : 'inactive'">
        <a :href="item.link">
          <div class="destination-accent">
            <div class="segment-icon">
              <span>
                {{ item.icon }}
              </span>
            </div>
          </div>
          <div class="destination-label">
            {{ item.text }}
          </div>
        </a>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@use "sass:meta";
@use "../styles/mixin";

nav {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: space-between;

  background-color: var(--md-sys-color-surface-container-low);

  transition: background-color var(--md-sys-motion-spring-default-effect-duration) var(--md-sys-motion-spring-default-effect);
  user-select: none;
  -moz-user-select: none;
  z-index: 999;

  a {
    cursor: pointer;
    text-decoration: none;

    &:focus-visible {
      .destination-accent {
        @include mixin.focus-ring($thickness: 3, $offset: 2);
      }
    }
  }

  .fab {
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 20px;

    height: 56px;
    width: 56px;

    color: var(--md-sys-color-on-secondary-container);

    border-radius: var(--md-sys-shape-corner-large);

    background-color: var(--md-sys-color-secondary-container);

    transition: background-color var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);

    span {
      @include mixin.material-symbols();

      height: 24px;
      width: 24px;

      text-align: center;
      font-variation-settings: "FILL" 1, "wght" 300;

      transition: font-variation-settings var(--md-sys-motion-spring-fast-spatial-duration)
        var(--md-sys-motion-spring-fast-spatial);
    }

    &:hover span {
      font-variation-settings: "FILL" 1, "wght" 600;
    }

    &:focus-visible {
      @include mixin.focus-ring($thickness: 2);
    }

    &:active span {
      font-variation-settings: "FILL" 1, "wght" 200;
    }
  }

  .destinations {
    display: flex;
    flex-grow: 1;

    padding: 0px;

    .segment {
      a {
        display: flex;
        align-items: center;
        align-self: stretch;
        flex-direction: column;
        gap: 8px;

        width: 100%;
      }

      .destination-accent {
        display: flex;
        align-items: center;
        flex: none;
        justify-content: center;

        margin-top: 4px;

        position: relative;

        width: 56px;
        height: 32px;

        border-radius: var(--md-sys-shape-corner-full);

        overflow: hidden;
        transition: background-color var(--md-sys-motion-spring-fast-effect-duration) var(--md-sys-motion-spring-fast-effect);

        .segment-icon {
          height: 24px;
          width: 24px;

          color: var(--md-sys-color-on-secondary-container);

          pointer-events: none;

          span {
            @include mixin.material-symbols();

            font-variation-settings: "FILL" 1, "wght" 300;

            transition: font-variation-settings var(--md-sys-motion-spring-fast-spatial-duration)
              var(--md-sys-motion-spring-fast-spatial);
          }
        }
      }

      .destination-label {
        @include mixin.typescale-style("label-small");

        margin-bottom: 6px;

        color: var(--md-sys-color-on-surface);
        text-align: center;
        text-decoration: none;
        text-wrap-mode: nowrap;

        opacity: 1;
      }

      &:hover {
        .destination-accent {
          .segment-icon span {
            font-variation-settings: "FILL" 1, "wght" 400;
          }
        }
      }

      &:active {
        .destination-accent {
          .segment-icon span {
            font-variation-settings: "FILL" 1, "wght" 200;
          }
        }
      }

      &.active {
        .destination-accent {
          background-color: var(--md-sys-color-secondary-container);
        }
      }

      &.inactive {
        .destination-accent {
          background-color: transparent;

          span {
            font-variation-settings: "FILL" 0, "wght" 200;
          }
        }

        &:hover {
          .destination-accent {
            background-color: var(--md-sys-color-surface-container-high);
          }
        }
      }
    }
  }

  &.bar {
    flex-direction: row;

    position: absolute;
    bottom: 0px;

    height: 80px;
    width: 100%;

    overflow-y: hidden;

    .fab {
      display: none;
    }

    .destinations {
      align-items: center;
      flex-direction: row;
      justify-content: space-around;

      .segment-active {
        margin: 0px 4px 0px 4px;

        .destination-accent {
          height: 32px;
          width: 64px;

          margin: 0px 0px 4px 0px;
        }

        .destination-label {
          margin: 0px;
        }
      }

      .segment-inactive:hover {
        .destination-accent {
          width: 64px;
        }
      }
    }
  }

  &.rail {
    flex-direction: column;

    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;

    .destinations {
      flex-direction: column;
      justify-content: flex-start;

      width: 100%;
    }
  }
}
</style>
