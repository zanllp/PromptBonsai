import { usePromptStore } from '@/stores/promptStore'
import { useFileStore } from '@/stores/fileStore'
import { useSettingsStore } from '@/stores/settingsStore'

function basename(filePath: string): string {
  const sep = filePath.includes('\\') ? '\\' : '/'
  return filePath.split(sep).pop() ?? filePath
}

export function useFileOperations() {
  const promptStore = usePromptStore()
  const fileStore = useFileStore()
  const settingsStore = useSettingsStore()

  async function newFile(): Promise<boolean> {
    if (fileStore.isDirty) {
      const proceed = await window.api.fileNew()
      if (!proceed) return false
    }
    promptStore.reset()
    fileStore.newBlank()
    return true
  }

  async function openFile(): Promise<boolean> {
    if (fileStore.isDirty) {
      const proceed = await window.api.fileNew()
      if (!proceed) return false
    }

    const result = await window.api.fileOpen()
    if (!result) return false

    try {
      const data = JSON.parse(result.data) as any
      if (data.version !== 1) {
        console.error('Unsupported file version:', data.version)
        return false
      }
      promptStore.loadFileData(data)
      fileStore.setFilePath(result.filePath)
      fileStore.markClean()
      settingsStore.addRecentFile(result.filePath, data.name ?? basename(result.filePath))
      return true
    } catch (err) {
      console.error('Failed to parse file:', result.filePath, err)
      return false
    }
  }

  async function saveFile(): Promise<boolean> {
    const jsonData = JSON.stringify(promptStore.toFileData(), null, 2)

    if (fileStore.hasFilePath && fileStore.filePath !== ':blank') {
      const result = await window.api.fileSave(fileStore.filePath!, jsonData)
      if (result.success) {
        fileStore.markClean()
        return true
      }
      return false
    }

    return saveFileAs()
  }

  async function saveFileAs(): Promise<boolean> {
    const jsonData = JSON.stringify(promptStore.toFileData(), null, 2)
    const result = await window.api.fileSaveAs(jsonData)
    if (!result) return false

    fileStore.setFilePath(result.filePath)
    fileStore.markClean()
    return true
  }

  async function openFileByPath(filePath: string): Promise<boolean> {
    if (fileStore.isDirty) {
      const proceed = await window.api.fileNew()
      if (!proceed) return false
    }

    const result = await window.api.fileOpenPath(filePath)
    if ('error' in result) return false

    try {
      const data = JSON.parse(result.data) as any
      if (data.version !== 1) return false
      promptStore.loadFileData(data)
      fileStore.setFilePath(result.filePath)
      fileStore.markClean()
      settingsStore.addRecentFile(result.filePath, data.name ?? basename(result.filePath))
      return true
    } catch {
      return false
    }
  }

  return { newFile, openFile, saveFile, saveFileAs, openFileByPath }
}
