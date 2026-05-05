export interface Tag {
  name: string
  color?: string
}

export interface PromptNode {
  id: string
  parentId: string | null
  childrenIds: string[]
  title: string
  promptText: string
  description: string
  rating: number
  tags: Tag[]
  position: { x: number; y: number }
  createdAt: string
  updatedAt: string
}

export interface PromptFile {
  version: 1
  name: string
  nodes: Record<string, PromptNode>
  rootIds: string[]
  settings: {
    autoSave: boolean
    autoSaveIntervalMs: number
  }
}
