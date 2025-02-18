import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { LoadingSpinner } from '../ui/loading-spinner';
import { BasePanel } from './BasePanel';
import { useToolStore } from '@/stores/toolStore';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const ErrorFallback = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error Loading Tools</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);

const CreateToolForm: React.FC = () => {
  const { isLoading, createTool } = useToolStore();
  const [toolName, setToolName] = React.useState('');
  const [toolType, setToolType] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !toolType) return;
    
    await createTool({ name: toolName, type: toolType });
    setToolName('');
    setToolType('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tool Name</Label>
        <Input 
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          placeholder="Enter tool name"
          required
        />
      </div>
      <div>
        <Label>Tool Type</Label>
        <Select value={toolType} onValueChange={setToolType} required>
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? <LoadingSpinner className="mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
        Add Tool
      </Button>
    </form>
  );
};

const ToolsPanel: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BasePanel
        title="Tools"
        description="Manage and configure your tools"
      >
        <CreateToolForm />
      </BasePanel>
    </ErrorBoundary>
  );
};

export { ToolsPanel };