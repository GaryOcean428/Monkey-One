import { 
  Agent, 
  AgentRole, 
  AgentCapability,
  WorkflowStep,
  WorkflowEvent,
  DelegationRequest
} from '../types';
import { XAIMessage } from '../../types';
import { AdvancedRouter } from '../../router';
import { TokenEstimator } from '../../tokenEstimator';

export abstract class BaseAgent implements Agent {
  public id: string;
  public role: AgentRole;
  public capabilities: AgentCapability[];
  public status: 'available' | 'busy' | 'offline';
  public metadata: Record<string, any>;
  public currentTask?: string;
  protected router: AdvancedRouter;

  constructor(
    role: AgentRole,
    capabilities: AgentCapability[],
    metadata: Record<string, any> = {}
  ) {
    this.id = crypto.randomUUID();
    this.role = role;
    this.capabilities = capabilities;
    this.status = 'available';
    this.metadata = metadata;
    this.router = new AdvancedRouter();
  }

  /**
   * Execute a task
   */
  public abstract executeTask(
    step: WorkflowStep,
    context: Record<string, any>
  ): Promise<{
    status: 'completed' | 'failed';
    result?: any;
    error?: Error;
    messages: XAIMessage[];
  }>;

  /**
   * Handle delegation request
   */
  public async handleDelegation(
    request: DelegationRequest
  ): Promise<boolean> {
    if (this.status !== 'available') return false;

    const canHandle = this.canHandleTask(request);
    if (!canHandle) return false;

    this.status = 'busy';
    this.currentTask = request.taskId;
    return true;
  }

  /**
   * Check if agent can handle task
   */
  protected canHandleTask(request: DelegationRequest): boolean {
    // Check workload
    if (this.currentTask) return false;

    // Check capabilities
    const requiredCapabilities = request.context.requiredCapabilities || [];
    return requiredCapabilities.every(cap =>
      this.capabilities.some(agentCap => agentCap.id === cap)
    );
  }

  /**
   * Handle event
   */
  public abstract handleEvent(event: WorkflowEvent): Promise<void>;

  /**
   * Validate task requirements
   */
  protected validateTaskRequirements(
    step: WorkflowStep
  ): void {
    const requiredCapabilities = step.metadata.requiredCapabilities || [];
    const missingCapabilities = requiredCapabilities.filter(cap =>
      !this.capabilities.some(agentCap => agentCap.id === cap)
    );

    if (missingCapabilities.length > 0) {
      throw new Error(
        `Missing required capabilities: ${missingCapabilities.join(', ')}`
      );
    }
  }

  /**
   * Estimate task complexity
   */
  protected estimateTaskComplexity(
    step: WorkflowStep,
    context: Record<string, any>
  ): number {
    const estimate = TokenEstimator.estimateConversationTokens(
      context.messages || [],
      'general',
      'direct_answer'
    );

    return Math.min(estimate.totalTokens / 1000, 1);
  }

  /**
   * Log task progress
   */
  protected logProgress(
    step: WorkflowStep,
    progress: number,
    message: string
  ): void {
    console.log(
      `[Agent ${this.id}] Task ${step.id}: ${progress}% - ${message}`
    );
  }

  /**
   * Handle task error
   */
  protected async handleTaskError(
    step: WorkflowStep,
    error: Error
  ): Promise<void> {
    console.error(
      `[Agent ${this.id}] Error in task ${step.id}:`,
      error
    );

    // Check if error requires handoff
    const handoffManager = HandoffManager.getInstance();
    const handoffCriteria = await handoffManager.evaluateHandoff(
      this,
      {
        id: crypto.randomUUID(),
        type: 'error',
        role: 'system',
        content: error.message,
        timestamp: Date.now()
      },
      step.context || {}
    );

    if (handoffCriteria) {
      const targetAgent = await handoffManager.findBestAgent(handoffCriteria);
      if (targetAgent) {
        const handoffSuccess = await handoffManager.executeHandoff(
          this,
          targetAgent,
          {
            ...step.context,
            error: error.message,
            handoffReason: 'error_recovery'
          }
        );

        if (handoffSuccess) {
          console.log(`Task handed off to agent ${targetAgent.id} for error recovery`);
          return;
        }
      }
    }

    // If handoff not possible or failed, proceed with normal error handling
    this.status = 'available';
    this.currentTask = undefined;

    this.emitEvent({
      id: crypto.randomUUID(),
      type: 'TASK_ERROR',
      payload: {
        stepId: step.id,
        error: error.message,
        agentId: this.id,
      },
      timestamp: new Date(),
      source: `agent:${this.id}`,
      metadata: {},
    });
  }

  /**
   * Emit event
   */
  protected emitEvent(event: WorkflowEvent): void {
    // Implement event emission logic
    console.log('Event emitted:', event);
  }
}
