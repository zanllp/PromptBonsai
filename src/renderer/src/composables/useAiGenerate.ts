import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settingsStore'

interface AIGenerateResult {
  title: string
  description: string
  tags: { name: string; color: string }[]
}

export function useAiGenerate() {
  const { t, locale } = useI18n()
  const settingsStore = useSettingsStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function generate(promptText: string, parentPromptText?: string): Promise<AIGenerateResult> {
    if (!promptText.trim()) throw new Error(t('ai.promptEmpty'))
    if (!settingsStore.aiApiKey) throw new Error(t('ai.noApiKey'))

    loading.value = true
    error.value = null

    try {
      const result = await window.api.aiGenerate(
        promptText,
        parentPromptText,
        settingsStore.aiBaseUrl,
        settingsStore.aiApiKey,
        settingsStore.aiModel,
        locale.value
      )
      return result as AIGenerateResult
    } catch (err: any) {
      const msg = err?.message ?? t('ai.generateFailed')
      error.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  return { loading, error, generate }
}
