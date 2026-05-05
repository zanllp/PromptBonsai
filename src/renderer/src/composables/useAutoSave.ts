import { watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useFileStore } from '@/stores/fileStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useFileOperations } from './useFileOperations'

export function useAutoSave() {
  const fileStore = useFileStore()
  const settingsStore = useSettingsStore()
  const { saveFile } = useFileOperations()

  let timer: ReturnType<typeof setInterval> | null = null

  function startAutoSave(): void {
    stopAutoSave()
    if (!settingsStore.autoSave || !fileStore.hasFilePath) return

    timer = setInterval(async () => {
      if (fileStore.isDirty) {
        const success = await saveFile()
        if (success) {
          console.log('[AutoSave] Saved')
        }
      }
    }, settingsStore.autoSaveIntervalMs)
  }

  function stopAutoSave(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function setup(): void {
    onMounted(() => {
      startAutoSave()
    })

    onUnmounted(() => {
      stopAutoSave()
    })

    watch(
      () => [fileStore.hasFilePath, settingsStore.autoSave, settingsStore.autoSaveIntervalMs],
      () => {
        startAutoSave()
      }
    )
  }

  return { startAutoSave, stopAutoSave, setup }
}
