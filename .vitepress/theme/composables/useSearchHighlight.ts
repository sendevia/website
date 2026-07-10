import { watch, nextTick } from "vue";
import { useRoute } from "vitepress";

/**
 * 在文章页面中定位并高亮搜索关键词
 * 使用 W3C Text Fragments 标准（#:~:text=），通过 location.hash 通知浏览器处理标记与跳转
 *
 * 先由 SearchOverlay 通过 sessionStorage 传递关键词，
 * 路由跳转完成后，本组合式函数用 location.hash 设置 text fragment，
 * 浏览器原生处理匹配文本的高亮与滚动定位。
 */
export function useSearchHighlight() {
  const route = useRoute();

  watch(
    () => route.path,
    () => {
      const keyword = sessionStorage.getItem("search:keyword");
      const url = sessionStorage.getItem("search:url");

      if (!keyword || !url) return;

      sessionStorage.removeItem("search:keyword");
      sessionStorage.removeItem("search:url");

      // 等待 DOM 渲染完成后，通过 location.hash 触发浏览器 text fragment 处理
      nextTick(() => {
        location.hash = ":~:text=" + encodeURIComponent(keyword);
      });
    },
    { immediate: true },
  );
}
