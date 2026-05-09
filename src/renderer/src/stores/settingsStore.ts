import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RecentFile {
  path: string
  name: string
  openedAt: string
}

export const useSettingsStore = defineStore('settings', () => {
  const autoSave = ref(true)
  const autoSaveIntervalMs = ref(30000)
  const showMiniMap = ref(true)
  const recentFiles = ref<RecentFile[]>([])
  const locale = ref<'zh' | 'en'>('zh')
  const theme = ref<'ink-wash' | 'dark-glass' | 'luminous'>('ink-wash')
  const aiBaseUrl = ref('https://openrouter.ai/api/v1')
  const aiApiKey = ref('')
  const aiModel = ref('deepseek/deepseek-v4-flash')

  function loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('prompt-manager-settings')
      if (saved) {
        const data = JSON.parse(saved)
        if (data.autoSave !== undefined) autoSave.value = data.autoSave
        if (data.autoSaveIntervalMs !== undefined) autoSaveIntervalMs.value = data.autoSaveIntervalMs
        if (data.showMiniMap !== undefined) showMiniMap.value = data.showMiniMap
        if (data.recentFiles) recentFiles.value = data.recentFiles
        if (data.locale) locale.value = data.locale
        if (data.theme) theme.value = data.theme
        if (data.aiBaseUrl) aiBaseUrl.value = data.aiBaseUrl
        if (data.aiApiKey) aiApiKey.value = data.aiApiKey
        if (data.aiModel) aiModel.value = data.aiModel
      }
    } catch {
      // ignore
    }
  }

  function saveToStorage(): void {
    localStorage.setItem(
      'prompt-manager-settings',
      JSON.stringify({
        autoSave: autoSave.value,
        autoSaveIntervalMs: autoSaveIntervalMs.value,
        showMiniMap: showMiniMap.value,
        recentFiles: recentFiles.value,
        locale: locale.value,
        theme: theme.value,
        aiBaseUrl: aiBaseUrl.value,
        aiApiKey: aiApiKey.value,
        aiModel: aiModel.value
      })
    )
  }

  function addRecentFile(path: string, name: string): void {
    recentFiles.value = recentFiles.value.filter((f) => f.path !== path)
    recentFiles.value.unshift({ path, name, openedAt: new Date().toISOString() })
    if (recentFiles.value.length > 10) recentFiles.value = recentFiles.value.slice(0, 10)
    saveToStorage()
  }

  function removeRecentFile(path: string): void {
    recentFiles.value = recentFiles.value.filter((f) => f.path !== path)
    saveToStorage()
  }

  function setLocale(l: 'zh' | 'en'): void {
    locale.value = l
    saveToStorage()
  }

  function setTheme(t: 'ink-wash' | 'dark-glass' | 'luminous'): void {
    theme.value = t
    saveToStorage()
  }

  return { autoSave, autoSaveIntervalMs, showMiniMap, recentFiles, locale, theme, aiBaseUrl, aiApiKey, aiModel, loadFromStorage, saveToStorage, addRecentFile, removeRecentFile, setLocale, setTheme }
})
