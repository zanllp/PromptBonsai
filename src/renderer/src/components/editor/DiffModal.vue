<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { charDiff, diffHtml } from '@/utils/diff'
import type { DiffSegment } from '@/utils/diff'

const { t } = useI18n()

const props = defineProps<{
  currentText: string
  existingTitle: string
  existingText: string
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const segments = computed<DiffSegment[]>(() => charDiff(props.existingText, props.currentText))
const leftHtml = computed(() => diffHtml(segments.value, 'left'))
const rightHtml = computed(() => diffHtml(segments.value, 'right'))
</script>

<template>
  <Teleport to="body">
    <div class="diff-overlay" @click.self="emit('cancel')">
      <div class="diff-modal glass-panel">
        <div class="diff-header">
          <h3 class="diff-title">{{ t('diff.title') }}</h3>
          <p class="diff-desc">
            {{ t('diff.subtitle', { title: existingTitle }) }}
          </p>
        </div>

        <div class="diff-body">
          <div class="diff-pane">
            <div class="diff-pane-label">
              <span class="diff-dot diff-dot-old"></span>
              {{ t('diff.existingNode') }}
            </div>
            <pre class="diff-content" v-html="leftHtml"></pre>
          </div>
          <div class="diff-pane">
            <div class="diff-pane-label">
              <span class="diff-dot diff-dot-new"></span>
              {{ t('diff.currentNode') }}
            </div>
            <pre class="diff-content" v-html="rightHtml"></pre>
          </div>
        </div>

        <div class="diff-footer">
          <button class="glass-btn" @click="emit('cancel')">{{ t('common.cancel') }}</button>
          <button class="glass-btn glass-btn-primary" @click="emit('confirm')">{{ t('diff.stillAdd') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.diff-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.diff-modal {
  width: 580px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.diff-header {
  padding: 20px 24px 12px;
}

.diff-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 6px;
}

.diff-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.diff-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diff-pane {
  border-radius: 8px;
  border: 1px solid var(--paper-border);
  overflow: hidden;
}

.diff-pane-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid var(--paper-border-light);
}

.diff-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.diff-dot-old {
  background: var(--color-danger);
  opacity: 0.7;
}

.diff-dot-new {
  background: var(--color-success);
  opacity: 0.7;
}

.diff-content {
  padding: 12px 14px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--color-text);
  max-height: 180px;
  overflow-y: auto;
}

.diff-content :deep(.diff-remove) {
  background: rgba(181, 74, 74, 0.1);
  color: var(--color-danger);
  border-radius: 2px;
  padding: 1px 0;
}

.diff-content :deep(.diff-add) {
  background: rgba(74, 140, 111, 0.1);
  color: #3a7a5a;
  border-radius: 2px;
  padding: 1px 0;
}

.diff-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 24px 16px;
  border-top: 1px solid var(--paper-border);
}
</style>
