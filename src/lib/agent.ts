import type { Message } from '../types';
import { BaseAgent } from './agents/base';
import { OrchestratorAgent } from './agents/orchestrator';
import { WebSurferAgent } from './agents/web-surfer';
import { FileSurferAgent } from './agents/file-surfer';
import { CoderAgent } from './agents/coder';
import { config } from './config';

class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents() {
    // Create and register all agents
    const orchestrator = new OrchestratorAgent('orchestrator-1', 'Orchestrator');
    const webSurfer = new WebSurferAgent('websurfer-1', 'Web Surfer');
    const fileSurfer = new FileSurferAgent('filesurfer-1', 'File Surfer');
    const coder = new CoderAgent('coder-1', 'Code Assistant');

    this.agents.set(orchestrator.id, orchestrator);
    this.agents.set(webSurfer.id, webSurfer);
    this.agents.set(fileSurfer.id, fileSurfer);
    this.agents.set(coder.id, coder);
  }

  async processMessage(message: Message): Promise<Message> {
    const agent = this.getActiveAgent();
    if (!agent) {
      throw new Error('No active agent available');
    }

    try {
      return await agent.processMessage(message);
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  getActiveAgent(): BaseAgent | undefined {
    // For now, return the orchestrator as the default agent
    return this.agents.get('orchestrator-1');
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }
}

export const agentManager = new AgentManager();