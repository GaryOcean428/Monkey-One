export class AgentSession {
  constructor(
    public readonly id: string,
    private store: SessionStore
  ) {}

  async saveState(state: AgentState): Promise<void> {
    // ...state persistence logic...
  }

  async loadState(): Promise<AgentState> {
    // ...state loading logic...
  }

  // ...additional session management methods...
}

export { AgentSession };