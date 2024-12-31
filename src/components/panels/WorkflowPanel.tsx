import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Play, Save, Pause, RotateCw, Settings, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  type: string;
  lastRun: string;
  nextRun?: string;
}

export const WorkflowPanel: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newWorkflow, setNewWorkflow] = React.useState({
    name: '',
    type: '',
    description: '',
  });

  const [workflows] = React.useState<Workflow[]>([
    {
      id: '1',
      name: 'Data Processing Pipeline',
      description: 'Automated data processing and analysis workflow',
      status: 'active',
      type: 'data-processing',
      lastRun: '2024-12-29T02:30:00Z',
      nextRun: '2024-12-29T03:30:00Z',
    },
    {
      id: '2',
      name: 'Content Generation',
      description: 'AI-powered content creation and optimization',
      status: 'paused',
      type: 'content',
      lastRun: '2024-12-29T02:00:00Z',
    },
  ]);

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.type) return;
    setIsCreating(false);
    setNewWorkflow({ name: '', type: '', description: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newWorkflow.type}
                  onValueChange={(value) => setNewWorkflow({ ...newWorkflow, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-processing">Data Processing</SelectItem>
                    <SelectItem value="content">Content Generation</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  placeholder="Enter workflow description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.status)}`} />
                    <CardTitle className="text-lg font-medium">{workflow.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{workflow.type}</Badge>
                  <Button variant="ghost" size="icon">
                    {workflow.status === 'active' ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span>{new Date(workflow.lastRun).toLocaleString()}</span>
                  </div>
                  {workflow.nextRun && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Next Run:</span>
                      <span>{new Date(workflow.nextRun).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};