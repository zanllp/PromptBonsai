<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useFileStore } from '@/stores/fileStore'
import { useSettingsStore } from '@/stores/settingsStore'

const { t } = useI18n()
const fileStore = useFileStore()
const settingsStore = useSettingsStore()

async function handleOpenExample(): Promise<void> {
  const { openFileByPath } = (await import('@/composables/useFileOperations')).useFileOperations()
  const examplePath = await window.api.getExamplePath()
  if (examplePath) openFileByPath(examplePath)
}

async function handleOpen(): Promise<void> {
  const { openFile } = (await import('@/composables/useFileOperations')).useFileOperations()
  openFile()
}

async function handleNew(): Promise<void> {
  const { newFile } = (await import('@/composables/useFileOperations')).useFileOperations()
  await newFile()
}

async function handleOpenRecent(path: string): Promise<void> {
  const { openFileByPath } = (await import('@/composables/useFileOperations')).useFileOperations()
  await openFileByPath(path)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('time.justNow')
  if (diffMins < 60) return t('time.minutesAgo', { n: diffMins })
  if (diffHours < 24) return t('time.hoursAgo', { n: diffHours })
  if (diffDays < 7) return t('time.daysAgo', { n: diffDays })
  return d.toLocaleDateString()
}

function getFileName(path: string): string {
  const sep = path.includes('\\') ? '\\' : '/'
  return path.split(sep).pop() ?? path
}

function getFileDir(path: string): string {
  const sep = path.includes('\\') ? '\\' : '/'
  const parts = path.split(sep)
  parts.pop()
  return parts.join(sep)
}

function removeRecent(path: string, e: Event): void {
  e.stopPropagation()
  settingsStore.removeRecentFile(path)
}

function saveSettings(): void {
  settingsStore.saveToStorage()
}
</script>

<template>
  <div class="welcome-screen">
    <div class="welcome-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h1 class="hero-title">{{ t('app.title') }}</h1>
        <p class="hero-desc">{{ t('app.description') }}</p>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-card" @click="handleNew">
          <div class="action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span class="action-label">{{ t('welcome.newProject') }}</span>
        </button>
        <button class="action-card" @click="handleOpen">
          <div class="action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <span class="action-label">{{ t('welcome.openFile') }}</span>
        </button>
        <button class="action-card action-card--accent" @click="handleOpenExample">
          <div class="action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <span class="action-label">{{ t('welcome.openExample') }}</span>
        </button>
      </div>

      <!-- AI Settings -->
      <div class="settings-section">
        <div class="settings-header">
          <span class="settings-title">{{ t('settings.title') }}</span>
        </div>
        <div class="settings-fields">
          <div class="settings-field">
            <label class="settings-label">{{ t('settings.baseUrl') }}</label>
            <input
              class="settings-input"
              v-model="settingsStore.aiBaseUrl"
              :placeholder="t('settings.baseUrlPlaceholder')"
              @change="saveSettings"
            />
          </div>
          <div class="settings-field">
            <label class="settings-label">{{ t('settings.apiKey') }}</label>
            <input
              class="settings-input"
              type="password"
              v-model="settingsStore.aiApiKey"
              :placeholder="t('settings.apiKeyPlaceholder')"
              @change="saveSettings"
            />
          </div>
          <div class="settings-field">
            <label class="settings-label">{{ t('settings.model') }}</label>
            <input
              class="settings-input"
              v-model="settingsStore.aiModel"
              :placeholder="t('settings.modelPlaceholder')"
              @change="saveSettings"
            />
          </div>
        </div>
      </div>

      <!-- Recent Files -->
      <div class="recent-section" v-if="settingsStore.recentFiles.length > 0">
        <div class="recent-header">
          <span class="recent-title">{{ t('welcome.recentFiles') }}</span>
        </div>
        <div class="recent-list">
          <button
            v-for="file in settingsStore.recentFiles.slice(0, 5)"
            :key="file.path"
            class="recent-item"
            @click="handleOpenRecent(file.path)"
          >
            <div class="recent-item-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="recent-item-info">
              <span class="recent-item-name">{{ file.name || getFileName(file.path) }}</span>
              <span class="recent-item-meta">{{ getFileDir(file.path) }} · {{ formatTime(file.openedAt) }}</span>
            </div>
            <button
              class="recent-remove"
              @click="removeRecent(file.path, $event)"
              :title="t('welcome.remove')"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </button>
        </div>
      </div>

      <!-- Keyboard Hints -->
      <div class="hints">
        <span class="hint"><kbd>Ctrl</kbd>+<kbd>N</kbd> {{ t('welcome.new') }}</span>
        <span class="hint"><kbd>Ctrl</kbd>+<kbd>O</kbd> {{ t('welcome.open') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.welcome-container {
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

/* Hero */
.hero-section {
  text-align: center;
}

.hero-icon {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(24, 86, 255, 0.18), rgba(24, 86, 255, 0.06));
  border: 1px solid rgba(24, 86, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--color-primary);
}

.hero-title {
  font-size: 26px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.action-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all var(--transition-normal);
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-primary);
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  color: white;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-card:hover .action-icon {
  background: rgba(24, 86, 255, 0.15);
  color: var(--color-primary);
}

.action-card--accent {
  background: rgba(24, 86, 255, 0.08);
  border-color: rgba(24, 86, 255, 0.15);
}

.action-card--accent:hover {
  background: rgba(24, 86, 255, 0.16);
  border-color: rgba(24, 86, 255, 0.3);
}

.action-card--accent .action-icon {
  background: rgba(24, 86, 255, 0.12);
  color: var(--color-primary);
}

.action-card--accent:hover .action-icon {
  background: rgba(24, 86, 255, 0.25);
}

.action-label {
  font-size: 13px;
  font-weight: 500;
}

/* Settings */
.settings-section {
  width: 100%;
}

.settings-header {
  margin-bottom: 10px;
  padding: 0 4px;
}

.settings-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.settings-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.3px;
}

.settings-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-mono);
  font-size: 12px;
  outline: none;
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.settings-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.settings-input:focus {
  border-color: rgba(24, 86, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(24, 86, 255, 0.08);
  background: rgba(255, 255, 255, 0.09);
}

/* Recent Files */
.recent-section {
  width: 100%;
}

.recent-header {
  margin-bottom: 10px;
  padding: 0 4px;
}

.recent-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  color: rgba(255, 255, 255, 0.7);
  font-family: var(--font-primary);
  position: relative;
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.recent-item-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}

.recent-item:hover .recent-item-icon {
  opacity: 0.8;
  background: rgba(24, 86, 255, 0.1);
  color: var(--color-primary);
}

.recent-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.recent-item-name {
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-item-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-mono);
}

.recent-item:hover .recent-item-meta {
  color: rgba(255, 255, 255, 0.45);
}

.recent-remove {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.25);
  opacity: 0;
  transition: all var(--transition-fast);
  padding: 0;
}

.recent-item:hover .recent-remove {
  opacity: 1;
}

.recent-remove:hover {
  background: rgba(234, 33, 67, 0.15);
  color: var(--color-danger);
}

/* Keyboard Hints */
.hints {
  display: flex;
  gap: 20px;
  margin-top: 4px;
}

.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: var(--font-mono);
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.4;
}
</style>
