<script setup lang="ts">
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/promptStore'
import { useTreeLayout } from '@/composables/useTreeLayout'
import SmartMatchDialog from './SmartMatchDialog.vue'

const { t } = useI18n()
const { fitView, setNodes } = useVueFlow()
const promptStore = usePromptStore()
const { applyLayout } = useTreeLayout()

const showSmartMatch = ref(false)

function addNode(): void {
  promptStore.addRootNode({ x: Math.random() * 300, y: Math.random() * 200 })
  promptStore.selectNode(promptStore.rootIds[promptStore.rootIds.length - 1])
}

function handleLayout(): void {
  applyLayout()
  promptStore.selectNode(null)

  setNodes((nds) =>
    nds.map((n) => {
      const storeNode = promptStore.nodes[n.id]
      if (storeNode) {
        return { ...n, position: { x: storeNode.position.x, y: storeNode.position.y } }
      }
      return n
    })
  )

  setTimeout(() => fitView({ padding: 0.15 }), 50)
}
</script>

<template>
  <div class="canvas-toolbar glass-light">
    <button class="glass-btn glass-btn-icon" @click="addNode" :title="t('toolbar.addRootNode') + ' (Ctrl+N)'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
    <div class="toolbar-divider"></div>
    <button class="glass-btn glass-btn-icon" @click="showSmartMatch = true" :title="t('toolbar.smartMount')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
    <div class="toolbar-divider"></div>
    <button class="glass-btn glass-btn-icon" @click="handleLayout" :title="t('toolbar.layout')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1"></rect>
      </svg>
    </button>
    <button class="glass-btn glass-btn-icon" @click="fitView({ padding: 0.2 })" :title="t('toolbar.fitView')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
      </svg>
    </button>

    <SmartMatchDialog v-if="showSmartMatch" @close="showSmartMatch = false" />
  </div>
</template>

<style scoped>
.canvas-toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px;
  z-index: 10;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 2px;
}
</style>
