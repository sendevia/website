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
    <a href="/search.html" class="nav-fab">
      <span>search</span>
    </a>
    <ul class="nav-destinations">
      <li
        v-for="item in navSegment"
        :key="item.link"
        :class="isActive(item.link) ? 'nav-segment-active' : 'nav-segment-inactive'"
      >
        <a :href="item.link">
          <div class="nav-destination-accent">
            <div class="nav-segment-icon">
              <span>
                {{ item.icon }}
              </span>
            </div>
          </div>
          <div class="nav-destination-label">
            {{ item.text }}
          </div>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss">
@use "sass:meta";
@use "../styles/mixin";

nav {
  display: flex;
  align-items: center;
  gap: 44px;
  justify-content: space-between;

  background-color: var(--md-sys-color-surface-container-low);

  transition: filter var(--md-sys-motion-duration-extra-long1) var(--md-sys-motion-easing-standard);

  a {
    cursor: pointer;
    text-decoration: none;
  }

  .nav-fab {
    display: flex;
    align-items: center;
    justify-content: center;

    margin-block-start: 44px;
    margin-inline: 20px;

    height: 56px;
    width: 56px;

    color: var(--md-sys-color-on-secondary-container);

    border-radius: var(--md-sys-shape-corner-large);

    background-color: var(--md-sys-color-secondary-container);

    transition: var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-standard);

    span {
      @include mixin.material-symbols();

      height: 24px;
      width: 24px;

      text-align: center;
      font-variation-settings: "FILL" 1, "wght" 300;

      transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
    }

    &:hover span {
      transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);

      font-variation-settings: "FILL" 1, "wght" 600;
    }

    &:active span {
      transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);

      font-variation-settings: "FILL" 1, "wght" 200;
    }
  }

  .nav-destinations {
    display: flex;
    flex-grow: 1;

    padding: 0px;

    transition: var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-standard)
      var(--md-sys-motion-duration-short4);

    .nav-segment-active {
      a {
        display: flex;
        align-items: center;
        align-self: stretch;
        flex-direction: column;
        gap: 8px;

        width: 100%;
      }

      .nav-destination-accent {
        display: flex;
        align-items: center;
        flex: none;
        justify-content: center;

        margin-top: 4px;

        position: relative;

        width: 56px;
        height: 32px;

        border-radius: var(--md-sys-shape-corner-extra-large);

        background-color: var(--md-sys-color-secondary-container);

        overflow: hidden;

        .nav-segment-icon {
          height: 24px;
          width: 24px;

          color: var(--md-sys-color-on-secondary-container);

          pointer-events: none;
          transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);

          span {
            @include mixin.material-symbols();

            font-variation-settings: "FILL" 1, "wght" 300;

            transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
          }
        }
      }

      .nav-destination-label {
        @include mixin.typescale-style("label-small");

        margin-bottom: 6px;

        color: var(--md-sys-color-on-surface);
        text-align: center;
        text-decoration: none;

        opacity: 1;
      }

      &:hover {
        .nav-destination-accent {
          .nav-segment-icon span {
            font-variation-settings: "FILL" 1, "wght" 500;
          }
        }
      }
    }

    .nav-segment-inactive {
      @extend .nav-segment-active;

      .nav-destination-accent {
        background-color: transparent;

        transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);

        .nav-segment-icon span {
          font-variation-settings: "FILL" 0, "wght" 300;
        }
      }

      .nav-destination-label {
        opacity: 0.8;
      }

      &:hover {
        .nav-destination-accent {
          background-color: var(--md-sys-color-surface-container-high);

          .nav-segment-icon span {
            font-variation-settings: "FILL" 0, "wght" 600;
          }
        }

        .nav-destination-label {
          opacity: 1;
        }
      }

      &:active {
        .nav-destination-accent {
          .nav-segment-icon span {
            font-variation-settings: "FILL" 0, "wght" 200;
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
    z-index: 5;

    .nav-fab {
      display: none;
    }

    .nav-destinations {
      align-items: center;
      flex-direction: row;
      justify-content: space-around;

      div[spec="menu"] {
        display: none !important;
      }

      .nav-segment-active {
        margin: 0px 4px 0px 4px;

        .nav-destination-accent {
          height: 32px;
          width: 64px;

          margin: 0px 0px 4px 0px;
        }

        .nav-destination-label {
          margin: 0px;
        }
      }

      .nav-segment-inactive:hover {
        .nav-destination-accent {
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
    z-index: 3;

    .nav-destinations {
      flex-direction: column;
      justify-content: flex-start;

      width: 100%;
    }
  }
}
</style>
