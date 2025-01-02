import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAgentStore } from '../../store/agentStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';

export const AgentPanel: React.FC = () => {
  const { agents, activeAgent } = useAgentStore();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Agents</CardTitle>
        <Button variant="ghost" size="icon">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                activeAgent?.id === agent.id ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{agent.name}</span>
                <span className="text-sm text-muted-foreground">
                  {agent.description}
                </span>
              </div>
              <Badge variant={agent.provider === 'local' ? 'secondary' : 'default'}>
                {agent.provider}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
