<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/promptStore'
import { useFileStore } from '@/stores/fileStore'
import { useAiGenerate } from '@/composables/useAiGenerate'
import TagInput from './TagInput.vue'
import DescriptionField from './DescriptionField.vue'
import DiffModal from './DiffModal.vue'
import { charDiff } from '@/utils/diff'
import type { Tag } from '@/types/prompt'
import type { DiffSegment } from '@/utils/diff'

const { t } = useI18n()

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const promptStore = usePromptStore()
const fileStore = useFileStore()
const { loading: aiLoading, generate: aiGenerate } = useAiGenerate()

const node = computed(() => promptStore.selectedNode)
const diffWarning = ref<{ currentText: string; existingTitle: string; existingText: string; originalText: string } | null>(null)

const parentDiffSegments = computed<DiffSegment[] | null>(() => {
  if (!node.value?.parentId || !localPromptText.value.trim()) return null
  const parent = promptStore.nodes[node.value.parentId]
  if (!parent || !parent.promptText.trim()) return null
  return charDiff(parent.promptText, localPromptText.value)
})

const hasDiffWithParent = computed(() => {
  if (!parentDiffSegments.value) return false
  return parentDiffSegments.value.some((s) => s.op !== 'equal')
})

const parentInlineHtml = computed(() => {
  if (!parentDiffSegments.value) return ''
  return parentDiffSegments.value
    .map((s) => {
      if (s.op === 'equal') return escapeHtml(s.text)
      if (s.op === 'remove') return `<span class="diff-remove">${escapeHtml(s.text)}</span>`
      return `<span class="diff-add">${escapeHtml(s.text)}</span>`
    })
    .join('')
})

const localTitle = ref('')
const localPromptText = ref('')
const localTags = ref<Tag[]>([])
const localDescription = ref('')
const localRating = ref(0)

watch(
  () => promptStore.selectedNodeId,
  (newId, oldId) => {
    if (oldId && localTitle.value && promptStore.nodes[oldId]) {
      promptStore.updateNode(oldId, {
        title: localTitle.value,
        promptText: localPromptText.value,
        description: localDescription.value,
        rating: localRating.value,
        tags: localTags.value
      })
    }
    if (newId && promptStore.nodes[newId]) {
      const n = promptStore.nodes[newId]
      localTitle.value = n.title
      localPromptText.value = n.promptText
      localTags.value = [...n.tags]
      localDescription.value = n.description
      localRating.value = n.rating ?? 0
    } else {
      localTitle.value = ''
      localPromptText.value = ''
      localTags.value = []
      localDescription.value = ''
      localRating.value = 0
    }
  },
  { immediate: true }
)

function onTitleChange(e: Event): void {
  const value = (e.target as HTMLInputElement).value
  localTitle.value = value
  if (node.value) {
    promptStore.updateNode(node.value.id, { title: value })
    fileStore.markDirty()
  }
}

function onPromptTextChange(e: Event): void {
  const value = (e.target as HTMLTextAreaElement).value
  localPromptText.value = value
  if (node.value) {
    promptStore.updateNode(node.value.id, { promptText: value })
    fileStore.markDirty()
    if (value.trim()) {
      const similarId = promptStore.findSimilarSibling(node.value.id)
      if (similarId) {
        const similarNode = promptStore.nodes[similarId]
        if (similarNode) {
          diffWarning.value = {
            currentText: value,
            existingTitle: similarNode.title,
            existingText: similarNode.promptText,
            originalText: value
          }
        }
      }
    }
  }
}

function onDiffConfirm(): void {
  diffWarning.value = null
}

function onDiffCancel(): void {
  if (diffWarning.value) {
    localPromptText.value = ''
    promptStore.updateNode(node.value!.id, { promptText: '' })
  }
  diffWarning.value = null
}

function onTagsChange(tags: Tag[]): void {
  localTags.value = tags
  if (node.value) {
    promptStore.updateNode(node.value.id, { tags })
    fileStore.markDirty()
  }
}

function onDescriptionChange(value: string): void {
  localDescription.value = value
  if (node.value) {
    promptStore.updateNode(node.value.id, { description: value })
    fileStore.markDirty()
  }
}

function onRatingChange(stars: number): void {
  localRating.value = stars
  if (node.value) {
    promptStore.updateNode(node.value.id, { rating: stars })
    fileStore.markDirty()
  }
}

function isDefaultNode(n: { title: string; promptText: string; description: string; rating: number; tags: any[] }): boolean {
  return !n.title && !n.promptText && !n.description && !n.rating && n.tags.length === 0
}

