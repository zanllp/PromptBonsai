import type { Node, Edge } from '@vue-flow/core'
import type { PromptNode } from './prompt'

export type PromptFlowNode = Node<{
  promptNode: PromptNode
}>

export type PromptFlowEdge = Edge
