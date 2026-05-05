<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/promptStore'
import type { PromptNode } from '@/types/prompt'

const { t } = useI18n()
const promptStore = usePromptStore()
const { setViewport, getViewport } = useVueFlow()

const expanded = ref(true)

const rootNodes = computed<PromptNode[]>(() =>
  promptStore.rootIds
    .map((id) => promptStore.nodes[id])
    .filter(Boolean)
)

function navigateTo(node: PromptNode): void {
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

  promptStore.highlightNode(node.id, 3000)
}

function toggle(): void {
  expanded.value = !expanded.value
}
</script>

<template>
  <div class="root-index glass-light" v-if="rootNodes.length > 0">
    <button
      class="index-toggle glass-btn-icon"
      @click.stop="toggle"
      :aria-label="expanded ? t('index.collapse') : t('index.expand')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="expanded" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path v-else d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <Transition name="index-collapse">
      <div v-if="expanded" class="index-list" role="list" :aria-label="t('index.rootNodes')">
        <button
          v-for="node in rootNodes"
          :key="node.id"
          class="index-item"
          role="listitem"
          :aria-label="t('index.jumpTo', { title: node.title || t('node.untitled') })"
          @click.stop="navigateTo(node)"
        >
          <span class="index-item-title">{{ node.title || t('node.untitled') }}</span>
          <span v-if="node.childrenIds.length > 0" class="index-item-count">
            {{ node.childrenIds.length }}
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.root-index {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  padding: 4px;
  max-width: 200px;
}

.index-toggle {
  flex-shrink: 0;
}

.index-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 140px;
  max-height: 320px;
  overflow-y: auto;
}

.index-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease;
  min-width: 0;
}

.index-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.index-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.index-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.index-item-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: rgba(24, 86, 255, 0.12);
  border-radius: 9px;
  font-size: 10px;
  font-weight: 600;
  color: var(--color-primary);
  flex-shrink: 0;
}

.index-collapse-enter-active,
.index-collapse-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.index-collapse-enter-from,
.index-collapse-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

@media (prefers-reduced-motion: reduce) {
  .index-item,
  .index-collapse-enter-active,
  .index-collapse-leave-active {
    transition: none !important;
  }
}
</style>
