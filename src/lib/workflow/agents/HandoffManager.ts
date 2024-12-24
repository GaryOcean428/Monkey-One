import { Agent, AgentCapability, Message } from '../../../types';
import { memoryManager } from '../../memory';
import { AgentRegistry } from '../../registry/AgentRegistry';

interface HandoffCriteria {
  capability: AgentCapability;
  confidence: number;
  context: Record<string, unknown>;
}

export class HandoffManager {
  private static instance: HandoffManager;
  private registry: AgentRegistry;

  private constructor() {
    this.registry = AgentRegistry.getInstance();
  }

  static getInstance(): HandoffManager {
    if (!HandoffManager.instance) {
      HandoffManager.instance = new HandoffManager();
    }
    return HandoffManager.instance;
  }

  async evaluateHandoff(
    currentAgent: Agent,
    message: Message,
    context: Record<string, unknown>
  ): Promise<HandoffCriteria | null> {
    // Analyze message and context to determine if handoff is needed
    const requiredCapabilities = await this.analyzeRequirements(message);
    
    if (!requiredCapabilities) {
      return null;
    }

    // Check if current agent has required capabilities
    const hasCapability = currentAgent.capabilities.some(
      cap => cap.name === requiredCapabilities.capability.name
    );

    if (hasCapability) {
      return null;
    }

    return {
      capability: requiredCapabilities.capability,
      confidence: requiredCapabilities.confidence,
      context
    };
  }

  async findBestAgent(criteria: HandoffCriteria): Promise<Agent | null> {
    const agents = Array.from(this.registry.getAvailableAgents());
    
    // Filter agents by required capability
    const capableAgents = agents.filter(agent =>
      agent.capabilities.some(cap => cap.name === criteria.capability.name)
    );

    if (capableAgents.length === 0) {
      return null;
    }

    // Sort by capability confidence and agent performance metrics
    const rankedAgents = await this.rankAgents(capableAgents, criteria);
    return rankedAgents[0] || null;
  }

  async executeHandoff(
    fromAgent: Agent,
    toAgent: Agent,
    context: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // Store handoff in memory for context preservation
      await memoryManager.add({
        type: 'agent_handoff',
        content: JSON.stringify({
          from: fromAgent.id,
          to: toAgent.id,
          context,
          timestamp: Date.now()
        }),
        tags: ['handoff', fromAgent.id, toAgent.id]
      });

      // Transfer context to new agent
      await toAgent.initialize(context);

      return true;
    } catch (error) {
      console.error('Handoff failed:', error);
      return false;
    }
  }

  private async analyzeRequirements(message: Message): Promise<{
    capability: AgentCapability;
    confidence: number;
  } | null> {
    // Analyze message to determine required capabilities
    // This could use LLM or rule-based analysis
    // For now, using a simple example
    if (message.content.toLowerCase().includes('spanish')) {
      return {
        capability: {
          name: 'spanish_language',
          description: 'Ability to communicate in Spanish'
        },
        confidence: 0.9
      };
    }
    return null;
  }

  private async rankAgents(
    agents: Agent[],
    criteria: HandoffCriteria
  ): Promise<Agent[]> {
    // Get historical performance data from memory
    const performances = await Promise.all(
      agents.map(async agent => {
        const history = await memoryManager.search('agent_performance', agent.id);
        const avgPerformance = history.reduce(
          (acc, curr) => acc + (JSON.parse(curr.content).score || 0),
          0
        ) / (history.length || 1);

        return {
          agent,
          score: avgPerformance
        };
      })
    );

    // Sort by performance score
    return performances
      .sort((a, b) => b.score - a.score)
      .map(p => p.agent);
  }
}
