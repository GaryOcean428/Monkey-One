import { EventEmitter } from 'events';
import { ModelClient } from '../clients/ModelClient';
import { TaskManager } from '../task/TaskManager';
import { logger } from '../utils/logger';
import { WorkflowManager } from '../workflow/WorkflowManager';

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  skills: string[];
  specialization: string;
  experienceLevel: number;
  successRate: number;
  performanceMetrics: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
}

interface AgentRole {
  id: string;
  name: string;
  description: string;
  requiredCapabilities: string[];
  responsibilities: string[];
  authority: {
    canDelegate: boolean;
    canOverride: boolean;
    accessLevel: number;
  };
}

interface TeamMember {
  id: string;
  role: AgentRole;
  capabilities: AgentCapability[];
  status: 'available' | 'busy' | 'offline';
  currentTask?: string;
  performanceHistory: {
    taskId: string;
    success: boolean;
    duration: number;
    quality: number;
  }[];
}

interface DiscussionThread {
  id: string;
  topic: string;
  status: 'active' | 'resolved' | 'pending';
  participants: string[];
  messages: {
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
    type: 'question' | 'proposal' | 'clarification' | 'decision';
    references?: string[];
  }[];
  decisions: {
    id: string;
    description: string;
    rationale: string;
    approvedBy: string[];
    timestamp: Date;
  }[];
}

interface ProjectRequirement {
  id: string;
  description: string;
  priority: number;
  complexity: number;
  requiredCapabilities: string[];
  constraints: string[];
  success_criteria: string[];
  status: 'proposed' | 'approved' | 'in_progress' | 'completed';
}

export class OrchestrationManager extends EventEmitter {
  private static instance: OrchestrationManager;
  private modelClient: ModelClient;
  private taskManager: TaskManager;
  private workflowManager: WorkflowManager;

  private capabilities: Map<string, AgentCapability>;
  private roles: Map<string, AgentRole>;
  private team: Map<string, TeamMember>;
  private discussions: Map<string, DiscussionThread>;
  private requirements: Map<string, ProjectRequirement>;

  private constructor() {
    super();
    this.modelClient = new ModelClient();
    this.taskManager = TaskManager.getInstance();
    this.workflowManager = new WorkflowManager();

    this.capabilities = new Map();
    this.roles = new Map();
    this.team = new Map();
    this.discussions = new Map();
    this.requirements = new Map();

    this.initializeEventListeners();
  }

  static getInstance(): OrchestrationManager {
    if (!OrchestrationManager.instance) {
      OrchestrationManager.instance = new OrchestrationManager();
    }
    return OrchestrationManager.instance;
  }

  private initializeEventListeners(): void {
    this.on('requirementProposed', this.handleRequirementProposal.bind(this));
    this.on('discussionStarted', this.handleDiscussionStart.bind(this));
    this.on('decisionMade', this.handleDecision.bind(this));
  }

  async startCapabilityDiscussion(
    userId: string,
    initialRequirements: string
  ): Promise<DiscussionThread> {
    // Create initial discussion thread
    const threadId = crypto.randomUUID();
    const thread: DiscussionThread = {
      id: threadId,
      topic: 'Capability Planning',
      status: 'active',
      participants: [userId, 'planning_agent'],
      messages: [],
      decisions: []
    };

    // Initial analysis by planning agent
    const analysisResponse = await this.modelClient.generate(
      `Analyze project requirements and suggest needed capabilities:\n${initialRequirements}`,
      'completion'
    );
    const analysis = analysisResponse.content;

    // Add initial message
    thread.messages.push({
      id: crypto.randomUUID(),
      sender: 'planning_agent',
      content: analysis,
      timestamp: new Date(),
      type: 'proposal'
    });

    this.discussions.set(threadId, thread);
    this.emit('discussionStarted', thread);

    return thread;
  }

  async addDiscussionMessage(
    threadId: string,
    sender: string,
    content: string,
    type: 'question' | 'proposal' | 'clarification' | 'decision'
  ): Promise<void> {
    const thread = this.discussions.get(threadId);
    if (!thread) {
      throw new Error('Discussion thread not found');
    }

    // Add message
    thread.messages.push({
      id: crypto.randomUUID(),
      sender,
      content,
      timestamp: new Date(),
      type
    });

    // If message is from user, generate agent response
    if (sender !== 'planning_agent') {
      const context = thread.messages.map(m => `${m.sender}: ${m.content}`).join('\n');
      const responseResult = await this.modelClient.generate(
        `Based on the discussion context, provide a relevant response:\n${context}`,
        'completion'
      );
      const response = responseResult.content;

      thread.messages.push({
        id: crypto.randomUUID(),
        sender: 'planning_agent',
        content: response,
        timestamp: new Date(),
        type: 'clarification'
      });
    }

    // Check if we can make decisions based on the discussion
    await this.evaluateDiscussionProgress(thread);
  }

