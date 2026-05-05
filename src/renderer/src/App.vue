<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PromptCanvas from '@/components/canvas/PromptCanvas.vue'
import NodeEditorPanel from '@/components/editor/NodeEditorPanel.vue'
import WelcomeScreen from '@/components/WelcomeScreen.vue'
import { useFileOperations } from '@/composables/useFileOperations'
import { useAutoSave } from '@/composables/useAutoSave'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useFileStore } from '@/stores/fileStore'
import { usePromptStore } from '@/stores/promptStore'
import { useSettingsStore } from '@/stores/settingsStore'

const { t, locale } = useI18n()
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const { openFile, saveFile, saveFileAs } = useFileOperations()
const autoSave = useAutoSave()
const shortcuts = useKeyboardShortcuts()
const fileStore = useFileStore()
const promptStore = usePromptStore()
const settingsStore = useSettingsStore()

autoSave.setup()
shortcuts.setup()

watch(() => settingsStore.locale, (l) => {
  locale.value = l
})

function toggleLocale(): void {
  const next = settingsStore.locale === 'zh' ? 'en' : 'zh'
  settingsStore.setLocale(next)
}

// Close confirmation
onMounted(() => {
  ;(window as any).closeConfirmed = false

  window.api.onCloseRequested(() => {
    if (!fileStore.isDirty) {
      ;(window as any).closeConfirmed = true
      return
    }

    const confirmed = confirm(t('app.confirmCloseUnsaved'))
    ;(window as any).closeConfirmed = confirmed
  })
})

async function handleOpen(): Promise<void> {
  const success = await openFile()
  showToast(success ? t('app.fileOpened') : t('app.cancelled'), success ? 'success' : 'error')
}

async function handleSave(): Promise<void> {
  const success = await saveFile()
  showToast(success ? t('app.saved') : t('app.saveFailed'), success ? 'success' : 'error')
}

async function handleSaveAs(): Promise<void> {
  const success = await saveFileAs()
  showToast(success ? t('app.saved') : t('app.cancelled'), success ? 'success' : 'error')
}

async function handleNew(): Promise<void> {
  const { newFile } = useFileOperations()
  await newFile()
}

function showToast(message: string, type: 'success' | 'error'): void {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = null
  }, 2000)
}
</script>

<template>
  <div class="app-layout">
    <!-- Top Menu Bar -->
    <header class="menu-bar glass-dark">
      <div class="menu-left">
        <span class="app-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </span>
        <span class="app-name">{{ t('app.title') }}</span>
      </div>
      <nav class="menu-actions">
        <button class="menu-btn" @click="handleNew" :title="t('app.new') + ' (Ctrl+N)'">{{ t('app.new') }}</button>
        <button class="menu-btn" @click="handleOpen" :title="t('app.open') + ' (Ctrl+O)'">{{ t('app.open') }}</button>
        <button class="menu-btn" @click="handleSave" :title="t('app.save') + ' (Ctrl+S)'">{{ t('app.save') }}</button>
        <button class="menu-btn" @click="handleSaveAs" :title="t('app.saveAs') + ' (Ctrl+Shift+S)'">{{ t('app.saveAs') }}</button>
      </nav>
      <div class="menu-right">
        <button class="locale-btn" @click="toggleLocale" :aria-label="t('app.language')">
          {{ settingsStore.locale === 'zh' ? '中' : 'EN' }}
        </button>
        <span class="file-status" :class="{ dirty: fileStore.isDirty }">
          {{ fileStore.displayTitle }}
        </span>
        <span class="node-count" v-if="promptStore.nodeCount > 0">
          {{ t('app.nodeCount', { count: promptStore.nodeCount }) }}
        </span>
      </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <WelcomeScreen v-if="!fileStore.hasFilePath" />
      <template v-else>
        <PromptCanvas />
        <NodeEditorPanel />
      </template>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast" class="glass-toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Menu Bar */
.menu-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 44px;
  min-height: 44px;
  z-index: 30;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-logo {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.app-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.3px;
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.menu-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.locale-btn {
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: 0.5px;
}

.locale-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.locale-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.file-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-mono);
}

.file-status.dirty {
  color: var(--color-warning);
}

.node-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

/* Main Content */
.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
