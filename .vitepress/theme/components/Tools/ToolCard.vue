<script setup lang="ts">
import { ref, computed, type Component } from "vue";
import MaterialSymbolDL from "./MaterialSymbolDL.vue";

const props = defineProps<{
  /** 工具组件ID */
  id: string;
}>();

/** 根据工具页面传入的工具组件id选择展示的工具组件 */
const toolComponents: Record<string, Component> = {
  msdl: MaterialSymbolDL,
};

/** 当前需要展示的工具组件 */
const currentComponent = computed(() => toolComponents[props.id]);

/** 工具信息对象，包含标题、描述和按键说明 */
const toolInfo = ref({
  title: "",
  description: "",
  tips: [] as { icon: string; desc: string }[],
});

/** 处理工具信息更新 */
function handleUpdateToolInfo(info: typeof toolInfo.value) {
  toolInfo.value = info;
}
</script>

<template>
  <section :id="id" class="ToolCard" v-if="currentComponent">
    <hgroup v-if="toolInfo.title">
      <h1>{{ toolInfo.title }}</h1>
      <div class="description" v-if="toolInfo.description || toolInfo.tips.length > 0">
        <div class="desc" v-if="toolInfo.description">
          <span>info</span>
          <p>{{ toolInfo.description }}</p>
        </div>
        <div class="icons" v-if="toolInfo.tips.length > 0">
          <p v-for="item in toolInfo.tips" :key="item.icon">
            <span>{{ item.icon }}</span> {{ item.desc }}
          </p>
        </div>
      </div>
    </hgroup>
    <component :is="currentComponent" @update-tool-info="handleUpdateToolInfo" />
  </section>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../../styles/components/Tools/ToolCard");
</style>
