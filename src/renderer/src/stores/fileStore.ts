import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFileStore = defineStore('file', () => {
  const filePath = ref<string | null>(null)
  const isDirty = ref(false)

  const hasFilePath = computed(() => filePath.value !== null)
  const displayTitle = computed(() => {
    const name = filePath.value === ':blank' ? 'Untitled' : filePath.value ?? 'Untitled'
    return isDirty.value ? `* ${name}` : name
  })

  function markDirty(): void {
    isDirty.value = true
  }

  function markClean(): void {
    isDirty.value = false
  }

  function setFilePath(path: string | null): void {
    filePath.value = path
  }

  function reset(): void {
    filePath.value = null
    isDirty.value = false
  }

  function newBlank(): void {
    filePath.value = ':blank'
    isDirty.value = false
  }

  return { filePath, isDirty, hasFilePath, displayTitle, markDirty, markClean, setFilePath, reset, newBlank }
})
