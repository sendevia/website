<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";
const { frontmatter } = useGlobalData();
</script>

<template>
  <header>
    <div class="header">
      <svg width="0" height="0">
        <filter id="noise-filter">
          <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="5" :seed="Date.now()" result="noise" />
          <feColorMatrix type="saturate" values="0" result="desaturatedNoise" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 1" />
            <feFuncG type="discrete" tableValues="0 1" />
            <feFuncB type="discrete" tableValues="0 1" />
            <feFuncA type="discrete" tableValues="1 1" />
          </feComponentTransfer>
        </filter>
      </svg>
      <div id="header-hero-container">
        <span id="header-hero-headline">{{ frontmatter.title }}</span>
        <span id="header-hero-subtitle">{{ frontmatter.description }}</span>
        <div id="header-impression">
          <div id="header-impression-noise"></div>
          <div
            id="header-impression-image"
            :style="{ backgroundImage: frontmatter.impression ? `url('${frontmatter.impression}')` : '' }"
            :impression-color="frontmatter.color"
          ></div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss">
@use "sass:meta";
@use "../styles/mixin";

.header {
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
      @include mixin.typescale-style("display-large", $font-size: 90rem, $font-weight: 700, $line-height: 90rem);

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

  @media screen and (max-width: 1200px) {
    height: 45vh;
    min-height: 360px;

    #header-hero-container {
      grid-column: span 2;

      padding: 5vw;

      #header-hero-headline {
        @include mixin.typescale-style("display-large", $font-size: 7vw, $font-weight: 500, $line-height: 7vw);
      }

      #header-hero-subtitle {
        @include mixin.typescale-style("display-small", $font-size: 18rem, $font-weight: 500, $line-height: 20rem);
      }
    }
  }

  @media screen and (max-width: 840px) {
    #header-hero-container {
      width: 100%;

      #header-hero-headline {
        @include mixin.typescale-style("display-large", $font-size: 8vw, $font-weight: 600, $line-height: 8vw);
      }

      #header-hero-subtitle {
        @include mixin.typescale-style("headline-large", $font-size: 23rem, $line-height: 23rem);
      }
    }
  }

  @media screen and (max-width: 600px) {
    #header-hero-container {
      padding: 30px;

      #header-hero-headline {
        @include mixin.typescale-style("display-large", $font-size: 40rem, $font-weight: 700, $line-height: 40rem);

        word-break: break-word;
      }

      #header-hero-subtitle {
        @include mixin.typescale-style("display-small", $font-size: 15rem, $font-weight: 400, $line-height: 17rem);
      }
    }
  }
}
</style>
