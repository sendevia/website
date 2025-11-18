<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useGlobalData } from "../composables/useGlobalData";

const { page, frontmatter, theme } = useGlobalData();
const seed = ref(1);
const defaultImpression = theme.value.defaultImpression;

if (typeof window !== "undefined") {
  onMounted(() => {
    seed.value = Date.now();
  });
}
</script>

<template>
  <header>
    <div id="header-hero-container">
      <span id="header-hero-headline">{{ frontmatter.title ? frontmatter.title : page.title }}</span>
      <span id="header-hero-subtitle">{{ frontmatter.description }}</span>
      <div id="header-impression">
        <svg width="0" height="0">
          <filter id="noise-filter">
            <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="5" :seed="seed" result="noise" />
            <feColorMatrix type="saturate" values="0" result="desaturatedNoise" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 1" />
              <feFuncG type="discrete" tableValues="0 1" />
              <feFuncB type="discrete" tableValues="0 1" />
              <feFuncA type="discrete" tableValues="1 1" />
            </feComponentTransfer>
          </filter>
        </svg>
        <div id="header-impression-noise"></div>
        <div
          id="header-impression-image"
          :style="{
            backgroundImage: frontmatter.impression ? `url('${frontmatter.impression}')` : `url('${defaultImpression}')`,
          }"
          :impression-color="frontmatter.color"
          loading="lazy"
        ></div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@use "../styles/mixin";

header {
  grid-column: span 12;

  position: relative;

  height: 540px;

  word-break: break-word;

  svg {
    display: none;
  }

  #header-hero-container {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    justify-content: center;

    position: relative;

    height: 100%;

    padding: 54px;

    color: var(--md-ref-palette-secondary100);

    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--md-sys-color-outline-variant);

    overflow: hidden;
    transition: var(--md-sys-motion-duration-extra-long4) var(--md-sys-motion-easing-standard);
    z-index: 1;

    #header-hero-headline {
      @include mixin.typescale-style(
        "display-large",
        $font-size: 90rem,
        $line-height: 90rem,
        $font-variation-settings: "wght" 700
      );

      width: 100%;

      text-align: center;

      mix-blend-mode: hard-light;
      transition: var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
    }

    #header-hero-subtitle {
      @include mixin.typescale-style("headline-large", $font-size: 22rem, $line-height: 22rem);

      width: 100%;

      text-align: center;

      mix-blend-mode: hard-light;
      transition: var(--md-sys-motion-duration-short1) var(--md-sys-motion-easing-standard);
    }

    #header-impression {
      position: absolute;
      left: 0px;
      top: 0px;

      height: 100%;
      width: 100%;

      background-color: var(--md-ref-palette-secondary48);

      transition: background-color var(--md-sys-motion-duration-extra-long4) var(--md-sys-motion-easing-standard);
      z-index: -1;

      #header-impression-noise {
        position: relative;

        height: 100%;
        width: 100%;

        filter: url(#noise-filter);
        mix-blend-mode: soft-light;
        opacity: 0.2;
        z-index: 2;
      }

      #header-impression-image {
        position: absolute;
        left: 0px;
        top: 0px;

        height: 100%;
        width: 100%;

        background: center/cover no-repeat;

        opacity: 0.8;
        z-index: 1;
      }

      @media (prefers-color-scheme: dark) {
        background-color: var(--md-ref-palette-secondary10);

        #header-impression-noise {
          opacity: 0.1;
        }

        #header-impression-image {
          opacity: 0.4;
        }
      }
    }
  }
}

@media screen and (max-width: 1600px) {
  header {
    grid-column: span 12;
  }
}

@media screen and (max-width: 1200px) {
  header {
    grid-column: span 8;

    height: 45vh;
    min-height: 360px;

    #header-hero-container {
      padding: 5vw;

      #header-hero-headline {
        @include mixin.typescale-style(
          "display-large",
          $font-size: 7vw,
          $line-height: 7vw,
          $font-variation-settings: "wght" 500
        );
      }

      #header-hero-subtitle {
        @include mixin.typescale-style(
          "display-small",
          $font-size: 18rem,
          $line-height: 20rem,
          $font-variation-settings: "wght" 500
        );
      }
    }
  }
}

@media screen and (max-width: 840px) {
  header {
    grid-column: span 6;

    #header-hero-container {
      width: 100%;

      #header-hero-headline {
        @include mixin.typescale-style(
          "display-large",
          $font-size: 8vw,
          $line-height: 8vw,
          $font-variation-settings: "wght" 600
        );
      }

      #header-hero-subtitle {
        @include mixin.typescale-style("headline-large", $font-size: 23rem, $line-height: 23rem);
      }
    }
  }
}

@media screen and (max-width: 600px) {
  header {
    grid-column: span 4;

    #header-hero-container {
      padding: 30px;

      #header-hero-headline {
        @include mixin.typescale-style(
          "display-large",
          $font-size: 40rem,
          $line-height: 40rem,
          $font-variation-settings: "wght" 700
        );

        word-break: break-word;
      }

      #header-hero-subtitle {
        @include mixin.typescale-style(
          "display-small",
          $font-size: 15rem,
          $line-height: 17rem,
          $font-variation-settings: "wght" 400
        );
      }
    }
  }
}
</style>
