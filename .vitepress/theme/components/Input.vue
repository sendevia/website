<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  /** 标签文本 */
  label?: string;
  /** 占位符 */
  placeholder?: string;
  /** 输入框类型 */
  type?: string;
  /** 变体：filled (填充) 或 outlined (描边) */
  variant?: "filled" | "outlined";
  /** 是否处于错误状态 */
  error?: boolean;
  /** 辅助文本或错误信息 */
  supportText?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  variant: "filled",
  placeholder: "",
});

const modelValue = defineModel<string | number>();

/** 判断是否有值 */
const hasValue = computed(() => {
  if (modelValue.value === undefined || modelValue.value === null) return false;
  return modelValue.value.toString().length > 0;
});
</script>

<template>
  <div
    class="MaterialInput"
    :class="[
      variant,
      {
        'has-value': hasValue,
        error: error,
        disabled: disabled,
      },
    ]"
  >
    <div class="input-container">
      <StateLayer />
      <input v-model="modelValue" :type="type" :placeholder="placeholder" :disabled="disabled" />
      <label v-if="label">{{ label }}</label>
    </div>
    <div v-if="supportText" class="support-text" :class="{ 'error-text': error }">
      {{ supportText }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Input");
</style>