  private async evaluateDiscussionProgress(thread: DiscussionThread): Promise<void> {
    const context = thread.messages.map(m => `${m.sender}: ${m.content}`).join('\n');

    // Analyze if we have enough information to make decisions
    const analysisResult = await this.modelClient.generate(
      `Analyze discussion progress and determine if we can make decisions:\n${context}`,
      'completion'
    );

    const canMakeDecisions = JSON.parse(analysisResult.content).canProceed;
    if (canMakeDecisions) {
      await this.generateRequirements(thread);
    }
  }

  private async generateRequirements(thread: DiscussionThread): Promise<void> {
    const context = thread.messages.map(m => `${m.sender}: ${m.content}`).join('\n');

    // Generate requirements based on discussion
    const requirementsResponse = await this.modelClient.generate(
      `Generate project requirements based on discussion:\n${context}`,
      'completion'
    );

    const parsedReqs: ProjectRequirement[] = JSON.parse(requirementsResponse.content);

    // Store requirements
    for (const req of parsedReqs) {
      this.requirements.set(req.id, req);
      this.emit('requirementProposed', req);
    }

    // Add decision to thread
    thread.decisions.push({
      id: crypto.randomUUID(),
      description: 'Requirements finalized based on discussion',
      rationale: 'Generated from comprehensive discussion analysis',
      approvedBy: ['planning_agent'],
      timestamp: new Date()
    });

    await this.assembleTeam(parsedReqs);
  }

  private async assembleTeam(requirements: ProjectRequirement[]): Promise<void> {
    // Analyze requirements to determine needed roles
    const roleAnalysisResponse = await this.modelClient.generate(
      `Analyze requirements and determine needed team roles:\n${JSON.stringify(requirements)}`,
      'completion'
    );

    const roles: AgentRole[] = JSON.parse(roleAnalysisResponse.content);

    // Create roles and assign capabilities
    for (const role of roles) {
      this.roles.set(role.id, role);

      // Find or create agent with required capabilities
      const agent = await this.findOrCreateAgent(role);

      // Add to team
      this.team.set(agent.id, agent);
    }

    // Create initial workflows based on requirements
    await this.initializeWorkflows(requirements);
  }

  private async findOrCreateAgent(role: AgentRole): Promise<TeamMember> {
    // Find existing agent with required capabilities
    for (const [_, member] of this.team.entries()) {
      if (this.hasRequiredCapabilities(member, role.requiredCapabilities)) {
        return member;
      }
    }

    // Create new agent with required capabilities
    const capabilities = await this.generateCapabilities(role);

    return {
      id: crypto.randomUUID(),
      role,
      capabilities,
      status: 'available',
      performanceHistory: []
    };
  }

  private hasRequiredCapabilities(member: TeamMember, required: string[]): boolean {
    const memberCapabilities = member.capabilities.map(c => c.name);
    return required.every(req => memberCapabilities.includes(req));
  }

  private async generateCapabilities(role: AgentRole): Promise<AgentCapability[]> {
    const capabilityAnalysisResponse = await this.modelClient.generate(
      `Generate detailed capabilities for role:\n${JSON.stringify(role)}`,
      'completion'
    );

    return JSON.parse(capabilityAnalysisResponse.content);
  }

  private async initializeWorkflows(requirements: ProjectRequirement[]): Promise<void> {
    for (const req of requirements) {
      // Create task for requirement
      const taskId = await this.taskManager.createTask({
        name: `Implement: ${req.description}`,
        description: req.description,
        type: 'one-off',
        code: '',  // Will be generated during workflow creation
        tools: [],
        metadata: {
          requirement: req
        }
      });

      // Find team members with required capabilities
      const assignedTeam = Array.from(this.team.values())
        .filter(member => this.hasRequiredCapabilities(member, req.requiredCapabilities));

      // Create workflow
      await this.workflowManager.createWorkflow(
        { id: taskId, type: 'implementation' },
        assignedTeam.map(member => ({
          id: member.id,
          role: member.role.name
        }))
      );
    }
  }

  private async handleRequirementProposal(requirement: ProjectRequirement): Promise<void> {
    logger.info(`New requirement proposed: ${requirement.description}`);
    // Additional handling as needed
  }

  private async handleDiscussionStart(thread: DiscussionThread): Promise<void> {
    logger.info(`New discussion started: ${thread.topic}`);
    // Additional handling as needed
  }

  private async handleDecision(decision: any): Promise<void> {
    logger.info(`Decision made: ${decision.description}`);
    // Additional handling as needed
  }

  // Helper methods for status and monitoring
  async getDiscussionStatus(threadId: string): Promise<DiscussionThread> {
    const thread = this.discussions.get(threadId);
    if (!thread) {
      throw new Error('Discussion thread not found');
    }
    return thread;
  }

  async getTeamStatus(): Promise<Map<string, TeamMember>> {
    return this.team;
  }

  async getRequirementStatus(reqId: string): Promise<ProjectRequirement> {
    const req = this.requirements.get(reqId);
    if (!req) {
      throw new Error('Requirement not found');
    }
    return req;
  }
}
