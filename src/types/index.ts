export type { Message, MessageThread } from './message';
export type { Task, Action, Integration } from './chat';
export type { Settings } from './settings';
export { BaseAgent } from './base';
export { OrchestratorAgent } from './orchestrator';
export { WebSurferAgent } from './web-surfer';
export { FileSurferAgent } from './file-surfer';
export { CoderAgent } from './coder';

import type { Agent } from './base';
import { OrchestratorAgent } from './orchestrator';
import { WebSurferAgent } from './web-surfer';
import { FileSurferAgent } from './file-surfer';
import { CoderAgent } from './coder';

export interface AgentConstructor {
  id: string;
  name: string;
  role?: string;
  superiorId?: string;
}

export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  WORKER = 'worker',
  SPECIALIST = 'specialist'
}

export enum AgentStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline'
}

export interface AgentCapability {
  name: string;
  description?: string;
}

export interface Agent {
  id: string;
  type: AgentType;
  capabilities: AgentCapability[];
  status: AgentStatus;
  initialize(context: Record<string, unknown>): Promise<void>;
  processMessage(message: Message): Promise<Message>;
}

export enum MessageType {
  TASK = 'task',
  RESPONSE = 'response',
  ERROR = 'error',
  BROADCAST = 'broadcast',
  HANDOFF = 'handoff'
}

export interface AgentMetrics {
  messageCount: number;
  errorCount: number;
  averageResponseTime: number;
  status: string;
}

export interface LogLevel {
  DEBUG: string;
  INFO: string;
  WARN: string;
  ERROR: string;
}

export interface HostRuntimeConfig {
  id: string;
  type: AgentType;
  capabilities: AgentCapability[];
}

export interface CodeInsight {
  id: string;
  type: 'pattern' | 'performance' | 'solution';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  helpful?: boolean;
}

export interface WorkflowTeamMember {
  id: string;
  role: string;
  status: 'active' | 'inactive' | 'failed';
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  agentId: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  config?: Record<string, any>;
  dependencies?: string[];
}

export interface WorkflowMetadata {
  iterationCount: number;
  successMetrics: {
    accuracy: number;
    efficiency: number;
    reliability: number;
  };
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  team: WorkflowTeamMember[];
  metadata: WorkflowMetadata;
  created: string;
  updated: string;
  status: 'draft' | 'active' | 'archived';
}

export function createAgent(type: AgentType, config: AgentConstructor): Agent {
  switch (type) {
    case AgentType.Orchestrator: {
      const agent = new OrchestratorAgent(config.id, config.name);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: AgentType.Orchestrator,
        status: agent.status,
        capabilities: agent.capabilities,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        superiorId: config.superiorId
      };
    }
    case AgentType.WebSurfer: {
      const agent = new WebSurferAgent(config.id, config.name);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: AgentType.WebSurfer,
        status: agent.status,
        capabilities: agent.capabilities,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        superiorId: config.superiorId
      };
    }
    case AgentType.FileSurfer: {
      const agent = new FileSurferAgent(config.id, config.name);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: AgentType.FileSurfer,
        status: agent.status,
        capabilities: agent.capabilities,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        superiorId: config.superiorId
      };
    }
    case AgentType.Coder: {
      const agent = new CoderAgent(config.id, config.name);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: AgentType.Coder,
        status: agent.status,
        capabilities: agent.capabilities,
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        superiorId: config.superiorId
      };
    }
    default:
      throw new Error(`Unknown agent type: ${type}`);
  }
}

export {
  AgentConstructor,
  AgentType,
  createAgent,
  CodeInsight,
  WorkflowStep,
  WorkflowTeamMember,
  WorkflowMetadata,
  WorkflowDefinition
};