function deleteNode(): void {
  if (!node.value) return
  if (isDefaultNode(node.value) || confirm(t('node.deleteConfirm', { title: node.value.title }))) {
    promptStore.deleteNode(node.value.id)
    fileStore.markDirty()
  }
}

function closePanel(): void {
  promptStore.selectNode(null)
}

function locateNode(): void {
  if (!node.value) return
  promptStore.requestLocate(node.value.id)
}

function addChild(): void {
  if (!node.value) return
  const childId = promptStore.addChildNode(node.value.id, {
    x: node.value.position.x + 50 + Math.random() * 100,
    y: node.value.position.y + 200
  })
  if (childId) {
    fileStore.markDirty()
    promptStore.selectNode(childId)
  }
}

function copyPromptText(): void {
  if (!localPromptText.value.trim()) return
  navigator.clipboard.writeText(localPromptText.value)
}

async function handleAiGenerate(): Promise<void> {
  if (!node.value || aiLoading.value) return
  const text = localPromptText.value
  if (!text.trim()) return

  const parentText = node.value.parentId
    ? promptStore.nodes[node.value.parentId]?.promptText
    : undefined

  try {
    const result = await aiGenerate(text, parentText)
    const updates: Partial<typeof node.value> = {}
    if (result.title) {
      localTitle.value = result.title
      updates.title = result.title
    }
    if (result.description) {
      localDescription.value = result.description
      updates.description = result.description
    }
    if (result.tags?.length) {
      const tags: Tag[] = result.tags.map((t) => ({ name: t.name, color: t.color }))
      localTags.value = tags
      updates.tags = tags
    }
    if (Object.keys(updates).length > 0) {
      promptStore.updateNode(node.value.id, updates)
      fileStore.markDirty()
    }
  } catch (err) {
    console.error('[AI Generate] failed:', err)
  }
}
</script>

