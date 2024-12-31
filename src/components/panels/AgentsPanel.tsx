import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const AgentsPanel: React.FC = () => {
  const { agents, addAgent, removeAgent } = useAgentStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const [newAgent, setNewAgent] = React.useState({
    name: '',
    type: '',
    description: '',
  });

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.type) return;

    addAgent({
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      description: newAgent.description,
      provider: 'local',
      capabilities: ['chat', 'rag'],
      settings: {},
    });

    setIsCreating(false);
    setNewAgent({ name: '', type: '', description: '' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agents</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Enter agent name"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newAgent.type}
                  onValueChange={(value) => setNewAgent({ ...newAgent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orchestrator">Orchestrator</SelectItem>
                    <SelectItem value="websurfer">WebSurfer</SelectItem>
                    <SelectItem value="filesurfer">FileSurfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  placeholder="Enter agent description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgent}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">{agent.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={agent.provider === 'local' ? 'secondary' : 'default'}>
                    {agent.provider}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeAgent(agent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((capability) => (
                    <Badge key={capability} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
