<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import type { PromptFlowNode } from '@/types/canvas'
import { usePromptStore } from '@/stores/promptStore'
import { useI18n } from 'vue-i18n'

const props = defineProps<NodeProps<PromptFlowNode>>()
const promptStore = usePromptStore()
const { t } = useI18n()

const promptNode = computed(() => props.data.promptNode)
const isSelected = computed(() => props.data.promptNode.id === promptStore.selectedNodeId)
const isHighlighted = computed(() => props.data.promptNode.id === promptStore.highlightedNodeId)

const previewText = computed(() => {
  const text = promptNode.value.promptText
  if (!text) return ''
  const line = text.split('\n')[0]
  return line.length > 60 ? line.slice(0, 60) + '...' : line
})

function handleClick(): void {
  promptStore.selectNode(promptNode.value.id)
}

function handleDoubleClick(): void {
  promptStore.selectNode(promptNode.value.id)
}
</script>

<template>
  <div
    class="glass-node"
    :class="{ selected: isSelected, highlighted: isHighlighted }"
    @click.stop="handleClick"
    @dblclick.stop="handleDoubleClick"
  >
    <Handle type="target" :position="Position.Top" :connectable="false" />

    <div class="node-header">
      <span class="node-title">{{ promptNode.title || t('node.untitled') }}</span>
      <span class="node-child-count" v-if="promptNode.childrenIds.length > 0">
        {{ promptNode.childrenIds.length }}
      </span>
    </div>

    <div class="node-preview" v-if="previewText">
      {{ previewText }}
    </div>

    <div class="node-tags" v-if="promptNode.tags.length > 0">
      <span
        v-for="tag in promptNode.tags.slice(0, 3)"
        :key="tag.name"
        class="glass-tag"
        :style="tag.color ? { borderColor: tag.color + '40', color: tag.color } : {}"
      >
        {{ tag.name }}
      </span>
      <span class="node-more-tags" v-if="promptNode.tags.length > 3">
        +{{ promptNode.tags.length - 3 }}
      </span>
    </div>

    <div class="node-rating" v-if="promptNode.rating">
      <svg v-for="i in promptNode.rating" :key="i" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    </div>

    <Handle type="source" :position="Position.Bottom" :connectable="false" />
  </div>
</template>

<style scoped>
.glass-node {
  overflow: hidden;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.node-child-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(24, 86, 255, 0.12);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  flex-shrink: 0;
}

.node-preview {
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.node-more-tags {
  font-size: 11px;
  color: var(--color-text-secondary);
  padding: 2px 6px;
}

.node-rating {
  display: flex;
  gap: 1px;
  margin-top: 6px;
  color: #f59e0b;
}

.glass-node.highlighted {
  animation: node-blink 0.6s ease-in-out 5;
}

@keyframes node-blink {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(24, 86, 255, 0.15), 0 8px 32px rgba(24, 86, 255, 0.18);
    border-color: rgba(24, 86, 255, 0.6);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(24, 86, 255, 0.3), 0 0 24px rgba(24, 86, 255, 0.4);
    border-color: rgba(24, 86, 255, 0.9);
  }
}
</style>
