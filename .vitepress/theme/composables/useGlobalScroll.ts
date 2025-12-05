import { ref, computed, onMounted } from "vue";

let container: HTMLElement | Window | null = null;
let isInitialized = false;
let isScrolled = ref(false);
let precision = 1;
let scrollPosition = ref(0);
let targetScrollable: string = ".content-flow";
let threshold = 80;

const componentCallbacks = new Map<symbol, { threshold: number; callback: (isScrolled: boolean) => void }>();

function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return overflowY === "auto" || overflowY === "scroll" || el.scrollHeight > el.clientHeight;
}

function detectContainer() {
  const el = document.querySelector(targetScrollable);
  if (el && el instanceof HTMLElement && isScrollable(el)) return el;
  return window;
}

function handleGlobalScroll() {
  try {
    const scrollTop = container === window ? window.scrollY || window.pageYOffset : (container as HTMLElement).scrollTop;

    scrollPosition.value = scrollTop;
    isScrolled.value = scrollTop > threshold;

    componentCallbacks.forEach(({ threshold: componentThreshold, callback }) => {
      callback(scrollTop > componentThreshold);
    });
  } catch (e) {
    scrollPosition.value = 0;
    isScrolled.value = false;
    componentCallbacks.forEach(({ callback }) => {
      callback(false);
    });
  }
}

function initGlobalScrollListener(initialThreshold: number = threshold, scrollContainer: string = targetScrollable) {
  if (isInitialized) return;

  threshold = initialThreshold;
  targetScrollable = scrollContainer;

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

function calculatePercentage(precisionValue: number = precision): number {
  try {
    const el = document.querySelector(targetScrollable);
    const scrollContainer = el && el instanceof HTMLElement && isScrollable(el as HTMLElement) ? el : window;

    const scrollTop =
      scrollContainer === window ? window.scrollY || window.pageYOffset : (scrollContainer as HTMLElement).scrollTop;

    let scrollHeight: number, clientHeight: number;

    if (scrollContainer === window) {
      scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      clientHeight = window.innerHeight;
    } else {
      scrollHeight = (scrollContainer as HTMLElement).scrollHeight;
      clientHeight = (scrollContainer as HTMLElement).clientHeight;
    }

    const maxScroll = Math.max(scrollHeight - clientHeight, 0);
    if (maxScroll <= 0) return 0;

    const percentage = Math.min(scrollTop / maxScroll, 1) * 100;
    return Number(percentage.toFixed(precisionValue));
  } catch (e) {
    return 0;
  }
}

export function useGlobalScroll(options?: { threshold?: number; container?: string; precision?: number }) {
  const localThreshold = options?.threshold ?? threshold;
  const localPrecision = options?.precision ?? precision;
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
    scrollPercentage: computed(() => {
      scrollPosition.value;
      return calculatePercentage(localPrecision);
    }),
  };
}

export const globalScrollState = {
  isScrolled: isScrolled,
  threshold: computed(() => threshold),
  scrollPosition: computed(() => scrollPosition.value),
  scrollPercentage: computed(() => {
    scrollPosition.value;
    return calculatePercentage(precision);
  }),
  precision: computed(() => precision),
};
