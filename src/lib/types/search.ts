export interface SearchResult {
  id: string
  type: 'message' | 'agent' | 'tool' | 'workflow'
  title: string
  description: string
  timestamp: string
  tags: string[]
}

export interface SearchFilters {
  types: ('message' | 'agent' | 'tool' | 'workflow')[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  minScore: number
}
