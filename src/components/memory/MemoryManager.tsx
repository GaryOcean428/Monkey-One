import React, { useEffect, useState } from 'react'
import { VectorStore, SearchResult } from '../../memory/vector'
import { Alert, AlertTitle, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Loader2 } from 'lucide-react'

interface MemoryStats {
  totalItems: number
  lastUpdate: string
}

export function MemoryManager() {
  const [vectorStore, setVectorStore] = useState<VectorStore | null>(null)
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    initializeVectorStore()
  }, [])

  async function initializeVectorStore() {
    try {
      const store = await VectorStore.getInstance(undefined, (operation, metrics) => {
        console.log(`Operation ${operation}:`, metrics)
      })
      setVectorStore(store)
      await updateStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize vector store')
    } finally {
      setLoading(false)
    }
  }

  async function updateStats() {
    try {
      if (!vectorStore) return

      const indexStats = await vectorStore.getIndexStats()
      setStats({
        totalItems: indexStats.totalRecordCount ?? 0,
        lastUpdate: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to update stats:', err)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim() || !vectorStore) return

    setSearching(true)
    try {
      // In a real implementation, you would:
      // 1. Convert the search query to a vector using an embedding model
      // 2. Use that vector to perform the semantic search
      const mockVector = Array(1536)
        .fill(0)
        .map(() => Math.random()) // Mock vector for demonstration
      const results = await vectorStore.semanticSearch(mockVector, 5)
      setSearchResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Memory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search memory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {stats && (
              <div className="text-sm text-gray-600">
                <p>Total Items: {stats.totalItems}</p>
                <p>Last Updated: {new Date(stats.lastUpdate).toLocaleString()}</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-semibold">Search Results</h3>
                <div className="space-y-2">
                  {searchResults.map(result => (
                    <Card key={result.id}>
                      <CardContent className="p-4">
                        <p className="font-medium">{result.metadata.type}</p>
                        <p className="text-sm text-gray-600">Score: {result.score.toFixed(4)}</p>
                        <p className="text-sm text-gray-600">Source: {result.metadata.source}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
