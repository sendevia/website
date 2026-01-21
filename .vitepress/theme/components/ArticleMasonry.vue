<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useBreakpoints, onClickOutside, useSorted } from "@vueuse/core";
import { usePostStore, type PostData } from "../stores/posts";
import { useGlobalData } from "../composables/useGlobalData";

const postsStore = usePostStore();
const { theme } = useGlobalData();

/** 设置面板是否打开 */
const isSettingsOpen = ref(false);
/** 设置面板的 DOM 引用 */
const settingsPanelRef = ref<HTMLElement | null>(null);
/** 触发按钮的 DOM 引用 */
const settingsTriggerRef = ref<HTMLElement | null>(null);
/** 选中的分类（单选，空字符串代表全部） */
const selectedCategory = ref("");
/** 选中的标签（多选，空数组代表全部） */
const selectedTags = ref<string[]>([]);
/** 排序字段: `date` | `title` */
const sortField = ref<"date" | "title">("date");
/** 排序方向: `desc` (降序/Z-A) | `asc` (正序/A-Z) */
const sortOrder = ref<"desc" | "asc">("desc");
/** 默认每页文章数量 */
const pageSize = ref(20);
/** 下拉框可选择的每页文章数量 */
const pageSizeOptions = [20, 40, 60, 100];
/** 当前页 */
const currentPage = ref(1);
/** 页码跳转输入框的引用 */
const pageInputRef = ref<HTMLInputElement | null>(null);
/** 是否正在编辑页码 */
const isEditingPage = ref(false);
/** 编辑时的临时页码绑定值 */
const inputPageNum = ref<number | "">("");

/**
 * 监听排序字段变化，自动调整排序方向
 * 标题：默认正序 (A-Z)
 * 时间：默认倒序 (最新在前)
 */
watch(sortField, (val) => {
  if (val === "title") {
    sortOrder.value = "asc";
  } else {
    sortOrder.value = "desc";
  }
});

/**
 * 监听筛选或排序条件变化
 * 重置页码
 */
watch(
  [pageSize, selectedCategory, selectedTags, sortField, sortOrder],
  () => {
    currentPage.value = 1;
  },
  { deep: true },
);

/** 响应式断点配置 */
const breakpoints = useBreakpoints({
  mobile: 600,
  tablet: 840,
  desktop: 1200,
  large: 1600,
});

/**
 * 根据屏幕宽度计算当前的列数
 * @returns {number} 列数（挂载前默认为 1）
 */
const columnCount = computed(() => {
  if (breakpoints.greaterOrEqual("large").value) return 4;
  if (breakpoints.greaterOrEqual("desktop").value) return 3;
  if (breakpoints.greaterOrEqual("tablet").value) return 3;
  if (breakpoints.greaterOrEqual("mobile").value) return 2;
  return 1;
});

/**
 * 获取仅经过筛选（未排序）的文章列表
 * 逻辑：筛选分类和标签
 */
const filteredRawList = computed(() => {
  let posts = [...(postsStore.posts || [])];

  // 分类筛选
  if (selectedCategory.value) {
    posts = posts.filter((p) => p.categories.includes(selectedCategory.value));
  }

  // 标签筛选
  if (selectedTags.value.length > 0) {
    posts = posts.filter((p) => {
      return selectedTags.value.every((tag) => p.tags.includes(tag));
    });
  }

  return posts;
});

/**
 * 对筛选后的列表进行排序
 * 逻辑：根据 sortField 和 sortOrder 排序
 */
const sortedArticlesList = useSorted(filteredRawList, (a, b) => {
  let comparison = 0;

  if (sortField.value === "date") {
    // 时间比较
    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
  } else {
    // 标题比较
    comparison = String(a.title).localeCompare(String(b.title));
  }

  // 处理正序/倒序
  return sortOrder.value === "asc" ? comparison : -comparison;
});

/**
 * 点击外部关闭面板
 * 忽略点击触发按钮本身，防止点击按钮时立即关闭
 */
onClickOutside(
  settingsPanelRef,
  () => {
    isSettingsOpen.value = false;
  },
  { ignore: [settingsTriggerRef] },
);

/** 计算总页数 */
const totalPages = computed(() => {
  const count = Math.ceil(sortedArticlesList.value.length / pageSize.value);
  return count > 0 ? count : 1;
});

/** 计算每页显示的文章（基于排序后的列表） */
const displayArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedArticlesList.value.slice(start, end);
});

/**
 * 将文章数据分配到不同的列数组中
 * @returns {PostData[][]} 瀑布流分组数据
 */
const masonryGroups = computed(() => {
  const count = columnCount.value;
  const groups: PostData[][] = Array.from({ length: count }, () => []);

  displayArticles.value.forEach((item, index) => {
    groups[index % count].push(item);
  });

  return groups;
});

/**
 * 获取逻辑序号
 * @param colIndex 列索引
 * @param rowIndex 行索引
 */
const getLogicIndex = (colIndex: number, rowIndex: number): number => {
  return rowIndex * columnCount.value + colIndex;
};

/**
 * 获取文章展示图
 * @param item 文章数据
 */
const getArticleImage = (item: PostData): string[] => {
  if (item.impression?.length) return item.impression;
  return theme.value?.defaultImpression ? [theme.value.defaultImpression] : [];
};

/**
 * 检查文章是否有下载内容
 * @param item 文章数据
 */
const hasDownloadableContent = (item: PostData): boolean => {
  return Array.isArray(item.external_links) && item.external_links.some((link) => link.type === "download");
};

