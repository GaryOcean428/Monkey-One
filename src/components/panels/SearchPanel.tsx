import React, { useState } from 'react'
import { Panel } from '../ui/Panel'
import { RangeInput } from '../ui/RangeInput'
import type { SearchResult, SearchFilters } from '../../lib/types/search'
import { searchAll } from '../../lib/api/search'

interface SearchPanelProps {
  loading?: boolean
  error?: string
}

export function SearchPanel({ loading = false, error }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['memory', 'document', 'workflow'],
    sortBy: 'relevance',
    sortOrder: 'desc',
    minScore: 0.7,
  })

  const handleSearch = async () => {
    if (!query.trim()) return
    try {
      const searchResults = await searchAll(query, filters)
      setResults(searchResults)
    } catch (err) {
      console.error('Search failed:', err)
      setResults([])
      if (error) {
        error('Search failed. Please try again.')
      }
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`
  }

  return (
    <Panel
      title="Search"
      description="Search across memory, documents, and workflows"
      loading={loading}
      error={error}
    >
      <div className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="search-input" className="sr-only">
              Search Query
            </label>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 rounded-md bg-gray-50 p-4">
          {/* Type Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Types</label>
            <div className="flex gap-2">
              {['memory', 'document', 'workflow'].map(type => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.types?.includes(type as any)}
                    onChange={e => {
                      const types = filters.types || []
                      handleFilterChange(
                        'types',
                        e.target.checked ? [...types, type] : types.filter(t => t !== type)
                      )
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
            <select
              id="sort-by"
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm"
              aria-label="Sort results by"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="type">Type</option>
            </select>
          </div>

          {/* Min Score */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Min Score</label>
            <RangeInput
              id="min-score"
              value={filters.minScore ? filters.minScore * 100 : 70}
              label="Minimum score threshold"
              onChange={value => handleFilterChange('minScore', value / 100)}
              formatOutput={value => `${value}%`}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.map(result => (
            <div
              key={result.id}
              className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{result.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {result.content.length > 200
                      ? `${result.content.slice(0, 200)}...`
                      : result.content}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize">
                    {result.type}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">Score: {formatScore(result.score)}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(result.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
          {results.length === 0 && query && !loading && (
            <div className="py-8 text-center text-gray-500">No results found</div>
          )}
        </div>
      </div>
    </Panel>
  )
}
