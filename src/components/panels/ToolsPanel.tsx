import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

export default function ToolsPanel() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [toolName, setToolName] = React.useState('');
  const [toolType, setToolType] = React.useState('');

  return (
    <div className="h-full p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tools</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Tool
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <h3 className="text-md font-medium mb-4">Create Tool</h3>
        <div className="space-y-4">
          <div>
            <Label>Tool Name</Label>
            <Input 
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="Enter tool name"
            />
          </div>
          <div>
            <Label>Tool Type</Label>
            <Select value={toolType} onValueChange={setToolType}>
              <SelectTrigger>
                <SelectValue placeholder="Select tool type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">API Integration</SelectItem>
                <SelectItem value="data">Data Processing</SelectItem>
                <SelectItem value="web">Web Automation</SelectItem>
                <SelectItem value="custom">Custom Function</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="text-center text-muted-foreground mt-8">
        <p>No tools configured.</p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
}