/**
 * 切换页码并滚动到顶部
 * @param page 目标页码
 */
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  if (typeof window !== "undefined") {
    const container = document.querySelector(".content-flow");
    if (container) {
      (container as HTMLElement).scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

/** 激活页码编辑模式 */
const startEditPage = async () => {
  inputPageNum.value = currentPage.value;
  isEditingPage.value = true;
  await nextTick();
  pageInputRef.value?.focus();
};

/** 处理页码输入回车跳转 */
const handlePageJump = () => {
  const val = Number(inputPageNum.value);
  if (!isNaN(val) && val >= 1 && val <= totalPages.value) {
    changePage(val);
  }
  isEditingPage.value = false;
};

/** 切换分类选择 */
const toggleCategory = (cat: string) => {
  selectedCategory.value = selectedCategory.value === cat ? "" : cat;
};

/** 切换标签选择 (多选) */
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

/** 清除所有标签筛选 */
const clearTags = () => {
  selectedTags.value = [];
};
</script>

<template>
  <div class="ArticleMasonry">
    <ClientOnly>
      <div class="toolbar">
        <div class="filter">
          <div ref="settingsTriggerRef">
            <MaterialButton size="s" color="text" icon="page_info" @click="isSettingsOpen = !isSettingsOpen">
              列表设置
            </MaterialButton>
          </div>

          <Transition name="expand" mode="out-in">
            <aside v-if="isSettingsOpen" class="panel">
              <div ref="settingsPanelRef" class="container">
                <div class="section">
                  <div class="section-header">
                    <h6>排序</h6>
                  </div>
                  <div class="page-size-options">
                    <MaterialButton
                      :color="sortField === 'date' ? 'filled' : 'tonal'"
                      size="s"
                      class="group horizontal"
                      icon="acute"
                      @click="sortField = 'date'"
                    >
                      时间
                    </MaterialButton>
                    <MaterialButton
                      :color="sortField === 'title' ? 'filled' : 'tonal'"
                      size="s"
                      class="group horizontal"
                      icon="match_case"
                      @click="sortField = 'title'"
                    >
                      标题
                    </MaterialButton>
                    <div>
                      <MaterialButton
                        :icon="sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'"
                        color="tonal"
                        size="s"
                        @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                      >
                        {{ sortOrder === "asc" ? "正序" : "倒序" }}
                      </MaterialButton>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <div class="section-header">
                    <h6>每页显示</h6>
                  </div>
                  <div class="page-size-options">
                    <MaterialButton
                      v-for="opt in pageSizeOptions"
                      :key="opt"
                      :color="pageSize === opt ? 'filled' : 'tonal'"
                      :icon="pageSize === opt ? 'check' : ''"
                      class="group horizontal"
                      size="s"
                      @click="pageSize = opt"
                    >
                      {{ opt }}
                    </MaterialButton>
                  </div>
                </div>

                <div class="section">
                  <div class="section-header">
                    <h6>分类 <span v-if="selectedCategory" @click="selectedCategory = ''">clear</span></h6>
                  </div>
                  <div class="chip-container">
                    <MaterialChip
                      v-for="cat in postsStore.allCategories"
                      :key="cat"
                      :color="selectedCategory === cat ? 'tonal' : 'outlined'"
                      :icon="selectedCategory === cat ? 'check' : ''"
                      @click="toggleCategory(cat)"
                    >
                      {{ cat }}
                    </MaterialChip>
                  </div>
                </div>

                <div class="section">
                  <div class="section-header">
                    <h6>标签 <span v-if="selectedTags.length" @click="clearTags">clear</span></h6>
                  </div>
                  <div class="chip-container">
                    <MaterialChip
                      v-for="tag in postsStore.allTags"
                      :key="tag"
                      :color="selectedTags.includes(tag) ? 'tonal' : 'outlined'"
                      :icon="selectedTags.includes(tag) ? 'check' : ''"
                      @click="toggleTag(tag)"
                    >
                      {{ tag }}
                    </MaterialChip>
                  </div>
                </div>
              </div>
            </aside>
          </Transition>
        </div>
      </div>

      <div class="masonry-wrapper">
        <div v-if="displayArticles.length === 0" class="empty-state">
          <span class="icon">filter_list_off</span>
          <p class="label">没有找到匹配的文章</p>
        </div>
        <div v-for="(column, colIndex) in masonryGroups" :key="colIndex" class="masonry-column">
          <MaterialCard
            v-for="(item, rowIndex) in column"
            :key="item.id"
            :href="item.url"
            :title="item.title"
            :description="item.description"
            :date="item.date"
            :impression="getArticleImage(item)"
            :downloadable="hasDownloadableContent(item)"
            :tabindex="getLogicIndex(colIndex, rowIndex) + 1"
            :style="{ '--delay': getLogicIndex(colIndex, rowIndex) }"
            class="entrance"
            variant="feed"
            size="m"
            color="outlined"
          />
        </div>
      </div>

      <div v-if="totalPages > 1" class="page-navigator">
        <MaterialButton
          :disabled="currentPage === 1"
          :color="currentPage === 1 ? 'text' : 'filled'"
          @click="changePage(currentPage - 1)"
          >上一页</MaterialButton
        >
        <div @click="startEditPage" class="page-info-wrapper" title="点击跳转页码">
          <p v-if="!isEditingPage" class="page-info-text">{{ currentPage }} / {{ totalPages }}</p>
          <input
            v-else
            ref="pageInputRef"
            v-model="inputPageNum"
            @keydown.enter="handlePageJump"
            @blur="isEditingPage = false"
            type="text"
            min="1"
            class="page-jump-input"
          />
        </div>
        <MaterialButton
          :disabled="currentPage === totalPages"
          :color="currentPage === totalPages ? 'text' : 'filled'"
          @click="changePage(currentPage + 1)"
          >下一页</MaterialButton
        >
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ArticleMasonry");
</style>
