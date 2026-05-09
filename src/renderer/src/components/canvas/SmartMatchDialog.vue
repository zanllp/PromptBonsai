<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/promptStore'
import { useFileStore } from '@/stores/fileStore'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const promptStore = usePromptStore()
const fileStore = useFileStore()

const inputText = ref('')
const matched = ref<{ parentId: string; title: string; score: number; path: string[] } | null>(null)
const searching = false

function doMatch(): void {
  const text = inputText.value.trim()
  if (!text) return
  matched.value = promptStore.findBestParent(text)
}

function onConfirm(): void {
  if (!matched.value) return
  const parent = promptStore.nodes[matched.value.parentId]
  if (!parent) return
  const childId = promptStore.addChildNode(matched.value.parentId, {
    x: parent.position.x + 50 + Math.random() * 100,
    y: parent.position.y + 200
  })
  if (childId) {
    promptStore.updateNode(childId, { promptText: inputText.value })
    promptStore.selectNode(childId)
    fileStore.markDirty()
  }
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="smart-overlay" @click.self="emit('close')">
      <div class="smart-modal glass-panel">
        <h3 class="smart-title">{{ t('smartMatch.title') }}</h3>
        <p class="smart-desc">{{ t('smartMatch.description') }}</p>

        <textarea
          class="glass-input glass-textarea smart-input"
          v-model="inputText"
          :placeholder="t('smartMatch.placeholder')"
          rows="6"
        ></textarea>

        <button
          class="glass-btn glass-btn-primary smart-match-btn"
          :disabled="!inputText.trim()"
          @click="doMatch"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {{ t('smartMatch.match') }}
        </button>

        <div v-if="matched" class="smart-result">
          <div class="smart-match-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{{ t('smartMatch.bestMatch') }}</span>
            <span class="smart-score">{{ Math.round(matched.score * 100) }}%</span>
          </div>
          <div class="smart-match-node">{{ matched.title }}</div>
          <div class="smart-match-path" v-if="matched.path.length > 1">
            {{ matched.path.join(' → ') }}
          </div>
          <div class="smart-match-actions">
            <button class="glass-btn" @click="emit('close')">{{ t('common.cancel') }}</button>
            <button class="glass-btn glass-btn-primary" @click="onConfirm">{{ t('smartMatch.mountAsChild') }}</button>
          </div>
        </div>

        <div v-if="matched === null && inputText.trim()" class="smart-no-match">
          {{ t('smartMatch.noMatch') }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.smart-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.smart-modal {
  width: 440px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.smart-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.smart-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.smart-input {
  min-height: 120px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.smart-match-btn {
  align-self: flex-start;
}

.smart-result {
  border-radius: 8px;
  border: 1px solid rgba(74, 140, 111, 0.2);
  background: rgba(74, 140, 111, 0.04);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.smart-match-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
}

.smart-score {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  background: rgba(74, 140, 111, 0.08);
  padding: 2px 8px;
  border-radius: 10px;
  color: var(--color-success);
}

.smart-match-node {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  padding: 0 4px;
}

.smart-match-path {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  padding: 0 4px;
}

.smart-match-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.smart-no-match {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}
</style>
