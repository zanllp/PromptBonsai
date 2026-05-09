<script setup lang="ts">
import { computed, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Connection } from '@vue-flow/core'
import PromptNode from './PromptNode.vue'
import CanvasToolbar from './CanvasToolbar.vue'
import RootIndexPanel from './RootIndexPanel.vue'
import { usePromptStore } from '@/stores/promptStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useI18n } from 'vue-i18n'
import type { PromptFlowNode, PromptFlowEdge } from '@/types/canvas'

const promptStore = usePromptStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const { onConnect, addEdges, setViewport, getViewport } = useVueFlow()

const themeColors = computed(() => {
  const theme = settingsStore.theme
  if (theme === 'luminous') return { grid: 'rgba(0,229,255,0.03)', node: 'rgba(0,229,255,0.35)' }
  if (theme === 'dark-glass') return { grid: 'rgba(255,255,255,0.06)', node: 'rgba(24,86,255,0.5)' }
  return { grid: 'rgba(0,0,0,0.04)', node: 'rgba(184,78,46,0.4)' }
})

// Listen for locate requests from editor panel (outside VueFlow context)
watch(() => promptStore.locateRequestId, (nodeId) => {
  if (!nodeId) return
  promptStore.consumeLocateRequest()
  const node = promptStore.nodes[nodeId]
  if (!node) return
  const container = document.querySelector('.vue-flow-wrapper')
  const w = container?.clientWidth ?? 800
  const h = container?.clientHeight ?? 600
  const targetZoom = Math.max(getViewport().zoom, 1.2)

  setViewport(
    {
      x: -node.position.x * targetZoom + w / 2 - 140,
      y: -node.position.y * targetZoom + h / 2 - 40,
      zoom: targetZoom
    },
    { duration: 500 }
  )

  promptStore.highlightNode(nodeId, 3000)
})

const flowNodes = computed<PromptFlowNode[]>(() => {
  return promptStore.allNodesList.map((node) => ({
    id: node.id,
    type: 'promptNode',
    position: { x: node.position.x, y: node.position.y },
    data: { promptNode: node }
  }))
})

const levelColors = ['#8a8a9a', '#6a6a7a', '#4a4a5a', '#aaaabc', '#7a8a7a', '#8a7a6a', '#5a7a8a']

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
        style: { stroke: color, strokeWidth: 1.5, opacity: 0.5 }
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
      <Background :gap="24" :size="1" :pattern-color="themeColors.grid" />
      <Controls position="bottom-left" />
      <MiniMap
        position="bottom-right"
        :pannable="true"
        :zoomable="true"
        :node-color="() => themeColors.node"
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
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16" stroke="rgba(0,0,0,0.3)"></line>
              <line x1="8" y1="12" x2="16" y2="12" stroke="rgba(0,0,0,0.3)"></line>
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
