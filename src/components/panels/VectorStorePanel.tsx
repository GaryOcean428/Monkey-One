import React, { useState } from 'react';
import { Database, Search, Plus, RefreshCcw, Settings, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useVectorStore } from '../../hooks/useVectorStore';
import { BasePanel } from './BasePanel';

interface IndexStats {
  vectorCount: number;
  dimension: number;
  indexSize: string;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
  content: string;
}

export function VectorStorePanel() {
  const [activeTab, setActiveTab] = useState('indexes');
  const [searchQuery, setSearchQuery] = useState('');
  const { indexes, searchResults, isLoading, error, refreshIndexes, search } = useVectorStore();

  return (
    <BasePanel
      title="Vector Store"
      description="Manage and search vector embeddings"
      isLoading={isLoading}
      error={error}
      headerActions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshIndexes}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Index
          </Button>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indexes">Indexes</TabsTrigger>
          <TabsTrigger value="search">Vector Search</TabsTrigger>
        </TabsList>

        <TabsContent value="indexes" className="space-y-4">
          {indexes.map((index) => (
            <Card key={index.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="text-blue-500" size={20} />
                  <div>
                    <h3 className="font-medium dark:text-white">{index.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {index.description}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vectors</p>
                  <p className="text-lg font-medium dark:text-white">
                    {index.stats.vectorCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dimension</p>
                  <p className="text-lg font-medium dark:text-white">
                    {index.stats.dimension}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Size</p>
                  <p className="text-lg font-medium dark:text-white">
                    {index.stats.indexSize}
                  </p>
                </div>
              </div>

              <Progress value={index.usage} className="h-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {index.usage}% used
              </p>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="p-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter your search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => search(searchQuery)}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="space-y-4">
              {searchResults.map((result) => (
                <Card key={result.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium dark:text-white">
                      Score: {result.score.toFixed(4)}
                    </h4>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {result.content}
                  </p>
                  {Object.entries(result.metadata).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full mr-2 mt-2"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </BasePanel>
  );
}