<template>
  <Transition name="slide">
    <div v-if="node" class="node-editor-panel glass-editor">
      <div class="editor-header">
        <h3 class="editor-title">{{ t('node.editPrompt') }}</h3>
        <button class="glass-btn glass-btn-icon locate-btn" @click="locateNode" :title="t('node.locate')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
          </svg>
        </button>
        <button class="glass-btn glass-btn-icon close-btn" @click="closePanel" :title="t('node.close') + ' (Esc)'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="editor-content">
        <!-- Title -->
        <div class="field-group">
          <label class="glass-label">{{ t('node.title') }}</label>
          <input
            class="glass-input"
            :value="localTitle"
            @input="onTitleChange"
            :placeholder="t('node.titlePlaceholder')"
          />
        </div>

        <!-- Rating -->
        <div class="field-group">
          <div class="field-label-row">
            <label class="glass-label">{{ t('node.usability') }}</label>
            <span class="rating-text" v-if="localRating">{{ localRating }}/5</span>
          </div>
          <div class="star-rating">
            <button
              v-for="i in 5"
              :key="i"
              class="star-btn"
              :class="{ active: i <= localRating }"
              @click="onRatingChange(i === localRating ? 0 : i)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="i <= localRating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div class="field-group">
          <label class="glass-label">{{ t('node.tags') }}</label>
          <TagInput :model-value="localTags" @update:model-value="onTagsChange" />
        </div>

        <!-- Prompt Text -->
        <div class="field-group">
          <div class="field-label-row">
            <label class="glass-label">{{ t('node.promptText') }}</label>
            <div class="label-actions">
              <button
                class="glass-btn glass-btn-icon copy-btn"
                :disabled="!localPromptText.trim()"
                @click="copyPromptText"
                :title="t('node.copyPrompt')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button
                class="glass-btn ai-gen-btn"
                :class="{ loading: aiLoading }"
                :disabled="!localPromptText.trim() || aiLoading"
                @click="handleAiGenerate"
                :title="t('node.aiGenerateTooltip')"
              >
                <svg
                  v-if="!aiLoading"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                <span v-if="aiLoading" class="ai-spinner"></span>
                {{ aiLoading ? t('node.generating') : t('node.aiGenerate') }}
              </button>
            </div>
          </div>
          <textarea
            class="glass-input glass-textarea prompt-textarea"
            :value="localPromptText"
            @input="onPromptTextChange"
            :placeholder="t('node.promptPlaceholder')"
            rows="12"
          ></textarea>
        </div>

        <!-- Description -->
        <div class="field-group">
          <label class="glass-label">{{ t('node.description') }}</label>
          <DescriptionField :model-value="localDescription" @update:model-value="onDescriptionChange" />
        </div>

        <!-- Meta -->
        <div class="field-group meta-info">
          <div class="meta-row" v-if="node.parentId">
            <span class="meta-label">{{ t('node.parent') }}</span>
            <span class="meta-value">{{ promptStore.nodes[node.parentId]?.title ?? t('node.unknown') }}</span>
          </div>
          <div class="meta-row" v-if="node.childrenIds.length > 0">
            <span class="meta-label">{{ t('node.children') }}</span>
            <span class="meta-value">{{ t('node.variantCount', { count: node.childrenIds.length }) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ t('node.updatedAt') }}</span>
            <span class="meta-value">{{ new Date(node.updatedAt).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Parent Diff -->
        <div class="field-group parent-diff" v-if="node.parentId && promptStore.nodes[node.parentId]?.promptText">
          <template v-if="hasDiffWithParent">
            <div class="parent-diff-summary">
              <span class="parent-diff-tag parent-diff-tag--diff">{{ t('node.difference') }}</span>
              <span class="parent-diff-label">{{ t('node.vs') }}{{ promptStore.nodes[node.parentId]?.title }}</span>
            </div>
            <div class="parent-diff-inline" v-html="parentInlineHtml"></div>
          </template>
          <template v-else-if="localPromptText.trim()">
            <div class="parent-diff-summary">
              <span class="parent-diff-tag parent-diff-tag--same">{{ t('node.same') }}</span>
              <span class="parent-diff-label">{{ t('node.contentSameAsParent', { title: promptStore.nodes[node.parentId]?.title }) }}</span>
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div class="editor-actions">
          <button class="glass-btn glass-btn-primary" @click="addChild">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ t('node.addChild') }}
          </button>
          <button class="glass-btn glass-btn-danger" @click="deleteNode">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            {{ t('node.delete') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <DiffModal
    v-if="diffWarning"
    :current-text="diffWarning.currentText"
    :existing-title="diffWarning.existingTitle"
    :existing-text="diffWarning.existingText"
    @confirm="onDiffConfirm"
    @cancel="onDiffCancel"
  />
</template>

<style scoped>
.node-editor-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: var(--editor-panel-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--paper-border);
}

.editor-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 8px;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 7px;
}
.copy-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ai-gen-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 8px;
  gap: 4px;
  color: var(--color-primary);
  border-color: rgba(196, 92, 58, 0.25);
  background: rgba(196, 92, 58, 0.05);
  flex-shrink: 0;
}
.ai-gen-btn:hover:not(:disabled) {
  background: rgba(196, 92, 58, 0.12);
}
.ai-gen-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ai-gen-btn.loading {
  color: var(--color-text-secondary);
  border-color: var(--paper-border);
  background: rgba(0, 0, 0, 0.02);
}

.ai-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.prompt-textarea {
  min-height: 240px;
  line-height: 1.7;
}

.star-rating {
  display: flex;
  gap: 4px;
}

.star-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-text-secondary);
  opacity: 0.3;
  transition: color var(--transition-fast), transform var(--transition-fast), opacity var(--transition-fast);
  line-height: 1;
}

.star-btn:hover {
  color: var(--color-warning);
  opacity: 1;
  transform: scale(1.15);
}

.star-btn.active {
  color: var(--color-warning);
  opacity: 1;
}

.star-btn:hover {
  color: var(--color-warning);
  transform: scale(1.15);
}

.star-btn.active {
  color: var(--color-primary);
}

.rating-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
}

.meta-info {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin-top: 4px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 12px;
}

.meta-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.meta-value {
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 11px;
}

.editor-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--paper-border);
}

.parent-diff {
  margin-top: 4px;
}

.parent-diff-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.parent-diff-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.parent-diff-tag--diff {
  color: var(--color-primary);
  background: rgba(196, 92, 58, 0.08);
}

.parent-diff-tag--same {
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.03);
}

.parent-diff-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.parent-diff-inline {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.015);
  border: 1px solid var(--paper-border-light);
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--color-text);
  max-height: 150px;
  overflow-y: auto;
}

.parent-diff-inline :deep(.diff-remove) {
  background: rgba(181, 74, 74, 0.1);
  color: var(--color-danger);
  border-radius: 2px;
  padding: 1px 0;
  text-decoration: line-through;
}

.parent-diff-inline :deep(.diff-add) {
  background: rgba(74, 140, 111, 0.1);
  color: #3a7a5a;
  border-radius: 2px;
  padding: 1px 0;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
