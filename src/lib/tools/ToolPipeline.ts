
import { AgentMixture } from '../patterns/AgentMixture';
// ...existing imports...

export class ToolPipeline {
  private agentMixture: AgentMixture;

  constructor(layers: BaseAgent[][], aggregator: BaseAgent) {
    this.agentMixture = new AgentMixture(layers, aggregator);
  }

  async execute(input: string): Promise<string> {
    return this.agentMixture.process(input);
  }

  // ...existing pipeline methods...
}