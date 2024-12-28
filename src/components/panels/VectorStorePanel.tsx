import React, { Suspense } from 'react';
import { Card } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';
import { useVectorStore } from '../../hooks/useVectorStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

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
    storeMetrics
  } = useVectorStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [indexName, setIndexName] = React.useState('');
  const [dimension, setDimension] = React.useState(1536);
  const [activeTab, setActiveTab] = React.useState('search');

  React.useEffect(() => {
    refreshIndexes();
  }, [refreshIndexes]);

  if (error) {
    return (
      <Card className="p-4 bg-destructive/10 text-destructive">
        <p>{error}</p>
        <Button variant="outline" onClick={clearError} className="mt-2">
          Dismiss
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Vector Store Management</h2>
        <Button 
          variant="outline" 
          onClick={refreshIndexes}
          disabled={isLoading}
        >
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
            <h3 className="text-md font-medium mb-2">Vector Search</h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                onClick={() => search(searchQuery)}
                disabled={!searchQuery || isLoading}
              >
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div key={result.id} className="p-2 bg-muted rounded">
                    <div className="font-medium">{result.metadata?.title || 'Untitled'}</div>
                    <div className="text-sm text-muted-foreground">
                      Score: {result.score?.toFixed(4)}
                    </div>
                    {result.metadata?.description && (
                      <div className="text-sm mt-1">{result.metadata.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="indexes">
          <Card className="p-4">
            <h3 className="text-md font-medium mb-2">Index Management</h3>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Index name"
                value={indexName}
                onChange={(e) => setIndexName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Dimension"
                value={dimension}
                onChange={(e) => setDimension(parseInt(e.target.value))}
              />
              <Button 
                onClick={() => createIndex(indexName, dimension)}
                disabled={!indexName || isLoading}
              >
                Create Index
              </Button>
            </div>
            
            <div className="space-y-2">
              {indexes.map((index) => (
                <div key={index.name} className="flex justify-between items-center p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{index.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({index.dimension}d)
                    </span>
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
            <h3 className="text-md font-medium mb-2">Code Insights</h3>
            <div className="text-sm text-muted-foreground mb-4">
              View and manage code insights stored in the vector database.
            </div>
            {/* Insights content will be implemented in next iteration */}
          </Card>
        </TabsContent>
      </Tabs>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}

export default function VectorStorePanel() {
  return (
    <div 
      className="h-full p-4 bg-background overflow-auto"
      role="region"
      aria-label="Vector Store Management"
    >
      <ToolhouseErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <VectorStoreContent />
        </Suspense>
      </ToolhouseErrorBoundary>
    </div>
  );
}