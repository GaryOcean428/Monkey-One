import type { SearchResult, SearchFilters } from '../types/search'

declare const window: Window & typeof globalThis
const apiFetch = window.fetch.bind(window)

async function fetchFromProvider(providerUrl: string, query: string, filters: SearchFilters): Promise<SearchResult[]> {
  const response = await apiFetch(providerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, filters }),
  })

  if (!response.ok) {
    throw new Error(`Search failed for provider: ${providerUrl}`)
  }

  return response.json()
}

export async function searchAll(query: string, filters: SearchFilters): Promise<SearchResult[]> {
  const providerUrls = [
    '/api/search/provider1',
    '/api/search/provider2',
    '/api/search/provider3',
  ]

  const searchPromises = providerUrls.map(url => fetchFromProvider(url, query, filters))

  const results = await Promise.all(searchPromises)

  return results.flat()
}
