import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Filter, FileText, User, Wrench, GitBranch, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';

interface SearchResult {
  id: string;
  type: 'message' | 'agent' | 'tool' | 'workflow';
  title: string;
  description: string;
  timestamp: string;
  tags: string[];
}

export const SearchPanel: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchType, setSearchType] = React.useState('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const [dateRange, setDateRange] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('relevance');

  const [results] = React.useState<SearchResult[]>([
    {
      id: '1',
      type: 'message',
      title: 'Project Requirements Discussion',
      description: 'Chat history discussing the initial project requirements and scope.',
      timestamp: '2024-12-29T02:30:00Z',
      tags: ['requirements', 'planning'],
    },
    {
      id: '2',
      type: 'agent',
      title: 'WebSurfer Agent',
      description: 'Agent configured for web browsing and data collection tasks.',
      timestamp: '2024-12-29T02:15:00Z',
      tags: ['web', 'automation'],
    },
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    // Simulate search
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <FileText className="w-5 h-5" />;
      case 'agent':
        return <User className="w-5 h-5" />;
      case 'tool':
        return <Wrench className="w-5 h-5" />;
      case 'workflow':
        return <GitBranch className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {showFilters && (
                <div className="flex gap-2">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[150px]">
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="day">Last 24 hours</SelectItem>
                      <SelectItem value="week">Last week</SelectItem>
                      <SelectItem value="month">Last month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <Tag className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {getIcon(result.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{result.title}</h3>
                            <Badge variant="outline">{result.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              {result.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No search results found.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};