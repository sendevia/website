import { useClipboard } from "@vueuse/core";

/**
 * 复制锚点链接到剪贴板
 * @param href - 锚点 URL
 * @param onCopied - 复制成功后的回调函数
 */
export const useAchorLink = (href: string, onCopied?: () => void) => {
  const { copy: copyToClipboard } = useClipboard();

  const handleCopy = async () => {
    const anchorId = href.startsWith("#") ? href : `#${href}`;
    const fullUrl = `${window.location.origin}${window.location.pathname}${anchorId}`;

    await copyToClipboard(fullUrl);
    onCopied?.();
  };

  return { handleCopy };
};
