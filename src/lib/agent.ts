import type { Agent, Message, MemoryItem } from '../types';
import { tools } from './tools';
import { memoryManager } from './memory';
import { XAIClient, createSystemMessage } from './xai';
import { configStore } from './config/store';
import { createAgent, AgentType } from './agents';

class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private xai: XAIClient;

  constructor() {
    this.xai = new XAIClient(configStore.xai.apiKey);
    this.initializeAgents();
  }

  private initializeAgents() {
    // Create orchestrator agent
    const orchestrator = createAgent(AgentType.Orchestrator, {
      id: crypto.randomUUID(),
      name: 'Orchestrator'
    });
    this.agents.set(orchestrator.id, orchestrator);

    // Create specialized agents
    const webSurfer = createAgent(AgentType.WebSurfer, {
      id: crypto.randomUUID(),
      name: 'WebSurfer',
      superiorId: orchestrator.id
    });
    this.agents.set(webSurfer.id, webSurfer);

    const fileSurfer = createAgent(AgentType.FileSurfer, {
      id: crypto.randomUUID(),
      name: 'FileSurfer',
      superiorId: orchestrator.id
    });
    this.agents.set(fileSurfer.id, fileSurfer);

    const coder = createAgent(AgentType.Coder, {
      id: crypto.randomUUID(),
      name: 'Coder',
      superiorId: orchestrator.id
    });
    this.agents.set(coder.id, coder);
  }

  createAgent(name: string, type: string, superiorId?: string): Agent {
    const agent = createAgent(type, {
      id: crypto.randomUUID(),
      name,
      superiorId
    });

    this.agents.set(agent.id, agent);

    if (superiorId) {
      const superior = this.agents.get(superiorId);
      if (superior) {
        superior.subordinates.push(agent.id);
      }
    }

    return agent;
  }

  async processMessage(message: Message, onProgress?: (content: string) => void): Promise<Message> {
    try {
      // Store user input in memory
      await memoryManager.add({
        type: 'instruction',
        content: message.content,
        tags: ['user-input']
      });

      // Check for direct commands first
      const parts = message.content.toLowerCase().split(' ');
      const command = parts[0];

      if (['search', 'memory', 'exec'].includes(command)) {
        return this.processCommand(command, parts.slice(1).join(' '));
      }

      // Search for relevant memories
      const relevantMemories = await memoryManager.search(message.content);
      const context = this.formatMemoryContext(relevantMemories);

      // Process with xAI including memory context
      const response = await this.xai.chat([
        createSystemMessage(),
        {
          role: 'system',
          content: `Relevant context from memory:\n${context}\n\nUse this context if relevant to the user's query.`
        },
        { role: 'user', content: message.content }
      ], onProgress);

      // Store response in memory
      await memoryManager.add({
        type: 'response',
        content: response,
        tags: ['assistant-response']
      });

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = `Error processing message: ${(error as Error).message}`;

      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error']
      });

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  private formatMemoryContext(memories: MemoryItem[]): string {
    if (memories.length === 0) return 'No relevant context found.';

    return memories
      .map(memory => `[${new Date(memory.timestamp).toLocaleString()}] ${memory.type}: ${memory.content}`)
      .join('\n\n');
  }

  private async processCommand(command: string, args: string): Promise<Message> {
    try {
      let response: string;

      switch (command) {
        case 'search': {
          const results = await tools.execute('searchMemory', { query: args });
          response = JSON.stringify(results, null, 2);
          break;
        }

        case 'memory': {
          const recent = memoryManager.getRecent(5);
          response = JSON.stringify(recent, null, 2);
          break;
        }

        case 'exec': {
          const result = await tools.execute('executeCode', { code: args });
          response = JSON.stringify(result, null, 2);
          break;
        }

        default:
          response = 'Command not recognized';
      }

      await memoryManager.add({
        type: 'response',
        content: response,
        tags: ['command-response', command]
      });

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
    } catch (error) {
      const errorMessage = `Error executing command: ${(error as Error).message}`;

      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error', 'command-error']
      });

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMessage,
        timestamp: Date.now()
      };
    }
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}

export const agentManager = new AgentManager();
