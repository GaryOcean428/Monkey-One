import type { SessionStore, AgentState } from '../../types';

class AgentSession {
  constructor(private store: SessionStore) {}

  async saveState(state: AgentState): Promise<void> {
    await this.store.set('agent_state', state);
  }

  async loadState(): Promise<AgentState> {
    const state = await this.store.get('agent_state');
    return state as AgentState;
  }
}

export { AgentSession };