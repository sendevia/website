<script setup lang="ts">
import Header from "../components/Header.vue";

import { onMounted } from "vue";

function copyAnchorLink(this: HTMLElement) {
  const anchor = this as HTMLAnchorElement;
  const href = anchor.getAttribute("href");
  const fullUrl = `${window.location.origin}${window.location.pathname}${href}`;
  navigator.clipboard.writeText(fullUrl);

  const hiddenSpan = anchor.querySelector<HTMLSpanElement>("span.visually-hidden");
  if (hiddenSpan) {
    const originalText = hiddenSpan.textContent;
    hiddenSpan.textContent = "已复制！";
    setTimeout(() => {
      hiddenSpan.textContent = originalText;
    }, 1000);
  }
}

onMounted(() => {
  const anchors = document.querySelectorAll<HTMLAnchorElement>("a.title-anchor");
  anchors.forEach((anchor) => {
    anchor.addEventListener("click", copyAnchorLink);
  });
});
</script>

<template>
  <article>
    <Header />
    <section>
      <Content />
    </section>
  </article>
</template>
