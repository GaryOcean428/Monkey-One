import { MemoryStats } from '../types/memory'
import { DocumentStats } from '../types/document'
import { WorkflowStats } from '../types/workflow'

declare const window: Window & typeof globalThis
const apiFetch = window.fetch.bind(window)

export async function getMemoryStats(): Promise<MemoryStats> {
  const response = await apiFetch('/api/stats/memory')
  if (!response.ok) {
    throw new Error('Failed to fetch memory stats')
  }
  return response.json()
}

export async function getDocumentStats(): Promise<DocumentStats> {
  const response = await apiFetch('/api/stats/documents')
  if (!response.ok) {
    throw new Error('Failed to fetch document stats')
  }
  return response.json()
}

export async function getWorkflowStats(): Promise<WorkflowStats> {
  const response = await apiFetch('/api/stats/workflows')
  if (!response.ok) {
    throw new Error('Failed to fetch workflow stats')
  }
  return response.json()
}
