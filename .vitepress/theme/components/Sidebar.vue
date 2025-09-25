<script setup lang="ts">
import { computed } from "vue";

import { useGlobalData } from "../composables/useGlobalData";
const { page } = useGlobalData();

const navItems = computed(() => [
  { text: "首页", icon: "home", link: "/" },
  { text: "所有文章", icon: "list", link: "/posts" },
  { text: "Markdown 示例", icon: "counter_1", link: "/posts/markdown-examples" },
  { text: "API 示例", icon: "counter_2", link: "/posts/api-examples" },
  { text: "Markdown it", icon: "counter_3", link: "/posts/markdown-it" },
]);

function isActive(link: string) {
  const current = page.value.relativePath.replace(/(\/index)?\.md$/, "");
  const target = link.replace(/\/$/, "").replace(/\.html$/, "");
  return current === target.replace(/^\//, "") || (target === "" && current === "index");
}
</script>

<template>
  <nav id="navigation" spec="rail">
    <a href="/search.html" id="navigation-fab">
      <span>search</span>
    </a>
    <ul id="navigation-destinations">
      <li v-for="item in navItems" :key="item.link" :class="isActive(item.link) ? 'navigation-segment-active' : 'navigation-segment-inactive'">
        <a :href="item.link">
          <div class="navigation-destination-accent">
            <div class="navigation-segment-icon">
              <span>
                {{ item.icon }}
              </span>
            </div>
          </div>
          <div class="navigation-destination-label">
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

#navigation {
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

  #navigation-fab {
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

  #navigation-destinations {
    display: flex;
    flex-grow: 1;

    padding: 0px;

    transition: var(--md-sys-motion-duration-medium4) var(--md-sys-motion-easing-standard) var(--md-sys-motion-duration-short4);

    .navigation-segment-active {
      a {
        display: flex;
        align-items: center;
        align-self: stretch;
        flex-direction: column;
        gap: 8px;

        width: 100%;
      }

      .navigation-destination-accent {
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

        .navigation-segment-icon {
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

      .navigation-destination-label {
        @include mixin.typescale-style("label-small");

        margin-bottom: 6px;

        color: var(--md-sys-color-on-surface);
        text-align: center;
        text-decoration: none;

        opacity: 1;
      }

      &:hover {
        .navigation-destination-accent {
          .navigation-segment-icon span {
            font-variation-settings: "FILL" 1, "wght" 500;
          }
        }
      }
    }

    .navigation-segment-inactive {
      @extend .navigation-segment-active;

      .navigation-destination-accent {
        background-color: transparent;

        transition: var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);

        .navigation-segment-icon span {
          font-variation-settings: "FILL" 0, "wght" 300;
        }
      }

      .navigation-destination-label {
        opacity: 0.8;
      }

      &:hover {
        .navigation-destination-accent {
          background-color: var(--md-sys-color-surface-container-high);

          .navigation-segment-icon span {
            font-variation-settings: "FILL" 0, "wght" 600;
          }
        }

        .navigation-destination-label {
          opacity: 1;
        }
      }

      &:active {
        .navigation-destination-accent {
          .navigation-segment-icon span {
            font-variation-settings: "FILL" 0, "wght" 200;
          }
        }
      }
    }
  }

  &[spec="bar"] {
    flex-direction: row;

    bottom: 0px;

    height: 80px;
    width: 100%;

    overflow-y: hidden;
    z-index: 5;

    #navigation-Hero,
    #navigation-fab {
      display: none;
    }

    #navigation-destinations {
      align-items: center;
      flex-direction: row;
      justify-content: space-around;

      div[spec="menu"] {
        display: none !important;
      }

      .navigation-segment-active {
        margin: 0px 4px 0px 4px;

        .navigation-destination-accent {
          height: 32px;
          width: 64px;

          margin: 0px 0px 4px 0px;
        }

        .navigation-destination-label {
          margin: 0px;
        }
      }

      .navigation-segment-inactive:hover {
        .navigation-destination-accent {
          width: 64px;
        }
      }
    }
  }

  &[spec="rail"] {
    flex-direction: column;

    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
    z-index: 3;

    #navigation-destinations {
      flex-direction: column;
      justify-content: flex-start;

      width: 100%;
    }
  }
}
</style>
