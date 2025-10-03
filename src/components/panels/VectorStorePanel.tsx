import React, { Suspense } from 'react'
import { Card } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary'
import { useVectorStore } from '../../hooks/useVectorStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

function VectorStoreContent() {
  const {
    indexes,
    searchResults,
    isLoading,
    error,
    search,
    refreshIndexes,
    createIndex,
    deleteIndex,
    clearError,
    findSimilarInsights,
    findSimilarPatterns,
    storeInsight,
    storeMetrics,
  } = useVectorStore()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [indexName, setIndexName] = React.useState('')
  const [dimension, setDimension] = React.useState(1536)
  const [activeTab, setActiveTab] = React.useState('search')

  React.useEffect(() => {
    refreshIndexes()
  }, [refreshIndexes])

  if (error) {
    return (
      <Card className="bg-destructive/10 text-destructive p-4">
        <p>{error}</p>
        <Button variant="outline" onClick={clearError} className="mt-2">
          Dismiss
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vector Store Management</h2>
        <Button variant="outline" onClick={refreshIndexes} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="indexes">Indexes</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card className="p-4">
            <h3 className="text-md mb-2 font-medium">Vector Search</h3>
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Search query"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => search(searchQuery)} disabled={!searchQuery || isLoading}>
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map(result => (
                  <div key={result.id} className="bg-muted rounded p-2">
                    <div className="font-medium">{result.metadata?.title || 'Untitled'}</div>
                    <div className="text-muted-foreground text-sm">
                      Score: {result.score?.toFixed(4)}
                    </div>
                    {result.metadata?.description && (
                      <div className="mt-1 text-sm">{result.metadata.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="indexes">
          <Card className="p-4">
            <h3 className="text-md mb-2 font-medium">Index Management</h3>
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="Index name"
                value={indexName}
                onChange={e => setIndexName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Dimension"
                value={dimension}
                onChange={e => setDimension(parseInt(e.target.value))}
              />
              <Button
                onClick={() => createIndex(indexName, dimension)}
                disabled={!indexName || isLoading}
              >
                Create Index
              </Button>
            </div>

            <div className="space-y-2">
              {indexes.map(index => (
                <div
                  key={index.name}
                  className="bg-muted flex items-center justify-between rounded p-2"
                >
                  <div>
                    <span className="font-medium">{index.name}</span>
                    <span className="text-muted-foreground ml-2 text-sm">({index.dimension}d)</span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteIndex(index.name)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="p-4">
            <h3 className="text-md mb-2 font-medium">Code Insights</h3>
            <div className="text-muted-foreground mb-4 text-sm">
              View and manage code insights stored in the vector database.
            </div>
            {/* Insights content will be implemented in next iteration */}
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="bg-background/80 fixed inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}

export function VectorStorePanel() {
  return (
    <div
      className="bg-background h-full overflow-auto p-4"
      role="region"
      aria-label="Vector Store Management"
    >
      <ToolhouseErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <VectorStoreContent />
        </Suspense>
      </ToolhouseErrorBoundary>
    </div>
  )
}
