import type { SearchResult, SearchFilters } from '../types/search'

declare const window: Window & typeof globalThis
const apiFetch = window.fetch.bind(window)

export async function searchAll(query: string, filters: SearchFilters): Promise<SearchResult[]> {
  const response = await apiFetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, filters }),
  })

  if (!response.ok) {
    throw new Error('Search failed')
  }

  return response.json()
}
