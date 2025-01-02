export interface Memory {
  id: string
  content: string
  metadata: Record<string, unknown>
  embedding?: number[]
  createdAt: string
  updatedAt: string
}

export interface UseMemoryReturn {
  memories: Memory[]
  isLoading: boolean
  error: Error | null
  search: (query: string) => Promise<Memory[]>
  clear: () => Promise<void>
  add: (content: string, metadata?: Record<string, unknown>) => Promise<Memory>
  remove: (id: string) => Promise<void>
}
