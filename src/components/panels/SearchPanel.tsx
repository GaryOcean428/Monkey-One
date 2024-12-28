import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter } from 'lucide-react';
import { Card } from '../ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

export default function SearchPanel() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState('all');

  return (
    <div className="h-full p-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <Card className="p-4 mb-4">
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
                <SelectItem value="agents">Agents</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Advanced filters</span>
          </div>
        </Card>

        <div className="text-center text-muted-foreground mt-8">
          <p>No search results.</p>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}