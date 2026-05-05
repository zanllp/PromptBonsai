interface AIGenerateResult {
  title: string
  description: string
  tags: { name: string; color: string }[]
}

interface PromptManagerAPI {
  fileNew: () => Promise<boolean>
  fileOpen: () => Promise<{ filePath: string; data: string } | null>
  fileSave: (filePath: string, data: string) => Promise<{ filePath: string; success: boolean }>
  fileSaveAs: (data: string) => Promise<{ filePath: string; success: boolean } | null>
  fileOpenPath: (filePath: string) => Promise<{ filePath: string; data: string } | { filePath: string; error: string }>
  getAppPath: () => Promise<string>
  aiGenerate: (promptText: string, parentPromptText?: string) => Promise<AIGenerateResult>
  onCloseRequested: (callback: () => void) => void
  openDevTools: () => void
}

declare global {
  interface Window {
    api: PromptManagerAPI
    closeConfirmed?: boolean
  }
}
