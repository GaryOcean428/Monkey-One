import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export default function ToolsPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tools</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>
      <div className="text-center text-muted-foreground mt-8">
        <p>No tools configured.</p>
      </div>
    </div>
  );
}