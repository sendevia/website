import { ref, computed, onMounted } from "vue";

let container: HTMLElement | Window | null = null;
let isInitialized = false;
let isScrolled = ref(false);
let scrollPosition = ref(0);
let targetElementSelector: string = "#layout-content-flow";
let threshold = 80;

const componentCallbacks = new Map<symbol, { threshold: number; callback: (isScrolled: boolean) => void }>();

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return overflowY === "auto" || overflowY === "scroll" || el.scrollHeight > el.clientHeight;
}

function detectContainer() {
  const el = document.querySelector(targetElementSelector);
  if (el && el instanceof HTMLElement && isScrollable(el)) return el;
  return window;
}

function handleGlobalScroll() {
  try {
    const scrollTop = container === window ? window.scrollY || window.pageYOffset : (container as HTMLElement).scrollTop;

    scrollPosition.value = scrollTop;

    isScrolled.value = scrollTop > threshold;

    componentCallbacks.forEach(({ threshold, callback }) => {
      callback(scrollTop > threshold);
    });
  } catch (e) {
    scrollPosition.value = 0;
    isScrolled.value = false;
    componentCallbacks.forEach(({ callback }) => {
      callback(false);
    });
  }
}

function initGlobalScrollListener(threshold: number, scrollContainer: string = "#layout-content-flow") {
  if (isInitialized) return;

  threshold = threshold;
  targetElementSelector = scrollContainer;

  if (typeof window !== "undefined") {
    const updateContainer = () => {
      if (container) {
        const target: any = container;
        target.removeEventListener("scroll", handleGlobalScroll);
      }

      container = detectContainer();

      const target: any = container;
      target.addEventListener("scroll", handleGlobalScroll, { passive: true });

      handleGlobalScroll();
    };

    updateContainer();

    const checkContainerInterval = setInterval(() => {
      const newContainer = detectContainer();
      if (newContainer !== container) {
        updateContainer();
      }
    }, 500);

    isInitialized = true;

    if ((window as any).__cleanup) {
      (window as any).__cleanup.push(() => {
        clearInterval(checkContainerInterval);
        if (container) {
          const target: any = container;
          target.removeEventListener("scroll", handleGlobalScroll);
        }
        componentCallbacks.clear();
      });
    }
  }
}

export function useGlobalScroll(options?: { threshold?: number; container?: string }) {
  const localThreshold = options?.threshold ?? threshold;
  const localIsScrolled = ref(false);
  const componentId = Symbol();
  const updateComponentState = (isScrolled: boolean) => {
    localIsScrolled.value = isScrolled;
  };

  onMounted(() => {
    if (!isInitialized) {
      initGlobalScrollListener(80);
    }

    componentCallbacks.set(componentId, {
      threshold: localThreshold,
      callback: updateComponentState,
    });

    handleGlobalScroll();

    return () => {
      componentCallbacks.delete(componentId);
    };
  });

  return {
    isScrolled: computed(() => localIsScrolled.value),
    scrollPosition: computed(() => {
      if (!container) return 0;
      try {
        return container === window ? window.scrollY || window.pageYOffset : (container as HTMLElement).scrollTop;
      } catch (e) {
        return 0;
      }
    }),
  };
}

export const globalScrollState = {
  isScrolled: isScrolled,
  threshold: computed(() => threshold),
  setThreshold: (newThreshold: number) => {
    threshold = newThreshold;
  },
  scrollPosition: computed(() => scrollPosition.value),
  scrollPercentage: computed(() => {
    if (!container) return 0;
    try {
      const scrollTop = scrollPosition.value;
      const scrollHeight =
        container === window ? document.documentElement.scrollHeight : (container as HTMLElement).scrollHeight;
      const clientHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;
      const maxScroll = Math.max(scrollHeight - clientHeight, 0);

      return maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
    } catch (e) {
      return 0;
    }
  }),
};
