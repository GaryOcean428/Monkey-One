import { BaseAgent } from './base';
import { OrchestratorAgent } from './orchestrator';
import type { Message, AgentTask, WorkflowDefinition } from '../../types';
import { memoryManager } from '../memory';

export class ConversationalAgent extends BaseAgent {
  private orchestrator: OrchestratorAgent;

  constructor(id: string, name: string) {
    super(id, name, 'conversational', [
      'task_analysis',
      'workflow_planning',
      'team_composition',
      'requirement_gathering'
    ]);
    this.orchestrator = new OrchestratorAgent('orchestrator-1', 'Orchestrator');
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Store conversation in memory
      await memoryManager.add({
        type: 'conversation',
        content: message.content,
        tags: ['user-input', 'task-discussion']
      });

      // Analyze the request and determine if it's a new task
      const taskAnalysis = await this.analyzeRequest(message.content);

      if (taskAnalysis.isNewTask) {
        // Start task definition workflow
        return await this.handleNewTask(message, taskAnalysis);
      } else {
        // Continue existing conversation or task refinement
        return await this.handleOngoingDiscussion(message, taskAnalysis);
      }
    } catch (error) {
      console.error('Error in ConversationalAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your request. Please try again.'
      );
    }
  }

  private async analyzeRequest(content: string): Promise<{
    isNewTask: boolean;
    taskType?: string;
    requiredCapabilities?: string[];
    suggestedTeam?: string[];
    confidenceScore: number;
  }> {
    // Implement request analysis logic
    return {
      isNewTask: true,
      taskType: 'automation',
      requiredCapabilities: ['web_automation', 'data_processing'],
      suggestedTeam: ['web_surfer', 'data_processor'],
      confidenceScore: 0.85
    };
  }

  private async handleNewTask(message: Message, analysis: any): Promise<Message> {
    // Create initial task definition
    const taskDef = await this.createTaskDefinition(message.content, analysis);

    // Store task definition in memory
    await memoryManager.add({
      type: 'task_definition',
      content: JSON.stringify(taskDef),
      tags: ['task-planning', taskDef.type]
    });

    // Generate response with task understanding and next steps
    return this.createResponse(`
I understand you want to create a new ${taskDef.type} workflow. Here's what I've gathered:

${this.formatTaskUnderstanding(taskDef)}

Would you like to:
1. Refine this understanding
2. Proceed with team assembly
3. Start workflow development

Please let me know how you'd like to proceed.`);
  }

  private async handleOngoingDiscussion(message: Message, analysis: any): Promise<Message> {
    // Handle ongoing conversation about existing task
    const context = await this.getConversationContext();
    
    if (analysis.isRefinement) {
      return await this.handleTaskRefinement(message, context);
    } else if (analysis.isApproval) {
      return await this.initiateWorkflowDevelopment(context);
    } else {
      return await this.handleGeneralDiscussion(message, context);
    }
  }

  private async createTaskDefinition(content: string, analysis: any): Promise<AgentTask> {
    return {
      id: crypto.randomUUID(),
      type: analysis.taskType,
      description: content,
      requirements: analysis.requiredCapabilities,
      suggestedTeam: analysis.suggestedTeam,
      status: 'planning',
      created: Date.now(),
      metadata: {
        confidenceScore: analysis.confidenceScore,
        originalRequest: content
      }
    };
  }

  private formatTaskUnderstanding(task: AgentTask): string {
    return `
Purpose: ${task.description}
Type: ${task.type}
Required Capabilities:
${task.requirements.map(cap => `- ${cap}`).join('\n')}
Suggested Team:
${task.suggestedTeam.map(agent => `- ${agent}`).join('\n')}`;
  }

  private async initiateWorkflowDevelopment(context: any): Promise<Message> {
    // Hand off to orchestrator
    const workflow = await this.orchestrator.initializeWorkflow(context.currentTask);
    
    return this.createResponse(`
I've handed off the development to our team. The Orchestrator will manage the process.

Workflow ID: ${workflow.id}
Status: ${workflow.status}
Assigned Team: ${workflow.team.join(', ')}

You can check progress or make adjustments at any time by asking me.`);
  }

  private async getConversationContext(): Promise<any> {
    const recentMemories = await memoryManager.getRecent(5);
    return {
      currentTask: recentMemories.find(m => m.type === 'task_definition'),
      conversation: recentMemories.filter(m => m.type === 'conversation')
    };
  }
}