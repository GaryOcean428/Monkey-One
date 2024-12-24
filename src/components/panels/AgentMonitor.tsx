import React, { useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { BasePanel } from './BasePanel';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useThoughtLogger } from '@/hooks/useThoughtLogger';

interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'error';
  task?: string;
  progress?: number;
  lastActive?: number;
  memory?: number;
  cpu?: number;
}

const DEMO_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Task Planner',
    status: 'working',
    task: 'Planning next steps for project',
    progress: 45,
    lastActive: Date.now(),
    memory: 256,
    cpu: 15,
  },
  {
    id: 'agent-2',
    name: 'Code Assistant',
    status: 'idle',
    lastActive: Date.now() - 5000,
    memory: 512,
    cpu: 5,
  },
  {
    id: 'agent-3',
    name: 'Memory Manager',
    status: 'error',
    task: 'Failed to connect to vector store',
    lastActive: Date.now() - 60000,
    memory: 128,
    cpu: 0,
  },
];

export function AgentMonitor() {
  const logger = useThoughtLogger({
    source: 'agent-monitor',
  });

  // Log agent state changes and important events
  useEffect(() => {
    logger.observe('Agent monitor initialized', {
      agentCount: DEMO_AGENTS.length,
      activeAgents: DEMO_AGENTS.filter(a => a.status === 'working').length,
    });

    // Example of logging different types of thoughts
    DEMO_AGENTS.forEach(agent => {
      if (agent.status === 'working') {
        logger.agentState(`Agent ${agent.name} is working on ${agent.task}`, {
          agentId: agent.id,
          task: agent.task,
          progress: agent.progress,
        }, {
          importance: 0.7,
          tags: ['status-update', 'working'],
        });
      } else if (agent.status === 'error') {
        logger.error(`Agent ${agent.name} encountered an error`, {
          agentId: agent.id,
          task: agent.task,
        }, {
          importance: 0.9,
          confidence: 1.0,
          tags: ['error', 'needs-attention'],
        });
      }
    });
  }, [logger]);

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'working':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'working':
        return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
      case 'error':
        return 'text-red-400 border-red-400/20 bg-red-400/10';
      default:
        return 'text-green-400 border-green-400/20 bg-green-400/10';
    }
  };

  return (
    <BasePanel title="Agent Monitor" className="flex flex-col space-y-4">
      {DEMO_AGENTS.map((agent) => (
        <Card
          key={agent.id}
          className={`p-4 border ${getStatusColor(agent.status)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {getStatusIcon(agent.status)}
                <h3 className="font-medium">{agent.name}</h3>
                <Badge variant="secondary" className="capitalize">
                  {agent.status}
                </Badge>
              </div>
              
              {agent.task && (
                <p className="mt-1 text-sm opacity-80">{agent.task}</p>
              )}
              
              {agent.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={agent.progress} className="h-1" />
                  <p className="mt-1 text-xs opacity-70">
                    Progress: {agent.progress}%
                  </p>
                </div>
              )}
            </div>

            <div className="text-right text-sm">
              <div className="opacity-70">
                Memory: {agent.memory}MB
              </div>
              <div className="opacity-70">
                CPU: {agent.cpu}%
              </div>
              <div className="mt-1 text-xs opacity-60">
                Last Active: {formatTimeAgo(agent.lastActive)}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </BasePanel>
  );
}

function formatTimeAgo(timestamp?: number): string {
  if (!timestamp) return 'Never';
  
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
