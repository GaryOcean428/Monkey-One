import { BaseAgent } from './base';
import type { Message } from '../../types';
import { memoryManager } from '../memory';
import { XAIClient } from '../xai';

export class OrchestratorAgent extends BaseAgent {

  constructor(id: string, name: string) {
    super(id, name, 'Orchestrator', [
      'task_planning',
      'task_delegation',
      'progress_tracking'
    ]);
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Store the original task
      await memoryManager.add({
        type: 'task',
        content: message.content,
        tags: ['original-task']
      });

      // Update task ledger with initial plan
      await this.planTask(message.content);

      // Execute plan steps
      while (this.progressLedger.status !== 'completed') {
        const nextStep = this.progressLedger.remainingSteps[0];
        if (!nextStep) break;

        // Update progress
        this.progressLedger.currentStep = nextStep;
        this.progressLedger.status = 'in_progress';

        // Store progress update
        await memoryManager.add({
          type: 'progress',
          content: `Starting step: ${nextStep}`,
          tags: ['progress-update']
        });

        // Delegate to appropriate agent
        const response = await this.delegateTask(nextStep);

        // Store agent response
        await memoryManager.add({
          type: 'response',
          content: response.content,
          tags: ['agent-response']
        });

        if (response.metadata?.status === 'failed') {
          // Log failure and revise plan
          await memoryManager.add({
            type: 'error',
            content: `Failed step: ${nextStep}. Revising plan.`,
            tags: ['error', 'plan-revision']
          });
          await this.revisePlan();
          continue;
        }

        // Update progress
        this.progressLedger.completedSteps.push(nextStep);
        this.progressLedger.remainingSteps.shift();

        if (this.progressLedger.remainingSteps.length === 0) {
          this.progressLedger.status = 'completed';
        }
      }

      // Create final response
      const summary = `Task completed. Steps executed:\n${this.progressLedger.completedSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
      
      await memoryManager.add({
        type: 'summary',
        content: summary,
        tags: ['task-completion']
      });

      return this.createResponse(summary);
    } catch (error) {
      const errorMessage = `Error executing task: ${(error as Error).message}`;
      
      await memoryManager.add({
        type: 'error',
        content: errorMessage,
        tags: ['error', 'task-failure']
      });

      return this.createResponse(errorMessage);
    }
  }

  private async planTask(task: string) {
    const systemPrompt = `You are a task planning assistant. Break down the following task into concrete, actionable steps. Consider:
- What information needs to be gathered
- What tools or capabilities might be needed
- Dependencies between steps
- Potential error cases to handle`;

    const plan = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task }
    ]);

    const steps = plan.split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);

    await this.updateTaskLedger({
      currentPlan: steps
    });

    await this.updateProgressLedger({
      remainingSteps: steps,
      status: 'planned'
    });

    // Store plan in memory
    await memoryManager.add({
      type: 'plan',
      content: plan,
      tags: ['task-plan']
    });
  }

  private async delegateTask(task: string): Promise<Message> {
    const systemPrompt = `Analyze the following task and determine which type of agent would be best suited to handle it. Consider:
- Web interaction needs (WebSurfer)
- File system operations (FileSurfer)
- Code writing/execution needs (Coder)
- System command execution needs (ComputerTerminal)`;

    const analysis = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task }
    ]);

    // TODO: Implement actual agent delegation
    // For now, just return a simulated response
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Completed task: ${task}`,
      timestamp: Date.now(),
      metadata: {
        status: 'completed',
        agentType: analysis
      }
    };
  }

  private async revisePlan() {
    const currentState = {
      completed: this.progressLedger.completedSteps,
      failed: this.progressLedger.currentStep,
      remaining: this.progressLedger.remainingSteps
    };

    const systemPrompt = `You are a task planning assistant. Given the current state of task execution:
- Review completed steps: ${currentState.completed.join(', ')}
- Analyze failed step: ${currentState.failed}
- Consider remaining steps: ${currentState.remaining.join(', ')}

Create a revised plan that:
1. Addresses the failure point
2. Incorporates any learnings from completed steps
3. Adjusts remaining steps as needed`;

    const revision = await this.xai.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(currentState) }
    ]);

    const newSteps = revision.split('\n')
      .map(step => step.trim())
      .filter(step => step.length > 0);

    await this.updateTaskLedger({
      currentPlan: newSteps
    });

    await this.updateProgressLedger({
      remainingSteps: newSteps,
      status: 'replanned'
    });

    // Store revision in memory
    await memoryManager.add({
      type: 'plan-revision',
      content: revision,
      tags: ['plan-revision']
    });
  }
}
