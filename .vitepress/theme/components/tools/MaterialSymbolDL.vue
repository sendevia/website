<script setup lang="ts">
/**
 * Google 图标 URL 构建器工具组件
 */
import { ref, computed } from "vue";
import { useClipboard, useFetch, useLocalStorage, useStyleTag } from "@vueuse/core";

/** 输入框绑定的图标名称字符串 */
const iconNamesInput = ref("");
/** 图标持久化队列 */
const iconQueue = useLocalStorage<string[]>("icon-queue", [], {
  serializer: {
    read: (raw: string) => {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // 从 localStorage 加载时进行排序
          return parsed.sort((a, b) => a.localeCompare(b));
        }
        return [];
      } catch {
        return [];
      }
    },
    write: (value: string[]) => JSON.stringify(value),
  },
});
/** 下载状态 */
const isDownloading = ref(false);
/** Google 字体基础 URL */
const baseUrl =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
/** 计算完整的 URL，包含队列中的图标名称 */
const fullUrl = computed(() => {
  const names = iconQueue.value.join(",");
  if (!names) return "";
  return `${baseUrl}&icon_names=${names}&display=block`;
});
/** 图标 CSS 缓存 */
const iconCssCache = useLocalStorage<Record<string, string>>("icon-cache", {});

/**
 * 获取单个图标的 Raw CSS
 * @param name 图标名称
 */
async function fetchIconCss(name: string) {
  if (iconCssCache.value[name]) return;
  const url = `${baseUrl}&icon_names=${name}&display=block`;
  try {
    const { data } = await useFetch(url).text();
    if (data.value) {
      iconCssCache.value[name] = data.value;
    }
  } catch (e) {
    console.error(`获取图标 ${name} 失败:`, e);
  }
}

/** 监听队列，触发新图标的抓取 */
import { watch } from "vue";
watch(
  iconQueue,
  (newQueue) => {
    const uniqueNames = [...new Set(newQueue)];
    uniqueNames.forEach((name) => {
      if (!iconCssCache.value[name]) {
        fetchIconCss(name);
      }
    });
  },
  { immediate: true, deep: true },
);

/** 生成聚合后的样式内容，作用域限定在组件内 */
const scopedStyleContent = computed(() => {
  let combinedStyles = "";
  iconQueue.value.forEach((name, index) => {
    const raw = iconCssCache.value[name];
    if (raw) {
      // 为每个项生成唯一的标识，防止样式冲突
      const uniqueId = `item-${name}-${index}`;
      const familyName = `preview-${index}`;
      const transformed = raw
        .replace(/'Material Symbols Outlined'/g, `'${familyName}'`)
        .replace(/\.material-symbols-outlined/g, `.${uniqueId}`);
      combinedStyles += transformed + "\n";
    }
  });
  return combinedStyles;
});

/** 注入聚合后的独立样式 */
useStyleTag(scopedStyleContent);

/** 处理复制 */
const { copy, copied } = useClipboard({ source: fullUrl });

/** 记录需要显示重复动画的项索引 */
const duplicateIndices = ref<Set<number>>(new Set());

/** 将输入框中的图标名称添加到队列尾部 */
function addToQueue() {
  const input = iconNamesInput.value.trim();
  if (!input) return;

  // 支持逗号和空格分隔，并过滤无效字符（包括各种引号）
  const names = input
    .split(/[,，\s]+/) // 支持逗号、中文逗号和空格分隔
    .map((n) => n.replace(/[^a-zA-Z0-9_]/g, "")) // 保留字母、数字、下划线
    .filter((n) => n.length > 0); // 过滤空字符串

  names.forEach((name) => {
    const existingIndex = iconQueue.value.indexOf(name);
    if (existingIndex !== -1) {
      // 如果已存在，触发动画
      duplicateIndices.value.add(existingIndex);
    } else {
      // 如果不存在，添加
      iconQueue.value.push(name);
    }
  });

  // 添加后按字母顺序排序
  iconQueue.value.sort((a, b) => a.localeCompare(b));

  iconNamesInput.value = "";
}

/** 动画结束后移除重复状态 */
function onAnimationEnd(index: number) {
  duplicateIndices.value.delete(index);
}

/** 从队列中删除指定图标 */
function removeFromQueue(index: number) {
  iconQueue.value.splice(index, 1);
  // 清理重复标记集
  duplicateIndices.value.delete(index);
}

/** 下载整个队列合并后的字体 */
async function downloadFont() {
  if (iconQueue.value.length === 0 || isDownloading.value) return;

  isDownloading.value = true;
  try {
    const { data: cssText, error: cssError } = await useFetch(fullUrl.value, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }).text();

    if (cssError.value || !cssText.value) {
      throw new Error(String(cssError.value) || "无法获取 CSS 内容");
    }

    const match = cssText.value.match(/src:\s*url\((.*?)\)/);
    if (!match || !match[1]) {
      throw new Error("无法从 CSS 中解析出字体 URL");
    }

    const fontUrl = match[1].replace(/['"]/g, "");
    const { data: fontBlob, error: fontError } = await useFetch(fontUrl).blob();

    if (fontError.value || !fontBlob.value) {
      throw new Error(String(fontError.value) || "无法获取字体文件");
    }

    // 创建下载链接并触发下载
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(fontBlob.value);
    downloadLink.download = `MaterialSymbolsOutlined-${iconQueue.value.length}pcs.woff2`;
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    console.error("字体下载失败:", error);
    alert("下载失败，请检查控制台或网络。");
  } finally {
    isDownloading.value = false;
  }
}

/** 清空队列 */
function clearQueue() {
  iconQueue.value = [];
}
</script>

<template>
  <div class="MaterialSymbolDL">
    <div class="section input">
      <MaterialInput
        v-model="iconNamesInput"
        type="text"
        variant="outlined"
        label="图标名称"
        placeholder="输入多个名称，用逗号或空格分隔"
        @keyup.enter="addToQueue"
      ></MaterialInput>
    </div>

    <div v-if="iconQueue.length > 0" class="section queue">
      <div class="queue-header">
        <span>当前队列 ({{ iconQueue.length }})</span>
        <MaterialButton class="clear-btn" color="tonal" @click="clearQueue">清空全部</MaterialButton>
      </div>
      <div class="queue-grid">
        <div
          v-for="(name, index) in iconQueue"
          :key="index"
          class="card"
          :class="{ duplicate: duplicateIndices.has(index) }"
          @animationend="onAnimationEnd(index)"
        >
          <span class="preview-icon" :class="`item-${name}-${index}`">{{ name }}</span>
          <span class="icon-name">{{ name }}</span>
          <MaterialButton class="delete-btn" icon="close" title="删除" @click="removeFromQueue(index)" />
        </div>
      </div>
    </div>

    <div class="section action">
      <MaterialButton icon="add" @click="addToQueue" />
      <MaterialButton v-if="iconQueue.length !== 0" color="outlined" icon="content_copy" @click="copy()">
        {{ copied ? "已复制！" : "复制 URL" }}
      </MaterialButton>
      <MaterialButton v-if="iconQueue.length !== 0 || isDownloading" color="filled" @click="downloadFont">
        {{ isDownloading ? "下载中..." : "下载字体 (.woff2)" }}
      </MaterialButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../../styles/components/tools/MaterialSymbolDL");
</style>
