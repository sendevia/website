<script setup lang="ts">
/**
 * MD3E 按钮组组件
 * 支持单选/多选/必选状态、standard/connected 变种、数组驱动配置
 * https://m3.material.io/components/button-groups/specs
 */
import { computed, provide, ref, watch } from "vue";
import Button from "./Button.vue";
import type { ButtonColor, ButtonConfig, ButtonShape, ButtonSize, ButtonVariant } from "../composables/useButtonGroup";
import { BUTTON_GROUP_KEY } from "../composables/useButtonGroup";

interface Props {
  /** 布局变种 */
  variant?: "standard" | "connected";
  /** 组内按钮默认变体，可被单个配置覆盖 */
  buttonVariant?: ButtonVariant;
  /** 选择模式：单选 / 多选 / 必选（至少一个） */
  selectionMode?: "single" | "multi" | "required";
  /** 受控选中值（v-model），single 下为 string，multi/required 下为 string[] */
  modelValue?: string | string[];
  /** 数组驱动的按钮配置 */
  buttons?: ButtonConfig[];
  /** 组级默认尺寸 */
  size?: ButtonSize;
  /** 组级默认颜色 */
  color?: ButtonColor;
  /** 组级默认形状 */
  shape?: ButtonShape;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "standard",
});

const emit = defineEmits<{
  /** 选中值变更，配合 v-model 使用 */
  "update:modelValue": [value: string | string[]];
  /** 任意按钮被点击，携带其 value */
  change: [value: string];
}>();

/** 内部选中集合 */
const selected = ref<Set<string>>(new Set());

/** 根据 modelValue 同步内部状态 */
function syncFromModel(v: string | string[] | undefined) {
  if (v === undefined) return;
  selected.value = new Set(Array.isArray(v) ? v : [v]);
}

syncFromModel(props.modelValue);
watch(() => props.modelValue, syncFromModel);

/** 判断某值是否被选中 */
function isSelected(value: string): boolean {
  return selected.value.has(value);
}

/** 切换选中状态，遵守 selectionMode 规则 */
function toggle(value: string) {
  const mode = props.selectionMode;
  if (!mode) return;

  const cur = new Set(selected.value);

  if (mode === "single") {
    cur.has(value) ? cur.delete(value) : (cur.clear(), cur.add(value));
  } else if (mode === "multi") {
    cur.has(value) ? cur.delete(value) : cur.add(value);
  } else if (mode === "required") {
    if (cur.has(value) && cur.size > 1) cur.delete(value);
    else if (!cur.has(value)) cur.add(value);
  }

  selected.value = cur;
  emit("change", value);

  const arr = Array.from(cur);
  emit("update:modelValue", mode === "single" ? (arr[0] ?? "") : arr);
}

provide(BUTTON_GROUP_KEY, {
  selectionMode: props.selectionMode,
  variant: props.buttonVariant,
  size: props.size,
  color: props.color,
  shape: props.shape,
  isSelected,
  toggle,
});

/** 根元素 CSS class */
const groupClass = computed(() => ["ButtonGroup", props.variant]);
</script>

<template>
  <div :class="groupClass">
    <template v-if="buttons?.length">
      <Button
        v-for="btn in buttons"
        :key="btn.value"
        :data-group-value="btn.value"
        :variant="btn.variant"
        :size="btn.size"
        :color="btn.color"
        :shape="btn.shape"
        :icon="btn.icon"
        :href="btn.href"
        :target="btn.target"
        :disabled="btn.disabled"
      >
        {{ btn.label }}
      </Button>
    </template>
    <slot v-else />
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ButtonGroup");
</style>
