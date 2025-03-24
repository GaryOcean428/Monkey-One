import React from 'react';
import { Button } from '../ui/button';
import { Plus, Play, Save, Pause, RotateCw, Settings, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BasePanel } from './BasePanel';
import { useWorkflowStore, type Workflow } from '@/stores/workflowStore';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { cn } from '@/lib/utils';

const ErrorFallback = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Error Loading Workflows</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
);

const WorkflowCard: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
  const { toggleWorkflowStatus, deleteWorkflow } = useWorkflowStore();

  return (
    <div className="p-4 border rounded-lg mb-4 bg-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{workflow.name}</h3>
            <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
              {workflow.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleWorkflowStatus(workflow.id)}
          >
            {workflow.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteWorkflow(workflow.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <RotateCw className="h-4 w-4" />
          Last run: {new Date(workflow.lastRun).toLocaleString()}
        </div>
        {workflow.nextRun && (
          <div className="mt-1">
            Next run: {new Date(workflow.nextRun).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateWorkflowDialog: React.FC = () => {
  const { createWorkflow, isLoading } = useWorkflowStore();
  const [open, setOpen] = React.useState(false);
  const [newWorkflow, setNewWorkflow] = React.useState({
    name: '',
    type: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWorkflow(newWorkflow);
    setOpen(false);
    setNewWorkflow({ name: '', type: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              placeholder="Enter workflow name"
              required
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={newWorkflow.type}
              onValueChange={(value) => setNewWorkflow({ ...newWorkflow, type: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workflow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data-processing">Data Processing</SelectItem>
                <SelectItem value="content">Content Generation</SelectItem>
                <SelectItem value="automation">Automation</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={newWorkflow.description}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              placeholder="Enter workflow description"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Create Workflow
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const WorkflowList: React.FC = () => {
  const { workflows, isLoading, error, fetchWorkflows } = useWorkflowStore();

  React.useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No workflows configured.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </ScrollArea>
  );
};

export const WorkflowPanel: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BasePanel
        title="Workflows"
        description="Manage and monitor your automated workflows"
        actions={<CreateWorkflowDialog />}
      >
        <WorkflowList />
      </BasePanel>
    </ErrorBoundary>
  );
};