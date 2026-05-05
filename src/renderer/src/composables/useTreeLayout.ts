import { usePromptStore } from '@/stores/promptStore'
import type { PromptNode } from '@/types/prompt'

interface LayoutTree {
  id: string
  children: LayoutTree[]
  subtreeW: number
  subtreeH: number
  cols: number
}

const NODE_W = 280
const NODE_H = 140
const GAP_X = 30
const GAP_Y = 60
// target width/height ratio ≈ 3:2 (height/width ≈ 2:3)
const TARGET_RATIO = 3 / 2

function buildTree(nodeId: string, nodes: Record<string, PromptNode>): LayoutTree | null {
  const node = nodes[nodeId]
  if (!node) return null

  const children: LayoutTree[] = []
  for (const cid of node.childrenIds) {
    const child = buildTree(cid, nodes)
    if (child) children.push(child)
  }

  if (children.length === 0) {
    return { id: node.id, children, subtreeW: NODE_W, subtreeH: NODE_H, cols: 0 }
  }

  const n = children.length
  const sizes = children.map(c => ({ w: c.subtreeW, h: c.subtreeH }))
  const maxCH = Math.max(...sizes.map(s => s.h))

  // find optimal column count to approximate target aspect ratio
  let bestCols = 1
  let bestDiff = Infinity

  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols)
    let maxRW = 0
    for (let r = 0; r < rows; r++) {
      let rw = 0
      for (let c = 0; c < cols && r * cols + c < n; c++) {
        rw += sizes[r * cols + c].w
        if (c > 0) rw += GAP_X
      }
      maxRW = Math.max(maxRW, rw)
    }
    const w = Math.max(maxRW, NODE_W)
    const h = rows * maxCH + (rows - 1) * GAP_Y + GAP_Y + NODE_H
    const diff = Math.abs(w / h - TARGET_RATIO)
    if (diff < bestDiff) {
      bestDiff = diff
      bestCols = cols
    }
  }

  const rows = Math.ceil(n / bestCols)
  let maxRW = 0
  for (let r = 0; r < rows; r++) {
    let rw = 0
    for (let c = 0; c < bestCols && r * bestCols + c < n; c++) {
      rw += sizes[r * bestCols + c].w
      if (c > 0) rw += GAP_X
    }
    maxRW = Math.max(maxRW, rw)
  }
  const childAreaH = rows * maxCH + (rows - 1) * GAP_Y

  return {
    id: node.id,
    children,
    subtreeW: Math.max(maxRW, NODE_W),
    subtreeH: childAreaH + GAP_Y + NODE_H,
    cols: bestCols
  }
}

function positionTree(
  tree: LayoutTree,
  centerX: number,
  y: number,
  positions: Map<string, { x: number; y: number }>
): void {
  positions.set(tree.id, { x: centerX - NODE_W / 2, y })

  if (tree.children.length === 0) return

  const n = tree.children.length
  const cols = tree.cols
  const rows = Math.ceil(n / cols)
  const maxCH = Math.max(...tree.children.map(c => c.subtreeH))
  const sizes = tree.children.map(c => ({ w: c.subtreeW, h: c.subtreeH }))

  // compute each row's total width
  const rowWidths: number[] = []
  for (let r = 0; r < rows; r++) {
    let rw = 0
    for (let c = 0; c < cols && r * cols + c < n; c++) {
      rw += sizes[r * cols + c].w
      if (c > 0) rw += GAP_X
    }
    rowWidths.push(rw)
  }

  const childrenY = y + NODE_H + GAP_Y
  let idx = 0

  for (let r = 0; r < rows; r++) {
    let cx = centerX - rowWidths[r] / 2
    const rowY = childrenY + r * (maxCH + GAP_Y)

    for (let c = 0; c < cols && idx < n; c++) {
      const child = tree.children[idx]
      const childW = sizes[idx].w
      positionTree(child, cx + childW / 2, rowY, positions)
      cx += childW + GAP_X
      idx++
    }
  }
}

export function useTreeLayout() {
  const promptStore = usePromptStore()

  function applyLayout(): void {
    const { nodes, rootIds } = promptStore

    const trees: LayoutTree[] = []
    for (const rootId of rootIds) {
      const tree = buildTree(rootId, nodes)
      if (tree) trees.push(tree)
    }
    if (trees.length === 0) return

    const positions = new Map<string, { x: number; y: number }>()
    let x = 80

    for (const tree of trees) {
      positionTree(tree, x + tree.subtreeW / 2, 80, positions)
      x += tree.subtreeW + GAP_X * 2
    }

    for (const [id, pos] of positions) {
      promptStore.updateNodePosition(id, pos)
    }
  }

  return { applyLayout }
}
