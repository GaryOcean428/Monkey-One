import { BaseAgent } from '../agents/base';
import { Task } from '../../types';

export class AgentMixture {
  constructor(
    private layers: BaseAgent[][],
    private aggregator: BaseAgent
  ) {}

  async process(input: string): Promise<string> {
    let currentInput = input;
    for (const layer of this.layers) {
      const results = await Promise.all(layer.map(agent => agent.process(currentInput)));
      currentInput = await this.aggregator.aggregate(results);
    }
    return currentInput;
  }
}

export { AgentMixture };