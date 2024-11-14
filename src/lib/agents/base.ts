import type { Message, TaskLedger, ProgressLedger, Tool } from '../../types';
import { XAIClient } from '../xai';
import { configStore } from '../config/store';
import { ToolPipeline } from '../tools/ToolPipeline';
import { SecurityMiddleware } from '../middleware/SecurityMiddleware';

export interface AgentCapability {
  name: string;
  description: string;
  requiredTools?: string[];
}

export abstract class BaseAgent {
  protected xai: XAIClient;
  protected taskLedger: TaskLedger;
  protected progressLedger: ProgressLedger;
  protected conversationContext: Message[] = [];
  protected toolPipeline: ToolPipeline;
  protected securityMiddleware: SecurityMiddleware;

  public readonly subordinates: string[] = [];
  private registeredCapabilities: Map<string, AgentCapability> = new Map();

  constructor(
    public readonly id: string,
    public readonly agentName: string,
    public readonly role: string,
    public readonly initialCapabilities: string[] = []
  ) {
    this.xai = new XAIClient(configStore.xai?.apiKey || '');
    this.toolPipeline = new ToolPipeline();
    this.securityMiddleware = new SecurityMiddleware();

    this.taskLedger = {
      facts: [],
      assumptions: [],
      currentPlan: []
    };

    this.progressLedger = {
      completedSteps: [],
      currentStep: null,
      remainingSteps: [],
      status: 'idle'
    };

    // Register initial capabilities
    initialCapabilities.forEach(cap => this.registerCapability({
      name: cap,
      description: `Default capability: ${cap}`
    }));
  }

  // Enhanced capability management
  registerCapability(capability: AgentCapability) {
    this.registeredCapabilities.set(capability.name, capability);
    
    // Automatically register required tools
    capability.requiredTools?.forEach(toolName => {
      const tool = this.findToolByName(toolName);
      if (tool) {
        this.toolPipeline.registerTool(tool);
      }
    });
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.registeredCapabilities.values());
  }

  hasCapability(capabilityName: string): boolean {
    return this.registeredCapabilities.has(capabilityName);
  }

  // Conversation context management
  addToConversationContext(message: Message) {
    this.conversationContext.push(message);
    // Optionally, limit context size
    if (this.conversationContext.length > 10) {
      this.conversationContext.shift();
    }
  }

  getConversationContext(): Message[] {
    return [...this.conversationContext];
  }

  clearConversationContext() {
    this.conversationContext = [];
  }

  // Tool management
  protected findToolByName(toolName: string): Tool | undefined {
    // Implement tool discovery mechanism
    // This could be expanded to search registered tools or a global tool registry
    return undefined;
  }

  abstract processMessage(message: Message): Promise<Message>;
  
  protected async updateTaskLedger(update: Partial<TaskLedger>) {
    this.taskLedger = {
      ...this.taskLedger,
      ...update
    };
  }

  protected async updateProgressLedger(update: Partial<ProgressLedger>) {
    this.progressLedger = {
      ...this.progressLedger,
      ...update
    };
  }

  protected createResponse(content: string): Message {
    const response: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      metadata: {
        agentId: this.id,
        agentName: this.agentName,
        taskProgress: this.progressLedger,
        capabilities: this.getCapabilities().map(c => c.name).join(', ')
      }
    };

    // Add response to conversation context
    this.addToConversationContext(response);

    return response;
  }

  // Enhanced subordinate management with capability checks
  addSubordinate(agentId: string, requiredCapabilities?: string[]) {
    if (!this.subordinates.includes(agentId)) {
      // Optional capability validation
      if (requiredCapabilities) {
        const missingCapabilities = requiredCapabilities.filter(
          cap => !this.hasCapability(cap)
        );
        
        if (missingCapabilities.length > 0) {
          throw new Error(`Missing capabilities: ${missingCapabilities.join(', ')}`);
        }
      }
      
      this.subordinates.push(agentId);
    }
  }

  removeSubordinate(agentId: string) {
    const index = this.subordinates.indexOf(agentId);
    if (index !== -1) {
      this.subordinates.splice(index, 1);
    }
  }

  // Error recovery mechanism
  protected async handleError(error: Error): Promise<Message> {
    // Log error
    console.error(`Agent ${this.id} encountered error:`, error);

    // Attempt to recover or generate an error response
    return this.createResponse(`Error occurred: ${error.message}`);
  }
}
