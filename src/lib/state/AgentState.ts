import { State, StateContext, StateTransition } from '../../types';

export class AgentState {
  currentState: State;

  transition(to: State, context: StateContext): void {
    // ...state transition logic...
  }

  validate(transition: StateTransition): boolean {
    // ...validation logic...
    return true;
  }
}