import { onMounted, onUnmounted } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useFileOperations } from './useFileOperations'

export function useKeyboardShortcuts() {
  const promptStore = usePromptStore()
  const { saveFile, newFile } = useFileOperations()

  function handleKeyDown(e: KeyboardEvent): void {
    // Ctrl+S / Cmd+S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveFile()
      return
    }

    // Ctrl+N / Cmd+N: New file
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      newFile()
      return
    }

    // Delete / Backspace: Delete selected node (only when not in input)
    if ((e.key === 'Delete' || e.key === 'Backspace') && promptStore.selectedNodeId) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      e.preventDefault()
      promptStore.deleteNode(promptStore.selectedNodeId)
      return
    }

    // Escape: Deselect
    if (e.key === 'Escape') {
      promptStore.selectNode(null)
      return
    }
  }

  function setup(): void {
    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })
  }

  return { setup }
}
