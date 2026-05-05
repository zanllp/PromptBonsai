<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Connection } from '@vue-flow/core'
import PromptNode from './PromptNode.vue'
import CanvasToolbar from './CanvasToolbar.vue'
import RootIndexPanel from './RootIndexPanel.vue'
import { usePromptStore } from '@/stores/promptStore'
import { useI18n } from 'vue-i18n'
import type { PromptFlowNode, PromptFlowEdge } from '@/types/canvas'

const promptStore = usePromptStore()
const { t } = useI18n()
const { onConnect, addEdges } = useVueFlow()

const flowNodes = computed<PromptFlowNode[]>(() => {
  return promptStore.allNodesList.map((node) => ({
    id: node.id,
    type: 'promptNode',
    position: { x: node.position.x, y: node.position.y },
    data: { promptNode: node }
  }))
})

const levelColors = ['#1856FF', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#07CA6B', '#EA2143']

const flowEdges = computed<PromptFlowEdge[]>(() => {
  const edges: PromptFlowEdge[] = []
  const depthMap = new Map<string, number>()

  function getDepth(id: string): number {
    if (depthMap.has(id)) return depthMap.get(id)!
    const node = promptStore.nodes[id]
    if (!node || !node.parentId) { depthMap.set(id, 0); return 0 }
    const d = getDepth(node.parentId) + 1
    depthMap.set(id, d)
    return d
  }

  for (const node of promptStore.allNodesList) {
    if (node.parentId) {
      const parentDepth = getDepth(node.parentId)
      const color = levelColors[parentDepth % levelColors.length]
      edges.push({
        id: `edge-${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'default',
        animated: false,
        style: { stroke: color, strokeWidth: 3, opacity: 0.5 }
      })
    }
  }
  return edges
})

function onNodeDragStop(event: { node: any }): void {
  promptStore.updateNodePosition(event.node.id, event.node.position)
}

function onPaneClick(): void {
  promptStore.selectNode(null)
}

onConnect((connection: Connection) => {
  if (connection.source && connection.target) {
    const sourceNode = promptStore.nodes[connection.source]
    const targetNode = promptStore.nodes[connection.target]

    if (sourceNode && targetNode && !targetNode.parentId) {
      if (
        !isDescendant(connection.source, connection.target) &&
        connection.source !== connection.target
      ) {
        targetNode.parentId = connection.source
        sourceNode.childrenIds.push(connection.target)
        targetNode.updatedAt = new Date().toISOString()
      }
    }
  }
})

function isDescendant(ancestorId: string, nodeId: string): boolean {
  const descendants = promptStore.getDescendantIds(ancestorId)
  return descendants.includes(nodeId)
}
</script>

<template>
  <div class="canvas-container">
    <VueFlow
      :nodes="flowNodes"
      :edges="flowEdges"
      :default-edge-options="{ type: 'default' }"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      fit-view-on-init
      @node-drag-stop="onNodeDragStop"
      @pane-click="onPaneClick"
      class="vue-flow-wrapper"
    >
      <Background :gap="24" :size="1" pattern-color="rgba(255,255,255,0.06)" />
      <Controls position="bottom-left" />
      <MiniMap
        position="bottom-right"
        :pannable="true"
        :zoomable="true"
        :node-color="() => 'rgba(24, 86, 255, 0.5)'"
      />

      <template #node-promptNode="nodeProps">
        <PromptNode v-bind="nodeProps" />
      </template>

      <CanvasToolbar />
      <RootIndexPanel />

      <!-- Empty state -->
      <template v-if="promptStore.nodeCount === 0">
        <div class="glass-empty-state" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div class="empty-title">{{ t('canvas.emptyTitle') }}</div>
          <div class="empty-desc" v-html="t('canvas.emptyDescription')">
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.vue-flow-wrapper {
  width: 100%;
  height: 100%;
}
</style>
