import { BaseAgent } from '../agents/base';

interface DebateMessage {
  content: string;
  round: number;
  from: string;
}

export class DebateCoordinator {
  constructor(
    private solvers: BaseAgent[],
    private aggregator: BaseAgent,
    private maxRounds: number
  ) {}

  async facilitateDebate(question: string): Promise<string> {
    let round = 1;
    let debateResult = '';

    while (round <= this.maxRounds) {
      // ...existing debate logic...
      round++;
    }

    return debateResult;
  }
}