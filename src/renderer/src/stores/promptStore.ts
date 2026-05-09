import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { PromptNode, PromptFile } from '@/types/prompt'

export const usePromptStore = defineStore('prompt', () => {
  const nodes = ref<Record<string, PromptNode>>({})
  const rootIds = ref<string[]>([])
  const selectedNodeId = ref<string | null>(null)
  const highlightedNodeId = ref<string | null>(null)
  const locateRequestId = ref<string | null>(null)
  const fileName = ref('Untitled')

  const selectedNode = computed(() =>
    selectedNodeId.value ? nodes.value[selectedNodeId.value] ?? null : null
  )

  const allNodesList = computed(() => Object.values(nodes.value))

  const nodeCount = computed(() => Object.keys(nodes.value).length)

  function getDescendantIds(nodeId: string): string[] {
    const node = nodes.value[nodeId]
    if (!node) return []
    const result: string[] = []
    for (const childId of node.childrenIds) {
      result.push(childId)
      result.push(...getDescendantIds(childId))
    }
    return result
  }

  function createNode(overrides: Partial<PromptNode> = {}): string {
    const id = nanoid()
    const now = new Date().toISOString()
    nodes.value[id] = {
      id,
      parentId: null,
      childrenIds: [],
      title: '',
      promptText: '',
      description: '',
      rating: 0,
      tags: [],
      position: { x: 0, y: 0 },
      createdAt: now,
      updatedAt: now,
      ...overrides
    }
    return id
  }

  function addRootNode(position: { x: number; y: number }): string {
    const id = createNode({ position })
    rootIds.value.push(id)
    return id
  }

  function findSimilarSibling(nodeId: string): string | null {
    const node = nodes.value[nodeId]
    if (!node || !node.promptText.trim()) return null
    const text = normalizeText(node.promptText)
    if (text.length < 4) return null
    const siblings = node.parentId
      ? nodes.value[node.parentId]?.childrenIds
          .filter((id) => id !== nodeId)
          .map((id) => nodes.value[id])
          .filter(Boolean)
      : rootIds.value
          .filter((id) => id !== nodeId)
          .map((id) => nodes.value[id])
          .filter(Boolean)
    let bestId: string | null = null
    let bestScore = 0
    for (const sib of siblings) {
      if (!sib.promptText.trim()) continue
      const score = jaccardBigram(text, normalizeText(sib.promptText))
      if (score > bestScore) {
        bestScore = score
        bestId = sib.id
      }
    }
    return bestScore >= 0.85 ? bestId : null
  }

  function normalizeText(text: string): string {
    return text
      .replace(/\s+/g, '')
      .replace(/[，,。.！!？?；;：:""''「」【】《》（）\n\r\t]/g, '')
      .toLowerCase()
  }

  function bigrams(text: string): Set<string> {
    const set = new Set<string>()
    for (let i = 0; i < text.length - 1; i++) {
      set.add(text[i] + text[i + 1])
    }
    return set
  }

  function jaccardBigram(a: string, b: string): number {
    if (a === b) return 1
    if (!a.length || !b.length) return 0
    const sa = bigrams(a)
    const sb = bigrams(b)
    let intersection = 0
    for (const bg of sa) {
      if (sb.has(bg)) intersection++
    }
    return intersection / (sa.size + sb.size - intersection)
  }

  function getNodePath(nodeId: string): string[] {
    const path: string[] = []
    let current = nodes.value[nodeId]
    while (current) {
      path.unshift(current.title)
      current = current.parentId ? nodes.value[current.parentId] : null
    }
    return path
  }

  function findBestParent(text: string): { parentId: string; title: string; score: number; path: string[] } | null {
    const normalized = normalizeText(text)
    if (normalized.length < 4) return null
    let best: { id: string; title: string; score: number } | null = null
    for (const n of Object.values(nodes.value)) {
      if (!n.promptText?.trim()) continue
      const score = jaccardBigram(normalized, normalizeText(n.promptText))
      if (score >= 0.3 && (!best || score > best.score)) {
        best = { id: n.id, title: n.title, score }
      }
    }
    if (!best) return null
    return { parentId: best.id, title: best.title, score: best.score, path: getNodePath(best.id) }
  }

  function addChildNode(parentId: string, position: { x: number; y: number }): string | null {
    const parent = nodes.value[parentId]
    if (!parent) return null
    const id = createNode({ parentId, position })
    parent.childrenIds.push(id)
    return id
  }

  function deleteNode(nodeId: string): void {
    const node = nodes.value[nodeId]
    if (!node) return

    const descendants = getDescendantIds(nodeId)
    for (const descId of descendants) {
      delete nodes.value[descId]
    }

    if (node.parentId && nodes.value[node.parentId]) {
      nodes.value[node.parentId].childrenIds = nodes.value[node.parentId].childrenIds.filter(
        (id) => id !== nodeId
      )
    } else {
      rootIds.value = rootIds.value.filter((id) => id !== nodeId)
    }

    delete nodes.value[nodeId]

    if (selectedNodeId.value === nodeId) {
      selectedNodeId.value = null
    }
  }

  function updateNode(nodeId: string, updates: Partial<PromptNode>): void {
    const node = nodes.value[nodeId]
    if (!node) return
    Object.assign(node, updates, { updatedAt: new Date().toISOString() })
  }

  function updateNodePosition(nodeId: string, position: { x: number; y: number }): void {
    const node = nodes.value[nodeId]
    if (!node) return
    nodes.value[nodeId] = { ...node, position: { x: position.x, y: position.y }, updatedAt: new Date().toISOString() }
  }

  function selectNode(nodeId: string | null): void {
    selectedNodeId.value = nodeId
  }

  let highlightTimer: ReturnType<typeof setTimeout> | null = null
  function highlightNode(nodeId: string | null, duration = 3000): void {
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightedNodeId.value = nodeId
    if (nodeId) {
      highlightTimer = setTimeout(() => {
        highlightedNodeId.value = null
        highlightTimer = null
      }, duration)
    }
  }

  function requestLocate(nodeId: string): void {
    locateRequestId.value = nodeId
  }

  function consumeLocateRequest(): string | null {
    const id = locateRequestId.value
    locateRequestId.value = null
    return id
  }

  function toFileData(): PromptFile {
    return {
      version: 1,
      name: fileName.value,
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      rootIds: [...rootIds.value],
      settings: { autoSave: true, autoSaveIntervalMs: 30000 }
    }
  }

  function loadFileData(data: PromptFile): void {
    nodes.value = data.nodes
    rootIds.value = data.rootIds
    fileName.value = data.name
    selectedNodeId.value = null
  }

  function reset(): void {
    nodes.value = {}
    rootIds.value = []
    selectedNodeId.value = null
    fileName.value = 'Untitled'
  }

  return {
    nodes,
    rootIds,
    selectedNodeId,
    highlightedNodeId,
    locateRequestId,
    requestLocate,
    consumeLocateRequest,
    fileName,
    selectedNode,
    allNodesList,
    nodeCount,
    getDescendantIds,
    createNode,
    addRootNode,
    addChildNode,
    findSimilarSibling,
    findBestParent,
    deleteNode,
    updateNode,
    updateNodePosition,
    selectNode,
    highlightNode,
    toFileData,
    loadFileData,
    reset
  }
})
