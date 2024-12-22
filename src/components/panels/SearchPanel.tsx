import React, { useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export function SearchPanel() {
  const [searchType, setSearchType] = useState('all');

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Universal Search</h2>
        <div className="flex items-center gap-2">
          <Select value={searchType} onValueChange={setSearchType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Search type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="workflows">Workflows</SelectItem>
              <SelectItem value="agents">Agents</SelectItem>
              <SelectItem value="memory">Memory</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="code">Code</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SortAsc className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          className="pl-10" 
          placeholder="Search across all content..."
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search results will go here */}
      </div>
    </div>
  );
}