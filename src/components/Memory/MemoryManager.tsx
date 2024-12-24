import React, { useState } from 'react';
import { useMemoryManagement } from '../../hooks/useMemoryManagement';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Slider } from '../../components/ui/slider';
import { Card } from '../../components/ui/card';
import { ToolhouseLoadingWrapper } from '../../components/Loading/ToolhouseLoading';

export const MemoryManager: React.FC = () => {
  const { storeMemory, searchMemories, consolidateMemories } = useMemoryManagement();
  const [content, setContent] = useState('');
  const [importance, setImportance] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleStore = async () => {
    if (!content) return;
    
    await storeMemory.mutateAsync({
      content,
      importance,
      metadata: {
        source: 'user-input',
        timestamp: Date.now()
      }
    });

    setContent('');
    setImportance(0.7);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const results = await searchMemories(searchQuery);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConsolidate = () => {
    consolidateMemories.mutate();
  };

  return (
    <div className="space-y-6 p-4">
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Store Memory</h2>
        <div className="space-y-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter memory content..."
          />
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">
              Importance: {importance}
            </label>
            <Slider
              value={[importance]}
              onValueChange={([value]) => setImportance(value)}
              min={0}
              max={1}
              step={0.1}
            />
          </div>
          <Button
            onClick={handleStore}
            disabled={!content || storeMemory.isPending}
          >
            Store Memory
          </Button>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Search Memories</h2>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
            />
            <Button
              onClick={handleSearch}
              disabled={!searchQuery || isSearching}
            >
              Search
            </Button>
          </div>
          
          <ToolhouseLoadingWrapper
            isLoading={isSearching}
            className="min-h-[100px]"
          >
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Card key={result.id} className="p-3">
                  <p>{result.content}</p>
                  <div className="text-sm text-muted-foreground mt-1">
                    Importance: {result.metadata?.importance}
                  </div>
                </Card>
              ))}
            </div>
          </ToolhouseLoadingWrapper>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Memory Management</h2>
          <Button
            variant="outline"
            onClick={handleConsolidate}
            disabled={consolidateMemories.isPending}
          >
            Consolidate Memories
          </Button>
        </div>
      </Card>
    </div>
  );
};
