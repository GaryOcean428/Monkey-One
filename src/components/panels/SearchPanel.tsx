import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

export default function SearchPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="flex gap-2 mb-4">
          <Input placeholder="Search..." className="flex-1" />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        <div className="text-center text-muted-foreground mt-8">
          <p>No search results.</p>
        </div>
      </div>
    </div>
  );
}